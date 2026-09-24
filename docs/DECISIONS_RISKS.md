# Decyzje, ryzyka i pytania otwarte

Stan: 19.09.2026. Decyzje są kierunkiem realizacji, nie zatwierdzonym przez testy wynikiem produkcyjnym. Nie wymagają pytań o rutynowe szczegóły przed rozpoczęciem niezależnych prac.

## Decyzje bazowe

| ID | Decyzja | Powód i konsekwencja |
| ---| ---| ---|
| D01 | Nowy projekt web od zera | Brak starego kodu do migracji; zachować katalogi skilli |
| D02 | SJ3 jako główna inspiracja sterowania i rytmu | Pięć akcji, widok z boku, wiatr, turnieje, hotseat |
| D03 | **Modern 2026.1**, nie historyczne zasady SJ3 | Bezpośrednie doprecyzowanie użytkownika; punktacja, K/HS, kompensaty, format zawodów muszą być współczesne |
| D04 | Szczegółowy pixel art 960×540 | Bezpośrednie doprecyzowanie użytkownika; większa rozdzielczość i realizm proporcji są dozwolone i pożądane |
| D05 | Boczne 2D z wąskim pasem powierzchni stoku | Umożliwia czytelne poprzeczne linie bez zmiany sterowania na 3D |
| D06 | TS/Vite/Canvas2D | Minimalny stos dla własnej fizyki; benchmark przed masową produkcją assetów |
| D07 | Desktop + klawiatura, fullscreen na świadomy Enter | Wynika z preferencji użytkownika i ograniczeń przeglądarki |
| D08 | Lokalna gra 1–10 osób, brak backendu | Cały rdzeń dostępny bez kont i sieci po cache |
| D09 | Autorska fizyka i grafika | Nie jest portem Pascala ani emulatorem; dokumentujemy inspirację |
| D10 | Brak ukrytego losowania upadku/not | Powtarzalność i czytelna nauka; wiatr nadal zmienny |
| D11 | Reguły standardowego WC Men jako bazowy format | Konkretny sprawdzony profil; autorska obsada i kalendarz nie udają licencjonowanego sezonu |
| D12 | Pełne v1 ma 20 skoczni i wszystkie tryby z GDD | MVP z 4 obiektami jest etapem, nie zamknięciem całego projektu |
| D13 | Edytor skoczni i multiplayer online po v1 | Własny kalendarz pozostaje w v1; brak rozrostu zanim skok przejdzie odbiór |
| D14 | Dane i replaye wersjonowane od początku | Zmiana fizyki nie przepisuje starych rekordów |
| D15 | Gra nie odtwarza administracji i licencji FIS | Sportowy wynik i oznaczenia są w zakresie; krajowe kwoty, protesty i kontrola sprzętu nie są mechanikami v1 |
| D16 | Każdy pakiet kończy się promptem nowej sesji | Bezpośrednia zasada użytkownika; PACKAGE_WORKFLOW.md rozróżnia pakiety PKG od zadań Pxx i określa obowiązkowe przekazanie |
| D17 | Mała gra, prosta implementacja, jedno końcowe review | Bezpośrednia zasada użytkownika dla GPT-5.6 Sol i kolejnych modeli; nadmiar infrastruktury, raportów i rund audytu jest zabroniony. AGENTS.md ma pierwszeństwo przed starszymi zaleceniami procesu |
| D18 | Ścisła kalibracja skoczni realnych (19.09.2026) — ZASTĄPIONA przez D19 | Historyczna bramka wymagająca pełnych statystyk FIS; zachowana dla interpretacji wcześniejszych raportów PKG-009. Nie blokuje już adaptacji inspirowanych realnymi obiektami. |
| D19 | Grywalne skocznie inspirowane realnymi (23.09.2026) — OBOWIĄZUJE | K/HS zgodne z obiektem, pozostała geometria i balans ADAPT/TUNE sprawdzone w grze; bez twierdzenia o homologacji. Każdy obiekt ma odrębną sylwetkę, detale i paletę. Fotografie mogą inspirować, nie są wymagane. Gracz może ustać równolegle bez podpórki co najmniej 2 m za prawdziwym rekordem z karty, choć podpórka jest tam częstsza przy błędzie. Determinizm i odbiór VISUAL użytkownika pozostają obowiązkowe; szczegóły w AGENTS.md. |

Wcześniejsze robocze założenia o profilu Classic, mamucie K185 z SJ3 i niskiej bazie 640×360 zostały zastąpione powyższymi decyzjami. Research historyczny zachowuje te liczby wyłącznie jako opis pierwowzoru. Nie przywracać ich z wcześniejszego kontekstu.

## Ryzyka i działania

| ID | Ryzyko | Wczesny dowód / ograniczenie | Zadania |
| ---| ---| ---| ---|
| R01 | Gra wygląda poprawnie, ale nie daje przyjemności ze skoku | Prototyp i obserwacja graczy przed turniejami i 20 assetami | P01, P12, P38 |
| R02 | Wybicie zależy od FPS | Te same input traces 30/60/120/144 Hz | P04–P08, P34 |
| R03 | FIS redline błędnie odczytany | Data, numer artykułu, lokalny render oraz fixture liczbowy | P01, P13, P16 |
| R04 | Linie nie odpowiadają metrom | Jeden distanceMap dla pomiaru i markera; obraz techniczny | P05, P14, P21, P32 |
| R05 | Szczegółowa grafika zaciera pixel art | Raster 960×540, bank pozycji, ocena 1:1 i 2× w ruchu | P11, P15, P30 |
| R06 | Narty znikają na tle lub za HUD | Trzy sceny referencyjne, test lądowania w dzień/noc | P15, P21, P30 |
| R07 | Kompensata ma zły znak lub jednostkę | Osobno pkt/m rozbiegu i pkt/(m/s); oficjalne wiersze | P13 |
| R08 | Utrata fokusu powoduje upadek lub trzymany klawisz | Pauza, clear input, świadome wznowienie | P03, P04, P34 |
| R09 | Dane znikają lub wynik nalicza się dwa razy | Atomiczny reducer/transakcja, eksport, migracje | P19, P37 |
| R10 | AI oszukuje skrótem wyniku | Wspólny model i test identycznego przebiegu w fast-forward | P17 |
| R11 | Po aktualizacji zmienia się replay/rekord | Próbki stanu, wersje, archiwalne rekordy | P20, P29 |
| R12 | Wydajność docelowego artu jest gorsza niż placeholderów | Benchmark pełnej sceny i klasy słabszego laptopa | P15, P35 |
| R13 | Cache miesza wersje gry | Manifest buildId, update poza skokiem, scope podkatalogu | P36 |
| R14 | 20 skoczni to 20 przemalowań jednego profilu | Indywidualne dossier i parametry geometrii każdego obiektu | P21, P32 |
| R15 | Nadinterpretacja materiałów referencyjnych | Własne assety, manifest praw i brak researchu w buildzie | P02, P30, P39 |

## Niewiadome, które mają konkretny sposób zamknięcia

| ID | Status | Niewiadoma | Zamknięcie |
| ---| ---| ---| ---|
| Q01 | UNRESOLVED | Odczucie oryginalnego SJ3 w ruchu | P01: kontrolowana sesja i notatki; jeśli uruchomienie niedostępne, obejrzany gameplay z zaznaczeniem ograniczenia |
| Q02 | TUNE | Finalne parametry aerodynamiki/timingu i skala skoczka | P06–P12, P15; krzywe błędu i feedback graczy |
| Q03 | RESOLVED FOR MVP / ADAPT | Coach threshold obcinany w dół do 0,5 m; rekompensaty half-away-from-zero; najpierw clamp długość+styl, potem rekompensaty i finalny clamp; 95% długiego upadku porównywane dokładnie na skompensowanej długości grupy awansującej | P13: ICR June 2026 + nagłówki/wyniki Zakopane, Oberstdorf i Kulm. P16: ICR §422.14 i WC Men 2026/27 §4.3.1; brak dodatkowego zaokrąglenia w źródle oznacza porównanie dokładnego ułamka po zaokrąglonych składowych punktowych. Finalny clamp skrajnego wyniku pozostaje jawną polityką MVP |
| Q04 | UNRESOLVED | Pełna geometria wszystkich 20 obiektów i podstawowe parametry pozostałych 15 | P21/P32: osobne karty; obecny research potwierdza K/HS i współczynniki 4 MVP oraz Kulm, ale nie ich pełne profile |
| Q05 | RESOLVED FOR MVP / ADAPT | Wagi 0,25/0,45/0,30 i okno wybicie→pomiar nie odtwarzają aparatury FIS | P13 zachowuje jawne pochodzenie ADAPT; HUD nie jest wejściem punktacji |
| Q06 | RESOLVED FOR P15 | Canvas2D wystarcza dla reprezentatywnego artu 960×540 | Pomiar headed na Iris Xe: p95 16,9 ms, p99 17,0 ms; pozostaje ponowny pomiar masowej zawartości w P35 |
| Q07 | UNRESOLVED | Docelowa publiczna nazwa i hosting | Robocza nazwa zostaje; P39 przygotowuje neutralny pakiet publikacji, bez samodzielnej publikacji |
| Q08 | UNRESOLVED / poza v1 | Niespójność 40/50 w aktualnym WC Women | Weryfikować przy dodaniu tego formatu, nie blokuje bazowego profilu |
| Q09 | RESOLVED FOR P15 / TUNE FOR P30 | Wzorzec zachowuje pixel art przy 58 px nart i ok. 43 px sylwetki, własnym foncie 5×7 i tle 960×540 | P15: zrzuty 1×/2× i nagranie OBSERVED; pełny bank animacji i pozostałe ekrany pozostają P30 |

Braki dokumentacyjne nie są pretekstem do wymyślania faktów. Jednocześnie nie blokują wszystkich prac: można zbudować ekran, wejście i profil techniczny zanim zamknie się kartę H20. Bramka dotyczy konkretnej funkcji lub obiektu.

## Zmiany zakresu w przyszłości

Przed dodaniem funkcji zapisać: jaki problem gracza rozwiązuje, do którego filaru należy, wpływ na reguły/zapisy/testy, które zadania trzeba zmienić. Żadne rozszerzenie nie usuwa U03, U05, U07, U09, U10. Płatności, sieciowe rankingi i port mobilny wymagają osobnego polecenia, ponieważ zmieniają produkt i jego architekturę.
