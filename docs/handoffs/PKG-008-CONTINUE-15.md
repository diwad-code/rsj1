# PKG-008 — P42, runda 14: odbiór użytkownika po poprawkach rundy 13

Pakiet docelowy: PKG-008  
Zakres: P42 — wyłącznie odbiór bramki V albo poprawki wynikające z nowego,
jawnego werdyktu użytkownika.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git, nie publikuj gry i nie rozpoczynaj PKG-009 bez zaliczenia
bramki V przez użytkownika.

## Stan wejściowy

- PKG-001–007 są COMPLETE; PKG-008 pozostaje INCOMPLETE do jawnej akceptacji V.
- Wygląd bazowego skoczka zaakceptowany 20.09.2026.
- Runda 12: prostokąty not wycofane i głęboki przysiad R dodany — oba elementy
  użytkownik zaakceptował w rundzie 13 i są zamrożone.
- Runda 13 wykonała dwie pozostałe uwagi użytkownika (REPORT.md §19–§20):
  1. mapa ma 21 belek: stare fizyczne 1–12 są nowymi 10–21, a nowe 1–9
     schodzą niżej tym samym rozstawem 0,65 m; stara 1 = nowa 10; neutralne
     AUTO = belka 8 i umiejętny skok 126,3 m; wszystkie testowane AUTO < HS134;
     `hillVersion` 3.3.0, `rulesVersion` `pkg008-rules-5`, fizyka bez zmian;
  2. podpórki przerysowane anatomicznie: kompresja bioder/tułowia, zgięty
     łokieć, jedna lub dwie dłonie połączone z rękawem i dopasowane do stoku;
     usunięto doklejony ślad/bruzdę/ziarna; trzy klatki kontakt–utrzymanie–powrót;
     `JUMPER_ART_VERSION` `pkg008-jumper-solid-silhouette-6`.
- Finalna weryfikacja rundy 13: typecheck PASS, 227/227 unit PASS, build PASS,
  pełny E2E 22/22 PASS, r13 support 2/2 PASS (24 zrzuty), r11 final 5/5,
  pełny capture 7/7 aktywnych, video 2/2 PASS.
- VISUAL i jakościowy playtest wymagają użytkownika; model nie wpisuje PASS.

Poprzedni prompt rundy 13 zachowano jako
`docs/handoffs/PKG-008-CONTINUE-14.md`.

## Przeczytaj tylko potrzebne źródła

1. `AGENTS.md` — zamrożenie zawartości, prostota, jedno review.
2. `docs/evidence/PKG-008/REPORT.md` §19–§20 — werdykt i wykonanie rundy 13.
3. `docs/evidence/PKG-008/hill-geometry-fis.md` §8.6 — mapa 21 belek.
4. `docs/IMPLEMENTATION_PLAN.md` P42 — zakres wykonany, bramka V oczekuje.

Nie czytaj całej historii rund ani archiwalnych handoffów bez potrzeby.

## Wynik pakietu

- [x] Techniczny zakres rund 11–13 wykonany.
- [x] Prostokąty not i głęboki przysiad zaakceptowane przez użytkownika.
- [x] Testy i dowody rundy 13 zielone.
- [ ] Werdykt użytkownika dla 21 belek i nowej podpórki.
- [ ] Bramka V zaliczona przez użytkownika.

## Pierwsza czynność — bez zmian w kodzie

Przedstaw najważniejsze dowody i poproś o jeden werdykt:

1. **AKCEPTUJĘ bramkę V**; albo
2. **NIE AKCEPTUJĘ** — konkretna lista problemów widocznych w dowodach.

Materiały rundy 13:

- `docs/evidence/PKG-008/browser-artifacts/pkg008-r13-support-one-contact-960x540.png`;
- `pkg008-r13-support-one-hold-960x540.png`;
- `pkg008-r13-support-two-contact-960x540.png`;
- `pkg008-r13-support-two-hold-960x540.png`;
- `pkg008-r13-support-strip-960x540.png`;
- odpowiedniki 1920×1080 i klatki recovery w tym samym katalogu;
- `pkg008-r13-frozen-*` — dowód, że zaakceptowane noty/przysiad nie zmieniły się;
- odświeżone `pkg008-r11-final-*` — aktualne numery belek/HUD/wyniki;
- `docs/evidence/PKG-008/video-review/pkg008-pelny-skok-czlowieka.webm`;
- `docs/evidence/PKG-008/video-review/pkg008-fragment-konkursu-boty.webm`.

## Weryfikacja

Nie powtarzaj zielonych testów kodu podczas samego odbioru. Po nowej zmianie
uruchom testy właściwe dla dotkniętych ścieżek i odśwież tylko odpowiednie
dowody. Każde zamknięcie dokumentacji kończy:
`pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.

## Zamknięcie i następna sesja

### Jeśli użytkownik zaakceptuje

1. Zapisz dosłowny werdykt w `REPORT.md` §21.
2. Oznacz P42, PKG-008 i bramkę V jako COMPLETE/PASS w planie, workflow i README.
3. Nie implementuj P21 w tej sesji. Przygotuj `docs/handoffs/PKG-009.md`
   dla P21-H01 i identyczny `docs/NEXT_SESSION_PROMPT.md`.
4. Uruchom walidator dokumentacji; nie powtarzaj kodowych testów bez zmian.

### Jeśli użytkownik nie zaakceptuje

1. Zapisz werdykt dosłownie w raporcie.
2. Kontynuuj tylko PKG-008/P42 i konkretną listę; zachowaj zaakceptowane elementy.
3. Zbierz bazowe i końcowe dowody tylko dla dotkniętych widoków.
4. Po całości wykonaj jedno review i proporcjonalną weryfikację.
5. Zarchiwizuj prompt, zaktualizuj kanoniczny handoff i aktywny prompt,
   uruchom walidator dokumentacji.

## Granice

- Zero nowych skoczni, trybów, sezonu, KO, drużyn i przyszłej zawartości.
- Zero samodzielnego PASS dla VISUAL.
- Noty bez prostokątów i głęboki przysiad R są zaakceptowane — nie zmieniać.
- Najprostsze rozwiązanie dające dobry efekt; bez infrastruktury na zapas.
- Zachowaj istniejące dowody i cudze zmiany.
