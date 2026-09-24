# Odbiór PKG-008 (runda 4) — bramka V: akceptacja przez użytkownika

Pakiet docelowy: PKG-008
Zakres: P42

Piąta sesja nad PKG-008. Historia: `PKG-008-CONTINUE-01.md`,
`PKG-008-CONTINUE-02.md`, `PKG-008-CONTINUE-03.md` (rundy 1-3),
`PKG-008-CONTINUE-04.md` (poprzedni prompt odbiorczy — werdykt na niego
spowodował rundę 4 poniżej). **Praca wykonawcza rundy 4 jest zrobiona** —
ta sesja NIE zmienia kodu bez nowego, jawnego powodu. Cel: werdykt bramki V.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git i nie publikuj gry.

## Dosłowny werdykt użytkownika na rundę 3 (wykonany w rundzie 4)

> nie. skoczek cały czas jest wyprostowany a na rozbiegu powinien kucać.
> ręce nie przed siebie, a ułożone z tułowiem. Przeanalizuj obrazy
> w internecie jak to wygląda skoczek w każdej fazie i na tej podstawie
> działaj. skoczek i narty reraz wyglądają jak jedna kreska. sprawdź jak
> wygląda orawdziwy skoczek i jak robią to inne gry! research nie boli !!!!

## Co zrobiła runda 4 (nie powtarzaj)

Najpierw research (teksty: Red Bull, Wikipedia V-style/telemark, NBC;
4 zdjęcia CC w `docs/research/reference-images/real-*.jpg` z przypisami
w README), potem trzy pojedyncze zmiany tylko w `src/render/hillView.ts`
(pełny opis z pomiarami: REPORT.md PKG-008 §9.7):

- **R1 — kuc:** rozbieg 0,73→0,28 rad, belka 1,42→1,05, biodra 4→3 px.
- **R2 — ręce wzdłuż tułowia** (dłonie przy biodrach); wyjątki z researchu:
  zamach w wybiciu (klatki 2-3) i ręce w górę w telemarku (równowaga, FIS).
- **R3/R3b — koniec jednej kreski:** prześwit w locie 3,5 px, głowa +1,5 px,
  krótkie cofnięte ręce w locie.

Do pokazania użytkownikowi (wszystko z bieżącego kodu): `browser-artifacts/
pkg008-crop-skoczek-lot-upscaled6x.png`, `pkg008-crop-skoczek-upscaled6x.png`,
`pkg008-phase-*-960x540.png` (kuc: gategreen/inrun; ręce: flight/takeoff/
landingprep/outrun), oba nagrania w `video-review/`.

## Twarde zasady (niezmienione)

1. Przebudowa oprawy, nie nowa zawartość — jedna skocznia techniczna.
2. Fizyka, punktacja, zapis, replay bez zmian (`sportMarkers.ts` nietknięty).
3. Rozdzielczość, font, paleta, paralaksa, scena powtórki — zaakceptowane,
   nie dotykać bez nowego powodu.
4. **VISUAL zalicza wyłącznie użytkownik.** Model nie wpisuje PASS w VISUAL.
5. Domyślnie jeden model, bez agentów-recenzentów.

## Stan wejściowy (weryfikacja techniczna po rundzie 4)

- `npm run typecheck` PASS.
- `npm test` PASS — 23 pliki, 168/168.
- `npm run build` PASS — Vite, 32 moduły, JS **137,52 kB / 43,73 kB gzip**.
- `npm run test:e2e` — **28 PASS, 1 skipped, 0 FAIL** (poprzednia flakiness
  `shell.spec.ts` tym razem nie wystąpiła). Nie goń za niczym więcej.
- Nagrania skopiowane ze świeżych `video.webm`, zweryfikowane klatką.
  UWAGA proceduralna (REPORT §9.6): każdy `playwright test` kasuje
  `playwright-output` — nagrania kopiować ZANIM uruchomi się cokolwiek
  innego; kolejność: pełny e2e → solo spec wideo → kopia → stop.
- Następny pakiet po zamknięciu: PKG-009 — P21-H01 (Lillehammer normalna),
  o ile bramka V zostanie zaliczona. Jeśli nie — kolejna kontynuacja PKG-008.

## Wynik pakietu

- [ ] Użytkownik obejrzał wycinki/fazy/nagrania z listy powyżej.
- [ ] Bramka V: jawna akceptacja albo konkretna nowa krytyka (co dokładnie,
      na którym wycinku) — zapisz dosłownie.
- [ ] Jeśli akceptacja: PKG-008 → COMPLETE, statusy w `PACKAGE_WORKFLOW.md`
      i `IMPLEMENTATION_PLAN.md`, prompt PKG-009 (P21-H01).
- [ ] Jeśli odrzucenie: nowa kontynuacja TEGO pakietu z dosłowną krytyką.
- [ ] Fizyka, punktacja, zapis, replay bez zmian.

## Weryfikacja

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Wszystkie już PASS na aktualnym kodzie — powtarzaj tylko po istotnej
zmianie kodu. Jeśli ta sesja nie zmieni kodu, nie regeneruj dowodów.

## Granice i ryzyka

- Żadnych zmian „na wszelki wypadek" przed odbiorem.
- Materiały SJ3/DSJ2/zdjęcia CC zostają w `docs/research/`, poza `public/`
  i buildem (zdjęcia mają przypisy licencyjne w README).
- Jeśli odrzucenie bez nowych szczegółów — dopytaj o konkret, nie zgaduj.

## Procedura wznowienia po przerwaniu

Przeczytaj REPORT.md PKG-008 §8-§9 (odrzucone rundy, zrobione zmiany,
pułapka `playwright-output`). Uruchom `npm run typecheck` i `npm test`.
Kontynuuj od pierwszego niewykonanego punktu „Wynik pakietu".

## Zamknięcie i następna sesja

1. Po werdykcie jedno końcowe auto-review (tylko jeśli był kod).
2. Dopisz werdykt (dosłownie + datę) do REPORT.md PKG-008 (podsekcja §9.8).
3. Jeśli V zaliczona: PKG-008 COMPLETE w `PACKAGE_WORKFLOW.md` /
   `IMPLEMENTATION_PLAN.md`, prompt PKG-009 / P21-H01 w
   `docs/handoffs/PKG-009.md` oraz identycznie w `docs/NEXT_SESSION_PROMPT.md`.
4. Jeśli V niezaliczona: zarchiwizuj ten plik jako
   `docs/handoffs/PKG-008-CONTINUE-05.md` i przygotuj kontynuację
   z dosłowną krytyką.
5. Po handoffie: `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
6. W odpowiedzi: werdykt (dosłownie), status bramki V, link do promptu.
