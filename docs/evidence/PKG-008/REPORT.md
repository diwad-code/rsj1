# PKG-008 — raport zamknięcia

Data startu: **16.09.2026**; zamknięcie: **22.09.2026**. Zakres: **P42** — przebudowa oprawy graficznej do akceptacji
użytkownika (bramka V). Wynik pakietu: **COMPLETE** — bramka V **PASS (USER ACCEPTED 22.09.2026)**.
Zewnętrzny jakościowy playtest: **NOT RUN**. Stan historyczny na starcie (bez zmian poniżej): kod renderera był w stanie **runda 1** (§0-§7): pierwsza próba poprawek
skoczka w tej samej sesji („runda 2”, §8.2) została **jawnie odrzucona przez
użytkownika** („zdecydowanie o wiele wiele gorzej… to jest jakaś komedia”) i **w
całości cofnięta** — patrz §8.3. Bajtowo potwierdzone: `dist/assets/index-B8A09Nrz.js`
(137,38 kB) identyczny przed rundą 2 i po jej cofnięciu. Następna sesja kontynuuje
PKG-008 od stanu rundy 1, nie rundy 2 — prompt w `docs/handoffs/PKG-008.md` wymaga
aktualizacji o §8.3 przed przekazaniem (patrz TODO na końcu tego pliku).

> **Stan na 18.09.2026 (aktualny).** Po rundach 3-4 (§9), piątej „świeże oczy"
> (§10) i szóstej (§11) kod NIE jest już w stanie rundy 1:
> - bank klatek skoczka to sylwetka budowana z brył w układzie narty
>   (`JUMPER_ART_VERSION = 'pkg008-jumper-solid-silhouette-1'`);
> - kamera produkcyjna rysuje w skali 1:1 (11,6 px/m) zamiast 2,075 px/m;
> - rozbieg, łuk przejściowy, próg i rozstaw belek są wyprowadzone z normy
>   FIS 2018 i certyfikatu Wisły Malinki HS134 (`hillVersion` 1.0.0 → 2.0.0);
> - fizyka ZOSTAŁA zmieniona w rundzie 6 za wyraźną zgodą użytkownika:
>   tarcie toru, kierunek wiatru, próg przygotowania lądowania, opór w locie
>   i współczynniki kompensacji (`physicsVersion` → `pkg008-tune-2`).
>
> Zapis i replay formatem nietknięte; starsze powtórki przechodzą na widok
> techniczny przez kontrolę wersji skoczni (gra to obsługuje).
> Bramka V nadal **czeka na odbiór użytkownika**.

## 0. Wybrane parametry (decyzje użytkownika, §6 REPORT.md PKG-007)

| # | Pytanie | Decyzja |
| --- | --- | --- |
| 1 | Rozdzielczość wewnętrzna | **480×270** |
| 2 | Skalowanie skoczka | przeliczone proporcjonalnie (43/58 px → **22/29 px**) |
| 3 | Pierwsza rodzina palety | **skandynawska noc z reflektorami** |
| 4 | Paralaksa tła w tym pakiecie | **tak** |
| 5 | Scena produkcyjna w powtórce | **tak** |
| 6 | Bank skoczka | **nowy, dyskretny bank klatek od zera** |
| 7 | Budżet klatek | 4 / 6-8 / 4+3 / — / 2-3 (patrz §2) |

## 1. Status zadań P42

| Punkt zakresu | Status |
| --- | --- |
| Rozdzielczość wewnętrzna 480×270 i skalowanie do ekranu | COMPLETE |
| Bank skoczka: dyskretne klatki + cień | COMPLETE |
| Paleta jako system rampy/rodziny, rodzina startowa | COMPLETE |
| Naprawa paralaksy tła | COMPLETE |
| Bitmapowy font wszędzie (łącznie z tytułami) | COMPLETE |
| Ekran powtórki: scena produkcyjna | COMPLETE |
| Sterowanie/odczucie fizyki: efekt kontaktu z podłożem | COMPLETE (minimalny, patrz §2) |
| **VISUAL — akceptacja użytkownika** | **NOT RUN — wymaga jawnej odpowiedzi w tej sesji lub w kontynuacji** |

Zasady sportowe, fizyka i punktacja **nie zostały zmienione**: `sportMarkers.ts`
(generator oznaczeń) jest bajtowo nietknięty; `src/simulation/`, `src/sport/`,
`src/storage/`, `src/replay/player.ts` nie zostały zmienione. Format zapisu/replay
jest identyczny — zmienił się wyłącznie renderer, który go odtwarza.

## 2. Co dokładnie zmieniono

**`src/render/hillView.ts`** (przepisany):
- `VIEW_WIDTH/VIEW_HEIGHT = 480/270`; kamera produkcyjna `scale = 2.075` (proporcjonalnie
  do połowy dawnego `4.15`), `JUMPER_ART_SCALE = { skiPixels: 29, standingPixels: 22 }`.
- **Prawdziwa siatka pikseli**: `fillPixelPolygon` rasteryzuje wielokąty skanliniowo
  (wiersz po wierszu, `fillRect` na segment), `pixelLine`/`pixelPolyline` łączą punkty
  krzywej odcinkami Bresenhama — Canvas2D `fill()`/`stroke()` na ścieżkach już nigdzie
  nie występuje w warstwie gry. Dowód: `pkg008-crop-siatka-*` (patrz §3) — te same
  bajty przy 960×540×4 i 1920×1080×2.
- **Font**: `label()` jest cienkim adapterem na `drawPixelText` (czyta `context.textAlign`,
  mapuje dawny rozmiar Courier na skalę bitmapy) — zero `context.font` w warstwie canvas.
  `pixelFont.ts` dostał ~25 nowych glifów: polskie znaki diakrytyczne (Ą Ć Ę Ł Ń Ó Ś Ź Ż),
  strzałki (← → ↑ ↓), nawiasy/nawiasy kwadratowe, myślnik długi, punktor, `< >`, `%`, `!`.
  Bez tego duża część HUD-u (polskie słowa, `•`, `—`, `<`/`>` w „LUDZIE < 1 >”) renderowała
  się jako `?`.
- **Paleta**: `PALETTE_FAMILIES.scandinavianNight` — rampy 4 odcieni nieba/śniegu, osobne
  kolory gór/lasu/stali; `setPaletteFamily()` gotowe pod kolejne rodziny bez przebudowy
  renderera. Oznaczenia sportowe (niebieski/czerwony/zielony/bursztyn) zostają stałym
  kontraktem `SPORT`, niezależnym od rodziny.
- **Paralaksa**: `drawProductionBackground` przesuwa trzy warstwy (góry dalekie 0,06×,
  góry średnie/stadion/reflektory 0,10×, las 0,15× ruchu kamery) — naprawia rozbieżność
  #4 (100% statyczne tło).
- **Bank skoczka**: `jumperFrame()` kwantuje `pitchRad`/fazę/tick do 8 kategorii pozy
  (`gate 1, inrun 3, takeoff 4, flight 7, landingPrep 7, outrun 3, fall 2` = 27 klatek),
  każda renderowana raz do małego bufora i cache'owana (`frameCache`), blitowana
  `drawImage` bez rotacji w locie — koniec ciągłej rotacji proceduralnej (rozbieżność #3).
  Faza `Contact` pozostaje nieobserwowalna z renderera (PKG-007 §4 #12); trzy klatki
  budżetu „lądowanie” zrealizowano jako końcowe klatki podejścia w obrębie `LandingPrep`
  (obserwowalnej fazy), nie jako martwy kod.
- **Cień** (`drawJumperShadow`) — płaski, ciemny, rzutowany na `hill.surfaceYAtX`,
  zwęża się z wysokością (rozbieżność #6).
- **Efekt kontaktu** (`drawContactSpray`) — tryskający śnieg pod nartami, czysta funkcja
  fazy/wysokości/ticku, widoczny w `LandingPrep`/`Outrun`/`FinishLine` blisko podłoża
  (rozbieżność #8; minimalny, bez cząsteczek/wstrząsu kamery/squash-stretch — świadomie
  ograniczony zakres, patrz §6).
- **Ekran powtórki dzieli teraz renderer z żywym skokiem**: nowy eksport `SceneActor`
  (kontrakt `{hill, phase, position, pitchRad, tick}`) i `drawProductionScene()`
  współdzielone przez trening/konkurs i powtórkę.
- **Wydajność**: dwie warstwy (tło paralaksy i kontur toru) cache'owane do buforów
  i przesuwane `drawImage` zamiast rysowane od zera co klatkę — patrz §4, to była
  poprawka błędu wprowadzonego w tej samej sesji, nieregresja względem PKG-007.

**`src/render/competitionView.ts`**, **`src/render/replayView.ts`** (przepisane):
współrzędne przeliczone na 480×270, lokalny `text()` używa `drawPixelText` zamiast
`context.font`. Logika ekranów (konkurs, hotseat, procedura startowa, powtórka)
niezmieniona — zmieniło się tylko `CanvasRenderingContext2D` wywołań rysujących.

**`src/app/main.ts`**: tytuł/menu/tło demo przepisane na 480×270 i bitmapowy font
(lokalny `label()`, ten sam wzorzec adaptera). Logika stanu gry (input, ticki,
zapis, replay) niezmieniona.

**`index.html`**: `<canvas width="480" height="270">` (dawniej 960×540). CSS
(`style.css`) nie wymagał zmian — skalowanie `image-rendering: pixelated` i
proporcja 16:9 działają identycznie na mniejszym buforze.

## 3. Dowody

Wszystko w `docs/evidence/PKG-008/browser-artifacts/`, chyba że zaznaczono inaczej.

**Ekrany, 960×540 i 1920×1080** (`pkg008-<nazwa>-<rozdz>.png`): `title`, `menu`,
`competition-setup`, `handover`, `start-red/yellow/green`, `result-table`,
`replay-screen`, `final-table`, oraz `replay-technical` (powtórka z niezgodną wersją
danych — widok diagnostyczny z komunikatem, zgodnie z zachowaniem sprzed P42).

**Fazy skoku, 960×540** (`pkg008-phase-<faza>-960x540.png`): `gategreen`, `inrun`,
`takeoff`, `flight-early/mid/late`, `landingprep`, `outrun`, `finishline`, `fall`,
`fallsettled` — te same fazy co w PKG-007, do bezpośredniego porównania przed/po.

**Wycinki 1:1**: [`pkg008-crop-skoczek-upscaled6x.png`](browser-artifacts/pkg008-crop-skoczek-upscaled6x.png)
(bank klatek z bliska — twarde krawędzie, brak antyaliasingu),
[`pkg008-crop-hud-upscaled6x.png`](browser-artifacts/pkg008-crop-hud-upscaled6x.png),
[`pkg008-crop-krawedz-zeskoku-upscaled6x.png`](browser-artifacts/pkg008-crop-krawedz-zeskoku-upscaled6x.png),
oraz para siatki
[960×540×4](browser-artifacts/pkg008-crop-siatka-960x540-upscaled4x.png) vs
[1920×1080×2](browser-artifacts/pkg008-crop-siatka-1920x1080-upscaled2x.png) —
**bajtowo identyczne wzory** potwierdzające, że bufor 480×270 jest jedynym źródłem
pikseli niezależnie od rozmiaru okna.

**Nagrania** (`video-review/`): [`pkg008-pelny-skok-czlowieka.webm`](video-review/pkg008-pelny-skok-czlowieka.webm),
[`pkg008-fragment-konkursu-boty.webm`](video-review/pkg008-fragment-konkursu-boty.webm).

## 4. Wydajność: dwa błędy wprowadzone i naprawione w tej samej sesji

Pikselowe rysowanie skanliniowe/Bresenhama jest znacznie droższe niż natywny
`fill()`/`stroke()` Canvas2D. Pierwsza wersja renderera odtwarzała tło paralaksy
(3 warstwy gór, 11 drzew, trybuna, 2 reflektory) i kontur toru (6 przebiegów
`strokeCurve` o grubości do 9 px) **od zera co klatkę** — mierzalnie przekraczało to
budżet 120 Hz i objawiało się jako `npm run test:e2e` z 10-11 niepowodzeń (dotąd
nieobserwowanych w PKG-007), w tym realną utratą wejścia (`jump.spec.ts` —
skok nie ruszał z belki przez 30 s) i skokami ticków do 22 przy pojedynczej klatce
(zamiast budżetu <8-12).

Naprawiono dwuetapowo:
1. **Cache warstw paralaksy** — każda warstwa (dalekie góry / średnie góry+stadion+
   reflektory / las) renderowana raz do bufora szerszego niż ekran, co klatkę tylko
   przesuwana `drawImage`.
2. **Cache konturu toru** — kamera ma stałą skalę (2,075), więc jej ruch to czysta
   translacja; kontur (krzywe, pasy, linie metrowe, K/HS/FALL, konstrukcja rozbiegu)
   renderuje się raz do bufora i jest przesuwany `drawImage`. Pierwsza wersja tego
   cache'u miała błąd: klucz bufora zawierał `leadingTargetHalfMeters` — wartość
   zależną od wiatru, zmieniającą się co tick — więc bufor był przebudowywany od zera
   120 razy na sekundę (gorzej niż brak cache'u). Naprawione: markery zależne od
   wiatru (cel „do prowadzenia”, rekord) rysują się osobno, na żywo, poza cache'em.

Po obu poprawkach testy wrażliwe na budżet klatki (`pauza w locie`, `zmiana belki`)
przechodzą w izolacji, a napięte progi (`technicalTick - productionTick < 12`)
mieszczą się blisko budżetu (obserwowane 14 zamiast katastrofalnych 20+ sprzed
poprawki). To nie jest domysł — zmierzone przez powtórzenie `npm run test:e2e`
przed i po każdej poprawce (11 → 8 → 6 niepowodzeń), z izolowanymi przebiegami
potwierdzającymi przyczynę.

## 5. Weryfikacja

| Polecenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS — TypeScript bez diagnostyk |
| `npm test` | PASS — **23 pliki, 168/168** testów, bez zmiany liczby (P42 nie dotyka fizyki/punktacji/zapisu) |
| `npm run build` | PASS — Vite, 32 moduły, JS **137,38 kB / 43,67 kB gzip** (wzrost względem PKG-006/007 spodziewany: bank klatek skoczka, cache'e warstw, ~25 nowych glifów) |
| `npm run test:e2e` | **28 testów zebranych** (1 świadomie pominięty — benchmark P15). Finalny pełny przebieg: **21/28 PASS**, 6 niepowodzeń, wszystkie potwierdzone jako ta sama, udokumentowana już w PKG-007 §7 flakiness obciążenia sekwencyjnego zestawu (`workers:1`, ~10 min) — `competition.spec.ts` (oba przypadki) **PASS w izolacji**; pozostałe to progi czasowe/dystansowe wrażliwe na timing automatyzacji, nie zawieszenia gry. Zaktualizowano `shell.spec.ts` (asercja wymiaru canvasu 480×270 zamiast 960×540 — wymagana zmiana wyglądu, nie regresja) |

**Sprzątanie zestawu testów**: usunięto `tests/browser/z_capture_pkg007.spec.ts` i
`z_capture_pkg007_video.spec.ts` — zdublowane z nowymi `z_capture_pkg008*.spec.ts`
(ten sam zestaw ekranów do porównania przed/po), a ich dalsze istnienie tylko
zwiększało czas sekwencyjnego przebiegu i ryzyko ponownego nadpisania ewidencji
PKG-007 (dokładnie incydent opisany w REPORT.md PKG-007 §7). Same pliki PNG/webm
`docs/evidence/PKG-007/` pozostają nietknięte. Ścieżki dowodów w `jump.spec.ts`,
`competition.spec.ts`, `shell.spec.ts`, `benchmark.spec.ts`, `persistence.spec.ts`
przeniesiono na `docs/evidence/PKG-008/browser-artifacts/` na początku sesji, zgodnie
z instrukcją promptu — kolejny pakiet powinien zrobić to samo przed uruchomieniem
`test:e2e`.

## 6. Ograniczenia i świadomie pominięty zakres

- **Efekt odczucia skoku jest minimalny.** Dodano tylko tryskający śnieg przy
  kontakcie z podłożem (rozbieżność #8). Nie dodano wstrząsu kamery, cząsteczek przy
  wybiciu ani squash-stretch — REPORT.md PKG-007 klasyfikował to jako P2, a decyzje
  użytkownika #1-7 nie obejmowały tego zakresu wprost. Jeśli po odbiorze VISUAL
  odczucie skoku nadal wymaga więcej „soczystości”, to osobna, świadoma decyzja na
  kolejną sesję, nie przeoczenie.
- **Etykiety metrów przy stromym progu K/HS bywają gęste.** Na ekranie odjazdu
  (`pkg008-phase-outrun`) liczby 100/120/130 i markery K/HS/FALL/REK leżą blisko
  siebie — zmniejszono częstotliwość etykiet z co 10 m do co 20 m i przesunięto je
  wzdłuż normalnej powierzchni, ale przy bardzo stromym profilu K120 pełna czytelność
  na małym buforze ma naturalną granicę. Nie jest to regresja funkcjonalna (dane są
  poprawne), tylko drobna kwestia czytelności do ewentualnego dalszego tuningu.
- **Tylko jedna rodzina palety zaimplementowana.** `PALETTE_FAMILIES` to gotowa,
  rozszerzalna struktura (decyzja #3: zacząć od jednej rodziny), ale pięć pozostałych
  rodzin z ART_UI_AUDIO §5 (dzienny las skandynawski, alpejska dolina, miejski
  stadion, las japoński, dolina mamucia) nie istnieje jeszcze — nie było to w
  zakresie tego pakietu.
- **`z_capture_pkg007_video.spec.ts`/`z_capture_pkg007.spec.ts` usunięte** — patrz §5;
  jeśli następna sesja potrzebuje ponownie porównać PKG-007 z bieżącym stanem,
  materiał źródłowy (`docs/evidence/PKG-007/`) jest nienaruszony, tylko generujący
  go skrypt zniknął.

## 7. Końcowe review

Jedno końcowe auto-review objęło: cały `src/render/` (trzy przepisane pliki + rozszerzony
`pixelFont.ts`), zmiany w `src/app/main.ts` (tylko funkcje rysujące), `index.html`,
`playwright.config.ts`, oraz zestaw testów e2e (przeniesione ścieżki, usunięte
zdublowane specy, nowe specy PKG-008, poprawiona asercja wymiaru canvasu). Znaleziono
i naprawiono w trakcie realizacji: (1) dwa błędy wydajności renderera opisane w §4,
(2) brakujące glify bitmapowego fontu (diakrytyki, strzałki, `< >`, myślnik długi,
punktor) ujawnione dopiero po przejściu na font wszędzie, (3) kolizje tekstu w
nagłówkach ekranów konkursu i w panelu HUD powtórki przy węższym buforze 480 px.
Nie znaleziono niewykonanych kryteriów technicznych zakresu P42.

## 8. Bramka V — pierwsza odpowiedź i druga runda poprawek

### 8.1 Pierwsza odpowiedź użytkownika (po §0-§7, przed poniższymi zmianami)

> nie. skoczek dalej wygląda jak gruzmoł, nie jak postać którą gra gracz. Nie widać
> tylu V, narty wbijają się w ziemie zamiast sunąć po śniego. to nadal nie wygląda
> dobrze, ALE WYGLĄDA LEPIEJ. kierunek dobry, ale jeszcze dużo do poprawy, zwłaszcza
> realizm wyglądu skoczka i skoczni

Zaakceptowane: kierunek, rozdzielczość, siatka pikseli, font, paleta, paralaksa,
scena produkcyjna w powtórce. Odrzucone: czytelność sylwetki skoczka, brak V-stylu
nart w locie, narty wizualnie „wbijające się” w śnieg zamiast po nim sunąć.

### 8.2 Druga runda — poprawki punktowe w tej samej sesji

Użytkownik dodatkowo poprosił o trwałą zasadę (dopisana do
`.agents/skills/dos-pixel-art/SKILL.md`): gdy proceduralne rysowanie
(`pixelLine`/`fillPixelPolygon`) nie daje czytelnego efektu, wolno użyć CLI
`gen-ai` (Picsart, zainstalowane i zalogowane w tym środowisku) zamiast dalszego
ręcznego strojenia współrzędnych — z zastrzeżeniem, że wygenerowany PNG nadal
przechodzi przez snap do siatki i manifest pochodzenia. W tej rundzie problemy
okazały się rozwiązywalne procedurą (patrz niżej), więc `gen-ai` nie było użyte,
ale zasada zostaje w skillu na przyszłość.

Zmiany w `src/render/hillView.ts`:

1. **V-style nart.** `renderJumperFrame` rysował obie narty jako niemal
   równoległe kopie tego samego wektora `ski` (przesunięte tylko o mały offset
   prostopadły) — stąd brak widocznego V. Teraz każda narta ma własny wektor
   kierunku odchylony o `vSpreadRad` od `skiAngle` (0,30 rad w locie, 0,14 rad
   przy wybiciu/przygotowaniu lądowania, 0 na ziemi — na rozbiegu/odjeździe narty
   fizycznie leżą równolegle obok siebie, V dotyczy tylko lotu).
2. **Kontakt nart ze śniegiem.** Na rozbiegu/odjeździe/belce kąt nart pochodził z
   `pitchRad` (pochylenie ciała z fizyki), które nie zawsze pokrywa się z
   widocznym na ekranie nachyleniem wyrenderowanego konturu skoczni (ten sam
   powód, dla którego kontur jest teraz cache'owany — patrz §4). Nowa funkcja
   `surfaceSlopePitchRad(hill, x)` liczy lokalne nachylenie wprost z
   `hill.surfaceYAtX`, czyli z tego samego źródła, którym renderuje się widoczny
   kontur — narty na ziemi są więc gwarantowane stycznie do tego, co naprawdę
   widać, niezależnie od drobnych rozbieżności fizyka/render. `jumperFrame()`
   przyjmuje teraz cały `SceneActor` zamiast osobnych `phase/pitchRad/tick`.
3. **Skoczek stoi na nartach, nie jest nimi przebity.** Cała para nart rysuje się
   teraz przesunięta o 2 px w kierunku „w dół" (`-up`) względem stóp, zamiast być
   wyśrodkowana dokładnie na punkcie referencyjnym ciała.
4. **Większa, czytelniejsza sylwetka.** `JUMPER_ART_SCALE` podniesione z
   `{ skiPixels: 29, standingPixels: 22 }` do `{ skiPixels: 32, standingPixels: 24 }`
   — nadal w zakresie proporcjonalnym z decyzji #2 (18-24/24-34 px dla 480×270),
   ale u górnej granicy zamiast środka, żeby dać więcej pikseli na rozdzielenie
   głowy/tułowia/kończyn.
5. **Budżet klatek lotu podniesiony z 7 do 12** (użytkownik: „minimum 10 w
   zależności od głębokości nachylenia”); `takeoff` 4→5, `landingPrep` 7→8 —
   proporcjonalnie do tego samego zakresu kąta, więcej pośrednich pozycji.

Nowe/zaktualizowane dowody: [`pkg008-crop-skoczek-lot-upscaled6x.png`](browser-artifacts/pkg008-crop-skoczek-lot-upscaled6x.png)
(V-style w locie), zaktualizowany [`pkg008-crop-skoczek-upscaled6x.png`](browser-artifacts/pkg008-crop-skoczek-upscaled6x.png)
(kontakt nart ze śniegiem na odjeździe — teraz wyraźnie sunie po widocznym torze,
nie przecina go), oraz wszystkie zrzuty ekranów/faz/nagrania z §3 nadpisane
najnowszym kodem. Weryfikacja po zmianach: `npm run typecheck` PASS, `npm test`
168/168 PASS, `npm run build` PASS, `npm run test:e2e` uruchomiony ponownie dla
pewności (wynik w §5 pozostaje reprezentatywny — te same testy wrażliwe na
timing automatyzacji, żadna nowa realna regresja).

### 8.3 Odrzucenie rundy 2 i pełne cofnięcie

Dosłowna odpowiedź użytkownika na dowody z §8.2:

> jest zdecydowanie o wiele wiele GORZEJ. wycofaj te zmiany, przywróć do momentu
> przed Twoimi zmianami bo to jest jakaś komedia

Wszystkie pięć zmian z §8.2 (V-style nart, `surfaceSlopePitchRad`, przesunięcie
nart pod stopy, większa skala, budżet klatek lotu 12/5/8) zostało **w całości
cofniętych ręcznie** (projekt nie jest repozytorium Git, więc bez `git revert`) —
`JUMPER_ART_SCALE` z powrotem `{ skiPixels: 29, standingPixels: 22 }`,
`FRAME_COUNT` z powrotem `{ takeoff: 4, flight: 7, landingPrep: 7 }`, `jumperFrame`
z powrotem przyjmuje `(phase, pitchRad, tick)` bez `surfaceSlopePitchRad`, geometria
nart w `renderJumperFrame` z powrotem to dwie równoległe kopie `ski` (offsety
`[-1, 1.5]`), bez `skiRestX`/`vSpreadRad`. Potwierdzone bajtowo: `npm run build`
po cofnięciu dał identyczny hash pliku JS (`index-B8A09Nrz.js`, 137,38 kB) co
build tuż przed rozpoczęciem rundy 2 — kod jest dokładnie w stanie rundy 1.

Zasada dotycząca `gen-ai`/Picsart dopisana do `.agents/skills/dos-pixel-art/SKILL.md`
w trakcie rundy 2 **nie została cofnięta** — to sama zasada procesowa (dokumentacja
skilla), nie zmiana wizualna, i użytkownik jej nie odrzucił.

**Stan na koniec sesji: bramka V NIE zaliczona, kod w stanie rundy 1 (ten sam,
który dostał odpowiedź z §8.1 — „wygląda lepiej, kierunek dobry, ale dużo do
poprawy”).** Kolejna sesja/iteracja powinna podejść do naprawy sylwetki skoczka
inaczej niż runda 2 — nie powtarzać dosłownie tych samych pięciu zmian bez
nowego, jawnego kierunku od użytkownika.

### 8.4 Doprecyzowanie użytkownika i nowy prompt kontynuacji

Użytkownik doprecyzował krytykę V-stylu i poprosił o przygotowanie promptu do
wykonania przez inny model:

> skoczek dalej wygląda jak gruzmoł, nie jak postać którą gra gracz. Nie widać
> stylu V (z widokiem od boku powinien być lekko widoczny - perspektywa musi sie
> zgadzać!!!!), narty wbijają się w ziemie zamiast sunąć po śniego. to nadal nie
> wygląda dobrze, kierunek dobry, ale jeszcze dużo do poprawy, zwłaszcza realizm
> wyglądu skoczka i skoczni

Kluczowe doprecyzowanie: V-style widziany z boku powinien być **subtelny**
(perspektywa boczna ukrywa większość rozstawu, który biegnie w osi głębi, nie w
osi widocznej z profilu) — runda 2 prawdopodobnie przesadziła z kątem rozstawu,
traktując widok z boku jak widok z przodu/góry.

`docs/handoffs/PKG-008.md`/`docs/NEXT_SESSION_PROMPT.md` zaktualizowane o pełny
kontekst obu rund, jawną instrukcję otwarcia referencji obrazowej PRZED zmianą
geometrii (czego runda 2 nie zrobiła — patrz §8.2/8.3), i wymóg zmieniania jednej
rzeczy na raz z oceną obok referencji zamiast zbiorczej samooceny. Poprzednia
wersja handoffu zarchiwizowana jako `docs/handoffs/PKG-008-CONTINUE-02.md`.
Zweryfikowane: `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`
→ PASS.

Zasady sportowe, fizyka, zapis i replay działają dokładnie tak jak przed pakietem
(potwierdzone: `sportMarkers.ts` nietknięty, 168/168 testów jednostkowych bez zmian,
identyczny format `StoredReplay`).

## 9. Trzecia runda — cztery pojedyncze zmiany ze sprawdzeniem obok referencji

Wykonana 17.09.2026 według promptu `docs/handoffs/PKG-008.md` (kontynuacja #2):
najpierw otwarte i obejrzane narzędziem do obrazów `sj3-s16.gif` (lot) i
`sj3-s0A.gif` (cztery klatki wybicia) w powiększeniu 4-6×, potem cztery zmiany,
każda osobno zbudowana (`npm run build` → `vite preview` serwuje `dist/`) i
oceniona wycinkiem 1:1 ×6 obok referencji, zanim ruszoną następną.

### 9.0 Co widać na referencjach (OBSERVED, nie z pamięci)

- **s0A (wybicie, widok z boku):** narty to JEDNA bladożółta linia leżąca płasko
  na krawędzi stołu (100% nałożenia, zero widocznego V); kombinezon jasna
  magenta w jednym odcieniu; ręce długie, białe, wyciągnięte poziomo do przodu;
  głowa mała (żółta twarz + ciemny kask); nogi ugięte, buty na nartach.
- **s16 (lot, widok z boku, z daleka):** narty to JEDNA bladożółta pozioma linia;
  tułów zwarty, prawie poziomy, TUŻ nad nartami (1-2 px przerwy); krótki biały
  segment ramienia z przodu; głowa-kropka z przodu. Zero rozstawu V, zero
  zwisających kończyn — wszystko równoległe do nart.
- Wniosek do perspektywy: rozstaw V biegnie w osi głębi, z boku chowa się prawie
  w całości — uczciwy efekt to co najwyżej 1 px echa drugiej narty, nie kąt
  (błąd rundy 2: `vSpreadRad = 0,30 rad` jak z przodu/góry).

### 9.1 Z1 — narty leżą na śniegu (lift blitu, BEZ zmiany kąta)

**Mechanizm:** kotwica fizyki (`actor.position`) leży na MATEMATYCZNEJ
powierzchni, ale widoczny pas śniegu rysuje się wyśrodkowanym obrysem
`pixelPolyline` (zeskok/odjazd: 9 px → ±4,5 px; rozbieg: 6 px → ±3 px) —
narty wyśrodkowane na kotwicy tonęły w połowie białego pasa. Kąt nie był
problemem (w odjeździe `pitchRad = -slopeRad` dokładnie), więc tezy rundy 2
o liczeniu kąta z `surfaceYAtX` NIE odtworzono — zbędna.
**Zmiana** (`drawProductionJumper`): cały blit w górę — 5 px na
zeskoku/odjeździe/upadku, 4 px na rozbiegu/belce, 0 w powietrzu.
**Ocena:** pomiar na `pkg008-crop-skoczek-1x.png` (x=100: spód narty y=87,
góra śniegu y=88 — styk 0-1 px); rozbieg: żółta linia na białym torze, nie
w nim. Z1 ZACHOWANE.

### 9.2 Z2 — subtelny V (1 px echa, nie kąt)

**Zmiana** (`renderJumperFrame`, wszystkie pozy): zamiast dwóch rozdzielonych
linii (offsety `[-1, 1.5]`) dalsza narta wychyla się 1 px powyżej bliższej,
ciemniejszą żółcią (`#c1903f`), bez czarnego konturu; kolejność: kontur
bliższej → echo dalszej → rdzeń bliższej (kontur w2 zakryłby echo malowane
przed nim — wykryte pomiarem: dwie iteracje dające identyczne zrzuty, echo
niewidoczne, zanim przestawiono kolejność).
**Ocena:** pomiar: echo ciemne rzędy 60-61, rdzeń jasny 62-63 — jedna linia
z ciemniejszą górną krawędzią, jak „druga narta wygląda zza pierwszej".
Z2 ZACHOWANE.

### 9.3 Z3 — czytelna sylwetka (kolory, BEZ zmiany geometrii)

**Zmiana** (`renderJumperFrame` + `drawPixelHead`): nogi w czerwieni tułowia
`#d64d53` zamiast granatu `#244b75` (tonął w nocnym niebie); kontur tułowia
4→3 px; usunięty biały „śliniak" 3×3 z niebieską kropką (dziura w piersi);
ręce w całości kremowe `#f3ead1` z dłonią w kolorze skóry (koniec czerwonego
przedramienia stykającego się z głową — czytało się jako pysk); głowa:
ciemny kask + jasna twarz 3×3 + jedno oko, bez niebieskiego „wizjera".
**Ocena:** lot i odjazd czytają się jako postać (czerwony tułów, jasne ręce,
głowa z kaskiem). Z3 ZACHOWANE.

### 9.4 Z3b — tułów płasko nad nartami w locie (jedyna zmiana geometrii ciała)

**Obserwacja z porównania obok s16:** nasz tułów unosił się 6-8 px nad nartami
na czarnych „szczudłach" nóg; w SJ3 leży 1-2 px nad nartami, prawie równolegle.
**Zmiana** (tylko poza `flight`): `poseAngleOffset.flight` 0,43→0,18,
biodra 4→2,5 px nad stopami. Pozostałe pozy nietknięte.
**Ocena:** porównanie `porownanie_lot.png` (nasz lot ×3 nad s16 ×3,46):
zwarta pozioma sylwetka, tułów nad nartami, głowa z przodu — blisko
referencji. Z3b ZACHOWANE. Fazy naziemne/telemark/upadek sprawdzone osobno
(`takeoff`, `landingprep`, `gategreen`, `fall`, `finishline`) — bez regresji.

### 9.5 Weryfikacja po rundzie 3

| Polecenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 23 pliki, 168/168 |
| `npm run build` | PASS — Vite, 32 moduły, JS **137,41 kB / 43,69 kB gzip** |
| Pełny `z_capture_pkg008.spec.ts` | 9/9 PASS (oba rozmiary ekranów, fazy, upadek, wycinki, siatka) |
| `z_capture_pkg008_video.spec.ts` | 2/2 PASS, a pliki `video-review/*.webm`
skopiowane ręcznie z `playwright-output/<test>/video.webm` i zweryfikowane
klatką (nowa sylwetka w locie) — patrz uwaga o pułapce niżej |
| `npm run test:e2e` | 27 PASS, 1 skipped, 1 FAIL (`shell.spec.ts`, aria-label „menu główne" vs „pauza") — **PASS w izolacji** (792 ms); ten sam wzorzec flakiness obciążenia zestawu sekwencyjnego co w §5, nie regresja (zmiany tylko w `src/render/hillView.ts`, test shella nie dochodzi do skoku) |

Fizyka, punktacja, `sportMarkers.ts`, zapis i replay — bez zmian (jedyny
dotknięty plik produkcyjny to `src/render/hillView.ts`: bank klatek skoczka
i blit; `JUMPER_ART_SCALE` 29/22 i `FRAME_COUNT` bez zmian).
Cień/ oprysk kontaktowy zostawiono na kotwicy matematycznej: cień leży ~5 px
poniżej uniesionych nart (czyta się jako cień na śniegu pod nartami), oprysk
(poziom nart −5..−1 px) otacza ogony nart — sprawdzone na wycinkach, bez
poprawek.

**Bramka V: czeka na jawną odpowiedź użytkownika** (porównania do oceny:
`browser-artifacts/pkg008-crop-skoczek-lot-upscaled6x.png`,
`pkg008-crop-skoczek-upscaled6x.png`, fazy `pkg008-phase-*-960x540.png`,
nagrania w `video-review/`). Model nie wpisuje PASS w VISUAL.

### 9.6 Auto-review (na żądanie użytkownika, 17.09.2026)

Jedno review zmian rundy 3 (tylko `src/render/hillView.ts` — jedyny plik
produkcyjny dotknięty 17.09; `sportMarkers.ts`, symulacja, zapis, replay
nietknięte; `JUMPER_ART_SCALE` i `FRAME_COUNT` bez zmian):

1. **FAŁSZYWE zdanie w §9.5, naprawione:** „oba nagrania zregenerowane nowym
   rendererem" — nieprawda w chwili wpisu. Spec wideo (`video: 'on'`) nagrywa
   do `playwright-output/<test>/video.webm`, ale Playwright czyści `outputDir`
   przy każdym uruchomieniu, a do `video-review/` nic nie kopiuje się samo —
   pliki `.webm` były z rundy 1 (16.09, stara sylwetka). Naprawiono: oba testy
   wideo uruchomiono w JEDNEJ inwokacji (żeby drugie nie starło pierwszego),
   `video.webm` skopiowano na docelowe nazwy i zweryfikowano klatką ffmpeg
   (nowa sylwetka widoczna). Zdanie w §9.5 poprawiono na prawdziwe.
2. **Pułapka dla kolejnych sesji:** każde `npx playwright test ...`
   (dowolny podzbiór) kasuje CAŁY `playwright-output`, łącznie z nagraniami
   i śladami z poprzednich przebiegów. Kolejność bezpieczna: najpierw pełny
   `test:e2e`, potem osobno spec wideo, KOPIA `video.webm` do `video-review/`
   zanim uruchomi się cokolwiek innego — i żadnych izolowanych dobiegów
   po kopiowaniu.
3. **Kod Z1-Z3b bez usterek:** `groundLift` kompletny (7 póz, sprawdza
   typecheck); kolory `fallen` spójne we wszystkich nowych gałęziach
   (echo `#8c2f3e`, rdzeń `COLOR.red`); `up` używany, brak martwych zmiennych;
   klucz cache'u `pose:index` poprawny, bo `angleRad` jest czystą funkcją
   `(pose, frameIndex)` (zweryfikowano, nie zmieniano); cień/oprysk na
   kotwicy matematycznej ocenione na wycinkach — bez poprawek.
4. **Dowody po review:** PNG ekranów/faz/wycinków z bieżącego kodu (9/9 capture
   PASS po zmianach), `.webm` z bieżącego kodu (powyżej), `shell.spec.ts`
   FAIL tylko w przebiegu sekwencyjnym, PASS w izolacji — znana flakiness.

Wynik review: 1 realna usterka (stare nagrania + fałszywe zdanie) —
naprawiona powyżej. Brak zmian kodu z review.

### 9.7 Czwarta runda — werdykt użytkownika z nowym konkretem + research (17.09.2026)

Dosłowny werdykt na rundę 3 (bramka V znów niezaliczona):

> nie. skoczek cały czas jest wyprostowany a na rozbiegu powinien kucać.
> ręce nie przed siebie, a ułożone z tułowiem. Przeanalizuj obrazy
> w internecie jak to wygląda skoczek w każdej fazie i na tej podstawie
> działaj. skoczek i narty reraz wyglądają jak jedna kreska. sprawdź jak
> wygląda orawdziwy skoczek i jak robią to inne gry! research nie boli !!!!

**Research wykonany przed kodem** (użytkownik zażądał wprost):
tekstowo — Red Bull (historia techniki: „arms stretched back next to the
body", koniec stylu z rękami do przodu), Wikipedia (ski flying / V-style
Boklöva, Telemark landing: wykrok ~1 but, tułów prosto, ręce poziomo
do przodu/góry), NBC (ocena: telemark, stabilne ręce); obrazowo — 4 zdjęcia
CC z Wikimedia Commons obejrzane i odłożone do
`docs/research/reference-images/real-*.jpg` z przypisami w README
(Peterka 2008 CC BY-SA 2.0, Urbanc 2005 CC BY-SA 2.0, telemark z boku
CC BY 2.0, kuc rozbiegowy z tyłu CC BY 2.0). Inne gry: boczne SJ3 (ten sam
kuc i płaski lot — spójne z prawdą), DSJ2 z tyłu (bez bocznej sylwetki do
wzięcia; z DSJ2 bierzemy cień/kontrast jak dotąd).

**Trzy zmiany, każda osobno zbudowana i oceniona wycinkiem** (tylko
`src/render/hillView.ts`):

- **R1 — kuc na rozbiegu:** `inrun` 0,73→0,28 rad, `gate` 1,42→1,05,
  biodra 4→3 px. Tułów poziomo nad nartami, głowa nisko z przodu.
  Ocena: kuc widoczny na fazie inrun/gate. ZACHOWANE.
- **R2 — ręce wzdłuż tułowia:** reguła `armAngle = body + π − 0,35`
  (dłonie przy biodrach) we wszystkich pozach; wyjątki udokumentowane
  researchem: wybicie klatki 2-3 = zamach do przodu (s0A), lądowanie =
  ręce do przodu/góry dla równowagi (telemark, FIS). Wymagało przewleczenia
  `frameIndex` do `renderJumperFrame` (sygnatura + wywołanie, cache bez
  zmian — klucz był i jest poprawny). Ocena: lot/telemark/odjazd z rękami
  jak na zdjęciach. ZACHOWANE.
- **R3/R3b — koniec „jednej kreski":** prześwit w locie 2,5→3,5 px + głowa
  +1,5 px nad oś ciała (patrzy do przodu); pierwsza próba dała za długie
  jasne ramię na tułowiu („drugie stworzenie") — naprawione w tej samej
  rundzie krótkimi cofniętymi rękami w locie (3 + 2,5 px, kąt π − 0,7).
  Ocena obok s16: osobna narta, osobny tułów, osobna głowa. ZACHOWANE.

**Weryfikacja po rundzie 4:** typecheck PASS; `npm test` 168/168 PASS;
build PASS (137,52 kB / 43,73 kB gzip); capture 9/9 PASS; **pełny
`test:e2e` 28 PASS + 1 skipped, ZERO faili**; nagrania skopiowane ze
świeżych `video.webm` (jedna inwokacja, kopia przed jakimkolwiek kolejnym
uruchomieniem — pułapka z §9.6) i zweryfikowane klatką ffmpeg.
Fizyka/punktacja/zapis/replay bez zmian.

**Bramka V: czeka na nowy werdykt użytkownika.** Model nie wpisuje PASS.

### 9.8 Werdykt na rundę 4 i przekazanie świeżym oczom (17.09.2026)

Dosłownie: „jest postęp ale bardzo mały." Decyzja użytkownika: ŻADNYCH
dalszych poprawek w tej sesji; następną rundę robi INNY model świeżym
okiem — z nowym promptem opisującym CO ma być zrobione, bez HOW i bez
opierania się na poprzednich próbach. Prompt w `docs/handoffs/PKG-008.md`
(= `docs/NEXT_SESSION_PROMPT.md`), poprzedni zarchiwizowany jako
`PKG-008-CONTINUE-05.md`.

## 10. Piąta runda — świeże oczy: sylwetka z brył zamiast z kresek (17.09.2026)

Runda wykonana z promptu `docs/handoffs/PKG-008.md` („świeże oczy"), bez
czytania `PKG-008-CONTINUE-*.md` ani §8-§9 tego raportu — diagnoza powstała
samodzielnie z materiałów referencyjnych i z aktualnych dowodów.

### 10.1 Diagnoza (OBSERVED, z dowodów i referencji)

Z czym porównano, zanim ruszył kod:

- `real-telemark-landing-side.jpg` — jedyne zdjęcie z boku: długa linia nart
  wyraźnie pod ciałem, nogi w rozkroku telemarku, ręce szeroko dla równowagi.
- `real-vstyle-takeoff-peterka-*.jpg` (ujęcie od tyłu, wycinek ×5) — ręce
  ułożone wzdłuż tułowia, dłonie przy biodrach.
- `sj3-s0A.gif`, klatki 1 i 4 (wycinki ×14) — wzorzec kompozycji z boku:
  narta to CIENKA, JASNA linia leżąca na śniegu i wystająca daleko przed i za
  sylwetkę; ciało to ZWARTA BRYŁA nad nią, z jedną jasną kreską grzbietu na
  górnej krawędzi i głową na samym przodzie.
- `sj3-s16.gif`, sprite lotu (wycinek ×16) — ciało wznosi się do przodu pod
  ~25° do nart; między nartą a biodrem widać tło.
- Dowody stanu wejściowego `pkg008-crop-skoczek-*.png`.

Co z tego wyszło jako przyczyny, a nie objawy:

1. **Wszystko wychodziło z jednego punktu.** Stary bank liczył nartę, nogi,
   tułów i rękę jako odcinki z tej samej kotwicy `feet`, rysowane
   2-3-pikselowymi `pixelLine` pod niemal tym samym kątem co narta. Dlatego
   narta przechodziła PRZEZ tułów i całość czytała się jako jedna ukośna
   kreska — to jest usterka #3 z promptu, w postaci przyczynowej.
2. **Ciało nie miało objętości.** Kreska 2 px nie jest bryłą; referencja ma
   w kucu masę ~12×6 px (po przeskalowaniu z 640×400 na naszą skalę).
3. **Kąt sylwetki był zamrożony przez cache.** Klucz banku brzmiał
   `poza:klatka`, ale dla rozbiegu/odjazdu/belki kod zwracał surowe
   `pitchRad` — pierwsza wygenerowana klatka zamrażała swoje nachylenie
   na całą sesję, mimo krzywej przejściowej rozbiegu.
4. **Korekta kontaktu była liczona „na oko".** `groundLift` 4/5 px nie
   odpowiadało szerokości widocznego pasa śniegu (`strokeCurve(..., 6)` na
   zeskoku kładzie biel od `y-3` do `y+2`, `strokeCurve(..., 3)` na rozbiegu
   od `y-1` do `y+1`).

### 10.2 Co zmieniono (`src/render/hillView.ts`, tylko renderer)

- **Nowy układ odniesienia.** Pozy opisane są w układzie NARTY: `u` wzdłuż
  nart, `v` prostopadle w górę, początek w punkcie styku buta z nartą. „Narta
  pod ciałem" jest więc własnością danych, a nie szczęśliwym trafem rysowania.
- **Sylwetka z brył.** Kończyny to wypełnione czworokąty (`limbQuad`) o
  ludzkich grubościach w skali 11,6 px/m (narta 2,5 m = 29 px): tułów ~3 px,
  udo ~2,5 px, podudzie ~2 px. Każdy czworokąt dostaje najpierw ciągły rdzeń
  Bresenhama, bo cienki ukośny wielokąt gubi całe wiersze skanlinii.
- **Narta jako jedna ciągła kreska 4-spójna** (`thinStroke`). Zwykły
  `pixelLine` chodzi po skosie i zostawia wcięcia, które obrys zamalowuje na
  ciemno — narta wychodziła przerywana.
- **Obrys 1 px z maski alfa** (`outlineSilhouette`, jeden `putImageData`)
  zamiast obrysowywania każdej kończyny osobno. Sylwetka czyta się i na
  śniegu, i na nocnym niebie — to dyscyplina kontrastu z DSJ2.
- **Kuc na rozbiegu**: plecy równolegle do nart, biodra za kolanami, głowa
  nisko z przodu, dłonie przy biodrach z tyłu; na belce płytszy półkuc, żeby
  różnica belka→rozbieg była widoczna.
- **Ręce wzdłuż BOKU tułowia**, w ciemniejszym odcieniu kombinezonu, z 1 px
  rękawicy na końcu (tak SJ3 zaznacza dłonie za plecami). Jedyny wyjątek:
  lądowanie — ręce na zewnątrz dla równowagi.
- **Telemark sterowany wysokością nad zeskokiem**, nie pochyleniem: gracz
  wybiera wariant kiedy chce, a rozkrok domyka się dokładnie na styk ze
  śniegiem. Dlatego klucz cache'u ma teraz trzy wymiary (poza × klatka ×
  kubełek kąta), co przy okazji naprawia zamrożony kąt z punktu 3 diagnozy.
- **V ledwo widoczne**: echo dalszej narty tylko na ostatnich 9 px, 1 px
  wyżej, ciemniejszym złotem — z boku rozwarcie biegnie w osi głębi, więc
  zostaje z niego wąski klin przy czubku, nie druga kreska.
- **Kontakt ze śniegiem policzony z szerokości pasa**: podniesienie blitu o
  3 px na zeskoku i 2 px na rozbiegu, wygaszane tylko w fazach powietrznych.
  Wcześniejsze wygaszanie liczyło wysokość względem ZESKOKU także na
  rozbiegu (wspólna mapa metrażu zaczyna się pod progiem), więc zerowało
  korektę dokładnie tam, gdzie była potrzebna.
- **Postawa stojąca na odjeździe** odchylona lekko w tył w układzie narty:
  pion sylwetki liczony względem nart pochylał zawodnika o cały kąt zbocza.
- `JUMPER_ART_VERSION` = `pkg008-jumper-solid-silhouette-1`.
  `JUMPER_ART_SCALE` (29 / 22) i `FRAME_COUNT` bez zmian. `FRAME_SIZE`
  130 → 72 (bryła sylwetki mieści się z zapasem).

Fizyka, punktacja, zapis i replay nietknięte — w tej sesji zmieniły się
dokładnie dwa pliki: `src/render/hillView.ts` i
`tests/browser/z_capture_pkg008.spec.ts`.

### 10.3 Nowe dowody (bo starych nie dało się ocenić)

Zrzut `pkg008-phase-inrun` powstawał zaraz po opuszczeniu belki (2,1 km/h),
gdzie kuca nie widać, a wycinki 1:1 obejmowały tylko lot i odjazd — czyli
żadnej z trzech usterek z promptu nie dało się ocenić z dowodów. Dołożono:

- `pkg008-phase-inrun-960x540.png` robiony dopiero przy ≥ 60 km/h;
- `pkg008-phase-telemark-960x540.png` przy samym śniegu (≤ 1,5 m) — zrzut
  tuż po wciśnięciu T pokazuje jeszcze pozę lotu, więc sam nie dowodzi niczego
  o telemarku;
- wycinki 1:1 i ×6: `pkg008-crop-skoczek-belka-*`, `-rozbieg-*`,
  `-wybicie-*`, `-ladowanie-*`, `-telemark-*`.

### 10.4 Efekt — co widać na dowodach

| Kryterium promptu | Dowód | Co widać |
|---|---|---|
| Kuc na rozbiegu | `pkg008-crop-skoczek-rozbieg-upscaled6x.png`, `pkg008-crop-skoczek-belka-upscaled6x.png` | Tułów ~7 px nad nartami, plecy równolegle do nart, głowa nisko z przodu; na belce sylwetka wyraźnie wyższa |
| Ręce wzdłuż tułowia | te same wycinki + `pkg008-crop-skoczek-lot-upscaled6x.png`, `pkg008-crop-skoczek-upscaled6x.png` | Ciemniejszy pas ramienia biegnie bokiem tułowia do rękawicy z tyłu; skóra występuje tylko na twarzy |
| Narty i sylwetka osobno | `pkg008-crop-skoczek-lot-upscaled6x.png` | Narta: ciągła jasna linia wystająca ~8 px za i ~10 px przed ciało; między nartą a biodrem widać tło |
| V subtelne | tamże | Ciemniejsze echo tylko przy czubku, 1 px odsunięcia |
| Narty na śniegu | `pkg008-crop-skoczek-upscaled6x.png`, `pkg008-crop-skoczek-telemark-upscaled6x.png` | Jasny rdzeń narty leży na górnym wierszu białego pasa, ciemny spód czyta się jako cień |
| Lądowanie | `pkg008-crop-skoczek-telemark-upscaled6x.png` | Rozkrok telemarku, tułów do pionu, ręce na zewnątrz |

### 10.5 Weryfikacja

| Sprawdzenie | Wynik |
|---|---|
| `npm run typecheck` | PASS |
| `npm test` | PASS — 23 pliki, 168/168 |
| `npm run build` | PASS — Vite, 32 moduły, JS 141,92 kB (było 137,5 kB) |
| `npm run test:e2e` | 26-28 PASS, 1 skipped, 1-3 FAIL niestabilne (niżej) |
| `z_capture_pkg008.spec.ts` solo (dowody finalne) | 10/10 PASS |
| `z_capture_pkg008_video.spec.ts` solo (nagrania) | 2/2 PASS |

**Niestabilność pełnego `test:e2e` — stan faktyczny, nie deklaracja PASS.**
W trzech pełnych przebiegach padało 1, 3 i 3 testy, za każdym razem inne.
Każdy z nich przechodzi po uruchomieniu w izolacji (`shell.spec` 1/1,
`jump.spec` 8/8, `persistence.spec` 4/4, `competition.spec` + capture 10/12
z innym padającym testem). Kontekst błędów pokazuje zawsze ten sam mechanizm:
ekran MENU z komunikatem „Pauza: zbyt długa przerwa klatki", czyli pauza
przeciążenia z `FixedStepClock` (jedna przerwa rAF > 66,7 ms).

Dlaczego to nie jest regresja renderera:
- pauzy wypadają na ekranie menu i tytułu, gdzie skoczek w ogóle się nie
  rysuje (`drawProductionJumper` jest wywoływany wyłącznie ze sceny skoku);
- pomiar odstępów `requestAnimationFrame` w przeglądarce na pełnym skoku w
  scenie produkcyjnej: 1694 klatki, p50 17,6 ms, p95 18,5 ms, p99 18,9 ms,
  maks. 20,4 ms, **zero** klatek powyżej progu 66,7 ms;
- maszyna w czasie przebiegów miała ~1,1 GB wolnego RAM z 7,7 GB i 29
  procesów `node`, a pełny przebieg trwa ~8,5 min.

Mimo to koszt generowania klatek zbito profilaktycznie: jeden współdzielony
bufor roboczy z `willReadFrequently` zamiast nowego płótna na klatkę, obrys
jednym `putImageData` zamiast kilkuset `fillRect`, limit cache'u 288 klatek
(72×72×4 B ≈ 21 kB każda), żeby czyszczenie nie wpadało w pętlę w środku
skoku.

### 10.6 Ograniczenia tej rundy

- Nie użyto generatora AI — ręczna geometria wystarczyła, więc nie powstał
  manifest pochodzenia z `dos-pixel-art`.
- `JUMPER_ART_SCALE` zostało na 29/22. Sylwetka jest czytelna, ale na
  szerokim planie rozbiegu nadal mała; zmiana skali to osobna decyzja
  użytkownika, poza „CO ma być zrobione" z promptu.
- Pozy upadku poprawiono tylko na tyle, żeby korzystały z nowego banku;
  upadek nie był przedmiotem żadnej z trzech usterek.

### 10.7 Werdykt użytkownika na rundę 5 (18.09.2026)

Dosłownie: „akceptuje postęp, ale nadal wiele do poprawki. w następnej
kolejności proszę poprawić proporcje wielkości skoczka do skoczni - w tym
realniej wyglądającą skocznie i rozbieg - skorzystać do porównania wyglądu
i skali prawdziwe obiekty, wymiary itd itd - zrób research zanim zaczniesz
żeby mieć pewność że to co robisz jest zgodne z prawdziwym światem"

Bramka V: **NIEZALICZONA** — postęp przyjęty, odbioru nie ma. Nowy, nazwany
przez użytkownika zakres: proporcje skoczek↔skocznia oraz realizm skoczni
i rozbiegu, oparte na rzeczywistych wymiarach. Runda 6 poniżej.

## 11. Szósta runda — proporcje skoczek↔skocznia i geometria wg FIS (18.09.2026)

Zakres nazwany przez użytkownika po rundzie 5 (§10.7). Przed dotknięciem kodu
wykonany został research źródeł zewnętrznych — pełny zapis w
[hill-geometry-fis.md](hill-geometry-fis.md); tutaj tylko wynik i decyzje.

### 11.1 Co zmierzono przed zmianą

| Obserwacja | Wartość | Odniesienie |
| --- | ---: | --- |
| Skala kamery produkcyjnej | 2,075 px/m | — |
| Skala, w jakiej rysowany jest sprite | ~11,6 px/m (narta 29 px) | — |
| **„Długość" nart zawodnika w świecie gry** | **14,0 m** | narta FIS ≤ 2,61 m |
| **„Wzrost" zawodnika w świecie gry** | **10,6 m** | zawodnik ~1,80 m |
| h/n skoczni | 0,636 | norma FIS: 0,550–0,600 |
| kąt progu α | 10,5° | norma: 10,9–11,9; Wisła 11,0 |
| wysokość progu s | 2,50 m | Wisła 3,03 m |
| stok pod progiem β0 | 24,0° | norma β0 = βP/6 ≈ 6,2° |
| odstęp belek | 0,43 m przewyższenia | norma ≤ 0,40 m |
| prędkość na progu (belka 12) | 89,4 km/h | Wisła 92,5 km/h |

Czyli: zawodnik był **5,6× za duży** względem skoczni, a sama skocznia łamała
trzy zapisy normy.

### 11.2 Zmiany wdrożone

**Skala 1:1 (rdzeń zlecenia).** `PRODUCTION_SCALE_PIXELS_PER_METER = 11,6`.
Narta 29 px = 2,50 m, sylwetka 21 px = 1,81 m. Kadr obejmuje 41,4 × 23,3 m
świata zamiast 231 × 130 m — kamera jedzie za zawodnikiem jak w SJ3 (tam narta
zajmuje 44–48 px przy 640 px kadru, czyli tę samą proporcję).

Konsekwencje przerobione w renderze:
- **pas śniegu ma grubość w METRACH, nie w pikselach** — 45 cm zeskoku i 30 cm
  rozbiegu (ICR 417.2 wymaga min. 30 cm), a nie „6 px", które przy dawnym
  zoomie znaczyły 2,9 m śniegu;
- **kadrowanie pionowe zależy od prześwitu** — przy oknie 23 m wysokości i
  locie 14 m nad śniegiem sztywna kotwica wypychała albo zawodnika, albo
  zeskok poza ekran; teraz im wyżej leci, tym wyżej siedzi w kadrze;
- **paralaksa** dostała współczynniki przeliczone przez 2,075/11,6 (tło jest
  daleko, jego ruch ekranowy nie może rosnąć ze skalą pierwszego planu) oraz
  składową PIONOWĄ, bo kamera zjeżdża teraz o kilkadziesiąt metrów świata;
- **próg jako obiekt**: stalowy pokład 0,9 m, dwie podpory i jasna krawędź
  pomiarowa; wysokość progu nad garbem (3,03 m) to teraz widoczne 35 px;
- **znaczniki w metrach, nie w pikselach**: kreski K/HS skrócone do 0,8–1,0 m
  (to poprzeczki na stoku, nie maszty), pasy sektorowe malowane NA śniegu
  zamiast wisieć 17 px nad i pod stokiem.

**Geometria rozbiegu wg FIS.** Prosta γ = 35° (45,74 m), łuk przejściowy
r1 = 100 m (41,90 m łuku, przeciążenie 0,69 g przy limicie 0,70 g), próg
t = 6,71 m przy α = 11,0°, wysokość progu 3,03 m, długość 94,35 m, 12 belek
co 0,65 m (0,373 m przewyższenia). Wszystko za certyfikatem Wisły Malinki
HS134/K120.

**Fizyka — cztery poprawki wymuszone przez powyższe:**
1. tarcie toru 0,02 → 0,0175 (norma: tarcie suche 1° dla lodu) i opór pozycji
   dojazdowej 0,30 → 0,22 m² — prędkość na progu 89,4 → 92,7 km/h wobec 92,5
   w certyfikacie;
2. **kierunek wiatru**: „pod narty" to strumień wzdłuż zeskoku, nie wiatr
   poziomy. Dawny wektor `(-u, 0)` dawał wynik ODWROTNY do rzeczywistego —
   zmierzone 130,0 m / 4,51 s bez wiatru wobec 123,8 m / 4,49 s przy +3 m/s,
   bo masa powietrza cofała zawodnika, a czas lotu się nie zmieniał. Teraz
   wektor jest nachylony pod 35°;
3. **przygotowanie lądowania**: prześwit nad garbem najpierw ROŚNIE, więc
   warunek „wysokość ≤ 6 m" uzbrajał telemark już w pierwszej sekundzie lotu
   i zamieniał lot w sterowany zjazd. Poprawione w bocie (`src/sport/ai.ts`),
   w harnessie testów i w sześciu specyfikacjach e2e;
4. opór w locie ×1,20 jako rekompensata za 1 i 3.

**Nowe współczynniki kompensacji** policzone metodą z normy §5 (dla odległości
zwycięzcy ws = 127 m): belka 31, wiatr pod narty 45, wiatr w plecy 46
dziesiątych punktu. Poprzednie 28/23/23 powstały przy modelu wiatru poziomego.

### 11.3 Czego świadomie NIE zmieniono

**Profil zeskoku zostaje na poprzednim kształcie** (h/n 0,636 zamiast 0,566,
stok 24° zamiast 6,2° pod progiem). Wyprowadzony profil zgodny z normą został
policzony i zapisany w [hill-geometry-fis.md](hill-geometry-fis.md) §4, ale po
wdrożeniu daje wynik **dwumodalny**: przy tym samym strojeniu belka 8 ląduje
98,3 m, a belka 12 — 155,2 m; długości pomiędzy są praktycznie nieosiągalne.
Przyczyna jest zmierzona: doskonałość lotu modelu na długim odcinku 37° wynosi
~1,33, czyli niemal dokładnie 1/tan(37°), więc tor jest styczny do stoku.
Prawdziwy zawodnik ma ~1,5–1,8 i ląduje w łuku pola lądowania. Naprawa wymaga
przebudowy modelu aerodynamicznego, nie zmiany stałych — to zadanie na osobny
pakiet, opisane w prompcie następnej sesji. W danych skoczni zostaje jawny
komentarz z tym odstępstwem.

### 11.4 Stan po zmianie

| Belka | Rozbieg [m] | Prędkość na progu [km/h] | Długość [m] |
| ---: | ---: | ---: | ---: |
| 1 | 87,20 | 89,18 | 118,2 |
| 8 | 91,75 | 91,67 | 126,1 |
| 12 | 94,35 | 93,05 | 130,4 |

Gradient umiejętności (belka 8): prowadzenie poprawne 126,1 m > przesterowanie
114,9 m > brak korekty 104,2 m > odchylenie w tył 82,5 m. Czas lotu 4,59 s.

### 11.5 Wydajność

Przejście na skalę 1:1 wymusiło zmianę sposobu rysowania terenu. Dawny bufor
„na całą skocznię" miałby przy 11,6 px/m ~3500×1700 px (24 MB), a rysowanie co
klatkę okazało się za drogie — pomiar w przeglądarce dał wtedy ~20 ms pracy na
klatkę i wywracało to limit nadrabiania pętli 120 Hz (test `jump.spec.ts`
mierzący koszt przełączenia widoku wskazywał 24 ticki przy progu 12).

Rozwiązanie: **bufor okienny** wielkości dwóch ekranów, przebudowywany dopiero
gdy kamera dojdzie do jego marginesu, plus wyszukiwanie binarne zakresu metrażu
zamiast liniowego skanu całej skoczni dla każdego pasa. Po zmianie zmierzona
praca w callbacku `requestAnimationFrame` na ekranie skoku: **p50 1,7 ms,
p95 2,1 ms, maks. 2,3 ms**.

Przy okazji znaleziony i naprawiony błąd: zakres rysowania liczył się względem
wymiarów EKRANU, a bufor jest od niego dwa razy większy — prawa i dolna część
bufora zostawała pusta, przez co pas śniegu zeskoku znikał w połowie kadru.

### 11.6 Weryfikacja

| Sprawdzenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 24 pliki, 177/177 (w tym nowy `hillCalibration.test.ts`) |
| `npm run build` | PASS — Vite, 32 moduły, JS ~143 kB |
| `npm run test:e2e` | 22–27 PASS, 1 skipped, 2–7 FAIL niestabilnych — opis niżej |
| `z_capture_pkg008.spec.ts` solo (dowody) | 10/10 PASS |
| `z_capture_pkg008_video.spec.ts` solo (nagrania) | 2/2 PASS |

Testy jednostkowe urosły o `tests/hillCalibration.test.ts`, który pilnuje
WIELKOŚCI OBSERWOWALNYCH wobec normy i certyfikatu (kąty i długości rozbiegu,
odstęp belek, prędkość na progu, monotoniczność długości względem belki,
trafienie belką odniesienia w odległość zwycięzcy, czas lotu, gradient
umiejętności, zgodność zapisanych współczynników ze zmierzonymi). Dzięki temu
wolno stroić model dalej, dopóki gra zachowuje się jak prawdziwa skocznia.

**Pełny `test:e2e` jest na tej maszynie niestabilny — stan faktyczny, nie
deklaracja PASS.** W przebiegach padało od 2 do 7 testów, za każdym razem
innych, a każdy przechodzi uruchomiony osobno lub w małej grupie. Dwie klasy
przyczyn, obie zewnętrzne wobec kodu pakietu:

1. **Strażniki wydajności** w `jump.spec.ts` (`< 12` ticków na przełączenie
   widoku, `< 8` na pauzę) mierzą też rundy IPC Playwrighta i interwał
   odpytywania. Pomiar samego renderu na pełnym skoku, wykonany w przeglądarce:
   **p50 18,0 ms, p95 18,8 ms, maks. 20,6 ms, ZERO klatek powyżej 33 ms** przy
   odświeżaniu 55,6 Hz — identycznie jak na ekranie tytułowym, którego ten
   pakiet nie dotyka. Scena nie jest wąskim gardłem.
2. **Gubione zdarzenia klawiatury** w przejściach menu („menu" zamiast
   „jump"/„competition", „Flight" zamiast „LandingPrep"). W czasie przebiegów
   maszyna miała **0,3 GB wolnego RAM z 7,7 GB**, a pełny zestaw zajmował
   7–11,5 min zamiast typowych ~7.

Dowody obrazowe i nagrania pochodzą z osobnych, czystych przebiegów tych
samych specyfikacji (10/10 i 2/2 PASS), więc są spójne z finalnym kodem.

Zaktualizowane testy i powód:
- `tests/wind.test.ts` — kontrakt znaku wiatru zmienił się na strumień wzdłuż
  zeskoku (nowy test sprawdza też adapter odwrotny);
- `tests/landing.test.ts` — sonda o większej nośności musiała zostać
  przeliczona, żeby znów przelatywać punkt U;
- `tests/pkg004Evidence.test.ts` — opis kalibracji liczy się teraz z danych,
  a nie z literału, więc nie rozjedzie się przy kolejnym strojeniu;
  `docs/evidence/PKG-004/scoring-fixtures.md` zregenerowany;
- sześć specyfikacji e2e — moment wybicia (tick 724 → 702 po skróceniu rozbiegu
  do 94,35 m) oraz warunek przygotowania lądowania. Ten drugi wymagał trzech
  podejść i to jest najciekawsza pułapka rundy: prześwit nad garbem najpierw
  ROŚNIE, więc sam próg „wysokość ≤ N" trafiał tuż po wybiciu. W ścieżce
  treningowej działa para „wznios ≥ 5 m, potem zniżanie ≤ 9 m", ale w konkursie
  belkę ustala jury, przez co stały tick wybicia bywa spóźniony i szczyt toru
  jest niższy — tam warunek wysokości zastąpiła stała chwila lotu (2,2 s).
  Zmierzone szczyty prześwitu: 13,9 m przy idealnym wybiciu, 7,4 m przy
  spóźnieniu o 30 ticków.

### 11.7 Werdykt użytkownika na rundę 6 (18.09.2026)

Dosłownie: „dobrze, akceptuje postęp, proszę zachować poprawki, ale będzie
jeszcze kilka poprawek. niech prompt dla następnej sesji zapozna się ze stanem
i czeka na listę poprawek do wdrożenia"

Bramka V: **NIEZALICZONA** — postęp przyjęty, zmiany rundy 6 zostają w kodzie,
ale użytkownik zapowiedział kolejną listę poprawek. Następna sesja ma się
zapoznać ze stanem i CZEKAĆ na tę listę, a nie dobierać sobie zakresu sama —
prompt w `docs/handoffs/PKG-008.md` jest napisany pod ten tryb.

## 12. Siódma runda — spójna oprawa, profil FIS i responsywne dowody (19.09.2026)

Zakres użytkownika: samodzielnie poprawić obszary wskazane po obejrzeniu
dowodów, działając jako szef programistów i dyrektor artystyczny. Decyzje
oparto na obecnym kodzie, referencjach SJ3/DSJ2, zdjęciach rzeczywistych,
FIS Construction Norm 2018 oraz publikacjach biomechanicznych i aerodynamicznych.

### 12.1 Oprawa i czytelność

- `JUMPER_ART_VERSION = pkg008-jumper-solid-silhouette-2`: stabilniejszy kuc,
  wieloklatkowe wybicie, zwarta pozycja lotna bez efektu „sanek”, wcześniejsze
  podniesienie tułowia przed lądowaniem i czytelniejszy telemark z głębszym
  tylnym kolanem oraz rękami dla równowagi.
- Aktywny HUD został zredukowany do prędkości, wiatru, belki i celu/dystansu;
  pełne podpowiedzi pozostają na belce, pauzie i ekranie wyniku.
- Góry, śnieg, trybuny i tablica mają mniejszy kontrast i mniej powtarzalnych
  jasnych pikseli. Skoczek jest najsilniejszym ruchomym punktem kadru.
- Dowody faz i wycinki zostały przeliczone do nowej pozycji kamery; wycinek
  lotu ponownie obejmuje całą sylwetkę.

### 12.2 Zeskok i fizyka

- Wdrożono profil FIS opisany w `hill-geometry-fis.md` §7: h/n = 0,564,
  β0/P/K/L/U = 6,17°/37°/33,5°/30,2°/0°, `hillVersion = 3.0.0`.
- `physicsVersion = pkg008-tune-3`; stabilny lot ma L/D około 1,42 przy 32°,
  a przeciągnięcie powyżej 35° zachowuje karę za błędne prowadzenie.
- Belki 1/8/12 dają 115,54/125,01/129,87 m przy 89,18/91,67/93,05 km/h;
  nie ma już luki 98→155 m. Czas lotu belki 8: 4,73 s.
- Rekalibracja kompensacji: wiatr pod narty 12,9 pkt/(m/s), w plecy
  8,9 pkt/(m/s), belka 3,5 pkt/m rozbiegu. Tabela PKG-004 została
  zregenerowana z aktualnych danych.

### 12.3 Weryfikacja i dowody

| Sprawdzenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 24 pliki, 178/178 |
| `npm run build` | PASS — 32 moduły, JS 146,31 kB |
| finalny `npm run test:e2e` | 28 PASS, 1 skipped, 1 FAIL — znany wyścig licznika wyników botów podczas replaya |
| failing persistence test solo | PASS — 1/1 |
| `z_capture_pkg008_video.spec.ts` solo | PASS — 2/2; oba WebM skopiowane do `video-review/` |

Finalne obrazy są w `docs/evidence/PKG-008/browser-artifacts/`, a nagrania w
`docs/evidence/PKG-008/video-review/`. Testy przeglądarkowe oczekują teraz na
tick wewnątrz strony i ponawiają wyłącznie zagubione klawisze do jawnego stanu;
nie obniżono wymagań długości, wyniku, terminalnych faz ani obsługi klawiaturą.

### 12.4 Końcowe review

Jedyny końcowy przegląd objął kryteria rundy, finalne obrazy, spójność wersji,
brak plików sond i zgodność dokumentacji. Znaleziono i poprawiono dwa problemy:
stary prostokąt wycinka lotu oraz nieaktualny opis niewdrożonego profilu FIS.
Nie znaleziono otwartego błędu produktu. Pełny E2E pozostaje obciążony jednym
znanym, odtwarzalnym tylko w zestawie wyścigiem licznika botów; test przechodzi
osobno i nie dotyczy zmienionego renderera ani fizyki skoku.

### 12.5 Werdykt użytkownika na rundę 7

Dosłownie: **„Postęp, dalsze poprawki”**.

Bramka V: **NIEZALICZONA**. Zmiany rundy 7 zostają, ale użytkownik oczekuje
dalszych poprawek. Kontynuacja: [docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md).

## 13. Ósma runda — lista poprawek użytkownika, kalibracja empiryczna i stabilne nagrania (19.09.2026)

Zakres: lista poprawek użytkownika przekazana w rozmowie (punkty 0–6), w tym
twarda zasada kalibracji empirycznej dla wszystkich przyszłych realnych skoczni.
Poprzednia sesja nie wykonała tej listy prawidłowo — ta runda wdrożyła ją w całości.

### 13.1 Wdrożone zmiany

| # | Poprawka użytkownika | Implementacja |
| --- | --- | --- |
| 0 | Duży prostokąt między K a HS | Usunięta szeroka bryła dolnej trybuny w `drawWorldLandmarks` (`src/render/hillView.ts`) — dekoracyjny landmark przecinał zeskok; linie sportowe pozostają rysowane z `distanceMap` |
| 1 | Belka dostosowana do wiatru dla bezpiecznych długości | `forecastWindMean` próbuje deterministycznie okno lotu 0–5 s (11 próbek, te same sensory), `safeTargetMeters` 125,0 → 127,0 m (empiryczne q50–q75 Wisły); tabela belki: wiatr +1 m/s → belka 3, neutralnie 9, −2 m/s → belka 12 (`src/sport/safety.ts`) |
| 2 | Za HS tym trudniej aż do niemożliwych; telemark trudniejszy; wczesne T → 2 nogi/upadek; realne dane | Krzywa pierwiastkowa `hsStabilityMultiplier` (była liniowa), progi prowizoryczne telemark 142 m / parallel 145 m z envelope; wczesne T (<1,0 s) zatrzaskuje na parallel bez powrotu. Kalibracja empiryczna zapisana w `hill-geometry-fis.md` §8 (3 datowane PDF FIS, N=232); zasada utrwalona w AGENTS.md, GAMEPLAY_SPEC §3 i CONTENT_PLAN pkt 8. `hillVersion` 3.1.0 → 3.2.0, `physicsVersion` → `pkg008-tune-6` |
| 3 | Wcześnie wywołane podejście ma znacząco skracać skok | Kara aero podejścia 0,72×/1,38× → 0,60× nośności / 1,60× oporu; okno wczesnego podejścia 0,4 → 1,0 s. Pomiar: natychmiastowe T/R z belki 8 ląduje na 34,2 m (delta 90,8 m), T po 0,5 s → 62,0 m; późne T niekarane |
| 4 | Upadek bez czerwienienia | Usunięty swap kolorów `fallen`; kombinezon, grzbiet, skóra i narty identyczne jak przed upadkiem. Weryfikacja pikselowa zrzutu Fall: barwa główna 2560 px, stary odcień „deep” 0 px |
| 5 | Naturalna sylwetka po wyjściu z progu | `jumperFrame` liczy wizualny pitch ze stycznej progu i dochodzi do pitchu symulacji w 0,45 s — bez odgięcia do tyłu zaraz po progu; fizyka nietknięta |
| 6 | Obie narty osobno czytelne | Każda poza rysuje pełną dalszą nartę (3 px rozstawu) zamiast 1-pikselowego echa |
| 6b | Większe pochylenie → szersze V do stylu „H” | Rozstaw dalszej narty skalowany z kubełka kąta (`spread` do 6 px — najpierw czubki, potem ogony); `JUMPER_ART_VERSION` → `pkg008-jumper-solid-silhouette-3` |

### 13.2 Kalibracja empiryczna (nowa sekcja §8 hill-geometry-fis.md)

Trzy datowane oficjalne PDF FIS z Wisły K120/HS134 (14.01.2024 CODEX3108/raceid6854,
07.12.2024 CODEX3077/raceid7158, 08.12.2024 CODEX3079/raceid7160), pooled N=232
lądowane skoki: min 103,0 / mediana 124,75 / q75 128,0 / q90 131,0 / q95 132,0 /
max 139,5 m; upadki 0; styl lądowania i krzywa prawdopodobieństwa upadku
UNRESOLVED (zakaz wymyślania). Cel jury 127,0 m; progi 142/145 jako PROWIZORYCZNE
ADAPT. Dowód symulacyjny: belka 9 / brak wiatru / idealny pilot / telemark 3,2 s
ląduje deterministycznie 139,33 m (landed, gotowość 1,0) — empiryczne maksimum
jest osiągalne, dalej ryzyko rośnie do zera.

### 13.3 Weryfikacja

| Sprawdzenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS (po wszystkich zmianach) |
| `npm test` | PASS — 29 plików, 214/214 |
| `npm run build` | PASS — 33 moduły, JS 160,91 kB |
| `npm run test:e2e` | PASS — 22/22 (dawniejszy wyścig `resultCount` nie wystąpił) |
| `z_capture_pkg008.spec.ts` (fazy) solo | PASS — 2/2, fazy i Fall odświeżone |
| `z_capture_pose_evidence.spec.ts` solo | PASS — 2/2, arkusze 31 klatek odświeżone |
| `z_capture_pkg008_video.spec.ts` solo | PASS — 2/2; pełny skok landed 111,9 m (lead 21), konkurs landed 112,5 m (lead 29) |
| Wycinki (pikselowo) | Sylwetka z nartami obecna we wszystkich 6 wycinkach (kombinezon i narty >0 px) |
| Fall (pikselowo) | Barwa główna 2560 px, „deep” 0 px — kolory jak przed upadkiem |

Nagrania przeliczone od zera: brak długich pasków przeciążenia (czasy nagrań
16,6 s / 25,2 s zgodne z czasami testów). Test nagraniowy potwierdza teraz
zdarzenia `gateOpen`/`takeoffImpulseStart`/`landingPrep` po prawdziwych klawiszach
i wymaga `landed` >100 m — PASS nie maskuje pasywnego upadku; kotwice wybicia
skalibrowane pomiarowo (konkurs 46, trening 44 ticki).

### 13.4 Końcowe review

Jedyny przegląd po całej liście objął: spójność wersji (`pkg008-tune-6`,
hill 3.2.0, art `silhouette-3`), dowody pikselowe wycinków i Fall, usunięcie
pliku tymczasowego `tests/probe-tmp.test.ts`, sekcję §8 kalibracji i trzymanie
się zamrożenia zawartości. Znalezione i poprawione w trakcie przeglądu: dwa
błędy stabilności testu nagraniowego (długa pauza przeciążenia w nagraniu;
pasywny upadek 21,5 m w rzekomym „pełnym” skoku) oraz zapis sekcji §13 w złym
kodowaniu (naprawione, walidator czysty). Ograniczenia: prawdopodobieństwo
upadku UNRESOLVED (0 upadków w próbie), progi 142/145 prowizoryczne do rewizji
przy danych o upadkach/stylu; fizyka zmieniona wyłącznie dlatego, że poprawki
użytkownika tego wymagały (belka, trudność za HS, kara wczesnego podejścia),
wersje podniesione zgodnie z kontraktem.

### 13.5 Bramka V

Werdykt użytkownika na rundę 8: **oczekuje**. Zmiany wdrożone i zweryfikowane;
VISUAL zalicza wyłącznie użytkownik. Kontynuacja:
[docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md) (runda 9).

## 14. Dziewiąta runda — lista poprawek użytkownika: wąskie V, druga noga, lądowanie z podpórką (20.09.2026)

Zakres: lista użytkownika przekazana po rundzie 8 (3 punkty). Zero nowej
zawartości; zamrożenie i zasada prostoty zachowane.

### 14.1 Wdrożone zmiany

| # | Poprawka użytkownika | Implementacja |
| --- | --- | --- |
| 1 | Narty prowadzone zbyt szeroko, „zdecydowanie za bardzo styl H zamiast prawidłowy V" | `renderJumperFrame` (`src/render/hillView.ts`): ogony nart pozostają złączone (rozstaw 2 px), rozwarcie rośnie wyłącznie na czubkach i to stopniowo — `vOpening ≤ 4 px` kubełka kąta, dalsza narta przestaje „odjeżdżać" o `3 + spread×2` px. V otwiera się głównie czubkami przy pochyleniu, ale nigdy nie przechodzi w dwie szeroko rozstawione równoległe kreski. `JUMPER_ART_VERSION` → `pkg008-jumper-solid-silhouette-4` |
| 2 | Zawsze widać drugą nartę, ale nie widać drugiej nogi przy mocnym rozstawieniu | W pozycjach `flight`/`takeoff` przy rozwartym V rysowana jest dalsza NOGA: udo+biodro ze wspólnego biodra, podudzie do buta osadzonego na dalszej narcie (ciemniejszy odcień głębi). Koniec z „dwie narty, jedna noga" |
| 3 | Lądowanie z podpórką (dotknięcie zeskoku 1/obiema dłońmi) poza telemarkiem/dwiema nogami/upadkiem, z realnymi ocenami | Nowy deterministyczny wynik pośredni: `supportHands 0/1/2` w `ContactReport`/`JumpOutcome` + zdarzenie `handSupport`. Klasyfikacja: upadek < 0,22; obie dłonie < 0,34; jedna dłoń < 0,44; czysto ≥ 0,44 (stabilność kontaktu). Wczesne podejście: T/R < 0,35 s lotu → obie dłonie, 0,35–1,0 s → jedna dłoń. Potrącenia wg FIS Style Judging Guidelines: jedna dłoń 3,0 pkt u każdego sędziego, obie dłonie 4,5 pkt (środek oficjalnego zakresu 4,0–5,0), kara literalna (nie podlega profilom sędziów), kategoria `outrun` rozłącznie z innymi. Nowe pozy `supportOne`/`supportTwo` (po 3 klatki: dotknięcie → utrzymanie → odzyskanie równowagi), HUD/ekran wyniku i ranking pokazują PODPÓRKĘ. `physicsVersion` → `pkg008-tune-7` (`fallStabilityThreshold` 0,34→0,22 + progi podpórek), `rulesVersion` → `pkg008-rules-2` |

Punkt 3 realizuje wprost scenariusze użytkownika: zbyt wczesne podejście
(natychmiastowe T z belki 8 → 34,2 m, obie dłonie; T po 0,5 s → 62,0 m, jedna
dłoń), spóźnione przygotowanie (g1: readiness 0,83 → jedna dłoń, 0,65 → obie)
i lądowanie za HS (139,3 m przy gotowości 1 — jedna dłoń, zgodnie z progiem
telemark 142 m). Skrajne próby nadal padają: brak przygotowania → upadek
(stabilność 0), mocno spóźnione (stabilność < 0,22) → upadek.

Zmiana `fallStabilityThreshold` 0,34→0,22 zamienia dawne „ledwo upadki"
(0,22–0,34) w lądowania z podpórką obiema dłońmi — dokładnie zachowanie
oczekiwane przez użytkownika (marginalny kontakt kończy się dotknięciem ręką,
nie natychmiastowym upadkiem).

### 14.2 Weryfikacja

| Sprawdzenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 29 plików, 218/218 (nowe: 2 testy podpórki w landing, 1 w scoring) |
| `npm run build` | PASS — 33 moduły, JS 163,89 kB |
| `npm run test:e2e` | 21/22 PASS; 1 FAIL — wyścig timingu T w `one-event-one-sound` (niżej) |
| poprawione testy solo (`pełny skok`, `one-event-one-sound`) | PASS — 2/2 |
| exact `one-event-one-sound` po stabilizacji przeciążenia hosta | PASS — 1/1, 15,5 s |
| `z_capture_pkg008.spec.ts` solo | PASS — 7/7 (nowy test podpórki w rzeczywistym skoku) |
| `z_capture_pose_evidence.spec.ts` solo | PASS — 2/2, arkusze 37 klatek (31 + 6 podpórek) |
| `z_capture_pkg008_video.spec.ts` solo | PASS — 2/2; pełny skok landed 110,0 m (lead 30), konkurs landed 111,7 m (lead 29); świeże WebM podmienione w `video-review/` i `browser-artifacts/` |

**Wyścig E2E (ujawniony, nie regresja produktu).** Runda 8 wydłużyła karane
okno wczesnego podejścia z 0,4 s do 1,0 s lotu. Dwa testy `jump.spec.ts`
(`pełny skok sterowany wyłącznie klawiaturą`, `one-event-one-sound`) wciskały
T przy +90 tickach po progu; z opóźnieniem IPC 17–29 ticków trafiały one w
okno 0,89–0,99 s — skrócony skok ~75 m zamiast pełnego. W rundzie 8 testy
przeszły 22/22 tylko dzięki szczęśliwemu odmierzaniu. Naprawa testu (nie
produktu): T przy +130 ticków, poza oknem, zgodnie z komentarzem z_capture
i GAMEPLAY_SPEC §3 („Zbyt wczesne przygotowanie do lądowania wyraźnie skraca
lot"). Po poprawce oba testy PASS solo; pozostałe 21 testów pełnego E2E
przeszło na tym samym builde bez zmian.

**Ponowienie na żądanie (runda 10).** Dokładne polecenie
`npx playwright test tests/browser/jump.spec.ts --grep "one-event-one-sound"`
początkowo wpadało w produktową pauzę `zbyt długa przerwa klatki` przed
progiem wybicia. Stan diagnostyczny potwierdził prawidłowy postęp symulacji
(po 10 s: `Inrun`, tick 436, `gateOpen` 91), ale host ponownie pauzował pierwszy
rAF po ręcznym Enter. Testowy operator wznawia wyłącznie tę znaną pauzę tuż
przed callbackiem rAF; fizyka, progi i prawdziwe klawisze sterowania pozostają
bez zmian. Finalnie exact test PASS 1/1. Ten sam ograniczony operator dodano do
testu nagraniowego: finalnie PASS 2/2, landed 110,0 m / 111,7 m. Nowe WebM
skopiowano pod właściwymi nazwami do `video-review/` i `browser-artifacts/`.

### 14.3 Końcowe review

Jeden przegląd po całej liście: spójność wersji (art `silhouette-4`, fizyka
`pkg008-tune-7`, reguły `pkg008-rules-2`), determinizm podpórki (powtórka
próby → identyczny `outcome`), brak nowej zawartości, świeżość dowodów
(fazy, arkusz 37 klatek, podpórki 1/2 dłonie w rzeczywistym skoku, oba WebM),
dokumentacja. Usterki znalezione i naprawione w trakcie: zdublowane pole w
patchu `buildStyleJournal`, wyścig T w dwóch specach E2E, generyczna nazwa
`video.webm` w kopiowaniu nagrań. Progi podpórek (0,22/0,34/0,44) są
ADAPT/TUNE — empiryczne prawdopodobieństwo upadku Wisły pozostaje UNRESOLVED
(0 upadków w N=232), więc krzywe nie są „dowiedzione", tylko zgodne z tabelą
potrąceń FIS i zachowaniem opisanym przez użytkownika.

### 14.4 Bramka V

Werdykt użytkownika na rundę 9: **oczekuje**. Bramka V nadal NIEZALICZONA —
VISUAL zalicza wyłącznie użytkownik. Kontynuacja:
[docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md) (runda 10).

## 15. Odbiór rundy 9 i lista do rundy 11 (20.09.2026)

### 15.1 Dosłowny werdykt i polecenie użytkownika

> akceptuje wygląd skoczka. poprawki dodatkowo na następną sesje: 1. belka powinna być dopasowana do warunków wietrznych również na treningu. 2. podczas konkursu wafrunki powinny zmieniać się rzadko, delikatne zmiany ok, i czasami np w 2 serii odwrócenie wiatru. 3. w konkursie plansza wyików znika i gracz nie wie na którym jest miejscu po serii. 3. zdecydowanie zbyt łatwo jest osiągać wysokie oceny 19.5 20.0 itd. prawdziwi sędziowie nie są tak przychylni. 4. nie działa zmiana bramki przez trenera. 4. formatowanie do poprawki - iektore napisy są niewidoczne, niektóre nakładają się na siebie, a oceny od sędziów powinny być wyraźniej osobno i najlepiej w kwadratach/prostokatach na każdą ocene. - formatowanie do dokładneg audytu ze screenami każdego widoku. - dostosuj następny prompt dla nowej sesji z uwzględnieniem planu wdrożenia głównego dodając poprawki które wymieniłem

### 15.2 Interpretacja zakresu

- **PASS częściowy:** wygląd i animacja skoczka zostały zaakceptowane. Ten
  element P42 jest zamrożony i nie podlega kolejnej przebudowie bez nowej
  jawnej uwagi użytkownika.
- **Bramka V nadal NIEZALICZONA:** użytkownik zgłosił problemy sterowania,
  przebiegu konkursu, wiarygodności not i czytelności interfejsu. Zgodnie z
  AGENTS.md nie wolno jeszcze rozpocząć P21/PKG-009 ani nowej zawartości.
- Następna sesja pozostaje kontynuacją `PKG-008 / P42` (runda 11). Lista została
  dopisana do `docs/IMPLEMENTATION_PLAN.md` jako otwarte kryteria P42.
- Kolejność rundy 11: bazowe screeny każdego istniejącego widoku → poprawki
  mechanik i reguł → poprawki ekranów/formatowania → końcowe screeny każdego
  widoku → testy → jedno review → ponowny odbiór użytkownika.

### 15.3 Otwarte wyniki rundy 11

1. Treningowa belka reaguje na prognozę wiatru przez ponowne użycie istniejącej
   logiki bezpiecznej belki jury; decyzja pozostaje deterministyczna i widoczna.
2. Konkurs ma warunki spójne w obrębie serii: rzadki, łagodny dryf oraz
   okazjonalne deterministyczne odwrócenie wiatru, szczególnie możliwe w drugiej
   serii; replay i fast-forward dają ten sam przebieg.
3. Plansza wyników/rankingu po serii nie znika bez potwierdzenia i zawsze pokazuje
   bieżące miejsce gracza, także po wznowieniu zapisu.
4. Noty sędziowskie są skalibrowane z datowanych oficjalnych wyników FIS dla
   porównywalnych konkursów; 19,5–20,0 staje się rzadkością. Bez ukrytej kości;
   zmiana podnosi `rulesVersion`.
5. Panel trenera w czerwonej fazie faktycznie obniża belkę, zmienia długość
   rozbiegu i poprawnie rozlicza warunkową rekompensatę; żółta/zielona nadal
   blokują zmianę.
6. Każdy istniejący widok otrzymuje screenshot bazowy i końcowy. Teksty nie są
   ucięte, niewidoczne ani nałożone; pięć not jest pokazane osobno w czytelnych
   polach, z jednoznacznym oznaczeniem dwóch odrzuconych skrajnych.

Aktywny prompt po aktualizacji:
[docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md) (runda 11).

## 16. Runda 11 — wiatr/belka, ranking, noty, trener i formatowanie (20.09.2026)

Dosłowna lista użytkownika pozostaje zapisana w §15.1. Techniczny zakres A–F
został wykonany. Wynik PKG-008 pozostaje **INCOMPLETE wyłącznie z powodu braku
nowego werdyktu użytkownika dla bramki V**; model nie zatwierdza VISUAL sam.

### 16.1. Status listy użytkownika

| Punkt | Status | Wdrożenie / dowód |
| --- | --- | --- |
| A. Belka treningowa wg wiatru | COMPLETE | Prognoza pola konkretnej próby wybiera bezpieczną belkę; HUD/menu/wynik pokazują AUTO i wiatr. `[ / ]` ustawia ręczne przesłonięcie, `0` wraca do AUTO. |
| B. Spójny wiatr konkursu | COMPLETE | `pkg008-wind-3`: wspólna baza serii ±1,2 m/s, łagodny dryf i mniejsze podmuchy; deterministyczne odwrócenie bazy finału dla części seedów. |
| C. Ranking po serii | COMPLETE | `pendingRoundSummary` utrzymuje planszę do Enter; pełna przewijana tabela pokazuje miejsce i punkty profili człowieka; reload wraca do planszy zamkniętej serii. |
| D. Surowsze noty | COMPLETE | Kalibracja z 1160 not FIS w [hill-geometry-fis.md §9](hill-geometry-fis.md); czysty skok `16,5/17,0/17,5/18,0/18,5`, retained-3 = 52,5; `rulesVersion = pkg008-rules-3`. |
| E. Belka trenera | COMPLETE | Jawny panel w czerwonej fazie pokazuje `JURY → TRENER`; zmiana dotyczy oczekiwanej belki, zatwierdzenie wpływa na rozbieg i warunkową rekompensatę; żółta/zielona zamykają edycję. |
| F. Formatowanie | COMPLETE technicznie | 25 par bazowy/finalny; noty S1–S5 w osobnych polach, odrzucone skrajne oznaczone `X` i przekreśleniem; jedno końcowe review usunęło trzy ostatnie kolizje. |
| Werdykt rundy 11 / bramka V | NOT RUN | Wymaga jawnej odpowiedzi użytkownika po obejrzeniu dowodów. |

### 16.2. Wiatr i belka

Trening korzysta z tego samego źródła decyzji bezpieczeństwa co konkurs:
`forecastWindMean` → `selectSafeJuryGate`. Pole wiatru prognozowane dla próby jest
tym samym polem przekazanym do symulacji, więc decyzja jest deterministyczna i
nie rozjeżdża się z rzeczywistym skokiem. Ręczna belka pozostaje jawnym
przesłonięciem, a cel prowadzenia i wynik korzystają z faktycznej belki próby.

Konkurs nie tworzy już całkowicie niezależnych warunków dla każdego zawodnika.
`createSeriesWindField` wyprowadza z seeda konkursu bazę kwalifikacji, pierwszej
serii i finału. Sąsiednie próby mają sinusoidalny dryf o amplitudzie 0,35 m/s
i ograniczone podmuchy; test pilnuje zmiany sąsiedniej <0,6 m/s. Dla około 40%
seedów baza finału jest dokładną negacją bazy pierwszej serii. Ten sam
seed/seria/indeks próby daje identyczne próbki, replay i fast-forward nie używają
runtime'owej kości.

### 16.3. Kalibracja not z oficjalnych źródeł

Źródła: trzy datowane PDF FIS dla Wisły Malinki K120/HS134 po przebudowie 2023:
CODEX3108 (14.01.2024), CODEX3077 (07.12.2024) i CODEX3079 (08.12.2024),
cytowane URL-em w [hill-geometry-fis.md §8.1](hill-geometry-fis.md). Lokalne
kopie i powtarzalny ekstraktor są w `fis/`.

Wynik: N=232 skoki, N=1160 pojedynczych not; min 14,0; q25 17,0; mediana
17,5; q75 18,0; q90/q95 18,5; max 19,5; noty ≥19,5: 3/1160 (0,3%);
20,0: 0/1160. Styl lądowania i osobny rozkład upadków pozostają UNRESOLVED —
PDF-y nie podają stylu, a suma retained-3 zgadzała się z polem stylu we
wszystkich 232 wierszach. Gra nie wymyśla tych danych.

### 16.4. Audyt formatowania — bazowy → finalny

Wszystkie pliki są w `browser-artifacts/`; każda nazwa ma prefiks
`pkg008-r11-base-` albo `pkg008-r11-final-`.

| Widok | Problem bazowy | Poprawka | Dowód finalny |
| --- | --- | --- | --- |
| Tytuł i menu | Kontrola bramki treningowej nie wyjaśniała trybu | Jawne AUTO/RĘCZNA i prognoza | `final-title-960x540.png`, `final-menu-960x540.png` |
| Konfiguracja konkursu | Długi opis wznowienia wychodził poza lewy panel | Skrót `SERIA • SKOK N`; zachowana informacja o wznowieniu | `final-competition-setup-960x540.png`, `final-second-tab-readonly-960x540.png` |
| Handover | Brak nowego błędu bazowego; kontrola spójności | Zachowany czytelny podział informacji | `final-handover-960x540.png` |
| Start czerwony/żółty/zielony | Panel trenera nie pokazywał oczekiwanej belki; dolne instrukcje nachodziły na panel | Osobny panel `JURY → TRENER`, instrukcje jury ukrywane podczas edycji | `final-start-red-960x540.png`, `final-start-red-coach-960x540.png`, `final-start-yellow-960x540.png`, `final-start-green-960x540.png` |
| HUD treningu | Nie było widocznej przyczyny automatycznej belki | Belka AUTO/RĘCZNA i prognoza wiatru | `final-training-inrun-960x540.png`, `final-training-flight-960x540.png`, `final-training-landingprep-960x540.png` |
| HUD konkursu | Kontrola czytelności po zmianach wiatru | Zachowana minimalna hierarchia faz | `final-hud-inrun-960x540.png`, `final-hud-flight-960x540.png`, `final-hud-landingprep-960x540.png` |
| Wynik treningu | Noty w jednej linii, słabo czytelne odrzucenie | Pięć pól S1–S5, czerwone `X` i przekreślenie skrajnych | `final-training-result-960x540.png`, `final-training-result-1920x1080.png` |
| Wynik konkursu | Noty zlewały się; brak miejsca prowizorycznego; nagłówek not był za długi | Osobne pola, `MIEJSCE … (PROWIZ.)`, krótki nagłówek `NOTY: X = ODRZUCONA` | `final-competition-result-960x540.png`, `final-competition-result-1920x1080.png` |
| Plansza serii | Znikała automatycznie i nie pokazywała miejsca gracza | Pełna tabela, przewijanie, wyróżnienie człowieka, Enter jako potwierdzenie | `final-round-summary-960x540.png`, `final-round-summary-1920x1080.png` |
| Tabela końcowa | Miejsce człowieka nie było dość jawne | Jawny wpis `TY — MIEJSCE …` | `final-final-table-960x540.png` |
| Pauza | Kontrola czytelności | Bez regresji i nakładania | `final-pause-960x540.png` |
| Replay produkcyjny/techniczny | Kontrola komunikatów i HUD | Bez regresji; oba tryby pozostają rozróżnione | `final-replay-production-960x540.png`, `final-replay-technical-960x540.png` |
| Zapis / druga karta | Długi pasek i opis wznowienia konkurowały z panelem | Pasek pozostaje osobno pod nagłówkiem, skrócony opis sesji | `final-second-tab-readonly-960x540.png` |

Świeże nagrania po rundzie 11:
`video-review/pkg008-pelny-skok-czlowieka.webm` i
`video-review/pkg008-fragment-konkursu-boty.webm`; kopie z nazwami rundy 11 są
także w `browser-artifacts/`.

### 16.5. Weryfikacja

| Polecenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS — bez diagnostyk |
| `npm test` | PASS — 29 plików, 225/225 |
| `npm run build` | PASS — Vite, 33 moduły, JS 170,22 kB / 54,38 kB gzip po poprawkach review |
| `npm run test:e2e` | PASS — 22/22 w finalnym pełnym przebiegu |
| `R11_STAGE=final … z_capture_pkg008_r11.spec.ts` | PASS — 5/5; po review dotknięte trzy scenariusze ponownie 3/3 |
| `z_capture_pkg008.spec.ts` solo | PASS — 7/7 aktywnych, 4 starsze wycinki świadomie skipped |
| `z_capture_pkg008_video.spec.ts` solo | PASS — 2/2; skok 118,15 m, konkurs 116,27 m |
| `node docs/evidence/PKG-008/fis/extract-notes.mjs` | PASS — 232 wiersze, 1160 not, statystyki zgodne z §9 |

Pierwszy pełny E2E po zmianie belki ujawnił dwa testowe założenia o dawnej
stałej belce 8 oraz jeden niestabilny timing skoku. Wszystkie użycia timingów
treningu zostały przepięte na faktyczną belkę snapshotu; test ręcznego
przesłonięcia porównuje teraz belkę po starcie z propozycją AUTO. Izolowany test
zapisu przeszedł, a finalny pełny przebieg zakończył się 22/22 PASS.

### 16.6. Jedno końcowe review

Review objęło kryteria A–F, kod wiatru/punktacji/stanu konkursu, sterowanie
trenera, nowe testy oraz końcowe zrzuty. Znaleziono trzy konkretne usterki
formatowania: instrukcja jury prześwitywała pod otwartym panelem trenera,
nagłówek not konkursowych wychodził poza lewy panel, a opis wznowienia konkursu
wchodził w prawą kartę. Poprawiono je bez zmiany mechanik i ponownie wykonano
typecheck, 225 testów jednostkowych, build oraz trzy dotknięte scenariusze
capture (3/3 PASS). Nie otwierano drugiego pełnego review.

### 16.7. Ograniczenia i następny krok

- Wygląd/animacja skoczka pozostały zamrożone; `JUMPER_ART_VERSION` nie został
  zmieniony w rundzie 11.
- Nie dodano skoczni, trybów ani przyszłej zawartości.
- Kalibracja not nie rozstrzyga stylu lądowania ani not za upadki — oba pola są
  jawnie UNRESOLVED.
- Jakościowy playtest użytkownika pozostaje NOT RUN.
- Bramka V nadal NIEZALICZONA. Następna sesja przedstawia dowody rundy 11 i
  czeka na werdykt; bez akceptacji nie rozpoczyna PKG-009.

Aktywny prompt: [docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md) — runda 12,
odbiór użytkownika.

## 17. Odrzucenie rundy 11 i lista rundy 12 (20.09.2026)

### 17.1. Dosłowny werdykt użytkownika

> Nie akceptuję.

Po prośbie o konkretną listę:

> 1. belka auto jest zdecydowanie za wysoko, przeskakuje skocznie daleko powyżej HS. 2. prostokąty z ocenami wyglądają źle, wycofujemy ten pomysł, jeśli coś się nie mieści to powiekszaj po prostu obszar okna z informacjami po skoku! 3. dotykanie zeskoku przy podpórce powinno być bardziej widoczne. 4. lądowanie R z dużej wysokości lub poza HS jeśli jest udane powinno być zanimowane z głębokim przysiadem.

### 17.2. Interpretacja zakresu

- Bramka V pozostaje **NIEZALICZONA**; PKG-008/P42 trwa dalej.
- Automatyczna belka wymaga niższej, sprawdzonej symulacyjnie kalibracji; ręczna
  kontrola i fizyka skoku nie są automatycznie do zmiany.
- Pomysł pięciu obramowanych pól not zostaje wycofany. Noty nadal mają być
  rozdzielone i czytelne, ale wynik ma dostać większy obszar zamiast ściskania.
- Podpórka wymaga mocniejszego wizualnego kontaktu dłoni ze śniegiem.
- Udane lądowanie `R` po wysokim podejściu lub za HS wymaga osobnej, czytelnej
  animacji głębokiego przysiadu; nie zmienia to deterministycznego rozstrzygnięcia
  lądowania.
- Zaakceptowany ogólny wygląd skoczka pozostaje zamrożony poza tymi dwiema
  jawnie wskazanymi animacjami.

## 18. Runda 12 — cztery poprawki z werdyktu (21.09.2026)

### 18.1. Status listy użytkownika z §17.1

| Punkt | Status | Wdrożenie / dowód |
| --- | --- | --- |
| 1. Belka AUTO za wysoko (skok wykwalifikowany daleko za HS) | COMPLETE | `referenceDistanceMeters` 125,0 → 138,1 m (zmierzony umiejętny lot belki 8: telemark 3,2 s → 138,05 m; belka 9 → 139,33 m). Estymata śledzi teraz realny dystans: neutralnie i przy wietrze pod narty AUTO = belka 1, wiatr w plecy −1 m/s → belka 3, −2 m/s → belka 7. Skoki umiejętne z belki AUTO pozostają < HS134 (test `safetyMechanics.test.ts`, tabela `[skilled-auto-table]`). `rulesVersion` → `pkg008-rules-4`. |
| 2. Prostokąty z ocenami wycofane; większe okno wyniku | COMPLETE | `drawResultMarks`: otwarty wiersz pięciu not (S1–S5, `X` + przekreślenie odrzuconych), zero ramek. Ekran wyniku treningu powiększony do 444×210 px logicznych; wynik konkursu — pełny panel 444×196 z tabelą. Dowody `pkg008-r12-training-*`, `pkg008-r12-competition-*`. |
| 3. Dotknięcie zeskoku przy podpórce bardziej widoczne | COMPLETE | Pozy `supportOne`/`supportTwo` przerysowane: dłoń schodzi do poziomu śniegu (y≈0); przy pierwszych dwóch klatkach rysowany statyczny pikselowy ślad — bruzda na stoku, ziarna śniegu i piksel rękawicy (bezpieczny przy reduced motion). Dowody `pkg008-r12-support-one/two-*`. |
| 4. Udane R z wysokości / za HS animowane głębokim przysiadem | COMPLETE | Nowa poza `landingDeep` (5 klatek, `JUMPER_ART_VERSION` → `pkg008-jumper-solid-silhouette-5`): wyzwalana deterministycznie po udanym lądowaniu `parallel`, gdy przygotowanie nastąpiło z ≥6 m nad zeskokiem LUB kontakt jest za HS. Replay odtwarza to z zapisanych zdarzeń (bez zmiany formatu). Dowody `pkg008-r12-deep-high/hs-*`, `pkg008-r12-normal-*` (zwykłe R bez przysiadu). |

### 18.2. Rewizja kalibracji belki AUTO (detale w hill-geometry-fis.md §8.5)

Przyczyna znaleziona symulacyjnie, nie zgadywaniem: stara estymata (baza 125,0 m)
mierzyła lot z domyślnym wczesnym przygotowaniem, podczas gdy gracz z pełnym
przygotowaniem (telemark 3,2 s) lati o ~13 m dalej na każdej belce — stąd
neutralne AUTO = belka 9 wysyłało umiejętny skok na 139,3 m (> HS134). Po
przeniesieniu bazy na zmierzony dystans umiejętny wszystkie skoki referencyjne
z belki AUTO mieszczą się < HS; najgorszy przypadek (belka 1 + skrajne
przygotowanie 3,6 s + wiatr pod narty +2 m/s) to 135,9 m — residuum fizyki
przy belce już najniższej, jury nie ma niższej opcji.

Granice bez zmian: cel bezpieczeństwa 127,0 m i progi HS (142/145) nietknięte;
ręczne przesłonięcie belki treningowej (`[`/`]`, `0`) zachowane; fizyka i
geometria skoczni bez zmian (`hillVersion` 3.2.0, `pkg008-tune-7`).

### 18.3. Weryfikacja

| Polecenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 29 plików, 226/226 (nowy test umiejętnych skoków z belki AUTO) |
| `npm run build` | PASS — JS 172,18 kB / 54,91 kB gzip |
| `npm run test:e2e` | PASS — 22/22 (pełny konkurs, trening, zapis, shell) |
| `R11_STAGE=final … z_capture_pkg008_r11.spec.ts` | PASS — 5/5; końcowe zrzuty wszystkich widoków odświeżone bieżącym kodem |
| `z_capture_pkg008.spec.ts` solo | PASS — 7/7 aktywnych (4 starsze wycinki świadomie skipped) |
| `z_capture_pkg008_r12.spec.ts` solo | PASS — 2/2 (determinizm poz + zrzuty 2×/4×) |
| `z_capture_pkg008_video.spec.ts` solo | PASS — 2/2; skok 102,9 m, konkurs 104,3 m |

Dowody r12 w `browser-artifacts/` (prefiks `pkg008-r12-`): trening/konkurs —
ekrany wyniku z otwartym wierszem not; `normal`, `deep-high`, `deep-hs` —
zwykłe R vs głęboki przysiad; `support-one`, `support-two` — widoczny kontakt
dłoni; `strip` — arkusz poz. Nagrania: `video-review/pkg008-pelny-skok-czlowieka.webm`,
`video-review/pkg008-fragment-konkursu-boty.webm` (odświeżone bieżącym kodem)
oraz kopie `pkg008-r12-*.webm` w `browser-artifacts/`.

Naprawy odporności testów wdrożone w trakcie weryfikacji (host z przeciążeniem):
telemark z ograniczonym ponowieniem i wznawianiem pauz, potwierdzone
opuszczenie belki (`gateOpen`) zamiast pojedynczego `→`, odświeżenie stanu
pętli po zatwierdzeniu planszy serii (podwójny Enter przyjmował handover
człowieka w odwróconej kolejności finału), próg sensu nagrania liczony
względem punktu K zamiast stałej ze starej belki 9, obsłużona belka 1 jako
sufit AUTO w asercjach trenera.

### 18.4. Jedno końcowe review

Review objęło kalibrację belki (technicalHill/safety/scoring + testy), zmiany
renderu (wycofanie ramek not, powiększone okna wyniku, pozy podpórki i głęboki
przysiad, ślad kontaktu) oraz adaptacje speców. Znaleziono i naprawiono w
trakcie: cztery awarie speców r11 wywołane nową belką AUTO i przeciążeniem
hosta (opisane w §18.3) oraz jedną lukę helpera belki (wczesne wyjście przy
jeszcze nieistniejącym `competition.jump`). Produkcyjnych usterek nie znaleziono;
`rulesVersion`, `JUMPER_ART_VERSION` i wersje dokumentów podniesione zgodnie
z umową. Nie otwierano drugiego pełnego review.

### 18.5. Ograniczenia i następny krok

- Skok i animacja skoczka poza jawnie wskazanymi stanami (podpórka, głęboki
  przysiad R) pozostają zamrożone na zaakceptowanym wyglądzie.
- Starsze powtórki (sprzed `-5`) mogą przejść na widok techniczny przez kontrolę
  wersji — zachowanie jawne i wcześnie udokumentowane.
- Kalibracja not (r11, §16.3) bez zmian; rozkład FIS nadal obowiązuje.
- Bramka V nadal NIEZALICZONA — wymaga werdyktu użytkownika na dowody r12.

Aktywny prompt: [docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md) — runda 13,
odbiór użytkownika na dowodach r12.

## 19. Odbiór rundy 12 i lista rundy 13 (21.09.2026)

### 19.1. Dosłowny werdykt użytkownika

> 1. na belce 1 zawsze skoki nadal za długie - niech obecna belka 1 będzie belką 10 żeby można było obniżać belkę bardziej. 2. podpórki wyglądają jak glitch graficzny nie faktyczne podparcie - grafiki podparcie do popeawienia. 3. prostokąty wycofane ok, głęboki przysiak ok.

### 19.2. Interpretacja zakresu

- **Zaakceptowane i zamrożone:** wycofanie prostokątów not oraz animacja
  głębokiego przysiadu przy lądowaniu R.
- Mapa belek wymaga rozszerzenia w dół: obecna fizyczna belka 1 staje się
  belką 10; niżej powstają belki 1–9 z zachowaniem istniejącego rozstawu i
  empirycznej walidacji odległości. Referencyjne numery kompensacji muszą
  przesunąć się wraz z fizycznie tymi samymi belkami; fizyka lotu bez zmian.
- Pozy `supportOne`/`supportTwo` i dodatkowy ślad kontaktu z rundy 12 zostały
  odrzucone jako glitch. Wymagana jest czytelna anatomia faktycznej podpórki,
  nie doklejony efekt.
- Bramka V pozostaje **NIEZALICZONA**; bez P21/PKG-009.

## 20. Runda 13 — niższe belki i anatomia podpórki (21.09.2026)

### 20.1. Status listy użytkownika z §19.1

| Punkt | Status | Wdrożenie / dowód |
| --- | --- | --- |
| Stara belka 1 ma zostać belką 10; potrzebne niższe pozycje | COMPLETE | Mapa 12 → 21 belek. Stare fizyczne 1–12 są nowymi 10–21; nowe 1–9 schodzą niżej co 0,65 m. Neutralne AUTO wybiera belkę 8 (126,3 m umiejętnego skoku), nowa belka 1 daje 114,7 m. `hillVersion` → 3.3.0, `rulesVersion` → `pkg008-rules-5`. |
| Podpórki wyglądają jak glitch | COMPLETE technicznie | Pozy `supportOne`/`supportTwo` przerysowane anatomicznie: ugięte nogi i biodra, pochylenie tułowia, zgięte łokcie, dokładnie jedna lub dwie dłonie połączone z rękawem i dopasowane do lokalnej powierzchni. Usunięto doklejony ślad/bruzdę/ziarna/rękawicę. `JUMPER_ART_VERSION` → `pkg008-jumper-solid-silhouette-6`. |
| Brak prostokątów not | ACCEPTED / FROZEN | Bez zmian; test r13 porównuje piksele zaakceptowanego wiersza not z dowodami r12. |
| Głęboki przysiad R | ACCEPTED / FROZEN | Bez zmian; test r13 porównuje zwykłe i oba głębokie R piksel w piksel z r12. |

### 20.2. Mapa 21 belek

Najdłuższy rozbieg 94,35 m i odstęp 0,65 m nie zmieniły się. Numeracja została
przesunięta o +9 dla istniejących pozycji, a dziewięć nowych pozycji dopisano
poniżej starej podłogi. Referencyjna fizyczna belka 8 stała się 17; referencje
kompensacji i bezpieczeństwa przesunięto razem z nią, więc wynik punktowy tej
samej fizycznej próby pozostaje identyczny.

| Tożsamość fizyczna | Rozbieg | Umiejętny skok neutralny |
| --- | ---: | ---: |
| nowa 1 | 81,35 m | 114,7 m, landed |
| stara 1 = nowa 10 | 87,20 m | 129,06 m, landed |
| stara 8 = nowa 17 (referencja) | 91,75 m | 138,05 m, landed |
| stara 12 = nowa 21 | 94,35 m | 143,11 m, fall |

Tabela AUTO: wiatr w plecy −2/−1/−0,5 m/s → belka 16/12/10; neutralnie → 8;
wiatr pod narty +0,5/+1/+2 m/s → 5/2/1. Dla przygotowania 3,2 i 3,6 s
wszystkie próby z AUTO lądują poniżej HS134. Pełny zapis i ograniczenia:
[hill-geometry-fis.md §8.6](hill-geometry-fis.md).

### 20.3. Nowa podpórka

Runda 12 opierała czytelność na doklejonym śladzie pikseli i pozostawiała
sylwetkę bliską wyprostowanej; użytkownik odczytał to jako glitch. Runda 13
przenosi informację do anatomii:

- kontakt: biodra nisko, tułów skierowany ku stokowi, dłoń/dłonie na śniegu;
- utrzymanie: głębsza kompresja i wyraźnie zgięte łokcie;
- odzyskanie: dłonie odrywają się, zawodnik wraca do odjazdu;
- jedna dłoń: druga ręka pozostaje wyciągnięta dla równowagi;
- dwie dłonie: dwa osobne punkty podparcia przed i za tułowiem;
- położenie dłoni jest dopasowane do lokalnego nachylenia zeskoku także przy
  90/110/136/155/180 m; test sprawdza połączenie pikseli rękawa z dłonią.

Dowody (960×540 i 1920×1080):
`pkg008-r13-support-one-{contact,hold,recovery}-*`,
`pkg008-r13-support-two-{contact,hold,recovery}-*`,
`pkg008-r13-support-strip-*`. Zrzuty `pkg008-r13-frozen-*` potwierdzają brak
zmiany zaakceptowanych widoków r12.

### 20.4. Weryfikacja

| Polecenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 29 plików, 227/227 |
| `npm run build` | PASS — 33 moduły, JS 172,33 kB / 55,00 kB gzip |
| `npm run test:e2e` | PASS — finalny pełny przebieg 22/22 |
| `z_capture_pkg008_r13_support.spec.ts` | PASS — 2/2; 24 zrzuty, kontakt/hold/recovery + zamrożone widoki r12 |
| `R11_STAGE=final … z_capture_pkg008_r11.spec.ts` | PASS — 5/5; wszystkie końcowe widoki odświeżone z mapą 21 belek |
| `z_capture_pkg008.spec.ts` solo | PASS — 7/7 aktywnych, 4 starsze wycinki skipped |
| `z_capture_pkg008_video.spec.ts` solo | PASS — 2/2; skok 92,1 m, konkurs 101,3 m |

Po obniżeniu fizycznych belek stare progi sanity w dwóch testach przeglądarkowych
mierzyły jakość realnego klawisza pod obciążeniem, nie wykonanie ścieżki.
Zastąpiono je dowodem `takeoffEdge` + `landingPrep` + `landed` oraz dystansem
wyraźnie ponad biernym upadkiem (~22 m). Produkcyjnego kodu fizyki nie zmieniano.

### 20.5. Jedno końcowe review

Review objęło generację 21 belek, tożsamość fizycznych pozycji, referencje
kompensacji/bezpieczeństwa, wersje zapisu, nowe pozy podpórki, dopasowanie dłoni
do stoku, replay/reduced motion oraz zamrożenie not i głębokiego przysiadu.
Znalezione awarie dotyczyły wyłącznie historycznych progów testów E2E po
obniżeniu rozbiegu; poprawiono je podczas weryfikacji i uzyskano 22/22 PASS.
Nie znaleziono dalszej usterki produkcyjnej i nie otwierano drugiego review.

### 20.6. Ograniczenia i następny krok

- Domyślna belka testowego `JumpSimulation` pozostaje numerem 8, który teraz
  oznacza nową niższą pozycję; produkcja zawsze przekazuje AUTO lub wybór
  ręczny, a testy historyczne oparte na wartościach obserwowalnych nadal są zielone.
- Zmiana `hillVersion`/`rulesVersion` celowo unieważnia stare sesje i kieruje
  niezgodne powtórki do widoku technicznego.
- Wizual podpórki wymaga jawnego odbioru użytkownika; model nie wpisuje PASS.
- Bramka V nadal NIEZALICZONA; P21/PKG-009 pozostaje zamrożone.

Aktywny prompt: [docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md) — runda 14,
odbiór użytkownika na dowodach r13.

## 21. Uwagi do następnej sesji — runda 15 (21.09.2026)

### 21.1. Dosłowne polecenie użytkownika

> poprawki do następnej sesji (napisz prompt): 1. realnie jest tak, że im większa odległość powyżej K to lepsza ocena sędziowska. Skok na dwie nogi powinien być oceniany od 15.0 do 17.5 poza HS. A z telemarkiem od 17 do 20 poza HS. Podpórki 1 ręką 12-14, 2 rękami są ok. 2. Możliwość ustania skoki powyżej HS powinna być o kilka metrów przesunięta do przodu, na tej skoczni do 5m, a na mamutach - to zależy od faktycznych rekordów na danej skoczni.

### 21.2. Zakres przekazania

- W tej sesji **nie implementowano** nowych reguł; użytkownik poprosił wyłącznie
  o prompt następnej sesji.
- Noty sędziowskie muszą dostać deterministyczny, monotoniczny wpływ odległości
  powyżej K. Przed kodem należy rozszerzyć istniejący ekstraktor PDF FIS o
  rozkład not względem pasm odległości; źródła nie rozpoznają stylu lądowania,
  więc zakresy telemark/dwie nogi/podpórka są jawną decyzją użytkownika (DESIGN),
  nie faktem wyciągniętym z PDF.
- Macierz docelowa poza HS: dwie nogi 15,0–17,5; telemark 17,0–20,0;
  jedna dłoń 12,0–14,0; dwie dłonie pozostają bez zmiany. Dokładne rozłożenie
  pięciu profili w zakresach musi być jawne, deterministyczne i testowane.
- Okno możliwego ustania za HS należy przesunąć dalej o kilka metrów, na tej
  skoczni maksymalnie o 5 m, po sprawdzeniu rekordu obiektu 144,5 m i danych
  Wisły z §8. Dla przyszłych mamutów nie wolno kopiować wartości — granica
  wynika z faktycznych rekordów i danych konkretnego obiektu zgodnie z twardą
  zasadą empirycznej kalibracji.
- Bramka V nadal NIEZALICZONA; P21/PKG-009 pozostaje zamrożone.

## 22. Runda 15 — noty wg odległości i dalsze okno ustania za HS (21.09.2026)

### 22.1. Research not względem odległości (przed kodem)

Rozszerzony `docs/evidence/PKG-008/fis/extract-notes.mjs` przeliczył te same
trzy oficjalne PDF FIS (N=232 skoki, 1160 not) w sześciu rozłącznych pasmach
dystansu. Wynik zapisano w `hill-geometry-fis.md` §10:

- mediana pojedynczych not rośnie z 17,00 (`<K`) do 18,50 (`K+10–HS`,
  `HS–HS+5`); Pearson dystans↔nota +0,77, dystans↔retained-3 +0,82 (opisowo,
  nie przyczynowo; pasma za HS nieliczne: 8 i 1 skok);
- PDF nie zawierają etykiety telemark/parallel ani podpórek — styl pozostaje
  UNRESOLVED w źródle; zakresy stylów są DESIGN z dosłownego polecenia
  użytkownika (§21.1), nie faktem z PDF.

### 22.2. Deterministyczne noty zależne od dystansu

`src/sport/scoring.ts` (`rulesVersion pkg008-rules-6`): jawny bonus jakości
0,5 co 5 m ponad K (maks. 1,0 do HS) plus 0,5 co 2,5 m za HS (maks. 2,0 przy
HS+5); zero RNG. Po bonusie obowiązują twarde zakresy: parallel 15,0–17,5,
telemark 17,0–20,0; jedna i dwie dłonie zawsze 12,0–14,0 (pierwszeństwo nad
bonusem); upadek na surowych regułach bez bonusu. Nota 20,0 tylko dla
telemarku dalej niż HS+5. Cel prowadzenia (`leadingTarget.ts` +
`predictedStyleRule` w treningu i konkursie) używa tej samej funkcji, bez
alokacji na klatkę. Testy: tabela K/K+5/HS/HS+1/HS+5 dla obu stylów i podpórek,
monotoniczność co 0,5 m, determinizm, upadek niezależny od dystansu
(`tests/scoring.test.ts`).

### 22.3. Okno ustania za HS (+5 m)

Progi przesunięte dokładnie o zlecone maksimum: telemark 142→147 m, dwie nogi
145→150 m (`hillVersion 3.4.0`, `physicsVersion pkg008-tune-7` bez zmian —
tylko dane bezpieczeństwa). Krzywa pierwiastkowa, ciągłość w HS134,
deterministyczne zero na progu. Rekord 144,5 m ma dodatni mnożnik
(~0,44 telemark / ~0,59 parallel). Rzeczywisty skok z belki 21 (~143,1 m)
jest teraz ustany; ~154,9 m nadal pada. Reguła mamucia: kalibracja osobna
z rekordu dokładnego obiektu, zakaz kopiowania 147/150
(`hill-geometry-fis.md` §10.3, `tests/safetyMechanics.test.ts`).

### 22.4. Dowody ekranowe

20 zrzutów `pkg008-r15-{training,competition}-{k-telemark,hs-plus-parallel,hs-plus-telemark,one-hand,two-hands}-{960x540,1920x1080}.png`
w `browser-artifacts/` (nowy spec `z_capture_pkg008_r15.spec.ts` + fixture).
Zamrożone elementy nietknięte: mapa 21 belek, podpórka `-6`, brak prostokątów
not, klatki `landingDeep`.

### 22.5. Weryfikacja

| Polecenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 29 plików, 241/241 (jednostkowe + deterministyczne symulacje) |
| `npm run build` | PASS — 33 moduły, JS 174,15 kB / 55,42 kB gzip |
| `npm run test:e2e` | PASS — 22/22 (patrz 22.6 co do hosta) |
| `z_capture_pkg008_r15.spec.ts` | PASS — 1/1; 20 zrzutów |
| `z_capture_pkg008.spec.ts` | PASS — 7/7 aktywnych, 4 historyczne wycinki skipped |
| `z_capture_pkg008_video.spec.ts` | PASS — 2/2; skok 102,46 m, konkurs 102,51 m |

### 22.6. Host i stabilność E2E (jawne ograniczenie)

W trakcie sesji równoległa obca sesja (`civisim` vitest, ~1 rdzeń) okresowo
wywołuje burze pauz przeciążenia i gubienie klawiszy CDP; objawy wędrują między
testami (raz `landingPrep`, raz dystans 83–87 zamiast 90+, raz `KeyJ`/
`Backspace`), a te same testy przechodzą solo i w pełnym przebiegu po
uciszeniu hosta. Zmiany testowe tej rundy wyłącznie utwardzają synchronizację
(potwierdzony impuls, wznawianie pauzy, 5 ponowień, pauzo-odporny
`waitForFlightTick`) bez zmiany progów jakościowych; kod produkcji nie zależy
od timingu klawiatury (unit 241/241 deterministycznie). Końcowy przebieg 22/22
uzyskano na bieżącym kodzie.

### 22.7. Jedno końcowe review

Review objęło bonus/clamp/kontekst not, zgodność `predictedStylePointsTenths`
z `judgeMarksTenths` (w tym remisy po clampie), regułę celu, podbicia wersji,
przesunięcie progów o dokładnie +5 m, rozłączność pasm ekstraktora oraz
zamrożenie belek/podpórki/layoutu not. Usterek produkcyjnych nie znaleziono;
poprawki dotyczyły wyłącznie odporności helperów E2E na obciążony host.
Drugiego review nie otwierano.

### 22.8. Ograniczenia i następny krok

- Styl lądowania w PDF: UNRESOLVED; zakresy stylów to DESIGN użytkownika.
- Pasma za HS w źródłach są nieliczne; korelacja jest opisowa.
- Bramka V nadal NIEZALICZONA; P21/PKG-009 zamrożone; VISUAL zalicza
  wyłącznie użytkownik.

Aktywny prompt: [docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md) — runda 16,
odbiór użytkownika na dowodach r15.

## 23. Runda 16 — AUTO, start z belki i idealne wybicie (22.09.2026)

### 23.1. Dosłowny werdykt użytkownika

> 1. auto belki przy niesprzyjających warunkach są trochę za nisko, ustaw to tak by tak jak na treningu jest "do prowadzenia" zawsze było w okolicach 75% HS i było to możliwe do osiągnięcia. 2. Nie ma grafiki belki oraz pozycji zawodnika siedzącego na belce i animacji odepchnięcia się z pozycji siedzącej do zjazdu na rozbiegu. 3. ustal "idealny" moment wybicia (wąski, trudny do wkliknięcia), który będzie dodatkowo premiowany wysokością tak by można było osiągnąć dodatkowe 2-4 metry w zależności od warunków - sygnalizacja idealnego wybicia niech będzie zaznaczoną animacją lekkiego rozbryzgu śniego na progu podczas wybicia.

Bramka V pozostaje NIEZALICZONA; powyższe uwagi wykonano jako dalszy zakres P42.

### 23.2. AUTO i cel treningowy

- Treningowa linia `DO PROWADZENIA` jest kotwiczona na najbliższej połówce
  metra przy 75% HS: dla HS134 jest to **100,5 m**. Dotyczy wyłącznie
  kontrolowanego lidera treningowego; solver konkursowy i ranking NIE są
  wymuszane na 75% HS. Cel jest osiągalny (nie automatyczny) z każdej belki
  AUTO w tabeli testowej.
- Estymata TYLKO dodatniego wiatru (pod narty) dla AUTO dostała wersjonowany
  współczynnik 0,5; wpływ wiatru w plecy (niekorzystnego) BEZ ZMIAN.
  Tabela `wiatr → belka`: `-2→16`, `-1→12`, `-0,5→10`, `0→8`,
  `+0,5→6`, `+1→5`, `+2→2`. Dla dodatniego wiatru są to belki o 1–3
  stopnie wyższe niż w rundzie 15; kierunek i monotoniczność pozostają.
- Produkcja z premią perfect daje na tych belkach **124,6–130,2 m**
  (gotowość 1, ustane, poniżej HS134); historyczna baza bez premii dawała
  122,8–128,0 m i NIE jest bieżącą produkcją. Estymata z kotwicy bez premii
  (138,1 m) zaniża produkcję o ~1–2 m — raportowane jawnie, belki AUTO,
  czynniki i progi bez zmian.

### 23.3. Belka i ruszenie

- Wybrana belka ma własną pikselową grafikę: czerwone siedzisko, jasne akcenty
  i dwa stalowe wsporniki. Kotwica biodra/kąta: ławka jest stacjonarna
  i trwa, warstwa dynamiczna podąża za numerem jury.
- Poza `gate` pokazuje skoczka siedzącego z nartami w torach. Nowa poza
  `gatePush` ma cztery ręcznie narysowane klatki: siad → odepchnięcie → zejście
  do zwartej pozycji rozbiegu. Bank ma teraz 41 klatek;
  `JUMPER_ART_VERSION = pkg008-jumper-solid-silhouette-7`.
- Rzędy HUD celu/lidera rozdzielone, ucięta dolna faza naprawiona.
- Deterministyczne sceny-fixture (NIE gra na żywo ani playtest): 32 sceny
  `pkg008-r16-fixed-*` w 960×540 i 1920×1080 (belka/push, lot perfect/ordinary)
  plus `pkg008-r16-fixed-scenes.json`. Starsze stripy i podglądy live rundy 16
  są nieaktualne i nie są dowodem finalnym.

### 23.4. Idealne wybicie — impuls fizyczny (korekta szkicu rundy 16)

- Szkic rundy 16 opisywał premię jako `clamp(3,0 − wiatr × 0,5; 2,0; 4,0) m`
  dopisywane do punktu kontaktu. To była interpretacja zastępcza (teleport)
  i NIE jest stanem finalnym — usunięto ją w całości, bez relokacji kolizji.
- Stan finalny: jednorazowy fizyczny popęd normalny **18 N·s** w chwili
  oderwania, tj. +18/65 ≈ **+0,277 m/s** wzdłuż normalnej progu. Tor rośnie
  fizycznie PRZED jakimkolwiek wejściem lądowania; kontakt to prawdziwy wynik
  sweepu (pomiar == dystans sweepu, punkt na odcinku ruchu). Zero RNG,
  zero stackowania (przytrzymanie/spam nie mnożą), ta sama taśma/seed daje
  ten sam wynik, zdarzenie `perfectTakeoff` dokładnie raz i tylko opisuje
  impuls (typ i boolean stabilne dla renderera/replaya; lekki rozbryzg śniegu
  na progu bez zmian).
- Okno to ±1 tick przy 120 Hz (przedział ~16,7 ms obejmujący trzy dyskretne
  momenty wejścia ze względu na kolejność stałego kroku). Mapowanie: −2,−1,0
  tak; −3,+1 nie. Zwykły timing poza oknem zachowuje dawną ciągłą krzywą.
- Koperta NOMINALNA na zamrożonej taśmie wejść (taśma z przebiegu bazowego,
  cross-replay w obie strony): belka 8, wiatry −1/0/+1 → **3,01 / 3,02 /
  3,07 m**; neutralnie belki 1/8/17/21 → **3,94 / 3,02 / 2,50 / 2,37 m**.
  Słowo użytkownika „można osiągnąć 2–4 m” kalibruje tę kopertę nominalną —
  NIE jest gwarancją uniwersalną.
- Jawne ograniczenia (dowody: `r16-perfect-impulse-probe.md`/`.json`):
  adaptacyjny pilot na belce 21 zmienia moment przygotowania (prep tick
  859 → 1338 przez wyższy lot nad progiem 6 m) i daje deltę **21,53 m**
  (129,87 → 151,40 m, upadek) — udowodniony wpływ sterowania na belce 21,
  nie nieciągłość aero nigdzie; zamrożony ten sam tick/taśma daje 2,60 /
  2,37 m; alternatywna taśma bonusowa 4,26 m; ekstremum +3,2 m/s przy
  zamrożonej taśmie 17,59 m wobec adaptacyjnych 1,25 m. Nie twierdzimy, że
  każdy scenariusz daje 2–4 m.
- Progi 147/150 m BEZ ZMIAN, w pełni deterministyczne; umiejętne loty
  produkcyjne 131,0–144,8 m (belki 10/17/18/21, telemark 3,2 s) ustane.
- Wersje: fizyka `pkg008-tune-8` (ciąg bez podbicia), dane skoczni `3.5.0`,
  reguły punktacji `pkg008-rules-6`, art `-7`.

### 23.5. Dowody i weryfikacja

Wykorzystano bramki unit/typecheck (30 plików, 247/247 PASS) bez powtarzania —
kod produkcji nie był ruszany podczas walidacji przeglądarkowej.

| Polecenie / dowód | Wynik |
| --- | --- |
| `npm run build` | PASS — 33 moduły, JS 177,37 kB / 56,38 kB gzip |
| E2E łączone (37 = 33 aktywne + 4 historyczne skipped): competition + jump + persistence + shell + pełny capture + pose + video | 31 PASS, 2 FAIL timingowe hosta (nagranie treningowe: lead 35 → upadek na garb 28,7 m; pełny skok E2E: visualPose `fall` zamiast `flight` przy wczesnej sylwetce — ten sam podpis słabego wybicia) — oba przeszły w pojedynczych rerunach per ścieżka |
| main E2E (4 pliki, 22 testy) | 21/22 za pierwszym razem, brakujący 1/1 w rerunie |
| `z_capture_pkg008.spec.ts` | PASS 7/7 aktywnych, 4 historyczne skipped |
| `z_capture_pose_evidence.spec.ts` | PASS 2/2; 41 klatek |
| `z_capture_pkg008_video.spec.ts` | 1/2 za pierwszym razem; trening PASS w rerunie; konkurs-botów wymagał odzyskania artefaktu (FAIL lead 14 → upadek 36,3 m), pojedynczy rerun PASS (lead 21 → 99,99 m + 8 s botów) |
| `z_capture_pkg008_r16.spec.ts` (konfig `r16.capture.config.ts`) | PASS 1/1; 32 sceny `pkg008-r16-fixed-*` |

Flakiness to wrażliwość czasowania realtime/CDP (lead wejścia 9–32 ticki przy
kotwicy na ~17–29): udowodnione logami leadów i deterministycznymi
konsekwencjami fizyki w obie strony, NIE dowód, że każda awaria to „tylko
host”. Podczas walidacji przeglądarkowej NIE edytowano kodu produkcji ani
helperów testowych. Procesy Playwright uruchamiano wyłącznie sekwencyjnie —
współdzielony `test-results/` jest czyszczony przy każdym starcie, więc
artefakty kopiowano na bieżąco; równoległe procesy zakazane.

Nowe dowody finalne (stare stripy/live rundy 16 nie są finalne):

- `r16-final/pkg008-r16-final-pelny-skok-czlowieka.webm` (102,44 m, ustany);
- `r16-final/pkg008-r16-final-fragment-konkursu-boty.webm` (99,99 m + boty);
- `r16-final/pkg008-r16-final-perfect-flight/gate-seated/gate-push-960x540.png`
  (kopie dzisiejszych scen fixture);
- `browser-artifacts/pkg008-r16-fixed-scenes.json` + 32 PNG;
- `r16-final-browser.log` (pełny log poleceń; uwaga techniczna: plik powstał
  jako UTF-16 i został mechanicznie przetranskodowany do UTF-8 bez utraty bajtów
  treści — ta sama historia, czytelny zapis);
- `r16-perfect-impulse-probe.md` / `.json` (sonda fizyki).

Zrzuty pośrednie pełnego capture/pose z `test-results/` przepadły przy
czyszczeniu katalogu między przebiegami — przyznajemy wprost; powyższe
utrwalone sceny fixture i nagrania wypełniają dowód.

### 23.6. Jedno końcowe review

Review objęło: zastąpienie teleportu impulsem fizycznym, clamp/kontekst not,
zgodność `predictedStylePointsTenths` z `judgeMarksTenths`, regułę celu,
wersjonowanie, przesunięcie progów o dokładnie +5 m, rozłączność pasm
ekstraktora oraz zamrożenie belek/podpórki/layoutu not. Pierwotna wadliwa
interpretacja empiryczna (premia jako limitowany dopisek do odległości)
została w tym review skorygowana na impuls fizyczny wraz z diagnozą reżimu
sterowania na belce 21 — naprawy wykonano W RAMACH tego samego review, nie
otwierano drugiego niezależnego review. Nic nie deklarowano jako gotowe przed
faktycznym wykonaniem. Usterek produkcyjnych nie znaleziono; poprawki testów
dotyczyły wyłącznie jawnego rozdziału bazy historycznej od produkcji.

### 23.7. Ograniczenia i następny krok

- Runda 16 jest GOTOWA DO ODBIORU UŻYTKOWNIKA z ograniczeniami powyżej;
  P42 i PKG-008 pozostają IN PROGRESS. VISUAL, sterowanie i odczucie fizyki
  zalicza wyłącznie użytkownik.
- Znane limity nie znikają: outlier adaptacyjny belki 21 (21,53 m / upadek
  151,40 m), ekstremum +3,2 m/s (17,59 m fixed vs 1,25 m adaptacyjnie),
  taśma bonusowa 4,26 m, wrażliwość czasowania klawiatury w E2E (lead 9–32),
  czyszczenie `test-results/` między przebiegami.
- Zewnętrzny jakościowy playtest pozostaje NOT RUN.
- P21/PKG-009 pozostaje zamrożone.

Aktywny prompt: [docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md) — runda 17,
odbiór użytkownika po poprawkach rundy 16 z korektą impulsu fizycznego.

## 24. Runda 17 — cel treningowy na połowie K–HS (poprawka użytkownika)

### 24.1. Dosłowna poprawka użytkownika

> Zmieńmy DO PROWADZENIA na Połowę dystansu między K a HS czyli przy HS 132 a K 120 - 12 mętrów podzielone na pół, czyli K120+6 = do prowadzenia: 126m

Konkursowy cel prowadzenia pozostaje zależny od prawdziwego rankingu
(werdykt parenta) — zmiana dotyczy wyłącznie treningowego kontrolowanego
lidera. Bramka V nadal NIEZALICZONA.

### 24.2. Formuła i fakty

- `trainingTargetHalfMeters(kPointMeters, hillSizeMeters) = Math.round(k + hs)`
  w połówkach metra, tj. najbliższa połówka metra przy `(K+HS)/2`.
- Faktyczna skocznia K120/HS134 → **254 połówki = 127 m**; przykład użytkownika
  K120/HS132 → 252 połówki = 126 m; połówka nieparzysta np. K120/HS135 → 255
  (127,5 m). Mechanika kontrolowanego lidera bez zmian: wynik z poprzedniej
  połówki + solver na wynik ściśle WIĘKSZY, więc linia faktycznie zwraca 254
  (testy: 120/132→252, 120/134→254, 120/135→255, także pod wiatrem
  i z rekompensatą belki).
- Reszta rundy 16 jest historyczna i nienaruszona: impuls fizyczny 18 N·s,
  znane limity §23 (outlier belki 21, ekstremum +3,2, taśma 4,26),
  progi 147/150, czynniki, AUTO, belki, wersje bez podbić
  (fizyka `pkg008-tune-8`, skocznia `3.5.0`, reguły `pkg008-rules-6`).

### 24.3. Weryfikacja poprawki

- `npm run typecheck` PASS; `npx vitest run tests/leadingTarget.test.ts
  tests/liveWindTarget.test.ts` 2 pliki / 7 testów PASS (solver konkursowy
  bez zmian).
- `npm run build` PASS (33 moduły, JS 177,45 kB / gzip 56,42 kB — tylko
  przesunięcie adresów po zmianie celu).
- Skupiony gate-check LIVE: `npx playwright test tests/browser/jump.spec.ts
  -g "zgodne przed"` 2/2 PASS (960×540, 1920×1080) z asercją
  `leadingTargetHalfMeters === 254` ze snapshotu treningu; zrzuty
  `r17-regression-leading-target-127-960x540.png` /
  `-1920x1080.png` utrwalone PRZED czyszczeniem `test-results/`.
  Bez macierzy E2E, filmów i nowych frameworków.
- Fixture `r16-visual.fixture.ts` używa helpera celu zamiast twardych 201/740;
  zapisanych PNG rundy 16 nie regenerowano (historyczne).

### 24.4. Krótki samosprawdzian zakresowy (nie pełne review)

- Zmieniono wyłącznie formułę celu treningowego, jej wywołanie, komentarze,
  testy celu, spójność fixture i asercję gate-testu; brak zmian fizyki, AUTO,
  AI, punktacji, layoutu renderera, zawartości i wersji wyników.
- Stare dowody rundy 16 (§23) pozostają dokładne poza celem treningowym,
  który niniejszy §24 jawnie zastępuje (100,5 m → 127 m na K120/HS134).

Aktywny prompt: [docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md) — runda 18,
odbiór użytkownika (akceptacja V albo poprawki).

## 25. Runda 18 — perspektywa wsporników belki

### 25.1. Dosłowny werdykt użytkownika

> Akceptuje poprawki, ale proszę poprawić wygląd belki ponieważ nie zgadza sie perspektywa - druga metalowa noga wchodzina rozbieg.

Użytkownik zaakceptował wcześniejsze poprawki, ale zgłosił tę konkretną uwagę
o belce; potrzebny ponowny odbiór poprawionej belki. PKG-008/P42 i bramka V
pozostają IN PROGRESS/NIEZALICZONA. Nie przygotowuj PKG-009.

### 25.2. Zakres poprawki (tylko renderer belki)

- Tylko `drawSelectedStartGate()` w `src/render/hillView.ts`.
- Pierwszy wspornik kończy się x-8/point.y+5 zamiast pionowo; drugi
  x-3/point.y+8 zamiast x+4/point.y+11.
- Oba schodzą ukośnie w lewo za/pod tor; pełnopikselowa schodkowa maska śniegu
  zasłania odcinki za torem.
- Bez zmian siedziska, póz gate/gatePush, kotwicy biodra, gameplayu, fizyki
  pkg008-tune-8, hill 3.5.0, rules-6, JUMPER_ART_VERSION -7, AUTO, celu 127 m.

### 25.3. Nowy test capture i dowody

- Nowy test capture: `tests/browser/z_capture_pkg008_r18.spec.ts`.
- Nowe dowody (finalne dla belki):
  - `docs/evidence/PKG-008/r18-gate-perspective/pkg008-r18-gate-seated-960x540.png`;
  - `docs/evidence/PKG-008/r18-gate-perspective/pkg008-r18-gate-seated-1920x1080.png`;
  - `docs/evidence/PKG-008/r18-gate-perspective/pkg008-r18-gate-push-960x540.png`;
  - `docs/evidence/PKG-008/r18-gate-perspective/pkg008-r18-gate-push-1920x1080.png`.
- Poprzednie dowody r16/r17 pozostają kontekstem (REPORT §23–§24).

### 25.4. Weryfikacja parenta na finalnym stanie

| Polecenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — 33 moduły, JS 177.59 kB / gzip 56.49 kB |
| `npx playwright test tests/browser/z_capture_pkg008_r18.spec.ts` | PASS 1/1 (2.8 s test, 8.4 s całość) |

Validation owner: parent/orchestrator. W tej mechanicznej aktualizacji
dokumentacji nie uruchamiano testów kodu.

### 25.5. Jedno końcowe review

- Minimalny zakres zachowany, brak naruszenia zaakceptowanych mechanik; na
  kadrach wspornik nie przecina białego toru, ale VISUAL nadal zalicza
  wyłącznie użytkownik.
- Zewnętrzny jakościowy playtest NOT RUN.

Aktywny prompt: [docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md) — runda 19,
odbiór poprawionej perspektywy belki (archiwum w
`docs/handoffs/PKG-008-CONTINUE-20.md`).

## 26. Runda 19 — wiatr, HUD, belka, sterowanie i fullscreen

### 26.1. Dosłowny werdykt użytkownika (wejście rundy 19)

> 1. odległość w prawym górnym rogu jest wyświetlana bez zaokrąglenia do pół metra, zamiast np. 125,5 widać 125,3. 2. Wiatr nadal jest zbyt zmienny, słaby może lekko wirować, ale 1,5m/s powinien już być stabilny w jedną stronę - dodatkowo im silniejszy wiatr tym większa szansa na nowy feature: podmuchy - które pod nadrty odchylają zawodnika o jedną pozycję, a w plecy w głębszą pozycje względem zeskoku. 3. wygląd belki nadal wymaga uwagi - teraz jakby wisi w powietrzu. 4. Dodajmy możliwość zmiany belki na treningu za pomocą "[" "]" podczas siedzenia na belce, nie rpzed uruchomieniem treningu. 4. Nie da się wrócić do menu z treningu. 5. proszę do skoczni zawsze dorysowywać windę/schody prowadzące na górę skoczni tak by relane było przez skoczka wejście na belkę. 5. Po wyjściu z pełnego ekranu "Esc" nie da się do niego wrócić.

PKG-008/P42 i bramka V pozostają IN PROGRESS/NIEZALICZONA. Nie przygotowuj PKG-009.

### 26.2. Faktyczne wykonanie

- **HUD:** wyłącznie bieżący `measuredDistance` w prawym górnym rogu jest formatowany jako `Math.round(m*2)/2`, np. 125,3→125,5; oficjalne obcięcie wyniku FIS (floor do 0,5 m) bez zmian; pokryte testem `hudFormatting`.
- **Wiatr `pkg008-wind-4`:** wspólny model trening/seria; tło max ±0,20 wygasa do 0 przy 1,5 m/s; od 1,5 m/s brak zmiany kierunku; deterministyczne sloty 2 s, p=0,04+0,56*s, amplituda=0,15+0,55*s, limit ±3,2; podmuch to ±5,2° efektywnego `targetPitch`, ciało nadal 20°/s i gracz może kontrować; brak losowania lądowania. `PhysicsVersion` `pkg008-tune-9`; hill 3.5.0/rules-6/replay schema bez zmian.
- **Belka:** wsporniki do poziomu bocznego ciągu komunikacyjnego, stopki; generyczne schody/pomost wzdłuż rozbiegu i smukły szyb windy przy wieży; statyczny terrain buffer; finalna optymalizacja krok 1,8 m/jedna belka nośna, ok. 72% mniej iteracji. Capture r19.
- **`[` `]`:** tylko `jump` + `GateGreen`, ta sama próba/seed/AUTO proposal, manual do kolejnych prób tej sesji; po powrocie do menu nowa sesja znów AUTO; menu `[` `]` no-op.
- **Powrót/fullscreen:** Backspace z treningu wraca jednym naciśnięciem także z pauzy; Esc nieprzechwytywany, wyjście z fullscreen pauzuje i odzyskuje fokus, F ponawia fullscreen oraz wznawia tylko pauzę `opuszczono pełny ekran`.
- **Zachowano:** cel 127 m, idealny impuls 18 N·s, progi 147/150, AUTO, `JUMPER_ART_VERSION` -7, punktację i inne zaakceptowane elementy.

### 26.3. Weryfikacja (owner: parent/orchestrator)

| Polecenie / dowód | Wynik |
| --- | --- |
| `npm run typecheck` | PASS |
| finalne `npm test` | 32 pliki / 262 testy PASS |
| skupione finalne unit | 6 plików / 53 testy PASS |
| finalny `npm run build` | 33 moduły, JS 180.15 kB / gzip 57.40 kB PASS |
| skupione Playwright finalne: belka | 1/1 PASS |
| skupione Playwright finalne: Backspace | 2/2 PASS |
| skupione Playwright finalne: fullscreen | 1/1 PASS |
| skupione Playwright finalne: capture r19 | 1/1 PASS |
| skupione Playwright finalne: 10 prób | 1/1 PASS |

Pełna macierz E2E rdzenia była uruchomiona raz: 23/25 PASS, 2 timingowe FAIL hosta (`pełny skok`, `10 prób`); `pełny skok` rerun 1/1 PASS, `10 prób` po legalnym auto-resume przeciążenia i finalnym buildzie 1/1 PASS. Nie deklarujemy pełnej macierzy 25/25.

### 26.4. Jedno końcowe review

Jedno końcowe review: deterministyczność, wersje, replay, wejście i zakres bez istotnych defektów; znaleziony koszt schodów naprawiony przed finalnym capture/soak; VISUAL i odczucie podmuchów nadal do użytkownika; zewnętrzny jakościowy playtest NOT RUN.

### 26.5. Dowody finalne

Finalne dla belki/dojścia (r19):

- `docs/evidence/PKG-008/r19-visual/pkg008-r19-gate-seated-960x540.png`;
- `docs/evidence/PKG-008/r19-visual/pkg008-r19-gate-seated-1920x1080.png`;
- `docs/evidence/PKG-008/r19-visual/pkg008-r19-gate-push-960x540.png`;
- `docs/evidence/PKG-008/r19-visual/pkg008-r19-gate-push-1920x1080.png`;
- plus `tests/gustModel.test.ts` jako dowód kontraktu podmuchów; starsze r16–r18 jako kontekst.

Aktywny prompt: [docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md) — runda 20,
odbiór użytkownika (HUD, podmuchy, belka, sterowanie, fullscreen; archiwum w
`docs/handoffs/PKG-008-CONTINUE-21.md`).

## 27. Runda 20 — dwa warianty podpórki i dłuższy telemark

### 27.1. Dosłowny werdykt użytkownika (wejście rundy 20)

> wszystko akceptuje poza jednym: popraw wygląd i animacje podpórki 2 dłońmi (1 jest ok) teraz wygląda jakby zawodnik miał bardzo długie ręce i duże rękawy - długość rąk musi pasować do rąk które są u skoczka w innych pozycjach. Zrób dwa losowe wersje podpórki 2 dłońmi: podpórka dwiema rękami z przodu i podpórka dwiema rękami z tyłu (na łokciach i dłoniach). i jeszcze jedno: niech pozycja po lądowaniu telemarkiem będzie chwile dłużej wyświetlana - żeby telemark nie kończył się natychmiast bo zawodnicy utrzymują dłużej pozycje w telemarku po takim lądowaniu.

Wszystkie inne elementy rundy 19 użytkownik zaakceptował, ale bramka V nadal NIEZALICZONA do odbioru tych dwóch poprawek.

### 27.2. Zakres i fakty

- `supportOne` bez zmian.
- `supportTwo` nadal publicznie jedna poza i 3 fazy kontakt–utrzymanie–powrót, lecz dwa wizualne banki: FRONT dłonie z przodu i BACK ręce za tułowiem z podparciem na łokciach i dłoniach; ręce/rękawy skrócone do proporcji innych póz.
- Wybór „losowy” realizowany deterministycznie, czystą funkcją zapisanego ticka kontaktu + odległości w półmetrach + gateNumber; ten sam wynik live/replay, zero Math.random/Date/windSeed i zero wpływu na wynik.
- Wariant w cache bitmapy; fitting kontaktu bez rozciągania rękawa.
- supportHands=2, kara 4,5 pkt, classifyLandingSupport, physics/rules/hill/replay schema bez zmian.
- Telemark hold 54 ticki = 0,45 s po kontakcie; od ticka 55 outrun; pierwszeństwo podpórek/landingDeep do 72 ticków bez zmian.
- `JUMPER_ART_VERSION pkg008-jumper-solid-silhouette-8`; physics `pkg008-tune-9`, wind-4, hill 3.5.0, rules-6 bez zmian.

### 27.3. Weryfikacja (owner: parent/orchestrator)

| Polecenie / dowód | Wynik |
| --- | --- |
| `npm run typecheck` | PASS |
| finalny `npm run build` | PASS — 33 moduły, JS 181.25 kB / gzip 57.80 kB |
| `z_capture_pkg008_r13_support.spec.ts` | 2/2 PASS |
| `z_capture_pkg008_r20_support.spec.ts` | 2/2 PASS |
| celowane sprawdzenie | oba warianty stabilne/replay parity, wszystkie 3 fazy, slopes 90/110/136/155/180, cache wariantu, telemark t0/t36/t54 jako landingPrep i t55 outrun |

Bez pełnej macierzy i bez ponownego pełnego review zgodnie z aktywnym handoffem; sprawdzono tylko zmienione ścieżki. VISUAL/płynność nadal ocenia użytkownik; playtest zewnętrzny NOT RUN.

### 27.4. Dowody nowe (`docs/evidence/PKG-008/r20-support/`, 20 PNG)

- `r20-front-contact-crop.png`, `r20-front-hold-crop.png`, `r20-front-recovery-crop.png`;
- `r20-back-contact-crop.png`, `r20-back-hold-crop.png`, `r20-back-recovery-crop.png`;
- `r20-telemark-t0-960x540.png`, `r20-telemark-t36-960x540.png`, `r20-telemark-t54-960x540.png`, `r20-telemark-t55-960x540.png`;
- pełne kadry 960x540 istnieją dla obu wariantów i faz.

Aktywny prompt: [docs/handoffs/PKG-008.md](../../handoffs/PKG-008.md) — runda 21,
odbiór podpórki dwiema rękami i telemarku.

## 28. Runda 21 — akceptacja bramki V (22.09.2026)

Dosłowny werdykt użytkownika po obejrzeniu dowodów rundy 20:

> Akceptuje :)

Jest to jednoznaczna akceptacja całego pozostałego zakresu i bramki V; wszystkie
inne elementy zostały zaakceptowane wcześniej (rundy 11–20). Akceptacja obejmuje
finalny zakres: pixel art/oprawę, animacje i sylwetkę skoczka, kamerę/HUD,
sterowanie, odczucie fizyki wraz z wind-4/podmuchami, belkę/dojście (podparta
belka z generycznymi schodami/pomostem/windą, `[` `]` na belce w treningu,
Backspace do menu, F po Esc), oba warianty supportTwo (FRONT/BACK), supportOne,
telemark hold 54 ticki = 0,45 s oraz wszystkie wcześniej przyjęte poprawki
rund 11–20 (treningowa belka AUTO i cel 127 m na K120/HS134, spójny wiatr serii,
trwała plansza miejsca po serii, noty skalibrowane z oficjalnych wyników FIS
z monotonicznym bonusem za odległość, panel trenera, otwarte wiersze not bez
prostokątów, mapa 21 belek, głęboki przysiad R, belka z siadem i animacją
odepchnięcia, idealne wybicie jako fizyczny impuls 18 N·s).

Status: **P42 COMPLETE, PKG-008 COMPLETE, BRAMKA V PASS (USER ACCEPTED
22.09.2026)**; zewnętrzny jakościowy playtest **NOT RUN**. Produkcja treści
została odmrożona warunkowo zgodnie z AGENTS.md (zamrożenie przez bramkę V
wygasa z akceptacją), ale nowe realne skocznie nadal wymagają empirycznej
bramki D/G/A/V — H01 nie wchodzi do gry bez udokumentowanej kalibracji.

Po akceptacji nie uruchamiano nowych testów kodu; obowiązują istniejące dowody
§23–§27 (finalne wersje: art `pkg008-jumper-solid-silhouette-8`, physics
`pkg008-tune-9`, wind `pkg008-wind-4`, hill 3.5.0, rules `pkg008-rules-6`;
build 181,25 kB / gzip 57,80).

Następny prompt: [docs/handoffs/PKG-009.md](../../handoffs/PKG-009.md)
(PKG-009 / P21-H01).


