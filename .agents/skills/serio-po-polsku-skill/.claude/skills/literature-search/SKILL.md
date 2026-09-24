---
name: literature-search
description: Search scholarly databases for peer-reviewed literature. Use when you need to find papers, studies, meta-analyses, or reviews on a topic; when gathering sources for a review; or when a claim needs to be grounded in the primary literature. Queries OpenAlex, PubMed/Europe PMC, arXiv, bioRxiv, Semantic Scholar and Crossref via MCP, or falls back to scholarly-restricted web search.
---

# literature-search — find the primary literature

Retrieve **scholarly** sources only. Marketing, blogs, and SEO content are out
of scope here (see `source-credibility` for screening). Full source map in
`references/database-guide.md`.

## How to search

1. **Prefer the MCP servers** configured in `.mcp.json`:
   - `paper-search` → arXiv, PubMed, bioRxiv/medRxiv, Europe PMC, Semantic
     Scholar, Crossref, OpenAlex.
   - `openalex` → works search, citation graph, concepts, trends.
   If the tools are not available in this session, say so and fall back.
2. **Fallback: `WebSearch` restricted to scholarly domains.** Pass the
   allow-list from `references/database-guide.md` as `allowed_domains`. Resolve
   every promising hit to a **DOI** or stable repository record before using it.
3. **Build the query** from the concept/synonym clusters produced by
   `research-question`:
   - Boolean logic (`AND`/`OR`), quoted phrases, field tags, and date filters.
   - Run several query variants; don't stop at the first page of one query.
4. **Map the field first.** Find a recent **systematic review or meta-analysis**
   to anchor terminology and the current state of evidence, then drill into
   primary studies.
5. **Citation chase.** Follow references backward (foundational work) and
   citations forward (newer, possibly superseding work) via OpenAlex / Semantic
   Scholar.
6. **Deduplicate** by DOI/title across databases.

## Record for reproducibility (PRISMA-ready)

Keep a search log:

```
Database | Query string | Date run | # hits | # kept after screen
```

Track the counts (identified → deduplicated → screened → included) so
`evidence-synthesis` can build a PRISMA flow.

## For each candidate, capture

`authors · year · title · venue · DOI/arXiv ID · type (review/RCT/…) ·
open-access? · one-line finding`. Hand these to `source-credibility` for
screening and `citation-verification` before anything is cited.

## Guardrails

- Prefer recent evidence but include landmark work; note dates.
- Flag preprints explicitly (not yet peer-reviewed).
- If the literature is thin or absent, report that honestly rather than padding
  with non-scholarly sources.
