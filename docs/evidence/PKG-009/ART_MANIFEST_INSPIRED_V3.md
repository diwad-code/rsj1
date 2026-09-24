# PKG-009 — H01 art i dowody adaptacji inspirowanej Lillehammer

Scena H01 to autorski proceduralny pixel art Canvas2D na istniejącej
siatce logicznej 480×270, pokazanej w zrzutach 960×540. Odrębna od K120
paleta fioletowo-granatowego zmierzchu, Mjøsa, góry, las, linia miasta, kolej krzesełkowa, schody i
reflektory tworzą odrębny wygląd H01. Oznaczenia K90/HS98 wynikają z
tej samej mapy metrażu co kontakt. Fotografie oraz certyfikat FIS były
odniesieniem do miejsca, lecz ich piksele nie trafiły do gry.

| Źródło runtime | Rola | SHA-256 |
|---|---|---|
| `src/render/hillView.ts` | Autorska scena, własna paleta H01, panorama, konstrukcje, skoczek i śnieg | `0B1456A6530C1E3838D473BACBDF9F003876439E78CB3E05D81B0498F9374973` |
| `src/render/sportMarkers.ts` | Linie i metry z geometrii | `1FF51DE6752F90AC39CB9856E786706C1318741D1B9BD84F183D2494F54A70FC` |
| `src/render/pixelFont.ts` | Bitmapowy tekst | `519B85B51F3C20FE7FB12671767F8096DF3162167350D3DF8ADBA453390D6867` |
| `src/simulation/hills/lillehammerNormal.ts` | Metraż i profil H01 `h01-inspired-3` | `FB9F6FDDC98E8B1F4CBBAFB655022031FF68D8FA6116276E6248A08233C22C56` |
| `src/app/main.ts` | Wybór skoczni i prezentacja menu | `5905A31EBBBD3723FDCF560FBA17AAD94B719F8981CD485A70B443A2D570AC25` |

Nowe dowody runtime: [menu](inspired-artifacts/h01-menu.png),
[scena](inspired-artifacts/h01-scene.png),
[widok techniczny](inspired-artifacts/h01-technical.png),
[konkurs](inspired-artifacts/h01-competition-start.png),
[wynik po rzeczywistych klawiszach](inspired-artifacts/h01-live-result.png),
[wynik deterministycznego fixture](inspired-artifacts/h01-result-fixture.png),
[replay](inspired-artifacts/h01-replay.png) i
[nagranie próby klawiaturowej](inspired-artifacts/h01-keyboard-attempt.webm).
SHA-256 sceny PNG: `22B549A4D5D2BBFBA13E5C4880668EE4918187822196A7C0751A5B622FF3F888`;
nagrania: `42AB269241AC41A3167066390EF383BD73047DAA39BE3AC08DB49CEE458FCAB0`;
odświeżonego widoku technicznego:
`CACEF88B126ED7474F6DFF29C9F997CBDC98A8783F526C19DB44B5B883666661`.

[Historyczny manifest prototypu](ART_MANIFEST_PROTOTYPE.md) i jego zrzuty
pozostają zachowane. Nowe obrazy dowodzą implementacji, nie odbioru
wizualnego przez gracza. **H01 VISUAL user NOT RUN.** Żaden zewnętrzny
asset fotograficzny nie został dołączony; nie deklarujemy odrębnej
licencji redystrybucji grafiki projektu.
