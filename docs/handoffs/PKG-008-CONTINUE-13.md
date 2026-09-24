# PKG-008 — P42, runda 12: odbiór użytkownika po poprawkach rundy 11

Pakiet docelowy: PKG-008  
Zakres: P42 — wyłącznie odbiór bramki V albo poprawki wynikające z nowego,
jawnego werdyktu użytkownika.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git, nie publikuj gry i nie rozpoczynaj PKG-009 bez zaliczenia
bramki V przez użytkownika.

## Stan wejściowy

- PKG-001–007 są COMPLETE.
- PKG-008 pozostaje INCOMPLETE tylko dlatego, że pełna bramka V wymaga jawnej
  akceptacji użytkownika.
- Użytkownik zaakceptował wygląd i animację skoczka 20.09.2026. Są zamrożone;
  `JUMPER_ART_VERSION` nie został zmieniony w rundzie 11.
- Techniczny zakres rundy 11 jest wykonany i opisany w
  `docs/evidence/PKG-008/REPORT.md` §16:
  1. treningowa belka AUTO z prognozy wiatru, z ręcznym przesłonięciem;
  2. spójny deterministyczny wiatr serii (`pkg008-wind-3`), z okazjonalnym
     odwróceniem w finale;
  3. trwała plansza serii z miejscem/punktami człowieka i wznowieniem po reloadzie;
  4. noty skalibrowane z 1160 oficjalnych ocen FIS (`pkg008-rules-3`);
  5. widoczny i działający panel obniżenia belki przez trenera;
  6. audyt 25 widoków bazowy→finalny, pola S1–S5 i usunięte kolizje tekstu.
- Finalna weryfikacja: typecheck PASS, 225/225 testów jednostkowych PASS,
  build PASS, pełny E2E 22/22 PASS, capture rundy 11 5/5 PASS, video 2/2 PASS.
- Jakościowy playtest użytkownika nadal NOT RUN. VISUAL nie może być
  zatwierdzony przez model.

Poprzedni prompt rundy 11 zachowano jako
`docs/handoffs/PKG-008-CONTINUE-12.md`.

## Przeczytaj tylko potrzebne źródła

1. `AGENTS.md` — zamrożenie zawartości, prostota, jedno review.
2. `docs/evidence/PKG-008/REPORT.md` §15–§16 — polecenie użytkownika, wdrożenie,
   testy, końcowe review i ograniczenia.
3. `docs/evidence/PKG-008/hill-geometry-fis.md` §9 — źródła i rozkład not.
4. `docs/IMPLEMENTATION_PLAN.md` P42 — A–F wykonane, bramka V oczekuje.

Nie czytaj ponownie całej historii rund ani archiwalnych handoffów bez
konkretnej potrzeby.

## Wynik pakietu

- [x] Techniczny zakres rundy 11 A–F wykonany.
- [x] Testy i dowody końcowe zielone.
- [ ] Werdykt użytkownika dla rundy 11.
- [ ] Bramka V zaliczona przez użytkownika.

## Pierwsza czynność — bez zmian w kodzie

Przedstaw użytkownikowi krótko najważniejsze dowody i poproś o jeden werdykt:

1. **AKCEPTUJĘ bramkę V** — wygląd, animacja, sterowanie i odczucie fizyki są
   przyjęte; albo
2. **NIE AKCEPTUJĘ** — użytkownik podaje konkretną listę problemów widocznych
   na zrzutach/nagraniach.

Materiały do wskazania:

- `docs/evidence/PKG-008/browser-artifacts/pkg008-r11-final-training-result-960x540.png`;
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r11-final-competition-result-960x540.png`;
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r11-final-round-summary-960x540.png`;
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r11-final-start-red-coach-960x540.png`;
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r11-final-second-tab-readonly-960x540.png`;
- komplet `pkg008-r11-final-*` w tym samym katalogu;
- `docs/evidence/PKG-008/video-review/pkg008-pelny-skok-czlowieka.webm`;
- `docs/evidence/PKG-008/video-review/pkg008-fragment-konkursu-boty.webm`.

## Weryfikacja

Nie powtarzaj zielonych testów kodu podczas samego odbioru. Jeśli użytkownik
zgłosi nową usterkę i kod się zmieni, uruchom testy właściwe dla zmienionych
ścieżek oraz odśwież odpowiednie zrzuty. Każde zamknięcie dokumentacji kończy
`pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.

## Zamknięcie i następna sesja

### Jeśli użytkownik zaakceptuje

1. Zapisz dosłowny werdykt w `docs/evidence/PKG-008/REPORT.md` §17.
2. Oznacz P42, PKG-008 i bramkę V jako COMPLETE/PASS w
   `docs/IMPLEMENTATION_PLAN.md`, `docs/PACKAGE_WORKFLOW.md` i `docs/README.md`.
3. Nie implementuj P21 w tej samej sesji. Przygotuj samodzielny prompt
   `docs/handoffs/PKG-009.md` dla `P21-H01` i identyczną treść w
   `docs/NEXT_SESSION_PROMPT.md`.
4. Uruchom
   `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
   Nie powtarzaj testów kodu, jeśli kod nie został zmieniony.

### Jeśli użytkownik nie zaakceptuje

1. Zapisz dosłowny werdykt w raporcie.
2. Kontynuuj wyłącznie PKG-008/P42 i tylko podaną listę problemów; nie ruszaj
   zaakceptowanego skoczka bez nowej jawnej uwagi.
3. Przed zmianami zachowaj właściwe zrzuty bazowe; po zmianach odśwież tylko
   dotknięte widoki i uruchom proporcjonalne testy.
4. Po całej liście wykonaj jedno końcowe review, napraw konkretne usterki i
   sprawdź zmienione ścieżki.
5. Zarchiwizuj ten prompt jako kolejną wersję kontynuacji, zaktualizuj
   kanoniczny `PKG-008.md` i identyczny `NEXT_SESSION_PROMPT.md`, po czym
   uruchom walidator dokumentacji.

## Granice

- Zero nowych skoczni, trybów, sezonu, KO, drużyn i przyszłej zawartości.
- Zero samodzielnego PASS dla VISUAL.
- Nie powtarzaj zamkniętego researchu ani zielonych testów bez zmiany stanu.
- Najprostsze rozwiązanie dające dobry efekt; bez infrastruktury na zapas.
- Zachowaj istniejące dowody i cudze zmiany.
