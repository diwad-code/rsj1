# PKG-008 — P42, runda 7: profil zeskoku i model lotu do bramki V

> **ARCHIWUM.** To był wykonawczy prompt rundy 7 (profil zeskoku + realizm
> oprawy), przygotowany 18.09.2026 przed werdyktem użytkownika. Werdykt
> (REPORT.md §11.7) przestawił następną sesję na tryb „zapoznaj się i czekaj
> na listę poprawek", więc aktywny prompt to `docs/handoffs/PKG-008.md`.
> Treść poniżej zostaje jako opis znanego, otwartego zadania.


Pakiet docelowy: PKG-008
Zakres: P42

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git i nie publikuj gry.

## Dosłowna krytyka użytkownika po rundzie 5

> „akceptuje postęp, ale nadal wiele do poprawki. w następnej kolejności proszę
> poprawić proporcje wielkości skoczka do skoczni - w tym realniej wyglądającą
> skocznie i rozbieg - skorzystać do porównania wyglądu i skali prawdziwe
> obiekty, wymiary itd itd - zrób research zanim zaczniesz żeby mieć pewność
> że to co robisz jest zgodne z prawdziwym światem"

Runda 6 (18.09.2026) wykonała z tego: skalę 1:1, geometrię rozbiegu wg FIS
i wymuszone tym poprawki fizyki. Werdyktu na rundę 6 jeszcze nie ma —
**zapytaj o niego, zanim cokolwiek zmienisz.**

## Stan wejściowy

Przeczytaj w tej kolejności:

1. `docs/evidence/PKG-008/REPORT.md` §10 i §11 — dwie ostatnie rundy.
2. `docs/evidence/PKG-008/hill-geometry-fis.md` — research, wyprowadzenie
   geometrii i **gotowy profil zeskoku zgodny z normą**, który czeka na
   wdrożenie.
3. `AGENTS.md` — zasada prostoty, zamrożenie zawartości do czasu bramki V.

Co jest zrobione:

- sylwetka skoczka z brył w układzie narty (`pkg008-jumper-solid-silhouette-1`);
- **kamera 11,6 px/m** — narta 29 px = 2,50 m, zawodnik 21 px = 1,81 m;
- rozbieg, łuk r1 = 100 m, próg t = 6,71 m przy 11°, wysokość progu 3,03 m,
  belki co 0,65 m — wszystko z normy FIS 2018 i certyfikatu Wisły Malinki;
- teren rysowany z bufora okiennego (pomiar: p50 18,0 ms, maks. 20,6 ms na
  pełnym skoku, zero klatek ponad 33 ms);
- fizyka przestrojona (`pkg008-tune-2`): tarcie toru wg normy, wiatr wzdłuż
  zeskoku, poprawiony próg przygotowania lądowania, opór ×1,20, nowe
  współczynniki kompensacji 31/45/46;
- `tests/hillCalibration.test.ts` pilnuje wielkości obserwowalnych.

Sprawdzenia na wejściu: `typecheck` PASS, `npm test` 177/177 PASS,
`build` PASS (~143 kB). Pełny `test:e2e` na tej maszynie jest NIESTABILNY:
22–27 PASS, 1 skipped, 2–7 FAIL, za każdym razem inne testy — opis i pomiary
niżej. Dowody obrazowe i nagrania pochodzą z osobnych, czystych przebiegów
(`z_capture_pkg008.spec.ts` 10/10, `z_capture_pkg008_video.spec.ts` 2/2).

## CO ma być zrobione (nie jak)

### 1. Profil zeskoku do normy — zadanie główne

Zeskok jest **jedynym elementem skoczni, który nadal łamie normę**:
h/n = 0,636 wobec dopuszczalnych 0,550–0,600, a pod progiem ma stok 24°
zamiast realnych ~6°, więc brakuje charakterystycznej płaskiej półki.

Gotowy, policzony profil zgodny z normą jest w `hill-geometry-fis.md` §4.
Jego wdrożenie **nie jest kwestią wklejenia danych**: przy obecnym modelu
lotu daje wynik dwumodalny (belka 8 → 98 m, belka 12 → 155 m, długości
pomiędzy nieosiągalne), bo doskonałość lotu modelu (~1,33) jest niemal równa
1/tan(37°), więc tor jest styczny do prostego odcinka zeskoku.

Do zrobienia: **model aerodynamiczny ma dawać tor, który schodzi na pole
lądowania pod kątem mniejszym niż stok** — tak jak realny zawodnik
(doskonałość 1,5–1,8). Dopiero wtedy profil FIS da sensowne długości.
Kierunki do sprawdzenia (nie nakaz):

- krzywa CL/CD w `src/simulation/aero.ts` jest jawnie oznaczona jako TUNE —
  jej maksymalna doskonałość to dziś 1,62 przy kącie natarcia 20°;
- `referenceAreaSquareMeters` i `dragScale` sterują nośnością i oporem
  niezależnie;
- sprawdź, czy nośność względem ciężaru (dziś ~0,29 przy 25 m/s) nie jest
  zbyt niska wobec realnych 0,5–0,7.

Kryterium: przy profilu FIS długości mają rosnąć **monotonicznie** z belką
i pokrywać zakres mniej więcej 105–135 m, bez skoków rzędu 50 m.

### 2. Realizm oprawy — to, co widać, a czego jeszcze nie ma

Skala jest już prawdziwa, więc widać braki, których wcześniej nie było widać:

- **teren pod zeskokiem to jednolita ciemna plama** — brakuje mu struktury
  (krawędź stoku, zieleń/skały poza pasem śniegu, cień);
- **brak publiczności i barierek wzdłuż zeskoku i wybiegu** — przy 11,6 px/m
  człowiek ma 21 px, więc tłum przy barierce jest teraz możliwy do narysowania
  i jest najsilniejszym dostępnym odniesieniem skali;
- **wieża sędziowska** — norma podaje jej położenie: d = 0,60w…0,80w od progu
  i q = 0,25w…0,50w w bok (dla w = 120 to 72–96 m za progiem);
- **trybuny i góry z tła** były projektowane pod stary zoom i przy skali 1:1
  siedzą wizualnie „na" zeskoku — wymagają przeliczenia albo przerysowania.

### 3. Czego NIE ruszać

- Skala kamery 11,6 px/m i geometria rozbiegu — właśnie wyprowadzone z normy.
- Rozdzielczość 480×270, bitmapowy font, paleta.
- Zero nowej zawartości: jedna skocznia techniczna, żadnych nowych trybów,
  skoczni ani ekranów (zamrożenie z `AGENTS.md` obowiązuje do bramki V).
- **Odbioru VISUAL nie wpisujesz sam.** Akceptuje wyłącznie użytkownik.

## Znane niestabilne testy e2e — przeczytaj, zanim uznasz to za regresję

Testy padają w pełnym przebiegu i przechodzą uruchomione osobno lub w małej
grupie. Dwie klasy przyczyn:

- `jump.spec.ts` — strażnik kosztu przełączenia widoku (`< 12` ticków) i
  pauzy (`< 8`); mierzy też rundy IPC Playwrighta i interwał odpytywania,
  więc na obciążonej maszynie bywa na granicy;
- `z_capture_jump.spec.ts` / `z_capture_pkg008.spec.ts` — wyścig klawiatury
  w menu („menu" zamiast „jump"/„competition").

Zmierzony koszt renderu na pełnym skoku: **p50 18,0 ms, p95 18,8 ms,
maks. 20,6 ms, zero klatek ponad 33 ms** przy odświeżaniu 55,6 Hz — tyle samo
co na ekranie tytułowym, którego ten pakiet nie dotyka. W czasie przebiegów
maszyna miała **0,3 GB wolnego RAM z 7,7 GB**, a zestaw zajmował 7–11,5 min.
Zanim uznasz to za regresję wydajności: powtórz testy osobno i sprawdź pamięć.

## Weryfikacja

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Pełną regenerację dowodów i pełny `test:e2e` rób tylko dla wersji, którą
pokazujesz użytkownikowi — nie po każdej mikro-zmianie. Kolejność dowodów:
pełny `test:e2e` → solo `z_capture_pkg008_video.spec.ts` → **natychmiast**
kopia obu `video.webm` z `playwright-output/` do `docs/evidence/PKG-008/
video-review/` → dopiero potem cokolwiek innego (każdy `playwright test`
czyści `playwright-output`).

## Wynik pakietu

- [ ] Profil zeskoku zgodny z normą (h/n 0,550–0,600, półka ~6° pod progiem)
      ORAZ długości monotoniczne względem belki w zakresie ~105–135 m.
- [ ] `tests/hillCalibration.test.ts` rozszerzony o kontrolę h/n i β0.
- [ ] Teren, publiczność i wieża sędziowska w rzeczywistej skali.
- [ ] Dowody odświeżone z finalnego kodu (fazy, wycinki, oba nagrania).
- [ ] Werdykt użytkownika dopisany dosłownie do REPORT.md.

## Zamknięcie i następna sesja

1. Po całości jedno końcowe auto-review; popraw konkretne usterki.
2. Dopisz sekcję do `docs/evidence/PKG-008/REPORT.md` (nie nowy plik).
3. Werdykt użytkownika dopisz dosłownie do raportu (nowa podsekcja).
4. Jeśli bramka V zaliczona: PKG-008 COMPLETE w `docs/PACKAGE_WORKFLOW.md` /
   `docs/IMPLEMENTATION_PLAN.md`, prompt PKG-009 / P21-H01 w
   `docs/handoffs/PKG-009.md` oraz identycznie w `docs/NEXT_SESSION_PROMPT.md`.
5. Jeśli niezaliczona: archiwizuj ten plik jako
   `docs/handoffs/PKG-008-CONTINUE-08.md` i przygotuj kontynuację
   z dosłowną krytyką.
6. Po handoffie: `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
7. W odpowiedzi: co zmieniło się wizualnie, status bramki V, link do promptu.
