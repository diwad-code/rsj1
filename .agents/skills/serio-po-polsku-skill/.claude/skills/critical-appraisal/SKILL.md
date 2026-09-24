---
name: critical-appraisal
description: Appraise the methodological quality and risk of bias of individual studies and rate the certainty of the overall body of evidence. Use when judging whether a study is trustworthy, building a risk-of-bias table for a review, applying RoB 2 / ROBINS-I / Newcastle-Ottawa / AMSTAR-2, or assigning a GRADE certainty rating. Also screens for statistical red flags.
---

# critical-appraisal — how much to trust each study

Finding a study is not enough; judge how well it was done. Tools and reporting
guidelines are in `references/critical-appraisal-tools.md`; statistical warning
signs in `references/statistics-red-flags.md`.

## Per-study appraisal

1. **Identify the design** (RCT, cohort, case-control, diagnostic, review,
   qualitative, prediction model).
2. **Pick the matching tool** and apply it:
   RCT → **RoB 2** · non-randomised intervention → **ROBINS-I** · observational
   → **Newcastle–Ottawa** · diagnostic → **QUADAS-2** · systematic review →
   **AMSTAR-2 / ROBIS** · prediction model → **PROBAST**.
3. **Screen for statistical red flags** — power, p-hacking, multiple comparisons,
   HARKing, effect sizes vs. p-values, publication bias, replication status.
4. **Check reporting** against the study's guideline (CONSORT/PRISMA/STROBE/…) —
   note material omissions.
5. Record a judgement: **low / some concerns / high** risk of bias, with the
   specific reasons (a table for reviews).

## Body-of-evidence certainty (GRADE)

Per outcome, start from the design and rate **down** for risk of bias,
inconsistency, indirectness, imprecision, and publication bias; **up** for large
effect, dose–response, or confounding that would only reduce the effect. Output
**High / Moderate / Low / Very low** with the reasons.

## Output

A risk-of-bias summary (per study) and a GRADE certainty rating (per outcome)
that feed directly into `evidence-synthesis` and the calibrated language in
`scientific-consensus` / `research-report`. Never let a high-risk-of-bias study
drive a strong conclusion without saying so.
