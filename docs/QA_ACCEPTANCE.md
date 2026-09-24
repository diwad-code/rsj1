# Weryfikacja i odbiór

Ten dokument opisuje **przyszłe sprawdzenia**. Żadnego testu gry nie wykonano w dostawie dokumentacyjnej, ponieważ gra jeszcze nie istnieje. Odbiór dokumentów zapisano osobno w [raporcie weryfikacji](VALIDATION_REPORT.md).

## 1. Trzy osobne wyniki

`TECHNICAL` — reguły, dane i przebieg działają. `VISUAL` — pixel art, oznaczenia i interfejs są czytelne. `PLAYABILITY` — gracze rozumieją skok i chcą doskonalić wynik. Nie wolno przenosić PASS z jednej kategorii do pozostałych.

Statusy: PASS — wykonano i dowód spełnia kryterium; FAIL — wykonano i stwierdzono problem; NOT RUN — nie wykonano; BLOCKED — konkretna zależność uniemożliwia badanie. Nie nazywać brakującego playtestu PASS na podstawie opinii modelu.

**Proporcjonalność:** to katalog sprawdzeń dla całego projektu, nie lista do powtarzania w każdym pakiecie. Wybierz testy wymagane w aktywnym zakresie; współdziel scenariusze pokrywające kilka kryteriów. Bieżące testy i podgląd są częścią implementacji. Review wykonuj tylko raz po całym PKG; po naprawie wracaj do zmienionych ścieżek, nie do pełnego audytu. Zielonych testów nie powtarzaj bez nowej przyczyny. Pełna macierz platform i profilowanie pozostają w przypisanych zadaniach.

## 2. Niezmienniki rdzenia

| ID | Przypadek | Dowód i warunek |
| ---| ---| ---|
| Q-SIM-01 | Jeden seed/input trace przy renderze 30/60/120/144 Hz | Identyczne zdarzenia i wynik; bez dodatkowego impulsu |
| Q-SIM-02 | Przecięcie stoku przy maksymalnej prędkości | Kontakt w odpowiednim ticku; brak przenikania |
| Q-SIM-03 | Błąd wybicia w zakresie wczesny→idealny→późny | Udokumentowana krzywa, brak nieciągłej magicznej klatki |
| Q-SIM-04 | Równoczesne klawisze/autorepeat | Jedno wybicie; lewo+prawo neutralne; jawny wybór T/R |
| Q-SIM-05 | Lot po wyjściu z fullscreen/Alt-Tab | Pauza, zero nadrabiania, brak trzymanego klawisza po powrocie |
| Q-SIM-06 | Koniec po nieudanym lądowaniu | Poprawny wynik/status, zawsze możliwość przejścia dalej |
| Q-SIM-07 | Śnieg off/on i szybkie AI | Ta sama fizyka, wiatr i wynik |
| Q-SIM-08 | Maksymalna belka + wiatr, najkrótsza skocznia | Brak NaN/out-of-bounds, kontrolowany odjazd lub upadek |
| Q-SIM-09 | Keydown/keyup pomiędzy dwiema klatkami; znaczniki czasu przy 30/60/144 Hz | Krawędzie nie giną ani nie są zlane do jednej klatki; tick wynika z czasu zdarzenia |
| Q-SIM-10 | Upadek i zatrzymanie przed fall line | `FallSettled` kończy próbę; wynik i retry dostępne bez dotarcia do linii |
| Q-SIM-11 | Determinizm lądowania | Ten sam input / seed daje ten sam wynik ustania/upadku; brak ukrytej kości |

Testy symulacji zapisują stan początkowy, seed, wersje, input trace i skrót zdarzeń. Wektory testowe obejmują także brak wybicia, brak lądowania i utratę fokusu na granicy kontaktu.

## 3. Nowoczesne zasady sportowe

| ID | Co sprawdzić | Warunek |
| ---| ---| ---|
| Q-FIS-01 | Tabela pkt/m na wszystkich granicach K | Prawidłowy współczynnik; nieobsługiwane 165–179 odrzucone |
| Q-FIS-02 | K120 / 130 m oraz K200 / 210 m | Odpowiednio 78,0 i 132,0 pkt długości |
| Q-FIS-03 | Noty z duplikatami skrajnych | Usunięte dokładnie 2 noty, nie wszystkie równe min/max |
| Q-FIS-04 | Telemark/dwie nogi/upadek do fall line | Właściwa kategoria potrąceń; brak podwójnego naliczenia |
| Q-FIS-05 | Dodatni/ujemny wiatr | Odjęcie za pod narty, dodanie za w plecy, właściwy faktor |
| Q-FIS-06 | Belka jury i coach jednocześnie | Niespełniony coach threshold nie usuwa jury points |
| Q-FIS-07 | Kontakt tuż poniżej/na połówce metra | Obcięcie w dół; renderer linii i pomiar mają tę samą mapę |
| Q-FIS-08 | Próg 95% coach | Test tuż pod/równo/nad progiem źródłowym, decyzja tylko w red |
| Q-FIS-09 | Długi upadek 95% | Odległość skompensowana i właściwa grupa odniesienia; nie HS |
| Q-FIS-10 | Awans 50/40/30 + remisy | Prawidłowe rozszerzenie granicy standardowego konkursu |
| Q-FIS-11 | KO | Dokładnie 50 w kwalifikacjach, pary, odmienne reguły remisu kwalifikacji i pojedynku,25 + 5 |
| Q-FIS-12 | Team / Super Team | Grupy i awans 8 oraz 12→8; prawidłowa kolejność finału i suma |
| Q-FIS-13 | Puchar vs cztery skocznie | Punkty za miejsca versus suma punktów skoków; remisy |
| Q-FIS-14 | Serie anulowane | Brak sumowania nieukończonej serii; trening nie zmienia się w konkurs |
| Q-FIS-15 | Oficjalne rekordy | Brak aktualizacji dla treningu, DSQ, upadku, starych wersji zasad |
| Q-FIS-16 | Zmiana belki w żółtej fazie i panel otwarty jeszcze w czerwonej | Brak przyjęcia decyzji po przejściu do żółtego |
| Q-FIS-17 | Bardzo krótki skok i dodatnia/ujemna rekompensata | Kolejność ograniczenia wyniku do zera jawnie rozstrzygnięta w P13; bez nieudowodnionej reguły |
| Q-FIS-18 | Automatyczna belka jury a prognoza wiatru | Belka schodzi przy mocnym noszeniu / wchodzi przy plecach; kontrolne skoki na tej adaptacji trafiają w grywalny, bezpieczny zakres pod HS. |
| Q-FIS-19 | Trudność lądowania za HS | Deterministycznie narasta według jawnego TUNE karty danej skoczni; kontrolne odległości po obu stronach HS i progów. |
| Q-FIS-20 | Telemark vs równoległe; odległości niemożliwe | Przy tej samej dalekiej odległości telemark jest trudniejszy od równoległego; poza jawnym progiem gry upadek zawsze. |
| Q-FIS-21 | Zbyt wczesne przygotowanie do lądowania | Wyraźne skrócenie lotu względem lotu bez przedwczesnego przygotowania |
| Q-FIS-22 | Zbyt wczesne T | Rozstrzygnięcie w lądowanie równoległe albo upadek; brak pełnego telemarku z przedwczesnego wejścia |
| Q-FIS-23 | Bramka skoczni inspirowanej realną | K/HS zgadzają się z wybranym wariantem; pozostałe pola są uczciwie oznaczone ADAPT/TUNE, a skoki, AUTO, AI, linie, konkurs, zapis i replay sprawdzone. Brak pełnych statystyk FIS nie blokuje wejścia do gry. VISUAL ocenia użytkownik. |
| Q-FIS-24 | Rekord + 2 m na dwóch nogach | Dla rekordu z karty istnieje deterministyczny skok gracza co najmniej 2 m dalej, ustany równolegle bez podpórki. Przy zmianie timingu/pozycji/przygotowania na podobnym dystansie podpórka jest częstsza; test nie używa losowej kości lądowania. |

### Złote przykłady z dokumentów wynikowych

To gotowe oczekiwania do późniejszych testów, nie wynik działania gry. Pełne wiersze można ponownie sprawdzić pod linkami.

| Źródło / zawodnik | Długość pkt | Styl pkt | Belka pkt | Wiatr pkt | Suma |
| ---| ---:| ---:| ---:| ---:| ---:|
| F10 Fettner,138,0 m | 83,4 | 54,0 | +9,5 | −13,2 | 133,7 |
| F10 Kot,124,5 m | 59,1 | 52,5 | +4,8 | −4,2 | 112,2 |
| F10 Chervet,132,0 m | 72,6 | 50,5 | +4,8 | −16,4 | 111,5 |
| F11 Prevc,139,5 m | 95,1 | 55,5 | −7,6 | +7,9 | 150,9 |
| F11 Raimund,132,5 m | 82,5 | 54,0 | −7,6 | +11,3 | 140,2 |

Źródła: [F10 — Zakopane,10.01.2026](https://medias3.fis-ski.com/pdf/2026/JP/3112/2026JP3112RLQ.pdf), [F11 — Oberstdorf,28.12.2025](https://medias1.fis-ski.com/pdf/2026/JP/3103/2026JP3103RLQ.pdf). Dane z wierszy sprawdzają sumę, noty i długość; sam wyświetlany numer belki nie wystarcza do sprawdzenia przeliczenia na metry. Dodać niezależny fixture pozycji belek oraz pełny oficjalny przykład lotów w P13.

## 4. Linie i geometria — odbiór obowiązkowy

Dla każdej skoczni: obraz techniczny z punktami T/P/K/L/U, metrami i belkami; następnie ekran produkcyjny tej samej chwili. Porównanie potwierdza, że K/HS i każdy marker co 5 m mają tę samą pozycję. Pokazać także linie przy aktywnym celu prowadzenia, żeby wykryć pomylenie zielonych oznaczeń.

Wizualnie: widoczna biała powierzchnia stoku; czerwony pas przy brzegach, a nie całe pole; poprzeczne linie leżą na śniegu; HS i fall line osobne; marker rekordu nie wygląda jak HS. Pasy boczne mają właściwy zakres według danych. Śnieg/tryb nocny nie może ukrywać linii lub sprite'a.

## 5. Test przeglądarkowy

| Środowisko / sytuacja | Kryterium |
| ---| ---|
| Chromium i Firefox na Windows | Pełna ścieżka menu→skok→wynik→save→reload |
| WebKit automatyczny | Przebieg logiczny; nie zastępuje rzeczywistego Safari |
| Safari na Mac / Chrome na Linux | Ręczny fullscreen/audio/klawiatura; brak maszyny = NOT RUN z ograniczeniem wsparcia |
| 1280×720,1366×768,1920×1080,2560×1440,ultrawide | Bez scrolla/cięcia UI; stałe proporcje obrazu |
| DPR 1/1,25/1,5/2; zoom 100/125% | Ostry najbliższy sąsiad, opisany kompromis pikseli ułamkowych |
| Odmowa fullscreen / iframe bez pozwolenia | Działająca gra w oknie, bez zablokowania Enter |
| Blokada autoplay | Gra funkcjonalna, audio odblokowywane po nowej akcji |
| Nazwa z polskimi znakami/IME | Znaki zachowane; litery nie uruchamiają akcji gry |
| 10 profili hotseat | Właściwy gracz i bindy, brak przecieku klawiszy |
| Zamknięcie karty po wyniku | Jeden wynik i poprawne wznowienie |
| Dwie karty | Brak równoczesnego zapisu tej samej sesji |

Automatyzacja używa prawdziwych zdarzeń klawiatury do przejść i skoku. Debug setter może przygotować stan brzegowy, ale nie zastępuje testu użytkowej drogi. Zrzut na końcu testu nie jest dowodem, że cały scenariusz był sterowalny bez myszy.

## 6. Dane, wydajność i dystrybucja

Testy: uszkodzonyJSON, nieznana wersja, zbyt duży import, brak miejsca, przerwany zapis, migracja, eksport→import, rekord starej fizyki, zduplikowany resultId. Przy błędzie stare dane pozostają nienaruszone.

Benchmark nagrywa 60 s sceny z docelowym art i aktywnym wiatrem/śniegiem, serię szybkich botów oraz powtórne przejścia 20 skoczni. Zapisuje czasy klatek, użycie pamięci, długie zadania i urządzenie. Budżet p95/p99 ustala P15 na realnym sprzęcie; nie wpisywać PASS dla arbitralnego celu na nieznanej maszynie.

Dystrybucja: build pod `/` i podkatalogiem; brak 404 i wycieków debug; cache A→B; tryb offline po udanym pobraniu. Przy pierwszej wizycie całkowicie offline bez service workera/cache dopuszczalny jest błąd sieci samej przeglądarki. Gdy shell działa, lecz nie udało się pobrać assetów, gra pokazuje własny błąd i ponowienie. Build zawiera wyłącznie potrzebne assety, bez skilli, obrazów researchu, lokalnych zapisów i sekretów.

## 7. Playtest

Dwie rundy: po rdzeniu i przed wydaniem. Próba praktyczna: 3–5 osób, w tym ktoś znający SJ3 i ktoś nowy. To badanie jakościowe, nie reprezentatywna statystyka rynku. Jeśli osób brak, oznaczyć PLAYABILITY NOT RUN; można kontynuować niezależne naprawy techniczne.

Scenariusz po P12: bez ustnego tłumaczenia menu wejść do treningu; wykonać 10 prób; opisać przyczynę dwóch krótkich skoków i wybrać lądowanie. Nie wymagać w tym badaniu konkursu, pełnych kompensat ani replaya, bo powstają później. Scenariusz przed wydaniem dodaje konkurs, odczyt wpływu wiatru/belki, replay i porównanie poprawnych oznaczeń skoczni. Obserwować pomyłki klawiszy, moment zrozumienia wybicia, frustrację po upadku i chęć kolejnej próby. Nie podpowiadać odpowiedzi podczas obserwacji.

Pytania po sesji: „Co zdecydowało o wyniku?”, „Dlaczego wybrałeś lądowanie na dwie nogi zamiast telemarku?”, „Która linia oznacza HS?”, „Czy widziałeś skoczka przez cały lot?”, „Co chciałeś poprawić w następnej próbie?”.

Cele robocze: nowy gracz samodzielnie dochodzi do skoku; po kilku próbach potrafi wskazać zależność timingu i pozycji; różnica między lądowaniami jest czytelna; ktoś znający SJ3 rozpoznaje inspirację. Są to kryteria obserwacyjne, bez deklaracji „gra na pewno wciąga”.

## 8. Zamykanie pakietu i wydania

Pakiet PKG-NNN tworzy jeden `docs/evidence/PKG-NNN/REPORT.md` z wynikami zadań, istotnymi dowodami i sekcją „Końcowe review”. Podaj wykonane polecenia i wyniki, ścieżki screenshot/video/fixture, ograniczenia oraz poprawki. Nie powielaj tego samego tekstu w raportach Pxx i osobnym SELF_REVIEW.md. Dotychczasowe raporty zachowaj; ta zmiana ogranicza nowe obowiązki dokumentacyjne.

**Obowiązkowe po każdym pakiecie:** przygotować samodzielny prompt następnej sesji według [reguły pakietowej](PACKAGE_WORKFLOW.md), zachować go w `docs/handoffs/PKG-NNN.md` dla pakietu, który ma wykonać nowa sesja, oraz umieścić identyczną aktywną treść w `docs/NEXT_SESSION_PROMPT.md`. Bez tego pakiet nie jest zamknięty. Jeśli pozostała wymagana praca, prompt ma kontynuować ten sam pakiet i nie może przedstawiać go jako ukończonego.

Wydanie gotowe dopiero po zamknięciu wszystkich zadań v1, braku blockerów reguł i danych, rzeczywistym odbiorze oprawy oraz opisanym playteście. Brak finalnej nazwy/hostingu nie blokuje lokalnego pakietu gotowego do publikacji, ale nie wolno twierdzić, że gra została opublikowana.
