#!/usr/bin/env python3
"""Validate the deterministic contract of serio-po-polsku evaluation cases."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

from check_protected_tokens import compare_texts


REQUIRED_FIELDS = {
    "id", "scenario", "genre", "audience", "mode", "input",
    "protected_elements", "expected_decision", "allowed_strategies",
    "forbidden_changes", "quality_criteria", "pattern_ids", "evidence_ids",
    "proposed_output",
}
DECISIONS = {"CHANGE", "SUGGEST", "LEAVE-AS-IS", "ESCALATE"}
MODES = {"AUDIT", "SUGGEST", "EDIT"}
REQUIRED_SCENARIOS = {
    "mechanical_antithesis", "intentional_antithesis", "natural_text",
    "english_calque", "overstructured_paragraph", "scientific_modality",
    "specialist_terms", "stylized_dialog", "ui_length", "json_icu",
    "markdown_protected", "mixed_language", "book_chronology",
    "uncertain_visibility", "generated_file",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Validate eval schema, required scenario coverage, decision coverage and "
            "protected-token preservation. This does not score literary naturalness."
        )
    )
    parser.add_argument("cases", help="Path to evals/cases.json")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable result")
    parser.add_argument("--list", action="store_true", help="List cases after validation")
    return parser.parse_args()


def validate_case(case: object, index: int) -> list[str]:
    errors: list[str] = []
    if not isinstance(case, dict):
        return [f"case[{index}] nie jest obiektem"]
    case_id = case.get("id", f"case[{index}]")
    missing = sorted(REQUIRED_FIELDS - set(case))
    if missing:
        errors.append(f"{case_id}: brak pól {missing}")
    if case.get("mode") not in MODES:
        errors.append(f"{case_id}: nieprawidłowy mode={case.get('mode')!r}")
    if case.get("expected_decision") not in DECISIONS:
        errors.append(f"{case_id}: nieprawidłowa decyzja={case.get('expected_decision')!r}")
    if not isinstance(case.get("protected_elements"), list):
        errors.append(f"{case_id}: protected_elements musi być listą")
    for field in ("allowed_strategies", "forbidden_changes", "quality_criteria", "pattern_ids", "evidence_ids"):
        if not isinstance(case.get(field), list) or not case.get(field):
            errors.append(f"{case_id}: {field} musi być niepustą listą")
    input_text = case.get("input")
    output_text = case.get("proposed_output")
    if not isinstance(input_text, str) or not isinstance(output_text, str):
        errors.append(f"{case_id}: input i proposed_output muszą być tekstem")
        return errors
    for token in case.get("protected_elements", []):
        if token and token not in input_text:
            errors.append(f"{case_id}: chroniony element nie występuje w input: {token!r}")
        if token and token not in output_text:
            errors.append(f"{case_id}: chroniony element zniknął z proposed_output: {token!r}")
    token_differences = compare_texts(input_text, output_text)
    if token_differences:
        categories = [item["category"] for item in token_differences]
        errors.append(f"{case_id}: różnice wykryte przez check_protected_tokens: {categories}")
    if case.get("expected_decision") in {"LEAVE-AS-IS", "ESCALATE"} and input_text != output_text:
        errors.append(f"{case_id}: decyzja {case.get('expected_decision')} wymaga ilustracyjnego no-op")
    return errors


def main() -> int:
    args = parse_args()
    try:
        path = Path(args.cases).expanduser().resolve(strict=True)
        payload = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        print(f"BŁĄD: {exc}", file=sys.stderr)
        return 2
    cases = payload.get("cases") if isinstance(payload, dict) else None
    errors: list[str] = []
    if not isinstance(cases, list):
        errors.append("Korzeń musi zawierać listę cases.")
        cases = []
    if payload.get("schema_version") != 1:
        errors.append("schema_version musi wynosić 1.")
    ids = [case.get("id") for case in cases if isinstance(case, dict)]
    duplicate_ids = sorted(key for key, value in Counter(ids).items() if value > 1)
    if duplicate_ids:
        errors.append(f"Powtórzone identyfikatory: {duplicate_ids}")
    scenarios = {case.get("scenario") for case in cases if isinstance(case, dict)}
    missing_scenarios = sorted(REQUIRED_SCENARIOS - scenarios)
    if missing_scenarios:
        errors.append(f"Brak wymaganych scenariuszy: {missing_scenarios}")
    decisions = {case.get("expected_decision") for case in cases if isinstance(case, dict)}
    missing_decisions = sorted(DECISIONS - decisions)
    if missing_decisions:
        errors.append(f"Brak pokrycia decyzji: {missing_decisions}")
    for index, case in enumerate(cases):
        errors.extend(validate_case(case, index))
    result = {
        "ok": not errors,
        "case_count": len(cases),
        "scenarios_covered": sorted(value for value in scenarios if isinstance(value, str)),
        "decisions_covered": sorted(value for value in decisions if isinstance(value, str)),
        "note": "Walidacja deterministyczna nie ocenia naturalności literackiej.",
        "errors": errors,
    }
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print("OK" if not errors else "FAIL", f"— {len(cases)} przypadków")
        print(result["note"])
        for error in errors:
            print(f"- {error}")
        if args.list:
            for case in cases:
                if isinstance(case, dict):
                    print(f"{case.get('id')}: {case.get('expected_decision')} — {case.get('scenario')}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
