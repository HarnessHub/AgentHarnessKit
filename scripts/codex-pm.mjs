#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const PM_ROOT = path.join(".codex", "pm");

function initPm() {
  for (const name of ["prds", "epics", "tasks", "issue-state", "updates", "context"]) {
    fs.mkdirSync(path.join(PM_ROOT, name), { recursive: true });
  }
}

function main(argv = process.argv.slice(2), io = console) {
  const [action] = argv;
  if (!action) {
    io.error("Usage: node scripts/codex-pm.mjs <action>");
    return 1;
  }

  if (action === "init") {
    initPm();
    io.log(PM_ROOT);
    return 0;
  }

  io.error(`Action not implemented yet: ${action}`);
  return 1;
}

const exitCode = main();
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  process.exitCode = exitCode;
}
