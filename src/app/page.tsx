"use client";

import LogoutButton from "@/components/logout-button";
import { TelegramChatArea } from "@/components/telegram-chat-area";
import { TelegramSidebar } from "@/components/telegram-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Home() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <SidebarProvider>
        <TelegramSidebar />
        <SidebarInset className="flex h-screen flex-col">
          {/* Header */}
          <header className="bg-background flex h-14 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <h1 className="hidden text-lg font-semibold sm:block">
                Telegram Chat
              </h1>
              <h1 className="text-lg font-semibold sm:hidden">TG</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LogoutButton size="sm" />
            </div>
          </header>

          {/* Main Chat Area */}
          <div className="flex flex-1 overflow-hidden">
            <TelegramChatArea chatId={null} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
