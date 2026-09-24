# PKG-012 / P21-H04 — Planica, stan 24.09.2026

**COMPLETE — D/G/A/V wykonane, VISUAL USER PASS 24.09.2026 po dwóch
poprawkach wskazanych przez użytkownika; P21 COMPLETE.** P22 nie rozpoczęto.
Zewnętrzny PLAYABILITY NOT RUN. Gra przeglądarkowa TypeScript/Canvas2D,
bez homologowanego profilu FIS.

| Część | Stan | Dowód |
| --- | --- | --- |
| D | wykonane | [karta H04](../../hills/H04.md): K200/HS240, rekord 254,5 m (Domen Prevc, 30.03.2025); FACT oddzielone od ADAPT/TUNE |
| G | wykonane (kontynuacja 03) | `h04-inspired-4`, fizyka `pkg008-tune-9+h04-polar-1`, sesja `standard-h04-planica-flying-4`; wyniki niżej |
| A | wykonane | [manifest artu](ART_MANIFEST.md); banda rozbiegu przemalowana po odbiorze (niżej) |
| V | PASS techniczne + **VISUAL USER PASS** (werdykt niżej) | Playwright H04 3/3 PASS po poprawkach (`tmp-browser-h04-v4-r5`) |

## Kontynuacja 03 — przebudowa lotu H04 i AUTO (24.09.2026, przed odbiorem)

**Diagnoza z dowodem.** Ślady E2E v4/v4-r2: impuls wybicia 18–19 ticków przed
krawędzią zamiast 24, R wciśnięte przy 3,4–4,0 s z warunku wysokości ≤1,6 m,
kontakt 127–130 m. Headless z pilotem przeglądarkowym (opóźniony odczyt,
decyzje co N ticków) odtwarza klif: przy starej polarze późniejsze o 1 tick
wybicie daje 184 → 145 m, a pętla wolniejsza niż ~100 ms — upadki ~50 m.
Przyczyna: przesterowanie AoA wpada w klif 35→36° (CL 1,02→0,75, CD 0,90→1,40).

**Zmiana (tylko H04).** Opcjonalne `HillSpec.aero` (wersja + krzywa CL/CD);
`JumpSimulation` dopisuje wersję do `physicsVersion`, którą dziedziczą wyniki,
rekordy, sesja i replay. Polara `h04-polar-1`: 28° 1,08/0,75, 30° 1,12/0,78,
32° 1,09/0,77, 34° 1,06/0,82, 35° 1,02/0,90, 36° 0,95/1,05; ≤26° i ≥40° bez
zmian; pik nośności ≤ wspólnego. Pozostałe skocznie: brak `aero`, te same
obiekty parametrów (test). Sterowanie, belki, lądowanie, progi 265/276 i
faktory FIS bez zmian. Odrzucone kandydaty: B (wyższa półka) łamał sufity
246/265 m; C (niższa) skracał wszystko poniżej 180 m.

**AUTO.** Sufity spadły (233/252 m przy starej tabeli), więc przeliczono progi
bisekcją: najwyższa belka, której pełny zestaw 84 profili sweepu mieści się
w 240 m (w plecy) / 260 m (od 0), margines 0,25 m, zaokrąglone zachowawczo.
Tabela w `src/sport/safety.ts`; przy 0 m/s belka 10 (celowy skok 6→10 na zerze),
przy −0,59 m/s belka 8. Definicja AUTO jako surowego kontaktu bez zmian.

| Kryterium | Wynik |
| --- | --- |
| Skończony sweep + 23 granice AUTO | worstTail **239,73 m** (belka 8, −0,57), worstHead **259,74 m** (belka 4, +2,31); 0 naruszeń |
| Zwykły pilot headless (flow+29°, martwa strefa ±0,5°, opóźnienie 2–3 ticki, podmuchy pola konkursu, R 5 s / 3 s przy h ≤1,6 m, wybicie −4…+6 ticków) | AUTO 8: **196,2–205,6 m**, 28/28 landed ≥180 |
| Wolny pilot (opóźnienie 6–18 ticków, decyzje co 6–18 ticków, wybicie +4…+6) | 25/27 ≥180 m; 2 skrajne przypadki (150 ms + późne wybicie) 137–139 m, bez upadku |
| Nominał belka 6 / 0 m/s / R 5 s | landed **193,85 m** |
| +3,2 m/s, flow+28°, R 5 s | belka 1: landed 198,91 m, belka 2 (AUTO): 203,32 m; 0 dłoni, ≤260 |
| Rekord: belka 42, 0 m/s, flow+32°, R 5 s | raw **256,93 m**, zapis 256,5 m, 0 dłoni (asercja zakresowa); sąsiedztwo częściej z podpórką; telemark z belki 46 — upadek (266,18 m) |
| Przeglądarka, konkurs z belki AUTO | belka 8, wiatr −0,73 m/s, **landed 206,44 → 206 m** (asercja ≥180 m bez zmian) |
| Przeglądarka, trening | R belka 35: 225,24 → 225 m; T belka 31: 217,18 → 217 m |

## Polecenia i wyniki (kontynuacja 03)

1. `npm run typecheck` — PASS.
2. `npx vitest run tests/h04.test.ts tests/h01.test.ts tests/h02.test.ts` — 45/45 PASS
   (fixture H04 zaktualizowane: tabela AUTO, odczyty, izolacja v1–v3, asercje polary).
3. `npm test` — **36 plików / 316 testów PASS**.
4. `npm run build` — PASS; `npx playwright test tests/browser/h04.spec.ts --workers=1
   --output=docs/evidence/PKG-012/tmp-browser-h04-v4-r4` — **3/3 PASS**.
   Przeglądarkowych regresji H01–H03 nie powtarzano (zmiana dotyczy tylko H04;
   wspólne ścieżki pokrywa `npm test`) — NOT RUN w tej kontynuacji.

Materiał pokazany użytkownikowi do odbioru VISUAL (przed poprawkami; nowy katalog, 7 opublikowanych artefaktów i manifesty
nietknięte), SHA-256:

| Plik w `tmp-browser-h04-v4-r4/` | SHA-256 |
| --- | --- |
| `…full-video/h04-menu-960x540.png` | `9106c5991c74b63867097f505821d9c292cd3c89acfcd2affb311dabf656edee` |
| `…full-video/h04-scene-960x540.png` | `d8263f46ae98c50aeff9171a4510f51cf2d2e7e02f73bd92d891d6e183084dcd` |
| `…full-video/h04-technical-960x540.png` | `ec6dfc241cb3ec055051fbd647b4eb8067fce1410924c33b0eae59c588e0972f` |
| `…full-video/h04-result-parallel-960x540.png` | `9563d81d2076ab20d81e777a5feead913c5f02602ec36294141aeb1d4d1d22b8` |
| `…full-video/h04-result-telemark-960x540.png` | `d8c5ca518e5a654d2018b14d0eb0c736cd5e6efd4d3b355ed9c8e88312d4f9a3` |
| `…replay-isolation/h04-replay-flight-960x540.png` | `4a4e64bc13e057db86b5bf514690e6b1d68dba2b368bdadc0aef6b4416e9839c` |
| `…full-video/h04-real-keyboard-jumps-960x540.webm` (6,2 MB) | `ba02f9d493640f15bc919ed548d48cfe4c7c3626787efec7783ac3278ebda149` |

## Odbiór użytkownika i poprawki (24.09.2026)

Werdykt dosłownie: „1. kremowa banda przy rozbiegu jest w kolorze kremowym tak
jak niebo i się troche zlewa - zmień kolor bandy na ciemniejszy podobny do
reszty metalowych elementów skoczni. 2. belka nadal trochę zawysoko, obniż ją
o 2 pozycje. 3. resztę akceptuje, przygotuj dokumentacje i następny prompt.”

1. **Banda** (`drawPlanicaInrun` w `src/render/hillView.ts`): linia `#eec69d`
   zastąpiona ciemną stalą konstrukcji `steelDark` (2 px) z krawędzią
   `steelMid` (1 px). Zrzut sceny po zmianie: `tmp-browser-h04-v4-r5/…/h04-scene-960x540.png`.
   Użytkownik nie oglądał jeszcze tego zrzutu; akceptacja obejmuje resztę oprawy.
2. **Belka AUTO −2:** tabela progów w `src/sport/safety.ts` przesunięta o dwie
   belki w dół (skok na zerze 4→8; przy −0,59 m/s belka 6 zamiast 8).
   Sufity spadły: skończony sweep **234,74 m** w plecy (belka 18, −3,12) /
   **251,35 m** pod narty (belka 1, +3,2), 22 zmiany belki, 0 naruszeń.
   AUTO dla −3,2/−2/−1/0/+1/+2/+3,2 m/s: belki 18/10/7/8/5/2/1, nominalnie
   205,90/198,37/193,01/202,78/190,91/176,03/156,34 m. Zwykły pilot headless
   przy AUTO 6: 184,9–196,2 m (28/28 ≥180); wolny pilot (6–18 ticków): 17/27
   ≥180 m, min 121 m, bez upadku — mniejszy zapas niż przy belce 8.
   Rekord (belka 42) i polara bez zmian: 256,93 m, zapis 256,5 m, 0 dłoni.
3. Sprawdzenia po poprawkach: `npm run typecheck` PASS; celowane H04/H01/H02
   45/45 PASS; `npm test` **36/316 PASS**; `npm run build` PASS; Playwright H04
   **3/3 PASS** (`--output=docs/evidence/PKG-012/tmp-browser-h04-v4-r5`):
   konkurs z belki AUTO **6**, wiatr −0,73 m/s, landed **197,47 → 197 m**;
   trening R 222,37 → 222 m, T 216,03 → 216 m.

SHA-256 po poprawkach (manifest artu z 23.09 pozostaje historyczny i nie
opisuje tej wersji `hillView.ts`):

| Plik | SHA-256 |
| --- | --- |
| `src/render/hillView.ts` | `6a0ecb4a49c977f2a9191e7efdd13e4c994a1a21edb7dd5fbaefc3fcf4cc7516` |
| `src/simulation/hills/planicaFlying.ts` | `dc489b045fe207ffab4bdac252058944247a0f623b1e60275834ba91b767bede` |
| `src/sport/safety.ts` | `b361dc5fa2d1ef4fbb1ecec02ee33b4d7ac7938db2fa5b516b5b32955fd85af3` |
| `src/simulation/aero.ts` | `32dedcc643fb307019a1b893a124d3e50f0cd1ac3af820ca9c1f556ad3696e0f` |
| `tmp-browser-h04-v4-r5/…full-video/h04-scene-960x540.png` | `2357d7a540030e902a640b30040128a094cc23badd9d0f846440817204a1bdb2` |
| `tmp-browser-h04-v4-r5/…full-video/h04-technical-960x540.png` | `40e590c43e4eb5c091464b6b8c0272fa0619a588509976720128c19e82ccae3b` |
| `tmp-browser-h04-v4-r5/…full-video/h04-real-keyboard-jumps-960x540.webm` | `83fb60d852c78c54fe70d17047c9851063626a70173a26e94e82c50fd88df41f` |

## Wcześniejsze przebiegi (bez zmiany ich znaczenia)

- 23.09.2026, v1: `npm run typecheck && npm test && npm run build` PASS
  (36 plików/311 testów); Playwright H04 3/3 PASS (`tmp-browser-h04`: R 219,48 →
  219,0 m, T 216,71 → 216,5 m, konkurs 100,5 m); regresje przeglądarkowe H01 3/3,
  H02 3/3, H03 4/4 PASS (`tmp-browser-h03-r2`). Opublikowany film (7 artefaktów,
  [ARTIFACTS.md](ARTIFACTS.md)) to trening R 219,13 → 219,0 m, T 218,29 → 218,0 m
  i osobny konkurs 103,0 m; SHA-256 zgodne z manifestami.
- 23–24.09.2026, v2–v3 (kontynuacje 01–02): 46 belek (stare 1–36 = nowe 11–46),
  AUTO surowego kontaktu 239,74/259,86 m; konkurs w przeglądarce z belki AUTO 6
  **FAIL** asercji ≥180 m (127–169 m, `tmp-browser-h04-v4…v4-r3`) — naprawione
  w kontynuacji 03 powyżej.

## Końcowe review

Jedno review po całym zakresie technicznym: wszystkie konstrukcje
`JumpSimulation` (trening, konkurs, AI, sonda krawędzi) przechodzą przez
wariant polary; `physicsVersion` z sufiksem jest spójny w wyniku, kluczu rekordu
(`contentVersions`) i sesji; inne skocznie bez `aero`; etykieta fizyki mieści
się w widoku technicznym. Usterek nie znaleziono. Ograniczenia: sufity to
skończony sweep, nie globalne maksimum; pojedynczy przebieg przeglądarki miał
tym razem idealne wybicie — odporność na późne wybicie pokazuje sonda headless,
nie E2E. Nachodzące etykiety „U 310/FALL 350” w widoku technicznym są
wcześniejsze i należą do oceny VISUAL.

Poprawki po odbiorze sprawdzono tylko na zmienionych ścieżkach (wyżej), bez
drugiej pełnej rundy review. Zewnętrzny PLAYABILITY NOT RUN.

**Następny pakiet:** [PKG-013/P22](../../handoffs/PKG-013.md) (identyczny z
`docs/NEXT_SESSION_PROMPT.md`). Ostatnia kontynuacja PKG-012 zachowana w
`docs/handoffs/PKG-012.md`, starsze w `PKG-012-rev01.md`, `PKG-012-CONTINUE-01…03.md`.
