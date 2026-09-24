# Specyfikacja rozgrywki i zasad

Profil docelowy: **Modern 2026.1**. Zasady sportowe: [FIS i rejestr źródeł](research/MODERN_SKI_JUMPING.md). Model ruchu, kontroler AI i sposób przekładania ruchu 2D na noty są autorską adaptacją. Każda zmiana wpływająca na wynik podnosi `physicsVersion`, `rulesVersion` lub `hillVersion`.

## 1. Akcje i klawiatura

| Kontekst | Klawisz domyślny | Akcja |
| ---| ---| ---|
| Menu | Strzałki, Enter, Backspace | Wybór, zatwierdzenie, powrót |
| Ekran tytułowy | Enter | Uruchomienie fullscreen i audio, potem menu |
| Czerwona faza | G | Panel decyzji o obniżeniu belki trenera; opcjonalna czynność przed skokiem |
| Zielone światło | → | Opuszczenie belki |
| Rozbieg | ↑ | Jednorazowe rozpoczęcie wybicia |
| Lot | → / ← | Pochylenie do przodu / cofnięcie |
| Lot | T / R | Przygotowanie telemarku / lądowania na dwie nogi |
| Trening / GateGreen (siedzenie na belce) | `[` / `]` | Zmiana belki w tej samej próbie; manual do kolejnych prób tej sesji, nowa sesja znów AUTO; w menu no-op |
| Aktywny trening (także pauza) | Backspace | Powrót do menu jednym naciśnięciem |
| Gra | P | Pauza/wznowienie po nowym naciśnięciu |
| Gra | Esc | Pauza lub wyjście z fullscreen przez przeglądarkę; nigdy utrata konkursu |
| Globalnie poza wpisywaniem tekstu | F | Przełączenie fullscreen; po Esc ponowne wejście do fullscreen |
| Wynik treningu | Enter / P | Następna próba / replay |
| Replay | Spacja, ←/→, +/−, Backspace | Pauza, krok/przewijanie, tempo, powrót |

Pięć akcji w skoku pozostaje zgodnych z prostotą SJ3. Menu trenera nie jest nowym przyciskiem wymaganym w locie. W ekranie nazwy `T`, `R`, `G`, `F`, `P` wpisują tekst, a nie sterują grą. Bindy są remapowalne; domyślna nawigacja ratunkowa zawsze dostępna.

Akcje start/wybicie/lądowanie reagują na nowe wciśnięcie, ignorują auto-repeat. Pochylenie jest stanem ciągłym. Równoczesne lewo+prawo = brak korekty. Przy T+R w tym samym ticku wygrywa R jako bezpieczniejszy wariant (ADAPT). Zmiana z telemarku na R przed kontaktem jest dozwolona, lecz nie resetuje czasu przygotowania; powrót do T nie może natychmiast odtworzyć pełnego telemarku. Reset klawiszy przy zmianie ekranu, pauzie, blur i ukryciu karty. Zdarzenie rozpoczynające fullscreen nie przechodzi do kolejnego ekranu jako Enter.

## 2. Maszyny stanów

```text
Title → Menu → Setup → Handover → GateRed → GateYellow → GateGreen
                                                   ↘ GateRed (brak zgody)
GateGreen → Inrun → Takeoff → Flight → LandingPrep → Contact
                                                 ↘ Contact bez przygotowania
Contact → Outrun → FinishLine → Result → Ranking / Retry
Contact → Fall → FallSettled → Result → Ranking / Retry
Outrun → Fall → FallSettled → Result → Ranking / Retry
Dowolny aktywny stan → Paused → ten sam stan po świadomym wznowieniu
```

`Takeoff` może rozpocząć się przed progiem, ale po oderwaniu nie można ponowić impulsu. Przekroczenie progu bez ↑ prowadzi do pasywnego lotu. `Contact` jest zdarzeniem, `Outrun` etapem trwającym do fall line. Wynik zostaje zatwierdzony dopiero po zakończeniu oceny odjazdu albo rozliczeniu upadku. `FallSettled` kończy próbę po ustaniu ruchu lub po ograniczonym czasie animacji upadku (roboczo maksymalnie 3 s aktywnej symulacji); nie wymaga dotarcia do fall line. Zawodnik zatrzymany wysoko na stoku również musi trafić do wyniku. Upadek po przekroczeniu fall line nie zmienia zatwierdzonych not. Timeout, rezygnacja i nieprawidłowy start mają osobne statusy, nie są skokiem długości 0 z pięcioma udawanymi notami.

## 3. Model ruchu — do strojenia

Jednostki SI: metry, sekundy, m/s, radiany. Układ świata: x w prawo, y do góry. Renderer odwraca y. Stały krok `dt=1/120 s` (TUNE), integracja semi-implicit Euler. Czas renderowania nie wpływa na rezultat.

Rozbieg: ruch po krzywej parametryzowanej długością łuku, przyspieszenie od grawitacji po stycznej oraz tarcie/opór. Belki mają rzeczywiste pozycje na rozbiegu. Nie nadawać zawodnikowi arbitralnego `vxFinal`, które niweluje zmianę belki. Prędkość wyświetlana = m/s ×3,6.

Wybicie: skończony w czasie impuls nóg działający, gdy narty mają kontakt z torem. Maksymalną skuteczność daje właściwe pokrycie fazy prostowania z końcem stołu. Za wcześnie: straty i niekorzystny pitch; za późno: mało efektywnego impulsu. Zwykły timing jest ciągły, bez magicznej klatki — nałożone jest na niego jawne, wąskie pasmo idealne (decyzja użytkownika, runda 16): okno ±1 tick przy 120 Hz (trzy dyskretne momenty wejścia) dokłada jednorazowy popęd normalny 18 N·s (~+0,28 m/s), bez dopisku do odległości i bez przesuwania kolizji; przytrzymanie ani spam go nie mnożą. Sygnalizuje je zdarzenie `perfectTakeoff` (lekki rozbryzg śniegu na progu). Nie dodawać automatycznego wybicia przy progu w konkursie.

Lot: `vAir = vJumper − vWind`; opór przeciwny do `vAir`, siła nośna prostopadła; ich wartości zależą od `0,5 × rho × speed² × area × coefficient`. Współczynniki CL/CD są ograniczonymi krzywymi pozycji i kąta natarcia, z pogorszeniem przy nadmiernym pochyleniu. Gracz wpływa na docelowy pitch i jego tempo; wiatr może wywołać łagodną zmianę pitch. To model gry, bez deklaracji aerodynamicznej dokładności rzeczywistego zawodnika.

Parametry do eksperymentu: czas wybicia 0,16–0,26 s; maksymalna prędkość korekty 35–70°/s; przygotowanie telemarku 0,20–0,35 s, równoległego 0,12–0,22 s. To **przedziały poszukiwania TUNE**, nie dane SJ3/FIS ani wartości ostateczne. Każdy test zapisuje rzeczywisty zestaw parametrów.

Kolizja: przecięcie przebytego w ticku odcinka punktów nart/stóp z profilem, a nie tylko test ostatniej pozycji. Wykrycie czasu pierwszego kontaktu zapobiega przelatywaniu przez stok. Kontakt uwzględnia nachylenie i normalną stoku. Przy ryzyku lądowania oceniamy prędkość normalną, różnicę kąta nart do powierzchni, gotowość pozycji i stabilność. Nie ma losowego upadku przy identycznym stanie wejściowym.

Telemark zwiększa wymagania stabilności i daje możliwość wyższych not; dwie nogi łatwiej amortyzują duży kontakt. Brak przygotowania prowadzi do utraty kontroli/upadku. Za HS trudność lądowania rośnie progresywnie z odległością; telemark jest trudniejszy niż lądowanie równoległe, a dostatecznie dalekie odległości są niemożliwe do ustania. Progi ustania i upadku są deterministyczne dla danego stanu wejściowego i kalibrowane empirycznie dla każdej skoczni (reguła 19.09.2026); brak ukrytej kości przy lądowaniu gracza. Zbyt wczesne przygotowanie do lądowania wyraźnie skraca lot; zbyt wczesne T rozstrzyga się w lądowanie równoległe albo upadek. Sterowanie nie może po kontakcie wydłużać zmierzonego skoku. Dalszy odjazd rozstrzyga dodatkowe potrącenia aż do fall line.

## 4. Wiatr i belka

Wartość użytkowa wiatru: dodatnia = pod narty, ujemna = w plecy; dodatkowo tekst/strzałka. W fizyce x dodatnie w kierunku lotu, więc wiatr pod narty ma ujemne `windVelocityX`. Zapisać obie konwencje przy adapterze, żeby nie odwrócić rekompensaty.

Wiatr składa się ze zmiennego bazowego pola i gładkich podmuchów wzdłuż skoczni. Model `pkg008-wind-4` jest wspólny dla treningu i serii: tło max ±0,20 wygasa do 0 przy 1,5 m/s; od 1,5 m/s brak zmiany kierunku; deterministyczne sloty 2 s, p=0,04+0,56*s, amplituda=0,15+0,55*s, limit ±3,2; podmuch to ±5,2° efektywnego targetPitch przy ciele nadal 20°/s, więc gracz może kontrować. Brak losowania lądowania. Osobny seed dla wiatru, AI i efektów wizualnych. Warunki nie zależą od tego, czy oglądamy skok bota, czy go przewijamy. Podczas pauzy nie płynie czas symulacji ani wiatru. `PhysicsVersion pkg008-tune-9`.

Wirtualne punkty pomiarowe i ich wagi są danymi skoczni. `compensationWind` to wynik jawnie określonego agregatora pomiaru, a nie ostatnia wartość HUD. Początkowy agregator: średnia ważona czujników aktywnych od wybicia do pomiaru odległości; okno i wagi zapisane w wersji zasad. **ADAPT:** nie deklarować zgodności algorytmu próbkowania z aparaturą FIS bez osobnego źródła. Punkty liczone według właściwego znaku i współczynników; kalibrację sprawdzić na seriach seedów.

Jury dobiera bazową belkę przed konkursem i może ją zmienić między zawodnikami. Automatyczne jury dostosowuje belkę także do prognozy wiatru, celując w bezpieczne odległości dla danej skoczni (docelowy poziom z kalibracji empirycznej 19.09.2026). Wersja podstawowa używa łagodnego modelu warunków i ograniczonego zestawu zmian; brak „karania” lepszej próby człowieka natychmiastową zmianą fizyki. Każda zmiana ma wpis: przyczyna, jury/coach, stara i nowa długość rozbiegu, referencja serii.

Trener może wyłącznie obniżyć belkę względem jury, w czerwonej fazie. Edycję i zatwierdzanie zamyka już przejście z czerwonego do żółtego; zatwierdzenie otwartego panelu w żółtej lub zielonej fazie jest odrzucane. Powrót procedury do czerwonego może ponownie otworzyć tę możliwość. W treningu ręczna zmiana belki `[` / `]` działa tylko podczas siedzenia na belce (`jump` + `GateGreen`, ta sama próba/seed/AUTO proposal); po powrocie do menu nowa sesja znów startuje z AUTO. Próg 95% HS dla decyzji trenera jest osobnym parametrem `coachGateThresholdHalfMeters`, przypiętym do dokumentu obiektu. **Rozstrzygnięcie P13:** `floor(HS × 0,95 × 2)` w połówkach metra, zgodnie z oficjalnymi nagłówkami HS137→130,0; HS140→133,0; HS142→134,5; HS235→223,0. To nie jest reguła skompensowanej długości długiego upadku z P16 ani formatowanie HUD.

## 5. Punktacja

Wszystkie wartości poniżej są kontraktem nowego profilu Modern z referencjami do F02/F03/F06/F07. Arytmetyka wyniku używa liczb całkowitych w dziesiątych punktu; odległość przechowujemy w połówkach metra. UI formatuje przecinek dziesiętny, rdzeń nie operuje tekstami. Live HUD zaokrągla bieżącą odległość do 0,5 m (`Math.round(m*2)/2`); oficjalny wynik nadal obcina w dół do 0,5 m.

### 5.1 Długość

`distancePoints = basePoints + (distance − K) × meterValue`.

| K [m] | pkt/m | Baza w K |
| ---| ---:| ---:|
| 20–24 / 25–29 / 30–34 | 4,8 / 4,4 / 4,0 | 60 |
| 35–39 / 40–49 / 50–59 | 3,6 / 3,2 / 2,8 | 60 |
| 60–69 / 70–79 / 80–99 | 2,4 / 2,2 / 2,0 | 60 |
| 100–134 / 135–164 | 1,8 / 1,6 | 60 |
| Mamucie, K≥180 | 1,2 | **120** |

Podstawa: F02 §433.2 i wyjątek §454.4.4 dla lotów. Zakres K165–179 nie jest zdefiniowany w odczytanej tabeli: walidator odrzuca taki rekord danych v1 zamiast zgadywać. Żaden planowany współczesny mamut nie potrzebuje historycznego K175 z SJ3.

Odległość pochodzi z mapy pomiarowej skoczni `distanceAtSurfacePoint`, nie z poziomego x ani z odległości euklidesowej jak w SJ3. Mapa ma monotoniczne punkty kalibracyjne odpowiadające metrom wzdłuż zeskoku i metodzie opisanej w F02 §415.1. Pomiar kontaktu: normalnie punkt między stopami przy prawidłowym zetknięciu; przy upadku pierwszy kontakt ciała. F07: wynik obcinany w dół do 0,5 m. K/HS, kreski i rekord korzystają z tej samej mapy.

### 5.2 Styl

Pięć not 0–20 co 0,5; odrzucamy dokładnie jedną najwyższą i jedną najniższą, także gdy wartości się powtarzają. Automatyczni sędziowie widzą ten sam dziennik błędów, mają pięć deterministycznych profili czułości. Brak losowania „szczęśliwych” not.

Potrącenia za lot, lądowanie, odjazd są rozłączne kategorycznie, zgodnie z F06; zdarzenie nie może dwukrotnie odjąć tej samej kary. Brak telemarku jako pojedynczy błąd: 3,0 u każdego sędziego. W pełni czysty skok równoległy ma więc najwyżej 17,0 u sędziego, czyli 51,0 za styl. Upadek do fall line: kara odjazdu 7,0, ponadto tylko rzeczywiście niezależne błędy wcześniejszych faz. Progi detekcji drżenia, złej sylwetki i zbyt późnego przygotowania są ADAPT/TUNE.

### 5.3 Wiatr i belka

`windPoints = −headwindMean × headFactor` dla wiatru pod narty; `+abs(tailwindMean) × tailFactor` dla wiatru w plecy. Współczynniki w pkt/(m/s), osobne dla obu kierunków i każdego obiektu.

`juryGatePoints = (referenceInrunMeters − juryInrunMeters) × gateFactor`.

`coachGatePoints = (juryInrunMeters − actualInrunMeters) × gateFactor`, tylko gdy spełniono warunek odległości dla decyzji trenera. Suma dwóch członów chroni przed wyzerowaniem należnej rekompensaty jury przez nieudany próg trenera. Gate factor w **pkt na metr długości rozbiegu**, nie pkt na numer belki; przeliczenie wymaga pozycji belek w danych.

**Rozstrzygnięcie P13 dla Modern 2026.1:** każdy człon rekompensaty zaokrąglamy do 0,1 pkt metodą half-away-from-zero (`+0,05→+0,1`, `−0,05→−0,1`), bez `Math.round`. Kolejność: `collective=max(0,długość+styl)` zgodnie z F02 §433.3, następnie dodanie wiatru, jury i zaakceptowanego coach, następnie `total=max(0,collective+rekompensaty)`. Ostatni clamp jest jawną polityką MVP/ADAPT dla skrajnego przypadku bez opublikowanego ujemnego wiersza; nie jest przedstawiany jako dodatkowy cytat FIS. Pięć wierszy Zakopane/Oberstdorf i pełny wiersz lotów Kulm sprawdzają znaki, faktory i zwykłą sumę. DSQ/DNS pozostają statusami, nie ujemnymi wynikami.

### 5.4 Wektory kontrolne

| Przypadek | Oczekiwany wynik |
| ---| ---|
| K120, 130 m, współczynnik 1,8 | 78,0 pkt długości; to nie historyczne 75,0 |
| K90, 95 m | 70,0 pkt długości |
| K200, 210 m, loty | 132,0 pkt długości |
| Noty 18,0;18,5;19,0;18,5;18,0 | 55,0 pkt stylu |
| K120/130 m, powyższy styl, wiatr+1,0 z headFactor 10, jury+4,0 | 127,0 pkt łącznie; dane współczynników syntetyczne |
| Coach threshold=127,0; pomiar 126,5 i 127,0 | Brak / przyznanie składnika coach, jury bez zmian |
| Kontakt 132,49 /132,50 | 132,0 /132,5 m |

Oprócz wektorów syntetycznych P13 odtwarza co najmniej pięć pełnych wierszy oficjalnych wyników, obejmując dodatni/ujemny wiatr, jury i loty. Liczby źródłowe muszą być zapisane obok oczekiwań testu.

## 6. Formaty zawodów

**Referencja:** WC Men 2026/27, F03 §3 i §4.3. Bazowy produkt nie odtwarza krajowych kwot, administracji federacji i wyjątkowej kwalifikacji do finału rzeczywistego sezonu. To jawnie autorski puchar z nowoczesnym regulaminem konkursu.

| Tryb | Uczestnicy / przebieg | Wynik |
| ---| ---| ---|
| Trening | 1 aktywny profil, dowolne powtórzenia, ustawienia warunków | Statystyki treningowe, brak rekordu konkursowego |
| Konkurs standardowy | Pula 75, kwalifikacje do 50; mamut do 40; następnie finał 30 | Suma dwóch konkursowych skoków |
| Szybki lokalny | 1–10 ludzi, opcjonalne AI; dwie serie bez kwalifikacji | Wariant rozrywkowy, osobny znacznik formatu |
| Puchar sezonowy | 20 konkursów; dostępny zapis pomiędzy próbami | Punkty pucharowe, nie suma metrów |
| Własny kalendarz | 1–40 konkursów z biblioteki; można powtarzać obiekt | Oddzielna tabela konkretnego zestawu |
| Cztery skocznie | Cztery konkursy KO; 50→25 zwycięzców+5 przegranych | Suma punktów skoków czterech konkursów |
| Drużynowy | Czterech zawodników, dwie serie; finał najlepszych 8 ekip | Suma skoków; kolejność grup finału aktualizowana |
| Super Team | Dwóch zawodników; wszyscy→12→8 ekip w trzech seriach | Suma wszystkich zaliczonych skoków |
| King of the Hill | 2–10 graczy i/lub boty; ostatni odpada | Rozrywkowa eliminacja, nowoczesna punktacja skoku |

Remisy w standardowym konkursie zwiększają stawkę na granicy awansu. Reguła długiego upadku daje dodatkowy awans przy ≥95% najdłuższej **skompensowanej odległości** zawodników podlegających danemu awansowi; to nie warunek 95% HS dotyczący trenera. **Rozstrzygnięcie P16:** podstawą jest `d+(windPoints+juryGatePoints+coachGatePoints)/meterValue`, gdzie składowe punktowe są już oficjalnie zaokrąglone do 0,1 pkt przez profil P13. ICR §422.14 oraz WC Men 2026/27 §4.3.1 wymagają relacji „has reached 95%” i nie ustanawiają dodatkowego zaokrąglenia długości skompensowanej. Rdzeń porównuje więc dokładny ułamek przez mnożenie całkowite (`candidate×100 ≥ longest×95`), bez konwersji do tekstu lub połówki metra. Grupą odniesienia w autorskim konkursie bez prekwalifikowanych jest pełna lista startowa aktualnej kwalifikacji/serii; DNS/NPS/DSQ/rezygnacja nie dostarczają fikcyjnej długości.

KO: dokładnie 50 w kwalifikacjach, bez powiększenia tej listy; pary 26–25,27–24,…50–1. Remis kwalifikacji: wyższy numer startowy; remis pojedynku: niższy. Lucky losers według pełnego wyniku; finał może powiększyć remis graniczny/upadek zgodnie z F03. Dwa statusy DNS/DSQ w parze nie tworzą zwycięzcy z zerowym skokiem — uzupełnienie z najlepszych przegranych. W finale kolejność odwróconego wyniku pierwszej serii.

Punkty sezonu indywidualnego za miejsca 1–30:
`100,80,60,50,45,40,36,32,29,26,24,22,20,18,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1`.
Remis w konkursie daje punkty przypisane wspólnemu miejscu; kolejne miejsca są pominięte. Remis całego pucharu rozstrzygają liczby zwycięstw, drugich miejsc itd. Przy nadal równych osiągnięciach gra zachowuje wspólne miejsce (ADAPT), a potrzebną kolejność startową losuje powtarzalnie z seeda; F03 §3.1.3 odrębnie przewiduje losowanie kolejności startu przy nierozstrzygniętej równości. Tabela pucharu i suma skoków turnieju czterech skoczni są różnymi polami.

Domyślna drużyna hotseat może zawierać ludzi i boty; ten model obsady jest adaptacją lokalnej gry. W Super Team można sterować oboma skoczkami jednego zespołu. W konfiguracji wymagana czytelna lista, kto steruje każdym miejscem.

## 7. Procedura startu i jury

Tryb trójfazowy: czerwone — przygotowanie; żółte — oczekiwanie/pozycja; zielone — 10 s na start. F02 §415.4.1. Prawdziwe oczekiwanie w żółtej fazie może być długie; gra pozwala pominąć animację czekania w czasie, gdy sterowanie skokiem jest nieaktywne. Nie skraca 10 s zielonego ani nie zmienia pola wiatru przez FPS. Przy braku zgody startowej zawodnik wraca do przygotowania.

Przekroczenie czasu, rezygnacja i anulowanie przez jury są odrębnymi zdarzeniami. Gra blokuje fizyczne ruszenie na czerwonym i podaje powód. Rezygnacja wymaga potwierdzenia z menu pauzy; F10 nie usuwa pucharu. Jury potrafi wstrzymać start, zmienić belkę i unieważnić nieukończoną serię; wyniki zachowanej ukończonej serii pozostają podstawą, trening nigdy nie staje się serią konkursową po fakcie.

Automatyczne jury w v1 to zdefiniowana polityka bezpieczeństwa, nie symulacja pracy ludzi. Warunki ekstremalne są poza domyślnym generatorem; scenariusze anulowania istnieją do testów i szczególnych warunków. W P16 doprecyzować status oficjalny poszczególnych powodów nieskakania przed ich serializacją.

## 8. Linia prowadzenia i informacja zwrotna

Linia celu wynika z wyniku lidera, punktów gracza z wcześniejszych serii, przewidywanego stylu (domyślnie 3×18,5), aktualnej prognozy wiatru i znanego składnika jury. Coach bonus jest warunkowy, więc solver musi sprawdzić obie strony progu. Szukamy najmniejszej połówki metra dającej wynik **większy** od prowadzącego, a nie tylko równy.

W HUD: `DO PROWADZENIA ~132,5 m`. Tylda oznacza zależność od przyszłych not i wiatru. W locie aktualizacja może być ograniczona dla stabilności (TUNE), lecz nigdy nie przedstawia gwarancji zwycięstwa. Nie rysować poza profilem, gdy celu nie da się osiągnąć. Rekord i kwalifikacja mają osobne etykiety.

Treningowy cel kontrolowanego lidera jest kotwiczony na połowie dystansu między K a HS (na K120/HS134: 127 m; przykład użytkownika K120/HS132: 126 m; poprawka rundy 17 — wcześniej 75% HS). Dotyczy wyłącznie wyświetlania `DO PROWADZENIA` w treningu — solver konkursowy, ranking i punktacja nie są wymuszane na ten cel. Cel ma być osiągalny z belek AUTO, nie jest automatycznym udanym wejściem.

Komentarz po skoku wybiera jeden główny problem z dziennika zdarzeń: zbyt wczesne/późne wybicie, nadmierne pochylenie, brak telemarku, spóźnione przygotowanie, niestabilny odjazd. Podaje przyczynę, nie losowy doping. W zawodach zachowujemy zwięzłość; trening ma rozwijane szczegóły i replay.

## 9. Rekordy i powtarzalność

Rekord konkursowy: ukończony ustany skok w uprawnionej serii, bez pomocy, na zatwierdzonej wersji skoczni i zasad. Osobne rekordy treningowe, osobiste, konkursowe i rekordy wariantów rozrywkowych. DSQ, upadek i nieukończony wynik nie aktualizują oficjalnej tabeli. Przy identycznej długości rekord nie nadpisuje wcześniejszej daty; można dodać współposiadacza.

Wersja fizyki lub geometrii zmienia kategorię porównywalności. Stare rekordy są archiwizowane, nie kasowane i nie mieszane z nowymi. Replay zapisuje wynik i stan, dzięki czemu aktualizacja modelu nie przepisuje historycznego rekordu.
