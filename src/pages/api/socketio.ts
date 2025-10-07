import prisma from "@/lib/prisma";
import type { Server as NetServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";

type SocketServer = IOServer & { _initialized?: boolean };

let io: SocketServer | null = null;

function createIO(server: NetServer) {
  const instance = new IOServer(server, {
    path: "/socket.io",
    cors: { origin: "*" },
  }) as SocketServer;
  instance.on("connection", (socket) => {
    // Backward compat
    socket.on("join", (room: string) => socket.join(room));
    socket.on("leave", (room: string) => socket.leave(room));

    // Specified chat events
    socket.on("chat:join", async (chatId: string, since?: string) => {
      if (typeof chatId === "string" && chatId) {
        socket.join(`chat:${chatId}`);
        // Send recent messages to the joining client for fast sync
        try {
          const where = { conversationId: chatId } as any;
          if (since) {
            where.createdAt = { gt: new Date(since) };
          }
          const recent = await prisma.message.findMany({
            where,
            include: { sender: true },
            orderBy: { createdAt: "desc" },
            take: since ? 100 : 30,
          });
          // Emit in ascending order for UI append
          socket.emit("chat:recent", {
            chatId,
            messages: recent.reverse(),
          });
        } catch {
          // ignore
        }
      }
    });
    socket.on("chat:leave", (chatId: string) => {
      if (typeof chatId === "string" && chatId) socket.leave(`chat:${chatId}`);
    });
    socket.on(
      "chat:typing",
      (chatId: string, payload: { userId: string; typing: boolean }) => {
        if (typeof chatId === "string" && chatId) {
          socket.to(`chat:${chatId}`).emit("chat:typing", payload);
        }
      },
    );
  });
  instance._initialized = true;
  return instance;
}

export function getIO(): SocketServer | null {
  return io;
}

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const anyRes = res as unknown as { socket: { server: any }; end: () => void };
  if (!anyRes.socket.server.io) {
    anyRes.socket.server.io = createIO(anyRes.socket.server as NetServer);
  }
  io = anyRes.socket.server.io as SocketServer;
  anyRes.end();
}
