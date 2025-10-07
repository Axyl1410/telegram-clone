import prisma from "@/lib/prisma";
import { getIO } from "@/pages/api/socketio";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;

    const conversations = await prisma.conversation.findMany({
      where: userId ? { participants: { some: { userId } } } : undefined,
      include: {
        participants: {
          include: { user: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return Response.json({ ok: true, data: conversations });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return new Response(JSON.stringify({ ok: false, message }), {
      status: 500,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, otherUserId, name } = body as {
      userId: string;
      otherUserId: string;
      name?: string;
    };
    if (!userId || !otherUserId) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "userId and otherUserId required",
        }),
        { status: 400 },
      );
    }

    // Find existing private conversation between two users
    const existing = await prisma.conversation.findFirst({
      where: {
        type: "PRIVATE",
        participants: {
          every: {
            OR: [{ userId }, { userId: otherUserId }],
          },
        },
      },
      include: { participants: true },
    });

    if (existing) {
      return Response.json(
        { ok: true, existed: true, data: existing },
        { status: 200 },
      );
    }

    const conversation = await prisma.conversation.create({
      data: {
        name: name || null,
        type: "PRIVATE",
        participants: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
      include: { participants: true },
    });

    const io = getIO();
    if (io) {
      // Notify both participants via their user rooms so sidebar lists can update
      io.to(`user:${userId}`).emit("chat:created", { chat: conversation });
      io.to(`user:${otherUserId}`).emit("chat:created", { chat: conversation });
      // Also emit to chat room for clients already joined to this chat id
      io.to(`chat:${conversation.id}`).emit("chat:created", {
        chat: conversation,
      });
    }

    return Response.json(
      { ok: true, existed: false, data: conversation },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return new Response(JSON.stringify({ ok: false, message }), {
      status: 500,
    });
  }
}
