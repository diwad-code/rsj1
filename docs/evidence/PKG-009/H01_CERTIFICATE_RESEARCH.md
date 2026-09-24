# H01 — Lysgårdsbakken normalna, Lillehammer

Status karty: **P21-H01-D BLOCKED; G/A/V PROVISIONAL/UNACCEPTED; H01 wyłączona z zawartości grywalnej. Jedyny końcowy przegląd Oracle: CHANGES REQUIRED (wykonany); H01 VISUAL user NOT RUN.** Obiekt: Lysgårdsbakken, Lillehammer,
Norwegia, normalna **K90/HS98**. Wersja konstrukcji: certyfikat FIS
**304/NOR 44, 3. prolongation**, wystawiony 22.11.2022, ważny do 30.04.2027;
inspekcja 22.08.2022. Ostatnia wskazana modernizacja normalnej skoczni: 2015.

## Źródła

| ID | Źródło | Zakres |
|---|---|---|
| H01-CERT | [Certyfikat FIS HS98 z 22.11.2022](fis/lillehammer-hs98-certificate-2022.pdf) | profil, wymiary, 25 belek, ważność |
| H01-NORM | [FIS Construction Norm 2018, §§2, 4 i 6](https://assets.fis-ski.com/f/252177/5ba64e29f2/construction-norm-2018-2.pdf) | definicje osi i pól certyfikatu; reguły profilu, nie pomiar H01 |
| H01-FIS-2022-W | [Women WC 03.12.2022](fis/lillehammer-2022-12-03-women-wc.pdf) | 40 skoków, belka 10, wiatr, brak upadków |
| H01-FIS-2023-W | [Women WC 02.12.2023](fis/lillehammer-2023-12-02-women-wc.pdf) | 69 skoków, belki 7–9, wiatr, brak upadków |
| H01-FIS-2023-M | [Men WC 02.12.2023](fis/lillehammer-2023-12-02-men-wc.pdf) | 80 skoków, belki 5–7, wiatr, brak upadków |
| H01-FIS-2026-WJ | [Women JWC 04.03.2026](fis/lillehammer-2026-03-04-women-jwc.pdf) | 80 skoków, belki 15–16, wiatr, jeden upadek |
| H01-FIS-2026-MJ | [Men JWC 05.03.2026 — wyniki FIS](https://www.fis-ski.com/DB/v2/download/competition-attachment/c3622daf-64da-11f1-b635-1866da7ef77e.pdf) | kontrola raportowanej długości rozbiegu; poza ekstraktem 269 skoków |
| H01-VENUE | [Olympiaparken/Hafjell — opis obiektu](https://www.hafjellresort.no/en/lysgardsbakkene-ski-jumping-facility) | dwa obiekty HS140/HS98, rok budowy, schody, kolej krzesełkowa |
| H01-DB | [Skisprungschanzen — Lysgård](https://www.skisprungschanzen.com/EN/Ski+Jumps/NOR-Norway/34-Innlandet/Lillehammer/0587-Lysg%C3%A5rd/) | indeks certyfikatu, modernizacja 2015, rekordy i parametry |

Lokalne PDF są niezmienionymi kopiami pobranymi z oficjalnych bramek FIS albo
z indeksu certyfikatów. Ekstrakcję można odtworzyć poleceniem
`node docs/evidence/PKG-009/fis/extract-calibration.mjs`; wynik jest w
[`calibration.json`](calibration.json) i
[`calibration.csv`](calibration.csv).

## Parametry źródłowe

| Parametr | Wartość | Status / źródło |
|---|---:|---|
| K / HS / 95% HS | 90 / 98 / 93 m | **FACT**, wszystkie PDF FIS |
| punktacja odległości | 2,0 pkt/m | **FACT**, PDF wynikowe |
| gate factor | 7,00 pkt na metr rozbiegu | **FACT**, PDF wynikowe |
| wiatr pod narty / w plecy | 8,00 / 12,00 pkt/(m/s) | **FACT**, PDF wynikowe |
| certyfikat | 304/NOR 44, ważny do 30.04.2027 | **FACT**, H01-CERT |
| HS / h:n / V0 | 98 m / 0,551 / 24,38 m/s | **FACT**, H01-CERT |
| e1 / e2 / es / t | 87,98 / 68,78 / 19,20 / 6,10 m | **FACT**, H01-CERT: e1/e2 od najwyższej/najniższej belki do T, es=e1−e2; t jest częścią e1 i e2, nie dodatkiem |
| γ / α / r1 | 35,00° / 11,20° / 90,00 m | **FACT**, H01-CERT |
| h / n / s | 43,22 / 78,43 / 2,76 m | **FACT**, H01-CERT: pion/poziom od T do K oraz wysokość progu |
| P / K / L | 82,67 / 90,00 / 98,00 m | **FACT**, H01-CERT |
| βP / βK / βL | 36,50° / 34,70° / 32,80° | **FACT**, H01-CERT |
| rL / r2L / r2 | 210 / 131 / 125 m | **FACT**, H01-CERT i H01-NORM: odpowiednio łuk P–L, krzywizna L→U przy L i przy U; prototyp nie zachowuje tych wartości |
| zU | 66,60 m | **FACT**, H01-CERT; głębokość U, nie odległość wzdłuż zeskoku |
| q / d | 32,50 / 49,50 m | **FACT**, H01-CERT i H01-NORM: poprzeczne/osiowe odsunięcie wieży sędziowskiej, nie geometria wybiegu |
| a | 100 m | **FACT**, H01-CERT i H01-NORM: długość wybiegu za U |
| szerokość b1 / bK / bU | 3,02 / 20,10 / 20,50 m | **FACT**, H01-CERT |
| belki | 25 co 0,79 m (44/64 cm) | **FACT**, H01-CERT |
| rekord zimowy mężczyzn | 107,5 m, Karl Geiger, 06.12.2013 | **FACT**, H01-FIS-2023-M |
| typ lądowania telemark/równoległe | brak w dokumentach | **UNRESOLVED** |

## Profil i mapa gry

H01-kod jest zachowany jako **niegrywalny prototyp**, nie certyfikowany profil.
`distanceMap` mierzy metraż jego własnej krzywej. Poniższe porównanie wykonano
bez zmiany kodu: `ProfileCurve` z krokiem 0,05 m na danych
`src/simulation/hills/lillehammerNormal.ts`, początek zeskoku `(0; −s)`;
osie FIS: T=(0;0), x wzdłuż skoku, głębokość poniżej T dodatnia.

| Kontrola | Certyfikat / definicja FIS | Prototyp | Wniosek |
|---|---:|---:|---|
| K: x / głębokość | n=78,43 / h=43,22 m | 78,667 / 42,645 m | Obie współrzędne są rozbieżne; sama etykieta K90 nie waliduje profilu. |
| U: głębokość | zU=66,60 m | 60,651 m przy modelowym metrażu 139 m | Brakuje 5,949 m głębokości; metraż U z certyfikatu **UNRESOLVED**. |
| Wybieg za U | a=100 m | 32,50 m łuku (32,49 m w poziomie) | Dawne 171,5 m końca wynikało z błędnego podstawienia q za a. |
| Rozbieg | e1=87,98 m od najwyższego startu do T, w tym t=6,10 m | 94,08 m całego modelowego profilu | Komentarz kodu dolicza t drugi raz; położenie startu modelu wymaga ponownego wyprowadzenia. |

**Promienie:** FIS przypisuje `rL=210 m` do P–L, `r2L=131 m` do
początku L→U, a `r2=125 m` do końca przy U. Liniowa interpolacja nachylenia
w prototypie daje efektywne promienie P→K ≈233,3 m, K→L ≈241,2 m,
początek L→U (98–105 m) ≈222,8 m i koniec (132–139 m) ≈57,3 m.
To obliczenia **PROVISIONAL** z `R=Δs/Δθ` (kąt w radianach), nie pomiary
skoczni. Certyfikat podaje promienie graniczne i szkic, ale nie pełną tabelę
współrzędnych/krzywizn ani położenie fall line. Nie wyznaczamy zastępczego
U, fall line ani końca wybiegu z przybliżenia. Dawne U=139 m, fall line=154 m
i koniec=171,5 m pozostają wyłącznie punktami wadliwego prototypu.
- **ADAPT:** sensory wiatru 35/70/95 m z wagami 0,30/0,40/0,30; FIS PDF podaje
  wynikową wartość tangential wind, nie rozmieszczenie aparatury.
- **ADAPT:** numeracja gry zachowuje 25 fizycznych belek co 0,79 m. Belka 10
  jest zakotwiczona w długości 76,32 m z H01-FIS-2022-W; dokument 2026 używa
  innego mapowania numeru startowego (92,08 m dla 16), więc nie mieszamy tych
  dwóch numeracji w jednej tabeli geometrii.

## Kalibracja empiryczna D18

Zachowany ekstrakt obejmuje **269 skoków** z czterech oficjalnych zawodów
opisanych jako Lillehammer K90/HS98. Łącznie: min 54,5; mediana 88,5;
q75 92,0; q90 95,1; q95 97,0; max 104,0 m. To **opis połączonych raportów**,
nie próba dowodząca identycznej konfiguracji rozbiegu. Wiatr w wierszach:
−2,01…+2,39 m/s; raportowane belki 5–10 i 15–16.

| Zawody | N | min | mediana | q75 | q90 | q95 | max | upadki |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Women WC 03.12.2022 | 40 | 76,5 | 87,75 | 91,25 | 95,05 | 96,55 | 99,0 | 0 |
| Women WC 02.12.2023 | 69 | 72,5 | 87,0 | 89,5 | 91,6 | 92,3 | 96,0 | 0 |
| Men WC 02.12.2023 | 80 | 82,0 | 92,25 | 94,5 | 97,05 | 98,53 | 104,0 | 0 |
| Women JWC 04.03.2026 | 80 | 54,5 | 86,0 | 90,63 | 93,5 | 95,03 | 99,0 | 1 |

Rozbicie rund jest zapisane w `calibration.json`. W pasmach: `<80 m` 23/1
upadek; `80–89,5` 135/0; `90–97,5` 101/0; `98–103` 9/0; `>103` 1/0.
Jedyny jawny upadek to 66,0 m (gwiazdka FIS), a więc próbka **nie pokazuje
wzrostu upadków z odległością**. Rozkład i statusy z tych PDF pozostają
obserwacjami n=269; nie naprawiają błędu geometrii i nie wystarczają do
wyprowadzenia krzywej ryzyka zależnej od odległości. Nie wolno z niej wymyślać
losowej krzywej.

**Porównywalność rozbiegu:** trzy zawody 2022–2023 tworzą ostrożniejszą
podpróbę **n=189** (min 72,5; mediana 89,5; q75 92,5; q90 96,0; q95 97,3;
max 104,0 m; 0 upadków; tylko 8 skoków ≥HS98, 1 skok >103 m; belki 5–10,
wiatr −2,01…+0,62 m/s). Raport 2023 podaje dla belki 9 długość **75,52 m**.
Raport 2026 women JWC podaje dla belki 16 **92,08 m**, więcej niż
certyfikowane `e1=87,98 m`; raport 2026 men JWC podaje belkę 9
**86,50 m**, czyli o **10,98 m** więcej niż w 2023 przy tym samym numerze.
Numery belki i raportowane długości nie dają się połączyć jedną mapą 2022–2026.
Możliwa zmiana pomiaru lub konfiguracji jest **UNRESOLVED**; nie zakładamy,
że konstrukcja się zmieniła, ale nie używamy 2026 jako dowodu kalibracji
certyfikowanego rozbiegu 2022. Dane 2026 (n=80, jeden upadek na 66 m)
pozostają osobną obserwacją. [FIS women 2023](fis/lillehammer-2023-12-02-women-wc.pdf),
[FIS women 2026](fis/lillehammer-2026-03-04-women-jwc.pdf),
[FIS men 2026](https://www.fis-ski.com/DB/v2/download/competition-attachment/c3622daf-64da-11f1-b635-1866da7ef77e.pdf).

### Decyzje kalibracyjne

- rozkład i kwantyle opisują wyłącznie obserwacje, rozdzielone wyżej na
  podpróbę 2022–2023 oraz 2026; wcześniejszy envelope AI/gracza jest nieprzyjęty.
- q75 próby wynosi **92,0 m (OBSERVED)**, ale użycie tej statystyki jako
  bezpiecznego celu AUTO jest **UNRESOLVED/withdrawn**. Bieżący prototypowy
  estimator daje na belce 1 około **94,53 m przy neutralnym wietrze** oraz
  około **98,5 m przy +2 m/s**, czyli powyżej HS98 w drugim przypadku; nie
  wykazano bezpiecznej belki dla zakresu warunków. H01 AUTO jest **UNRESOLVED**.
- kompensaty: **FACT official-reference** 8,00/12,00 i 7,00, bez kopiowania
  z technicznej K120;
- progi **109,0 m telemark / 111,0 m równolegle są WITHDRAWN / UNRESOLVED**:
  wyprowadzono je z rekordu 107,5 m, nie z obserwowanej krzywej nieustania.
  Nie są przyjętymi granicami bezpieczeństwa ani faktem FIS; nie wpisywać
  zastępczych progów bez dowodu;
- AI używa globalnych profili, nie profilu błędów skalibrowanego dla H01.
  Połączona częstość opisowa 1/269=0,37% obejmuje konfigurację 2026 o
  niewyjaśnionej mapie rozbiegu i pojedynczy krótki upadek; nie jest
  estymatą ryzyka H01 według odległości ani rozkładu AI. AI calibration: **BLOCKED**;
  nie ma ukrytej kości dla gracza;
- typ lądowania jest **UNRESOLVED**; pięć not nie stanowi etykiety telemarku.

## Ograniczenia

Połączony ekstrakt miesza kobiety, mężczyzn i juniorki; zawody raportujemy
oddzielnie, a rozbieżność 2026 wyklucza wspólną mapę długości rozbiegu.
Gate/wind są kontekstem, nie dowodem przyczynowym. Nie mamy danych o każdej
próbie treningowej ani jawnej etykiety podpórki/telemarku. Obecne U,
fall line, koniec wybiegu i przejścia krzywych są prototypowe i niewalidowane;
rozmieszczenie sensorów i pośrednie próbki krzywych pozostają ADAPT.

## Assety i odbiór

Nie kopiuje się fotografii ani PDF. Landmarki i scena są zachowane jako własny
pixel-artowy prototyp: smukła wieża startowa, zewnętrzna klatka schodowa, kolej
krzesełkowa, oświetlenie i panorama Mjøsy. [Manifest prototypu i zachowane hashe](ART_MANIFEST.md).
Historyczne zrzuty prototypu 960×540: [widok techniczny](browser-artifacts/h01-technical.png),
[wybór skoczni](browser-artifacts/h01-selection.png),
[scena](browser-artifacts/h01-scene.png),
[wynik fixture](browser-artifacts/h01-result-fixture.png) i
[replay](browser-artifacts/h01-replay.png); nagranie:
[H01 recorded replay](browser-artifacts/h01-recorded-replay.webm).
Te zrzuty/nagranie dokumentują historyczny prototyp, nie bieżącą zawartość
grywalną ani odbiór. H01 pozostaje poza katalogiem grywalnym; **VISUAL user
NOT RUN**, zewnętrzny jakościowy playtest **NOT RUN**. Bazowa bramka V oprawy
zaakceptowana 22.09.2026 jest odrębnym werdyktem i nie zatwierdza H01.
