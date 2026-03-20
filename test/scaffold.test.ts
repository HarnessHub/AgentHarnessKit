import { describe, expect, it } from "vitest";
import { describeScaffold, scaffoldName } from "../src/index.js";

describe("AgentHarnessKit scaffold", () => {
  it("exposes the scaffold identity", () => {
    expect(scaffoldName).toBe("AgentHarnessKit");
    expect(describeScaffold()).toContain("reusable agent-development repository harness");
  });
});
