# AGENTS.md

This file provides shared instructions to AI coding agents working in this repository.

If a local-only `.agents.local.md` file exists in the repository root, agents should apply it as a private overlay for the current clone. Shared repository rules in this file still take precedence.

## What is AgentHarnessKit?

AgentHarnessKit is a reusable repository harness scaffold for AI-assisted development.

Its purpose is to give new projects a strong starting point for:

- shared agent instructions
- repository-local task and issue state
- local review and preflight guardrails
- spec-driven planning
- cross-agent compatibility for Codex, Claude, and similar tools

This repository should stay infrastructure-focused. Do not mix product-specific business logic into the harness core.

## Commands

```bash
npm run build              # compile TypeScript
npm test                   # run all tests
npm run preflight          # build + tests + local harness checks
npm run smoke              # scaffold smoke validation
npm run review:checkpoint  # create/update .codex-review + proof
npm run pm -- init         # initialize local PM workspace
npm run test:watch         # run tests in watch mode
```

## Repository Areas

```text
src/                 — reusable source modules for the scaffold
test/                — repository tests
scripts/             — local harness scripts and command entrypoints
.codex/pm/           — repository-local task, issue-state, and updates workspace
.githooks/           — local git guardrails
docs/                — runbooks and migration notes
openspec/            — spec-driven planning and change tracking
```

## Conventions

- Keep the harness model-agnostic. Codex and Claude should share repository state instead of forking process.
- Prefer repository-local scripts over tool-specific prompt instructions for behavior that must be repeatable.
- Keep one issue per branch and one issue per PR when issue-scoped delivery is enabled.
- Use `npm run review:checkpoint` before push when local review guardrails are active.
- Use `npm run preflight` before push for substantial changes.
- Treat repeated workflow mistakes as harness gaps that should be fixed in the scaffold.
- Avoid product-domain language in core harness files.
