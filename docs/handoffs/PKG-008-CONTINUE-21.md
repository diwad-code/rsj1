# PKG-008 — P42, runda 20: odbiór HUD, podmuchów, belki, sterowania i fullscreen

Pakiet docelowy: PKG-008
Zakres: P42 — wyłącznie odbiór bramki V albo poprawki z jawnego werdyktu; bez nowej zawartości.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git, nie publikuj gry i nie rozpoczynaj PKG-009 bez zaliczenia
bramki V przez użytkownika. Poprzedni prompt rundy 19 zachowano jako
`docs/handoffs/PKG-008-CONTINUE-20.md` — nie nadpisuj go ani starszych dowodów.

## Stan wejściowy

- PKG-001–007 COMPLETE; PKG-008/P42 IN PROGRESS; bramka V NIEZALICZONA.
  Rundy 11–19 wykonane; runda 20 to odbiór użytkownika. Nie przygotowuj PKG-009.
- Runda 19 (REPORT §26), dosłowny werdykt wejściowy użytkownika:
  „1. odległość w prawym górnym rogu jest wyświetlana bez zaokrąglenia do pół metra, zamiast np. 125,5 widać 125,3. 2. Wiatr nadal jest zbyt zmienny, słaby może lekko wirować, ale 1,5m/s powinien już być stabilny w jedną stronę - dodatkowo im silniejszy wiatr tym większa szansa na nowy feature: podmuchy - które pod nadrty odchylają zawodnika o jedną pozycję, a w plecy w głębszą pozycje względem zeskoku. 3. wygląd belki nadal wymaga uwagi - teraz jakby wisi w powietrzu. 4. Dodajmy możliwość zmiany belki na treningu za pomocą "[" "]" podczas siedzenia na belce, nie rpzed uruchomieniem treningu. 4. Nie da się wrócić do menu z treningu. 5. proszę do skoczni zawsze dorysowywać windę/schody prowadzące na górę skoczni tak by relane było przez skoczka wejście na belkę. 5. Po wyjściu z pełnego ekranu "Esc" nie da się do niego wrócić."
- Zakres rundy 19 (wykonany, zamrożony):
  - HUD: wyłącznie bieżący `measuredDistance` w prawym górnym rogu `Math.round(m*2)/2`, np. 125,3→125,5; oficjalne obcięcie wyniku FIS bez zmian; test `hudFormatting`.
  - Wiatr `pkg008-wind-4`: wspólny model trening/seria; tło max ±0,20 wygasa do 0 przy 1,5 m/s; od 1,5 m/s brak zmiany kierunku; deterministyczne sloty 2 s, p=0,04+0,56*s, amplituda=0,15+0,55*s, limit ±3,2; podmuch ±5,2° efektywnego `targetPitch`, ciało nadal 20°/s i gracz może kontrować; brak losowania lądowania. `PhysicsVersion pkg008-tune-9`; hill 3.5.0/rules-6/replay schema bez zmian.
  - Belka: wsporniki do poziomu bocznego ciągu komunikacyjnego, stopki; generyczne schody/pomost wzdłuż rozbiegu i smukły szyb windy przy wieży; statyczny terrain buffer; finalna optymalizacja krok 1,8 m/jedna belka nośna, ok. 72% mniej iteracji. Capture r19.
  - `[` `]` tylko `jump` + `GateGreen`, ta sama próba/seed/AUTO proposal, manual do kolejnych prób tej sesji; po powrocie do menu nowa sesja znów AUTO; menu `[` `]` no-op.
  - Backspace z treningu wraca jednym naciśnięciem także z pauzy; Esc nieprzechwytywany, wyjście z fullscreen pauzuje i odzyskuje fokus, F ponawia fullscreen oraz wznawia tylko pauzę `opuszczono pełny ekran`.
  - Zachowano: cel 127 m, idealny impuls 18 N·s, progi 147/150, AUTO, `JUMPER_ART_VERSION` -7, punktację i inne zaakceptowane elementy.
- Weryfikacja parenta na finalnym stanie rundy 19: `npm run typecheck` PASS; finalne `npm test` 32 pliki / 262 testy PASS; skupione finalne unit 6 plików / 53 testy PASS; finalny `npm run build` 33 moduły, JS 180.15 kB / gzip 57.40 kB PASS; skupione Playwright finalne: belka 1/1 PASS, Backspace 2/2 PASS, fullscreen 1/1 PASS, capture r19 1/1 PASS, 10 prób 1/1 PASS. Pełna macierz E2E rdzenia była uruchomiona raz: 23/25 PASS, 2 timingowe FAIL hosta (`pełny skok`, `10 prób`); `pełny skok` rerun 1/1 PASS, `10 prób` po legalnym auto-resume przeciążenia i finalnym buildzie 1/1 PASS. Nie deklaruj pełnej macierzy 25/25.
- Jedno końcowe review rundy 19: deterministyczność, wersje, replay, wejście i zakres bez istotnych defektów; znaleziony koszt schodów naprawiony przed finalnym capture/soak; VISUAL i odczucie podmuchów nadal do użytkownika; zewnętrzny jakościowy playtest NOT RUN.
- Znane limity: outlier adaptacyjny belki 21, ekstremum wiatru +3,2 m/s, wrażliwość czasowania klawiatury w E2E, czyszczenie `test-results/` między przebiegami (szczegóły REPORT §23–§26).
- VISUAL i odczucie podmuchów zalicza wyłącznie użytkownik. Zewnętrzny jakościowy playtest NOT RUN. P21/PKG-009 zamrożone.

## Dowody (finalne r19; starsze r16–r18 jako kontekst)

- `docs/evidence/PKG-008/r19-visual/pkg008-r19-gate-seated-960x540.png`;
- `docs/evidence/PKG-008/r19-visual/pkg008-r19-gate-seated-1920x1080.png`;
- `docs/evidence/PKG-008/r19-visual/pkg008-r19-gate-push-960x540.png`;
- `docs/evidence/PKG-008/r19-visual/pkg008-r19-gate-push-1920x1080.png`;
- plus `tests/gustModel.test.ts` jako dowód kontraktu podmuchów; starsze r16–r18 jako kontekst.
- Cztery nowe PNG r19 są finalne dla belki/dojścia; podmuchy wymagają oceny w grze, unit dowodzi tylko kontraktu.

## Wynik pakietu

- [ ] Użytkownik obejrzał dowody i wydał jednoznaczny werdykt.
- [ ] Przy akceptacji: P42, PKG-008 i bramka V zapisane jako COMPLETE/PASS.
- [ ] Przy uwagach: wykonane wyłącznie konkretne poprawki i przygotowana kolejna runda odbioru.
- [ ] Raport, statusy oraz aktywny prompt odpowiadają rzeczywistemu stanowi.

## Zadanie rundy 20

Najpierw przedstaw użytkownikowi krótki pakiet odbiorowy (HUD, podmuchy, belka, sterowanie, fullscreen) i poproś o jeden jednoznaczny werdykt: **AKCEPTUJĘ BRAMKĘ V** albo konkretną listę dalszych poprawek. Nie oceniaj samodzielnie wyglądu, sterowania ani odczucia fizyki. Przed werdyktem nie odbudowuj ani nie powtarzaj zielonych bramek. Nie oznaczaj V jako zaliczonej i nie przygotowuj PKG-009 bez dosłownej akceptacji. Zakaz samodzielnego PASS w VISUAL.

## Weryfikacja

- Przy samej akceptacji nie powtarzaj zielonych testów; uruchom wyłącznie `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
- Jeśli użytkownik zleci poprawki kodu, dobierz testy proporcjonalnie do zmienionych ścieżek. Procesy Playwright tylko sekwencyjnie (współdzielony `test-results/` czyści się co start).

## Ścieżka A — użytkownik akceptuje bramkę V

Po dosłownym werdykcie `AKCEPTUJĘ BRAMKĘ V`:

1. Dopisz `REPORT.md` §27 z cytatem werdyktu i zakresem akceptacji.
2. Oznacz P42, PKG-008 i bramkę V jako COMPLETE/PASS w `IMPLEMENTATION_PLAN.md`, `PACKAGE_WORKFLOW.md` i `README.md`.
3. Zachowaj informację, że zewnętrzny jakościowy playtest jest NOT RUN.
4. Przygotuj samodzielny prompt PKG-009 / P21-H01 w `docs/handoffs/PKG-009.md` i identycznie w `docs/NEXT_SESSION_PROMPT.md`. Musi wymagać empirycznej kalibracji dokładnej realnej skoczni zgodnie z AGENTS.md; nie implementuj PKG-009 w tej sesji.
5. Uruchom wyłącznie walidację dokumentacji i zakończ pakiet.

## Ścieżka B — użytkownik zgłasza poprawki

1. Zapisz literalne uwagi w `REPORT.md` §27.
2. Kontynuuj tylko PKG-008/P42 i wskazane elementy; nie naruszaj elementów wcześniej zaakceptowanych bez jawnej uwagi. Przypomnij wersje i limity z §23–§26 zamiast je gubić.
3. Po implementacji uruchom proporcjonalne testy; bez ponownego pełnego review (review rundy 19 już wykonane; nowa istotna poprawka wymaga tylko celowanego sprawdzenia zgodnie z zasadą projektu) i przygotuj kolejną rundę odbioru tego samego PKG-008.

## Granice

- Zero nowych skoczni, trybów, sezonu, KO i drużyn przed akceptacją V.
- Zero ukrytej losowości w idealnym wybiciu, notach i lądowaniu.
- Nie uruchamiaj ponownie pełnej macierzy testów bez zmiany kodu.
- Jedno review rundy 19 już wykonane; bez pętli audytów.
- VISUAL zalicza wyłącznie użytkownik; zakaz samodzielnego PASS.

## Zamknięcie i następna sesja

- Ten prompt JEST aktywnym handoffem (`docs/handoffs/PKG-008.md`, identyczny z `docs/NEXT_SESSION_PROMPT.md`); archiwum rundy 19 (`PKG-008-CONTINUE-20.md`) pozostaje nietknięte.
- Po werdykcie ACCEPT: zamknij jak w ścieżce A i przekaż sesję PKG-009.
- Po werdykcie z poprawkami: kontynuuj ten sam PKG-008; nie oznaczaj go COMPLETE i nie pomijaj zależności. Następny prompt zapisz w `docs/handoffs/PKG-008.md` i identycznie w `docs/NEXT_SESSION_PROMPT.md` procedurą z `docs/PACKAGE_WORKFLOW.md`.
