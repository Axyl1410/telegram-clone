"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { MoreVertical, Plus, Search, Settings } from "lucide-react";
import { useState } from "react";

// Sample chat data
const chats = [
  {
    id: 1,
    name: "John Doe",
    lastMessage: "Hey, how are you?",
    time: "2:30 PM",
    unread: 3,
    avatar: "https://github.com/shadcn.png",
    isOnline: true,
  },
  {
    id: 2,
    name: "Alice Smith",
    lastMessage: "Thanks for the help!",
    time: "1:45 PM",
    unread: 0,
    avatar: "https://github.com/vercel.png",
    isOnline: false,
  },
  {
    id: 3,
    name: "Work Group",
    lastMessage: "Meeting at 3 PM",
    time: "12:20 PM",
    unread: 5,
    avatar: null,
    isOnline: false,
  },
  {
    id: 4,
    name: "Family",
    lastMessage: "See you tomorrow!",
    time: "11:15 AM",
    unread: 0,
    avatar: null,
    isOnline: false,
  },
  {
    id: 5,
    name: "Bob Wilson",
    lastMessage: "Can you send me the file?",
    time: "Yesterday",
    unread: 1,
    avatar: "https://github.com/nextjs.png",
    isOnline: true,
  },
];

export function TelegramSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(1);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredChats.map((chat) => (
                <SidebarMenuItem key={chat.id} className="h-16">
                  <SidebarMenuButton
                    asChild
                    isActive={selectedChat === chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className="hover:bg-accent h-full w-full justify-start p-3"
                  >
                    <div className="flex w-full items-center gap-2">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={chat.avatar || ""}
                            alt={chat.name}
                          />
                          <AvatarFallback>
                            {chat.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {chat.isOnline && (
                          <div className="border-background absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 bg-green-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="truncate text-sm font-medium">
                            {chat.name}
                          </h3>
                          <span className="text-muted-foreground flex-shrink-0 text-xs">
                            {chat.time}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-1">
                          <p className="text-muted-foreground flex-1 truncate text-xs">
                            {chat.lastMessage}
                          </p>
                          {chat.unread > 0 && (
                            <Badge
                              variant="destructive"
                              className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full p-0 text-xs"
                            >
                              {chat.unread}
                            </Badge>
                          )}
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
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
