import type { ChatMessage } from "@/types/chat";
import { saveThreadIdToStorage } from "@/lib/storage/chat-storage";

// Update a message in the messages array
export function updateMessage(
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  id: string,
  content: string,
  sources?: string[]
): void {
  setMessages((prev) => {
    const updated = [...prev];
    const lastIndex = updated.length - 1;
    if (updated[lastIndex]?.id === id) {
      updated[lastIndex] = { ...updated[lastIndex], content, sources };
    }
    return updated;
  });
}

// Handle parsed message data from stream
export function handleParsedMessage(
  parsed: Record<string, unknown>,
  assistantMessageId: string,
  currentContent: string,
  currentSources: string[] | undefined,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setThreadId: React.Dispatch<React.SetStateAction<string | null>>
): { shouldContinue: boolean; newContent: string; newSources: string[] | undefined } {
  // Handle thread ID from server
  if (parsed.threadId) {
    const threadId = parsed.threadId as string;
    setThreadId(threadId);
    saveThreadIdToStorage(threadId);
    return { shouldContinue: true, newContent: currentContent, newSources: currentSources };
  }

  // Handle error responses from OpenAI
  if (parsed.error) {
    console.error("OpenAI error:", parsed);
    const errorStr = typeof parsed.error === "string" ? parsed.error : JSON.stringify(parsed.error);
    let errorMessage = `Error: ${errorStr}`;
    if (parsed.details) {
      const detailsStr = typeof parsed.details === "string" ? parsed.details : JSON.stringify(parsed.details);
      errorMessage = `Error: ${errorStr} (${detailsStr})`;
    }
    updateMessage(setMessages, assistantMessageId, errorMessage, currentSources);
    return { shouldContinue: false, newContent: currentContent, newSources: currentSources };
  }

  let newContent = currentContent;
  let newSources = currentSources;

  if (parsed.content) {
    newContent += parsed.content as string;
    updateMessage(setMessages, assistantMessageId, newContent, newSources);
  }
  if (parsed.sources) {
    newSources = parsed.sources as string[];
    updateMessage(setMessages, assistantMessageId, newContent, newSources);
  }

  return { shouldContinue: true, newContent, newSources };
}

// Process lines from the stream buffer
export function processStreamLines(
  lines: string[],
  assistantMessageId: string,
  currentContent: string,
  currentSources: string[] | undefined,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setThreadId: React.Dispatch<React.SetStateAction<string | null>>
): { shouldContinue: boolean; newContent: string; newSources: string[] | undefined } {
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;

    const data = line.slice(6);
    if (data === "[DONE]") {
      return { shouldContinue: false, newContent: currentContent, newSources: currentSources };
    }

    try {
      const parsed = JSON.parse(data);
      const result = handleParsedMessage(
        parsed,
        assistantMessageId,
        currentContent,
        currentSources,
        setMessages,
        setThreadId
      );
      if (!result.shouldContinue) {
        return result;
      }
      currentContent = result.newContent;
      currentSources = result.newSources;
    } catch {
      // Skip invalid JSON
    }
  }
  return { shouldContinue: true, newContent: currentContent, newSources: currentSources };
}

// Process SSE stream
export async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  abortController: AbortController,
  assistantMessageId: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setThreadId: React.Dispatch<React.SetStateAction<string | null>>
): Promise<void> {
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

      const result = processStreamLines(
        lines,
        assistantMessageId,
        currentContent,
        currentSources,
        setMessages,
        setThreadId
      );
      if (!result.shouldContinue) break;
      currentContent = result.newContent;
      currentSources = result.newSources;
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // Ignore cancel errors
    }
  }
}
