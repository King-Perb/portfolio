"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStop?: () => void;
  isTyping?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  onStop,
  isTyping = false,
  disabled = false,
  placeholder = "Message AI Miko...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTyping && onStop) {
      onStop();
    } else if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-primary/20 bg-background">
      <div className="flex items-end gap-2 p-4 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isTyping}
            rows={1}
            className={cn(
              "resize-none min-h-[44px] max-h-[200px] font-mono text-sm",
              "bg-card/80 border-primary/20 focus:border-primary/50",
              "focus-visible:ring-primary/20"
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={!isTyping && (!message.trim() || disabled)}
          size="icon"
          className={cn(
            "shrink-0 h-11 w-11 border border-primary/20 text-primary",
            isTyping
              ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-500"
              : "bg-primary/10 hover:bg-primary/20"
          )}
        >
          {isTyping ? (
            <>
              <Square className="h-4 w-4 fill-current" />
              <span className="sr-only">Stop generating</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

