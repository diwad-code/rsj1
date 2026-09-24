# PKG-008 — P42, runda 16: odbiór użytkownika po poprawkach rundy 15

Pakiet docelowy: PKG-008  
Zakres: P42 — wyłącznie odbiór bramki V albo poprawki wynikające z nowego,
jawnego werdyktu użytkownika; bez nowej zawartości.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git, nie publikuj gry i nie rozpoczynaj PKG-009 bez zaliczenia
bramki V przez użytkownika.

## Stan wejściowy

- PKG-001–007 COMPLETE; PKG-008/P42 IN PROGRESS; bramka V NIEZALICZONA.
- Użytkownik zaakceptował wygląd bazowego skoczka po rundzie 9 oraz brak
  prostokątów not i głęboki przysiad R po rundzie 12. Nie zmieniaj ich.
- Runda 13: 21 belek (stara fizyczna 1 = nowa 10; neutralne AUTO = 8) oraz
  anatomiczne podpórki kontakt–utrzymanie–powrót (`JUMPER_ART_VERSION -6`).
- Runda 15 wykonała obie sportowe poprawki z werdyktu użytkownika:
  1. oficjalne PDF FIS Wisła: N=232 skoki / 1160 not; dodatnia korelacja
     dystans↔nota; źródło nie rozpoznaje stylu lądowania ani podpórek;
  2. noty są deterministycznie niemalejące ponad K; poza HS parallel
     15,0–17,5, telemark 17,0–20,0, jedna i dwie dłonie 12,0–14,0;
     20,0 tylko dla telemarku dalej niż HS+5;
  3. cel prowadzenia korzysta z tej samej zależnej od dystansu prognozy;
  4. progi ustania przesunięto dokładnie +5 m: telemark 147 m, parallel
     150 m; rekord 144,5 m pozostaje możliwy; wartości nie są uniwersalne
     dla mamutów.
- Wersje: `rulesVersion pkg008-rules-6`, `hillVersion 3.4.0`, fizyka bez
  zmiany (`pkg008-tune-7`).
- Finalna weryfikacja rundy 15: typecheck PASS, unit 241/241 PASS, build PASS,
  E2E 22/22 PASS, focused capture 1/1 (20 zrzutów), pełny capture 7/7 aktywnych,
  video 2/2 PASS. Szczegóły: `REPORT.md` §22.
- VISUAL i jakościowy odbiór gry zalicza wyłącznie użytkownik; model nie może
  sam wpisać PASS.

Poprzedni prompt rundy 15 zachowano jako
`docs/handoffs/PKG-008-CONTINUE-16.md`.

## Przeczytaj tylko potrzebne źródła

1. `AGENTS.md` — zamrożenie zawartości i wyłączna akceptacja użytkownika.
2. `docs/evidence/PKG-008/REPORT.md` §22.
3. `docs/evidence/PKG-008/hill-geometry-fis.md` §10.
4. Ten prompt. Nie powtarzaj researchu ani pełnej weryfikacji przed werdyktem.

## Wynik pakietu

- [ ] Użytkownik obejrzał dowody rundy 15 i wydał jednoznaczny werdykt.
- [ ] Przy akceptacji: P42, PKG-008 i bramka V zapisane jako COMPLETE/PASS.
- [ ] Przy uwagach: wykonane wyłącznie konkretne poprawki i przygotowana kolejna runda odbioru.
- [ ] Raport, statusy oraz aktywny prompt odpowiadają rzeczywistemu stanowi.

## Zadanie rundy 16

Najpierw przedstaw użytkownikowi krótki pakiet odbiorowy i poproś o jeden
jednoznaczny werdykt: **AKCEPTUJĘ BRAMKĘ V** albo konkretną listę poprawek.
Nie oceniaj samodzielnie wyglądu, sterowania ani odczucia fizyki.

### Dowody rundy 15 — wyniki sportowe

Pokaż lub wskaż co najmniej poniższe zrzuty 960×540; odpowiedniki 1920×1080
leżą obok:

- `docs/evidence/PKG-008/browser-artifacts/pkg008-r15-training-k-telemark-960x540.png`;
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r15-training-hs-plus-parallel-960x540.png`;
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r15-training-hs-plus-telemark-960x540.png`;
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r15-competition-one-hand-960x540.png`;
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r15-competition-two-hands-960x540.png`.

### Dowody pełnego odczucia gry

- `docs/evidence/PKG-008/video-review/pkg008-pelny-skok-czlowieka.webm`;
- `docs/evidence/PKG-008/video-review/pkg008-fragment-konkursu-boty.webm`;
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r13-support-strip-960x540.png`;
- `docs/evidence/PKG-008/browser-artifacts/pkg008-r12-deep-hs-960x540.png`.

Przypomnij, że pełny odbiór V dotyczy wyglądu, animacji, czytelności
sterowania i odczucia fizyki; użytkownik może uruchomić grę lokalnie, ale
zewnętrzny playtest nadal jest NOT RUN.

## Weryfikacja

Przed werdyktem nie powtarzaj zielonych bramek rundy 15. Przy samej akceptacji
uruchom wyłącznie `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
Jeśli użytkownik zleci poprawki kodu, dobierz testy do zmienionych ścieżek i
na końcu wykonaj bramki wymagane przez przygotowany prompt kontynuacji.

## Zamknięcie i następna sesja

Wybierz dokładnie jedną z poniższych ścieżek na podstawie dosłownego werdyktu.
Nie zamykaj pakietu ani nie twórz PKG-009 bez akceptacji użytkownika.

## Ścieżka A — użytkownik akceptuje bramkę V

Po dosłownym werdykcie użytkownika:

1. Dopisz `REPORT.md` §23 z cytatem werdyktu i zakresem akceptacji.
2. Oznacz P42, PKG-008 i bramkę V jako COMPLETE/PASS w
   `IMPLEMENTATION_PLAN.md`, `PACKAGE_WORKFLOW.md` i `README.md`.
3. Zachowaj informację, że zewnętrzny jakościowy playtest jest NOT RUN — nie
   utożsamiaj go z osobistym odbiorem użytkownika.
4. Przygotuj samodzielny prompt PKG-009 / P21-H01 w
   `docs/handoffs/PKG-009.md` i identycznie w `docs/NEXT_SESSION_PROMPT.md`.
   Musi wymagać empirycznej kalibracji dokładnej realnej skoczni zgodnie z
   AGENTS.md; nie implementuj PKG-009 w tej sesji.
5. Uruchom tylko walidację dokumentacji i zakończ pakiet.

## Ścieżka B — użytkownik zgłasza poprawki

1. Zapisz listę dosłownie w `REPORT.md` §23.
2. Kontynuuj tylko PKG-008/P42 i wskazane elementy; nie naruszaj elementów
   wcześniej zaakceptowanych bez jawnej uwagi.
3. Po implementacji uruchom proporcjonalne testy, jedno końcowe review i pełne
   wymagane bramki tylko wtedy, gdy zmienił się kod gry.
4. Zarchiwizuj prompt i przygotuj kolejną rundę odbioru tego samego PKG-008.

## Granice

- Zero nowych skoczni, trybów, sezonu, KO i drużyn przed akceptacją V.
- Zero ukrytej losowości w notach i lądowaniu.
- Brak stylu w PDF pozostaje UNRESOLVED; zakresy stylów są DESIGN użytkownika.
- Nie uruchamiaj ponownie pełnej macierzy testów bez zmiany kodu.
- Jedno review dopiero po ewentualnych poprawkach; bez pętli audytów.
- VISUAL zalicza wyłącznie użytkownik.
