import { getClientSocket } from "@/lib/socket";
import { useEffect, useState } from "react";

type Message = {
  id: string;
  content?: string | null;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string; image?: string | null };
};

async function fetchMessages(chatId: string, limit = 50): Promise<Message[]> {
  const res = await fetch(`/api/v1/chat/${chatId}/messages?limit=${limit}`);
  const json = await res.json();
  return json.data ?? [];
}

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [justConfirmedIds, setJustConfirmedIds] = useState<Set<string>>(
    new Set(),
  );
  const socket = getClientSocket();

  useEffect(() => {
    if (!chatId) return;

    fetchMessages(chatId).then((list) => setMessages(list.reverse()));

    // Join with since = last message timestamp to backfill recent
    const lastTs = messages.length
      ? messages[messages.length - 1].createdAt
      : undefined;
    socket.emit("chat:join", chatId, lastTs);

    const onNew = ({
      chatId: c,
      message,
    }: {
      chatId: string;
      message: Message;
    }) => {
      if (c !== chatId) return;
      setMessages((prev) => {
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

    const onRecent = ({
      chatId: c,
      messages: recentMessages,
    }: {
      chatId: string;
      messages: Message[];
    }) => {
      if (c !== chatId || !recentMessages?.length) return;
      setMessages((prev) => {
        // Merge avoiding duplicates
        const seen = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        recentMessages.forEach((m) => {
          if (!seen.has(m.id)) merged.push(m);
        });
        return merged;
      });
    };

    socket.on("chat:new-message", onNew);
    socket.on("chat:recent", onRecent);

    return () => {
      socket.off("chat:new-message", onNew);
      socket.off("chat:recent", onRecent);
      socket.emit("chat:leave", chatId);
    };
  }, [chatId, socket, messages]);

  const addOptimisticMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const replaceTempMessage = (tempId: string, serverMessage: Message) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === tempId ? serverMessage : m)),
    );
    // mark as just confirmed for a brief highlight
    setJustConfirmedIds((prevSet) => {
      const copy = new Set(prevSet);
      copy.add(serverMessage.id);
      return copy;
    });
    setTimeout(() => {
      setJustConfirmedIds((prevSet) => {
        const copy = new Set(prevSet);
        copy.delete(serverMessage.id);
        return copy;
      });
    }, 700);
  };

  const removeTempMessage = (tempId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== tempId));
  };

  return {
    messages,
    justConfirmedIds,
    addOptimisticMessage,
    replaceTempMessage,
    removeTempMessage,
  };
}
