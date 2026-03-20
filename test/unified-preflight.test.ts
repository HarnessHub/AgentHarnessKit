import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { completeReview, git, initRepo, runShell } from "./harness-test-helpers.js";

const REPO_ROOT = process.cwd();

let tmpDir: string;
let originalCwd: string;
let originalPath: string | undefined;

beforeEach(() => {
  originalCwd = process.cwd();
  originalPath = process.env.PATH;
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-harness-kit-preflight-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  process.env.PATH = originalPath;
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("unified preflight", () => {
  it("passes with env-driven build, test, smoke, and issue-state enforcement", () => {
    initRepo(REPO_ROOT, tmpDir);
    git(tmpDir, "checkout", "-b", "issue-4-pm-core");

    expect(runShell(tmpDir, "node scripts/codex-pm.mjs init").status).toBe(0);
    expect(runShell(tmpDir, [
      "node scripts/codex-pm.mjs task-new harness-migration pm-core",
      "--title \"Migrate reusable PM and issue-state core\"",
      "--issue 4",
      "--status in_progress",
    ].join(" ")).status).toBe(0);
    expect(runShell(tmpDir, "node scripts/codex-pm.mjs issue-state-init .codex/pm/tasks/harness-migration/pm-core.md").status).toBe(0);

    completeReview(tmpDir);

    const result = runShell(tmpDir, "./scripts/run-agent-preflight.sh", {
      AGENT_HARNESS_KIT_PREFLIGHT_ACTIVE: "0",
      AGENT_HARNESS_KIT_PREFLIGHT_BASE_REF: "main",
      AGENT_HARNESS_KIT_PREFLIGHT_BUILD_COMMAND: "printf 'build-ok\\n'",
      AGENT_HARNESS_KIT_PREFLIGHT_TEST_COMMAND: "printf 'test-ok\\n'",
      AGENT_HARNESS_KIT_PREFLIGHT_RUN_SMOKE: "1",
      AGENT_HARNESS_KIT_PREFLIGHT_SMOKE_COMMAND: "printf 'smoke-ok\\n'",
      AGENT_HARNESS_KIT_PREFLIGHT_ENFORCE_ISSUE_STATE: "1",
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Issue state check passed");
    expect(result.stdout).toContain("build-ok");
    expect(result.stdout).toContain("test-ok");
    expect(result.stdout).toContain("smoke-ok");
    expect(result.stdout).toContain("Agent preflight passed.");
  });

  it("fails when delivery-state checks are enabled and the issue has no PR", () => {
    initRepo(REPO_ROOT, tmpDir);
    git(tmpDir, "checkout", "-b", "issue-4-pm-core");

    expect(runShell(tmpDir, "node scripts/codex-pm.mjs init").status).toBe(0);
    expect(runShell(tmpDir, [
      "node scripts/codex-pm.mjs task-new harness-migration pm-core",
      "--title \"Migrate reusable PM and issue-state core\"",
      "--issue 4",
    ].join(" ")).status).toBe(0);
    expect(runShell(tmpDir, "node scripts/codex-pm.mjs issue-state-init .codex/pm/tasks/harness-migration/pm-core.md").status).toBe(0);
    expect(runShell(tmpDir, "node scripts/codex-pm.mjs set-status .codex/pm/tasks/harness-migration/pm-core.md done").status).toBe(0);

    completeReview(tmpDir);

    const result = runShell(tmpDir, "./scripts/run-agent-preflight.sh", {
      AGENT_HARNESS_KIT_PREFLIGHT_ACTIVE: "0",
      AGENT_HARNESS_KIT_PREFLIGHT_BASE_REF: "main",
      AGENT_HARNESS_KIT_PREFLIGHT_BUILD_COMMAND: "printf 'build-ok\\n'",
      AGENT_HARNESS_KIT_PREFLIGHT_TEST_COMMAND: "printf 'test-ok\\n'",
      AGENT_HARNESS_KIT_PREFLIGHT_CHECK_DELIVERY_STATE: "1",
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("done but still has no open PR");
  });
});
