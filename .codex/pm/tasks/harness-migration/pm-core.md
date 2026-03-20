---
type: task
epic: harness-migration
slug: pm-core
title: Migrate reusable PM and issue-state core
status: done
task_type: implementation
labels: pm,migration
issue: 4
state_path: .codex/pm/issue-state/4-pm-core.md
---

## Context

Port the reusable subset of the local PM and issue-state workflow into AgentHarnessKit.

## Deliverable

Port the reusable subset of the local PM and issue-state workflow into AgentHarnessKit.

## Scope

- enhance scripts/codex-pm.mjs
- support init, task-new, set-status, issue-state-init, issue-state-show, issue-state-check
- preserve neutral task vocabulary
- add tests for the migrated behavior

## Acceptance Criteria

- local PM task twins can be created and updated
- issue-state can be initialized, shown, and checked
- status changes keep linked issue-state in sync
- tests cover the migrated PM behavior

## Validation

- npm test -- --run test/codex-pm.test.ts

## Implementation Notes

Planning source: `openspec/changes/harness-migration-foundation.md`
