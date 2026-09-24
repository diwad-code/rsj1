---
name: fact-check
description: Verify a specific factual or scientific claim against the peer-reviewed literature and current consensus. Use when the user asks "is this true", "fact-check this", "does the evidence support X", pastes a claim/headline/statistic, or wants a quick evidence check on a single assertion rather than a full review.
---

# fact-check — verify a single claim

A focused path through the pipeline for one claim. Verdict must rest on
scholarly evidence, never on the claim's popularity or on promotional sources.

## Steps

1. **Isolate the claim.** State precisely what is being asserted (and any
   implicit quantifier — "always", "causes", "most"). Note the original source
   if given (and treat that source as `OBJECT-OF-STUDY`, per
   `source-credibility`).
2. **Search** the literature for direct evidence (`literature-search`): prefer
   meta-analyses, systematic reviews, and authoritative bodies.
3. **Screen** the sources (`source-credibility`) and **verify** they say what
   they seem to (`citation-verification`).
4. **Weigh** against the consensus (`scientific-consensus`): does the body of
   high-quality evidence support, partly support, or contradict the claim?
5. **Rate** the claim:
   - **Supported** — consistent high-quality evidence.
   - **Partly supported / oversimplified** — a kernel of truth, but caveats,
     conditions, or overstated magnitude.
   - **Contested** — credible evidence on more than one side.
   - **Not supported / contradicted** — evidence points the other way.
   - **Unverifiable** — no retrievable scholarly evidence either way.

## Output

The verdict with its evidence rating, a 2–4 sentence explanation, the key
verified sources (with DOIs), and any important caveat (population limits,
correlation-not-causation, preprint status, outdated result). Be direct; avoid
false balance and false certainty alike.
