import { describe, it, expect } from "vitest";
import { sortByLastUpdated, sortByImageThenDate } from "../project-sorters";
import type { Project } from "@/types";

describe("project-sorters", () => {
  const createMockProject = (overrides: Partial<Project> = {}): Project => ({
    title: "Test Project",
    description: "Test description",
    tags: [],
    stars: 0,
    forks: 0,
    status: "Active",
    statusColor: "text-primary border-primary/20 bg-primary/10",
    source: "github",
    ...overrides,
  });

  describe("sortByLastUpdated", () => {
    it("sorts projects by last updated date (most recent first)", () => {
      const projects = [
        createMockProject({ title: "Old", lastUpdated: "2023-01-01T00:00:00Z" }),
        createMockProject({ title: "New", lastUpdated: "2024-01-01T00:00:00Z" }),
        createMockProject({ title: "Middle", lastUpdated: "2023-06-01T00:00:00Z" }),
      ];
      
      const sorted = sortByLastUpdated(projects);
      
      expect(sorted[0].title).toBe("New");
      expect(sorted[1].title).toBe("Middle");
      expect(sorted[2].title).toBe("Old");
    });

    it("handles projects without lastUpdated (treats as 0, sorts to end)", () => {
      const projects = [
        createMockProject({ title: "No Date" }),
        createMockProject({ title: "Recent", lastUpdated: "2024-01-01T00:00:00Z" }),
        createMockProject({ title: "Old", lastUpdated: "2023-01-01T00:00:00Z" }),
      ];
      
      const sorted = sortByLastUpdated(projects);
      
      expect(sorted[0].title).toBe("Recent");
      expect(sorted[1].title).toBe("Old");
      expect(sorted[2].title).toBe("No Date");
    });

    it("returns a new array without mutating the original", () => {
      const projects = [
        createMockProject({ title: "A", lastUpdated: "2023-01-01T00:00:00Z" }),
        createMockProject({ title: "B", lastUpdated: "2024-01-01T00:00:00Z" }),
      ];
      
      const original = [...projects];
      const sorted = sortByLastUpdated(projects);
      
      expect(sorted).not.toBe(projects);
      expect(projects).toEqual(original);
    });

    it("handles empty array", () => {
      const sorted = sortByLastUpdated([]);
      
      expect(sorted).toEqual([]);
    });

    it("handles single project", () => {
      const projects = [createMockProject({ title: "Single", lastUpdated: "2024-01-01T00:00:00Z" })];
      
      const sorted = sortByLastUpdated(projects);
      
      expect(sorted).toHaveLength(1);
      expect(sorted[0].title).toBe("Single");
    });
  });

  describe("sortByImageThenDate", () => {
    it("sorts projects with images before projects without images", () => {
      const projects = [
        createMockProject({ title: "No Image" }),
        createMockProject({ title: "With Image", featuredImage: "/image.jpg" }),
        createMockProject({ title: "No Image 2" }),
        createMockProject({ title: "With Screenshot", screenshot: "/screenshot.jpg" }),
      ];
      
      const sorted = sortByImageThenDate(projects);
      
      // Projects with images should come first
      expect(sorted[0].title).toMatch(/With (Image|Screenshot)/);
      expect(sorted[1].title).toMatch(/With (Image|Screenshot)/);
      expect(sorted[2].title).toMatch(/No Image/);
      expect(sorted[3].title).toMatch(/No Image/);
    });

    it("sorts projects with images by date when both have images", () => {
      const projects = [
        createMockProject({ 
          title: "Old Image", 
          featuredImage: "/old.jpg",
          lastUpdated: "2023-01-01T00:00:00Z",
        }),
        createMockProject({ 
          title: "New Image", 
          featuredImage: "/new.jpg",
          lastUpdated: "2024-01-01T00:00:00Z",
        }),
      ];
      
      const sorted = sortByImageThenDate(projects);
      
      expect(sorted[0].title).toBe("New Image");
      expect(sorted[1].title).toBe("Old Image");
    });

    it("sorts projects without images by date when both lack images", () => {
      const projects = [
        createMockProject({ 
          title: "Old No Image", 
          lastUpdated: "2023-01-01T00:00:00Z",
        }),
        createMockProject({ 
          title: "New No Image", 
          lastUpdated: "2024-01-01T00:00:00Z",
        }),
      ];
      
      const sorted = sortByImageThenDate(projects);
      
      expect(sorted[0].title).toBe("New No Image");
      expect(sorted[1].title).toBe("Old No Image");
    });

    it("treats featuredImage and screenshot as images", () => {
      const projects = [
        createMockProject({ title: "No Image" }),
        createMockProject({ title: "Featured", featuredImage: "/featured.jpg" }),
        createMockProject({ title: "Screenshot", screenshot: "/screenshot.jpg" }),
      ];
      
      const sorted = sortByImageThenDate(projects);
      
      expect(sorted[0].title).toMatch(/(Featured|Screenshot)/);
      expect(sorted[1].title).toMatch(/(Featured|Screenshot)/);
      expect(sorted[2].title).toBe("No Image");
    });

    it("prioritizes featuredImage over screenshot when both exist", () => {
      const projects = [
        createMockProject({ 
          title: "Both Images", 
          featuredImage: "/featured.jpg",
          screenshot: "/screenshot.jpg",
        }),
        createMockProject({ 
          title: "Only Screenshot", 
          screenshot: "/screenshot.jpg",
        }),
      ];
      
      const sorted = sortByImageThenDate(projects);
      
      // Both should be treated as having images, sorted by date
      expect(sorted.length).toBe(2);
      expect(sorted.every(p => p.featuredImage || p.screenshot)).toBe(true);
    });

    it("returns a new array without mutating the original", () => {
      const projects = [
        createMockProject({ title: "A", featuredImage: "/a.jpg" }),
        createMockProject({ title: "B" }),
      ];
      
      const original = [...projects];
      const sorted = sortByImageThenDate(projects);
      
      expect(sorted).not.toBe(projects);
      expect(projects).toEqual(original);
    });

    it("handles empty array", () => {
      const sorted = sortByImageThenDate([]);
      
      expect(sorted).toEqual([]);
    });

    it("handles single project", () => {
      const projects = [createMockProject({ title: "Single", featuredImage: "/single.jpg" })];
      
      const sorted = sortByImageThenDate(projects);
      
      expect(sorted).toHaveLength(1);
      expect(sorted[0].title).toBe("Single");
    });

    it("handles projects with same image status and same date", () => {
      const sameDate = "2024-01-01T00:00:00Z";
      const projects = [
        createMockProject({ title: "A", lastUpdated: sameDate }),
        createMockProject({ title: "B", lastUpdated: sameDate }),
      ];
      
      const sorted = sortByImageThenDate(projects);
      
      // Should maintain relative order when dates are equal
      expect(sorted).toHaveLength(2);
    });
  });
});

