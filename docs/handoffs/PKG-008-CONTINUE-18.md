# PKG-008 — P42, runda 17: odbiór użytkownika po rundzie 16 z korektą impulsu

Pakiet docelowy: PKG-008
Zakres: P42 — wyłącznie odbiór bramki V albo poprawki z jawnego werdyktu; bez nowej zawartości.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git, nie publikuj gry i nie rozpoczynaj PKG-009 bez zaliczenia
bramki V przez użytkownika. Poprzedni prompt rundy 16 zachowano jako
`docs/handoffs/PKG-008-CONTINUE-17.md` — nie nadpisuj go ani starszych dowodów.

## Stan wejściowy

- PKG-001–007 COMPLETE; PKG-008/P42 IN PROGRESS; bramka V NIEZALICZONA.
- Runda 16 (z korektą): cel treningowy 75% HS (100,5 m, tylko kontrolowany
  lider), AUTO z czynnikiem 0,5 TYLKO dla wiatru pod narty (tabela
  `-2→16, -1→12, -0,5→10, 0→8, +0,5→6, +1→5, +2→2`; wiatr w plecy bez zmian),
  belka z siadem i 4 klatkami `gatePush` (bank 41 klatek), idealne wybicie jako
  FIZYCZNY impuls 18 N·s (~+0,28 m/s, okno ±1 tick) — szkic z dopiskiem do
  odległości usunięty w całości, kolizja to prawdziwy sweep.
- Koperta nominalna zamrożonej taśmy 2–4 m (belka 8: 3,01/3,02/3,07;
  belki 1/8/17/21: 3,94/3,02/2,50/2,37) — „można osiągnąć”, NIE gwarancja.
  Jawne limity: adaptacyjna belka 21 delta 21,53 m (prep 859→1338, upadek
  151,40 m; zamrożona 2,37 m), taśma bonusowa 4,26 m, ekstremum +3,2 m/s
  17,59 m fixed vs 1,25 m adaptacyjnie. Progi 147/150 m bez zmian,
  deterministyczne.
- Wersje: `rulesVersion pkg008-rules-6`, `physicsVersion pkg008-tune-8`,
  `hillVersion 3.5.0`, `JUMPER_ART_VERSION pkg008-jumper-solid-silhouette-7`.
- Weryfikacja: typecheck + unit 247/247 (użyte, nie powtarzane); build 177,37 kB;
  E2E łączone 31 PASS + 2 timingowe FAIL hosta (reruny per ścieżka PASS);
  capture 7/7, pose 2/2, video + fixture r16 PASS (szczegóły i historie rerunów:
  `docs/evidence/PKG-008/REPORT.md` §23).
- VISUAL i jakościowy odbiór gry zalicza wyłącznie użytkownik. Zewnętrzny
  jakościowy playtest NOT RUN. P21/PKG-009 zamrożone.

## Dowody rundy 16 (finalne; starsze stripy/live nie są finalne)

- `docs/evidence/PKG-008/r16-final/pkg008-r16-final-pelny-skok-czlowieka.webm` (102,44 m);
- `docs/evidence/PKG-008/r16-final/pkg008-r16-final-fragment-konkursu-boty.webm` (99,99 m);
- `docs/evidence/PKG-008/r16-final/pkg008-r16-final-perfect-flight/gate-seated/gate-push-960x540.png`;
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r16-fixed-scenes.json` + 32 PNG;
- `docs/evidence/PKG-008/r16-perfect-impulse-probe.md` / `.json`;
- `docs/evidence/PKG-008/r16-final-browser.log` (log poleceń, UTF-8).

## Wynik pakietu

- [ ] Użytkownik obejrzał dowody i wydał jednoznaczny werdykt.
- [ ] Przy akceptacji: P42, PKG-008 i bramka V zapisane jako COMPLETE/PASS.
- [ ] Przy uwagach: wykonane wyłącznie konkretne poprawki i przygotowana kolejna runda odbioru.
- [ ] Raport, statusy oraz aktywny prompt odpowiadają rzeczywistemu stanowi.

## Zadanie rundy 17

Najpierw przedstaw użytkownikowi krótki pakiet odbiorowy i poproś o jeden
jednoznaczny werdykt: **AKCEPTUJĘ BRAMKĘ V** albo konkretną listę poprawek.
Nie oceniaj samodzielnie wyglądu, sterowania ani odczucia fizyki. Przed
werdyktem nie odbudowuj ani nie powtarzaj zielonych bramek; potrzebne
powtórki tylko komendami poniżej.

## Weryfikacja

- Odtworzenie (bez przebudowy przed werdyktem): `npm test`, `npm run build`,
  `npx playwright test tests/browser/competition.spec.ts tests/browser/jump.spec.ts tests/browser/persistence.spec.ts tests/browser/shell.spec.ts`,
  capture/pose/video/fixture jak w REPORT §23. Procesy Playwright tylko
  sekwencyjnie (współdzielony `test-results/` czyści się co start).
- Przy samej akceptacji uruchom wyłącznie
  `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
- Jeśli użytkownik zleci poprawki kodu, dobierz testy do zmienionych ścieżek.

## Ścieżka A — użytkownik akceptuje bramkę V

Po dosłownym werdykcie użytkownika:

1. Dopisz `REPORT.md` §24 z cytatem werdyktu i zakresem akceptacji.
2. Oznacz P42, PKG-008 i bramkę V jako COMPLETE/PASS w
   `IMPLEMENTATION_PLAN.md`, `PACKAGE_WORKFLOW.md` i `README.md`.
3. Zachowaj informację, że zewnętrzny jakościowy playtest jest NOT RUN.
4. Przygotuj samodzielny prompt PKG-009 / P21-H01 (Lillehammer) w
   `docs/handoffs/PKG-009.md` i identycznie w `docs/NEXT_SESSION_PROMPT.md`.
   Musi wymagać empirycznej kalibracji dokładnej realnej skoczni zgodnie z
   AGENTS.md; nie implementuj PKG-009 w tej sesji.
5. Uruchom walidację dokumentacji i zakończ pakiet.

## Ścieżka B — użytkownik zgłasza poprawki

1. Zapisz listę dosłownie w `REPORT.md` §24.
2. Kontynuuj tylko PKG-008/P42 i wskazane elementy; nie naruszaj elementów
   wcześniej zaakceptowanych bez jawnej uwagi. Przypomnij znane limity z §23
   zamiast je gubić.
3. Po implementacji uruchom proporcjonalne testy, jedno końcowe review i
   przygotuj kolejną rundę odbioru tego samego PKG-008.

## Granice

- Zero nowych skoczni, trybów, sezonu, KO i drużyn przed akceptacją V.
- Zero ukrytej losowości w idealnym wybiciu, notach i lądowaniu.
- Nie uruchamiaj ponownie pełnej macierzy testów bez zmiany kodu.
- Jedno review dopiero po ewentualnych poprawkach; bez pętli audytów.
- VISUAL zalicza wyłącznie użytkownik.

## Zamknięcie i następna sesja

- Ten prompt JEST aktywnym handoffem (`docs/handoffs/PKG-008.md`, identyczny z
  `docs/NEXT_SESSION_PROMPT.md`); archiwum rundy 16 (`PKG-008-CONTINUE-17.md`)
  pozostaje nietknięte.
- Po werdykcie ACCEPT: zamknij jak w ścieżce A i przekaż sesję PKG-009.
- Po werdykcie z poprawkami: kontynuuj ten sam PKG-008; nie oznaczaj go
  COMPLETE i nie pomijaj zależności. Następny prompt zapisz w
  `docs/handoffs/PKG-008.md` i identycznie w `docs/NEXT_SESSION_PROMPT.md`
  procedurą z `docs/PACKAGE_WORKFLOW.md`.
