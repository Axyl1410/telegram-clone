import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

let socket: Socket | null = null;

export function getClientSocket(): Socket {
  if (!socket) {
    const baseUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";
    socket = io(baseUrl, {
      path: "/socket.io",
      transports: ["websocket"],
    });
  }
  return socket;
}
