---
name: game-playtest-personas
description: "Use when a game team needs an early, low-cost hypothesis sweep across distinct player archetypes for onboarding, UX friction, difficulty, retention, monetization, accessibility leads, milestone questions, or bug leads before real playtesting. Also use for Polish requests such as audyt gry, symulacja graczy, playtest persony, or testowanie gry."
---

# Game Playtest Personas

Generate model-produced hypotheses from fictional player archetypes. Use them to choose what to inspect or test next, never as measurements of real players.

## Non-negotiable boundary

- Label every result as synthetic and hypothesis-generating.
- Do not claim representativeness, research validity, user evidence, accessibility certification, or prediction of real-player behavior.
- Do not use demographic traits as causes of behavior. Apply only explicit preferences, experience, platform constraints, patience, and stated access needs.
- Do not infer motor feel, accidental taps, emotional stakes, or confirmed bugs from a description. Set `session_was: imagined` unless the artifact was actually operated.
- Require real-player or artifact evidence before high-stakes, irreversible decisions. See [evidence and limitations](references/evidence-and-limitations.md).

## Workflow

1. Copy [the session brief](assets/session-brief-template.md), fill every placeholder, and state the decision, artifact fidelity, exact gate questions, and per-question targets.
2. Select a focused panel from [the persona index](references/persona-index.md).
3. Generate one prompt per persona:

```bash
python scripts/prepare_playtest.py brief.md --panel onboarding --lang Polish --out prompts/
```

4. Run each prompt in a separate context. Do not let a persona read another report.
5. Save exactly one JSON object per persona, following [the output contract](references/output-schema.md).
6. Aggregate only valid reports:

```bash
python scripts/aggregate_feedback.py reports/ --title "Build vX" \
  --expected-personas p01,p03,p04,p08,p12,p20 \
  --gate-question "Q1=Understand the rule in 60s?" --gate-threshold Q1=80 \
  --gate-question "Q2=Complete without mistaps?" --gate-threshold Q2=100
```

7. Read raw persona-relative scores in context. Do not average them. Never invent panel counts or coverage: compute them only from saved, valid isolated reports. With no reports, say the panel gate was not evaluated.
8. Report repeated leads, divergent hypotheses, unanswered gates, blind spots, and the next real-player check. `PASS SYNTHETIC` means only that every configured synthetic threshold and coverage target was met.

## Per-persona run rules

Load only the selected persona file plus:

- [independence and calibration rules](references/anti-homogenization.md)
- [test protocol](references/test-protocol.md)
- [output contract](references/output-schema.md)

Evaluate independently. Do not force agreement, disagreement, score spread, pet-peeve activation, or a particular conclusion. Separate observed facts, plausible interpretations, and unknowns. If the input does not support a gate, answer `fail` or `partial` with low confidence and explain the missing evidence; never invent an interaction.

For accessibility-focused work, pass `--accessibility-review`; this loads [the accessibility boundary](references/accessibility-review.md) for every selected persona. Disabled-player and assistive-technology testing remain required.

## Outputs and failure behavior

`prepare_playtest.py` rejects missing references, unknown personas, and unfilled brief placeholders. `aggregate_feedback.py` rejects malformed reports, unknown persona identities, invalid enums, imagined sessions claiming confirmed bugs, duplicate gate answers, and conflicting question text. Missing answers reduce gate coverage.

Outputs:

- `panel_metrics.json` — raw panel data and per-question gates
- `panel_matrix.csv` — one row per persona
- `panel_summary.md` — hypothesis-focused summary

Use [the report template](assets/report-template.md) for final framing and [the machine schema](references/report.schema.json) for external validation.
