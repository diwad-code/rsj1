# researchbyskills — operating rules for research in this repository

This repository is a **research workbench**. When Claude Code runs here, the
job is to produce answers, reviews, and reports that are grounded in the
**current scientific consensus** and in **peer-reviewed, scholarly literature**
— never in marketing, SEO, or sponsored content.

The skills in `.claude/skills/` implement the workflow. Claude loads them
automatically when a task matches, or you can invoke one directly with
`/skill-name`. The rules below apply to **every** research task, whether or not
a skill was explicitly invoked.

## Non-negotiable rules

1. **Sources must be scholarly.** Prefer, in this order: systematic reviews and
   meta-analyses → randomized/controlled primary studies → observational
   studies → authoritative bodies (WHO, IPCC, national academies, Cochrane) →
   textbooks. See `references/evidence-hierarchy.md`.
2. **Reject non-scholarly sources for factual claims.** Do not base conclusions
   on sponsored articles, press releases, vendor blogs, content marketing,
   op-eds, social media, or SEO listicles. They may be cited only as *objects
   of study* (e.g. "the vendor claims X"), never as evidence that X is true.
   See `references/predatory-and-sponsored-sources.md`.
3. **Report the consensus, and flag when there isn't one.** Distinguish
   settled science from active debate and from fringe/minority positions. State
   the strength of evidence, not just the conclusion. See
   `references/scientific-consensus` skill.
4. **Never fabricate a citation.** Every DOI, title, author, year, and quote
   must correspond to a real, retrievable source. If you cannot verify it, say
   so and do not cite it. See the `citation-verification` skill.
5. **A citation must actually support the claim it is attached to.** Verify the
   source says what you claim it says — check the specific finding, not just the
   title.
6. **Prefer recent evidence, but respect landmark work.** Note publication
   dates; flag when a field has moved on from an older result, and when a claim
   rests on evidence that has failed to replicate.
7. **Show your search.** When doing a review, record the databases queried, the
   query strings, dates, and inclusion/exclusion criteria so the work is
   reproducible. See `references/database-guide.md` and
   `references/reproducible-search.md`.
8. **Separate evidence from interpretation.** Attribute every factual statement
   to a source; keep your own synthesis clearly marked as synthesis.
9. **Appraise quality, don't just count studies.** Rate risk of bias and the
   certainty of evidence (GRADE) and let those ratings drive your wording. See
   `references/critical-appraisal-tools.md` and `references/statistics-red-flags.md`.
10. **Apply the field's standards.** Pick the matching pack in
    `references/domains/` (medicine, climate, CS, social sciences) and layer its
    databases, appraisal tools, and red flags on top of these rules.

## Data access

Live access to scholarly databases is configured in `.mcp.json`
(OpenAlex, arXiv, PubMed, bioRxiv, Semantic Scholar, Crossref, Europe PMC via
`paper-search-mcp` and `openalex-mcp-server`). If those MCP servers are not
running, fall back to `WebSearch` **restricted to scholarly domains** (see the
`literature-search` skill) and always resolve findings to a DOI or a stable
repository record.

## Subagents (multi-agent research)

For broad tasks, fan out and stress-test the work with the subagents in
`.claude/agents/`:
- `literature-scout` — spawn several in parallel (one per sub-question or
  database) to gather screened candidates fast.
- `skeptic` — spawn after a draft exists to attack it, hunt disconfirming
  evidence, and flag overreach and citation-claim mismatches.
The orchestrator (`research` skill) keeps verification, consensus-weighting, and
the final write-up. Reproducibility formats (search log, PRISMA diagram,
retraction check, citation audit, BibTeX) are in
`references/reproducible-search.md`.

## Outputs

Write research outputs to `research/`. Every report ends with a **References**
section in a consistent style (default: APA 7th; see
`references/citation-standards.md`) and, for reviews, a short **Methods** note.
