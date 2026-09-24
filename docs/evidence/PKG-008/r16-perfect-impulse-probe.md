# PKG-008 r16-fix — perfect takeoff jako fizyczny impuls (bounded probe)

## Zmiana produkcji (2 pliki)

- Usunięto cheat: `clamp(3 − wiatr×0,5; 2; 4)` dopisywany do dystansu kolizji
  wraz z relokacją punktu kontaktu. Pomiar to z powrotem dokładny dystans
  sweepu (`sweepContact`), zbocze i normalna z tego punktu.
- Dodano jednorazowy popęd normalny w `leaveTable`: 18 N·s / 65 kg ≈ +0,277 m/s
  do prędkości oderwania wzdłuż normalnej progu. Raz, bez stackowania.
- `params.ts`: 4 pola dystansowe zastąpione `perfectImpulseNewtonSeconds: 18`.
  Wersja fizyki bez zmian (`pkg008-tune-8`).
- Zdarzenie `perfectTakeoff` i boolean bez zmian dla renderera/replaya; detail
  opisuje impuls (`+18.0 N·s (+0.277 m/s ⊥)`), nie metry. Pole
  `perfectTakeoffBonusMeters` usunięte. Okno ±1/120 i mapowanie
  (-2,-1,0 tak; -3,+1 nie) bez zmian.

## Diagnoza: gate21 ~20 m to efekt sterowania, nie aero

Kandydat 18 N·s daje na belce 8: 3,31 / 2,84 / 2,49 m (wiatry −1/0/+1), a na
belce 21 adaptacyjnie 21,53 m (129,87 → 151,40). Sonda bounded (dane w JSON):

| para gate21 | delta |
| --- | --- |
| adaptacyjna (różne wejścia) | 21,53 m, prep tick 859 → 1338 |
| wymuszony ten sam tick prepa 859 | 2,60 m |
| taśma z przebiegu bazowego, cross-replay w obie strony | 2,37 m |
| taśma z przebiegu bonusowego, cross-replay | 4,26 m |
| para no-landing (bez T/R), zamrożona taśma | 3,42 m |

Wyższy lot z premią (max 9,49 m zamiast 7,56 m) później spada pod próg
uzbrojenia przygotowania 6 m harnessu, więc polityka adaptacyjna wchodzi
w `LandingPrep` ~4 s później i leci innym reżimem (inne wejścia → inny lot).
Przy zamrożonym sterowaniu delta wraca do 2–4 m W KOPERCIE NOMINALNEJ
(belka 8 przy wiatrach −1/0/+1; belki 1/8/17/21 neutralnie). Poza nią
udokumentowane limity: taśma z przebiegu bonusowego 4,26 m, ekstremalny wiatr
+3,2 m/s 17,59 m — to nie jest gwarancja uniwersalna. Wniosek: nie ruszano
sterowania produkcji ani safety — kopertę orzeka zamrożona taśma, adaptacyjną
raportujemy osobno. Jednorazowy impuls 18 N·s zostaje (bez dalszego strojenia).

## Koperta fixed-tape (predeclared)

- Belka 8, wiatry −1/0/+1: fixed 3,01 / 3,02 / 3,07 m (adaptacyjne też 2–4).
- Belki 1/8/17/21, wiatr 0: fixed 3,94 / 3,02 / 2,50 / 2,37 m.
- Ekstrema belka 8: wiatr −3,2 fixed 3,62 m; wiatr +3,2 fixed 17,59 m przy
  adaptacyjnym 1,25 m (amplifikacja fazy lądowania) — jawny limit, fizyki nie
  naginano do stałych delt. Wymóg użytkownika: premia *może* dać 2–4 m,
  nie gwarantuje przy każdej strategii pilota.

## Produkcja po zmianie (DEFAULT)

- Umiejętne 3,2 s: b10 131,04 / b17 139,86 / b18 141,17 (1 dłoń) / b21 144,78 —
  wszystko ustane, pod progami 147/150.
- Tabela AUTO z premią: 124,6–130,2 m, readiness 1, poniżej HS134, powyżej
  75% HS. Estymata (kotwica bez premii 138,1 m) zaniża ~1–2 m — raportowane
  jawnie; belki AUTO, czynniki i progi bez zmian.
- Testy kalibracji/historyczne (PKG-004, kompensacja, koperta K/HS, wektory
  129,06/138,05/125,0) jawnie na bazie bez premii; produkcja na DEFAULT.

## Weryfikacja

- `npm run typecheck` PASS; `npm test` 30 plików, 247/247 PASS.
- Fizyka: wyższy y przy tym samym x/t przed wejściem lądowania, +0,277 v⊥,
  kontakt na odcinku ruchu (sweep == pomiar), determinizm taśmy, brak
  stackowania, zdarzenie dokładnie raz.
- Nie ruszano: renderera, main, progów 147/150, geometrii, czynników.
  REPORT §23 i handoff rundy 17 dopisano w domknięciu dokumentacyjnym;
  Browser/E2E w gestii parenta; renderer czyta tylko
  typ zdarzenia i boolean (snow spray bez zmian).
