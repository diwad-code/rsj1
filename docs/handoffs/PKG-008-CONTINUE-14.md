# PKG-008 — P42, runda 13: odbiór użytkownika po poprawkach rundy 12

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
- Użytkownik zaakceptował wygląd i animację skoczka 20.09.2026. Są zamrożone
  poza dwoma jawnie wskazanymi stanami z rundy 12 (podpórka, głęboki przysiad R).
- Runda 11 jest wykonana i opisana w `docs/evidence/PKG-008/REPORT.md` §16
  (belka AUTO, spójny wiatr serii, trwała plansza, noty FIS, panel trenera,
  audyt 25 widoków).
- Runda 12 wykonała czteropunktową listę odrzucenia z §17.1
  (opis w REPORT.md §18):
  1. AUTO dobiera belkę do zmierzonego dystansu umiejętnego (138,1 m):
     neutralnie i przy wietrze pod narty — belka 1, wiatr w plecy −1 m/s —
     belka 3, −2 m/s — belka 7; skoki umiejętne < HS134; `rulesVersion`
     → `pkg008-rules-4`;
  2. prostokąty not wycofane — otwarty wiersz S1–S5 (`X` + przekreślenie
     odrzuconych) w powiększonym oknie wyniku (trening 444×210, konkurs
     444×196);
  3. kontakt dłoni ze śniegiem widoczny w pozach podpórki (dłoń na poziomie
     śniegu + pikselowy ślad: bruzda, ziarna, rękawica);
  4. udane lądowanie R z przygotowania ≥6 m nad zeskokiem lub za HS animowane
     głębokim przysiadem (`landingDeep`, `JUMPER_ART_VERSION`
     → `pkg008-jumper-solid-silhouette-5`); replay bez zmiany formatu.
- Finalna weryfikacja rundy 12: typecheck PASS, 226/226 testów jednostkowych
  PASS, build PASS, pełny E2E 22/22 PASS, capture r11 final 5/5 PASS
  (zrzuty odświeżone), capture r12 2/2 PASS, stary capture 7/7 PASS,
  video 2/2 PASS (nagrania odświeżone: skok 102,9 m, konkurs 104,3 m).
- Jakościowy playtest użytkownika nadal NOT RUN. VISUAL nie może być
  zatwierdzony przez model.

Poprzedni prompt rundy 12 zachowano jako
`docs/handoffs/PKG-008-CONTINUE-13.md`.

## Przeczytaj tylko potrzebne źródła

1. `AGENTS.md` — zamrożenie zawartości, prostota, jedno review.
2. `docs/evidence/PKG-008/REPORT.md` §17–§18 — werdykt rundy 11, wdrożenie
   rundy 12, testy, końcowe review i ograniczenia.
3. `docs/evidence/PKG-008/hill-geometry-fis.md` §8.5 — rewizja kalibracji
   belki AUTO.
4. `docs/IMPLEMENTATION_PLAN.md` P42 — zakres wykonany, bramka V oczekuje.

Nie czytaj ponownie całej historii rund ani archiwalnych handoffów bez
konkretnej potrzeby.

## Wynik pakietu

- [x] Techniczny zakres rund 11–12 wykonany.
- [x] Testy i dowody końcowe zielone.
- [ ] Werdykt użytkownika dla rundy 12.
- [ ] Bramka V zaliczona przez użytkownika.

## Pierwsza czynność — bez zmian w kodzie

Przedstaw użytkownikowi krótko najważniejsze dowody i poproś o jeden werdykt:

1. **AKCEPTUJĘ bramkę V** — wygląd, animacja, sterowanie i odczucie fizyki są
   przyjęte; albo
2. **NIE AKCEPTUJĘ** — użytkownik podaje konkretną listę problemów widocznych
   na zrzutach/nagraniach.

Materiały do wskazania (runda 12):

- `docs/evidence/PKG-008/browser-artifacts/pkg008-r12-training-960x540.png`
  (wynik treningu: otwarty wiersz not, powiększone okno);
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r12-competition-960x540.png`
  (wynik konkursu: noty bez ramek, pełny panel);
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r12-deep-high-960x540.png`
  i `pkg008-r12-deep-hs-960x540.png` (głęboki przysiad R)
  vs `pkg008-r12-normal-960x540.png` (zwykłe R);
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r12-support-one-960x540.png`
  i `pkg008-r12-support-two-960x540.png` (kontakt dłoni ze śniegiem);
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r12-strip-960x540.png`
  (arkusz poz);
- komplet `pkg008-r12-*` oraz odświeżone `pkg008-r11-final-*` w tym samym
  katalogu;
- `docs/evidence/PKG-008/video-review/pkg008-pelny-skok-czlowieka.webm`;
- `docs/evidence/PKG-008/video-review/pkg008-fragment-konkursu-boty.webm`.

## Weryfikacja

Nie powtarzaj zielonych testów kodu podczas samego odbioru. Jeśli użytkownik
zgłosi nową usterkę i kod się zmieni, uruchom testy właściwe dla zmienionych
ścieżek oraz odśwież odpowiednie zrzuty. Każde zamknięcie dokumentacji kończy
`pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.

## Zamknięcie i następna sesja

### Jeśli użytkownik zaakceptuje

1. Zapisz dosłowny werdykt w `docs/evidence/PKG-008/REPORT.md` §19.
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
