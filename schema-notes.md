# Personality JSON Schema Notes

This folder does not enforce one global JSON schema yet, but personality files should follow a consistent contract so prompts, visuals, and downstream tooling do not drift.

## Purpose

Use JSON personality files for reusable agent identities that are meant to be loaded at session start and sustained across a conversation.

Use companion markdown files when the same persona also needs:
- a direct system-prompt form
- an execution-mode prompt
- an image-generation or visual-direction prompt

## Recommended JSON Shapes

There are currently two acceptable patterns in this folder:

### 1. Single-agent role definition

Use for one named agent or one task-specific role.

Recommended fields:
- `name` or `agentName`
- `role`
- `model` when model targeting matters
- `persona` or `personalityModel`
- `specialties` or `specializations`
- `operatingRules` or equivalent constraints

### 2. Multi-agent collection

Use when several related agents share a common design language but have distinct specialties.

Recommended top-level fields:
- `collection`
- `shared_style` or equivalent collection-wide defaults
- `agents`

Each agent object should ideally include:
- `agentName`
- `model`
- `role`
- `specializations`
- `personalityModel`
- `visualSchema`
- `constraint_set`

## Preferred Field Semantics

### `agentName`
Human-facing name for the agent.

### `model`
Optional target model or model family.

### `role`
Short description of the agent's core operating lane.

### `specializations`
Flat list of domains the agent is expected to handle well.

### `personalityModel`
Behavior contract for how the agent should think and communicate.

Recommended nested fields:
- `tone`
- `mindset`
- `initiative`
- `ambiguityTolerance`

### `visualSchema`
Only use this when the personality includes a visual or design language.

Recommended nested areas:
- `palette`
- `ui`
- `motion`
- `overlays`

### `constraint_set`
Hard negative rules. Keep these short and explicit.

## Naming Guidance

- Prefer `agentName` for newer structured personality files.
- Prefer `specializations` over mixed alternatives when creating new files.
- Keep enum-like values human-readable unless machine enforcement already exists.
- Avoid inline comments in JSON. JSON files in this folder should parse cleanly with `jq`.

## Companion File Expectations

If a JSON personality file has companion markdown docs, keep the three layers aligned:

1. JSON personality data
2. system-prompt markdown
3. execution-prompt or image-prompt markdown

If one changes materially, update the others in the same pass.

## Minimum Validation

Before treating a personality file as complete:
- ensure the JSON parses with `jq empty`
- confirm agent names and roles match companion markdown
- confirm any visual-language references are consistent across files
- confirm README indexing is updated for new artifacts

## Non-Goals

This folder is not yet a formal machine-validated schema registry.

Do not over-engineer this into a strict spec unless multiple tools start consuming these files programmatically.
