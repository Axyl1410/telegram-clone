import { getClientSocket } from "@/lib/socket";
import { useRef, useState } from "react";

export function useTyping(chatId: string | null, userId: string | null) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const socket = getClientSocket();

  const sendTypingEvent = (typing: boolean) => {
    if (!chatId || !userId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Send typing event
    socket.emit("chat:typing", chatId, { userId, typing });

    // If starting to type, set a timeout to stop typing after 3 seconds
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("chat:typing", chatId, { userId, typing: false });
        setIsTyping(false);
      }, 3000);
    }
  };

  const handleTyping = (value: string) => {
    // Clear existing debounce timeout
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }

    // Handle typing events with debounce
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      sendTypingEvent(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      sendTypingEvent(false);
    } else if (value.trim() && isTyping) {
      // User is still typing, reset the timeout
      typingDebounceRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingEvent(false);
      }, 1000); // Stop typing after 1 second of inactivity
    }
  };

  const handleInputBlur = () => {
    // Stop typing when user loses focus on input
    if (isTyping) {
      setIsTyping(false);
      sendTypingEvent(false);
    }

    // Clear any pending debounce timeout
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
  };

  const cleanup = () => {
    // Clean up timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
  };

  return {
    typingUsers,
    setTypingUsers,
    isTyping,
    handleTyping,
    handleInputBlur,
    cleanup,
  };
}
