# HERALD — prompt wdrożeniowy dla modelu kodującego

Skopiuj cały tekst poniżej do czatu modelu wykonawczego razem z plikiem `herald-prolog-i-system-torporu-redesign.md`.

```text
Jesteś modelem wykonawczym pracującym w repo gry HERALD. Twoim zadaniem jest wdrożyć zmianę strukturalną opisaną w załączonym pliku:

- `herald-prolog-i-system-torporu-redesign.md`

Cel: usunąć grywalny prolog ziemski / wejście na statek jako aktywny początek gry, zastąpić go tekstowym prologiem wprowadzającym, a właściwą grę rozpocząć od pierwszego przebudzenia Tomasza po torporze. Równolegle uporządkuj system torporu jako świadomą decyzję gracza, bramkę progresji i mechanikę skoku czasu.

Nie zadawaj pytań, dopóki możesz działać na podstawie dokumentacji i załączonego MD. Jeśli coś jest niejednoznaczne, przyjmij najbezpieczniejsze rozwiązanie zgodne z istniejącym runtime i oznacz decyzję w komentarzu/handoffie.

NAJPIERW PRZECZYTAJ, W TEJ KOLEJNOŚCI:

1. `herald-prolog-i-system-torporu-redesign.md`
2. `web-migracja/docs/00-indeks-zrodel-i-kompletacji.md`
3. `web-migracja/docs/01-kanon-i-tozsamosc-gry.md`
4. `web-migracja/docs/02-architektura-ts-pixijs.md`
5. `web-migracja/docs/03-kontrakt-danych-runtime.md`
6. `web-migracja/docs/04-progression-spine-i-objective-flow.md`
7. `web-migracja/docs/05-mechaniki-systemy-i-stan.md`
8. `web-migracja/docs/06-ui-ux-input-i-dostepnosc.md`
9. `web-migracja/docs/09-walidacja-testy-i-kryteria-akceptacji.md`
10. `web-migracja/handoffs/LATEST-WEB-HANDOFF.md`
11. `docs/handoffs/LATEST-GPT5_4-HANDOFF.md`, jeśli istnieje w repo

AKTYWNY TARGET:

- Aktywny runtime to web:
  - `web-migracja/herald-web`
- Godot / `source-mirror/godot-runtime-reference` traktuj wyłącznie jako referencję zachowania.
- Nie importuj kodu Godot do runtime webowego.
- Dane player-facing edytuj w źródłach:
  - `web-migracja/data-mirror/**`
- Po zmianach contentu zsynchronizuj runtime public content zgodnie z istniejącym skryptem projektu, najpewniej:
  - `cd web-migracja/herald-web`
  - `npm run content:sync`

ARCHITEKTURA, KTÓREJ MASZ NIE ŁAMAĆ:

- `systems/` = czysta logika gry, bez importów renderera/UI/DOM.
- `rendering/` i `ui/` = prezentacja stanu.
- Komunikacja przez `EventBus`.
- `GameState` ma pozostać centralny i serializowalny.
- Eventy narracyjne pozostają w JSON.
- Nie twórz nowego dialogue managera, quest systemu ani równoległego store’a.
- Zachowuj istniejące pola eventów:
  - `id`
  - `title`
  - `motyw`
  - `type`
  - `weight`
  - `act`
  - `requirements`
  - `description`
  - `inner_voices`
  - `choices`
  - `nodes`
  - `start_node`
  - `timeout_seconds`
  - `timeout_choice_id`
  - `variants`
- Zachowuj istniejące effect types. Nie wymyślaj nowych, jeśli można użyć istniejących:
  - `flag`
  - `voice`
  - `relationship`
  - `resource`
  - `tomasz_stat`
  - `crew_stat`
  - `time`
  - inne już obsługiwane przez `EventEngine`

ZADANIE GŁÓWNE — WDROŻENIE:

## 1. Zrób inventory obecnego startu gry

Znajdź wszystkie miejsca, które zakładają grywalny prolog ziemski:

- `earthside_quarters`
- `earthside_terminal`
- `boarding_trap`
- `boarding_sluice`
- `arrival_passage`
- eventy typu:
  - `earthside_before_dawn_wake`
  - `terminal_last_conversation_before_boarding`
  - `trap_walk_no_countdown`
  - `sluice_first_seal`
  - `thales_first_internal_passage`
- room entry rules
- objective flow
- start new game flow
- full playthrough harness
- prologue traversal tests
- start overlay / new game UI
- save reset / GameState initial room

Nie usuwaj od razu danych historycznych, jeśli ich usunięcie ryzykuje cascade. Preferuj wyłączenie z active progression i pozostawienie jako archived/reference content, chyba że projekt ma już jasny wzorzec usuwania.

## 2. Dodaj tekstowy prolog jako pierwszy ekran nowej gry

Na starcie `Nowa gra` pokaż tekstowy prolog z załączonego MD.

Wymagania UX:

- prolog ma być czytelny jako długi tekst;
- nie powinien udawać grywalnej sceny;
- gracz musi móc przejść dalej świadomym inputem;
- po prologu runtime rozpoczyna właściwą grę od pierwszego przebudzenia po torporze;
- zapisz flagę, np. `text_prologue_seen` albo użyj istniejącej konwencji, jeśli taka istnieje;
- nie łam `Kontynuuj` dla istniejącego save’a.

Preferowany flow:

`Nowa gra -> Tekstowy prolog -> Pierwsze przebudzenie po torporze -> Bridge/Medbay -> ECHO first wake report -> właściwy Act I ship loop`

Jeśli w projekcie istnieje już start overlay / modal / EventOverlay możliwy do użycia dla prologu, wykorzystaj istniejący komponent. Nie twórz ciężkiego nowego systemu.

## 3. Zmień initial progression

Nowa gra nie powinna zaczynać w pokojach ziemskich.

Ustaw start na statek:

- rekomendowany start: `bridge`, jeśli obecny runtime i objective flow najbezpieczniej obsługują Bridge;
- dopuszczalny start: `medbay`, jeśli łatwiej uczciwie wystawić przebudzenie po torporze;
- nie twórz nowego pokoju, jeśli nie jest konieczny.

Po starcie gra ma wystawić pierwszy obowiązkowy objective:

`Potwierdź przebudzenie i odbierz pierwszy raport ECHO`

Zadbaj, aby `echo_first_morning` albo jego nowy odpowiednik działał jako pierwszy authored beat po prologu tekstowym.

Jeśli obecny event `echo_first_morning` zakłada już wcześniejszy prolog runtime, zrób minimalną korektę wymagań/flag tak, aby działał po `text_prologue_seen` / `first_wake_after_torpor_ready`, bez przepisywania całego Act I.

## 4. Usuń prolog ziemski z active objective flow

W `room_entry_rules`, `ProgressionEngine`, `ObjectiveResolver` i testach usuń wymóg przechodzenia przez:

- `earthside_quarters`
- `earthside_terminal`
- `boarding_trap`
- `boarding_sluice`
- `arrival_passage`

Nie musisz usuwać tych lokacji z typów, jeśli ich obecność stabilizuje kod. Wystarczy, że nowa gra i pełny playthrough już ich nie wymagają.

Zaktualizuj wszystkie objective snapshots i harnessy, które oczekują starego flow.

## 5. Wdroż system torporu zgodnie z MD

Torpor ma działać jako:

- świadoma decyzja gracza;
- skok czasu;
- separator etapów;
- bramka progression;
- sposób zamykania cykli misji.

Nie traktuj torporu jako zwykłego odpoczynku po każdej rozmowie.

Zachowaj bazową stałą:

- pełny torpor = `90` dni

Zadbaj, aby torpor:

- zwiększał `torporCyclesCompleted`;
- ustawiał flagi cykli;
- emitował istniejące eventy typu `torpor:started` i `torpor:ended`, jeśli już istnieją;
- wracał domyślnie na Bridge, chyba że istniejący kontrakt wymaga inaczej;
- odświeżał objective;
- nie pozwalał ominąć authored scen;
- blokował się, jeśli aktywny objective lub mainline event wymaga innego działania.

## 6. Rozróżnij torpor obowiązkowy i opcjonalny

Torpor obowiązkowy:

- pojawia się jako objective, gdy etap fabuły jest zamknięty;
- prowadzi do kolejnego dużego kroku misji;
- nie powinien dawać wrażenia „skipowania” fabuły.

Torpor opcjonalny:

- może być dostępny tylko wtedy, gdy nie blokuje objective;
- nie może omijać scen Anny, Kezii, Limes, final message ani innych authored beatów;
- może ustawiać flagę odłożenia albo zaniechania, jeśli gracz śpi przed miękką rozmową.

Dodaj lub uporządkuj komunikaty blokady:

- `Nie teraz. Cykl nie jest zamknięty.`
- `Nie teraz. Kezia czeka na mostku.`
- `Nie teraz. ECHO ma nieodebrany pakiet z Ziemi.`
- `Nie teraz. Recykler wody jest poza progiem torporu.`

Użyj istniejącej warstwy UI/status messages. Nie twórz nowego panelu, jeśli wystarczy obecny center-lane message / objective hint.

## 7. Zaktualizuj content / flags / objectives

Dodaj minimalny zestaw flag zgodny z istniejącą konwencją repo. Jeśli musisz zaproponować nowe flagi, trzymaj je proste i jawne, np.:

- `text_prologue_seen`
- `first_wake_after_torpor_done`
- `act1_first_cycle_ready_for_torpor`
- `act1_first_torpor_done`
- `torpor_cycle_01_done`

Nie nadpisuj istniejących flag bez sprawdzenia ich użycia.

Zaktualizuj objective labels tak, aby gracz rozumiał:

- co musi zrobić przed torporem;
- dlaczego torpor jest niedostępny;
- co wydarzyło się po przebudzeniu.

## 8. Testy

Zaktualizuj albo dodaj testy zgodnie z istniejącą strukturą.

Minimalne testy wymagane po tej zmianie:

1. `New game starts with text prologue`
   - `Nowa gra` pokazuje tekstowy prolog.
   - Po przejściu dalej gracz trafia do pierwszego przebudzenia na statku.

2. `No playable earthside prologue required`
   - full playthrough nie wymaga `earthside_quarters`, `boarding_trap`, `arrival_passage`.

3. `First wake objective`
   - po prologu aktywny objective prowadzi do ECHO / pierwszego raportu.

4. `Torpor blocked while cycle open`
   - próba wejścia do torporu przed zamknięciem wymaganych zadań daje komunikat blokady.

5. `Torpor advances time by 90 days`
   - torpor zwiększa czas misji zgodnie z istniejącą stałą.

6. `Torpor sets cycle flags`
   - po torporze pojawia się właściwa flaga i rośnie `torporCyclesCompleted`.

7. `Full playthrough still reaches all four endings`
   - RAPORT
   - LIST
   - ŚWIADECTWO
   - CISZA

Uruchom minimum:

```bash
cd web-migracja/herald-web
npm test
npm run build
npm run test:ui
```

Jeśli istnieją focused testy full playthrough albo prologue traversal, uruchom je też osobno.

## 9. Styl player-facing

Wszystkie nowe polskie teksty muszą przejść pass anty-AI.

Unikaj szczególnie konstrukcji:

- `To nie X. To Y.`
- `Nie jest X. Jest Y.`
- `Nie ma X. Jest Y.`
- `kluczowe`
- `warto zauważyć`
- `na poziomie emocjonalnym`
- `w kontekście`
- `stanowi`
- `pełni rolę`
- `jest symbolem`
- ekspozycji w dialogu
- angielskiej interpunkcji dialogowej

ECHO:

- raportuje;
- nie pociesza;
- nie ocenia;
- nie filozofuje;
- używa krótkich zdań i parametrów.

Tomasz:

- punkt ciężkości sceny;
- spokojny;
- bez wielkich mów;
- ciężar pod spodem.

CISZA:

- zawsze pełny wybór;
- nigdy brak inputu.

## 10. Bramki kanonu

Nie wolno:

- zmieniać czterech zakończeń;
- robić z ECHO antagonisty, terapeuty albo avatara;
- robić z Limes prostego triumfu;
- zmieniać biologicznego wieku Tomasza na konkretną liczbę bez decyzji kanonicznej;
- usuwać prywatnych propsów i linii postaci:
  - ziemia Naomi,
  - precyzja Piotra,
  - pytania Solomona,
  - obserwacja / przestrzeń Brigitte,
  - logbook Dawita,
  - milczenie Kezii.

## 11. Dokumentacja po wdrożeniu

Po zmianach zaktualizuj istniejące docs, nie twórz równoległego source of truth.

W szczególności sprawdź:

- `web-migracja/docs/04-progression-spine-i-objective-flow.md`
- `web-migracja/docs/05-mechaniki-systemy-i-stan.md`
- `web-migracja/docs/09-walidacja-testy-i-kryteria-akceptacji.md`
- aktualny handoff webowy

W handoffie zapisz:

- jakie pliki zmieniono;
- jak wygląda nowy start gry;
- co stało się ze starym prologiem ziemskim;
- jakie flagi dodano;
- jakie testy przeszły;
- jakie ryzyka zostały.

## 12. Tryb pracy

Pracuj małymi commitowalnymi krokami:

1. inventory;
2. prolog tekstowy;
3. start state / initial objective;
4. wyłączenie earthside progression;
5. torpor gating;
6. tests;
7. docs/handoff.

Nie deklaruj sukcesu bez uruchomionych testów.

Na końcu odpowiedz krótkim raportem:

- `Zmienione pliki`
- `Nowy flow startu`
- `Torpor: co działa`
- `Testy`
- `Znane ryzyka`
- `Następny sugerowany krok`
```
