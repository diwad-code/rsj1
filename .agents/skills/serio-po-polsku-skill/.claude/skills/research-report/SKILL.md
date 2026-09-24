---
name: research-report
description: Assemble the final research deliverable — a grounded answer, briefing, or literature-review document — with calibrated confidence and a verified reference list. Use at the end of a research task to write the output to research/, or whenever the user asks for a written report, review, brief, or summary of the evidence.
---

# research-report — write the deliverable

Produce the final artifact. Everything in it must be traceable to a verified,
scholarly source (see `citation-verification`) and phrased with honest
confidence.

## Where and how

- Write to `research/<slug>-<YYYY-MM-DD>.md` (create `research/` if needed).
- Default citation style **APA 7** (`references/citation-standards.md`); keep one
  style throughout.
- Match length to the ask: a **brief** answers directly in a few paragraphs; a
  **literature review / report** uses the full structure below.

## Structure (scale as needed)

1. **Question & scope** — what was asked; boundaries; date of the review.
2. **Bottom line up front** — the answer and its strength of evidence in 2–4
   sentences.
3. **Findings** — the synthesis from `evidence-synthesis`, organised by theme,
   each claim cited, each conclusion carrying calibrated certainty (high /
   moderate / low).
4. **Consensus & controversy** — what is settled, what is genuinely debated,
   notable dissent and its standing (no false balance).
5. **Limitations & gaps** — quality of the evidence base; what is unknown.
6. **Methods** (for reviews) — databases queried, query strings, dates,
   inclusion/exclusion criteria, and PRISMA counts. Save the machine-readable
   search log (`research/<slug>-searchlog.yaml`) and embed the mermaid PRISMA
   diagram — templates in `references/reproducible-search.md`.
7. **References** — full, verified, consistently formatted list; every entry
   resolvable (DOI/arXiv ID); preprints flagged. Also emit a BibTeX file
   (`research/<slug>.bib`, §5 of the reproducibility pack) for reuse.

## Final quality gate before delivering

- [ ] Every factual claim is attributed to a `EVIDENCE`-tier source.
- [ ] No sponsored/promotional/predatory source used as evidence.
- [ ] Every citation verified to exist **and** to support its claim.
- [ ] Consensus vs. debate represented fairly; certainty language calibrated.
- [ ] Your own interpretation is marked as interpretation, not fact.
- [ ] Dropped/unverifiable claims noted rather than silently included.

Tell the user the file path and give a short summary of the bottom line.
