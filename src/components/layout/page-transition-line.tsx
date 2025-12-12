"use client";

import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useEffect, useState, startTransition } from "react";
import { ANIMATION_CONFIG, ANIMATION_PHASE, type AnimationPhase } from "./sidebar/constants";
import { FluidLoadingAnimation } from "@/components/animations/fluid-loading-animation";

interface PageTransitionLineProps {
  animationPhase: AnimationPhase;
}

/**
 * Full-screen page transition overlay and line that animates from left edge (0) to right and back.
 * Used for navigation triggered from content area (e.g., mobile next section buttons).
 * Different from sidebar AnimatedLine which starts from sidebar edge.
 * 
 * Includes an expanding background overlay that covers content as the line sweeps across,
 * similar to the sidebar's AnimatedWrapper behavior.
 */
export function PageTransitionLine({ animationPhase }: PageTransitionLineProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  // Only show when animating and mounted
  if (!mounted || typeof window === "undefined" || animationPhase === ANIMATION_PHASE.IDLE) {
    return null;
  }

  const isMovingRight = animationPhase === ANIMATION_PHASE.MOVING_RIGHT;
  const isMovingBack = animationPhase === ANIMATION_PHASE.MOVING_BACK;
  const isAnimating = isMovingRight || isMovingBack;

  // Line width: thin at start, thick during animation
  const idleWidth = 1; // px
  const animatingWidth = 4; // px

  // Opacity: starts visible, increases during animation
  const idleOpacity = 0.2;
  const animatingOpacity = 0.5;

  // Calculate x position based on phase
  // Start from left edge (0), move to right edge (100vw)
  const xPosition = isMovingRight ? "100vw" : 0;

  // Generate keyframes for width and opacity
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

  // Keyframe times
  const keyframeTimes = isMovingRight
    ? [0, 0.1, 0.8, 1]
    : isMovingBack
    ? [0, 0.8, 1]
    : undefined;

  // Overlay width: expands from 0 to 100vw as line moves right, shrinks back as line returns
  const overlayWidth = isMovingRight
    ? "100vw"
    : isMovingBack
    ? "0px"
    : "0px";

  const transitionElement = (
    <>
      {/* Background overlay that expands/shrinks with the line */}
      <motion.div
        className="fixed left-0 top-0 h-screen bg-background overflow-hidden"
        style={{
          zIndex: 99998, // Below the line
          pointerEvents: "none",
        }}
        initial={{
          width: "0px",
        }}
        animate={{
          width: overlayWidth,
        }}
        transition={{
          duration: ANIMATION_CONFIG.DURATION / 1000,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {/* Lottie animation revealed as overlay expands */}
        {/* Fixed at viewport center (50vw), revealed as overlay expands past it */}
        <div
          className="absolute top-1/2"
          style={{
            left: "50vw", // Center of viewport
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          <FluidLoadingAnimation />
        </div>
      </motion.div>

      {/* The animated scan line */}
      <motion.div
        className="fixed top-0 left-0 h-screen bg-primary"
        style={{
          zIndex: 99999, // Above the overlay
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
    </>
  );

  return createPortal(transitionElement, document.body);
}

