---
name: ski-jump-aero
description: "Sciaga z aerodynamiki i mechaniki skoku dla retro-ski-jumping. Uzyj przy strojeniu lotu, wiatru, wybicia i telemarku: rownania, konwencje znakow, przedzialy TUNE i sposob walidacji tabelami symulacji."
---

# ski-jump-aero — mechanika skoku (adaptacja gry)

Zrodlo prawdy: `docs/GAMEPLAY_SPEC.md` rozdz. 2–5. Ponizsze to skrot do
pracy, nie zastepstwo specyfikacji. Kazda zmiana wyniku podnosi
`physicsVersion` / `rulesVersion` / `hillVersion`.

## Model lotu (gra, nie wierna fizyka zawodnika)

- Jednostki SI: m, s, m/s, radiany. Os x w prawo, y do gory.
- Krok staly `dt = 1/120 s`, integracja semi-implicit Euler.
- Predkosc wzgledem powietrza: `vAir = vJumper − vWind`.
- Opor przeciwny do `vAir`, sila nosna prostopadla:
  `F = 0,5 × rho × speed² × area × coefficient`.
- `CL/CD` to ograniczone krzywe pozycji i kata natarcia; nadmierne
  pochylenie pogarsza lot. Gracz steruje docelowym pitchem i tempem zmian.
- Kontakt: przeciecie odcinka nart/stop z profilem w obrebie ticka
  (nie test samej koncowej pozycji) + normalna stoku.

## Konwencje wiatru (najczestszy blad)

- UI: dodatni = pod narty, ujemny = w plecy.
- Fizyka: x dodatnie w kierunku lotu, wiec wiatr pod narty ma
  **ujemne `windVelocityX`**. Adapter zapisuje obie konwencje.
- Agregat P10: srednia wazona czujnikow 45/95/130 m, wagi
  0,25/0,45/0,30, okno wybicie→pomiar. Status ADAPT.

## Przedzialy TUNE (poszukiwania, nie stale)

| Parametr | Przedzial |
|---|---|
| Czas wybicia | 0,16–0,26 s |
| Korekta pitch | 35–70 °/s |
| Przygotowanie telemarku | 0,20–0,35 s |
| Przygotowanie ladowania rownoleglego | 0,12–0,22 s |

Kazdy test zapisuje uzyty zestaw. Predkosc ladowania ~130 km/h to
obserwacja, nie cel strojenia (P13–P15 nie przestrajaja fizyki bez potrzeby).

## Walidacja

- Wektory kontrolne punktacji: GAMEPLAY_SPEC §5.4 (K120/130 m → 78,0 pkt
  dlugosci; noty 18,0;18,5;19,0;18,5;18,0 → 55,0 stylu; kontakt
  132,49/132,50 → 132,0/132,5 m).
- Po zmianie fizyki: nowe tabele symulacji, nie edycja dowodow PKG-002/003.
- Balans strukturalny: `evaluating-gameplay-balance`
  (polityka monotoniczna vs eksploracyjna, deterministyczne seedy).

## Intuicje z literatury (pomocnicze, NIE stale gry)

Badania tunelowe (m.in. Barnes/Tuplin/Walker 2025; Seo i in.; Meile i in.)
potwierdzaja strukture modelu: CL/CD rosna z katem natarcia do ~30°,
potem opor rosnie dalej a nosna sie nasyca; L/D typowo ~1,5; V-style
zwieksza powierzchnie nosna. Optimum dystansu to NIE maksimum L/D ani
maksimum nosnej osobno: tuz po wybiciu liczy sie L/D (trzymanie predkosci),
pod koniec lotu — nosna. Uzyj jako intuicji do ksztaltu krzywych CL/CD,
nie kopiuj liczb do gry.
