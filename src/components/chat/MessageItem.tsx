"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

type Message = {
  id: string;
  content?: string | null;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string; image?: string | null };
};

interface MessageItemProps {
  message: Message;
  userId: string | null;
  isJustConfirmed: boolean;
}

export function MessageItem({
  message,
  userId,
  isJustConfirmed,
}: MessageItemProps) {
  const isTempMessage = message.id.startsWith("temp-");
  const isOwnMessage = message.senderId === userId;

  return (
    <div
      className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isOwnMessage && (
        <Avatar className="mt-1 h-8 w-8">
          <AvatarImage
            src={message.sender?.image || ""}
            alt={message.sender?.name || "U"}
          />
          <AvatarFallback>
            {(message.sender?.name || "U")
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[70%] rounded-lg px-3 py-2 transition-all duration-300 ease-out ${
          isOwnMessage
            ? isTempMessage
              ? "bg-primary/70 text-primary-foreground ml-auto animate-pulse"
              : "bg-primary text-primary-foreground ml-auto"
            : "bg-muted"
        }`}
      >
        <div
          className={`${
            isJustConfirmed && isOwnMessage
              ? "ring-primary/40 rounded-md ring-1"
              : ""
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <div className="mt-1 flex items-center gap-1">
            <p
              className={`text-xs ${
                isOwnMessage
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }`}
            >
              {new Date(message.createdAt).toLocaleTimeString()}
            </p>
            {isTempMessage && isOwnMessage && (
              <div className="flex items-center gap-1">
                <Clock className="text-primary-foreground/70 h-3 w-3" />
                <span className="text-primary-foreground/70 text-xs">
                  Đang gửi...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
