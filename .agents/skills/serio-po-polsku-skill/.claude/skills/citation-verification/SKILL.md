---
name: citation-verification
description: Verify that citations are real and that they support the claims attached to them. Use before finalising any cited output, when compiling a reference list, or whenever a DOI/quote/finding must be confirmed. Prevents fabricated or mismatched citations and resolves DOIs.
---

# citation-verification — no fabricated or mismatched citations

The fastest way to destroy a research output's credibility is one invented or
misattributed citation. Verify before you cite. Rules in
`references/citation-standards.md`.

## Two checks per citation

1. **Existence** — the source is real and retrievable.
   - Resolve the **DOI via Crossref**, or confirm the record in OpenAlex /
     PubMed / arXiv (use the MCP tools). Confirm authors, year, title, and venue
     match the record — do not trust a remembered citation.
   - If it cannot be located in any database, it does **not** get cited. Mark the
     claim `UNVERIFIED — no retrievable source` and remove or caveat it.
2. **Support** — the source actually says what you claim.
   - Check the specific finding, not the title. Identify the passage
     (section/page/figure) that backs the claim. If the source only tangentially
     touches the point, weaken or re-attribute the claim.
   - Never stretch a source beyond what it demonstrates (e.g. correlation cited
     as causation, animal study cited as human effect, single study cited as
     established fact).

## Anti-fabrication rules

- Do not invent DOIs, page numbers, author lists, or quotes.
- Leave unknown fields blank and flag them — never guess to fill a template.
- Verify any **direct quote** verbatim against the source.
- Check **retraction/correction** status; do not cite retracted work as valid
  (cite it only when discussing the retraction itself). Use the concrete
  procedure in `references/reproducible-search.md` §3 (Crossref relations +
  Retraction Watch).

## Citation ↔ claim audit

Before finalising, run the four-point audit in
`references/reproducible-search.md` §4 over every in-text citation: **exists ·
supports · scope · live**. Record any failure as `DROPPED` or `DOWNGRADED` with a
reason rather than leaving a shaky citation in place.

## Output

A clean reference list where every entry is: resolvable, correctly formatted
(APA 7 default), and tied to the specific claim it supports. Report any claims
that had to be dropped or downgraded for lack of a verifiable source.
