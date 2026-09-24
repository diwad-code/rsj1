# Plan zawartości i produkcji assetów

Cel pełnego v1: **20 osobnych skoczni**, każdy obiekt z własną geometrią i oznaczeniami, sześć rodzin krajobrazów, komplet ekranów oraz trybów z GDD. Poniżej jest lista produkcyjna; nie twierdzimy, że wszystkie parametry i fotografie są już zebrane.

## 1. Obiekty

Skocznie są grywalnymi adaptacjami inspirowanymi realnymi współczesnymi miejscami. **K i HS wybranego wariantu muszą być prawidłowe**; inne wymiary i balans mogą być ADAPT/TUNE. Wymagamy rozpoznawalnego, zróżnicowanego wyglądu i uczciwego odróżnienia gry od homologowanego profilu. Nie łączymy historycznych K z SJ3 z aktualnym wyglądem obiektu.

| ID | Miejsce / wariant | Etap | Parametry potwierdzone w tym researchu |
| ---| ---| ---| ---|
| H01 | Lillehammer, normalna | MVP | K90/HS98, F09 |
| H02 | Zakopane, duża | MVP | K125/HS140, F10 |
| H03 | Oberstdorf, duża | MVP | K120/HS137, F11 |
| H04 | Planica, mamut | MVP | K200/HS240, F12 |
| H05 | Garmisch-Partenkirchen, duża | v1 | Do karty źródłowej |
| H06 | Innsbruck, duża | v1 | Do karty źródłowej |
| H07 | Bischofshofen, duża | v1 | Do karty źródłowej |
| H08 | Wisła, duża | v1 | Do karty źródłowej |
| H09 | Szczyrk, normalna | v1 | Do karty źródłowej |
| H10 | Lahti, duża | v1 | Do karty źródłowej |
| H11 | Ruka, duża | v1 | Do karty źródłowej |
| H12 | Oslo/Holmenkollen, duża | v1 | Do karty źródłowej |
| H13 | Lillehammer, duża | v1 | Do karty źródłowej |
| H14 | Falun, duża | v1 | Do karty źródłowej |
| H15 | Engelberg, duża | v1 | Do karty źródłowej |
| H16 | Titisee-Neustadt, duża | v1 | Do karty źródłowej |
| H17 | Klingenthal, duża | v1 | Do karty źródłowej |
| H18 | Sapporo, duża | v1 | Do karty źródłowej |
| H19 | Kulm, mamut | v1 | K200/HS235, F08 |
| H20 | Vikersund, mamut | v1 | Do karty źródłowej |

Lista miejsc jest DESIGN. Pełne wartości geometrii, belki, P/U i fall line nie wynikają z samego K/HS. Dla H05–H20 aktualne wartości sprawdza się w zadaniu tworzenia danej karty. Przy braku wiarygodnego profilu oznaczyć rekonstrukcję; nie wstawiać losowej krzywej pod prawdziwą nazwą. Zamiana miejsca wymaga aktualizacji listy, nie cichego usunięcia skoczni.

Wczesny prototyp używa technicznej własnej K120/HS134, bez nazwy prawdziwego obiektu. Po zatwierdzeniu modelu zostaje zastąpiony H03; techniczna skocznia nie liczy się do dwudziestu.

## 2. Cztery pierwsze karty danych

| Obiekt | K/HS | pkt/m | Gate pkt/m rozbiegu | Wiatr pod/w plecy pkt/(m/s) | Próg 95% podany w dokumencie |
| ---| ---| ---:| ---:| ---| ---:|
| Lillehammer normalna | 90/98 | 2,0 | 7,00 | 8,00/12,00 | 93,0 m |
| Zakopane duża | 125/140 | 1,8 | 7,56 | 10,80/16,20 | 133,0 m |
| Oberstdorf duża | 120/137 | 1,8 | 7,56 | 10,80/16,20 | 130,0 m |
| Planica mamut | 200/240 | 1,2 | 8,64 | 14,40/21,60 | 228,0 m |

To odniesienia do dokumentów konkursowych z określonych dat, nie deklaracja przyszłej homologacji. Współczynniki muszą zostać sprawdzone względem faktycznie zbudowanej geometrii gry. Źródła: [F09 Lillehammer](https://medias2.fis-ski.com/pdf/2026/JP/3308/2026JP3308RTRIA.pdf), [F10 Zakopane](https://medias3.fis-ski.com/pdf/2026/JP/3112/2026JP3112RLQ.pdf), [F11 Oberstdorf](https://medias1.fis-ski.com/pdf/2026/JP/3103/2026JP3103RLQ.pdf), [F12 Planica](https://medias3.fis-ski.com/pdf/2026/JP/3181/2026JP3181RLT.pdf).

## 3. Szablon karty skoczni

Każda karta `docs/hills/Hxx.md` zawiera:

1. Dokładny obiekt, miejscowość, kraj, wersję i datę danych.
2. Źródło K/HS, parametrów pomiaru i współczynników; źródła zdjęć konstrukcji, widoku z boku i oznaczeń zeskoku.
3. Tabelę parametrów z jednostkami i etykietami FACT/ADAPT/UNRESOLVED.
4. Profil liczbowy oraz mapę metrażu: T/P/K/L/U/fall line, belki, znane ograniczenia rekonstrukcji.
5. Jedno ujęcie techniczne z etykietami oraz jeden ekran gry 960×540 bez debug HUD.
6. Testy skoków: zbyt wcześnie, poprawnie, za późno; oba lądowania; wiatr w obu kierunkach; zakres belek; test wybiegu.
7. Pochodzenie assetów, listę plików, hashe eksportów i wynik odbioru.
8. Kalibrację **gry**, z jawnymi testami zakresu odległości, bezpiecznej AUTO, lądowań za HS, AI i determinizmu. Gdy karta podaje prawdziwy rekord, test musi znaleźć czysty skok na dwie nogi co najmniej 2 m dalej oraz częstsze podpórki przy mniej dokładnym kontakcie w tym paśmie. Dane z zawodów FIS mogą być punktem odniesienia, jeśli istnieją i dotyczą właściwego wariantu, lecz nie są wymaganym rozkładem do skopiowania. Brak stylu lądowania w źródle oznaczyć UNRESOLVED jako fakt źródłowy; parametry gry opisać osobno jako ADAPT/TUNE.

Jeżeli nie można potwierdzić K/HS wybranego wariantu, nie nazywać adaptacji tym obiektem. Brak pełnego certyfikowanego profilu lub szczegółowych statystyk upadków nie blokuje grywalnej skoczni inspirowanej miejscem. Każda karta wyraźnie rozróżnia źródło, wybór artystyczny i wynik testu gry.

## 4. Pakiet assetów na obiekt

Jedna geometria, mapa pomiarowa, plik ustawień wiatru/belek, atlas konstrukcji i charakterystycznych elementów, własna paleta, miniatura do wyboru skoczni. Każdy obiekt ma odrębną sylwetkę, detale otoczenia i kolorystykę; fotografia realnej skoczni może być inspiracją, ale nie jest wymagana. Oświetlenie nie przesuwa kolizji; elementy stadionu nie zasłaniają trajektorii.

Produkcja: karta źródeł → profil techniczny → skoki kontrolne → szkic kompozycji → pixel art 960×540 → atlas → integracja → nagranie → odbiór. Nie generować dwudziestu tła przed ustaleniem skali kamery i sylwetki skoczka.

## 5. Zawodnicy i kalendarze

75 bazowych fikcyjnych zawodników; do 10 miejsc zastępowanych przez ludzi. Profile AI mają umiejętność timingu, szybkość korekty, tolerancję ryzyka i powtarzalność. Każda trudność ma ustaloną dystrybucję parametrów, a nie mnożnik punktów. Wygląd wykorzystuje jeden poprawny bank animacji i kombinacje masek kolorów.

Kalendarz v1:20 konkursów, każdy z listy raz; cztery skocznie H03/H05/H06/H07 tworzą spójny osobny turniej. Nie nazywamy tego dokładną repliką sezonu 2026/27. Edytor kalendarza pozwala wybrać 1–40 konkursów, ułożyć kolejność i zapisać zestaw. Klucz tabeli rekordów kalendarza obejmuje kolejność skoczni, wersje zasad i ustawienia trudności.

Drużyny: 16 bazowych ekip po 4 miejsca (część zawodników z tej samej puli), Super Team z parami z puli. Obsada drużyn jest walidowana pod kątem unikalności w ramach konkursu. Tryby nie wymagają realnych reprezentacji ani kompletnej bieżącej listy zawodników.

## 6. Teksty i lokalizacja

Polski domyślny. UI korzysta z kluczy tekstowych i formatterów jednostek/liczb. Angielski jest przewidziany strukturalnie, ale pełne tłumaczenie nie jest bramką v1. Nazwy miejsc zachowują oryginalne znaki; font musi je obsłużyć albo mieć jawny fallback. Wynik: `132,5 m`, `91,2 km/h`, `−7,6 pkt`. Brak odległych lore, rozbudowanych dialogów i tekstów marketingowych wewnątrz gry.

## 7. Kolekcja i prawa do zasobów

Kod i grafika powstają od nowa. Obrazy SJ3 i rendery dokumentów FIS są wyłącznie referencją w docs. Nie kopiować logo SJ3/FIS, oryginalnych sprite'ów, dawnych plików PCX ani twórczości społeczności bez osobnego ustalenia licencji. Publiczny kod DOS ma GPLv3; plan nie zakłada jego translacji. Użycie zewnętrznych fontów/audio musi mieć konkretną licencję i wpis w manifestach.

W przypadku wspomagania generowaniem obrazów: generator może dostarczyć szkic/teksturę roboczą, ale dokładny profil i sportowe linie rysuje system z danych. Obraz wygenerowany nie stanowi dowodu rzeczywistego wyglądu skoczni. Każdy finalny atlas wymaga korekty siatki, kontroli skali i artefaktów.
