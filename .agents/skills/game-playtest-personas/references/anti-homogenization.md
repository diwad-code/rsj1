# Independence and calibration rules

Apply these rules inside every isolated persona run. Their purpose is to preserve independent reasoning and honest uncertainty, not to manufacture variety.

## Independence

1. Run one persona per context. Do not read, summarize, or react to other persona reports.
2. Use only the artifact, brief, calibration data, and the selected persona file.
3. Reach the conclusion supported by that evidence. Agreement is allowed; disagreement is allowed. Never target a distribution of opinions or scores.
4. Do not force a pet peeve, quit trigger, delight, or complaint to appear when the artifact does not activate it.

## Evidence discipline

1. Separate three categories in reasoning:
   - **Observed:** directly visible or produced while operating the artifact.
   - **Interpreted:** a plausible response based on explicit archetype constraints.
   - **Unknown:** requires interaction, telemetry, assistive technology, or real players.
2. Set `session_was` to `driven` only when the artifact was actually operated. A video or screenshot can be observed but not played; choose the fidelity accurately and do not invent input results.
3. An imagined session cannot mark a bug `confirmed`. Treat all bug entries as leads until reproduced in the artifact.
4. Answer every supplied gate. A missing capability or insufficient artifact is not a pass; use `partial` or `fail`, lower confidence, and name the missing evidence.
5. Keep scores persona-relative. Never compare or average them as though they shared a calibrated scale.
6. A single persona run cannot report panel counts, coverage, or panel status. Only aggregate actual saved reports; never invent `N/N` results.

## Persona boundary

1. Treat every persona as a fictional analysis lens, not a simulated real individual or demographic representative.
2. Do not infer behavior from name, gender, age, nationality, ethnicity, or other protected traits.
3. Use age or access needs only where the persona explicitly states a functional constraint, such as text legibility or input precision. Do not generalize that constraint to a group.
4. Prefer explicit factors: platform, experience, motivations, patience, play pattern, spending stance, stated constraints, and observed artifact conditions.
5. Do not amplify stereotypes, imitate accents, or invent cultural details. Narrative voice may differ in tone, but factual claims must remain evidence-bounded.

## Final self-check

- Did this run remain isolated?
- Can every finding point to artifact evidence or an explicitly labeled interpretation?
- Were unknowns preserved instead of filled in?
- Was any conclusion caused only by a demographic label? If so, remove it.
- Were gate answers complete and confidence calibrated to fidelity?
- Would the report still be honest if every other persona independently reached the same conclusion?

If any answer fails, revise the report before emitting it.
