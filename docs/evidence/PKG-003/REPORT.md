# PKG-003 — raport zamknięcia

Data: **16.09.2026**. Wynik pakietu: **COMPLETE**. Zakres: P09, P10, P11, P12.

Efekt: grywalny trening na fikcyjnej skoczni technicznej K120/HS134. Gracz wchodzi z menu,
wykonuje skok klawiaturą, widzi deterministyczny wiatr, długość, pięć not, dwie skreślone
noty, sumę długość+styl i jeden komentarz, a Enter rozpoczyna następną próbę. PKG-003
nie nalicza jeszcze punktów za wiatr ani belkę.

## Status zadań

| Zadanie | Status | Wynik |
| --- | --- | --- |
| P09 — długość i noty | COMPLETE | Tabela pkt/m ze wszystkimi granicami K, baza 120 pkt dla K≥180, odrzucenie K165–179, odległość obcinana do 0,5 m, pięciu deterministycznych sędziów i dokładnie dwie skreślone noty. Kary lot/lądowanie/odjazd są rozłączne; brak telemarku odejmuje 3,0 u każdego sędziego. |
| P10 — wiatr i pomiary | COMPLETE | Gładkie pole bazowe z podmuchami z osobnego seeda, jawny adapter znaku UI→fizyka, dynamiczne podłączenie do `vAir`, trzy ważone czujniki w danych skoczni i średnia z okna wybicie→pomiar. Pauza i śnieg nie zmieniają przebiegu. |
| P11 — kompletna scena | COMPLETE | Boczna kamera o stałym zoomie utrzymuje skoczka przy 38% szerokości; wspólna transformacja świata obsługuje stok, próg, markery i zawodnika. Jest HUD prędkości, belki, wiatru i fazy oraz zachowany widok techniczny pod D. |
| P12 — grywalny trening | COMPLETE | Menu→próba→wynik→retry działa klawiaturą; Backspace wraca do menu. Statystyki treningowe są tylko w pamięci sesji. E2E wykonał 10 kolejnych prób bez błędu stanu. |

## Istotne zmiany

- `src/sport/scoring.ts` — reguły `pkg003-rules-1`, arytmetyka w dziesiątych punktu,
  pomiar w połówkach metra, wspólny dziennik błędów i pięć profili sędziów.
- `src/sport/jumpResult.ts` — liczbowy `TrainingJumpResult` z wersjami, statusem,
  składowymi długość/styl, pomiarem wiatru i kodem komentarza; bez tekstów UI.
- `src/simulation/wind.ts` — pole `pkg003-wind-1`, adapter znaku, seedy prób i ważony pomiar.
- `src/simulation/jump.ts` — dynamiczny wiatr, agregat `compensationWind` i metryka błędu
  sylwetki; bazowe parametry fizyki pozostają `pkg002-tune-1`.
- `src/render/hillView.ts` — scena produkcyjna, kamera, proceduralny tymczasowy sprite,
  powierzchnia stoku, HUD i ekran wyniku. Dotychczasowy profil pozostaje trybem technicznym.
- `src/app/main.ts` — sesja treningowa, retry, statystyki, seedy prób, przełączniki D/S,
  semantyczny status i oddzielone sterowanie Enter/Backspace.

## Parametry TUNE / ADAPT

| Obszar | Wartość i status |
| --- | --- |
| Fizyka | Bez przestrojenia: `pkg002-tune-1`, 120 Hz. Wszystkie wcześniejsze parametry aerodynamiki i lądowania nadal TUNE. |
| Wiatr | `pkg003-wind-1`, suma wolnej bazy i dwóch sinusoidalnych podmuchów, ograniczenie ±3,2 m/s; pole autorskie ADAPT. Seed próby pochodzi z `0x5a17c0de` i numeru próby. |
| Pomiar | Czujniki 45/95/130 m z wagami 0,25/0,45/0,30; średnia ważona w każdym ticku lotu, następnie średnia czasowa. `weighted-flight-span-v1`, ADAPT — bez deklaracji zgodności z aparaturą FIS. |
| Noty | Jeden najwyższy błąd na kategorię lot/lądowanie/odjazd; profile różnią wrażliwość o 0,5 pkt dla kar TUNE. Kary 3,0 za brak telemarku i 7,0 za upadek przed fall line są nieprofilowane. |
| Kamera | 4,15 px/m, zawodnik na 38% szerokości; stały zoom, bez automatycznej zmiany przy wybiciu/kontakcie. |
| Grafika | Teren, tło i zawodnik są produkcyjnym układem P11, lecz nadal proceduralnymi placeholderami. Docelowy atlas, stadion, font i skala powstają w P15. |

## Weryfikacja

| Polecenie / sprawdzenie | Wynik | Dowód |
| --- | --- | --- |
| `npm run typecheck` | PASS | TypeScript 7.0.2 bez diagnostyk na finalnym kodzie. |
| `npm test` | PASS | 12 plików, **100/100** testów. |
| `npm run build` | PASS | Vite 8.3.0; główny JS 53,51 kB / 18,07 kB gzip. |
| `npm run test:e2e` | PASS | Chromium, **11/11** scenariuszy w 3,3 min; pełny skok i 10 kolejnych prób prawdziwymi zdarzeniami klawiatury. |
| Zrzuty 1:1 i 2× | PASS / OBSERVED | Scena oraz profil techniczny obejrzane w 960×540 i 1920×1080; raster pozostaje ostry, próg i zawodnik czytelne. |
| Nagranie pełnego skoku | PASS / OBSERVED | 16,76 s; obejrzano próbki od belki przez lot, kontakt i odjazd do wyniku. Kamera nie gubi zawodnika ani lądowania. |
| `validate-documentation.ps1 -CheckActiveHandoff` | PASS | 32 pliki Markdown, 116 linków lokalnych, 40 zadań, 33 pakiety; aktywny i archiwalny handoff PKG-004 mają identyczny SHA-256. |

### Dowody

- [tabele punktacji, timingu i wiatru](simulation-tables.md), w tym wszystkie granice
  Q-FIS-01, wektory Q-FIS-02/03/07 i krzywa Q-SIM-03 z wpływem na noty;
- scena produkcyjna [960×540](scene-production-960x540.png) i
  [1920×1080](scene-production-1920x1080.png), profil techniczny
  [960×540](scene-technical-960x540.png) i [1920×1080](scene-technical-1920x1080.png);
- ta sama faza lotu: [produkcja](training-flight-960x540.png) i
  [profil techniczny](training-flight-technical-960x540.png); przełączenie nastąpiło
  w mniej niż 12 ticków, pozycje K/HS i kreski pochodzą z tej samej `distanceMap`;
- [ekran wyniku](training-result-960x540.png), [upadek](training-fall-960x540.png),
  [wybicie](training-takeoff-960x540.png);
- [pełne nagranie WebM](browser-artifacts/z_capture_jump-zapis-pełnego-skoku-w-scenie-produkcyjnej/video.webm)
  i [arkusz klatek użyty do oględzin](video-review/contact-sheet.png).

### Q-FIS i Q-SIM

| ID | Wynik | Dowód |
| --- | --- | --- |
| Q-FIS-01/02/03/04/07 | PASS | `tests/scoring.test.ts`, `tests/hill.test.ts`, `simulation-tables.md`; K165–179 odrzucane także przez walidator danych skoczni. |
| Q-SIM-03 | PASS techniczny | 15-punktowa krzywa timingu zachowana i rozszerzona o pięć not, styl, sumę oraz kod komentarza. Ocena odczucia gracza pozostaje w PLAYABILITY. |
| Q-SIM-05 | PASS | Pauza nie wykonuje `step`, więc nie przesuwa czasu ani próbki wiatru; E2E potwierdza brak nadrabiania. |
| Q-SIM-07 | PASS | Dwa przebiegi z tym samym seedem/inputem przy śniegu on/off mają identyczną fizykę, pomiar wiatru i wynik. |
| Q-SIM-08 | PASS | Dotychczasowy skrajny test pozostaje zielony; dynamiczne pole jest ograniczone i nie wytwarza NaN. |

## Bramka A

| Wynik | Status | Uzasadnienie |
| --- | --- | --- |
| TECHNICAL | PASS | Deterministyczny skok i wiatr, współczesna długość/styl, terminalne stany, wynik liczony raz i 10 retry bez utraty stanu. |
| VISUAL | PASS / OBSERVED | Z dowodów wizualnych obserwuję biały stok, czytelny próg/sprite/HUD, ciągłe śledzenie do lądowania i zgodność markerów z profilem technicznym. |
| PLAYABILITY | **NOT RUN** | Brak zewnętrznego testera. Nie wykonano wymaganej obserwacji 3–5 osób bez podpowiedzi; automatyzacja i własne oględziny jej nie zastępują. |

Bramka A jest zamknięta technicznie i wizualnie; jakościowy odbiór graczy pozostaje jawnie
nieprzeprowadzony i wraca przy P38. Nie blokuje to PKG-004.

## Końcowe review

Jedno końcowe review objęło cały zakres P09–P12, testy, rendering i dowody. Znaleziono
i poprawiono cztery konkretne problemy:

1. Wiatr w HUD przed wybiciem pozostawał sztucznie równy zero. Próbka jest teraz aktualizowana
   w każdym ticku aktywnej symulacji, a agregat punktacyjny nadal obejmuje wyłącznie lot.
2. Techniczny panel wyniku nadal opisywał Enter jako powrót do menu. Tekst odpowiada teraz
   rzeczywistemu retry Enterem i Backspace do menu.
3. Wynik terminalny mógł zostać dwukrotnie ustawiony w regionie `aria-live` w tym samym ticku.
   Ogłoszenie końcowe ma jedną ścieżkę.
4. Pierwsza para zrzutów techniczny/produkcyjny była tylko na belce, gdy K/HS nie mieściły się
   w kadrze produkcyjnym. Dodano parę z tej samej fazy lotu z widocznymi markerami.

Finalna weryfikacja ujawniła ponadto wyścig samego testu 10 prób: auto-pauza mogła wystąpić
między utworzeniem próby a `ArrowRight`. Test wznawia i ponawia prawdziwy klawisz do wejścia
w rozbieg; nie używa debugowego ustawiania stanu. Pełny rerun zakończył się 11/11 PASS.

## Ograniczenia

- Skocznia `tech-k120-hs134` pozostaje fikcyjnym profilem ADAPT, nie kopią obiektu FIS.
- Prędkość kontaktu modelu nadal bywa około 130 km/h zamiast realnych około 95–105 km/h.
  Nie przestrojono jej, bo wcześniejszy wariant psuł wpływ belki i timingu.
- Punkty wiatru/belki, próg coach 95%, pełne zaokrąglenia i kolejność ograniczenia wyniku
  są celowo poza PKG-003 i należą do P13. Q03 pozostaje UNRESOLVED.
- Obecne markery produkcyjne są prostą implementacją P11; pełny generator sportowych linii,
  cel prowadzenia i rozstrzygnięcie wszystkich zakresów należą do P14.
- Sprite, krajobraz i font są placeholderami proceduralnymi. P15 zatwierdza docelowy wzorzec
  pixel artu oraz mierzy wydajność; nie deklarujemy jeszcze budżetu p95/p99.
- Automatyczne E2E wykonano w Chromium. Pełna matryca przeglądarek/DPR pozostaje w P34.

Następny prompt: [PKG-004 — P13–P15](../../handoffs/PKG-004.md).
