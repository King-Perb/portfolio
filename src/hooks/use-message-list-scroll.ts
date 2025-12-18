import { useEffect, useRef, useCallback } from "react";
import type { ChatMessage } from "@/types/chat";

interface UseMessageListScrollOptions {
  messages: ChatMessage[];
  isTyping?: boolean;
}

interface UseMessageListScrollReturn {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function useMessageListScroll({
  messages,
  isTyping = false,
}: UseMessageListScrollOptions): UseMessageListScrollReturn {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const lastMessageIdsRef = useRef<Set<string>>(new Set());
  const isAutoScrollingRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  // Check if user is at the bottom of the scroll container
  const isAtBottom = useCallback(() => {
    if (!scrollContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // Consider "at bottom" if within 50px of the bottom
    return scrollHeight - scrollTop - clientHeight < 50;
  }, []);

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
  }, [isAtBottom]);

  // Helper function to reset auto-scroll flag after scroll completes
  const resetAutoScrollFlag = useCallback((scrollBehavior: "auto" | "smooth") => {
    setTimeout(() => {
      isAutoScrollingRef.current = false;
      // Reset userScrolledUp if we're at bottom after auto-scroll
      if (isAtBottom()) {
        userScrolledUpRef.current = false;
      }
    }, scrollBehavior === "auto" ? 0 : 500);
  }, [isAtBottom]);

  // Helper function to execute scroll action
  const executeScroll = useCallback((scrollBehavior: "auto" | "smooth") => {
    // Check again if user scrolled up (in case they did during the frame)
    if (!userScrolledUpRef.current) {
      isAutoScrollingRef.current = true;
      messagesEndRef.current?.scrollIntoView({ behavior: scrollBehavior });

      // Mark that initial load is complete after first scroll
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }

      // Reset flag after scroll completes
      resetAutoScrollFlag(scrollBehavior);
    }
  }, [resetAutoScrollFlag]);

  // Helper function to perform auto-scroll with double RAF
  const performAutoScroll = useCallback((scrollBehavior: "auto" | "smooth") => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        executeScroll(scrollBehavior);
      });
    });
  }, [executeScroll]);

  // Helper function to reset initial load flag
  const resetInitialLoadFlag = useCallback(() => {
    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 0);
  }, []);

  // Helper function to execute initial load scroll
  const executeInitialLoadScroll = useCallback(() => {
    if (scrollContainerRef.current && messagesEndRef.current) {
      isAutoScrollingRef.current = true;
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      isInitialLoadRef.current = false;
      resetInitialLoadFlag();
    }
  }, [resetInitialLoadFlag]);

  // Helper function to handle initial load scroll
  const handleInitialLoadScroll = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        executeInitialLoadScroll();
      });
    });
  }, [executeInitialLoadScroll]);

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
      // Use instant scroll on initial load (when loading existing messages from storage)
      // Use smooth scroll for actual new messages during active session
      const scrollBehavior = isInitialLoadRef.current ? "auto" : "smooth";
      performAutoScroll(scrollBehavior);
    } else if (isInitialLoadRef.current && messages.length > 0) {
      // If this is initial load with existing messages but no "new" messages detected,
      // still scroll to bottom instantly (this handles edge cases)
      handleInitialLoadScroll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.map((m) => m.id).join(","), performAutoScroll, handleInitialLoadScroll]);

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
  }, [isTyping, isAtBottom]);

  return {
    scrollContainerRef,
    messagesEndRef,
  };
}
