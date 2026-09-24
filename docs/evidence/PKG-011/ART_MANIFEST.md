# PKG-011 / H03 — manifest oprawy Oberstdorfu

**Zakres A:** `h03-oberstdorf-large` / `h03-inspired-1`, K120/HS137.
**VISUAL USER PASS 23.09.2026:** po otrzymaniu sześciu rzeczywistych zrzutów
H03 960×540 i linku do pełnego WebM użytkownik ocenił: „skocznia obersdorff
jest ok”. Nie ma potwierdzenia obejrzenia całego filmu. To autorska
interpretacja areny pod Schattenbergiem, nie rekonstrukcja rzeczywistej
geometrii, rozmieszczenia budynków ani homologacja FIS.

| Plik runtime | Oryginalna zawartość H03 | SHA-256 po ostatniej zmianie kodu |
|---|---|---|
| `src/render/hillView.ts` | Ręcznie zapisana paleta szarozielonego alpejskiego poranka i kremowego śniegu; trzy warstwy niecki z zalesionymi zboczami i sylwetkami skoczni treningowych; wysoka stalowo-modrzewiowa wieża ze szklanym pawilonem, kratownicowy rozbieg i osobna pochyła winda; wachlarzowa trybuna oraz kładka przy umownym potoku. Dedykowane kontrastowe opisy techniczne H03. | `143E59E8DFAB2B5BAFB747F7B8E384DE2C1AD8242D7328A06BA447333FDD06DB` |

**Inspiracje, nie materiały do skopiowania:**

- [Historia areny — organizator](https://www.orlen-arena.de/arena/geschichte.html): przebudowa w 2003 r. i osadzenie dużego drewniano-stalowego rozbiegu; trybuna nad Faltenbach.
- [Informacje o arenie — organizator](https://www.orlen-arena.de/arena/arena-info.html): las pod Schattenbergiem, kilka skoczni treningowych i infrastruktura areny.
- [Karta wariantu H03](../../hills/H03.md): identyfikator, K120/HS137 i rozróżnienie FACT od ADAPT/TUNE.

**Autorstwo i prawa:** nowe piksele, układy brył, kontury, wzory i paleta są
oryginalnym kodowym artem przygotowanym dla tej gry. Nie importowano zdjęć,
logotypów, grafik organizatora ani pikseli z cudzych gier. Odnośniki powyżej
służą wyłącznie jako źródła informacji; prawa do treści tych stron pozostają
przy ich właścicielach. Nie powstaje osobny asset PNG w repozytorium.

**Odległości i technika:** sportowe K/HS, linie co 5 m, pasy i znaczniki
rekordu/celu biorą pozycje z `buildSportMarkers(hill)` / `distanceMap`; art nie
zawiera współrzędnych sportowych. Podpisy P/K/HS w przeglądzie H03 mają
osobne wiersze i cienkie prowadnice, ale kreski zostają w punktach mapy;
linie co 5 m pozostają, podpisy w technicznym są co 20 m dla czytelności.
480×270, całkowitopikselowe prymitywy rastrowe, font `drawPixelText`,
skalowanie najbliższym sąsiadem bez wygładzania. Bufory terenu/profilu
mają klucze ID/wersji/palety, a warstwy paralaksy klucz rodziny palety;
H01/H02/techniczna zachowują swoje gałęzie renderera.

**Sprawdzenie w ramach A:** `npm run typecheck` **PASS** i `npm run build`
**PASS** na końcowym kodzie. Obejrzano diagnostyczne 960×540 z przeglądarki
na żywym ekranie belki i technicznym, poza repozytorium:
`C:/Users/admin/AppData/Local/Temp/opencode/pkg011-h03-gate-960x540.png`,
`C:/Users/admin/AppData/Local/Temp/opencode/pkg011-h03-technical-final-960x540.png`.
Osobne `pkg011-h03-stands-FIXTURE-960x540.png`,
`pkg011-h03-bridge-FIXTURE-960x540.png` i
`pkg011-h03-sport-FIXTURE-960x540.png` w tym samym katalogu to tylko
diagnostyka artu ze sztuczną pozycją aktora (ostatni zrzut wykonano przed
końcową poprawką cienia podpisów co 5 m); **nie** są dowodem rozegranego
skoku, wyniku ani replaya. Początkowy podgląd przeciążył klatkę i pokazał
techniczny ekran pauzy; powtórzono ujęcia po wznowieniu. Były to tylko
wcześniejsze sprawdzenia A; późniejszy dowód skoków, replaya i odbioru H03
jest w [artefaktach V](ARTIFACTS.md). Przy belce górna krawędź
wieży bywa częściowo schowana pod HUD-em, lecz bryła i wyraźny rozbieg
pozostają widoczne.
