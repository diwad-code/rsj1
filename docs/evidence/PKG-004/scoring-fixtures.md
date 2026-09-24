# PKG-004 — fixtures punktacji, markerów i kalibracji

Plik generowany przez `tests/pkg004Evidence.test.ts` podczas `npm test`.
Arytmetyka: integer tenths; połowy są zaokrąglane od zera. Znak użytkowy/FIS: `+` = pod narty.

## 1. Oficjalne pełne wiersze FIS / Swiss Timing

| Fixture | Obiekt | Dystans | Długość | Styl | Wiatr [m/s] | Wiatr pkt | Belka pkt | Suma | Źródło |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Manuel Fettner — Zakopane 10.01.2026 — kwalifikacje | K125/HS140 | 138.0 | 83.4 | 54.0 | +1.22 | -13.2 | 9.5 | 133.7 | [PDF FIS](https://medias3.fis-ski.com/pdf/2026/JP/3112/2026JP3112RLQ.pdf) |
| Maciej Kot — Zakopane 10.01.2026 — kwalifikacje | K125/HS140 | 124.5 | 59.1 | 52.5 | +0.39 | -4.2 | 4.8 | 112.2 | [PDF FIS](https://medias3.fis-ski.com/pdf/2026/JP/3112/2026JP3112RLQ.pdf) |
| Jules Chervet — Zakopane 10.01.2026 — kwalifikacje | K125/HS140 | 132.0 | 72.6 | 50.5 | +1.52 | -16.4 | 4.8 | 111.5 | [PDF FIS](https://medias3.fis-ski.com/pdf/2026/JP/3112/2026JP3112RLQ.pdf) |
| Domen Prevc — Oberstdorf 28.12.2025 — kwalifikacje | K120/HS137 | 139.5 | 95.1 | 55.5 | -0.49 | 7.9 | -7.6 | 150.9 | [PDF FIS](https://medias1.fis-ski.com/pdf/2026/JP/3103/2026JP3103RLQ.pdf) |
| Philipp Raimund — Oberstdorf 28.12.2025 — kwalifikacje | K120/HS137 | 132.5 | 82.5 | 54.0 | -0.70 | 11.3 | -7.6 | 140.2 | [PDF FIS](https://medias1.fis-ski.com/pdf/2026/JP/3103/2026JP3103RLQ.pdf) |
| Domen Prevc — Kulm 28.02.2026 — konkurs, seria 1 | K200/HS235 | 213.5 | 136.2 | 53.5 | -0.47 | 10.2 | 11.2 | 211.1 | [PDF FIS](https://medias4.fis-ski.com/pdf/2026/JP/3156/2026JP3156RL.pdf) |

## 2. Q-FIS-08 — próg coach 95% HS

| HS | surowe 95% | próg źródłowy / obcięty do 0,5 m |
| ---: | ---: | ---: |
| 137 | 130,15 | 130.0 |
| 140 | 133,00 | 133.0 |
| 142 | 134,90 | 134.5 |
| 235 | 223,25 | 223.0 |

Źródła: [ICR June 2026 §422.1](https://assets.fis-ski.com/f/252177/x/c67426c343/icr-ski-jumping-2024_e_clean.pdf), oficjalne nagłówki wyników F10/F11/Kulm powyżej.

## 3. Q-FIS-17 — kolejność ograniczenia

`collective = max(0, długość + styl)`, następnie rekompensaty, następnie `total = max(0, collective + wiatr + jury + coach)`.
Dla długość −90,0 i styl +30,0: rekompensata +5,0 daje 5,0; rekompensata −5,0 daje 0,0.

## 4. Kalibracja fikcyjnej K120 — ADAPT / simulation-calibrated

Fizyka `pkg008-tune-3`; współczynniki gry: wiatr pod narty 12,9 pkt/(m/s), wiatr w plecy 8,9 pkt/(m/s), belka 3,5 pkt/m rozbiegu. Nie są danymi FIS.

| Próba | Wejście | Odległość [m] |
| --- | ---: | ---: |
| stały wiatr | -1.0 m/s | 120.793 |
| stały wiatr | +0.0 m/s | 125.013 |
| stały wiatr | +1.0 m/s | 128.236 |
| belka | 1 / 87.20 m rozbiegu | 115.541 |
| belka | 4 / 89.15 m rozbiegu | 119.758 |
| belka | 8 / 91.75 m rozbiegu | 125.013 |
| belka | 12 / 94.35 m rozbiegu | 129.872 |

## 5. P14 — generator markerów i solver

Linie 5 m: 95, 100, 105, 110, 115, 120, 125, 130.
Pasy boczne: blue 106–120 m; red 120–134 m; green 191–205 m.
K 120 m; HS 134 m; fall line 205 m; kontrolny rekord 137.0 m.
Dla lidera 140,0 pkt, stylu 55,5 i warunków neutralnych solver zwraca ~134.0 m; remis jest niewystarczający.

Agregat czujników 45/95/130 m z wagami 0,25/0,45/0,30 pozostaje `ADAPT`; HUD nie jest wejściem punktacji.

