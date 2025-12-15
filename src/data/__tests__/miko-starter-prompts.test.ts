import { describe, it, expect } from "vitest";
import { MIKO_STARTER_PROMPTS } from "../miko-starter-prompts";

describe("MIKO_STARTER_PROMPTS", () => {
  it("has unique IDs for all prompts", () => {
    const ids = MIKO_STARTER_PROMPTS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("contains at least three prompts", () => {
    expect(MIKO_STARTER_PROMPTS.length).toBeGreaterThanOrEqual(3);
  });

  it("contains experience and projects categories", () => {
    const categories = new Set(MIKO_STARTER_PROMPTS.map((p) => p.category));
    expect(categories.has("experience")).toBe(true);
    expect(categories.has("projects")).toBe(true);
  });
});


