# PKG-008 — P42, runda 10: oczekiwanie na werdykt po liście poprawek rundy 9

Pakiet docelowy: PKG-008
Zakres: P42

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
incjalizuj Git i nie publikuj gry.

## Cel tej sesji

To jest prompt kontynuacji po rundzie 9. Poprzednia sesja wdrożyła trzypunktową
listę poprawek użytkownika: wąskie czytelne V (koniec z szerokim „H"), widoczna
druga NOGA przy rozstawieniu nart oraz lądowanie z podpórką (dotknięcie zeskoku
1/obiema dłońmi) z oceną wg realnych kar FIS. Bramka V pozostaje NIEZALICZONA
do czasu werdyktu użytkownika.

1. Przeczytaj materiały ze „Stanu wejściowego".
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
2. `docs/evidence/PKG-008/REPORT.md` §14 — pełny zapis rundy 9 i wyniki.
3. `docs/evidence/PKG-008/hill-geometry-fis.md` §8 — kalibracja empiryczna
   Wisły K120/HS134 (3 datowane PDF FIS, N=232, progi prowizoryczne).
4. W razie zmian wizualnych: `docs/ART_UI_AUDIO.md` oraz skill
   `.agents/skills/dos-pixel-art/`.
5. W razie zmian fizyki: `docs/GAMEPLAY_SPEC.md` i skill
   `.agents/skills/ski-jump-aero/`.

Aktualne dowody:

- fazy, wycinki i arkusze póz (37 klatek, w tym podpórki):
  `docs/evidence/PKG-008/browser-artifacts/pkg008-phase-*`
  (nowość: `pkg008-phase-support-one-hand-960x540.png`,
  `pkg008-phase-support-two-hands-960x540.png`),
  `pkg008-pose-sheet-all-37.png`, `pkg008-transition-support{one,two}-3.png`;
- pełny skok człowieka (landed 110,0 m):
  `docs/evidence/PKG-008/video-review/pkg008-pelny-skok-czlowieka.webm`
  (kopia także w `browser-artifacts/`);
- konkurs z botami (landed 111,7 m):
  `docs/evidence/PKG-008/video-review/pkg008-fragment-konkursu-boty.webm`
  (kopia także w `browser-artifacts/`);
- referencje: `docs/research/reference-images/` — SJ3, DSJ2, cztery zdjęcia
  prawdziwych skoczków i strony FIS.

## Co jest gotowe po rundzie 9

### Poprawki z listy użytkownika

- V zamiast „H": ogony nart złączone (2 px rozstawu), rozwarcie tylko na
  czubkach, stopniowane z pochyleniem (`JUMPER_ART_VERSION` =
  `pkg008-jumper-solid-silhouette-4`);
- druga noga widoczna w V (flight/takeoff): biodro→kolano→but osadzony na
  dalszej narcie, koniec z „dwie narty, jedna noga";
- lądowanie z podpórką jako czwarty wynik próby (poza telemarkiem, dwiema
  nogami i upadkiem): `supportHands` 0/1/2 + zdarzenie `handSupport`, trzy
  klatki pozy `supportOne`/`supportTwo`, komunikat PODPÓRKA w HUD/wyniku;
  - zbyt wczesne podejście: T/R przed 0,35 s lotu → obie dłonie (natychmiastowe
    T z belki 8 → 34,2 m), 0,35–1,0 s → jedna dłoń (T po 0,5 s → 62,0 m);
  - spóźnione przygotowanie: stabilność < 0,44 → jedna dłoń, < 0,34 → obie,
    < 0,22 → upadek (dawne „ledwo upadki" 0,22–0,34 to teraz podpórka);
  - za HS: 139,3 m przy pełnej gotowości → jedna dłoń (próg telemark 142 m
    PROWIZORYCZNY);
  - kary wg FIS Style Judging Guidelines: jedna dłoń 3,0 pkt, obie dłonie
    4,5 pkt (środek zakresu 4,0–5,0), literalne u każdego sędziego, kategoria
    `outrun` rozłącznie z innymi błędami;
- `physicsVersion = pkg008-tune-7`, `rulesVersion = pkg008-rules-2`,
  `JUMPER_ART_VERSION = pkg008-jumper-solid-silhouette-4`, `hillVersion = 3.2.0`.

### Weryfikacja wersji pokazanej użytkownikowi

- `npm run typecheck` — PASS;
- `npm test` — PASS, 29 plików, 218/218;
- `npm run build` — PASS, 33 moduły, JS 163,89 kB;
- `npm run test:e2e` — 21/22; jedyny FAIL to wyścig timingu T w
  `one-event-one-sound` (runda 8 wydłużyła karane okno wczesne 0,4→1,0 s,
  T przy +90 tickach + IPC 17–29 trafiało w okno); naprawione w skryptach
  testowych na +130, oba dotknięte testy PASS solo, produkt bez zmian;
- fazy solo — PASS 7/7 (nowy test podpórki w rzeczywistym skoku);
- pose-evidence solo — PASS 2/2, arkusze 37 klatek;
- exact `one-event-one-sound` po stabilizacji znanej pauzy przeciążenia —
  PASS 1/1; oba docelowe testy używają +130 zamiast wyścigowego +90;
- nagrania solo — PASS 2/2, oba skoki landed (110,0 m / 111,7 m), świeże
  WebM podmienione w `video-review/` i `browser-artifacts/`.

## Twarde granice

1. Zero nowych skoczni, trybów, sezonu, KO, drużyn i ekranów do PASS bramki V.
2. Nie cofaj zmian rund 8–9 bez jawnej uwagi użytkownika.
3. 480×270, font, paleta i kamera 11,6 px/m pozostają, o ile użytkownik nie
   nakaże inaczej.
4. Fizyka, punktacja, zapis i replay zmieniają się tylko wtedy, gdy poprawka
   rzeczywiście tego wymaga; każda zmiana wyniku podnosi właściwą wersję.
5. Prawdopodobieństwo upadku i styl lądowania dla Wisły: UNRESOLVED —
   zakaz wymyślania; progi 142/145 i progi podpórek 0,22/0,34/0,44 są
   ADAPT/TUNE do rewizji przy danych o upadkach/stylu.
6. VISUAL zalicza wyłącznie użytkownik.
7. Najprostsze rozwiązanie dające dobry efekt; żadnej infrastruktury na zapas.

## Wynik pakietu

- [x] Runda 9: pełna lista poprawek (V, druga noga, podpórka) wdrożona.
- [x] Kalibracja empiryczna zachowana (hill-geometry-fis.md §8).
- [x] Finalne obrazy, arkusze, podpórki i oba nagrania odświeżone.
- [ ] Werdykt użytkownika na rundę 9.
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
oba `video.webm` z `playwright-output/` do `video-review/` POD WŁAŚCIWYMI
NAZWAMI (`pkg008-pelny-skok-czlowieka.webm`, `pkg008-fragment-konkursu-boty.webm`;
katalogi testów zawierają generyczne `video.webm`). Odśwież obrazy faz i
arkusze póz z finalnego kodu. Znane awarie pełnego E2E sprawdzaj osobno,
nie deklaruj fałszywego PASS.

## Zamknięcie i następna sesja

1. Po ewentualnej liście wykonaj jedno końcowe auto-review i popraw konkretne
   usterki.
2. Dopisz kolejną sekcję do `docs/evidence/PKG-008/REPORT.md`.
3. Werdykt użytkownika zapisz dosłownie.
4. Jeśli V PASS: oznacz PKG-008/P42 jako COMPLETE i przygotuj
   `docs/handoffs/PKG-009.md` (P21-H01) identyczny z `NEXT_SESSION_PROMPT.md`.
5. Jeśli V nadal niezaliczona: zachowaj ten prompt jako kolejne
   `PKG-008-CONTINUE-11.md` i zaktualizuj kanoniczny `PKG-008.md` oraz
   `NEXT_SESSION_PROMPT.md` do następnej rundy.
6. Uruchom `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
7. Nie rozpoczynaj PKG-009 w tej samej sesji.
