"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, startTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ANIMATION_CONFIG, ANIMATION_PHASE, type AnimationPhase } from "@/components/layout/sidebar/constants";

interface NavigationContextValue {
  triggerNavigation: (targetRoute: string) => void;
  animationPhase: AnimationPhase;
  isAnimating: boolean;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>(ANIMATION_PHASE.IDLE);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const previousPathnameRef = useRef(pathname);
  const animationStartTimeRef = useRef<number | null>(null);

  // Watch for pathname changes to detect when content is loaded
  useEffect(() => {
    if (
      pendingRoute &&
      pathname === pendingRoute &&
      pathname !== previousPathnameRef.current &&
      animationStartTimeRef.current
    ) {
      // Calculate how much time has passed since animation started
      const timeSinceStart = Date.now() - animationStartTimeRef.current;
      const timeUntilRightEdge = Math.max(0, ANIMATION_CONFIG.DURATION - timeSinceStart);

      // Wait until line reaches right edge, then start moving back
      setTimeout(() => {
        startTransition(() => {
          setAnimationPhase(ANIMATION_PHASE.MOVING_BACK);
          setPendingRoute(null);
          animationStartTimeRef.current = null;
        });
      }, timeUntilRightEdge + ANIMATION_CONFIG.DOM_UPDATE_DELAY);

      // Reset to idle after animation completes
      setTimeout(() => {
        startTransition(() => {
          setAnimationPhase(ANIMATION_PHASE.IDLE);
        });
      }, timeUntilRightEdge + ANIMATION_CONFIG.DOM_UPDATE_DELAY + ANIMATION_CONFIG.DURATION);
    }
    previousPathnameRef.current = pathname;
  }, [pathname, pendingRoute]);

  const triggerNavigation = useCallback((targetRoute: string) => {
    // Don't animate if already on the target route
    if (pathname === targetRoute) {
      return;
    }

    // Don't start new animation if one is already in progress
    if (animationPhase !== ANIMATION_PHASE.IDLE) {
      return;
    }

    // Start moving right
    setAnimationPhase(ANIMATION_PHASE.MOVING_RIGHT);
    animationStartTimeRef.current = Date.now();

    // Set pending route to track when content loads
    setPendingRoute(targetRoute);

    // Navigate after animation starts
    setTimeout(() => {
      router.push(targetRoute);
    }, ANIMATION_CONFIG.NAVIGATION_DELAY);
  }, [pathname, animationPhase, router]);

  const isAnimating = animationPhase !== ANIMATION_PHASE.IDLE;

  return (
    <NavigationContext.Provider value={{ triggerNavigation, animationPhase, isAnimating }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}

// Hook for components that just need to trigger navigation
export function useTriggerNavigation() {
  const { triggerNavigation } = useNavigation();
  return triggerNavigation;
}
