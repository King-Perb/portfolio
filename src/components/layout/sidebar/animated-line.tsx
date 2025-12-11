"use client";

import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ANIMATION_CONFIG, ANIMATION_PHASE, SIDEBAR_CONFIG, type AnimationPhase } from "./constants";

interface AnimatedLineProps {
  animationPhase: AnimationPhase;
  mounted: boolean;
}

export function AnimatedLine({ animationPhase, mounted }: AnimatedLineProps) {
  if (!mounted || typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <motion.div
      className="fixed top-0 h-screen w-0.5 bg-primary border-r-2 border-primary"
      style={{
        left: `${SIDEBAR_CONFIG.WIDTH}px`, // Aligned with sidebar right edge
        zIndex: SIDEBAR_CONFIG.Z_INDEX,
        pointerEvents: "none", // Don't block interactions
      }}
      animate={{
        x:
          animationPhase === ANIMATION_PHASE.MOVING_RIGHT
            ? `calc(100vw - ${SIDEBAR_CONFIG.WIDTH}px)` // Move to right edge of viewport
            : animationPhase === ANIMATION_PHASE.MOVING_BACK
            ? 0 // Move back to sidebar edge
            : 0, // Idle position at sidebar edge
      }}
      transition={{
        duration: ANIMATION_CONFIG.DURATION / 1000, // Convert ms to seconds
        ease: [0.4, 0, 0.2, 1],
      }}
    />,
    document.body
  );
}
