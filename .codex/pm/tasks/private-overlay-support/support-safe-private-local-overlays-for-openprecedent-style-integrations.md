# Support safe private local overlays for OpenPrecedent-style integrations

Date: 2026-03-20

## Summary

Make the repository-local `.agents.local.md` overlay safe to use for private OpenPrecedent-style integrations without turning the repository into a public dependency surface for that tooling.

## Scope

- ignore `.agents.local.md`
- clarify that local overlays stay private to the clone
- validate local harness scripts still pass

## Out of Scope

- repository-tracked OpenPrecedent integration
- public OpenPrecedent instructions in shared docs

## Status

`done`

## Verification

- `openprecedent --home "$HOME/.openprecedent/runtime" --format json lineage brief --query-reason initial_planning --task-summary "AgentHarnessKit issue #1: support safe private local overlays for OpenPrecedent-style integrations"`
- `npm run preflight`
