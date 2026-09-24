# Oprawa graficzna, interfejs i dźwięk

Status: DESIGN / TUNE. Obowiązują oba doprecyzowania użytkownika: współczesny sport i prawidłowe oznaczenia, a także wyższa rozdzielczość oraz bardziej szczegółowy, realistyczny **pixel art**. Dokument jest specyfikacją przyszłych assetów; nie przedstawia jeszcze wykonanych mockupów.

## 1. Kierunek artystyczny

„Współczesne zawody narciarskie narysowane pikselami”. Wiarygodny rozbieg ze stalową lub betonową konstrukcją, przygotowany zeskok, las dopasowany do miejsca, trybuny, oświetlenie i rozpoznawalna panorama. Zachowujemy boczny profil skoczni i małą liczbę potrzebnych przycisków z SJ3.

Realizm oznacza właściwe proporcje, ciężar ruchu, konstrukcję nart i śnieg reagujący na światło. Nie oznacza fotografii przepuszczonej przez filtr pikselizacji. Unikamy plastikowych konturów, przypadkowego szumu na każdym pikselu i ogromnych skoczków zasłaniających teren.

## 2. Siatka i skala

| Element | Wariant startowy | Bramka weryfikacji |
| ---| ---| ---|
| Obraz logiczny | **960×540**, proporcje 16:9 | Zrzut 1:1 i ekran 1920×1080 w skali 2× |
| Skoczek stojący | Sylwetka około 36–48 px wysokości; narty 48–68 px | Rozpoznanie pozycji lotnej i obu lądowań bez HUD |
| Font główny | Własna/licencjonowana bitmapa 12–16 px, cyfry stałej szerokości | Polskie znaki i tabela na 1366×768 |
| Font tytułów | 24–32 px albo dokładne wielokrotności małego fontu | Brak antyaliasingu różnego od reszty oprawy |
| Tła | Rysowane na tej samej siatce, klastry 2–6 px plus selektywne detale | Brak fotograficznego ziarna i konkurencji ze skoczkiem |
| Interfejs | Margines bezpieczny 24 px; grubość ramki 1–2 px | Brak cięcia tekstu we wszystkich rozmiarach okna |

Wymiary są TUNE. Zatwierdzenie następuje na reprezentatywnej scenie, zanim powstanie 20 kompletów grafiki. Robocze porównanie 640×360 / 960×540 służy ustaleniu gęstości, nie wymaga utrzymywania dwóch osobnych wersji UI. Wybór bazowy to 960×540.

Renderujemy do stałej bitmapy. Domyślnie skala całkowita, o ile mieści się co najmniej 2×; dla mniejszych okien proponowany tryb „Dopasuj” z nearest-neighbour. Opcja „Równe piksele” wymusza skalę całkowitą także 1× i pasy. Na ekranach mniejszych niż baza obraz proporcjonalnie pomniejszany; brak obietnicy pełnej czytelności poniżej docelowego minimum 1280×720. Nigdy nie rozciągać proporcji. Ułamkowy DPR/zoom może powodować nierówne piksele — sprawdzić, nie obiecywać perfekcji na każdej konfiguracji.

## 3. Kamera i prezentacja skoczni

Fizyka jest 2D w metrach. Kamera śledzi skoczka z niewielkim wyprzedzeniem, a powierzchnia stoku jest rysowana jako pas o stałej umownej głębokości. Ten pas pozwala pokazać oba brzegi i poprzeczne linie. Głębia graficzna nie zmienia kolizji ani długości skoku.

Na rozbiegu widoczny próg zanim dojedzie do niego zawodnik. W locie pozycja skoczka około 35–42% szerokości ekranu od lewej; przed nim miejsce na zeskok. Bez automatycznego zoomu w chwili wybicia i kontaktu. Kamerę zaokrągla renderer po projekcji; symulacja nie porusza się skokami pikselowymi. Parametry camera lead i smoothing są TUNE, z możliwością wariantu bez wygładzania dla porównania.

Na mamutach skala świata musi umożliwiać obserwację lotu bez zamiany zawodnika w punkt. Dopuszczalne osobne ustawienie skali dla klasy skoczni, stałe podczas skoku. Replay pozwala odtworzyć to samo ujęcie i zwolnić czas.

Każda skocznia musi mieć czytelny ciąg wejścia na górę (winda/schody/pomost) oraz belki podparte konstrukcją. Stan r19: wsporniki do poziomu bocznego ciągu komunikacyjnego ze stopkami, generyczne schody/pomost wzdłuż rozbiegu i smukły szyb windy przy wieży; bez deklaracji VISUAL PASS.

## 4. Oznaczenia sportowe — wymaganie obowiązkowe

Źródła i znaczenie: [współczesne skoki](research/MODERN_SKI_JUMPING.md). Poniższa tabela to kontrakt rysowania, nie pełen cytat regulaminu.

| Warstwa | Implementacja wizualna | Czego nie pomylić |
| ---| ---| ---|
| K | Pozycja z danych; zmiana bocznego pasa niebieskiego na czerwony; tabliczka K poza torem | Nie jest HS ani metą lotu |
| K–HS | Czerwony pas przy obu brzegach | Nie wypełniać całej powierzchni śniegu |
| Niebieski pas | Od K w górę, na długości równej odcinkowi K–HS | Nie zakładać automatycznie, że sięga aż do P |
| HS | Poprzeczny pas oznaczenia ze strukturą gałązek lub odpowiednika; czerwone akcenty przy brzegach | Nie zmieniać HS na `K × 1,2` z SJ3 |
| Metry | Poprzeczne markery co 5 m od 10 m przed P do HS; boczne znaczniki metrażu od połowy K do 5 m za HS | Nie rysować ich pionowo przez krajobraz; nie zaczynać dowolnie od K |
| Fall line | Osobna linia na wybiegu; kończy ocenę odjazdu | Kontakt ze śniegiem nie kończy jeszcze not za styl |
| Zielony pas boczny | Od fall line w górę o długość K–HS | To nie to samo co zielona poprzeczna linia prowadzenia |
| „Do prowadzenia” | Cienka zielona linia na powierzchni + wartość w HUD | Prognoza wyniku, nie fizyczne oznaczenie stałe |
| Rekord / cel treningowy | Mały podpis lub znacznik przy brzegu, inny kształt niż linie regulaminowe | Nie zastępuje sportowych oznaczeń |

Kolorowanie odwzorowuje pasy przy brzegu, a nie trzy równo podzielone odcinki całej skoczni. W widoku blisko boku poprzeczna linia jest skrócona perspektywicznie. Dopuszczalne zwiększenie jej grubości do czytelnych 2–3 pikseli musi być udokumentowane jako adaptacja rozdzielczości; jej położenie pozostaje dokładne.

Generator używa dokładnych metrowych przedziałów: `span = HS − K`, czerwony `[K, HS]`, niebieski `[K − span, K]`, zielony `[fallLine − span, fallLine]`. Linie poprzeczne to wielokrotności 5 m wewnątrz `[P − 10, HS]`; HS jest dodatkowym markerem także wtedy, gdy nie jest wielokrotnością 5. Boczne podziałki mają krok 1 m w zakresie od `ceil(K/2)` do `HS+5`, z rzadszymi podpisami dla czytelności. Dla mamutów karta może określić odmienny zakres podziałek zgodnie z dokumentacją konkretnego obiektu; nie zmienia to pozycji K/HS. Dane błędne lub wychodzące poza zeskok są błędem walidacji, a nie powodem do rozciągnięcia oznaczeń.

## 5. Palety i światło

Kolory bazowe (DESIGN, do oceny na obrazie): ciemny granat `#121D2B`, cień śniegu `#91B4CB`, śnieg `#E7F0EF`, stal `#536C7A`, las `#244637`, ciepłe światło `#F1BD79`, tekst `#F3EAD1`. Oznaczenia sportowe: niebieski `#286BC6`, czerwony `#D64D53`, zielony `#3FA865`; zawsze także pozycja, kształt lub etykieta.

Sześć rodzin otoczenia: las skandynawski w dzień, skandynawska noc z reflektorami, alpejska dolina, miejski stadion, las japoński, otwarta dolina mamucia. Każda ma rampy 4–7 odcieni dla śniegu i dużych materiałów, spójne kierunki światła i ograniczone lokalne akcenty. Bez jednej globalnej mgły rozmywającej całą scenę.

Największy kontrast lokalny: skoczek, krawędź progu, śnieg i linie. Tło ma niższy kontrast, prostsze klastry w strefie przewidywanego lotu i wolniejsze przewijanie. Dithering tylko na wybranych przejściach, nie jako szum pełnoekranowy. Brak domyślnego CRT, bloom, motion blur, aberracji i scanlines.

## 6. Assety i animacja

Jeden skoczek bazowy z maskami kolorów, osobne warstwy nart i ciała. Zestaw: siedzenie/belka, ruszenie, zjazd, 5–8 faz wybicia, bank pozycji lotnych, 4–6 faz przygotowania telemarku, 3–5 lądowania równoległego, amortyzacja, odjazd, hamowanie, utrata równowagi i upadek. Liczby oznaczają budżet startowy, nie wymóg nabijania klatek. Stan rundy 16: ławka kotwiczona biodrem/kątem i stacjonarna, 4 klatki `gatePush` dochodzące do zwartej pozycji, bank 41 klatek; rzędy HUD celu/lidera rozdzielone, ucięta dolna faza naprawiona; deterministyczne sceny-fixture `pkg008-r16-fixed-*` (NIE gra na żywo). Stan rundy 20: art -8, supportTwo FRONT/BACK deterministycznie, normalne proporcje ramion, telemark hold 0,45 s; bez VISUAL PASS.

Ułożenie sprite'a wynika ze stanu fizyki. Animacja nie może pokazać nart dotykających śniegu 15 px przed rzeczywistą kolizją. Dla kątów stosujemy bank ręcznie poprawionych pozycji albo obroty rasteryzowane bez wygładzania i poprawione w atlasie. Unikamy płynnego obracania bitmapy z antyaliasingiem.

Tła powstają modułowo, ale każda skocznia ma własną rozpoznawalną sylwetkę konstrukcji, otoczenie progu, landmark oraz odrębną paletę kolorów. Nie wystarczy przemalować tej samej skoczni dwudziestoma paletami. Fotografie realnego obiektu mogą służyć jako inspiracja, lecz nie są wymagane; cudzych zdjęć nie kopiujemy do runtime bez prawa użycia. Mastery, atlasy i manifest z pochodzeniem są osobnymi plikami; do gry trafiają tylko zoptymalizowane eksporty.

## 7. Interfejs jako gra DOS

Widoczne ekrany rysuje canvas. Klawiaturowe listy, tabele i prostokątne ramki. Brak menu hamburger, zaokrąglonych kart, strony powitalnej z przewijaniem, marketingowego „hero”, stałego kursora myszy nad planszą i przeglądarkowych formularzy w normalnym przebiegu.

```text
┌──────────────────────────────────────────────────────────────┐
│ SKOCZNIA   K120 / HS134          SERIA 1      ANNA K.   NR 12  │
│                                                              │
│            krajobraz, próg, lot i czytelny zeskok              │
│                                                              │
│                                                              │
│ WIATR ← 1,2 m/s                  DO PROWADZENIA ~132,5 m       │
│ BELKA 18                P — PAUZA        ↑  ← →  T  R          │
└──────────────────────────────────────────────────────────────┘
```

To wireframe hierarchii, nie gotowa grafika. HUD przy belce może pokazać więcej informacji niż podczas lotu. Wynik po odjeździe: metry, pięć not z przekreślonymi skrajnymi, składowe długość/styl/wiatr/belka, suma, miejsce i jeden konkretny komentarz. W trakcie lotu nie zasłaniamy skoczka rozbudowaną tabelą.

Ekrany: tytuł, główne menu, wybór trybu, profile, skocznie, konfiguracja konkursu, przekazanie klawiatury, belka, rozgrywka, pauza, wynik, ranking, sezon, edycja kalendarza, drabinka KO, drużyny, King of the Hill, rekordy, replaye, ustawienia, pomoc, credits, import/eksport i błąd zapisu. Każdy ma jawny fokus oraz Enter / Wstecz. Wprowadzanie nazw korzysta z warstwy tekstowej HTML/IME synchronizowanej z wyglądem gry.

## 8. Dostępność i czytelność

Remap klawiszy, brak zależności od koloru lub dźwięku, opcja ograniczenia śniegu i ruchu tła, brak migających efektów, większa czcionka tabel z mniejszą liczbą wierszy na stronę. Polskie znaki: `ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ`; test z długimi nazwami. Pomoc przywraca domyślne bindy, więc użytkownik nie może trwale odciąć sobie nawigacji.

Semantyczna warstwa dostępności odpowiada aktualnemu ekranowi. Wyniku nie ogłaszamy co klatkę; komunikaty tylko przy zmianie fazy i na końcu skoku. Pełna dostępność wymagającej części zręcznościowej dla wszystkich użytkowników nie jest dowiedziona samym istnieniem ARIA; ocena pozostaje jawna.

## 9. Dźwięk

Autorskie/licencjonowane efekty: menu select/confirm/back, światło, ślizg, wybicie, szum powietrza, telemark, dwie nogi, upadek, odjazd, publiczność, rekord i podium. Pętle ślizgu i wiatru płynnie reagują na prędkość; nie restartują się co klatkę. Trzy pętle muzyczne menu/konfiguracja/podium; muzyka w czasie lotu domyślnie wyciszona. Styl brzmienia może nawiązywać do sprzętu epoki, lecz nie wymaga PC Speakera.

Suwaki: master, efekty, publiczność, muzyka. Dźwięk uruchamiany po działaniu użytkownika; gra działa przy odmowie audio. Maksymalna liczba jednoczesnych głosów i formaty OGG/MP3/WAV są wyborem produkcyjnym po testach przeglądarek. Nie kopiować odgłosów SJ3.

## 10. Odbiór grafiki

Trzy obowiązkowe obrazy docelowe: duża skocznia dzienna, normalna nocna, mamut. Każdy: zrzut 960×540, skala 2×, 10–20 sekund nagrania i fragment wybicia/lądowania. Osobno pełny ekran wyników. Odbiór pyta: czy to nadal pixel art; czy geometria i oznaczenia są wiarygodne; czy pozycja skoczka jest czytelna; czy UI wygląda jak gra. Nie zastępuje go automatyczne porównanie pikseli.
