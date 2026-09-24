# PKG-003 — tabele punktacji i wiatru

Plik generowany przez `tests/pkg003Evidence.test.ts` podczas `npm test`.
Reguły: `pkg003-rules-1`; fizyka bazowa: `pkg002-tune-1`.

## 1. Q-FIS-01 — wszystkie granice tabeli pkt/m

| Zakres K | pkt/m |
| --- | ---: |
| K20–24 | 4.8 |
| K25–29 | 4.4 |
| K30–34 | 4.0 |
| K35–39 | 3.6 |
| K40–49 | 3.2 |
| K50–59 | 2.8 |
| K60–69 | 2.4 |
| K70–79 | 2.2 |
| K80–99 | 2.0 |
| K100–134 | 1.8 |
| K135–164 | 1.6 |
| K≥180 | 1.2 |
| K165–179 | ODRZUCONE |

## 2. Q-FIS-02/03/07 — wektory kontrolne

| Przypadek | Wynik |
| --- | ---: |
| K120 / 130,0 m | 78.0 pkt |
| K90 / 95,0 m | 70.0 pkt |
| K200 / 210,0 m | 132.0 pkt |
| noty 18,0;18,5;19,0;18,5;18,0 | 55.0 pkt |
| kontakt 132,49 m | 132.0 m |
| kontakt 132,50 m | 132.5 m |

## 3. Q-SIM-03 — timing wybicia i wpływ na noty

| Przesunięcie wejścia [s] | długość [m] | noty | styl [pkt] | suma [pkt] | komentarz |
| ---: | ---: | --- | ---: | ---: | --- |
| -0.233 | 104.5 | 17.0;17.5;17.5;18.0;17.5 | 52.5 | 84.6 | takeoff-too-early |
| -0.200 | 109.0 | 17.5;18.0;18.0;18.5;18.0 | 54.0 | 94.2 | takeoff-too-early |
| -0.167 | 113.0 | 17.5;18.0;18.0;18.5;18.0 | 54.0 | 101.4 | takeoff-too-early |
| -0.133 | 117.0 | 18.0;18.5;18.5;19.0;18.5 | 55.5 | 110.1 | takeoff-too-early |
| -0.100 | 121.5 | 18.5;19.0;19.0;19.5;19.0 | 57.0 | 119.7 | takeoff-too-early |
| -0.067 | 125.5 | 19.0;19.5;19.5;20.0;19.5 | 58.5 | 128.4 | takeoff-too-early |
| -0.033 | 130.5 | 20.0;20.0;20.0;20.0;20.0 | 60.0 | 138.9 | clean |
| +0.000 | 133.0 | 20.0;20.0;20.0;20.0;20.0 | 60.0 | 143.4 | clean |
| +0.033 | 129.0 | 19.0;19.5;19.5;20.0;19.5 | 58.5 | 134.7 | takeoff-too-late |
| +0.067 | 122.0 | 18.5;19.0;19.0;19.5;19.0 | 57.0 | 120.6 | takeoff-too-late |
| +0.100 | 112.5 | 18.5;19.0;19.0;19.5;19.0 | 57.0 | 103.5 | takeoff-too-late |
| +0.133 | 103.5 | 18.0;18.5;18.5;19.0;18.5 | 55.5 | 85.8 | takeoff-too-late |
| +0.167 | 96.5 | 17.5;18.0;18.0;18.5;18.0 | 54.0 | 71.7 | takeoff-too-late |
| +0.200 | 94.5 | 17.5;18.0;18.0;18.5;18.0 | 54.0 | 68.1 | takeoff-too-late |
| +0.233 | 94.5 | 17.5;18.0;18.0;18.5;18.0 | 54.0 | 68.1 | takeoff-too-late |

## 4. P10 — próbki pola wiatru

Znak użytkowy: dodatni = pod narty; adapter fizyki zapisuje wtedy ujemne `windVelocityX`.

| Seed | czas [s] | metraż [m] | wiatr użytkowy [m/s] |
| ---: | ---: | ---: | ---: |
| 42 | 0.0 | 45 | -1.413 |
| 42 | 2.0 | 95 | -0.107 |
| 42 | 4.0 | 130 | -1.166 |
| 2026 | 0.0 | 45 | 0.571 |
| 2026 | 2.0 | 95 | 0.041 |
| 2026 | 4.0 | 130 | 0.640 |

Pełna próba seed 42: średnia ważona -0.118 m/s z 564 próbek; HUD końcowy 0.668 m/s.

Składniki wiatru i belki nie są dodawane do wyniku PKG-003.
