# Domain pack — computer science, ML/AI & engineering

## Sources & databases
- **arXiv** (cs.*), **DBLP**, **ACL Anthology**, **IEEE Xplore**, **ACM Digital
  Library**, **Semantic Scholar**, **OpenReview** (peer reviews are public).
- Venues carry weight: top conferences (**NeurIPS, ICML, ICLR, ACL, CVPR, OSDI,
  SIGCOMM, POPL**, …) are the field's peer-reviewed record — often more than
  journals. Check acceptance vs. workshop/non-archival tracks.

## Field specifics
- **arXiv is preprint-first.** Flag "not peer-reviewed" unless a peer-reviewed
  (conference/journal) version exists; prefer the published version and note the
  venue.
- Value **reproducibility artifacts**: code, datasets, model cards, and
  **artifact-evaluation / reproducibility badges**. A result without runnable
  code or a benchmark others can reproduce is weaker.
- For empirical ML claims: check **baselines, ablations, seeds/variance,
  compute**, dataset contamination/leakage, and whether the benchmark actually
  measures the claimed capability. Beware **SOTA-chasing** on a single metric.

## Red flags specific to the field
- **Benchmark hacking / overfitting to the test set**, cherry-picked baselines,
  no error bars, non-reproducible "SOTA", undisclosed hyperparameter tuning.
- Vendor/marketing "research" and product blogs presented as evidence (treat as
  `OBJECT-OF-STUDY`); demo-driven claims without evaluation.
- Citation of a withdrawn/updated arXiv version; benchmark leaderboards without
  peer review.

## Consensus & framing
Fewer formal "consensus bodies"; rely on **surveys/systematic reviews**,
reproduced results across independent groups, and standards bodies (**IETF, W3C,
ISO/IEC, NIST**) where relevant. State that a claim is "an active research area"
when reproduction is thin.
