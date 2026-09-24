# EVAL-TOOLING-001 — prompt dla glownego agenta kodujacego

Skopiuj calosc ponizej jako samodzielny prompt nowej sesji.

---

Ocen przydatnosc warstwy wsparcia TOOLING-001 dla gry retro-ski-jumping.
Katalog: `C:\retro-ski-jumping`. NIC NIE IMPLEMENTUJ — to ocena, nie pakiet.
Nie zmieniaj kodu gry, specyfikacji, planu ani `docs/NEXT_SESSION_PROMPT.md`.

## Lektura (tylko ta)

1. `AGENTS.md` (twarda zasada prostoty), `docs/tooling/README.md`,
   `.agents/skills/retro-ski-support/SKILL.md`.
2. `.agents/skills/ski-jump-aero/SKILL.md` i
   `.agents/skills/dos-pixel-art/SKILL.md` — cale (krotkie).
3. `docs/NEXT_SESSION_PROMPT.md` — tylko zakres P13–P15 (kontekst zadan).
4. Pliki per narzedzie: `.codex/skills/retro-ski-support/SKILL.md`,
   `.claude/skills/retro-ski-support/SKILL.md`,
   `.gemini/skills/retro-ski-support/SKILL.md`, `.vscode/settings.json`,
   `.vscode/tasks.json`, `.mcp.json.example`.

## Zadanie

Dla kazdego z 5 obszarow wystaw werdykt KEEP / DROP / FIX i jedno zdanie
uzasadnienia: (1) router `retro-ski-support` + lista 12 skilli, (2) skill
`ski-jump-aero`, (3) skill `dos-pixel-art`, (4) configi VS Code Insiders,
(5) propozycje MCP (Pixelorama-MCP / pxcli-mcp).

Sprawdz konkretnie: czy `ski-jump-aero` jest zgodny z `docs/GAMEPLAY_SPEC.md`
rozdz. 2–5 (rownania, znaki wiatru, przedzialy TUNE)? czy `dos-pixel-art`
jest zgodny z `docs/ART_UI_AUDIO.md` (siatka, palety, generator K/HS,
zakazy CRT/bloom)? czy lista 12 skilli nie zawiera pozycji zbednych dla
P13–P15? czy ktoregos potrzebnego skilla brakuje? czy propozycje MCP sa
warte aktywacji na P15, czy odrzucic?

## Wynik

Zapisz `docs/tooling/EVAL_RESULT.md`: tabela 5 werdyktow, lista bledow
faktograficznych (plik:linia, poprawka), oraz maksymalnie 3 poprawki do
wprowadzenia. Bez nowych skilli, bez zmian w grze. Po zapisie zakoncz —
nie implementujesz poprawek w tej sesji.
