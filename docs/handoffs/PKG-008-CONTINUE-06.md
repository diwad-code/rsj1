# PKG-008 (świeże oczy) — P42, sylwetka skoczka do bramki V

> **ARCHIWUM.** To jest prompt rundy 5, wykonany 17.09.2026. Werdykt
> użytkownika i przebieg rundy: `docs/evidence/PKG-008/REPORT.md` §10.
> Aktywny prompt to `docs/handoffs/PKG-008.md`
> (= `docs/NEXT_SESSION_PROMPT.md`).

Pakiet docelowy: PKG-008
Zakres: P42

Zaczynasz z czystą kartą nad oprawą skoczka. Ktoś przed Tobą próbował kilka
razy i użytkownik ocenił to jako „postęp, ale bardzo mały" — **celowo NIE
dostajesz opisu tych prób: nie czytaj `docs/handoffs/PKG-008-CONTINUE-*.md`
ani `docs/evidence/PKG-008/REPORT.md` §8-§9.** Oceń aktualny wygląd sam,
zbuduj własną diagnozę na podstawie materiałów poniżej i doprowadź sylwetkę
do akceptacji. Cały starszy kontekst techniczny pakietu (co działa, jakim
kosztem) jest w REPORT.md §0-§7 — sięgnij tam tylko, jeśli czegoś technicznie
brakuje.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git i nie publikuj gry.

## CO ma być zrobione (nie jak)

Skoczek ma wyglądać jak zawodnik, którego prowadzi gracz — w każdej fazie
skoku. Aktualnie bramki nie przechodzi. Trzy konkretne usterki do usunięcia:

1. **Na rozbiegu skoczek kuca, nie stoi.** Głęboki kuc narciarski: tułów
   nisko nad nartami, głowa nisko z przodu. Dziś sylwetka jest wyprostowana.
2. **Ręce ułożone wzdłuż tułowia, nie wyciągnięte przed siebie** — tak
   trzyma je prawdziwy skoczek w rozbiegu i w locie. (W samym momencie
   lądowania ręce pracują dla równowagi — to jedyny wyjątek, sprawdź na
   zdjęciach.)
3. **Skoczek i narty to dwie osobne rzeczy, nie jedna kreska.** Z boku mają
   czytać się oddzielnie: linia nart, nad nią tułów, z przodu głowa.

Poza tym: subtelny styl V nart w locie (widok jest z boku, więc V jest
ledwo widoczne — sprawdź na materiałach, jak bardzo), narty leżące na
śniegu zamiast wbijające się w niego.

## Materiały — obejrzyj je narzędziem do obrazów, zanim ruszysz kod

1. `docs/research/reference-images/real-*.jpg` — 4 zdjęcia prawdziwych
   skoczków (lot V, telemark z boku, kuc; z licencjami w README). To Twoje
   główne źródło prawdy o pozycjach ciała.
2. `docs/research/reference-images/sj3-s16.gif`, `sj3-s0A.gif` — gra
   Ski Jump International 3: kamera, widok z boku i czytelna sylwetka
   w tym widoku to nasz wzorzec; animacja ma być lepsza niż tam.
3. `docs/research/reference-images/dsj2-screenshot*.jpg` — Deluxe Ski Jump 2:
   tylko paleta, kontrast, cień na śniegu i minimalizm; widok jest zza
   zawodnika, więc sprite'a nie kopiujemy.
4. Aktualny stan gry: `docs/evidence/PKG-008/browser-artifacts/
   pkg008-crop-skoczek-lot-upscaled6x.png`,
   `pkg008-crop-skoczek-upscaled6x.png`, `pkg008-phase-*-960x540.png`.

Siatka skoczka powstaje w `src/render/hillView.ts` (bank klatek skoczka).
Wolno Ci użyć generatora AI (`gen-ai image --help`), jeśli ręczne rysowanie
zawiedzie — zasady (siatka pikseli, manifest pochodzenia) są w
`.agents/skills/dos-pixel-art/SKILL.md`.

## Twarde granice

1. Tylko wygląd skoczka (i jego kontakt ze śniegiem). Jedna skocznia
   techniczna, zero nowej zawartości, zero nowych trybów.
2. Fizyka, punktacja, zapis i replay — NIETKNIĘTE (`src/simulation/`,
   `src/sport/`, `src/storage/`, `src/replay/`, `sportMarkers.ts`).
   Zmieniasz wyłącznie renderer.
3. Rozdzielczość 480×270, bitmapowy font, paleta, paralaksa — zaakceptowane,
   nie ruszaj.
4. **Odbioru VISUAL nie wpisujesz sam.** Akceptuje wyłącznie użytkownik.

## Stan wejściowy

- `npm run typecheck` PASS; `npm test` PASS (23 pliki, 168/168);
  `npm run build` PASS (Vite, 32 moduły, JS ~137,5 kB);
  `npm run test:e2e` 28 PASS + 1 skipped, 0 FAIL.
- Dowody z aktualnego kodu: `docs/evidence/PKG-008/browser-artifacts/`
  (ekrany 960×540 i 1920×1080, fazy, wycinki 1:1 ×6) i `video-review/`
  (oba nagrania). UWAGA: każdy `playwright test` kasuje
  `playwright-output` — nagrania kopiuj do `video-review/` ZANIM uruchomisz
  cokolwiek innego; kolejność: pełny e2e → solo spec wideo → kopia → stop.

## Wynik pakietu

- [ ] Kuc na rozbiegu — widać na fazach gategreen/inrun.
- [ ] Ręce wzdłuż tułowia w rozbiegu/locie/odjeździe — widać na wycinkach.
- [ ] Sylwetka i narty czytają się osobno w locie — porównane obok referencji.
- [ ] V subtelne i zgodne z boczną perspektywą; narty na śniegu, nie w nim.
- [ ] Fizyka, punktacja, zapis, replay bez zmian.
- [ ] Dowody odświeżone z finalnego kodu (fazy, wycinki, oba nagrania).

## Weryfikacja

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Pełną regenerację dowodów i pełny `test:e2e` rób tylko dla wersji, którą
pokazujesz użytkownikowi — nie po każdej mikro-zmianie.

## Zamknięcie i następna sesja

1. Po całości jedno końcowe auto-review; popraw konkretne usterki.
2. Dopisz sekcję do `docs/evidence/PKG-008/REPORT.md` (nie nowy plik):
   co zmieniłeś, z czym porównałeś, jaki był efekt.
3. Werdykt użytkownika dopisz dosłownie do raportu (nowa podsekcja).
4. Jeśli bramka V zaliczona: PKG-008 COMPLETE w `docs/PACKAGE_WORKFLOW.md` /
   `docs/IMPLEMENTATION_PLAN.md`, prompt PKG-009 / P21-H01 w
   `docs/handoffs/PKG-009.md` oraz identycznie w `docs/NEXT_SESSION_PROMPT.md`.
5. Jeśli niezaliczona: archiwizuj ten plik jako
   `docs/handoffs/PKG-008-CONTINUE-06.md` i przygotuj kontynuację
   z dosłowną krytyką.
6. Po handoffie: `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
7. W odpowiedzi: co zmieniło się wizualnie, status bramki V, link do promptu.
