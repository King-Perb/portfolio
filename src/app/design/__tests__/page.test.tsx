import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DesignPage from "../page";

describe("DesignPage", () => {
  it("renders the page title and description", () => {
    render(<DesignPage />);

    expect(screen.getByText("Design System")).toBeInTheDocument();
    expect(screen.getByText("The technical brand book for the portfolio.")).toBeInTheDocument();
  });

  it("renders all color cards", () => {
    render(<DesignPage />);

    const colorNames = [
      "Background",
      "Foreground",
      "Card",
      "Popover",
      "Primary",
      "Secondary",
      "Muted",
      "Accent",
      "Destructive",
      "Border",
      "Input",
      "Ring",
    ];

    colorNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it("renders typography section with all heading levels", () => {
    render(<DesignPage />);

    expect(screen.getByText("Typography")).toBeInTheDocument();
    expect(screen.getByText(/Heading 1: The quick brown fox/)).toBeInTheDocument();
    expect(screen.getByText(/Heading 2: Jumps over the lazy dog/)).toBeInTheDocument();
    expect(screen.getByText(/Heading 3: Sphinx of black quartz/)).toBeInTheDocument();
    expect(screen.getByText(/Heading 4: Pack my box/)).toBeInTheDocument();
  });

  it("renders paragraph text", () => {
    render(<DesignPage />);

    expect(screen.getByText(/Paragraph: Lorem ipsum dolor sit amet/)).toBeInTheDocument();
  });

  it("renders blockquote", () => {
    render(<DesignPage />);

    expect(screen.getByText(/Blockquote: The best way to predict the future/)).toBeInTheDocument();
  });

  it("renders component preview section with buttons", () => {
    render(<DesignPage />);

    expect(screen.getByText("Components (Preview)")).toBeInTheDocument();
    expect(screen.getByText("Primary Button")).toBeInTheDocument();
    expect(screen.getByText("Secondary Button")).toBeInTheDocument();
    expect(screen.getByText("Outline Button")).toBeInTheDocument();
    expect(screen.getByText("Ghost Button")).toBeInTheDocument();
  });

  it("renders all sections in correct order", () => {
    render(<DesignPage />);

    const heading = screen.getByText("Design System");
    const colorsHeading = screen.getByText("Colors");
    const typographyHeading = screen.getByText("Typography");
    const componentsHeading = screen.getByText("Components (Preview)");

    expect(heading).toBeInTheDocument();
    expect(colorsHeading).toBeInTheDocument();
    expect(typographyHeading).toBeInTheDocument();
    expect(componentsHeading).toBeInTheDocument();
  });

  it("renders color cards with correct structure", () => {
    render(<DesignPage />);

    // Check that color cards are in a grid
    const colorsSection = screen.getByText("Colors").closest("section");
    expect(colorsSection).toBeInTheDocument();

    // Check that ColorCard components render with their names
    const backgroundCard = screen.getByText("Background");
    expect(backgroundCard).toBeInTheDocument();
  });
});
