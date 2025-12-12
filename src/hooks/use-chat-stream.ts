"use client";

import { useState, useCallback, useRef } from "react";
import type { ChatMessage } from "@/types/chat";

interface UseChatStreamResult {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
}

export function useChatStream(initialMessages: ChatMessage[] = []): UseChatStreamResult {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
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
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai-miko/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, conversationHistory: messages }),
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

      await processStream(reader, abortController, assistantMessageId, setMessages);
      
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
  }, [messages]);

  return { messages, isTyping, sendMessage, stopGeneration };
}

// Process SSE stream
async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  abortController: AbortController,
  assistantMessageId: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) {
  const decoder = new TextDecoder();
  let buffer = "";
  let currentContent = "";
  let currentSources: string[] | undefined;

  try {
    while (true) {
      if (abortController.signal.aborted) break;

      let readResult;
      try {
        readResult = await reader.read();
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") break;
        throw e;
      }

      const { done, value } = readResult;
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        
        const data = line.slice(6);
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            currentContent += parsed.content;
            updateMessage(setMessages, assistantMessageId, currentContent, currentSources);
          }
          if (parsed.sources) {
            currentSources = parsed.sources;
            updateMessage(setMessages, assistantMessageId, currentContent, currentSources);
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  } finally {
    try { reader.cancel(); } catch { /* ignore */ }
  }
}

function updateMessage(
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  id: string,
  content: string,
  sources?: string[]
) {
  setMessages((prev) => {
    const updated = [...prev];
    const lastIndex = updated.length - 1;
    if (updated[lastIndex]?.id === id) {
      updated[lastIndex] = { ...updated[lastIndex], content, sources };
    }
    return updated;
  });
}

