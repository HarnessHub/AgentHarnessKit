---
type: task
epic: private-overlay-support
slug: support-safe-private-local-overlays-for-openprecedent-style-integrations
title: Support safe private local overlays for OpenPrecedent-style integrations
status: done
task_type: docs
issue: 1
state_path: .codex/pm/issue-state/1-support-safe-private-local-overlays-for-openprecedent-style-integrations.md
---

## Context

Make the repository-local `.agents.local.md` overlay safe to use for private OpenPrecedent-style integrations without turning the repository into a public dependency surface for that tooling.

## Deliverable

Support safe private local overlays for OpenPrecedent-style integrations.

## Scope

- ignore `.agents.local.md`
- clarify that local overlays stay private to the clone
- validate local harness scripts still pass

## Acceptance Criteria

- `.agents.local.md` is ignored by Git
- shared repository guidance keeps local overlays private
- local harness validation still passes after the overlay support changes

## Validation

- `openprecedent --home "$HOME/.openprecedent/runtime" --format json lineage brief --query-reason initial_planning --task-summary "AgentHarnessKit issue #1: support safe private local overlays for OpenPrecedent-style integrations"`
- `npm run preflight`

## Implementation Notes

- Keep OpenPrecedent-specific usage in the local-only overlay, not in tracked repository rules.
