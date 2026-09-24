#!/usr/bin/env python3
"""Publication-contract tests for the skill package (stdlib only)."""

import importlib.util
import json
import os
import re
import unittest
from types import ModuleType


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class PackageTests(unittest.TestCase):
    def test_required_release_files_exist(self):
        required = [
            "SKILL.md", "LICENSE", "agents/openai.yaml",
            "references/evidence-and-limitations.md",
            "references/accessibility-review.md",
            "references/report.schema.json",
        ]
        for relative in required:
            self.assertTrue(os.path.isfile(os.path.join(ROOT, relative)), relative)

    def test_no_generated_or_repo_only_junk(self):
        forbidden_names = {"__pycache__", ".mypy_cache", ".ruff_cache"}
        found = []
        for current, dirs, files in os.walk(ROOT):
            for name in dirs:
                if name in forbidden_names:
                    found.append(os.path.relpath(os.path.join(current, name), ROOT))
            for name in files:
                if (name.endswith((".pyc", ".pyo"))
                        or name in {"sync_skill_mirrors.py", "README.md"}):
                    found.append(os.path.relpath(os.path.join(current, name), ROOT))
        self.assertEqual(found, [])

    def test_all_markdown_links_resolve_or_are_web_links(self):
        missing = []
        link_pattern = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
        for current, _, files in os.walk(ROOT):
            for name in files:
                if not name.endswith(".md"):
                    continue
                path = os.path.join(current, name)
                with open(path, "r", encoding="utf-8") as handle:
                    text = handle.read()
                for target in link_pattern.findall(text):
                    if target.startswith(("https://", "http://", "#")):
                        continue
                    target_path = target.split("#", 1)[0]
                    resolved = os.path.normpath(os.path.join(current, target_path))
                    if not os.path.exists(resolved):
                        missing.append(f"{os.path.relpath(path, ROOT)} -> {target}")
        self.assertEqual(missing, [])

    def test_schema_required_fields_match_runtime(self):
        with open(os.path.join(ROOT, "references", "report.schema.json"), encoding="utf-8") as handle:
            schema = json.load(handle)
        script = os.path.join(ROOT, "scripts", "aggregate_feedback.py")
        spec = importlib.util.spec_from_file_location("aggregate_feedback_contract", script)
        assert spec is not None and spec.loader is not None
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        assert isinstance(module, ModuleType)
        self.assertEqual(set(schema["required"]), module._REQUIRED_FIELDS)
        self.assertEqual(len(schema["allOf"]), 21)
        self.assertTrue(schema["properties"]["gate_answers"]["uniqueItems"])
        runtime_rules = "\n".join(schema["x-runtime-validations"])
        self.assertIn("unique", runtime_rules)
        self.assertIn("canonical persona_name", runtime_rules)
        self.assertIn("imagined", runtime_rules)

    def test_persona_roster_is_complete(self):
        persona_dir = os.path.join(ROOT, "references", "personas")
        names = sorted(name for name in os.listdir(persona_dir) if name.endswith(".md"))
        self.assertEqual(len(names), 20)
        self.assertEqual([name[:3] for name in names], [f"p{i:02d}" for i in range(1, 21)])

    def test_removed_overclaims_do_not_return(self):
        banned = [
            "predicts where real", "matching reality", "mandatory disagreement",
            "false-positive ~30%", "100% portability", "simulate real-user",
        ]
        documents = []
        for current, _, files in os.walk(ROOT):
            for name in files:
                if name.endswith(".md"):
                    with open(os.path.join(current, name), encoding="utf-8") as handle:
                        documents.append(handle.read().casefold())
        combined = "\n".join(documents)
        for phrase in banned:
            self.assertNotIn(phrase.casefold(), combined)


if __name__ == "__main__":
    unittest.main(verbosity=2)
