"use client";

import Image from "next/image";
import { MessageBubble } from "./message-bubble";
import type { ChatMessage } from "@/types/chat";
import { USER_PROFILE } from "@/lib/constants";
import { useMessageListScroll } from "@/hooks/use-message-list-scroll";

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export function MessageList({ messages, isTyping = false }: Readonly<MessageListProps>) {
  const { scrollContainerRef, messagesEndRef } = useMessageListScroll({
    messages,
    isTyping,
  });

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto flex flex-col scrollbar scrollbar-thin scrollbar-thumb-primary/30 scrollbar-thumb-rounded scrollbar-track-transparent hover:scrollbar-thumb-primary/50"
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto w-full px-4">
            <div className="space-y-4 max-w-md mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Miko AI
              </h2>
              <p className="text-muted-foreground font-mono text-sm">
                Ask me anything about the portfolio, projects, or tech stack. I have access to all the documentation and can help you explore!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto py-4 w-full flex-1">
          {messages.map((message, index) => {
          // Show typing indicator on the last assistant message if typing
          // Also show if it's the last message and it's an assistant message being streamed
          const isLastMessage = index === messages.length - 1;
          const showTyping = isTyping &&
            message.role === "assistant" &&
            isLastMessage;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isTyping={showTyping}
            />
          );
        })}

        {/* Show typing indicator if typing but no assistant message exists yet */}
        {isTyping && messages.length > 0 && messages.at(-1)?.role !== "assistant" && (
          <div className="flex gap-4 px-4 py-6" aria-label="Miko is thinking">
            <div className="flex flex-col items-start gap-2 shrink-0">
              <div className="h-8 w-8 border border-primary/20 rounded-full overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center relative">
                <Image
                  src={USER_PROFILE.avatarUrl}
                  alt="Miko AI"
                  fill
                  sizes="32px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce" />
                </div>
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
