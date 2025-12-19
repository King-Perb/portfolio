"use client";

import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ANIMATION_CONFIG, ANIMATION_PHASE, SIDEBAR_CONFIG, type AnimationPhase } from "./constants";
import { FluidLoadingAnimation } from "@/components/animations/fluid-loading-animation";

interface AnimatedWrapperProps {
  animationPhase: AnimationPhase;
  mounted: boolean;
  isInitialMount: boolean;
  children: React.ReactNode;
}

export function AnimatedWrapper({
  animationPhase,
  mounted,
  isInitialMount,
  children,
}: AnimatedWrapperProps) {
  if (!mounted || typeof globalThis.window === "undefined") {
    return null;
  }

  return createPortal(
    <motion.div
      className="fixed left-0 top-0 h-screen overflow-hidden bg-background pointer-events-none"
      style={{
        zIndex: SIDEBAR_CONFIG.Z_INDEX,
      }}
      initial={{
        width: `${SIDEBAR_CONFIG.WIDTH}px`, // Start at sidebar width to prevent animation on first load
      }}
      animate={{
        // Animate width to reveal navbar as border moves
        // Border at 280px (idle) -> show 280px
        // Border at 100vw (moving-right) -> show 100vw
        // During moving-back, shrink navbar in sync with line returning
        width:
          animationPhase === ANIMATION_PHASE.MOVING_RIGHT
            ? "100vw" // Show full width when border reaches right edge
            : `${SIDEBAR_CONFIG.WIDTH}px`, // Show sidebar width when idle or moving back
      }}
      transition={{
        duration: isInitialMount ? 0 : ANIMATION_CONFIG.DURATION / 1000, // No transition on initial mount
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
      {/* Lottie animation revealed as overlay expands (desktop only) */}
      {/* Centered at viewport center (50vw), revealed as overlay expands past it */}
      {/* Rendered after children with z-index to appear above sidebar */}
      {animationPhase !== ANIMATION_PHASE.IDLE && (
        <div
          className="absolute top-1/2"
          style={{
            left: "50vw", // Center of viewport
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 10, // Above sidebar content
          }}
        >
          <FluidLoadingAnimation />
        </div>
      )}
    </motion.div>,
    document.body
  );
}
