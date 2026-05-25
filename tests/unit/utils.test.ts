import { describe, it, expect } from "vitest";
import { cn, generateId, slugify, formatRelativeTime, clamp, toPercent } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("merges tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles undefined/null inputs", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });
});

describe("generateId", () => {
  it("returns a string", () => {
    expect(typeof generateId()).toBe("string");
  });

  it("returns unique values", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it("has reasonable length", () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(5);
    expect(id.length).toBeLessThan(20);
  });
});

describe("slugify", () => {
  it("converts to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("GPT-4o Eval!")).toBe("gpt-4o-eval");
  });

  it("handles multiple spaces", () => {
    expect(slugify("some   long   title")).toBe("some-long-title");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });
});

describe("clamp", () => {
  it("clamps to min", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it("clamps to max", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it("returns value when in range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });
});

describe("toPercent", () => {
  it("calculates percentage", () => {
    expect(toPercent(3, 10)).toBe(30);
  });

  it("handles zero total", () => {
    expect(toPercent(5, 0)).toBe(0);
  });

  it("rounds to integer", () => {
    expect(toPercent(1, 3)).toBe(33);
  });
});

describe("formatRelativeTime", () => {
  it("returns 'just now' for recent times", () => {
    expect(formatRelativeTime(Date.now() - 5000)).toBe("just now");
  });

  it("returns minutes for < 1 hour", () => {
    expect(formatRelativeTime(Date.now() - 5 * 60 * 1000)).toBe("5m ago");
  });

  it("returns hours for < 1 day", () => {
    expect(formatRelativeTime(Date.now() - 3 * 60 * 60 * 1000)).toBe("3h ago");
  });

  it("returns days for < 1 week", () => {
    expect(formatRelativeTime(Date.now() - 2 * 24 * 60 * 60 * 1000)).toBe("2d ago");
  });
});
