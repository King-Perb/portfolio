import { useState, useEffect } from "react";

/**
 * Hook to detect if the viewport is desktop size (>= 768px)
 * @param breakpoint - Breakpoint in pixels (default: 768)
 * @returns boolean indicating if viewport is desktop size
 */
export function useIsDesktop(breakpoint = 768): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };

    // Set initial value
    checkDesktop();

    // Listen for resize events
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, [breakpoint]);

  return isDesktop;
}
