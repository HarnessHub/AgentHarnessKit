# Superpowers Integration

Superpowers is an execution accelerator in AgentHarnessKit, not a repository authority.

## What Fits Well

- brainstorming before implementation
- writing concrete execution plans
- systematic debugging
- explicit verification before completion
- review-before-completion habits

## What Does Not Belong In Superpowers

- repository policy that must be enforced every time
- source-of-truth planning decisions
- issue ownership or delivery-state tracking
- single-agent-only prompt behavior that other agents cannot see

Those responsibilities belong in `AGENTS.md`, `openspec/`, `.codex/pm/`, `scripts/`, and `.githooks/`.

## Conflict Resolution

If guidance conflicts, use this order:

1. repository-local scripts and hooks
2. `AGENTS.md` and repository documentation
3. OpenSpec planning artifacts
4. local PM execution state
5. Superpowers workflow suggestions

Superpowers may speed up execution, but it must not instruct agents to skip issue tracking, review checkpoints, preflight, or OpenSpec updates that the repository expects.

## Minimal Integration Structure

Use `superpowers/` for repository-local notes, wrappers, or examples that help agents discover recommended workflows.

Do not hide mandatory behavior there. Mandatory behavior belongs in tracked repository files that every agent will read or execute.
