"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from "lucide-react";
import { USER_PROFILE } from "@/lib/constants";

export function TypingIndicator() {
  return (
    <div className="flex gap-4 px-4 py-6">
      <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
        <AvatarImage src={USER_PROFILE.avatarUrl} alt="AI Miko" />
        <AvatarFallback className="bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-1 px-4 py-3 bg-card/80 border border-primary/20 rounded-2xl">
        <div className="flex gap-1">
          <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

