---
name: evidence-synthesis
description: Synthesize multiple sources into a coherent, evidence-weighted narrative or systematic review. Use when integrating findings across studies, writing the body of a literature review, resolving conflicting results, or building a PRISMA-style systematic review with a flow diagram and evidence tables.
---

# evidence-synthesis — integrate the evidence

Turn a screened, verified set of sources into a structured synthesis. Weight by
`references/evidence-hierarchy.md`; keep evidence and interpretation separate.

## Choose the mode

- **Narrative / thematic synthesis** (default for reviews): organise by themes,
  mechanisms, or questions — not one-paragraph-per-paper. Show where studies
  agree, disagree, and why.
- **Systematic review (PRISMA)**: when rigour and reproducibility are required.
  Report the **flow** (identified → deduplicated → screened → eligible →
  included) with counts, an **evidence/characteristics table**, and a
  quality/risk-of-bias appraisal. Use the ready **mermaid PRISMA diagram** and
  **machine-readable search log** in `references/reproducible-search.md`.

## Steps

1. **Group** sources by theme or by PICO element.
2. **Tabulate** key studies: design, sample, key finding, effect size,
   limitations, quality tier.
3. **Reconcile conflicts.** When studies disagree, explain it via study quality,
   population, method, or date — don't just average. Higher-tier and replicated
   evidence dominates.
4. **State the bottom line per theme** with calibrated certainty (see
   `scientific-consensus`).
5. **Surface gaps** — what is unknown, underpowered, or unreplicated.
6. **Attribute everything.** Every empirical statement carries a verified
   citation; your synthesis/inference is explicitly flagged as such.

## Quality of the synthesis

- No cherry-picking: represent the body of evidence, including inconvenient
  results.
- Distinguish correlation from causation; don't over-generalise from narrow
  samples.
- Preprints and single studies are provisional; label them.

## Output

A structured synthesis (themes or PRISMA sections) with an evidence table,
per-theme conclusions and certainty, identified gaps, and citations ready for
`research-report`.
