# PKG-009 — H01 art i dowody adaptacji inspirowanej Lillehammer

Scena H01 to autorski proceduralny pixel art Canvas2D na istniejącej
siatce logicznej 480×270, pokazanej w zrzutach 960×540. Odrębna od K120
paleta fioletowo-granatowego zmierzchu, Mjøsa, góry, las, linia miasta,
kolej krzesełkowa, schody i reflektory tworzą odrębny wygląd H01. Oznaczenia K90/HS98 wynikają z
tej samej mapy metrażu co kontakt. Fotografie oraz certyfikat FIS były
odniesieniem do miejsca, lecz ich piksele nie trafiły do gry.

| Źródło runtime | Rola | SHA-256 |
|---|---|---|
| `src/render/hillView.ts` | Autorska scena, własna paleta H01, panorama, konstrukcje, skoczek i śnieg | `0B1456A6530C1E3838D473BACBDF9F003876439E78CB3E05D81B0498F9374973` |
| `src/render/sportMarkers.ts` | Linie i metry z geometrii | `1FF51DE6752F90AC39CB9856E786706C1318741D1B9BD84F183D2494F54A70FC` |
| `src/render/pixelFont.ts` | Bitmapowy tekst | `519B85B51F3C20FE7FB12671767F8096DF3162167350D3DF8ADBA453390D6867` |
| `src/simulation/hills/lillehammerNormal.ts` | Metraż i profil H01 `h01-inspired-4` | `C4358C11FC8CBB554CFB192F91C708237849E3DF25D6A93ED0A2196CC01C5757` |
| `src/sport/safety.ts` | H01 AUTO +2 belki przy wietrze w plecy | `F02C937DEDCD04ADF91DCD746D6C55CF90BD23AA473A465A993BE1A5DAC5B82B` |
| `src/app/main.ts` | Wybór skoczni i prezentacja menu | `5905A31EBBBD3723FDCF560FBA17AAD94B719F8981CD485A70B443A2D570AC25` |

Dowody runtime `h01-inspired-4`: [menu](inspired-artifacts-v4/h01-menu.png),
[scena](inspired-artifacts-v4/h01-scene.png),
[widok techniczny](inspired-artifacts-v4/h01-technical.png),
[konkurs](inspired-artifacts-v4/h01-competition-start.png),
[wynik po rzeczywistych klawiszach](inspired-artifacts-v4/h01-live-result.png),
[wynik deterministycznego fixture](inspired-artifacts-v4/h01-result-fixture.png),
[replay](inspired-artifacts-v4/h01-replay.png) i
[nagranie próby klawiaturowej](inspired-artifacts-v4/h01-keyboard-attempt.webm).
SHA-256 sceny PNG: `877D370BD625DF3F39DAB42CABC2ED3326044011898299BB872812DC5BD70159`;
nagrania: `06535E18F76C8048C72228DE2D487F6883DA3A42A967D292B1F5FB7EC0ED13DA`;
odświeżonego widoku technicznego:
`C9EEB90D64C3731DFB0BECD05C6344D61262C528A9816B937C17E301155C722F`.

[Historyczny manifest prototypu](ART_MANIFEST_PROTOTYPE.md) i
[manifest zaakceptowanej oprawy `h01-inspired-3`](ART_MANIFEST_INSPIRED_V3.md)
pozostają zachowane z odpowiadającymi im zrzutami. **H01 VISUAL USER PASS
23.09.2026** („resztę akceptuje”). Żaden zewnętrzny
asset fotograficzny nie został dołączony; nie deklarujemy odrębnej
licencji redystrybucji grafiki projektu.
