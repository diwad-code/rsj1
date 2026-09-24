#!/usr/bin/env python3
"""Unit tests for aggregate_feedback.py — stdlib only, run with:

    python scripts/test_aggregate.py

Covers:
- Load & deduplication of reports (.json, .md, .txt)
- Schema validation & canonical persona ID/name matching
- Gate / Milestone questions aggregation & configurable synthetic status
- Strict gate verdict and canonical gate-question handling
- CSV matrix export format
- Normalization of friction locations & consensus clustering
- Metric statistics, quit rates, and markdown formatting
"""

import contextlib
import importlib.util
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
from types import ModuleType

_HERE = os.path.dirname(os.path.abspath(__file__))
_SPEC = importlib.util.spec_from_file_location(
    "aggregate_feedback", os.path.join(_HERE, "aggregate_feedback.py"))
assert _SPEC is not None and _SPEC.loader is not None
agg = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(agg)
assert isinstance(agg, ModuleType)


def make_report(pid="p04", name="Diego", **over):
    r = {
        "persona_id": pid,
        "persona_name": name,
        "artifact": "tutorial build v0.3",
        "input_fidelity": "build",
        "session_was": "driven",
        "first_impression_score": 6,
        "keep_play_score": 4,
        "emotional_arc": ["excited", "confused"],
        "friction_points": [],
        "delights": [],
        "quit_trigger": {"fired": False, "what": "", "at": ""},
        "monetization": {"relevant": False, "would_pay": "no", "when": "",
                         "amount": "", "felt_unfair": ""},
        "bugs": [],
        "feature_requests": [],
        "blind_spots": [],
        "gate_answers": [],
        "one_line_verdict": "fine",
        "confidence_overall": "medium",
    }
    r.update(over)
    return r


def write(dirname, fn, obj):
    with open(os.path.join(dirname, fn), "w", encoding="utf-8") as f:
        json.dump(obj, f)


class LoadDedupTests(unittest.TestCase):
    def test_duplicate_json_and_md_counts_once(self):
        with tempfile.TemporaryDirectory() as d:
            write(d, "p04-diego.json", make_report())
            with open(os.path.join(d, "p04-diego.md"), "w", encoding="utf-8") as f:
                f.write("Narrative first.\n```json\n")
                json.dump(make_report(), f)
                f.write("\n```\nThen prose.\n")
            reports = agg.load_reports(d)
        self.assertEqual(reports, [])

    def test_duplicate_persona_id_across_files_counts_once(self):
        with tempfile.TemporaryDirectory() as d:
            write(d, "a.json", make_report(pid="p04"))
            write(d, "b.json", make_report(pid="p04"))
            reports = agg.load_reports(d)
        self.assertEqual(reports, [])

    def test_distinct_personas_all_kept(self):
        with tempfile.TemporaryDirectory() as d:
            write(d, "p01.json", make_report(pid="p01", name="Zoe"))
            write(d, "p02.json", make_report(pid="p02", name="Marcus"))
            write(d, "p04-diego.json", make_report())
            reports = agg.load_reports(d)
        self.assertEqual(len(reports), 3)
        self.assertEqual({r["persona_name"] for r in reports},
                         {"Zoe", "Marcus", "Diego"})

    def test_json_extracted_from_md_narrative(self):
        with tempfile.TemporaryDirectory() as d:
            with open(os.path.join(d, "p07-kenji.md"), "w", encoding="utf-8") as f:
                f.write("# Kenji\n\nProse before.\n\n")
                f.write(json.dumps(make_report(pid="p07", name="Kenji")))
                f.write("\n\nProse after.\n")
            reports = agg.load_reports(d)
        self.assertEqual(len(reports), 1)
        self.assertEqual(reports[0]["persona_name"], "Kenji")

    def test_duplicate_warning_on_stderr(self):
        err = io.StringIO()
        with tempfile.TemporaryDirectory() as d:
            write(d, "p04-diego.json", make_report())
            write(d, "p04-diego.md", make_report())
            with contextlib.redirect_stderr(err):
                agg.load_reports(d)
        self.assertIn("rejecting ambiguous duplicate reports", err.getvalue())


class ValidationTests(unittest.TestCase):
    def test_canonical_persona_mismatch_is_rejected(self):
        err = io.StringIO()
        with tempfile.TemporaryDirectory() as d:
            write(d, "p03.json", make_report(pid="p03", name="Diego"))
            with contextlib.redirect_stderr(err):
                reports = agg.load_reports(d)
        self.assertEqual(reports, [])
        msg = err.getvalue()
        self.assertIn("canonically 'Grace'", msg)
        self.assertIn("persona_name='Diego'", msg)

    def test_out_of_range_score_is_rejected(self):
        err = io.StringIO()
        with tempfile.TemporaryDirectory() as d:
            write(d, "p01.json", make_report(first_impression_score=12))
            with contextlib.redirect_stderr(err):
                reports = agg.load_reports(d)
        self.assertEqual(reports, [])
        self.assertIn("outside 0–10", err.getvalue())

    def test_unknown_enum_values_are_rejected(self):
        err = io.StringIO()
        bad = make_report(
            input_fidelity="videogame",
            session_was="dreamed",
            friction_points=[{"where": "menu", "what": "x",
                              "severity": "critical"}],
            bugs=[{"what": "y", "confidence": "certain"}])
        with tempfile.TemporaryDirectory() as d:
            write(d, "p02.json", bad)
            with contextlib.redirect_stderr(err):
                reports = agg.load_reports(d)
        self.assertEqual(reports, [])
        msg = err.getvalue()
        self.assertIn("severity='critical'", msg)
        self.assertIn("confidence='certain'", msg)
        self.assertIn("session_was='dreamed'", msg)
        self.assertIn("input_fidelity='videogame'", msg)

    def test_structural_type_errors_are_rejected_without_crashing(self):
        err = io.StringIO()
        bad_structure = make_report(
            friction_points="not a list",
            bugs="not a list",
            gate_answers="not a list",
            monetization="not a dict"
        )
        with tempfile.TemporaryDirectory() as d:
            write(d, "p01.json", bad_structure)
            with contextlib.redirect_stderr(err):
                reports = agg.load_reports(d)
        self.assertEqual(reports, [])
        msg = err.getvalue()
        self.assertIn("'friction_points' must be an array", msg)
        self.assertIn("'bugs' must be an array", msg)
        self.assertIn("'gate_answers' must be an array", msg)
        self.assertIn("'monetization' must be an object", msg)

    def test_unknown_persona_id_is_rejected(self):
        err = io.StringIO()
        with tempfile.TemporaryDirectory() as d:
            write(d, "p99.json", make_report(pid="p99", name="Nobody"))
            with contextlib.redirect_stderr(err):
                reports = agg.load_reports(d)
        self.assertEqual(reports, [])
        self.assertIn("unknown persona_id='p99'", err.getvalue())

    def test_imagined_session_cannot_confirm_bug(self):
        err = io.StringIO()
        report = make_report(
            session_was="imagined",
            bugs=[{"what": "crash", "where": "start", "confidence": "confirmed"}],
        )
        with tempfile.TemporaryDirectory() as d:
            write(d, "p04.json", report)
            with contextlib.redirect_stderr(err):
                reports = agg.load_reports(d)
        self.assertEqual(reports, [])
        self.assertIn("imagined session cannot mark a bug as 'confirmed'", err.getvalue())

    def test_invalid_json_duplicate_does_not_hide_valid_markdown_report(self):
        err = io.StringIO()
        with tempfile.TemporaryDirectory() as d:
            write(d, "p04.json", make_report(first_impression_score=99))
            with open(os.path.join(d, "p04.md"), "w", encoding="utf-8") as f:
                f.write("```json\n" + json.dumps(make_report()) + "\n```\n")
            with contextlib.redirect_stderr(err):
                reports = agg.load_reports(d)
        self.assertEqual(len(reports), 1)
        self.assertEqual(reports[0]["first_impression_score"], 6)

    def test_json_with_trailing_garbage_is_rejected(self):
        err = io.StringIO()
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "p04.json")
            with open(path, "w", encoding="utf-8") as handle:
                handle.write(json.dumps(make_report()) + " trailing garbage")
            with contextlib.redirect_stderr(err):
                reports = agg.load_reports(d)
        self.assertEqual(reports, [])
        self.assertIn("invalid JSON document", err.getvalue())

    def test_internal_source_metadata_is_not_accepted_or_returned(self):
        with tempfile.TemporaryDirectory() as d:
            write(d, "p04.json", make_report())
            reports = agg.load_reports(d)
        self.assertNotIn("_source_file", reports[0])
        errors = agg.validate_report(make_report(_source_file="spoofed.json"))
        self.assertTrue(any("unknown field(s): _source_file" in error for error in errors))

    def test_schema_type_coercions_and_legacy_gate_verdict_are_rejected(self):
        err = io.StringIO()
        report = make_report(
            pid="P04",
            first_impression_score="6",
            gate_answers=[{"id": "q1", "question": "Understand?", "verdict": "yes"}],
        )
        with tempfile.TemporaryDirectory() as d:
            write(d, "p04.json", report)
            with contextlib.redirect_stderr(err):
                reports = agg.load_reports(d)
        self.assertEqual(reports, [])
        self.assertIn("persona_id must use canonical lowercase form", err.getvalue())
        self.assertIn("must be a JSON number", err.getvalue())
        self.assertIn("verdict must be pass, fail, or partial", err.getvalue())


class EncodingTests(unittest.TestCase):
    def test_aggregate_cli_output_survives_cp1250_environment(self):
        env = os.environ.copy()
        env["PYTHONIOENCODING"] = "cp1250"
        with tempfile.TemporaryDirectory(prefix="reports-🙂-") as d:
            write(d, "p04.json", make_report())
            result = subprocess.run(
                [sys.executable, os.path.join(_HERE, "aggregate_feedback.py"), d, "--no-csv"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
                check=False,
            )
        self.assertEqual(result.returncode, 0, result.stderr.decode("utf-8", "replace"))
    def test_cp1250_file_falls_back_and_warns(self):
        err = io.StringIO()
        with tempfile.TemporaryDirectory() as d:
            body = ('Narracja ążęśłó.\n```json\n'
                    + json.dumps(make_report(pid="p07", name="Kenji"))
                    + '\n```\nZakończenie.')
            with open(os.path.join(d, "p07-kenji.md"), "w", encoding="cp1250") as f:
                f.write(body)
            with contextlib.redirect_stderr(err):
                reports = agg.load_reports(d)
        self.assertEqual(len(reports), 1)
        self.assertEqual(reports[0]["persona_name"], "Kenji")
        self.assertIn("not valid UTF-8", err.getvalue())
        self.assertIn("cp1250", err.getvalue())

    def test_undecodable_binary_file_skipped_without_crash(self):
        err = io.StringIO()
        with tempfile.TemporaryDirectory() as d:
            with open(os.path.join(d, "binary.json"), "wb") as f:
                f.write(b'\xff\xfe{"persona_name": "X"}\x00\xfa')
            with contextlib.redirect_stderr(err):
                reports = agg.load_reports(d)
        # must not raise; either skipped (no JSON found after replacement) or empty
        self.assertIsInstance(reports, list)


class AggregateTests(unittest.TestCase):
    def test_direct_aggregate_rejects_malformed_report_cleanly(self):
        with self.assertRaisesRegex(ValueError, "invalid report"):
            agg.aggregate([make_report(friction_points="not a list")])

    def test_direct_aggregate_rejects_invalid_thresholds(self):
        with self.assertRaisesRegex(ValueError, "pass_threshold"):
            agg.aggregate([make_report()], pass_threshold=1.5)
        with self.assertRaisesRegex(ValueError, "min_gate_coverage"):
            agg.aggregate([make_report()], min_gate_coverage=-0.1)
        with self.assertRaisesRegex(ValueError, "gate threshold"):
            agg.aggregate([make_report()], gate_thresholds={"Q1": 2.0})
        with self.assertRaisesRegex(ValueError, "gate_thresholds must be a mapping"):
            agg.aggregate([make_report()], gate_thresholds=[("Q1", 0.8)])

    def test_direct_aggregate_rejects_duplicate_normalized_threshold_ids(self):
        with self.assertRaisesRegex(ValueError, "duplicate gate threshold ID: Q1"):
            agg.aggregate(
                [make_report()], gate_thresholds={"Q1": 0.8, "1": 0.4}
            )

    def test_direct_aggregate_rejects_duplicate_persona_ids(self):
        with self.assertRaisesRegex(ValueError, "duplicate persona report"):
            agg.aggregate([make_report(), make_report()])

    def test_schema_integer_gate_id_float_is_accepted(self):
        report = make_report(gate_answers=[{
            "id": 1.0, "question": "Understand?", "verdict": "pass"
        }])
        self.assertEqual(agg.validate_report(report), [])
        gates = agg.aggregate(
            [report], expected_persona_ids=["p04"],
            expected_gate_questions={"Q1": "Understand?"},
        )["gate_evaluation"]
        self.assertEqual(gates["questions"][0]["id"], "Q1")

    def test_cli_percentage_parser_is_unambiguously_zero_to_one_hundred(self):
        self.assertEqual(agg._percentage_fraction(1, "test"), 0.01)
        self.assertEqual(agg._percentage_fraction(1.5, "test"), 0.015)
        self.assertEqual(agg._percentage_fraction(100, "test"), 1.0)
        with self.assertRaises(ValueError):
            agg._percentage_fraction(100.1, "test")

    def test_scores_remain_persona_relative_without_panel_mean(self):
        m = agg.aggregate([make_report(keep_play_score=8)])
        self.assertNotIn("keep_playing", m)
        self.assertNotIn("first_impression", m)
        self.assertEqual(m["personas"][0]["keep_playing"], 8)

    def test_quit_rate_percentage_not_float_truncated(self):
        reports = [make_report(pid=f"p{i:02d}", name=agg.CANONICAL_PERSONAS[f"p{i:02d}"],
                               quit_trigger={"fired": i < 3, "what": "x", "at": ""})
                   for i in range(1, 8)]
        m = agg.aggregate(reports)
        self.assertEqual(m["n_personas"], 7)
        self.assertEqual(m["quit_rate"], 0.29)
        md = agg.to_markdown(m, "t")
        self.assertIn("29% of personas (2/7)", md)

    def test_friction_grouping_by_location_enhanced(self):
        reports = [
            make_report(pid="p01", name="Zoe", friction_points=[
                {"where": "scenes/ship/ship_scene.gd", "what": "can't find start",
                 "severity": "major"}]),
            make_report(pid="p02", name="Marcus", friction_points=[
                {"where": " ship scene ", "what": "cluttered",
                 "severity": "minor"}]),
            make_report(pid="p03", name="Grace", friction_points=[
                {"where": "ship_scene", "what": "text tiny",
                 "severity": "blocker"}]),
        ]
        m = agg.aggregate(reports)
        groups = m["friction_groups"]
        self.assertEqual(len(groups), 1)
        self.assertEqual(groups[0]["where"], "ship scene")
        self.assertEqual(groups[0]["persona_count"], 3)
        md = agg.to_markdown(m, "t")
        self.assertIn("Repeated friction leads", md)
        self.assertIn("hit by 3 personas", md)

    def test_gate_evaluation_aggregation(self):
        r1 = make_report(pid="p01", name="Zoe", gate_answers=[
            {"id": 1, "question": "Understand mechanic?", "verdict": "pass", "confidence": 0.9, "details": "Super easy"},
            {"id": 2, "question": "Play again?", "verdict": "fail", "confidence": 0.8, "details": "No progression"}
        ])
        r2 = make_report(pid="p02", name="Marcus", gate_answers=[
            {"id": 1, "question": "Understand mechanic?", "verdict": "pass", "confidence": 0.95, "details": "Clear enough"},
            {"id": 2, "question": "Play again?", "verdict": "pass", "confidence": 0.7, "details": "Wants hard mode"}
        ])
        m = agg.aggregate(
            [r1, r2], expected_persona_ids=["p01", "p02"],
            expected_gate_questions={"Q1": "Understand mechanic?", "Q2": "Play again?"},
        )
        gates = m.get("gate_evaluation")
        self.assertIsNotNone(gates)
        self.assertEqual(gates["status"], "FAIL SYNTHETIC")
        self.assertEqual(len(gates["questions"]), 2)
        q1 = gates["questions"][0]
        self.assertEqual(q1["pass_count"], 2)
        self.assertEqual(q1["pass_rate"], 1.0)
        q2 = gates["questions"][1]
        self.assertEqual(q2["pass_count"], 1)
        self.assertEqual(q2["fail_count"], 1)
        self.assertEqual(q2["pass_rate"], 0.5)

        md = agg.to_markdown(m, "t")
        self.assertIn("Gate / Milestone evaluation", md)
        self.assertIn("FAIL SYNTHETIC", md)
        self.assertIn("- **[Q2 - FAIL] Zoe:** No progression", md)

    def test_configurable_pass_threshold(self):
        r1 = make_report(pid="p01", name="Zoe", gate_answers=[
            {"id": 1, "question": "Q1?", "verdict": "pass"}
        ])
        r2 = make_report(pid="p02", name="Marcus", gate_answers=[
            {"id": 1, "question": "Q1?", "verdict": "fail"}
        ])
        # 1 pass out of 2 = 50%
        # Threshold 0.4 -> PASS SYNTHETIC
        m_pass = agg.aggregate(
            [r1, r2], pass_threshold=0.40, expected_persona_ids=["p01", "p02"],
            expected_gate_questions={"Q1": "Q1?"},
        )
        self.assertEqual(m_pass["gate_evaluation"]["status"], "PASS SYNTHETIC")
        # Threshold 0.6 -> FAIL SYNTHETIC
        m_fail = agg.aggregate(
            [r1, r2], pass_threshold=0.60, expected_persona_ids=["p01", "p02"],
            expected_gate_questions={"Q1": "Q1?"},
        )
        self.assertEqual(m_fail["gate_evaluation"]["status"], "FAIL SYNTHETIC")

    def test_per_question_thresholds_must_all_pass(self):
        r1 = make_report(pid="p01", name="Zoe", gate_answers=[
            {"id": 1, "question": "Understand?", "verdict": "pass"},
            {"id": 2, "question": "No mistaps?", "verdict": "pass"},
        ])
        r2 = make_report(pid="p02", name="Marcus", gate_answers=[
            {"id": 1, "question": "Understand?", "verdict": "pass"},
            {"id": 2, "question": "No mistaps?", "verdict": "fail"},
        ])
        gates = agg.aggregate(
            [r1, r2], gate_thresholds={"Q1": 0.80, "Q2": 1.0},
            expected_persona_ids=["p01", "p02"],
            expected_gate_questions={"Q1": "Understand?", "Q2": "No mistaps?"},
        )["gate_evaluation"]
        self.assertEqual(gates["status"], "FAIL SYNTHETIC")
        self.assertTrue(gates["questions"][0]["meets_threshold"])
        self.assertFalse(gates["questions"][1]["meets_threshold"])

    def test_threshold_comparison_uses_unrounded_ratio(self):
        reports = [
            make_report(pid="p01", name="Zoe", gate_answers=[
                {"id": 1, "question": "Q1?", "verdict": "pass"}
            ]),
            make_report(pid="p02", name="Marcus", gate_answers=[
                {"id": 1, "question": "Q1?", "verdict": "pass"}
            ]),
            make_report(pid="p03", name="Grace", gate_answers=[
                {"id": 1, "question": "Q1?", "verdict": "fail"}
            ]),
        ]
        question = agg.aggregate(
            reports, pass_threshold=0.67,
            expected_persona_ids=["p01", "p02", "p03"],
            expected_gate_questions={"Q1": "Q1?"},
        )["gate_evaluation"]["questions"][0]
        self.assertEqual(question["pass_rate"], 0.67)
        self.assertFalse(question["meets_threshold"])

    def test_coverage_comparison_uses_unrounded_ratio(self):
        reports = [
            make_report(pid="p01", name="Zoe", gate_answers=[
                {"id": 1, "question": "Q1?", "verdict": "pass"}
            ]),
            make_report(pid="p02", name="Marcus", gate_answers=[
                {"id": 1, "question": "Q1?", "verdict": "pass"}
            ]),
            make_report(pid="p03", name="Grace", gate_answers=[]),
        ]
        question = agg.aggregate(
            reports, pass_threshold=0.5, min_gate_coverage=0.67,
            expected_persona_ids=["p01", "p02", "p03"],
            expected_gate_questions={"Q1": "Q1?"},
        )["gate_evaluation"]["questions"][0]
        self.assertEqual(question["coverage"], 0.67)
        self.assertFalse(question["meets_coverage"])

    def test_missing_gate_answer_fails_default_coverage(self):
        r1 = make_report(pid="p01", name="Zoe", gate_answers=[
            {"id": 1, "question": "Understand?", "verdict": "pass"},
        ])
        r2 = make_report(pid="p02", name="Marcus", gate_answers=[])
        gates = agg.aggregate(
            [r1, r2], expected_persona_ids=["p01", "p02"],
            expected_gate_questions={"Q1": "Understand?"},
        )["gate_evaluation"]
        self.assertEqual(gates["status"], "FAIL SYNTHETIC")
        self.assertEqual(gates["questions"][0]["coverage"], 0.5)
        self.assertFalse(gates["questions"][0]["meets_coverage"])

    def test_gate_evaluation_requires_expected_persona_ids(self):
        report = make_report(pid="p01", name="Zoe", gate_answers=[
            {"id": 1, "question": "Understand?", "verdict": "pass"}
        ])
        gates = agg.aggregate(
            [report], expected_gate_questions={"Q1": "Understand?"}
        )["gate_evaluation"]
        self.assertEqual(gates["status"], "INVALID SYNTHETIC")
        self.assertIn("expected persona IDs", gates["errors"][0])

    def test_entirely_missing_persona_reduces_gate_coverage(self):
        report = make_report(pid="p01", name="Zoe", gate_answers=[
            {"id": 1, "question": "Understand?", "verdict": "pass"}
        ])
        metrics = agg.aggregate(
            [report], expected_persona_ids=["p01", "p02"],
            expected_gate_questions={"Q1": "Understand?"},
        )
        gates = metrics["gate_evaluation"]
        self.assertEqual(gates["status"], "FAIL SYNTHETIC")
        self.assertEqual(gates["questions"][0]["coverage"], 0.5)
        self.assertEqual(metrics["missing_personas"], ["p02"])

    def test_declared_gate_without_answers_is_included_and_fails(self):
        gates = agg.aggregate(
            [make_report(pid="p01", name="Zoe")],
            gate_thresholds={"Q3": 0.60},
            expected_persona_ids=["p01"],
            expected_gate_questions={"Q3": "Complete the gate?"},
        )["gate_evaluation"]
        self.assertEqual(gates["status"], "FAIL SYNTHETIC")
        self.assertEqual(gates["questions"][0]["id"], "Q3")
        self.assertEqual(gates["questions"][0]["coverage"], 0.0)

    def test_conflicting_question_text_makes_gate_invalid(self):
        r1 = make_report(pid="p01", name="Zoe", gate_answers=[
            {"id": 1, "question": "Understand?", "verdict": "pass"},
        ])
        r2 = make_report(pid="p02", name="Marcus", gate_answers=[
            {"id": 1, "question": "No mistaps?", "verdict": "pass"},
        ])
        gates = agg.aggregate(
            [r1, r2], expected_persona_ids=["p01", "p02"],
            expected_gate_questions={"Q1": "Understand?"},
        )["gate_evaluation"]
        self.assertEqual(gates["status"], "INVALID SYNTHETIC")
        self.assertTrue(any("conflicting question text" in error for error in gates["errors"]))

    def test_gate_evaluation_requires_declared_question_text(self):
        report = make_report(pid="p01", name="Zoe", gate_answers=[
            {"id": 1, "question": "Understand?", "verdict": "pass"}
        ])
        gates = agg.aggregate(
            [report], expected_persona_ids=["p01"]
        )["gate_evaluation"]
        self.assertEqual(gates["status"], "INVALID SYNTHETIC")
        self.assertTrue(any("expected gate questions" in error for error in gates["errors"]))

    def test_report_question_must_match_declared_gate_question(self):
        report = make_report(pid="p01", name="Zoe", gate_answers=[
            {"id": 1, "question": "Easier substituted question?", "verdict": "pass"}
        ])
        gates = agg.aggregate(
            [report], expected_persona_ids=["p01"],
            expected_gate_questions={"Q1": "Canonical hard question?"},
            gate_thresholds={"Q1": 1.0},
        )["gate_evaluation"]
        self.assertEqual(gates["status"], "INVALID SYNTHETIC")
        self.assertIn("does not match declared question", gates["errors"][0])

    def test_csv_export(self):
        r1 = make_report(pid="p01", name="Zoe", gate_answers=[
            {"id": 1, "question": "Q1?", "verdict": "pass"}
        ])
        r2 = make_report(pid="p02", name="Marcus", gate_answers=[
            {"id": 1, "question": "Q1?", "verdict": "fail"}
        ])
        m = agg.aggregate(
            [r1, r2], expected_persona_ids=["p01", "p02"],
            expected_gate_questions={"Q1": "Q1?"},
        )
        headers, rows = agg.to_csv([r1, r2], m)
        self.assertIn("Persona ID", headers)
        self.assertIn("Q1 Verdict", headers)
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0][0], "p01")
        self.assertEqual(rows[0][-1], "pass")
        self.assertEqual(rows[1][0], "p02")
        self.assertEqual(rows[1][-1], "fail")

    def test_csv_formula_injection_neutralized(self):
        malicious = make_report(one_line_verdict='=HYPERLINK("http://evil.example","click")',
                                quit_trigger={"fired": True, "what": "+SUM(1,2)", "at": "@cmd"})
        m = agg.aggregate([malicious])
        headers, rows = agg.to_csv([malicious], m)
        flat = [str(c) for c in rows[0]]
        for cell in flat:
            self.assertFalse(str(cell).startswith(("=", "+", "-", "@")),
                             f"unneutralized formula cell: {cell!r}")

    def test_markdown_pipe_in_verdict_escaped(self):
        reports = [make_report(one_line_verdict="good game | bad front door")]
        md = agg.to_markdown(agg.aggregate(reports), "t")
        self.assertIn("good game \\| bad front door", md)
        row = [line for line in md.splitlines() if "| Diego" in line][0]
        self.assertEqual(row.count("|") - row.count("\\|"), 7)

    def test_markdown_free_text_cannot_inject_headings(self):
        report = make_report(
            gate_answers=[{
                "id": 1, "question": "Safe?", "verdict": "fail",
                "details": "no\n\n# FAKE PASS SYNTHETIC",
            }],
            blind_spots=["gap\n\n# forged"],
        )
        metrics = agg.aggregate(
            [report], expected_persona_ids=["p04"],
            expected_gate_questions={"Q1": "Safe?"},
        )
        markdown = agg.to_markdown(metrics, "title\n# forged title")
        self.assertNotIn("\n# FAKE PASS SYNTHETIC", markdown)
        self.assertNotIn("\n# forged", markdown)

    def test_unknown_confidence_overall_is_rejected(self):
        err = io.StringIO()
        with tempfile.TemporaryDirectory() as d:
            write(d, "p01.json", make_report(confidence_overall="very_high"))
            with contextlib.redirect_stderr(err):
                reports = agg.load_reports(d)
        self.assertEqual(reports, [])
        self.assertIn("confidence_overall", err.getvalue())
        self.assertIn("very_high", err.getvalue())


class CliEndToEndTests(unittest.TestCase):
    def test_cli_writes_strict_per_question_gate_outputs(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            reports_dir = os.path.join(temp_dir, "reports")
            out_dir = os.path.join(temp_dir, "out")
            os.makedirs(reports_dir)
            r1 = make_report(pid="p01", name="Zoe", gate_answers=[
                {"id": 1, "question": "Understand?", "verdict": "pass"},
                {"id": 2, "question": "No mistaps?", "verdict": "pass"},
            ])
            r2 = make_report(pid="p02", name="Marcus", gate_answers=[
                {"id": 1, "question": "Understand?", "verdict": "pass"},
                {"id": 2, "question": "No mistaps?", "verdict": "fail"},
            ])
            write(reports_dir, "p01.json", r1)
            write(reports_dir, "p02.json", r2)
            result = subprocess.run(
                [
                    sys.executable, os.path.join(_HERE, "aggregate_feedback.py"), reports_dir,
                    "--out", out_dir, "--expected-personas", "p01,p02",
                    "--gate-question", "Q1=Understand?",
                    "--gate-question", "Q2=No mistaps?",
                    "--gate-threshold", "Q1=80",
                    "--gate-threshold", "Q2=100", "--min-gate-coverage", "100",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr.decode("utf-8", "replace"))
            with open(os.path.join(out_dir, "panel_metrics.json"), encoding="utf-8") as handle:
                metrics = json.load(handle)
            self.assertEqual(metrics["gate_evaluation"]["status"], "FAIL SYNTHETIC")
            self.assertEqual(metrics["gate_evaluation"]["questions"][1]["threshold"], 1.0)
            self.assertNotIn("keep_playing", metrics)
            self.assertTrue(os.path.isfile(os.path.join(out_dir, "panel_summary.md")))
            self.assertTrue(os.path.isfile(os.path.join(out_dir, "panel_matrix.csv")))

    def test_no_csv_removes_stale_generated_matrix(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            reports_dir = os.path.join(temp_dir, "reports")
            out_dir = os.path.join(temp_dir, "out")
            os.makedirs(reports_dir)
            os.makedirs(out_dir)
            write(reports_dir, "p04.json", make_report())
            stale_csv = os.path.join(out_dir, "panel_matrix.csv")
            with open(stale_csv, "w", encoding="utf-8") as handle:
                handle.write("stale")
            result = subprocess.run(
                [sys.executable, os.path.join(_HERE, "aggregate_feedback.py"), reports_dir,
                 "--out", out_dir, "--no-csv"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr.decode("utf-8", "replace"))
            self.assertFalse(os.path.exists(stale_csv))

    def test_unexpected_persona_is_clean_cli_error_without_traceback(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            write(temp_dir, "p04.json", make_report())
            result = subprocess.run(
                [sys.executable, os.path.join(_HERE, "aggregate_feedback.py"), temp_dir,
                 "--expected-personas", "p01"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
            )
        stderr = result.stderr.decode("utf-8", "replace")
        self.assertEqual(result.returncode, 2)
        self.assertIn("unexpected persona", stderr)
        self.assertNotIn("Traceback", stderr)


class ExtractJsonTests(unittest.TestCase):
    def test_nested_braces_in_strings(self):
        text = 'junk { not json } then {"persona_name": "Alex", "note": "a {b} \\" c"} end'
        obj = agg._extract_json_object(text)
        self.assertEqual(obj["persona_name"], "Alex")

    def test_no_json_returns_none(self):
        self.assertIsNone(agg._extract_json_object("no braces here"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
