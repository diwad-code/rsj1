# Wsparcie agentow — propozycje (TOOLING-001)

Status: **PROPOZYCJA, nieaktywna domyslnie**. Nie zmienia kodu gry, zasad,
planu ani dowodow PKG-001–003. Aktywny pakiet wykonawczy to nadal PKG-004
(`docs/NEXT_SESSION_PROMPT.md` — nietkniety).

## Co zainstalowano i gdzie

| Plik | Dla kogo | Tresc |
|---|---|---|
| `.agents/skills/retro-ski-support/SKILL.md` | wszyscy (kanon) | Router: 2 nowe mikro-skille + 12 wyselekcjonowanych istniejacych |
| `.agents/skills/ski-jump-aero/SKILL.md` | fizyka lotu | Rownania, konwencje wiatru, przedzialy TUNE, walidacja |
| `.agents/skills/dos-pixel-art/SKILL.md` | grafika | Siatka 960×540, palety, generator K/HS, banki sprite'ow, zakazy |
| `.codex/skills/retro-ski-support/SKILL.md` | Codex CLI | Wskazanie na kanon |
| `.claude/skills/retro-ski-support/SKILL.md` | Claude Code | Wskazanie na kanon |
| `.gemini/skills/retro-ski-support/SKILL.md` | Antigravity CLI | Wskazanie na kanon |
| `.vscode/settings.json`, `.vscode/tasks.json` | VS Code Insiders | Komfort edytora + taski npm (bez nowych polecen) |
| `.vscode/extensions.json` | VS Code Insiders | +3 rekomendacje: Playwright, Vitest, Error Lens |
| `.mcp.json.example` + komentarze w `.codex/config.toml` | MCP opt-in | Pixelorama-MCP (typ) / pxcli-mcp (lekki); domyslnie wylaczone |
| `docs/tooling/EVAL_PROMPT.md` | glowny agent | Prompt oceny przydatnosci |

## Dlaczego tak (research w skrocie)

- Repo ma juz ~300–390 skilli (kopie w `.agents`, `.agent`, `.gemini/...`),
  w wiekszosci generyczne (Godot, powiesci, marketing). Doinstalowanie
  kolejnych paczek byloby infrastruktura na zapas — zamiast tego router
  wybiera 12 istniejacych istotnych dla Canvas2D + 2 brakujace mikro-skille.
- Grafika: `imagine-pixel` (snap do siatki) + `pixelart-cleanup` (halo)
  pokrywaja pipeline; brakowalo kontraktu projektu (palety, K/HS, banki) —
  stad `dos-pixel-art`.
- Mechanika: `physics-tuning` jest ogolnikowy (silniki 3D); brakowalo sciagi
  z modelu gry (vAir, 0,5ρv²SC, CL/CD, konwencje wiatru, TUNE) — stad
  `ski-jump-aero`. Literatura (Barnes/Tuplin/Walker 2025; Seo; Meile) uzyta
  jako intuicja ksztaltu krzywych, nie zrodlo stalych.
- MCP pixel-art 2026: Pixelorama-MCP (MIT, darmowy edytor, deklarowane
  wsparcie Claude/Codex/Antigravity) jako typ; pxcli-mcp (npx, lekki) jako
  fallback. Warianty Aseprite odrzucone jako domyslne (platna licencja).
- Skille Godot/Unity/Phaser/Three.js swiadomie wykluczone (TECHNICAL_DESIGN:
  Canvas2D; P15 zakazuje PixiJS na zapas).

## Weryfikacja (bez kodu gry)

- Parse JSONC (komentarze dozwolone w VS Code) wszystkich 4 plikow
  `.vscode/*.json` + `.mcp.json.example` — PASS.
- Odczyt wszystkich nowych SKILL.md — PASS.
- `npm run typecheck/test/build` — celowo NIE uruchamiane: zero zmian w `src/`.
