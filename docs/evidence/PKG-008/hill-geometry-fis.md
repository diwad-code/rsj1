# Geometria skoczni wobec normy FIS — research i pomiary (P42 runda 6)

Dokument zbiera to, co zostało sprawdzone w źródłach zewnętrznych, i zestawia
z tym, co gra faktycznie modeluje. Powstał na polecenie użytkownika z
18.09.2026: *„skorzystać do porównania wyglądu i skali prawdziwe obiekty,
wymiary itd — zrób research zanim zaczniesz"*.

## 1. Źródła

| Źródło | Co z niego wzięto |
| --- | --- |
| **FIS „Jumping Hills Construction Norm 2018"** (H.-H. Gasser), <https://assets.fis-ski.com/f/252177/5ba64e29f2/construction-norm-2018-2.pdf> | Definicje symboli (γ, α, t, s, βP, β0, βL, rL, h/n, n, w, HS, U, a), wzory i limity: α = w/30 + 7,4 (zakres ±0,5); βP = γ + 0,5α − 2,5 przy maksimum 37°; β0 = βP/6; h/n ∈ ⟨w/800 + 0,400 ; w/1000 + 0,480⟩; HS = w/0,9; tarcie suche 1° dla toru lodowego; przeciążenie ≤ 0,70 g w E2 i ≤ 1,8 g między L i U; a ≥ 45 m; Uz ≥ −88 m; różnica wysokości dwóch belek ≤ 0,40 m |
| **FIS ICR, art. 417** (`docs/research/reference-images/fis-icr-page-63.png`) | Tory najazdu: rozstaw osi 30–33 cm, szerokość toru 13,0–13,5 cm, głębokość ≥ 3 cm; śnieg na zeskoku min. 30 cm (35 cm na igelicie) |
| **Certyfikat skoczni Wisła Malinka HS134 / K120** (przebudowa 2023), <https://www.skisprungschanzen.com/PL/Skocznie/POL-Polska/S-Śląskie/Wisła/0582-Malinka/> | Realne wartości dla dokładnie naszej klasy skoczni: e 94,35 m, γ 35°, t 6,71 m, α 11°, s 3,03 m, β przy K 33,5°, h/n 0,566, prędkość 92,5 km/h, rekord 144,5 m |
| **FIS ICR, art. 432/433** (`fis-icr-page-70.png`) | 1,8 pkt/m dla K 100–134 (wykorzystane do przeliczenia współczynników kompensacji na dziesiąte części punktu) |

## 2. Stan przed rundą 6 wobec normy

Pomiar skryptem na danych z `TECHNICAL_K120` sprzed zmiany:

| Parametr | Gra (przed) | Norma / Wisła HS134 | Ocena |
| --- | ---: | ---: | --- |
| γ — kąt najazdu | 35,0° | ≤ 35° zalecane, ≥ 30° dla w ≥ 90 | zgodne |
| e — długość rozbiegu | 100,00 m | 94,35 m | dopuszczalne |
| α — kąt progu | 10,5° | 11,0° (zakres 10,9–11,9) | **poza zakresem** |
| s — wysokość progu | 2,50 m | 3,03 m | zaniżone |
| odstęp belek | 0,75 m → 0,43 m przewyższenia | ≤ 0,40 m | **poza limitem** |
| n — odległość pozioma K | 102,29 m | ~104 m | zgodne |
| h — przewyższenie K | 65,00 m | ~59 m | zawyżone |
| **h/n** | **0,636** | **0,550–0,600** (Wisła 0,566) | **poza normą** |
| β0 — stok pod progiem | 24,0° | ~6,2° | **niezgodne** |
| β przy K | 33,0° | 33,5° | zgodne |

Oddzielnie zmierzona rozbieżność skali renderu: kamera rysowała 2,075 px/m,
a sprite zawodnika był rysowany w proporcjach 11,6 px/m (narta 29 px). Zawodnik
„mierzył" zatem 14,0 m nart i 10,6 m wzrostu — **błąd 5,6×**.

## 3. Co wdrożono

**Rozbieg, próg i belki — w całości na geometrię FIS.**

```
prosta γ = 35°           0 … 45,74 m
łuk przejściowy r1 = 100 m   45,74 … 87,64 m   (obraca 35° → 11°, 41,90 m łuku)
próg t = 6,71 m przy α = 11° 87,64 … 94,35 m
wysokość progu s = 3,03 m
12 belek co 0,65 m (0,373 m przewyższenia — poniżej limitu 0,40 m)
```

Sprawdzenie przeciążenia w E2: przy 26 m/s i r1 = 100 m wychodzi
v²/(r·g) = 676/981 = **0,69 g**, czyli poniżej normowego limitu 0,70 g.

**Skala renderu — 11,6 px/m.** Narta 29 px = 2,50 m, sylwetka 21 px = 1,81 m.
W kadrze mieści się 41,4 × 23,3 m świata. Odniesienie: w Ski Jump
International 3 narta zajmuje 44–48 px przy 640 px szerokości ekranu, czyli
tę samą proporcję do szerokości kadru.

## 4. Stan po rundzie 6 — czego wtedy NIE wdrożono i dlaczego

**Profil zeskoku został na poprzednim kształcie.** Wyprowadzony profil zgodny
z normą wygląda tak (pełny skrypt wyprowadzenia opisany niżej):

```
garb: parabola sześcienna od β0 = 6,17° do 37°, pozioma długość 50,89 m
prosta 37° do punktu P (105 m)
pole lądowania: łuk kołowy rL = 245,6 m — 37° w P → 33,5° w K → 30,2° w L
przejście L→U: promień rośnie, nachylenie schodzi do 0° w U (170,5 m)
wynik: n = 103,67 m, h = 58,68 m, h/n = 0,566, Uz = −77,65 m
```

Wdrożenie tego profilu daje wynik **dwumodalny**. Pomiar (belka 8 / belka 12,
prowadzenie idealne, bez wiatru), przy strojeniu dobranym tak, by prędkość na
progu wynosiła 92,7 km/h:

| nośność / opór | belka 1 | belka 8 | belka 12 |
| --- | ---: | ---: | ---: |
| 0,80 / 0,90 | 88,1 | 97,0 | 101,9 |
| 0,84 / 0,90 | 89,5 | 98,3 | **155,2** |
| 0,88 / 0,86 | 92,9 | **157,8** | 161,0 |

Długości pomiędzy ~105 a ~150 m są praktycznie nieosiągalne: tor lotu albo
„siada" na prostym odcinku 37°, albo go mija i dolatuje dopiero do przejścia
w wybieg. Przyczyna jest mierzalna — doskonałość lotu modelu na tym odcinku
wynosi ~1,33, czyli niemal dokładnie 1/tan(37°) = 1,33, więc tor jest styczny
do stoku. Prawdziwy zawodnik ma ~1,5–1,8 i ląduje w łuku pola lądowania, dla
którego promień rL jest z założenia dobierany do krzywizny toru (tak działa
program JUMP-3.5 opisany w normie).

Wniosek rundy 6: doprowadzenie zeskoku do normy wymagało atomowej zmiany
profilu i modelu aerodynamicznego, a nie samego przesuwania stałych. Dlatego
wtedy profil pozostawiono bez zmian. Runda 7 wdrożyła oba elementy razem;
wynik i świeże pomiary są w §7.

## 5. Poprawki fizyki wymuszone przez rozbieg FIS

1. **Tarcie toru 0,02 → 0,0175.** Norma §6.2 podaje tarcie suche o kącie 1°
   dla toru lodowego; tan(1°) = 0,0175. Opór pozycji dojazdowej 0,30 → 0,22 m².
   Efekt: prędkość na progu 89,4 → 92,7 km/h przy 92,5 km/h w certyfikacie.
2. **Kierunek wiatru.** „Wiatr pod narty" nie jest wiatrem poziomym — na
   skoczni powietrze płynie wzdłuż zeskoku. Poprzedni wektor `(-u, 0)` dawał
   wynik odwrotny do rzeczywistego: przy realnej nośności wiatr pod narty
   SKRACAŁ skok (pomiar: 130,0 m / 4,51 s bez wiatru wobec 123,8 m / 4,49 s
   przy +3 m/s), bo masa powietrza cofała zawodnika względem ziemi, a czas
   lotu się nie zmieniał. Teraz wektor jest nachylony pod 35°, czyli pod
   charakterystycznym kątem zeskoku.
3. **Przygotowanie lądowania.** Prześwit nad garbem najpierw ROŚNIE (garb
   opada stromiej niż tor lotu), więc warunek „wysokość ≤ 6 m" uzbrajał
   przygotowanie już w pierwszej sekundzie lotu i zamieniał lot w sterowany
   zjazd. Poprawione w harnessie testów, w bocie i w testach e2e: najpierw
   wznios, dopiero potem zniżanie.
4. **Opór w locie ×1,20.** Rekompensata za szybszy rozbieg i za usunięty
   przedwczesny zjazd.

## 6. Stan po rundzie 6 — pomiary

| Belka | Rozbieg [m] | Prędkość na progu [km/h] | Długość [m] |
| ---: | ---: | ---: | ---: |
| 1 | 87,20 | 89,18 | 118,2 |
| 4 | 89,15 | 90,26 | 121,7 |
| 8 | 91,75 | 91,67 | 126,1 |
| 12 | 94,35 | 93,05 | 130,4 |

Współczynniki kompensacji policzone metodą z normy §5 (dla „odległości
zwycięzcy" ws = (w + HS)/2 = 127 m, jedna trzecia różnicy przy rozbiegu
krótszym o 3 m oraz przy wietrze ±3 m/s):

| Wielkość | Pomiar | Po przeliczeniu ×1,8 pkt/m | W danych skoczni |
| --- | ---: | ---: | ---: |
| belka | 1,698 m / 1 m rozbiegu | 3,06 pkt/m | 31 dziesiątych |
| wiatr pod narty | 2,512 m / 1 m/s | 4,52 pkt | 45 dziesiątych |
| wiatr w plecy | 2,530 m / 1 m/s | 4,55 pkt | 46 dziesiątych |

Poprzednie wartości (23/23/28) powstały przy modelu wiatru czysto poziomego
i zaniżały jego wpływ dwukrotnie.

Test `tests/hillCalibration.test.ts` pilnuje tych wielkości OBSERWOWALNYCH
(kąty i długości rozbiegu w granicach normy, odstęp belek poniżej 0,40 m
przewyższenia, prędkość na progu, monotoniczność długości względem belki,
trafienie belką odniesienia w odległość zwycięzcy, czas lotu, gradient
umiejętności, zgodność zapisanych współczynników ze zmierzonymi), a nie
samych stałych modelu — dzięki temu wolno stroić model dalej, dopóki gra
zachowuje się jak prawdziwa skocznia K120/HS134.

## 7. Runda 7 — profil FIS i model lotu wdrożone atomowo

Profil z §4 wszedł do `TECHNICAL_K120` jako `hillVersion = 3.0.0`:

- β0 = 6,17° pod progiem, 37° w P, 33,5° w K, 30,2° w L i 0° w U;
- n = 103,77 m, h = 58,53 m, h/n = 0,564;
- garb, łuk P–L i przejście L–U są aproksymowane gęstymi punktami tej samej
  mapy, której używają kolizja, pomiar i renderer.

Razem z profilem wdrożono `physicsVersion = pkg008-tune-3`. Prosty model gry
pozostał tabelą CL/CD bez nowej warstwy architektury: przy 32° ma CL = 1,09,
CD = 0,77 i L/D = 1,42; powierzchnia odniesienia wynosi 0,80 m², a tempo
nadążania pitch 20°/s. Ostre przeciągnięcie powyżej 35° zachowuje gradient
umiejętności i usuwa dawny wynik dwumodalny.

Świeży pomiar deterministyczny:

| Belka | Prędkość na progu [km/h] | Długość [m] |
| ---: | ---: | ---: |
| 1 | 89,18 | 115,54 |
| 8 | 91,67 | 125,01 |
| 12 | 93,05 | 129,87 |

Czas lotu dla belki 8 wynosi 4,73 s. Gradient prowadzenia: poprawne
125,01 m > przesterowanie 113,26 m > brak korekty 105,13 m > odchylenie
w tył 40,25 m. Zmierzone współczynniki gry po przeliczeniu na 1,8 pkt/m:
wiatr pod narty 12,9 pkt/(m/s), wiatr w plecy 8,9 pkt/(m/s), belka
3,5 pkt/m rozbiegu. Pilnują ich testy wielkości obserwowalnych, w tym nowe
asercje h/n i kotwic nachylenia P/K/L/U.

## 8. Empiryczna kalibracja bezpieczeństwa — Wisła K120/HS134 (PKG-008)

Dotyczy wyłącznie dokładnie tego obiektu/konfiguracji (Wisła Malinka,
K120/HS134 po przebudowie 2023). Nie kopiować na inne skocznie.

### 8.1. Źródła oficjalne (datowane PDF FIS)

| Konkurs indywidualny | CODEX / raceid | Załącznik FIS |
| --- | --- | --- |
| 14.01.2024, Wisła K120/HS134 | CODEX3108 / raceid6854 | <https://www.fis-ski.com/DB/v2/download/competition-attachment/c2fcc584-64da-11f1-b635-1866da7ef77e.pdf> |
| 07.12.2024, Wisła K120/HS134 | CODEX3077 / raceid7158 | <https://www.fis-ski.com/DB/v2/download/competition-attachment/c322f2c5-64da-11f1-b635-1866da7ef77e.pdf> |
| 08.12.2024, Wisła K120/HS134 | CODEX3079 / raceid7160 | <https://www.fis-ski.com/DB/v2/download/competition-attachment/c32368e6-64da-11f1-b635-1866da7ef77e.pdf> |

### 8.2. Envelope pooled (lądownane skoki)

Pooled N = 232 lądowane skoki z trzech powyższych konkursów:

- min 103 m; mediana 124,75 m; q75 128 m; q90 131 m; q95 132 m; max 139,5 m;
- mean 123,59 m;
- odległości ≥ HS (134 m): 9/232;
- odległości > 136 m: 2/232;
- odnotowane upadki: 0;
- styl lądowania: UNRESOLVED (źródła nie podają stylu — zakaz wymyślania);
- prawdopodobieństwo upadku: UNRESOLVED — 0 upadków w próbie NIE wyznacza
  krzywej prawdopodobieństwa ani nie jest ukrytą kością w grze;
- rekord obiektu (hill-data): 144,5 m.

Ograniczenia próby: trzy konkursy indywidualne na tym samym obiekcie;
kontekst belki/wiatru i wersja konstrukcji obiektu do weryfikacji przy
kolejnych danych; decyzje poniżej są prowizoryczne.

### 8.3. Decyzje kalibracyjne (PROWIZORYCZNE ADAPT, deterministyczne)

- Cel jury `safeTargetMeters = 127,0 m`: pasmo empiryczne q50–q75
  (mediana 124,75 → q75 128). Neutralnie daje belkę 9 (est. ~126,3 m;
  belka 10 est. ~127,5 m > sufit). (Rewidowane w §8.5 po werdykcie rundy 12.)
- Progi niemożliwe: telemark 142 m (~envelope max +2,5 m), parallel 145 m
  (> rekordu 144,5 m). Zgodne z envelope: max 139,5 nadal ustane przy
  idealnym kontakcie, dalej ryzyko rośnie deterministycznie do zera.
- Krzywa za HS: pierwiastek kwadratowy (łagodna, telemark trudniejszy od
  parallel w całym oknie; ciągła w HS; zero na progu; zero losowości).
- Dowód symulacyjny: `tests/safetyMechanics.test.ts` — rzeczywisty
  deterministyczny skok belka 9 / brak wiatru / pilot ideal / telemark
  późny 3,2 s ląduje 139,33 m (138–140, readiness 1, telemark, landed,
  powtarzalnie ten sam wynik).
- Wersje: `hillVersion 3.2.0`, fizyka `pkg008-tune-6`. Do rewizji, gdy
  pojawią się dane o upadkach/stylu na tym obiekcie.

### 8.4. Twarda zasada H01–H20 (obowiązuje każdą realną skocznię)

1. Kalibrować dokładnie ten obiekt/konfigurację — zakaz zgadywania
   i kopiowania z innej skoczni.
2. Karta skoczni MUSI cytować datowane oficjalne PDF FIS z tego obiektu
   (jak §8.1) oraz — gdy dostępne — listy startowe / dane rund z belką,
   wiatrem, lądowaniem i upadkami; użyć kilku ostatnich porównywalnych
   konkursów; odnotować ograniczenia próby i wersję konstrukcji obiektu.
3. Zapisać co najmniej: rozkład lądowanych odległości (min / mediana /
   górne kwantyle / max, w podziale na warunki gdy dane pozwalają),
   zaobserwowane upadki w pasmach odległości, kontekst belki i wiatru
   oraz decyzje kalibracyjne. Brak stylu w źródle → UNRESOLVED.
4. Determinizm: ten sam input/seed daje ten sam wynik. Prawdopodobieństwo
   upadku kalibruje rozkłady błędów AI i progi, nigdy nie jest ukrytą
   kością dla gracza.
5. Bramka: realna skocznia bez tych pól nie przechodzi D/G/A/V
   i nie wchodzi do zawartości grywalnej — oznaczyć BLOCKED / UNRESOLVED.

### 8.5. Rewizja belki AUTO po werdykcie rundy 12 (21.09.2026)

Użytkownik: automatyczna belka „zdecydowanie za wysoko, przeskakuje skocznię
daleko powyżej HS”. Przyczyna zmierzona symulacyjnie: baza selektora (125,0 m)
opisywała lot z domyślnym wczesnym przygotowaniem, a gracz z pełnym
przygotowaniem (telemark 3,2 s) leciał o ~13 m dalej na każdej belce
(belka 8 → 138,05 m; belka 9 → 139,33 m) — neutralne AUTO = belka 9 wysyłało
umiejętny skok na 139,3 m.

Decyzja: kotwica selektora przeniesiona na zmierzony dystans umiejętny
`referenceDistanceMeters = 138,1 m`; logika wyboru, fizyka, geometria,
współczynniki kompensacji i cel bezpieczeństwa 127,0 m bez zmian.
Nowa tabela AUTO: neutralnie i przy wietrze pod narty — belka 1;
wiatr w plecy −1 m/s — belka 3; −2 m/s — belka 7.
Umiejętne skoki referencyjne z belki AUTO mieszczą się < HS134
(przygotowanie 3,2 s); residuum: belka 1 + skrajne przygotowanie 3,6 s
+ wiatr pod narty +2 m/s → 135,9 m — jury nie ma już niższej opcji;
to fizyka, nie błąd decyzji. Wersja reguł → `pkg008-rules-4`.
Dowód: `tests/safetyMechanics.test.ts` (tabela AUTO + skoki z belki AUTO).

### 8.6. Rozszerzenie mapy belek po werdykcie rundy 13 (21.09.2026)

Użytkownik: nawet z dotychczasowej belki 1 skoki są za długie; obecna belka 1
ma zostać belką 10, aby można było schodzić niżej. Wdrożono 21 belek:

- stare fizyczne belki 1–12 → nowe numery 10–21, identyczne długości rozbiegu;
- nowe niższe belki 1–9 przedłużają istniejący rozstaw 0,65 m w dół;
- nowa belka 10 = stara 1: 87,20 m rozbiegu, umiejętny skok neutralny 129,06 m;
- nowa belka 17 = stara referencyjna 8: 91,75 m, 138,05 m;
- nowa belka 1: 81,35 m, umiejętny skok neutralny 114,7 m;
- różnica wysokości każdej pary: 0,65 × sin 35° = 0,373 m ≤ limit FIS 0,40 m.

Referencje kompensacji i bezpieczeństwa przesunięto 8 → 17 bez zmiany ich
fizycznej pozycji ani czynników. Tabela AUTO po rozszerzeniu: wiatr w plecy
−2/−1/−0,5 m/s → belka 16/12/10; neutralnie → 8; wiatr pod narty
+0,5/+1/+2 m/s → belka 5/2/1. Umiejętne skoki referencyjne (przygotowanie
3,2 i 3,6 s) są < HS134 we wszystkich tych warunkach. `hillVersion` 3.3.0,
`rulesVersion` `pkg008-rules-5`; fizyka pozostaje `pkg008-tune-7`.
Dowody: `tests/hill.test.ts`, `tests/hillCalibration.test.ts`,
`tests/safetyMechanics.test.ts`.

## 9. Empiryczna kalibracja not sędziowskich — Wisła K120/HS134 (runda 11)

Kalibracja korzysta z tych samych trzech datowanych oficjalnych PDF FIS z §8.1.
Lokalne kopie źródeł oraz powtarzalny ekstraktor znajdują się w
`docs/evidence/PKG-008/fis/`:

- `wisla-2024-01-14-codex3108.pdf`;
- `wisla-2024-12-07-codex3077.pdf`;
- `wisla-2024-12-08-codex3079.pdf`;
- `extract-notes.mjs` (`node docs/evidence/PKG-008/fis/extract-notes.mjs`).

### 9.1. Rozkład oficjalnych not

Ekstraktor odnalazł 232 wiersze skoków z kompletem pięciu not, czyli 1160
pojedynczych ocen. Suma trzech środkowych not zgadza się z oficjalnym polem
stylu we wszystkich 232 wierszach.

| Miara | Wynik |
| --- | ---: |
| Minimum | 14,0 |
| Q25 | 17,0 |
| Mediana | 17,5 |
| Q75 | 18,0 |
| Q90 / Q95 | 18,5 / 18,5 |
| Maksimum | 19,5 |
| Noty ≥19,5 | 3/1160 = 0,3% |
| Noty 20,0 | 0/1160 = 0,0% |
| Noty ≤15,0 | 20/1160 = 1,7% |

Histogram najważniejszego zakresu: 19,5: 3; 19,0: 14; 18,5: 141;
18,0: 320; 17,5: 283; 17,0: 203; 16,5: 106; 16,0: 54;
15,5: 16; 15,0: 12; 14,5: 4; 14,0: 4.

### 9.2. Decyzja kalibracyjna (ADAPT)

Model gry opisuje błędy i potrącenia, ale nie ma osobnej osi wyjątkowej dodatniej
jakości. Dlatego brak błędów nie może automatycznie dawać 19,5–20,0. Pięć
deterministycznych profili czystego skoku ustawiono na
`16,5 / 17,0 / 17,5 / 18,0 / 18,5`; po odrzuceniu skrajnych daje to
`52,5 pkt`, zgodnie z medianą źródeł. Literalne potrącenia FIS za brak
telemarku, podpórkę i upadek pozostają bez zmian. Wersja reguł została
podniesiona do `pkg008-rules-3`.

Test `tests/scoring.test.ts` pilnuje rozkładu czystego skoku i sumy retained-3.
Noty 19,5–20,0 pozostają w modelu nieosiągalne samym „brakiem błędu”; ich
ewentualne przyszłe przyznawanie wymaga osobno udokumentowanej dodatniej osi
jakości, a nie ukrytej kości.

### 9.3. Ograniczenia

- Próba obejmuje trzy konkursy indywidualne na tej samej konfiguracji obiektu,
  ale nie rozdziela not według narodowości sędziego ani warunków wizualnych.
- Oficjalne PDF-y nie podają jawnej etykiety stylu lądowania; pozostaje
  **UNRESOLVED**.
- W próbie nie wykryto wiersza z rozbieżnością między sumą retained-3 a polem
  stylu, więc osobny rozkład not dla upadków jest **UNRESOLVED**.

## 10. Noty względem odległości — runda 15 (21.09.2026)

Rozszerzony `extract-notes.mjs` ponownie odczytał te same trzy oficjalne PDF FIS
z §8.1: N=232 skoki i 1160 pojedynczych not. Pasma są rozłączne; dokładne
139,0 m należy do `HS–HS+5`, a `>HS+5` zaczyna się od 139,5 m.

### 10.1. Rozkład w pasmach

`Retained-3` poniżej oznacza oficjalną sumę trzech not po odrzuceniu jednej
najniższej i jednej najwyższej.

| Pasmo | N skoków / not | Pojedyncze: min / med / q75 / q90 / max | Retained-3: min / med / q75 / q90 / max |
| --- | ---: | --- | --- |
| `<K` (<120,0) | 63 / 315 | 14,0 / 17,00 / 17,00 / 17,50 / 18,0 | 42,0 / 50,50 / 51,00 / 52,00 / 52,5 |
| `K–K+5` (120,0–124,5) | 53 / 265 | 15,5 / 17,50 / 17,50 / 18,00 / 18,5 | 48,5 / 52,50 / 53,00 / 54,00 / 54,0 |
| `K+5–K+10` (125,0–129,5) | 79 / 395 | 16,0 / 18,00 / 18,00 / 18,50 / 19,0 | 49,0 / 54,00 / 54,00 / 55,00 / 56,0 |
| `K+10–HS` (130,0–133,5) | 28 / 140 | 16,5 / 18,50 / 18,50 / 18,50 / 19,5 | 53,0 / 55,00 / 55,50 / 55,50 / 57,5 |
| `HS–HS+5` (134,0–139,0) | 8 / 40 | 16,5 / 18,50 / 18,50 / 19,00 / 19,0 | 53,0 / 54,50 / 55,50 / 55,65 / 56,0 |
| `>HS+5` (>139,0) | 1 / 5 | 18,5 / 18,50 / 19,00 / 19,30 / 19,5 | 56,0 / 56,00 / 56,00 / 56,00 / 56,0 |

Korelacja Pearsona jest dodatnia: dystans↔pojedyncza nota `r=0,7680`, a
dystans↔średnia retained-3 `r=0,8180`. Jest to opis współwystępowania w małej,
selekcyjnej próbie konkursowej, nie dowód przyczynowości. Szczególnie pasma za
HS są nieliczne (8 i 1 skok).

### 10.2. Decyzje rundy 15

- **OBSERVED:** w źródłach dalsze skoki mają przeciętnie wyższe noty.
- **UNRESOLVED:** PDF nie zawiera jawnej etykiety telemark/parallel ani liczby
  podpórek, więc nie pozwala wyprowadzić osobnych rozkładów według stylu.
- **DESIGN (polecenie użytkownika):** noty ustanych skoków są deterministycznie
  niemalejące ponad K; poza HS dwie nogi mieszczą się w 15,0–17,5, telemark
  w 17,0–20,0, jedna dłoń w 12,0–14,0, a dwie dłonie zachowują zaakceptowany
  zakres 12,0–14,0. Zakresów tych nie przypisuje się PDF-om.
- Nota 20,0 jest zarezerwowana dla wyjątkowego telemarku daleko za HS, a nie
  dla typowego czystego skoku.

### 10.3. Rewizja okna ustania za HS

Na polecenie użytkownika oba prowizoryczne progi przesunięto o dokładnie 5 m,
czyli nie więcej niż dopuszczone maksimum:

| Styl | Poprzedni próg | Nowy próg | Zmiana |
| --- | ---: | ---: | ---: |
| telemark | 142,0 m | **147,0 m** | +5,0 m |
| dwie nogi | 145,0 m | **150,0 m** | +5,0 m |

Krzywa pozostaje pierwiastkowa, ciągła w HS134 i deterministycznie osiąga zero
dokładnie na progu. Oficjalny rekord hill-data 144,5 m ma teraz dodatni
mnożnik dla telemarku `sqrt(2,5/13) ≈ 0,439` i dla dwóch nóg
`sqrt(5,5/16) ≈ 0,586`, więc ustanie rekordu nie jest z góry wykluczone.
Rzeczywisty skok symulowany z belki 21 (idealny pilot, telemark, przygotowanie
3,2 s) ląduje deterministycznie około 143,1 m: wcześniej znajdował się za
progiem telemarku 142 m, a obecnie mieści się w oknie 134–147 m i jest ustany.
Skrajny lot około 154,9 m nadal przekracza oba nowe progi i kończy się upadkiem.

Wersja danych skoczni: `hillVersion 3.4.0`. `physicsVersion` pozostaje
`pkg008-tune-7`, ponieważ nie zmieniono aerodynamiki ani integratora; zmieniły
się wyłącznie wersjonowane dane bezpieczeństwa dokładnego obiektu. Dla każdej
przyszłej skoczni mamuciej okno ustania musi być skalibrowane osobno z rekordów,
wyników i upadków tej konkretnej konfiguracji — wartości 147/150 nie są stałą
uniwersalną i nie wolno ich kopiować.
