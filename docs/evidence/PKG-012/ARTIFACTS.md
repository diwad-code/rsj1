# PKG-012 V — przechwycenie H04 z działającej gry

**Pochodzenie:** Playwright/Chromium, `vite preview` na `127.0.0.1:4173` z bieżącego `npm run build` (Vite: 38 modułów, `index-CbZcpwlO.js`). Test `tests/browser/h04.spec.ts` uruchamiał grę klawiaturą przy 960×540 i `/?debug`; wyniki treningu oraz replay pochodzą z rzeczywistego skoku/zapisu, **nie z fixture ani obrazu podstawionego pod grę**. Pliki skopiowano jawnie wyłącznie z udanego przebiegu `tmp-browser-h04-final/`; nie dotykano artefaktów H01–H03 ani wcześniejszych dowodów. PNG to zrzuty rzeczywistego canvas 960×540; WebM to wideo Playwright zapisane po zamknięciu strony z dwoma skokami. SHA-256 uzyskano poleceniem `Get-FileHash -Algorithm SHA256` na plikach opublikowanych.

| Plik w `artifacts/` | SHA-256 |
| --- | --- |
| `h04-menu-960x540.png` | `C40B5C9073D3D0933E45949AB27B807810FDEE27CC5ED9B50ACD2887DB5E369E` |
| `h04-scene-960x540.png` | `C17D4A27E042D00C7FE4394397D77BA7088166605594E980232AC2F553A31A4A` |
| `h04-technical-960x540.png` | `859238F73B70C5D2E03E8FC0B85E6CDFB7832BFC7CEA128FA0F5B549205EB1BC` |
| `h04-result-parallel-960x540.png` | `35DBABD77C79738651CF68E6D2340B70A0C5158915125BA0A70975C070B9687B` |
| `h04-result-telemark-960x540.png` | `9C9878B9BEB94A28B00E980A01D5820926A821A095311702DC4F21CB1A511847` |
| `h04-real-keyboard-jumps-960x540.webm` | `DA447BA27F7A9442CE243127F2B4BD6F8E0020C57EB66DA1BFD3374D26079B97` |
| `h04-replay-flight-960x540.png` | `62D8C6A549907BB020FE17B681CA572579F10ADD49DAB49B599F69C84586C17F` |

## Wykonane sprawdzenia V

- `npm run build` — **PASS** przed przeglądarką.
- `npx playwright test tests/browser/h04.spec.ts --workers=1 --output=docs/evidence/PKG-012/tmp-browser-h04-final` — **3/3 PASS**: pełny wybór pięciu skoczni samą klawiaturą, H04 trening R/T i zrzuty/film; konkurs, jury, boty, wynik, zapis i reload, aktualny replay, odmowa starej wersji sesji/replaya. Po zmianie pierwszego testu katalogu H03: `npx playwright test tests/browser/h03.spec.ts --grep "cztery skocznie" --workers=1 --output=docs/evidence/PKG-012/tmp-browser-h03-nav` — **1/1 PASS**. Po tym przebiegu poprawiono jedynie przestarzałą nazwę testu z „cztery” na „pięć”; asercji i kroków nie zmieniano.
- Ostatni udany test treningu: **R belka 25, surowe 219,13 m → zapisane 219,0 m**, wiatr zmierzony −0,69 m/s; **T belka 21, surowe 218,29 m → zapisane 218,0 m**, wiatr −1,01 m/s. Oba w przeglądarce `landed`, po klawiaturowym T/R. W teście konkursu rzeczywisty skok R: `landed`, wynik **103,0 m** (nie prezentować go jako skok za HS); zakończył się zapisem `h04-inspired-1` i replayem. Rekord +2 m z testów headless G jest oddzielnym dowodem, nie wynikiem powyższego filmu.
- Linia K200, HS240 i linie co 5 m od 165 do 240 w teście używają `buildSportMarkers(HILL)` i są odwracalne przez `HILL.surfaceDistanceAtPoint`; widok techniczny i gra renderują te same `sportMarkers` z `src/render/hillView.ts`. Zrzut techniczny dokumentuje prawdziwy widok, nie zastępuje ręcznej akceptacji czytelności.
- Po reloadzie obca skocznia (techniczna/H03) nie wznawia sesji H04; przekłamanie `versions.hill` w testowym IndexedDB skutkuje `STARY ZAPIS PLANICY`; replay H04 starej wersji jest zablokowany jako `STAREGO PROFILU` bez przeliczenia zapisanej odległości. Zmiana testowego IndexedDB nie jest fixture skoku ani zmianą produkcyjnego zapisu.

**Późniejsze końcowe sprawdzenia rodzica (bez nadpisywania powyższych 7 plików):** `npm run typecheck && npm test && npm run build` PASS: 36 plików/311 testów, Vite 38 modułów. Poprzedni pełny `npm test` miał 309 PASS/2 FAIL przez stare oczekiwania czterech skoczni; naprawiono przed końcowym przebiegiem. `npx playwright test tests/browser/h04.spec.ts --workers=1 --output=docs/evidence/PKG-012/tmp-browser-h04` PASS 3/3; ten **późniejszy** przebieg dał R surowe 219,48 → 219,0 m, T 216,71 → 216,5 m oraz konkurs 100,5 m. Żaden z jego plików nie zastępuje opublikowanego filmu/zrzutów z pierwszego udanego przebiegu (R 219,13 → 219,0 m, T 218,29 → 218,0 m, konkurs 103,0 m).

Regresje przeglądarkowe H01 3/3 PASS i H02 3/3 PASS wykonano kolejno w osobnych wyjściach tymczasowych PKG-012; H03 początkowo 1/4 FAIL (przestarzała nawigacja czterech skoczni), po celowanej poprawce 4/4 PASS w `docs/evidence/PKG-012/tmp-browser-h03-r2`. Rodzic potwierdził SHA-256 kodu i opublikowanych plików względem manifestów. Starsze dowody zachowano nietknięte.

**Ograniczenia:** Artefakty nie stanowią VISUAL PASS (wydaje go wyłącznie użytkownik) ani zewnętrznego playtestu. Film dwóch długich skoków dotyczy treningu, nie skoku rekordowego 256,5 m z headless G; opublikowany konkursowy skok 103,0 m nie był za HS. Wcześniejsze nieudane iteracje były wyłącznie w osobnych katalogach `tmp-browser-h04*`, nie w opublikowanym zestawie. Późniejsze regresje H01–H03 zastępują nieaktualne ograniczenie o ich niewykonaniu, nie zmieniając pochodzenia ani sum opublikowanych siedmiu artefaktów.
