#!/usr/bin/env python3
"""
prepare_playtest.py — generate isolated, ready-to-run playtest prompts for each persona.

Takes a session brief (or brief parameters), resolves the chosen persona panel,
and generates distinct prompt files for isolated subagents or LLM sessions.

Usage:
    python prepare_playtest.py [brief_file] [--panel <all|onboarding|monetization|difficulty|bughunt|accessibility|retention|social|narrative|p01,p04,...>] [--out <dir>] [--json] [--lean]

Examples:
    python prepare_playtest.py assets/session-brief-template.md --panel onboarding --out ./prompts
    python prepare_playtest.py --panel p01,p04,p13 --out ./prompts --lean
    python prepare_playtest.py brief.md --panel all --json > subagents.json
"""

import argparse
import json
import os
import re
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_SKILL_ROOT = os.path.abspath(os.path.join(_HERE, ".."))
_REF_DIR = os.path.join(_SKILL_ROOT, "references")
_PERSONAS_DIR = os.path.join(_REF_DIR, "personas")

PANELS = {
    "all": [f"p{i:02d}" for i in range(1, 21)],
    "onboarding": ["p01", "p08", "p03", "p04", "p20", "p12"],
    "monetization": ["p10", "p16", "p12", "p03", "p05"],
    "difficulty": ["p02", "p07", "p17", "p20", "p19", "p04"],
    "bughunt": ["p18", "p06", "p11", "p19", "p07"],
    "accessibility": ["p08", "p20", "p03", "p09"],
    "retention": ["p11", "p02", "p13", "p10", "p09"],
    "social": ["p05", "p15", "p12", "p20", "p07"],
    "narrative": ["p17", "p09", "p01", "p15", "p13"],
}


def load_ref(name):
    path = os.path.join(_REF_DIR, name)
    if not os.path.isfile(path):
        raise FileNotFoundError(f"required skill reference is missing: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()


_PLACEHOLDER_RE = re.compile(r"(?<![A-Za-z0-9_<])<[A-Za-z][^<>\r\n]{0,120}>")


def find_unfilled_placeholders(text):
    """Return distinct angle-bracket placeholders left in a session brief."""
    matches = (match for match in _PLACEHOLDER_RE.findall(text or "") if "://" not in match)
    return list(dict.fromkeys(matches))


def _configure_utf8_streams():
    """Make Unicode CLI output deterministic on Windows legacy consoles."""
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure:
            reconfigure(encoding="utf-8")


def load_persona(pid):
    for fn in sorted(os.listdir(_PERSONAS_DIR)):
        if fn.startswith(f"{pid}-") and fn.endswith(".md"):
            with open(os.path.join(_PERSONAS_DIR, fn), "r", encoding="utf-8") as f:
                return fn, f.read().strip()
    return None, ""


def resolve_panel(panel_spec):
    """Resolve a panel spec into a de-duplicated persona ID list.

    Accepted forms (also comma-mixed, e.g. 'monetization,p05' or 'onboarding,difficulty'):
      - a named panel: all|onboarding|monetization|difficulty|bughunt|accessibility|retention|social|narrative
      - persona IDs: p01, p04 (bare numbers '1,4' are zero-padded to p01, p04)

    Returns (pids, unknown_tokens). Unknown tokens are reported by the caller so
    typos fail loudly instead of silently producing zero prompts.
    """
    spec = (panel_spec or "all").strip().lower()
    if not spec:
        return list(PANELS["all"]), []

    valid_ids = set(PANELS["all"])
    pids = []
    seen = set()
    unknown = []
    for item in spec.split(","):
        p = item.strip().lower()
        if not p:
            continue
        if p in PANELS:
            candidates = PANELS[p]
        else:
            if not p.startswith("p") and p.isdigit():
                p = f"p{int(p):02d}"
            candidates = [p]
            if p not in valid_ids:
                unknown.append(p)
                continue
        for c in candidates:
            if c not in seen:
                seen.add(c)
                pids.append(c)
    return pids, unknown


def build_persona_prompt(pid, brief_content, lang="English", lean=False,
                         include_accessibility=False):
    fn, persona_content = load_persona(pid)
    if not persona_content:
        return None, None, f"Error: persona {pid} not found"

    pname = fn.split("-", 1)[-1].replace(".md", "").capitalize() if fn else pid
    accessibility = load_ref("accessibility-review.md") if include_accessibility else ""

    if lean:
        schema = load_ref("output-schema.md")
        prompt = f"""# Synthetic Playtest — Persona {pid.upper()} ({pname})

Apply {pname}'s documented constraints independently in strict isolation. This is a model-generated hypothesis.
Do not claim to be a real person or representative of a demographic group. Do not infer behavior from demographics.
Feedback Language: **{lang}** (JSON keys stay English).

## 1. FICTIONAL ARCHETYPE CONSTRAINTS
{persona_content}

## 2. STRICT RULES
- Use only evidence in the artifact and brief; do not invent observations or interactions.
- Set `session_was` to `imagined` unless you actually operated the artifact; an imagined run cannot confirm a bug.
- Answer every supplied gate independently. Do not force agreement or disagreement with other reports.
- Never report panel counts or coverage from this one run. Only the aggregator may compute a panel gate status from saved isolated reports.
- Observe → trace a plausible path → record reactions → report actionable hypotheses with calibrated confidence.
- Emit EXACTLY ONE valid JSON block followed by a 3–8 sentence first-person narrative that stays within the JSON evidence.

## 3. BRIEF
{brief_content or "(Test the game artifact provided in the session.)"}

## 4. OUTPUT SCHEMA
{schema}

## 5. ACCESSIBILITY BOUNDARY (when relevant)
{accessibility}
"""
    else:
        anti_homog = load_ref("anti-homogenization.md")
        protocol = load_ref("test-protocol.md")
        schema = load_ref("output-schema.md")

        prompt = f"""# Isolated Playtest Session — Persona {pid.upper()} ({pname})

Apply one fictional archetype's documented constraints independently in strict isolation.
This produces a model-generated hypothesis, not evidence about real people. Do not claim to be a real person
or representative of a demographic group. Do not infer behavior from demographics.
Never report panel counts or coverage from this one run. Only the aggregator may compute a panel gate status
from saved isolated reports.

## Language Requirement
Provide all your feedback, findings, suggestions, and narrative in: **{lang}**.
(The JSON keys must remain in English as defined in the schema).

---

## 1. FICTIONAL ARCHETYPE CONSTRAINTS
{persona_content}

---

## 2. INDEPENDENCE AND CALIBRATION RULES
{anti_homog}

---

## 3. PLAYTEST BRIEF (What you are testing)
{brief_content or "(No specific brief provided. Evaluate the game artifact provided in the prompt/conversation.)"}

---

## 4. TEST PROTOCOL
{protocol}

---

## 5. REQUIRED OUTPUT FORMAT
{schema}

## 6. ACCESSIBILITY BOUNDARY (when relevant)
{accessibility}

Remember: emit exactly one valid JSON code block matching the schema above, followed by a 3–8 sentence first-person narrative that adds no unsupported claims.
"""
    return fn, pname, prompt.strip()


def prepare_prompts(pids, brief_content, lang="English", lean=False,
                    include_accessibility=False):
    """Build a complete panel or fail; never return a partial panel."""
    generated = []
    for pid in pids:
        fn, pname, prompt = build_persona_prompt(
            pid, brief_content, lang, lean, include_accessibility
        )
        if not fn:
            raise FileNotFoundError(f"required persona file for {pid} is missing")
        generated.append((pid, pname, fn, prompt))
    return generated


def main():
    _configure_utf8_streams()
    ap = argparse.ArgumentParser(description="Prepare isolated playtest prompts for subagents.")
    ap.add_argument("brief", nargs="?", default=None, help="path to filled session-brief file")
    ap.add_argument("--panel", default="all", help="panel name (all|onboarding|monetization|difficulty|bughunt|accessibility|retention|social|narrative), comma-separated persona IDs (p01,p04), or a mix (onboarding,p05)")
    ap.add_argument("--lang", default="English", help="feedback language (e.g. English, Polish)")
    ap.add_argument("--lean", action="store_true", help="generate compact token-efficient prompts")
    ap.add_argument("--accessibility-review", action="store_true",
                    help="load the accessibility boundary for every selected persona")
    ap.add_argument("--out", default=None, help="directory to write prompt files to")
    ap.add_argument("--json", action="store_true", help="output JSON array for programmatic subagent spawning")
    args = ap.parse_args()

    brief_content = ""
    if args.brief:
        if not os.path.isfile(args.brief):
            print(f"error: brief file '{args.brief}' not found", file=sys.stderr)
            sys.exit(2)
        with open(args.brief, "r", encoding="utf-8") as f:
            brief_content = f.read().strip()
        placeholders = find_unfilled_placeholders(brief_content)
        if placeholders:
            print(
                "error: brief contains unfilled placeholder(s): " + ", ".join(placeholders),
                file=sys.stderr,
            )
            sys.exit(2)

    pids, unknown = resolve_panel(args.panel)
    if unknown:
        print(f"error: unknown panel name or persona ID in '{args.panel}': {', '.join(unknown)}\n"
              f"       valid panels: {', '.join(k for k in PANELS if k != 'all')} (or 'all')\n"
              f"       valid persona IDs: p01..p20 (comma-separated lists and mixes are allowed)",
              file=sys.stderr)
        sys.exit(2)
    if not pids:
        print(f"error: no valid personas resolved from '{args.panel}'", file=sys.stderr)
        sys.exit(2)

    panel_tokens = {token.strip().lower() for token in args.panel.split(",")}
    accessibility_focus = (
        args.accessibility_review
        or "accessibility" in panel_tokens
        or bool(re.search(r"\b(accessibility|accessible|dost[eę]pno)", brief_content, re.IGNORECASE))
    )
    try:
        generated = prepare_prompts(
            pids, brief_content, args.lang, args.lean, accessibility_focus
        )
    except FileNotFoundError as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(2)

    subagents_payload = []
    for pid, pname, fn, prompt in generated:
        subagents_payload.append({
            "persona_id": pid,
            "persona_name": pname,
            "role": f"Playtester {pname} ({pid.upper()})",
            "prompt": prompt
        })

    if args.json:
        print(json.dumps(subagents_payload, indent=2, ensure_ascii=False))
        return

    if not generated:
        print("error: no prompts were generated (persona files missing or unreadable)", file=sys.stderr)
        sys.exit(2)

    if args.out:
        if os.path.isdir(args.out):
            stale = sorted(
                name for name in os.listdir(args.out)
                if name.startswith("prompt-") and name.endswith(".md")
            )
            if stale:
                print(
                    "error: stale prompt file(s) already exist in output directory: "
                    + ", ".join(stale)
                    + "; use an empty output directory",
                    file=sys.stderr,
                )
                sys.exit(2)
        os.makedirs(args.out, exist_ok=True)
        for pid, pname, fn, prompt in generated:
            out_file = os.path.join(args.out, f"prompt-{pid}-{pname.lower()}.md")
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(prompt)
            print(f"Wrote {out_file}")
        print(f"\nSuccessfully generated {len(generated)} prompt(s) in {args.out}")
    else:
        print(f"Generated {len(generated)} persona prompt(s) for panel '{args.panel}'.")
        print("To save to disk, specify --out <dir>. To print JSON for subagents, use --json.")


if __name__ == "__main__":
    main()
