"use client";

import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { ClearConversationPopover } from "./clear-conversation-popover";
import { useChatStream } from "@/hooks/use-chat-stream";
import type { ChatMessage } from "@/types/chat";

interface ChatContainerProps {
  initialMessages?: ChatMessage[];
}

export function ChatContainer({ initialMessages = [] }: ChatContainerProps) {
  const { messages, isTyping, sendMessage, stopGeneration, clearMessages } = useChatStream(initialMessages);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background border border-primary/20 rounded-xl overflow-hidden">
      {/* Clear button - fixed at top left, only shows when there are messages */}
      {messages.length > 0 && clearMessages && (
        <div className="flex justify-start px-4 pt-3 pb-2 shrink-0 border-b border-primary/20">
          <ClearConversationPopover onClear={clearMessages} />
        </div>
      )}
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
