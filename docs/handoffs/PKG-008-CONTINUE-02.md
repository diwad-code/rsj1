# Wykonaj PKG-008 (kontynuacja) — P42, dopracowanie skoczka i kontaktu ze śniegiem do bramki V

Pakiet docelowy: PKG-008 (kontynuacja; poprzedni prompt wykonania jest w
`docs/handoffs/PKG-008-CONTINUE-01.md`, jeśli potrzebujesz dokładnej historii).
Zakres: P42, ten sam co poprzednio — **żadnych nowych parametrów decyzyjnych**, tylko
poprawa konkretnych usterek wizualnych, które użytkownik wskazał po obejrzeniu dowodów.
Następny pakiet po zamknięciu: PKG-009 — P21-H01 (Lillehammer normalna), o ile bramka V
zostanie zaliczona akceptacją użytkownika w tej sesji. Jeśli nie zostanie zaliczona,
następna sesja znów kontynuuje PKG-008.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie inicjalizuj Git
i nie publikuj gry.

## Stan wejściowy — dokładnie to, co się wydarzyło

Poprzednia sesja PKG-008 wykonała pełną przebudowę renderera (rozdzielczość 480×270,
prawdziwa siatka pikseli bez antyaliasingu, bitmapowy font wszędzie, paleta rampowa,
paralaksa tła, dyskretny bank klatek skoczka, cień, scena produkcyjna w powtórce) i
pokazała dowody użytkownikowi. Pełny opis tego, co zostało zrobione i jak, jest w
`docs/evidence/PKG-008/REPORT.md` — **przeczytaj go w całości przed zmianą kodu**, żeby
nie robić tego samego drugi raz ani nie cofać już zaakceptowanych elementów.

### Dosłowna odpowiedź użytkownika na pytanie o bramkę V

> nie. skoczek dalej wygląda jak gruzmoł, nie jak postać którą gra gracz. Nie widać tylu
> V, narty wbijają się w ziemie zamiast sunąć po śniego. to nadal nie wygląda dobrze, ALE
> WYGLĄDA LEPIEJ. kierunek dobry, ale jeszcze dużo do poprawy, zwłaszcza realizm wyglądu
> skoczka i skoczni

### Co to znaczy konkretnie

**Zaakceptowane (nie ruszaj bez nowego powodu):** kierunek ogólny, rozdzielczość 480×270,
prawdziwa siatka pikseli, bitmapowy font, paleta, paralaksa tła, scena produkcyjna w
powtórce. Użytkownik explicite powiedział „wygląda lepiej” — to nie jest odrzucenie całej
pracy poprzedniej sesji, tylko odrzucenie **jakości sylwetki skoczka i jej kontaktu ze
śniegiem**.

**Odrzucone — to jest zakres tej sesji:**

1. **„Skoczek wygląda jak gruzmoł, nie jak postać którą gra gracz.”** Bank klatek
   (`renderJumperFrame` w `src/render/hillView.ts`, ok. linia 985+) rysuje sylwetkę z
   grubych odcinków `pixelLine` (tors, ręce, nogi) w bardzo małej skali
   (`JUMPER_ART_SCALE = { skiPixels: 29, standingPixels: 22 }`) — przy tych proporcjach i
   grubościach kończyny zlewają się w jedną bryłę zamiast czytelnej postaci z głową,
   tułowiem, rękami i nogami. To wymaga realnej redystrybucji proporcji/grubości linii i
   prawdopodobnie mocniejszego zróżnicowania kolorów między segmentami (głowa/kask,
   kombinezon, rękawice, buty), nie tylko przemalowania.
2. **„Nie widać tylu V”** — nowoczesna technika skoku (V-style) wymaga, żeby narty w
   locie rozchodziły się w kształt litery V pod skoczkiem. Obecna geometria
   (`for (const offset of [-1, 1.5]) { ... }` w `renderJumperFrame`) rysuje DWIE PRAWIE
   RÓWNOLEGŁE linie nart (przesunięte tylko o mały offset prostopadły), nie dwie narty
   rozchodzące się pod kątem od siebie. W fazie `flight` (i prawdopodobnie `takeoff`/
   `landingPrep`) narty muszą być rysowane jako dwa oddzielne odcinki, każdy pod własnym
   kątem od linii ciała, rozchodzące się na zewnątrz — sprawdź referencję
   `docs/research/reference-images/sj3-s16.gif` (lot) przed rysowaniem, nie z pamięci.
3. **„Narty wbijają się w ziemię zamiast sunąć po śniegu.”** Dotyczy prawdopodobnie faz
   blisko powierzchni (`inrun`, `outrun`, `landingPrep` końcowe klatki, ewentualnie chwila
   lądowania). Sprawdź, czy linia nart w tych pozach faktycznie leży stycznie do
   `hill.surfaceNormalAt`/kierunku stoku w miejscu stóp, zamiast być rysowana pod kątem
   samego `pitchRad` ciała, który przy pewnych kombinacjach może odchylać narty w głąb
   stoku zamiast wzdłuż niego. Możliwe, że sam kąt jest poprawny fizycznie, ale render
   (grubość/offset/`up` wektor) sprawia wizualne wrażenie „wbijania się” — zweryfikuj na
   wycinku 1:1 (patrz niżej), nie na całym zrzucie.

Użytkownik dodał „zwłaszcza realizm wyglądu skoczka **i skoczni**” — po naprawieniu
skoczka zerknij też na ogólną wiarygodność konturu skoczni (rozbieg/zeskok/stadion) w
świetle referencji, ale to drugoplanowe: większość konkretnej krytyki dotyczyła skoczka.

## Twarde zasady wykonania

Stosuj `AGENTS.md` w całości, w tym zasadę prostoty i zamrożenie zawartości. Dodatkowo,
z poprzedniej sesji (nadal obowiązują):

1. **To dalej przebudowa oprawy, nie nowa zawartość.** Jedna skocznia techniczna, zero
   nowych obiektów/trybów. Zamrożenie zawartości z AGENTS.md nadal obowiązuje aż do
   zaliczenia bramki V.
2. **Zasady sportowe, fizyka i wynik nie zmieniają się.** `sportMarkers.ts` generator
   zostaje nietknięty. Zapis i replay (format danych) nie zmieniają się.
3. **Nie zaczynaj od zera.** Renderer istnieje i w większości działa dobrze (użytkownik
   to potwierdził). To sesja punktowej naprawy sylwetki skoczka, nie kolejny pełny
   rewrite `hillView.ts`.
4. **Iteracyjna praca wizualna, nie jedna ślepa próba.** Skoczek to pixel art w bardzo
   małej skali (22-29 px) — dopracowanie go wymaga cyklu: zmień geometrię → zbuduj →
   zrób wycinek 1:1 powiększony ×6 (wzorzec w
   `tests/browser/z_capture_pkg008.spec.ts`, sekcja „wycinki 1:1”) → obejrzyj → popraw.
   Nie pokazuj użytkownikowi kolejnej wersji bez własnego przeglądu wycinka 1:1 najpierw.
5. **VISUAL zalicza wyłącznie użytkownik.** Model nie wpisuje PASS w VISUAL. Jeśli
   użytkownik znów nie zaakceptuje, pakiet zostaje INCOMPLETE i następna sesja go
   kontynuuje z dokładnym zapisem, co tym razem odrzucił.
6. Domyślnie pracuj jednym modelem, bez dodatkowych agentów-recenzentów, chyba że
   użytkownik wyraźnie zleci inaczej.

## Stan wejściowy (weryfikacja techniczna z poprzedniej sesji)

- `npm run typecheck` PASS.
- `npm test` PASS — **23 pliki, 168/168** testów, bez zmian (P42 nie dotyka
  fizyki/punktacji/zapisu — musi tak zostać).
- `npm run build` PASS — Vite, 32 moduły, JS 137,38 kB / 43,67 kB gzip.
- `npm run test:e2e` — 28 testów zebranych, finalnie 21/28 PASS. Sześć niepowodzeń to
  udokumentowana w `docs/evidence/PKG-008/REPORT.md` §5 flakiness obciążenia
  sekwencyjnego zestawu (potwierdzona jako pre-existing przez izolowane przebiegi) —
  nie traktuj jej jako otwartego zadania tej sesji, ale **jeśli uruchamiasz
  `test:e2e`, ścieżki dowodów są już poprawnie ustawione na
  `docs/evidence/PKG-008/browser-artifacts/`** (poprzednia sesja to naprawiła), więc
  ten konkretny krok nie jest już potrzebny.
- Poprzednia sesja naprawiła też dwa realne błędy wydajności renderera (cache warstw
  tła i konturu skoczni) — opisane w REPORT.md §4. Nie cofaj tych zmian.

## Potrzebna lektura

1. `docs/evidence/PKG-008/REPORT.md` — co zrobiono i jak, z liniami kodu.
2. `AGENTS.md` — zasada prostoty i zamrożenia zawartości.
3. `src/render/hillView.ts`, sekcja „P42: bank klatek skoczka” (ok. linia 1015+) —
   `jumperPose`, `jumperFrame`, `bucketAngle`, `renderJumperFrame`, `drawPixelHead`.
4. `docs/research/reference-images/sj3-s16.gif`, `sj3-s0A.gif` (sylwetka i wybicie SJ3),
   `dsj2-screenshot2.jpg`/`dsj2-screenshot3.jpg` (cień, kontrast, ale nie sylwetka —
   DSJ2 pokazuje skoczka od tyłu, nie kopiuj stamtąd kształtu) — **obejrzyj pliki
   bezpośrednio, nie oceniaj z pamięci.**
5. `docs/ART_UI_AUDIO.md` §2 i §6 (zakres 36-48/48-68 px, budżet klatek, zasada
   „bank ręcznie poprawionych pozycji, bez ciągłego obracania z antyaliasingiem”).

## Wynik pakietu

- [ ] Sylwetka skoczka czytelna jako postać (głowa/tułów/ręce/nogi rozróżnialne), nie
      jednolita bryła — popraw proporcje/grubości/kolory w `renderJumperFrame`.
- [ ] Narty w locie (i ewentualnie wybiciu/przygotowaniu lądowania) rysowane jako dwa
      rozchodzące się odcinki (V-style), nie dwie prawie równoległe linie.
- [ ] Narty w fazach bliskich śniegu (rozbieg/odjazd/tuż przed kontaktem) wizualnie leżą
      na powierzchni stoku, nie „wbijają się” w nią — zweryfikowane na wycinku 1:1.
- [ ] Szybki przegląd ogólnej wiarygodności konturu skoczni względem referencji SJ3/DSJ2
      (drugoplanowe, tylko jeśli starczy czasu po naprawie skoczka).
- [ ] Fizyka, punktacja, zapis, replay — bez zmian (potwierdź `sportMarkers.ts`
      nietknięty i 168/168 testów jednostkowych bez zmian).

## Weryfikacja

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

`npm test`/`npm run typecheck` muszą zostać zielone bez zmiany liczby testów (168).
`test:e2e` — patrz uwaga o pre-existing flakiness wyżej; nie goń za 28/28, ale sprawdź w
izolacji każdy nowy failure, żeby odróżnić realną regresję od znanego wzorca.

Wymagane nowe dowody w `docs/evidence/PKG-008/` (dopisz, nie nadpisuj poprzednich plików
`pkg008-*` bez potrzeby): zaktualizowany wycinek 1:1 skoczka (×6) w locie pokazujący V-style,
zaktualizowany wycinek skoczka blisko śniegu (rozbieg lub odjazd) pokazujący kontakt nart z
powierzchnią, oraz pełny zrzut fazy `flight-mid` i `outrun` do porównania z poprzednią wersją.

## Granice i ryzyka

- To naprawa jakości sylwetki, nie nowa mechanika ani nowe parametry rozdzielczości/
  palety/kamery — te są już zdecydowane i zaakceptowane, nie pytaj o nie ponownie.
- Jeśli w trakcie pracy okaże się, że poprawa sylwetki wymaga zmiany
  `JUMPER_ART_SCALE`/kamery w stopniu wykraczającym poza to, co tu opisane (np.
  większy skoczek niż zakres 36-48/48-68 px z ART_UI_AUDIO §2) — zatrzymaj się i zapytaj
  użytkownika, to może być ósma decyzja, nie oczywisty wybór modelu.
- Materiały referencyjne SJ3/DSJ2 zostają w `docs/research/`, poza `public/` i poza
  buildem.
- Bramka V wymaga rzeczywistej odpowiedzi użytkownika na nowe dowody — self-review nie
  wystarcza.

## Procedura wznowienia po przerwaniu

Sprawdź stan dysku i `docs/evidence/PKG-008/` (nowe pliki `pkg008-*` z tej sesji obok
starych). Uruchom `npm run typecheck` oraz `npm test`. Kontynuuj od pierwszego
niewykonanego punktu listy w „Wynik pakietu”. Jeśli bramka V znów nie zostanie zaliczona,
przygotuj kolejną kontynuację PKG-008 (archiwizuj ten plik jako
`docs/handoffs/PKG-008-CONTINUE-02.md` przed nadpisaniem) z dokładnym zapisem nowej
odpowiedzi użytkownika.

## Zamknięcie i następna sesja

1. Po wykonaniu listy z „Wynik pakietu” wykonaj jedno końcowe auto-review.
2. Zaktualizuj `docs/evidence/PKG-008/REPORT.md` (nie twórz nowego pliku) o nową sekcję
   z wynikami tej sesji i dosłowną nową odpowiedzią użytkownika.
3. Jeśli bramka V zaliczona: zaktualizuj status PKG-008 na COMPLETE w
   `docs/PACKAGE_WORKFLOW.md`/`docs/IMPLEMENTATION_PLAN.md` i przygotuj prompt PKG-009 /
   P21-H01 (Lillehammer normalna) w `docs/handoffs/PKG-009.md` oraz identycznie w
   `docs/NEXT_SESSION_PROMPT.md`.
4. Jeśli bramka V niezaliczona: przygotuj kolejną kontynuację PKG-008 z dokładnym stanem
   odbioru (jak ten plik zrobił dla poprzedniej odpowiedzi).
5. Po handoffie uruchom raz
   `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
6. W odpowiedzi końcowej podaj: co zmieniło się wizualnie względem poprzedniej sesji,
   czy użytkownik zaakceptował, i link do aktywnego promptu.
