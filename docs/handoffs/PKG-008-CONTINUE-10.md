# PKG-008 — P42, runda 9: oczekiwanie na werdykt po liście poprawek rundy 8

Pakiet docelowy: PKG-008
Zakres: P42

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
incjalizuj Git i nie publikuj gry.

## Cel tej sesji

To jest prompt kontynuacji po rundzie 8. Poprzednia sesja wdrożyła pełną listę
poprawek użytkownika (8 punktów) wraz z empiryczną kalibracją Wisły K120/HS134.
Bramka V pozostaje NIEZALICZONA do czasu werdyktu użytkownika.

1. Przeczytaj materiały ze „Stanu wejściowego”.
2. Obejrzyj aktualne obrazy i oba nagrania narzędziem do obrazów/wideo.
3. Napisz krótkie podsumowanie aktualnego stanu i zatrzymaj się.
4. Nie zmieniaj kodu ani dokumentacji, dopóki użytkownik nie wyda werdyktu
   ani nie poda kolejnej listy.

Po otrzymaniu werdyktu zapisz go dosłownie. Jeśli to PASS bramki V — zamknij
pakiet i przygotuj `docs/handoffs/PKG-009.md` (P21-H01). Jeśli jest kolejna
lista poprawek — wykonaj ją jak rundy wcześniejsze: w podanej kolejności,
konieczne korekty zależne wprost z listy dozwolone, zero nowej zawartości.

## Stan wejściowy

Przeczytaj:

1. `AGENTS.md` — prostota, jedno końcowe review, zamrożenie zawartości,
   twarda zasada empirycznej kalibracji skoczni realnych (19.09.2026).
2. `docs/evidence/PKG-008/REPORT.md` §13 — pełny zapis rundy 8 i wyniki.
3. `docs/evidence/PKG-008/hill-geometry-fis.md` §8 — kalibracja empiryczna
   Wisły K120/HS134 (3 datowane PDF FIS, N=232, progi prowizoryczne).
4. W razie zmian wizualnych: `docs/ART_UI_AUDIO.md` oraz skill
   `.agents/skills/dos-pixel-art/`.
5. W razie zmian fizyki: `docs/GAMEPLAY_SPEC.md` i skill
   `.agents/skills/ski-jump-aero/`.

Aktualne dowody:

- fazy, wycinki i arkusze póz:
  `docs/evidence/PKG-008/browser-artifacts/pkg008-phase-*`,
  `pkg008-crop-skoczek-*-upscaled6x.png`,
  `pkg008-pose-sheet-all-31.png`, `pkg008-transition-*-*.png`,
  `pkg008-telemark-vs-parallel-*.png`;
- pełny skok człowieka (landed 111,9 m):
  `docs/evidence/PKG-008/video-review/pkg008-pelny-skok-czlowieka.webm`;
- konkurs z botami (landed 112,5 m):
  `docs/evidence/PKG-008/video-review/pkg008-fragment-konkursu-boty.webm`;
- referencje: `docs/research/reference-images/` — SJ3, DSJ2, cztery zdjęcia
  prawdziwych skoczków i strony FIS.

## Co jest gotowe po rundzie 8

### Poprawki z listy użytkownika

- usunięty prostokątny artefakt między K a HS (szeroka trybuna);
- jury dobiera belkę do prognozy wiatru (okno 0-5 s, 11 próbek), cel
  bezpieczny 127,0 m z empirycznych q50-q75 Wisły;
- trudność lądowania za HS rośnie pierwiastkowo do progów
  telemark 142 m / dwie nogi 145 m (PROWIZORYCZNE, z envelope N=232);
  telemark trudniejszy od równoległego; wczesne T zatrzaskuje na dwie nogi;
- wczesne podejście do lądowania (<1,0 s po progu) wyraźnie skraca skok:
  natychmiastowe T/R z belki 8 → 34,2 m (delta 90,8 m), T po 0,5 s → 62,0 m,
  późne T bez kary;
- upadek nie zmienia kolorów zawodnika (weryfikacja pikselowa);
- sylwetka po progu kontynuuje styczną rozbiegu (morph 0,45 s do pitchu symulacji);
- w każdej pozie obie narty rysowane osobno (pełna dalsza narta, 3 px rozstawu);
- pochylenie ku zeskokowi rozszerza V do stylu „H" (kubełki kąta);
- `JUMPER_ART_VERSION = pkg008-jumper-solid-silhouette-3`,
  `physicsVersion = pkg008-tune-6`, `hillVersion = 3.2.0`.

### Weryfikacja wersji pokazanej użytkownikowi

- `npm run typecheck` — PASS;
- `npm test` — PASS, 29 plików, 214/214;
- `npm run build` — PASS, 33 moduły, JS 160,91 kB;
- `npm run test:e2e` — PASS, 22/22 (znany wyścig `resultCount` nie wystąpił);
- fazy solo — PASS 2/2; pose-evidence solo — PASS 2/2;
- nagrania solo — PASS 2/2, oba skoki landed >100 m, bez długich pasków pauzy;
- test nagraniowy potwierdza zdarzenia po prawdziwych klawiszach i wymaga
  landed — PASS nie maskuje pasywnego upadku.

## Twarde granice

1. Zero nowych skoczni, trybów, sezonu, KO, drużyn i ekranów do PASS bramki V.
2. Nie cofaj zmian rundy 8 bez jawnej uwagi użytkownika.
3. 480×270, font, paleta i kamera 11,6 px/m pozostają, o ile użytkownik nie
   nakaże inaczej.
4. Fizyka, punktacja, zapis i replay zmieniają się tylko wtedy, gdy poprawka
   rzeczywiście tego wymaga; każda zmiana wyniku podnosi właściwą wersję.
5. Prawdopodobieństwo upadku i styl lądowania dla Wisły: UNRESOLVED —
   zakaz wymyślania; progi 142/145 są prowizoryczne aż do danych z upadkami.
6. VISUAL zalicza wyłącznie użytkownik.
7. Najprostsze rozwiązanie dające dobry efekt; żadnej infrastruktury na zapas.

## Wynik pakietu

- [x] Runda 8: pełna lista poprawek wdrożona i zweryfikowana.
- [x] Kalibracja empiryczna zapisana (hill-geometry-fis.md §8).
- [x] Finalne obrazy, wycinki i oba nagrania odświeżone.
- [ ] Werdykt użytkownika na rundę 8.
- [ ] Bramka V zaliczona przez użytkownika.

## Weryfikacja po ewentualnej kolejnej liście

Po wdrożeniu całej listy, nie po każdej mikro-zmianie:

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Następnie uruchom solo `z_capture_pkg008_video.spec.ts` i natychmiast skopiuj
oba `video.webm` z `playwright-output/` do `video-review/`; każdy test
Playwrighta czyści katalog wyjściowy. Odśwież obrazy faz i wycinki z finalnego
kodu. Znane awarie pełnego E2E sprawdzaj osobno, nie deklaruj fałszywego PASS.

## Zamknięcie i następna sesja

1. Po ewentualnej liście wykonaj jedno końcowe auto-review i popraw konkretne
   usterki.
2. Dopisz kolejną sekcję do `docs/evidence/PKG-008/REPORT.md`.
3. Werdykt użytkownika zapisz dosłownie.
4. Jeśli V PASS: oznacz PKG-008/P42 jako COMPLETE i przygotuj
   `docs/handoffs/PKG-009.md` (P21-H01) identyczny z `NEXT_SESSION_PROMPT.md`.
5. Jeśli V nadal niezaliczona: zachowaj ten prompt jako kolejne
   `PKG-008-CONTINUE-10.md` i zaktualizuj kanoniczny `PKG-008.md` oraz
   `NEXT_SESSION_PROMPT.md` do następnej rundy.
6. Uruchom `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
7. Nie rozpoczynaj PKG-009 w tej samej sesji.
