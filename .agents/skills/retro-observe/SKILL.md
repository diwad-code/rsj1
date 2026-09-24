---
name: retro-observe
description: "Retrospective data collection. Gathers observation, impact, and evidence for retrospective analysis. Invoked by game-retrospective agent. Documents facts without interpretation."
---

# Retrospective Observation

Gather factual evidence before analysis begins.
Document what happened — neutrally, without interpretation.

## When Invoked

By the game-retrospective agent as Phase 1 of retrospective analysis.

## What You Collect

### 1. Observation
What was seen. Neutral, factual description:
- What happened?
- What was the sequence of events?
- What was the timeline?
- No analysis, no judgment — just facts

### 2. Impact
Why it mattered. Quantify where possible:
- Time lost or saved
- Users affected
- Quality impact
- Learning outcome affected
- Severity: minor inconvenience → major blocker

### 3. Evidence
Concrete artifacts supporting the observation:
- Console logs and error messages
- Test outputs (pass/fail results)
- `render_game_to_text()` state captures
- Screenshots from Playwright MCP
- Psychologist checkpoint results
- User feedback (direct quotes preferred)

## Process

1. Review the triggering event context (what triggered this retrospective?)
2. Collect all relevant logs and outputs (read files, check test results)
3. Capture screenshots if visual evidence is relevant
4. Interview the user if needed (via AskUserQuestion) for feedback not captured in artifacts
5. Document observations without analysis or judgment
6. Quantify impact where metrics are available
7. Cite evidence sources explicitly (file paths, timestamps)

## Output Format

```
=== OBSERVATION REPORT ===

## Trigger
[What triggered this retrospective]

## Observation
[Neutral factual description of what happened]

## Impact
[Quantified impact — time, quality, users, learning outcomes]

## Evidence
1. [Source]: [Description]
2. [Source]: [Description]
...

=== END OBSERVATION ===
```
