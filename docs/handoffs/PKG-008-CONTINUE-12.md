# PKG-008 — P42, runda 11: wiatr/belka, ranking, noty, trener, audyt formatowania

Pakiet docelowy: PKG-008
Zakres: P42 (otwarte kryteria dopisane do `docs/IMPLEMENTATION_PLAN.md`)

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
incjalizuj Git i nie publikuj gry.

## Werdykt zapisany (20.09.2026, dosłownie w REPORT.md §15.1)

> akceptuje wygląd skoczka. poprawki dodatkowo na następną sesje: 1. belka powinna być dopasowana do warunków wietrznych również na treningu. 2. podczas konkursu wafrunki powinny zmieniać się rzadko, delikatne zmiany ok, i czasami np w 2 serii odwrócenie wiatru. 3. w konkursie plansza wyików znika i gracz nie wie na którym jest miejscu po serii. 3. zdecydowanie zbyt łatwo jest osiągać wysokie oceny 19.5 20.0 itd. prawdziwi sędziowie nie są tak przychylni. 4. nie działa zmiana bramki przez trenera. 4. formatowanie do poprawki - iektore napisy są niewidoczne, niektóre nakładają się na siebie, a oceny od sędziów powinny być wyraźniej osobno i najlepiej w kwadratach/prostokatach na każdą ocene. - formatowanie do dokładneg audytu ze screenami każdego widoku. - dostosuj następny prompt dla nowej sesji z uwzględnieniem planu wdrożenia głównego dodając poprawki które wymieniłem

Interpretacja: **wygląd skoczka = PASS częściowy** (zamrożony; nie przebudowywać
bez nowej jawnej uwagi). **Bramka V nadal NIEZALICZONA** — zero nowej zawartości
(P21/PKG-009 zakazane) do pełnego odbioru.

## Cel tej sesji

Wykonać całą listę użytkownika w jednym pakiecie, w kolejności: bazowe screeny
każdego widoku → poprawki mechanik → poprawki formatowania → końcowe screeny →
testy → jedno końcowe review → raport i prompt rundy 12 (oczekiwanie na
werdykt). Lista jest też odzwierciedlona w `docs/IMPLEMENTATION_PLAN.md` (P42,
nowe pola checkbox).

## Stan wejściowy — przeczytaj w kolejności

1. `AGENTS.md` — prostota, jedno review, zamrożenie zawartości, empiryczna
   kalibracja (19.09.2026).
2. `docs/evidence/PKG-008/REPORT.md` §15 — werdykt i interpretacja rundy 9/10.
3. `docs/IMPLEMENTATION_PLAN.md` sekcja P42 — otwarte kryteria tej rundy.
4. `docs/GAMEPLAY_SPEC.md` — §5 wiatr, §7 belka jury/trenera, §8 noty i
   potrącenia; kontrakt wersji (`rulesVersion`).
5. `docs/ART_UI_AUDIO.md` — §HUD/wynik: „pięć not z przekreślonymi skrajnymi".
6. `docs/evidence/PKG-008/hill-geometry-fis.md` §8 — archiwalne datowane PDF FIS
   (Wisła K120/HS134, N=232) — baza do kalibracji not.
7. Skill `.agents/skills/dos-pixel-art/` przy pracy na renderze tekstów/pól.

## Lista poprawek i kierunek implementacji

### A. Trening: belka dopasowana do wiatru

- Obecnie `startAttempt` (`src/app/main.ts`, ~linia 393) używa globalnej,
   ręcznie ustawianej belki; konkurs używa `selectSafeJuryGate` +
   `forecastWindMean` (`src/sport/safety.ts`, użycie w
   `src/app/competitionSession.ts` ~linia 263).
- Wdrożyć to samo źródło prawdy w treningu: prognoza z pola wiatru TEJ próby →
  bezpieczna belka domyślna; decyzja widoczna (np. „BELKA AUTO (WIATR
  +0,8): 9") i deterministyczna; ręczne nawywanie belką (nawiasy) pozostaje
  jako jawne przesłonięcie — trening nie traci kontroli. Zapisy treningowe i
  cel prowadzenia korzystają z faktycznej belki próby.

### B. Konkurs: spójne warunki serii

- Dziś każdy zawodnik ma całkowicie niezależne pole wiatru
  (`windSeedForAttempt` w `src/app/competitionSession.ts` ~245) — stąd
  huśtawka co skok.
- Przeprojektować deterministycznie: wspólna baza serii (seed z `roundId`) +
  łagodne odchyłki per zawodnik; rzadkie, powolne zmiany między sąsiednimi
  próbami; **okazjonalne odwrócenie kierunku bazy, np. w drugiej serii**
  (decyzja wyprowadzona z seeda konkursu, nie z runtime'owego RNG). Replay i
  fast-forward botów muszą dawać identyczny przebieg (D10). Spokojniejszy
  wiatr ustabilizuje też automatyczną belkę jury. Zmiana wpływa na wyniki →
  podnieś `rulesVersion`.

### C. Ranking po serii nie znika

- `round-summary` (`src/app/competitionSession.ts` ~443, widoki w
  `src/render/competitionView.ts`) musi wymagać jawnego potwierdzenia (Enter)
  przed przejściem dalej i pokazywać pełną tabelę z **bieżącym miejscem
  gracza** (i punktami po serii). Ekran pojedynczego wyniku pokazuje miejsce
  prowizoryczne. Po reloadzie wznawiamy na tym samym widoku, jeśli seria jest
  zamknięta.

### D. Noty sędziowskie realistycznie surowe

- Obecnie czysty skok ≈ 20,0; realnie 19,5–20,0 to rzadkość. Skalibruj profile
  sędziów (`src/sport/scoring.ts`) z **datowanych oficjalnych wyników FIS**
  (PDF-y z §8 zawierają noty sędziowskie per skok; w razie potrzeby pobierz
  dodatkowe z tej samej konfiguracji obiektu i zapisz w kalibracji):
  rozkład not (min/mediana/kwantyle/odsetek ≥19,5 i =20,0), potem dopasuj
  profile (czysty skok ≈ mediana danych, typowo ~18,0–18,5; każda wartość
  ADAPT z cytowaniem; brak danych = UNRESOLVED, nie wymyślać). Potrącenia FIS
  (3,0/4,5/7,0 itd.) bez zmian. Test dystrybucyjny na symulowanych czystych
  skokach vs dane. `rulesVersion` → np. `pkg008-rules-3`.

### E. Zmiana belki przez trenera — naprawić

- Zdiagnozować realną przyczynę (sterowanie klawiaturą w czerwonej fazie:
  otwarcie panelu `coachAction`, nawywanie `changePendingCoachGate`,
  zatwierdzenie `confirmCoachGate` — `src/sport/startProcedure.ts`,
  `src/app/competitionSession.ts` ~318–343; sprawdzić bind klawisza otwarcia
  panelu i przeniesienie `actualGateNumber` do symulacji). Naprawić
  minimalnie; żółta/zielona nadal odrzuca zmianę; rozbieg faktycznie się
  zmienia; `coachGateTenths` rozlicza się warunkowo. Test klawiaturowy w
  `tests/browser/competition.spec.ts` + jednostkowy w
  `tests/competitionSession.test.ts`.

### F. Formatowanie: audyt każdego widoku + noty w polach

1. **Najpierw bazowe screeny WSZYSTKICH widoków** 960×540 (1920×1080 dla ekranu
   wyniku): tytuł, menu, konfiguracja konkursu, handover, start czerwona/żółta/
   zielona (+ osobno otwarty panel trenera), HUD faz, wynik treningu, wynik
   konkursu, round-summary, tabela końcowa, pauza, replay (produkcyjny +
   techniczny), komunikaty zapisu/druga karta. Nazwy
   `pkg008-r11-base-<widok>-960x540.png` do `browser-artifacts/`.
2. Naprawić: niewidoczne/ucięte/nakładające się napisy (audyt porównaj z
   referencjami SJ3/DSJ2 z `docs/research/reference-images/`).
3. Pięć not sędziów — osobne czytelne kwadraty/prostokąty, po jednej noci na
   pole, dwa odrzucone skrajne jednoznacznie oznaczone (przekreślenie/etykieta)
   — ekran wyniku treningu i konkursu; zachować hierarchię z ART_UI_AUDIO.
4. Końcowe screeny wszystkich widoków (`pkg008-r11-final-*`) do
   `browser-artifacts/`; tabela w raporcie: widok → problem bazowy → poprawka →
   zrzut końcowy.

## Twarde granice

1. Wygląd/animacja skoczka ZAMROŻONE (`JUMPER_ART_VERSION` =
   `pkg008-jumper-solid-silhouette-4`); nie ruszać banku póz; dowody póz z rundy
   9 pozostają ważne.
2. Zero nowych skoczni, trybów, sezonu, KO, drużyn, ekranów poza istniejącymi.
3. Każda zmiana wyniku podnosi `rulesVersion`; fizyka/hill bez zmian (a jeśli
   musisz — odpowiednia wersja + uzasadnienie).
4. Kalibracja not tylko z datowanych źródeł FIS; UNRESOLVED zamiast zgadywania.
5. Wiatr deterministyczny; ten sam seed/input → ten sam wynik.
6. VISUAL zalicza wyłącznie użytkownik; po liście zatrzymaj się na werdykt.
7. Najprostsze rozwiązanie dające dobry efekt; bez infrastruktury na zapas.

## Wynik pakietu

- [x] Wygląd i animacja skoczka zaakceptowane przez użytkownika (runda 9).
- [ ] A. Trening: bezpieczna belka z prognozy wiatru, decyzja widoczna.
- [ ] B. Konkurs: spójne warunki serii, łagodne zmiany, okazjonalne
      deterministyczne odwrócenie wiatru w drugiej serii.
- [ ] C. Ranking/round-summary trwały do potwierdzenia, z miejscem gracza.
- [ ] D. Noty sędziowskie skalibrowane z datowanych wyników FIS; 19,5–20,0
      rzadkie; `rulesVersion` podniesione.
- [ ] E. Zmiana belki trenera działa w czerwonej fazie i rozlicza się w
      wyniku; test klawiaturowy.
- [ ] F. Audyt formatowania każdego widoku: zrzuty bazowe i końcowe; noty w
      osobnych polach z oznaczonymi odrzuconymi skrajnymi.
- [ ] Werdykt użytkownika na rundę 11.
- [ ] Bramka V zaliczona przez użytkownika.

## Weryfikacja po całej liście (nie po każdym kroku)

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

- Znane obciążenie hosta: test audio ma testowy auto-resume pauzy przeciążenia
  i wydłużony deadline (45 s w `waitForTakeoffTick`); gdy inny spec utknie w
  „zbyt długa przerwa klatki", zastosuj ten sam minimalny wzorzec — próg
  produktu bez zmian. Awarie sprawdzaj solo, nie deklaruj fałszywego PASS.
- Solo: `npx playwright test tests/browser/z_capture_pkg008.spec.ts --workers=1`
  (odśwież fazy/ekrany) i nowy spec audytu widoków; zrzuty kopiuj do
  `docs/evidence/PKG-008/browser-artifacts/` natychmiast.
- Solo: `npx playwright test tests/browser/z_capture_pkg008_video.spec.ts
  --workers=1`; oba `video.webm` skopiuj POD WŁAŚCIWYMI NAZWAMI do
  `video-review/` i `browser-artifacts/`.

## Zamknięcie i następna sesja

1. Jedno końcowe auto-review po całej liście; popraw konkretne usterki i
   sprawdź tylko zmienione ścieżki.
2. Dopisz §16 do `docs/evidence/PKG-008/REPORT.md`: lista użytkownika dosłownie
   (jest w §15.1), wdrożenia, kalibracja not ze źródłami, tabela audytu
   formatowania (bazowy → final), wyniki testów, ograniczenia.
3. Zaktualizuj `docs/IMPLEMENTATION_PLAN.md` (P42) i `docs/README.md` według
   rzeczywistego stanu.
4. Werdyktu V nie wpisuj sam — zatrzymaj się na odbiór. Zarchiwizuj ten prompt
   jako `PKG-008-CONTINUE-12.md`, przygotuj rundę 12 (oczekiwanie na werdykt)
   w kanonicznym `PKG-008.md` i identycznie w `docs/NEXT_SESSION_PROMPT.md`.
5. Uruchom `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
6. Nie rozpoczynaj PKG-009 w tej samej sesji.
