# researchbyskills — an evidence-only AI research workbench for Claude Code

**Turn [Claude Code](https://docs.anthropic.com/en/docs/claude-code) into a rigorous, evidence-based research assistant.** `researchbyskills` is a ready-to-clone template that makes Claude do literature reviews, fact-checks, and research reports grounded **only in peer-reviewed scholarly sources and the current scientific consensus** — never marketing, SEO listicles, press releases, or vendor blogs. It never fabricates a citation.

![validate](https://github.com/diwad-code/researchbyskills/actions/workflows/validate.yml/badge.svg)

> Keywords: AI research assistant · evidence-based research · peer-reviewed literature review · systematic review · meta-analysis · fact-checking · citation verification · scientific consensus · PRISMA · GRADE · Claude Code skills · scholarly databases (PubMed, OpenAlex, arXiv, Semantic Scholar, Crossref, Europe PMC).

---

## Why this exists

General-purpose AI is fast but unreliable for research: it cites papers that don't exist, leans on whatever ranks well on the open web, and presents a single study as settled science. This workbench fixes that with a disciplined pipeline and hard rules:

- **Scholarly sources only.** Systematic reviews and meta-analyses first, then RCTs, then observational work, then authoritative bodies (WHO, IPCC, Cochrane, national academies).
- **No fabricated citations.** Every DOI is resolved and every claim is checked against what the source *actually* says.
- **Consensus over cherry-picking.** Settled science, active debate, and fringe positions are clearly distinguished — no false balance, no false certainty.
- **Reproducible.** Search logs, PRISMA flow diagrams, risk-of-bias appraisal, and BibTeX export come built in.

The full rule set lives in [`CLAUDE.md`](./CLAUDE.md) and is loaded automatically on every task.

## Quick start

1. Install [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and run it in this folder:
   ```bash
   claude
   ```
2. Ask a research question, for example:
   - "Review the literature on the effect of X on Y."
   - "What does the science say about Z? Is there a consensus?"
   - "Fact-check this claim: …"
   - "Find meta-analyses on …"
3. Claude loads the matching skill automatically, or you can invoke one directly:
   `/research`, `/fact-check`, `/literature-search`, and so on.
4. Finished reports are written to the `research/` directory (start from
   `research/_TEMPLATE-review.md`).

## The research pipeline (skills in `.claude/skills/`)

Claude Code auto-detects these skills. The `research` orchestrator runs the full
pipeline and delegates to the specialised skills:

| Skill | Role |
| --- | --- |
| `/research` | **Orchestrator** — the whole process: frame → protocol → search → vet → verify → extract → appraise → synthesize → report |
| `/research-question` | Scope and frame the question (PICO/PECO, inclusion criteria, domain-pack selection) |
| `/research-protocol` | Pre-register a review protocol before searching (PROSPERO-style) |
| `/literature-search` | Search scholarly databases (OpenAlex, PubMed, arXiv, Semantic Scholar, Crossref, Europe PMC…) |
| `/source-credibility` | Vet sources; filter out sponsored, promotional, and predatory content |
| `/citation-verification` | Confirm every citation exists **and** supports its claim (zero fabrication) + retraction check |
| `/data-extraction` | Extract study data into a source-anchored evidence table |
| `/critical-appraisal` | Risk of bias (RoB 2 / ROBINS-I / AMSTAR-2 …) and certainty of evidence (GRADE) |
| `/scientific-consensus` | Establish the consensus and strength of evidence; guard against false balance |
| `/evidence-synthesis` | Synthesize across sources; systematic reviews (PRISMA) |
| `/research-report` | Assemble the final report with a full, verified bibliography + `.bib` export |
| `/fact-check` | Fast verification of a single claim |

## Multi-agent research (subagents in `.claude/agents/`)

For broad tasks the `research` orchestrator fans out to subagents:

| Agent | Role |
| --- | --- |
| `literature-scout` | Run **in parallel** (one per sub-question / database) to gather screened candidate sources fast, with a search log |
| `skeptic` | A devil's advocate that **attacks the draft** once it exists — hunts disconfirming evidence, overreach, and citation-claim mismatches (the guard against confirmation bias) |

## Convenience & automation

- `.claude/settings.json` — pre-authorises the read-only scholarly MCP tools
  (`paper-search`, `openalex`) for fewer permission prompts, plus a **SessionStart** hook.
- `.claude/hooks/session-start.sh` — on session start, reminds Claude of the
  research rules and checks that `uv`/`npx` are available for the MCP servers.
- `scripts/validate_repo.py` + GitHub Actions CI — validate the repository
  structure (skills, agents, references, templates) on every push and pull request.

## Quality rules

The non-negotiable rules for every task are in [`CLAUDE.md`](./CLAUDE.md). In short:
evidence hierarchy (meta-analyses > single studies), no sponsored/predatory
sources as evidence, zero fabricated citations, explicit separation of consensus
from genuine debate, and reproducible search.

Reference material the skills draw on:
- [`references/evidence-hierarchy.md`](./references/evidence-hierarchy.md) — evidence hierarchy and GRADE-style confidence language
- [`references/predatory-and-sponsored-sources.md`](./references/predatory-and-sponsored-sources.md) — filtering sponsored and predatory content
- [`references/database-guide.md`](./references/database-guide.md) — scholarly databases and domains to search
- [`references/citation-standards.md`](./references/citation-standards.md) — citation standards and anti-fabrication rules
- [`references/reproducible-search.md`](./references/reproducible-search.md) — search log, PRISMA diagram (mermaid), retraction check, citation↔claim audit, BibTeX export
- [`references/critical-appraisal-tools.md`](./references/critical-appraisal-tools.md) — RoB 2, ROBINS-I, AMSTAR-2, GRADE, reporting guidelines (CONSORT/PRISMA/STROBE…)
- [`references/statistics-red-flags.md`](./references/statistics-red-flags.md) — p-hacking, HARKing, publication bias and other warning signs
- [`references/domains/`](./references/domains/) — domain packs: medicine, climate, computer science / AI, social sciences

## Scholarly database access (MCP)

[`.mcp.json`](./.mcp.json) configures Model Context Protocol servers that give
Claude live access to the literature (no API key required):

- **`paper-search`** (`uvx paper-search-mcp`) — arXiv, PubMed, bioRxiv/medRxiv,
  Europe PMC, Semantic Scholar, Crossref, OpenAlex.
- **`openalex`** (`npx @cyanheads/openalex-mcp-server`) — 240M+ works, citation
  graph, trends.

Requirements: [`uv`](https://docs.astral.sh/uv/) (for `uvx`) and Node.js (for
`npx`). On first run, Claude Code asks permission to start the MCP servers. If
you don't install them, the skills fall back to `WebSearch` restricted to
scholarly domains — research still works.

> The email in `.mcp.json` (`OPENALEX_MAILTO`) is only used for the OpenAlex
> "polite pool" (faster rate limits; sent as `mailto=`). Change it or remove it.

## Repository structure

```
researchbyskills/
├── CLAUDE.md                 # research rules for Claude Code (always loaded)
├── .mcp.json                 # MCP servers with scholarly databases
├── README.md
├── .claude/
│   ├── settings.json         # MCP pre-authorisation + SessionStart hook
│   ├── hooks/
│   │   └── session-start.sh  # rules reminder + MCP runtime check
│   ├── agents/               # subagents (multi-agent research)
│   │   ├── literature-scout.md
│   │   └── skeptic.md
│   └── skills/               # skills (research pipeline) — 12 skills
│       ├── research/  research-question/  research-protocol/
│       ├── literature-search/  source-credibility/  citation-verification/
│       ├── data-extraction/  critical-appraisal/  scientific-consensus/
│       └── evidence-synthesis/  research-report/  fact-check/
├── references/               # shared knowledge for the skills (+ domains/)
├── research/                 # finished reports land here (+ templates)
├── scripts/validate_repo.py  # structure validator (no dependencies)
├── .github/workflows/        # CI: validate on every push / PR
└── CONTRIBUTING.md
```

## Contributing

Contributions that strengthen evidence-based, peer-reviewed research are welcome.
See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Run `python3 scripts/validate_repo.py`
before you push; CI runs the same check.

## License & purpose

This repository is a clean, reusable research scaffold meant to serve the
community — a starting point for anyone who wants AI-assisted research they can
actually trust. Clone it, point Claude Code at it, and ask.
