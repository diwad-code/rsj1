---
name: dos-pixel-art
description: "Kontrakt grafiki DOS pixel-art dla retro-ski-jumping. Uzyj przy sprite'ach skoczka, scenie stadionu, foncie bitmapowym i generatorze linii K/HS: siatka, palety, zasady rysowania i zakazy."
---

# dos-pixel-art — kontrakt oprawy (P15 i dalej)

Zrodlo prawdy: `docs/ART_UI_AUDIO.md`. Ponizsze to skrot wykonawczy.

## Siatka i render

- Obraz logiczny **960×540**, 16:9. Skala calkowita (2× na 1920×1080),
  tryb „Dopasuj" z nearest-neighbour dla mniejszych okien. Nigdy nie
  rozciagac proporcji. Brak antyaliasingu.
- Skoczek stojacy: sylwetka ~36–48 px, narty 48–68 px. Pozycja lotna
  i oba ladowania rozpoznawalne bez HUD.
- Font bitmapowy 12–16 px, cyfry stalej szerokosci; tytuly 24–32 px lub
  dokladne wielokrotnosci. Polskie znaki obowiazkowe:
  `ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ`.
- Tla na tej samej siatce, klastry 2–6 px + selektywne detale.
  Dithering tylko na wybranych przejsciach.
- ZAKAZY: CRT, bloom, motion blur, scanlines, pelnoekranowy szum,
  fotograficzne ziarno, plastikowe kontury.

## Palety bazowe (DESIGN)

`#121D2B` granat · `#91B4CB` cien sniegu · `#E7F0EF` snieg ·
`#536C7A` stal · `#244637` las · `#F1BD79` cieple swiatlo ·
`#F3EAD1` tekst. Oznaczenia: niebieski `#286BC6`, czerwony `#D64D53`,
zielony `#3FA865` — zawsze tez ksztalt/pozycja/etykieta, nigdy sam kolor.

## Generator oznaczen (kontrakt, nie tabela wspolrzednych)

Dane: `span = HS − K`; czerwony `[K, HS]`; niebieski `[K − span, K]`;
zielony `[fallLine − span, fallLine]`. Linie poprzeczne co 5 m
w `[P − 10, HS]`; HS zawsze markerem. Podzialki boczne co 1 m od
`ceil(K/2)` do `HS+5`, podpisy rzadziej. Renderer liczy z `distanceMap`;
zakaz osobnej tabeli wspolrzednych w rendererze. Czerwone pasy to pasy
przy brzegach, nie wypelnienie stoku. „Do prowadzenia" to cienka zielona
linia + `DO PROWADZENIA ~x,x m` w HUD (tylda = prognoza).

## Banki sprite'ow (budzet startowy)

Skoczek bazowy + maski kolorow, osobne warstwy nart i ciala: belka,
ruszenie, zjazd, 5–8 faz wybicia, bank pozycji lotnych, 4–6 faz
telemarku, 3–5 ladowania rownoleglego, amortyzacja, odjazd, hamowanie,
utrata rownowagi, upadek. Ulozenie sprite'a ze stanu fizyki; sprite nie
moze pokazac kontaktu 15 px przed rzeczywista kolizja. Kqtne pozy —
bank recznie poprawionych klatek albo obroty bez wygladzania
poprawione w atlasie.

## Pipeline assetow

`imagine-pixel` (snap obowiazkowy, tylko PNG) → `pixelart-cleanup`
(halo/orphany) → atlas + manifest z pochodzeniem/licencja. Do builda
tylko zoptymalizowane eksporty; mastery poza buildem. Kazdy zewnetrzny
asset runtime wymaga jawnego pochodzenia; nie kopiuj materialow SJ3.
Skala sprite'a i Canvas2D zatwierdzone pomiarem P15 (p50/p95/p99,
dlugie klatki, aktywny snieg i wiatr).

## Gdy proceduralne rysowanie (fillRect/pixelLine/fillPixelPolygon) nie daje
## czytelnego efektu — zgoda uzytkownika z 16.09.2026, PKG-008 kontynuacja

Wolno uzyc CLI `gen-ai` (Picsart, zainstalowane i zalogowane w tym srodowisku;
`gen-ai image --help`, `gen-ai character --help` do spojnej postaci na wielu
generacjach, `gen-ai edit-image` do poprawek, `gen-ai remove-bg`/`vectorize`
do oczyszczenia) zamiast dalszego, wielogodzinnego strojenia recznych
wspolrzednych `pixelLine`, jesli sylwetka/scena nadal nie czyta sie dobrze po
rozsadnej liczbie iteracji. Wygenerowany PNG nadal przechodzi przez zasade
"jedna siatka pikseli, bez antyaliasingu" — snapuj/czysc go do siatki (nearest-
neighbour, `imageSmoothingEnabled=false` przy imporcie, ewentualny krok
pixelart-cleanup) zanim trafi do gry, i zapisz pochodzenie/prompt w manifescie
assetow zgodnie z zasada wyzej. To narzedzie na trudnosc rysowania, nie zamiana
calego pipeline'u na jeden strzal AI bez kontroli jakosci.
