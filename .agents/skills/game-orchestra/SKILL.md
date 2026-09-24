---
name: game-orchestra
description: "Main orchestrator for web game development. Use when building, continuing, or improving a web game. Triggers on: 'build a game', 'make a game', 'game development', 'continue my game', 'improve my game'. This skill is the entry point — invoke it first."
---

# Game Orchestra

The main orchestrator workflow for web game development. This is a reference
document — the **game-dev-agent** reads and follows this decision tree.
The agent performs the actions; this skill documents the workflow.

## Entry Point

This skill is the entry point for all game development work. When invoked,
the game-dev-agent reads this document and follows the decision tree below.

## Pre-Flight

Before routing, the game-dev-agent MUST:
1. Read Codex MEM for user context and preferences
2. Read `lessons-learned.md` if it exists in the project
3. Read `progress.md` if it exists in the project
4. Assess project state (files, package.json, existing code)

## Decision Tree

```
No design doc exists       → invoke game-designer skill
Design approved, no code   → invoke game-developer skill
Code exists, untested      → invoke game-qa skill
Tests pass, needs polish   → invoke game-artist skill
Code complete, pre-release → invoke game-reviewer agent
Any checkpoint reached     → invoke game-psychologist agent
Cycle complete / bug fixed → invoke game-retrospective agent
Session ending             → invoke game-retrospective agent
Psychologist FAIL          → invoke game-retrospective agent
```

## Psychologist Checkpoints

The game-psychologist agent is invoked at these validation gates:

1. **Post-design** — validate game concept against learning science
2. **Post-development** — review interaction patterns and accessibility
3. **Post-playtest** — interpret QA results through psychological lens
4. **Ad-hoc** — when new content added, visuals changed, or user reports concern

## Parallel Execution

Use `dispatching-parallel-agents` (existing CC skill) for independent tasks:

- game-designer and game-qa are always **sequential** (design before test)
- game-artist can run **in parallel** with game-qa ONLY when core mechanics
  are stable (artist changes should be CSS/style only to minimize rework)
- Psychologist checkpoint is **sequential** (must complete before next phase)
- Retrospective can run **in background** after cycle completion

### Mandatory Independence Check

Before ANY parallel dispatch, the dispatching agent MUST output:

```
=== INDEPENDENCE CHECK ===
PARALLEL AGENTS: [agent-name-1], [agent-name-2]
AGENT-1 TOUCHES: [list of files/systems agent-1 will modify]
AGENT-2 TOUCHES: [list of files/systems agent-2 will modify]
FILE OVERLAP: [none | list of conflicts]
DATA DEPENDENCY: [none | "agent-2 needs agent-1 output" — describe]
DECISION: [PROCEED | SEQUENTIAL — reason]
=== CHECK COMPLETE ===
```

- If FILE OVERLAP is not `none`, dispatch MUST be sequential
- If DATA DEPENDENCY is not `none`, dispatch MUST be sequential (unless agents can work from shared context — state why)
- Use actual agent names, not placeholders

## Progress Tracking

Only the game-dev-agent writes to `progress.md`. Parallel agents report
results back to the game-dev-agent for recording.

See `templates/` for progress.md format.

## Information Capture & Validation

All dispatched agents MUST follow:
1. Information Capture Protocol (see `references/information-capture.md`)
2. 6x Validation Test (see `references/validation-protocol.md`)
