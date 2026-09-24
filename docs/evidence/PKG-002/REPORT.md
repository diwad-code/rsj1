# PKG-002 — raport zamknięcia

Data: **16.09.2026**. Wynik pakietu: **COMPLETE**. Zakres: P05, P06, P07, P08.

Efekt: jedna techniczna, jawnie fikcyjna skocznia K120/HS134 oraz deterministyczny pełny przebieg
`GateGreen → Inrun → Takeoff → Flight → LandingPrep → Contact → Outrun/FinishLine albo Fall/FallSettled`.
To nadal nie jest grywalny trening ani punktacja — te należą do PKG-003.

## Status zadań

| Zadanie | Status | Wynik |
| --- | --- | --- |
| P05 — profil skoczni i mapa metrażu | COMPLETE | Wersjonowany `HillSpec` K120/HS134 z osobnymi danymi rozbiegu, zeskoku i wybiegu, punktami T/P/K/HS/U, 12 belkami i fall line. Sampler pozycji/stycznej/normalnej, monotoniczna mapa metrażu, walidator danych i diagnostyczny renderer profilu z punktami i metrami. |
| P06 — rozbieg i wybicie | COMPLETE | `JumpSimulation` z fazami P06–P08. Rozbieg po krzywej długości łuku; belka zmienia rzeczywistą drogę rozpędzania (91,75–100,00 m) i prędkość na progu (88,2–92,0 km/h). Nowe ↑ startuje jeden skończony impuls tylko przy kontakcie z torem; brak ↑ daje lot pasywny. Krzywa długość/timing zapisana po integracji z P08. |
| P07 — lot i korekta pozycji | COMPLETE | SI, `dt = 1/120 s`, semi-implicit Euler, `vAir = vJumper − vWind`, ograniczona tabela CL/CD, ograniczone tempo dojścia do docelowego pitch. Trzy różne ślady: idealny / brak korekty / nadmierna korekta. ← i → razem neutralne. Brak nieskończonego unoszenia i NaN. |
| P08 — kontakt, lądowanie i odjazd | COMPLETE | Swept contact odcinka ruchu z polilinią stoku. T i R dają różne przygotowania, przy T+R w tym samym ticku wygrywa R. Pomiar dokładnie raz. Odjazd trwa do fall line; upadek kończy `FallSettled` po ustaniu ruchu albo kontrolowanym limicie 3 s, także wysoko przed fall line. Każda ścieżka osiąga stan terminalny. |

## Istotne zmiany

Nowe moduły symulacji (czyste, bez DOM/Canvas/audio):

- `src/simulation/hill.ts` — `ProfileCurve` próbkowana stałym krokiem długości łuku, sampler pozycji/stycznej/normalnej, mapa metrażu i `sweepContact`.
- `src/simulation/technicalHill.ts` — dane technicznej K120/HS134 (`tech-k120-hs134` v1.0.0), budowa skoczni i `validateHill`.
- `src/simulation/params.ts` — cały zestaw TUNE w jednym miejscu, z `physicsVersion`.
- `src/simulation/aero.ts` — jawna, ograniczona tabela CL/CD i siła aerodynamiczna liczona z `vAir`.
- `src/simulation/jump.ts` — `JumpSimulation`: fazy, impuls wybicia, lot, kontakt, odjazd, upadek i dziennik zdarzeń.

Prezentacja i shell:

- `src/render/hillView.ts` — diagnostyczny widok profilu (T/P/K/HS/U, fall line, kreski co 5 m, pasy boczne z danych, belki) oraz podgląd przebiegu skoku. Statyczny profil rysowany raz do bufora i przepisywany, zgodnie z [TECHNICAL_DESIGN §8](../../TECHNICAL_DESIGN.md).
- `src/app/main.ts` — dodany ekran `jump`: Enter w menu startuje próbę, `[`/`]` wybiera belkę, Enter po wyniku wraca do menu. Pauza, blur, ukrycie karty i limit nadrabiania działają tak samo jak w menu. Menu, tytuł, fullscreen i audio z PKG-001 pozostają bez przebudowy.
- `playwright.config.ts` — `outputDir` przeniesiony do `docs/evidence/PKG-002/browser-artifacts`. Nagranie PKG-001 pozostaje zamrożone pod swoją dotychczasową ścieżką.
- `@types/node` dodany jako devDependency: generator tabel dowodowych i test czystości symulacji czytają i zapisują pliki.

Zmiana w geometrii świata: krawędź progu (punkt T) leży w `(0, 0)`, oś x biegnie w kierunku lotu, y do góry. Metraż zeskoku jest wprost parametrem krzywej, więc K i HS są odczytywane z tej samej mapy, której używa pomiar kontaktu.

## Parametry TUNE

`physicsVersion = pkg002-tune-1`, `dt = 1/120 s`, `g = 9,81 m/s²`, `rho = 1,20 kg/m³`, `m = 65 kg`.

| Grupa | Wartości |
| --- | --- |
| Rozbieg | tarcie 0,02; Cd×A 0,30 m² |
| Wybicie | czas impulsu 0,21 s; popęd 195 N·s; zanik wyprostu 0,16 s; idealne wyprzedzenie progu 0,20 s; pitch neutralny 22°; kara pitch 70°/s (wcześnie) i 45°/s (późno); popęd wzdłuż toru 35 N·s |
| Lot | pole odniesienia 0,50 m²; skala CD 1,0; komenda pitch 26°/s; tempo dojścia 48°/s; zakres sterowania −26°…46°; twardy limit lotu 12 s |
| Lądowanie | przygotowanie telemarku 0,28 s, równoległego 0,16 s; graniczna prędkość normalna 12,0 / 15,0 m/s; graniczny błąd kąta 26° / 34°; próg stabilności 0,34 |
| Odjazd | tarcie 0,06; Cd×A 0,70 m²; prędkość spoczynku 0,60 m/s |
| Upadek | tarcie 0,55; Cd×A 1,10 m²; limit rozliczenia 3,0 s |

Stabilność kontaktu: `stability = gotowość × (1 − 0,6 × v⊥/v⊥max − 0,4 × błądKąta/błądKątaMax)`. Upadek, gdy `stability < 0,34`. Wszystkie progi są TUNE/ADAPT; nie są danymi FIS ani deklaracją zgodności aerodynamicznej.

Geometria technicznej K120/HS134 (ADAPT): rozbieg 100 m, 12 belek co 0,75 m, stół progowy 6,5 m przy 10,5°; zeskok od 24° pod progiem do 34° w P i 30,5° w HS; punkt U 152 m, fall line 205 m, koniec wybiegu 235 m. K leży 65,0 m poniżej i 102,3 m przed krawędzią progu.

## Weryfikacja

| Polecenie / sprawdzenie | Wynik | Dowód |
| --- | --- | --- |
| `node --version`, `npm --version` | PASS | Node v26.7.0, npm 12.0.2. |
| `npm run typecheck` | PASS | TypeScript 7.0.2 bez diagnostyk na finalnym kodzie. |
| `npm test` | PASS | 9 plików, 82/82 testów; poprzednie 14 testów shella z PKG-001 nadal zielone. |
| `npm run build` | PASS | Vite 8.3.0; statyczny `dist/`, główny JS 37,35 kB (12,91 kB gzip). |
| `npm run test:e2e` | PASS | 10/10 scenariuszy na finalnym buildzie, w tym pełny skok sterowany wyłącznie klawiaturą. |
| Obejrzenie zrzutów 1:1 | PASS / OBSERVED | Profil, faza lotu, wynik i upadek obejrzane w 1280×720; punkty T/P/K/HS/U, kreski metrowe, pasy boczne, aktywna belka i ślad lotu są czytelne. |
| `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff` | PASS | Spójna mapa 40 zadań / 33 pakietów, poprawne linki i identyczny aktywny handoff PKG-003. |

### Dowody wymagane przez zakres pakietu

| Wymagany dowód | Gdzie |
| --- | --- |
| Sampler profilu, styczna/normalna, monotoniczna mapa metrażu, dokładne K120 i HS134, brak NaN/out-of-range | [`tests/hill.test.ts`](../../../tests/hill.test.ts) — 19 testów; [tabela 1](simulation-tables.md) |
| Seria timingów wybicia i wpływ co najmniej dwóch belek | [`tests/takeoff.test.ts`](../../../tests/takeoff.test.ts); [tabele 2 i 3](simulation-tables.md) — 15 punktów timingu i 4 belki |
| Ślady idealny / brak korekty / nadmierna korekta, brak niestabilności numerycznej | [`tests/flight.test.ts`](../../../tests/flight.test.ts); [tabela 4](simulation-tables.md) |
| Swept contact przy dużej prędkości | [`tests/hill.test.ts`](../../../tests/hill.test.ts) — pomiar z chwili przecięcia, krok wielu odcinków, brak przenikania w pełnym przebiegu |
| Telemark i dwie nogi na krótkiej i długiej próbie, brak przygotowania, upadek `FallSettled` przed fall line | [`tests/landing.test.ts`](../../../tests/landing.test.ts); [tabela 5](simulation-tables.md) |
| Jeden input trace przy renderze 30/60/120/144 Hz daje te same zdarzenia terminalne | [`tests/jumpIntegration.test.ts`](../../../tests/jumpIntegration.test.ts) — identyczny dziennik, wynik, odległość i tick terminalny |
| Pauza/blur/hidden bez nadrabiania i bez trzymanego klawisza po wznowieniu | [`tests/jumpIntegration.test.ts`](../../../tests/jumpIntegration.test.ts) oraz E2E w locie |
| Zrzut technicznego profilu | [1280×720](hill-profile-1280x720.png), [1920×1080](hill-profile-1920x1080.png) |
| Krótki zapis jednego pełnego skoku | [WebM](browser-artifacts/z_capture_jump-zapis-pełnego-skoku-technicznego/video.webm) |

Dodatkowe zrzuty: [próg](jump-takeoff-1280x720.png), [lot](jump-flight-1280x720.png), [wynik](jump-result-1280x720.png), [upadek](jump-fall-1280x720.png).

Pełne tabele liczbowe: [`simulation-tables.md`](simulation-tables.md). Plik jest generowany przez `tests/evidenceTables.test.ts` w trakcie `npm test`, więc zawiera dokładnie te liczby, które sprawdzają asercje.

### Q-SIM

| ID | Wynik | Dowód |
| --- | --- | --- |
| Q-SIM-01 | PASS | Ten sam ślad wejścia przy 30/60/120/144 Hz: identyczny dziennik zdarzeń, odległość, wynik i tick terminalny; dokładnie jeden impuls wybicia przy każdej częstości. |
| Q-SIM-02 | PASS | Swept contact: pomiar z chwili pierwszego przecięcia (różnica ponad 0,3 m wobec naiwnego testu pozycji końcowej), krok obejmujący wiele odcinków, brak przenikania w pełnym przebiegu. |
| Q-SIM-04 | PASS | Auto-repeat ↑ nie daje drugiego wybicia; ← i → razem są neutralne; T+R w tym samym ticku wybiera R. |
| Q-SIM-05 | PASS | Pauza w locie: brak nadrabiania po 4 s przerwy, pusty zbiór trzymanych klawiszy po resecie, `keyup` po wznowieniu nie tworzy samotnego `released`. Potwierdzone także w przeglądarce (P, ukrycie karty). |
| Q-SIM-06 | PASS | Nieudane lądowanie kończy się `FallSettled`, wynikiem i statusem; demonstrator wraca do menu Enterem. |
| Q-SIM-08 | PASS | Maksymalna belka z nadmierną korektą: brak NaN, metraż w zakresie skoczni, kontrolowany odjazd. Wiatr nie jest częścią PKG-002 (P10). |
| Q-SIM-09 | PASS | Ten sam znacznik czasu trafia w ten sam tick przy 30 i 144 Hz; obie krawędzie bardzo krótkiego naciśnięcia zachowane. |
| Q-SIM-10 | PASS | Upadek bez przygotowania kończy `FallSettled` na 193,2 m, a na krótkiej próbie na 136,7 m — obie wartości przed fall line 205 m. |
| Q-SIM-03 | CZĘŚCIOWO — krzywa zapisana | 15-punktowa seria timingu z asercjami ciągłości i monotoniczności po obu stronach optimum. Pełne domknięcie Q-SIM-03 wymaga oceny gracza, która należy do bramki A. |
| Q-SIM-07 | NOT RUN | Śnieg i szybkie AI powstają w P16/P11; poza zakresem PKG-002. |

Playtest przyjemności: **NOT RUN** — zgodnie z planem należy do bramki A po P12.

## Końcowe review

Jedno końcowe review objęło cały zakres P05–P08: moduły symulacji, renderer diagnostyczny, zmianę demonstratora, testy i dowody. Sprawdzono zgodność z zakresem pakietu oraz z Q-SIM. Znaleziono i poprawiono cztery konkretne problemy:

1. **Limit rozliczenia upadku przekraczany o jeden tick.** Akumulacja `fallSeconds` w liczbach zmiennoprzecinkowych dawała 3,008 s zamiast 3,000 s. Dodano półkrokowy margines w warunku limitu. Sprawdzono ponownie `tests/landing.test.ts`.
2. **Pitch na progu raportowany po zakończeniu skoku.** Tabela timingu pokazywała jedną wartość dla wszystkich przesunięć, bo odczytywała bieżący pitch na wybiegu. Dodano `takeoffPitchRad` zapisywany w chwili oderwania; tabela pokazuje teraz ciągłą zmianę 37,8° → 14,1°.
3. **Widok diagnostyczny zasłonięty przez panele i przerysowywany w każdej klatce.** Obszar profilu ograniczono do miejsca nad panelami, poprawiono kolizje podpisów metrowych z markerami, a statyczny profil przeniesiono do bufora. To realny problem budżetu klatki: pętla 120 Hz przy limicie 8 ticków potrafiła wejść w celową pauzę.
4. **Niestabilne testy przeglądarkowe pod obciążeniem.** Powodem była udokumentowana z PKG-001 auto-pauza po przekroczeniu budżetu klatki, na którą testy nie były odporne. Oczekiwania w `jump.spec.ts`, `z_capture_jump.spec.ts` i `shell.spec.ts` wznawiają teraz taką pauzę i **sprawdzają, że jej powodem jest wyłącznie ten mechanizm**, a nie inny błąd stanu. Po poprawce wykonano cztery kolejne pełne przebiegi `test:e2e` — wszystkie 10/10.

Uzupełniono też dwa brakujące dowody wykryte w review: test upadku wywołanego samą prędkością normalną przy pełnym przygotowaniu i prawidłowym kącie (ten sam kontakt przewraca telemark, a dwie nogi jeszcze amortyzują) oraz test czystości symulacji sprawdzający na źródłach, że `src/simulation/` nie sięga do DOM, Canvas, audio ani magazynu danych.

Nie znaleziono implementacji funkcji spoza zakresu: nie ma punktacji, not, kompensat, wiatru, retry ekranu ani systemu assetów. Nie przebudowano menu ani shella z PKG-001.

## Ograniczenia i znane niewiadome

- **Skocznia jest fikcyjna.** `tech-k120-hs134` to profil techniczny ADAPT, a nie cyfrowa kopia homologowanego obiektu. Realne skocznie wchodzą z P21/P32. Widok nazywa to wprost na ekranie.
- **Prędkość lądowania jest za wysoka.** Przy idealnym skoku kontakt następuje przy około 130 km/h, a realne wartości to około 95–105 km/h. Model za mało energii rozprasza na oporze. Sprawdzono alternatywne strojenie o większej nośności: daje realistyczne 90 km/h, ale spłaszcza wpływ belki z 12 m do 3 m i wpływ wybicia z 38 m do 19 m, czyli psuje dokładnie te zależności, których wymaga P06. Zostawiono obecny zestaw; osiami ponownego strojenia są `referenceAreaSquareMeters` i `dragScale`. Do rozstrzygnięcia przy P09/P12, gdy jakość lądowania zacznie wpływać na noty.
- **Parametry aerodynamiki, wybicia, lądowania i tarcia pozostają TUNE.** Nie twierdzimy zgodności z pomiarami tunelowymi ani z aparaturą FIS.
- **Pilot referencyjny w testach nie jest graczem.** Ślad „idealny” to zamknięta pętla utrzymująca zadany kąt natarcia. Mówi o właściwościach modelu, nie o tym, czy skok jest przyjemny.
- **Q03 z `DECISIONS_RISKS.md` pozostaje UNRESOLVED.** PKG-002 nie dotyka zaokrągleń coach 95%, skompensowanej długości ani kolejności ograniczenia wyniku do zera.
- **Wiatr jest zerowy.** Wzór już używa `vAir = vJumper − vWind` i konwencji znaku z `GAMEPLAY_SPEC`, ale pole wiatru powstaje w P10.
- **Auto-pauza po przekroczeniu budżetu klatki nadal występuje** — to celowe zachowanie z PKG-001. Pod obciążeniem automatyzacji lub narzędzia zrzutu gra przechodzi w widoczną pauzę zamiast nadrabiać czas.
- **Matryca przeglądarek, DPR i ultrawide** pozostaje przypisana P34. W PKG-002 sprawdzono Chromium w 1280×720 i 1920×1080.

Następny prompt: [PKG-003 — P09–P12](../../handoffs/PKG-003.md).
