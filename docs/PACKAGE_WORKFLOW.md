# Pakiety sesyjne i obowiązkowe przekazanie

Zasada użytkownika: **po każdym wykonanym pakiecie powstaje prompt nowej sesji wykonującej kolejny pakiet**. Dotyczy wszystkich etapów, nie tylko końca projektu. Stan bieżący: PKG-001–012 COMPLETE; P21 COMPLETE (H04 VISUAL USER PASS 24.09.2026 po dwóch wskazanych poprawkach); **PKG-013/P22 COMPLETE 24.09.2026; następny PKG-014/P23–P25**, NOT STARTED. Bazowa bramka V oprawy zaliczona akceptacją użytkownika 22.09.2026; H01, H02 i H03 VISUAL USER PASS 23.09.2026 (H03: „skocznia obersdorff jest ok”; bez twierdzenia, że użytkownik obejrzał cały film). Zewnętrzny playtest PLAYABILITY NOT RUN. Stan i dowody H04: [raport PKG-012](evidence/PKG-012/REPORT.md). Incydent sześciu nadpisanych artefaktów PKG-010 zamknięto akceptacją udokumentowanej utraty przez użytkownika („dobra, trudno”): historyczny manifest bez zmian, obecne pliki nie są oryginałami, bez nowej bazy. Dla H01–H20 obowiązuje nowsza zasada skoczni inspirowanych z poprawnymi K/HS, zróżnicowaną oprawą, balansem ADAPT/TUNE i możliwością czystego lądowania na dwie nogi 2 m za rekordem — patrz [AGENTS.md](../AGENTS.md).

Obowiązuje nadrzędna [zasada prostoty z AGENTS.md](../AGENTS.md): najprostsze rozwiązanie dające dobry efekt, praca w aktywnym zakresie i **jedno review dopiero po całym pakiecie**. Ta mapa służy wykonaniu gry, nie rozbudowywaniu procesu zarządzania. Nie dodawaj kolejnych bramek, komisji ani sesji audytowych.

**Praca bez Git (polecenie użytkownika 23.09.2026):** zapisuj zmiany bezpośrednio na dysku; nie wykonuj żadnych poleceń Git, nie twórz repozytorium ani konfiguracji. Zmienić to może tylko nowe, wyraźne polecenie użytkownika. Główny `.git` usunięto 23.09.2026, głównego `.gitignore` nie było. Zagnieżdżony backup `C:\retro-ski-jumping\retro-ski-jumping-23-09-2026-backup` zachowuje swoje `.git` i `.gitignore`: nie korzystaj z nich ani nie porządkuj backupu. Wzmianki o Git w dawnych raportach są historyczne, nie stanowią pozwolenia. Utrata sześciu dawnych artefaktów PKG-010 została zaakceptowana, nie odwrócona.

## 1. Zadanie, pakiet i bramka

- `P01`–`P40`: zadania merytoryczne z IMPLEMENTATION_PLAN.md.
- `PKG-001`–`PKG-033`: zakresy kolejnych sesji, zawierające konkretne zadania lub jeden komplet skoczni.
- Bramka A–E: większy etap produktu; nie wymaga wykonywania całego etapu w jednej sesji.
- Kody `P21-H01` i `P32-H05`: cztery podzadania D/G/A/V dla danego obiektu. Pakiet jest ukończony dopiero po wszystkich czterech.

Poprzedni handoff P01–P12 obejmował cały prototyp i zbyt szeroki zakres na pierwszy pakiet. Teraz prototyp zajmuje PKG-001–003. Pełne 40 zadań oraz 20 obiektów pozostają w planie.

## 2. Mapa pakietów

Każdy wiersz ma dokładny zakres. Następny numer można rozpocząć po zamknięciu zależności wcześniejszego pakietu. Gdy obiekt lub zadanie wymaga dodatkowej sesji naprawczej, użyć promptu kontynuacji tego samego numeru; nie przeliczać całej mapy.

| Pakiet | Zadania | Efekt sesji | Status |
|---|---|---|---|
| PKG-001 | P01, P02, P03, P04 | Baza referencyjna, uruchamialny shell, fullscreen, klawiatura i zegar | COMPLETE |
| PKG-002 | P05, P06, P07, P08 | Techniczna skocznia, pełny ruch skoku i terminalne stany lądowania/upadku | COMPLETE |
| PKG-003 | P09, P10, P11, P12 | Trening, długość/styl, wiatr, kamera i retry; bramka A | COMPLETE |
| PKG-004 | P13, P14, P15 | Kompensaty, sportowe linie, docelowy wzorzec pixel artu i pomiar wydajności | COMPLETE |
| PKG-005 | P16, P17, P18 | Konkurs, AI i hotseat | COMPLETE |
| PKG-006 | P19, P20 | Transakcyjny zapis i replay | COMPLETE |
| PKG-007 | P41 | Empiryczny audyt oprawy i porównanie z DSJ2/SJI3 | COMPLETE |
| PKG-008 | P42 | Przebudowa oprawy do akceptacji użytkownika; bramka V | COMPLETE |
| PKG-009 | P21-H01 | Lillehammer normalna inspirowana: dane, geometria, art, weryfikacja | COMPLETE |
| PKG-010 | P21-H02 | Zakopane: dane, geometria, art, weryfikacja | COMPLETE |
| PKG-011 | P21-H03 | Oberstdorf duża: dane, geometria, art, weryfikacja | COMPLETE |
| PKG-012 | P21-H04 | Planica: dane, geometria, art, weryfikacja; zamknięcie P21 po odbiorze | COMPLETE |
| PKG-013 | P22 | Ustawienia, remapowanie i dostępność; bramka B / MVP | COMPLETE |
| PKG-014 | P23, P24, P25 | Sezon, własny kalendarz i silnik turnieju KO | NOT STARTED |
| PKG-015 | P26, P27, P28 | Drużyny, Super Team i King of the Hill | NOT STARTED |
| PKG-016 | P29, P30, P31 | Rekordy/statystyki, komplet sprite/UI i dźwięku; bramka C po P29 | NOT STARTED |
| PKG-017 | P32-H05 | Garmisch-Partenkirchen: D/G/A/V | NOT STARTED |
| PKG-018 | P32-H06 | Innsbruck: D/G/A/V | NOT STARTED |
| PKG-019 | P32-H07 | Bischofshofen: D/G/A/V i finalne obiekty turnieju | NOT STARTED |
| PKG-020 | P32-H08 | Wisła: D/G/A/V | NOT STARTED |
| PKG-021 | P32-H09 | Szczyrk: D/G/A/V | NOT STARTED |
| PKG-022 | P32-H10 | Lahti: D/G/A/V | NOT STARTED |
| PKG-023 | P32-H11 | Ruka: D/G/A/V | NOT STARTED |
| PKG-024 | P32-H12 | Holmenkollen: D/G/A/V | NOT STARTED |
| PKG-025 | P32-H13 | Lillehammer duża: D/G/A/V | NOT STARTED |
| PKG-026 | P32-H14 | Falun: D/G/A/V | NOT STARTED |
| PKG-027 | P32-H15 | Engelberg: D/G/A/V | NOT STARTED |
| PKG-028 | P32-H16 | Titisee-Neustadt: D/G/A/V | NOT STARTED |
| PKG-029 | P32-H17 | Klingenthal: D/G/A/V | NOT STARTED |
| PKG-030 | P32-H18 | Sapporo: D/G/A/V | NOT STARTED |
| PKG-031 | P32-H19 | Kulm: D/G/A/V | NOT STARTED |
| PKG-032 | P32-H20 | Vikersund: D/G/A/V; zamknięcie P32 i kalendarza 20 obiektów | NOT STARTED |
| PKG-033 | P33, P34 | Pierwsze uruchomienie, teksty, bramka D i matryca przeglądarek | NOT STARTED |
| PKG-034 | P35, P36, P37 | Wydajność, offline, aktualizacje i odporność zapisów | NOT STARTED |
| PKG-035 | P38, P39, P40 | Playtest, poprawki, artefakt wydania i bramka E | NOT STARTED |

## 3. Zamknięcie każdego pakietu

1. Sprawdź faktyczny stan dysku oraz dotychczasowe dowody; nie odtwarzaj zakończonych prac od początku.
2. Wykonaj wszystkie zadania zakresu. W miarę potrzeb używaj testów i podglądu do bieżącego sprawdzania działania; nie uruchamiaj review po zadaniach Pxx.
3. Po całym pakiecie wykonaj **jeden** końcowy przegląd względem jego kryteriów. Napraw wykryte błędy, sprawdź poprawione ścieżki i zamknij przegląd; bez drugiej pełnej rundy. Wymagane testy uruchomione już na aktualnym kodzie liczą się jako dowód — nie powtarzaj ich dla samego raportu.
4. Zapisz jeden `docs/evidence/PKG-NNN/REPORT.md`: statusy zadań, istotne zmiany, polecenia i wyniki, ścieżki dowodów, krótka sekcja „Końcowe review”, ograniczenia i link do następnego promptu. Osobny `SELF_REVIEW.md`, raporty każdego Pxx i trzecia kopia promptu nie są wymagane. Wystarcza krótki raport bez powielania specyfikacji.
5. Zaktualizuj status pakietu w tej tabeli i statusy/checklisty planu bez zmiany znaczenia wcześniejszych dowodów.
6. Przygotuj prompt następnego pakietu. Zapisz go w `docs/handoffs/PKG-NNN.md` pod numerem **docelowego** pakietu i tę samą treść w `docs/NEXT_SESSION_PROMPT.md`. Np. zamknięcie PKG-001 tworzy `docs/handoffs/PKG-002.md`.
7. Zweryfikuj, że aktywny prompt i docelowy plik handoff są identyczne, wskazany zakres zgadza się z mapą, a zależności są zakończone. Odpowiedź końcowa zawiera link do promptu.

Pierwotny prompt pakietu pozostaje w `docs/handoffs/`; nie nadpisuj go promptem następnego numeru. Jeśli trzeba zmienić go przed wykonaniem lub przygotować kontynuację, zachowaj poprzedni jako `PKG-NNN-rev01.md` lub `PKG-NNN-CONTINUE-01.md` i podaj, który plik jest aktywny. Zmiana `docs/NEXT_SESSION_PROMPT.md` jest celowa, ale zawsze musi istnieć archiwum przekazanej treści.

Plik kanoniczny `docs/handoffs/PKG-NNN.md` zawsze zawiera aktualną wersję promptu tego numeru. Przy kontynuacji najpierw archiwizuj poprzednią treść jako wersję numerowaną, a następnie wpisz nową do pliku kanonicznego i aktywnego. Linia `Zakres:` nadal wymienia pełne przypisanie z mapy; osobna sekcja „Pozostało do wykonania” wskazuje braki, a ukończone zadania są tylko weryfikowane, nie wykonywane ponownie. To pozwala zachować historię i jednoznacznie sprawdzać aktywny handoff.

## 4. Co musi zawierać prompt

Każdy prompt jest samodzielnym poleceniem wykonawczym dla modelu bez historii czatu. Musi zawierać:

- absolutny katalog projektu, numer pakietu i dokładne Pxx/podzadania;
- faktyczny stan wejściowy, co jest gotowe i czego jeszcze nie wykonano;
- kolejność lektury źródeł prawdy i najważniejsze wymagania użytkownika;
- konkretny wynik pakietu, granice zakresu i kolejność implementacji;
- kryteria odbioru odpowiednie do obecnego etapu, a nie testy jeszcze nieistniejących funkcji;
- polecenia faktycznie dostępne albo obowiązek ich utworzenia, jeśli to pierwszy pakiet;
- znane problemy, jawne niewiadome i sposób obchodzenia niezależnych blokad;
- procedurę wznowienia po przerwaniu, zachowania cudzych zmian i dowodów;
- regułę prostoty, jedno końcowe review po całym pakiecie, brak pętli ponownych audytów i zakończenie po spełnieniu kryteriów;
- obowiązek krótkiego raportu oraz napisania promptu kolejnej sesji;
- numer kolejnego pakietu i jego zakres, o ile obecny został zamknięty.

Nie używaj wyłącznie zdań „kontynuuj projekt” lub „zrób kolejny etap”. Nie przypisuj kolejnej sesji testów poprzednika jako wykonanych przez nią. Konfiguracja narzędzi, zależności i nazwy assetów mają odpowiadać rzeczywistemu stanowi dysku.

Prompt odsyła do aktualnych specyfikacji zamiast kopiować cały projekt. Podaje istotne zmiany i zakres potrzebny nowej sesji. Starsze raporty czyta się tylko przy konkretnym pytaniu lub wznowieniu; nie są obowiązkową lekturą każdego pakietu. Archiwalne instrukcje o dodatkowych review nie zmieniają aktualnej zasady użytkownika.

## 5. Niekompletny pakiet i ostatnie wydanie

Statusy wykonania: NOT STARTED, IN PROGRESS, COMPLETE, INCOMPLETE, BLOCKED. Wyniki konkretnych sprawdzeń: PASS, FAIL, NOT RUN, BLOCKED. `COMPLETE` wymaga wykonania zadań i przekazania promptu; nie oznacza automatycznie PASS w odbiorze graczy.

Jeżeli obowiązkowy test lub wymagane zadanie nie zostały wykonane, raport określa wpływ. Gdy to uniemożliwia przyjęcie zakresu, pakiet pozostaje INCOMPLETE/BLOCKED i następny prompt kontynuuje ten sam pakiet. Można wcześniej wykonać niezależne części, ale nie ukrywać braków przez oznaczenie całego pakietu COMPLETE. Odbiór PLAYABILITY nie jest wymagany w PKG-001; tam oceniamy działający fundament, nie przyjemność ze skoku.

Na końcu PKG-035 prompt wskazuje rzeczywiście pozostały odbiór użytkownika lub publikację wymagającą osobnego polecenia. Jeśli cała praca jest ukończona, opisuje stan wydania i brak dalszych zadań implementacyjnych. Nie wymyśla kolejnych funkcji tylko po to, aby istniał następny pakiet.
