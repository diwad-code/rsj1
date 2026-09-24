#!/bin/sh
# SessionStart hook for researchbyskills.
# Prints a short reminder of the research rules and checks that the tooling
# needed by the scholarly-database MCP servers is available. Read-only, no network.

printf '%s\n' "researchbyskills — evidence-only research workbench."
printf '%s\n' "Rules: peer-reviewed sources + current scientific consensus only;"
printf '%s\n' "no sponsored/promotional/predatory sources as evidence; never fabricate a citation."
printf '%s\n' "See CLAUDE.md and .claude/skills/ (/research, /fact-check, ...)."
printf '%s\n' "----"

# Check the runtimes the MCP servers in .mcp.json rely on.
missing=""
if ! command -v uvx >/dev/null 2>&1 && ! command -v uv >/dev/null 2>&1; then
  missing="$missing uv/uvx(paper-search)"
fi
if ! command -v npx >/dev/null 2>&1; then
  missing="$missing npx(openalex)"
fi

if [ -n "$missing" ]; then
  printf '%s\n' "MCP note: missing runtimes ->$missing."
  printf '%s\n' "Scholarly-database MCP may be unavailable; skills will fall back to"
  printf '%s\n' "WebSearch restricted to scholarly domains (references/database-guide.md)."
else
  printf '%s\n' "MCP runtimes present (uv + npx). Scholarly-database servers should load."
fi
