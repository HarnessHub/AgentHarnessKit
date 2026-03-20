---
type: issue_state
issue: 1
task: .codex/pm/tasks/private-overlay-support/support-safe-private-local-overlays-for-openprecedent-style-integrations.md
title: Support safe private local overlays for OpenPrecedent-style integrations
status: done
delivery_stage: pr_opened
branch: issue-1-private-local-overlays
pr: https://github.com/HarnessHub/AgentHarnessKit/pull/2
---

## Summary

Keep the shared repository surface generic while allowing the current local clone to load OpenPrecedent privately through `.agents.local.md`.

## Validated Facts

- `.agents.local.md` remains local-only and ignored by Git
- shared repository guidance does not make OpenPrecedent a tracked dependency

## Open Questions

- none

## Next Steps

- none

## Artifacts

- `.agents.local.md`
- `AGENTS.md`
