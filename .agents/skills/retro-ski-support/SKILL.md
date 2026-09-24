---
name: retro-ski-support
description: "Router wsparcia dla gry retro-ski-jumping (Canvas2D, skoki narciarskie, pixel-art DOS). Wybierz dos-pixel-art przy grafice, ski-jump-aero przy fizyce lotu, albo jeden z 12 wyselekcjonowanych skilli istniejacych. Uzyj zanim zaczniesz zadanie P13-P40."
---

# retro-ski-support — router wsparcia gry

Gra: przegladarkowe skoki narciarskie, TypeScript + Vite + Canvas2D 960x540,
styl DOS pixel-art, fizyka 120 Hz. Ten skill NIE implementuje gry.
Wskazuje najmniejszy zestaw pomocy do biezacego zadania.

## Najpierw przeczytaj (obowiazkowe)

1. `AGENTS.md`, `docs/NEXT_SESSION_PROMPT.md` (aktywny pakiet PKG-004),
   `docs/PACKAGE_WORKFLOW.md` (regula zamkniecia).
2. Dopiero potem skill z ponizszej tabeli — jeden, nie wszystkie.

## Skille projektowe (nowe, priorytet)

| Zadanie | Skill |
|---|---|
| Sprite'y, scena stadionu, font bitmapowy, linie K/HS, palety | `dos-pixel-art` |
| Lot, wiatr, wybicie, telemark, strojenie TUNE, tabele symulacji | `ski-jump-aero` |

## Wyselekcjonowane skille istniejace (repo ma ~390; uzywaj tylko tych)

| Zadanie | Skill | Uwaga |
|---|---|---|
| Generowanie sprite'ow AI + snap do siatki | `imagine-pixel` | Obowiazkowy post-snap; JPEG zakazany |
| Arkusze animacji postaci | `imagine-sprite` | Trzymaj 1 reference frame (concurrency 1) |
| Czyszczenie halo/orphan pixels po generacji | `pixelart-cleanup` | Najpierw domyslne progi |
| Szybkie prototypy sprite'ow (PixelLab) | `pixellab`, `pixellab-api` | Tylko prototyp; final recznie |
| Hierarchia i czytelnosc sceny, feedback | `directing-game-visuals` | Zgodne z ART_UI_AUDIO rozdz. 3 |
| Typografia bitmapowa w grze webowej | `styling-web-game-typography` | Polskie znaki, stała szerokosc cyfr |
| Balans: monotonne vs eksploracyjne polityki | `evaluating-gameplay-balance` | Telemetria z deterministycznymi seedami |
| Niezmienniki mechaniki (anty-idle, anty-mashing) | `implementing-gameplay-invariants` | Przed implementacja mechaniki |
| Testy Playwright gry | `qa-game`, `game-qa` | Dowody do `docs/evidence/PKG-NNN/` |
| Performance petli gry | `game-perf` | Dopiero po pomiarze p50/p95/p99 (P15) |

Wszystkie powyzsze istnieja w `.agents/skills/`. Nie instaluj duplikatow.

## Czego NIE uzywac w tym projekcie

- Skille Godot/Unity/Phaser/Three.js (`godot-*`, `phaser*`, `threejs-*`) —
  gra to Canvas2D; P15 wprost zakazuje PixiJS „na zapas".
- Skille powiesciowe, marketingowe, HR (`story-*`, `novel-*`, `seo-*`) —
  nie dotycza gry.
- Generatory 3D, NFT, avatarow (`meshyai`, `add-3d-assets`, `imagine-char`) —
  poza stylem DOS pixel-art.

## Propozycje MCP (opt-in, nieaktywne)

Plik `.mcp.json.example` w root zawiera 2 propozycje do pixel-artu:
`pixelorama` (Pixelorama-MCP, MIT, darmowy edytor; 70 narzedzi, wspiera
Claude/Codex/Antigravity) oraz `pxcli` (pxcli-mcp, lekki, `npx`, operacje
na canvas do 256x256). Oba wymagaja recznej aktywacji — kopiuj tylko gdy
P15 (wzorzec pixel artu) tego potrzebuje. Warianty oparte o platny Aseprite
(`pixel-mcp`, `aseprite-mcp`) odrzucono jako domyslne z powodu licencji.

## Zasady twarde (z AGENTS.md)

- Zakaz zmian kodu gry poza zakresem aktywnego pakietu.
- Najprostsze rozwiazanie dajace dobry efekt; zadnej infrastruktury na zapas.
- Jedno review po calym pakiecie; testy sluzace implementacji to nie review.
