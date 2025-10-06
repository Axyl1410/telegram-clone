"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreVertical, Paperclip, Send, Smile } from "lucide-react";
import { useState } from "react";

// Sample message data
const messages = [
  {
    id: 1,
    sender: "John Doe",
    content: "Hey, how are you doing?",
    time: "2:30 PM",
    isOwn: false,
    avatar: "https://github.com/shadcn.png",
  },
  {
    id: 2,
    sender: "You",
    content: "I'm doing great! Thanks for asking. How about you?",
    time: "2:32 PM",
    isOwn: true,
    avatar: null,
  },
  {
    id: 3,
    sender: "John Doe",
    content:
      "Pretty good! Just working on some new projects. Have you seen the latest updates?",
    time: "2:33 PM",
    isOwn: false,
    avatar: "https://github.com/shadcn.png",
  },
  {
    id: 4,
    sender: "You",
    content:
      "Yes! The new features look amazing. I'm really excited to try them out.",
    time: "2:35 PM",
    isOwn: true,
    avatar: null,
  },
  {
    id: 5,
    sender: "John Doe",
    content:
      "That's awesome! Let me know if you need any help getting started.",
    time: "2:36 PM",
    isOwn: false,
    avatar: "https://github.com/shadcn.png",
  },
];

export function TelegramChatArea() {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* Chat Header */}
      <div className="bg-background flex flex-shrink-0 items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">John Doe</h2>
            <p className="text-muted-foreground text-sm">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="min-h-0 flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.isOwn ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {!msg.isOwn && (
                <Avatar className="mt-1 h-8 w-8">
                  <AvatarImage src={msg.avatar || ""} alt={msg.sender} />
                  <AvatarFallback>
                    {msg.sender
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 ${
                  msg.isOwn
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`mt-1 text-xs ${
                    msg.isOwn
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="bg-background flex-shrink-0 border-t p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="relative flex-1">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
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
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
