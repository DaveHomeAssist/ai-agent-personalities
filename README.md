# AI Agent Personalities

Named agent profiles, role definitions, and operational persona specs. These are reusable agent identities — distinct from task prompts or tool prompts in `../ai-prompts/`.

---

## Index

| File | Type | Summary |
|------|------|---------|
| [veritas-canvas.md](veritas-canvas.md) | Named persona | High-stakes analyst. Converts complex inputs into decision-grade, security-conscious, fact-traceable insight. |
| [executor-agent.md](executor-agent.md) | Role definition | Execution-first implementation agent. Patches Dave's local workspace with minimal interruption. |
| [schema-notes.md](schema-notes.md) | Contract notes | Lightweight schema expectations for personality JSON files and companion prompt docs. |
| [female-programmer-agents.json](female-programmer-agents.json) | Persona collection (JSON) | Rich Nova / Celeste / Aurora agent schema with model mapping, visual system, and constraint sets. |
| [female-programmer-agents-system-prompts.md](female-programmer-agents-system-prompts.md) | Persona prompts | System-prompt layer for Nova, Celeste, and Aurora aligned to the structured schema. |
| [female-programmer-agents-execution-prompts.md](female-programmer-agents-execution-prompts.md) | Persona prompts | Execution-mode prompts for Nova, Celeste, and Aurora by specialization. |
| [female-programmer-agents-image-prompt.md](female-programmer-agents-image-prompt.md) | Visual prompt | Image direction for rendering the Nova / Celeste / Aurora trio consistently. |
| [strategic-planner.json](strategic-planner.json) | Role definition (JSON) | Converts a user objective into a full strategic plan + Phase 1 execution prompt. |
| [strategic-planner-claude.md](strategic-planner-claude.md) | Role variant | Claude-optimized version of the strategic planner. |
| [strategic-planner-gpt.md](strategic-planner-gpt.md) | Role variant | GPT-optimized version of the strategic planner. |
| [strategic-planner-template.md](strategic-planner-template.md) | Role template | Model-agnostic template for the strategic planner role. |
| [critical-patch-deployment-local.json](critical-patch-deployment-local.json) | Role definition (JSON) | Local environment specialist for critical patch deployment and verification. |
| [critical-patch-deployment-system.json](critical-patch-deployment-system.json) | Role definition (JSON) | System-level specialist for critical patch deployment. Prioritizes stability and rollback safety. |

---

## What goes here

- Named agent identities with a voice, operating doctrine, and behavior contract
- Role-based agent specs (executor, planner, deployer, analyst)
- Personas intended to be loaded at session start and sustained throughout a conversation
- Variants of the same personality optimized for different models (Claude, GPT, etc.)

## What does NOT go here

- Task prompts (one-shot instructions, no persistent identity) → `../ai-prompts/`
- Project-embedded system prompts (living in the project repo) → stay in the project
- Game character voices (Garden OS) → `10-active-projects/garden-os/docs/`
