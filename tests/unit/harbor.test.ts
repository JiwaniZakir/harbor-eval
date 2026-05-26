import { describe, it, expect } from "vitest";
import {
  toHarborFormat,
  materializeTaskPack,
  validateTaskPack,
  generateTaskToml,
  parseTaskToml,
} from "@/lib/harbor";

describe("Harbor format adapter", () => {
  it("converts artifacts to HarborTaskPack", () => {
    const artifacts = new Map([
      ["instruction.md", "# Task"],
      ["task.toml", '[task]\nslug = "test"'],
    ]);
    const pack = toHarborFormat(artifacts, {
      projectName: "Test",
      taskSlug: "test-task",
      version: "1.0.0",
      timeoutSeconds: 300,
      maxTokens: 4096,
    });
    expect(pack.slug).toBe("test-task");
    expect(pack.files.size).toBe(2);
    expect(pack.files.get("instruction.md")).toBe("# Task");
  });

  it("normalizes file paths", () => {
    const artifacts = new Map([["/some/path.md", "content"]]);
    const pack = toHarborFormat(artifacts, {
      projectName: "P",
      taskSlug: "s",
      version: "1",
      timeoutSeconds: 60,
      maxTokens: 1024,
    });
    expect(pack.files.has("some/path.md")).toBe(true);
  });
});

describe("Harbor format materializer", () => {
  it("creates manifest.json and prefixed files", () => {
    const pack = toHarborFormat(
      new Map([["instruction.md", "hello"]]),
      {
        projectName: "P",
        taskSlug: "my-task",
        version: "1.0.0",
        timeoutSeconds: 300,
        maxTokens: 4096,
      },
    );
    const materialized = materializeTaskPack(pack);
    expect(materialized.has("my-task/manifest.json")).toBe(true);
    expect(materialized.has("my-task/instruction.md")).toBe(true);

    const manifest = JSON.parse(materialized.get("my-task/manifest.json")!);
    expect(manifest.slug).toBe("my-task");
    expect(manifest.files).toContain("instruction.md");
  });
});

describe("Harbor format validator", () => {
  function makePack(files: Record<string, string>) {
    return toHarborFormat(new Map(Object.entries(files)), {
      projectName: "Test",
      taskSlug: "test",
      version: "1",
      timeoutSeconds: 60,
      maxTokens: 1024,
    });
  }

  it("passes valid pack", () => {
    const result = validateTaskPack(
      makePack({
        "instruction.md": "# Do the thing",
        "task.toml": '[task]\nslug = "test"',
        "Dockerfile": "FROM python:3.11",
        "solve.sh": "#!/usr/bin/env bash\necho done",
        "tests/test_basic.py": "def test_foo(): pass",
      }),
    );
    expect(result.valid).toBe(true);
    expect(result.issues.length).toBe(0);
  });

  it("fails when required files missing", () => {
    const result = validateTaskPack(makePack({ "README.md": "Hi" }));
    expect(result.valid).toBe(false);
    const errorFiles = result.issues
      .filter((i) => i.level === "error")
      .map((i) => i.file);
    expect(errorFiles).toContain("instruction.md");
    expect(errorFiles).toContain("task.toml");
    expect(errorFiles).toContain("Dockerfile");
    expect(errorFiles).toContain("solve.sh");
  });

  it("warns on missing [task] section", () => {
    const result = validateTaskPack(
      makePack({
        "instruction.md": "# Do it",
        "task.toml": 'slug = "test"',
        "Dockerfile": "FROM node",
        "solve.sh": "#!/bin/bash\necho ok",
        "tests/t.py": "pass",
      }),
    );
    expect(
      result.issues.some((i) => i.message.includes("[task]")),
    ).toBe(true);
  });

  it("warns on missing shebang in solve.sh", () => {
    const result = validateTaskPack(
      makePack({
        "instruction.md": "# Do it",
        "task.toml": '[task]\nslug = "test"',
        "Dockerfile": "FROM node",
        "solve.sh": "echo ok",
        "tests/t.py": "pass",
      }),
    );
    expect(
      result.issues.some((i) => i.message.includes("shebang")),
    ).toBe(true);
  });

  it("warns on missing test files", () => {
    const result = validateTaskPack(
      makePack({
        "instruction.md": "# Do it",
        "task.toml": '[task]\nslug = "test"',
        "Dockerfile": "FROM node",
        "solve.sh": "#!/bin/bash\necho ok",
      }),
    );
    expect(
      result.issues.some((i) => i.message.includes("test")),
    ).toBe(true);
  });
});

describe("Task TOML generation", () => {
  it("generates valid TOML with [task] section", () => {
    const toml = generateTaskToml({
      slug: "my-task",
      title: "My Task",
      project: "test-project",
      domain: "instruction_following",
      version: "1.0.0",
      scoringStrategy: "exact_match",
      passThreshold: 0.8,
      timeoutSeconds: 300,
      maxTokens: 4096,
    });
    expect(toml).toContain("[task]");
    expect(toml).toContain('slug = "my-task"');
    expect(toml).toContain('title = "My Task"');
    expect(toml).toContain('domain = "instruction_following"');
  });

  it("round-trips through parse", () => {
    const original = {
      slug: "round-trip",
      title: "Round Trip Test",
      project: "proj",
      domain: "coding",
      version: "2.0.0",
      scoringStrategy: "semantic",
      passThreshold: 0.9,
      timeoutSeconds: 600,
      maxTokens: 8192,
    };
    const toml = generateTaskToml(original);
    const parsed = parseTaskToml(toml);
    expect(parsed.slug).toBe("round-trip");
    expect(parsed.title).toBe("Round Trip Test");
    expect(parsed.domain).toBe("coding");
    expect(parsed.timeoutSeconds).toBe(600);
    expect(parsed.maxTokens).toBe(8192);
  });
});
