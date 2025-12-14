"use client";

import { useEffect, useState, startTransition } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface AppLoadingScreenProps {
  minimumDisplayTime?: number; // Minimum time to show loading screen in ms
}

/**
 * App loading screen component that displays during initial app load.
 * Shows the Skull and Bone Turnaround Lottie animation.
 *
 * IMPORTANT: This component renders directly (no portal) to ensure
 * server and client render the same HTML, preventing hydration mismatch.
 * The loading screen appears immediately because it's rendered in the
 * server HTML before hydration completes.
 */
export function AppLoadingScreen({ minimumDisplayTime = 1500 }: AppLoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Track client-side mount to only render Lottie after hydration
  // Using startTransition to satisfy lint rules
  useEffect(() => {
    startTransition(() => {
      setIsMounted(true);
    });
  }, []);

  useEffect(() => {
    // Wait for both minimum display time and window load
    const startTime = Date.now();

    const handleLoad = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumDisplayTime - elapsed);

      setTimeout(() => {
        setIsVisible(false);
        // Remove from DOM after fade-out animation
        setTimeout(() => {
          setShouldRender(false);
        }, 300); // Match fade-out duration
      }, remainingTime);
    };

    // Check if window is already loaded
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, [minimumDisplayTime]);

  // After fade-out, don't render anything
  if (!shouldRender) {
    return null;
  }

  // Render directly in the DOM tree (no portal) to prevent hydration mismatch
  // The fixed positioning and high z-index ensures it covers all content
  return (
    <div
      className={`fixed inset-0 z-[999999] flex items-center justify-center bg-background transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-label="Loading application"
      role="status"
    >
      <div className="w-64 h-64 md:w-80 md:h-80">
        {/* Only render Lottie after client mount to prevent hydration mismatch */}
        {/* The container renders on server for immediate visibility */}
        {isMounted ? (
          <DotLottieReact
            src="/Skull_and_Bone_Turnaround.lottie"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          /* Server-side placeholder - same dimensions, loading pulse animation */
          <div className="w-full h-full rounded-full bg-muted/30 animate-pulse" />
        )}
      </div>
    </div>
  );
}
