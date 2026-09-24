<!-- agent-ninja-START -->
## Agent Skills

> **IMPORTANT**: Prefer skill-led reasoning over pre-training-led reasoning.
> See [Agent Skills](.github/skills/README.md) before working on tasks covered by these skills.

<!-- agent-ninja-END -->

## Zasady projektu

**Twarda zasada użytkownika (23.09.2026): projekt prowadzimy bez Git.** Zapisuj zmiany bezpośrednio na dysku. Nie wykonuj żadnych poleceń Git, nie twórz ani nie odtwarzaj repozytorium czy konfiguracji Git; zakaz obejmuje także stage/commit/reset/restore/clean/push. Zmienić go może tylko nowe, wyraźne polecenie użytkownika. Historyczne użycie Git w starych raportach jest faktem z przeszłości, nie uprawnieniem do jego użycia. Nie korzystaj z plików Git zachowanych w nietykanym backupie.

Przed pracą przeczytaj `docs/README.md`, aktualny `docs/NEXT_SESSION_PROMPT.md` i `docs/PACKAGE_WORKFLOW.md`. Jeżeli katalog `.github/skills/README.md` nadal nie istnieje, użyj dostępnego katalogu `.agents/skills/`; nie twórz fikcyjnego opisu brakującego pliku.

Gra powstaje od zera jako aplikacja przeglądarkowa sterowana klawiaturą, z pełnym ekranem i interfejsem gry DOS. Inspiracją jest Ski Jump International 3. Współczesne zasady sportowe i oznaczenia skoczni oraz szczegółowy pixel art są wymaganiami użytkownika. Robocza rozdzielczość 960×540 nie jest niezmiennym historycznym ograniczeniem.

## Twarda zasada: prosta implementacja, jedno review, sprawne zamknięcie

**Robimy małą grę pixelową. Wybieraj najprostsze rozwiązanie, które daje dobry efekt i spełnia wymagania bieżącego pakietu. Nie buduj infrastruktury na zapas. Szanuj czas użytkownika i budżet tokenów.** Zasady dotyczą GPT-5.6 Sol i każdego kolejnego modelu. Są bezpośrednim poleceniem użytkownika i mają pierwszeństwo przed starszymi zaleceniami procesu w dokumentacji i skillach.

1. **Najpierw działający efekt.** Pisz małe, czytelne funkcje, zwykłe obiekty danych i potrzebne moduły. Nowa abstrakcja ma rozwiązywać konkretny obecny problem; „może się przydać” nie jest uzasadnieniem. Nie twórz frameworka do tworzenia tej gry.
2. **Bez overengineeringu.** Domyślnie bez ECS, kontenerów DI, globalnego event busa, systemu pluginów, uniwersalnych repozytoriów, wielowarstwowych adapterów, rozproszonego blokowania czy platformy testowej własnego autorstwa. Planowane zapisy, replay i fizykę realizuj bezpośrednio. Dodatkowa warstwa wymaga konkretnej potrzeby obecnego zadania.
3. **Tylko aktywny pakiet.** Nie implementuj przyszłych funkcji, nie twórz pustych modułów z całego drzewa architektury, nie refaktoryzuj poprawnego kodu poza zakresem. Nazwy i katalogi w planie są wskazówkami, nie obowiązkiem tworzenia osobnej klasy dla każdego pojęcia.
4. **Review tylko raz, po wykonaniu całego PKG.** Nie rób review po każdym pliku, Pxx ani małym kroku. Nie uruchamiaj dodatkowych audytów, drugiego pełnego review, review review ani agentów-recenzentów. Obejmij jednym końcowym przeglądem zmiany pakietu i jego kryteria.
5. **Testy i naprawy nie są rundą review.** W trakcie implementacji uruchamiaj potrzebne testy, build lub podgląd i od razu naprawiaj ujawnione błędy. Po końcowym review popraw konkretne usterki i sprawdź tylko zmienione ścieżki. Nie otwieraj ponownie audytu całego projektu. Istotnego błędu nie wolno zostawić z powodu limitu rund review.
6. **Zielony wynik kończy sprawdzanie.** Wykonaj wymagane dla pakietu sprawdzenia. Powtarzaj je tylko po istotnej zmianie, błędzie lub nowej obserwacji. Bez dodatkowych zestawów „dla pewności”, testów trywialnych kosmetyków, gonienia procentu pokrycia i pełnej macierzy przeglądarek przed przypisanym etapem.
7. **Krótka droga od lektury do kodu.** Przeczytaj obowiązujące instrukcje, aktywny prompt i potrzebne sekcje specyfikacji. Nie skanuj całej biblioteki skilli, nie czytaj ponownie historii audytów i nie powtarzaj zamkniętego researchu. Wybrany skill przeczytaj poprawnie, ale dobierz tylko te, które faktycznie pomagają zadaniu.
8. **Decyzje rutynowe podejmuj sam.** Korzystaj z przyjętego stosu i istniejących rozwiązań. Nie rozpisuj wielu alternatyw, gdy jedna wystarcza. Zależności dodawaj tylko do konkretnego problemu; optymalizuj po pomiarze lub w zadaniu, które tego wymaga. Nowy plan nie zastępuje realizacji istniejącego.
9. **Bez pętli narzędzi.** Łącz niezależne odczyty, zawężaj wyszukiwanie. Po dwóch identycznych nieudanych próbach bez nowej informacji zmień metodę albo nazwij blokadę i wykonaj niezależną pracę; nie powtarzaj tej samej próby w nieskończoność. Domyślnie pracuj jednym modelem, bez delegowania i rad recenzentów, chyba że użytkownik wyraźnie zleci pracę wieloagentową.
10. **Lekka dokumentacja.** Jeden krótki raport pakietu z tabelą statusów zadań, wynikami sprawdzeń i sekcją końcowego review. Zapisuj potrzebne dowody, nie kopie tego samego opisu w wielu plikach. Aktualizuj tylko dokumenty, których fakty się zmieniły; brak nowej decyzji nie wymaga ADR ani nowej procedury.
11. **Warunek zatrzymania jest konkretny.** Gdy zakres działa, wymagane sprawdzenia są zaliczone, jedno review zamknięte, a następny prompt zapisany — zakończ pakiet. Nie szukaj dodatkowej pracy. Niewykonany test lub rzeczywistą blokadę ujawnij; nigdy nie zastępuj dowodu deklaracją PASS.

Prostota dotyczy wykonania. Nadal obowiązują dobry wygląd, czytelne sterowanie, prawidłowe zasady i linie skoczni, działający zapis oraz zakres produktu. Ograniczaj zbędną pracę, zachowując jakość efektu dla gracza.

## Twarda zasada: zamrożenie zawartości do czasu akceptacji oprawy

To bezpośrednie polecenie użytkownika z 16 września 2026 i ma pierwszeństwo przed mapą
pakietów oraz wcześniejszymi promptami. **Dopóki użytkownik nie zaakceptuje wyglądu,
animacji, sterowania i odczucia fizyki, nie powstaje żadna nowa zawartość.**

1. **Zamrożenie zawartości.** Zakaz dodawania nowych skoczni (H01–H20), trybów, sezonu,
   KO, drużyn i kolejnych ekranów, dopóki bramka V nie zostanie zaliczona akceptacją
   użytkownika. Dotyczy to także „przy okazji” i „to tylko dane”.
2. **Poziom odniesienia jest zewnętrzny i podzielony.** Obie gry są równorzędną inspiracją,
   ale odpowiadają za co innego (decyzja użytkownika z 16.09.2026):
   - **Ski Jump International 3** — kamera, sterowanie, widok z boku i czytelna sylwetka
     zawodnika w tym widoku;
   - **Deluxe Ski Jump 2** — dyscyplina palety i kontrastu, cień skoczka na śniegu,
     minimalny HUD oraz płynność i responsywność lotu;
   - **animacja ma być lepsza niż w obu** — więcej klatek i płynniejsze przejścia faz;
     to jedyny obszar, w którym świadomie przebijamy pierwowzory.

   Materiał referencyjny jest w `docs/research/reference-images/` (SJ3 640×400,
   DSJ2 320×200, z manifestem i sumami SHA-256). Ocena „wygląda dobrze” bez porównania
   ze zrzutem z tych gier nie jest dowodem. Prototypowa scena zbudowana z wielokątów
   nie spełnia wymagania U05. Uwaga: DSJ2 rysuje widok zza zawodnika, więc nie kopiujemy
   z niego dosłownie sprite'a skoczka — bierzemy paletę, kontrast, cień i minimalizm.
3. **To ma być prawdziwy pixel art.** Jedna jawna siatka pikseli, bitmapowy font, brak
   antyaliasingu, brak współrzędnych ułamkowych i brak wektorowego tekstu przeglądarki.
   Wyższa rozdzielczość techniczna nie zastępuje stylu; obecny render jest zbyt „gładki”
   i estetycznie nie do przyjęcia.
4. **VISUAL zalicza wyłącznie użytkownik.** Model nie może samodzielnie wpisać PASS
   w kategorii VISUAL ani uznać oprawy za zatwierdzoną. Samodzielne „zatwierdzenie skali
   artu” z P15 traci moc: było self-review bez odbioru użytkownika.
5. **Zasada prostoty nadal obowiązuje w wykonaniu, nie w jakości efektu.** Nie buduj
   frameworka do grafiki, ale nie zasłaniaj się prostotą, żeby zostawić placeholder.
   Czytelny skoczek z klatkami animacji, spójna paleta i kamera są wymaganiem, nie dodatkiem.
6. **Kolejność.** Najpierw P41 (empiryczny audyt z dowodami), potem P42 (przebudowa oprawy
   do akceptacji), dopiero po akceptacji P21 i dalsze obiekty.

## Twarda zasada: grywalne skocznie inspirowane realnymi (23.09.2026)

To nowsze bezpośrednie polecenie użytkownika zastępuje dla H01–H20 dawną
bramkę ścisłej, empirycznej rekonstrukcji z 19.09.2026. Poprzedni research
i raporty pozostają archiwalnym dowodem; nie blokują adaptacji grywalnej.

1. **K i HS muszą się zgadzać** z wybranym obiektem i wariantem. Pozostała
   geometria, belki, AUTO, trudność lądowania i AI mogą być parametrami
   **ADAPT/TUNE** dobranymi w symulacji do dobrego skakania. Zachowaj
   determinizm: ten sam input i seed dają ten sam wynik, bez ukrytego
   losowania rozstrzygającego lądowanie gracza.
2. **Uczciwy opis.** Nazywaj skocznię inspirowaną realnym miejscem; nie
   przedstawiaj jej jako wiernej kopii profilu ani homologacji FIS. Jeśli
   korzystasz z dokumentu lub statystyk, cytuj je i oddzielaj jego fakty
   od decyzji gry. Oficjalne PDF i pełna empiryczna krzywa upadków nie są
   już obowiązkową bramką wejścia do gry.
3. **Różnorodność oprawy.** Każda skocznia ma różnić się czytelnie
   sylwetką konstrukcji, detalami otoczenia i paletą kolorów; samo
   przemalowanie wspólnego tła nie wystarcza. Można inspirować się
   fotografiami realnego obiektu, ale nie trzeba. Nie kopiuj cudzych
   zdjęć do gry bez prawa użycia.
4. **Odbiór.** Sprawdź skoki, belki, oba lądowania, wiatr, konkurs, zapis,
   replay i linie K/HS z jednej mapy metrażu. Werdykt **VISUAL PASS**
   nadal może wydać wyłącznie użytkownik.
5. **Satysfakcja z rekordu.** Jeśli karta podaje prawdziwy rekord obiektu,
   gracz musi mieć możliwość ustania czystego lądowania **na dwie nogi**
   co najmniej 2 m dalej (dla H01: 107,5 → minimum 109,5 m). Na tak dalekim
   skoku zwykle pojawia się podpórka przy mniej dokładnym kontakcie, lecz
   istnieje powtarzalna, trudna ścieżka wejścia bez podpórki. To warunek
   testowany na każdym obiekcie, nie gwarancja ustania każdego skoku ani
   losowanie wyniku. Telemark nie jest wymagany do pobicia rekordu.

## Obowiązkowe przekazanie po każdym pakiecie

To bezpośrednia zasada użytkownika: **po wykonaniu każdego pakietu zadań napisz kompletny prompt dla nowej sesji, która wykona następny pakiet**.

1. Realizuj zakres aktywnego pakietu PKG-NNN z aktualnego promptu; Pxx to zadania, a nie numery sesji.
2. Dopiero po wykonaniu całego pakietu przeprowadź jedno końcowe auto-review; popraw konkretne problemy i wykonaj potrzebną weryfikację poprawek. Nie zaczynaj kolejnego pełnego przeglądu.
3. Zapisz raport, dowody i rzeczywisty stan zadań. Nie deklaruj testów ani odbioru graczy, których nie było.
4. Napisz prompt następnego pakietu w `docs/handoffs/PKG-NNN.md` i identyczną aktywną treść w `docs/NEXT_SESSION_PROMPT.md`. Zachowaj poprzedni prompt. Procedura i wymagane pola są w `docs/PACKAGE_WORKFLOW.md`.
5. Jeżeli pakiet jest niekompletny, napisz prompt kontynuacji tego samego pakietu z brakami; nie oznaczaj go jako zakończonego i nie pomijaj zależności.
6. W odpowiedzi końcowej podaj wynik pakietu, ważne ograniczenia i link do promptu. Bez tego przekazania pakiet nie jest zamknięty.

Nie zaczynaj kolejnego pakietu w tej samej sesji, chyba że użytkownik wyraźnie tak poleci. Zachowuj istniejące skille, konfiguracje i cudze zmiany. Nie publikuj projektu ani nie wysyłaj wiadomości do osób trzecich bez polecenia użytkownika.
