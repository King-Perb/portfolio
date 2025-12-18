"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebarAnimation } from "@/hooks/use-sidebar-animation";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { SidebarContent } from "./sidebar/sidebar-content";
import { AnimatedLine } from "./sidebar/animated-line";
import { AnimatedWrapper } from "./sidebar/animated-wrapper";
import { ANIMATION_PHASE } from "./sidebar/constants";
import { cn } from "@/lib/utils";

interface SidebarProps {
    className?: string;
    onClose?: () => void;
    onAnimationPhaseChange?: (phase: typeof ANIMATION_PHASE[keyof typeof ANIMATION_PHASE]) => void;
}

export function Sidebar({ className, onClose, onAnimationPhaseChange }: Readonly<SidebarProps>) {
    const pathname = usePathname();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const previousAnimationPhaseRef = useRef<typeof ANIMATION_PHASE[keyof typeof ANIMATION_PHASE]>(ANIMATION_PHASE.IDLE);
  const shouldCloseOnIdleRef = useRef(false);

  const { animationPhase, startAnimation, mounted, isInitialMount } = useSidebarAnimation({
    pathname,
    onRouteChange: (route) => router.push(route),
  });

  // Expose animation phase to parent (for mobile Sheet animation)
    useEffect(() => {
    onAnimationPhaseChange?.(animationPhase);
  }, [animationPhase, onAnimationPhaseChange]);

  // Clear pending route when navigation completes (pathname matches pending route)
    useEffect(() => {
    if (pendingRoute && pathname === pendingRoute) {
            startTransition(() => {
        setPendingRoute(null);
            });
        }
  }, [pathname, pendingRoute]);

  // Track when animation completes to close Sheet on mobile
    useEffect(() => {
    // Detect transition from MOVING_BACK to IDLE (animation complete)
    const wasMovingBack = previousAnimationPhaseRef.current === ANIMATION_PHASE.MOVING_BACK;
    const isNowIdle = animationPhase === ANIMATION_PHASE.IDLE;

    // On mobile, close Sheet when animation completes (line returns and goes to IDLE)
    if (!isDesktop && onClose && wasMovingBack && isNowIdle && shouldCloseOnIdleRef.current && mounted) {
      // Small delay to ensure animation is fully complete
            const timer = setTimeout(() => {
        onClose();
        shouldCloseOnIdleRef.current = false; // Reset flag
      }, 50);
            return () => clearTimeout(timer);
        }

    // Update previous phase
    previousAnimationPhaseRef.current = animationPhase;
  }, [animationPhase, isDesktop, onClose, mounted]);

  const handleNavClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only animate if navigating to a different route
    if (pathname === href) {
      onClose?.();
      return;
    }

    // Prevent default navigation
    e.preventDefault();

    // Set pending route immediately for instant visual feedback
    setPendingRoute(href);

    // Mark that we should close when animation completes (on mobile)
    if (!isDesktop && onClose) {
      shouldCloseOnIdleRef.current = true;
    }

    // Start animation and navigation
    startAnimation(href);
    // Note: Sheet closing is handled by useEffect watching animationPhase transition
    // On desktop, sidebar stays visible (no onClose call)
    };

  const handleTestClick = () => {
    // Navigate to a different route (cycle through routes for testing)
    const routes = ["/", "/projects", "/stack", "/contact"];
    const currentIndex = routes.indexOf(pathname);
    const nextRoute = routes[(currentIndex + 1) % routes.length] || "/projects";

    // Create a synthetic event for handleNavClick
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.MouseEvent<HTMLAnchorElement>;

    handleNavClick(nextRoute, syntheticEvent);
  };

  // Check if animation is currently playing
  const isAnimating = animationPhase !== ANIMATION_PHASE.IDLE;

  // Common props for SidebarContent to reduce duplication
  const sidebarContentProps = {
    pathname,
    pendingRoute,
    onClose,
    onNavClick: handleNavClick,
    onTestClick: handleTestClick,
    showTestButton: process.env.NODE_ENV === "development",
    isAnimating,
  };

  return (
    <>
      {/* Desktop: Animated line + wrapper */}
      {isDesktop && (
        <>
          <AnimatedLine animationPhase={animationPhase} mounted={mounted} isMobile={false} />
          <AnimatedWrapper
            animationPhase={animationPhase}
            mounted={mounted}
            isInitialMount={isInitialMount}
          >
            <SidebarContent
              {...sidebarContentProps}
              className={cn("w-full", className)}
            />
          </AnimatedWrapper>
        </>
      )}

      {/* Mobile: Animated line + sidebar content (SheetContent handles expansion) */}
      {!isDesktop && mounted && (
        <>
          <AnimatedLine animationPhase={animationPhase} mounted={mounted} isMobile={true} />
          <SidebarContent
            {...sidebarContentProps}
            className={className}
          />
        </>
      )}

      {/* SSR fallback - will be hidden by portal on client */}
      {!mounted && (
        <SidebarContent
          pathname={pathname}
          pendingRoute={pendingRoute}
          onClose={onClose}
          onNavClick={handleNavClick}
          isAnimating={false}
          className={className}
        />
      )}
    </>
    );
}
