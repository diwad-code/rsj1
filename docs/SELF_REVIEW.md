# Auto-review dokumentacji i planu

Data: **16.09.2026**. Przegląd własnej pracy przed napisaniem nowego promptu wykonawczego. Nie uruchamiano implementacji gry ani nie rozpoczynano P01–P04.

## Werdykt

**Kierunek produktu zachowany; plan poprawiony i wystarczający do rozpoczęcia PKG-001.** Nie jest uzasadnione stwierdzenie „wszystko jest już udowodnione”. Pierwszy przegląd sprawdził strukturę i źródła, ale nie wychwycił wszystkich luk w przepływach i kolejności prac. Poniżej zapisano konkretne poprawki. Dalsze bramki nadal wymagają działającego prototypu, danych obiektów i testów.

Pierwszy pakiet został ograniczony do **P01–P04**. Pełny prototyp P01–P12 zajmuje trzy pakiety, a nie jedną sesję. Cały plan zachowuje 40 głównych zadań i 20 skoczni; mapa obejmuje 33 pakiety sesyjne z obowiązkowym przekazaniem.

## Zakres przeglądu

Ponownie przeczytano 17 dokumentów pierwszej dostawy: główny README, indeks, GDD, gameplay, art/UI/audio, technikę, zawartość, plan, QA, decyzje, prompt, raport weryfikacji, oba opracowania badawcze, rejestr źródeł i dwa rejestry referencji. Porównano je z całym poleceniem użytkownika, w tym doprecyzowaniami o współczesnym sporcie, szczegółowym pixel arcie i nową zasadą kolejnych sesji.

Oceniono granice pakietów, wszystkie zależności Pxx, produkcję obiektów, terminalne stany rozgrywki, zegar/wejście, wczesne i późne testy, zapis, offline oraz prawdziwość deklaracji PASS. Ponownie sprawdzono wybrane artykuły FIS i dokumentację fullscreen/service worker. Nie powtarzano całego researchu ani nie przedstawiano indeksowanych tabel jako obejrzanych lokalnych PDF.

## Ustalenia i poprawki

Priorytet WYSOKI oznacza ryzyko błędnej implementacji lub blokady wykonania; ŚREDNI — brak specyfikacji/testu, który mógłby ujawnić się później.

| ID | Priorytet | Problem przed przeglądem | Rozstrzygnięcie |
|---|---|---|---|
| AR01 | WYSOKI | „Pakiet” oznaczał raz Pxx, raz P01–P12; brak stałej reguły następnego promptu | Rozdzielono Pxx od PKG-NNN. Dodano mapę 33 sesji, obowiązek raportu, auto-review, archiwum i aktywnego promptu w AGENTS/QA/workflow |
| AR02 | WYSOKI | Pierwszy handoff obejmował od pustego katalogu aż do fizyki, not i treningu | PKG-001 = P01–P04, PKG-002 = P05–P08, PKG-003 = P09–P12. Mniejsze, odbieralne wyniki; zakres produktu zachowany |
| AR03 | WYSOKI | Ukryte zależności: P03 potrzebował wejścia P04, P05 rendererów P11, P06 wykresu po P08, P21 niejasnego P30 | Minimalny gest w shellu, renderer diagnostyczny profilu, oddzielone momenty testów i jawne zależności artu P21/P32. P02 nie ma technicznej blokady od materiału wideo P01 |
| AR04 | WYSOKI | Wszystkie zdarzenia przed klatką mogły trafić do jednego ticka; replay nie wykryłby złego timingu klawiatury | Kontrakt czasów zdarzeń, sekwencji i kotwicy pauzy; nowe Q-SIM-09 i odbiór P04 na wejściu czasowanym |
| AR05 | WYSOKI | Upadek wymagał przejazdu FinishLine; skoczek zatrzymany wcześniej mógł nigdy nie dostać wyniku | Osobny terminalny `FallSettled` z ograniczonym czasem; Q-SIM-10 i test P08 |
| AR06 | WYSOKI | „W czerwonej fazie”, ale „zielone zamyka edycję” dopuszczało decyzję trenera w żółtej | Blokada od przejścia czerwone→żółte, również dla otwartego panelu; F02 §422.1 i Q-FIS-16 |
| AR07 | ŚREDNI | „Linie co 5 m” nie wskazywało pełnego zakresu i różnicy od podziałek bocznych | Jawne przedziały według P/K/HS/fall line, dodatkowy marker HS i boczny metraż; jeden distanceMap |
| AR08 | WYSOKI przed P13 | „Minimalny wynik 0” nie ustalało kolejności clamp wobec rekompensat | P09 ma jednoznaczną punktację długość+styl. Kolejność pełnej punktacji oznaczona jako Q03 do rozstrzygnięcia w P13 i test Q-FIS-17. Nie nazwano niepotwierdzonej reguły faktem FIS |
| AR09 | ŚREDNI | Playtest po P12 żądał konkursu i odczytu kompensat, które wtedy jeszcze nie istnieją | Dwa scenariusze odbioru: rdzeń po P12 i pełna gra przed wydaniem; Q-SIM w P04 nie udaje testów gotowego skoku |
| AR10 | ŚREDNI | Wymagano własnego błędu gry przy pierwszej wizycie offline bez pobranej aplikacji | Rozdzielono błąd przeglądarki przy braku shella od własnego błędu niepobranych assetów w działającej aplikacji |
| AR11 | WYSOKI przed zapisem | P19 zakładał statystyki/rekordy P29; blokada dwóch kart pojawiała się dopiero P37 | Minimalny reducer i jedna polityka rekordu oraz podstawowa blokada sesji już w P19; P20/P29/P37 rozszerzają, nie zastępują fundamentu |
| AR12 | ŚREDNI | Wspólne miejsce w pucharze nie było odróżnione od nierozstrzygniętej kolejności startowej | Wspólne miejsce jawnie ADAPT, kolejność startu z seeda; wskazano F03 §3.1.3 |
| AR13 | ŚREDNI | Raport pierwszej dostawy mógł wyglądać jak dowód kompletnego audytu merytorycznego | Oznaczono go jako historyczny i odróżniono formalny PASS od niniejszego przeglądu, pomiarów gry i niezamkniętych danych |

Dodatkowo poprawiono drobne zapisy techniczne, m.in. MP3 i odstępy, bez zmiany chronionych nazw plików ani kopiowania materiałów SJ3 do gry.

## Ponowna kontrola źródeł

F02 §417.3 potwierdza odrębne znaczenie oznaczeń, §422.1 wskazuje czerwoną fazę decyzji trenera, a §433.3 sam nie wystarcza do rozstrzygnięcia całego algorytmu z rekompensatami. F03 potwierdza bazowe formaty standardowe, drużynowe i Super Team; §3.1.3 odrębnie omawia kolejność startową przy nierozstrzygniętej równości. [ICR](https://assets.fis-ski.com/f/252177/x/c67426c343/icr-ski-jumping-2024_e_clean.pdf), [WC Men](https://assets.fis-ski.com/f/252177/x/2d9d6fc3b4/wcrglj-men-2024-e_markedup.pdf).

Fullscreen jest żądaniem asynchronicznym zależnym od gestu i może zostać odrzucony. Wniosek o pierwszej wizycie offline wynika z konieczności wcześniejszego pobrania/zainstalowania zasobów service workera, a nie z możliwości wyświetlenia gry bez jej kodu. [MDN fullscreen](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen), [MDN service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

## Walidacja formalna i jej granice

Dodano powtarzalny, tylko odczytujący dokumenty skrypt `docs/tools/validate-documentation.ps1`. Sprawdza lokalne linki, bloki kodu, znaki zastępcze kodowania, 40 zadań i ich pola, pełny graf zależności, pokrycie 58 jednostek zakresu przez 33 pakiety, listę 20 skoczni oraz hashe GIF/PDF. Opcja `-CheckActiveHandoff` sprawdza także numer, zakres i identyczność promptu aktywnego z archiwum.

Pierwsze uruchomienie po korektach planu, przed napisaniem nowego promptu: **PASS**, graf 40 zadań acykliczny, 33 pakiety, 58 jednostek zakresu, 20 skoczni. Znany brak katalogu `.github/skills/README.md` jest osobno raportowany; właściwe skille są dostępne w `.agents/skills/`. Końcowy wynik z aktywnym promptem znajduje się w `docs/evidence/PLANNING_REVIEW/VALIDATION.json`.

Końcowa kontrola po napisaniu promptu: **PASS / exit 0** — 22 dokumenty Markdown, 70 lokalnych odnośników sprawdzonych, 40 zadań, 33 pakiety i brak błędów. Jeden znany niedostępny odnośnik do katalogu skilli jest wydzielony jako `knownCatalogGaps`, nie ukryty w błędach. Zweryfikowano również kolejność zależności wewnątrz pakietów oraz zgodność hashy aktywnego promptu PKG-001 z jego archiwum. Nowa sesja ma wykonać P01–P04; po zamknięciu przygotuje prompt P05–P08. Implementacja pozostaje nierozpoczęta.

Skrypt nie ocenia przyjemności z gry, legalności wszystkich przyszłych assetów, zgodności pełnej fizyki z realnym sportem ani aktualności wszystkich 20 geometrii. Te oceny mają osobne bramki i zadania. Formalnie poprawny graf nie oznacza, że każde zadanie zmieści się w jednym z góry ustalonym czasie.

## Pozostałe niewiadome

- SJ3 nadal nie było rozegrane; materiał w ruchu jest obowiązkiem P01. Jeśli brak dostępu, trzeba zachować prawdziwy status i ukończyć niezależną część PKG-001; nie udawać obserwacji.
- Parametry aerodynamiczne, timingi, rozmiar sprite'a i wydajność 960×540 wymagają prototypu i pomiarów.
- Q03/Q05: próg coach, skompensowana długość, zaokrąglenia, dolne ograniczenie wyniku i agregator czujników muszą zostać rozliczone przed wdrożeniem odpowiednich funkcji P13/P16.
- Dane K/HS pięciu obiektów nie są pełnymi profilami. Karty wszystkich 20 skoczni dopiero powstaną w P21/P32.
- Nie ma jeszcze testów implementacji ani playtestu graczy. Nie deklarujemy PASS dla gotowej gry.

Powyższe nie uniemożliwia rozpoczęcia technicznego PKG-001; uniemożliwia natomiast uczciwe ogłoszenie gotowej gry lub pełnej zgodności całego przyszłego produktu już dziś.
