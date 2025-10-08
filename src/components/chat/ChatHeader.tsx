"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreVertical } from "lucide-react";

type Conversation = {
  id: string;
  name?: string | null;
  imageUrl?: string | null;
  type?: "PRIVATE" | "GROUP";
  participants: { user: { id: string; name: string; image?: string | null } }[];
};

interface ChatHeaderProps {
  conversation: Conversation | null;
  userId: string | null;
  typingUsers: Set<string>;
  showHeaderSkeleton: boolean;
}

export function ChatHeader({
  conversation,
  userId,
  typingUsers,
  showHeaderSkeleton,
}: ChatHeaderProps) {
  const headerName = (() => {
    if (
      conversation?.type === "PRIVATE" &&
      userId &&
      conversation?.participants
    ) {
      const other = conversation.participants
        .map((p) => p.user)
        .find((u) => u.id !== userId);
      if (other?.name) return other.name;
    }
    if (conversation?.name) return conversation.name;
    return "Conversation";
  })();

  const headerImage = (() => {
    if (
      conversation?.type === "PRIVATE" &&
      userId &&
      conversation?.participants
    ) {
      const other = conversation.participants
        .map((p) => p.user)
        .find((u) => u.id !== userId);
      if (other?.image) return other.image;
    }
    return conversation?.imageUrl || "";
  })();

  return (
    <div className="bg-background flex flex-shrink-0 items-center justify-between border-b p-4">
      <div className="flex items-center gap-3">
        {showHeaderSkeleton ? (
          <>
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </>
        ) : (
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={headerImage}
                alt={headerName}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
              <AvatarFallback>
                {headerName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{headerName}</h2>
              <p className="text-muted-foreground text-sm">
                {typingUsers.size > 0 ? (
                  <span className="flex items-center gap-1">
                    <span className="flex">
                      <span className="animate-bounce">.</span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      >
                        .
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      >
                        .
                      </span>
                    </span>
                    {typingUsers.size === 1
                      ? "đang gõ..."
                      : `${typingUsers.size} người đang gõ...`}
                  </span>
                ) : (
                  <div>&nbsp;</div>
                )}
              </p>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
