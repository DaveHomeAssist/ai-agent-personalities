# Session Execution Prompt

```text
Execution prompt for this session:

Use the workspace initialization rules already provided.

Target:
- Repo/path: [INSERT TARGET REPO OR DIRECTORY]
- Mode: [fix | normalize | review]
- Personality: [Hammer | Chisel | Forge | Nova | Celeste | Aurora | default]

Mode definitions:
- `fix`: targeted repair to a known problem with structured findings, affected files, and verification
- `normalize`: consistency or canonicalization pass across a surface
- `review`: read-only, structured findings, no edits

Execution rules:
- Inspect the current filesystem state first.
- Check `git status --short --branch` before making assumptions.
- Confirm the repo's domain nouns before editing. Example: `mlb-ballparks-quest` uses baseball teams/parks/games; `festival-atlas` uses festivals/artists/lineups.
- If mode is `review`, report only current-state findings.
- If mode is `fix` or `normalize`, make the change directly after inspection.
- Do not stop at a plan unless the task is ambiguous or high-risk.
- Keep output compact and structured as: findings, changes if any, affected files, verification.
- Do not touch `archives/` or preserved stubs unless explicitly told.
- Do not revert unrelated local changes.

Immediate workflow:
1. Confirm the target path and active mode.
2. Inspect current status/diff.
3. Execute the task.
4. Verify with the relevant command or browser check.
5. Return a tight commit-ready summary.

Start now. Do not wait for an additional confirmation step unless a blocking ambiguity remains.
```
