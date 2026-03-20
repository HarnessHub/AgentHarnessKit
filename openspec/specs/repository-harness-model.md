# Repository Harness Model

This spec defines the stable operating model for AgentHarnessKit.

## Layers

- OpenSpec is the planning and source-of-truth layer.
- Local PM under `.codex/pm/` is the execution-state layer.
- Repository scripts and hooks are the enforceable local workflow contract.
- Superpowers is an optional execution accelerator.

## Rules

- Every substantive work item should map to a GitHub issue and a local PM task twin.
- Issue-scoped delivery should keep one issue per branch and one issue per PR.
- Behavior-changing repository work should link to an OpenSpec change or spec artifact.
- Agents should prefer repository-local scripts over hidden prompt-only process.

## Cross-Agent Compatibility

- `AGENTS.md` is the shared instruction source.
- `CLAUDE.md` should defer to `AGENTS.md` rather than fork behavior.
- Codex and Claude should use the same repository-local planning, PM, review, and preflight artifacts.
