import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export function git(cwd: string, ...args: string[]) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return result.stdout.trim();
}

export function runShell(cwd: string, command: string, env: NodeJS.ProcessEnv = {}) {
  return spawnSync("bash", ["-lc", command], {
    cwd,
    env: {
      ...process.env,
      ...env,
    },
    encoding: "utf8",
  });
}

export function copyHarnessFiles(repoRoot: string, repoDir: string) {
  for (const relativePath of [
    "scripts/codex-pm.mjs",
    "scripts/run-codex-review-checkpoint.sh",
    "scripts/run-agent-preflight.sh",
    "scripts/run-cli-smoke.sh",
    ".githooks/pre-push",
  ]) {
    const source = path.join(repoRoot, relativePath);
    const target = path.join(repoDir, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
    if (relativePath.endsWith(".sh") || relativePath.endsWith("pre-push") || relativePath.endsWith(".mjs")) {
      fs.chmodSync(target, 0o755);
    }
  }
}

export function initRepo(repoRoot: string, repoDir: string) {
  copyHarnessFiles(repoRoot, repoDir);
  git(repoDir, "init", "-b", "main");
  git(repoDir, "config", "user.name", "Test User");
  git(repoDir, "config", "user.email", "test@example.com");
  fs.writeFileSync(path.join(repoDir, "README.md"), "base\n", "utf8");
  git(repoDir, "add", "README.md");
  git(repoDir, "commit", "-m", "base");
}

export function completeReview(repoDir: string) {
  const checkpoint = runShell(repoDir, "./scripts/run-codex-review-checkpoint.sh");
  if (checkpoint.status !== 0) {
    throw new Error(checkpoint.stderr || checkpoint.stdout);
  }
  const reviewPath = path.join(repoDir, ".codex-review");
  const updated = fs.readFileSync(reviewPath, "utf8")
    .replace("findings: no findings", "findings: no findings")
    .replace("remaining risks: native /review has not been run yet", "remaining risks: low");
  fs.writeFileSync(reviewPath, updated, "utf8");
}

export function createFakeGh(repoDir: string, originalPath: string | undefined, body: string) {
  const binDir = path.join(repoDir, "bin");
  fs.mkdirSync(binDir, { recursive: true });
  fs.writeFileSync(path.join(binDir, "gh"), body, "utf8");
  fs.chmodSync(path.join(binDir, "gh"), 0o755);
  process.env.PATH = `${binDir}:${originalPath ?? ""}`;
}
