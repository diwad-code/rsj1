#!/usr/bin/env python3
"""Validate the researchbyskills repository structure.

Checks, with no third-party dependencies:
  - every .claude/skills/*/SKILL.md has YAML frontmatter with a `description`,
    and its `name` matches the skill directory
  - every .claude/agents/*.md has frontmatter with `name` and `description`
  - .mcp.json and .claude/settings.json are valid JSON
  - referenced reference files under references/ (incl. domain packs) exist
  - the research/ output templates exist
  - the SessionStart hook is executable

Exit code 0 = OK, 1 = problems found. Run: python3 scripts/validate_repo.py
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
errors: list[str] = []


def frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    fields: dict[str, str] = {}
    for line in text[3:end].splitlines():
        if ":" in line and not line.lstrip().startswith("#"):
            key, _, val = line.partition(":")
            fields[key.strip()] = val.strip()
    return fields


def check_skills() -> None:
    skills = sorted((ROOT / ".claude/skills").glob("*/SKILL.md"))
    if not skills:
        errors.append(".claude/skills/: no SKILL.md files found")
    for sk in skills:
        fm = frontmatter(sk)
        if not fm:
            errors.append(f"{sk.relative_to(ROOT)}: missing YAML frontmatter")
            continue
        if not fm.get("description"):
            errors.append(f"{sk.relative_to(ROOT)}: frontmatter missing `description`")
        desc = fm.get("description", "")
        if len(desc) > 1024:
            errors.append(f"{sk.relative_to(ROOT)}: description over 1024 chars")
        # The `name` frontmatter must match the skill's directory, or the CLI
        # won't resolve `/name` to this skill.
        name = fm.get("name")
        if name and name != sk.parent.name:
            errors.append(
                f"{sk.relative_to(ROOT)}: frontmatter name `{name}` "
                f"!= directory `{sk.parent.name}`"
            )


def check_agents() -> None:
    for ag in sorted((ROOT / ".claude/agents").glob("*.md")):
        fm = frontmatter(ag)
        for key in ("name", "description"):
            if not fm.get(key):
                errors.append(f"{ag.relative_to(ROOT)}: frontmatter missing `{key}`")


def check_json() -> None:
    for rel in (".mcp.json", ".claude/settings.json"):
        p = ROOT / rel
        if not p.exists():
            errors.append(f"{rel}: missing")
            continue
        try:
            json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"{rel}: invalid JSON ({exc})")


def check_references() -> None:
    required = [
        "references/evidence-hierarchy.md",
        "references/predatory-and-sponsored-sources.md",
        "references/database-guide.md",
        "references/citation-standards.md",
        "references/reproducible-search.md",
        "references/critical-appraisal-tools.md",
        "references/statistics-red-flags.md",
        "references/domains/README.md",
        # Domain packs — CLAUDE.md rule 10 requires picking one per task.
        "references/domains/medicine.md",
        "references/domains/climate.md",
        "references/domains/computer-science.md",
        "references/domains/social-sciences.md",
    ]
    for rel in required:
        if not (ROOT / rel).exists():
            errors.append(f"{rel}: missing")


def check_templates() -> None:
    required = [
        "research/_TEMPLATE-fact-check.md",
        "research/_TEMPLATE-review.md",
        "research/_TEMPLATE-protocol.md",
    ]
    for rel in required:
        if not (ROOT / rel).exists():
            errors.append(f"{rel}: missing")


def check_hook() -> None:
    hook = ROOT / ".claude/hooks/session-start.sh"
    if not hook.exists():
        errors.append(".claude/hooks/session-start.sh: missing")
    elif not os.access(hook, os.X_OK):
        errors.append(".claude/hooks/session-start.sh: not executable")


def main() -> int:
    check_skills()
    check_agents()
    check_json()
    check_references()
    check_templates()
    check_hook()
    if errors:
        print("researchbyskills validation FAILED:")
        for e in errors:
            print(f"  - {e}")
        return 1
    print("researchbyskills validation OK — skills, agents, config and references check out.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
