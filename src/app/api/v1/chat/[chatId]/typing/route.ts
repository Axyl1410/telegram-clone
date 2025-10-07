import { getIO } from "@/pages/api/socketio";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params;
    const body = await req.json();
    const { userId, typing } = body as { userId: string; typing: boolean };
    if (!userId || typeof typing !== "boolean") {
      return new Response(
        JSON.stringify({ ok: false, message: "userId and typing required" }),
        { status: 400 },
      );
    }
    const io = getIO();
    if (io) {
      io.to(`chat:${chatId}`).emit("chat:typing", { userId, typing });
    }
    return Response.json({ ok: true });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, message: err?.message || "Server error" }),
      { status: 500 },
    );
  }
}
