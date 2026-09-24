# PKG-011 / P21-H03 — Oberstdorf duża

**Werdykt: COMPLETE — D/G/A/V.** Grywalna adaptacja Schattenbergschanze
K120/HS137 (`h03-oberstdorf-large`, `h03-inspired-1`), nie wierna rekonstrukcja.
Użytkownik zaakceptował oprawę H03 23.09.2026: „skocznia obersdorff jest ok”
(**VISUAL USER PASS**). Przekazano mu w rozmowie sześć rzeczywistych zrzutów
960×540 i link do pełnego WebM; nie ma potwierdzenia, że obejrzał cały film.
P21 pozostaje **IN PROGRESS**, H04 **NOT STARTED**.

| Zakres | Status | Dowód / granica |
|---|---|---|
| D | COMPLETE | [Karta H03](../../hills/H03.md): FACT K120/HS137, rekord WC JP 143,5 m Pettersena (29.12.2003), odrębne ADAPT/TUNE. |
| G | COMPLETE | Profil `src/simulation/hills/oberstdorfLarge.ts`, AUTO/wind/AI; kontrolowana symulacja: kontakt 147,2199 m, zapis 147,0 m na dwie nogi bez podpórki; nie jest to filmowany skok. |
| A | COMPLETE — VISUAL USER PASS 23.09.2026 | Autorski art na siatce 480×270 i [manifest A](ART_MANIFEST.md); osobny werdykt użytkownika po prezentacji H03. |
| V | COMPLETE — TECHNICAL PASS; VISUAL USER PASS 23.09.2026 | [Sześć zrzutów i film z sumami](ARTIFACTS.md): realne próby z klawiatury R 129,52 m / T 125,42 m, obie ustane; katalog, belki, wiatr, konkurs, zapis i replay. Brak osobnego zrzutu K/HS z produkcyjnej kamery podczas przelotu. |

## Sprawdzenia (wcześniej wykonane; nie ponawiano dla dokumentacji)

- `npm run typecheck` **PASS**; `npm test` **PASS — 35 plików, 304/304**;
  `npm run build` **PASS — 37 modułów**.
- Playwright H03 **4/4 PASS**, H01/H02 w osobnych sekwencyjnych uruchomieniach
  **3/3 i 3/3 PASS**, celowany wspólny test jury **1/1 PASS**. Wcześniejsze
  równoległe pełne inwokacje H01/H02 miały niezaliczone przypadki, a nie PASS;
  ich szczegóły zachowano w [artefaktach V](ARTIFACTS.md).
- Zewnętrzny jakościowy odbiór **PLAYABILITY NOT RUN**. Akceptacja wyglądu
  nie jest dowodem pełnego obejrzenia filmu ani jakościowego playtestu.
- Przy przekazaniu `pwsh -NoProfile -File docs/tools/validate-documentation.ps1
  -CheckActiveHandoff` — **PASS** (98 plików Markdown, 364 linki, 35 pakietów,
  aktywny PKG-012). Naprawiono 16 błędnych względnych linków w historycznej
  karcie źródłowej H01, bez zmiany jej danych; brak `.github/skills/README.md`
  pozostaje udokumentowanym wyjątkiem z fallbackiem `.agents/skills/`.

## Końcowe review i ograniczenia

**Jedno końcowe review pakietu wykonał rodzic przed tym przekazaniem;
nie wykonano drugiego.** Sześć historycznych plików PKG-010 nadpisano podczas
początkowej regresji H02; obecne hashe nie odpowiadają staremu manifestowi.
Po sprawdzeniu kopii i odzyskanej `.git` użytkownik zaakceptował
**udokumentowaną utratę** („dobra, trudno”). Szczegóły i granice odzysku:
[incydent w artefaktach V](ARTIFACTS.md). Oryginałów nie odzyskano, starego
manifestu i nadpisanych plików nie zmieniano; nie ustanowiono nowej bazy
dowodowej. `.git` jest już odtworzona; nie wykonywano commit/reset/restore.
Następny pakiet: [PKG-012 / P21-H04](../../handoffs/PKG-012.md); H04 nie
rozpoczęto w PKG-011.
