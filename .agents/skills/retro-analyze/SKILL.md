---
name: retro-analyze
description: "Retrospective analysis. Derives root cause, lessons, and rule changes from observations. Invoked by game-retrospective agent. Uses 5 Whys and fishbone analysis."
---

# Retrospective Analysis

Derive meaning from observations — why it happened,
what to learn, what to change.

## When Invoked

By the game-retrospective agent after retro-observe completes.
Requires retro-observe output as input.

## What You Produce

### 1. Root Cause / Contributing Factors
Why it happened. Use structured analysis:

**5 Whys Technique:**
1. Why did [problem] happen? → Because [A]
2. Why did [A] happen? → Because [B]
3. Why did [B] happen? → Because [C]
4. Why did [C] happen? → Because [D]
5. Why did [D] happen? → Because [root cause]

**Important distinctions:**
- Separate the ROOT CAUSE from SYMPTOMS
- Identify CONTRIBUTING FACTORS (not just the trigger)
- A root cause is something that, if fixed, prevents recurrence

### 2. Lesson Learned
What principle emerged. Frame as:
> "When [condition], [consequence] because [mechanism]"

Examples:
- "When game loops use setTimeout, timing drift occurs because setTimeout is not synchronized with display refresh"
- "When quiz options exceed 3 for ages 6-7, completion rates drop because working memory is overloaded"

**Generalize from the specific:** Don't just say "fix this bug."
Identify the CLASS of bug and the PATTERN that causes it.

### 3. Rule or Pattern Change
What should change in future behavior. Must be:
- **Specific:** "Always do X before Y" not "be more careful"
- **Actionable:** Can be followed as a concrete instruction
- **Verifiable:** Can check if someone followed it or not

## Process

1. Read retro-observe output (REQUIRED — do not skip)
2. Apply root cause analysis: start from observation, ask "why" iteratively
3. Separate contributing factors from the root cause
4. Extract a generalizable lesson (not specific to this one instance)
5. Propose a concrete, actionable rule or pattern change

## Output Format

```
=== ANALYSIS REPORT ===

## Root Cause Analysis
[5 Whys chain or fishbone summary]

**Root cause:** [The fundamental reason]
**Contributing factors:** [Additional factors]

## Lesson Learned
"When [condition], [consequence] because [mechanism]"

## Proposed Rule Change
[Specific, actionable, verifiable rule]

=== END ANALYSIS ===
```
