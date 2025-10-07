"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { getClientSocket } from "@/lib/socket";
import {
  Clock,
  Loader2,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Message = {
  id: string;
  content?: string | null;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string; image?: string | null };
};

type Conversation = {
  id: string;
  name?: string | null;
  imageUrl?: string | null;
  type?: "PRIVATE" | "GROUP";
  participants: { user: { id: string; name: string; image?: string | null } }[];
};

async function fetchMessages(chatId: string, limit = 50): Promise<Message[]> {
  const res = await fetch(`/api/v1/chat/${chatId}/messages?limit=${limit}`);
  const json = await res.json();
  return json.data ?? [];
}

export function TelegramChatArea({
  chatId,
  otherUserId,
}: {
  chatId: string | null;
  otherUserId?: string | null;
}) {
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{
    id: string;
    name: string;
    image?: string | null;
  } | null>(null);
  const [items, setItems] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [justConfirmedIds, setJustConfirmedIds] = useState<Set<string>>(
    new Set(),
  );
  const socket = useMemo(() => getClientSocket(), []);
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await authClient.getSession();
      const id = (data?.user?.id as string) || null;
      setUserId(id);
      if (data?.user) {
        setUserInfo({
          id: id || "",
          name: data.user.name || "You",
          image: data.user.image,
        });
      }
      // In a full app, chatId comes from route or sidebar selection
    };
    init();
  }, []);

  useEffect(() => {
    const loadOther = async () => {
      if (!otherUserId) return;
      const res = await fetch(`/api/v1/users/${otherUserId}`);
      const json = await res.json();
      if (json?.ok && json.data) {
        // Show a header for the user even when no messages yet
        // We keep items empty until first sent/received message
      }
    };
    loadOther();
  }, [otherUserId]);

  useEffect(() => {
    if (!chatId) return;
    fetchMessages(chatId).then((list) => setItems(list.reverse()));
    fetch(`/api/v1/chat/${chatId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j?.ok && j.data) setConversation(j.data);
      })
      .catch(() => {});
    // Join with since = last message timestamp to backfill recent
    const lastTs = items.length ? items[items.length - 1].createdAt : undefined;
    socket.emit("chat:join", chatId, lastTs);
    const onNew = ({
      chatId: c,
      message,
    }: {
      chatId: string;
      message: Message;
    }) => {
      if (c !== chatId) return;
      setItems((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev;
        const tempIndex = prev.findIndex(
          (m) =>
            m.id.startsWith("temp-") &&
            m.senderId === message.senderId &&
            m.content === message.content,
        );
        if (tempIndex >= 0) {
          const next = prev.slice();
          next[tempIndex] = message;
          // mark as just confirmed for a brief highlight
          setJustConfirmedIds((prevSet) => {
            const copy = new Set(prevSet);
            copy.add(message.id);
            return copy;
          });
          setTimeout(() => {
            setJustConfirmedIds((prevSet) => {
              const copy = new Set(prevSet);
              copy.delete(message.id);
              return copy;
            });
          }, 700);
          return next;
        }
        return [...prev, message];
      });
    };
    socket.on("chat:new-message", onNew);
    const onRecent = ({
      chatId: c,
      messages,
    }: {
      chatId: string;
      messages: Message[];
    }) => {
      if (c !== chatId || !messages?.length) return;
      setItems((prev) => {
        // Merge avoiding duplicates
        const seen = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        messages.forEach((m) => {
          if (!seen.has(m.id)) merged.push(m);
        });
        return merged;
      });
    };
    socket.on("chat:recent", onRecent);
    return () => {
      socket.off("chat:new-message", onNew);
      socket.off("chat:recent", onRecent);
      socket.emit("chat:leave", chatId);
    };
  }, [chatId, socket, items]);

  // Auto-scroll whenever the number of messages changes
  useEffect(() => {
    if (items.length >= 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [items]);

  const handleSendMessage = async () => {
    const content = message.trim();
    if (!content || !userId || isSending) return;
    setIsSending(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      content,
      createdAt: new Date().toISOString(),
      senderId: userId,
      sender: {
        id: userInfo?.id || userId,
        name: userInfo?.name || "You",
        image: userInfo?.image,
      },
    } as Message;
    setItems((prev) => [...prev, optimistic]);
    setMessage("");
    try {
      let res: Response;
      if (chatId) {
        res = await fetch(`/api/v1/chat/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderId: userId, content }),
        });
      } else if (otherUserId) {
        const createRes = await fetch(`/api/v1/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, otherUserId }),
        });
        const created = await createRes.json();
        if (!created?.ok || !created.data?.id)
          throw new Error("Failed to create chat");
        const newChatId = created.data.id as string;
        // join the newly created chat room and navigate so header/meta load
        socket.emit("chat:join", newChatId);
        router.push(`/chat/${newChatId}`);
        res = await fetch(`/api/v1/chat/${newChatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderId: userId, content }),
        });
      } else {
        throw new Error("Missing chat context");
      }
      const json = await res.json();
      if (json?.ok && json.data) {
        const serverMsg: Message = json.data;
        setItems((prev) => prev.map((m) => (m.id === tempId ? serverMsg : m)));
        // mark as just confirmed for a brief highlight
        setJustConfirmedIds((prevSet) => {
          const copy = new Set(prevSet);
          copy.add(serverMsg.id);
          return copy;
        });
        setTimeout(() => {
          setJustConfirmedIds((prevSet) => {
            const copy = new Set(prevSet);
            copy.delete(serverMsg.id);
            return copy;
          });
        }, 700);
      } else {
        setItems((prev) => prev.filter((m) => m.id !== tempId));
        setMessage(content);
      }
    } catch {
      setItems((prev) => prev.filter((m) => m.id !== tempId));
      setMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  const showHeaderSkeleton = !chatId && !conversation && !otherUserId;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* Chat Header */}
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
                <p className="text-muted-foreground text-sm">&nbsp;</p>
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

      {/* Messages Area */}
      <ScrollArea className="min-h-0 flex-1 p-4">
        <div className="space-y-4">
          {items.map((msg) => {
            const isTempMessage = msg.id.startsWith("temp-");
            const isJustConfirmed = justConfirmedIds.has(msg.id);
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.senderId === userId ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {msg.senderId !== userId && (
                  <Avatar className="mt-1 h-8 w-8">
                    <AvatarImage
                      src={msg.sender?.image || ""}
                      alt={msg.sender?.name || "U"}
                    />
                    <AvatarFallback>
                      {(msg.sender?.name || "U")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 transition-all duration-300 ease-out ${
                    msg.senderId === userId
                      ? isTempMessage
                        ? "bg-primary/70 text-primary-foreground ml-auto animate-pulse"
                        : "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  }`}
                >
                  <div
                    className={`${
                      isJustConfirmed && msg.senderId === userId
                        ? "ring-primary/40 rounded-md ring-1"
                        : ""
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <p
                        className={`text-xs ${
                          msg.senderId === userId
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                      {isTempMessage && msg.senderId === userId && (
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
          })}
          <div ref={bottomRef} />
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
          <Button
            onClick={handleSendMessage}
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
    </div>
  );
}
