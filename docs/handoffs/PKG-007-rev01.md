> **WERSJA NIEAKTUALNA — NIGDY NIE WYKONANA.** Po zamknięciu PKG-006 użytkownik odrzucił
> oprawę graficzną gry i wstrzymał produkcję zawartości. Lillehammer normalna przeniosła się
> z PKG-007 do **PKG-009**. Aktywny PKG-007 to empiryczny audyt oprawy (P41).
> Zachowane wyłącznie jako historia przekazania.

# Wykonaj PKG-007 — P21-H01 Lillehammer normalna

Pakiet docelowy: PKG-007
Zakres: P21-H01
Następny pakiet po zamknięciu: PKG-008 — P21-H02 (Zakopane duża)

Pracujesz w `C:\retro-ski-jumping`. Wykonaj cały pakiet. Nie rozpoczynaj PKG-008
w tej sesji.

## Twarde zasady wykonania

Stosuj `AGENTS.md`: to mała gra pixelowa, więc wybieraj najprostsze rozwiązanie dające
dobry efekt. Do dwóch skoczni wystarczy mała lista obiektów i wybór w menu. Bez rejestru
pluginów, ładowarki assetów z manifestem generycznym, edytora skoczni, systemu DLC ani
generycznego pipeline'u danych pod 20 hipotetycznych kart. Jeden plik danych obiektu,
jedna tablica dostępnych skoczni i jeden ekran wyboru.

Nie implementuj jeszcze H02–H04, sezonu, KO, drużyn, ustawień/remapowania ani offline.
Nie przerabiaj fizyki, punktacji, konkursu, zapisu ani replaya poza tym, czego wymaga
druga skocznia. Wykonaj jedno końcowe review dopiero po całym PKG-007; testy w toku są
częścią implementacji. Po review popraw konkretne usterki i sprawdź zmienione ścieżki,
bez drugiej pełnej rundy audytu. Domyślnie pracuj jednym modelem.

## Stan wejściowy

PKG-001–006 / P01–P20 są COMPLETE. Projekt nie jest repozytorium Git. Nie inicjalizuj Git,
nie publikuj gry i nie nadpisuj `docs/evidence/PKG-001`–`PKG-006`. Faktyczny stan dysku
ma pierwszeństwo przed opisem.

Finalna weryfikacja PKG-006:

- `npm run typecheck` PASS;
- `npm test` PASS — **23 pliki, 168/168** testów;
- `npm run build` PASS — Vite, 32 moduły, JS ok. 132,83 kB / 41,95 kB gzip;
- `npm run test:e2e` PASS — **17/18**, 1 świadomie pominięty historyczny benchmark P15;
- 78/78 plików dowodów PKG-001–005 zachowało SHA-256 podczas finalnej weryfikacji
  (`docs/evidence/PKG-006/evidence-hashes-before.txt` i `-after.txt`);
- PLAYABILITY pozostaje NOT RUN bez zewnętrznego testera.

Gotowe w PKG-006:

- jeden wersjonowany format IndexedDB `retro-ski-jumping` (`DB_VERSION = 1`) z magazynami
  `sessions`, `results`, `records`, `replays`, `leases`; bez kodu migracji;
- jedna transakcja zatwierdzenia skoku: lease, wynik, sesja, statystyki, rekord i replay,
  idempotentna po `resultId`, przerywana w całości przy dowolnej awarii;
- checkpoint po każdym rozliczonym slocie; reload wraca do właściwej serii i zawodnika,
  a niezatwierdzony skok można powtórzyć bez podwójnego naliczenia;
- walidacja wersji, typów, referencji uczestników, duplikatów slotów/resultId i NaN;
  uszkodzony zapis jest odrzucany bez kasowania danych;
- pasek `NIE ZAPISANO` z ponowieniem klawiszem `Z`; tryb tylko do odczytu dla drugiej karty
  i jawne przejęcie klawiszem `L` po wygaśnięciu lease (TTL 20 s, heartbeat 7 s);
- polityka rekordu z GAMEPLAY_SPEC §9: trening, DSQ i upadek nie ustanawiają rekordu,
  klucz to `rules|physics|hill`;
- wersjonowany replay ostatniego skoku człowieka: akcje z tickami, próbki 30 Hz, dyskretne
  zdarzenia, `recordedResult`; ekran powtórki z play/pauzą, tempem i przewijaniem w obie
  strony; widok techniczny przy niezgodnej wersji danych wizualnych.

Najważniejsze pliki PKG-006:

- `src/storage/schema.ts`, `src/storage/db.ts`, `src/storage/lease.ts`;
- `src/replay/recorder.ts`, `src/replay/player.ts`, `src/render/replayView.ts`;
- `tests/persistence.test.ts`, `tests/replay.test.ts`, `tests/browser/persistence.spec.ts`.

Gra ma nadal **jedną** skocznię: `src/simulation/technicalHill.ts` (`TECHNICAL_K120`,
`id: 'tech-k120-hs134'`, `hillVersion: '1.0.0'`), jawnie fikcyjną i oznaczoną ADAPT.
`buildHill()` jest wywoływane bez parametru w `src/app/main.ts`. Katalog `docs/hills/`
nie istnieje. To jest dokładnie zakres PKG-007.

## Potrzebna lektura

Czytaj tylko zakres potrzebny P21-H01:

1. `AGENTS.md`, ten prompt i sekcję zamknięcia w `docs/PACKAGE_WORKFLOW.md`;
2. `docs/evidence/PKG-006/REPORT.md` — zwłaszcza sekcje 1, 5 i 10;
3. `docs/CONTENT_PLAN.md`: sekcje 1–3 (lista obiektów, karta H01, szablon karty);
4. `docs/IMPLEMENTATION_PLAN.md`: wyłącznie P21 i sekcja 6 (cykl D/G/A/V);
5. `src/simulation/technicalHill.ts`, `src/simulation/hill.ts`, `src/render/hillView.ts`,
   `src/render/sportMarkers.ts`, `src/sport/compensation.ts`, `src/sport/scoring.ts`;
6. `src/app/main.ts` i `src/app/competitionSession.ts` — miejsca, gdzie skocznia jest
   ustalana i zapisywana;
7. `docs/TECHNICAL_DESIGN.md`: kontrakty danych (`HillDefinition`) oraz sekcje 6 i 7;
8. `docs/QA_ACCEPTANCE.md`: przypadki geometrii, oznaczeń i odbioru obiektu;
9. `docs/ART_UI_AUDIO.md`: wymagania pixel artu i siatki.

Jeżeli `.github/skills/README.md` nadal nie istnieje, użyj tylko jednego lub dwóch
rzeczywiście potrzebnych skilli z `.agents/skills/`; nie skanuj całego katalogu.

## Wynik pakietu

Lillehammer normalna K90/HS98 jest grywalną, drugą skocznią: ma własną kartę danych,
własną geometrię i oznaczenia, własny pixel art, jest wybierana klawiaturą w treningu
i w konkursie oraz poprawnie współpracuje z zapisem i replayem z PKG-006. Techniczna
K120 pozostaje dostępna i nie zmienia wyników.

### P21-H01-D — karta danych

- Utwórz `docs/hills/H01.md` według szablonu z CONTENT_PLAN §3: dokładny obiekt
  (Lysgårdsbakken, Lillehammer, Norwegia), wersja i data danych, źródła.
- Każda liczba ma etykietę FACT / ADAPT / UNRESOLVED. Z CONTENT_PLAN §2 potwierdzone są
  K90/HS98, 2,0 pkt/m, gate 7,00 pkt/m rozbiegu, wiatr 8,00/12,00 pkt/(m/s) oraz próg
  95% = 93,0 m (źródło F09). Geometria zeskoku, P/U, fall line, długości rozbiegu i belki
  nie wynikają z K/HS — jeżeli nie masz wiarygodnego profilu, oznacz rekonstrukcję ADAPT
  i zapisz, na czym ją oparto. Nie wstawiaj losowej krzywej pod prawdziwą nazwą.
- Zapisz mapę metrażu T/P/K/L/U/fall line, listę belek i znane ograniczenia rekonstrukcji.

### P21-H01-G — geometria i dane w kodzie

- Dodaj `src/simulation/hills/lillehammerNormal.ts` (albo równoważny jeden plik) z
  `HillSpec` obiektu: `classification: 'normal'`, K90/HS98, P/U/fall line, krzywe rozbiegu,
  zeskoku i wybiegu, belki, czujniki wiatru, kompensaty z `provenance` i `sourceRefs`.
- Dodaj **małą** listę dostępnych skoczni (np. `src/simulation/hills/index.ts`) z dwoma
  wpisami: techniczna K120 i H01. Bez rejestru pluginów i bez ładowania dynamicznego.
- `buildHill()` przyjmuje wybrany `HillSpec`; domyślne zachowanie istniejących testów
  pozostaje bez zmian.
- Sprawdź, że `K < HS`, metry są monotoniczne, nie ma NaN, a próg i powierzchnia kolizji
  zgadzają się z rysunkiem. Skoki kontrolne muszą trafiać w sensowny zakres wokół K.
- Skalibruj kompensaty do faktycznie zbudowanej geometrii gry. Jeżeli wartość dokumentu
  FIS nie pasuje do modelu, zapisz eksperyment kalibracji i oznacz wynik jako
  `simulation-calibrated`; nie udawaj `official-reference`.

### P21-H01-A — pixel art i oznaczenia

- Master pixel art obiektu na ustalonej siatce z `docs/ART_UI_AUDIO.md`: własny landmark
  i tło odróżniające Lillehammer od technicznej K120. Bez kopiowania jednej palety.
- Oznaczenia sportowe (P/K/HS/fall line, kreski metrowe, belki) mają wynikać z geometrii
  H01, a nie z niezależnych współrzędnych.
- Każdy plik runtime ma pochodzenie w manifeście; obrazy researchu nie trafiają do buildu.

### P21-H01-V — integracja i weryfikacja

- Dodaj wybór skoczni klawiaturą w menu treningu i na ekranie konfiguracji konkursu.
  Najprostsze rozwiązanie: jedna pozycja listy przełączana strzałkami.
- **Domknij lukę zapisu z PKG-006:** `StoredSession` i `StoredReplay` muszą jednoznacznie
  wskazywać obiekt. Dziś `StoredSession.versions.hill` zawiera tylko `hillVersion`, więc
  dwie skocznie o tej samej wersji byłyby nierozróżnialne przy wznowieniu. Dodaj `hillId`
  do zapisu sesji, odrzucaj wznowienie sesji z innej skoczni i podnieś
  `SESSION_SCHEMA_VERSION`, jeśli zmienisz kształt danych. `StoredReplay.initialState.hillId`
  już istnieje i `replayVisualsCompatible` go sprawdza — dopilnuj, by nowa skocznia
  poprawnie przechodziła przez tę ścieżkę.
- Konkurs, replay, oba lądowania, wiatr w obie strony i zapis muszą działać na H01.
- Techniczna K120 nadal działa bez zmiany wyników; istniejące dowody PKG-001–006
  pozostają nienaruszone.

## Weryfikacja

Na finalnym kodzie uruchom:

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Dodaj testy wyłącznie dla P21-H01. Wymagane dowody:

- geometria H01: `K < HS`, monotoniczne metry, brak NaN, spójność progu i kolizji;
- skoki kontrolne: zbyt wczesne, poprawne i zbyt późne wybicie; telemark i dwie nogi;
  wiatr pod narty i w plecy; skrajne belki; test wybiegu;
- punkty za metr, kompensaty wiatru i belki zgodne z kartą albo jawnie oznaczone
  jako `simulation-calibrated` z zapisanym eksperymentem;
- oznaczenia P/K/HS/fall line trafiają w te same metry, co geometria;
- pełny konkurs na H01 kończy się poprawną tabelą;
- zapis i wznowienie na H01; sesja zapisana na innej skoczni nie jest wznawiana po cichu;
- replay skoku z H01 odtwarza pozycje i zdarzenia, `recordedResult` bez zmian;
- techniczna K120 daje te same wyniki co przed pakietem (regresja);
- zrzuty 960×540: ekran wyboru skoczni, scena produkcyjna H01, widok techniczny
  z oznaczeniami, wynik i powtórka; nagranie co najmniej jednego pełnego skoku na H01;
- Playwright zapisuje wyłącznie do `docs/evidence/PKG-007/browser-artifacts`
  (artefakty runnera trzymaj w podkatalogu — Playwright czyści `outputDir` na starcie);
  sprawdź SHA-256 dowodów PKG-001–006 przed/po finalnych testach.

Nie powtarzaj benchmarku P15 bez mierzalnej zmiany renderera. PLAYABILITY pozostaje NOT RUN,
o ile nie uczestniczy rzeczywisty tester.

## Granice i ryzyka

- Lillehammer to rekonstrukcja, nie cyfrowa kopia homologowanego obiektu. Etykiety
  FACT/ADAPT/UNRESOLVED są obowiązkowe; brak profilu to powód do oznaczenia, nie do
  wymyślenia liczby.
- Współczynniki z dokumentu FIS obowiązują dla realnej skoczni, nie dla modelu gry.
  Kalibracja do zbudowanej geometrii jest oczekiwana i musi być udokumentowana.
- Auto-pauza po limicie 8 ticków pozostaje celowa. Test może wznowić tylko ten
  udokumentowany powód i ponowić prawdziwą akcję klawiatury.
- Heartbeat lease działa wyłącznie na ekranach konkursu; nie wprowadzaj pracy w tle
  podczas treningu i skoku, bo wywołuje auto-pauzę.
- Gdy zapis wyniku N się nie powiedzie, a N+1 przejdzie, w magazynie `results` brakuje
  wiersza N do czasu ponowienia klawiszem `Z`. To znane ograniczenie PKG-006; nie
  przebudowuj z tego powodu kolejki zapisu w PKG-007.
- H02–H04 i pozostałe 16 obiektów mają własne pakiety. Nie buduj teraz schematu pod
  20 hipotetycznych kart.

## Procedura wznowienia po przerwaniu

Sprawdź stan dysku, `docs/hills/` i `docs/evidence/PKG-007/`, potem uruchom
`npm run typecheck` oraz `npm test`. Kontynuuj od pierwszego niewykonanego kryterium
D/G/A/V; nie zaczynaj pakietu od nowa. Zachowaj ukończone części i cudze zmiany. Jeśli
pakiet pozostanie niekompletny, przygotuj prompt kontynuacji PKG-007 z konkretnymi brakami.

## Zamknięcie i następna sesja

1. Po ukończeniu D/G/A/V wykonaj jedno końcowe auto-review całego PKG-007.
2. Zapisz jeden `docs/evidence/PKG-007/REPORT.md`: statusy podzadań, źródła i etykiety
   danych, geometrię, kalibrację, art, wyniki poleceń, TECHNICAL/VISUAL/PLAYABILITY,
   review i ograniczenia.
3. Zaktualizuj PKG-007/P21 wyłącznie według rzeczywistego wyniku. Pamiętaj, że P21
   zamyka się dopiero po H04 — nie odhaczaj całego P21 po jednym obiekcie.
4. Jeśli COMPLETE, przygotuj prompt PKG-008 / P21-H02 — Zakopane duża: dane, geometria,
   art i weryfikacja — w `docs/handoffs/PKG-008.md` oraz identycznie
   w `docs/NEXT_SESSION_PROMPT.md`.
5. Jeśli niekompletne, przygotuj kontynuację PKG-007 zamiast przeskakiwać dalej.
6. Po handoffie uruchom raz
   `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
7. W odpowiedzi podaj wynik, testy, ograniczenia i link do aktywnego promptu.
   Zakończ sesję; nie implementuj PKG-008.
