# PKG-008 — P42, runda 8: oczekiwanie na kolejną listę poprawek

Pakiet docelowy: PKG-008
Zakres: P42

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git i nie publikuj gry.

## Cel tej sesji

To jest prompt kontynuacji po rundzie 7. Użytkownik obejrzał finalne dowody i
wydał werdykt: **„Postęp, dalsze poprawki”**. Zmiany rundy 7 zostają, ale bramka
V jest nadal NIEZALICZONA. Użytkownik poda kolejną listę poprawek w rozmowie.

1. Przeczytaj materiały ze „Stanu wejściowego”.
2. Obejrzyj aktualne obrazy i oba nagrania narzędziem do obrazów/wideo.
3. Napisz krótkie podsumowanie aktualnego stanu i zatrzymaj się.
4. Nie zmieniaj kodu ani dokumentacji, dopóki użytkownik nie poda listy.

Po otrzymaniu listy wykonaj poprawki w podanej kolejności. Możesz samodzielnie
wykonać konieczne korekty zależne, ale nie dodawaj nowej zawartości ani funkcji.

## Stan wejściowy

Przeczytaj:

1. `AGENTS.md` — prostota, jedno końcowe review, zamrożenie zawartości.
2. `docs/evidence/PKG-008/REPORT.md` §12 — pełny zapis rundy 7 i wyniki.
3. `docs/evidence/PKG-008/hill-geometry-fis.md` §7 — wdrożony profil FIS,
   strojenie aero i pomiary.
4. W razie zmian wizualnych: `docs/ART_UI_AUDIO.md` oraz skill
   `.agents/skills/dos-pixel-art/`.
5. W razie zmian fizyki: `docs/GAMEPLAY_SPEC.md` i skill
   `.agents/skills/ski-jump-aero/`.

Aktualne dowody:

- fazy i wycinki: `docs/evidence/PKG-008/browser-artifacts/pkg008-phase-*`
  oraz `pkg008-crop-skoczek-*-upscaled6x.png`;
- pełny skok człowieka:
  `docs/evidence/PKG-008/video-review/pkg008-pelny-skok-czlowieka.webm`;
- konkurs z botami:
  `docs/evidence/PKG-008/video-review/pkg008-fragment-konkursu-boty.webm`;
- referencje: `docs/research/reference-images/` — SJ3, DSJ2, cztery zdjęcia
  prawdziwych skoczków i strony FIS.

## Co jest gotowe po rundzie 7

### Oprawa

- logiczne 480×270, nearest-neighbour, bitmapowy font i zaakceptowana paleta;
- kamera 11,6 px/m: narta 29 px = 2,50 m, zawodnik 21 px = 1,81 m;
- `JUMPER_ART_VERSION = pkg008-jumper-solid-silhouette-2`;
- kuc, sześcioklatkowe wybicie, ośmioklatkowe przejście do lotu, zwarta
  pozycja V z boku, wcześniejsze przygotowanie lądowania i czytelny telemark;
- minimalny HUD podczas ruchu: prędkość, wiatr, belka i cel/dystans;
- uspokojone góry, śnieg, trybuny i tablica — skoczek jest głównym punktem;
- pełne podpowiedzi pozostają na belce, pauzie i ekranie wyniku.

### Skocznia i fizyka

- rozbieg FIS/Wisła: γ 35°, r1 100 m, próg 6,71 m przy 11°, s 3,03 m;
- zeskok FIS: β0/P/K/L/U = 6,17°/37°/33,5°/30,2°/0°,
  h/n = 0,564, `hillVersion = 3.0.0`;
- `physicsVersion = pkg008-tune-3`, L/D około 1,42 przy 32° i kara za
  przeciągnięcie powyżej 35°;
- belki 1/8/12: 115,54/125,01/129,87 m oraz 89,18/91,67/93,05 km/h;
- kompensacja gry: 12,9 pkt/(m/s) pod narty, 8,9 w plecy, 3,5 pkt/m belki;
- punktacja, zapis i replay zachowują istniejące kontrakty wersjonowania.

### Weryfikacja wersji pokazanej użytkownikowi

- `npm run typecheck` — PASS;
- `npm test` — PASS, 178/178;
- `npm run build` — PASS, 32 moduły, JS 146,31 kB;
- finalny `npm run test:e2e` — 28 PASS, 1 skipped, 1 FAIL;
- jedyny FAIL: znany wyścig `resultCount` podczas replaya, PASS 1/1 osobno;
- `z_capture_pkg008_video.spec.ts` — PASS 2/2, oba WebM skopiowane.

Testy przeglądarkowe czekają na tick przez `waitForFunction` wewnątrz strony
i ponawiają wyłącznie zagubione klawisze do jawnego stanu. Nie obniżono
wymagań długości, wyniku, terminalnych faz ani sterowania klawiaturą.

## Twarde granice

1. Zero nowych skoczni, trybów, sezonu, KO, drużyn i ekranów do PASS bramki V.
2. Nie cofaj zmian rundy 7 bez jawnej uwagi użytkownika.
3. 480×270, font, paleta i kamera 11,6 px/m pozostają, o ile użytkownik nie
   nakaże inaczej.
4. Fizyka, punktacja, zapis i replay zmieniają się tylko wtedy, gdy poprawka
   rzeczywiście tego wymaga; każda zmiana wyniku podnosi właściwą wersję.
5. VISUAL zalicza wyłącznie użytkownik.
6. Najprostsze rozwiązanie dające dobry efekt; żadnej infrastruktury na zapas.

## Wynik pakietu

- [x] Runda 7 wdrożona, sprawdzona i przyjęta jako postęp.
- [x] Finalne obrazy oraz oba nagrania odświeżone.
- [x] Werdykt użytkownika zapisany dosłownie.
- [ ] Kolejna lista poprawek otrzymana i wykonana.
- [ ] Bramka V zaliczona przez użytkownika.

## Weryfikacja po kolejnej liście

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

1. Po całej liście wykonaj jedno końcowe auto-review i popraw konkretne usterki.
2. Dopisz kolejną sekcję do `docs/evidence/PKG-008/REPORT.md`.
3. Werdykt użytkownika zapisz dosłownie.
4. Jeśli V PASS: oznacz PKG-008/P42 jako COMPLETE i przygotuj
   `docs/handoffs/PKG-009.md` (P21-H01) identyczny z `NEXT_SESSION_PROMPT.md`.
5. Jeśli V nadal niezaliczona: zachowaj ten prompt jako kolejne
   `PKG-008-CONTINUE-09.md` i zaktualizuj kanoniczny `PKG-008.md` oraz
   `NEXT_SESSION_PROMPT.md` do następnej rundy.
6. Uruchom `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
7. Nie rozpoczynaj PKG-009 w tej samej sesji.
