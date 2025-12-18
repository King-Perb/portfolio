"use client";

import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ANIMATION_CONFIG, ANIMATION_PHASE, SIDEBAR_CONFIG, type AnimationPhase } from "./constants";

interface AnimatedLineProps {
  animationPhase: AnimationPhase;
  mounted: boolean;
  isMobile?: boolean;
}

// Line styling matches project card default (non-hover): border-primary/20, no shadow

export function AnimatedLine({ animationPhase, mounted, isMobile = false }: AnimatedLineProps) {
  if (!mounted || typeof window === "undefined") {
    return null;
  }

  // Use fixed positioning for both mobile and desktop
  // Idle style matches project card default (non-hover): border-primary/20, no shadow
  // Line gets thicker during animation but returns to thin 100ms before animation ends
  const isMovingRight = animationPhase === ANIMATION_PHASE.MOVING_RIGHT;
  const isMovingBack = animationPhase === ANIMATION_PHASE.MOVING_BACK;
  const isAnimating = isMovingRight || isMovingBack;

  // Width: thin in idle, thick during animation (controlled by CSS transition with offset timing)
  const idleWidth = isMobile ? 0.5 : 1; // px
  const animatingWidth = isMobile ? 1.5 : 4; // px - thinner on mobile, thicker on desktop

  // Opacity: matches project card default (20%) in idle, increases during animation
  const idleOpacity = 0.2; // 20% - matches bg-primary/20
  const animatingOpacity = 0.5; // 50% - more visible during animation

  // Calculate x position based on phase
  const xPosition = isMovingRight
    ? `calc(100vw - ${SIDEBAR_CONFIG.WIDTH}px)`
    : 0;

  // Generate keyframes for width and opacity based on animation phase
  // MOVING_RIGHT: thin → thick → thick → thin (returns thin at 80%)
  // MOVING_BACK: starts thick (already at right edge), stays thick, returns thin at 80%
  const getKeyframes = (
    idleValue: number,
    animatingValue: number
  ): number[] | number => {
    if (isMovingRight) {
      return [idleValue, animatingValue, animatingValue, idleValue];
    }
    if (isMovingBack) {
      return [animatingValue, animatingValue, idleValue];
    }
    return idleValue;
  };

  const widthKeyframes = getKeyframes(idleWidth, animatingWidth);
  const opacityKeyframes = getKeyframes(idleOpacity, animatingOpacity);

  // Keyframe times - same for both width and opacity
  let keyframeTimes: number[] | undefined;
  if (isMovingRight) {
    keyframeTimes = [0, 0.1, 0.8, 1]; // Start thin, quickly thick, stay thick, return thin at 80%
  } else if (isMovingBack) {
    keyframeTimes = [0, 0.8, 1]; // Start thick, stay thick, return thin at 80%
  }

  const lineElement = (
    <motion.div
      className="fixed top-0 h-screen bg-primary"
      style={{
        left: `${SIDEBAR_CONFIG.WIDTH}px`,
        // No shadow - matches project card default state (shadow only on hover)
        zIndex: isMobile ? 100 : SIDEBAR_CONFIG.Z_INDEX,
        pointerEvents: "none",
      }}
      initial={{
        width: idleWidth,
        opacity: idleOpacity,
        x: 0,
      }}
      animate={{
        x: xPosition,
        width: isAnimating ? widthKeyframes : idleWidth,
        opacity: isAnimating ? opacityKeyframes : idleOpacity,
      }}
      transition={{
        x: {
          duration: ANIMATION_CONFIG.DURATION / 1000,
          ease: [0.4, 0, 0.2, 1],
        },
        width: {
          duration: ANIMATION_CONFIG.DURATION / 1000,
          ease: "easeInOut",
          times: keyframeTimes,
        },
        opacity: {
          duration: ANIMATION_CONFIG.DURATION / 1000,
          ease: "easeInOut",
          times: keyframeTimes,
        },
      }}
    />
  );

  // On mobile, render directly (will be inside Sheet for proper DOM context)
  // On desktop, render in portal to document.body
  if (isMobile) {
    return lineElement;
  }

  return createPortal(lineElement, document.body);
}
