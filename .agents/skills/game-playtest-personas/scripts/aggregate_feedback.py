#!/usr/bin/env python3
"""
aggregate_feedback.py — merge per-persona playtest reports into panel metrics, CSV, and markdown summary.

Each persona (see references/output-schema.md) emits one JSON object. Point this script at the directory of
those reports and it produces:
  - <out>/panel_metrics.json  : machine-readable aggregate
  - <out>/panel_summary.md    : human-readable rollup you paste under assets/report-template.md
  - <out>/panel_matrix.csv    : spreadsheet matrix (personas × metrics × gate answers)

It is intentionally dependency-free (Python 3.8+ stdlib only) so it runs anywhere the skill runs.

Usage:
    python aggregate_feedback.py <reports_dir> [--out <dir>] [--title "Game / Build vX"]
        [--expected-personas p01,p02] [--pass-threshold 75]
        [--gate-threshold Q1=80] [--min-gate-coverage 100] [--no-csv]
"""

import argparse
import csv
import json
import math
import os
import re
import statistics
import sys
from collections import Counter, defaultdict

DISCLAIMER = (
    "These are model-generated hypotheses from synthetic personas, a cheap early supplement to real "
    "playtesting — NOT a measurement and NOT a substitute. Validate high-impact findings with real players "
    "before high-stakes, hard-to-reverse decisions."
)

# Canonical 20 personas index mapping
CANONICAL_PERSONAS = {
    "p01": "Zoe",
    "p02": "Marcus",
    "p03": "Grace",
    "p04": "Diego",
    "p05": "Priya",
    "p06": "Alex",
    "p07": "Kenji",
    "p08": "Barbara",
    "p09": "Tom",
    "p10": "Lucia",
    "p11": "Sam",
    "p12": "Nadia",
    "p13": "Robert",
    "p14": "Mei",
    "p15": "Chris",
    "p16": "Ahmed",
    "p17": "Emma",
    "p18": "Viktor",
    "p19": "Hana",
    "p20": "George",
}


def _configure_utf8_streams():
    """Make Unicode CLI output deterministic on Windows legacy consoles."""
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure:
            reconfigure(encoding="utf-8")


def _extract_json_object(text):
    """Return the first balanced top-level {...} object in text, or None."""
    start = text.find("{")
    while start != -1:
        depth, in_str, esc = 0, False, False
        for i in range(start, len(text)):
            c = text[i]
            if in_str:
                if esc:
                    esc = False
                elif c == "\\":
                    esc = True
                elif c == '"':
                    in_str = False
            else:
                if c == '"':
                    in_str = True
                elif c == "{":
                    depth += 1
                elif c == "}":
                    depth -= 1
                    if depth == 0:
                        candidate = text[start:i + 1]
                        try:
                            return json.loads(candidate)
                        except json.JSONDecodeError:
                            break  # try next '{'
        start = text.find("{", start + 1)
    return None


_EXT_PRIORITY = {"json": 0, "md": 1, "txt": 2}

_SEVERITIES = {"blocker", "major", "minor", "nitpick"}
_CONFIDENCES = {"confirmed", "likely", "possible", "guess"}
_WOULD_PAY = {"yes", "no", "maybe"}
_SESSION_WAS = {"driven", "imagined"}
_FIDELITIES = {"build", "video", "screenshots", "description", "gdd", "concept"}
_GATE_VERDICTS = {"pass", "fail", "partial"}
_OVERALL_CONFIDENCES = {"high", "medium", "low"}
_REQUIRED_FIELDS = {
    "persona_id", "persona_name", "artifact", "input_fidelity", "session_was",
    "first_impression_score", "keep_play_score", "emotional_arc",
    "friction_points", "delights", "quit_trigger", "monetization", "bugs",
    "feature_requests", "blind_spots", "gate_answers", "one_line_verdict",
    "confidence_overall",
}
_ALLOWED_FIELDS = _REQUIRED_FIELDS


def validate_report(obj, source_name="?"):
    """Return all schema-contract errors found in one report."""
    errors = []
    fn = source_name
    missing = sorted(field for field in _REQUIRED_FIELDS if field not in obj)
    if missing:
        errors.append(f"missing required field(s): {', '.join(missing)}")
    extras = sorted(set(obj) - _ALLOWED_FIELDS)
    if extras:
        errors.append(f"unknown field(s): {', '.join(extras)}")

    raw_pid = obj.get("persona_id")
    pid = str(raw_pid or "").strip().lower()
    pname = str(obj.get("persona_name") or "").strip()
    if not pid:
        errors.append("missing 'persona_id'")
    elif pid not in CANONICAL_PERSONAS:
        errors.append(f"unknown persona_id='{pid}' (expected p01..p20)")
    else:
        if raw_pid != pid:
            errors.append("persona_id must use canonical lowercase form p01..p20")
        expected = CANONICAL_PERSONAS[pid]
        if pname != expected:
            errors.append(
                f"persona_id='{pid}' is canonically '{expected}', but report has persona_name='{pname}'"
            )
    if not pname:
        errors.append("missing 'persona_name'")

    for field in ("artifact", "one_line_verdict"):
        if not isinstance(obj.get(field), str) or not obj.get(field, "").strip():
            errors.append(f"'{field}' must be a non-empty string")

    for score_field in ("first_impression_score", "keep_play_score"):
        raw = obj.get(score_field)
        v = float(raw) if isinstance(raw, (int, float)) and not isinstance(raw, bool) else None
        if v is None:
            errors.append(f"'{score_field}' must be a JSON number")
        elif not (0 <= v <= 10):
            errors.append(f"{score_field}={v} is outside 0–10")

    session_was = obj.get("session_was")
    if not isinstance(session_was, str) or session_was not in _SESSION_WAS:
        errors.append(f"session_was='{session_was}' (expected one of {sorted(_SESSION_WAS)})")

    fidelity = obj.get("input_fidelity")
    if not isinstance(fidelity, str) or fidelity not in _FIDELITIES:
        errors.append(f"input_fidelity='{fidelity}' (expected one of {sorted(_FIDELITIES)})")

    friction_points = obj.get("friction_points")
    if not isinstance(friction_points, list):
        errors.append("'friction_points' must be an array")
        friction_points = []
    for index, fp in enumerate(friction_points):
        if not isinstance(fp, dict):
            errors.append(f"friction_points[{index}] must be an object")
            continue
        sev = fp.get("severity")
        extra = sorted(set(fp) - {"where", "what", "severity", "why_it_mattered_to_me", "suggestion"})
        if extra:
            errors.append(f"friction_points[{index}] has unknown field(s): {', '.join(extra)}")
        if sev not in _SEVERITIES:
            errors.append(f"friction severity='{fp.get('severity')}' (expected one of {sorted(_SEVERITIES)})")
        for field in ("where", "what"):
            if not isinstance(fp.get(field), str) or not fp.get(field, "").strip():
                errors.append(f"friction_points[{index}].{field} must be a non-empty string")
        for field in ("why_it_mattered_to_me", "suggestion"):
            if field in fp and not isinstance(fp[field], str):
                errors.append(f"friction_points[{index}].{field} must be a string")

    bugs = obj.get("bugs")
    if not isinstance(bugs, list):
        errors.append("'bugs' must be an array")
        bugs = []
    for index, bug in enumerate(bugs):
        if not isinstance(bug, dict):
            errors.append(f"bugs[{index}] must be an object")
            continue
        conf = bug.get("confidence")
        extra = sorted(set(bug) - {"what", "where", "confidence"})
        if extra:
            errors.append(f"bugs[{index}] has unknown field(s): {', '.join(extra)}")
        if conf not in _CONFIDENCES:
            errors.append(f"bug confidence='{bug.get('confidence')}' (expected one of {sorted(_CONFIDENCES)})")
        if not isinstance(bug.get("what"), str) or not bug.get("what", "").strip():
            errors.append(f"bugs[{index}].what must be a non-empty string")
        if "where" in bug and not isinstance(bug["where"], str):
            errors.append(f"bugs[{index}].where must be a string")
        if session_was == "imagined" and conf == "confirmed":
            errors.append("imagined session cannot mark a bug as 'confirmed'")

    gate_answers = obj.get("gate_answers", [])
    if not isinstance(gate_answers, list):
        errors.append("'gate_answers' must be an array")
        gate_answers = []
    seen_gate_ids = set()
    for index, answer in enumerate(gate_answers):
        if not isinstance(answer, dict):
            errors.append(f"gate_answers[{index}] must be an object")
            continue
        extra = sorted(set(answer) - {"id", "question", "verdict", "confidence", "details"})
        if extra:
            errors.append(f"gate_answers[{index}] has unknown field(s): {', '.join(extra)}")
        raw_qid = answer.get("id")
        qid = _normalize_gate_id(raw_qid)
        if not qid:
            errors.append(f"gate_answers[{index}].id must identify a gate")
        elif isinstance(raw_qid, str) and not re.fullmatch(r"(Q)?[1-9][0-9]*", raw_qid):
            errors.append(f"gate_answers[{index}].id must use N or QN form")
        elif qid in seen_gate_ids:
            errors.append(f"duplicate gate answer for {qid}")
        else:
            seen_gate_ids.add(qid)
        if not isinstance(answer.get("question"), str) or not answer.get("question", "").strip():
            errors.append(f"gate_answers[{index}].question must be a non-empty string")
        verdict = answer.get("verdict")
        if not isinstance(verdict, str) or verdict not in _GATE_VERDICTS:
            errors.append(f"gate_answers[{index}].verdict must be pass, fail, or partial")
        if "confidence" in answer:
            confidence = answer.get("confidence")
            if (not isinstance(confidence, (int, float)) or isinstance(confidence, bool)
                    or not 0 <= confidence <= 1):
                errors.append(f"gate_answers[{index}].confidence must be between 0 and 1")
        if "details" in answer and not isinstance(answer["details"], str):
            errors.append(f"gate_answers[{index}].details must be a string")

    mon = obj.get("monetization")
    if not isinstance(mon, dict):
        errors.append("'monetization' must be an object")
    else:
        extra = sorted(set(mon) - {"relevant", "would_pay", "when", "amount", "felt_unfair"})
        if extra:
            errors.append(f"monetization has unknown field(s): {', '.join(extra)}")
        if not isinstance(mon.get("relevant"), bool):
            errors.append("monetization.relevant must be a boolean")
        wp = mon.get("would_pay")
        if wp not in _WOULD_PAY:
            errors.append(f"would_pay='{mon.get('would_pay')}' (expected one of {sorted(_WOULD_PAY)})")
        for field in ("when", "amount", "felt_unfair"):
            if not isinstance(mon.get(field), str):
                errors.append(f"monetization.{field} must be a string")

    for field in ("emotional_arc", "feature_requests", "blind_spots"):
        if not isinstance(obj.get(field), list):
            errors.append(f"'{field}' must be an array")
        elif any(not isinstance(item, str) for item in obj[field]):
            errors.append(f"'{field}' must contain only strings")
    delights = obj.get("delights")
    if not isinstance(delights, list):
        errors.append("'delights' must be an array")
    else:
        for index, delight in enumerate(delights):
            if not isinstance(delight, dict):
                errors.append(f"delights[{index}] must be an object")
                continue
            extra = sorted(set(delight) - {"where", "what"})
            if extra:
                errors.append(f"delights[{index}] has unknown field(s): {', '.join(extra)}")
            for field in ("where", "what"):
                if not isinstance(delight.get(field), str) or not delight.get(field, "").strip():
                    errors.append(f"delights[{index}].{field} must be a non-empty string")
    quit_trigger = obj.get("quit_trigger")
    if not isinstance(quit_trigger, dict):
        errors.append("'quit_trigger' must be an object")
    elif not isinstance(quit_trigger.get("fired"), bool):
        errors.append("quit_trigger.fired must be a boolean")
    else:
        extra = sorted(set(quit_trigger) - {"fired", "what", "at"})
        if extra:
            errors.append(f"quit_trigger has unknown field(s): {', '.join(extra)}")
        for field in ("what", "at"):
            if not isinstance(quit_trigger.get(field), str):
                errors.append(f"quit_trigger.{field} must be a string")

    co = obj.get("confidence_overall")
    if co not in _OVERALL_CONFIDENCES:
        errors.append(f"confidence_overall='{obj.get('confidence_overall')}' (expected one of {sorted(_OVERALL_CONFIDENCES)})")
    return [f"{fn}: {error}" for error in errors]


def load_reports(reports_dir):
    candidates = []
    for fn in sorted(os.listdir(reports_dir)):
        path = os.path.join(reports_dir, fn)
        if not os.path.isfile(path):
            continue
        if fn in ("panel_metrics.json", "panel_summary.md", "panel_matrix.csv"):
            continue
        ext = fn.lower().rsplit(".", 1)[-1] if "." in fn else ""
        if ext not in _EXT_PRIORITY:
            continue
        try:
            with open(path, "r", encoding="utf-8") as f:
                raw = f.read()
        except OSError as e:
            print(f"  ! could not read {fn}: {e}", file=sys.stderr)
            continue
        except UnicodeDecodeError:
            # Not valid UTF-8 (common on Windows: cp1250 with Polish diacritics).
            # Retry as cp1250 with replacement so the report still aggregates,
            # but warn loudly — mixed encodings in one panel are a data smell.
            try:
                with open(path, "r", encoding="cp1250", errors="replace") as f:
                    raw = f.read()
                print(f"  ! {fn} is not valid UTF-8; re-read as cp1250 "
                      f"(re-save the report as UTF-8 to fix this)", file=sys.stderr)
            except OSError as e:
                print(f"  ! could not read {fn}: {e}", file=sys.stderr)
                continue
        obj = None
        if ext == "json":
            try:
                obj = json.loads(raw)
            except json.JSONDecodeError:
                print(f"  ! invalid JSON document in {fn}, skipping", file=sys.stderr)
                continue
        else:
            obj = _extract_json_object(raw)
        if obj is None:
            print(f"  ! no JSON object found in {fn}, skipping", file=sys.stderr)
            continue
        if not isinstance(obj, dict):
            print(f"  ! {fn} doesn't look like a valid JSON object, skipping", file=sys.stderr)
            continue
        if "persona_name" not in obj:
            print(f"  ! {fn} doesn't look like a persona report, skipping", file=sys.stderr)
            continue
        errors = validate_report(obj, fn)
        if errors:
            for error in errors:
                print(f"  ! {error}", file=sys.stderr)
            print(f"  ! rejecting invalid report {fn}", file=sys.stderr)
            continue
        stem = fn.rsplit(".", 1)[0] if "." in fn else fn
        pid = str(obj.get("persona_id") or "").strip().lower()
        key = pid or stem.lower()
        candidates.append((key, _EXT_PRIORITY[ext], fn, obj))

    by_key = defaultdict(list)
    for key, priority, fn, obj in candidates:
        by_key[key].append((priority, fn, obj))

    reports = []
    for key in sorted(by_key):
        group = sorted(by_key[key])
        _, keep_fn, obj = group[0]
        if len(group) > 1:
            names = ", ".join(item[1] for item in group)
            print(
                f"  ! rejecting ambiguous duplicate reports for persona '{key}': {names}",
                file=sys.stderr,
            )
            continue
        reports.append((keep_fn, obj))
    reports.sort(key=lambda item: item[0])
    return [obj for _, obj in reports]


def _num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def _norm_where(w):
    """Normalize location strings for improved consensus clustering."""
    if not w:
        return "(unspecified)"
    s = str(w).strip().lower()
    s = re.sub(r"^.*[/\\]", "", s)
    s = re.sub(r"\.[a-z0-9]+$", "", s)
    s = re.sub(r"^(scene_|screen_|ui_)", "", s)
    s = re.sub(r"[_\-]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip(" :.,;")
    return s or "(unspecified)"


def _normalize_gate_verdict(verdict):
    """Return a strict schema verdict or an explicit missing-value marker."""
    return verdict if verdict in _GATE_VERDICTS else "unspecified"


def _normalize_gate_id(raw_id):
    if raw_id is None or isinstance(raw_id, bool):
        return ""
    if isinstance(raw_id, float):
        if not math.isfinite(raw_id) or not raw_id.is_integer():
            return ""
        raw_id = int(raw_id)
    value = str(raw_id).strip().upper()
    if value.isdigit():
        value = f"Q{value}"
    if not re.fullmatch(r"Q[1-9][0-9]*", value):
        return ""
    return value


def _group_friction(friction_all):
    """Group friction points by normalized location so the same screen/step hit by
    several personas surfaces as a repeated lead."""
    groups = defaultdict(lambda: {"personas": set(), "severities": Counter(), "whats": []})
    for f in friction_all:
        key = _norm_where(f.get("where"))
        g = groups[key]
        g["personas"].add(f["persona"])
        g["severities"][f["severity"]] += 1
        if f.get("what") and f["what"] not in g["whats"]:
            g["whats"].append(f["what"])
    out = []
    for key, g in groups.items():
        if len(g["personas"]) >= 2:
            out.append({
                "where": key,
                "persona_count": len(g["personas"]),
                "personas": sorted(g["personas"]),
                "severities": dict(g["severities"]),
                "whats": g["whats"][:5],
            })
    out.sort(key=lambda x: (-x["persona_count"], x["where"]))
    return out


def _aggregate_gates(reports, pass_threshold=0.75, gate_thresholds=None,
                     min_gate_coverage=1.0, expected_persona_ids=None,
                     expected_gate_questions=None):
    """Evaluate every gate independently, including answer coverage."""
    gate_thresholds = {
        _normalize_gate_id(key): value for key, value in (gate_thresholds or {}).items()
    }
    gate_thresholds = {key: value for key, value in gate_thresholds.items() if key}
    expected_gate_questions = {
        _normalize_gate_id(key): re.sub(r"\s+", " ", value).strip()
        for key, value in (expected_gate_questions or {}).items()
        if _normalize_gate_id(key)
    }
    gate_data = defaultdict(lambda: {
        "id": None,
        "question": "",
        "question_key": "",
        "verdicts": Counter(),
        "confidences": [],
        "details": []
    })
    errors = []

    for q_key in gate_thresholds:
        gate_data[q_key]["id"] = q_key
    for q_key, question in expected_gate_questions.items():
        gate_data[q_key]["id"] = q_key
        gate_data[q_key]["question"] = question
        gate_data[q_key]["question_key"] = question

    has_gates = bool(gate_thresholds or expected_gate_questions)
    for r in reports:
        pname = r.get("persona_name", "?")
        pid = r.get("persona_id", "?")
        answers = r.get("gate_answers") or []
        if isinstance(answers, list) and answers:
            has_gates = True
            for item in answers:
                if not isinstance(item, dict):
                    continue
                qid = item.get("id")
                q_key = _normalize_gate_id(qid)
                if not q_key:
                    continue
                
                g = gate_data[q_key]
                g["id"] = q_key
                question = str(item.get("question") or "").strip()
                question_key = re.sub(r"\s+", " ", question).strip()
                declared_question = expected_gate_questions.get(q_key)
                if expected_gate_questions and declared_question is None:
                    error = f"{q_key}: report contains an undeclared gate question"
                    if error not in errors:
                        errors.append(error)
                elif declared_question is not None and question_key != declared_question:
                    error = (
                        f"{q_key}: report question {question_key!r} does not match declared question "
                        f"{declared_question!r}"
                    )
                    if error not in errors:
                        errors.append(error)
                if question and not g["question"]:
                    g["question"] = question
                    g["question_key"] = question_key
                elif question_key and g["question_key"] and question_key != g["question_key"]:
                    error = f"{q_key}: conflicting question text: {g['question']!r} vs {question!r}"
                    if error not in errors:
                        errors.append(error)

                verdict = _normalize_gate_verdict(item.get("verdict"))
                g["verdicts"][verdict] += 1
                
                conf = _num(item.get("confidence"))
                if conf is not None:
                    g["confidences"].append(conf)

                detail_text = item.get("details") or ""
                if detail_text:
                    g["details"].append({
                        "persona": pname,
                        "persona_id": pid,
                        "verdict": verdict,
                        "confidence": conf,
                        "text": str(detail_text).strip()
                    })

    if not has_gates:
        return None

    if expected_persona_ids is None:
        errors.append("expected persona IDs are required for gate coverage")
    if not expected_gate_questions:
        errors.append("expected gate questions are required for gate integrity")
    for q_key in gate_thresholds:
        if q_key not in expected_gate_questions:
            errors.append(f"{q_key}: threshold has no declared gate question")

    out = []
    total_passes = 0
    total_evals = 0
    panel_size = len(expected_persona_ids) if expected_persona_ids is not None else len(reports)
    for q_key in sorted(gate_data.keys(), key=lambda k: int(k[1:]) if k[1:].isdigit() else k):
        g = gate_data[q_key]
        n_total = sum(g["verdicts"].values())
        n_pass = g["verdicts"].get("pass", 0)
        n_fail = g["verdicts"].get("fail", 0)
        n_partial = g["verdicts"].get("partial", 0)
        raw_pass_rate = n_pass / n_total if n_total > 0 else 0.0
        raw_coverage = n_total / panel_size if panel_size else 0.0
        pass_rate = round(raw_pass_rate, 2)
        coverage = round(raw_coverage, 2)
        threshold = gate_thresholds.get(q_key, pass_threshold)
        meets_threshold = raw_pass_rate >= threshold
        meets_coverage = raw_coverage >= min_gate_coverage
        avg_conf = round(statistics.mean(g["confidences"]), 2) if g["confidences"] else None

        total_passes += n_pass
        total_evals += n_total

        out.append({
            "id": g["id"],
            "question": g["question"] or f"Gate question {g['id']}",
            "total_answers": n_total,
            "pass_count": n_pass,
            "fail_count": n_fail,
            "partial_count": n_partial,
            "pass_rate": pass_rate,
            "coverage": coverage,
            "threshold": threshold,
            "meets_threshold": meets_threshold,
            "meets_coverage": meets_coverage,
            "avg_confidence": avg_conf,
            "verdicts": dict(g["verdicts"]),
            "details": g["details"]
        })

    overall_pass_rate = round(total_passes / total_evals, 2) if total_evals > 0 else 0.0
    if errors:
        synthetic_status = "INVALID SYNTHETIC"
    elif out and all(q["meets_threshold"] and q["meets_coverage"] for q in out):
        synthetic_status = "PASS SYNTHETIC"
    else:
        synthetic_status = "FAIL SYNTHETIC"

    return {
        "status": synthetic_status,
        "pass_threshold": pass_threshold,
        "min_gate_coverage": min_gate_coverage,
        "overall_pass_rate": overall_pass_rate,
        "errors": errors,
        "questions": out
    }


def aggregate(reports, pass_threshold=0.75, gate_thresholds=None,
              min_gate_coverage=1.0, expected_persona_ids=None,
              expected_gate_questions=None):
    for label, value in (("pass_threshold", pass_threshold),
                         ("min_gate_coverage", min_gate_coverage)):
        if (not isinstance(value, (int, float)) or isinstance(value, bool)
                or not 0 <= value <= 1):
            raise ValueError(f"{label} must be between 0 and 1")
    if gate_thresholds is not None and not isinstance(gate_thresholds, dict):
        raise ValueError("gate_thresholds must be a mapping")
    normalized_thresholds = {}
    for raw_id, value in (gate_thresholds or {}).items():
        qid = _normalize_gate_id(raw_id)
        if not qid:
            raise ValueError(f"invalid gate threshold id: {raw_id}")
        if qid in normalized_thresholds:
            raise ValueError(f"duplicate gate threshold ID: {qid}")
        if (not isinstance(value, (int, float)) or isinstance(value, bool)
                or not 0 <= value <= 1):
            raise ValueError(f"gate threshold for {raw_id} must be between 0 and 1")
        normalized_thresholds[qid] = value
    gate_thresholds = normalized_thresholds
    if expected_gate_questions is not None:
        if not isinstance(expected_gate_questions, dict) or not expected_gate_questions:
            raise ValueError("expected_gate_questions must be a non-empty mapping")
        normalized_questions = {}
        for raw_id, question in expected_gate_questions.items():
            qid = _normalize_gate_id(raw_id)
            if not qid:
                raise ValueError(f"invalid expected gate question ID: {raw_id}")
            if qid in normalized_questions:
                raise ValueError(f"duplicate expected gate question ID: {qid}")
            if not isinstance(question, str) or not question.strip():
                raise ValueError(f"expected gate question for {qid} must be non-empty")
            normalized_questions[qid] = re.sub(r"\s+", " ", question).strip()
        expected_gate_questions = normalized_questions

    if expected_persona_ids is not None:
        if not isinstance(expected_persona_ids, (list, tuple)) or not expected_persona_ids:
            raise ValueError("expected_persona_ids must be a non-empty list")
        normalized_expected = []
        for raw_id in expected_persona_ids:
            pid = str(raw_id).strip().lower()
            if raw_id != pid or pid not in CANONICAL_PERSONAS:
                raise ValueError(f"invalid expected persona ID: {raw_id}")
            if pid in normalized_expected:
                raise ValueError(f"duplicate expected persona ID: {pid}")
            normalized_expected.append(pid)
        expected_persona_ids = normalized_expected

    validation_errors = []
    for index, report in enumerate(reports):
        if not isinstance(report, dict):
            validation_errors.append(f"report[{index}] must be an object")
        else:
            validation_errors.extend(validate_report(report))
    if validation_errors:
        raise ValueError("invalid report input: " + "; ".join(validation_errors))

    loaded_ids = [report["persona_id"] for report in reports]
    duplicate_ids = sorted(pid for pid, count in Counter(loaded_ids).items() if count > 1)
    if duplicate_ids:
        raise ValueError("duplicate persona report ID(s): " + ", ".join(duplicate_ids))
    if expected_persona_ids is not None:
        unexpected = sorted(set(loaded_ids) - set(expected_persona_ids))
        if unexpected:
            raise ValueError("reports contain unexpected persona ID(s): " + ", ".join(unexpected))
    missing_personas = (
        [pid for pid in expected_persona_ids if pid not in loaded_ids]
        if expected_persona_ids is not None else []
    )
    m = {
        "n_personas": len(reports),
        "expected_personas": expected_persona_ids,
        "missing_personas": missing_personas,
        "personas": [],
    }

    quit_fired = []
    severity_counter = Counter()
    friction_all = []
    bugs_by_conf = defaultdict(list)
    would_pay = Counter()
    blind_spots = Counter()
    delights = []

    for r in reports:
        name = r.get("persona_name", "?")
        pid = r.get("persona_id", "?")
        m["personas"].append({
            "id": pid,
            "name": name,
            "first_impression": r.get("first_impression_score"),
            "keep_playing": r.get("keep_play_score"),
            "verdict": r.get("one_line_verdict", ""),
            "session_was": r.get("session_was", ""),
            "confidence_overall": r.get("confidence_overall", ""),
        })

        qt = r.get("quit_trigger") or {}
        if qt.get("fired"):
            quit_fired.append({"persona": name, "what": qt.get("what", ""), "at": qt.get("at", "")})

        for fp in r.get("friction_points") or []:
            sev = (fp.get("severity") or "unspecified").lower()
            severity_counter[sev] += 1
            friction_all.append({
                "persona": name,
                "where": fp.get("where", ""),
                "what": fp.get("what", ""),
                "severity": sev,
                "suggestion": fp.get("suggestion", ""),
            })

        for b in r.get("bugs") or []:
            conf = (b.get("confidence") or "unspecified").lower()
            bugs_by_conf[conf].append({
                "persona": name,
                "what": b.get("what", ""),
                "where": b.get("where", ""),
            })

        mon = r.get("monetization") or {}
        if mon.get("relevant"):
            would_pay[(mon.get("would_pay") or "unspecified").lower()] += 1

        for bs in r.get("blind_spots") or []:
            blind_spots[bs.strip().lower()] += 1

        for d in r.get("delights") or []:
            delights.append({"persona": name, "what": d.get("what", ""), "where": d.get("where", "")})

    m["quit_triggers_fired"] = quit_fired
    m["quit_rate"] = round(len(quit_fired) / len(reports), 2) if reports else None
    m["friction_severity_counts"] = dict(severity_counter)
    m["friction_points"] = friction_all
    m["friction_groups"] = _group_friction(friction_all)
    m["bugs_by_confidence"] = {k: v for k, v in bugs_by_conf.items()}
    m["monetization_would_pay"] = dict(would_pay)
    m["blind_spots"] = blind_spots.most_common()
    m["delights"] = delights
    m["gate_evaluation"] = _aggregate_gates(
        reports, pass_threshold, gate_thresholds, min_gate_coverage,
        expected_persona_ids, expected_gate_questions,
    )
    return m


def _md_inline(value):
    """Render untrusted report text as one escaped Markdown line."""
    flattened = re.sub(r"\s+", " ", str(value)).strip()
    return re.sub(r"([\\`*_{}\[\]()<>#+.!|~-])", r"\\\1", flattened)


def _md_cell(value):
    """Make a value safe for a Markdown table cell."""
    return _md_inline(value)


_CSV_FORMULA_PREFIXES = ("=", "+", "-", "@", "\t", "\r")


def _csv_cell(value):
    """Neutralize spreadsheet formula injection (OWASP CSV-injection guidance):
    a cell whose text starts with =, +, -, @ (or a tab/CR) would be evaluated as
    a formula when the CSV is opened in Excel/LibreOffice/Sheets. Prefixing a
    single quote forces text interpretation and keeps the value visible."""
    if isinstance(value, str) and value.startswith(_CSV_FORMULA_PREFIXES):
        return "'" + value
    return value


def to_markdown(m, title):
    L = []
    L.append(f"# Panel Playtest — aggregate metrics — {_md_inline(title)}\n")
    L.append(f"> {DISCLAIMER}\n")
    L.append(f"**Personas in panel:** {m['n_personas']}\n")

    if m.get("quit_rate") is not None:
        pct = round(100 * len(m["quit_triggers_fired"]) / m["n_personas"]) if m["n_personas"] else 0
        L.append(f"- **Quit-trigger fire rate:** {pct}% of personas "
                 f"({len(m['quit_triggers_fired'])}/{m['n_personas']})")
    L.append("")

    gates = m.get("gate_evaluation")
    if gates:
        overall_pct = int(gates["overall_pass_rate"] * 100)
        L.append("## Gate / Milestone evaluation\n")
        L.append(f"- **Synthetic Status:** `{gates['status']}` (descriptive overall pass rate: {overall_pct}%)")
        L.append("- A synthetic PASS means only that every configured question met its own threshold and coverage target; it is not user evidence.\n")
        for error in gates.get("errors", []):
            L.append(f"- **Configuration error:** {_md_cell(error)}")
        L.append("| # | Gate Question | Pass Rate / Target | Coverage / Target | Result | Pass / Fail / Partial | Avg Conf |")
        L.append("|---|---|---|---|---|---|---|")
        for q in gates["questions"]:
            pct = int(q["pass_rate"] * 100)
            threshold_pct = int(q["threshold"] * 100)
            coverage_pct = int(q["coverage"] * 100)
            coverage_target_pct = int(gates["min_gate_coverage"] * 100)
            conf_str = f"{q['avg_confidence']}" if q["avg_confidence"] is not None else "-"
            result = "PASS" if q["meets_threshold"] and q["meets_coverage"] else "FAIL"
            L.append(f"| {q['id']} | {_md_cell(q['question'])} | {pct}% / {threshold_pct}% | "
                     f"{coverage_pct}% / {coverage_target_pct}% | {result} | "
                     f"{q['pass_count']} / {q['fail_count']} / {q['partial_count']} | {conf_str} |")
        L.append("")

        objections = []
        for q in gates["questions"]:
            for d in q["details"]:
                if d["verdict"] in ("fail", "partial"):
                    objections.append((q["id"], d["persona"], d["verdict"], d["text"]))
        if objections:
            L.append("### Key Gate Objections & Concerns\n")
            for qid, persona, verdict, text in objections[:8]:
                L.append(
                    f"- **[{qid} - {verdict.upper()}] {_md_inline(persona)}:** {_md_inline(text)}"
                )
            L.append("")

    L.append("## Scores by persona\n")
    L.append("| Persona | First | Keep | Session | Conf | Verdict |")
    L.append("|---|---|---|---|---|---|")
    for p in m["personas"]:
        L.append(f"| {_md_cell(p['name'])} ({_md_cell(p['id'])}) | {p['first_impression']} | "
                 f"{p['keep_playing']} | {_md_cell(p['session_was'])} | "
                 f"{_md_cell(p['confidence_overall'])} | {_md_cell(p['verdict'])} |")
    L.append("")

    if m["quit_triggers_fired"]:
        L.append("## Quit triggers that fired\n")
        for q in m["quit_triggers_fired"]:
            L.append(
                f"- **{_md_inline(q['persona'])}** — {_md_inline(q['what'])}  "
                f"_(at: {_md_inline(q['at'])})_"
            )
        L.append("")

    if m.get("friction_groups"):
        L.append("## Repeated friction leads grouped by location\n")
        L.append("_Locations are free text, so this grouping is a **lead to verify** by reading the "
                 "underlying points, not a proof of a shared finding._\n")
        for g in m["friction_groups"]:
            sev = ", ".join(f"{k}: {v}" for k, v in sorted(g["severities"].items()))
            L.append(f"- **{_md_inline(g['where'])}** — hit by {g['persona_count']} personas "
                     f"({_md_inline(', '.join(g['personas']))}) · severity mix: {_md_inline(sev)}")
        L.append("")

    sev = m["friction_severity_counts"]
    if sev:
        L.append("## Friction by severity\n")
        for s in ("blocker", "major", "minor", "nitpick", "unspecified"):
            if s in sev:
                L.append(f"- **{s}:** {sev[s]}")
        L.append("")
        big = [f for f in m["friction_points"] if f["severity"] in ("blocker", "major")]
        if big:
            L.append("### Blocker / major friction (act on these first)\n")
            for f in big:
                L.append(
                    f"- **[{f['severity']}] {_md_inline(f['persona'])}** @ {_md_inline(f['where'])}: "
                    f"{_md_inline(f['what'])}"
                    + (f"  → _{_md_inline(f['suggestion'])}_" if f["suggestion"] else "")
                )
            L.append("")

    bugs = m["bugs_by_confidence"]
    if bugs:
        L.append("## Bug leads by confidence (verify every lead in the artifact)\n")
        _known_conf = ("confirmed", "likely", "possible", "guess", "unspecified")
        for conf in [c for c in _known_conf if c in bugs] + sorted(c for c in bugs if c not in _known_conf):
            label = conf if conf in _known_conf else f"{conf} ⚠️ unknown value"
            L.append(f"**{label}:**")
            for b in bugs[conf]:
                L.append(
                    f"- {_md_inline(b['what'])} — _{_md_inline(b['persona'])}_"
                    + (f" @ {_md_inline(b['where'])}" if b["where"] else "")
                )
            L.append("")

    if m["monetization_would_pay"]:
        L.append("## Monetization — would pay?\n")
        for k, v in m["monetization_would_pay"].items():
            L.append(f"- **{k}:** {v}")
        L.append("")

    if m["delights"]:
        L.append("## Delights (protect these)\n")
        for d in m["delights"]:
            L.append(
                f"- {_md_inline(d['what'])} — _{_md_inline(d['persona'])}_"
                + (f" @ {_md_inline(d['where'])}" if d["where"] else "")
            )
        L.append("")

    if m["blind_spots"]:
        L.append("## Aggregate blind spots (what this panel could NOT judge)\n")
        for spot, count in m["blind_spots"]:
            L.append(f"- {_md_inline(spot)} ({count})")
        L.append("")

    L.append("---")
    L.append("_Next: paste this under `assets/report-template.md`, add interpretation (repeated vs. "
             "divergent hypotheses), rank recommendations, and name the 2–3 findings most worth validating with real "
             "players._")
    return "\n".join(L)


def to_csv(reports, metrics):
    """Generate CSV spreadsheet rows for all personas in the panel."""
    gates = metrics.get("gate_evaluation")
    q_ids = [q["id"] for q in gates["questions"]] if gates else []

    headers = [
        "Persona ID", "Persona Name", "First Impression", "Keep Playing",
        "Session Was", "Confidence", "Quit Fired", "Quit Trigger Reason", "Quit Trigger At",
        "Blocker Friction Count", "Major Friction Count", "Bugs Count",
        "Would Pay", "One Line Verdict"
    ]
    for qid in q_ids:
        headers.append(f"{qid} Verdict")

    rows = []
    for r in reports:
        pid = r.get("persona_id", "")
        pname = r.get("persona_name", "")
        fi = r.get("first_impression_score", "")
        kp = r.get("keep_play_score", "")
        sw = r.get("session_was", "")
        co = r.get("confidence_overall", "")

        qt = r.get("quit_trigger") or {}
        q_fired = "Yes" if qt.get("fired") else "No"
        q_what = qt.get("what", "")
        q_at = qt.get("at", "")

        fps = r.get("friction_points") or []
        blockers = sum(1 for f in fps if (f.get("severity") or "").lower() == "blocker")
        majors = sum(1 for f in fps if (f.get("severity") or "").lower() == "major")
        bugs_count = len(r.get("bugs") or [])

        mon = r.get("monetization") or {}
        wp = mon.get("would_pay", "") if mon.get("relevant") else "N/A"
        verdict = r.get("one_line_verdict", "")

        row = [
            pid, pname, fi, kp, sw, co, q_fired, q_what, q_at,
            blockers, majors, bugs_count, wp, verdict
        ]

        if q_ids:
            p_gates = {}
            ans_list = r.get("gate_answers") or []
            for item in ans_list:
                if isinstance(item, dict):
                    raw_id = _normalize_gate_id(item.get("id"))
                    p_gates[raw_id] = _normalize_gate_verdict(item.get("verdict"))
            for qid in q_ids:
                row.append(p_gates.get(qid, "unanswered"))

        rows.append([_csv_cell(v) for v in row])

    return headers, rows


def _percentage_fraction(raw_value, label):
    """Convert an unambiguous CLI percentage in the 0..100 range to a fraction."""
    try:
        value = float(raw_value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{label} must be a number") from exc
    if not 0.0 <= value <= 100.0:
        raise ValueError(f"{label} must be between 0 and 100")
    return value / 100.0


def _parse_gate_thresholds(values):
    thresholds = {}
    for raw in values or []:
        if "=" not in raw:
            raise ValueError(f"gate threshold '{raw}' must use QN=PERCENT format")
        raw_id, raw_value = raw.split("=", 1)
        qid = _normalize_gate_id(raw_id)
        if not qid:
            raise ValueError(f"invalid gate id '{raw_id}'")
        if qid in thresholds:
            raise ValueError(f"duplicate threshold for {qid}")
        thresholds[qid] = _percentage_fraction(raw_value, f"threshold for {qid}")
    return thresholds


def _parse_expected_personas(raw_value):
    if raw_value is None:
        return None
    values = [part.strip().lower() for part in raw_value.split(",") if part.strip()]
    if not values:
        raise ValueError("--expected-personas must list at least one persona ID")
    if len(values) != len(set(values)):
        raise ValueError("--expected-personas contains duplicate IDs")
    invalid = [pid for pid in values if pid not in CANONICAL_PERSONAS]
    if invalid:
        raise ValueError("invalid expected persona ID(s): " + ", ".join(invalid))
    return values


def _parse_gate_questions(values):
    questions = {}
    for raw in values or []:
        if "=" not in raw:
            raise ValueError(f"gate question '{raw}' must use QN=TEXT format")
        raw_id, question = raw.split("=", 1)
        qid = _normalize_gate_id(raw_id)
        question = re.sub(r"\s+", " ", question).strip()
        if not qid:
            raise ValueError(f"invalid gate question id '{raw_id}'")
        if not question:
            raise ValueError(f"gate question for {qid} must be non-empty")
        if qid in questions:
            raise ValueError(f"duplicate gate question for {qid}")
        questions[qid] = question
    return questions


def main():
    _configure_utf8_streams()
    ap = argparse.ArgumentParser(description="Aggregate per-persona playtest reports into panel metrics.")
    ap.add_argument("reports_dir", help="directory containing per-persona report files (.json/.md/.txt)")
    ap.add_argument("--out", default=None, help="output directory (default: reports_dir)")
    ap.add_argument("--title", default="untitled build", help="title for the summary header")
    ap.add_argument("--pass-threshold", type=float, default=75.0, help="synthetic pass threshold percentage (0-100, default: 75.0)")
    ap.add_argument("--gate-threshold", action="append", default=[], metavar="QN=PERCENT",
                    help="per-question target; repeat for multiple gates (for example Q1=80)")
    ap.add_argument("--gate-question", action="append", default=[], metavar="QN=TEXT",
                    help="canonical gate text from the brief; repeat for every gate")
    ap.add_argument("--expected-personas", default=None, metavar="P01,P02",
                    help="exact persona IDs expected in the panel; required for valid gate coverage")
    ap.add_argument("--min-gate-coverage", type=float, default=100.0,
                    help="minimum answer coverage per gate (0-100, default: 100)")
    ap.add_argument("--no-csv", action="store_true", help="disable panel_matrix.csv generation")
    args = ap.parse_args()

    if not os.path.isdir(args.reports_dir):
        print(f"error: {args.reports_dir} is not a directory", file=sys.stderr)
        sys.exit(2)
    out_dir = args.out or args.reports_dir
    os.makedirs(out_dir, exist_ok=True)

    print(f"Scanning {args.reports_dir} ...")
    reports = load_reports(args.reports_dir)
    if not reports:
        print("error: no valid persona reports found.", file=sys.stderr)
        sys.exit(1)
    print(f"Loaded {len(reports)} persona report(s).")

    try:
        threshold_fraction = _percentage_fraction(args.pass_threshold, "--pass-threshold")
        coverage_fraction = _percentage_fraction(args.min_gate_coverage, "--min-gate-coverage")
        gate_thresholds = _parse_gate_thresholds(args.gate_threshold)
        gate_questions = _parse_gate_questions(args.gate_question)
        expected_personas = _parse_expected_personas(args.expected_personas)
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(2)
    try:
        metrics = aggregate(
            reports,
            pass_threshold=threshold_fraction,
            gate_thresholds=gate_thresholds,
            min_gate_coverage=coverage_fraction,
            expected_persona_ids=expected_personas,
            expected_gate_questions=gate_questions or None,
        )
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(2)
    md = to_markdown(metrics, args.title)

    metrics_path = os.path.join(out_dir, "panel_metrics.json")
    summary_path = os.path.join(out_dir, "panel_summary.md")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(md)

    print(f"Wrote {metrics_path}")
    print(f"Wrote {summary_path}")

    if not args.no_csv:
        csv_path = os.path.join(out_dir, "panel_matrix.csv")
        headers, rows = to_csv(reports, metrics)
        with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(rows)
        print(f"Wrote {csv_path}")
    else:
        stale_csv_path = os.path.join(out_dir, "panel_matrix.csv")
        if os.path.isfile(stale_csv_path):
            try:
                os.remove(stale_csv_path)
            except OSError as exc:
                print(f"error: could not remove stale {stale_csv_path}: {exc}", file=sys.stderr)
                sys.exit(1)
            print(f"Removed stale {stale_csv_path}")

    gates = metrics.get("gate_evaluation")
    if gates:
        print(f"Synthetic gate status: {gates['status']}")


if __name__ == "__main__":
    main()
