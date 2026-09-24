---
name: source-credibility
description: Vet and screen sources for credibility; filter out sponsored, promotional, predatory, and non-scholarly content. Use after finding sources and before citing them — when deciding whether a source counts as evidence, when a link looks like marketing or a press release, or when checking a journal's legitimacy, funding, and conflicts of interest.
---

# source-credibility — keep evidence, reject noise

Only scholarly sources count as evidence for factual claims. Apply the rules in
`references/predatory-and-sponsored-sources.md` to every candidate.

## Screen each source

1. **Purpose test.** Is this reporting findings, or selling/ranking/promoting?
   Reject sponsored content, native ads, press releases, vendor blogs,
   whitepapers, affiliate listicles, op-eds, and social posts as *evidence*.
   They may be kept only as `OBJECT-OF-STUDY`.
2. **Indexing test.** Is the venue indexed in a reputable database (DOAJ,
   Scopus, Web of Science, PubMed/MEDLINE, or the field's standard)? Is the
   publisher a member of COPE/OASPA/WAME? Unindexed + no resolvable DOI ⇒ treat
   as unverified.
3. **Predatory red flags.** Fake metrics, spam solicitation, sham peer review,
   mimic journal names, no DOI. See the checklist in the reference file.
4. **Integrity check.** Read funding and competing-interests statements. Note
   industry funding; look for independent replication. Check the source is not
   **retracted** (Retraction Watch / Crossref).
5. **Recency & supersession.** Has newer work overturned or refined it?

## Assign a disposition

Tag every source with exactly one:

- `EVIDENCE` — scholarly, peer-reviewed (or authoritative body); usable.
- `BACKGROUND` — reputable but for context/framing only (e.g. narrative review).
- `OBJECT-OF-STUDY` — a claim being examined, not evidence it is true.
- `REJECT` — with a one-line reason (sponsored / predatory / retracted / no
  source / off-topic).

## Beware manufactured controversy

A few contrarian, industry-linked, or non-replicated papers do **not** overturn
a consensus supported by the wider literature. Weigh the body of evidence, not
the loudest outlier. Do not create false balance between a well-supported
consensus and a fringe position — but do report genuine, evidence-based debate.

Output: the screened list with dispositions, ready for `citation-verification`
and `scientific-consensus`.
