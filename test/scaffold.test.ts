import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { describeScaffold, scaffoldName } from "../src/index.js";

describe("AgentHarnessKit scaffold", () => {
  it("exposes the scaffold identity", () => {
    expect(scaffoldName).toBe("AgentHarnessKit");
    expect(describeScaffold()).toContain("reusable agent-development repository harness");
  });

  it("keeps tracked PM markdown files in structured frontmatter format", () => {
    const roots = [
      path.join(process.cwd(), ".codex", "pm", "tasks"),
      path.join(process.cwd(), ".codex", "pm", "issue-state"),
    ];

    for (const root of roots) {
      for (const entry of fs.readdirSync(root, { recursive: true })) {
        if (typeof entry !== "string" || !entry.endsWith(".md")) {
          continue;
        }
        const filePath = path.join(root, entry);
        const content = fs.readFileSync(filePath, "utf8");
        expect(content.startsWith("---\n"), filePath).toBe(true);
      }
    }
  });
});
