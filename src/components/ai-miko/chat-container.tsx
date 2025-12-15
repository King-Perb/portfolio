"use client";

import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { ClearConversationPopover } from "./clear-conversation-popover";
import { useChatStream } from "@/hooks/use-chat-stream";
import type { ChatMessage } from "@/types/chat";
import { MIKO_STARTER_PROMPTS } from "@/data/miko-starter-prompts";

interface ChatContainerProps {
  initialMessages?: ChatMessage[];
}

export function ChatContainer({ initialMessages = [] }: ChatContainerProps) {
  const { messages, isTyping, sendMessage, stopGeneration, clearMessages } = useChatStream(initialMessages);

  // Derive which starter prompts have already been used in this conversation
  const usedPromptIds = new Set(
    messages
      .filter((msg) => msg.source === "starter-prompt" && msg.promptId)
      .map((msg) => msg.promptId as string)
  );

  const visiblePrompts = MIKO_STARTER_PROMPTS.filter(
    (prompt) => !usedPromptIds.has(prompt.id)
  ).slice(0, 3);

  const handleStarterClick = async (promptId: string, text: string) => {
    await sendMessage(text, { source: "starter-prompt", promptId });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background border border-primary/20 rounded-xl overflow-hidden">
      {/* Clear button - fixed at top left, only shows when there are messages */}
      {messages.length > 0 && clearMessages && (
        <div className="flex justify-start px-4 pt-3 pb-2 shrink-0 border-b border-primary/20">
          <ClearConversationPopover onClear={clearMessages} />
        </div>
      )}
      <MessageList messages={messages} isTyping={isTyping} />

      {visiblePrompts.length > 0 && (
        <div
          className="flex flex-wrap justify-center md:justify-start gap-2 px-4 pt-2 pb-3 border-t border-primary/20 bg-background"
          aria-label="Suggested questions"
        >
          {visiblePrompts.map((prompt, index) => {
            const displayClass = index >= 2 ? "hidden sm:inline-flex" : "inline-flex";

            return (
              <button
                key={prompt.id}
                type="button"
                data-testid="miko-starter-bubble"
                className={[
                  displayClass,
                  "items-center rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-xs sm:text-sm text-foreground hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors",
                ].join(" ")}
                onClick={() => handleStarterClick(prompt.id, prompt.text)}
              >
                {prompt.text}
              </button>
            );
          })}
        </div>
      )}

      <ChatInput
        onSendMessage={sendMessage}
        onStop={stopGeneration}
        isTyping={isTyping}
        disabled={false}
      />
    </div>
  );
}
