"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SocialLink } from "@/lib/constants";

interface SocialLinkProps {
  link: SocialLink;
}

export function SocialLinkComponent({ link }: SocialLinkProps) {
  const Icon = link.icon;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start gap-3 h-auto p-4 font-normal",
          "hover:bg-primary/10 hover:border-primary/50 hover:text-primary",
          "transition-all hover:shadow-[0_0_12px] hover:shadow-primary/15"
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="font-mono">{link.platform}</span>
      </Button>
    </a>
  );
}
