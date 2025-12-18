import type { ChatMessage } from "@/types/chat";

const STORAGE_KEY = "ai-miko-conversation";
const THREAD_ID_KEY = "ai-miko-thread-id";

// Load messages from localStorage
export function loadMessagesFromStorage(): ChatMessage[] {
  if (typeof globalThis.window === "undefined") return [];

  try {
    const stored = globalThis.window.localStorage.getItem(STORAGE_KEY);
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
export function loadThreadIdFromStorage(): string | null {
  if (typeof globalThis.window === "undefined") return null;

  try {
    return globalThis.window.localStorage.getItem(THREAD_ID_KEY);
  } catch (error) {
    console.error("Error loading thread ID from storage:", error);
    return null;
  }
}

// Save messages to localStorage
export function saveMessagesToStorage(messages: ChatMessage[]): void {
  if (typeof globalThis.window === "undefined") return;

  try {
    globalThis.window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error("Error saving messages to storage:", error);
  }
}

// Save thread ID to localStorage
export function saveThreadIdToStorage(threadId: string | null): void {
  if (typeof globalThis.window === "undefined") return;

  try {
    if (threadId) {
      globalThis.window.localStorage.setItem(THREAD_ID_KEY, threadId);
    } else {
      globalThis.window.localStorage.removeItem(THREAD_ID_KEY);
    }
  } catch (error) {
    console.error("Error saving thread ID to storage:", error);
  }
}

// Clear all chat storage
export function clearChatStorage(): void {
  if (typeof globalThis.window === "undefined") return;

  try {
    globalThis.window.localStorage.removeItem(STORAGE_KEY);
    globalThis.window.localStorage.removeItem(THREAD_ID_KEY);
  } catch (error) {
    console.error("Error clearing chat storage:", error);
  }
}

