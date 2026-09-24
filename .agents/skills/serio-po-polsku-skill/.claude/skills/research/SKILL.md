---
name: research
description: End-to-end evidence-based research orchestrator. Use when the user asks to "research", "investigate", "review the literature", "what does the science say", "is X true", "find studies on", "write a literature review / research report", or wants an answer grounded in peer-reviewed science and current scientific consensus. Runs the full pipeline (frame → search → vet → verify → synthesize → report) and delegates to the specialised research skills.
---

# research — evidence-based research pipeline

You are running a research task in a repository whose rules are in `CLAUDE.md`.
Ground every conclusion in **peer-reviewed literature and current scientific
consensus**. Never rely on sponsored, promotional, or non-scholarly sources for
factual claims.

## Pipeline

Run these stages in order. Each maps to a specialised skill you should invoke or
follow — skip a stage only when the task plainly doesn't need it (say which and
why).

1. **Frame** → `research-question`. Clarify the question, scope, and
   inclusion/exclusion criteria (PICO/PECO). **Pick the domain pack(s)** from
   `references/domains/` that fit the field. Confirm with the user if the
   question is ambiguous or very broad.
2. **Protocol** (systematic/scoping reviews only) → `research-protocol`.
   Pre-register criteria, sources, and analysis before searching, PROSPERO-style.
3. **Search** → `literature-search`. Query scholarly databases (MCP servers in
   `.mcp.json`, else scholarly-restricted web search). Record queries and counts.
4. **Vet** → `source-credibility`. Screen each hit; reject sponsored/predatory
   sources; keep scholarly evidence. Dispositions per
   `references/predatory-and-sponsored-sources.md`.
5. **Verify** → `citation-verification`. Confirm each source is real, resolvable,
   and actually supports the claim attached to it. Never fabricate.
6. **Extract** (reviews) → `data-extraction`. Pull study characteristics and
   results into a source-anchored evidence table (`NR` for anything not reported).
7. **Appraise** → `critical-appraisal`. Risk-of-bias per study (RoB 2 / ROBINS-I
   / …) and a **GRADE** certainty rating per outcome.
8. **Weigh** → `scientific-consensus`. Rank evidence by
   `references/evidence-hierarchy.md`; state the consensus and where there is
   genuine debate.
9. **Synthesize** → `evidence-synthesis`. Integrate findings thematically
   (PRISMA-style for systematic reviews).
10. **Report** → `research-report`. Write the deliverable to `research/` with
    calibrated confidence, PRISMA flow, verified references, and a `.bib` export.

## Parallelism & adversarial review (multi-agent)

For anything broader than a single narrow claim, run the search and the critique
in parallel subagents instead of doing everything inline:

- **Fan out search** → spawn several `literature-scout` subagents at once (via
  the Agent/Task tool), one per sub-question or per database. Each returns a
  screened, deduplicated candidate list with its search log. Merge and dedupe
  their results, then verify centrally (`citation-verification`).
- **Adversarial pass** → once a draft synthesis exists, spawn the `skeptic`
  subagent to attack it: hunt disconfirming evidence, overreach, and
  citation-claim mismatches. Fold its material objections back into the
  synthesis before reporting. This is the guard against confirmation bias.

Keep verification, consensus-weighting, and the final write-up in the
orchestrator (this skill) — scouts gather, the skeptic challenges, you decide.

## Defaults

- Scale the depth to the request: a quick factual question needs stages 2–5
  lightly; a "literature review" or "research report" needs the full pipeline
  and a written artifact.
- Prefer meta-analyses and systematic reviews; treat single studies and
  preprints as provisional.
- Be explicit about **uncertainty and dissent** — do not manufacture false
  balance, but do not hide real scientific disagreement.
- Every factual statement is attributed to a verified source; your own
  synthesis is clearly marked as synthesis.

## Output contract

Finish with: a direct answer, the strength of evidence, key caveats/open
questions, and a **References** section (APA 7 by default, see
`references/citation-standards.md`). For reviews, add a short **Methods** note
(databases, queries, dates, inclusion criteria, counts).
