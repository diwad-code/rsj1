# HERALD — Canon Sheet Chronologii

## Cel

Ten arkusz jest jednym zrodlem prawdy dla liczb, relacji czasowych i kolejnosci makrobeatow fabularnych HERALD.

Nie sluzy do tworzenia nowego plotu. Ma zatrzymac dalszy drift miedzy:

- `docs/HISTORIA.md`,
- `docs/HERALD-fundament-v2.md`,
- `docs/design/herald-fabularny-przebieg-i-mapa-zdarzen.md`,
- `data/events/**/*.json`,
- przyszlymi promptami dla modeli zewnetrznych.

---

## Hierarchia zrodel dla czasu

1. Ten plik blokuje liczby i relacje czasowe.
2. `docs/HISTORIA.md` i `docs/HERALD-fundament-v2.md` definiuja sens i dramaturgie beatow.
3. `data/events/**/*.json` definiuja aktualny runtime, ale nie moga samodzielnie nadpisywac liczb z tego arkusza.

Jesli runtime copy rozchodzi sie z tym arkuszem, runtime copy jest drift do poprawy.

---

## Trzy osie czasu

### 1. Czas ziemski

To glowna os, po ktorej liczymy:

- rok startu misji,
- lata lotu do Limes,
- opoznienie sygnalu,
- wiek Anny i pozostalych ludzi na Ziemi.

### 2. Czas misji

To os fabularno-operacyjna:

- Prolog
- Act I
- Act II
- Act III
- Act IV
- Act V
- powrot `Thalesa`

Ta os moze byc opisana pokojami, torporem i beatami, ale nie moze przeczyc czasowi ziemskiemu.

### 3. Czas subiektywny zalogi

To os biologiczno-psychologiczna, znieksztalcona przez torpor.

Status na teraz:

- `LOCKED`: zaloga starzeje sie subiektywnie i biologicznie znacznie wolniej niz uplywa czas ziemski.
- `UNLOCKED`: repo nie podaje jeszcze jednej twardej liczby biologicznego wieku Tomasza przy Limes ani po powrocie.

Wniosek praktyczny:

- wolno pisac o zmeczeniu, przeciazeniu i kumulacji czasu,
- nie wolno bez nowej decyzji kanonicznej wpisywac sztywnych liczb typu `Tomasz biologicznie ma X lat`.

---

## LOCKED — liczby kanoniczne

### Start misji

- `2099`, zima.
- Prolog otwiera sie na platformie startowej w zimie `2099`.

### Wiek przy starcie

- Tomasz Wierzbicki: `52`
- Kezia Abebe: `40`
- Anna: `24`

### Skala lotu

- `Thales` leci do Limes `58 lat` czasu ziemskiego.
- Pelna podroz tam i z powrotem to `116 lat` czasu ziemskiego.

### Opoznienie komunikacyjne przy Limes

- W chwili wejscia na orbitę Limes opoznienie komunikacji z Ziemia wynosi `14 lat i 3 miesiace`.

To jest opoznienie transmisji, nie czas dolotu statku.

### Makro relacje wieku Anny

- przy starcie: `24`
- przy przybyciu do Limes po `58` latach: okolo `82`
- przy otrzymaniu przez Ziemie finalnej wiadomosci wyslanej z Limes po dodatkowym opoznieniu transmisji: okolo `96`

Wniosek:

- Anna moze jeszcze zyc w chwili otrzymania wiadomosci, ale nie ma juz przestrzeni na traktowanie finalnej korespondencji jak wymiany prawie-rownoczesnej.

---

## LOCKED — relacje fabularne

### Prolog

- Misja startuje z Ziemi w `2099`.
- Tomasz wylatuje jako czlowiek, ktory zbudowal zycie wokol pytania o pozaziemskie zycie.

### Act I

- Act I obejmuje odlot, pierwszy rytm statku, pierwsze pakiety i `Earth Out of View`.
- Ziemia przestaje byc widzialna przed duzym skokiem do Act II.

### Act II

- Act II to dlugi odcinek srodkowy misji po pierwszym wejciu w rytm statku.
- Artykul Park/Mensah musi pojawic sie wystarczajaco wczesnie, by Tomasz nosil go przez dlugi odcinek historii, ale nie tak wczesnie, by zjadl onboarding Act I.

### Act III

- Act III jest `trzecim kwartalem` misji.
- `anna_message_3` nalezy do progu Act III.
- Pytanie ECHO o wartosc misji pada wtedy, gdy do Limes zostaje `12 lat` czasu ziemskiego.

Wniosek:

- jesli przybycie do Limes jest po `58` latach, pytanie ECHO pada okolo `46` lat po starcie w czasie ziemskim.

### Act IV

- Act IV zaczyna sie po chronologicznym skoku na przybycie do Limes.
- Przybycie do Limes nie jest osobna, mlodsza wersja finalu; to moment wejscia w odpowiedz po calym outbound legu `58` lat.

### Act V

- Act V dzieje sie juz po odkryciu przy Limes, ale przed powrotem `Thalesa` jako zakończonym faktem.
- `anna_message_4` poprzedza `echo_final_message_prompt`.
- Wybor tonu ostatniej wiadomosci nie zmienia faktow naukowych; zmienia, jak Tomasz staje wobec odpowiedzi.

### Powrot

- Fizyczny powrot `Thalesa` na Ziemie, jesli nastapi, jest odlegly o kolejne `58` lat czasu ziemskiego od Limes.
- Anna nie moze byc traktowana jako realistyczny punkt odbioru fizycznego powrotu.

---

## Wiek i perspektywa — quick reference

| Punkt | Czas ziemski od startu | Tomasz — status | Anna — wiek ziemski | Status |
|---|---:|---|---:|---|
| Start misji | 0 lat | 52 lata kalendarzowo | 24 | LOCKED |
| Prog Act III | ok. 46 lat | wciaz w torporowej asymetrii czasu | ok. 70 | DERIVED FROM LOCKED |
| Limes / poczatek Act IV | 58 lat | nie wpisywac liczby biologicznej bez nowego locku | ok. 82 | LOCKED/DERIVED |
| Ziemia odbiera finalna wiadomosc | 72 lata i 3 miesiace | Tomasz nadal przy Limes / na poczatku drogi powrotnej | ok. 96 | DERIVED FROM LOCKED |
| Hipotetyczny fizyczny powrot `Thalesa` | 116 lat | przyszla warstwa kanoniczna, nie obecna scena runtime | 140 | DERIVED FROM LOCKED |

---

## Dozwolone i niedozwolone skroty narracyjne

### Dozwolone

- `po dziesiecioleciach`
- `po pol wieku`
- `po 58 latach lotu`
- `po 58 latach czasu ziemskiego`
- `po kolejnych latach opoznienia transmisji`
- `kiedy Anna jest juz stara kobieta`, jesli kontekst jasno dotyczy odbioru wiadomosci na Ziemi

### Niedozwolone bez nowego locku

- `po czterdziestu latach`, jesli chodzi o finalna wiadomosc z Limes
- `Anna ma 85 lat`, jesli chodzi o chwile przybycia do Limes albo wysylki wiadomosci
- dowolna sztywna liczba biologicznego wieku Tomasza po torporze
- skroty sugerujace, ze opoznienie sygnalu i czas lotu to ta sama wartosc

---

## Chronology Drift Status

### Rozwiązane podstawowe drifty (2026-06-06)

1. `docs/HISTORIA.md`
   - stare wzmianki o `85` latach Anny w finale zostaly usuniete lub zneutralizowane.

2. `data/events/act5/echo_final_message_prompt.json`
   - stare `po czterdziestu latach` w gałęzi `write_to_anna` zostalo usuniete.

### Pozostałe ryzyka do pilnowania

3. Future writer prompts / plan documents
   - moga nadal przywracac stare liczby `85` albo sugerowac zbyt bezposredni, prawie natychmiastowy odbiór finalnej wiadomości.

4. Future ending polish
   - przy wzmacnianiu `LIST` latwo niechcaco napisac ton bardziej `natychmiastowej korespondencji` niz `wiadomosci przez epoki`.

---

## Co ten arkusz zmienia praktycznie

- Kazdy nowy tekst o Annie i finalnej wiadomosci musi przejsc przez ten arkusz przed wejsciem do runtime.
- Kazdy rewrite Act III-V musi rozdzielac:
  - czas wysylki,
  - czas odbioru,
  - czas subiektywny Tomasza.
- Kiedy dokumenty chca uzyc liczby, maja odsylac tutaj albo uzyc formul neutralnych, jesli liczba nie jest `LOCKED`.

---

## Status

- `LOCKED`: start 2099, Tomasz 52, Anna 24, dolot 58 lat, pelny lot 116 lat, opoznienie sygnalu przy Limes 14 lat 3 miesiace.
- `OPEN`: biologiczny wiek zalogi po torporze, precyzyjny kalendarz wszystkich czterech wiadomosci Anny, dlugosc postoju przy Limes przed powrotem.

Do czasu nowej decyzji autorskiej wszystkie kolejne dokumenty i eventy musza byc zgodne z tym stanem.