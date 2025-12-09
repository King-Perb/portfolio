import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import React from "react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, fill, ...props }: React.ComponentPropsWithoutRef<"img"> & { fill?: boolean }) => {
    // Remove fill prop and convert to style for regular img
    const imgProps: React.ComponentPropsWithoutRef<"img"> = { src, alt, ...props };
    if (fill) {
      imgProps.style = { ...imgProps.style, width: "100%", height: "100%", objectFit: "cover" };
    }
    return React.createElement("img", imgProps);
  },
}));

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
