# PKG-004 — raport zamknięcia

Data: **16.09.2026**. Wynik pakietu: **COMPLETE**. Zakres: P13, P14, P15.

Trening nalicza pełną sumę długość/styl/wiatr/jury/coach, pokazuje sportowe linie i
szacowany cel prowadzenia z jednej `distanceMap`, a scena 960×540 ma własny wzorzec
pixel artu oraz zmierzony koszt Canvas2D. To nadal trening: lider jest kontrolowanym
fixture'em 132,0 pkt, bez rankingu, AI i hotseat.

## Status zadań

| Zadanie | Status | Wynik |
| --- | --- | --- |
| P13 — pełna punktacja | COMPLETE | `pkg004-rules-1`, integer tenths, signed half-away-from-zero, osobne wiatr/jury/coach, próg coach w połówkach metra i jawna kolejność dwóch clampów. Pięć wierszy Zakopane/Oberstdorf oraz pełny wiersz lotów Kulm odtworzone 1:1. |
| P14 — oznaczenia i cel | COMPLETE | Generator K/HS, linii 5 m, podziałek bocznych, trzech pasów i fall line korzysta wyłącznie z `surfacePositionAt`. Solver obsługuje remis, minimalną połówkę, próg coach i cel nieosiągalny. |
| P15 — art i benchmark | COMPLETE | Ręczny bank 7 póz, narty 58 px, sylwetka ok. 43 px, własny font 5×7, stadion/rozbieg i śnieg zależny wizualnie od wiatru. Canvas2D zatwierdzony na podstawie pomiaru headed na Iris Xe. |

## Reguły, źródła i pochodzenie

- [ICR Ski Jumping, June 2026](https://assets.fis-ski.com/f/252177/x/c67426c343/icr-ski-jumping-2024_e_clean.pdf): §422.1 — coach wyłącznie w czerwonej fazie i warunek 95% HS; §433.3 — dolne ograniczenie długość+styl; §415.1 i §417.3–4 — metraż, HS, pasy oraz fall line.
- [Zakopane 10.01.2026](https://medias3.fis-ski.com/pdf/2026/JP/3112/2026JP3112RLQ.pdf), [Oberstdorf 28.12.2025](https://medias1.fis-ski.com/pdf/2026/JP/3103/2026JP3103RLQ.pdf) i [Kulm 28.02.2026](https://medias4.fis-ski.com/pdf/2026/JP/3156/2026JP3156RL.pdf) dostarczają pełne wiersze, współczynniki, znaki i progi 95%.
- Pełne liczby są obok fixture'ów w [scoring-fixtures.md](scoring-fixtures.md). Oficjalne profile mają pochodzenie `official-reference`; nie trafiają do fikcyjnej geometrii gry.
- Techniczna K120 ma `simulation-calibrated`: wiatr **2,3 pkt/(m/s)** i belka **2,8 pkt/m rozbiegu**, wyprowadzone z przebiegów `pkg002-tune-1`. Czujniki 45/95/130 m i wagi 0,25/0,45/0,30 pozostają **ADAPT**.
- Kolejność Q-FIS-17: `collective=max(0,długość+styl)`, potem rekompensaty i `total=max(0,collective+rekompensaty)`. Finalny clamp skrajnego wyniku jest jawnie polityką MVP/ADAPT; nie udaje dodatkowej reguły FIS bez opublikowanego ujemnego wiersza.

## Istotne zmiany

- `src/sport/compensation.ts`, `leadingTarget.ts` — czyste reguły rekompensat i solver.
- `src/sport/jumpResult.ts` — pełne komponenty wyniku i pochodzenie danych belki.
- `src/render/sportMarkers.ts`, `pixelFont.ts`, `hillView.ts` — wspólne markery, font, ręczny skoczek, stadion, wynik i HUD celu.
- `src/simulation/technicalHill.ts` — wersjonowany profil kompensacji ADAPT; fizyka `pkg002-tune-1` nie została zmieniona.
- Historyczne generatory testowe PKG-002/003 są teraz read-only; test hashy potwierdził, że kolejne `npm test` ich nie nadpisuje.

## Weryfikacja

| Polecenie / sprawdzenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS — TypeScript 7.0.2 bez diagnostyk. |
| `npm test` | PASS — **16 plików, 119/119** testów. |
| `npm run build` | PASS — Vite 8.3.0; JS 68,52 kB / 22,66 kB gzip. |
| `npm run test:e2e` | PASS — Chromium, **12/12** w 4,5 min; obejmuje 10 prób, nagrania i benchmark headed. |
| Q-FIS-05/06/08/17 | PASS — znaki/faktory, jury+coach, trzy granice progu i oba kierunki skrajnej rekompensaty. |
| Solver / markery | PASS — remis niewystarczający, minimalna połówka, conditional coach, null poza profilem i zwrotny odczyt każdej pozycji z mapy. |
| Oględziny | PASS / OBSERVED — zrzuty 1×/2× i 8 próbek z 16,96 s WebM; kamera zachowuje skoczka, próg, linie i wynik. |

### Benchmark P15

HP Laptop 15s-fq5xxx, Windows 10.0.26200, Intel Core i5-1235U, 8 GB RAM,
Intel Iris Xe (ANGLE D3D11), Chromium 153 headed. Pomiar rAF trwał **60,022 s** przy
Canvas2D 960×540, śniegu ON i żywym wietrze; **3602 klatki**, p50 **16,7 ms**,
p95 **16,9 ms**, p99 **17,0 ms**, maksimum **20,4 ms**, **0** klatek >50 ms i
**0** Long Tasks. Budżet P15: p95 ≤20 ms, p99 ≤25 ms, klatki >50 ms ≤0,5%.
Szczegóły: [benchmark.json](benchmark.json) i [kadr pomiaru](benchmark-scene-960x540.png).
Canvas2D zostaje; pomiar nie uzasadnia dodania PixiJS.

### Dowody wizualne

- scena produkcyjna [960×540](scene-production-960x540.png) i [1920×1080](scene-production-1920x1080.png), profil techniczny [960×540](scene-technical-960x540.png) i [1920×1080](scene-technical-1920x1080.png);
- ta sama faza lotu: [produkcja](markers-production-960x540.png) i [profil](markers-technical-960x540.png) z K/HS, liniami 5 m, rekordem, celem i fall line;
- [wynik z pięcioma komponentami](training-result-960x540.png), [wybicie](training-takeoff-960x540.png), [upadek](training-fall-960x540.png);
- [pełny WebM](browser-artifacts/z_capture_jump-zapis-pełnego-skoku-w-scenie-produkcyjnej/video.webm) i [obejrzany kontakt sheet](video-review/contact-sheet.png).

## Wyniki odbioru

| Wynik | Status | Uzasadnienie |
| --- | --- | --- |
| TECHNICAL | PASS | Reguły, fixtures, wynik, solver, markery, build i ścieżka przeglądarkowa są zielone. |
| VISUAL | PASS / OBSERVED | Własny art jest ostry 1×/2×; skoczek/narty, próg, biała powierzchnia i rozdzielne oznaczenia są czytelne w zrzutach i nagraniu. |
| PLAYABILITY | **NOT RUN** | Nie było zewnętrznego testera. Automatyzacja i własne oględziny nie zastępują obserwacji graczy. |

## Końcowe review

Jedno końcowe review objęło cały PKG-004, kryteria P13–P15, źródła, kod i artefakty.
Znaleziono jeden problem procesu: historyczne testy PKG-002/003 nadal zapisywały swoje
tabele i po zmianie wersji reguł mogły nadpisać nagłówek PKG-003. Przywrócono
`pkg003-rules-1`, oba testy zmieniono na read-only i potwierdzono zachowanie hashy.
Nie znaleziono niewykonanych kryteriów ani błędów wymagających ponownego pełnego review.

## Ograniczenia

- Nie ma jeszcze konkursu, prawdziwego lidera, AI ani hotseat; to zakres PKG-005.
- Skompensowana długość 95% długiego upadku jest osobną regułą P16, nie progiem coach.
- Benchmark obejmuje jeden laptop/Chromium/DPR≈1; pełna matryca pozostaje P34, ponowny profil masowej zawartości P35.
- Bank 7 póz i font 5×7 wyznaczają kierunek P15; pełny atlas/ekrany należą do P30.
- Prędkość kontaktu nadal może dochodzić do ok. 130 km/h. Fizyki nie przestrajano.
- Brak zewnętrznego testera pozostaje jawny.

Następny prompt: [PKG-005 — P16–P18](../../handoffs/PKG-005.md).
