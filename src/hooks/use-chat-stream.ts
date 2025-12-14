"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types/chat";

const STORAGE_KEY = "ai-miko-conversation";
const THREAD_ID_KEY = "ai-miko-thread-id";

// Load messages from localStorage
function loadMessagesFromStorage(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Convert timestamp strings back to Date objects
    return parsed.map((msg: ChatMessage & { timestamp: string | Date }) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error) {
    console.error("Error loading messages from storage:", error);
    return [];
  }
}

// Load thread ID from localStorage
function loadThreadIdFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    return localStorage.getItem(THREAD_ID_KEY);
  } catch (error) {
    console.error("Error loading thread ID from storage:", error);
    return null;
  }
}

// Save messages to localStorage
function saveMessagesToStorage(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error("Error saving messages to storage:", error);
  }
}

// Save thread ID to localStorage
function saveThreadIdToStorage(threadId: string | null): void {
  if (typeof window === "undefined") return;
  
  try {
    if (threadId) {
      localStorage.setItem(THREAD_ID_KEY, threadId);
    } else {
      localStorage.removeItem(THREAD_ID_KEY);
    }
  } catch (error) {
    console.error("Error saving thread ID to storage:", error);
  }
}

interface UseChatStreamResult {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
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
    if (!hasLoadedFromStorageRef.current && typeof window !== "undefined") {
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
        body: JSON.stringify({ 
          message: content, 
          conversationHistory: messages,
          threadId: threadId 
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
  }, [messages, threadId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(THREAD_ID_KEY);
    }
  }, []);

  return { messages, isTyping, sendMessage, stopGeneration, clearMessages };
}

// Process SSE stream
async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  abortController: AbortController,
  assistantMessageId: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setThreadId: React.Dispatch<React.SetStateAction<string | null>>
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
          
          // Handle thread ID from server
          if (parsed.threadId) {
            setThreadId(parsed.threadId);
            saveThreadIdToStorage(parsed.threadId);
            continue;
          }
          
          // Handle error responses from OpenAI
          if (parsed.error) {
            console.error("OpenAI error:", parsed);
            updateMessage(setMessages, assistantMessageId, 
              `Error: ${parsed.error}${parsed.details ? ` (${parsed.details})` : ""}`, 
              currentSources
            );
            return;
          }
          
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
