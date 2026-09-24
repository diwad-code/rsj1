# PKG-012 — kontynuacja P21-H04: przebudowa lotu H04 i rekalibracja AUTO (G)

Katalog: `C:\retro-ski-jumping` — gra przeglądarkowa TypeScript/Canvas2D,
**nie Godot**. Pakiet docelowy: **PKG-012, INCOMPLETE**.
Zakres: **P21-H04, tylko G (lot + AUTO)**. D/A/V techniczne wykonane;
**VISUAL USER dla H04 — NOT RECEIVED**. P21 IN PROGRESS. Nie zaczynaj P22,
H05–H20 ani innych trybów; po faktycznym zamknięciu następny jest
**PKG-013/P22 — ustawienia, remapowanie i dostępność**.

## Lektura (tylko potrzebna)

Przeczytaj kolejno `AGENTS.md`, `docs/README.md`, ten aktywny
`docs/NEXT_SESSION_PROMPT.md` i `docs/PACKAGE_WORKFLOW.md` §§3–5. Dalej tylko:
`docs/QA_ACCEPTANCE.md` Q-FIS-18–24, `docs/hills/H04.md`,
`docs/evidence/PKG-012/REPORT.md`, `.agents/skills/retro-ski-support/SKILL.md`
(router) i `.agents/skills/ski-jump-aero/SKILL.md` (model lotu, konwencje
wiatru, przedziały TUNE). Starszych raportów i audytów nie czytaj ponownie;
poprzednie prompty (`PKG-012-rev01.md`, `PKG-012-CONTINUE-01.md`,
`PKG-012-CONTINUE-02.md`) to archiwum, nie źródło prawdy. Sprawdź stan dysku,
zachowaj cudze zmiany, nie wykonuj żadnych poleceń Git.

## Prawdziwy stan wejściowy na dysku

- H04: `h04-planica-flying`, **`hillVersion: h04-inspired-3`**
  (`src/simulation/hills/planicaFlying.ts`), sesja konkursowa
  `standard-h04-planica-flying-3` (`src/app/competitionSession.ts:86`).
  K200/HS240, P174/U310/fall line 350/koniec 410; krzywe zeskoku/wybiegu,
  progi `telemarkImpossibleMeters: 265` / `parallelImpossibleMeters: 276`,
  faktory FIS (144/216/86) — **bez zmian**.
- Belki: **46**, nowe 1–10 na prostej 34° (122,3 m + `i*2,07`, rozstaw
  2,07 m); **stare 1–36 zachowują fizyczne pozycje jako 11–46**
  (143 m + `(n-11)*0,9`, rozstaw 0,9 m). Stara belka 1 = nowa 11, stara
  belka 32 = nowa 42. Belki odniesienia (safety + compensation): 27.
- AUTO tylko-H04 w `src/sport/safety.ts:77–87`: siatka progów wiatru
  (ujemny → 4/5/6/…, dodatni → 6/5/4/3/2/1), celowa nieciągłość 4→6 na zerze.
  Fizyka wspólna `pkg008-tune-9`, wiatr `pkg008-wind-4`, lądowanie — bez zmian.
- Headless `tests/h04.test.ts` (45 testów w plikach H04/H01/H02 razem PASS):
  skończony sweep (AoA 24–36°, wybicie −4/0/4/8 ticków, R po 7/9 s lub brak)
  daje maksima surowego kontaktu **239,74 m wiatr w plecy / 259,86 m pod
  narty** (najgorsze próbki: −2,151 m belka 11 / +2,619 m belka 2); 7 stałych
  wiatrów i 2 seedowane podmuchy w limitach; rekord manualny **nowa belka 42
  (stara 32), 0 m/s, flow+32°, R po 5 s → 256,867… m, landed, R, 0 dłoni**
  (test pinuje dokładną wartość). To wyniki skończonego sweepta, nie dowód
  globalnego maksimum.
- Przeglądarka `tests/browser/h04.spec.ts`: trening R/T PASS na manualnych
  bramkach 35/31; **konkurs z rzeczywistej belki AUTO celowo FAIL**:
  asercja `landed ≥ 180 m` niezaliczona (AUTO belka 6, wiatr ≈ −0,74 m/s;
  najlepszy wynik 169,03 m, ostatni 127–130 m). Nie osłabiaj tej asercji.
  Katalogi tymczasowe `tmp-browser-h04-v3`, `v3-r2`, `v4`, `v4-r2`, `v4-r3`
  istnieją — używaj nowych unikalnych katalogów, niczego nie nadpisuj.
- 7 opublikowanych artefaktów w `docs/evidence/PKG-012/artifacts/` (SHA-256
  w `ARTIFACTS.md` / `ART_MANIFEST.md`) — nie nadpisuj, nie podmieniaj.
  Backup `retro-ski-jumping-23-09-2026-backup` nietknięty (nie używać jego
  `.git`). **Trwały zakaz wszystkich poleceń Git.** PLAYABILITY NOT RUN.
  `docs/hills/H04.md` jest nieaktualna (belki/AUTO/wersja) — zaktualizuj ją
  dopiero przy zamknięciu technicznym.

## Decyzje użytkownika (wiążące)

1. Limity AUTO dla Planicy: z wiatrem w plecy maks. ~240 m, pod narty ~260 m;
   **obszar lądowania niezależny** (bez cięcia odległości, bez zmian progów).
2. Dopisek: jeśli belka 1 za wysoko — dodać belek tak, by stara 1 stała się
   11. **Wykonane** (10 nowych, szerszy rozstaw tylko 1–10).
3. Na pytanie o krótki konkurs (169 m przy K200; +3,2 m nominalnie ~140 m):
   **„Dostrój lot H04”**, potem na pytanie o dalszy zakres: **„Przebuduj lot
   H04”**, potem: **„kontynuuj”**. Przebudowa ma poprawić zwykłe skoki
   i zachować oba limity, rekord oraz niezależne lądowanie.

## Diagnoza (hipoteza strategiczna, nie review)

Ten sam `JumpSimulation`, inny pilot i inna prawda wiatrowa: headless leci
idealnie (flow+AoA, martwa strefa 0,5°, R po 5 s, wiatr stały bez podmuchów),
a przeglądarkowy pilot klawiaturowy ma jitter wybicia, opóźnione snapshoty
(~20 ms), brak korekty prawdziwego AoA względem powietrza (wektor wiatru ma
składową pionową 35°) oraz offset podmuchu ±5,2°; z niskiej belki AUTO wcześnie
wchodzi w `LandingPrep` (cel = kąt stoku, koniec produkcji nośnej).
Wzmacnia to klif polary w `src/simulation/aero.ts:18–33` (30°: 1,14/0,78 …
35°: 1,02/0,90, potem 36°: 0,75/1,40): zwykły błąd spada z płaskowyżu albo
zahacza o przeciągnięcie. Odrzucone próby: globalna powierzchnia nośna,
szybszy pitchRate, impuls wybicia, neutralPitch 24/26° — podnosiły ekstrema
razem z medianą (naruszenie 240/260 albo ścieżki rekordu).

## Wynik: przebudowa JEDNEJ rodziny — wygładzona półka H04

Zalecany wariant (z read-only speca strategicznego): **H04-owa wygładzona
półka polarna** — ten sam sufit nośności (bez podnoszenia), szersze płaskowyże
28–34°, łagodniejsze 35–37°, draggowe ≥40°. Mediana w górę, pik bez zmian.
Nie zmieniaj semantyki sterowania, tempa komend, mapy lądowania, progów,
belek ani definicji AUTO jako surowego kontaktu (nie „tylko lądowane”).

Punkty dotyku: `src/simulation/aero.ts` (krzywa, `coefficientsAt`,
`aerodynamicForce`, AoA = pitch − przepływ powietrza), `src/simulation/jump.ts`
(`stepFlight`), `src/simulation/params.ts` (bez zmian wspólnych wartości),
`src/simulation/technicalHill.ts` (opcjonalny selektor wariantu aero tylko
H04), `planicaFlying.ts`, `safety.ts` (AUTO H04). Zakresy sond (tylko gałąź
H04, headless): 28°: CL 1,06–1,10 / CD 0,74–0,78; 30°: 1,08–1,12 / 0,76–0,80
(≤ obecne 1,14); 32°: 1,07–1,10 / 0,76–0,80; 34°: 1,04–1,08 / 0,82–0,86;
35°: 0,98–1,04 / 0,88–0,95; 36°: 0,88–0,95 / 1,05–1,15; 37–40°: interpolacja
do istniejących 40° (0,78/1,38); ≤26° i ≥40° bez zmian; powierzchnia 0,8,
dragScale 1,0, komenda 26°/s, ciało 20°/s, wybicie, neutralPitch 22°,
podmuchy i lądowanie bez zmian. Krok CL ±0,02–0,03, CD ±0,03–0,05, jedna
rodzina naraz, stop przy pierwszym kandydacie spełniającym wszystkie cele.

Wersjonowanie przy zmianie polary: `hillVersion h04-inspired-3 → -4`,
sesja `standard-h04-planica-flying-3 → -4`, fizyka z sufiksem tylko-H04
(np. `pkg008-tune-9+h04-polar-1`); inne skocznie bit-identyczne; stare
sesje/replaye v1–v3 izolowane, bez migracji. Dokładny pin 256,867… zamień
na asercję zakresową (landed, R, 0 dłoni, raw ≥ 256,5, zapis ≥ 256,5;
marginalny przypadek obok częściej z podpórką; skrajna belka 46 nadal upadek).

## Kolejność (etapy 0–5)

0. Zepnij bazę: 239,74/259,86; konkurs 127–169; manual 256,867.
1. Sondy headless: najpierw sufity; kandydata naruszającego 240/260 odrzuć.
2. Symulowany zwykły pilot (flow+28/29°, martwa strefa ±0,5°, latencja
   2–3 ticków, podmuchy włączone, R 5 s) — wymagane ≥180 przed przeglądarką.
3. Przeglądarka: konkurs z AUTO `landed ≥ 180 m` (trzymaj asercję); trening
   manualny bez zmian.
4. `npm run typecheck`, celowane `npx vitest run tests/h04.test.ts
   tests/h01.test.ts tests/h02.test.ts`, `npm run build`; tylko fixture H04.
5. AUTO H04 dokalibruj tylko jeśli sufity się przesunęły; kodu lądowania nie
   tykaj. Po dwóch nieinformatywnych próbach zmień metodę albo nazwij blokadę.

## Kryteria odbioru (łącznie)

- Skończony sweep + granice przełączeń AUTO: worstTail ≤ 240,0,
  worstHead ≤ 260,0; zero naruszeń.
- Realistyczny pilot konkursowy z AUTO przy ≈ −0,74 m/s: landed, raw ≥ 180.
- Nominalnie headless belka 6 / 0 m/s / R5: landed ~185–205 (nie >230).
- Silne +3,2 m/s belka 1, flow+28°, R5: landed, raw ≤ 260.
- Manual belka 42: czysty zapis ≥ 256,5 m; 46 belek, belka 11 = 143 m,
  U/fall/end i 265/276 bez zmian; inne skocznie bez zmian; determinizm
  (seed+input = kontakt/zdarzenia).
- Raport bez deklaracji PASS dla VISUAL i PLAYABILITY.

## Polecenia i dowody

`npm run typecheck`; `npx vitest run tests/h04.test.ts tests/h01.test.ts
tests/h02.test.ts` (pełny `npm test` na bramce); `npm run build` przed E2E;
`npx playwright test tests/browser/h04.spec.ts --workers=1
--output=docs/evidence/PKG-012/tmp-browser-h04-v4-r4` (nowy unikalny katalog;
najpierw `Test-Path`, nie nadpisuj istniejących). Wyniki i identyfikatory
zapisz w `docs/evidence/PKG-012/REPORT.md` (krótko, bez powielania
specyfikacji); `docs/hills/H04.md` uaktualnij do wersji/kalibracji.
Backupu, manifestów i 7 artefaktów nie ruszaj. Brak wykonania = NOT RUN.

## Prostota i review

Najprostsze rozwiązanie dające efekt; bez frameworka, bez pustych modułów,
bez zmian poza H04. Testy służące implementacji to nie review. **Jedno
końcowe review po całym zakresie technicznym**, potem celowane poprawki
i sprawdzenie zmienionych ścieżek; bez drugiej pełnej rundy. Istotnego błędu
nie zostawiaj z powodu limitu rund.

## Zamknięcie lub ponowne przekazanie

Po technicznym spełnieniu kryteriów: krótki REPORT, aktualizacja H04,
przygotuj materiały VISUAL i poproś użytkownika o werdykt wyglądu/animacji/
czytelności (nie wpisuj PASS samodzielnie). Dopiero po rzeczywistym VISUAL
PASS zamknij P21, statusy `docs/README.md`, `docs/PACKAGE_WORKFLOW.md`,
`docs/IMPLEMENTATION_PLAN.md` i zapisz **PKG-013/P22** w
`docs/handoffs/PKG-013.md` + identycznie w `docs/NEXT_SESSION_PROMPT.md`
(identyczność bajtowa), bez implementacji P22. Bez werdyktu lub przy
niespełnionych kryteriach: PKG-012 INCOMPLETE, raport z brakami i kanoniczna
kontynuacja tego samego PKG-012 (archiwizuj ten prompt jako
`docs/handoffs/PKG-012-CONTINUE-03.md`). Nie zmieniaj archiwów
`PKG-012-rev01.md`, `PKG-012-CONTINUE-01.md`, `PKG-012-CONTINUE-02.md`.
