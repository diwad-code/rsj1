# PKG-010 — P21-H02: Zakopane duża (D/G/A/V)

Pakiet docelowy: PKG-010  
Zakres: P21-H02 — Zakopane duża, pełny cykl D/G/A/V.  
Następny po COMPLETE: PKG-011 / P21-H03 — Oberstdorf duża.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git: nie
inicjalizuj Git, nie publikuj gry i nie rozpoczynaj PKG-011 w tej sesji.

## Stan wejściowy

- PKG-001–009 COMPLETE. PKG-009 wdrożył H01 Lillehammer normalną; jego
  [raport](../evidence/PKG-009/REPORT.md), [karta](../hills/H01.md), manifest i
  dowody zachowaj bez nadpisywania. Końcowy przegląd PKG-009 jest PENDING przez
  parent; nie wykonuj ponownego przeglądu tego pakietu ani nie deklaruj go jako
  zamkniętego przez siebie.
- P21 IN PROGRESS: H01 D/G/A/V implementation COMPLETE; H02–H04 pending.
  H01 VISUAL user NOT RUN i zewnętrzny jakościowy playtest NOT RUN.
- Bazowa bramka V oprawy została zaakceptowana przez użytkownika 22.09.2026;
  nie oznacza to akceptacji wizualnej H02.
- Techniczna K120/HS134 pozostaje niezmienionym punktem regresji. H01 ma własny
  profil, art, zapis i replay. Nie kopiuj jego kalibracji na H02.
- `npm run typecheck`, `npm test`, `npm run build` i pełne E2E były zielone po
  PKG-009; uruchom tylko walidację właściwą dla zmienionych ścieżek H02.

## Kolejność obowiązkowa: D najpierw, stop przy braku dowodów

1. Przeczytaj: `AGENTS.md`, `docs/README.md`, ten prompt,
   `docs/PACKAGE_WORKFLOW.md`; następnie `docs/CONTENT_PLAN.md` §1–3,
   `docs/IMPLEMENTATION_PLAN.md` P21 i §6, `docs/DECISIONS_RISKS.md` D18,
   `docs/QA_ACCEPTANCE.md` Q-FIS-23, `docs/research/MODERN_SKI_JUMPING.md` i
   odpowiednie źródła FIS. Dla zachowania wzorca przeczytaj tylko potrzebne
   części `docs/hills/H01.md` i `docs/evidence/PKG-009/REPORT.md`.
2. Dokładny obiekt H02: **Wielka Krokiew, Zakopane, skocznia duża**. W CONTENT_PLAN
   są jedynie punkty startowe **K125/HS140** i F10; to dane PRELIMINARY, nie
   ukończona karta ani wystarczający dowód kalibracji. F10 — oficjalny PDF
   kwalifikacji 2026 — jest tylko tropem:
   `https://medias3.fis-ski.com/pdf/2026/JP/3112/2026JP3112RLQ.pdf`.
3. Wykonaj P21-H02-D z datowanych, oficjalnych PDF FIS z wynikami zawodów na
   dokładnie tej skoczni i konfiguracji. Zweryfikuj wersję/certyfikat profilu;
   nie łącz danych z innym obiektem, konfiguracją ani przestarzałym układem.
   Preferuj kilka ostatnich porównywalnych konkursów. Gdy są dostępne, użyj
   list startowych i danych rund z belką, wiatrem, odległością, statusem i
   upadkami.
4. Zapisz w `docs/hills/H02.md` źródła i pełną kalibrację D18: liczność próby;
   min/medianę/q75/q90/q95/max odległości z rozbiciem według warunków/rund,
   jeśli dane pozwalają; zaobserwowane upadki/nieustane lądowania w pasmach;
   kontekst belki i wiatru; wersję konstrukcji i ograniczenia próby; oraz decyzje
   kalibracyjne. Etykietuj każdą liczbę FACT/ADAPT/UNRESOLVED. Brak etykiet
   stylu lądowania oznacz UNRESOLVED — nie wyprowadzaj telemarku z not.
5. Envelope odległości, bezpieczna AUTO, trudność za HS, granice niemożliwego
   ustania i rozkład błędów AI muszą wynikać z próby H02. Obserwowana częstość
   upadków może ograniczać deterministyczne profile AI/progi, nigdy nie jest
   ukrytą kością rozstrzygającą skok gracza. Nie kopiuj z H01 ani K120.
6. **STOP/BLOCKED:** jeśli nie da się udokumentować wymaganych danych empirycznych
   albo wiarygodnej geometrii, oznacz H02/PKG-010 BLOCKED/UNRESOLVED, zapisz
   niezależne ograniczenia i przygotuj kontynuację PKG-010. Nie rozpoczynaj G/A/V,
   nie dodawaj H02 do zawartości grywalnej i nie przechodź do PKG-011.

## Zakres po zaliczeniu D

- **G:** prosty profil H02 z pełną geometrią T/P/K/L/U/fall line, rozbiegiem,
  zeskokiem, wybiegiem, mapą metrażu, belkami, sensorami, markerami z tych samych
  danych, kompensatami/proweniencją i safety/calibration. Jedna mała lista
  dwóch/trzech obiektów wystarczy; bez frameworka zawartości. H02 musi mieć
  własne `hillId` i `hillVersion`; wyniki technicznej K120 i H01 pozostają bez
  zmian.
- **A:** oryginalny, szczegółowy pixel art H02 na wspólnej jawnej siatce logicznej
  480×270, bitmapowy font, brak antyaliasingu i ułamkowych współrzędnych, własny
  landmark Zakopanego oraz aktualne otoczenie/elementy konstrukcji. Oznaczenia
  sportowe wyłącznie z geometrii. Uzupełnij manifest autorstwa/licencji; nie
  kopiuj zdjęć/FIS PDF/referencji do runtime.
- **V:** wybór H02 w treningu i konkursie, AI watched/fast, oba style lądowania,
  wiatr, AUTO, ranking/kompensaty, zapis i wznowienie oraz replay z jednoznacznym
  H02 `hillId+hillVersion`; obcy hill/version ma być bezpiecznie odrzucony.

## Weryfikacja i dowody

- Testy H02: walidacja źródeł/pól, geometrii, metrażu, belek, sensorów i markerów;
  deterministyczne skoki zbyt wcześnie/punktualnie/spóźnione, oba lądowania,
  wiatr z obu kierunków, skrajne belki, wybieg i progi za HS; AI watched == fast;
  konkurs/ranking, zapis/wznowienie, hill/version mismatch, replay `recordedResult`.
- Regresja technicznej K120 oraz zachowanie H01 bez zmian. Polecenia projektu:
  `npm run typecheck`, `npm test`, `npm run build`; odpowiednie Playwright
  uruchamiaj sekwencyjnie, w tym docelowy test H02 z `--workers=1`. Pełne
  `npm run test:e2e` uruchom tylko w zakresie wymaganym po integracji; nie
  uruchamiaj równolegle procesów Playwright.
- Dowody zapisuj do `docs/evidence/PKG-010/` bez nadpisywania PKG-009: krótki
  `REPORT.md`, źródła i zestawienia kalibracji, manifest, zrzuty 960×540
  (wybór/scena/techniczny/wynik/replay) oraz nagranie H02. **H02 VISUAL user
  NOT RUN** do rzeczywistego werdyktu; zewnętrzny playtest oznacz zgodnie z
  faktycznym stanem.

## Granice i zamknięcie

- Tylko H02. Nie implementuj H03–H20, trybów sezonu/KO/drużyn ani przyszłych
  funkcji. Nie rób zmian H01/K120 „przy okazji”.
- Najprostsza implementacja. Testuj w toku pracy, ale nie uruchamiaj review po
  podzadaniach. Po całym D/G/A/V wykonaj jedno końcowe review PKG-010, popraw
  konkretne błędy i zweryfikuj tylko poprawione ścieżki. Nie wykonuj drugiej
  rundy audytu. Nie twierdź, że przegląd PKG-009 został wykonany.
- Zachowaj istniejące pliki, cudze zmiany i dowody. Raport ma podać faktyczne
  statusy D/G/A/V, źródła/etykiety, ograniczenia, polecenia/wyniki, dowody,
  status jednego review, playtestu i odbioru VISUAL.
- Jeśli PKG-010 zostanie COMPLETE, przygotuj prompt PKG-011/P21-H03 w
  `docs/handoffs/PKG-011.md` i identyczny `docs/NEXT_SESSION_PROMPT.md`, bez
  implementowania H03. Jeśli niekompletny/BLOCKED, promptem aktywnym pozostaje
  kontynuacja PKG-010. Zakończ po spełnieniu kryteriów; nie dodawaj pracy poza
  pakietem.
