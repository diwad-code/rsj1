# Kompletny plan wykonania gry

Stan: **P01–P20, P41–P42 COMPLETE (PKG-001–008); PKG-009–013/P21-H01–H04/P22 COMPLETE; P21–P22 COMPLETE; P23–P40 NOT STARTED (następny PKG-014/P23–P25)**. H01: Lillehammer K90/HS98 (`h01-inspired-4`), H02: Zakopane K125/HS140 (`h02-inspired-1`), H03: Oberstdorf K120/HS137 (`h03-inspired-1`), H04: grywalna adaptacja Planicy K200/HS240 (`h04-inspired-4`, fizyka `pkg008-tune-9+h04-polar-1`). Bazowa bramka V PASS po akceptacji użytkownika 22.09.2026; H01–H03 mają odrębne VISUAL USER PASS 23.09.2026 (H02: „Akceptuję H02”, H03: „skocznia obersdorff jest ok”, bez dowodu obejrzenia całego filmu). H04 ma [wyniki techniczne i odbiór](evidence/PKG-012/REPORT.md): VISUAL USER PASS 24.09.2026 („resztę akceptuje”) po dwóch wskazanych i wykonanych poprawkach; zewnętrzny PLAYABILITY NOT RUN. Sześć starych artefaktów PKG-010 pozostaje zaakceptowaną udokumentowaną utratą bez odzyskania czy nowej bazy; stary manifest nietknięty. Obowiązuje [zakaz Git i zasada skoczni inspirowanych](../AGENTS.md): K/HS zgodne z obiektem, inne parametry ADAPT/TUNE, trudny czysty skok na dwie nogi co najmniej 2 m za rekordem. Backup pozostaje nietknięty. Wspólny pixel art używa siatki logicznej 480×270 skalowanej całkowicie do okna.

Źródła wymagań: [GDD](PRODUCT_GDD.md), [mechanika](GAMEPLAY_SPEC.md), [oprawa](ART_UI_AUDIO.md), [technika](TECHNICAL_DESIGN.md), [zawartość](CONTENT_PLAN.md), [QA](QA_ACCEPTANCE.md). Reguły sportowe nie są odtwarzane z pamięci ani z instrukcji SJ3.

**Jednostką jednej sesji jest pakiet PKG-NNN**, a P01–P40 są zadaniami składowymi. Obowiązuje [mapa pakietów i reguła przekazania](PACKAGE_WORKFLOW.md). Pierwsza sesja realizuje **PKG-001 = P01–P04**. PKG-002 obejmuje P05–P08, a PKG-003 P09–P12 i bramkę A. Wcześniejszy prompt łączący P01–P12 w jednej sesji został zastąpiony po auto-review. Cel i łączny zakres gry nie uległy zmniejszeniu.

**Sposób wykonania:** stosuj zasadę prostoty z [AGENTS.md](../AGENTS.md). Kryteria zadań określają potrzebny efekt, nie wymuszają wielu warstw, raportów ani osobnych review. Jedno review odbywa się na końcu całego PKG; bieżące testy służą implementacji. Wspólne sprawdzenie może pokrywać kilka zadań, a bramka A–E przypadająca w pakiecie korzysta z tego samego końcowego przeglądu i dowodów.

## 1. Kolejność i zakres

```text
P01–P04  dowody, szkielet, fullscreen i wejście
   ↓
P05–P12  grywalny skok na jednym profilu → BRAMKA A
   ↓
P13–P20  sport, oprawa wzorcowa, konkurs, AI, zapis, replay
   ↓
P41–P42  audyt i przebudowa oprawy → BRAMKA V (akceptacja użytkownika)
   ↓
P21–P22  cztery gotowe obiekty i ustawienia → BRAMKA B / MVP
   ↓
P23–P29  sezon i wszystkie tryby → BRAMKA C
   ↓
P30–P33  komplet art/audio, 20 skoczni, pomoc → BRAMKA D
   ↓
P34–P40  przeglądarki, wydajność, offline, playtest, wydanie → BRAMKA E
```

Każde zadanie ma mały zakres i kończy się stanem dającym się uruchomić lub sprawdzić. `S` i `M` orientacyjnie opisują wielkość pracy. Pakiety P21/P32 dzielą produkcję według obiektów. Liczba plików nie jest kryterium jakości: nie rozbijaj prostej funkcji na wiele modułów ani nie twórz nowego planu tylko dlatego, że zmiana objęła więcej niż pięć plików.

Nie podajemy kalendarzowej obietnicy czasu bez prototypu, pomiaru produkcji pierwszego atlasu i ustalenia dostępności testerów. Po P15 oraz po pierwszej pełnej karcie H03 oszacować resztę z rzeczywistego tempa, uwzględniając osobno strojenie fizyki i produkcję artu.

## 2. Fundament i rdzeń

### P01 — Zamknięcie bazy referencyjnej [S]

**Status:** COMPLETE — obserwacja nagrania z jawnym ograniczeniem, bez osobistego testu sterowania.

**Zależności:** brak. **Pliki:** `docs/research/REFERENCE_SESSION.md`, aktualizacja rejestru i rozstrzygnięć FIS.

- [x] Obejrzeć pełny przebieg SJ3 w uruchomionej grze lub oznaczonym nagraniu; zanotować start, timing, oba lądowania, kamerę, retry i menu. Nie mylić oglądania z osobistym testem sterowania.
- [x] Przypiąć wersje ICR/WC, obejrzeć strony istotne dla redline; zgłosić konkretne nierozstrzygnięte punkty do P13/P16.
- **Weryfikacja:** adresy/wersje i notatki obserwacyjne; żadnych zmyślonych pomiarów. Bez zmiany zakresu na port SJ3.

### P02 — Szkielet projektu [M]

**Status:** COMPLETE — TypeScript 7.0.2, Vite 8.3.0, Vitest 5.0.1, Playwright 1.63.0; lockfile zapisany.

**Zależności:** brak. **Pliki:** `package.json`, lockfile, konfiguracje TS/Vite/test, `src/app/main.ts`, dokument uruchomienia. P01 pozostaje wymaganym zadaniem dowodowym PKG-001, lecz nie jest zależnością techniczną P02. Brak dostępu do uruchomienia SJ3 nie zabrania wykonania niezależnego szkieletu P02–P04, ale pozostaje jawnie nierozstrzygnięty przy zamknięciu pakietu.

- [x] Ustalić kompatybilne stabilne wersje, minimalny build, test runner i katalogi; istniejące skille zachować.
- [x] Zdefiniować polecenia `dev`, `build`, `typecheck`, `test`, `test:e2e` bez globalnych zmian środowiska.
- **Weryfikacja:** instalacja z lockfile, typecheck i build; strona startowa ładuje się lokalnie. Nie instalować silnika 3D ani frameworka strony.

### P03 — Ekran gry i lifecycle przeglądarki [M]

**Status:** COMPLETE — Canvas 960×540, ekran tytułowy/menu, fullscreen z fallbackiem, audio po geście i responsywne skalowanie.

**Zależności:** P02. **Pliki:** shell, viewport, fullscreen, audio unlock, style hosta.

- [x] Obraz 960×540, letterbox/dopasowanie, brak scrolla, Enter uruchamia fullscreen/audio.
- [x] Odmowa fullscreen, Esc i zmiana rozmiaru zachowują funkcjonalny ekran; brak podwójnego Enter.
- **Weryfikacja:** ręcznie świeży profil, Enter→Esc→F, odmowa API i 1280×720/1920×1080; screenshoty.

P03 zawiera własną minimalną obsługę gestu Enter i fokusowalny ekran startowy; nie czeka na P04. Audio i fullscreen obsługiwane niezależnie, z poprawnym wejściem do menu także po odmowie. Minimalny pikselowy font/atlas ma udokumentowane pochodzenie; pełny font i oprawa P15/P30 nie są warunkiem wykonania shella.

### P04 — Akcje, fokus i stały czas [M]

**Status:** COMPLETE — bufor krawędzi, czasowane ticki aktywnej sesji, reset lifecycle i stały krok 120 Hz.

**Zależności:** P03. **Pliki:** input map, buffer, lifecycle adapter, fixed clock i testy.

- [x] Rozdzielić held/pressed; reset przy blur/pauzie; tick wynika z czasu zdarzenia i kotwicy aktywnej sesji, nie z numeru najbliższej klatki.
- [x] Akumulator 120 Hz z kontrolą przeciążenia; stan próbny daje ten sam rezultat przy różnych renderHz.
- **Weryfikacja:** mechanizmy Q-SIM-01/04/05/09 na kontrolowanym stanie demonstracyjnym; keydown repeat, szybki keydown+keyup pomiędzy klatkami, lewo+prawo, ukrycie karty i wznowienie. Wyniki rzeczywistego skoku w tych scenariuszach są sprawdzane dopiero po P08/P12, nie zaliczać ich przed powstaniem symulacji.

**Odbiór PKG-001:** uruchamialny shell gry, menu sterowane klawiaturą, poprawne fullscreen/audio/fokus i mały stan demonstracyjny zegara/wejścia. Nie zawiera jeszcze sportowej symulacji skoku. Pakiet kończy się auto-review, raportem i promptem PKG-002, zgodnie z PACKAGE_WORKFLOW.md. Zrealizowany — [raport PKG-001](evidence/PKG-001/REPORT.md).

**Odbiór PKG-002:** techniczna K120/HS134 z mapą metrażu i diagnostycznym widokiem profilu oraz deterministyczny pełny przebieg skoku od zielonego światła do stanu terminalnego `FinishLine` albo `FallSettled`. Bez punktacji, not, wiatru i produkcyjnej sceny. Zrealizowany — [raport PKG-002](evidence/PKG-002/REPORT.md).

**Odbiór PKG-003:** grywalny trening z długością i pięcioma notami, deterministycznym wiatrem, sceną boczną, kamerą, HUD-em, wynikiem i retry. TECHNICAL oraz VISUAL bramki A zaliczone; PLAYABILITY pozostaje NOT RUN z braku zewnętrznego testera. Zrealizowany — [raport PKG-003](evidence/PKG-003/REPORT.md).

### P05 — Profil skoczni i mapa metrażu [M]

**Zależności:** P04. **Pliki:** HillDefinition, sampler krzywej, distanceMap, robocza K120/HS134, testy.

- [x] Osobne rozbieg/zeskok/wybieg; T/P/K/HS/U i belki; interpolacja i normalna powierzchni.
- [x] Mapa metrażu monotoniczna, widok techniczny pokazuje te same punkty co obliczenia.
- **Weryfikacja:** sampling, granice, brak NaN, K i HS dokładnie odczytane z mapy, zrzut przekroju. P05 zawiera minimalny renderer diagnostyczny profilu; nie czeka na docelowy renderer P11.

### P06 — Rozbieg i wybicie [M]

**Zależności:** P05. **Pliki:** inrun, takeoff, JumpState, konfiguracja strojenia, testy.

- [x] Zmiana belki wpływa na rozpęd; ↑ daje jeden skończony impuls przy kontakcie.
- [x] Brak przycisku powoduje pasywny lot, wczesne i późne naciśnięcie mają różny czytelny efekt.
- **Weryfikacja:** P06 sprawdza impulsy i stany w chwili oderwania dla serii czasów wejścia. Po integracji P08, jeszcze przy odbiorze PKG-002, dodać wykres długość/przesunięcie wejścia. Nie wpisywać wykresu jako wykonanego przy samym P06.

### P07 — Lot i korekta pozycji [M]

**Zależności:** P06. **Pliki:** aerodynamics, pose controller, coefficient curves, testy.

- [x] Prędkość względem powietrza, opór/nośność, ograniczone tempo obrotu.
- [x] Poprawna pozycja pomaga, nadmierna korekta szkodzi; brak nieskończonego unoszenia.
- **Weryfikacja:** porównanie śladów idealny/brak korekty/przeciągnięcie; bezwizualny test stabilności.

### P08 — Kontakt, lądowanie i odjazd [M]

**Zależności:** P07. **Pliki:** swept collision, landing controller, outrun, event journal, testy.

- [x] T/R rozpoczynają różne przygotowania, kontakt uwzględnia stok; działa upadek.
- [x] Pomiar tylko raz; ustany odjazd trwa do fall line, upadek kończy `FallSettled` także przed linią; zawsze osiągalny wynik końcowy.
- **Weryfikacja:** Q-SIM-02/06/08/10, oba lądowania na krótkiej/długiej próbie, brak przygotowania i upadek ze stanem spoczynku daleko przed fall line. Powtórzyć test niezależności wyniku od renderHz na zintegrowanej symulacji, nie tylko demonstratorze P04.

### P09 — Długość i noty [M]

**Zależności:** P08. **Pliki:** distance scoring, style scoring, rules data, fixtures.

- [x] Współczesna tabela pkt/m i baza 120 na mamutach; pomiar w połówkach metra.
- [x] Pięć not, trzy środkowe, jawne potrącenia zgodne z kategoriami FIS.
- **Weryfikacja:** Q-FIS-01/02/03/04/07; wektory ze specyfikacji; bez dodatków wind/gate do czasu P13.

### P10 — Wiatr i pomiary [M]

**Zależności:** P07. **Pliki:** seeded wind, sensor aggregate, wind view model, testy.

- [x] Gładkie pole i podmuchy, jawny znak head/tail, seed oddzielony od grafiki.
- [x] Pomiar agregowany w zdefiniowanym oknie; HUD nie jest źródłem punktacji.
- **Weryfikacja:** test znaku, powtarzalność, pauza i wyłączenie śniegu nie zmieniają wiatru.

### P11 — Pierwsza kompletna scena wizualna [M]

**Zależności:** P05, P08, P10. **Pliki:** terrain renderer, camera, jumper renderer, tymczasowy atlas, HUD.

- [x] Boczne ujęcie, widoczna powierzchnia stoku, sprite i próg czytelne w 960×540.
- [x] Kamera nie gubi lądowania; wszystkie warstwy używają wspólnej transformacji.
- **Weryfikacja:** nagranie całego skoku i screenshoty 1:1/2×; placeholdery jawnie oznaczone w raporcie.

### P12 — Grywalny trening [M]

**Zależności:** P09, P11. **Pliki:** TrainingScreen, ResultScreen, retry flow, feedback, test e2e.

- [x] Start→skok→noty→następna próba działa wyłącznie klawiaturą; jeden główny komentarz po próbie.
- [x] Użytkownik może wykonać 10 kolejnych skoków bez błędu stanu; techniczna skocznia nie udaje realnego obiektu.
- **Weryfikacja:** pełny e2e i krótka obserwacja gracza; zapisać krzywą błędu wybicia z P06.

### Bramka A — rdzeń

Technicznie powtarzalny skok, czytelny próg, sensowna różnica obu lądowań i szybki retry. Jeśli gra nie daje kontroli nad wynikiem, poprawić P06–P12 przed rozszerzeniem. Ocena graczy osobna od testów automatycznych. Brak testera nie blokuje researchu i narzędzi danych, ale pozostaje NOT RUN.

## 3. Wersja podstawowa

### P13 — Pełna punktacja nowoczesna [M, podzielić na P13a dane / P13b adapter]

**Zależności:** P09, P10. **Pliki:** fixtures FIS, compensation, rounding policy, coach threshold, testy.

- [x] Zamknąć Q03/Q05 dla zakresu MVP: znaki, jednostki, próg coach 95%, jury+coach, zaokrąglenia i kolejność ograniczenia wyniku od dołu; agregator czujników pozostaje jawnie ADAPT.
- [x] Odtworzyć 5 wierszy z QA oraz dodatkowy oficjalny wiersz lotów; współczynniki każdej skoczni mają pochodzenie.
- **Weryfikacja:** Q-FIS-05/06/08/17, wartości tuż pod/równo/nad progiem i bardzo krótkie skoki z obiema rekompensatami. Nie stosować prowizorycznej reguły po cichu w konkursie.

### P14 — Prawidłowe oznaczenia i linia prowadzenia [M]

**Zależności:** P05, P11, P13. **Pliki:** marker generator, marker renderer, target solver, fixtures.

- [x] K/HS, linie 5 m, pasy boczne, fall line wyprowadzone z distanceMap.
- [x] Cel prowadzenia uwzględnia punkty dotychczasowe, noty prognozowane, wiatr i próg coach; jest oznaczony jako szacunek.
- **Weryfikacja:** zrzut przekroju i gry tej samej pozycji; solver z warunkowym bonusem i nieosiągalnym celem.

Na tym etapie stan lidera podaje kontrolowany fixture. Integracja z rzeczywistym przebiegiem konkursu następuje w P16; renderer i solver nie mogą przez to zależeć od gotowego SeasonScreen.

### P15 — Zatwierdzenie skali artu i benchmark [M]

**Zależności:** P11, P14. **Pliki:** reprezentatywny atlas/tło/font, konfiguracja kamery, raport.

- [x] Wykonać szczegółową scenę 960×540 z wiarygodnym stadionem, skoczkiem i znakami; porównać czytelność w ruchu.
- [x] Zmierzyć pełną scenę ze śniegiem; zatwierdzić skalę 58 px nart / 43 px sylwetki oraz Canvas2D na podstawie pomiaru sprzętowego.
- **Weryfikacja:** TECHNICAL i VISUAL osobno; nagranie i raport sprzętu, brak obietnic wydajności bez pomiaru.

**Uwaga po PKG-006:** VISUAL tego zadania było self-review bez odbioru użytkownika. Użytkownik odrzucił efekt jako nie-pixelartowy i estetycznie nieakceptowalny. Zatwierdzenie skali 58/43 px oraz przyjęty wygląd sceny **tracą moc** i podlegają ponownej ocenie w P41/P42.

### P16 — Standardowy konkurs i jury [M, P16a ranking / P16b przebieg]

**Zależności:** P12, P13. **Pliki:** competition reducer, advancement, start lights, jury policy, testy.

- [x] Kwalifikacje 50/40, finał 30, remisy, reverse order, DNS/DSQ; źródłowo zamknięte 95% skompensowanej długości.
- [x] Działa trzyfazowy start i wynik po ukończonych seriach; rezygnacja nie usuwa sesji bez potwierdzenia.
- **Weryfikacja:** Q-FIS-09/10/14/16; standardowe i graniczne listy; zapisane przyczyny decyzji; blokada decyzji trenera od początku żółtej fazy.

### P17 — Przeciwnicy komputerowi [M]

**Zależności:** P08, P10, P16. **Pliki:** AI controller, difficulty data, fast-forward scheduler, testy.

- [x] Boty sterują tym samym rdzeniem; trzy trudności zmieniają decyzje, nie punkty człowieka.
- [x] Oglądany i pominięty skok bota kończą się identycznie; przeliczanie stawki oddaje sterowanie UI między porcjami.
- **Weryfikacja:** seed sweep i porównanie fast/normal; dystrybucja odległości i błędów do strojenia.

### P18 — Profile i hotseat [M]

**Zależności:** P04, P16, P17. **Pliki:** profile model, selection screen, handover, binding resolver, testy.

- [x] 1–10 ludzi zastępuje boty w puli 75; profile mają nazwy, kolory i klawisze.
- [x] Przekazanie klawiatury wymaga nowego Enter; poprawne nazwisko i bindy w każdym skoku.
- **Weryfikacja:**10 graczy, duplikaty nazw/identyfikatorów, polskie znaki, cały konkurs klawiaturą.

### P19 — Trwała sesja i wynik [M, P19a transakcja / P19b odzyskanie i blokada]

**Zależności:** P16, P18. **Pliki:** DB schema, repository, transactional result reducer, recovery, testy.

- [x] Wynik, rekord i postęp zatwierdzane atomicznie i idempotentnie.
- [x] Reload po wyniku wraca do właściwego zawodnika; błąd zapisu pozostawia dane i informację; podstawowa blokada zapisu jednej sesji przez dwie karty działa już w MVP.
- **Weryfikacja:** przerwany zapis, duplikat resultId, odmowa DB, ponowne uruchomienie i druga karta z tą samą sesją. P37 rozszerza testy odzyskiwania oraz importu; nie jest pierwszym zabezpieczeniem przed równoczesnym zapisem.

P19 dostarcza minimalny reducer statystyk i rekordu konkursowego potrzebny do transakcji, według jednej polityki z GAMEPLAY_SPEC.md §9. P20 rozszerza transakcję o replay, a P29 o pozostałe tryby i ekrany statystyk; nie tworzyć drugiej sprzecznej polityki rekordu w P29.

### P20 — Zapis i odtwarzanie replaya [M]

**Zależności:** P08, P19. **Pliki:** recorder, replay schema, player, ReplayScreen, testy.

- [x] Input ticks, próbki stanu, zdarzenia kontaktu i wersje; ostatni skok można obejrzeć od razu.
- [x] Pauza, tempo i przewijanie nie modyfikują punktacji; stary replay nie zależy od nowej fizyki.
- **Weryfikacja:** porównanie pozycji/zdarzeń z oryginalnym przebiegiem i test nowszej physicsVersion.

### P41 — Empiryczny audyt oprawy i porównanie z grami odniesienia [M]

Numer jest wyższy, bo zadanie dopisano po PKG-006; w kolejności wykonania P41 i P42
poprzedzają P21. Mapa pakietów jest źródłem prawdy o kolejności.

**Zależności:** P15, P20. **Pliki:** katalog dowodów audytu, raport porównawczy, lista rozbieżności.

**Status:** COMPLETE — [raport PKG-007](evidence/PKG-007/REPORT.md).

- [x] Zrzuty i nagrania każdego ekranu oraz każdej fazy skoku w 960×540 i 1920×1080, z powiększeniami 1:1 pokazującymi faktyczną siatkę pikseli.
- [x] Porównanie z Deluxe Ski Jump 2 i Ski Jump International 3 w kategoriach: skala i czytelność sylwetki, kamera, paleta, tło i stadion, HUD, animacja, feel skoku i sterowanie.
- [x] Ponumerowana lista rozbieżności z priorytetem, przyczyną w kodzie i szacowanym kosztem; jawne wskazanie miejsc, które nie są pixel artem.
- **Weryfikacja:** każda teza ma dowód obrazowy; brak ocen bez zrzutu. Audyt nie zmienia zachowania gry, a VISUAL pozostaje NOT RUN do decyzji użytkownika.

### P42 — Przebudowa oprawy do akceptacji użytkownika [L]

**Zależności:** P41. **Pliki:** renderer sceny, bank sprite'ów i animacji skoczka, tło/stadion, font bitmapowy, HUD, kamera, strojenie sterowania.

**Status:** COMPLETE — bramka V PASS po akceptacji użytkownika 22.09.2026 („Akceptuje :)”, REPORT PKG-008 §28); wygląd skoczka zaakceptowany 20.09.2026; techniczny zakres rund 11–20 wykonany i zweryfikowany. Runda 16 dodała cel treningowy, wyższą AUTO przy dodatnim wietrze, belkę z animacją ruszenia oraz idealne wybicie jako fizyczny impuls 18 N·s (nominalnie 2–4 m; jawne limity: outlier adaptacyjny belki 21, ekstremum wiatru) — szczegóły i korekta szkicu premii w ([raport PKG-008](evidence/PKG-008/REPORT.md) §23). Runda 17 poprawiła cel treningowy na połowę K–HS (127 m na K120/HS134; §24). Runda 18 poprawiła perspektywę wsporników belki (§25). Runda 19: HUD zaokrąglony do 0,5 m, wiatr/podmuchy `pkg008-wind-4`, belka podparta z dojściem (schody/pomost/winda), `[` `]` na belce w treningu, Backspace do menu, F po Esc (fizyka `pkg008-tune-9`, hill 3.5.0/rules-6 bez zmian; §26). Runda 20: dwa deterministyczne warianty podpórki dwiema rękami FRONT/BACK (art -8) oraz telemark hold 54 ticki = 0,45 s (§27). Weryfikacja: 262 unit (historyczne), build 181,25 kB / gzip 57,80, celowane testy przeglądarkowe. Bramka V PASS — USER ACCEPTED 22.09.2026; zewnętrzny jakościowy playtest NOT RUN.

- [x] Prawdziwy pixel art: jedna siatka, bitmapowy font, brak antyaliasingu i współrzędnych ułamkowych w warstwie gry.
- [x] Czytelny skoczek z klatkami animacji dla rozbiegu, wybicia, lotu, przygotowania, lądowania, odjazdu i upadku; skala i kamera na poziomie gier odniesienia.
- [x] Spójna paleta, tło i stadion, czytelny HUD niezasłaniający sceny, podstawowe efekty odczucia skoku.
- [x] Sterowanie i odczucie fizyki ocenione na ekranie i poprawione tam, gdzie audyt wykazał problem; zasady sportowe i wyniki bez zmiany.
- [x] Wygląd i animacja skoczka zaakceptowane przez użytkownika; nie przebudowywać ich ponownie bez nowej jawnej uwagi.
- [x] Trening dobiera bezpieczną belkę do prognozy wiatru tym samym źródłem prawdy co jury konkursu; decyzja i przyczyna są widoczne, deterministyczne i nie odbierają jawnej kontroli treningowej.
- [x] Wiatr konkursu tworzy spójne warunki serii: zwykle rzadkie i łagodne zmiany między zawodnikami, z okazjonalnym deterministycznym odwróceniem kierunku (np. w drugiej serii), bez losowej huśtawki co skok.
- [x] Ranking/plan wyników nie znika po serii bez potwierdzenia; gracz zawsze może odczytać bieżące miejsce i wynik rundy przed przejściem dalej, także po reloadzie.
- [x] Rozkład not sędziowskich jest skalibrowany z datowanych oficjalnych wyników FIS; 19,5–20,0 nie jest typową oceną gry, a czysty skok odpowiada medianie źródeł.
- [x] Zmiana belki przez trenera działa wyłącznie w czerwonej fazie, rzeczywiście zmienia rozbieg i poprawnie rozlicza warunkową rekompensatę; ścieżka jest testowana klawiaturą.
- [x] Pełny audyt formatowania każdego istniejącego widoku ma zrzut bazowy i końcowy; brak niewidocznych/uciętych/nakładających się tekstów, a pięć not sędziów jest pokazane osobno w czytelnych kwadratach/prostokątach wraz z odrzuconymi skrajnymi.
- **Weryfikacja:** **BRAMKA V PASS — USER ACCEPTED 22.09.2026** („Akceptuje :)”, REPORT PKG-008 §28); zewnętrzny jakościowy playtest NOT RUN. VISUAL nowej skoczni (H01) zalicza użytkownik, ale nie otwiera to ponownie bramki V oprawy bazowej.

### P21 — Cztery obiekty MVP [pakiet wielokrotny]

**Status:** COMPLETE — H01/H02/H03 ukończone w PKG-009/010/011 z osobnymi VISUAL USER PASS 23.09.2026 (H03: „skocznia obersdorff jest ok”, bez deklaracji obejrzenia pełnego filmu). H04/PKG-012 COMPLETE: VISUAL USER PASS 24.09.2026 po poprawkach bandy rozbiegu i belki AUTO. Zewnętrzny PLAYABILITY NOT RUN. Historyczna utrata sześciu artefaktów PKG-010 zaakceptowana bez odzyskania i bez zmian manifestu. Dowody: [PKG-009](evidence/PKG-009/REPORT.md), [PKG-010](evidence/PKG-010/REPORT.md), [PKG-011](evidence/PKG-011/REPORT.md), [PKG-012](evidence/PKG-012/REPORT.md). Aktywny [handoff: PKG-013/P22](handoffs/PKG-013.md).

**Zależności:** P13–P15, P20, P42. Obiekty: H01, H02, H03, H04. Dla każdego wykonać osobno cykl z §6: `P21-Hxx-D/G/A/V`.

- [x] Każdy ma kartę, profil, belki, metry, K/HS, współczynniki, własny wygląd i testy.
- [x] Wszystkie 4 działają w konkursie i replayu; nie są kopiami jednego profilu.
- **Weryfikacja:** odbiór per obiekt, potem konkurs 4 skoczni. Nie oznaczać pakietu jako gotowy po samym zebraniu danych.

### P22 — Ustawienia, pomoc wejścia i dostępność [M]

**Zależności:** P18, P19, P21. **Pliki:** settings, remap screen, text input adapter, font/accessibility layer, testy.

- [x] Mapowanie klawiszy, głośność, skalowanie, duży tekst, ograniczenie pogody wizualnej i przywrócenie domyślnych.
- [x] Cała ścieżka działa bez myszy, znaki PL/IME poprawne, litery w nazwie nie wykonują akcji.
- **Weryfikacja:** pełny keyboard walkthrough, remap konfliktów, mały ekran i replay z nowymi bindami — PASS 24.09.2026 ([raport](evidence/PKG-013/REPORT.md)); VISUAL nieodebrany, PLAYABILITY NOT RUN.

### Bramka B — MVP

Gra 4 skoczni, standardowy konkurs, trening, AI, hotseat, pełna punktacja, zapis i replay są działające. Każda skocznia ma prawidłowe oznaczenia i reprezentatywny art. Kompilacja i działający samotny skok nie wystarczą. To etap; 16 kolejnych obiektów i pozostałe tryby nadal są wymagane do v1.

## 4. Pełna struktura gry

### P23 — Puchar sezonowy [M]

**Zależności:** P16, P19, P21. **Pliki:** season reducer, calendar manifest, SeasonScreen, testy.

- [ ] Wyniki konkursów dają punkty pucharowe, nie dodają się jako punkty skoku; poprawne remisy.
- [ ] Wznowienie pomiędzy konkursami i zakończenie sezonu działa; na początku testowy kalendarz 4 obiektów, pełne 20 po P32.
- **Weryfikacja:** kontrolny sezon ze zdefiniowaną tabelą wyników i restartem w połowie.

### P24 — Własny kalendarz [M]

**Zależności:** P23. **Pliki:** calendar schema, editor screen, set hash, persistence, testy.

- [ ] Wybrać 1–40 konkursów, zmienić kolejność, zapisać/wczytać; brak odwołań do nieistniejących skoczni.
- [ ] Rekord zestawu rozróżnia kolejność, wersje i ustawienia.
- **Weryfikacja:** klawiaturowa edycja i powtórzenie tego samego zestawu; zmiana kolejności daje inny klucz.

### P25 — Turniej czterech skoczni i KO [M]

**Zależności:** P16, P23. **Pliki:** ko draw, ko advancement, bracket screen, tournament totals, testy.

- [ ] Dokładne pary,25 + 5 i wszystkie wyjątki remisu/nieobecności ze specyfikacji.
- [ ] Cztery konkursy sumują punkty skoków; docelowe H03/H05/H06/H07 po integracji P32.
- **Weryfikacja:** Q-FIS-11/13 i fixtures całej drabinki; żadnego udawanego losowania par.

### P26 — Drużyny czteroosobowe [M]

**Zależności:** P16, P18, P19. **Pliki:** team schema, team reducer, lineup screen, team scoreboard, testy.

- [ ] Obsada 4 miejsc, dwie serie i finał 8; kolejność każdej grupy finałowej według aktualnego wyniku.
- [ ] Mieszana obsada ludzie/boty ma jawne sterowanie; walidacja braku duplikatów.
- **Weryfikacja:** Q-FIS-12; źródłowo rozstrzygnąć graniczny remis drużyn przed finalizacją fixture'a.

### P27 — Super Team [M]

**Zależności:** P26. **Pliki:** superteam format, advancement, screen variant, testy.

- [ ] 2 zawodników na zespół, trzy serie, awans 12→8; suma wszystkich zaliczonych skoków.
- [ ] Wyniki i kolejność grup finału odświeżane poprawnie.
- **Weryfikacja:** pełny konkurs 16 zespołów, eliminacje i wznawianie między grupami.

### P28 — King of the Hill [M]

**Zależności:** P16, P18. **Pliki:** koth reducer, challenge data, elimination screen, testy.

- [ ] Najgorszy odpada, turniej kończy się zwycięzcą; tryb jawnie rozrywkowy.
- [ ] Remis ostatnich uruchamia jedną dogrywkę tych osób; kolejny remis eliminuje grupę, a remis wszystkich pozostałych daje wspólne zwycięstwo (ADAPT).
- **Weryfikacja:**2,3,10 uczestników, remis wszystkich, wyjście ostatniego człowieka, brak nieskończonej pętli.

### P29 — Rekordy i statystyki [M]

**Zależności:** P19, P20, P23–P28. **Pliki:** record policy, stats reducer, history/records screens, testy.

- [ ] Osobne rekordy treningu/konkursu/zestawu; automat replaya rekordu; statystyki sezonu i skoków.
- [ ] Zmiana wersji archiwizuje stare rekordy, brak utraty i mieszania wyników.
- **Weryfikacja:** Q-FIS-15, remisy rekordu, DSQ/upadek, powtórne zatwierdzenie wyniku.

### Bramka C — wszystkie tryby

Każdy tryb ma pełną drogę wejście→gra→wynik→powrót, poprawną obsadę i zapis. Nie wymaga jeszcze 20 ukończonych assetów, ale nie może mieć pustego menu prowadzącego do „coming soon”.

P25 sprawdza silnik turnieju na dostępnych czterech obiektach, pod nazwą zestawu testowego. Dopiero P32 wiąże go z właściwymi H03/H05/H06/H07. Nie podpisywać zastępczej skoczni jako Innsbruck i nie tworzyć cyklicznej zależności P25→P32→P30→P29→P25. Bramka D obejmuje finalny kalendarz i właściwe obiekty.

## 5. Zawartość, dopracowanie i zamknięcie

### P30 — Kompletna animacja i interfejs [M, P30a sprite / P30b UI]

**Zależności:** P15, P22, P29. **Pliki:** mastery/atlas skoczka, font, UI atlas, manifest.

- [ ] Wszystkie fazy skoku i błędy mają spójne, czytelne animacje; brak placeholderów na normalnej ścieżce.
- [ ] Wszystkie menu/tabele utrzymują styl gry; duży tekst i polskie znaki gotowe.
- **Weryfikacja:** obraz 1:1/2×, nagranie wybicia i kontaktu; tablice wyników w kilku rozmiarach okna.

### P31 — Pełny dźwięk [M, osobne podzadanie na muzykę]

**Zależności:** P03, P08, P22. **Pliki:** audio director, manifest, bank SFX, muzyka, test lifecycle.

- [ ] Pętle i efekty wszystkich faz, wyciszenie podczas pauzy, suwaki niezależnych kategorii.
- [ ] Każdy utwór/efekt ma autora i licencję; audio nie jest wymagane do odczytu zasad.
- **Weryfikacja:** odsłuch przejść,50 prób bez narastania liczby głosów, autoplay denied i powrót z tła.

### P32 — Pozostałe 16 skoczni [pakiet wielokrotny]

**Zależności:** P21, P30. Obiekty H05–H20; dla każdego `P32-Hxx-D/G/A/V` z §6. Najpierw H05–H07 dla kompletnego turnieju, potem H08–H14, następnie H15–H20.

- [ ] Każdy obiekt ma osobny źródłowy profil, współczynniki i rozpoznawalne otoczenie; nowe dane zweryfikowane aktualnie.
- [ ] Kalendarze korzystają z 20 gotowych skoczni; żadnego podmieniania brakującego obiektu kopią bez informacji.
- **Weryfikacja:** test per obiekt, przegląd 20 miniatur/profili i kompletny sezon.

### P33 — Pierwsze uruchomienie, teksty i instrukcja [M]

**Zależności:** P22, P29, P30. **Pliki:** tutorial, polski katalog tekstów, help, credits, test nawigacji.

- [ ] Nowy gracz dochodzi do treningu bez tworzenia konta i nadmiaru ekranów.
- [ ] Pomoc wyjaśnia pięć akcji, różnicęK/HS, rekompensaty, telemark i replay; stosuje aktualne bindy.
- **Weryfikacja:** ścieżka nowego profilu i audyt wszystkich widocznych napisów, bez mylenia K z HS.

### Bramka D — kompletna zawartość

20 obiektów, wszystkie tryby, docelowy art i audio, komplet polskich ekranów. Lista assetów i licencji kompletna. Przejścia gry nie zawierają placeholderów ani technicznych etykiet prototypu.

### P34 — Matryca przeglądarek i ekranów [M]

**Zależności:** P30–P33. **Pliki:** browser scenarios, render/input fixtures, raporty.

- [ ] Chromium/Firefox/WebKit automatycznie; dostępne platformy ręcznie, zwłaszcza fullscreen/audio.
- [ ] Sprawdzić DPR, zoom, resize, iframe, blur i pełną klawiaturową ścieżkę.
- **Weryfikacja:** QA§5; braki maszyn oznaczone NOT RUN i zgodnie ograniczona deklaracja wsparcia.

### P35 — Profilowanie i naprawy wydajności [M]

**Zależności:** P15, P17, P32, P34. **Pliki:** profilery scen, celowane poprawki, raport.

- [ ] Zmierzyć docelowe sceny, szybkieAI, replay, wielokrotne przejścia 20 skoczni.
- [ ] Poprawić wykazane problemy bez zmiany fizyki lub ukrytego zmniejszenia jakości gracza.
- **Weryfikacja:** raport przed/po na tej samej maszynie; regresja wyników i brak rosnącej pamięci.

### P36 — Offline i aktualizacje [M]

**Zależności:** P19, P32, P34. **Pliki:** service worker, build manifest, update controller, offline tests.

- [ ] Pełna gra działa offline po pobraniu; cache ograniczony do produktu.
- [ ] Update nie przerywa skoku i nie miesza wersji danych/atlasów/skryptów.
- **Weryfikacja:** build A→B, odłączona sieć, reload w podkatalogu, brak cache przy pierwszej wizycie.

### P37 — Migracje, kopie i awarie danych [M]

**Zależności:** P19, P20, P29. **Pliki:** import/export, migrations, session lease, recovery tests.

- [ ] Eksport/import bez utraty, walidacja błędnych plików, limit danych i idempotentna migracja.
- [ ] Dwie karty nie zapisują jednocześnie; awaria/quota ma czytelny komunikat i ścieżkę odzyskania.
- **Weryfikacja:** QA§6, porównanie hashy logicznych danych przed/po roundtrip.

### P38 — Playtest i korekty rozgrywki [M, iteracje numerowane]

**Zależności:** P33–P37. **Pliki:** scenariusz i obserwacje, strojenie lub naprawy z dowodami.

- [ ] Zrealizować scenariusz 3–5 osób; ocenić kontrolę, naukę, linie, wybór lądowania i tempo zawodów.
- [ ] Każda istotna korekta fizyki lub zasad aktualizuje wersję i odtwarza odpowiednie testy; nie kasuje rekordów.
- **Weryfikacja:** odrębny PLAYABILITY; brak testerów nie oznacza „gra gotowa i wciągająca”.

### P39 — Pakiet wydania [M]

**Zależności:** P34–P38. **Pliki:** release manifest, build, instrukcja hostingu, credits/licencje, znane problemy.

- [ ] Zweryfikować build z `/` i podkatalogu, komplet assetów, brak researchu/skilli/debug/sekretów.
- [ ] Przygotować ZIP/artefakt do hostingu i instrukcję konfiguracji HTTPS/cache/zapisów.
- **Weryfikacja:** świeży lokalny preview buildu, checksum artefaktu i pełny smoke. Publikacja publiczna wyłącznie w ramach osobnego polecenia użytkownika.

### P40 — Zamknięcie dokumentacji i handoff [S]

**Zależności:** P39. **Pliki:** README, release notes, status planu, kolejny handoff, raport zbiorczy.

- [ ] Przepisać stan planu zgodnie z faktycznymi dowodami; każdy pozostały brak nazwany.
- [ ] Podać uruchomienie, testy, wersje i ścieżkę artefaktu; nie zostawić nieaktualnego promptu „zacznij od zera”.
- **Weryfikacja:** linki, spójność wersji, czytelny raport TECHNICAL/VISUAL/PLAYABILITY i checksum.

### Bramka E — v1 gotowe do publikacji

Wszystkie wymagania U01–U12 i zadania P01–P40 zamknięte dowodami, pełne 20 skoczni, brak blockerów reguł, oprawy, zapisów i sterowania. Odbiór graczy oddzielny od testów. Publiczna publikacja nie jest automatycznym skutkiem przygotowania artefaktu.

## 6. Powtarzalny cykl produkcji każdej skoczni

Nie ma jednego zadania „zrób 16 skoczni”. Dla każdego Hxx wykonuje się cztery małe zależne zadania:

| Sufiks | Zakres i pliki | Kryterium odbioru | Zależność |
| ---| ---| ---| ---|
| D | Karta źródeł + mały plik parametrów | Każda liczba ma źródło alboADAPT; dokładny obiekt i data | Poprzedni etap wspólny |
| G | Krzywe, distanceMap, belki, fixtures | Skoki kontrolne i linie zgadzają się z geometrią | D |
| A | Master pixel art, atlas/miniatura, manifest | Szczegółowy pixel art na ustalonej siatce, własny landmark | G i P15 dla P21; G i P30 dla P32 |
| V | Integracja manifestu + raport z obrazem/nagraniem | Konkurs, replay, oba lądowania, wiatr i zapis na obiekcie | A |

Cykl H03: `P21-H03-D → P21-H03-G → P21-H03-A → P21-H03-V` COMPLETE, w tym VISUAL USER PASS 23.09.2026 („skocznia obersdorff jest ok”); użytkownik nie potwierdzał obejrzenia pełnego filmu. Incydent PKG-010 zamknięty akceptacją udokumentowanej utraty oryginałów, bez ich pozornej rekonstrukcji. Cykl H04: `P21-H04-D → P21-H04-G → P21-H04-A → P21-H04-V` COMPLETE: V 3/3 PASS ([raport](evidence/PKG-012/REPORT.md)) i VISUAL USER PASS 24.09.2026 po poprawkach bandy rozbiegu i belki AUTO; PKG-012 i P21 COMPLETE. Zewnętrzny playtest NOT RUN.

## 7. Wspólne polecenia i dowody

Po P02 standardem są: `npm run typecheck`, `npm test`, `npm run build`; dla zmian przepływu `npm run test:e2e`. Konkretny filtr testu zapisuje pakiet po powstaniu plików. Nie twierdzić dziś, że te polecenia już działają. Testy kierować na zmieniony obszar, a pełny zestaw uruchamiać na bramkach i wydaniu.

Wystarcza jeden `docs/evidence/PKG-NNN/REPORT.md` z krótką sekcją końcowego review i wynikami zadań. Dowody Pxx/Hxx można przechować razem i wskazać w raporcie; nie są wymagane osobne raporty każdego kroku. Dołącz potrzebne testy/logi oraz reprezentatywne screenshoty lub nagrania zmian graficznych/wejścia. Zachowaj istniejące dowody. Domyślnie pracuj jednym modelem, bez dodatkowych agentów-recenzentów.

**Każdy pakiet, nie tylko P40, musi zakończyć się nowym promptem.** Szczegóły i archiwizacja w PACKAGE_WORKFLOW.md. Jeżeli pakiet nie jest kompletny, następna sesja kontynuuje jego brakujące zadania; nie przeskakuje do późniejszego pakietu. Po ostatnim pakiecie prompt wskazuje rzeczywiście pozostały odbiór/publikację wymagającą osobnego polecenia, albo zamknięcie projektu bez wymyślania nowych funkcji.

## 8. Śledzenie wymagań

| Wymaganie | Zadania odpowiedzialne |
| ---| ---|
| U01 od zera | P01, P02 |
| U02 web | P02, P03, P34, P36, P39 |
| U03 fullscreen / gra DOS | P03, P11, P15, P22, P30, P34 |
| U04 inspiracja SJ3 | P01, P06–P12, P18, P20, P23–P29 |
| U05 pixel art | P11, P15, P21, P30, P32 |
| U06 nowe tła/kolory | P15, P21, P30, P32 |
| U07 klawiatura | P04, P12, P18, P22, P33, P34 |
| U08 dokumentacja/plan | Obecna dostawa, P40 |
| U09 nowoczesny sport/linie | P05, P09, P13, P14, P16, P21, P25–P27, P32 |
| U10 więcej detali i wyższa rozdzielczość | P03, P11, P15, P21, P30, P32, P35 |
| U11 prompt po każdym pakiecie | Wszystkie PKG według PACKAGE_WORKFLOW.md; dodatkowo P40 przy zamknięciu v1 |
| U12 prostota i jedno końcowe review | Wszystkie PKG; nadrzędne zasady wykonania w AGENTS.md |
