---
name: data-extraction
description: Extract structured data from included studies into a consistent evidence table. Use when compiling the studies for a review, tabulating study characteristics and results, or preparing data for synthesis or meta-analysis. Emphasises verbatim, source-anchored extraction with no invented numbers.
---

# data-extraction — turn papers into a clean evidence table

Consistent, source-anchored extraction is the backbone of a trustworthy review.

## Fields to extract per study

For each included study capture, with the **exact source location** (section /
table / page) for every value:

```
id (author, year) · DOI · country/setting · design · sample size (per arm) ·
population · intervention/exposure · comparator · outcome(s) measured ·
key result (effect size + 95% CI) · follow-up · funding/COI · risk-of-bias · notes
```

## Rules

- **Verbatim first.** Copy numbers exactly as reported; note units and the
  denominator. Do not recompute silently — if you convert (e.g. OR→RR, SD from
  SE), show the conversion and the assumption.
- **No invented data.** If a field isn't reported, mark it `NR` (not reported) —
  never estimate to fill a cell. Missing data is itself a finding.
- **Anchor every cell** to where it came from, so `citation-verification` and the
  `skeptic` can check it.
- Keep **units consistent** across studies before any comparison; flag
  incompatible outcome measures rather than forcing them together.
- Note **direction of effect** clearly (which arm favoured).

## Output

An evidence table (Markdown, or CSV in `research/<slug>-extraction.csv`) ready
for `evidence-synthesis`, plus a short note on studies excluded at full-text and
why (for the PRISMA flow).
