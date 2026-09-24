# PKG-009 — P21-H01: Lillehammer normalna (D/G/A/V)

Pakiet docelowy: PKG-009
Zakres: P21-H01 (Lillehammer normalna) — pełny cykl D/G/A/V z IMPLEMENTATION_PLAN §6.
Następny po COMPLETE: PKG-010 / P21-H02 (Zakopane duża).

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git, nie publikuj gry i nie rozpoczynaj PKG-010 w tej sesji.

## Stan wejściowy

- PKG-001–008 COMPLETE; P42 i bramka V PASS po akceptacji użytkownika 22.09.2026
  („Akceptuje :)”, REPORT PKG-008 §28). Zewnętrzny jakościowy playtest NOT RUN.
- Finalne wersje PKG-008 (zamrożone — nie refaktoryzuj bez potrzeby
  wieloskoczniowej): physics `pkg008-tune-9`, wind `pkg008-wind-4`, techniczna
  skocznia 3.5.0, rules `pkg008-rules-6`, art `pkg008-jumper-solid-silhouette-8`.
- Jedna grywalna techniczna K120/HS134 istnieje i jest regresyjnym punktem
  odniesienia (jej wyniki: bez zmian). H01 nie istnieje, katalogu `docs/hills`
  brak, PKG-009 NOT STARTED.
- Istnieją: konkurs (kwalifikacje/serie/jury/ranking), hotseat, AI
  (watched/fast), transakcyjny zapis IndexedDB, replay z wersjonowaniem,
  generyczna konstrukcja schodów/windy przy belce, wybór belki `[` `]`
  w treningu oraz wszystkie zaakceptowane elementy PKG-008 (cel treningowy
  127 m, AUTO, impuls perfect 18 N·s, progi 147/150 m, noty rules-6, HUD 0,5 m,
  podpórki supportOne/supportTwo, landingDeep, telemark hold 0,45 s).

## Wynik pakietu

- [ ] P21-H01-D kompletne albo jawnie BLOCKED/UNRESOLVED zgodnie z D18;
- [ ] jeśli D przejdzie: G/A/V wykonane i H01 grywalna z dowodami;
- [ ] raport/status/handoff odpowiada rzeczywistemu stanowi;
- [ ] przy COMPLETE przygotowany PKG-010, przy braku kontynuacja PKG-009.

## Twarda kolejność i bramka empiryczna (najważniejsze — przeczytaj najpierw)

1. **Najpierw P21-H01-D.** Dokładny obiekt: **Lysgårdsbakken normalna,
   Lillehammer, Norwegia, K90/HS98**. Ustal dokładną wersję konstrukcji obiektu
   i datę danych; jeśli źródła odnoszą się do innej konfiguracji/obiektu
   (np. dużej skoczni), nie mieszaj ich.
2. **Research ze źródeł oficjalnych.** Użyj datowanych oficjalnych PDF FIS
   z wynikami zawodów dokładnie na tym obiekcie/konfiguracji oraz — gdy
   dostępne — list startowych i danych rund z belką, wiatrem, lądowaniem
   i upadkami. F09 z CONTENT_PLAN/SOURCES jest punktem startowym, nie
   wystarczającym automatycznie. Preferuj kilka ostatnich porównywalnych
   konkursów; użyj @librarian do bieżącego researchu oficjalnych źródeł.
3. **Minimalna kalibracja D18 w `docs/hills/H01.md`.** Zapisz źródła
   i obowiązkowe pola:
   - rozkład lądowanych odległości: liczność, min, mediana, q75/q90/q95
     (jeśli próba pozwala), max, rozbicie wg warunków/rund gdy dane pozwalają;
   - zaobserwowane upadki/nieustane lądowania w pasmach odległości;
   - kontekst belki i wiatru;
   - decyzje dla envelope osiągalnych odległości, bezpiecznej AUTO, narastania
     trudności za HS, deterministycznych progów niemożliwych do ustania oraz
     rozkładu błędów AI;
   - ograniczenia próby, wersję konstrukcji i `UNRESOLVED` dla stylu lądowania,
     gdy źródło go nie podaje.
   Zakaz zgadywania i kopiowania parametrów z technicznej K120 lub innej
   skoczni. Zaobserwowane prawdopodobieństwo upadku może kalibrować AI, nigdy
   nie jest ukrytą kością lądowania gracza.
4. **STOP/BLOCKED.** Jeśli nie uda się udokumentować wymaganych pól
   empirycznych lub wiarygodnego profilu/geometrii: oznacz H01/PKG-009
   BLOCKED/UNRESOLVED, przygotuj prompt kontynuacji PKG-009 i NIE twórz
   grywalnej skoczni ani artu udającego realny obiekt. Nie przechodź do G/A/V.
5. **Dopiero gdy D kompletne:** G geometria/dane → A pixel art → V
   integracja/weryfikacja, zgodnie z IMPLEMENTATION_PLAN §6.

## Zakres D/G/A/V (gdy D przejdzie)

- **D:** utwórz `docs/hills/H01.md` według CONTENT_PLAN §3; każda liczba
  z etykietą FACT/ADAPT/UNRESOLVED. Znane punkty startowe z F09 (do
  zweryfikowania w źródle, nie pełna geometria): K90/HS98, 2,0 pkt/m, belka
  7,00 pkt/m rozbiegu, wiatr 8,00/12,00 pkt/(m/s), próg coach 93,0 m.
- **G:** jeden prosty plik H01 (np. `src/simulation/hills/lillehammerNormal.ts`),
  classification `normal`, pełne T/P/K/L/U/fall line, profile
  inrun/landing/outrun, distanceMap, belki, sensory,
  compensation/provenance/sourceRefs, safety/calibration. Mała lista dwóch
  obiektów; bez pluginów/dynamic loadera/frameworka 20 skoczni. `buildHill`
  przyjmuje HillSpec; domyślna techniczna K120 i jej wyniki pozostają bez
  zmian. Nowy hillVersion jednoznaczny dla H01.
- **A:** prawdziwy pixel art: logiczne 480×270 skalowane do 960×540, brak AA,
  własny rozpoznawalny landmark Lillehammer, aktualna konstrukcja,
  winda/schody/pomost, oznaczenia wyłącznie z geometrii, własne/licencjonowane
  źródła assetów i manifest; nie kopiuj zdjęć/referencji do runtime.
- **V:** najprostszy wybór skoczni klawiaturą w treningu i konkursie.
  StoredSession/Replay jednoznacznie przechowują hillId+version; podnieś/migruj
  schema tylko jeśli kształt danych faktycznie się zmienia. Sesja innej
  skoczni nie wznawia się po cichu. Konkurs, AI watched/fast, oba lądowania,
  wiatr, AUTO, zapis i replay na H01; techniczna K120 regresyjnie bez zmian.

## Kolejność lektury (krótko, tylko aktualne)

1. AGENTS.md; docs/README.md; docs/NEXT_SESSION_PROMPT.md; docs/PACKAGE_WORKFLOW.md.
2. CONTENT_PLAN §1–3; IMPLEMENTATION_PLAN P21 i §6; DECISIONS_RISKS D18;
   QA_ACCEPTANCE Q-FIS-23; MODERN_SKI_JUMPING i SOURCES F09.
3. REPORT PKG-008 tylko §23–§28 (finalne wersje/limity) — bez czytania całej
   historii.
4. Potrzebne pliki kodu: technicalHill/hill/hillView/sportMarkers/main/
   competitionSession/storage/replay i odpowiadające testy.
5. Użyj tylko rzeczywiście potrzebnych skilli, nie skanuj biblioteki.

## Granice

- Tylko H01; zero H02–H20, sezonu, KO, drużyn, ustawień, publikacji.
- Nie refaktoryzuj zaakceptowanej fizyki/oprawy poza potrzebą wieloskoczniową;
  zachowaj wersje PKG-008 i deterministyczność (ten sam input/seed → ten sam
  wynik).
- Prosta implementacja, bez systemu pluginów/edytora/frameworka contentowego.
- Jedno końcowe review po całym D/G/A/V, naprawy celowane, bez pętli review.
- Procesy Playwright tylko sekwencyjnie; nowe dowody do
  `docs/evidence/PKG-009/`, nie nadpisują PKG-008.
- Użytkownik jest jedynym właścicielem końcowego odbioru VISUAL nowej skoczni,
  ale nie wymaga to ponownego otwierania bramki V oprawy bazowej.

## Weryfikacja i dowody

- Testy H01: walidacja danych/geometrii/metrażu/belek/sensorów/provenance/
  empirical fields; skoki kontrolne zbyt wcześnie/poprawnie/za późno, oba
  lądowania, oba kierunki wiatru, skrajne belki, wybieg, progi za HS,
  determinizm.
- Punktacja/kompensaty zgodne z kartą lub jawnie simulation-calibrated.
- Markery P/K/HS/fall line z tych samych danych co geometria.
- Konkurs, watched==fast AI, zapis/wznowienie, hill mismatch, replay
  recordedResult.
- Regresja technicznej K120 (wyniki bez zmian).
- `npm run typecheck`, pełne `npm test`, `npm run build` i odpowiednie E2E po
  zmianie wspólnych kontraktów; nie uruchamiaj historycznego benchmarku bez
  mierzalnej potrzeby.
- Dowody do `docs/evidence/PKG-009/`: REPORT.md, tabela kalibracji, źródła,
  zrzuty 960×540 (wybór/scena/techniczny/wynik/replay), co najmniej jeden pełny
  film H01; VISUAL user NOT RUN do faktycznego werdyktu.

## Zamknięcie i następna sesja

- Faktyczny stan dysku jest ważniejszy od opisu; zachowaj cudze zmiany
  i dowody.
- Przy przerwaniu kontynuuj od pierwszego braku D/G/A/V, nie zaczynaj od nowa.
- Jeśli COMPLETE: PKG-009 COMPLETE, P21 nadal IN PROGRESS (aż do H04);
  przygotuj PKG-010/P21-H02 w `docs/handoffs/PKG-010.md` i identyczny NEXT;
  nie wykonuj PKG-010.
- Jeśli BLOCKED/INCOMPLETE: prompt kontynuacji PKG-009, bez przeskoku
  do PKG-010.
- Raport zawiera: status D/G/A/V, źródła/etykiety, kalibrację, testy, dowody,
  jedno review, ograniczenia i status playtestu.
- Obowiązuje zasada prostoty z AGENTS.md: jedno review po całym pakiecie,
  zielony wynik kończy sprawdzanie, krótka dokumentacja.
