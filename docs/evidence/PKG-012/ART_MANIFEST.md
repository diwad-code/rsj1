# PKG-012 / H04 — pochodzenie oprawy Planicy

H04 (`h04-planica-flying`, `h04-inspired-1`) to **grywalna interpretacja** Planicy,
nie odtworzony profil ani obraz oficjalnego obiektu. K200/HS240 i historyczny
rekord mężczyzn 254,5 m pochodzą z odsyłaczy w `docs/hills/H04.md`; kontur gór,
kolory, wieża, estakada, dolina i trybuny są decyzjami artystycznymi gry.

| Element H04 | Miejsce | Pochodzenie i prawo użycia |
| --- | --- | --- |
| Paleta morelowego nieba, górskie warstwy, rozległa dolina, kolejka, śnieg, wąska estakada na kratownicowych podporach, niska widownia i proporce | `src/render/hillView.ts` | Narysowane od zera w kodzie Canvas2D na potrzeby gry. Brak wklejonych fotografii, logo, cudzych sprite'ów i tekstur. |
| Mała miniatura menu z rozbiegiem, zeskokiem i etykietą rekordu | `src/render/hillView.ts`, wywołanie w `src/app/main.ts` | Oryginalne piksele rysowane w tych samych plikach, bez importowanego obrazu. |
| Skoczek, cień, bitmapowy font, sportowe kreski i HUD | Istniejący wspólny renderer, `buildSportMarkers(hill)` | Ponownie użyte elementy projektu; linie K/HS/co 5 m i znacznik rekordu biorą pozycję z mapy metrażu H04, nie z miniatury ani ręcznie wybranych współrzędnych. |

Prawa do zewnętrznych obrazów nie są potrzebne dla dodanego artu: nie dodano
żadnego zewnętrznego assetu. Opis „inspirowana” dotyczy miejsca, nie praw do
cudzych przedstawień. Nie ustalano tu licencji całego projektu.

## SHA-256 finalnych plików źródłowych

| Plik (pełna zawartość, również wspólny kod) | SHA-256 |
| --- | --- |
| `src/render/hillView.ts` | `f1d4bedbf78c4554b15c43f337d80af40b25c11d82690cd8a4c9c9006c9726e2` |
| `src/app/main.ts` | `c7c1ee415b3f07b27532a9b9e1cc9850a3047b441c948ffeba96f2006d006a1e` |

Hashe uzyskano lokalnie przez `Get-FileHash -Algorithm SHA256` po ostatniej
zmianie źródeł. Nie ma osobnego finalnego atlasu PNG: obie warstwy i miniatura
powstają bezpośrednio z kodu na siatce **480×270**, w przeglądarce skalowanej
całkowicie do **960×540** bez AA i bez tekstu wektorowego.

## Lokalny podgląd, nie odbiór

`npm run typecheck` oraz `npm run build`: PASS na finalnych plikach. Zbudowane
`dist` obejrzano w Chromium/Playwright: H04 wybrano samą klawiaturą; ekran
menu, belkę, początek lotu oraz przekrój techniczny zapisano jako zrzuty
960×540 poza repozytorium, odpowiednio:

- `C:\Users\admin\AppData\Local\Temp\opencode\pkg012-h04-menu.png` — menu po poprawce miniatury;
- `C:\Users\admin\AppData\Local\Temp\opencode\pkg012-h04-gate.png` — początek treningu;
- `C:\Users\admin\AppData\Local\Temp\opencode\pkg012-h04-flight.png` — wczesny lot;
- `C:\Users\admin\AppData\Local\Temp\opencode\pkg012-h04-profile.png` — przekrój po `D`.

Pierwszy podgląd nie zgłosił błędu strony, potwierdził identyfikator H04 i
wersję `h04-inspired-1`. Drugie podejście do zrzutu lotu po 2,5 s nie osiągnęło
warunku w 20 s (brak zrzutu późnego lotu); podgląd nie stanowi testu pełnego
skoku, konkursu, zapisu, replaya ani balansu. Ostateczna ocena wyglądu H04
**nie została wydana przez użytkownika** — VISUAL USER PASS nadal oczekuje.
