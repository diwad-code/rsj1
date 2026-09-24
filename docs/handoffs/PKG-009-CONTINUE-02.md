# PKG-009 — P21-H01: Lillehammer normalna (D/G/A/V)

Pakiet docelowy: PKG-009  
Zakres: P21-H01 (Lillehammer normalna) — pełny cykl D/G/A/V z IMPLEMENTATION_PLAN §6.  
Następny po COMPLETE: PKG-010 / P21-H02 (Zakopane duża); **nie rozpoczynaj go w tej sesji**.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git: nie
inicjalizuj Git i nie publikuj gry.

Najpierw przeczytaj `AGENTS.md`, `docs/README.md`, ten aktywny prompt i
`docs/PACKAGE_WORKFLOW.md`; potem `docs/hills/H01.md`,
`docs/evidence/PKG-009/REPORT.md`, potrzebne fragmenty IMPLEMENTATION_PLAN §6,
DECISIONS_RISKS D18 oraz oficjalne źródła FIS wskazane w karcie. Stan dysku
i dowody mają pierwszeństwo przed wcześniejszymi promptami. Wznów od
pierwszego nierozstrzygniętego pola D, zachowując cudze pliki i dowody.

## Stan wejściowy i review

- PKG-001–008 COMPLETE; bazowa bramka V oprawy PASS po akceptacji użytkownika
  22.09.2026. To nie jest akceptacja H01.
- PKG-009 jest **BLOCKED**. P21 pozostaje IN PROGRESS/BLOCKED na H01; H02–H04
  pending, H02 NOT STARTED.
- Jeden końcowy Oracle review już się odbył i wynik to **CHANGES REQUIRED**.
  Nie rób nowego pełnego review, drugiego audytu ani review review w tej
  kontynuacji. Wprowadzaj wyłącznie celowane poprawki do znanych blockerów i
  sprawdzaj zmienione ścieżki.
- Początkowy prompt zachowano w `docs/handoffs/PKG-009-rev01.md`, a poprzednią
  kontynuację w `docs/handoffs/PKG-009-CONTINUE-01.md`. Dawny, przedwczesny
  H02 prompt zachowano jako
  `C:\retro-ski-jumping\docs\handoffs\PKG-010-premature-draft.md` i **nie jest
  aktywnym handoffem**.
- Raport/status: `C:\retro-ski-jumping\docs\evidence\PKG-009\REPORT.md`.
  Karta, PDF FIS, ekstrakty, manifest, zrzuty i nagranie są zachowane.
  `n=269` jest opisem czterech raportów; porównywalniejsza podpróba 2022–2023
  to `n=189`. Żadna nie zatwierdza geometrii ani decyzji bezpieczeństwa.
- Runtime zabezpieczający: w playable catalog pozostaje wyłącznie
  `TECHNICAL_K120`; H01-spec jest provisional, H01 nie można wybrać, wznowić ani
  odtworzyć. Nie cofaj tej blokady przed zaliczeniem wymaganych bramek.

## Pozostało do wykonania — D18, D najpierw

1. **Geometria certyfikatu — D BLOCKED.** Dokładny obiekt: Lysgårdsbakken
   normalna K90/HS98, certyfikat FIS 304/NOR 44, 3. prolongation z 2022.
   Oryginał jest w `docs/evidence/PKG-009/fis/lillehammer-hs98-certificate-2022.pdf`;
   definicje podaje FIS Construction Norm 2018, §§2, 4 i 6. Rozstrzygnięto:
   `q=32,50 m` to odsunięcie wieży sędziowskiej w poprzek osi, `a=100 m` to
   wybieg za U, `e1=87,98 m` obejmuje próg `t=6,10 m`; `rL=210 m` dotyczy
   P–L, a `r2L=131 m`/`r2=125 m` początku/końca L→U. Prototyp ma
   `lengthMeters=94,08 m` (t dodane drugi raz), wybieg 32,50 m, K=(78,667;
   −42,645) wobec certyfikatu (78,43; −43,22), zU=60,651 wobec 66,60 m
   oraz błędne promienie. Liczby i metoda są w karcie H01. Nadal potrzebny
   autorytatywny podłużny profil/tabela współrzędnych lub raport inspekcji
   pozwalający wyznaczyć U, przejścia, fall line i koniec wybiegu. Nie kopiuj
   punktów prototypu jako FACT i nie zgaduj zastępczych współrzędnych.
2. **Konfiguracja 2026, AI i lądowanie — D18 BLOCKED.** Oficjalne raporty
   2023 i 2026 różnią się długością belki 9 o 10,98 m (75,52 vs 86,50 m),
   a 2026 women JWC podaje belkę 16 długości 92,08 m, powyżej e1=87,98 m.
   Ustal z oficjalnych dokumentów, czy zmieniła się konstrukcja czy metoda
   pomiaru; do tego czasu nie scalaj 2026 z mapą rozbiegu 2022. Podpróba
   2022–2023 `n=189` ma 0 upadków, tylko 8 skoków ≥HS98 i 1 >103 m;
   połączone `n=269` ma jeden krótki upadek na 66 m. Obecny AI ma globalny,
   niekalibrowany profil. Szukaj tylko oficjalnych, datowanych danych z tej
   dokładnej konfiguracji i etykietami ustania/stylu, jeśli istnieją.
   Brak identyfikacji ryzyka, stylu lub błędów AI = **UNRESOLVED**, bez
   wymyślonego rozkładu.
3. **AUTO i progi ustania — D18 BLOCKED.** Statystyka q75=92 m z połączonych
   raportów nie dowodzi, że
   jest to bezpieczny cel AUTO. Bieżący prototypowy estimator daje ok. 94,53 m
   na belce 1 przy neutralnym wietrze i ok. 98,5 m przy +2 m/s, powyżej HS98;
   nie wykazano bezpiecznej belki. Progi 109/111 m wyprowadzono z rekordu
   107,5 m, nie z obserwacji nieustania — zostały **WITHDRAWN / UNRESOLVED**.
   Wyprowadź bezpieczne rozwiązanie z właściwych danych H01 albo pozostaw AUTO/
   progi w stanie UNRESOLVED i H01 zablokowaną. Nie podawaj nowych wartości
   zastępczych bez dowodu.
4. Utrzymuj `docs/hills/H01.md` i raport w zgodzie z nowymi dowodami; rozróżniaj
   FACT, obserwacje 2022–2023/2026, prototypowe ADAPT i UNRESOLVED. Zachowane
   statystyki/PDF/ekstrakty świadczą o raportowanych wynikach, nie o poprawności
   geometrii, AI lub AUTO. Jeśli brak autorytatywnego profilu i danych lądowań,
   nazwij dokładnie brakujące dokumenty do pozyskania od FIS/organizatora.
5. **STOP/BLOCKED:** jeśli oficjalne źródła nie pozwalają rozstrzygnąć geometrii
   i wymaganej kalibracji, PKG-009/P21-H01-D pozostaje BLOCKED/UNRESOLVED. Nie
   przechodź do G/A/V, nie włączaj H01 do playable catalog i przygotuj
   kontynuację PKG-009. H02/P21-H02 pozostaje poza zakresem.

## G/A/V — tylko warunkowo po zaliczeniu D

Jeżeli D rzeczywiście przejdzie, dopiero wtedy weryfikuj G/A/V w pełnym zakresie
PKG-009: geometryczny HillSpec, distanceMap/markery/belki/sensory, wszystkie
progi/warunki i osobny AI/AUTO H01; pixel art zostaje materiałem prototypowym,
nie deklaracją odbioru VISUAL; integracja zapisu/replayu musi nadal bezpiecznie
odrzucać H01-sesje/replay podczas blokady. Włącz H01 do playable catalog dopiero
po zaliczeniu empirycznego D oraz warunkowych G/A/V, bez naruszania K120.

## Dowody, ograniczenia i zamknięcie

- Zachowaj historyczne zrzuty 960×540 i webm; są dowodem prototypu, nie bieżącego
  playable H01 ani akceptacji artu. ART_MANIFEST zachowuje źródła i hashe, lecz
  oznacza art jako prototyp, nie shipped playable content.
- H01 VISUAL user **NOT RUN**; zewnętrzny player playtest **NOT RUN**. Bramka V
  bazowej oprawy zaakceptowana 22.09.2026 jest odrębna.
- Test ledger po H01 gating: `npm run typecheck` PASS; `npm test` PASS (33 pliki,
  282 testy); `npm run build` PASS; `tests/browser/h01.spec.ts --workers=1`
  PASS 2/2; full E2E po gating 21/25 FAIL (trzy overload/timing, jeden replay
  archiwalny). Archival replay od tamtej pory PASS 1/1, H01 E2E PASS 2/2, trzy
  celowane testy jump PASS 3/3; full E2E po tych poprawkach NOT RUN. Pełne
  25/25 było **przed** wyłączeniem H01 i jest tylko wynikiem historycznym.
- Kontynuacja 23.09.2026: `npm run typecheck` PASS, `npx vitest run
  tests/h01.test.ts` PASS 20/20. Testy te sprawdzają prototyp i blokadę, nie
  certyfikację. Nie było zmiany zachowania runtime; bieżący pełny build,
  pełne unit i E2E NOT RUN.
- Kontynuacja to praca nad znanymi blockerami, nie nowy full review. Nie ma
  podstaw do H02. Jeśli PKG-009 nadal BLOCKED, zachowaj ten sam zakres i
  przygotuj kolejną kontynuację PKG-009; dopiero po realnym COMPLETE utwórz
  PKG-010. Raport/status/aktywny prompt muszą odzwierciedlać faktyczny stan.
