---
type: task
epic: harness-migration
slug: review-guardrails
title: Harden review checkpoints and pre-push guardrails
status: done
task_type: implementation
labels: review,guardrails
issue: 5
---

## Context

Port the reusable review checkpoint and pre-push guardrails into AgentHarnessKit.

## Deliverable

Port the reusable review checkpoint and pre-push guardrails into AgentHarnessKit.

## Scope

- strengthen scripts/run-codex-review-checkpoint.sh
- strengthen .githooks/pre-push
- check for missing .codex-review and .codex-review-proof
- validate review/proof against the current HEAD
- block stale branches and merged-branch reuse
- add minimal verification coverage where practical

## Acceptance Criteria

- missing review artifacts are blocked before push
- stale review proof is blocked before push
- stale branches and merged-branch reuse are blocked

## Validation

- npm test -- --run test/harness-guardrails.test.ts

## Implementation Notes

Planning source: `openspec/changes/harness-migration-foundation.md`
