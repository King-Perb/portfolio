"use client";

import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { useChatStream } from "@/hooks/use-chat-stream";
import type { ChatMessage } from "@/types/chat";

interface ChatContainerProps {
  initialMessages?: ChatMessage[];
}

export function ChatContainer({ initialMessages = [] }: ChatContainerProps) {
  const { messages, isTyping, sendMessage, stopGeneration } = useChatStream(initialMessages);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[800px] bg-background border border-primary/20 rounded-xl overflow-hidden">
      <MessageList messages={messages} isTyping={isTyping} />
      <ChatInput
        onSendMessage={sendMessage}
        onStop={stopGeneration}
        isTyping={isTyping}
        disabled={false}
      />
    </div>
  );
}
