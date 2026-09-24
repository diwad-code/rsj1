# PKG-014 — P23, P24, P25: sezon, własny kalendarz i silnik KO (po bramce B / MVP)

Katalog: `C:\retro-ski-jumping` — gra przeglądarkowa TypeScript + Vite +
Canvas2D, sterowana klawiaturą, styl DOS pixel-art (**nie Godot**).
Pakiet: **PKG-014**. Zakres: **P23, P24, P25** z `docs/IMPLEMENTATION_PLAN.md` —
puchar sezonowy, własny kalendarz i silnik turnieju KO. Nie zaczynaj P26+,
H05–H20 ani nowych skoczni.

## Lektura (tylko potrzebna)

1. `AGENTS.md` (zakaz Git, prostota, jedno review po pakiecie, zamrożenie
   zawartości, obowiązkowe przekazanie), `docs/README.md`, ten prompt,
   `docs/PACKAGE_WORKFLOW.md` §§3–5.
2. `docs/IMPLEMENTATION_PLAN.md` — „P23”, „P24”, „P25” i „Bramka C”.
3. `docs/GAMEPLAY_SPEC.md` §6 (formaty zawodów, puchar, KO), §9 (rekordy/wersje
   jeśli dotyczy), `docs/TECHNICAL_DESIGN.md` §6 (zapis, migracje, eksport),
   `docs/ART_UI_AUDIO.md` §7 (ekrany: sezon, edycja kalendarza, drabinka KO),
   odpowiednie wpisy `docs/QA_ACCEPTANCE.md`.
4. Router `.agents/skills/retro-ski-support/SKILL.md`; z niego tylko
   potrzebne skille. Nie skanuj całej biblioteki; starych raportów nie czytaj.

**Trwały zakaz wszystkich poleceń Git** (bez repozytorium, stage, commit,
reset itd.). Zapisuj bezpośrednio na dysku. Backup
`retro-ski-jumping-23-09-2026-backup` zostaw nietknięty.

## Stan wejściowy (24.09.2026)

- PKG-001–013 COMPLETE; **P21–P22 COMPLETE**. Grywalne: techniczna K120/HS134,
  H01 Lillehammer K90/HS98, H02 Zakopane K125/HS140, H03 Oberstdorf K120/HS137,
  H04 Planica K200/HS240 (`h04-inspired-4`, fizyka `pkg008-tune-9+h04-polar-1`).
  Trening, konkurs standardowy (75 miejsc, boty, hotseat do 10 profili),
  punktacja Modern 2026.1, zapis IndexedDB **DB v2** (magazyny sessions,
  results, records, replays, leases, **settings**), replay z próbek działają.
- Ustawienia P22: ekran USTAWIENIA (4. wiersz menu), remap 5 akcji + menu,
  głośność, skala Dopasuj/Równe px, duży tekst, mniej ruchu; bindy globalne.
  Menu: trening / konkurs / powtórka / ustawienia.
- Ostatnia bramka: `npm run typecheck` PASS, `npm test` 38 plików/330 PASS,
  `npm run build` PASS, Playwright settings+shell+h04 12/12 PASS
  (konkurs H04 AUTO6: landed 192,5 m). Dowody: `docs/evidence/PKG-013/REPORT.md`.
  Zewnętrzny PLAYABILITY NOT RUN. **VISUAL nowych ekranów (sezon, kalendarz,
  KO) wydaje wyłącznie użytkownik.**

## Wynik pakietu (P23 + P24 + P25)

1. P23: puchar sezonowy na testowym kalendarzu 4 obiektów — wyniki konkursów
   dają **punkty pucharowe, nie sumę metrów**; poprawne remisy; wznowienie
   pomiędzy konkursami i zakończenie sezonu.
2. P24: edycja własnego kalendarza (1–40 konkursów, zmiana kolejności,
   zapis/wczytanie, brak odwołań do nieistniejących skoczni); klucz zestawu
   rozróżnia kolejność, wersje i ustawienia.
3. P25: silnik KO — dokładne pary **25 + 5** i wyjątki remisu/nieobecności ze
   specyfikacji; cztery konkursy sumują punkty skoków. Testowo na dostępnych
   4 obiektach pod nazwą zestawu testowego; **nie podpisuj zastępczej skoczni
   jako Innsbruck** i nie twórz zależności P25→P32 (ostrzeżenie z planu).
4. Ekrany w stylu DOS (bitmapowy font, siatka pikseli): sezon, edycja
   kalendarza, drabinka KO — każdy z jawnym fokusem i Enter/Wstecz.
5. Zapis sezonów/kalendarzy z migracją wersji bazy (nie niszcząc `settings`
   ani wyników P19–P22); fizyka/punktacja/wersje skoczni bez zmian.

## Kolejność

Najpierw model sezonu + punkty pucharowe i test (P23), potem kalendarz
i klucz zestawu (P24), potem silnik KO i drabinka (P25), na końcu ekrany.
Po całym zakresie: jedno końcowe review.

## Kryteria odbioru

- Kontrolny sezon ze zdefiniowaną tabelą wyników i restartem w połowie;
  punkty pucharowe zgodne z formatem, remisy poprawne.
- Klawiaturowa edycja kalendarza i powtórzenie tego samego zestawu; zmiana
  kolejności daje inny klucz; brak widmowych skoczni.
- Fixtures całej drabinki KO (pary, remisy, nieobecności); żadnego udawanego
  losowania par.
- `npm run typecheck`, `npm test`, `npm run build`; nowy spec Playwright
  sezonu/kalendarza/KO samymi klawiszami oraz regresja
  `tests/browser/shell.spec.ts` z unikalnym `--output=docs/evidence/PKG-014/tmp-…`
  (najpierw `Test-Path`, nic nie nadpisuj).
- Zrzuty ekranów sezonu/kalendarza/KO do odbioru; **VISUAL wydaje wyłącznie
  użytkownik**.

## Prostota, review, przekazanie

Najprostsze rozwiązanie dające dobry efekt: bez frameworka UI, event busa czy
warstw adapterów. Testy w trakcie to nie review; **jedno końcowe review** po
całym P23–P25, potem celowane poprawki i sprawdzenie zmienionych ścieżek.
Wznowienie po przerwaniu: sprawdź stan dysku i raport, kontynuuj brakujące
kroki. Zapisz krótki `docs/evidence/PKG-014/REPORT.md` (statusy, polecenia
i wyniki, dowody, „Końcowe review”, ograniczenia). Po zamknięciu napisz prompt
**PKG-015 (P26, P27, P28 — drużyny, Super Team, King of the Hill)** w
`docs/handoffs/PKG-015.md` i bajtowo identycznie w
`docs/NEXT_SESSION_PROMPT.md`; zaktualizuj statusy w `docs/README.md`,
`docs/PACKAGE_WORKFLOW.md`, `docs/IMPLEMENTATION_PLAN.md`. Przy braku odbioru
użytkownika lub niespełnionych kryteriach: PKG-014 INCOMPLETE i kontynuacja
tego samego pakietu (poprzedni prompt archiwizuj jako `PKG-014-CONTINUE-01.md`).
Nie publikuj projektu i nie wysyłaj wiadomości do osób trzecich bez polecenia.
