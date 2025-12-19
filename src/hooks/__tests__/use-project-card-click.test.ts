import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProjectCardClick } from "../use-project-card-click";
import type { Project } from "@/types";
import { mockWindowOpen } from "@/test/mocks/window";

// Mock window.open
const mockWindowOpenFn = mockWindowOpen();

// Mock getProjectClickUrl
vi.mock("@/lib/project-utils", () => ({
  getProjectClickUrl: (project: Project) => {
    return project.clickUrl || project.liveUrl || project.githubUrl;
  },
}));

describe("useProjectCardClick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("returns clickUrl when project has clickUrl", () => {
    const project = createMockProject({
      clickUrl: "https://custom-url.com",
      liveUrl: "https://live-url.com",
      githubUrl: "https://github.com/user/repo",
    });

    const { result } = renderHook(() => useProjectCardClick(project));

    expect(result.current.cardUrl).toBe("https://custom-url.com");
    expect(result.current.isClickable).toBe(true);
  });

  it("returns liveUrl when clickUrl is not set but liveUrl is", () => {
    const project = createMockProject({
      liveUrl: "https://live-url.com",
      githubUrl: "https://github.com/user/repo",
    });

    const { result } = renderHook(() => useProjectCardClick(project));

    expect(result.current.cardUrl).toBe("https://live-url.com");
    expect(result.current.isClickable).toBe(true);
  });

  it("returns githubUrl when only githubUrl is set", () => {
    const project = createMockProject({
      githubUrl: "https://github.com/user/repo",
    });

    const { result } = renderHook(() => useProjectCardClick(project));

    expect(result.current.cardUrl).toBe("https://github.com/user/repo");
    expect(result.current.isClickable).toBe(true);
  });

  it("returns undefined and isClickable false when no URLs are set", () => {
    const project = createMockProject({});

    const { result } = renderHook(() => useProjectCardClick(project));

    expect(result.current.cardUrl).toBeUndefined();
    expect(result.current.isClickable).toBe(false);
  });

  it("opens URL in new window when handleClick is called with valid URL", () => {
    const project = createMockProject({
      clickUrl: "https://example.com",
    });

    const { result } = renderHook(() => useProjectCardClick(project));

    act(() => {
      result.current.handleClick();
    });

    expect(mockWindowOpenFn).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("does not open window when handleClick is called without URL", () => {
    const project = createMockProject({});

    const { result } = renderHook(() => useProjectCardClick(project));

    act(() => {
      result.current.handleClick();
    });

    expect(mockWindowOpenFn).not.toHaveBeenCalled();
  });

  it("calls handleClick when Enter key is pressed", () => {
    const project = createMockProject({
      clickUrl: "https://example.com",
    });

    const { result } = renderHook(() => useProjectCardClick(project));

    const mockEvent = {
      key: "Enter",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockWindowOpenFn).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("calls handleClick when Space key is pressed", () => {
    const project = createMockProject({
      clickUrl: "https://example.com",
    });

    const { result } = renderHook(() => useProjectCardClick(project));

    const mockEvent = {
      key: " ",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockWindowOpenFn).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("does not call handleClick for other keys", () => {
    const project = createMockProject({
      clickUrl: "https://example.com",
    });

    const { result } = renderHook(() => useProjectCardClick(project));

    const mockEvent = {
      key: "Tab",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockWindowOpenFn).not.toHaveBeenCalled();
  });

  it("does not call handleClick when no URL is set", () => {
    const project = createMockProject({});

    const { result } = renderHook(() => useProjectCardClick(project));

    const mockEvent = {
      key: "Enter",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockWindowOpenFn).not.toHaveBeenCalled();
  });
});
