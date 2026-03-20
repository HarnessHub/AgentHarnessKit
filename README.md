# AgentHarnessKit

AgentHarnessKit is a reusable repository harness scaffold for AI-assisted software development.

It is designed for projects that want strong local workflow guardrails from day one without binding the repository to a single agent or a product-specific runtime.

## Goals

- support both Codex and Claude in one repository
- keep planning, task state, and delivery checks repository-local
- provide local review, preflight, and branch-hygiene guardrails
- use OpenSpec as the planning and source-of-truth layer
- leave room for Superpowers as an execution accelerator instead of a repository authority

## Harness Layers

- `openspec/` holds planning artifacts
- `.codex/pm/` holds issue-backed local task twins and issue-state
- `scripts/` and `.githooks/` enforce repeatable local workflow rules
- `superpowers/` is reserved for optional execution-layer notes and wrappers

Each substantive work item should map to a GitHub issue and a local PM task twin. When issue-scoped delivery is active, keep one issue per branch and one issue per PR.

## Current Capabilities

- local PM workflow in `scripts/codex-pm.mjs`
- issue-state tracking under `.codex/pm/issue-state/`
- review checkpoint generation and validation
- pre-push guardrails for review artifacts, branch freshness, and merged-branch reuse
- unified preflight with environment-driven build, test, smoke, issue-state, and delivery-state checks
- repository rules for OpenSpec planning and Superpowers boundaries

## Recommended Workflow

1. Create or confirm the GitHub issue for the work.
2. Create or update the local PM task twin under `.codex/pm/tasks/`.
3. If the work changes repository behavior or conventions, add or update the relevant OpenSpec change under `openspec/changes/`.
4. Use `issue-state-init` for active issue work that is in progress.
5. Run `npm run review:checkpoint` and then complete the review note.
6. Run `npm run preflight` before delivery.

## Commands

```bash
npm run build
npm test
npm run smoke
npm run preflight
npm run review:checkpoint
npm run pm -- init
```

## Documentation Map

- [AGENTS.md](./AGENTS.md): canonical shared agent instructions
- [docs/migration-plan.md](./docs/migration-plan.md): migration sequence and non-goals
- [docs/openspec-integration.md](./docs/openspec-integration.md): planning model and OpenSpec rules
- [docs/superpowers-integration.md](./docs/superpowers-integration.md): execution-layer boundaries for Superpowers
