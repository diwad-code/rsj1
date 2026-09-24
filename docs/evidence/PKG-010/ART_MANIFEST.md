# PKG-010 / H02 — manifest oprawy Zakopanego

**Status artu:** implementacja A ukończona; **VISUAL USER PASS 23.09.2026**
— użytkownik: „Akceptuję H02”. Kontrakt: `h02-zakopane-large` / `h02-inspired-1`.
Scena jest autorskim, ręcznie zapisanym w kodzie pixel artem Canvas2D na
siatce 480×270. Nie użyto zewnętrznych zdjęć, logotypów, wygenerowanych PNG
ani pikseli z H01; nie istnieje osobny eksportowany asset H02.

| Plik źródłowy runtime | Pochodzenie i zakres | SHA-256 |
|---|---|---|
| `src/render/hillView.ts` | Ręcznie zapisane klastry i wielokąty pikselowe H02; paleta dnia zimowego, warstwowe Tatry / stylizowany Giewont, świerki, słońce, drewniana wieża i estakada, chaty, tarasowa trybuna oraz zaspy; uporządkowane podpisy techniczne | `8B75789676A6D3BD3DEADCB731FEA406D680C7DB355EC44D1938D60CAB094129` |

Widok techniczny i scena wybierają paletę po `HillSpec.id`; bufory profilu,
terenu i tła uwzględniają obiekt/paletę w kluczu. K/HS, metry i pasy nadal
pochodzą z istniejącego `buildSportMarkers(hill)` / `distanceMap`, bez
osobnej tabeli współrzędnych artu. Znak sportowy pozostaje czytelniejszy
od dekoracji; tylko podpisy metrowe w technicznym H02 są rzadsze (co 20 m,
pozycje kresek pozostają co 5 m). Brak antyaliasingu i tekstu wektorowego.
To krajobraz **inspirowany** Zakopanem, nie odtworzenie geograficzne ani
profil certyfikowanego obiektu.

Poprawka technicznego H02: P/K/HS pozostają na dokładnych pikselach
`distanceMap`, lecz ich tekst trafia do trzech osobnych wierszy z cienkimi
prowadnicami i kluczem koloru; CEL/REK otrzymały osobne pola wyżej. Nagłówek
nie ściska już polecenia powrotu: krótkie `D — SCENA` jest po prawej.
Warunki dotyczą tylko H02 w trybie technicznym; H01/K120 i sceny produkcyjne
pozostały bez zmian.

**Kontrola końcowa:** przejściowy błąd TS2365/TS2363 w równolegle
edytowanym `tests/browser/h02.spec.ts` został naprawiony; na finalnym kodzie
rodzic potwierdził `npm run typecheck` **PASS**. Przegląd Chromium/Vite bez
błędów strony. Historyczne zrzuty diagnostyczne 960×540 w katalogu
tymczasowym (nie są trwałym dowodem gry):

- scena przy belce: `C:/Users/admin/AppData/Local/Temp/opencode/pkg010-h02-scene-960x540.png`;
- aktualny widok techniczny po poprawce: `C:/Users/admin/AppData/Local/Temp/opencode/pkg010-h02-technical-layout-r2-960x540.png`;
- **fixture artu**, nie rzeczywisty skok: `C:/Users/admin/AppData/Local/Temp/opencode/pkg010-h02-stands-fixture-960x540.png` (pozycja aktora przy 149 m, sprawdzenie trybuny i linii HS).

Przełączanie scen H02 → H01 → H02 przy belce dało RGB próbki nieba
`[174,179,170] → [51,56,80] → [174,179,170]` bez przecieku palety.
Samodzielna oględzina ujawniła trybunę częściowo pod stokiem; poprawiono
jej posadowienie i ponownie obejrzano fixture. **Ograniczenie kadru:**
przy niektórych belkach górna część dachu wieży kryje się za górnym HUD-em;
linia dachu i pełna bryła są widoczne podczas najazdu. Trwałe zrzuty
produkcji/technicznego widoku, wynik i film **rzeczywistego skoku** znajdują
się w [ARTIFACTS.md](ARTIFACTS.md); nie użyto fixture jako dowodu skoku.
Odrębność H02 wobec H01/K120 sprawdzono w testach przeglądarkowych;
werdykt VISUAL podał użytkownik, nie model.

**Replay HUD:** wcześniejsza kolizja podpisów FIZYKA/SKOCZNIA/ZASADY z
`ZAPIS` została poprawiona w `src/render/replayView.ts` w trakcie iteracji
podglądu. Finalny [kadr replaya](artifacts/h02-real-replay-960x540.png)
pokazuje oddzielne wiersze debug i licznik po prawej, bez nakładania tekstów.
