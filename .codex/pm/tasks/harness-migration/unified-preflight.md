---
type: task
epic: harness-migration
slug: unified-preflight
title: Introduce a unified local preflight entrypoint
status: done
task_type: implementation
labels: preflight,guardrails
issue: 6
---

## Context

Make preflight the single local validation entrypoint for AgentHarnessKit.

## Deliverable

Make preflight the single local validation entrypoint for AgentHarnessKit.

## Scope

- build and test orchestration
- optional smoke validation
- optional issue-state enforcement
- optional delivery-state checks
- clear output and actionable failures

## Acceptance Criteria

- build and test run through one local preflight entrypoint
- smoke, issue-state, and delivery-state behavior is environment-driven
- failures are specific enough to diagnose locally

## Validation

- npm test -- --run test/harness-guardrails.test.ts

## Implementation Notes

Planning source: `openspec/changes/harness-migration-foundation.md`
