import { TelegramChatArea } from "@/components/telegram-chat-area";
import { TelegramSidebar } from "@/components/telegram-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function ChatWithPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <div className="h-screen w-full overflow-hidden">
      <SidebarProvider>
        <TelegramSidebar selectedId={null} />
        <SidebarInset className="flex h-screen flex-col">
          <div className="flex flex-1 overflow-hidden">
            <TelegramChatArea chatId={null} otherUserId={userId} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
