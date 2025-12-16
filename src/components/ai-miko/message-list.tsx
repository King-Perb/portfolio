"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { MessageBubble } from "./message-bubble";
import type { ChatMessage } from "@/types/chat";
import { USER_PROFILE } from "@/lib/constants";

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export function MessageList({ messages, isTyping = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const lastMessageIdsRef = useRef<Set<string>>(new Set());
  const isAutoScrollingRef = useRef(false);

  // Check if user is at the bottom of the scroll container
  const isAtBottom = () => {
    if (!scrollContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // Consider "at bottom" if within 50px of the bottom
    return scrollHeight - scrollTop - clientHeight < 50;
  };

  // Handle manual scroll - detect when user scrolls up
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    let lastScrollTop = container.scrollTop;

    const handleScroll = () => {
      // Clear any pending scroll checks
      clearTimeout(scrollTimeout);

      // If we're auto-scrolling, update lastScrollTop but don't update the flag
      if (isAutoScrollingRef.current) {
        lastScrollTop = container.scrollTop;
        return;
      }

      const currentScrollTop = container.scrollTop;
      const scrolledUp = currentScrollTop < lastScrollTop;
      lastScrollTop = currentScrollTop;

      // Check if user scrolled up after a brief delay (to avoid false positives during auto-scroll)
      scrollTimeout = setTimeout(() => {
        if (!isAutoScrollingRef.current) {
          // Only mark as scrolled up if user actively scrolled up OR is not at bottom
          // This ensures we don't auto-scroll if user is reading old messages
          if (scrolledUp || !isAtBottom()) {
            userScrolledUpRef.current = true;
          } else if (isAtBottom()) {
            // If user is at bottom, reset the flag to allow auto-scroll
            userScrolledUpRef.current = false;
          }
        }
      }, 100);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Auto-scroll only for new messages, not content updates
  useEffect(() => {
    const currentMessageIds = messages.map((m) => m.id);

    // Check if we have new message IDs (not just content updates)
    const hasNewMessage = currentMessageIds.some((id) => !lastMessageIdsRef.current.has(id));

    // Update tracked message IDs
    lastMessageIdsRef.current = new Set(currentMessageIds);

    // Only auto-scroll if:
    // 1. A new message was added (not just content update)
    // 2. User hasn't manually scrolled up
    if (hasNewMessage && !userScrolledUpRef.current) {
      // Use double requestAnimationFrame to ensure DOM is fully updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Check again if user scrolled up (in case they did during the frame)
          if (!userScrolledUpRef.current) {
            isAutoScrollingRef.current = true;
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

            // Reset flag after scroll completes
            setTimeout(() => {
              isAutoScrollingRef.current = false;
              // Reset userScrolledUp if we're at bottom after auto-scroll
              if (isAtBottom()) {
                userScrolledUpRef.current = false;
              }
            }, 500);
          }
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.map((m) => m.id).join(",")]);

  // Auto-scroll when typing indicator appears (if at bottom)
  useEffect(() => {
    if (isTyping && !userScrolledUpRef.current && isAtBottom()) {
      requestAnimationFrame(() => {
        if (!userScrolledUpRef.current && isAtBottom()) {
          isAutoScrollingRef.current = true;
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => {
            isAutoScrollingRef.current = false;
          }, 300);
        }
      });
    }
  }, [isTyping]);

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
        {isTyping && messages.length > 0 && messages[messages.length - 1]?.role !== "assistant" && (
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
