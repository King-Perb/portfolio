"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface FluidLoadingAnimationProps {
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
}

/**
 * Fluid loading animation Lottie component.
 * Can be reused across different parts of the application.
 */
export function FluidLoadingAnimation({
  className,
  style,
  width = "200px",
  height = "200px",
}: FluidLoadingAnimationProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        pointerEvents: "none",
        ...style,
      }}
    >
      <DotLottieReact
        // src="/Fluid_Loading_Animation.lottie"
        src="/Skull_and_Bone_Turnaround.lottie"
        loop
        autoplay
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
