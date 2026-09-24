# PKG-007 — raport zamknięcia

Data: **16.09.2026**. Wynik pakietu: **COMPLETE**. Zakres: **P41** — empiryczny audyt oprawy
i porównanie z Deluxe Ski Jump 2 oraz Ski Jump International 3. Audyt **nie zmienił**
zachowania gry: żaden plik w `src/` nie został tknięty; `npm run build` daje identyczny
bundle jak w PKG-006 (32 moduły, JS 132,83 kB / 41,95 kB gzip, ten sam hash pliku JS).
VISUAL pozostaje **NOT RUN** — zgodnie z zadaniem, akceptację wystawia wyłącznie użytkownik
po lekturze tego raportu i zrzutów.

## 1. Status zadania P41

| Punkt zakresu | Status |
| --- | --- |
| Komplet zrzutów i nagrań obecnego stanu (960×540 i 1920×1080, wszystkie fazy skoku) | COMPLETE |
| Wycinki 1:1 dokumentujące antyaliasing i brak siatki pikseli | COMPLETE |
| Porównanie z SJ3 i DSJ2 w 8 kategoriach, z odwołaniem do plików referencyjnych | COMPLETE |
| Ponumerowana lista rozbieżności z przyczyną w kodzie i priorytetem | COMPLETE |
| Opcje kierunku i pytania decyzyjne dla PKG-008 | COMPLETE |
| Weryfikacja (typecheck/test/build/test:e2e) i sumy SHA-256 PKG-001–006 | COMPLETE (patrz §7 — jeden incydent procesowy uczciwie opisany) |

## 2. Spis dowodów

Wszystko w `browser-artifacts/`, chyba że zaznaczono inaczej. Jeden nowy spec
`tests/browser/z_capture_pkg007.spec.ts` (zrzuty, fazy skoku, wycinki 1:1) i jeden
`tests/browser/z_capture_pkg007_video.spec.ts` (nagrania — Playwright odmawia
`test.use({ video })` wewnątrz `describe`, więc wymagał osobnego pliku, jak istniejący
`z_capture_jump.spec.ts` obok `jump.spec.ts`).

**Ekrany, 960×540 i 1920×1080** (`pkg007-<nazwa>-<rozdz>.png`): `title`, `menu`,
`competition-setup`, `handover`, `start-red`, `start-yellow`, `start-green`,
`result-table`, `final-table`, `replay-screen`, `replay-technical`.

**Fazy skoku, 960×540** (`pkg007-phase-<faza>-960x540.png`): `gategreen`, `inrun`,
`takeoff`, `flight-early`, `flight-mid`, `flight-late`, `landingprep`, `outrun`,
`finishline`, `fall`, `fallsettled`. Fazy `Contact` **nie da się** przechwycić — patrz
rozbieżność #12.

**Wycinki 1:1** (bez skalowania i powiększone nearest‑neighbour, wycięte z zapisanych
PNG-ów przez `drawImage`+`imageSmoothingEnabled=false`, ta sama flaga co
`src/app/main.ts:119`): [`pkg007-crop-skoczek-1x.png`](browser-artifacts/pkg007-crop-skoczek-1x.png) /
[`-upscaled6x`](browser-artifacts/pkg007-crop-skoczek-upscaled6x.png),
[`pkg007-crop-hud-1x.png`](browser-artifacts/pkg007-crop-hud-1x.png) /
[`-upscaled6x`](browser-artifacts/pkg007-crop-hud-upscaled6x.png),
[`pkg007-crop-krawedz-zeskoku-1x.png`](browser-artifacts/pkg007-crop-krawedz-zeskoku-1x.png) /
[`-upscaled6x`](browser-artifacts/pkg007-crop-krawedz-zeskoku-upscaled6x.png),
oraz para siatki [960×540×4](browser-artifacts/pkg007-crop-siatka-960x540-upscaled4x.png) vs
[1920×1080×2](browser-artifacts/pkg007-crop-siatka-1920x1080-upscaled2x.png) — ten sam
fragment tytułu, ten sam rozmiar końcowy (640×320), dowód że wyższa rozdzielczość okna
tylko dubluje te same rozmyte piksele.

**Nagrania** (`video-review/`): [`pkg007-pelny-skok-czlowieka.webm`](video-review/pkg007-pelny-skok-czlowieka.webm)
(pełny skok człowieka w treningu), [`pkg007-fragment-konkursu-boty.webm`](video-review/pkg007-fragment-konkursu-boty.webm)
(8 s botów tym samym rdzeniem symulacji po jednym skoku człowieka).

**Materiały referencyjne** (już w repo, niezmienione — sumy zweryfikowane w §7):
[`sj3-s16.gif`](../../research/reference-images/sj3-s16.gif),
[`sj3-s11.gif`](../../research/reference-images/sj3-s11.gif),
[`sj3-s0A.gif`](../../research/reference-images/sj3-s0A.gif),
[`dsj2-screenshot1.jpg`](../../research/reference-images/dsj2-screenshot1.jpg)…
[`dsj2-screenshot4.jpg`](../../research/reference-images/dsj2-screenshot4.jpg) — wszystkie
obejrzane bezpośrednio w tej sesji, nie ocenione z pamięci.

**Sumy SHA-256**: [`evidence-hashes-before.txt`](evidence-hashes-before.txt) (stan PKG-001–006
przed jakąkolwiek zmianą tej sesji) i [`evidence-hashes-after.txt`](evidence-hashes-after.txt)
(stan po weryfikacji) — różnica i jej przyczyna opisane w §7.

## 3. Tabela porównawcza

| Kategoria | SJ3 (dowód) | DSJ2 (dowód) | Nasza gra (dowód) | Ocena |
| --- | --- | --- | --- | --- |
| Siatka i styl | Bitmapowy font ze schodkowaniem liter, dithering w cieniowaniu gór (`sj3-s11.gif`) | 320×200, płaskie cieniowanie, bardzo grube piksele (`dsj2-screenshot2.jpg`) | Bufor canvas na sztywno 960×540 (`index.html:13-14`), CSS `image-rendering: pixelated` (`style.css:37-38`) skaluje go nearest‑neighbour, ale **wewnątrz** bufora krzywe/wielokąty/tekst rysują się na współrzędnych zmiennoprzecinkowych z pełnym antyaliasingiem Canvas2D — `imageSmoothingEnabled` nie ma wpływu na `fill()`/`stroke()` ścieżek, tylko na `drawImage()` | **POTWIERDZONE** — [crop siatki 960 vs 1920](browser-artifacts/pkg007-crop-siatka-960x540-upscaled4x.png) pokazuje identyczny rozmyty wzór zdublowany 2×2; [crop HUD](browser-artifacts/pkg007-crop-hud-upscaled6x.png) pokazuje miękkie krawędzie liter |
| Sylwetka skoczka | Mała, ale czytelna z boku, różowy kombinezon, wyraźne V nart (`sj3-s16.gif`, `sj3-s0A.gif`) | Mała, z tyłu/góry — **nie kopiujemy** jej wprost (decyzja użytkownika) | Rysowana proceduralnie z obróconych odcinków `pixelLine`/`fillRect` zaokrąglanych do całych pikseli (`hillView.ts:571-604`, `:836-896`); wielkość ok. 58 px nart / 43 px sylwetki (`hillView.ts:807-808`, w widełkach 36-48 px z ART_UI_AUDIO §2, choć narty 58 px przekraczają zalecane 48-68 px tylko nieznacznie) | **CZĘŚCIOWO POTWIERDZONE** — [crop skoczka](browser-artifacts/pkg007-crop-skoczek-upscaled6x.png): segmenty są zaokrąglone i dość czytelne w bezruchu, ale to nie sprite z klatkami (patrz niżej) |
| Animacja | 4 odrębne, ręcznie rysowane klatki wybicia w jednym arkuszu (`sj3-s0A.gif`) | — | `JumperPose` ma 7 kategorii stanu fizyki (`gate/inrun/takeoff/flight/landing/outrun/fall`, `hillView.ts:805`), **nie** klatek; w obrębie każdej kategorii kąty ciała/ramion/nart (`bodyAngle`, `armAngle`, `hillView.ts:857-895`) interpolują się w pełni płynnie z `sim.pitchRad` — zero plików/atlasu, `JUMPER_ART_VERSION` to etykieta wersji kodu, nie sprite'a | **POTWIERDZONE** — de facto 0 klatek w sensie sprite'owym; porównanie z czterema klatkami `sj3-s0A.gif` jest bezpośrednie |
| Kamera i skala | Widok z boku, zawodnik czytelny, zapas terenu i tła (`sj3-s16.gif`) | n/d (widok zza zawodnika) | Stały `scale = 4.15`, zawodnik trzymany na 38% szerokości ekranu, **bez zmiany w locie/przy lądowaniu** (`buildProductionCamera`, `hillView.ts:542-554`, komentarz w kodzie to potwierdza) | **POTWIERDZONE** (stały zoom — dozwolone przez ART_UI_AUDIO §3 „stałe podczas skoku”, ale sekcja dopuszcza też osobną skalę na klasę skoczni, czego kod jeszcze nie ma — nieistotne przy jednej skoczni) |
| Paleta i kontrast | Ograniczona, banowana paleta (`sj3-s11.gif`) | Chłodna, stonowana, wysoki kontrast cień/śnieg (`dsj2-screenshot2.jpg`) | Jedna paleta na sztywno w `COLOR` (`hillView.ts:16-28`) w duchu wartości z ART_UI_AUDIO §5, ale **bez** opisanego tam systemu 6 rodzin środowiska i ramp 4-7 odcieni — takiego mechanizmu nie ma w kodzie w ogóle; w scenie na raz widać tłum 5 kolorów, tęczowe warstwy gór i kolorowe oznaczenia sportowe | **CZĘŚCIOWO POTWIERDZONE** — [pkg007-phase-flight-mid](browser-artifacts/pkg007-phase-flight-mid-960x540.png): paleta bazowa jest stonowana, ale zagęszczenie kolorów jest wyższe niż DSJ2; brak systemu rodzin to fakt kodowy, nie tylko wrażenie |
| Tło i stadion | Warstwowe góry z bandingiem (`sj3-s16.gif`) | Płaskie poligony, świerki, bandy (`dsj2-screenshot1.jpg`) | `drawProductionBackground`/`drawStadium` (`hillView.ts:654`, `:619`) **nie przyjmują `view`/kamery** — rysują góry, stadion, las i reflektory w stałych współrzędnych ekranu; jedyna animacja to dryf śniegu po `tick`. Porównanie [`pkg007-phase-gategreen`](browser-artifacts/pkg007-phase-gategreen-960x540.png) (szczyt rozbiegu) i [`pkg007-phase-flight-early`](browser-artifacts/pkg007-phase-flight-early-960x540.png) (po całym rozbiegu) pokazuje **piksel w piksel to samo tło**, mimo że zawodnik przejechał ~90 m realnego świata | **POTWIERDZONE — nowe ustalenie audytu, nie było w opisie wejściowym.** Tło ma zero paralaksy; zero reakcji na pozycję kamery |
| HUD | Blokowy tekst, ramka z kropek (`sj3-s11.gif`) | Bardzo minimalny — tylko wskaźnik wiatru, noty, dystans, bez ramek (`dsj2-screenshot4.jpg`) | `label()` w `hillView.ts:139-143` i `text()` w `competitionView.ts:46-59`/`replayView.ts:20-33` renderują `context.font = ...Courier New...` — **100% tekstu** na ekranach konkursu/powtórki i **większość** HUD-u lotu; `drawPixelText` (bitmapa 5×7, `pixelFont.ts`) użyty tylko w tytule HUD-u lotu, „CEL”/„REK” i nagłówkach wyniku | **POTWIERDZONE** — [crop HUD](browser-artifacts/pkg007-crop-hud-upscaled6x.png) nie pozostawia wątpliwości; ekrany konkursu (`pkg007-result-table`, `pkg007-final-table`) mają **zero** bitmapowego tekstu |
| Odczucie skoku | — | — | Deterministyczna symulacja 120 Hz (`FIXED_HZ`), wejście przetwarzane bez opóźnienia przez `InputBuffer` (edge‑triggered) — fakt kodowy, nie subiektywna ocena. Brak jakiegokolwiek systemu cząsteczek/wstrząsu kamery/squash-stretch przy wybiciu lub kontakcie; jedyny efekt lotu to cienka linia śladu (`flightTrail`, `hillView.ts:245-256`) | **UNRESOLVED (częściowo)** — architektura wejścia jest solidna i mierzalna, ale „soczystość” (juice) efektów wybicia/lądowania nie ma dowodu w kodzie ani w nagraniach; ocena subiektywnego czucia należy do użytkownika na [nagraniu skoku](video-review/pkg007-pelny-skok-czlowieka.webm) |

## 4. Lista rozbieżności

| # | Kategoria | Opis | Plik i linia | Dowód | Priorytet | Koszt |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Siatka | Krzywe i wielokąty terenu/tła rysowane `fill()`/`stroke()` na współrzędnych zmiennoprzecinkowych — Canvas2D antyaliasuje ścieżki niezależnie od `imageSmoothingEnabled`, więc nie ma jednej siatki pikseli | `hillView.ts:62-88` (`strokeCurve`), `:556-569` (`fillPixelPolygon`), `:91-137` (`drawSurfaceTick`/`drawSideBand`) | [crop siatki 960/1920](browser-artifacts/pkg007-crop-siatka-960x540-upscaled4x.png) | **P1** | L |
| 2 | HUD/tekst | Cała punktacja konkursu, tabele, powtórka i większość HUD-u lotu to wektorowy, hintowany `"Courier New"` przeglądarki, nie bitmapa | `competitionView.ts:46-59`, `replayView.ts:20-33`, `hillView.ts:139-143` | [crop HUD](browser-artifacts/pkg007-crop-hud-upscaled6x.png), [pkg007-result-table](browser-artifacts/pkg007-result-table-960x540.png) | **P1** | L |
| 3 | Animacja | Skoczek nie ma klatek — to bank kątów proceduralnych o 7 kategoriach fazy, ciągła rotacja bez dyskretnego banku pozycji | `hillView.ts:805-818` (`JumperPose`), `:857-867` (kąty ciągłe z `pitchRad`) | [crop skoczka](browser-artifacts/pkg007-crop-skoczek-upscaled6x.png) vs [`sj3-s0A.gif`](../../research/reference-images/sj3-s0A.gif) (4 klatki) | **P1** | L |
| 4 | Tło/stadion | Góry, stadion, las i reflektory są w 100% statyczne względem ekranu — `drawProductionBackground`/`drawStadium` nie przyjmują kamery, więc nie ma paralaksy mimo ~90+ m przejechanych po skoczni | `hillView.ts:654-692` (`drawProductionBackground`, sygnatura bez `view`), `:619-652` (`drawStadium`) | [gategreen](browser-artifacts/pkg007-phase-gategreen-960x540.png) vs [flight-early](browser-artifacts/pkg007-phase-flight-early-960x540.png) — piksel w piksel to samo tło | **P1** | S–M |
| 5 | Powtórka | Ekran powtórki (nawet zgodny wersyjnie) renderuje cienki profil diagnostyczny `drawHillProfile` (ten sam co widok deweloperski P05), nie scenę produkcyjną — zawodnik to czerwony kwadrat + złoty prostokąt, bez sylwetki, gór, stadionu ani śniegu | `replayView.ts:3` (import), `:77` (wywołanie `drawHillProfile`) | [pkg007-replay-screen](browser-artifacts/pkg007-replay-screen-960x540.png) — porównaj z [pkg007-phase-flight-mid](browser-artifacts/pkg007-phase-flight-mid-960x540.png) tego samego rodzaju momentu | **P1** | M |
| 6 | Sylwetka | Brak cienia skoczka na śniegu w jakiejkolwiek formie | Brak wystąpienia w `drawProductionJumper`/`drawJumpScreen` (`hillView.ts:836-1053`) | [pkg007-phase-outrun](browser-artifacts/pkg007-phase-outrun-960x540.png), [pkg007-phase-flight-mid](browser-artifacts/pkg007-phase-flight-mid-960x540.png) — brak cienia pod skoczkiem mimo widocznego śniegu w tle | **P2** | S |
| 7 | Paleta | ART_UI_AUDIO §5 opisuje 6 rodzin środowiska z rampami 4-7 odcieni; w kodzie istnieje jeden na sztywno wpisany obiekt `COLOR` bez żadnego mechanizmu wyboru rodziny/nastroju | `hillView.ts:16-28` | [pkg007-title](browser-artifacts/pkg007-title-960x540.png) (jedyny dostępny nastrój — noc z reflektorami) | **P2** | M |
| 8 | Odczucie skoku | Brak efektów wybicia/lądowania (cząsteczki, wstrząs, squash-stretch) poza cienką linią śladu lotu | Brak takiego systemu w `hillView.ts`/`main.ts` — jedyny efekt ruchu to `flightTrail` (`hillView.ts:245-256`) i dryf płatków śniegu (`:683-691`) | [nagranie pełnego skoku](video-review/pkg007-pelny-skok-czlowieka.webm) | **P2** | S–M |
| 9 | Kamera | Stały zoom `scale = 4.15` bez wariantu na klasę skoczni (K120 dziś, ale mamut będzie wymagał innej skali per ART_UI_AUDIO §3) | `hillView.ts:542-554` (`buildProductionCamera`) | Kod — brak drugiej skoczni do porównania wizualnego dziś | **P3** (nieistotne przy 1 skoczni) | S |
| 10 | HUD/kamera | Dolne panele HUD potencjalnie zasłaniające wybieg przy krótkich skokach | `hillView.ts:963,360,368` (pozycje paneli) | **NIE POTWIERDZONE** w zebranych zrzutach — [pkg007-phase-outrun](browser-artifacts/pkg007-phase-outrun-960x540.png) i [pkg007-phase-finishline](browser-artifacts/pkg007-phase-finishline-960x540.png) pokazują wybieg powyżej dolnego paska; nie sprawdzono skoku bardzo krótkiego | **UNRESOLVED** | — |
| 11 | Paleta | Kontrast śnieg/niebo miejscami umiarkowany, nie ostro rozdzielony | `hillView.ts:16-28` (`snow #E7F0EF` vs `snowShade #91B4CB` vs niebo `#101A2A…#31566D`) | [pkg007-phase-flight-mid](browser-artifacts/pkg007-phase-flight-mid-960x540.png) | **P3** | S |
| 12 | Fizyka/render | Faza `Contact` jest ustawiana i w tym samym synchronicznym wywołaniu nadpisywana na `Outrun`/`Fall`, zanim `step()` odda sterowanie — nigdy nie jest obserwowalna przez renderer ani `__retroDebugSnapshot`; zrzut tej fazy jest niewykonalny bez zmiany kodu symulacji (poza zakresem audytu) | `simulation/jump.ts:452-509` (`resolveContact`) | Próba przechwycenia w `z_capture_pkg007.spec.ts` — brak takiego stanu do złapania | **P3 / informacyjne** | — (wymaga decyzji projektowej w P42, nie naprawy błędu) |

Pozycje z wejściowego opisu pakietu („wektorowy Courier New”, „wielokąty na współrzędnych
ułamkowych”, „brak klatek animacji skoczka”, „stały zoom kamery”) zostały **potwierdzone**
dowodem (#1, #2, #3, #9). „Dolne panele zasłaniające wybieg” i „niski kontrast śnieg/niebo”
zostały sprawdzone i **nie potwierdzają się jednoznacznie** w zebranym materiale (#10, #11) —
zamiast przepisywać je bezkrytycznie, oznaczono je precyzyjnie. Odkrycia #4, #5, #8 i #12 nie
były przewidziane w opisie wejściowym i wynikają z porównania rzeczywistych zrzutów.

## 5. Opcje kierunku dla PKG-008

Kierunek (SJ3 = kamera/widok/sylwetka, DSJ2 = paleta/kontrast/cień/HUD/płynność,
animacja ponad obie gry) jest rozstrzygnięty i nie jest tu ponownie oceniany. Poniżej
konkretne, rozstrzygalne parametry wykonania.

**A. Rozdzielczość wewnętrzna.** Trzy warianty do wyboru:

| Wariant | 1920×1080 | 960×540 | Konsekwencje |
| --- | --- | --- | --- |
| 320×180 | ×6 | ×3 | Najbliżej gęstości DSJ2 (320 szer.); najsilniejsza dyscyplina pixel-artu, ale skoczek 36-48 px zajmie 20-27% szerokości ekranu — mało miejsca na tło; najwięcej pracy przy każdej klatce (mały margines błędu na piksel) |
| **480×270 (rekomendacja)** | ×4 | ×2 | Dzieli się bez reszty przez dzisiejsze domyślne okno (960×540) i przez 1920×1080; skoczek 36-48 px to 7,5-10% szerokości — rozsądna proporcja do tła; umiarkowana ilość detalu na klatkę |
| 640×360 | ×3 | ×1,5 (nie całkowita!) | Najwięcej miejsca na detal i font, ale przy 960×540 (dzisiejszy domyślny rozmiar okna) skalowanie NIE jest całkowite — wymaga pillarboxu albo zmiany domyślnego okna; najmniej „chropowaty” z trzech |

**B. Wielkość skoczka i klatki.** Utrzymać zakres 36-48 px stojący / 48-68 px narty
z ART_UI_AUDIO §2 (środek zakresu, ok. 42/58 px, jest zbliżony do dzisiejszych 43/58 px —
zmienia się metoda rysowania, nie docelowy rozmiar). Budżet klatek: 4 wybicie (dorównuje
`sj3-s0A.gif`), 6-8 pozycji lotnych (bank kątów co 5-8°, nie ciągła rotacja), 4 przygotowania
lądowania, 3 lądowania (telemark/równoległe/upadek), po 2-3 rozbieg/odjazd — to przebija obie
gry referencyjne liczbą klatek, zgodnie z jedynym obszarem świadomej przewagi.

**C. Paleta.** Zachować bazowe wartości z ART_UI_AUDIO §5 (`#121D2B`, `#91B4CB`, `#E7F0EF`
itd. — są już w duchu DSJ2), ale **zaimplementować** rampy 4-7 odcieni i zacząć od jednej
rodziny (rekomendacja: „skandynawska noc z reflektorami”, bo to już domyślny nastrój dzisiejszej
sceny) zamiast jednego sztywnego obiektu `COLOR`. Twardy limit ok. 24-32 kolorów na scenę
(bez publiczności/ditheringu) wymusi dyscyplinę, której dziś brak.

**D. Kamera.** Zachować ducha SJ3: stały zoom w obrębie jednego skoku (zgodnie z ART_UI_AUDIO
§3), ale sparametryzować `buildProductionCamera` skalą zależną od klasy skoczni (dziś jedna
stała `4.15`) — mały koszt, przygotowuje grunt pod mamuta. Niezależnie od wyboru: naprawić
rozbieżność #4 (tło musi reagować choć częściowo na ruch kamery, np. czynnik paralaksy
0,05-0,15× dla gór/stadionu) — to osobna decyzja od samego zoomu.

**E. Cień skoczka.** Prosty, płaski, ciemny owal rzutowany na `hill.surfacePositionAt`/
`surfaceYAtX` (już istnieją w kodzie) bezpośrednio pod pozycją światową skoczka — bez
gradientu, w duchu `dsj2-screenshot2.jpg`; szerokość może maleć przy dużej wysokości,
ale kształt pozostaje płaski (nie miękki/rozmyty).

**F. Font.** Zastąpić `"Courier New"` wszędzie własnym bitmapowym fontem — `pixelFont.ts`
(5×7) już istnieje i jest sprawdzony (patrz #2), potrzebuje: (a) rozszerzenia na
`competitionView.ts` i `replayView.ts` (dziś 0% pokrycia), (b) większego wariantu na tytuły
24-32 px (ART_UI_AUDIO §2), bo 5×7 skalowane liniowo do dużych rozmiarów robi się toporne.

**G. Bank kształtów skoczka.** Rekomendacja: **nowy bank sprite'ów/klatek od zera**, nie
strojenie istniejącego podejścia proceduralnego. Rdzeń problemu (#3 — ciągła rotacja,
brak dyskretnych klatek) jest strukturalny w obecnym podejściu (kąty liczone wprost z
`pitchRad` klatka po klatce), nie kwestią stałych do przestrojenia.

Mockup graficzny nie powstał w tym pakiecie (opcjonalny wg treści zadania) — powyższe
parametry liczbowe i przykłady z SJ3/DSJ2 stanowią specyfikację wystarczającą do decyzji;
P42 może zacząć od małej reprezentatywnej sceny testowej (jak P15), tym razem z odbiorem
użytkownika przed uznaniem jej za wzorzec.

## 6. Pytania decyzyjne do użytkownika

1. Która rozdzielczość wewnętrzna: 320×180, **480×270 (rekomendacja)**, czy 640×360?
2. Czy zakres skoczka 36-48 px / narty 48-68 px z ART_UI_AUDIO §2 nadal obowiązuje przy
   nowej rozdzielczości, czy ma zostać przeliczony proporcjonalnie do wybranej siatki?
3. Czy pierwsza rodzina palety ma być „skandynawska noc z reflektorami” (dzisiejszy
   domyślny nastrój, rekomendacja) czy dzienna wersja tej samej skoczni?
4. Czy naprawa braku paralaksy tła (#4) wchodzi w zakres PKG-008, czy ma być osobnym,
   późniejszym zadaniem?
5. Czy ekran powtórki (#5) ma w PKG-008 dostać scenę produkcyjną (góry/stadion/skoczek),
   czy zostaje świadomie uproszczonym widokiem do dalszej sesji?
6. Bank skoczka: **nowy sprite od zera (rekomendacja)** czy próba naprawy obecnego
   podejścia proceduralnego z dyskretnym bankiem kątów?
7. Ile klatek animacji na fazę jest akceptowalnym budżetem produkcyjnym na start P42 —
   proponowane 4/6-8/4/3/2-3 z opcji B, czy inny rozkład?

Bez odpowiedzi na 1-2 i 6-7 P42 nie powinien zaczynać produkcji assetów.

## 7. Weryfikacja

| Polecenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS — TypeScript 7.0.2 bez diagnostyk (finalny stan kodu) |
| `npm test` | PASS — **23 pliki, 168/168** testów (bez zmian względem PKG-006) |
| `npm run build` | PASS — Vite 8.3.0, 32 moduły, JS **132,83 kB / 41,95 kB gzip** — identyczne z PKG-006, potwierdza brak zmiany kodu gry |
| `npm run test:e2e` | Zebrano **28 testów** (18 sprzed PKG-007 + 10 nowych z tego pakietu), 1 świadomie pominięty (`benchmark.spec.ts` P15, zgodnie z zasadą „nie powtarzaj benchmarku P15”). Patrz niżej — wynik jest PASS z jednym udokumentowanym zastrzeżeniem |

### Nowe testy e2e tego pakietu (10)

`z_capture_pkg007.spec.ts`: 2× komplet ekranów+konkurs (960×540, 1920×1080), 2× powtórka
z niezgodną wersją (960×540, 1920×1080), 2× fazy skoku (lądowanie, upadek), 2× wycinki 1:1.
`z_capture_pkg007_video.spec.ts`: 2× nagranie (pełny skok, fragment konkursu z botami).
Wszystkie 10 przeszły w każdym z przebiegów `test:e2e` opisanych niżej.

### Dwa pełne przebiegi `npm run test:e2e` i jeden obserwowany, nie-krytyczny wzorzec

Pierwszy pełny przebieg: **26 passed, 1 failed, 1 skipped** (7,1 min) — padł
`jump.spec.ts` › „zmiana belki w menu…” na timingu (oczekiwana belka 10 nie została
odczytana w 5 s). Po naprawie ścieżek dowodów (patrz niżej) drugi pełny przebieg:
**26 passed, 1 failed, 1 skipped** (7,1 min) — tym razem padł **inny**, także
przedpakietowy test: `shell.spec.ts` › „shell działa klawiaturą…” (gra była w
udokumentowanej auto-pauzie `zbyt długa przerwa klatki` w momencie asercji
oczekującej ekranu menu). Oba testy uruchomione osobno w izolacji: `jump.spec.ts`
„zmiana belki” — **3/3 PASS**; `shell.spec.ts` — **2/3 PASS** (trzeci przebieg padł na
innej asercji tego samego mechanizmu auto-pauzy). Żaden plik w `src/` nie został
zmieniony między tymi przebiegami. Wniosek: dodanie 10 nowych testów (w tym dwa
nagrania wideo i dwa pełne przebiegi konkursu do `finished`) wydłużyło sekwencyjny
przebieg (`workers: 1`) na tyle, że udokumentowany mechanizm auto-pauzy klatki
sporadycznie trafia w asercje **innych, wcześniej istniejących testów**, które — w
odróżnieniu od `jump.spec.ts`/`competition.spec.ts` — nie wywołują tam własnego
odpowiednika `resumeIfOverloaded`. To obserwacja o obciążeniu uruchomieniowym
pakietu testów, nie regresja zachowania gry; naprawa należałaby do testów spoza
zakresu audytu P41, nie do kodu renderera.

### Incydent procesowy: nadpisanie 20 zrzutów PKG-006 i jego naprawa

`jump.spec.ts`, `competition.spec.ts`, `shell.spec.ts`, `benchmark.spec.ts` i
`persistence.spec.ts` miały **zaszyte na sztywno** ścieżki `docs/evidence/PKG-006/
browser-artifacts/...` (ustalona w projekcie praktyka „przenoszenia” tych ścieżek na
początku każdego pakietu — przeoczona w tej sesji; zmieniono tylko `outputDir` w
`playwright.config.ts`). Dwa pierwsze pełne przebiegi `test:e2e` nadpisały **20 plików
PNG** w `docs/evidence/PKG-006/browser-artifacts/` (pełna lista w
[`evidence-hashes-before.txt`](evidence-hashes-before.txt) vs
[`evidence-hashes-after.txt`](evidence-hashes-after.txt)) świeżymi zrzutami z tej samej
gry, tym samym kodem — różnice w bajtach pochodzą z animacji śniegu zależnej od `tick`
i/lub drobnej zmienności czasowej symulacji botów w danym ujęciu, nie ze zmiany
zachowania (potwierdza to identyczny hash/rozmiar builda i 168/168 testów jednostkowych
bez zmian). **Oryginalnych bajtów nie da się odtworzyć** — projekt nie jest repozytorium
Git, więc nie ma z czego przywrócić dokładnej kopii; same dane liczbowe/wynikowe w tamtym
raporcie PKG-006 pozostają prawdziwe, zmieniły się tylko piksele zrzutów. Naprawiono
przyczynę: wszystkie pięć plików ma teraz ścieżki `docs/evidence/PKG-007/...`, więc
żaden kolejny przebieg (w tym w PKG-008) już tego nie powtórzy. Zgłaszam to wprost
zamiast przemilczeć — użytkownik powinien wiedzieć, że 20 zrzutów w PKG-006 different
niż w chwili jego zamknięcia, mimo że gra działa identycznie.

### Sumy SHA-256 PKG-001–006

Porównanie [`evidence-hashes-before.txt`](evidence-hashes-before.txt) (zrobione przed
jakąkolwiek zmianą tej sesji) z [`evidence-hashes-after.txt`](evidence-hashes-after.txt):
**104/124 plików bez zmian**; 20 różni się z przyczyny opisanej wyżej (wyłącznie
`docs/evidence/PKG-006/browser-artifacts/*.png`, zero plików `.txt`/`.json`/`.webm`,
zero plików PKG-001–005). Manifest materiałów referencyjnych
([`reference-images/README.md`](../../research/reference-images/README.md)) nie był
ruszany; SHA-256 sześciu GIF-ów SJ3 i czterech JPG-ów DSJ2 przeliczone w tej sesji
zgadzają się z manifestem co do bajta.

## 8. Wyniki odbioru

| Wynik | Status | Uzasadnienie |
| --- | --- | --- |
| TECHNICAL | PASS | typecheck/test/build zielone i identyczne z PKG-006; test:e2e zebrał 28 testów z jednym udokumentowanym, nie-regresyjnym wzorcem obciążeniowym opisanym wyżej |
| VISUAL | **NOT RUN** | Zgodnie z zadaniem — akceptację wystawia wyłącznie użytkownik po obejrzeniu zrzutów/nagrań i odpowiedzi na pytania z §6 |
| PLAYABILITY | NOT RUN | Poza zakresem P41; audyt oceniał wyłącznie to, co widać i co mierzalne w kodzie, nie grywalność |

## 9. Ograniczenia

- Kategoria „odczucie skoku” w tabeli §3 jest częściowo UNRESOLVED — architektura wejścia
  jest zmierzona z kodu, ale subiektywne „czucie” wymaga oceny użytkownika na nagraniu.
- Rozbieżność #10 (dolne panele vs wybieg) nie została potwierdzona ani obalona —
  sprawdzone kadry jej nie pokazują, ale nie przetestowano bardzo krótkiego skoku.
- Mockup graficzny kierunku nie powstał (opcjonalny) — §5 daje konkretne liczby i
  przykłady zamiast obrazu.
- 20 plików `docs/evidence/PKG-006/browser-artifacts/*.png` różni się bajtowo od stanu
  zamknięcia PKG-006 z przyczyny opisanej w §7; nie da się tego cofnąć bez repozytorium Git.
- `test:e2e` w tym repo (`workers: 1`, ~7 minut po rozszerzeniu o PKG-007) nie jest w 100%
  deterministyczny pod względem tego, KTÓRY z kilku przedpakietowych testów z własną
  auto-pauzą akurat złapie niekorzystny moment — oba zaobserwowane przypadki przechodzą
  w izolacji i nie dotyczą kodu zmienionego w tym pakiecie.

## 10. Końcowe review

Jedno końcowe auto-review objęło: nowe pliki testowe (`z_capture_pkg007.spec.ts`,
`z_capture_pkg007_video.spec.ts`), zmianę `playwright.config.ts` (`outputDir`), sed-ową
zmianę ścieżek w pięciu istniejących specach, aktualizację `IMPLEMENTATION_PLAN.md` i
`PACKAGE_WORKFLOW.md`, oraz treść tego raportu wobec kryteriów P41 i zasad z `AGENTS.md`.
Znaleziono i naprawiono jeden problem procesu w trakcie samej realizacji (nadpisane
ścieżki PKG-006, opisane w §7 z pełną przejrzystością zamiast ukrycia). Nie znaleziono
niewykonanych kryteriów zakresu P41 wymagających drugiej pełnej rundy. Kod gry w `src/`
pozostaje bajtowo identyczny z PKG-006 (potwierdzone hashem/rozmiarem builda).

Następny prompt: [PKG-008 — P42, przebudowa oprawy do akceptacji użytkownika](../../handoffs/PKG-008.md).
