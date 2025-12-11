"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebarAnimation } from "@/hooks/use-sidebar-animation";
import { SidebarContent } from "./sidebar/sidebar-content";
import { AnimatedLine } from "./sidebar/animated-line";
import { AnimatedWrapper } from "./sidebar/animated-wrapper";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if we're on desktop (md: breakpoint and above)
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const { animationPhase, startAnimation, mounted, isInitialMount } = useSidebarAnimation({
    pathname,
    onRouteChange: (route) => router.push(route),
  });

  const handleNavClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only animate if navigating to a different route
    if (pathname === href) {
      onClose?.();
      return;
    }

    // Prevent default navigation
    e.preventDefault();

    // Call onClose callback
    onClose?.();

    // Start animation and navigation
    startAnimation(href);
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

  // Only use animated wrapper on desktop (where sidebar is visible)
  // On mobile, sidebar is inside a sheet and doesn't need animation wrapper
  const useAnimatedWrapper = isDesktop;

  return (
    <>
      {useAnimatedWrapper && (
        <>
          <AnimatedLine animationPhase={animationPhase} mounted={mounted} />
          <AnimatedWrapper
            animationPhase={animationPhase}
            mounted={mounted}
            isInitialMount={isInitialMount}
          >
            <SidebarContent
              pathname={pathname}
              onClose={onClose}
              onNavClick={handleNavClick}
              onTestClick={handleTestClick}
              showTestButton={process.env.NODE_ENV === "development"}
              className={cn("w-full", className)}
            />
          </AnimatedWrapper>
        </>
      )}

      {/* On mobile or when not using animated wrapper, render sidebar content directly */}
      {!useAnimatedWrapper && mounted && (
        <SidebarContent
          pathname={pathname}
          onClose={onClose}
          onNavClick={handleNavClick}
          onTestClick={handleTestClick}
          showTestButton={process.env.NODE_ENV === "development"}
          className={className}
        />
      )}

      {/* SSR fallback - will be hidden by portal on client */}
      {!mounted && (
        <SidebarContent
          pathname={pathname}
          onClose={onClose}
          onNavClick={handleNavClick}
          className={className}
        />
      )}
    </>
  );
}
