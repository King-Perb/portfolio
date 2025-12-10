import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StackCard } from "../stack-card";

describe("StackCard", () => {
  it("renders language name", () => {
    render(<StackCard language="TypeScript" bytes={1000} totalBytes={5000} index={0} />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("calculates and displays percentage correctly", () => {
    render(<StackCard language="JavaScript" bytes={2000} totalBytes={10000} index={0} />);
    expect(screen.getByText("20.0%")).toBeInTheDocument();
  });

  it("displays bytes in KB format", () => {
    render(<StackCard language="Python" bytes={2048} totalBytes={10000} index={0} />);
    expect(screen.getByText("2.0 KB")).toBeInTheDocument();
  });

  it("handles zero totalBytes without crashing", () => {
    render(<StackCard language="Rust" bytes={1000} totalBytes={0} index={0} />);
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("applies correct color based on index", () => {
    const { container } = render(
      <StackCard language="Go" bytes={1000} totalBytes={5000} index={2} />
    );
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toBeInTheDocument();
    // Color values may be normalized (0.70 -> 0.7), so check for partial match
    expect(progressBar?.getAttribute("style")).toMatch(/oklch\(0\.7.*0\.12.*145\)/);
  });

  it("uses last color for index beyond color array", () => {
    const { container } = render(
      <StackCard language="C++" bytes={1000} totalBytes={5000} index={10} />
    );
    const progressBar = container.querySelector('[style*="width"]');
    // Color values may be normalized (0.90 -> 0.9), so check for partial match
    expect(progressBar?.getAttribute("style")).toMatch(/oklch\(0\.9.*0\.1.*145\)/);
  });
});

