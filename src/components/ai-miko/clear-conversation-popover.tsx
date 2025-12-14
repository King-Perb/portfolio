"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ClearConversationPopoverProps {
  onClear: () => void;
}

export function ClearConversationPopover({ onClear }: ClearConversationPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    onClear();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
          type="button"
        >
          Clear conversation
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Clear conversation?
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              This will permanently delete all messages. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs h-8 font-mono"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleClear}
              className="text-xs h-8 font-mono bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
            >
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


