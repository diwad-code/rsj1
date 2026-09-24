# Odbiór PKG-008 — bramka V: akceptacja realizmu skoczka przez użytkownika

Pakiet docelowy: PKG-008
Zakres: P42

Czwarta sesja nad PKG-008. Trzy poprzednie prompt-y zarchiwizowano:
`docs/handoffs/PKG-008-CONTINUE-01.md`, `PKG-008-CONTINUE-02.md`,
`PKG-008-CONTINUE-03.md` (pełny kontekst obu odrzuconych rund). **Praca
wykonawcza jest zrobiona** — ta sesja NIE zmienia kodu bez nowego,
jawnego powodu. Jej jedyny cel: uzyskać od użytkownika werdykt bramki V
i odpowiednio zamknąć albo kontynuować pakiet.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git i nie publikuj gry.

## Co zrobiła poprzednia (trzecia) sesja — nie powtarzaj tej pracy

Poprzednia sesja wykonała dokładnie to, co nakazywał prompt z CONTINUE-03:
otworzyła referencje obrazowe PRZED kodem i wprowadziła **cztery pojedyncze,
osobno ocenione zmiany** (tylko `src/render/hillView.ts`, bank klatek
skoczka). Pełny opis per-zmiana z pomiarami: `docs/evidence/PKG-008/REPORT.md`
§9 (przeczytaj przed ewentualną dalszą pracą, żeby nie cofać Aalbo dublować):

- **Z1 — kontakt z terenem:** blit skoczka w górę (5 px zeskok/odjazd, 4 px
  rozbieg, 0 w powietrzu), bo pas śniegu rysuje się wyśrodkowanym obrysem
  ±4,5 px wokół matematycznej powierzchni. Pomiar: styk narta-śnieg 0-1 px.
  Kąta z `surfaceYAtX` (teza rundy 2) NIE odtwarzano — zbędny.
- **Z2 — subtelny V:** 1 px ciemniejszego echa (`#c1903f`) powyżej bliższej
  narty zamiast dwóch kresek i zamiast kąta 0,30 rad z rundy 2.
- **Z3 — czytelność:** nogi w czerwieni tułowia (nie granat), węższy kontur,
  bez białego „śliniaka", jasne ręce z dłonią w kolorze skóry, głowa
  kask+twarz+oko (bez niebieskiego wizjera).
- **Z3b — lot płasko:** tułów tuż nad nartami (`flight` 0,43→0,18 rad,
  biodra 4→2,5 px), jak na `sj3-s16.gif`.

Dowody zregenerowano w całości nowym rendererem: wszystkie ekrany
(960×540, 1920×1080), wszystkie fazy, upadek, wycinki 1:1 ×6, **oba nagrania**
`video-review/`. Do pokazania użytkownikowi: `browser-artifacts/
pkg008-crop-skoczek-lot-upscaled6x.png` (lot + V),
`pkg008-crop-skoczek-upscaled6x.png` (odjazd + kontakt),
`pkg008-phase-*-960x540.png`, nagrania w `video-review/`.

## Twarde zasady (niezmienione)

1. Przebudowa oprawy, nie nowa zawartość — jedna skocznia techniczna.
2. Fizyka, punktacja, zapis, replay bez zmian (`sportMarkers.ts` nietknięty).
3. Rozdzielczość 480×270, font, paleta, paralaksa, scena powtórki —
   zaakceptowane wcześniej, nie dotykać bez nowego powodu.
4. **VISUAL zalicza wyłącznie użytkownik.** Model nie wpisuje PASS w VISUAL.
5. Domyślnie jeden model, bez agentów-recenzentów.

## Stan wejściowy (weryfikacja techniczna po rundzie 3)

- `npm run typecheck` PASS.
- `npm test` PASS — 23 pliki, 168/168.
- `npm run build` PASS — Vite, 32 moduły, JS **137,41 kB / 43,69 kB gzip**.
- `npm run test:e2e` — 27 PASS, 1 skipped, 1 FAIL `shell.spec.ts`
  (aria-label, timing) z PASS w izolacji — udokumentowana flakiness
  zestawu sekwencyjnego (REPORT §5/§9.5), nie regresja. Nie goń za 28/28.
- Następny pakiet po zamknięciu: PKG-009 — P21-H01 (Lillehammer normalna),
  o ile bramka V zostanie zaliczona. Jeśli nie — kolejna kontynuacja PKG-008.

## Wynik pakietu

- [ ] Użytkownik obejrzał wycinki/fazy/nagrania z listy powyżej.
- [ ] Bramka V: jawna akceptacja („wygląda dobrze") albo konkretna nowa
      krytyka (co dokładnie, na którym wycinku) — zapisz dosłownie.
- [ ] Jeśli akceptacja: PKG-008 → COMPLETE, statusy w `PACKAGE_WORKFLOW.md`
      i `IMPLEMENTATION_PLAN.md`, prompt PKG-009 (P21-H01).
- [ ] Jeśli odrzucenie: nowa kontynuacja TEGO pakietu z dosłowną krytyką
      (nie kolejna ślepa próba tych samych czterech zmian).
- [ ] Fizyka, punktacja, zapis, replay bez zmian.

## Weryfikacja

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Wszystkie już PASS na aktualnym kodzie (patrz Stan wejściowy) — powtarzaj
tylko po istotnej zmianie kodu. Jeśli ta sesja nie zmieni kodu, nie
regeneruj dowodów ani nagrań.

## Granice i ryzyka

- Nie wprowadzaj piątej zmiany „na wszelki wypadek" przed odbiorem —
  poprzednie dwie rundy pokazały, że samoocena modelu jest zawodna, a każda
  niezaakceptowana zmiana to koszt kolejnej sesji.
- Materiały SJ3/DSJ2 zostają w `docs/research/`, poza `public/` i buildem.
- Jeśli użytkownik znów odrzuci bez nowych szczegółów, dopytaj o konkret
  (który wycinek, który element), zamiast zgadywać geometrię.

## Procedura wznowienia po przerwaniu

Przeczytaj `docs/evidence/PKG-008/REPORT.md` §8-§9 (co odrzucono, co zrobiono
i jak oceniono). Uruchom `npm run typecheck` i `npm test`. Kontynuuj od
pierwszego niewykonanego punktu listy w „Wynik pakietu".

## Zamknięcie i następna sesja

1. Po werdykcie użytkownika jedno końcowe auto-review (tylko jeśli był kod).
2. Dopisz wynik odbioru (dosłowny werdykt + datę) do
   `docs/evidence/PKG-008/REPORT.md` (nowa podsekcja §9.6, nie nowy plik).
3. Jeśli bramka V zaliczona: status PKG-008 COMPLETE w
   `docs/PACKAGE_WORKFLOW.md`/`docs/IMPLEMENTATION_PLAN.md`, prompt PKG-009 /
   P21-H01 w `docs/handoffs/PKG-009.md` oraz identycznie w
   `docs/NEXT_SESSION_PROMPT.md`.
4. Jeśli bramka V niezaliczona: zarchiwizuj ten plik jako
   `docs/handoffs/PKG-008-CONTINUE-04.md` przed nadpisaniem i przygotuj
   kolejną kontynuację z dosłowną krytyką i stanem odbioru.
5. Po handoffie uruchom raz
   `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
6. W odpowiedzi końcowej: werdykt użytkownika (dosłownie), status bramki V
   i link do aktywnego promptu.
