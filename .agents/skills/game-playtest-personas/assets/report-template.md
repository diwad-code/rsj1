# Panel Playtest Report — [Game / Build]

Use this structure at AGGREGATE to merge the 20 (or subset) per-persona reports into one decision-useful
document. Lead with conclusions; the point is to tell the team what to DO. `scripts/aggregate_feedback.py`
produces the raw numbers for the tables below; you add the interpretation.

---

## 0. Health warning (keep this — do not delete)
These are **model-generated hypotheses** from synthetic personas about how players like them would react.
They are a cheap early supplement to real playtesting, **not a measurement and not a substitute**. Synthetic
personas homogenize and inherit biases; confidence is capped by input fidelity ([build/video/…]) and by the
fact that no real players were observed. **Validate the high-impact findings with relevant real players before any
high-stakes, hard-to-reverse decision.**

## 1. Executive summary
- **What we tested:** [artifact + fidelity] against the question: *[primary question]*.
- **Panel:** [N personas — which ones].
- **Headline verdict:** [2–3 sentences — the single most important thing the team should know].
- **Top 3 things to fix:** [ranked, one line each].
- **Top thing that's working:** [what to protect].

## 2. Persona-relative scores and behaviors
| Persona | First impression | Keep playing | Quit trigger fired? | One-line verdict |
|---|---|---|---|---|
| … | x/10 | x/10 | yes/no — what | … |

*Read each score only with that persona's evidence. Do not calculate a panel mean or require score spread.*

## 2.1 Gate / Milestone evaluation (if gate questions were set)
- **Synthetic status:** `PASS SYNTHETIC` | `FAIL SYNTHETIC` | `INVALID SYNTHETIC`
- This status is not a human milestone result. PASS requires every question to meet its own pass and coverage targets.
- Populate counts and coverage only from saved, valid isolated reports. If none exist, write `NOT EVALUATED`; never estimate `N/N` from one narrative review.
| # | Gate Question | Pass / Target | Coverage / Target | Key Risk / Missing Evidence |
|---|---|---|---|---|
| Q1 | X% / Y% | X% / 100% | … |
| Q2 | X% / Y% | X% / 100% | … |

## 3. Repeated hypothesis leads
For each: what, how many independent reports raised it, artifact evidence, severity, and proposed next check.
Repeated model outputs are not statistical user consensus. The script groups free-text locations only as a
lead; verify every group against the underlying reports and artifact.
1. **[Finding]** — hit by N/[panel] personas · severity: [blocker/major/minor] · confidence: [H/M/L]
   - *Evidence:* [who said what].
   - *Recommended action:* [concrete].

## 4. Divergent hypotheses
Where explicit persona constraints led to different interpretations. Treat this as a segmentation question
for real-player validation, not proof of audience behavior.
- **[Feature/decision]:** loved by [segment — e.g. hardcore: Marcus, Robert, Kenji], bounced off by
  [segment — e.g. newcomers: Zoe, Barbara, George]. *Implication:* [is this the intended audience trade-off,
  or an unintended loss?].

## 5. Bug leads to reproduce
| Bug | Reported by | Confidence | Severity (real-player impact) | Repro notes |
|---|---|---|---|---|
| … | Viktor, Sam | confirmed/likely/possible/guess | … | … |
*Reproduce every item in the artifact. An imagined session may not use `confirmed`.*

## 6. Monetization read (if relevant)
- **Spend intent:** [who would pay, when, how much].
- **Fairness flags:** [what felt manipulative / pay-to-win / ad-heavy — from Lucia, Ahmed, Grace, Nadia].
- **Risk:** [backlash vs. revenue — the tension between the spender and the purist].

## 7. Accessibility lead sweep
- **Potential barriers:** [artifact evidence and affected interaction].
- **Uncovered needs:** [hearing, color vision, screen reader, photosensitivity, vestibular, cognitive, motor, other].
- **Required validation:** [disabled participants, assistive technology, platform checklist, specialist review].

## 8. Prioritized recommendations
Ranked by (impact × personas affected × confidence).
| # | Recommendation | Impact | Personas affected | Confidence | Effort (team to fill) |
|---|---|---|---|---|---|
| 1 | … | high | 11/20 | medium | ? |

## 9. What this panel could NOT tell you (blind spots & gaps)
- Aggregate of persona `blind_spots`: [what no one on this panel was positioned to judge].
- Fidelity limits: [what an imagined/low-fi session couldn't assess].
- **Recommended real-player validation:** [the specific 2–3 things most worth putting in front of humans next].

## 10. Appendix
- Per-persona full reports: [links to reports/pNN-*.json / .md].
- Session brief: [link].
- Calibration data used: [source, or "none — confidence lowered accordingly"].
