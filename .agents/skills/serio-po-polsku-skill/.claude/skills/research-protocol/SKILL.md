---
name: research-protocol
description: Pre-register a review protocol before searching, PROSPERO-style, to prevent bias and make the work reproducible. Use when starting a systematic or scoping review, when the user wants a rigorous/registered review, or when a protocol/plan needs to be written before data collection.
---

# research-protocol — decide the rules before you look

Pre-specifying the question, criteria, and analysis before searching is what
separates a systematic review from cherry-picking. Write the protocol first.

## Protocol contents (PROSPERO-aligned)

Produce `research/<slug>-protocol.md` with:

1. **Title & question** — framed with PICO/PECO (from `research-question`).
2. **Background & rationale** — why the review, what gap it fills.
3. **Objectives** — primary and secondary questions.
4. **Eligibility criteria** — populations, interventions/exposures, comparators,
   outcomes, study designs, dates, languages; explicit **exclusions**.
5. **Information sources** — databases and other sources to be searched (pick the
   domain pack from `references/domains/`), plus grey-literature and
   citation-chasing plans.
6. **Search strategy** — the planned query strings per database (to be logged
   exactly when run).
7. **Selection & screening** — how records are screened; how conflicts resolved.
8. **Data extraction** — what fields will be extracted (see `data-extraction`).
9. **Risk-of-bias & certainty** — which tools (RoB 2 / ROBINS-I / … + GRADE) per
   `references/critical-appraisal-tools.md`.
10. **Synthesis plan** — narrative vs. meta-analysis; how heterogeneity and
    subgroups will be handled.
11. **Amendments log** — any deviation from this protocol, dated, with reason.

## Discipline

- Lock criteria **before** screening; record any later change as a dated
  amendment rather than a silent edit.
- Keep the protocol next to the final report so reviewers can check the review
  followed its own plan.
