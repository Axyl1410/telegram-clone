"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Paperclip, Send, Smile } from "lucide-react";

interface MessageInputProps {
  message: string;
  isSending: boolean;
  userId: string | null;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onInputBlur: () => void;
}

export function MessageInput({
  message,
  isSending,
  userId,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  onInputBlur,
}: MessageInputProps) {
  return (
    <div className="bg-background flex-shrink-0 border-t p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Paperclip className="h-4 w-4" />
        </Button>
        <div className="relative flex-1">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={onKeyPress}
            onBlur={onInputBlur}
            className="pr-10"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 transform"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={onSendMessage}
          size="icon"
          disabled={!message.trim() || !userId || isSending}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
