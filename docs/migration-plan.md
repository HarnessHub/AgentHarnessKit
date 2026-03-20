# AgentHarnessKit Migration Plan

This document lists the recommended migration order for turning AgentHarnessKit from a scaffold into a strong reusable harness.

## Principles

- Migrate reusable workflow capability, not product-specific behavior.
- Keep Codex and Claude on shared repository state.
- Treat OpenSpec as the planning source of truth.
- Treat Superpowers as an execution accelerator, not the repository authority.
- Do not copy runtime or product-domain assumptions from source repositories.

## What To Migrate

### From existing Codex-developed repositories

- shared `AGENTS.md` instruction patterns
- repository-local PM workspace shape under `.codex/pm/`
- task and issue-state lifecycle conventions
- review checkpoint flow
- pre-push guardrails
- branch freshness and merged-branch protections
- unified preflight entrypoint
- local PR closure sync checks
- test and smoke verification conventions

### From OpenSpec

- stable `openspec/specs/` and `openspec/changes/` structure
- spec proposal and apply workflow
- change-oriented planning and archival discipline

### From Superpowers

- brainstorming workflow
- writing-plans workflow
- execution and verification discipline
- systematic debugging
- review-before-completion behavior

## Recommended Order

### Phase 1. Stabilize the repository core

Goal: make the scaffold itself safe to use before adding advanced workflow logic.

Tasks:

- keep baseline config aligned with HarnessHub
- keep build, test, and smoke entrypoints working
- keep `.githooks/` and script entrypoints stable
- define repository naming and scope boundaries in `AGENTS.md`

Exit criteria:

- `npm run build` passes
- `npm test` passes
- `npm run smoke` passes

### Phase 2. Migrate the PM and issue-state core

Goal: establish a reusable task system before moving guardrails on top of it.

Tasks:

- port the reusable subset of `codex-pm`
- support `init`, `task-new`, `set-status`, `issue-state-init`, `issue-state-check`
- keep product vocabulary out of task templates
- define neutral task types such as `implementation`, `docs`, `ops`, `research`, `umbrella`

Exit criteria:

- a repository can create and update task twins locally
- issue-scoped work has a durable local state file

### Phase 3. Migrate review checkpoint and pre-push guardrails

Goal: block predictable workflow drift before code leaves the machine.

Tasks:

- harden `run-codex-review-checkpoint.sh`
- port review note validation
- port proof validation against current `HEAD`
- port branch freshness checks
- port merged-branch reuse blocking
- port local PR closure sync checks when `gh` data is available

Exit criteria:

- pushing without review artifacts is blocked
- stale branches are blocked
- already-merged branches are blocked

### Phase 4. Migrate unified preflight

Goal: create one reliable local command that agents run before delivery.

Tasks:

- port build and test orchestration
- add optional smoke hooks
- add optional issue-state enforcement
- add optional delivery-state enforcement
- keep command overrides environment-driven

Exit criteria:

- `npm run preflight` is the single expected local validation command
- failures are specific and actionable

### Phase 5. Establish OpenSpec as planning truth

Goal: stop planning from fragmenting across prompts, notes, and issue comments.

Tasks:

- initialize OpenSpec in `openspec/`
- define where stable specs live and where active changes live
- map local PM tasks to OpenSpec changes
- decide when a task requires a spec, a change, or only a local task twin

Exit criteria:

- new feature work starts from an OpenSpec change or spec update
- implementation tasks link back to OpenSpec artifacts

### Phase 6. Add Claude and Codex adapter layers

Goal: let both agents use the same harness without splitting conventions.

Tasks:

- keep `AGENTS.md` canonical
- add Codex-local guidance under `.codex/`
- add Claude-local guidance under `.claude/` when needed
- keep executable behavior in `scripts/`, not in duplicated prompt text

Exit criteria:

- Codex and Claude can both enter the same repo and follow the same lifecycle
- shared state remains repository-local and tool-agnostic

### Phase 7. Integrate selected Superpowers workflows

Goal: improve execution quality without surrendering repository control.

Tasks:

- adopt brainstorming for pre-implementation design refinement
- adopt writing-plans for concrete execution plans
- adopt systematic-debugging and verification-before-completion
- adopt review-request discipline where it fits existing preflight flow
- explicitly define precedence when Superpowers and local harness overlap

Exit criteria:

- Superpowers helps execution but does not replace OpenSpec or local PM state
- there is a documented conflict-resolution rule

### Phase 8. Add CI mirrors of the local contract

Goal: mirror critical local guarantees in GitHub Actions after local rules are stable.

Tasks:

- add build and test workflows
- add a lightweight review or delivery gate
- add a CI helper for triaging failed checks
- avoid shipping CI before the local commands are stable

Exit criteria:

- local and CI expectations are consistent
- failures can be classified quickly

## What Not To Migrate

- HarnessHub packaging logic
- OpenPrecedent decision-lineage logic
- OpenClaw runtime-specific validation flows
- product-specific issue names, PR language, or business constraints

## Short Execution Sequence

If you want the fastest useful path, do the work in this order:

1. PM core
2. review checkpoint
3. pre-push guardrails
4. unified preflight
5. OpenSpec integration
6. Claude and Codex adapters
7. Superpowers integration
8. CI mirroring
