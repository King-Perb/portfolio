"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types/chat";
import {
  loadMessagesFromStorage,
  loadThreadIdFromStorage,
  saveMessagesToStorage,
  saveThreadIdToStorage,
  clearChatStorage,
} from "@/lib/storage/chat-storage";
import { processStream } from "@/lib/stream/chat-stream-processor";

interface UseChatStreamResult {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (
    content: string,
    options?: { source?: ChatMessage["source"]; promptId?: string }
  ) => Promise<void>;
  stopGeneration: () => void;
  clearMessages: () => void;
}

export function useChatStream(initialMessages: ChatMessage[] = []): UseChatStreamResult {
  // Start with initialMessages (or empty) to match server render
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedFromStorageRef = useRef(false);

  // Load from localStorage after hydration (client-side only)
  useEffect(() => {
    if (!hasLoadedFromStorageRef.current && globalThis.window !== undefined) {
      const storedMessages = loadMessagesFromStorage();
      const storedThreadId = loadThreadIdFromStorage();
      if (storedMessages.length > 0) {
        setMessages(storedMessages);
      }
      if (storedThreadId) {
        setThreadId(storedThreadId);
      }
      hasLoadedFromStorageRef.current = true;
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    // Only save if we've loaded from storage (to avoid overwriting on initial mount)
    // and if there are messages
    if (hasLoadedFromStorageRef.current && messages.length > 0) {
      saveMessagesToStorage(messages);
    }
  }, [messages]);

  // Save thread ID to localStorage whenever it changes
  useEffect(() => {
    if (hasLoadedFromStorageRef.current) {
      saveThreadIdToStorage(threadId);
    }
  }, [threadId]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      options?: { source?: ChatMessage["source"]; promptId?: string }
    ) => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
      ...(options?.source && { source: options.source }),
      ...(options?.promptId && { promptId: options.promptId }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai-miko/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            conversationHistory: messages,
            threadId: threadId,
          }),
        signal: abortController.signal,
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const assistantMessageId = `assistant-${Date.now()}`;
      setMessages((prev) => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }]);

      await processStream(reader, abortController, assistantMessageId, setMessages, setThreadId);

      abortControllerRef.current = null;
      setIsTyping(false);
    } catch (error) {
      abortControllerRef.current = null;
      setIsTyping(false);

      if (error instanceof Error && error.name === "AbortError") return;

      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }]);
    }
  },
  [messages, threadId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    clearChatStorage();
  }, []);

  return { messages, isTyping, sendMessage, stopGeneration, clearMessages };
}
