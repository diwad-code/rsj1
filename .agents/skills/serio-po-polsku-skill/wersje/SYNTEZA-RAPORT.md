# Synteza krytyczna pięciu niezależnych researchów: poprawianie polszczyzny generowanej przez AI

*Kontrakt wiedzy dla modelu, który zbuduje finalny skill redakcyjny*

---

## 1. Metryka, data i stan kompletności wejść

| Parametr | Wartość |
|---|---|
| Data syntezy | 2026-08-29 |
| Rola | metodolog, recenzent naukowy, architekt wiedzy; **raporty modeli są wejściem do audytu, nie źródłem naukowym** |
| Wejścia | pięć pakietów: `wersje/cc_deepseek`, `wersje/claude`, `wersje/codex`, `wersje/gemini`, `wersje/minimax3` |
| Bramka kompletności | **ZDANA** — patrz tabela poniżej |
| Własna weryfikacja | 28 operacji weryfikacyjnych + 5 zapytań falsyfikujących (`SYNTEZA-SEARCHLOG.yaml`) |
| Źródła ponownie zweryfikowane niezależnie | 24 |
| Artefakty wyjściowe | `SYNTEZA-RAPORT.md`, `SYNTEZA-EVIDENCE-TABLE.md`, `SYNTEZA-CLAIM-AUDIT.md`, `SYNTEZA-SEARCHLOG.yaml`, `SYNTEZA-SOURCES.bib` |
| Pliki niezmodyfikowane | wszystkie katalogi modeli, ich prompty startowe, `wersje/SYNTEZA.md`, `skill-files/`, `references/`, `CLAUDE.md` |

### 1.1 Bramka kompletności

| Pakiet | PROTOKOL.md | SEARCHLOG.yaml | EVIDENCE-TABLE.md | RAPORT.md | CLAIM-AUDIT.md | SOURCES.bib | Status |
|---|---|---|---|---|---|---|---|
| `cc_deepseek` | 16 KB | 25 KB | 27 KB | 51 KB | 22 KB | 32 KB | ✅ kompletny |
| `claude` | 8,7 KB | 5,5 KB | 21 KB | 52 KB | 11 KB | 27 KB | ✅ kompletny |
| `codex` | 14 KB | 26 KB | 13 KB | 66 KB | 8,8 KB | 19 KB | ✅ kompletny |
| `gemini` | 5,7 KB | 1,1 KB | 6,8 KB | 12 KB | 2,7 KB | 5,2 KB | ✅ kompletny (najcieńszy) |
| `minimax3` | 12 KB | 14 KB | 51 KB | 58 KB | 19 KB | 40 KB | ✅ kompletny |

Wszystkie wymagane pliki są obecne, czytelne i niezerowe. Żaden `RAPORT.md` nie jest promptem startowym — sprawdzono nagłówki i treść. `wersje/SYNTEZA-BRAKI.md` nie istniał i nie został utworzony.

**Zastrzeżenie:** bramka sprawdza obecność, nie jakość. Pakiet `gemini` przechodzi ją formalnie, ale jego baza dowodowa i audyt tez są istotnie słabsze — patrz sekcja 3.

---

## 2. Metody syntezy i ponownej weryfikacji

Praca przebiegała w sześciu etapach.

**Inwentaryzacja bez uśredniania.** Każdy pakiet przeczytano osobno i opisano niezależnie: zakres, bazy, kryteria, liczbę i typ źródeł, udział materiału bezpośrednio polskiego, oceny jakości, tezy kluczowe, tezy odrzucone, wkład unikatowy i potencjalne błędy. Długość ani stanowczość raportu nie były argumentem.

**Normalizacja do tez atomicznych.** Twierdzenia rozbito na 53 tezy o jednym zakresie każda, z rejestrem: źródła, lokalizator, poziom dostępu, status polski, niezależność dowodu, dowody przeciwne, werdykt i dozwolone użycie w skillu (`SYNTEZA-EVIDENCE-TABLE.md`).

**Macierz zgodności.** Zgodność modeli oceniano nie ilościowo, lecz przez pytanie: *czy pakiety opierają się na niezależnych dowodach, czy na tym samym artykule?* Kolumna „Niezależność” w tabeli dowodów zawiera wartość `1 ŹRÓDŁO` tam, gdzie pozorna zbieżność maskuje pojedynczą podstawę.

**Ponowna weryfikacja w internecie.** Wykonano własny research uzupełniający: rozwiązywanie DOI przez Crossref, kontrola metadanych, abstrakty ACL Anthology i arXiv, karty zbiorów, strony instytucji normatywnych. Wykonano **osobne zapytania falsyfikujące** dla pięciu tez nośnych. Log własny znajduje się w `SYNTEZA-SEARCHLOG.yaml` i **nie kopiuje** logów pakietów.

**Poziom dostępu jest deklarowany.** Nie miałem pełnych tekstów za paywallem. Rekordy sprawdzone wyłącznie na poziomie metadanych są oznaczone `ACCESS: METADATA-ONLY` i **nie mogą samodzielnie uzasadniać reguły działania skilla**. Nigdzie nie twierdzę, że sprawdziłem fragment, którego nie widziałem.

**Ograniczenia własne.** Brak dostępu do Retraction Watch API — kontrolę korekt oparto o metadane Crossref i strony wydawców; nie znaleziono sygnałów retrakcji dla weryfikowanych rekordów, co nie jest gwarancją. Nie podaję pełnych hit-countów baz, bo interfejsy nie zwracały ich wiarygodnie; log podaje operacje i decyzje, nie bibliometrię. Zweryfikowałem tezy nośne dla kontraktu i źródła cytowane przez co najmniej dwa modele — nie wszystkie ~200 rekordów z pięciu pakietów.

---

## 3. Ocena jakości pięciu pakietów — bez rankingu modeli

Poniższa ocena dotyczy **artefaktów**, nie modeli. Każdy pakiet ma obszar, w którym jest najmocniejszy, i obszar, w którym się myli.

### 3.1 `codex`

- **Zakres:** przegląd zakresowy z jawnym PECO, jedenaście podpytań, 28 zalogowanych batchy zapytań, 42 rekordy po deduplikacji.
- **Bazy i daty:** Crossref, ACL Anthology, strony wydawców, ISO, W3C, Unicode. MCP niedostępne — odnotowane jako amendment protokołu v1.1 i v1.2.
- **Udział materiału polskiego:** trzy pozycje bezpośrednie (Mazur, Dadas, PolEval).
- **Wkład unikatowy — najsilniejszy w całym materiale:** taksonomia klas widoczności tekstu w repozytorium (V1/V2/V3/P1/P2/G), kontrakt ochrony oparty na UTS #35 i ICU, reguła „kandydat o niepewnej widoczności trafia do raportu, nie do zmiany”, jawne oznaczanie tez jako `INFERENCJA INŻYNIERSKA`, domyślny `no-op` dla tekstu dobrego, wykrycie korekty abstraktu przy Gainey et al.
- **Błędy:** umieszczenie pracy o „Polish Ratio” w sekcji o źródłach polskich mimo poprawnego opisu w tabeli dowodów; jednostronne streszczenie Casal et al. (pominięta konwergencja nowszych modeli); opisanie Sadasivan jako preprintu z 2023 mimo publikacji TMLR ze stycznia 2025.
- **Ocena:** najwyższa dyscyplina epistemiczna. Konsekwentnie rozdziela dowód od interpretacji i nie zamienia hipotez w reguły.

### 3.2 `cc_deepseek`

- **Zakres:** PICO, 14 podpytań, osobne zapytania potwierdzające i falsyfikujące, ~90 rekordów w bazie dowodowej, PRISMA-style counts.
- **Wkład unikatowy:** cała oś **percepcji i psychologii odbioru**, nieobecna lub marginalna w pozostałych pakietach — kara za ujawnienie autorstwa, wyższe oceny tekstu AI w warunkach ślepych, rola zaimków osobowych w wciąganiu czytelnika. Dalej: rozróżnienie **sygnału populacyjnego** od **markera indywidualnego**, falsyfikowalny plan ewaluacji z pre-rejestrowanym kryterium **porażki** skilla, jawne oznaczenie tezy o neuroróżnorodności jako niezweryfikowanej, wykrycie własnych błędów cytacyjnych i ich naprawa (9 napraw odnotowanych w raporcie).
- **Błędy:** inicjały autorów Guo/Shang/Clavel; opisanie Sadasivan jako preprintu.
- **Ocena:** najlepsza samokrytyka. Jedyny pakiet, który zapisał kryterium, przy którym skill należy uznać za nieskuteczny.

### 3.3 `claude`

- **Zakres:** 14 pytań, pięciu scoutów, 52 źródła włączone, ~2480 odrzuconych.
- **Wkład unikatowy:** najlepiej opracowana **warstwa normatywna polszczyzny** — rozróżnienie normy wzorcowej i użytkowej, reforma ortograficzna 2026, prosty język w wydaniu polskim, macierz gatunków i typologia mikrokopii UI. Jawne etykiety `DIRECT / INDIRECT / SPECULATIVE` i konsekwentne oznaczanie hipotez redakcyjnych.
- **Błędy — najpoważniejsze w całym materiale:** **dwie niezgodności cytacja–teza w sekcji „Wiedza bezpośrednia o polszczyźnie (DIRECT)”**. Machura (2024) to praca o apelatywizacji nazwy „ChatGPT”, a nie o schematyzmie składniowym, kalkowaniu SVO, imiesłowach ani rekcji; podany DOI nie rozwiązuje się, rok jest błędny. Wróblewska et al. (2025) to praca o formach równościowych z asteryskiem inkluzywnym; podany DOI, lista autorów i tytuł są błędne, a przypisana teza wykracza poza zakres. Dalej: rozmiar zbioru ŚMIGIEL zawyżony ok. siedmiokrotnie; błędny DOI dla Guo/Shang/Clavel.
- **Ocena:** najmocniejsza warstwa polonistyczna, ale jej rdzeń „DIRECT” po weryfikacji nie utrzymuje się. Zastrzeżenie samego pakietu („to analizy jakościowe, nie eksperymenty”) było trafne, lecz niewystarczające — problemem nie jest siła dowodu, tylko to, że przywołane prace mówią o czym innym.

### 3.4 `minimax3`

- **Zakres:** scoping + comparative + mechanistic, 24 zapytania w klastrach A–J, 89 rekordów, w tym 32 preprinty i 5 pozycji branżowych z rolą tła.
- **Wkład unikatowy:** najszersza **macierz gatunków** (od etykiety przycisku po całą książkę, z ryzykiem schematyczności i listą niedopuszczalnych uproszczeń), najpełniejszy **workflow książki** (karta głosu, glosariusz, rejestr postaci, chronologia, kontrola międzyrozdziałowa, ochrona odrębności głosów postaci), autorytety języka inkluzywnego, oraz postulat, by tryb „zostaw bez zmian” był **aktywną rekomendacją, a nie pasywną opcją**.
- **Błędy:** sfabrykowana lista autorów Reinhart et al.; błędny DOI Lianga; zaklasyfikowanie pracy o „Polish Ratio” jako polskiego benchmarku; duży udział źródeł branżowych i blogowych przy relatywnie cienkiej warstwie recenzowanej dla części tez redakcyjnych.
- **Ocena:** najbardziej użyteczny operacyjnie dla długich form, przy najsłabszej higienie metadanych wśród czterech mocniejszych pakietów.

### 3.5 `gemini`

- **Zakres:** 13 pytań, trzech scoutów, 19 źródeł.
- **Wkład unikatowy:** wymiar **transferu międzyjęzykowego detektorów** (MULTITuDE, MultiSocial) oraz wymiar **strategii dekodowania** wniesiony przez Rallapalli et al. — obie perspektywy realnie uzupełniają pozostałe pakiety. Sam Rallapalli okazał się przy weryfikacji jednym z ważniejszych źródeł całej syntezy.
- **Błędy:** brak DOI w całej bibliografii; pozycje z autorami zastępczymi („Anonymous”, „PROSE contributors”, „Vigilant Project”); **niezgodność cytacja–teza** przy PROSE — praca o wnioskowaniu preferencji użytkownika z próbek pisania została użyta jako dowód na „rejestr staccato tłumiący głos autora”, czego nie zawiera; błąd atrybucji inwersji polaryzacji perplexity; zawyżony rozmiar zbioru ŚMIGIEL i błędne venue.
- **Krytyczne:** `CLAIM-AUDIT.md` przyznaje **wszystkim ośmiu tezom komplet znaczników EXISTS / SUPPORTS / SCOPE / LIVE**, w tym tezie, której źródło nie wspiera. Audyt, w którym nic nie przepada, nie jest audytem.
- **Ocena:** wniósł dwa cenne wątki, ale jego warstwa weryfikacyjna nie spełnia progu repozytorium. Zawartość merytoryczna nadaje się do przejęcia **wyłącznie po ponownym sprawdzeniu każdego rekordu** — co w tej syntezie wykonano.

---

## 4. Mapa źródeł, duplikatów i niezależności dowodów

### 4.1 Trzy klasy zbieżności

**Zbieżność uzasadniona — wiele niezależnych linii dowodowych.**
Teza o niewiarygodności detektorów jako narzędzia rozstrzygania o autorstwie opiera się na trzech niezależnych liniach: test narzędzi rynkowych (Weber-Wulff i in., 2023), analiza odporności czterech klas detektorów wobec ataku parafrazującego (Sadasivan i in., 2025) oraz benchmark międzydomenowy (Baidya i in., 2026, preprint). Do tego dochodzi bezpośredni wynik polski (Przybyła i in., 2025). Tutaj zgodność pięciu pakietów odzwierciedla realną zbieżność dowodów.

**Zbieżność pozorna — jedno źródło pod pięcioma raportami.**
Teza o systematycznym uprzedzeniu detektorów wobec osób nie-native występuje we wszystkich pięciu pakietach i we wszystkich opiera się na **tym samym artykule** (Liang i in., 2023). Żaden pakiet nie znalazł ani nie zacytował dwóch istniejących kontrdowodów. To jest wzorcowy przypadek sytuacji opisanej w zasadach zadania: liczba modeli powtarzających tezę nie podnosi jakości dowodu.

**Zbieżność błędu.**
Pakiety `claude` i `gemini` niezależnie podają rozmiar zbioru ŚMIGIEL jako „462 000+”. Rzeczywisty rozmiar to **64 538 tekstów**. Poprawną wartość podał wyłącznie `cc_deepseek`. Synteza oparta na głosowaniu przyjęłaby błąd stosunkiem 2:1 przeciw prawdzie.

### 4.2 Rdzeń wspólny i obrzeża

Pięć pakietów zbiega się na niewielkim rdzeniu (detektory, zakaz blacklisty, luka polska) i rozchodzi się na obrzeżach, przy czym obrzeża są tu najcenniejsze:

| Obszar | Pakiety pokrywające | Charakter |
|---|---|---|
| Detektory i ich granice | 5/5 | rdzeń, dobrze uzasadniony |
| Zakaz blacklisty słów i znaków | 5/5 | rdzeń, uzasadniony dopiero po dodaniu El Attar i in. (2026) |
| Luka polska | 5/5 | rdzeń, potwierdzony niezależnie |
| Percepcja i psychologia odbioru | 1/5 (`cc_deepseek`) | obrzeże o wysokiej wartości |
| Kontrakt repozytorium i klasy widoczności | 1/5 (`codex`) | obrzeże o wysokiej wartości |
| Workflow książki i macierz gatunków | 2/5 (`minimax3`, częściowo `claude`) | obrzeże o wysokiej wartości |
| Norma polska i reforma 2026 | 2/5 (`claude`, `minimax3`) | obrzeże o wysokiej wartości, jedyne pewne PL |
| Strategie dekodowania i transfer detektorów | 1/5 (`gemini`) | obrzeże wartościowe mimo słabej weryfikacji |

**Wniosek dla budowniczego skilla:** wartość pięciu pakietów leży nie w ich rdzeniu, lecz w rozłącznych obrzeżach. Skill zbudowany na częściach wspólnych byłby uboższy niż każdy z pakietów z osobna.

---

## 5. Konsensus, spory i rozstrzygnięcia

### 5.1 Konsensus wytrzymujący weryfikację

1. **Nie istnieje lista „AI-izmów”, którą można usunąć z polskiego tekstu.** Po weryfikacji ta teza ma mocniejszą podstawę, niż podał którykolwiek pakiet: El Attar i in. (2026) przebadali **284 cechy lingwistyczne** na wyjściach **27 modeli** w **10 domenach** i stwierdzili, że większość wcześniej proponowanych wskaźników jest **silnie zależna od kontekstu**; jedynym sygnałem odpornym między rodzinami modeli i domenami pozostają miary **bogactwa leksykalnego**. Zakaz blacklisty nie jest więc postulatem etycznym, lecz wnioskiem empirycznym.
2. **Wynik detektora nie jest miarą jakości.** Wzmocnione przez Herbold i in. (2023) oraz Porter i Machery (2024): tekst generowany bywa w ocenie ślepej oceniany **wyżej** niż ludzki.
3. **Detekcja załamuje się poza domeną i generatorem — także po polsku.** PolEval 2025: ponad 90% accuracy na głównym zbiorze, spadek na nieznanych domenach i generatorach, przewaga metod nienadzorowanych w najtrudniejszym scenariuszu.
4. **Brakuje polskich danych.** Nie istnieje recenzowane, wielogatunkowe badanie korpusowe cech polskiego tekstu LLM z kontrolowanym korpusem ludzkim, ani badanie percepcji „AI-polszczyzny” przez polskich czytelników. Potwierdzone własną kwerendą.

### 5.2 Spory rozstrzygnięte

**Spór 1 — czy ludzie rozpoznają tekst LLM?**
Pytanie rozstrzygające: *kto ocenia, w jakim trybie, w którym roku i w jakim języku?*
Clark i in. (2021) badali nieprzeszkolonych oceniających crowdsourcingowych na modelach sprzed 2022. Russell i in. (2025) badali osoby regularnie używające LLM na modelach komercyjnych 2024–2025: **większość głosów panelu pięciu takich osób myli się na 1 z 300 artykułów**, także wobec parafrazy i „humanizacji”. Wang i in. (ACL 2026 Main) uzyskali **87,6% średniej trafności** przy 19 anotatorach, 9 językach i 9 domenach.
**Rozstrzygnięcie:** sprzeczność znika po wprowadzeniu moderatorów — ekspozycja na LLM, agregacja panelowa, rok, język i domena. Teza „ludzie nie potrafią odróżnić” jest **ograniczona do nieprzeszkolonych oceniających i epoki sprzed 2022** i nie może uzasadniać żadnej obietnicy skilla.

**Spór 2 — homogenizacja czy idiolekty modeli?**
Reinhart i in. (2025) wykazują różnice **między modelami**, Guo i in. (2025) — spadek różnorodności **wewnątrz** wyjść modelu.
**Rozstrzygnięcie:** oba twierdzenia są prawdziwe na różnych poziomach analizy. Wariancja wewnątrzmodelowa spada, odrębność międzymodelowa się utrzymuje. Nie jest to sprzeczność, tylko dwie różne wielkości mylone przez wspólne słowo „różnorodność”.

**Spór 3 — czy tekst AI jest gorszy?**
**Rozstrzygnięcie przez warunek ujawnienia.** W ocenie ślepej bywa lepszy (Herbold 2023; Porter i Machery 2024). Po ujawnieniu autorstwa jest deprecjonowany (Raj i in., 2026). Są to dwa różne zjawiska: jakość tekstu i społeczna reakcja na jego proweniencję. Skill działa na pierwszym i nie ma wpływu na drugie.

**Spór 4 — czy „burstiness” jest wiarygodnym sygnałem?**
`minimax3` traktuje niską wariancję długości zdań jako sygnał o wysokiej pewności; `cc_deepseek` odrzuca go.
**Rozstrzygnięcie na korzyść `cc_deepseek`, ale z innym uzasadnieniem:** El Attar i in. (2026) pokazują, że poza bogactwem leksykalnym praktycznie żadna cecha nie generalizuje między modelami i domenami. Burstiness jest więc obserwacją kontekstową, nie regułą. Dodatkowo Baidya i in. (2026) oraz Al Ali i in. (2026) raportują inwersję polaryzacji miar opartych na perplexity dla współczesnych modeli.

### 5.3 Spór rozstrzygnięty przeciw wszystkim pięciu pakietom

**Spór 5 — czy polscy autorzy są zagrożeni fałszywymi pozytywami detektorów?**

Wszystkie pięć pakietów odpowiada twierdząco, wszystkie na podstawie Liang i in. (2023) — badania, w którym osoby z pierwszym językiem innym niż angielski pisały **po angielsku**, a detektory opierały się na perplexity.

Weryfikacja ujawnia dwa kontrdowody, których nie znalazł żaden pakiet:

- **Jiang, Hao, Fauss i Li (2024)**, *Computers & Education* 217 — na dużych, dobrze próbkowanych danych GRE detektory oparte na e-rater i perplexity działają bardzo dobrze i badanie nie replikuje prostej tezy o biasie.
- **Al Ali, Helcl i Libovický (2026)**, arXiv:2602.05769 *(preprint, nierecenzowany)* — replikacja **w języku czeskim**, czyli w języku słowiańskim i fleksyjnym, najbliższym dostępnym analogu polszczyzny: perplexity tekstów osób nie-native **nie jest niższa** niż native, trzy rodziny detektorów **nie wykazują systematycznego biasu**, a współczesne detektory działają bez opierania się na perplexity.

**Rozstrzygnięcie:** teza Lianga zostaje **zawężona** do scenariusza „L2 pisze po angielsku, detektor oparty na perplexity, stan 2023”. Transfer na scenariusz „Polak pisze po polsku” **traci podstawę empiryczną i zostaje odrzucony jako fakt**.

**Co z tego wynika dla skilla:** ostrzeżenie przed oskarżaniem kogokolwiek na podstawie detektora **pozostaje w mocy**, ale jego uzasadnieniem jest zawodność i niegeneralizowalność metody (S-D01–S-D03), a nie twierdzenie o dyskryminacji polskich autorów, którego nie wiemy. To rozróżnienie ma znaczenie: uzasadnienie fałszywe podważa wiarygodność słusznego zalecenia.

### 5.4 Trzy niezgodności cytacja–teza wykryte w pakietach

| # | Pakiet | Przywołane źródło | Przypisana teza | Co źródło naprawdę zawiera | Decyzja |
|---|---|---|---|---|---|
| X-01 | `claude` | Machura (2024), *Język Polski* | schematyzm składniowy, kalkowanie szyku SVO, nadużywanie imiesłowów, błędy rekcji w polszczyźnie LLM | artykuł **onomastyczny** o apelatywizacji nazwy „ChatGPT”; DOI nie rozwiązuje się, rok błędny | **DROP** |
| X-02 | `claude` | Wróblewska i in. (2025), *Język Polski* | gubienie uzgodnień morfosyntaktycznych w zdaniach złożonych | koncepcja **form równościowych z asteryskiem inkluzywnym**; DOI, autorzy i tytuł błędne | **DROP** |
| X-03 | `gemini` | PROSE (Aroca-Ouellette i in., 2025) | LLM tworzą „rejestr staccato tłumiący głos autora”; edycja ludzka jest punktowa i chroni humor | metoda **wnioskowania opisu preferencji użytkownika z próbek jego pisania**, porównana z CIPHER na zadaniach streszczania i pisania e-maili | **DROP** dla tezy; **przekwalifikowane** jako podstawa techniczna „karty głosu” |

**Konsekwencja X-01 i X-02:** teza o kalkowaniu szyku SVO, błędach rekcji i nadużywaniu imiesłowów w polszczyźnie generowanej przez modele **traci swoją jedyną deklarowaną podstawę „DIRECT”**. Pozostaje hipotezą redakcyjną. Jest to obserwacja praktyków warta zbadania — ale nie wolno jej podawać jako ustalenia.

---

## 6. Co wiadomo bezpośrednio o polskim

To najkrótsza sekcja tego raportu i tak musi pozostać. Rozdzielam trzy rzeczy, których pakiety często nie rozdzielały: **dowód bezpośredni dla polskiego**, **transfer międzyjęzykowy** i **hipotezę redakcyjną**.

### 6.1 Dowód bezpośredni (`DIRECT`) — cztery pozycje

1. **Detekcja.** PolEval 2025, zadanie Śmigiel (Przybyła, Strebeyko i Wróblewska, 2025): pierwszy shared task detekcji tekstu maszynowego dla polskiego, trzy tory, siedem systemów. Ponad 90% accuracy na głównym zbiorze; **spadek przy nieznanych domenach i generatorach**; w najtrudniejszym scenariuszu metody nienadzorowane wypadają lepiej niż nadzorowane. Zbiór ŚMIGIEL: **64 538 tekstów, 8 generatorów** (Llama, Mistral, Bielik, PLLuM, Gemma), **6 domen** (Wikipedia, literatura i abstrakty, media społecznościowe, recenzje, wiadomości, debaty parlamentarne).
2. **Poprawność językowa.** Mazur (2024), *LingVaria*: w zadaniach wzorowanych na maturze 2023 błędy ChatGPT koncentrują się w **tekstach z konstrukcjami złożonymi**, gdzie poprawne sformułowanie wymaga całościowej kontroli gramatycznej. To jedyny bezpośredni polski wynik nadający się na regułę operacyjną.
3. **Kompetencja.** Dadas i in. (2025): benchmark PLCC, 600 ręcznie przygotowanych pytań o gramatykę, słownictwo i kulturę. Mierzy **kompetencję zadaniową**, nie naturalność swobodnego tekstu.
4. **Norma.** Rada Języka Polskiego przy Prezydium PAN: od **1 stycznia 2026** dokument „Zasady pisowni i interpunkcji polskiej” jest **jedynym obowiązującym** źródłem zasad ortograficznych i interpunkcyjnych. Zmiany ogłoszono komunikatem z 10 maja 2024; wersja jednolita stanowi załącznik do komunikatu 11/25.

### 6.2 Pozycje o niepewnym statusie

- **Mazurkiewicz-Sokołowska (2025)**, *LNNS*: analiza poprawności językowej produktów ChatGPT obejmująca angielski, niemiecki i polski. Rekord potwierdzony, **abstraktu nie widziałem** — treści ustaleń nie potwierdzam.
- **Marquardt (2024)**, *Poznańskie Studia Polonistyczne*: typologia kroków dialogowych ChatGPT-3.5 i ich wykładników gatunkowych. **Nowy trop wniesiony przez tę syntezę** — nie znalazł go żaden pakiet. Z abstraktu nie wynika, czy analizowany materiał był polskojęzyczny; artykuł opublikowano po angielsku.

### 6.3 Czego bezpośrednio o polskim **nie** wiadomo

- Nie ma korpusowego badania cech stylistycznych polskiego tekstu LLM z kontrolowanym korpusem ludzkim w wielu gatunkach.
- Nie ma badania percepcji: jak polscy czytelnicy oceniają naturalność, jakość i głos tekstów generowanych po polsku.
- Nie ma polskiego odpowiednika analiz nadreprezentacji leksykalnej.
- Nie ma danych o fałszywych pozytywach detektorów dla polskich autorów piszących po polsku.
- Nie ma polskiego benchmarku długiej formy z rejestrem faktów, postaci, punktu widzenia i chronologii.
- RJP nie wydała stanowiska normatywnego dotyczącego stylu tekstów generowanych.

**Zastrzeżenie o formule:** wszystkie powyższe zdania znaczą „nie znalazłem”, nie „nie istnieje”. Indeksacja polskich czasopism humanistycznych w bazach globalnych jest słaba.

### 6.4 Pułapka terminologiczna, którą trzeba zapisać

Praca **Yang, Jiang i Li (2024), „Is ChatGPT Involved in Texts? Measure the Polish Ratio…”** nie ma nic wspólnego z językiem polskim. „Polish Ratio” to miara **stopnia wypolerowania** tekstu przez ChatGPT (ang. *to polish*), a zbiór HPPT to pary tekstów ludzkich i **angielskich abstraktów akademickich wypolerowanych** przez model. Pakiet `minimax3` zaklasyfikował ją jako polski benchmark detekcji; `codex` opisał poprawnie w tabeli dowodów, ale umieścił w sekcji o źródłach polskich.

Warto to odnotować podwójnie: pomijając nieporozumienie, zbiór HPPT jest merytorycznie **najbliższy zadaniu skilla** ze wszystkich napotkanych zasobów, bo modeluje dokładnie sytuację „człowiek napisał, model wypolerował”.

---

## 7. Skonsolidowana taksonomia wzorców

Katalog scala synonimiczne rekordy z pięciu pakietów, ale **nie łączy różnych mechanizmów** tylko dlatego, że dają podobne wrażenie. Przykłady są **ilustracyjne, ułożone przeze mnie** — nie pochodzą z korpusu i nie są materiałem badawczym.

### 7.0 Zasady katalogu

1. **Wzorzec jest konfiguracją cech w funkcji gatunku i odbiorcy, nie tokenem.** Pojedyncza cecha nigdy nie uruchamia automatycznej zmiany.
2. **Rozpoznanie gatunku poprzedza diagnozę.** Rallapalli i in. (2026) pokazują, że gatunek wpływa na profil cech stylistycznych **silniej niż samo źródło tekstu**. Diagnoza bezgatunkowa jest metodologicznie nieuprawniona.
3. **Każdy rekord ma datę i warunek modelowy.** Casal i in. (2025) pokazują, że nowsze modele **zbliżają się** do ludzkich wzorców. Wynik z 2023 nie opisuje modelu z 2026.
4. **Brak blacklisty słów, znaków interpunkcyjnych i konstrukcji.** Podstawa: El Attar i in. (2026).

---

### P01 · Uniformizacja leksykalna
- **Poziom:** dokument / akapit / leksyka
- **Definicja operacyjna:** obniżona różnorodność słownikowa w obrębie tego samego gatunku i tematu; nawroty do tych samych wyrazów tam, gdzie autor ludzki sięgnąłby po wariant, przeformułowanie lub elipsę.
- **Przykład ilustracyjny (schematyczny):** *„Kwestia jest ważna. Ważne jest, by podejść do niej właściwie. Właściwe podejście zapewni dobre wyniki.”*
- **Przykład ilustracyjny (naturalny):** *„Rzecz jest ważna — na tyle, że warto się przy niej zatrzymać dłużej, niż zwykle mamy ochotę.”*
- **Dowód:** El Attar i in. (2026) — **jedyna cecha odporna** między 27 modelami i 10 domenami; Guo i in. (2025); Reinhart i in. (2025). Wszystko: angielski.
- **Status dla polskiego:** `INDIRECT`. Uwaga metodyczna: polska fleksja zawyża powierzchniowe miary różnorodności typu type/token liczonej na formach. Pomiar musi iść po **lematach**, nie po formach.
- **Zależność:** gatunek, długość, temperatura, model.
- **Cechy współwystępujące wymagane do diagnozy:** ubóstwo leksykalne **plus** brak funkcji terminologicznej **plus** brak wymuszenia gatunkowego.
- **Kontrprzykłady:** dokumentacja techniczna wymaga jednolitości terminu; prosty język **celowo** ogranicza zasób; tekst prawny nie dopuszcza synonimii terminów.
- **Ryzyko fałszywego alarmu:** wysokie w tekstach specjalistycznych i w prostym języku.
- **Strategia:** wariant leksykalny lub elipsa **tylko** poza terminologią; nigdy globalna podmiana synonimów.
- **Elementy chronione:** terminy kontrolowane, nazwy własne, marki, cytaty.
- **Test:** czy po zmianie zdanie mówi to samo, z tą samą siłą i tym samym zakresem?
- **Zostaw bez zmian, gdy:** powtarzalność jest wymogiem gatunku lub warunkiem spójności terminologicznej.
- **Werdykt:** `ACCEPT-CONDITIONAL` · pewność umiarkowana (EN), hipoteza dla PL.

---

### P02 · Analityzmy werbo-nominalne i abstrakcyjna rzeczownikowość
- **Poziom:** zdanie / fraza
- **Definicja operacyjna:** czasownik rozłożony na rzeczownik odsłowny plus czasownik pusty (*dokonać weryfikacji* zamiast *zweryfikować*), przy jednoczesnym zniknięciu sprawcy i konkretnego obiektu.
- **Dowód:** Jiang i Hyland (2024) — więcej pakietów rzeczownikowych i przyimkowych w tekstach ChatGPT; Reinhart i in. (2025) — przesunięcia gęstości nominalnej. **Wszystko angielskie.** Dla polszczyzny podstawą jest tradycja stylistyki normatywnej i prostego języka, **nie** badanie nad LLM.
- **Status dla polskiego:** `INDIRECT` jako cecha LLM; **problem stylistyczny polszczyzny urzędowej udokumentowany na długo przed modelami**. Nie wolno przypisywać modelom tego, co jest cechą polskiego rejestru urzędowego.
- **Kontrprzykłady:** *dokonać pomiaru* (jednokrotnie, kompletnie) ≠ *mierzyć* (trwa) — zamiana zmienia **aspekt**; *podjąć decyzję* ≠ *zdecydować*; nominalizacja bywa terminem.
- **Ryzyko fałszywego alarmu:** wysokie w prawie, nauce i procedurach.
- **Strategia:** rozłóż tylko wtedy, gdy rośnie zrozumiałość, aspekt się nie zmienia i nie znika termin.
- **Elementy chronione:** aspekt, modalność, zakres obowiązku, terminologia.
- **Zostaw bez zmian, gdy:** bezosobowość jest gatunkowa, dowodowa lub chroni prywatność.
- **Werdykt:** `ACCEPT-CONDITIONAL` · wysoka jako diagnoza stylistyczna PL, **hipoteza** jako marker AI.

---

### P03 · Spiętrzenie dopełniacza
- **Poziom:** fraza / zdanie
- **Definicja operacyjna:** łańcuch trzech lub więcej fraz rzeczownikowych w dopełniaczu bez granicy prozodycznej: *problem efektywności zarządzania procesem oceny wyników*.
- **Dowód:** **brak badania nad polskim tekstem LLM.** Podstawa: stylistyka normatywna polszczyzny plus Martínez, Mollica i Gibson (2022), którzy pokazują, że trudność przetwarzania bierze się ze **sposobu pisania**, a nie z pojęć.
- **Status dla polskiego:** `HEURISTIC` jako marker AI; **wysoka pewność jako problem stylistyczny**.
- **Kontrprzykłady:** ustalone terminy wielowyrazowe (*indeks masy ciała*, *postępowanie administracyjno-sądowe*).
- **Strategia:** rozwiń łańcuch w zdanie podrzędne lub frazę przyimkową; zamień jeden człon na przymiotnik.
- **Zostaw bez zmian, gdy:** to termin o ustalonym kształcie.
- **Werdykt:** `HEURISTIC` · umiarkowana.

---

### P04 · Metatekst bez funkcji nawigacyjnej
- **Poziom:** akapit / sekcja
- **Definicja operacyjna:** zapowiedź tego, co zaraz zostanie powiedziane, i streszczenie tego, co już powiedziano, **przy braku przyrostu informacji lub nawigacji**.
- **Dowód:** Jiang i Hyland (2024) — więcej pakietów sygnalizujących przejście i strukturę w tekstach ChatGPT. Angielski, eseje argumentacyjne.
- **DOWÓD PRZECIWNY, krytyczny:** Mautone i Mayer (2001) — sygnalizowanie struktury **poprawia przyswajanie treści**. Metatekst nie jest wadą; wadą jest metatekst pusty.
- **Status dla polskiego:** `INDIRECT`.
- **Cechy współwystępujące wymagane do diagnozy:** zapowiedź **plus** brak nowej informacji **plus** obecność nagłówka, który już pełni tę funkcję.
- **Ryzyko fałszywego alarmu:** bardzo wysokie. Streszczenia wykonawcze, wprowadzenia akademickie i teksty dydaktyczne sygnalizują strukturę **celowo i słusznie**.
- **Strategia:** usuń wyłącznie wystąpienie redundantne; nie usuwaj **struktury**, tylko pustą ramę.
- **Zostaw bez zmian, gdy:** rama sygnalizuje strukturę, bezpieczeństwo lub przewidywalność potrzebną odbiorcy.
- **Werdykt:** `ACCEPT-CONDITIONAL` · umiarkowana.

---

### P05 · Redundantne powtórzenie tezy
- **Poziom:** akapit / sekcja
- **Definicja operacyjna:** teza, jej parafraza i konkluzja bez nowej konsekwencji — trzy razy to samo innymi słowami.
- **Dowód:** pośredni (Jiang i Hyland 2024; Herbold i in. 2023 o sztywności konkluzji). `HEURISTIC`.
- **Kontrprzykłady:** redundancja dostępnościowa; instrukcja dla początkujących; ostrzeżenie wymagane prawem.
- **Strategia:** zachowaj pierwszą pełną tezę; ostatnie zdanie zostaw tylko, gdy wnosi działanie lub konsekwencję.
- **Test:** ekstrakcja twierdzeń przed i po — liczba twierdzeń i warunków **nie może** się zmienić.
- **Werdykt:** `ACCEPT-CONDITIONAL` · umiarkowana.

---

### P06 · Spłaszczona modalność i zatarta odpowiedzialność
- **Poziom:** zdanie / akapit
- **Definicja operacyjna:** ukrycie sprawcy, jednolity dystans epistemiczny, zamiana *może* na *jest* lub odwrotnie, brak rozróżnienia „system odrzucił” / „użytkownik nie ma uprawnień” / „nie udało się”.
- **Dowód:** Jiang i Hyland (2024) — mniej markerów epistemicznych i obecności autorskiej w tekstach ChatGPT niż w esejach studentów. Angielski.
- **Status dla polskiego:** `INDIRECT`.
- **Kontrprzykłady:** tekst metodologiczny, raport formalny, medycyna, ochrona prywatności — bezosobowość bywa wymogiem.
- **Strategia:** przywróć sprawcę **wyłącznie na podstawie kontekstu**; nigdy nie wzmacniaj stopnia pewności.
- **Elementy chronione:** operator modalny, negacja, zakres odpowiedzialności, warunek, czas.
- **Werdykt:** `ACCEPT-CONDITIONAL` · umiarkowana. **Ten wzorzec ma najwyższe ryzyko szkody semantycznej ze wszystkich w katalogu.**

---

### P07 · Nadmierna symetria i regularność rytmiczna
- **Poziom:** akapit / zdanie
- **Definicja operacyjna:** ciąg zdań o zbliżonej długości, identycznym początku i równym rozkładzie interpunkcji, bez przyrostu treści.
- **Dowód:** Reinhart i in. (2025) — różnice w zmienności stylistycznej. **Ale:** El Attar i in. (2026) klasyfikują takie miary jako **silnie zależne od kontekstu**, a Baidya i in. (2026) oraz Al Ali i in. (2026) raportują inwersję polaryzacji miar perplexity dla współczesnych modeli.
- **Status dla polskiego:** `HEURISTIC`. Brak polskiego benchmarku rytmu.
- **Kontrprzykłady:** komunikaty UI o stałym wzorcu (*„Zapisano. Wysłano. Gotowe.”*), listy instrukcji, regulaminy, poezja.
- **Strategia:** zróżnicuj jedną lub dwie konstrukcje **tylko** w prozie lub artykule; nigdy w UI, gdzie skanowalność jest celem. **Nie stosuj mechanicznej rotacji długości zdań** — to produkuje inny rodzaj sztuczności.
- **Werdykt:** `HEURISTIC` · niska jako diagnoza pochodzenia, umiarkowana jako diagnoza monotonii konkretnego tekstu.

---

### P08 · Kalka, translationese i niedopasowanie uzusu
- **Poziom:** słowo / zdanie / akapit
- **Definicja operacyjna:** konstrukcja formalnie możliwa po polsku, która przenosi obcy szyk, kolokację, rejestr lub pragmatykę i nie pasuje do odbiorcy.
- **Dowód:** **brak badania dla polszczyzny LLM.** Tradycja badań nad translationese dotyczy tłumaczenia, nie generacji. Mechanizm „modele myślą po angielsku w warstwach ukrytych” jest hipotezą wyjaśniającą, nie dowodem dla polskiego.
- **Status dla polskiego:** `HEURISTIC`. **To wzorzec, o którym praktycy mówią najwięcej, a dowodów jest najmniej.**
- **Kontrprzykłady:** internacjonalizm, termin branżowy, nowy uzus, świadoma stylizacja, cytat.
- **Strategia:** weryfikuj kolokacje w korpusie polskim (NKJP, korpusy monitorujące), nie „na wyczucie”; proponuj warianty z zachowaniem sensu i rejestru.
- **Elementy chronione:** nazwy własne, terminy, cytaty, świadome zapożyczenia branżowe.
- **Werdykt:** `HEURISTIC` · niska–umiarkowana.

---

### P09 · Błędy fleksyjne i składniowe w konstrukcjach złożonych
- **Poziom:** zdanie
- **Definicja operacyjna:** naruszenia zgody, rządu, szyku i referencji międzyzdaniowej, koncentrujące się w zdaniach wielokrotnie złożonych.
- **Dowód:** **Mazur (2024), *LingVaria* — DOWÓD BEZPOŚREDNI DLA POLSKIEGO.** Błędy koncentrują się tam, gdzie poprawność wymaga całościowej kontroli gramatycznej.
- **Status dla polskiego:** `DIRECT`, z zastrzeżeniem: modele z 2023, zadania wzorowane na maturze.
- **Ryzyko fałszywego alarmu:** niskie — to są błędy, nie wybory stylistyczne.
- **Strategia:** to **jedyny wzorzec w katalogu, który uzasadnia interwencję z wysoką pewnością**, bo dotyczy poprawności, a nie stylu.
- **Werdykt:** `ACCEPT-CONDITIONAL` · umiarkowanie wysoka. **Priorytet nr 1 katalogu dla polszczyzny.**

---

### P10 · Zgodność z obowiązującą normą ortograficzno-interpunkcyjną
- **Poziom:** typografia / ortografia
- **Definicja operacyjna:** stosowanie zasad uchylonych po 1 stycznia 2026.
- **Dowód:** Rada Języka Polskiego — **źródło normatywne, bezpośrednio polskie, pewne**.
- **Mechanizm:** modele trenowane na tekstach sprzed 2026 mogą reprodukować zasady już nieobowiązujące.
- **Ryzyko fałszywego alarmu:** niskie, pod warunkiem odniesienia do **wersji obowiązującej**, a nie do pamięci modelu.
- **Strategia:** kontrola wobec aktualnego dokumentu RJP; **nie** wobec własnych przekonań modelu o polskiej ortografii.
- **Werdykt:** `ACCEPT-HIGH · NORMATIVE`. **Priorytet nr 2 katalogu dla polszczyzny.**

---

### P11 · Niedopasowanie rejestru do gatunku i odbiorcy
- **Poziom:** dokument
- **Definicja operacyjna:** rejestr formalny tam, gdzie gatunek i odbiorca wymagają innego, lub odwrotnie.
- **Dowód:** Rallapalli i in. (2026) — **gatunek wpływa na profil cech silniej niż źródło**; Reinhart i in. (2025) — różnice większe dla modeli instruction-tuned.
- **Status dla polskiego:** `INDIRECT` co do mechanizmu; `NORMATIVE` co do kryteriów, przez rozróżnienie normy wzorcowej i użytkowej (Markowski, 2005).
- **Ryzyko fałszywego alarmu:** wysokie, jeśli skill nie zna gatunku. **Dlatego rozpoznanie gatunku jest warunkiem wstępnym całego pipeline'u.**
- **Strategia:** ustal gatunek, odbiorcę i kanał **przed** jakąkolwiek zmianą; dostosuj rejestr do normy właściwej dla gatunku, nie do jednej normy dla wszystkich.
- **Werdykt:** `ACCEPT-CONDITIONAL` · umiarkowana.

---

### P12 · Deficyt konkretności, niuansu kulturowego i różnorodności
- **Poziom:** akapit / dokument
- **Definicja operacyjna:** twierdzenia ogólne bez zakotwiczenia w konkrecie; brak odniesień kulturowo lokalnych; jednostajność w doborze przykładów, perspektyw i środków.
- **Dowód:** **Wang i in. (ACL 2026 Main)** — w badaniu na 16 zbiorach, 9 językach i 9 domenach główne luki między tekstem ludzkim a maszynowym to **konkretność, niuanse kulturowe i różnorodność**.
- **Status dla polskiego:** `INDIRECT` — lista dziewięciu języków nie była dostępna na poziomie abstraktu, więc **nie twierdzę, że polski był w próbie**.
- **Dlaczego to najważniejszy rekord katalogu:** jest to **jedyna empirycznie ugruntowana, wielojęzyczna operacjonalizacja różnicy**, a przy tym jedyna, która przekłada się na działanie redakcyjne bez listy słów. Zamiast „usuń *kluczowy*” daje „dodaj konkret, którego brakuje”.
- **KRYTYCZNE OGRANICZENIE:** konkretyzacja **nie może dopisywać faktów**. *„Było wiele osób”* wolno zamienić na *„Sala była pełna”*, jeśli to wynika z kontekstu — **nigdy** na *„Było 47 osób”*.
- **Strategia:** wskaż miejsca, gdzie tekst mówi ogólnie o czymś, co autor mógłby uszczegółowić, i **zapytaj autora**, zamiast zgadywać.
- **Werdykt:** `ACCEPT-CONDITIONAL` · umiarkowanie wysoka. **Priorytet nr 1 katalogu dla tekstu w ogóle.**

---

### 7.1 Czego w katalogu nie ma i dlaczego

Nie ma rekordów dla myślnika, dwukropka, trójpodziału, wyliczenia, nagłówka, konstrukcji „to nie X, to Y” ani dla żadnej listy słów. Nie dlatego, że są niewinne, tylko dlatego, że **przeszukanie literatury nie znajduje badania, które testowałoby je jako zmienne po kontroli gatunku** — co potwierdziły własne zapytania falsyfikujące F01 i F02. Szczegóły w sekcji 8.

---

## 8. Katalog mitów i twierdzeń odrzuconych

| ID | Teza obiegowa | Rozstrzygnięcie | Podstawa | Werdykt |
|---|---|---|---|---|
| M01 | Myślnik lub pauza to marker AI. | Własna kwerenda falsyfikująca nie znalazła **żadnego** badania testującego myślnik jako marker po kontroli gatunku. Polska pauza ma własną normę typograficzną i utrwaloną konwencję prasową. | F01 (0 trafień relewantnych) | `REJECT` |
| M02 | „To nie X, to Y” to marker AI. | Żadne z potwierdzonych badań stylometrycznych nie testuje tej konstrukcji jako zmiennej. To legalna figura kontrastu i definicji, sprawna w publicystyce i diagnostyce. | F02 | `REJECT` jako reguła; `RESEARCH-ONLY` jako hipoteza |
| M03 | Trójpodział, wyliczenie, nagłówek to wada. | **Odwrotnie:** sygnalizowanie struktury poprawia przyswajanie. Trójczłonowa lista to klasyczna figura retoryczna. | Mautone i Mayer (2001) | `REJECT` |
| M04 | Angielskie listy słów AI przenoszą się na polski. | Nieprzenoszalne leksykalnie. Sygnał jest **populacyjny**, dryfuje w czasie i karze osoby o bogatym słownictwie oraz piszące w L2. | Kobak i in. (2025); Juzek i Ward (2025) | `REJECT` |
| M05 | Formalny, uporządkowany tekst jest „AI-owy”. | Gatunek wpływa na profil cech silniej niż źródło. Formalność to cecha rejestru, nie autorstwa. | Rallapalli i in. (2026) | `REJECT` |
| M06 | Detektor lub perplexity mierzy jakość. | Konstrukty rozłączne; tekst klasyfikowany jako AI bywa oceniany **wyżej**. Miary perplexity wykazują inwersję polaryzacji dla współczesnych modeli. | Herbold i in. (2023); Porter i Machery (2024); Baidya i in. (2026) | `REJECT` |
| M07 | „Bardziej ludzki” znaczy potoczny, emocjonalny, slangowy. | Empirycznie wskazane luki to **konkretność, niuans kulturowy i różnorodność**, a nie potoczność. Slang obniża dostępność i precyzję. | Wang i in. (ACL 2026) | `REJECT` |
| M08 | Neuroróżnorodność powoduje fałszywe pozytywy detektorów. | Brak jakiegokolwiek recenzowanego badania. Twierdzenie krąży w folklorze. | brak źródła | `RESEARCH-ONLY` — nie używać ani jako reguły, ani jako argumentu |
| M09 | Detektory zawsze zawodzą i zawsze mają bias. | Obalone jako teza uniwersalna: ponad 90% in-domain dla polskiego; brak biasu przy starannym próbkowaniu w dwóch niezależnych badaniach. Prawdziwa teza jest węższa: skuteczność i bias **nie generalizują**. | F05; Jiang i in. (2024); Al Ali i in. (2026); Przybyła i in. (2025) | `REJECT` wersji uniwersalnej |
| M10 | Polscy autorzy są dyskryminowani przez detektory. | **Brak podstaw.** Jedyne źródło dotyczy pisania po angielsku; replikacja w czeskim nie znajduje ani niższej perplexity, ani biasu. | sekcja 5.3 | `REJECT` jako fakt; ostrożność zostaje, ale z innym uzasadnieniem |
| M11 | Usunięcie markerów AI poprawia tekst dla czytelnika. | **Nie zbadano.** Dowody pośrednie działają w obie strony. **To jest nieprzetestowana przesłanka całego przedsięwzięcia.** | F04 | `RESEARCH-ONLY` — do jawnej deklaracji w skillu |

**Uwaga do M02 i M11:** „nie zbadano” nie znaczy „nieprawda”. Uczciwa formuła w dokumentacji skilla brzmi: *nie ma badania, które by to sprawdziło* — nigdy: *to nieprawda*.

---

## 9. Norma, uzus, rejestry i gatunki

### 9.1 Dwie normy, nie jedna

Polska tradycja normatywna rozróżnia **normę wzorcową** — obowiązującą w kontekstach oficjalnych — i **normę użytkową**, dopuszczającą wahania i warianty w kontekstach nieoficjalnych (Markowski, 2005). Konsekwencja jest twarda: **skill nie może stosować jednej normy do wszystkich tekstów.** Artykuł naukowy i komunikat w aplikacji podlegają różnym normom, a to, co w jednym jest błędem, w drugim bywa właściwym wyborem.

### 9.2 Ortografia i interpunkcja: stan na 2026

Od 1 stycznia 2026 „Zasady pisowni i interpunkcji polskiej” RJP są jedynym obowiązującym źródłem. Modele trenowane wcześniej mogą reprodukować zasady uchylone. **To jest najpewniejsza i najbardziej wykonalna reguła w całym kontrakcie** — jedyna, która jest jednocześnie polska, normatywnie ugruntowana i sprawdzalna wprost.

### 9.3 Prosty język: cel, nie estetyka

ISO 24495-1:2023 definiuje prosty język przez **dopasowanie do odbiorcy i celu**, nie przez prostotę samą w sobie. Dwa ustalenia korygują potoczne rozumienie:

- Obecność elementów prostego języka nie gwarantuje zrozumienia (Stoll i in., 2022; Gainey i in., 2024).
- Trudność języka prawniczego bierze się ze **sposobu pisania**, a nie ze specjalistycznych pojęć (Martínez, Mollica i Gibson, 2022). Wniosek operacyjny: **upraszczaj składnię, chroń terminologię.** Zamiana terminu na potoczny odpowiednik potrafi odebrać odbiorcy narzędzie, którego potrzebuje, żeby szukać dalej.

### 9.4 „Nowoczesna polszczyzna 2026”

Aktualność oznacza **datowany stan uzusu i badań**, a nie preferencję dla slangu ani dla najnowszej formy. Trzy zakazy:

- nie wprowadzać potoczności tam, gdzie gatunek jej nie przewiduje;
- nie usuwać terminologii w imię „naturalności”;
- nie wyrównywać wszystkich tekstów do jednego stylu, bo gatunek jest silniejszym predyktorem profilu językowego niż źródło tekstu.

### 9.5 Macierz gatunków

| Gatunek | Priorytet redakcyjny | Główne ryzyko | Domyślny poziom ingerencji |
|---|---|---|---|
| Etykieta, przycisk, tooltip | działanie, długość, dostępność | dopisanie osobowości; rozbicie placeholdera | **minimalny** |
| Komunikat błędu | stan, przyczyna, następny krok | zatarcie odpowiedzialności (P06); obwinianie użytkownika | niski |
| Onboarding, pomoc | prosty język, krokowość | ściany tekstu; pusty metatekst (P04) | niski |
| Dokumentacja | struktura, terminologia, przykłady | utrata precyzji w imię prostoty | niski |
| Artykuł, poradnik | rytm, argument, redundancja | P05, P07, P12 | średni |
| Raport, opracowanie | dane, wnioski, modalność | P02, P06 | średni |
| Tekst naukowy | dowód, zastrzeżenie, termin | zamiana zastrzeżeń na kategoryczne wnioski | niski |
| Marketing | obietnica, marka, zgodność prawna | claimy chronione; „ludzkie” ≠ slangowe | średni |
| E-mail, komunikacja organizacyjna | konkret, akcja | nadformalizacja; relikty interfejsu czatu | średni |
| Dialog literacki | idiolekt postaci | **ujednolicenie głosów postaci** | **minimalny** |
| Proza, narracja | stylizacja, punkt widzenia, rytm | wygładzenie celowej dziwności i niewiarygodnego narratora | **minimalny** |
| Prawo, medycyna | zakres, obowiązek, ryzyko, termin | każda parafraza wymaga eksperta | **tylko sugestia, nigdy zmiana** |
| Cytat, tekst mieszany językowo | wierność źródłu | redakcja cytatu jest błędem kategorialnym | **brak ingerencji** |

---

## 10. Strategie redakcyjne i warunki „nie zmieniaj”

### 10.1 Kolejność operacji

Bezpieczna kolejność jest lokalna i odwracalna: skróć redundancję bez usuwania twierdzeń → rozłóż analityzm tylko przy wzroście jasności i zachowaniu aspektu → rozbij przeładowane zdanie zachowując wszystkie warunki → połącz zdania tylko przy jawnej relacji logicznej → zróżnicuj rytm wyłącznie w prozie i artykule → przeformułuj metatekst, który nie wnosi nawigacji → przywróć sprawcę wyłącznie na podstawie kontekstu → przy niepewności pokaż dwie wersje z uzasadnieniem zamiast wybierać automatycznie.

### 10.2 Twarde „nie zmieniaj”

Skill **zostawia tekst bez zmian**, gdy:

- jedyną przesłanką zmiany jest wynik detektora lub wrażenie „brzmi jak AI”;
- fragment jest cytatem, bibliografią, tekstem prawnie wiążącym albo komunikatem regulacyjnym;
- konstrukcja jest świadomą stylizacją, idiolektem postaci, celową repetycją lub żartem;
- tekst został już oceniony jako dobry — **dobry tekst ma pozostać dobry**;
- zmiana wymagałaby zgadywania faktu, liczby, daty albo intencji autora;
- ścieżka wyświetlenia w repozytorium jest niepewna;
- zmiana naruszyłaby aspekt, modalność, negację, zakres obowiązku albo stopień pewności;
- nie da się ustalić gatunku i odbiorcy.

**Tryb „zostaw” ma być aktywną rekomendacją z uzasadnieniem, nie pasywnym brakiem działania.**

### 10.3 Czego nie robić nigdy

Blacklisty słów, znaków i konstrukcji. Globalnej podmiany synonimów. Mechanicznej rotacji długości zdań. Dopisywania emocji lub osobowości „dla uczłowieczenia”. Usuwania terminów, bo są rzadkie. Optymalizacji pod wynik detektora. Wzmacniania stopnia pewności. Konkretyzacji przez wymyślanie liczb.

---

## 11. Kontrakt zachowania znaczenia i głosu

### 11.1 Niezmienniki twarde — naruszenie jest błędem, nie kompromisem

**Znaczenie i fakty:** twierdzenia, liczby, daty, jednostki, wnioski, encje, relacje przyczynowe.
**Epistemika:** stopień pewności, operatory modalne (*musi* ≠ *powinien* ≠ *może*), negacja, zakres kwantyfikacji, źródło wiedzy, zakres odpowiedzialności.
**Materiał cudzy:** cytaty, bibliografia, nazwy własne, marki, terminy kontrolowane, akty prawne.
**Głos:** rejestr, punkt widzenia, humor, ironia, stylizacja, celowa repetycja, idiolekt postaci.
**Technika:** klucze, identyfikatory, placeholdery, warianty ICU/MessageFormat, znaczniki, linki, escape'y, kodowanie, limity długości UI.
**Logika:** rozgałęzienia, kolejność kroków, kompletność list stanowiących kontrakt, źródło prawdy plików generowanych.

### 11.2 Głos nie jest listą form

Głos autorski jest konstruktem **relacyjnym i sytuacyjnym**: ocena zależy od czytelnika, dyscypliny i gatunku (Morton i Storch, 2019; Zhao i Wu, 2022). Nie ma jednej listy cech, które „są głosem”. Wniosek: **skill nie odtwarza głosu z niczego.** Może go chronić i może się na nim wzorować, ale wyłącznie na podstawie jawnej próbki autora albo jawnej księgi stylu.

Techniczna wykonalność jest udokumentowana: profil preferencji stylistycznych da się wyprowadzić z próbek pisania i użyć do warunkowania generacji (Aroca-Ouellette i in., 2025; Gao i in., 2024 — oba preprinty). To jest jedyne zastosowanie, jakie te prace uzasadniają.

### 11.3 Trzy rozłączne pytania

Skill musi trzymać osobno:

1. **Czy tekst jest dobry?** — jakość, zrozumiałość, adekwatność, spójność.
2. **Kto go napisał i z czyim udziałem?** — autorstwo i proweniencja.
3. **Czy należy go zmienić?** — decyzja redakcyjna.

Odpowiedź na (2) nie determinuje (1) ani (3). Herbold i in. (2023) oraz Porter i Machery (2024) pokazują, że tekst maszynowy bywa w ocenie ślepej **lepszy**. „Wygląda na AI” nie jest ani diagnozą jakości, ani mandatem do zmiany.

---

## 12. Tekst widoczny w repozytoriach

Ta sekcja jest w całości **inferencją inżynierską** wywiedzioną ze standardów i praktyki, a nie wynikiem badania nad redakcją polszczyzny. Oznaczam to jawnie. Jej najlepsze opracowanie wniósł pakiet `codex` i przejmuję je z drobnymi uzupełnieniami.

### 12.1 Klasy widoczności

| Klasa | Definicja | Domyślna akcja |
|---|---|---|
| **V1** — jawnie użytkowa | tekst, który użytkownik czyta wprost | kandydat do analizy kontekstowej |
| **V2** — użytkowa w czasie wykonania | tekst zależny od warunku, interpolacji, lokalizacji lub generatora | analiza przez parser i śledzenie źródła; test wszystkich gałęzi |
| **V3** — niepewna | string może trafić do UI, ale brak dowodu ścieżki wyświetlenia | **raport kandydatów, bez zmiany** |
| **P1** — chroniona techniczna | klucz, identyfikator, nazwa zmiennej, log, fixture, test, URL, token | brak redakcji |
| **P2** — treść mieszana | fragment użytkowy zawierający wyrażenia chronione lub formatowanie | redaguj tylko bezpieczny tekst; zachowaj tokeny |
| **G** — generowana | artefakt pochodny mający źródło prawdy | zmień źródło, zregeneruj, zweryfikuj |

### 12.2 Elementy chronione

Klucze lokalizacji, identyfikatory, nazwy zmiennych i komponentów; wszystkie warianty placeholderów; selektory `plural`, `select`, `gender`, offsety, fallbacki; tagi HTML i Markdown, linki, URL, encje, kod inline i blokowy, importy i wyrażenia MDX; escape'y, końce linii, kodowanie, BOM, mapowanie locale, flagi PO; nazwy własne, marki, terminy kontrolowane, liczby, daty, jednostki, wersje, cytaty; ograniczenia długości, kolejność elementów, semantyka ARIA, komunikaty bezpieczeństwa; logika i pochodzenie pliku generowanego.

Podstawa: UTS #35 (MessageFormat) i dokumentacja ICU modelują **cały komunikat** wraz ze zmiennymi, wariantami i fallbackiem — dlatego chroniona jest **struktura**, a nie tylko znaki `{}`. WCAG 2.2 dodaje wymóg deklaracji języka, objaśniania nietypowych słów i sensownych sugestii przy błędach.

### 12.3 Przepływ pracy

Inwentaryzacja → klasyfikacja z zapisem powodu i pewności → mała, reprezentatywna próbka → redakcja wyłącznie V1 i V2 o wysokiej pewności → **diff semantyczny** (twierdzenia, modalność, encje, liczby, terminy, placeholdery, gałęzie, kolejność) → testy parsera, lintu, typów i buildu → kontrola w czasie wykonania i wizualna dla wszystkich stanów, języków i szerokości ekranu → raport ze ścieżką wycofania.

**Reguła zatrzymania:** jeśli diff semantyczny, parser, build lub test w czasie wykonania nie przechodzi, wynikiem jest **stop**, nie „best effort”.

### 12.4 Parser czy wyszukiwanie tekstowe

Wyszukiwanie tekstowe służy **inwentaryzacji**. Do bezpiecznej **zmiany** potrzebny jest parser lub AST wszędzie tam, gdzie tekst zależy od składni, interpolacji, escape'ów, warunków lub komponentów. Im większe prawdopodobieństwo, że zmiana stringu zmieni kod, mapowanie albo wariant w czasie wykonania, tym mniej wystarcza wyrażenie regularne.

---

## 13. Długie formy i książki

Podstawa empiryczna jest cieńsza, niż sugerują trzy pakiety, które o tym pisały. Wiadomo tyle: długie generowanie traci spójność i dokładność, a większe okno kontekstu tego nie rozwiązuje (Liu i in., 2024; Koh i in., 2023). **Wszystko poza tym jest wymaganiem projektowym, nie zweryfikowaną receptą** — i zbieżność `codex`, `minimax3` i `claude` co do zestawu rejestrów **nie jest** dowodem, że ten zestaw działa.

### 13.1 Rejestry stanu

Księga stylu (rejestr, długość zdań, punkt widzenia, dopuszczalna metaforyka, rytm). Glosariusz (termin, definicja, formy fleksyjne, dozwolone warianty, źródło). Rejestr postaci i nazw (alias, rodzaj gramatyczny, relacje, odmiana, pierwsze wystąpienie). Oś czasu. Rejestr faktów z poziomem pewności i dozwoloną parafrazą. Rejestr zapowiedzi i ich rozwiązań. Dziennik zmian z decyzją: *zmieniono / zostawiono / pytanie do autora*.

### 13.2 Podział i kontekst

Dziel po **jednostkach znaczeniowych** — rozdział, scena, argument, sekcja, punkt decyzji — nie co N tokenów. Nakładka kontekstu ma obejmować tylko to, co potrzebne: ostatnią zmianę stanu, aktywne encje, nierozwiązane zapowiedzi, definicje terminów, punkt widzenia i czas. Zbyt duża nakładka zaciera źródło, zbyt mała gubi zależności.

### 13.3 Kolejność przejść

Lokalne (gramatyka i rytm) → akapitowe (spójność i redundancja) → rozdziałowe (głos, rejestr, fakty) → globalne. **Przejście globalne nie przepisuje książki** — porównuje rejestry, wskazuje konflikty i wyznacza miejsca do decyzji człowieka.

### 13.4 Ochrona odrębności głosów

Test operacyjny wniesiony przez `minimax3` i wart przejęcia: **usuń didaskalia i sprawdź, czy czytelnik nadal rozpozna, która postać mówi.** Jeśli nie — redakcja ujednoliciła głosy. Nie wolno „normalizować” postaci, wygładzać celowej dziwności ani naprawiać niewiarygodnego narratora.

---

## 14. Detektory AI, ryzyka i granice obietnic

### 14.1 Co wiadomo

Detektory zawodzą wobec parafrazy, załamują się poza domeną i generatorem, a ich wyniki nie generalizują między zbiorami i populacjami. Dotyczy to również polszczyzny: PolEval 2025 osiąga ponad 90% accuracy na głównym zbiorze i traci przy nieznanych domenach i generatorach. Miary oparte na perplexity wykazują dla współczesnych modeli inwersję polaryzacji.

### 14.2 Czego **nie** wiadomo, a bywa twierdzone

Nie wiadomo, że polscy autorzy są dyskryminowani przez detektory (sekcja 5.3). Nie wiadomo, że neuroróżnorodność powoduje fałszywe pozytywy. Nie wiadomo, że usunięcie „markerów AI” poprawia tekst dla czytelnika.

### 14.3 Uczciwe granice obietnic

Skill **nie może** obiecywać niewykrywalności, i to z trzech niezależnych powodów:

1. **Nie da się jej zagwarantować.** Panel pięciu doświadczonych użytkowników LLM myli się na 1 z 300 artykułów, także po parafrazie i „humanizacji” (Russell i in., 2025). Trafność ludzka w badaniu wielojęzycznym wynosi 87,6% (Wang i in., ACL 2026). „Detektory są zawodne” nie znaczy „tekst jest nie do odróżnienia dla kompetentnego czytelnika”.
2. **Nie rozwiązałaby problemu, który obiecuje rozwiązać.** Kara za ujawnienie autorstwa nie znika przez retusz stylu (Raj i in., 2026).
3. **Byłoby to zły cel.** Optymalizacja pod klasyfikator jest rozumowaniem kołowym: redagujemy, żeby detektor nie złapał, a skuteczność mierzymy detektorem.

### 14.4 Uczciwe kryteria zastępcze

Zamiast „niewykrywalności” skill obiecuje: **poprawność wobec obowiązującej normy** (P09, P10), **dopasowanie do gatunku i odbiorcy** (P11), **przyrost konkretności, niuansu i różnorodności bez dopisywania faktów** (P12), **zachowanie znaczenia, modalności i głosu** (sekcja 11) oraz **integralność techniczną** (sekcja 12). Wszystkie są mierzalne, żadna nie wymaga detektora.

**Zakaz twardy:** wynik detektora nigdy nie jest bramką, funkcją celu ani kryterium sukcesu — również w ewaluacji.

---

## 15. Specyfikacja ewaluacji finalnego skilla

### 15.1 Korpus minimalny

Stratyfikowany po gatunku, ryzyku i formacie; każdy przypadek z metadanymi: autor lub model, prompt jeśli znany, język, gatunek, odbiorca, źródło prawdy, dopuszczalny rejestr, elementy chronione.

Obowiązkowe klasy: krótkie UI (etykieta, tooltip, CTA, stan pusty); komunikaty błędu (uprawnienia, walidacja, sieć); dokumentacja i FAQ; e-mail; artykuł i poradnik; tekst naukowy i streszczenie w prostym języku; marketing; dialog i proza; prawo i medycyna; cytaty i tekst mieszany językowo; formaty repozytorium (HTML, JSX/TSX, Vue, Svelte, Markdown/MDX, JSON/YAML i18n, PO, backend).

**Przypadki brzegowe obowiązkowe:** tekst **już dobry**; tekst ludzki używający rzekomego „AI-izmu” **celowo**; tekst tłumaczony; hybryda człowiek–model; tekst z placeholderami i wariantami liczby; tekst stylizowany; zdanie wielokrotnie złożone (bo tam koncentrują się polskie błędy — P09); tekst pisany według **uchylonej** normy ortograficznej (P10).

### 15.2 Kryteria — rozłączne, nie zbiorcze

1. zachowanie twierdzeń, faktów, encji, liczb, dat, jednostek i terminów;
2. zachowanie stopnia pewności, negacji, modalności, zakresu i odpowiedzialności;
3. poprawność gramatyczna i idiomatyczność polska;
4. dopasowanie do gatunku, odbiorcy, kanału i głosu;
5. spójność lokalna i globalna;
6. dostępność i zrozumienie;
7. integralność techniczna: parser, placeholdery, build, długość UI, rendering;
8. **brak pogorszenia dobrego tekstu.**

Zakaz mieszania konstruktów w jedną liczbę „human score”.

### 15.3 Metoda oceny

Ślepa ocena przez **rodzimych użytkowników polszczyzny**; dla prawa, medycyny, nauki i kodu — dodatkowo eksperci dziedzinowi. Porównanie parami (przed / po) jest bezpieczniejsze niż pojedyncze pytanie „czy brzmi ludzko?”. Raportować zgodność oceniających i rozbieżności. Skala zakotwiczona z komentarzem do decyzji.

### 15.4 Testy obowiązkowe

| Test | Wynik pozytywny | Czerwone światło |
|---|---|---|
| **T1 — no-op dobrego tekstu** | brak zmian lub zaakceptowana minimalna sugestia | tekst po redakcji oceniony **gorzej** niż wejście |
| **T2 — zachowanie znaczenia** | 100% krytycznych twierdzeń, liczb, negacji i modalności zachowane | dodany lub utracony fakt; wzmocniony wniosek |
| **T3 — zachowanie głosu** | delta stylometryczna poniżej progu zróżnicowania międzyautorowego; autor rozpoznaje własny tekst | uśrednienie do „bohatera redakcyjnego” |
| **T4 — bezpieczeństwo gatunkowe** | delta jakości ≈ 0 w gatunkach chronionych | reguła szkodząca prawu, medycynie lub literaturze → **wyłączyć regułę** |
| **T5 — chronione tokeny** | placeholdery, ICU, tagi, linki, klucze i warianty identyczne | parsowanie lub mapowanie locale nie przechodzi |
| **T6 — widoczność** | zmienione wyłącznie V1 i V2 o wysokiej pewności | dotknięty log, test, fixture, identyfikator lub V3 |
| **T7 — długi dokument** | brak dryfu encji, terminów, czasu i punktu widzenia | konflikt w rozdziale sąsiednim lub dalszym |
| **T8 — brak optymalizacji pod detektor** | korelacja zmiany jakości ze zmianą wyniku detektora ≈ 0 | **korelacja dodatnia = czerwona flaga**: skill usuwa sygnał, a nie poprawia tekst |
| **T9 — norma 2026** | zgodność z obowiązującym dokumentem RJP | stosowanie zasad uchylonych |

**T8 jest sprytnym pomysłem `cc_deepseek` i wart przejęcia:** zamiast zakazywać używania detektora, używa go **odwrotnie** — jako testu, czy skill przypadkiem nie optymalizuje pod klasyfikator.

### 15.5 Kryterium porażki — pre-rejestrowane

Za pakietem `cc_deepseek`, który jako jedyny to zapisał: **jeśli T1 nie wykazuje poprawy, T2 spada poniżej progu zachowania znaczenia, a T4 jest naruszony w co najmniej dwóch gatunkach — skill nie wnosi wartości i wymaga przeprojektowania.** Kryterium musi być ustalone **przed** ewaluacją.

### 15.6 Test hipotezy założycielskiej

Ponieważ teza „usunięcie markerów AI poprawia tekst” **nie została nigdzie zbadana** (M11, F04), ewaluacja skilla jest zarazem pierwszym jej testem. Wynik zerowy lub ujemny należy opublikować.

---

## 16. Kontrakt wiedzy i sugerowana architektura zasobów skilla

### 16.1 Zakres

**Wejście:** tekst widoczny dla użytkownika — od pojedynczego zdania, przez pliki treści i UI, po artykuły, opracowania i książki. Język docelowy: polski. Tekst mieszany językowo i cytowany to **przypadki chronione**, nie zadania redakcyjne.

**Tryby:** `audyt` (diagnoza bez zmian) · `sugestie` (propozycje z uzasadnieniem, decyzja u człowieka) · `edycja` (zmiana, dozwolona tylko przy wysokiej pewności widoczności, niskim ryzyku semantycznym i znanym źródle prawdy).

**Poza zakresem:** wykrywanie autorstwa, obietnica niewykrywalności, edycja treści prawnie lub finansowo wiążących bez flagi eksperckiej, masowa automatyczna edycja repozytorium bez próbki i wycofania.

### 16.2 Kolejność decyzji redakcyjnej

```
1. Ustal proweniencję          — oryginał / tłumaczenie / L2 / szablon / hybryda
2. Rozpoznaj gatunek i odbiorcę — WARUNEK KONIECZNY; bez tego brak diagnozy
3. Ustal normę właściwą         — wzorcowa czy użytkowa; obowiązujący dokument RJP
4. Diagnoza kontekstowa         — konfiguracja cech, nie pojedynczy token
5. Oszacuj pewność              — cechy współwystępujące, ryzyko fałszywego alarmu
6. Decyzja                      — zostaw / zaproponuj / zmień / eskaluj do człowieka
7. Redakcja bezpieczna          — minimalna, odwracalna, z uzasadnieniem
8. Kontrola lokalna             — znaczenie, modalność, aspekt, głos, tokeny chronione
9. Kontrola globalna            — spójność terminów, rejestru, faktów, punktu widzenia
10. Dowód weryfikacji           — diff semantyczny, testy, ślad decyzji, ścieżka wycofania
```

**Krok, którego w tym pipeline nie ma i mieć nie może:** „czy to brzmi jak AI?”.

### 16.3 Bramki zatrzymania

Skill zatrzymuje się i raportuje, gdy: nie da się ustalić gatunku lub odbiorcy; ścieżka wyświetlenia jest niepewna (V3); występuje konflikt placeholderów lub nieznana gałąź; diff semantyczny wykazuje różnicę liczby, negacji lub modalności; przekroczono limit długości UI; naruszony byłby element chroniony; brak ścieżki wycofania; tekst jest cytatem, stylizacją albo materiałem prawnym lub medycznym.

### 16.4 Sugerowana architektura zasobów

```
SKILL.md                     — kontrakt, zakres, tryby, bramki, kolejność decyzji, zakazy
references/
  katalog-wzorcow.md         — P01–P12 z sekcji 7; każdy rekord z datą, statusem PL i pewnością
  mity-odrzucone.md          — M01–M11 z sekcji 8; do cytowania, gdy użytkownik prosi o blacklistę
  norma-polska.md            — norma wzorcowa vs użytkowa; obowiązujący dokument RJP; prosty język
  gatunki.md                 — macierz z sekcji 9.5 z domyślnym poziomem ingerencji
  niezmienniki.md            — kontrakt zachowania z sekcji 11
  repozytorium.md            — klasy widoczności, elementy chronione, przepływ, bramki (sekcja 12)
  dlugie-formy.md            — rejestry stanu, podział, kolejność przejść, test głosów (sekcja 13)
  detektory-i-obietnice.md   — co wolno i czego nie wolno obiecywać (sekcja 14)
  ewaluacja.md               — korpus, kryteria, testy T1–T9, kryterium porażki (sekcja 15)
  luki-badawcze.md           — czego nie wiemy; polityka aktualizacji (sekcja 18)
```

**Wymóg formalny każdego rekordu katalogu:** identyfikator, poziom, definicja operacyjna, przykłady oznaczone jako ilustracyjne, rodzaj i jakość dowodu, **status dla polskiego**, zależność od modelu i daty, cechy współwystępujące wymagane do diagnozy, kontrprzykłady, ryzyko fałszywego alarmu, strategie, elementy chronione, test znaczenia, warunki „zostaw”, werdykt i pewność.

### 16.5 Elementy jawnie pozostawione otwarte

- Czy usunięcie wzorców P01–P08 poprawia odbiór tekstu po polsku — **nie wiadomo**; to hipoteza do przetestowania przez ewaluację skilla.
- Które z wzorców przenoszą się na polski, a które są artefaktem angielskiego — **nie wiadomo**; wymaga replikacji na korpusie polskim.
- Czy zestaw rejestrów dla długiej formy (sekcja 13.1) faktycznie ogranicza dryf — **nie zwalidowane**.
- Czy półautomatyczny AST wystarcza, czy trzeba uruchomić aplikację i obejrzeć realny DOM — **nierozstrzygnięte**.
- Progi liczbowe (ile intensyfikatorów na akapit, jaka delta stylometryczna) — **brak podstaw empirycznych**; nie wolno ich wymyślać.

---

## 17. Macierz śledzenia: wymaganie skilla → teza → źródło → pewność → test

| Wymaganie skilla | Teza | Źródło | Pewność | Test |
|---|---|---|---|---|
| Brak blacklisty słów, znaków i konstrukcji | S-L02 | El Attar i in. (2026) *preprint* | umiarkowana | T1, T4 |
| Rozpoznanie gatunku przed diagnozą | S-L03 | Rallapalli i in. (2026) *preprint* | umiarkowana | T4 |
| Każda reguła z datą i warunkiem modelowym | S-L05 | Casal i in. (2025) | umiarkowana | T7, przegląd półroczny |
| Brak bramki detektorowej; detektor jako test odwrotny | S-D07, S-H05 | Weber-Wulff (2023); Herbold (2023); Porter i Machery (2024) | wysoka | **T8** |
| Zakaz obietnicy niewykrywalności | S-H02, S-H03, S-H06 | Russell i in. (2025); Wang i in. (2026); Raj i in. (2026) | wysoka | dokumentacja |
| Ostrzeżenie przed oskarżaniem na podstawie detektora | S-D01, S-D03 | Weber-Wulff (2023); Przybyła i in. (2025) | wysoka | dokumentacja |
| **Nie** twierdzić, że polscy autorzy są dyskryminowani | S-D05 | Jiang i in. (2024); Al Ali i in. (2026) *preprint* | umiarkowana | audyt dokumentacji |
| Najostrzejsza kontrola gramatyki w zdaniach złożonych | S-P01 / P09 | Mazur (2024) — **DIRECT** | umiarkowana | T2, korpus PL |
| Kontrola ortografii wobec dokumentu RJP obowiązującego od 2026 | S-P03 / P10 | RJP PAN — **NORMATIVE** | wysoka | **T9** |
| Dwie normy, nie jedna | S-P04 | Markowski (2005) | wysoka | T4 |
| Upraszczaj składnię, chroń terminologię | S-E01 | Martínez, Mollica i Gibson (2022) | wysoka | T2, T4 |
| Nie usuwać nagłówków i sygnałów struktury | S-E02 / M03 | Mautone i Mayer (2001) | umiarkowanie wysoka | T1 |
| Cel redakcyjny: konkretność, niuans, różnorodność | S-H03 / P12 | Wang i in. (ACL 2026) | wysoka | T1, T2 |
| Konkretyzacja bez dopisywania faktów | niezmiennik | kontrakt sekcji 11.1 | wysoka | **T2** |
| Karta głosu z próbki autora, nie z niczego | S-E06 | Aroca-Ouellette i in. (2025) *preprint*; Gao i in. (2024) *preprint* | niska–umiarkowana | **T3** |
| Głos nie jest listą form | S-E05 | Morton i Storch (2019); Zhao i Wu (2022) | umiarkowanie wysoka | T3 |
| Ochrona placeholderów i wariantów ICU | S-R01 | UTS #35; ICU | wysoka (wymóg techniczny) | **T5** |
| Deklaracja języka i sugestie przy błędach | S-R02 | WCAG 2.2 | wysoka (normatywne) | T5 |
| Niepewna widoczność → raport, nie zmiana | S-R06 | inferencja inżynierska | — | **T6** |
| Testy regresji po każdej zmianie | S-R03 | Bavota i in. (2012) — analogia | heurystyka | T5, T6 |
| Rejestry stanu dla długiej formy | S-R04, S-R05 | Liu i in. (2024); Koh i in. (2023) + inferencja | umiarkowana / niezwalidowana | **T7** |
| Tryb „zostaw” jako aktywna rekomendacja | sekcja 10.2 | wynika z S-H05 i ryzyka fałszywego alarmu | wysoka | **T1** |
| Deklaracja, że hipoteza założycielska jest nieprzetestowana | M11 | brak badania (F04) | — | T1 jako pierwszy test |

---

## 18. Otwarte luki, decyzje wymagające ostrożności i polityka aktualizacji po 2026

### 18.1 Luki uporządkowane według wpływu na skill

**Krytyczne — podważają rdzeń działania.**
1. Nie wiadomo, czy usunięcie któregokolwiek wzorca poprawia tekst dla czytelnika. Hipoteza założycielska jest nieprzetestowana.
2. Nie ma polskiego korpusu par „tekst ludzki / tekst modelu” w wielu gatunkach z oceną rodzimych użytkowników. Bez niego cała taksonomia poza P09 i P10 pozostaje transferem.
3. Nie ma badania percepcji „AI-polszczyzny” przez polskich czytelników.

**Poważne — ograniczają zakres.**
4. Nie wiadomo, które cechy przenoszą się na język fleksyjny o swobodnym szyku. Jedyna dostępna wskazówka słowiańska (czeski, Al Ali i in. 2026) jest preprintem i dotyczy detekcji, nie stylu.
5. Nie ma polskiego benchmarku długiej formy.
6. Nie ma niezależnego audytu deklaracji dostawców polskich detektorów.
7. Nie ma benchmarku klasyfikacji widoczności tekstu w realnych repozytoriach.

**Otwarte, ale mniej pilne.**
8. Status konstrukcji „to nie X, to Y” i innych rzekomych markerów — nikt ich nie testował jako zmiennych.
9. Wpływ redakcji ludzkiej na sygnały statystyczne.
10. Relacja prostego języka do polskiej terminologii, inkluzywności i limitów długości na małych ekranach.
11. Twierdzenie o neuroróżnorodności a fałszywe pozytywy — całkowity brak badań.

### 18.2 Decyzje wymagające szczególnej ostrożności

- **P06 (modalność i odpowiedzialność)** ma najwyższe ryzyko szkody semantycznej. Zmiana operatora modalnego bywa zmianą faktu, nie stylu.
- **P12 (konkretność)** ma najwyższe ryzyko halucynacji. Konkretyzacja jest jedyną operacją w katalogu, która **kusi do dopisania danych**.
- **P08 (kalka)** ma najgorszy stosunek popularności przekonania do siły dowodu.
- **Reguła o biasie detektorów wobec Polaków** — nie powtarzać. Zalecenie zostaje, uzasadnienie się zmienia.
- **Progi liczbowe** — nie wymyślać. Żadne źródło nie daje podstawy do „jeden intensyfikator na akapit” ani „30% zmienionych zdań”.

### 18.3 Polityka aktualizacji

**Co pół roku:** przegląd katalogu pod kątem dryfu modeli i uzusu. Casal i in. (2025) pokazują konwergencję nowszych modeli do wzorców ludzkich; wynik z 2023 może już nie opisywać modelu z 2026.

**Wyzwalacze aktualizacji poza harmonogramem:**
- publikacja polskiego korpusu par lub badania percepcji — **przebudowa sekcji 6 i 7**;
- publikacja recenzowanej wersji preprintów nośnych (El Attar, Rallapalli, Al Ali, Baidya) — **podniesienie pewności odpowiednich tez**;
- kolejna zmiana normatywna RJP — **aktualizacja P10**;
- nowa generacja modeli o odmiennym profilu — **rewizja dat ważności rekordów**.

**Reguła trwała:** każdy rekord katalogu nosi datę stanu wiedzy i warunek modelowy. Rekord bez daty jest nieważny.

**Zasada archiwizacyjna:** wyniki zerowe i negatywne ewaluacji publikować. Ta dziedzina cierpi na folklor właśnie dlatego, że nikt nie publikuje tego, co nie zadziałało.

---

## 19. Zweryfikowana bibliografia (APA 7)

Pełny zapis maszynowy w `SYNTEZA-SOURCES.bib`. Rekordy sprawdzone wyłącznie na poziomie metadanych są oznaczone; preprinty mają jawną flagę.

### Detektory, autorstwo i granice wnioskowania

Al Ali, A., Helcl, J., & Libovický, J. (2026). *Different time, different language: Revisiting the bias against non-native speakers in GPT detectors* [Preprint, nierecenzowany]. arXiv. https://arxiv.org/abs/2602.05769

Baidya, M. S., Baidya, S. S., & Chawla, C. (2026). *Detecting the machine: A comprehensive benchmark of AI-generated text detectors across architectures, domains, and adversarial conditions* [Preprint, nierecenzowany]. arXiv. https://arxiv.org/abs/2603.17522

Jiang, Y., Hao, J., Fauss, M., & Li, C. (2024). Detecting ChatGPT-generated essays in a large-scale writing assessment: Is there a bias against non-native English speakers? *Computers & Education, 217*, 105070. https://doi.org/10.1016/j.compedu.2024.105070

Krishna, K., Song, Y., Karpinska, M., Wieting, J., & Iyyer, M. (2023). Paraphrasing evades detectors of AI-generated text, but retrieval is an effective defense. *Advances in Neural Information Processing Systems, 36*. [Metadane]

Liang, W., Yuksekgonul, M., Mao, Y., Wu, E., & Zou, J. (2023). GPT detectors are biased against non-native English writers. *Patterns, 4*(7), 100779. https://doi.org/10.1016/j.patter.2023.100779

Sadasivan, V. S., Kumar, A., Balasubramanian, S., Wang, W., & Feizi, S. (2025). Can AI-generated text be reliably detected? Stress testing AI text detectors under various attacks. *Transactions on Machine Learning Research*.

Weber-Wulff, D., Anohina-Naumeca, A., Bjelobaba, S., Foltýnek, T., Guerrero-Dib, J., Popoola, O., Šigut, P., & Waddington, L. (2023). Testing of detection tools for AI-generated text. *International Journal for Educational Integrity, 19*(1), 26. https://doi.org/10.1007/s40979-023-00146-z

Yang, L., Jiang, F., & Li, H. (2024). Is ChatGPT involved in texts? Measure the Polish Ratio to detect ChatGPT-generated text. *APSIPA Transactions on Signal and Information Processing, 13*(2). https://doi.org/10.1561/116.00000250 *(Uwaga: „Polish Ratio” = stopień wypolerowania tekstu; praca dotyczy angielskich abstraktów akademickich, nie języka polskiego.)*

### Percepcja, jakość i preferencja

Clark, E., August, T., Serrano, S., Haduong, N., Gururangan, S., & Smith, N. A. (2021). All that's 'human' is not gold: Evaluating human evaluation of generated text. *Proceedings of ACL-IJCNLP 2021*, 7282–7296. https://doi.org/10.18653/v1/2021.acl-long.565

Herbold, S., Hautli-Janisz, A., Heuer, U., Kikteva, Z., & Trautsch, A. (2023). A large-scale comparison of human-written versus ChatGPT-generated essays. *Scientific Reports, 13*, 18617. https://doi.org/10.1038/s41598-023-45644-9

Porter, B., & Machery, E. (2024). AI-generated poetry is indistinguishable from human-written poetry and is rated more favorably. *Scientific Reports, 14*. https://doi.org/10.1038/s41598-024-76900-1

Raj, M., Berg, J. M., & Seamans, R. (2026). The artificial intelligence disclosure penalty: Humans persistently devalue AI-generated creative writing. *Journal of Experimental Psychology: General, 155*(4), 896–915. https://doi.org/10.1037/xge0001889 [Metadane]

Russell, J., Karpinska, M., & Iyyer, M. (2025). People who frequently use ChatGPT for writing tasks are accurate and robust detectors of AI-generated text. *Proceedings of ACL 2025*, 5342–5373. https://aclanthology.org/2025.acl-long.267/

Wang, Y., Xing, R., Mansurov, J., Puccetti, G., Xie, Z., Ta, M. N., … Nakov, P. (2026). Is human-like text liked by humans? Multilingual human detection and preference against AI. *Proceedings of ACL 2026 (Main)*. https://arxiv.org/abs/2502.11614

### Cechy językowe tekstu generowanego

Casal, J. E., Stewart, C. M., & Windsor, A. J. (2025). "It is important to consult" a linguist: Verb-argument constructions in ChatGPT and human experts' medical and financial advice. *PLOS ONE, 20*(5), e0324611. https://doi.org/10.1371/journal.pone.0324611

El Attar, Y., Dönmez, E., Maurer, M., & Falenska, A. (2026). *A systematic analysis of linguistic features in AI-generated text detection across domains and models* [Preprint, nierecenzowany]. arXiv. https://arxiv.org/abs/2606.04177

Guo, Y., Shang, G., & Clavel, C. (2025). Benchmarking linguistic diversity of large language models. *Transactions of the Association for Computational Linguistics, 13*, 1507–1526. https://doi.org/10.1162/tacl.a.47

Guo, Y., Shang, G., Vazirgiannis, M., & Clavel, C. (2024). The curious decline of linguistic diversity: Training language models on synthetic text. *Findings of NAACL 2024*, 3589–3604. https://doi.org/10.18653/v1/2024.findings-naacl.228 [Metadane]

Jiang, F. (K.), & Hyland, K. (2024). Does ChatGPT argue like students? Bundles in argumentative essays. *Applied Linguistics, 46*(3), 375–391. https://doi.org/10.1093/applin/amae052

Juzek, T. S., & Ward, Z. B. (2025). Why does ChatGPT "delve" so much? Exploring the sources of lexical overrepresentation in large language models. *Proceedings of COLING 2025*, 6397–6411. https://aclanthology.org/2025.coling-main.426/

Kobak, D., González-Márquez, R., Horvát, E.-Á., & Lause, J. (2025). Delving into LLM-assisted writing in biomedical publications through excess vocabulary. *Science Advances, 11*(27). https://doi.org/10.1126/sciadv.adt3813

Rallapalli, S., Gallagher, S., Yurko, R., Brooks, T., Loughin, C., Sezgin, M., & Turri, V. (2026). *Interpretable stylistic variation in human and LLM writing across genres, models, and decoding strategies* [Preprint, nierecenzowany]. arXiv. https://arxiv.org/abs/2604.14111

Reinhart, A., Markey, B., Laudenbach, M., Pantusen, K., Yurko, R., Weinberg, G., & Brown, D. W. (2025). Do LLMs write like humans? Variation in grammatical and rhetorical styles. *Proceedings of the National Academy of Sciences, 122*(8). https://doi.org/10.1073/pnas.2422455122

### Polszczyzna: dowody bezpośrednie i źródła normatywne

Dadas, S., Grębowiec, M., Perełkiewicz, M., & Poświata, R. (2025). Evaluating Polish linguistic and cultural competency in large language models. W *Lecture Notes in Computer Science* (s. 60–71). Springer. https://doi.org/10.1007/978-3-032-03705-3_6 [Metadane]

Markowski, A. (2005). *Kultura języka polskiego. Teoria. Zagadnienia leksykalne*. Wydawnictwo Naukowe PWN. [Metadane]

Marquardt, D. (2024). Genre indicators in ChatGPT chatbot dialogue steps. *Poznańskie Studia Polonistyczne. Seria Językoznawcza, 31*(1), 149–166. https://doi.org/10.14746/pspsj.2024.31.1.8 *(Trop, nie dowód — z abstraktu nie wynika, czy materiał był polskojęzyczny.)*

Mazur, R. (2024). O poprawności językowej tekstów generowanych przez SI na przykładzie ChatuGPT. *LingVaria, 19*(1(37)), 119–138. https://doi.org/10.12797/LV.19.2024.37.08

Mazurkiewicz-Sokołowska, J. (2025). ChatGPT text products and their linguistic correctness. W *Lecture Notes in Networks and Systems* (s. 250–265). Springer. https://doi.org/10.1007/978-3-032-06611-4_20 [Metadane — treści ustaleń nie weryfikowano]

Przepiórkowski, A., Bańko, M., Górski, R. L., & Lewandowska-Tomaszczyk, B. (red.). (2012). *Narodowy Korpus Języka Polskiego*. Wydawnictwo Naukowe PWN. http://nkjp.pl

Przybyła, P., Strebeyko, J., & Wróblewska, A. (2025). PolEval 2025 Task 1 Śmigiel: Spotting machine-generated text from LLMs for Polish. *Proceedings of the PolEval 2025 Workshop*, 5–15. https://aclanthology.org/2025.poleval-main.2/

Rada Języka Polskiego przy Prezydium PAN. (2026). *Zasady pisowni i interpunkcji polskiej*. Polska Akademia Nauk. https://rjp.pan.pl/zmiany-pisowni-2026-3/

### Redakcja, prosty język, głos autorski i ewaluacja

Aroca-Ouellette, S., Mackraz, N., Theobald, B.-J., & Metcalf, K. (2025). *Aligning LLMs by predicting preferences from user writing samples* [Preprint, nierecenzowany]. arXiv. https://arxiv.org/abs/2505.23815

Gainey, K., Smith, J., McCaffery, K., Clifford, S., & Muscat, D. (2024). Are plain language summaries published in health journals written according to instructions and health literacy principles? A systematic environmental scan. *BMJ Open, 14*, e086464. https://doi.org/10.1136/bmjopen-2024-086464 *(Korekta abstraktu: https://doi.org/10.1136/bmjopen-2024-086464corr1)* [Metadane]

Gao, G., Taymanov, A., Salinas, E., Mineiro, P., & Misra, D. (2024). *Aligning LLM agents by learning latent preference from user edits* [Preprint, nierecenzowany]. arXiv. https://arxiv.org/abs/2404.15269

Howcroft, D. M., Belz, A., Clinciu, M.-A., Gkatzia, D., Hasan, S. A., Mahamood, S., Mille, S., van Miltenburg, E., Santhanam, S., & Rieser, V. (2020). Twenty years of confusion in human evaluation: NLG needs evaluation sheets and standardised definitions. *Proceedings of INLG 2020*, 169–182. https://aclanthology.org/2020.inlg-1.23/

International Organization for Standardization. (2023). *ISO 24495-1:2023 Plain language — Part 1: Governing principles and guidelines*. https://www.iso.org/standard/78907.html

Martínez, E., Mollica, F., & Gibson, E. (2022). Poor writing, not specialized concepts, drives processing difficulty in legal language. *Cognition, 224*, 105070. https://doi.org/10.1016/j.cognition.2022.105070

Mautone, P. D., & Mayer, R. E. (2001). Signaling as a cognitive guide in multimedia learning. *Journal of Educational Psychology, 93*(2), 377–389. https://doi.org/10.1037/0022-0663.93.2.377 [Metadane]

Morton, J., & Storch, N. (2019). Developing an authorial voice in PhD multilingual student writing: The reader's perspective. *Journal of Second Language Writing, 43*, 15–23. https://doi.org/10.1016/j.jslw.2018.02.004 [Metadane]

Stoll, M., Kerwer, M., Lieb, K., & Chasiotis, A. (2022). Plain language summaries: A systematic review of theory, guidelines and empirical research. *PLOS ONE, 17*(6), e0268789. https://doi.org/10.1371/journal.pone.0268789 [Metadane]

van der Lee, C., Gatt, A., van Miltenburg, E., & Krahmer, E. (2021). Human evaluation of automatically generated text: Current trends and best practice guidelines. *Computer Speech & Language, 67*, 101151. https://doi.org/10.1016/j.csl.2020.101151 [Metadane]

Zhao, C. G., & Wu, J. (2022). Perceptions of authorial voice: Why discrepancies exist. *Assessing Writing, 53*, 100632. https://doi.org/10.1016/j.asw.2022.100632 [Metadane]

### Standardy, dostępność, lokalizacja i długie formy

Bavota, G., De Carluccio, B., De Lucia, A., Di Penta, M., Oliveto, R., & Strollo, O. (2012). When does a refactoring induce bugs? An empirical study. *2012 IEEE 12th International Working Conference on Source Code Analysis and Manipulation*, 104–113. https://doi.org/10.1109/SCAM.2012.20 [Metadane]

Koh, H. Y., Ju, J., Liu, M., & Pan, S. (2023). An empirical survey on long document summarization: Datasets, models, and metrics. *ACM Computing Surveys, 55*(8), 1–35. https://doi.org/10.1145/3545176 [Metadane]

Liu, X., Dong, P., Hu, X., & Chu, X. (2024). LongGenBench: Long-context generation benchmark. *Findings of EMNLP 2024*, 865–883. https://aclanthology.org/2024.findings-emnlp.48/ [Metadane]

Unicode Consortium. (b.d.). *Unicode Technical Standard #35: Unicode Locale Data Markup Language (LDML), Part 9: MessageFormat*. https://www.unicode.org/reports/tr35/tr35-73/tr35-messageFormat.html

World Wide Web Consortium. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. W3C Recommendation. https://www.w3.org/TR/WCAG22/

---

## Nota metodologiczna końcowa

Ten dokument jest **kontraktem wiedzy**, nie skillem. Nie zawiera implementacji i nie modyfikuje `skill-files/`.

Trzy rzeczy, o których model budujący finalny skill powinien pamiętać, nawet gdy zapomni resztę:

1. **Pewność jest tu niska, a materiał polski szczątkowy.** Dwie reguły — kontrola gramatyki w zdaniach złożonych i zgodność z normą RJP obowiązującą od 2026 — mają solidną, bezpośrednio polską podstawę. Wszystko inne jest transferem albo hipotezą i musi być tak oznaczone.
2. **Hipoteza założycielska nie została przetestowana.** Nikt nie wykazał, że usunięcie „markerów AI” poprawia tekst dla czytelnika. Skill ma tę hipotezę **testować**, nie zakładać.
3. **Domyślną akcją jest brak zmiany.** Dobry tekst ma pozostać dobry. Fałszywy alarm kosztuje więcej niż przeoczenie, bo niszczy to, czego skill miał bronić: znaczenie, głos i intencję autora.
