---
type: issue_state
issue: 4
task: .codex/pm/tasks/harness-migration/pm-core.md
title: Migrate reusable PM and issue-state core
status: done
delivery_stage: ready_to_deliver
---

## Summary

Port the reusable subset of the local PM and issue-state workflow into AgentHarnessKit.

## Validated Facts

- GitHub issue `#4` tracks the PM core migration
- OpenSpec change `openspec/changes/harness-migration-foundation.md` is the planning artifact for this migration slice
- PM core behavior is covered by `test/codex-pm.test.ts`

## Open Questions

- Should future PM task scaffolding grow a first-class planning reference field?

## Next Steps

- no further implementation work is pending in this local task slice
- deliver from a matching issue branch if the migration is later split into issue-specific PRs

## Artifacts

- `scripts/codex-pm.mjs`
- `test/codex-pm.test.ts`
- `.codex/pm/tasks/harness-migration/pm-core.md`
