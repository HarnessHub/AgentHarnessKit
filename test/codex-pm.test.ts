import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { main } from "../scripts/codex-pm.mjs";

let tmpDir: string;
let originalCwd: string;
let originalPath: string | undefined;

beforeEach(() => {
  originalCwd = process.cwd();
  originalPath = process.env.PATH;
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-harness-kit-pm-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  process.env.PATH = originalPath;
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function git(cwd: string, ...args: string[]) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return result.stdout.trim();
}

function makeConsole(logs: string[], errors: string[]) {
  return {
    log: (value: string) => logs.push(value),
    error: (value: string) => errors.push(value),
  } as Console;
}

describe("codex-pm", () => {
  it("initializes the PM workspace", () => {
    expect(main(["init"])).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, ".codex", "pm", "tasks"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".codex", "pm", "issue-state"))).toBe(true);
  });

  it("scaffolds tasks and renders issue and PR bodies", () => {
    expect(main(["init"])).toBe(0);

    const issueBodyPath = path.join(tmpDir, "issue-body.md");
    fs.writeFileSync(issueBodyPath, [
      "## Summary",
      "",
      "Migrate the reusable PM core.",
      "",
      "## Why",
      "",
      "The scaffold needs durable local issue state.",
      "",
      "## Scope",
      "",
      "- enhance codex-pm",
      "",
      "## Acceptance Criteria",
      "",
      "- local task twins exist",
      "",
    ].join("\n"), "utf8");

    expect(main([
      "task-new",
      "repository-harness",
      "pm-core",
      "--title",
      "Migrate PM core",
      "--issue",
      "4",
      "--task-type",
      "implementation",
      "--labels",
      "pm,migration",
      "--issue-body-file",
      issueBodyPath,
    ])).toBe(0);

    const taskPath = path.join(tmpDir, ".codex", "pm", "tasks", "repository-harness", "pm-core.md");
    let text = fs.readFileSync(taskPath, "utf8");
    text = text.replace("## Validation\n\n- \n\n", "## Validation\n\n- npm test\n\n");
    text = text.replace("## Implementation Notes\n\n", "## Implementation Notes\n\nKeep the naming neutral.\n\n");
    fs.writeFileSync(taskPath, text, "utf8");

    const issueLogs: string[] = [];
    const issueErrors: string[] = [];
    expect(main(["issue-body", taskPath], makeConsole(issueLogs, issueErrors))).toBe(0);
    expect(issueLogs.join("\n")).toContain("Migrate the reusable PM core.");
    expect(issueLogs.join("\n")).toContain("Task Type");

    const prLogs: string[] = [];
    const prErrors: string[] = [];
    expect(main(["pr-body", taskPath, "--tests", "npm test"], makeConsole(prLogs, prErrors))).toBe(0);
    expect(prLogs.join("\n")).toContain("Closes #4");
    expect(prLogs.join("\n")).toContain("Validation:");
  });

  it("creates and shows issue-state documents", () => {
    expect(main(["init"])).toBe(0);
    expect(main([
      "task-new",
      "repository-harness",
      "pm-core",
      "--title",
      "Migrate PM core",
      "--issue",
      "4",
    ])).toBe(0);

    const taskPath = path.join(tmpDir, ".codex", "pm", "tasks", "repository-harness", "pm-core.md");
    expect(main(["issue-state-init", taskPath])).toBe(0);

    const logs: string[] = [];
    const errors: string[] = [];
    expect(main(["issue-state-show", taskPath], makeConsole(logs, errors))).toBe(0);
    expect(logs.join("\n")).toContain(".codex/pm/issue-state/4-pm-core.md");
    expect(logs.join("\n")).toContain("delivery_stage: backlog");
  });

  it("requires issue-state for in-progress issue work", () => {
    expect(main(["init"])).toBe(0);
    expect(main([
      "task-new",
      "repository-harness",
      "pm-core",
      "--title",
      "Migrate PM core",
      "--issue",
      "4",
    ])).toBe(0);

    const taskPath = path.join(tmpDir, ".codex", "pm", "tasks", "repository-harness", "pm-core.md");
    expect(main(["set-status", taskPath, "in_progress"])).toBe(0);

    const firstLogs: string[] = [];
    const firstErrors: string[] = [];
    expect(main(["issue-state-check", "--branch", "issue-4-pm-core"], makeConsole(firstLogs, firstErrors))).toBe(1);
    expect(firstErrors.join("\n")).toContain("in-progress issue has no state document");

    expect(main(["issue-state-init", taskPath])).toBe(0);

    const secondLogs: string[] = [];
    const secondErrors: string[] = [];
    expect(main(["issue-state-check", "--branch", "issue-4-pm-core"], makeConsole(secondLogs, secondErrors))).toBe(0);
    expect(secondLogs.join("\n")).toContain("Issue state check passed");
  });

  it("syncs linked issue-state status when task status changes", () => {
    expect(main(["init"])).toBe(0);
    expect(main([
      "task-new",
      "repository-harness",
      "pm-core",
      "--title",
      "Migrate PM core",
      "--issue",
      "4",
    ])).toBe(0);

    const taskPath = path.join(tmpDir, ".codex", "pm", "tasks", "repository-harness", "pm-core.md");
    expect(main(["issue-state-init", taskPath])).toBe(0);
    expect(main(["set-status", taskPath, "in_progress"])).toBe(0);
    expect(main(["set-status", taskPath, "done"])).toBe(0);

    const statePath = path.join(tmpDir, ".codex", "pm", "issue-state", "4-pm-core.md");
    const stateText = fs.readFileSync(statePath, "utf8");
    expect(stateText).toContain("status: done");
    expect(stateText).toContain("delivery_stage: ready_to_deliver");
  });

  it("supports delivery-state checks for ready-to-deliver work", () => {
    expect(main(["init"])).toBe(0);
    expect(main([
      "task-new",
      "repository-harness",
      "pm-core",
      "--title",
      "Migrate PM core",
      "--issue",
      "4",
    ])).toBe(0);

    const taskPath = path.join(tmpDir, ".codex", "pm", "tasks", "repository-harness", "pm-core.md");
    expect(main(["issue-state-init", taskPath])).toBe(0);
    expect(main(["set-status", taskPath, "done"])).toBe(0);

    const logs: string[] = [];
    const errors: string[] = [];
    expect(main(["delivery-state-check", "--branch", "issue-4-pm-core"], makeConsole(logs, errors))).toBe(1);
    expect(errors.join("\n")).toContain("done but still has no open PR");

    const allowedLogs: string[] = [];
    const allowedErrors: string[] = [];
    expect(main([
      "delivery-state-check",
      "--branch",
      "issue-4-pm-core",
      "--allow-ready-to-deliver",
    ], makeConsole(allowedLogs, allowedErrors))).toBe(0);
    expect(allowedLogs.join("\n")).toContain("ready_to_deliver");
  });

  it("can detect open PRs during delivery-state checks", () => {
    git(tmpDir, "init", "-b", "main");
    git(tmpDir, "config", "user.name", "Test User");
    git(tmpDir, "config", "user.email", "test@example.com");
    git(tmpDir, "remote", "add", "origin", "https://github.com/test/AgentHarnessKit.git");
    git(tmpDir, "remote", "add", "upstream", "https://github.com/HarnessHub/AgentHarnessKit.git");
    fs.writeFileSync(path.join(tmpDir, "README.md"), "base\n", "utf8");
    git(tmpDir, "add", "README.md");
    git(tmpDir, "commit", "-m", "base");
    git(tmpDir, "checkout", "-b", "issue-4-pm-core");

    expect(main(["init"])).toBe(0);
    expect(main([
      "task-new",
      "repository-harness",
      "pm-core",
      "--title",
      "Migrate PM core",
      "--issue",
      "4",
    ])).toBe(0);

    const taskPath = path.join(tmpDir, ".codex", "pm", "tasks", "repository-harness", "pm-core.md");
    expect(main(["issue-state-init", taskPath])).toBe(0);
    expect(main(["set-status", taskPath, "done"])).toBe(0);

    const binDir = path.join(tmpDir, "bin");
    fs.mkdirSync(binDir);
    fs.writeFileSync(path.join(binDir, "gh"), `#!/usr/bin/env bash
set -euo pipefail
if [[ "$1" == "pr" && "$2" == "list" ]]; then
  echo '[{"url":"https://github.com/HarnessHub/AgentHarnessKit/pull/99"}]'
  exit 0
fi
echo "unexpected gh invocation: $*" >&2
exit 1
`, "utf8");
    fs.chmodSync(path.join(binDir, "gh"), 0o755);
    process.env.PATH = `${binDir}:${originalPath ?? ""}`;

    const logs: string[] = [];
    const errors: string[] = [];
    expect(main(["delivery-state-check"], makeConsole(logs, errors))).toBe(0);
    expect(logs.join("\n")).toContain("already has an open PR");

    const statePath = path.join(tmpDir, ".codex", "pm", "issue-state", "4-pm-core.md");
    const stateText = fs.readFileSync(statePath, "utf8");
    expect(stateText).toContain("delivery_stage: pr_opened");
    expect(stateText).toContain("pr_url: https://github.com/HarnessHub/AgentHarnessKit/pull/99");
  });

  it("verifies PR closure sync against task status", () => {
    expect(main(["init"])).toBe(0);
    expect(main([
      "task-new",
      "repository-harness",
      "pm-core",
      "--title",
      "Migrate PM core",
      "--issue",
      "4",
    ])).toBe(0);

    const taskPath = path.join(tmpDir, ".codex", "pm", "tasks", "repository-harness", "pm-core.md");

    const firstLogs: string[] = [];
    const firstErrors: string[] = [];
    expect(main([
      "verify-pr-closure-sync",
      "--pr-body",
      "Closes #4",
      "--changed-file",
      path.relative(tmpDir, taskPath),
    ], makeConsole(firstLogs, firstErrors))).toBe(1);
    expect(firstErrors.join("\n")).toContain("not marked done");

    expect(main(["set-status", taskPath, "done"])).toBe(0);

    const secondLogs: string[] = [];
    const secondErrors: string[] = [];
    expect(main([
      "verify-pr-closure-sync",
      "--pr-body",
      "Closes #4",
      "--changed-file",
      path.relative(tmpDir, taskPath),
    ], makeConsole(secondLogs, secondErrors))).toBe(0);
    expect(secondLogs.join("\n")).toContain("PR task closure sync passed");
  });
});
