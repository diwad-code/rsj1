# Projekt gry — Retro Ski Jumping

Status: **DESIGN**, 2026-09-16. Wszystkie poniższe reguły opisują nowy produkt. Związki z pierwowzorem dokumentuje [research](research/SJ3_RESEARCH.md).

## 1. Obietnica gry

Pikselowe skoki narciarskie z boku: kilkoma klawiszami wyczuwasz wybicie, prowadzisz lot i podejmujesz ryzyko lądowania. Po krótkiej próbie od razu widzisz jej wynik i chcesz poprawić kolejny skok. Całe doświadczenie — od menu po puchar — wygląda i zachowuje się jak samodzielna gra z epoki DOS, z nową oprawą krajobrazów.

Docelowo komputer z klawiaturą, Windows/macOS/Linux przez współczesną przeglądarkę desktop. Główny scenariusz to pełny ekran. Wymuszenie fullscreen bez działania użytkownika nie jest możliwym wymaganiem produktu; Enter uruchamia go z ekranu tytułowego. Przy odmowie gra wypełnia okno.

## 2. Wymagania użytkownika i kryteria sukcesu

| ID | Wymaganie | Jak rozpoznamy spełnienie |
| ---| ---| ---|
| U01 | Nowy projekt od zera | Brak zależności od nieistniejącego poprzedniego kodu |
| U02 | Gra przeglądarkowa | Statyczny build działa pod HTTPS, bez instalacji dodatków |
| U03 | Fullscreen, forma gry DOS | Cała ścieżka klawiaturą, canvas wypełniający scenę, brak przewijanej strony |
| U04 | Maksymalna inspiracja SJ3 | Pełny cykl skoku, widok z boku, pięć akcji, wiatr, turnieje i hotseat |
| U05 | Pixelowa grafika pozostaje | Ostre sprite'y i fonty, kontrolowana siatka, brak rozmytego skalowania |
| U06 | Odnowione tła i kolorystyka | Własne krajobrazy, palety i hierarchia wizualna zweryfikowane w ruchu |
| U07 | Proste sterowanie klawiaturą | Pierwszy skok po krótkiej instrukcji; wszystkie menu dostępne bez myszy |
| U08 | Research, dokumentacja, pełny plan | Niniejszy pakiet, źródła i zadania z dowodami odbioru; bez implementacji w tej dostawie |
| U09 | Współczesne zasady i rzeczywisty wygląd oznaczeń skoczni | Punktacja długości/stylu/wiatru/belki, K/HS i linie zgodne z datowanymi źródłami FIS; testy liczbowe i wizualne |
| U10 | Wyższa rozdzielczość, bardziej szczegółowa i realistyczna grafika przy zachowaniu pixel artu | Roboczo 960×540; wiarygodna geometria i otoczenie, świadomie rysowane piksele, kontrola czytelności w ruchu |
| U11 | Po każdym pakiecie prompt dla nowej sesji wykonującej kolejny pakiet | Obowiązkowy raport, aktualny stan, sprawdzony zakres następnej sesji i zapis promptu zgodnie z PACKAGE_WORKFLOW.md |
| U12 | Prosta realizacja, oszczędność czasu i tokenów, review wyłącznie po całym pakiecie | Jedno końcowe review, celowane testy, brak zbędnych abstrakcji i powtarzania audytów; reguła w AGENTS.md |

## 3. Filary

1. **Opanowanie umiejętności.** Wynik poprawia timing i kontrola, nie statystyka kupionego sprzętu. Model skoku jest wspólny dla każdego profilu.
2. **Ryzyko czytelne w locie.** Gracz widzi teren, skoczka i wiatr; dostrzega konsekwencję złego wybicia. Lądowanie ma dwa sensowne warianty.
3. **Krótka droga do następnej próby.** Trening pozwala ponawiać skok jednym klawiszem z ekranu wyniku. Zawody zachowują napięcie przez tabelę i kolejność startów.
4. **Gra zajmuje ekran.** Ustawienia, profile i wyniki należą do jednego interfejsu. Żadnych sekcji marketingowych, paska nawigacyjnego strony czy kart udających aplikację SaaS.
5. **Nowa oprawa przy zachowanym języku pikseli.** Wyższa rozdzielczość i bogatsze detale są pożądane. Realizm wynika z proporcji, kompozycji, materiałów, światła i ruchu; pikselowa siatka pozostaje widoczna. Punkt startowy to 960×540, większy sprite skoczka i osobno rysowane fazy ruchu. Nie rozmywamy nart i progu.

## 4. Główna pętla

```text
WYBÓR TRYBU → PROFIL / SKOCZNIA → BELKA I WIATR
    → ROZBIEG → WYBICIE → LOT → LĄDOWANIE
    → DŁUGOŚĆ + NOTY + KOMENTARZ
    → POWTÓRZ albo TABELA → KOLEJNY ZAWODNIK / KONKURS
```

Przed skokiem potrzebna jest decyzja o starcie, w skoku precyzja, po skoku zrozumiały rezultat. Domyślnie nie ma miernika „naciśnij teraz” podczas zawodów. W treningu opcjonalna pomoc nie zastępuje samodzielnego wybicia.

## 5. Zakres etapów

| Etap | Zawartość | Czego dowodzi |
| ---| ---| ---|
| Prototyp rdzenia | Jedna robocza K120/HS134, pięć akcji, wiatr, oba lądowania, współczesne punkty długości/stylu, retry; oznaczenia techniczne z danych | Czy skakanie jest czytelne i daje przestrzeń do nauki; pełne kompensaty i produkcyjne linie dochodzą w P13–P14 |
| Wersja podstawowa (MVP) | Cztery współczesne obiekty normalne/duże/mamucie, trening, pojedynczy konkurs, 1–10 graczy, AI, zapis, replay, rekompensaty, reprezentatywna oprawa | Czy cała mała gra działa i jest warta rozbudowy |
| Pełne v1 | 20 skoczni, puchar sezonowy, własny kalendarz, turniej czterech skoczni, drużyny czteroosobowe i Super Team, King of the Hill; profile, rekordy, statystyki, audio, offline | Kompletny produkt zgodnie z dokumentacją |
| Po v1 | Edytor geometrii, zewnętrzne paczki skoczni, ewentualna dystrybucja społecznościowa | Rozszerzenia, których v1 nie potrzebuje do spełnienia obietnicy |

Pełne v1 **nie oznacza wyłącznie MVP**. Wszystkie tryby z trzeciego wiersza są częścią planu. Edytor skoczni jest świadomie odłożony; własny kalendarz z gotowych 20 obiektów jest w v1.

## 6. Rozgrywka i trudność

Domyślny profil zasad `Modern 2026.1`: współczesne reguły sportowe opisane w [specyfikacji](GAMEPLAY_SPEC.md), z punktami za długość, notami oraz rekompensatami za wiatr i belkę. Bazą są ICR June 2026 oraz regulamin Pucharu Świata mężczyzn 2026/27, dostępne w dniu researchu. Wybór tego formatu zawodów nie ogranicza płci lokalnych profili. Oznaczenia K i HS są odrębne; linie muszą wynikać z geometrii, nie z dowolnej dekoracji.

To gra o współczesnych skokach z autorską fizyką sterowaną pięcioma akcjami. Reguły punktowe mają odpowiadać źródłom, natomiast aerodynamiczny model 2D oraz automatyczny sędzia są adaptacjami gry. Nie deklarujemy licencji FIS ani homologacji cyfrowych obiektów.

Trzy trudności AI: Łatwa, Normalna, Trudna. Zmieniają jakość decyzji botów, nie współczynniki człowieka. W treningu dostępne: stały wiatr, regulacja belki, pokaz pomocy wybicia i ślad poprzedniego skoku. Wyniki wspomagane są oznaczone i oddzielone od rekordów konkursowych.

Brak rozwijania parametrów skoczka, ekonomii, zakupów sprzętu, urazów wykluczających na wiele konkursów i ukrytej premii za porażki. Uraz w oryginale jest udokumentowaną funkcją; rezygnacja z niego w v1 to decyzja ograniczająca frustrację oraz zakres.

## 7. Zawodnicy i rywalizacja

Lokalne profile zawierają nazwę, kolory stroju/nart, statystyki i bindy gracza. Do konkursu wybiera się 1–10 profili; uczestnicy wymieniają się klawiaturą. Ekran przekazania sterowania pokazuje duży podpis następnego gracza i wymaga nowego naciśnięcia Enter.

Pełna stawka ma 75 miejsc, ludzie zastępują boty. AI korzysta z tego samego modelu skoku i składa wynik przez te same funkcje. Szybkie przewijanie botów przyspiesza obliczenia, a nie zmienia ich rezultaty. Nazwy botów są autorskie/fikcyjne; nie planuje się współczesnej bazy realnych sportowców.

Motywacja długofalowa: rekord na każdej skoczni, lepszy wynik sezonu, powtórka udanego lotu, zmienne warunki i rywalizacja na kanapie. Nie projektujemy systemu codziennych obowiązków ani kont internetowych.

## 8. Pierwsze 10 minut

1. Ekran tytułowy: Enter — pełny ekran; informacja, że można grać również w oknie.
2. Szybki trening z domyślnym profilem; pięć akcji pokazanych na jednym ekranie.
3. K120 przy łagodnym stałym wietrze. Podpowiedzi kolejno dotyczą startu, wybicia, korekty i lądowania.
4. Ekran wyniku: długość, noty, jeden najważniejszy błąd. Enter — następna próba, P — replay.
5. Po kilku próbach propozycja wyłączenia pomocy lub udziału w konkursie. Brak blokady wejścia do innych trybów.

Rzeczywisty czas nauki trzeba zmierzyć z graczami. „10 minut” jest scenariuszem badania, nie obietnicą, że każdy osiągnie ten sam poziom.

## 9. Dźwięk i emocje

Rozbieg: narastający ślizg. Próg: krótki impuls. Lot: powietrze i stłumiona publiczność. Kontakt: czytelna różnica między telemarkiem, lądowaniem równoległym i upadkiem. Rekord: krótki sygnał oraz powściągliwa animacja wyniku. Muzyka głównie w menu; dźwięk nie może być jedynym nośnikiem niezbędnej informacji.

## 10. Wyłączenia zakresu v1

Sieciowy multiplayer, globalna tabela wyników, backend, konta, płatności, gra myszą w stylu DSJ, fizyka 3D, dotykowy port mobilny, symulowanie całej administracji FIS (licencje zawodników, protesty, badania sprzętu), import SJH/SJR, emulator DOS, dokładna kopia grafiki lub kodu SJ3, kariera menedżerska. Ich dodanie wymaga osobnej decyzji i planu. Punktacja i oznaczenia według współczesnych źródeł pozostają obowiązkowe.

## 11. Definition of Done produktu

Pełny zestaw 20 skoczni i wszystkich trybów v1; brak placeholderów na normalnej ścieżce gracza; menu, gra i zapis działają klawiaturą; testy reguł i przeglądarek przechodzą; reprezentatywne skoki obejrzane w ruchu; odbiór grywalności posiada rzeczywiste obserwacje graczy. Build działa z podkatalogu, a instrukcja publikacji i kopii zapisów jest gotowa. Aktualne dowody i znane ograniczenia trafiają do dokumentacji wydania.

Zaliczenie kompilacji nie zastępuje oceny grafiki, czytelności ani przyjemności z gry. Szczegóły w [QA](QA_ACCEPTANCE.md).

Praca odbywa się pakietami sesyjnymi według [PACKAGE_WORKFLOW.md](PACKAGE_WORKFLOW.md). Pierwszy pakiet to P01–P04; cały prototyp P01–P12 zajmuje trzy pakiety. Każdy pakiet kończy się przeglądem, raportem i gotowym promptem następnej sesji. Samo ukończenie kodu nie zamyka pakietu bez przekazania kontekstu.
