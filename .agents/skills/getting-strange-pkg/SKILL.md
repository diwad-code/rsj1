---
name: getting-strange-pkg
description: Work-package lifecycle of the Getting Strange Godot game — reading order, D-217 verification, no-git handoff, Godot-only scope.
license: MIT
compatibility: opencode
metadata:
  project: getting-strange
  engine: godot-4.7
---

# Getting Strange work package

Godot 4.7 narrative game. 640x360, 60 Hz, semantic InputMap. No git, no web
output (D-098), no external playtests (D-012, ADR-003). Files on disk are the
only state.

## Start

Read in order: `AGENTS.md`, `docs/INDEX.md`, `docs/CURRENT_STATE.md`,
`docs/NEXT_SESSION_PROMPT.md`, active spec, named sources/tests. Baseline
`pwsh -NoProfile -File .\tools\verify_docs.ps1`. Handoff is a hypothesis;
runtime and fresh gates are evidence.

## Build

Mega-packages 2x-5x (D-085), autonomously. Traversal canon
(`docs/TRAVERSAL_AND_OBSTACLE_DESIGN.md`) before any collider beyond
floor/walls — no arcade obstacles (D-099). Visual canon `VISUAL_DESIGN.md`.
Anchor/Yield comes from `scenes/prototype/anchor_lab.tscn`, never reinvented.
Save every edit immediately. Godot skills live in `.agents/skills/`
(`godot-*`); live inspection via `godot_*` MCP tools (transient bridge, never
commit addons).

## Verify (D-217)

Full `.\tools\verify.ps1` (124 gates + log policy) is mandatory on
shared-monolith touch, new contracts, checkpoints, 1-in-5 packages. Otherwise
scoped: `verify_docs.ps1` + one `tools/run_gate.ps1 -Script` per gate, with a
one-sentence blast justification. New gates PASS 3x. Never lower thresholds.
Headless capture hangs — frames only via normal display driver.

## Close

Tests, `CURRENT_STATE.md`, `SESSION_LOG.md` append, `NEXT_SESSION_PROMPT.md`
replace, roadmap/decisions/risks, `snapshot.ps1 -Package PKG-NNNN`, report
with tests, limitations, package id, handoff. Gates prove contracts only.
