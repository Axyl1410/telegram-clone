"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { forwardRef } from "react";
import { MessageItem } from "./MessageItem";

type Message = {
  id: string;
  content?: string | null;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string; image?: string | null };
};

interface MessageListProps {
  messages: Message[];
  userId: string | null;
  justConfirmedIds: Set<string>;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, userId, justConfirmedIds }, ref) => {
    return (
      <ScrollArea className="min-h-0 flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              userId={userId}
              isJustConfirmed={justConfirmedIds.has(message.id)}
            />
          ))}
          <div ref={ref} />
        </div>
      </ScrollArea>
    );
  },
);

MessageList.displayName = "MessageList";
