import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocialLinkComponent } from "../social-link";
import { Github } from "lucide-react";
import type { SocialLink } from "@/lib/constants";

describe("SocialLinkComponent", () => {
  const mockLink: SocialLink = {
    platform: "GitHub",
    url: "https://github.com/test",
    icon: Github,
  };

  it("renders platform name", () => {
    render(<SocialLinkComponent link={mockLink} />);
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("renders link with correct href", () => {
    render(<SocialLinkComponent link={mockLink} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://github.com/test");
  });

  it("opens link in new tab with security attributes", () => {
    render(<SocialLinkComponent link={mockLink} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders icon component", () => {
    const { container } = render(<SocialLinkComponent link={mockLink} />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("handles different platforms", () => {
    const linkedinLink: SocialLink = {
      platform: "LinkedIn",
      url: "https://linkedin.com/in/test",
      icon: Github, // Using same icon for test
    };
    render(<SocialLinkComponent link={linkedinLink} />);
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://linkedin.com/in/test");
  });
});
