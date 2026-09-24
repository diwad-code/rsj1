# PKG-011 — P21-H03 Oberstdorf duża (D/G/A/V)

Pakiet docelowy: **PKG-011**.
Zakres: **P21-H03 — Oberstdorf duża, pełny cykl D/G/A/V** z
`docs/IMPLEMENTATION_PLAN.md` §6.
Po zamknięciu i akceptacji H03: **PKG-012 / P21-H04 Planica mamut**.
Nie implementuj H04 ani P22 w tym pakiecie.

Pracujesz w `C:\retro-ski-jumping`, przeglądarkowa gra TypeScript/Canvas2D,
**nie Godot**. Projekt **jest repozytorium Git**, na gałęzi main były już
brudne pliki użytkownika i liczne usunięcia w `test-results`; stan dysku ma
pierwszeństwo nad opisem. Zanim zmienisz plik sprawdź status, nie czyść,
nie resetuj, nie nadpisuj cudzych zmian ani starszych dowodów. Bez prośby
użytkownika nie commituj, nie pushuj, nie publikuj i nie wysyłaj wiadomości.

## Stan wejściowy i lektura

- PKG-001–010 COMPLETE; P21 IN PROGRESS: H01 Lillehammer K90/HS98 i H02
  Zakopane K125/HS140 mają osobne **VISUAL USER PASS 23.09.2026**. H03 i H04
  NOT STARTED. Techniczna K120/HS134 pozostaje grywalnym wzorcem, **nie**
  jest Oberstdorfem. Zewnętrzny jakościowy playtest NOT RUN.
- Czytaj kolejno aktualne `AGENTS.md`, `docs/README.md`, ten aktywny
  `docs/NEXT_SESSION_PROMPT.md`, `docs/PACKAGE_WORKFLOW.md`, następnie
  `docs/CONTENT_PLAN.md` §§1–4, `docs/IMPLEMENTATION_PLAN.md` P21 i §6,
  `docs/QA_ACCEPTANCE.md` Q-FIS-18–24. Potrzebne wzorce implementacji:
  `docs/hills/H02.md`, `docs/evidence/PKG-010/REPORT.md`,
  `src/simulation/hills/zakopaneLarge.ts`, `src/app/hills.ts`,
  `src/app/competitionSession.ts`, `src/app/main.ts`, `tests/h02.test.ts`
  i `tests/browser/h02.spec.ts`. Użyj jako wzorca integracji, nie kopiuj
  profilu, oprawy ani palety. Zachowaj wersje i wyniki wcześniejszych skoczni.
- Gra renderuje ręczny pixel art na jednej siatce logicznej **480×270**,
  skalowany do 960×540; font jest bitmapowy, brak AA i wektorowego tekstu.
  Trening/konkurs, AI, transakcyjny zapis IndexedDB i replay są obecne.

## Źródła i granice prawdy

`docs/CONTENT_PLAN.md` wskazuje Oberstdorf **dużą K120/HS137** oraz
[F11 z rejestru SOURCES](https://medias1.fis-ski.com/pdf/2026/JP/3103/2026JP3103RLQ.pdf)
(kwalifikacje 28.12.2025) jako **punkt startowy**, nie kompletną geometrię.
W zadaniu D ponownie potwierdź wybrany aktualny wariant K/HS z wiarygodnym
źródłem i konkursowy rekord tego wariantu **z datą i odsyłaczem**.
Nie pomyl dużej skoczni z techniczną grą K120/HS134 ani z mamucią skocznią
Oberstdorfu. W dokumentacji rozdziel FACT dokumentu, źródło rekordu oraz
parametry **ADAPT/TUNE** gry (w tym belki, profil, AUTO, bezpieczeństwo,
AI i ewentualne przybliżenia rekompensat); żadnej deklaracji homologacji
ani kopiowania cudzego artu. Jeżeli rekord/wariant nie da się potwierdzić,
oznacz blokadę jawnie zamiast przypisywać niesprawdzony wynik obiektowi.

## Wykonanie D → G → A → V

1. **D:** `docs/hills/H03.md` — tożsamość wariantu, K/HS i prawdziwy
   konkursowy rekord z datą, źródła i jawna tabela FACT/ADAPT/TUNE;
   pełna empiryczna statystyka upadków FIS nie jest wymaganą bramką.
2. **G:** prosty, własny wersjonowany `HillSpec` z profilem rozbiegu/zeskoku,
   distanceMap T/P/K/HS/U/fall line, belkami, sensorami, rekompensatą
   i uczciwą proweniencją. Dobierz AUTO dla obu znaków wiatru na skokach,
   jawne progi lądowania, oba style, timing, AI watched==fast, ten sam
   seed/input→ten sam wynik. Powtarzalny skok gracza musi dać **zapisany
   metraż po obcięciu do 0,5 m ≥ rekord + 2 m, dwie nogi, zero podpórek**;
   przy podobnych długich mniej dokładnych kontaktach podpórki przeważają.
   Bez losowania rozstrzygającego lądowanie człowieka. Dodaj do jawnego
   katalogu, bez frameworka przyszłych 20 obiektów.
3. **A:** oryginalna sylwetka konstrukcji, detale otoczenia i paleta
   Oberstdorfu widocznie odrębne od technicznej K120, H01 i H02; nie
   wystarczy przemalować wspólne tło. Sportowe markery pochodzą z tej
   samej mapy metrażu. Zachowaj siatkę, font i brak AA. Zapisz źródła
   inspiracji/prawa i SHA-256 w manifeście artu.
4. **V:** obie strony wyboru klawiaturą po dodaniu czwartej skoczni,
   trening/skok/wynik i oba lądowania, konkurs/jury/belki/wiatr/AI,
   zapis i wznowienie po reloadzie, izolacja sesji i rekordu po hillId/
   hillVersion, aktualny i stary replay bez przeliczenia. Kontroluj
   linie K/HS i co 5 m w widoku technicznym i produkcyjnym. Zapisz
   reprezentatywne **rzeczywiste** zrzuty 960×540 (menu, scena,
   techniczny, wynik, replay) i wideo skoku; fixture artu nie jest
   dowodem rozgrywki. Pokaż użytkownikowi do osobnego odbioru oprawy H03.
   **VISUAL PASS wystawia tylko użytkownik**, nie model i nie wyniki testów.

## Weryfikacja i przekazanie

Wykonuj potrzebne testy podczas implementacji; na finalnym kodzie
`npm run typecheck`, `npm test`, `npm run build`, celowane
`npx playwright test tests/browser/h03.spec.ts --workers=1 --output=docs/evidence/PKG-011/tmp-browser-h03`
(utwórz spec), plus właściwe regresje H01/H02 i wspólnego przepływu przy
jego zmianie. Playwright preview korzysta z buildu; nie kasuj wspólnych
`test-results`. W PKG-010 wspólna pojedyncza inwokacja E2E osiągnęła
timeout shella 240 s przy 18/25, a 7/7 pozostałych przypadków przeszły
osobno — nie kopiuj tego wyniku jako testu PKG-011 ani nie deklaruj
ukończonej inwokacji, która nie dobiegła końca. Nie rozszerzaj automatycznie
testów ponad zakres pakietu. Odbiór PLAYABILITY przez zewnętrznych graczy
pozostaje NOT RUN, jeśli go rzeczywiście nie wykonano.

Obowiązuje prostota z `AGENTS.md`: implementuj tylko obecny obiekt,
**jedno końcowe review po całym PKG**, popraw konkretne usterki i
sprawdź tylko zmienione ścieżki; bez pętli audytów. Zapisz jeden krótki
`docs/evidence/PKG-011/REPORT.md` z tabelą D/G/A/V, dokładnymi wynikami
testów, dowodami, werdyktem użytkownika i ograniczeniami. Po kompletnym
D/G/A/V i **rzeczywistym** VISUAL USER PASS zaktualizuj statusy bez
oznaczania całego P21 COMPLETE (H04 czeka) oraz przygotuj samodzielny
prompt PKG-012/P21-H04 w `docs/handoffs/PKG-012.md` i identycznie w
`docs/NEXT_SESSION_PROMPT.md`. Jeśli H03 pozostanie niepełna lub odbiór
VISUAL NOT RUN, nie przechodź do H04: zachowaj historię i przekaż
kanoniczną kontynuację PKG-011 z nazwanymi brakami. Po spełnieniu warunku
zatrzymania zakończ sesję, nie rozpoczynaj PKG-012.
