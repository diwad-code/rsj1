# PKG-012 — P21-H04 Planica mamut (D/G/A/V)

Pakiet docelowy: PKG-012
Status początkowy: NOT STARTED.
Zakres: **P21-H04 — Planica mamut, pełny cykl D/G/A/V** według
`docs/IMPLEMENTATION_PLAN.md` §6. To czwarty i ostatni obiekt P21, ale P21
można zamknąć dopiero po wykonaniu całego H04 i odbiorze użytkownika. Po
rzeczywistym COMPLETE: **PKG-013 / P22 — ustawienia, remapowanie i dostępność**.
Nie zaczynaj P22, H05–H20 ani innych przyszłych trybów w tym pakiecie.

## Stan wejściowy — katalog i lektura

Pracujesz w `C:\retro-ski-jumping`: **gra przeglądarkowa TypeScript/Canvas2D,
nie Godot**. Czytaj kolejno bieżące `AGENTS.md`, `docs/README.md`, aktywny
`docs/NEXT_SESSION_PROMPT.md`, `docs/PACKAGE_WORKFLOW.md` §§3–5, następnie
`docs/CONTENT_PLAN.md` §§1–4, `docs/IMPLEMENTATION_PLAN.md` P21 i §6,
`docs/QA_ACCEPTANCE.md` Q-FIS-18–24. Dopiero dla konkretnego pytania lub
integracji sięgaj do `docs/hills/H03.md`, `docs/evidence/PKG-011/REPORT.md`,
`src/app/hills.ts`, istniejących plików H03 i jego testów. Wzorzec integracji
nie jest źródłem profilu, palety ani wyniku Planicy; najpierw sprawdź stan
dysku i zachowaj istniejące zmiany użytkownika.

PKG-001–011 COMPLETE; bazowa bramka V USER PASS 22.09.2026. P21 IN PROGRESS:
H01 Lillehammer K90/HS98, H02 Zakopane K125/HS140 i H03 Oberstdorf
K120/HS137 ukończone, każda z osobnym VISUAL USER PASS 23.09.2026. Dla H03
użytkownik powiedział dosłownie „skocznia obersdorff jest ok”; **nie**
twierdź, że obejrzał cały film. H04 **NOT STARTED**; zewnętrzny jakościowy
PLAYABILITY **NOT RUN**. Techniczna K120/HS134 pozostaje osobnym obiektem.
Trening, konkurs, AI, transakcyjny zapis IndexedDB i replay już działają;
wspólny pixel art używa logicznej siatki 480×270 skalowanej do 960×540,
bitmapowego fontu i bez antyaliasingu.

Sześć oryginalnych artefaktów H02/PKG-010 nadpisano w dawnej regresji i
nie odnaleziono w zaufanych źródłach. Użytkownik przyjął **udokumentowaną
utratę** („dobra, trudno”), nie odzyskanie: pozostaw historyczny manifest
PKG-010 nietknięty, obecnych plików nie nazywaj oryginałami, nie twórz
domyślnej nowej bazy. Backup
`C:\retro-ski-jumping\retro-ski-jumping-23-09-2026-backup` sięga tylko
PKG-009. Katalog `.git` odtworzono: jeden początkowy commit `9b4a5ad`, 25
niedopasowanych nieosiągalnych blobów, wiele cudzych zmian w worktree.
**Bez wyraźnego polecenia nie wykonuj git init/reset/clean/restore/commit/push,
nie publikuj ani nie wysyłaj wiadomości osobom trzecim.** Nie czyść wspólnych
`test-results`, archiwalnych dowodów ani historycznych promptów. Zachowane
oryginalny i kontynuacyjny prompty PKG-011 to odpowiednio
`docs/handoffs/PKG-011-rev01.md` i `docs/handoffs/PKG-011.md`; ich historyczne
twierdzenia o brakach nie są bieżącym stanem.

## Źródła i kryteria produktu

`docs/CONTENT_PLAN.md` daje punkt wyjścia **Planica mamut K200/HS240** i
datowane źródło F12 (nie pełny profil):
https://medias3.fis-ski.com/pdf/2026/JP/3181/2026JP3181RLT.pdf .
W zadaniu D niezależnie potwierdź **konkretny wariant K/HS** oraz **prawdziwy
rekord tego wariantu z datą i wiarygodnym odsyłaczem**; nie zakładaj rekordu
z pamięci i nie myl go z rekordem świata lub innej skoczni. Brak źródła
oznacz UNRESOLVED/BLOCKED, a nie domyślną wartość. F12 i dane konkursowe
opisują tylko to, co faktycznie zawierają. Skocznia jest **grywalną adaptacją
inspirowaną Planicą**, nie homologowanym profilem FIS: tylko K/HS muszą
odpowiadać wariantowi; profil, belki, AUTO, parametry lądowania i AI są
jawnymi ADAPT/TUNE, kontrolowanymi skokami. Rozdziel FACT źródła od decyzji
gry; pełny oficjalny PDF profilu i empiryczna krzywa upadków nie są bramką.

Wymagania `AGENTS.md` i Q-FIS-18–24: ten sam seed i input dają ten sam wynik,
**bez ukrytej kości decydującej o lądowaniu gracza**. Po potwierdzeniu rekordu
powtarzalna, trudna ścieżka gracza musi dać **zapisany metraż po obcięciu do
0,5 m co najmniej rekord + 2 m, lądowanie na dwie nogi bez podpórki**;
telemark nie jest warunkiem rekordu. Na podobnie dalekich mniej dokładnych
próbach podpórka powinna występować częściej, a nie każdy skok musi być
ustany. Sprawdź wzrost trudności za HS, przewagę dwóch nóg nad telemarkiem
przy tej samej odległości, zachowanie zbyt wczesnego przygotowania i T,
jawny próg niemożliwego dystansu, AUTO bezpieczne przy wietrze z obu stron.
Nowa skocznia musi mieć oryginalną **odrębną sylwetkę konstrukcji, detale
otoczenia i paletę**, a nie tylko inne kolory wspólnego tła. Zdjęcia mogą
inspirować, ale nie kopiuj ich do gry bez prawa użycia. **VISUAL PASS wydaje
wyłącznie użytkownik dla H04**, nie model ani test techniczny.

## Wynik pakietu — wykonanie D → G → A → V

1. **D:** przygotuj `docs/hills/H04.md`: wariant i data, cytowane źródła
   K/HS oraz rekordu, tabelę FACT/ADAPT/TUNE/UNRESOLVED, proweniencję
   współczynników i ograniczenia. Nie podszywaj parametrów gry pod FIS.
2. **G:** własny, prosty wersjonowany `HillSpec` z krzywą rozbiegu, zeskoku,
   wybiegu i jedną `distanceMap` dla T/P/K/HS/U/fall line, pomiaru i linii
   co 5 m; własne belki, sensory, rekompensaty i kontrolowane progi.
   Skalibruj skoki kontrolne (timing wczesny/dobry/późny, T/R, wiatr
   w obie strony), AUTO z wiatrem, trudność dalekich lądowań, AI watched
   == fast i deterministyczny przykład rekordu + 2 m bez podpórki.
   Integruj z istniejącym jawnym katalogiem, bez frameworka dla 20 obiektów;
   zachowaj wersje i wyniki H01–H03 oraz technicznej skoczni.
3. **A:** przygotuj autorski pixel art i miniaturę Planicy w tej samej
   jawnej siatce (480×270 → 960×540), z własną sylwetką, otoczeniem i
   paletą; bitmapowy font, bez AA/tekstu wektorowego. Linie sportowe
   wynikają z `distanceMap`, nie z obrazka. Zapisz pochodzenie assetów,
   prawa i SHA-256 eksportów w manifeście H04; nie nadpisuj artu ani
   dowodów starszych skoczni.
4. **V:** wybór H04 samą klawiaturą, trening i wynik, oba rodzaje lądowania,
   belki/jury i wiatr, standardowy konkurs, AI, zapis/wznowienie po reloadzie,
   rozdział hillId/hillVersion i starych rekordów/sesji, świeży oraz stary
   replay bez ponownego przeliczenia. Zweryfikuj linie K/HS/5 m z tej samej
   mapy w widoku technicznym i grze, a także odjazd i bezpieczeństwo mamuta.
   Zachowaj **rzeczywiście nagrane** zrzuty 960×540 (menu, scena, przekrój,
   wyniki obu lądowań, replay) oraz film skoku z klawiatury; fixture i
   screenshot końcowy nie udowadniają przebiegu całej gry. Pokaż materiały
   użytkownikowi i zapytaj o osobną akceptację wyglądu/animacji/czytelności
   H04. Nie przypisuj użytkownikowi oglądania materiału bez potwierdzenia.

## Weryfikacja i wznowienie

Twórz celowane testy, np. `tests/h04.test.ts` i
`tests/browser/h04.spec.ts`, dla Q-FIS-18–24, rekordu + 2 m po zapisanym
pomiarze, obu lądowań, deterministycznego AI oraz ścieżki klawiatury,
konkursu, zapisu i replaya. Na aktualnym kodzie uruchom `npm run typecheck`,
`npm test`, `npm run build`, potem
`npx playwright test tests/browser/h04.spec.ts --workers=1 --output=docs/evidence/PKG-012/tmp-browser-h04`.
Preview Playwright korzysta z **zbudowanego `dist`**; uruchom build przed E2E,
nie przedstawiaj starego dist jako nowej wersji. Wspólne regresje H01–H03
uruchom tylko przy modyfikacji wspólnych ścieżek; nie powtarzaj zielonych
testów bez nowej przyczyny. Testy zapisują do osobnego tmp; **publikuj
trwałe artefakty wyłącznie jawnie po udanych przebiegach**, nigdy nie
nadpisuj starszego materiału. Zapisz rzeczywiste polecenia, wyniki,
identyfikatory i ścieżki dowodów; brak wykonania = NOT RUN, nie PASS.

Jeśli sesję przerwano, porównaj faktyczny stan plików, raportu i dowodów z
promptem, zachowaj cudze zmiany i kontynuuj tylko brakujące D/G/A/V.
Blokada rekordu/źródła nie powinna zatrzymywać niezależnej pracy, ale nie
wolno wymyślać wartości ani zamykać pakietu z niespełnioną bramką.
Zewnętrzny jakościowy PLAYABILITY pozostaje **NOT RUN**, jeśli brak testera;
nie zamieniaj go na techniczny lub wizualny PASS. Prostota z `AGENTS.md`:
tylko H04, **jedno końcowe review po całym PKG** względem kryteriów,
potem celowane poprawki i sprawdzenie zmienionych ścieżek, bez drugiego
pełnego audytu. Jeden krótki `docs/evidence/PKG-012/REPORT.md` z tabelą
D/G/A/V, wynikami komend, linkami do dowodów, sekcją „Końcowe review”,
werdyktem użytkownika i ograniczeniami wystarcza.

## Zamknięcie i następna sesja

**Stop:** dopiero gdy D/G/A/V, wymagane sprawdzenia i rzeczywisty VISUAL
USER PASS H04 są kompletne, zaktualizuj statusy PKG-012/P21, zapisz
samodzielny prompt **PKG-013/P22** w `docs/handoffs/PKG-013.md` i identycznie
w `docs/NEXT_SESSION_PROMPT.md`; nie implementuj P22 w tej sesji. Jeśli H04
pozostaje nieukończona lub użytkownik nie wydał werdyktu, zostaw PKG-012
INCOMPLETE/BLOCKED, zarchiwizuj aktualny prompt zgodnie z
`docs/PACKAGE_WORKFLOW.md` i przekaż kanoniczną **kontynuację PKG-012**,
nie PKG-013. Po przekazaniu zatrzymaj się.
