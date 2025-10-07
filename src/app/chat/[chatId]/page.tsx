import { TelegramChatArea } from "@/components/telegram-chat-area";
import { TelegramSidebar } from "@/components/telegram-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  return (
    <div className="h-screen w-full overflow-hidden">
      <SidebarProvider>
        <TelegramSidebar selectedId={chatId} />
        <SidebarInset className="flex h-screen flex-col">
          <div className="flex flex-1 overflow-hidden">
            <TelegramChatArea chatId={chatId} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
