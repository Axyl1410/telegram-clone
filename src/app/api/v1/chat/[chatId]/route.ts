import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params;
    const conversation = await prisma.conversation.findUnique({
      where: { id: chatId },
      include: { participants: { include: { user: true } } },
    });
    if (!conversation) {
      return new Response(
        JSON.stringify({ ok: false, message: "Conversation not found" }),
        { status: 404 },
      );
    }
    return Response.json({ ok: true, data: conversation });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return new Response(JSON.stringify({ ok: false, message }), {
      status: 500,
    });
  }
}
