# OpenSpec Integration

OpenSpec is the planning and source-of-truth layer in AgentHarnessKit.

## Responsibilities

- `openspec/specs/` stores stable, accepted repository behavior and conventions.
- `openspec/changes/` stores proposed and in-flight changes that have not yet been folded into stable specs.
- `.codex/pm/` stores issue, task, issue-state, and delivery progress for the work being executed.

OpenSpec does not replace local PM state. Local PM does not replace planning truth.

## When To Use OpenSpec

Use an OpenSpec change when work:

- changes repository behavior
- changes workflow rules or guardrails
- changes planning or execution conventions
- introduces a reusable harness capability that other repositories will inherit

Purely local or transient execution notes can stay in `.codex/pm/` without requiring a new OpenSpec artifact.

## Mapping OpenSpec To Local PM

For substantive work:

1. Create or confirm the GitHub issue.
2. Create or update the local PM task twin under `.codex/pm/tasks/`.
3. Link the task twin to the relevant artifact in `openspec/changes/` or `openspec/specs/`.
4. Use issue-state only for active execution context, not for stable requirements.

In practice, the task twin should reference the OpenSpec path in its context or implementation notes, and the OpenSpec artifact should link back to the GitHub issue and local PM task path.

## Default Decision Rule

- If the question is "what should the repository do?" update OpenSpec.
- If the question is "what is the current issue doing?" update local PM.
- If the question is "what must pass before delivery?" use repository scripts and hooks.
