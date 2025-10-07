"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { getClientSocket } from "@/lib/socket";
import { MoreVertical, Plus, Search, Settings } from "lucide-react";
import { useEffect, useState } from "react";

type Conversation = {
  id: string;
  name?: string | null;
  imageUrl?: string | null;
  type?: "PRIVATE" | "GROUP";
  updatedAt: string;
  participants: { user: { id: string; name: string; image?: string | null } }[];
};

type UserLite = {
  id: string;
  name: string;
  image?: string | null;
  username?: string | null;
};

async function searchUsers(q: string, excludeId?: string): Promise<UserLite[]> {
  if (!q.trim()) return [];
  const url = new URL(`/api/v1/users`, window.location.origin);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "8");
  if (excludeId) url.searchParams.set("excludeId", excludeId);
  const res = await fetch(url.toString());
  const json = await res.json();
  return json.data ?? [];
}

async function fetchConversations(userId?: string): Promise<Conversation[]> {
  const url = userId
    ? `/api/v1/chat?userId=${encodeURIComponent(userId)}`
    : `/api/v1/chat`;
  const res = await fetch(url);
  const json = await res.json();
  return json.data ?? [];
}

import { useRouter } from "next/navigation";

export function TelegramSidebar({
  selectedId,
}: {
  selectedId?: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(
    selectedId || null,
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userResults, setUserResults] = useState<UserLite[]>([]);
  const [searchMode, setSearchMode] = useState<"chats" | "people">("chats");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data } = await authClient.getSession();
      const uid = data?.user?.id as string | undefined;
      setUserId(uid);
      const list = await fetchConversations(uid);
      setConversations(list);
    };
    init();
  }, []);

  // Refresh conversations when the selected chat changes (e.g., after draft navigates to existing chat)
  useEffect(() => {
    const refresh = async () => {
      const list = await fetchConversations(userId);
      setConversations(list);
    };
    if (userId) refresh();
  }, [userId]);

  useEffect(() => {
    const socket = getClientSocket();
    // join user room for chat list updates
    if (userId) socket.emit("join-user", userId);
    socket.on("chat:created", ({ chat }: { chat: Conversation }) => {
      setConversations((prev) => {
        if (prev.find((p) => p.id === chat.id)) return prev;
        return [chat, ...prev];
      });
    });
    socket.on(
      "chat:updated",
      async ({ chatId: changedId }: { chatId: string; updatedAt: string }) => {
        try {
          const res = await fetch(`/api/v1/chat/${changedId}`);
          const json = await res.json();
          if (json?.ok && json.data) {
            const convo = json.data as Conversation;
            setConversations((prev) => {
              const idx = prev.findIndex((c) => c.id === changedId);
              if (idx !== -1) {
                const next = prev.slice();
                next.splice(idx, 1);
                return [convo, ...next];
              }
              return [convo, ...prev];
            });
          }
        } catch {}
      },
    );
    return () => {
      socket.off("chat:created");
      socket.off("chat:updated");
      if (userId) socket.emit("leave-user", userId);
    };
  }, [userId]);

  const filteredChats = conversations.filter((chat) =>
    (chat.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    const run = async () => {
      if (searchMode !== "people") return;
      if (!searchQuery.trim()) {
        setUserResults([]);
        return;
      }
      const results = await searchUsers(searchQuery, userId);
      setUserResults(results);
    };
    const id = setTimeout(run, 200);
    return () => clearTimeout(id);
  }, [searchQuery, searchMode, userId]);

  async function startChatWithUser(other: UserLite) {
    // Draft chat: navigate to /chat/with/[userId] without creating conversation
    router.push(`/chat/with/${other.id}`);
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Telegram</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            variant={searchMode === "chats" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSearchMode("chats")}
          >
            Chats
          </Button>
          <Button
            variant={searchMode === "people" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSearchMode("people")}
          >
            People
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupContent>
            {searchMode === "people" ? (
              <ScrollArea className="max-h-[50vh] p-2">
                <div className="space-y-2">
                  {userResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className="hover:bg-accent flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left"
                      onClick={() => startChatWithUser(u)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={u.image || ""}
                          alt={u.name || u.username || "User"}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                        />
                        <AvatarFallback>
                          {(u.name || u.username || "U")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {u.name || u.username}
                        </div>
                        {u.username && (
                          <div className="text-muted-foreground truncate text-xs">
                            @{u.username}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                  {searchQuery && userResults.length === 0 && (
                    <div className="text-muted-foreground px-2 py-4 text-sm">
                      No users found
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <SidebarMenu>
                {filteredChats.map((chat) => {
                  const other =
                    chat.type === "PRIVATE" && userId
                      ? chat.participants
                          .map((p) => p.user)
                          .find((u) => u.id !== userId)
                      : undefined;
                  const displayName =
                    chat.type === "PRIVATE" && other?.name
                      ? other.name
                      : chat.name || "Conversation";
                  const avatarSrc =
                    chat.type === "PRIVATE" && other?.image
                      ? other.image
                      : chat.imageUrl || "";

                  return (
                    <SidebarMenuItem key={chat.id} className="h-16">
                      <SidebarMenuButton
                        asChild
                        isActive={selectedChat === chat.id}
                        onClick={() => {
                          setSelectedChat(chat.id);
                          router.push(`/chat/${chat.id}`);
                        }}
                        className="hover:bg-accent h-full w-full justify-start p-3"
                      >
                        <div className="flex w-full items-center gap-2">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={avatarSrc}
                                alt={displayName}
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                              />
                              <AvatarFallback>
                                {(displayName || "C")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="truncate text-sm font-medium">
                                {displayName}
                              </h3>
                              <span className="text-muted-foreground flex-shrink-0 text-xs">
                                {new Date(chat.updatedAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-1">
                              <p className="text-muted-foreground flex-1 truncate text-xs">
                                {chat.participants.length} participants
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
