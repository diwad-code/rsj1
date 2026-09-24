# PKG-008 — P42, runda 19: odbiór poprawionej perspektywy belki

Pakiet docelowy: PKG-008
Zakres: P42 — wyłącznie odbiór bramki V albo poprawki z jawnego werdyktu; bez nowej zawartości.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git, nie publikuj gry i nie rozpoczynaj PKG-009 bez zaliczenia
bramki V przez użytkownika. Poprzedni prompt rundy 18 zachowano jako
`docs/handoffs/PKG-008-CONTINUE-19.md` — nie nadpisuj go ani starszych dowodów.

## Stan wejściowy

- PKG-001–007 COMPLETE; PKG-008/P42 IN PROGRESS; bramka V NIEZALICZONA, bo
  użytkownik zaakceptował wcześniejsze poprawki, ale zgłosił konkretną uwagę
  o belce; potrzebny ponowny odbiór poprawionej belki. Nie przygotowuj PKG-009.
- Runda 18 (REPORT §25), dosłowny werdykt użytkownika:
  „Akceptuje poprawki, ale proszę poprawić wygląd belki ponieważ nie zgadza sie perspektywa - druga metalowa noga wchodzina rozbieg.”
- Zakres rundy 18: tylko `drawSelectedStartGate()` w `src/render/hillView.ts` —
  pierwszy wspornik kończy się x-8/point.y+5 zamiast pionowo; drugi
  x-3/point.y+8 zamiast x+4/point.y+11. Oba schodzą ukośnie w lewo za/pod tor;
  pełnopikselowa schodkowa maska śniegu zasłania odcinki za torem. Bez zmian
  siedziska, póz gate/gatePush, kotwicy biodra, gameplayu, fizyki
  pkg008-tune-8, hill 3.5.0, rules-6, JUMPER_ART_VERSION -7, AUTO, celu 127 m.
- Reszta rundy 16/17 bez zmian i historyczna: impuls fizyczny 18 N·s (koperta
  nominalna 2–4 m; jawne limity: adaptacyjna belka 21 delta 21,53 m / upadek
  151,40 m, taśma bonusowa 4,26 m, ekstremum +3,2 m/s 17,59 m fixed vs 1,25 m
  adaptacyjnie), progi 147/150 m, AUTO (czynnik 0,5 tylko wiatr pod narty),
  belka/siad/`gatePush`, treningowy cel 127 m (połowa K–HS). Pełne historie
  w REPORT §23–§24.
- Weryfikacja parenta na finalnym stanie rundy 18: `npm run typecheck` PASS;
  `npm run build` PASS (33 moduły, JS 177.59 kB / gzip 56.49 kB);
  `npx playwright test tests/browser/z_capture_pkg008_r18.spec.ts` PASS 1/1
  (2.8 s test, 8.4 s całość). Jedno końcowe review: minimalny zakres
  zachowany, brak naruszenia zaakceptowanych mechanik; na kadrach wspornik nie
  przecina białego toru, ale VISUAL nadal zalicza wyłącznie użytkownik.
- VISUAL i jakościowy odbiór gry zalicza wyłącznie użytkownik. Zewnętrzny
  jakościowy playtest NOT RUN. P21/PKG-009 zamrożone.

## Dowody (finalne dla belki; starsze r16/r17 jako kontekst)

- `docs/evidence/PKG-008/r18-gate-perspective/pkg008-r18-gate-seated-960x540.png`;
- `docs/evidence/PKG-008/r18-gate-perspective/pkg008-r18-gate-seated-1920x1080.png`;
- `docs/evidence/PKG-008/r18-gate-perspective/pkg008-r18-gate-push-960x540.png`;
- `docs/evidence/PKG-008/r18-gate-perspective/pkg008-r18-gate-push-1920x1080.png`;
- Kontekst: `docs/evidence/PKG-008/r17-regression-leading-target-127-960x540.png`,
  `docs/evidence/PKG-008/r17-regression-leading-target-127-1920x1080.png`,
  `docs/evidence/PKG-008/r16-final/pkg008-r16-final-pelny-skok-czlowieka.webm`,
  `docs/evidence/PKG-008/r16-final/pkg008-r16-final-fragment-konkursu-boty.webm`,
  `docs/evidence/PKG-008/r16-final/pkg008-r16-final-perfect-flight-960x540.png`,
  `docs/evidence/PKG-008/r16-final/pkg008-r16-final-gate-seated-960x540.png`,
  `docs/evidence/PKG-008/r16-final/pkg008-r16-final-gate-push-960x540.png`,
  `docs/evidence/PKG-008/browser-artifacts/pkg008-r16-fixed-scenes.json` + 32 PNG,
  `docs/evidence/PKG-008/r16-perfect-impulse-probe.md` / `.json`,
  `docs/evidence/PKG-008/r16-final-browser.log` (szczegóły: REPORT §23–§24).

## Wynik pakietu

- [ ] Użytkownik obejrzał dowody i wydał jednoznaczny werdykt.
- [ ] Przy akceptacji: P42, PKG-008 i bramka V zapisane jako COMPLETE/PASS.
- [ ] Przy uwagach: wykonane wyłącznie konkretne poprawki i przygotowana kolejna runda odbioru.
- [ ] Raport, statusy oraz aktywny prompt odpowiadają rzeczywistemu stanowi.

## Zadanie rundy 19

Najpierw przedstaw użytkownikowi krótki pakiet odbiorowy poprawionej belki
i poproś o jeden jednoznaczny werdykt: **AKCEPTUJĘ BRAMKĘ V** albo konkretną
listę dalszych poprawek. Nie oceniaj samodzielnie wyglądu, sterowania ani
odczucia fizyki. Przed werdyktem nie odbudowuj ani nie powtarzaj zielonych
bramek; potrzebne powtórki tylko komendami poniżej. Nie oznaczaj V jako
zaliczonej i nie przygotowuj PKG-009 bez dosłownej akceptacji. Zakaz
samodzielnego PASS w VISUAL.

## Weryfikacja

- Odtworzenie (bez przebudowy przed werdyktem): `npm test`,
  `npx vitest run tests/leadingTarget.test.ts tests/liveWindTarget.test.ts`,
  `npm run build`,
  `npx playwright test tests/browser/z_capture_pkg008_r18.spec.ts`,
  capture/pose/video/fixture jak w REPORT §23. Procesy Playwright tylko
  sekwencyjnie (współdzielony `test-results/` czyści się co start).
- Przy samej akceptacji uruchom wyłącznie
  `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
- Jeśli użytkownik zleci poprawki kodu, dobierz testy do zmienionych ścieżek.

## Ścieżka A — użytkownik akceptuje bramkę V

Po dosłownym werdykcie użytkownika:

1. Dopisz `REPORT.md` §26 z cytatem werdyktu i zakresem akceptacji.
2. Oznacz P42, PKG-008 i bramkę V jako COMPLETE/PASS w
   `IMPLEMENTATION_PLAN.md`, `PACKAGE_WORKFLOW.md` i `README.md`.
3. Zachowaj informację, że zewnętrzny jakościowy playtest jest NOT RUN.
4. Przygotuj samodzielny prompt PKG-009 / P21-H01 (Lillehammer) w
   `docs/handoffs/PKG-009.md` i identycznie w `docs/NEXT_SESSION_PROMPT.md`.
   Musi wymagać empirycznej kalibracji dokładnej realnej skoczni zgodnie z
   AGENTS.md; nie implementuj PKG-009 w tej sesji.
5. Uruchom wyłącznie walidację dokumentacji i zakończ pakiet.

## Ścieżka B — użytkownik zgłasza poprawki

1. Zapisz listę dosłownie w `REPORT.md` §26.
2. Kontynuuj tylko PKG-008/P42 i wskazane elementy; nie naruszaj elementów
   wcześniej zaakceptowanych bez jawnej uwagi. Przypomnij znane limity z
   §23–§25 zamiast je gubić.
3. Po implementacji uruchom proporcjonalne testy, jedno końcowe review i
   przygotuj kolejną rundę odbioru tego samego PKG-008.

## Granice

- Zero nowych skoczni, trybów, sezonu, KO i drużyn przed akceptacją V.
- Zero ukrytej losowości w idealnym wybiciu, notach i lądowaniu.
- Nie uruchamiaj ponownie pełnej macierzy testów bez zmiany kodu.
- Jedno review dopiero po ewentualnych poprawkach; bez pętli audytów.
- VISUAL zalicza wyłącznie użytkownik; zakaz samodzielnego PASS.

## Zamknięcie i następna sesja

- Ten prompt JEST aktywnym handoffem (`docs/handoffs/PKG-008.md`, identyczny z
  `docs/NEXT_SESSION_PROMPT.md`); archiwum rundy 18 (`PKG-008-CONTINUE-19.md`)
  pozostaje nietknięte.
- Po werdykcie ACCEPT: zamknij jak w ścieżce A i przekaż sesję PKG-009.
- Po werdykcie z poprawkami: kontynuuj ten sam PKG-008; nie oznaczaj go
  COMPLETE i nie pomijaj zależności. Następny prompt zapisz w
  `docs/handoffs/PKG-008.md` i identycznie w `docs/NEXT_SESSION_PROMPT.md`
  procedurą z `docs/PACKAGE_WORKFLOW.md`.
