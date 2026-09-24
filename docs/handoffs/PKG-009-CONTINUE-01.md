# PKG-009 — P21-H01: Lillehammer normalna (D/G/A/V)

Pakiet docelowy: PKG-009  
Zakres: P21-H01 (Lillehammer normalna) — pełny cykl D/G/A/V z IMPLEMENTATION_PLAN §6.  
Następny po COMPLETE: PKG-010 / P21-H02 (Zakopane duża); **nie rozpoczynaj go w tej sesji**.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git: nie
inicjalizuj Git i nie publikuj gry.

## Stan wejściowy i review

- PKG-001–008 COMPLETE; bazowa bramka V oprawy PASS po akceptacji użytkownika
  22.09.2026. To nie jest akceptacja H01.
- PKG-009 jest **BLOCKED**. P21 pozostaje IN PROGRESS/BLOCKED na H01; H02–H04
  pending, H02 NOT STARTED.
- Jeden końcowy Oracle review już się odbył i wynik to **CHANGES REQUIRED**.
  Nie rób nowego pełnego review, drugiego audytu ani review review w tej
  kontynuacji. Wprowadzaj wyłącznie celowane poprawki do znanych blockerów i
  sprawdzaj zmienione ścieżki.
- Początkowy prompt zachowany w
  `C:\retro-ski-jumping\docs\handoffs\PKG-009-rev01.md`. Dawny, przedwczesny
  H02 prompt zachowano jako
  `C:\retro-ski-jumping\docs\handoffs\PKG-010-premature-draft.md` i **nie jest
  aktywnym handoffem**.
- Raport/status: `C:\retro-ski-jumping\docs\evidence\PKG-009\REPORT.md`.
  Karta, PDF FIS, ekstrakty, manifest, zrzuty i nagranie są zachowane; wyniki
  próby nie są wszystkie nieważne, ale nie zatwierdzają wadliwej geometrii ani
  decyzji bezpieczeństwa.
- Runtime zabezpieczający: w playable catalog pozostaje wyłącznie
  `TECHNICAL_K120`; H01-spec jest provisional, H01 nie można wybrać, wznowić ani
  odtworzyć. Nie cofaj tej blokady przed zaliczeniem wymaganych bramek.

## Pozostało do wykonania — D18, D najpierw

1. **Geometria certyfikatu — D BLOCKED.** Dokładny obiekt: Lysgårdsbakken
   normalna K90/HS98, certyfikat FIS 304/NOR 44, 3. prolongation. Zweryfikuj
   osie, kierunki i każdą pozycję względem oryginalnego certyfikatu
   `docs/evidence/PKG-009/fis/lillehammer-hs98-certificate-2022.pdf`.
   Potwierdzony blocker Oracle: `q=32,50 m` jest wymiarem poprzecznym, a nie
   podłużną długością wybiegu; podłużny `a=100 m`. Certyfikat `zU=66,60 m`,
   prototypowa głębokość U wynosi ok. 60,65 m; przypisania przejściowych
   promieni do obecnej krzywej są błędne. Zrekonstruuj poprawne interpretacje
   i wyprowadzenia. Nie kopiuj współrzędnych z prototypu jako FACT, nie zgaduj
   zastępczych promieni, U, fall-line ani końca wybiegu. Surowe źródła i
   raportowane wyniki zawodów pozostają zachowane.
2. **AI i lądowanie — D18 BLOCKED.** Obecny AI używa globalnego, niekalibrowanego
   profilu. Próba `n=269` zawiera tylko jeden krótki upadek 66,0 m i nie pokazuje
   zależności upadków od odległości; nie wystarcza do estymacji H01 distance-risk
   curve ani H01 rozkładu błędów AI. Zbierz/wyprowadź tylko to, co rzeczywiście
   wspierają oficjalne, datowane PDF FIS z tej konfiguracji (cztery zachowane
   PDF są opisane w karcie). Gdzie próba nie identyfikuje ryzyka, stylu lądowania
   lub AI, wpisz **UNRESOLVED** i zatrzymaj D — nie wymyślaj rozkładu.
3. **AUTO i progi ustania — D18 BLOCKED.** Statystyka q75=92 m nie dowodzi, że
   jest to bezpieczny cel AUTO. Bieżący prototypowy estimator daje ok. 94,53 m
   na belce 1 przy neutralnym wietrze i ok. 98,5 m przy +2 m/s, powyżej HS98;
   nie wykazano bezpiecznej belki. Progi 109/111 m wyprowadzono z rekordu
   107,5 m, nie z obserwacji nieustania — zostały **WITHDRAWN / UNRESOLVED**.
   Wyprowadź bezpieczne rozwiązanie z właściwych danych H01 albo pozostaw AUTO/
   progi w stanie UNRESOLVED i H01 zablokowaną. Nie podawaj nowych wartości
   zastępczych bez dowodu.
4. Zaktualizuj `docs/hills/H01.md` i raport, rozróżniając FACT, obserwacje próby,
   prototypowe ADAPT oraz UNRESOLVED. Statystyki `n=269`, PDF i pliki ekstrakcji
   są zachowane jako dowody tego, co źródła raportują; nie przedstawiaj ich jako
   wystarczającej kalibracji geometrii/AI/AUTO.
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
- Kontynuacja to praca nad znanymi blockerami, nie nowy full review. Nie ma
  podstaw do H02. Jeśli PKG-009 nadal BLOCKED, zachowaj ten sam zakres i
  przygotuj kolejną kontynuację PKG-009; dopiero po realnym COMPLETE utwórz
  PKG-010. Raport/status/aktywny prompt muszą odzwierciedlać faktyczny stan.
