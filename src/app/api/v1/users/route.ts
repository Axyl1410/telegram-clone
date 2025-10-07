import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limitParam = searchParams.get("limit");
    const excludeId = searchParams.get("excludeId") || undefined;
    const take = Math.min(
      Math.max(parseInt(limitParam || "10", 10) || 10, 1),
      50,
    );

    if (!q) return Response.json({ ok: true, data: [] });

    // Basic search by name, username, or email local-part
    const users = await prisma.user.findMany({
      where: {
        ...(excludeId ? { id: { not: excludeId } } : {}),
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, image: true, username: true },
      take,
    });

    return Response.json({ ok: true, data: users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return new Response(JSON.stringify({ ok: false, message }), {
      status: 500,
    });
  }
}
