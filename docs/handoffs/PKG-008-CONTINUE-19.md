# PKG-008 — P42, runda 18: odbiór użytkownika (cel treningowy połowa K–HS)

Pakiet docelowy: PKG-008
Zakres: P42 — wyłącznie odbiór bramki V albo poprawki z jawnego werdyktu; bez nowej zawartości.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git, nie publikuj gry i nie rozpoczynaj PKG-009 bez zaliczenia
bramki V przez użytkownika. Poprzedni prompt rundy 17 zachowano jako
`docs/handoffs/PKG-008-CONTINUE-18.md` — nie nadpisuj go ani starszych dowodów.

## Stan wejściowy

- PKG-001–007 COMPLETE; PKG-008/P42 IN PROGRESS; bramka V NIEZALICZONA.
- Runda 17 (poprawka użytkownika, REPORT §24): treningowy `DO PROWADZENIA` to
  połowa dystansu między K a HS — na K120/HS134 jest to **127 m**
  (przykład użytkownika K120/HS132 → 126 m). Konkursowy cel prowadzenia
  pozostaje zależny od prawdziwego rankingu. Weryfikacja poprawki: typecheck,
  unit celu 7/7, build 177,45 kB, skupiony gate-check LIVE 2/2 z asercją 254
  i zrzutami `r17-regression-leading-target-127-*`.
- Reszta rundy 16 bez zmian i historyczna: impuls fizyczny 18 N·s (koperta
  nominalna 2–4 m; jawne limity: adaptacyjna belka 21 delta 21,53 m / upadek
  151,40 m, taśma bonusowa 4,26 m, ekstremum +3,2 m/s 17,59 m fixed vs 1,25 m
  adaptacyjnie), progi 147/150 m, AUTO (czynnik 0,5 tylko wiatr pod narty),
  belka/siad/`gatePush`, wersje fizyka `pkg008-tune-8` / skocznia `3.5.0` /
  reguły `pkg008-rules-6` / art `-7`. Pełne historie w REPORT §23.
- Weryfikacja łączna: unit 247/247; E2E łączone 31 PASS + 2 timingowe FAIL
  hosta (reruny per ścieżka PASS); capture 7/7, pose 2/2, video + fixture r16
  PASS (szczegóły i historie rerunów: REPORT §23–§24).
- VISUAL i jakościowy odbiór gry zalicza wyłącznie użytkownik. Zewnętrzny
  jakościowy playtest NOT RUN. P21/PKG-009 zamrożone.

## Dowody (finalne; starsze stripy/live rundy 16 nie są finalne)

- `docs/evidence/PKG-008/r17-regression-leading-target-127-960x540.png`;
- `docs/evidence/PKG-008/r17-regression-leading-target-127-1920x1080.png`;
- `docs/evidence/PKG-008/r16-final/pkg008-r16-final-pelny-skok-czlowieka.webm` (102,44 m);
- `docs/evidence/PKG-008/r16-final/pkg008-r16-final-fragment-konkursu-boty.webm` (99,99 m);
- `docs/evidence/PKG-008/r16-final/pkg008-r16-final-perfect-flight-960x540.png`;
- `docs/evidence/PKG-008/r16-final/pkg008-r16-final-gate-seated-960x540.png`;
- `docs/evidence/PKG-008/r16-final/pkg008-r16-final-gate-push-960x540.png`;
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r16-fixed-scenes.json` + 32 PNG;
- `docs/evidence/PKG-008/r16-perfect-impulse-probe.md` / `.json`;
- `docs/evidence/PKG-008/r16-final-browser.log` (log poleceń, UTF-8).

## Wynik pakietu

- [ ] Użytkownik obejrzał dowody i wydał jednoznaczny werdykt.
- [ ] Przy akceptacji: P42, PKG-008 i bramka V zapisane jako COMPLETE/PASS.
- [ ] Przy uwagach: wykonane wyłącznie konkretne poprawki i przygotowana kolejna runda odbioru.
- [ ] Raport, statusy oraz aktywny prompt odpowiadają rzeczywistemu stanowi.

## Zadanie rundy 18

Najpierw przedstaw użytkownikowi krótki pakiet odbiorowy i poproś o jeden
jednoznaczny werdykt: **AKCEPTUJĘ BRAMKĘ V** albo konkretną listę poprawek.
Nie oceniaj samodzielnie wyglądu, sterowania ani odczucia fizyki. Przed
werdyktem nie odbudowuj ani nie powtarzaj zielonych bramek; potrzebne
powtórki tylko komendami poniżej. Nie oznaczaj V jako zaliczonej i nie
przygotowuj PKG-009 bez dosłownej akceptacji.

## Weryfikacja

- Odtworzenie (bez przebudowy przed werdyktem): `npm test`,
  `npx vitest run tests/leadingTarget.test.ts tests/liveWindTarget.test.ts`,
  `npm run build`,
  `npx playwright test tests/browser/jump.spec.ts -g "zgodne przed"`,
  capture/pose/video/fixture jak w REPORT §23. Procesy Playwright tylko
  sekwencyjnie (współdzielony `test-results/` czyści się co start).
- Przy samej akceptacji uruchom wyłącznie
  `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
- Jeśli użytkownik zleci poprawki kodu, dobierz testy do zmienionych ścieżek.

## Ścieżka A — użytkownik akceptuje bramkę V

Po dosłownym werdykcie użytkownika:

1. Dopisz `REPORT.md` §25 z cytatem werdyktu i zakresem akceptacji.
2. Oznacz P42, PKG-008 i bramkę V jako COMPLETE/PASS w
   `IMPLEMENTATION_PLAN.md`, `PACKAGE_WORKFLOW.md` i `README.md`.
3. Zachowaj informację, że zewnętrzny jakościowy playtest jest NOT RUN.
4. Przygotuj samodzielny prompt PKG-009 / P21-H01 (Lillehammer) w
   `docs/handoffs/PKG-009.md` i identycznie w `docs/NEXT_SESSION_PROMPT.md`.
   Musi wymagać empirycznej kalibracji dokładnej realnej skoczni zgodnie z
   AGENTS.md; nie implementuj PKG-009 w tej sesji.
5. Uruchom walidację dokumentacji i zakończ pakiet.

## Ścieżka B — użytkownik zgłasza poprawki

1. Zapisz listę dosłownie w `REPORT.md` §25.
2. Kontynuuj tylko PKG-008/P42 i wskazane elementy; nie naruszaj elementów
   wcześniej zaakceptowanych bez jawnej uwagi. Przypomnij znane limity z
   §23–§24 zamiast je gubić.
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
  `docs/NEXT_SESSION_PROMPT.md`); archiwum rundy 17 (`PKG-008-CONTINUE-18.md`)
  pozostaje nietknięte.
- Po werdykcie ACCEPT: zamknij jak w ścieżce A i przekaż sesję PKG-009.
- Po werdykcie z poprawkami: kontynuuj ten sam PKG-008; nie oznaczaj go
  COMPLETE i nie pomijaj zależności. Następny prompt zapisz w
  `docs/handoffs/PKG-008.md` i identycznie w `docs/NEXT_SESSION_PROMPT.md`
  procedurą z `docs/PACKAGE_WORKFLOW.md`.
