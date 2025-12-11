import { useState, useEffect, useRef, startTransition } from "react";
import { ANIMATION_CONFIG, ANIMATION_PHASE, type AnimationPhase } from "@/components/layout/sidebar/constants";

interface UseSidebarAnimationOptions {
  pathname: string;
  onRouteChange?: (route: string) => void;
}

interface UseSidebarAnimationReturn {
  animationPhase: AnimationPhase;
  startAnimation: (targetRoute: string) => void;
  mounted: boolean;
  isInitialMount: boolean;
}

export function useSidebarAnimation({
  pathname,
  onRouteChange,
}: UseSidebarAnimationOptions): UseSidebarAnimationReturn {
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>(ANIMATION_PHASE.IDLE);
  const [mounted, setMounted] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const previousPathnameRef = useRef(pathname);
  const animationStartTimeRef = useRef<number | null>(null);

  // Only render portal after client-side hydration to avoid hydration mismatch
  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
    // Mark initial mount as complete after a short delay to prevent animation on first load
    const timer = setTimeout(() => {
      startTransition(() => {
        setIsInitialMount(false);
      });
    }, ANIMATION_CONFIG.INITIAL_MOUNT_DELAY);
    return () => clearTimeout(timer);
  }, []);

  // Watch for pathname changes to detect when content is loaded
  useEffect(() => {
    // If we have a pending route and pathname has changed to match it, content is loaded
    if (
      pendingRoute &&
      pathname === pendingRoute &&
      pathname !== previousPathnameRef.current &&
      animationStartTimeRef.current
    ) {
      // Calculate how much time has passed since animation started
      // We need to ensure the line reaches the right edge (DURATION) before returning
      const timeSinceStart = Date.now() - animationStartTimeRef.current;
      const timeUntilRightEdge = Math.max(0, ANIMATION_CONFIG.DURATION - timeSinceStart);

      // Wait until line reaches right edge, then wait a bit for content to render
      setTimeout(() => {
        setAnimationPhase(ANIMATION_PHASE.MOVING_BACK);
        setPendingRoute(null);
        animationStartTimeRef.current = null;
      }, timeUntilRightEdge + ANIMATION_CONFIG.DOM_UPDATE_DELAY);

      // Reset to idle after animation completes
      setTimeout(() => {
        setAnimationPhase(ANIMATION_PHASE.IDLE);
      }, timeUntilRightEdge + ANIMATION_CONFIG.DOM_UPDATE_DELAY + ANIMATION_CONFIG.DURATION);
    }
    previousPathnameRef.current = pathname;
  }, [pathname, pendingRoute]);

  const startAnimation = (targetRoute: string) => {
    // Start moving right
    setAnimationPhase(ANIMATION_PHASE.MOVING_RIGHT);
    animationStartTimeRef.current = Date.now(); // Track when animation started

    // Set pending route to track when content loads
    setPendingRoute(targetRoute);

    // Navigate after animation completes
    setTimeout(() => {
      onRouteChange?.(targetRoute);
    }, ANIMATION_CONFIG.NAVIGATION_DELAY);
  };

  return {
    animationPhase,
    startAnimation,
    mounted,
    isInitialMount,
  };
}
