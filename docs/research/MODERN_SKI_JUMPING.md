# Współczesne skoki — baza sportowa projektu

**Wiążące doprecyzowanie użytkownika:** zasady, oznaczenia i wygląd skoczni mają odpowiadać współczesnym skokom. SJ3 inspiruje sterowanie, rytm i formę wizualną. Historyczna punktacja nie jest celem implementacji.

Stan źródeł: 16.09.2026. F01–F08 to odsyłacze w [rejestrze](SOURCES.md). Bazą jest ICR opublikowany jako June 2026 oraz World Cup Men 2026/27. Nazwy URL zawierające `2024` nie są datą obowiązującej treści. F02 ma naniesione zmiany, dlatego datę i kluczowe tabele sprawdzono także na renderach PDF.

## Ustalenia sportowe

| Element | Ustalenie | Podstawa |
| ---| ---| ---|
| K / HS | Różne punkty; K służy punktacji, HS określa koniec strefy lądowania | F02 §411, §433 |
| Styl | Pięć not; sumowane trzy środkowe | F02 §433.1 |
| Metry | Wartość metra zależy od K; nie `180/K` z SJ3 | F02 §433.2 |
| Belka trenera | Obniżenie zgłoszone w czerwonej fazie; warunek ≥95% HS | F02 §422.1 |
| Linie | HS poprzecznie; odległości co 5 m; osobna linia końca oceny odjazdu | F02 §417.3–4 |
| Boczne pasy | Zalecane: czerwony K–HS, niebieski w górę od K, zielony w górę od fall line; długość odcinków = K–HS | F02 §417.3 |
| Start | Procedura świateł i ograniczone okno startu | F02 §415.4, §422 |
| Długi upadek | Dodatkowy awans przy ≥95% najdłuższej skompensowanej odległości grupy podlegającej awansowi | F02 §422.14; F03 §4.3.1 |

P13 sprawdził oficjalne nagłówki wyników: wartość 95% HS jest obcinana w dół do połówki
metra (HS137→130,0; HS142→134,5; HS235→223,0). Reguła dotyczy coach gate i pozostaje
odrębna od 95% skompensowanej długości po długim upadku. Pełne wiersze i źródła są w
[dowodzie PKG-004](../evidence/PKG-004/scoring-fixtures.md).

P16 zamknął osobną regułę długiego upadku: kompensowana długość korzysta z już
zaokrąglonych do 0,1 pkt składowych wiatru i belki, a sam próg 95% jest porównywany
dokładnie bez dodatkowego obcięcia do 0,5 m. F02/F03 nie ustanawiają takiego
dodatkowego zaokrąglenia; grupa odniesienia to zawodnicy podlegający danemu awansowi.

To skrót wybranych reguł, nie pełny regulamin sportowy. Dokładne kontrakty implementacji i testy są w [mechanice](../GAMEPLAY_SPEC.md).

## Co oznacza realistyczna skocznia w tej grze

**DESIGN:** dane skoczni muszą zawierać osobno: profil rozbiegu, próg T, początek strefy lądowania P, K, punkt L/HS, przejście do wybiegu U, linię kończącą ocenę odjazdu, pozycje belek i mapę odległości. Wszystkie oznaczenia są wyprowadzane z tych samych danych, których używa pomiar skoku. Malowanie linii „na oko” do dekoracyjnego tła jest niedopuszczalne.

Norma budowy opisuje rozbieg, stół, bulę, obszar lądowania, przejście i wybieg. Współczynniki rekompensat zależą od konkretnej geometrii. Jej model JUMP-3.5 nie jest kompletnym modelem lotów narciarskich — nie należy przenosić wszystkich uproszczeń normy 2018 na mamuty. [Construction Norm, §2, §4–6](https://assets.fis-ski.com/f/252177/5ba64e29f2/construction-norm-2018-2.pdf).

**DESIGN:** widok pozostaje boczny, ale powierzchnia śniegu otrzymuje wąski pas widocznej szerokości. Umożliwia to narysowanie poprzecznych oznaczeń jako krótkich pasów na śniegu, z widocznym bliższym i dalszym brzegiem. To stała projekcja 2D, bez sterowania głębią i bez kamery obrotowej. W ten sposób zachowujemy charakter SJ3 i pokazujemy sportową funkcję linii.

Nie wszystkie czerwone oznaczenia są jedną „linią krytyczną”. Początek czerwonego pasa bocznego oznacza K, jego koniec HS. HS ma własne poprzeczne oznaczenie. Biała powierzchnia między nimi pozostaje śniegiem — nie kolorujemy całego zeskoku na czerwono. Linia „do prowadzenia” jest warstwą pomocniczą z wyniku konkurencji, a nie geometrycznym K ani HS.

## Odległość i ocena

W cyfrowym pomiarze trzeba odróżnić miejsce dotknięcia śniegu przez stopę/narty od końca lotu środka sprite'a. Przypadki normalne, nietypowy kontakt jednej nogi i upadek muszą prowadzić do jednoznacznego zdarzenia pomiarowego. Wytyczne pomiaru wideo przewidują obcięcie do niższego pełnego lub połówkowego metra; np. 132,49 → 132,0, 132,50 → 132,5. [FIS VDM §1.2.3](https://assets.fis-ski.com/f/252177/753c59dd70/guidelines-vdm_eng_deu.pdf).

Wytyczne oceniania rozdzielają lot, lądowanie i odjazd. Brak telemarku jako pojedynczy błąd jest opisany odjęciem 3,0 pkt u sędziego, a upadek do linii końca oceny ma własną sankcję. **DESIGN:** program tłumaczy błędy modelu 2D na te kategorie i ujawnia powód kary; nie symuluje humoru sędziego. [Style Judging Guidelines](https://assets.fis-ski.com/f/252177/x/727b866905/judgingguidelines-2024-09-26.pdf).

## Fakty o obiektach a parametry gry

W oficjalnym dokumencie konkursu w Kulm z 28.02.2026 widnieją K200, HS235, 1,2 pkt/m, gate factor 8,46 pkt/m rozbiegu i współczynniki wiatru 14,40/21,60 pkt/(m/s). To wartości **tego obiektu i dokumentu**, nie wszystkich skoczni. [Lista finałowa Kulm](https://medias2.fis-ski.com/pdf/2026/JP/3156/2026JP3156SLRF.pdf).

W grze wartości wzorcowe muszą być powiązane z wersją geometrii. Jeżeli autorska fizyka wymusza inne współczynniki, plik danych oznacza je `ADAPT: simulation-calibrated`, zachowując źródłowe wartości obok. Nie podpisujemy zmienionych liczb jako oficjalne dane FIS. Najpierw stroimy fizykę do obiektu; zmiana rekompensat jest ostateczną, udokumentowaną korektą.

## Rozstrzygnięcia zakresu

- Bazowy konkurs stosuje reguły indywidualnego WC Men 2026/27. Płeć awatara nie zmienia regulaminu; osobna kompletna replika WC Women nie jest częścią v1.
- Puchar sezonowy ma autorski kalendarz z realnymi miejscami; nie podszywa się pod dokładny kalendarz 2026/27.
- King of the Hill i krótki konkurs hotseat są wariantami rozrywkowymi. Wykorzystują nowoczesną punktację, lecz format eliminacji jest oznaczony jako zasada gry.
- Sterowanie 2D, automatyczne jury bezpieczeństwa, skrócone oczekiwanie i model sędziego są adaptacjami. Punkty, K/HS oraz sens oznaczeń mają mieć sprawdzalną podstawę sportową.
- Dokument WC Women zawiera niespójne liczby 40/50 w różnych artykułach. Nie rozstrzygamy ich zgadywaniem. Jeżeli ten format trafi do zakresu, potrzebuje osobnego audytu aktualnej czystej edycji.

## Wymagany dowód realizacji

Każda skocznia otrzymuje kartę źródeł: dokładna nazwa obiektu, K/HS z dokumentu konkursu/homologacji, data, profil lub jawnie oznaczona rekonstrukcja, zdjęcia z boku i zeskoku od operatora/FIS, współczynniki z jednostkami. Następnie powstają dwa ujęcia: przekrój techniczny z etykietami oraz rzeczywisty ekran gry bez etykiet technicznych. Odbiór sprawdza oba; samo podobieństwo tła nie wystarcza.
