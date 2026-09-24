# PKG-008 — P42, runda 7: zapoznanie się ze stanem i oczekiwanie na listę poprawek

Pakiet docelowy: PKG-008
Zakres: P42

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git i nie publikuj gry.

## Twoje zadanie w tej sesji

To jest **prompt zapoznawczy, nie wykonawczy**. Użytkownik przyjął dotychczasowy
postęp i zapowiedział własną listę poprawek, którą poda w rozmowie.

1. Przeczytaj materiały z sekcji „Stan wejściowy" i zbuduj sobie obraz tego, co
   jest zrobione i jak działa scena.
2. Obejrzyj **narzędziem do obrazów** aktualne dowody (lista niżej) — masz
   wiedzieć, jak gra wygląda dzisiaj, zanim usłyszysz, co poprawić.
3. Napisz krótkie (kilkanaście linii) podsumowanie: co widzisz na dowodach, co
   według Ciebie jest mocne, a co słabe, i jakie masz pytania.
4. **Zatrzymaj się i poczekaj na listę poprawek od użytkownika.**

### Czego NIE robić przed otrzymaniem listy

- Nie zmieniaj żadnego pliku w `src/`, `tests/` ani `docs/`.
- Nie uruchamiaj `npm run test:e2e` ani nie regeneruj dowodów „na rozgrzewkę" —
  pełny zestaw zajmuje 7–11 minut i kasuje `playwright-output`.
- Nie wybieraj sobie zakresu sam i nie proponuj wielkiego planu przebudowy.
  Obserwacje zapisz jako listę spostrzeżeń, nie jako zadania do wykonania.
- Odbioru VISUAL nie wpisujesz sam. Akceptuje wyłącznie użytkownik.

Dopiero po otrzymaniu listy: wykonaj dokładnie to, co na niej jest, w kolejności
którą poda użytkownik, i dopiero wtedy uruchamiaj pełną weryfikację.

## Stan wejściowy

Przeczytaj w tej kolejności:

1. `AGENTS.md` — zasada prostoty, jedno review po pakiecie, zamrożenie
   zawartości do czasu zaliczenia bramki V.
2. `docs/evidence/PKG-008/REPORT.md` §10 i §11 — dwie ostatnie rundy wraz
   z werdyktami użytkownika (§10.7 i §11.7).
3. `docs/evidence/PKG-008/hill-geometry-fis.md` — research FIS, wyprowadzenie
   geometrii, pomiary i opis jednego świadomie NIEwdrożonego elementu.

Obejrzyj dowody (`docs/evidence/PKG-008/browser-artifacts/`):

- fazy: `pkg008-phase-gategreen/inrun/takeoff/flight-early/flight-mid/
  flight-late/landingprep/telemark/outrun/finishline-960x540.png`;
- wycinki ×6: `pkg008-crop-skoczek-belka/-rozbieg/-wybicie/-lot/-ladowanie/
  -telemark-upscaled6x.png` oraz `pkg008-crop-skoczek-upscaled6x.png`;
- nagrania: `docs/evidence/PKG-008/video-review/` (pełny skok człowieka,
  fragment konkursu z botami).

Materiał porównawczy jest w `docs/research/reference-images/`: cztery zdjęcia
prawdziwych skoczków, klatki z Ski Jump International 3 (`sj3-s0A.gif`,
`sj3-s16.gif`), zrzuty Deluxe Ski Jump 2 i strony normy FIS.

### Co jest zrobione

Runda 5 — sylwetka zawodnika:

- bank klatek budowany z brył w układzie narty, nie z kresek
  (`JUMPER_ART_VERSION = 'pkg008-jumper-solid-silhouette-1'`);
- kuc na rozbiegu, ręce wzdłuż tułowia, telemark z rękami dla równowagi,
  obrys 1 px z maski alfa, subtelne V tylko przy czubkach nart.

Runda 6 — proporcje i geometria:

- **kamera 11,6 px/m** (przedtem 2,075): narta 29 px = 2,50 m, zawodnik
  21 px = 1,81 m; w kadrze 41 × 23 m świata zamiast 231 × 130;
- rozbieg wg normy FIS 2018 i certyfikatu Wisły Malinki HS134: prosta 35°,
  łuk r1 = 100 m, próg 6,71 m przy 11°, wysokość progu 3,03 m, belki co 0,65 m;
- pas śniegu o grubości w metrach, próg jako obiekt, znaczniki i pasy sektorowe
  w skali rzeczywistej, paralaksa ze składową pionową;
- teren rysowany z bufora okiennego (pomiar: p50 18,0 ms, p95 18,8 ms,
  maks. 20,6 ms na pełnym skoku, zero klatek powyżej 33 ms przy 55,6 Hz);
- fizyka przestrojona (`physicsVersion` → `pkg008-tune-2`): tarcie toru wg
  normy, wiatr wiejący wzdłuż zeskoku zamiast poziomo, poprawiony moment
  przygotowania lądowania, opór w locie ×1,20, współczynniki kompensacji
  31 / 45 / 46 dziesiątych punktu;
- `tests/hillCalibration.test.ts` pilnuje wielkości obserwowalnych wobec normy
  i certyfikatu, a nie samych stałych modelu.

### Znane, świadomie otwarte

**Profil zeskoku nie jest zgodny z normą**: h/n = 0,636 wobec dopuszczalnych
0,550–0,600, a pod progiem ma stok 24° zamiast realnych ~6°. Gotowy, policzony
profil zgodny z normą leży w `hill-geometry-fis.md` §4, ale po wdrożeniu daje
wynik dwumodalny (belka 8 → 98 m, belka 12 → 155 m), bo doskonałość lotu modelu
(~1,33) jest niemal równa 1/tan(37°) i tor jest styczny do stoku. Naprawa
wymaga przebudowy modelu aerodynamicznego. **To jest informacja o stanie, nie
zadanie na tę sesję** — rusz to tylko, jeśli użytkownik wpisze to na listę.

### Znane niestabilne testy e2e

Pełny `test:e2e` na tej maszynie daje 22–27 PASS, 1 skipped i 2–7 FAIL, za
każdym razem inne testy; każdy przechodzi uruchomiony osobno lub w małej grupie.
Dwie klasy przyczyn, obie zewnętrzne wobec kodu pakietu:

1. strażniki wydajności w `jump.spec.ts` (`< 12` ticków na przełączenie widoku,
   `< 8` na pauzę) mierzą także rundy IPC Playwrighta i interwał odpytywania;
2. gubione zdarzenia klawiatury w przejściach menu („menu" zamiast „jump").

W czasie przebiegów maszyna miała 0,3 GB wolnego RAM z 7,7 GB, a zestaw
zajmował 7–11,5 min. Zanim uznasz to za regresję: powtórz testy osobno
i sprawdź pamięć.

Sprawdzenia na wejściu: `npm run typecheck` PASS, `npm test` 177/177 PASS,
`npm run build` PASS (~144 kB). Dowody obrazowe i nagrania pochodzą z osobnych,
czystych przebiegów (`z_capture_pkg008.spec.ts` 10/10,
`z_capture_pkg008_video.spec.ts` 2/2).

## Twarde granice

1. Zero nowej zawartości: jedna skocznia techniczna, żadnych nowych trybów,
   skoczni ani ekranów — zamrożenie z `AGENTS.md` obowiązuje do bramki V.
2. Rozdzielczość 480×270, bitmapowy font i paleta są zaakceptowane.
3. Skala kamery 11,6 px/m i geometria rozbiegu pochodzą wprost z normy FIS —
   zmieniaj je tylko, jeśli użytkownik wyraźnie o to poprosi.
4. Fizyka, punktacja, zapis i replay: zmieniaj wyłącznie wtedy, gdy poprawka
   z listy tego wymaga, i powiedz o tym wprost przed zmianą.
5. Odbioru VISUAL nie wpisujesz sam.

## Wynik pakietu

- [ ] Stan przeczytany, dowody obejrzane, podsumowanie napisane.
- [ ] Lista poprawek od użytkownika otrzymana i wykonana w całości.
- [ ] Sprawdzenia z sekcji „Weryfikacja" zaliczone dla wersji pokazywanej
      użytkownikowi.
- [ ] Dowody odświeżone z finalnego kodu (fazy, wycinki, oba nagrania).
- [ ] Werdykt użytkownika dopisany dosłownie do `REPORT.md`.

## Weryfikacja

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Uruchamiaj to dopiero po wykonaniu poprawek, dla wersji, którą pokazujesz
użytkownikowi — nie po każdej mikro-zmianie. Kolejność dowodów: pełny
`test:e2e` → solo `z_capture_pkg008_video.spec.ts` → **natychmiast** kopia obu
`video.webm` z `playwright-output/` do `docs/evidence/PKG-008/video-review/` →
dopiero potem cokolwiek innego (każdy `playwright test` czyści
`playwright-output`).

## Zamknięcie i następna sesja

1. Po wykonaniu listy jedno końcowe auto-review; popraw konkretne usterki.
2. Dopisz sekcję do `docs/evidence/PKG-008/REPORT.md` (nie nowy plik):
   co zmieniłeś, z czym porównałeś, jaki był efekt.
3. Werdykt użytkownika dopisz dosłownie do raportu (nowa podsekcja).
4. Jeśli bramka V zaliczona: PKG-008 COMPLETE w `docs/PACKAGE_WORKFLOW.md` /
   `docs/IMPLEMENTATION_PLAN.md`, prompt PKG-009 / P21-H01 w
   `docs/handoffs/PKG-009.md` oraz identycznie w `docs/NEXT_SESSION_PROMPT.md`.
5. Jeśli niezaliczona: archiwizuj ten plik jako
   `docs/handoffs/PKG-008-CONTINUE-08.md` i przygotuj kontynuację
   z dosłowną krytyką.
6. Po handoffie: `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
7. W odpowiedzi: co zmieniło się wizualnie, status bramki V, link do promptu.
