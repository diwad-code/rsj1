# PKG-010 / H02 — rzeczywiste zrzuty i nagranie przeglądarkowe

Wszystkie artefakty w [`artifacts/`](artifacts/) ponownie zapisano na finalnym buildzie
Canvas2D z **testu Playwright `tests/browser/h02.spec.ts`**, viewport 960×540,
przy sterowaniu klawiaturą. To nie jest fixture grafiki ani dowód odbioru
estetyki przez model; **VISUAL USER PASS 23.09.2026** pochodzi od użytkownika
(„Akceptuję H02”). Art fixture diagnostyczny
w `ART_MANIFEST.md` nie był źródłem poniższych obrazów.

| Plik | Co pokazuje | SHA-256 |
|---|---|---|
| [h02-menu-960x540.png](artifacts/h02-menu-960x540.png) | Wybrana H02 K125/HS140 i belka AUTO w menu | `19b343cb2bb6f798744a0a9b7c8ca6175d283024af9e7c351f1e75cf7d0f5abf` |
| [h02-scene-960x540.png](artifacts/h02-scene-960x540.png) | Produkcyjny obraz H02 przed opuszczeniem belki | `d962cf1beeae2fcd687388d6dd7fa3122b797ef19fdb7a51c84f316acc9539b6` |
| [h02-technical-960x540.png](artifacts/h02-technical-960x540.png) | Widok techniczny H02: etykiety P111/K125/HS140 nie nakładają się, oddzielne LEAD i REC | `6ecd5c32fe96ea6794a4dbafe51dd5017c8d169e1c2db3c0a5de9875a7131200` |
| [h02-real-result-960x540.png](artifacts/h02-real-result-960x540.png) | Wynik **120,0 m, ustany**, po prawdziwym skoku treningowym z klawiatury, AUTO | `b833bb31d7a86836186467ac4aa6e0c4e58791f41f3b7242db754ff48eee3364` |
| [h02-real-replay-960x540.png](artifacts/h02-real-replay-960x540.png) | Kadr Flight aktualnego replaya po odrębnym skoku konkursowym z klawiatury (krótki skok, wynik zapisany 34,5 m); debug FIZYKA/SKOCZNIA/ZASADY i ZAPIS nie kolidują | `403ecac2405d29f2365d823522540fff5bad12fe841d390dbc5105a95252bf3d` |
| [h02-real-keyboard-jump-960x540.webm](artifacts/h02-real-keyboard-jump-960x540.webm) | Wideo całej próby treningowej: rzeczywiste wejście, najazd, wybicie, lot, lądowanie i ekran wyniku | `841ff3f84864eb342cd3c7b3609db7e771a171407a74389282399e48af86b17a` |

Weryfikacja finalnego renderera: `npm run build` — **PASS**, Vite 8.3.0,
36 modułów, `dist/assets/index-Cul-wtiG.js` 198,28 kB / gzip 62,33 kB;
`npx playwright test tests/browser/h02.spec.ts --workers=1
--output=docs/evidence/PKG-010/tmp-browser-final` — **3/3 PASS**;
`npx playwright test tests/browser/h01.spec.ts --workers=1
--output=docs/evidence/PKG-010/tmp-browser-final-h01` — **3/3 PASS**.
Po finalnym przebiegu obrazy H02 techniczny i replay obejrzano w skali
960×540: etykiety P/K/HS są rozdzielone; linie debugowe i ZAPIS w HUD
replaya mają osobne wiersze i nie zachodzą na siebie. Próba rekordowa
149,5 m bez podpórki jest dowodem deterministycznej symulacji z
`tests/h02.test.ts`, **nie** została odtworzona tą nagraną próbą przeglądarkową.
Na finalnym kodzie rodzic potwierdził `npm run typecheck` **PASS**,
`npm test` **PASS — 34 pliki / 295 testów** oraz `npm run build` **PASS**
(36 modułów, JS 198,28 kB / gzip 62,33 kB). Wspólne
`npm run test:e2e -- --workers=1 --output=docs/evidence/PKG-010/tmp-browser-common`
**przekroczyło limit shella 240 000 ms** po 18/25 testach PASS; nie jest to
PASS tego polecenia. Pozostałe 7/7 przeszły osobno przez
`npx playwright test tests/browser/jump.spec.ts:824 tests/browser/jump.spec.ts:876 tests/browser/shell.spec.ts --workers=1 --output=docs/evidence/PKG-010/tmp-browser-common-rest`.
Razem 25 przypadków zaliczonych w dwóch przebiegach, bez znanych porażek.
Końcowe review przeprowadził raz rodzic (bez nowego blokera), nie jest to
osobny odbiór graczy: zewnętrzny playtest jakościowy **NOT RUN**.
