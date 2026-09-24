# PKG-001 — raport zamknięcia

Data: **16.09.2026**. Wynik pakietu: **COMPLETE**. Zakres: P01, P02, P03, P04.

## Status zadań

| Zadanie | Status | Wynik |
| --- | --- | --- |
| P01 — baza referencyjna | COMPLETE | Obejrzano oznaczone nagranie działającej wersji DOS: pełny rytm skoku, oba lądowania, kamera i przepływ po wyniku. Własne sterowanie SJ3 pozostaje NOT RUN i jest jawnie oddzielone od obserwacji. |
| P02 — szkielet | COMPLETE | TypeScript 7.0.2, Vite 8.3.0, Vitest 5.0.1, Playwright 1.63.0, ESM i lockfile; bez frameworka strony/backendu. |
| P03 — ekran/lifecycle | COMPLETE | Canvas2D 960×540, tytuł i menu w stylu DOS, letterbox, brak scrolla, fullscreen z fallbackiem, niezależne audio po geście, fokus i pauza lifecycle. |
| P04 — wejście/czas | COMPLETE | Pięć akcji z pressed/released/held, kolejność, autorepeat, szybkie krawędzie, reset oraz tick z czasu aktywnej sesji; stały krok 120 Hz z limitem 8 ticków. |

PKG-001 nie zawiera fizyki skoku, technicznej skoczni ani punktacji. Powstaną od PKG-002.

## Istotne zmiany

- `src/app/main.ts` uruchamia jeden fokusowalny Canvas, niezależnie obsługuje Fullscreen API i Web Audio oraz rysuje własny prosty pixel art bez assetów SJ3/FIS.
- `src/core/fixedClock.ts` oddziela 120 Hz od prezentacji i zatrzymuje sesję zamiast nadrabiać długą lukę.
- `src/input/keyboard.ts` mapuje czasowane zdarzenia na ticki aktywnej sesji i zachowuje obie krawędzie szybkiego naciśnięcia.
- Przejście przeglądarki do fullscreen jest wyłączone z czasu symulacji. Po przeciążeniu kotwica wejścia jest wyrównywana do pierwszego niewykonanego ticka, bez opóźniania kolejnych akcji.
- `test:e2e` buduje produkcyjny bundle i testuje go przez `vite preview`; funkcjonalne E2E i nagranie WebM są rozdzielone, żeby koszt enkodera nie wywoływał celowej pauzy 120 Hz.
- [Sesja referencyjna SJ3](../../research/REFERENCE_SESSION.md) dokumentuje dokładny materiał, timestampy i ograniczenia obserwacji.

## Weryfikacja

| Polecenie / sprawdzenie | Wynik | Dowód |
| --- | --- | --- |
| `node --version`, `npm --version` | PASS | Node v26.7.0, npm 12.0.2. `package-lock.json` zapisany po `npm install`; instalacja zgłosiła 0 podatności. |
| `npm run typecheck` | PASS | TypeScript bez diagnostyk na finalnym kodzie. |
| `npm test` | PASS | 2 pliki, 14/14 testów: 30/60/120/144 Hz, przeciążenie, czas/pauza, autorepeat, krawędzie, kolejność, delayed delivery, lewo+prawo i reset. |
| `npm run build` | PASS | Vite 8.3.0; statyczny `dist/`, główny JS około 11,18 kB (4,60 kB gzip). Finalny build został także wykonany przez `test:e2e`. |
| `npm run test:e2e` | PASS | 2/2 scenariusze na finalnym buildzie: tytuł→Enter→menu mimo odmowy fullscreen/audio, F, P/Enter, hidden, blur, brak scrolla oraz 1280×720 i 1920×1080. |
| Chrome — prawdziwy fullscreen | PASS / OBSERVED | W zwykłej karcie lokalnej Enter wszedł do menu w fullscreen; Esc opuścił tryb, F ponowił żądanie. Przejście nie nalicza zaległych ticków. |
| Dźwięk w Chrome | TECHNICAL PASS; odsłuch NOT RUN | AudioContext jest tworzony/wznawiany bezpośrednio z Enter i błąd nie blokuje menu. Nie przeprowadzono niezależnej ludzkiej oceny głośności krótkiego sygnału. |
| `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff` | PASS | Spójna mapa 40 zadań/33 pakietów, poprawne linki i identyczny aktywny handoff PKG-002. |

## Dowody wizualne i ruch

- [Tytuł 1280×720](title-1280x720.png)
- [Menu 1280×720](menu-1280x720.png)
- [Menu 1920×1080](menu-1920x1080.png)
- [Krótki zapis WebM](browser-artifacts/z_capture-krótki-zapis-tytułu-i-wejścia-do-menu/video.webm)

Obrazy zostały obejrzane 1:1. Canvas zachowuje 16:9, nie jest cięty, a skala 2× na 1920×1080 pozostaje ostra. Widoczne ekrany są rysowane w Canvas; semantyczny tekst poza nim jest niewidoczną warstwą dostępności.

## Końcowe review

Jedno końcowe review objęło cały zakres P01–P04, pliki runtime, testy, dowody i handoff. Nie znaleziono implementacji przyszłej fizyki ani zbędnych warstw. Wykryto jedną usterkę: po resecie inputu fizyczny `keyup` mógł dopisać samotne `released`. Poprawiono filtr i dodano regresję. Celowane `typecheck`, 14 testów logiki i 2 E2E przeszły po poprawce.

## Ograniczenia

- Nie rozegrano SJ3 osobiście; P01 jest ukończoną obserwacją nagrania, nie pomiarem sterowania.
- Nie ma fizyki skoku ani oceny PLAYABILITY; nie dotyczą one fundamentu PKG-001.
- Pełna matryca Firefox/Safari/Linux/macOS, DPR i ultrawide pozostaje przypisana P34. W PKG-001 sprawdzono Chromium i dwa wymagane rozmiary.
- Automatyzacja lub narzędzie zrzutu potrafi samo zatrzymać klatkę ponad limit 8 ticków; gra wtedy celowo przechodzi w widoczną pauzę i nie nadrabia czasu.

Następny prompt: [PKG-002 — P05–P08](../../handoffs/PKG-002.md).
