#!/usr/bin/env python3
"""Regression tests for prepare_playtest.py (stdlib only)."""

import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import unittest
from types import ModuleType


_HERE = os.path.dirname(os.path.abspath(__file__))
_SCRIPT = os.path.join(_HERE, "prepare_playtest.py")
_SPEC = importlib.util.spec_from_file_location("prepare_playtest", _SCRIPT)
assert _SPEC is not None and _SPEC.loader is not None
prep = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(prep)
assert isinstance(prep, ModuleType)


class ReferenceTests(unittest.TestCase):
    def test_missing_reference_fails_loudly(self):
        with self.assertRaises(FileNotFoundError):
            prep.load_ref("definitely-missing-reference.md")

    def test_unfilled_placeholders_are_detected(self):
        found = prep.find_unfilled_placeholders(
            "Game: <Game name>\nQuestion: <Q1 exact wording>\nShort: <X>\n"
            "Link: <https://example.com/build>\nType: List<string>\nAngle: 2 < 3"
        )
        self.assertEqual(found, ["<Game name>", "<Q1 exact wording>", "<X>"])


class PromptTests(unittest.TestCase):
    def test_lean_prompt_preserves_epistemic_boundaries(self):
        _, _, prompt = prep.build_persona_prompt(
            "p04", "Artifact: written description", lang="Polish", lean=True
        )
        self.assertIn("model-generated hypothesis", prompt)
        self.assertIn("Do not claim to be a real person", prompt)
        self.assertIn("Do not infer behavior from demographics", prompt)
        self.assertIn("session_was", prompt)
        self.assertNotIn("100% in character", prompt)
        self.assertNotIn("TITAN loop", prompt)

    def test_full_prompt_does_not_force_disagreement(self):
        _, _, prompt = prep.build_persona_prompt(
            "p04", "Artifact: written description", lang="Polish", lean=False
        )
        self.assertNotIn("must disagree", prompt.lower())
        self.assertNotIn("healthy panel disagrees", prompt.lower())
        self.assertIn("independently", prompt.lower())

    def test_single_persona_prompt_forbids_fabricated_panel_counts(self):
        _, _, prompt = prep.build_persona_prompt(
            "p04", "Artifact: written description", lang="Polish", lean=True
        )
        self.assertIn("Never report panel counts or coverage from this one run", prompt)
        self.assertIn("Only the aggregator may compute a panel gate status", prompt)

    def test_accessibility_focus_loads_boundary_independent_of_persona(self):
        for lean in (False, True):
            _, _, prompt = prep.build_persona_prompt(
                "p01", "Artifact: static screen", lang="Polish", lean=lean,
                include_accessibility=True,
            )
            self.assertIn("Accessibility review boundary", prompt)
            self.assertIn("cannot represent disabled players", prompt)
            _, _, narrative_prompt = prep.build_persona_prompt(
                "p08", "Focus: narrative only", lang="Polish", lean=lean,
                include_accessibility=False,
            )
            self.assertNotIn("Accessibility review boundary", narrative_prompt)


class CliTests(unittest.TestCase):
    def test_json_output_survives_cp1250_environment(self):
        env = os.environ.copy()
        env["PYTHONIOENCODING"] = "cp1250"
        result = subprocess.run(
            [sys.executable, _SCRIPT, "--panel", "p04", "--json", "--lean"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr.decode("utf-8", "replace"))
        self.assertIn("Diego", result.stdout.decode("utf-8"))

    def test_cli_rejects_unfilled_brief_template(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            brief = os.path.join(temp_dir, "brief.md")
            with open(brief, "w", encoding="utf-8") as handle:
                handle.write("# Brief\nGame: <Game name>\n")
            result = subprocess.run(
                [sys.executable, _SCRIPT, brief, "--panel", "p04", "--json"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
            )
        self.assertEqual(result.returncode, 2)
        self.assertIn("unfilled placeholder", result.stderr.decode("utf-8"))

    def test_all_panel_json_contains_twenty_nonempty_isolated_prompts(self):
        result = subprocess.run(
            [sys.executable, _SCRIPT, "--panel", "all", "--json"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr.decode("utf-8", "replace"))
        payload = json.loads(result.stdout.decode("utf-8"))
        self.assertEqual(len(payload), 20)
        self.assertEqual([item["persona_id"] for item in payload], [f"p{i:02d}" for i in range(1, 21)])
        self.assertTrue(all(item["prompt"].strip() for item in payload))

    def test_output_directory_rejects_stale_prompt_files(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            stale = os.path.join(temp_dir, "prompt-p99-stale.md")
            with open(stale, "w", encoding="utf-8") as handle:
                handle.write("stale")
            result = subprocess.run(
                [sys.executable, _SCRIPT, "--panel", "p04", "--out", temp_dir],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
            )
        self.assertEqual(result.returncode, 2)
        self.assertIn("stale prompt file", result.stderr.decode("utf-8"))

    def test_missing_selected_persona_is_a_hard_error(self):
        original_dir = prep._PERSONAS_DIR
        with tempfile.TemporaryDirectory() as temp_dir:
            prep._PERSONAS_DIR = temp_dir
            try:
                with self.assertRaises(FileNotFoundError):
                    prep.prepare_prompts(["p04"], "brief", "Polish", False)
            finally:
                prep._PERSONAS_DIR = original_dir


if __name__ == "__main__":
    unittest.main(verbosity=2)
