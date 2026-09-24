# PKG-002 — tabele symulacji

Plik generowany przez `tests/evidenceTables.test.ts` podczas `npm test`.
Wszystkie wartości pochodzą z tego samego przebiegu, który sprawdzają asercje testu.

Skocznia: **SKOCZNIA TECHNICZNA K120** `tech-k120-hs134` v1.0.0 — K120 / HS134, P105, U152, fall line 205 m. ADAPT, obiekt fikcyjny.

Fizyka: `pkg002-tune-1`, dt = 1/120 s, semi-implicit Euler. Wszystkie parametry TUNE.

## 1. Profil i mapa metrażu

| Punkt | metry | x [m] | y [m] | nachylenie [°] | odczyt zwrotny z mapy [m] |
| --- | ---: | ---: | ---: | ---: | ---: |
| T | 0 | 0.00 | -2.50 | 24.01 | 0.000 |
| P | 105 | 89.78 | -56.73 | 34.00 | 105.000 |
| K | 120 | 102.29 | -65.00 | 33.00 | 120.000 |
| HS | 134 | 114.19 | -72.37 | 30.48 | 134.000 |
| U | 152 | 130.70 | -79.39 | 14.03 | 152.000 |
| fall line | 205 | 183.42 | -82.83 | -1.75 | 205.000 |

## 2. Wpływ belki na rozpędzanie

| Belka | rozbieg [m] | v na progu [m/s] | v [km/h] | długość przy idealnym skoku [m] |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 91.75 | 24.49 | 88.2 | 124.4 |
| 4 | 94.00 | 24.79 | 89.2 | 128.2 |
| 8 | 97.00 | 25.17 | 90.6 | 133.0 |
| 12 | 100.00 | 25.55 | 92.0 | 137.4 |

## 3. Długość względem przesunięcia timingu wybicia (belka 8, idealna korekta)

| Przesunięcie [s] | popęd [%] | v wyprostu [m/s] | pitch na progu [°] | długość [m] | wynik |
| ---: | ---: | ---: | ---: | ---: | --- |
| -0.233 | 100 | 0.77 | 37.8 | 104.6 | landed |
| -0.200 | 100 | 0.95 | 35.4 | 109.0 | landed |
| -0.167 | 100 | 1.17 | 33.1 | 113.3 | landed |
| -0.133 | 100 | 1.45 | 30.8 | 117.4 | landed |
| -0.100 | 100 | 1.78 | 28.4 | 121.6 | landed |
| -0.067 | 100 | 2.19 | 26.1 | 125.9 | landed |
| -0.033 | 100 | 2.70 | 23.8 | 130.6 | landed |
| +0.000 | 99 | 2.97 | 21.6 | 133.0 | landed |
| +0.033 | 88 | 2.64 | 20.1 | 129.5 | landed |
| +0.067 | 68 | 2.03 | 18.6 | 122.4 | landed |
| +0.100 | 43 | 1.29 | 17.1 | 112.9 | landed |
| +0.133 | 20 | 0.61 | 15.6 | 103.5 | landed |
| +0.167 | 5 | 0.14 | 14.1 | 96.9 | landed |
| +0.200 | 0 | 0.00 | 22.0 | 94.6 | landed |
| +0.233 | 0 | 0.00 | 22.0 | 94.6 | landed |
| brak ↑ (lot pasywny) | 0 | 0.00 | 22.0 | 94.6 | landed |

## 4. Ślady lotu (belka 8, idealny timing)

| Korekta | długość [m] | czas lotu [s] | v kontaktu [km/h] | v⊥ kontaktu [m/s] | błąd kąta [°] | stabilność | wynik |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| idealna | 133.0 | 4.71 | 130 | 9.95 | 0.0 | 0.50 | landed / FinishLine |
| brak korekty | 110.1 | 4.23 | 110 | 9.59 | 27.3 | 0.10 | fall / FallSettled |
| nadmierna (→ trzymane) | 116.9 | 4.03 | 135 | 9.24 | 0.0 | 0.54 | landed / FinishLine |
| cofanie (← trzymane) | 86.5 | 3.56 | 100 | 10.27 | 52.9 | 0.00 | fall / FallSettled |

## 5. Lądowania i stany terminalne

| Próba | przygotowanie | długość [m] | v⊥ [m/s] | gotowość | stabilność | stan terminalny |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| długa, belka 12 | telemark | 137.4 | 11.50 | 1.00 | 0.42 | FinishLine (fall line) |
| długa, belka 12 | dwie nogi | 137.4 | 11.50 | 1.00 | 0.54 | FinishLine (fall line) |
| krótka, belka 1, późne ↑ | telemark | 88.0 | 7.12 | 1.00 | 0.64 | FinishLine (fall line) |
| krótka, belka 1, późne ↑ | dwie nogi | 88.0 | 7.12 | 1.00 | 0.71 | FinishLine (fall line) |
| bez przygotowania | brak | 133.5 | 9.29 | 0.00 | 0.00 | FallSettled (stop 193.2 m) |
| spóźnione przygotowanie | telemark | 133.5 | 9.30 | 0.42 | 0.15 | FallSettled (stop 193.3 m) |
| krótka próba bez przygotowania | brak | 74.1 | 7.13 | 0.00 | 0.00 | FallSettled (stop 136.7 m) |

## 6. Dziennik jednego pełnego skoku (belka 8, idealny timing, telemark)

| Tick | czas [s] | zdarzenie | szczegóły |
| ---: | ---: | --- | --- |
| 0 | 0.000 | gateOpen | belka 8, rozbieg 97.00 m |
| 732 | 6.100 | takeoffImpulseStart | tick 732, v 25.21 m/s |
| 755 | 6.292 | takeoffEdge | v 25.88 m/s, wyprost 2.97 m/s, popęd 99%, pitch 21.6°, timing -0.008 s |
| 1245 | 10.375 | landingPrep | telemark, wysokość 6.0 m |
| 1321 | 11.008 | measured | 133.00 m |
| 1321 | 11.008 | contact | 133.0 m, v 36.1 m/s, v⊥ 9.95 m/s, kąt 0.0°, gotowość 100%, stabilność 0.50, styl telemark |
| 1620 | 13.500 | finishLine | odjazd zakończony na 205.0 m |

