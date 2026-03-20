# AgentHarnessKit

AgentHarnessKit is a reusable repository scaffold for AI-assisted software development.

It is intended to become the shared starter for new projects that need a stronger harness from day one, without binding the repository to a single coding agent or a single product domain.

## Goals

- support both Codex and Claude in one repository
- provide local guardrails for review, preflight, and branch hygiene
- keep repository-local task and issue state
- integrate spec-driven development through `openspec/`
- leave room to layer in external skills systems such as Superpowers

## Current Bootstrap Scope

This initial scaffold includes:

- HarnessHub-aligned repository config files
- shared `AGENTS.md` and `CLAUDE.md`
- local PM workspace folders under `.codex/pm/`
- hook and script entrypoints for future guardrail migration
- an `openspec/` root for spec-driven planning

## Next Migration Areas

- PM and issue-state workflow
- review checkpoint and pre-push guardrails
- unified preflight
- OpenSpec integration
- Superpowers integration
- Claude and Codex adapter setup
