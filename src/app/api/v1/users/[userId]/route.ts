import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, image: true, username: true },
    });
    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, message: "User not found" }),
        { status: 404 },
      );
    }
    return Response.json({ ok: true, data: user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return new Response(JSON.stringify({ ok: false, message }), {
      status: 500,
    });
  }
}
