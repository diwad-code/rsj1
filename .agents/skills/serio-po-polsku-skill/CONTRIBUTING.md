# Contributing to researchbyskills

This repo is a Claude Code research workbench. Contributions should strengthen
**evidence-based, peer-reviewed research** — never weaken the rules in
`CLAUDE.md`.

## Before you push

Run the structure validator (no dependencies):

```bash
python3 scripts/validate_repo.py
```

CI runs the same check on every push and pull request
(`.github/workflows/validate.yml`).

## Add a skill

1. Create `.claude/skills/<name>/SKILL.md` with YAML frontmatter:
   ```yaml
   ---
   name: <name>
   description: <what it does + when to use it — this is how Claude auto-triggers it>
   ---
   ```
2. Keep the body a focused procedure. Put long reference material in
   `references/` and link to it, so it loads only when needed.
3. Wire it into the `research` orchestrator pipeline if it belongs there.

## Add a subagent

Create `.claude/agents/<name>.md` with `name` + `description` frontmatter
(optionally `tools`, `model`). Subagents gather or critique; the orchestrator
decides.

## Add a domain pack

Create `references/domains/<field>.md` covering: databases, design specifics,
appraisal tools, field-specific red flags, and consensus anchors. Add it to the
table in `references/domains/README.md`.

## Ground rules (non-negotiable)

- Scholarly sources only for factual claims; no sponsored/promotional/predatory
  content as evidence.
- Never fabricate a citation; every DOI must resolve and support its claim.
- Report the consensus and flag genuine debate; no false balance, no false
  certainty.

See `CLAUDE.md` for the full rule set.
