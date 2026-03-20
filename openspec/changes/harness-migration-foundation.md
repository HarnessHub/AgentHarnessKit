# Harness Migration Foundation

This change tracks the current work to evolve AgentHarnessKit from a thin scaffold into a reusable agent-development harness.

## Linked Issues

- `#3` Track reusable harness migration phases in AgentHarnessKit
- `#4` Migrate reusable PM and issue-state core into AgentHarnessKit
- `#5` Harden review checkpoints and pre-push guardrails
- `#6` Introduce a unified local preflight entrypoint
- `#7` Define OpenSpec as the planning source of truth
- `#8` Define Superpowers integration boundaries for AgentHarnessKit

## Linked Local PM Tasks

- `.codex/pm/tasks/harness-migration/migration-tracker.md`
- `.codex/pm/tasks/harness-migration/pm-core.md`
- `.codex/pm/tasks/harness-migration/review-guardrails.md`
- `.codex/pm/tasks/harness-migration/unified-preflight.md`
- `.codex/pm/tasks/harness-migration/openspec-planning.md`
- `.codex/pm/tasks/harness-migration/superpowers-boundaries.md`

## Target Outcome

- reusable local PM and issue-state workflow
- review checkpoint and pre-push guardrails
- unified local preflight
- documented OpenSpec planning model
- documented Superpowers execution boundaries

## Validation

- `npm run build`
- `npm test`
- `npm run smoke`
- `npm run preflight`
