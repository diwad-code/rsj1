# Wykonaj PKG-008 — P42, przebudowa oprawy do akceptacji użytkownika (bramka V)

Pakiet docelowy: PKG-008
Zakres: P42
Następny pakiet po zamknięciu: PKG-009 — P21-H01 (Lillehammer normalna), o ile bramka V
zostanie zaliczona akceptacją użytkownika. Jeśli nie zostanie zaliczona, następna sesja
kontynuuje PKG-008, nie przechodzi do PKG-009.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie inicjalizuj Git
i nie publikuj gry.

## Ta sesja zaczyna się od pytania, nie od kodu

PKG-007 zebrał empiryczny audyt oprawy z dowodami obrazowymi i zostawił **siedem pytań
decyzyjnych** w `docs/evidence/PKG-007/REPORT.md`, sekcja
6. Przebudowa (P42) nie ma jeszcze wybranych parametrów wykonania — kierunek artystyczny
(SJ3 = kamera/widok/sylwetka, DSJ2 = paleta/kontrast/cień/HUD/płynność, animacja ponad obie
gry) jest rozstrzygnięty i **nie podlega ponownej dyskusji**, ale rozdzielczość wewnętrzna,
dokładna wielkość skoczka i liczba klatek, pierwsza rodzina palety, zakres naprawy paralaksy
tła, los ekranu powtórki i podejście do banku kształtów skoczka — nie.

**Zanim napiszesz jakikolwiek kod renderera:**

1. Sprawdź, czy użytkownik już odpowiedział na siedem pytań z REPORT.md §6 (w treści
   promptu tej sesji, w wiadomości otwierającej, albo w osobnym pliku, jeśli o takim
   wspomni). Jeśli tak — wypełnij nimi tabelę w sekcji „Wybrane parametry” niżej i zacznij
   pracę.
2. Jeśli odpowiedzi nie ma — **zapytaj użytkownika wprost o te siedem punktów, zanim
   zaczniesz cokolwiek zmieniać w `src/render/`.** Nie zgaduj rekomendacji z raportu jako
   milczącej zgody; rekomendacje są propozycją audytu, nie decyzją użytkownika. Poczekaj
   na odpowiedź i dopiero wtedy kontynuuj tę samą sesję.

### Wybrane parametry (do wypełnienia po odpowiedzi użytkownika)

| # | Pytanie (REPORT.md §6) | Rekomendacja audytu | Decyzja użytkownika |
| --- | --- | --- | --- |
| 1 | Rozdzielczość wewnętrzna | 480×270 | **`TU WPISZ ODPOWIEDŹ`** |
| 2 | Skalowanie wielkości skoczka do nowej siatki | przeliczyć proporcjonalnie z 36-48/48-68 px | **`TU WPISZ ODPOWIEDŹ`** |
| 3 | Pierwsza rodzina palety | skandynawska noc z reflektorami | **`TU WPISZ ODPOWIEDŹ`** |
| 4 | Naprawa paralaksy tła w tym pakiecie? | tak, w zakresie P42 | **`TU WPISZ ODPOWIEDŹ`** |
| 5 | Scena produkcyjna w powtórce w tym pakiecie? | tak, w zakresie P42 | **`TU WPISZ ODPOWIEDŹ`** |
| 6 | Bank skoczka: nowy czy strojenie istniejącego | nowy sprite od zera | **`TU WPISZ ODPOWIEDŹ`** |
| 7 | Budżet klatek na fazę | 4 / 6-8 / 4 / 3 / 2-3 (wybicie/lot/przygotowanie/lądowanie/rozbieg-odjazd) | **`TU WPISZ ODPOWIEDŹ`** |

Dopóki ta tabela zawiera `TU WPISZ ODPOWIEDŹ`, nie zaczynaj implementacji P42.

## Dlaczego ten pakiet istnieje

Użytkownik odrzucił oprawę po PKG-006. PKG-007 udowodnił dowodem obrazowym m.in.: brak
jednej siatki pikseli (antyaliasing Canvas2D na ścieżkach fill/stroke), wektorowy
`"Courier New"` w niemal całym tekście gry, brak dyskretnych klatek animacji skoczka
(ciągła rotacja proceduralna), **całkowity brak paralaksy tła** (góry/stadion/las są
w 100% statyczne względem ekranu — nowe ustalenie audytu), ekran powtórki pokazujący
cienki widok diagnostyczny zamiast sceny produkcyjnej, i brak cienia skoczka na śniegu.
Pełna lista dwunastu rozbieżności z priorytetem i kosztem jest w REPORT.md §4.

## Twarde zasady wykonania

Stosuj `AGENTS.md` w całości, w tym zasadę prostoty i zamrożenie zawartości. Dodatkowo:

1. **To przebudowa oprawy, nie nowa zawartość.** Nadal jedna skocznia techniczna
   (`tech-k120-hs134`). Zero nowych skoczni, trybów, ekranów spoza listy w GDD §7.
   Zamrożenie zawartości z AGENTS.md nadal obowiązuje aż do zaliczenia bramki V.
2. **Zasady sportowe, fizyka i wynik nie zmieniają się.** Możesz zmienić WYGLĄD
   oznaczeń (kolory, grubość, font), ale nie ich pozycje/logikę (`sportMarkers.ts`
   generator zostaje). Zapis i replay (format danych) nie zmieniają się — zmienia się
   tylko to, CZYM replay jest renderowany (patrz decyzja #5).
3. **Jedno końcowe review po całym P42**, nie po każdym pliku assetów. Testy/podgląd w
   trakcie implementacji to bieżąca praca, nie runda review.
4. **VISUAL zalicza wyłącznie użytkownik.** Model nie wpisuje PASS w VISUAL. Ten pakiet
   kończy się **bramką V**: jeśli użytkownik nie zaakceptuje wyglądu po obejrzeniu
   zrzutów/nagrań, pakiet zostaje INCOMPLETE i następna sesja go kontynuuje — nie wolno
   przejść do PKG-009 bez tej akceptacji.
5. Domyślnie pracuj jednym modelem, bez dodatkowych agentów-recenzentów, chyba że
   użytkownik wyraźnie zleci inaczej.

## Stan wejściowy

PKG-001–007 / P01–P20, P41 są COMPLETE. Finalna weryfikacja PKG-007:

- `npm run typecheck` PASS;
- `npm test` PASS — **23 pliki, 168/168** testów;
- `npm run build` PASS — Vite, 32 moduły, JS 132,83 kB / 41,95 kB gzip (identyczne z
  PKG-006 — P41 nie zmienił kodu gry);
- `npm run test:e2e` — 28 testów zebranych (18 sprzed PKG-007 + 10 nowych), 1 świadomie
  pominięty (benchmark P15). Dwa pełne przebiegi dały po jednym nie-regresyjnym,
  timingowym niepowodzeniu w **różnych, przedpakietowych** testach
  (`jump.spec.ts`/`shell.spec.ts`), oba PASS w izolacji — szczegóły i przyczyna w
  `docs/evidence/PKG-007/REPORT.md` sekcja 7. Nie traktuj tego jako
  otwartego zadania P42 — to obserwacja o obciążeniu testów, nie o kodzie renderera.
- **Uwaga o dowodach:** w trakcie PKG-007 20 plików `docs/evidence/PKG-006/
  browser-artifacts/*.png` zostało nadpisanych świeżymi (ale treściowo równoważnymi)
  zrzutami z powodu nieprzeniesionych na czas ścieżek w starszych specach — naprawione
  i opisane w REPORT.md §7. Ścieżki w `jump.spec.ts`, `competition.spec.ts`,
  `shell.spec.ts`, `benchmark.spec.ts`, `persistence.spec.ts` wskazują teraz
  `docs/evidence/PKG-007/browser-artifacts/`. **Na początku tej sesji, jeśli uruchamiasz
  `npm run test:e2e`, przenieś te ścieżki na `docs/evidence/PKG-008/browser-artifacts/`
  najpierw** — inaczej powtórzysz ten sam błąd na cudzych dowodach PKG-007.

Stan renderera (bez zmian od PKG-007, patrz REPORT.md §3-4 po pełne cytaty z linią kodu):
`src/render/hillView.ts` rysuje scenę wielokątami/krzywymi na współrzędnych
zmiennoprzecinkowych (antyaliasing Canvas2D), tło (`drawProductionBackground`,
`drawStadium`) jest statyczne względem ekranu, skoczek to bank proceduralnych kątów bez
klatek (`JUMPER_ART_VERSION = 'pkg004-jumper-bank-1'`), kamera ma stały `scale = 4.15`,
HUD i ekrany konkursu/powtórki używają głównie `"Courier New"`, `pixelFont.ts` (bitmapa
5×7) jest gotowy, ale użyty tylko szczątkowo, replay renderuje się przez
`drawHillProfile` (cienki widok diagnostyczny), zero cienia skoczka.

## Potrzebna lektura

1. `AGENTS.md` — zasada prostoty i zamrożenia zawartości;
2. ten prompt i sekcję zamknięcia w `docs/PACKAGE_WORKFLOW.md`;
3. `docs/evidence/PKG-007/REPORT.md` w całości — to jest
   specyfikacja tego, co naprawiasz i dlaczego, z dokładnymi liniami kodu;
4. `docs/ART_UI_AUDIO.md` — standard docelowy, teraz z konkretnymi parametrami z REPORT.md §5
   zamiast ogólnych widełek;
5. `docs/IMPLEMENTATION_PLAN.md`: sekcja P42;
6. `src/render/hillView.ts`, `competitionView.ts`, `replayView.ts`, `pixelFont.ts`,
   `sportMarkers.ts`, `src/app/style.css`, `src/app/main.ts` (wywołania rendererów);
7. `docs/research/reference-images/README.md` oraz same obrazy SJ3 i DSJ2 — dalej
   obowiązuje zakaz odtwarzania ich z pamięci; każda decyzja wizualna ma oprzeć się na
   pliku, nie na wrażeniu.

Jeżeli `.github/skills/README.md` nadal nie istnieje, użyj jednego lub dwóch rzeczywiście
potrzebnych skilli z `.agents/skills/` (prawdopodobnie `dos-pixel-art`); nie skanuj całego
katalogu.

## Wynik pakietu

Po wypełnieniu tabeli decyzji: renderer gry (`src/render/*`, `src/app/style.css`,
wywołania w `src/app/main.ts`) przechowuje prawdziwy pixel art zgodny z wybranymi
parametrami: jedna siatka pikseli, bitmapowy font wszędzie, klatkowy skoczek z cieniem,
tło reagujące na kamerę, poprawiony ekran powtórki (jeśli decyzja #5 to potwierdza).
Zasady sportowe, fizyka, zapis i wynik działają dokładnie tak jak przed pakietem.

- [ ] Zaimplementuj wybraną rozdzielczość wewnętrzną i skalowanie do ekranu (decyzja #1).
- [ ] Przebuduj/przeskaluj bank skoczka zgodnie z decyzją #6-7; dodaj cień (opcja E
      z REPORT.md §5).
- [ ] Zaimplementuj paletę jako system rampy/rodziny (opcja C), zacznij od rodziny
      z decyzji #3.
- [ ] Napraw brak paralaksy tła, jeśli decyzja #4 to potwierdza (opcja D z REPORT.md §5).
- [ ] Zastąp `"Courier New"` bitmapowym fontem wszędzie, łącznie z wariantem na tytuły
      (opcja F).
- [ ] Rozstrzygnij wygląd ekranu powtórki zgodnie z decyzją #5.
- [ ] Sprawdź sterowanie i odczucie fizyki na ekranie; popraw tylko to, co audyt wykazał
      jako problem (rozbieżność #8 — efekty wybicia/lądowania), bez zmiany parametrów
      fizyki ani zasad punktacji.

## Weryfikacja

Na finalnym kodzie uruchom:

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

`npm test` i `npm run typecheck` muszą pozostać zielone bez zmiany liczby testów
jednostkowych (168) — P42 nie dotyka fizyki/punktacji/zapisu. Zmiana wyglądu może
wymagać aktualizacji `test:e2e` tam, gdzie testy porównują konkretne piksele/kolory
(sprawdź `jump.spec.ts`/`competition.spec.ts` pod kątem takich asercji przed zmianą
renderera) — zaktualizuj je do nowego wyglądu, nie usuwaj bez zamiennika.

Wymagane dowody: zrzuty 960×540 i docelowej rozdzielczości ×N dla tych samych ekranów
i faz co w PKG-007 (żeby dało się porównać przed/po), krótkie nagranie pełnego skoku,
oraz — tak jak w PKG-007 — wycinki 1:1 potwierdzające, że siatka pikseli jest tym razem
faktyczna (bez antyaliasingu). Zapisz je w `docs/evidence/PKG-008/`.

## Granice i ryzyka

- To przebudowa renderera, nie nowej mechaniki. Jeśli w trakcie pracy zauważysz, że
  fizyka/punktacja wymaga zmiany żeby „lepiej wyglądało” — to sygnał, że robisz coś poza
  zakresem; zatrzymaj się i zapytaj użytkownika.
- Materiały referencyjne SJ3/DSJ2 zostają w `docs/research/`, poza `public/` i poza
  buildem, zgodnie z dotychczasową zasadą.
- Nie odtwarzaj wyglądu DSJ2 ani SJ3 z pamięci modelu — każda decyzja kolorystyczna/
  proporcji ma oprzeć się na konkretnym pliku referencyjnym albo na wartościach z
  REPORT.md §5.
- Bramka V wymaga rzeczywistej odpowiedzi użytkownika na zrzuty/nagrania tego pakietu —
  self-review nie wystarcza (dokładnie to zdarzenie doprowadziło do PKG-007).

## Procedura wznowienia po przerwaniu

Sprawdź stan dysku, `docs/evidence/PKG-008/` i czy tabela decyzji na górze tego promptu
jest wypełniona. Jeśli nie — najpierw zapytaj użytkownika, zanim cokolwiek zmienisz w
`src/render/`. Jeśli tak i praca była w toku, uruchom `npm run typecheck` oraz `npm test`,
kontynuuj od pierwszego niewykonanego punktu listy w „Wynik pakietu”. Zachowaj zebrane
dowody. Jeśli bramka V nie zostanie zaliczona w tej sesji, przygotuj prompt kontynuacji
PKG-008 (nie PKG-009) z konkretnym stanem: co użytkownik zaakceptował, co odrzucił, co
zostało do poprawy.

## Zamknięcie i następna sesja

1. Po wypełnieniu listy z „Wynik pakietu” wykonaj jedno końcowe auto-review całego PKG-008.
2. Zapisz `docs/evidence/PKG-008/REPORT.md`: status P42, dowody przed/po, wyniki poleceń,
   TECHNICAL/VISUAL/PLAYABILITY, ograniczenia.
3. VISUAL wymaga jawnej odpowiedzi użytkownika po obejrzeniu dowodów tej sesji — nie
   wpisuj PASS bez niej. Jeśli użytkownik zaakceptuje w tej samej sesji, zapisz to
   dosłownie (cytat/parafraza decyzji) w raporcie.
4. Jeśli bramka V zaliczona: zaktualizuj status PKG-008 na COMPLETE i przygotuj prompt
   PKG-009 / P21-H01 (Lillehammer normalna, pierwszy obiekt po odmrożeniu zawartości) w
   `docs/handoffs/PKG-009.md` oraz identycznie w `docs/NEXT_SESSION_PROMPT.md`.
5. Jeśli bramka V niezaliczona lub pakiet niekompletny: przygotuj kontynuację PKG-008
   (nie nowy numer) z dokładnym stanem odbioru użytkownika.
6. Po handoffie uruchom raz
   `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
7. W odpowiedzi końcowej podaj: co zmieniło się wizualnie, czy użytkownik zaakceptował,
   i link do aktywnego promptu.
