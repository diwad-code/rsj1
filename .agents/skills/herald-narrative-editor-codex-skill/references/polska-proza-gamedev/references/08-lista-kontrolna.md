# Lista kontrolna — przed oddaniem tekstu

Użyj tej listy do każdego audytu. Każda niezaliczona pozycja = poprawka.

---

## BLOK A — Interpunkcja (twarde, automatyczne)

- [ ] Dialogi otwierane myślnikiem `—` (U+2014), nie dywizem `-` ani półpauzą `–`
- [ ] Po myślniku dialogowym — spacja
- [ ] Kwestia z czasownikiem mówienia NIE kończy się kropką
- [ ] Didaskalia po kwestii — małą literą (gdy czasownik mówienia)
- [ ] Didaskalia opisowe (nie mówienie) — wielką literą, kwestia z kropką
- [ ] Cudzysłów w tekście: `„ "` (nie `" "` angielski)
- [ ] Wielokropek: `…` (U+2026), nie `...`
- [ ] Każde zdanie podrzędne poprzedzone przecinkiem
- [ ] Zwroty bezpośrednie (imię/tytuł) — oddzielone przecinkami
- [ ] Kropka PO cudzysłowie zamykającym (`„tekst".`), nie przed (`„tekst.”`)

---

## BLOK B — Gramatyka (twarde, automatyczne)

- [ ] Brak biernika po przeczeniu: `nie widzę sygnału`, nie `sygnał`
- [ ] Przymiotnik po „coś": forma dopełniacza: `coś niezwykłego`
- [ ] `tę`, nie `tą` w bierniku
- [ ] Imiesłów `-ąc` ma właściwy podmiot (ten sam co zdanie główne)
- [ ] Odmiana liczebników: `dwaj/trzej` (mianownik m-os.), `stu pięćdziesięcioma`
- [ ] Rząd czasownika: `używać reaktora`, `szukać odpowiedzi`
- [ ] `po angielsku / po polsku`, nie `angielskim / polskim`
- [ ] Brak przecinka po zwykłym przysłówku czasu/częstości na początku zdania (`Zazwyczaj mówi mało`, nie `Zazwyczaj, mówi mało`)

---

## BLOK C — AI-izmy i kalki (ocena statystyczna)

- [ ] Brak fraz-wytrychy: `warto zauważyć, warto wspomnieć, oczywiście, zdecydowanie` (zamiast konkretu)
- [ ] Brak buzzwordów: `kluczowy, innowacyjny, kompleksowy, dynamiczny, przełomowy`
- [ ] Brak kalek składniowych: nadmiar zaimków osobowych (`on powiedział, że on...`)
- [ ] Brak angielskiego szyku: `dobrze go zna` → `zna go dobrze`
- [ ] Brak kalk UI: `Czy jesteś pewien?` → `Na pewno?`
- [ ] Brak kalek wyrażeń: `to sprawia, że` → `przez to`
- [ ] Brak szablonu `nie tylko X, ale (przede wszystkim) Y` w nadmiarze
- [ ] Brak fałszywego kontrastu `to nie X, to Y` / `nie chodzi o X, chodzi o Y` jako pustej klamry
- [ ] Brak zdań-tasiemców (trzy wątki w jednym)
- [ ] Brak piętrzenia podrzędników z „który" trzy razy z rzędu

---

## BLOK D — Rytm i styl (ocena manualna)

- [ ] Zdania mają zróżnicowaną długość (nie 5 zdań po 7 słów z rzędu)
- [ ] Brak zdań zaczynających się od tego samego słowa 3+ razy z rzędu
- [ ] Brak elipsy podmiotu tylko tam gdzie podmiot jasny (nie wszystkie zdania z podmiotem)
- [ ] Opis ma zmysłowy konkret (nie `kosmos był ciemny` ale co konkretnie)
- [ ] Akapit ma jeden punkt ciężkości (nie 3 wątki naraz)
- [ ] Protezy usunięte: `generalnie, w zasadzie, właściwie` (tam gdzie zbędne)

---

## BLOK E — Idiolekt (test "zasłoń imię")

- [ ] ECHO: krótko, raportuje, nie ocenia, nie spekuluje, nie przeprasza
- [ ] ZARZĄDZANIE: procedury, zimna arytmetyka, formalne
- [ ] EMPATIA: ludzki ból, relacje, ciche obserwacje
- [ ] NAUKA: dane, hipotezy, ciekawość przez precyzję
- [ ] PRZETRWANIE: liczby, arytmetyka, bez oceny moralnej
- [ ] PAMIĘĆ: Anna, Ziemia, retrospekcja, czas przeszły
- [ ] CISZA: minimum słów, intuicja, rośnie z poziomem
- [ ] Kezia: konkretna, sucha ironia, pytania zamiast stwierdzeń
- [ ] Piotr: techniczny, lakoniczny emocjonalnie, `panie Tomasz`
- [ ] Naomi: biologiczna terminologia, maski emocji w danych
- [ ] Solomon: słucha, wolny rytm, pytania filozoficzne
- [ ] Tomasz: spokój + ciężar, nie tłumaczy się, precyzyjny

---

## BLOK F — Specyficzne dla typów tekstów

- [ ] Dialogi: brak „as you know" ekspozycji
- [ ] Głosy wewnętrzne: format `*(GŁOS (X): „treść")*`
- [ ] Narracja II osoby: konsekwentna, czas teraźniejszy
- [ ] ECHO logi: format terminalowy, wartości po dwukropku
- [ ] UI: naturalne polskie sformułowania, nie angielskie kalki
- [ ] Notatki in-world: głos autora, nie narrator gry
- [ ] Opisy przedmiotów: Lem-style konkret, nie ogólnik

---

## Priorytety naprawy

```
🔴 KRYTYCZNE (popraw natychmiast):
   Blok A + Blok B — błędy gramatyczne i interpunkcyjne

🟠 WAŻNE (popraw przed każdym większym commitem):
   Blok C — AI-izmy i kalki (jeśli >10% fragmentu)
   Blok E — test "zasłoń imię" (jeśli postacie brzmią tak samo)

🟡 DOBRE PRAKTYKI (popraw przy refactoringu tekstu):
   Blok D — rytm i styl
   Blok F — typ-specyficzne
```

---

## Flagi do raportu audytu

W raporcie używaj oznaczenia:

```
🔴 [plik:linia] BŁĄD GRAMATYCZNY: opis + poprawka
🟠 [plik:linia] AI-IZM/KALKA: opis + propozycja
🟡 [plik:linia] STYL: obserwacja + kierunek
💬 [plik:linia] GŁOS POSTACI: obserwacja (bez narzucania słów)
```
