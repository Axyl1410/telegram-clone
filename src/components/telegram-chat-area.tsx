"use client";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { authClient } from "@/lib/auth-client";
import { getClientSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "../hooks/useMessages";
import { useTyping } from "../hooks/useTyping";

type Conversation = {
  id: string;
  name?: string | null;
  imageUrl?: string | null;
  type?: "PRIVATE" | "GROUP";
  participants: { user: { id: string; name: string; image?: string | null } }[];
};

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
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const socket = getClientSocket();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Custom hooks
  const {
    messages,
    justConfirmedIds,
    addOptimisticMessage,
    replaceTempMessage,
    removeTempMessage,
  } = useMessages(chatId);
  const {
    typingUsers,
    setTypingUsers,
    handleTyping,
    handleInputBlur,
    cleanup,
  } = useTyping(chatId, userId);

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

  // Load conversation data
  useEffect(() => {
    if (!chatId) return;
    fetch(`/api/v1/chat/${chatId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j?.ok && j.data) setConversation(j.data);
      })
      .catch(() => {});
  }, [chatId]);

  // Setup typing events
  useEffect(() => {
    if (!chatId || !userId) return;

    const onTyping = (payload: { userId: string; typing: boolean }) => {
      if (payload.userId === userId) return; // Don't show own typing
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (payload.typing) {
          newSet.add(payload.userId);
        } else {
          newSet.delete(payload.userId);
        }
        return newSet;
      });
    };

    socket.on("chat:typing", onTyping);

    return () => {
      socket.off("chat:typing", onTyping);
      cleanup();
    };
  }, [chatId, userId, socket, cleanup, setTypingUsers]);

  // Auto-scroll whenever the number of messages changes
  useEffect(() => {
    if (messages.length >= 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    const content = message.trim();
    if (!content || !userId || isSending) return;
    setIsSending(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      content,
      createdAt: new Date().toISOString(),
      senderId: userId,
      sender: {
        id: userInfo?.id || userId,
        name: userInfo?.name || "You",
        image: userInfo?.image,
      },
    };
    addOptimisticMessage(optimistic);
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
        const serverMsg = json.data;
        replaceTempMessage(tempId, serverMsg);
      } else {
        removeTempMessage(tempId);
        setMessage(content);
      }
    } catch {
      removeTempMessage(tempId);
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

  const showHeaderSkeleton = !chatId && !conversation && !otherUserId;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <ChatHeader
        conversation={conversation}
        userId={userId}
        typingUsers={typingUsers}
        showHeaderSkeleton={showHeaderSkeleton}
      />

      <MessageList
        ref={bottomRef}
        messages={messages}
        userId={userId}
        justConfirmedIds={justConfirmedIds}
      />

      <MessageInput
        message={message}
        isSending={isSending}
        userId={userId}
        onMessageChange={(value) => {
          setMessage(value);
          handleTyping(value);
        }}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
        onInputBlur={handleInputBlur}
      />
    </div>
  );
}
