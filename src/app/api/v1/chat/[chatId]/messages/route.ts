import prisma from "@/lib/prisma";
import { getIO } from "@/pages/api/socketio";
import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") || undefined;
    const limitParam = searchParams.get("limit");
    const take = Math.min(
      Math.max(parseInt(limitParam || "20", 10) || 20, 1),
      100,
    );

    const messages = await prisma.message.findMany({
      where: { conversationId: chatId },
      include: { sender: true },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    return Response.json({ ok: true, data: messages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return new Response(JSON.stringify({ ok: false, message }), {
      status: 500,
    });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params;
    const body = await req.json();
    const { senderId, content } = body as { senderId: string; content: string };
    if (!senderId || !content) {
      return new Response(
        JSON.stringify({ ok: false, message: "senderId and content required" }),
        { status: 400 },
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        conversationId: chatId,
      },
      include: { sender: true },
    });

    await prisma.conversation.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    const io = getIO();
    if (io) {
      io.to(`chat:${chatId}`).emit("chat:new-message", {
        chatId,
        message,
      });
      // Notify all participants' user rooms to update sidebar ordering
      try {
        const convo = await prisma.conversation.findUnique({
          where: { id: chatId },
          include: { participants: true },
        });
        convo?.participants.forEach((p) => {
          io.to(`user:${p.userId}`).emit("chat:updated", {
            chatId,
            updatedAt: new Date().toISOString(),
          });
        });
      } catch {}
    }

    return Response.json({ ok: true, data: message }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return new Response(JSON.stringify({ ok: false, message }), {
      status: 500,
    });
  }
}
