import { useCallback } from "react";
import type { Project } from "@/types";
import { getProjectClickUrl } from "@/lib/project-utils";

export interface UseProjectCardClickResult {
  cardUrl: string | undefined;
  handleClick: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isClickable: boolean;
}

/**
 * Custom hook for handling project card click interactions
 */
export function useProjectCardClick(project: Project): UseProjectCardClickResult {
  const cardUrl = getProjectClickUrl(project);
  
  const handleClick = useCallback(() => {
    if (cardUrl) {
      window.open(cardUrl, "_blank", "noopener,noreferrer");
    }
  }, [cardUrl]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (cardUrl && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleClick();
    }
  }, [cardUrl, handleClick]);
  
  return {
    cardUrl,
    handleClick,
    handleKeyDown,
    isClickable: !!cardUrl,
  };
}

