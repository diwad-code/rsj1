# Polityka dowodowa i świeżość

Stan wiedzy przejrzano 2026-08-29. Traktuj tę datę jako granicę aktualności, nie jako gwarancję wiecznej poprawności.

## Klasy decyzji

- `ACCEPT-HIGH`: stosuj jako mocną zasadę, nadal z uwzględnieniem gatunku i wyjątków.
- `ACCEPT-CONDITIONAL`: stosuj tylko przy jawnie spełnionych warunkach; zapisz ograniczenie języka, gatunku, modelu lub daty.
- `HEURISTIC`: używaj do ostrożnej sugestii; nigdy jako automatycznego wyroku ani dowodu autorstwa.
- `RESEARCH-ONLY`: opisuj jako lukę lub nieprzetestowaną hipotezę; nie uruchamiaj działania.
- `REJECT`: nie używaj jako reguły.

Nie podnoś siły dowodu. Zgodność kilku modeli nie jest niezależną replikacją.

## Rdzeń zaakceptowany

| ID | Dozwolone użycie | Status |
|---|---|---|
| S-P03 / P10 | Sprawdzaj ortografię i interpunkcję wobec aktualnego dokumentu RJP obowiązującego od 1 stycznia 2026. | `ACCEPT-HIGH`, bezpośrednie i normatywne PL |
| S-P01 / P09 | Zaostrz kontrolę zgody, rządu, szyku i referencji w polskich zdaniach złożonych. | `ACCEPT-CONDITIONAL`; modele i zadania z 2023 |
| S-P04 | Rozróżniaj normę wzorcową i użytkową. | `ACCEPT-HIGH`, normatywne PL |
| S-E01 | Upraszczaj trudną składnię, ale chroń specjalistyczną terminologię. | `ACCEPT-HIGH`, transfer pośredni |
| S-E02 | Zachowuj nagłówki, wyliczenia i sygnały struktury, gdy wspierają orientację. | `ACCEPT-CONDITIONAL` |
| S-L02 | Zakazuj blacklist słów i znaków; cechy stylometryczne silnie zależą od kontekstu. | `ACCEPT-CONDITIONAL`; angielski preprint 2026 |
| S-L03 | Ustalaj gatunek przed diagnozą stylu. | `ACCEPT-CONDITIONAL`; angielski preprint 2026 |
| S-H03 / P12 | Oceniaj konkretność, niuans kulturowy i różnorodność, nie potoczność. | `ACCEPT-CONDITIONAL`; wielojęzyczne, brak potwierdzenia PL |
| S-R01 | Chroń placeholdery, ICU/MessageFormat, markup i klucze. | `ACCEPT-HIGH`, wymóg techniczny |
| S-R02 | Uwzględniaj język dokumentu, objaśnienia i pomocne komunikaty błędów. | `ACCEPT-HIGH`, norma WCAG |
| S-R03 / S-R06 | Stosuj testy regresji i nie edytuj niepewnej widoczności. | `HEURISTIC`, inferencja inżynierska |
| S-R04 / S-R05 | Dziel długie formy semantycznie i utrzymuj rejestry stanu. | `ACCEPT-CONDITIONAL` + `HEURISTIC`; brak polskiego benchmarku |

## Odrzucone skróty myślowe

- `S-M01`: myślnik lub pauza jako marker AI — `REJECT`.
- `S-M02`: „to nie X, to Y” jako marker AI — `REJECT` jako reguła, `RESEARCH-ONLY` jako hipoteza. Oceniaj wyłącznie funkcję konkretnej antytezy.
- `S-M03`: trójpodział, lista lub nagłówek jako wada — `REJECT`.
- `S-M04`: angielskie listy „słów AI” przeniesione na polski — `REJECT`.
- `S-M05`: formalny, uporządkowany tekst jako dowód AI — `REJECT`.
- `S-M06`: detektor lub perplexity jako miara jakości — `REJECT`.
- `S-M07`: „bardziej ludzki” jako automatycznie potoczny, emocjonalny lub slangowy — `REJECT`.
- `S-M08`: neuroróżnorodność jako udowodniona przyczyna fałszywych alarmów — `RESEARCH-ONLY`.
- `S-M09`: detektory zawsze zawodzą lub zawsze mają bias — `REJECT` w wersji uniwersalnej.
- `S-M10/M11`: usunięcie „markerów AI” poprawia odbiór — `RESEARCH-ONLY`; nie zostało przetestowane wprost.

## Polityka detektorów

Nie stosuj wyniku detektora jako bramki, funkcji celu ani kryterium sukcesu. Możesz ostrzec, że wynik nie generalizuje między domenami, generatorami i populacjami. Nie twierdź, że polscy autorzy piszący po polsku są empirycznie wykazaną grupą dyskryminowaną przez detektory — brak takiej podstawy.

## Polityka świeżości

Rozróżniaj:

- trwałą gramatykę i składnię;
- wolniej zmieniającą się normę;
- uzus zależny od środowiska i gatunku;
- terminologię specjalistyczną;
- efemeryczny slang.

Nie dodawaj nowych słów tylko po to, by tekst brzmiał „2026”. Gdy zadanie wymaga aktualności po dacie przeglądu, a decyzja zależy od bieżącej normy lub uzusu, sprawdź aktualne źródło pierwotne, korpus albo słownik i podaj datę weryfikacji. Jeśli nie możesz tego zrobić, oznacz decyzję jako nieweryfikowaną i nie przedstawiaj jej jako aktualnej normy.

## Znane luki

Nie znaleziono recenzowanego, wielogatunkowego korpusu polskich tekstów LLM z kontrolą ludzką ani badania odbioru „AI-polszczyzny” przez polskich czytelników. Formułuj to jako stan kwerendy, nie dowód nieistnienia. Nie ma też zwalidowanych progów typu „ile intensyfikatorów na akapit”.
