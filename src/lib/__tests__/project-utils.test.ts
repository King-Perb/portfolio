import { describe, it, expect } from "vitest";
import { getProjectClickUrl, getProjectImageUrl } from "../project-utils";
import type { Project } from "@/types";

describe("project-utils", () => {
  describe("getProjectClickUrl", () => {
    it("returns clickUrl when provided", () => {
      const project: Project = {
        title: "Test Project",
        description: "Test",
        tags: [],
        stars: 0,
        forks: 0,
        status: "Active",
        statusColor: "green",
        clickUrl: "https://custom-url.com",
        liveUrl: "https://live-url.com",
        githubUrl: "https://github.com/user/repo",
        source: "manual",
      };

      expect(getProjectClickUrl(project)).toBe("https://custom-url.com");
    });

    it("returns liveUrl when clickUrl is not provided", () => {
      const project: Project = {
        title: "Test Project",
        description: "Test",
        tags: [],
        stars: 0,
        forks: 0,
        status: "Active",
        statusColor: "green",
        liveUrl: "https://live-url.com",
        githubUrl: "https://github.com/user/repo",
        source: "manual",
      };

      expect(getProjectClickUrl(project)).toBe("https://live-url.com");
    });

    it("returns githubUrl when clickUrl and liveUrl are not provided", () => {
      const project: Project = {
        title: "Test Project",
        description: "Test",
        tags: [],
        stars: 0,
        forks: 0,
        status: "Active",
        statusColor: "green",
        githubUrl: "https://github.com/user/repo",
        source: "manual",
      };

      expect(getProjectClickUrl(project)).toBe("https://github.com/user/repo");
    });

    it("returns undefined when no URLs are provided", () => {
      const project: Project = {
        title: "Test Project",
        description: "Test",
        tags: [],
        stars: 0,
        forks: 0,
        status: "Active",
        statusColor: "green",
        source: "manual",
      };

      expect(getProjectClickUrl(project)).toBeUndefined();
    });

    it("prioritizes clickUrl over liveUrl and githubUrl", () => {
      const project: Project = {
        title: "Test Project",
        description: "Test",
        tags: [],
        stars: 0,
        forks: 0,
        status: "Active",
        statusColor: "green",
        clickUrl: "https://priority-url.com",
        liveUrl: "https://live-url.com",
        githubUrl: "https://github.com/user/repo",
        source: "manual",
      };

      const url = getProjectClickUrl(project);
      expect(url).toBe("https://priority-url.com");
      expect(url).not.toBe("https://live-url.com");
      expect(url).not.toBe("https://github.com/user/repo");
    });
  });

  describe("getProjectImageUrl", () => {
    it("returns featuredImage when provided", () => {
      const project: Project = {
        title: "Test Project",
        description: "Test",
        tags: [],
        stars: 0,
        forks: 0,
        status: "Active",
        statusColor: "green",
        featuredImage: "https://featured-image.com/image.jpg",
        screenshot: "https://screenshot.com/screenshot.jpg",
        source: "manual",
      };

      expect(getProjectImageUrl(project)).toBe("https://featured-image.com/image.jpg");
    });

    it("returns screenshot when featuredImage is not provided", () => {
      const project: Project = {
        title: "Test Project",
        description: "Test",
        tags: [],
        stars: 0,
        forks: 0,
        status: "Active",
        statusColor: "green",
        screenshot: "https://screenshot.com/screenshot.jpg",
        source: "manual",
      };

      expect(getProjectImageUrl(project)).toBe("https://screenshot.com/screenshot.jpg");
    });

    it("returns undefined when no images are provided", () => {
      const project: Project = {
        title: "Test Project",
        description: "Test",
        tags: [],
        stars: 0,
        forks: 0,
        status: "Active",
        statusColor: "green",
        source: "manual",
      };

      expect(getProjectImageUrl(project)).toBeUndefined();
    });

    it("prioritizes featuredImage over screenshot", () => {
      const project: Project = {
        title: "Test Project",
        description: "Test",
        tags: [],
        stars: 0,
        forks: 0,
        status: "Active",
        statusColor: "green",
        featuredImage: "https://featured-image.com/image.jpg",
        screenshot: "https://screenshot.com/screenshot.jpg",
        source: "manual",
      };

      const url = getProjectImageUrl(project);
      expect(url).toBe("https://featured-image.com/image.jpg");
      expect(url).not.toBe("https://screenshot.com/screenshot.jpg");
    });
  });
});
