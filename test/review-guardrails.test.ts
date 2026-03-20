import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { completeReview, createFakeGh, git, initRepo, runShell } from "./harness-test-helpers.js";

const REPO_ROOT = process.cwd();

let tmpDir: string;
let originalCwd: string;
let originalPath: string | undefined;

beforeEach(() => {
  originalCwd = process.cwd();
  originalPath = process.env.PATH;
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-harness-kit-guardrails-"));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  process.env.PATH = originalPath;
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("review checkpoint and guardrails", () => {
  it("creates and refreshes review checkpoint artifacts", () => {
    initRepo(REPO_ROOT, tmpDir);

    let result = runShell(tmpDir, "./scripts/run-codex-review-checkpoint.sh");
    expect(result.status).toBe(0);

    const firstHead = git(tmpDir, "rev-parse", "HEAD");
    expect(fs.readFileSync(path.join(tmpDir, ".codex-review"), "utf8")).toContain(`head reviewed: ${firstHead}`);
    expect(fs.readFileSync(path.join(tmpDir, ".codex-review-proof"), "utf8")).toContain(`head_sha=${firstHead}`);

    const reviewPath = path.join(tmpDir, ".codex-review");
    const editedReview = fs.readFileSync(reviewPath, "utf8")
      .replace("remaining risks: native /review has not been run yet", "remaining risks: low")
      .replace("findings: no findings", "findings: no findings");
    fs.writeFileSync(reviewPath, editedReview, "utf8");

    fs.writeFileSync(path.join(tmpDir, "README.md"), "base\nnext\n", "utf8");
    git(tmpDir, "add", "README.md");
    git(tmpDir, "commit", "-m", "next");

    result = runShell(tmpDir, "./scripts/run-codex-review-checkpoint.sh");
    expect(result.status).toBe(0);

    const secondHead = git(tmpDir, "rev-parse", "HEAD");
    const refreshedReview = fs.readFileSync(reviewPath, "utf8");
    expect(refreshedReview).toContain(`head reviewed: ${secondHead}`);
    expect(refreshedReview).toContain("remaining risks: low");
    expect(fs.readFileSync(path.join(tmpDir, ".codex-review-proof"), "utf8")).toContain(`head_sha=${secondHead}`);
  });

  it("blocks pushes when review artifacts are missing", () => {
    initRepo(REPO_ROOT, tmpDir);

    const result = runShell(tmpDir, "./.githooks/pre-push", {
      AGENT_HARNESS_KIT_BASE_REF: "main",
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Push blocked: missing .codex-review");
  });

  it("blocks pushes when review proof is stale for the current HEAD", () => {
    initRepo(REPO_ROOT, tmpDir);
    completeReview(tmpDir);

    fs.writeFileSync(path.join(tmpDir, "README.md"), "base\nnext\n", "utf8");
    git(tmpDir, "add", "README.md");
    git(tmpDir, "commit", "-m", "next");

    const result = runShell(tmpDir, "./.githooks/pre-push", {
      AGENT_HARNESS_KIT_BASE_REF: "main",
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(".codex-review-proof does not match the current HEAD");
  });

  it("blocks pushes when the branch is behind the base ref", () => {
    initRepo(REPO_ROOT, tmpDir);
    git(tmpDir, "checkout", "-b", "issue-5-review-guardrails");
    git(tmpDir, "checkout", "main");
    fs.writeFileSync(path.join(tmpDir, "README.md"), "base\nmain update\n", "utf8");
    git(tmpDir, "add", "README.md");
    git(tmpDir, "commit", "-m", "main update");
    git(tmpDir, "checkout", "issue-5-review-guardrails");

    const result = runShell(tmpDir, "./.githooks/pre-push", {
      AGENT_HARNESS_KIT_BASE_REF: "main",
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("does not contain the latest main");
  });

  it("blocks pushes when a merged PR branch is reused", () => {
    initRepo(REPO_ROOT, tmpDir);
    git(tmpDir, "remote", "add", "origin", "https://github.com/test/AgentHarnessKit.git");
    git(tmpDir, "remote", "add", "upstream", "https://github.com/HarnessHub/AgentHarnessKit.git");
    git(tmpDir, "checkout", "-b", "issue-5-review-guardrails");

    createFakeGh(tmpDir, originalPath, `#!/usr/bin/env bash
set -euo pipefail
if [[ "$1" == "pr" && "$2" == "list" ]]; then
  echo '[{"number":55,"url":"https://github.com/HarnessHub/AgentHarnessKit/pull/55"}]'
  exit 0
fi
if [[ "$1" == "pr" && "$2" == "view" ]]; then
  echo ""
  exit 0
fi
echo "unexpected gh invocation: $*" >&2
exit 1
`);

    const result = runShell(tmpDir, "./.githooks/pre-push", {
      AGENT_HARNESS_KIT_BASE_REF: "main",
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("already has a merged PR");
  });
});
