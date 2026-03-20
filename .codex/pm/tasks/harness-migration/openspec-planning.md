---
type: task
epic: harness-migration
slug: openspec-planning
title: Define OpenSpec as the planning source of truth
status: done
task_type: docs
labels: openspec,docs
issue: 7
---

## Context

Document how OpenSpec and the local PM layer work together inside AgentHarnessKit.

## Deliverable

Document how OpenSpec and the local PM layer work together inside AgentHarnessKit.

## Scope

- define responsibilities of openspec/specs and openspec/changes
- define the relationship between local PM tasks and OpenSpec changes
- update repository documentation and conventions
- add minimal templates or initialization structure only if needed

## Acceptance Criteria

- README and AGENTS describe OpenSpec as planning truth
- openspec/specs and openspec/changes responsibilities are explicit
- local PM and OpenSpec linkage rules are documented

## Validation

- review docs/openspec-integration.md
- review openspec/README.md
- review openspec/specs/repository-harness-model.md

## Implementation Notes

Planning source: `openspec/changes/harness-migration-foundation.md`
