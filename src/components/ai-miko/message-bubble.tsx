"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatMessage } from "@/types/chat";
import { USER_PROFILE } from "@/lib/constants";
import { Bot } from "lucide-react";
import Image from "next/image";

interface MessageBubbleProps {
  message: ChatMessage;
  isTyping?: boolean;
}

export function MessageBubble({ message, isTyping = false }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 px-4 py-6 group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex flex-col items-center gap-2 shrink-0">
          {/* Use Next/Image for immediate display with priority loading */}
          <div className="h-8 w-8 border border-primary/20 rounded-full overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center relative">
            <Image
              src={USER_PROFILE.avatarUrl}
              alt="AI Miko"
              fill
              sizes="32px"
              className="object-cover"
              priority
            />
          </div>
          {isTyping && (
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="h-1.5 w-1.5 bg-primary/50 rounded-full animate-bounce" />
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "flex flex-col gap-2 max-w-[85%] md:max-w-[70%]",
          isUser && "items-end"
        )}
      >
        {(message.content || isTyping) && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 font-mono text-sm leading-relaxed",
              isUser
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-card/80 text-foreground border border-primary/20",
              // Ensure minimum height even when content is empty
              !message.content && "min-h-[44px] flex items-center"
            )}
          >
            {message.content ? (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            ) : isTyping ? (
              <div className="text-muted-foreground/50">Thinking...</div>
            ) : null}
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
            {message.sources.map((source, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-secondary/50 rounded border border-primary/10"
              >
                {source}
              </span>
            ))}
          </div>
        )}

        <span className="text-xs text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
          <AvatarImage src="/chat-user-pic.png" alt={USER_PROFILE.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {USER_PROFILE.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
