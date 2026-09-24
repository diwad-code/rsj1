# Poprawianie polszczyzny generowanej przez AI — raport dowodowy

Stan wiedzy: 2026-08-17  
Zakres: niezależny research dla przyszłego, przenośnego skilla redakcyjnego; implementacja skilla nie jest częścią tego raportu.

## 1. Metryka i ograniczenia dostępu

### 1.1. Wynik w skrócie

Najbezpieczniejszy wniosek brzmi: nie istnieje jedna lista „AI-zmów”, którą można usunąć z polskiego tekstu. Istnieją natomiast kontekstowe profile różnic obserwowane w określonych modelach, promptach, gatunkach i korpusach — np. większa gęstość nominalna, mniejsza zmienność stylistyczna, utarte pakiety leksykalne, sztywna organizacja lub spłaszczona obecność autora w wybranych badaniach anglojęzycznych [C01–C03, C07]. Bezpośrednia literatura o polskiej naturalności i redakcji jest znacznie węższa; polskie źródła dotyczą głównie poprawności w zadaniach, kompetencji modelu i detekcji autorstwa [C04–C05].

Przyszły skill powinien więc diagnozować konfigurację cech w funkcji odbiorcy i gatunku, a następnie proponować ograniczoną, odwracalną redakcję. Musi chronić znaczenie, fakty, modalność, terminologię, głos, placeholdery, logikę i składnię repozytorium. Detektor AI nie może być ani definicją jakości, ani celem optymalizacji [C12–C13].

### 1.2. Korpus i dostęp

| Miara | Wynik |
|---|---:|
| Daty wyszukiwania i weryfikacji | 2026-08-17 |
| Zalogowane batch’e zapytań | 28 (`Q01–Q28`) |
| Rekordy po deduplikacji, objęte `SOURCES.bib` | 42 |
| Rekordy naukowe / recenzowane / konferencyjne | 31 |
| Preprinty lub źródła emerging | 4 |
| Standardy i źródła autorytatywne techniczne | 7 |
| Materiały marketingowe użyte jako dowód | 0 |
| Niezależni scoutci | niedostępni; wykonano równoważny proces sekwencyjny |

Planowane serwisy `paper-search` i `openalex` z `.mcp.json` nie były dostępne jako narzędzia tej sesji. Zgodnie z protokołem użyto więc ograniczonych domenowo kwerend internetowych, stron wydawców, ACL Anthology, Crossref, stron instytucjonalnych, ISO, W3C i Unicode. Interfejs nie zwracał pełnych hit-countów dla baz, dlatego raport nie udaje bibliometrii: dokładne zapytania, daty, domeny, wynik i decyzja są w `SEARCHLOG.yaml`.

Wszystkie źródła w `SOURCES.bib` przeszły co najmniej kontrolę rekordu DOI lub stabilnej strony źródłowej. Sprawdzono autorów, tytuły, rok, venue i DOI dla rekordów Crossref; metadane i strony ACL dla prac konferencyjnych; strony wydawców lub instytucji dla prac bez otwartego pełnego tekstu. Przy Gainey et al. znaleziono korektę abstraktu (`10.1136/bmjopen-2024-086464corr1`); uwzględniono ją jako notę przy rekordzie i nie przypisano jej wpływu na główne wnioski [E14, E21]. Nie znaleziono korekty ani retractu na sprawdzonych stronach pozostałych rekordów, ale to wynik ograniczonej kontroli, a nie gwarancja na przyszłość.

### 1.3. Granice własności artefaktów

Pracowano wyłącznie w `wersje/codex/`. Nie czytano, nie listowano, nie przeszukiwano ani nie wykorzystywano innych katalogów pod `wersje/`, `wersje/SYNTEZA.md` ani `skill-files/`. Nie zmieniano repozytorium poza katalogiem właścicielskim. `PROMPT_CODEX.md` pozostaje artefaktem wejściowym; pięć artefaktów obowiązkowych i jeden opcjonalny są w tym katalogu.

## 2. Pytania, protokół i metody

### 2.1. Pytania badawcze

Kwerenda została rozbita na sześć grup:

1. Jak operacjonalizować naturalność, płynność, jakość, głos i styl bez utożsamiania ich z autorstwem?
2. Jakie cechy tekstu generowanego obserwowano empirycznie i które są rzeczywiście polskie, a które są transferem z angielskiego, tłumaczenia lub konkretnego gatunku?
3. Skąd biorą się internetowe mity o „AI-zmach” i jak odróżnić popularność etykiety od dowodu?
4. Jak redagować leksykę, składnię, pragmatykę, rytm, spójność akapitów i makrostrukturę bez utraty treści?
5. Jak sklasyfikować widoczność tekstu w repozytorium i bezpiecznie chronić kod, placeholdery, logikę, lokalizację oraz pliki generowane?
6. Jak oceniać skill na krótkich komunikatach, dokumentacji, artykułach i książkach, w tym na dobrym tekście, dla którego właściwą akcją jest brak zmiany?

### 2.2. Protokół

`PROTOKOL.md` został zapisany przed otwarciem internetu jako wersja 1.0. Zawiera PECO, zakres, kryteria włączenia i wykluczenia, klastry zapytań, plan deduplikacji, ekstrakcji, krytycznej oceny, syntezy i raportowania. Zarejestrowano dwie zmiany:

- v1.1: niedostępność MCP `paper-search`/`openalex`; przejście na domenowo ograniczone wyszukiwanie i ręczną kontrolę DOI/stron źródłowych;
- v1.2: niedostępność narzędzi niezależnych scoutów; wykonanie wyszukiwania i przejścia sceptycznego sekwencyjnie.

Zmiany nie zmieniły pytań ani progu dowodowego. Pełna ścieżka `Q01–Q28`, `V01–V10`, daty, domeny i decyzje są w `SEARCHLOG.yaml`.

### 2.3. Wyszukiwanie, selekcja i ekstrakcja

Szukano po polsku i angielsku. Priorytet miały: recenzowane czasopisma, ACL/INLG/CHI i inne uznane konferencje, korpusy i benchmarki, badania HCI/NLG, źródła inżynierii oprogramowania, instytucje językowe i standardy. Preprinty zostały zachowane tylko wtedy, gdy wypełniały lukę i są wyraźnie oznaczone jako słabszy poziom. Listy marketingowe, strony „humanizerów” i popularne listy słów AI trafiły do `EXCLUDED.md` jako obiekt badania mitu, nie jako dowód.

Dla każdego użytecznego rekordu wyodrębniono: pytanie, język, populację/korpus, model i prompt jeśli opisano, gatunek, cechy, sposób oceny, lokalizator, ograniczenia i możliwe przeniesienie. Zależność „źródło → teza” sprawdzono w `EVIDENCE-TABLE.md`; istnienie, wsparcie, zakres, aktualność i decyzję audytuje `CLAIM-AUDIT.md`.

### 2.4. Krytyczna i sceptyczna ocena

Przejście sceptyczne sprawdziło, czy:

- angielskie cechy nie zostały opisane jako wynik dla polskiego;
- detekcja autorstwa nie została pomylona z jakością;
- jeden token, znak interpunkcyjny lub szablon nie został zamieniony w zakaz;
- hipoteza „to nie X, to Y” nie została przedstawiona jako fakt;
- uwzględniono dobry tekst, tekst prawny/medyczny, cytat, mieszany językowo tekst i placeholdery;
- rekomendacje AST, źródła prawdy, rollbacku i plików generowanych są oznaczone jako wymagania inżynierskie, a nie wyniki jednego eksperymentu.

## 3. Mapa dowodów oraz ocena jakości

### 3.1. Poziomy wnioskowania

### 3.1a. Operacyjne definicje konstruktów

- **Naturalność:** odbiorcza ocena, że forma, rejestr, rytm i dobór informacji pasują do sytuacji, gatunku i wspólnoty językowej. Nie jest równoznaczna z ludzkim autorstwem.
- **Płynność:** łatwość przetwarzania i ciągłość lektury na danym poziomie tekstu; obejmuje m.in. lokalną składnię, referencję i przejścia, ale nie zastępuje faktualności ani adekwatności.
- **Jakość:** wektor kryteriów: poprawność, znaczenie, faktualność, spójność, użyteczność, rejestr, głos, dostępność i integralność techniczna. Jedna wysoka ocena nie kompensuje krytycznego błędu.
- **Autentyczny głos:** sytuacyjnie rozpoznawalny sposób zajmowania stanowiska, adresowania odbiorcy, organizowania uwagi i używania środków stylistycznych; jest współtworzony przez autora, tekst i czytelnika.
- **Styl:** powtarzalny profil wyborów leksykalnych, składniowych, rytmicznych, pragmatycznych i makrostrukturalnych w obrębie gatunku. Styl może być formalny, schematyczny lub stylizowany i nadal być dobry.

Rozdzielenie tych konstruktów wynika z przeglądu definicji humanności, niezgodności terminologii NLG oraz badań nad głosem i oceną człowieka [E01, E11–E13].

| Obszar | Najmocniejszy wynik | Ocena |
|---|---|---|
| Definicje naturalności i głosu | Konstrukty są wielowymiarowe, odbiorcze i zależne od kultury/gatunku; brak jednej normy [E01, E13]. | wysoka dla krytyki uproszczeń; nie daje polskiego rubricu |
| Cechy modeli | Wybrane modele wykazują powtarzalne profile stylistyczne i leksykalne względem ludzi [E02–E04, E09–E10]. | umiarkowanie wysoka; zależna od angielskiego, modelu i zadania |
| Polski | Istnieją bezpośrednie badania poprawności i kompetencji oraz zadania detekcyjne, ale mało badań naturalności swobodnego polskiego [E05–E07]. | niska–umiarkowana; największa luka |
| Tłumaczenie i języki fleksyjne | Wyniki międzyjęzykowe uzasadniają osobną replikację morfologii i składni [E22]. | umiarkowana dla zasady ostrożnego transferu |
| Plain language i dostępność | Są normy i przeglądy, ale „prościej” nie jest równoznaczne z „lepiej” [E14, E23–E24]. | wysoka jako rama normatywna; nie jako polski korpus |
| Ewaluacja | Kryteria trzeba rozdzielać, jawnie definiować i badać z błędami oceny [E11–E12]. | wysoka jako metodyka |
| Detektory | Są wrażliwe na dane, parafrazę, populację i generator; ich wynik nie opisuje jakości [E16–E17]. | wysoka dla rozdzielenia konstruktów, nie dla konkretnego detektora |
| Repozytorium | Parsery, ochrona tokenów, rollback i testy są konsekwencją ryzyka zmian; to wymagania projektowe [E19–E20]. | wysoka praktycznie, ale jawnie inferencyjna |
| Długie formy | Długi kontekst ma osobne ryzyka spójności i luki metryk; najnowszy benchmark narracyjny jest jeszcze emerging [E18]. | umiarkowana; brak polskiego benchmarku książkowego |

### 3.2. Co jest dowodem, a co interpretacją

Dowodem jest np. różnica między korpusami lub wynik oceny opisany w źródle. Interpretacją jest przełożenie tej różnicy na regułę skilla: „sprawdź gęstość rzeczownikową w akapicie, ale nie usuwaj nominalizacji mechanicznie”. Interpretacja jest rozsądna, gdy pozostaje odwracalna, ma test znaczenia i nie rozszerza zakresu źródła. W tabeli tez rozróżniono `PRZYJĄĆ`, `PRZYJĄĆ Z OGRANICZENIEM`, `NIE UOGÓLNIAĆ` i `INFERENCJA INŻYNIERSKA` [C15–C25].

Nie wykonano pełnej meta-analizy: konstrukty, korpusy, modele i skale są zbyt heterogeniczne, a dla polskiego brakuje wspólnego zbioru. Nie podano efektu zbiorczego dla „naturalności AI” ani rankingu modeli, bo byłby pozornie precyzyjny.

## 4. Co wiadomo o polskim; co jest tylko transferem międzyjęzykowym

### 4.1. Bezpośrednie źródła polskie

Mazur analizuje poprawność językową odpowiedzi ChatGPT na zadania inspirowane polską maturą i wskazuje zmienną częstość błędów, szczególnie przy konstrukcjach wymagających szerszej kontroli gramatycznej [E05]. To wspiera testowanie zgody, rządu, szyku, fleksji, referencji i zależności międzyzdaniowych. Nie jest jednak dowodem, że określone konstrukcje „brzmią jak AI” ani że każdy model zachowuje się tak samo.

Dadas et al. badają polską kompetencję językową i kulturową w 600 pytaniach oraz wielu modelach [E06]. To ważne dla faktów, gramatyki i słownictwa, ale pytanie benchmarkowe nie jest tym samym co akapit UI, artykuł, dialog czy narracja. LLMzSzŁ i Bielik są użytecznym kontekstem zdolności modeli, lecz nie zostały potraktowane jako pomiar naturalności [SOURCES.bib: `jassem2025llmzszl`, `ociepa2024bielik`].

PolEval 2025 i Polish Ratio dotyczą wykrywania tekstu maszynowego lub udziału ChatGPT w polskich tekstach [E07, E17]. Pokazują, że klasyfikacja autorstwa jest możliwa w określonym zadaniu i wrażliwa na domenę, ale nie mówią, czy tekst jest dobry, precyzyjny, dostępny ani właściwy dla odbiorcy.

### 4.2. Czego nie wolno przenosić z angielskiego

Nie ma podstaw, by bez replikacji traktować jako polskie ustalenia:

- przewagę konkretnych angielskich słów lub pakietów;
- angielski profil nominalizacji, strony biernej i imiesłowowych clauses;
- angielskie preferencje dla stance markers, bundle i authorial presence;
- angielskie relacje długości zdań, rytmu i interpunkcji;
- wyniki detektorów z TOEFL, GRE lub angielskich esejów;
- popularne angielskie listy `delve`, `tapestry`, `pivotal` czy podobnych słów.

Polski ma fleksję, bogatszą odmianę, swobodniejszy szyk w pewnych konstrukcjach, inny rozkład informacji, odmienne konwencje interpunkcyjne i własny uzus. Opublikowane badanie morfologii angielskiego, niemieckiego, tamilskiego i tureckiego może uzasadniać pytanie o przenoszenie reguł do języka fleksyjnego, ale nie jest wynikiem dla polskiego [E22]. Polski skill powinien mierzyć polskie formy i zależności, a nie tłumaczyć angielskie markery na słownik zakazów [C05].

### 4.3. Hipotezy do przyszłej replikacji

Można badać, czy w polskich tekstach wybranych modeli występują: zbyt regularne akapity, powtarzalne ramy metatekstowe, nadmiar abstrakcyjnych rzeczowników, powtarzanie wniosków, utrata osobowej odpowiedzialności, niespójność referencji i kalka rejestru. Każda taka hipoteza musi mieć korpus ludzi o tym samym gatunku, kontrolę promptu/modelu i ocenę rodzimych użytkowników. Nie wolno zamieniać jej w regułę przed pomiarem [C06, C08–C10].

## 5. Taksonomia cech i mitów

### 5.1. Zasada taksonomii

Wzorzec jest konfiguracją cech, a nie tokenem. Minimalna diagnoza powinna obejmować przynajmniej poziom zdania, akapitu i zadania komunikacyjnego: funkcję, rejestr, odbiorcę, rytm, powtórzenia, modalność, spójność i koszty zmiany. Pojedyncza cecha może być legalna; dopiero kombinacja i brak funkcji mogą uzasadniać sugestię.

Poniższe rekordy mają wymagane pola: ID, nazwa, poziom, opis operacyjny, dowody, język badania, zależność od gatunku/modelu, fałszywe pozytywy, kontrprzykład, bezpieczne strategie, elementy chronione, test znaczenia, kiedy nie zmieniać i pewność.

### P01 · Niedopasowanie rejestru i gęstość informacyjna · poziom zdania/akapitu · umiarkowana pewność

- **Opis operacyjny:** sprawdź, czy tekst używa większej gęstości rzeczownikowej, abstrakcyjnych etykiet i nominalizacji niż wymaga odbiorca, zadanie i gatunek; nie licz nominalizacji jako błędów.
- **Dowody:** różnice w gęstości nominalnej i stylu [E02–E04]; pakiety abstrakcyjne w esejach [E10].
- **Język badania:** przede wszystkim angielski.
- **Zależność:** model instruktażowy, prompt, gatunek akademicki/argumentacyjny i korpus; w polskim potrzebna replikacja fleksyjna.
- **Fałszywe pozytywy:** prawo, nauka, dokumentacja API, komunikat techniczny, tekst ekspercki dla eksperta.
- **Kontrprzykład:** „Weryfikacja tożsamości jest wymagana” może być krótsze i dokładniejsze od „Musisz potwierdzić, że jesteś…”, zależnie od UI.
- **Bezpieczne strategie:** zamień abstrakcję na czasownik tylko gdy rośnie zrozumiałość; pokaż wariant i uzasadnienie odbiorcze; zachowaj termin, jeśli niesie treść.
- **Elementy chronione:** terminy prawne/medyczne, nazwy procedur, liczby, modalność „musi/może/powinien”.
- **Test znaczenia:** porównaj twierdzenia, uczestników czynności, zakres obowiązku i stopień pewności; sprawdź, czy nie dodano sprawcy.
- **Kiedy nie zmieniać:** gdy nominalizacja jest terminem, skraca komunikat lub pasuje do gatunku.
- **Pewność:** umiarkowana; nie przenosić bezpośrednio na polski.

### P02 · Utarte pakiety, formuły i metatekst · poziom zdania/akapitu · umiarkowanie wysoka pewność

- **Opis operacyjny:** znajdź powtarzalne otwarcia, zamknięcia, sygnały „w tym artykule…”, równoległe ramy argumentu i formuły odsyłające, jeżeli pełnią tę samą funkcję wielokrotnie.
- **Dowody:** pakiety w esejach [E10], formulaic advice i monologiczny ton [E09], zmienność i słownictwo modeli [E02].
- **Język badania:** angielski.
- **Zależność:** silnie zależna od gatunku, zadania i instrukcji promptu; formuła może być konwencją.
- **Fałszywe pozytywy:** standardowe komunikaty bezpieczeństwa, abstrakty, instrukcje krokowe, tekst prawny, nagłówki dostępności.
- **Kontrprzykład:** „Skontaktuj się z lekarzem” w poradzie medycznej jest funkcjonalną instrukcją, nie wadą tylko dlatego, że powtarza się w korpusie [E09].
- **Bezpieczne strategie:** usuń tylko redundantne wystąpienie, połącz sąsiednie ramy, zmień szyk lub przejdź od metatekstu do informacji.
- **Elementy chronione:** ostrzeżenia, obowiązkowe disclaimery, linki, kolejność kroków, komunikaty regulacyjne.
- **Test znaczenia:** usuń ramę i sprawdź, czy odbiorca nadal wie: co zrobić, dlaczego, kiedy i z jaką pewnością.
- **Kiedy nie zmieniać:** gdy formuła sygnalizuje strukturę, bezpieczeństwo lub przewidywalność potrzebną użytkownikowi.
- **Pewność:** umiarkowanie wysoka w ograniczonych gatunkach; niska dla uniwersalnego markera.

### P03 · Nadmierna symetria i kontrast · poziom zdania/akapitu · niska pewność jako cecha AI

- **Opis operacyjny:** oceń, czy kilka kolejnych zdań ma sztucznie równoległą budowę, opozycje i identyczny rytm bez przyrostu treści. Konstrukcje typu „to nie X, to Y” są tylko hipotezą.
- **Dowody:** ogólne profile stylu i sztywność organizacji [E02–E04]; brak adekwatnego testu polskiego `to nie X, to Y`.
- **Język badania:** częściowo angielski; brak bezpośredniego polskiego dowodu dla tej konstrukcji.
- **Zależność:** retoryka, gatunek, autor, prompt i funkcja wyliczenia; symetria jest legalnym środkiem perswazji.
- **Fałszywe pozytywy:** slogany, copy marketingowe, definicje kontrastowe, literatura, wykład, tekst polityczny, dokument projektowy.
- **Kontrprzykład:** „To nie błąd danych, lecz błąd mapowania” może precyzyjnie zawężać diagnozę.
- **Bezpieczne strategie:** zapytaj o funkcję kontrastu; jeśli druga część tylko powtarza pierwszą, skróć; jeśli rozróżnia, zachowaj.
- **Elementy chronione:** negacja, zakres logiczny, kwalifikatory, warunki i cytat.
- **Test znaczenia:** sprawdź relację logiczną X/Y, negację, implikację i to, czy „lecz” nie zmienia zakresu.
- **Kiedy nie zmieniać:** gdy kontrast niesie argument, warunek, definicję lub głos gatunku.
- **Pewność:** niska; żadnego automatycznego wykrywania ani zakazu [C08–C09].

### P04 · Trójpodziały, listy i nadstrukturyzowanie · poziom akapitu/makrostruktury · umiarkowana pewność

- **Opis operacyjny:** sprawdź, czy tekst tworzy równą listę trzech/czterech elementów lub nadmiar nagłówków bez różnicy funkcji, hierarchii lub decyzji.
- **Dowody:** pośrednio profile organizacji, pakiety i ocena struktury [E02–E04, E10–E12]; brak dowodu, że sama triada jest AI.
- **Język badania:** głównie angielski; nie ma polskiej replikacji triad.
- **Zależność:** dokumentacja i edukacja potrzebują struktury; proza i dialog mogą potrzebować ciągłości.
- **Fałszywe pozytywy:** instrukcja krokowa, WCAG, specyfikacja, retoryka, plan projektu.
- **Kontrprzykład:** lista „kto, co, kiedy” jest naturalnym formularzem diagnostycznym.
- **Bezpieczne strategie:** scal elementy tylko, gdy są równoważnymi parafrazami; zamień nagłówki na zdania, gdy skraca to drogę do informacji.
- **Elementy chronione:** kolejność kroków, warunki, kompletność listy, etykiety UI.
- **Test znaczenia:** porównaj zbiór elementów, kolejność i zależności; żadna pozycja nie może zniknąć bez jawnej decyzji.
- **Kiedy nie zmieniać:** gdy skanowalność jest celem odbiorcy lub lista stanowi kontrakt.
- **Pewność:** umiarkowana dla nadmiaru w konkretnym tekście, niska jako marker AI.

### P05 · Redundantne powtórzenie i emfatyczne podsumowanie · poziom akapitu/sekcji · umiarkowana pewność

- **Opis operacyjny:** wykryj, czy akapit mówi tezę, parafrazę i trzecią konkluzję bez nowej konsekwencji, albo czy każdy fragment kończy się takim samym podsumowaniem.
- **Dowody:** ocena spójności, terminologii ewaluacyjnej i sztywności konkluzji [E03, E11–E12].
- **Język badania:** angielski, NLG i eseje.
- **Zależność:** zależy od dydaktyki, długości i gatunku; powtórzenie może być zamierzoną redundancją dostępnościową.
- **Fałszywe pozytywy:** instrukcja dla początkujących, ostrzeżenie, streszczenie executive, tekst terapeutyczny.
- **Kontrprzykład:** powtórzenie terminu kluczowego w podsumowaniu może poprawiać pamięć i nawigację.
- **Bezpieczne strategie:** zachowaj pierwszą pełną tezę i ostatnie zdanie tylko, jeśli wnosi działanie/konsekwencję; oznacz usuniętą parafrazę.
- **Elementy chronione:** zakres obowiązku, caveat, warunek końcowy, ostrzeżenie.
- **Test znaczenia:** ekstrakcja tez przed/po; liczba twierdzeń i warunków nie może się zmienić.
- **Kiedy nie zmieniać:** gdy powtórzenie kompensuje długość, streszcza sekcję dla nowego odbiorcy lub jest wymagane prawem.
- **Pewność:** umiarkowana; potrzebna ocena akapitowa.

### P06 · Spłaszczona modalność, strona i odpowiedzialność · poziom zdania/akapitu · umiarkowana pewność

- **Opis operacyjny:** sprawdź, czy tekst ukrywa sprawcę, zamienia „może” na „jest”, używa jednolitego dystansu lub pasywizacji mimo potrzeby jasnej odpowiedzialności.
- **Dowody:** nominalizacje, strona bierna, markery epistemiczne i różnice stance [E02–E04, E09–E10].
- **Język badania:** angielski; polskie odpowiedniki nie są zbadane w tym korpusie.
- **Zależność:** nauka i prawo mogą potrzebować bezosobowości; UI błędu często wymaga jasnego działania użytkownika/systemu.
- **Fałszywe pozytywy:** tekst metodologiczny, raport formalny, medycyna, zasada anonimowości, ograniczenia danych.
- **Kontrprzykład:** „Dane są szyfrowane” może być właściwym opisem właściwości systemu, gdy sprawca nie jest istotny.
- **Bezpieczne strategie:** przywróć sprawcę tylko z kontekstu; nie wzmacniaj pewności; rozróżnij „nie udało się”, „system odrzucił” i „użytkownik nie ma uprawnień”.
- **Elementy chronione:** modalność, odpowiedzialność prawna, stan systemu, warunek i czas.
- **Test znaczenia:** porównaj operator modalny, negację, źródło wiedzy i agensa.
- **Kiedy nie zmieniać:** gdy bezosobowość jest gatunkowa, dowodowa lub chroni prywatność.
- **Pewność:** umiarkowana; w polskim wymaga testu zgody i rządu.

### P07 · Kwieciste lub zbyt rzadkie słownictwo · poziom słowa/zdania/akapitu · umiarkowana pewność

- **Opis operacyjny:** sprawdź słowa nietypowe względem odbiorcy, które nie zwiększają precyzji, oraz metafory w miejscach instrukcyjnych.
- **Dowody:** rzadkie/flowery academic vocabulary w badaniu Tudino/Qin i przesunięcia słownikowe Reinharta [E02, E04].
- **Język badania:** angielski.
- **Zależność:** zależy od rejestru, autora, dziedziny i stylizacji; terminologia specjalistyczna może być jedyną precyzyjną opcją.
- **Fałszywe pozytywy:** esej literacki, tekst opinii, marka, tekst naukowy z utrwalonym terminem.
- **Kontrprzykład:** „konfabulacja” nie jest gorsza od „zmyślenie” w raporcie technicznym, jeśli termin jest zdefiniowany.
- **Bezpieczne strategie:** zastąp opisowym słowem tylko dla konkretnego odbiorcy; zostaw termin i dodaj objaśnienie, gdy ma wartość.
- **Elementy chronione:** terminy, nazwy własne, cytaty, marki, nomenklatura medyczna/prawna.
- **Test znaczenia:** porównaj definicję i zakres; sprawdź, czy prostszy synonim nie jest mniej dokładny.
- **Kiedy nie zmieniać:** gdy tekst jest stylizowany, cytowany lub termin jest kontrolowanym słownikiem.
- **Pewność:** umiarkowana; brak polskiego słownika AI-zmów.

### P08 · Utrata głosu, osobowej obecności i interakcji · poziom zdania/akapitu/makrostruktury · umiarkowana pewność

- **Opis operacyjny:** sprawdź, czy tekst wymazuje uzasadnione „my”, adresata, relację, źródło odpowiedzialności albo stopień zaangażowania autora.
- **Dowody:** relacyjna natura authorial voice [E13], stance i authorial presence w esejach [E03, E10], HCI współpisania [E15].
- **Język badania:** angielski; część badań dotyczy EAL i akademii.
- **Zależność:** gatunek, rola autora, relacja nadawca–odbiorca, dyscyplina i instrukcja.
- **Fałszywe pozytywy:** komunikat systemowy, procedura, tekst anonimowy, publikacja wieloautorska, prawo.
- **Kontrprzykład:** usunięcie „uważam” w wynikach badania może poprawić zgodność z normą gatunku, a nie „odczłowieczyć” tekst.
- **Bezpieczne strategie:** nie dodawaj osobowości z zewnątrz; przywracaj głos tylko na podstawie próbki autora lub jawnej księgi stylu.
- **Elementy chronione:** zaimki, afiliacja, autorstwo, cytowane stanowisko, modalność i zakres odpowiedzialności.
- **Test znaczenia:** porównaj źródło sądu, osobę mówiącą i relację z odbiorcą.
- **Kiedy nie zmieniać:** gdy bezosobowość jest zamierzona lub wymagana.
- **Pewność:** umiarkowana; głos nie jest jednym mierzalnym markerem [C10].

### P09 · Rytm i regularność składniowo-interpunkcyjna · poziom zdania/akapitu · niska–umiarkowana pewność

- **Opis operacyjny:** sprawdź serię zdań o tej samej długości, identycznym początku, równym rozkładzie przecinków i końcowych podsumowaniach; nie karz pojedynczego myślnika.
- **Dowody:** zmienność stylistyczna Reinharta i spójność ewaluacji [E02, E12].
- **Język badania:** angielski; brak polskiego benchmarku rytmu.
- **Zależność:** format UI, rytm prozy, tekst naukowy, czytnik ekranowy i zamierzona retoryka.
- **Fałszywe pozytywy:** lista instrukcji, regulamin, tekst poetycki, nagłówki, komunikaty o stałym wzorze.
- **Kontrprzykład:** krótkie komunikaty „Zapisano. Wysłano. Gotowe.” mogą być najlepszym UI.
- **Bezpieczne strategie:** zróżnicuj jedną lub dwie konstrukcje tylko, jeśli poprawia to płynność; zachowaj skanowalność i limit znaków.
- **Elementy chronione:** interpunkcja oddzielająca warunki, formatowanie, line break, długość i kolejność.
- **Test znaczenia:** porównaj granice zdań, relacje przyczynowe i wszystkie warunki.
- **Kiedy nie zmieniać:** w UI o stałym rytmie, tekście stylizowanym i legalnych listach.
- **Pewność:** niska jako diagnoza AI, umiarkowana jako diagnoza monotonii konkretnego tekstu.

### P10 · Lokalna i globalna niespójność · poziom akapitu/rozdziału/książki · wysoka pewność dla testu spójności

- **Opis operacyjny:** sprawdź referencję, nazwy, liczby, daty, czas, relacje, fakty, zakres twierdzeń, POV i zapowiedzi; oddziel błąd spójności od gustu.
- **Dowody:** różnice w spójności i metodach oceny [E11–E12]; długi kontekst i błędy temporalne/faktograficzne [E18].
- **Język badania:** angielski; ConStory jest emerging.
- **Zależność:** długość, model, kontekst, gatunek i dostęp do poprzednich fragmentów.
- **Fałszywe pozytywy:** narracja niewiarygodnego narratora, celowa elipsa, fikcja, cytat zawierający błąd.
- **Kontrprzykład:** zmiana czasu w dialogu może być intencjonalną retrospekcją.
- **Bezpieczne strategie:** najpierw wykaż konflikt i jego źródło; poprawiaj tylko przy potwierdzonym kanonie lub instrukcji autora.
- **Elementy chronione:** liczby, daty, encje, jednostki, cytaty, reguły świata, relacje postaci.
- **Test znaczenia:** księga faktów/encji + porównanie przed/po + kontrola rozdziałów sąsiednich.
- **Kiedy nie zmieniać:** gdy różnica jest oznaczona jako perspektywa, fikcja lub cytat.
- **Pewność:** wysoka dla potrzeby testów; umiarkowana dla konkretnych automatycznych detektorów.

### P11 · Kalka, tłumaczenie i niedopasowanie uzusu · poziom słowa/zdania/akapitu · umiarkowana pewność

- **Opis operacyjny:** rozpoznaj konstrukcję, która jest formalnie możliwa po polsku, ale przenosi angielski szyk, kolokację, rejestr lub pragmatykę i nie pasuje do odbiorcy.
- **Dowody:** źródła wielojęzyczne i morfologiczne uzasadniają ostrożne rozdzielenie języków [E22]; źródła tłumaczeniowe są tylko analogią procesu [E25].
- **Język badania:** transfer z en/de/ta/tr i praktyka tłumaczeniowa; brak kompletnego polskiego korpusu kalk.
- **Zależność:** kierunek tłumaczenia, model, prompt, terminologia, odbiorca i gatunek.
- **Fałszywe pozytywy:** internacjonalizm, termin branżowy, nowy uzus, cytat, świadoma stylizacja.
- **Kontrprzykład:** zapożyczony termin może być standardem branży i nie powinien być „spolszczany” dla samej naturalności.
- **Bezpieczne strategie:** porównaj kolokacje w polskim korpusie lub słowniku; proponuj warianty z zachowaniem sensu i rejestru.
- **Elementy chronione:** nazwy własne, terminy, cytaty, markery języka i tłumaczenie nazw.
- **Test znaczenia:** porównaj role semantyczne, aspekt, stronę, zakres i implikacje pragmatyczne.
- **Kiedy nie zmieniać:** gdy forma jest zaakceptowanym terminem lub tekst ma źródłowo obcy rejestr.
- **Pewność:** umiarkowana; wymaga polskich zasobów referencyjnych.

### P12 · Niedopasowanie prostego języka i dostępności · poziom komunikatu/sekcji · wysoka pewność jako kontrola celu

- **Opis operacyjny:** oceń język względem odbiorcy, zadania, poziomu wiedzy, czytnika ekranowego, błędów i terminów; nie utożsamiaj prostoty z potocznością.
- **Dowody:** przeglądy PLS, RCT, ISO 24495 i WCAG [E14, E21, E23–E24].
- **Język badania:** angielski, standardy międzynarodowe; brak pełnej polskiej walidacji.
- **Zależność:** odbiorca, domena, kanał, dostępność, ryzyko medyczne/prawne.
- **Fałszywe pozytywy:** tekst dla ekspertów, termin kontrolowany, treść prawna lub medyczna, instrukcja z koniecznym warunkiem.
- **Kontrprzykład:** „hipoglikemia” może być właściwsza niż „niski cukier”, jeśli odbiorca potrzebuje terminu do dalszego działania.
- **Bezpieczne strategie:** dodaj objaśnienie przy pierwszym użyciu; skróć zdanie, nie usuwając warunku; testuj z odbiorcą.
- **Elementy chronione:** terminologia, ostrzeżenia, stopień ryzyka, instrukcje, język części i etykiety dostępności.
- **Test znaczenia:** pytania „co mam zrobić?”, „kiedy?”, „jakie ryzyko?” oraz test zrozumienia odbiorcy.
- **Kiedy nie zmieniać:** gdy zmiana zmniejsza precyzję, usuwa dostęp do terminu albo narusza wymagania domeny.
- **Pewność:** wysoka jako zasada celowania w odbiorcę, nie jako automatyczny test czytelności.

### P13 · „Cechy detektora” jako pozorna diagnoza jakości · poziom globalny · wysoka pewność zakazu

- **Opis operacyjny:** detektory, perplexity, Polish Ratio, pojedyncze słowa i stylometryczne sygnały mogą mówić o autorstwie/udziale modelu w określonym zbiorze, nie o tym, co poprawić.
- **Dowody:** Weber-Wulff, Liang, Jiang et al., Sadasivan, PolEval, Polish Ratio [E07, E16–E17].
- **Język badania:** en i pl, ale konstrukty są detekcyjne.
- **Zależność:** generator, domena, parafraza, próbka, populacja i data modelu.
- **Fałszywe pozytywy:** dobry formalny tekst, tekst tłumaczony, NNES, tekst stylizowany, tekst z określonym formatem.
- **Kontrprzykład:** ten sam tekst może być poprawny i jednocześnie sklasyfikowany jako AI albo odwrotnie.
- **Bezpieczne strategie:** nie wyświetlaj wyniku detektora jako oceny użytkownikowi; zamiast tego testuj kryteria jakości i pochodzenie osobno.
- **Elementy chronione:** całość treści; nie wolno zmieniać tekstu dla obniżenia wyniku detektora.
- **Test znaczenia:** wyłącznie testy jakości, faktów, głosu, dostępności i techniki; brak testu „detektor spadł”.
- **Kiedy nie zmieniać:** zawsze, jeśli jedyną przesłanką jest detektor.
- **Pewność:** wysoka.

### 5.2. Mity internetowe

Popularność mitu została potraktowana jako zjawisko komunikacyjne. Wyniki listicle/SEO/Reddit/news są zapisane w `EXCLUDED.md`, ale nie sterują taksonomią. Badania empiryczne potwierdzają czasem lokalną różnicę w korpusie, nie internetową regułę [C14].

| ID mitu | Obiegowa teza | Co rzeczywiście wynika z dowodów | Decyzja |
|---|---|---|---|
| M01 | Jedno słowo, np. „delve”, dowodzi AI. | Słowo może być nadreprezentowane w określonym korpusie/modelu, a człowiek może użyć go legalnie [E02]. | Nie usuwać bez kontekstu. |
| M02 | Myślnik, dwukropek, triada lub nagłówek to sygnał autorstwa. | Są wielofunkcyjnymi środkami pisania; ich funkcję oceniać w gatunku [C09]. | Nie wykrywać tokenem. |
| M03 | Każdy formalny, uporządkowany tekst jest „AI-owy”. | Dokumentacja, prawo, nauka i UI potrzebują porządku; formalność nie jest wadą [E14, E23–E24]. | Zachować, jeśli służy zadaniu. |
| M04 | „Bardziej ludzki” tekst musi być potoczny, emocjonalny i pełen slangu. | Głos jest relacyjny i gatunkowy; slang może obniżyć dostępność, markę lub precyzję [E13–E14]. | Nie dopisywać osobowości z zewnątrz. |
| M05 | Detektor lub perplexity mierzy jakość. | Detektory klasyfikują autorstwo/udział w określonych danych i mają bias/niestabilność [E16–E17]. | Nie używać jako bramki. |
| M06 | „To nie X, to Y” jest uniwersalnym markerem AI. | Brak adekwatnego dowodu dla polskiego; to legalna konstrukcja kontrastu i definicji [P03]. | Hipoteza do badania, nie reguła. |

Legalne użycie tych samych form przez ludzi jest istotnym testem fałszywie dodatnim: redaktor może użyć triady dla zapamiętywalności, lekarz formuły bezpieczeństwa, prawnik konstrukcji kontrastowej, badacz strony biernej, a autor prozy powtórzenia rytmicznego. Skill ma rozpoznawać cel, nie karać formę.

## 6. Zasady kontekstowej redakcji

### 6.1. Triage zamiast podmiany słów

Proponowana analiza ma sześć pytań:

1. Kto czyta i co ma zrobić?
2. Jaki jest gatunek, kanał i akceptowany rejestr?
3. Jaka dokładnie cecha obniża zrozumiałość, wiarygodność, płynność lub zgodność z głosem?
4. Czy cecha jest pojedyncza, czy tworzy konfigurację z powtórzeniem, rytmem, modalnością i makrostrukturą?
5. Jakie elementy muszą pozostać identyczne?
6. Czy dowód jest wystarczający do zmiany, czy należy tylko zgłosić kandydat?

Ocena powinna mieć co najmniej poziom `brak zmiany`, `sugestia`, `wymaga ręcznej decyzji`, `błąd znaczenia/faktu`, `błąd techniczny`. Sama etykieta „AI-like” nie jest akcją.

„Nowoczesny język 2026” oznacza tu aktualny, adekwatny uzus dla danej wspólnoty i kanału. Nie oznacza obowiązkowego slangu, usuwania terminologii specjalistycznej ani wyrównywania wszystkich tekstów do jednego stylu.

### 6.2. Operacje redakcyjne

Bezpieczna kolejność jest lokalna i odwracalna:

- skróć redundancję, nie usuwając twierdzeń;
- zamień rzeczownik na czasownik tylko wtedy, gdy rośnie jasność i nie znika termin;
- rozbij przeładowane zdanie, zachowując wszystkie warunki;
- połącz dwa zdania tylko wtedy, gdy relacja logiczna jest jawna;
- zastąp kwieciste słowo opisem odbiorczym, ale zachowaj termin kontrolowany;
- zróżnicuj rytm tylko w prozie lub artykule, nie w kosztownym skanowaniu UI;
- przeformułuj metatekst, jeśli nie wnosi nawigacji;
- przywróć osobę/źródło sądu tylko na podstawie kontekstu, nie przez dopisanie „ludzkiego” tonu;
- w razie niepewności pokaż dwie wersje i powód, zamiast automatycznie wybierać.

Każda operacja powinna mieć ślad: cecha, dowód, proponowana zmiana, chronione elementy, niepewność i wynik testu. Redakcja nie może obniżać stopnia pewności ani zamieniać „może” na „na pewno” [C15].

### 6.3. Gatunki

| Gatunek | Priorytet | Typowa ostrożność |
|---|---|---|
| UI i etykiety | działanie, skanowalność, długość, dostępność | nie dopisuj osobowości; nie rozbijaj placeholderów |
| komunikat błędu | stan, przyczyna, następny krok | odróżnij błąd użytkownika, systemu i uprawnień |
| dokumentacja | struktura, terminologia, przykłady | nie usuwaj precyzji dla pozornej prostoty |
| artykuł/opinia | rytm, głos, argument, redundancja | zachowaj stanowisko, źródła i modalność |
| nauka | dowód, ograniczenie, termin, niepewność | nie zamieniaj zastrzeżeń na kategoryczne wnioski |
| marketing | obietnica, marka, rytm, odbiorca | legalność i claimy są chronione; „bardziej ludzkie” nie znaczy slangowe |
| dialog | relacja, idiolekt, rytm, intencja | nie ujednolicaj głosów postaci |
| proza | stylizacja, POV, rytm, zapowiedzi | nie wygładzaj celowej dziwności ani narratora niewiarygodnego |
| prawo/medycyna | zakres, obowiązek, ryzyko, termin | każda parafraza wymaga eksperta domenowego; terminów nie skraca się automatycznie |
| cytat/mixed-language | wierność źródłu i oznaczenie języka | cytatu nie redagować; tekst mieszany może być zamierzony |

### 6.4. Czego nie robić

Nie stosować listy zakazanych słów, globalnej zamiany synonimów, przymusowego slangu, automatycznego usuwania myślników/dwukropków/triad, „humanizowania” przez dodawanie emocji ani optymalizacji pod wynik detektora [C08–C09, C12, C23]. Nie usuwać fachowych słów tylko dlatego, że są rzadkie. Nie poprawiać tekstu już dobrego, cytatu ani legalnej stylizacji bez wyraźnego celu [C24].

## 7. Klasyfikacja tekstu widocznego dla użytkownika

### 7.1. Klasy widoczności

| Klasa | Definicja | Domyślna akcja |
|---|---|---|
| V1 — jawnie użytkowa | Tekst, który użytkownik czyta: etykieta, akapit, komunikat, opis, e-mail, treść strony | kandydat do analizy kontekstowej |
| V2 — runtime użytkowa | Tekst wynikający z warunku, interpolacji, lokalizacji lub generatora, widoczny dopiero w stanie aplikacji | analiza przez parser/śledzenie źródła; test runtime |
| V3 — niepewna | String może trafić do UI, ale nie ma dowodu ścieżki wyświetlenia | raport kandydatów; bez automatycznej zmiany |
| P1 — chroniona techniczna | klucz, identyfikator, nazwa zmiennej, log, fixture, kod, test, URL, token | brak redakcji |
| P2 — treść mieszana | fragment użytkowy zawiera chronione wyrażenia lub formatowanie | redaguj tylko bezpieczny tekst; zachowaj tokeny |
| G — generowana | artefakt pochodny z mapowania/source-of-truth | zmieniaj źródło, regeneruj i weryfikuj |

### 7.2. Format po formacie

- **HTML:** kandydatami są tekstowe węzły oraz użytkowe `title`, `aria-label`, `placeholder`, `alt` i widoczne etykiety. Chronić tagi, atrybuty techniczne, URL, identyfikatory, wartości sterujące, encje i semantykę ARIA. `alt` jest tekstem dla odbiorcy, ale jego funkcja nie jest zwykłym podpisem.
- **JSX/TSX, Vue, Svelte:** analizować tekst węzłów i propsy użytkowe, a osobno wyrażenia, helpery, nazwy komponentów i klucze. Nie zmieniać identyfikatora tylko dlatego, że przypomina polskie słowo. `condition ? "tekst A" : "tekst B"` wymaga zachowania obu gałęzi i testu stanu.
- **Szablony:** rozdzielić tekst stały, interpolację, filtry, makra, fallback i warunki. Konkatenacja (`"Witaj, " + name`) jest kandydatem ryzyka; preferować pełny komunikat z placeholderem w źródle prawdy.
- **Markdown/MDX:** analizować prozę, nagłówki, listy, etykiety linków i `alt`; chronić frontmatter keys, URL, inline code, fenced code, importy, komponenty i wyrażenia MDX. Zmiana nagłówka może zmienić linkowanie i makrostrukturę.
- **JSON/YAML i18n:** wartości są kandydatami, klucze są chronione. Trzeba rozpoznać ICU/MessageFormat, odmiany liczby, gender/select, escape i mapowanie locale. `msgid` w PO jest źródłem, `msgstr` jest tłumaczeniem; nie zmieniać flag, komentarzy i kolejności bez potrzeby.
- **PO:** zachować `msgctxt`, `msgid`, `msgid_plural`, `msgstr[n]`, placeholdery i kodowanie. Zmiana musi przejść parser gettext oraz test wszystkich wariantów liczby.
- **Backend:** kandydatem jest komunikat wysyłany użytkownikowi, odpowiedź API przeznaczona do odczytu, e-mail i treść powiadomienia. Log, stack trace, metryka, fixture, snapshot i test nie są domyślnie treścią użytkową.
- **E-mail i pliki treści:** rozróżnić temat, preheader, tekst widoczny, stopkę prawną, linki i dane dynamiczne. E-mail może mieć własny limit długości i wymagania klienta.
- **Tekst warunkowy/dynamiczny:** zapisać wszystkie warianty, nie redagować tylko widocznej gałęzi z jednego stanu. Jeśli ścieżka jest nieznana, wynik ma status V3.

### 7.3. Parser czy wyszukiwanie tekstowe

Wyszukiwanie tekstowe służy do inwentaryzacji i znajdowania literalnych wartości. Parser/AST jest wymagany do bezpiecznej zmiany, gdy język ma składnię, interpolację, escape'y, warunki, komponenty lub zależność od pliku źródłowego. Reguła praktyczna: im większa możliwość, że zmiana stringa zmieni kod, mapowanie albo wariant runtime, tym mniej wystarcza regex. Kandydat bez pewnej klasyfikacji zostaje w raporcie V3 [C18].

## 8. Kontrakt zachowania i bezpieczna edycja repozytoriów

### 8.1. Elementy chronione

Skill musi domyślnie chronić:

- klucze lokalizacji, identyfikatory, nazwy zmiennych, komponentów, testów i tras;
- `{name}`, `%s`, `{{value}}`, `${value}`, named placeholders oraz wszystkie warianty ICU/MessageFormat;
- selektory `select`, `plural`, `gender`, offsety, fallbacki, kolejność komunikatów i warunki;
- tagi HTML/Markdown, linki, URL, encje, inline/fenced code, importy MDX i wyrażenia;
- escape'y, końce linii, kodowanie, BOM, mapowanie locale, flagi PO;
- nazwy własne, marki, terminy kontrolowane, liczby, daty, jednostki, wersje i cytaty;
- ograniczenia długości, formaty UI, kolejność elementów, semantykę ARIA i komunikaty bezpieczeństwa;
- logikę, warunki, klucze i pochodzenie pliku generowanego.

UTS #35 i dokumentacja ICU opisują pełny komunikat, zmienne, warianty, placeholdery i fallback; to uzasadnia ochronę struktury, a nie tylko znaków `{}` [E20]. WCAG dodatkowo wymaga języka części, objaśniania nietypowych słów i sensownych sugestii błędów [E23].

### 8.2. Bezpieczny workflow

1. **Inwentaryzacja:** wykaz plików, locale, formatów, źródeł prawdy, artefaktów generowanych i ścieżek runtime.
2. **Klasyfikacja:** V1/V2/V3/P1/P2/G; zapis powodu i pewności.
3. **Próbka:** mała, reprezentatywna partia z UI, komunikatem, dokumentacją, tekstem chronionym i przypadkiem niepewnym.
4. **Redakcja:** tylko V1/V2 o wysokiej pewności; każda sugestia ma diff treści i opis celu.
5. **Diff semantyczny:** porównanie twierdzeń, modalności, encji, liczb, terminów, placeholderów, gałęzi i kolejności.
6. **Testy składni/build:** parser formatów, lint, typecheck, test lokalizacji, build i testy jednostkowe.
7. **Kontrola runtime/wizualna:** wszystkie warunki, viewporty, języki, długości, czytnik/ARIA i komunikaty błędów.
8. **Raport i rollback:** lista zmian, niepewności, wyników, plików nietkniętych i jednoznaczna ścieżka odtworzenia.

### 8.3. Źródło prawdy i artefakty pochodne

Nie edytować ręcznie `dist`, skompilowanych bundle’i, snapshotów ani wygenerowanych lokalizacji, jeśli istnieje źródło prawdy. Zmienić źródło, uruchomić generator, porównać wynik i sprawdzić, czy generator nie nadpisał chronionej treści. Gdy nie da się ustalić źródła prawdy, przerwać automatyczną zmianę i zgłosić V3/G.

### 8.4. Rollback i ryzyko

Każda partia powinna być mała, identyfikowalna i odwracalna. Backup musi obejmować źródło oraz metadane lokalizacji; rollback przywraca poprzedni stan przed kolejną próbą. Nie scalać zmian stylistycznych z refaktorem kodu. Jeśli semantyczny diff, parser, build lub test runtime nie przejdzie, wynik to `stop`, nie „best effort”. Badania o refaktoryzacjach i natural robustness pokazują, że pozornie bezpieczna transformacja może wywołać błąd albo nienaturalny rezultat [E19].

## 9. Długie formy i książki

### 9.1. Podział semantyczny

Książki i duże dokumenty dzielić po jednostkach znaczeniowych: rozdział, scena, argument, sekcja, akapit i punkt decyzji. Nie dzielić wyłącznie co N tokenów. Nakładka kontekstu powinna obejmować tylko potrzebne elementy: ostatnią zmianę stanu, aktywne encje, nierozwiązane zapowiedzi, definicje terminów, POV i czas. Zbyt duża nakładka może powielać lub zacierać źródło; zbyt mała gubi zależności.

LongGenBench pokazuje, że długie generowanie może tracić spójność i dokładność, a przeglądy długich dokumentów wskazują na problemy z zachowaniem narracji i metrykami [E18]. ConStory-Bench raportuje w preprincie tendencję do błędów faktograficznych i temporalnych w środkowych odcinkach historii; używamy tego wyłącznie jako sygnału ryzyka [E18].

### 9.2. Rejestry

Przyszły workflow powinien utrzymywać:

- **księgę stylu:** rejestr, długość zdań, POV, osobę, dopuszczalną metaforykę, rytm i zakazy lokalne;
- **glosariusz:** termin, definicja, forma fleksyjna, dozwolone warianty, język i źródło;
- **rejestr postaci/nazw:** nazwa, alias, płeć/rodzaj gramatyczny, relacje, odmiana, pierwsze wystąpienie;
- **oś czasu:** daty, kolejność scen, wiek, czas narracji i retrospekcje;
- **rejestr faktów/claim ledger:** twierdzenie, źródło, pewność, status i dozwolona parafraza;
- **rejestr zmian:** identyfikator, fragment, powód, wersja, osoba/model, decyzja i rollback;
- **rejestr zapowiedzi:** foreshadowing, rozwiązanie, punkt ujawnienia i zakaz przedwczesnego dopowiedzenia.

### 9.3. Przejścia

Najpierw przejście lokalne (gramatyka i rytm), następnie akapitowe (spójność i redundancja), rozdziałowe (głos, rejestr, fakty), a na końcu globalne. Globalne przejście nie powinno przepisywać całej książki; ma porównywać rejestry, wyszukiwać konflikty i wskazywać miejsca do ręcznej decyzji. Po każdej partii aktualizuje się księgę stylu i rejestr zmian. Nie wolno „normalizować” głosów postaci ani usuwać celowej nieciągłości narratora.

### 9.4. Testy dryfu

Minimalny zestaw testów obejmuje: zgodność imion i odmiany, relacje i role, liczby/dat, jednostek, czasów, POV, terminów, faktów, kolejności zdarzeń, zapowiedzi i cytatów. Dla każdego fragmentu należy sprawdzić wpływ na poprzedni i następny fragment. Wynik automatyczny jest kandydatem, nie certyfikatem spójności.

## 10. Architektura ewaluacji i zestaw przypadków brzegowych

### 10.1. Zbiór ewaluacyjny

Zbiór powinien być stratyfikowany według języka, gatunku i ryzyka:

- krótkie UI: etykieta, tooltip, CTA, onboarding;
- błędy: brak uprawnień, walidacja, sieć, bezpieczeństwo;
- dokumentacja, FAQ, e-mail i artykuł;
- nauka, plain-language summary i raport techniczny;
- marketing i tekst opinii;
- dialog, proza i tekst stylizowany;
- prawo, medycyna i tekst z terminologią wysokiego ryzyka;
- cytaty, bibliografia i treść mieszana językowo;
- HTML/JSX/TSX/Vue/Svelte/Markdown/MDX/JSON/YAML/PO/backend;
- tekst już dobry, tekst celowo „AI-like”, tekst tłumaczony, hybryda człowiek–model oraz tekst z placeholderami.

Każdy przypadek powinien mieć metadane: autor/model, prompt jeśli znany, język, gatunek, odbiorca, źródło prawdy, dozwolony rejestr i elementy chronione. Trzeba przechowywać wersję przed zmianą oraz — gdy możliwe — zatwierdzoną wersję ekspercką.

### 10.2. Kryteria

Ocena nie może mieszać konstruktów. Minimum:

1. zachowanie twierdzeń, faktów, encji, liczb, dat, jednostek i terminów;
2. zachowanie stopnia pewności, negacji, modalności, zakresu i odpowiedzialności;
3. poprawność gramatyczna, idiomatyczność i płynność polska;
4. dopasowanie do gatunku, odbiorcy, kanału i głosu;
5. spójność lokalna i globalna;
6. dostępność, skanowalność i zrozumienie;
7. integralność techniczna: parser, placeholdery, build, długość UI, runtime i rendering;
8. brak pogorszenia dobrego tekstu.

Rzetelna ewaluacja powinna używać zaślepionych, rodzimych oceniających; dla prawa, medycyny, nauki i kodu — także ekspertów domenowych. Pairwise comparison, skala zakotwiczona i komentarz do decyzji są bezpieczniejsze niż jedno pytanie „czy brzmi ludzko?”. Należy raportować zgodność oceniających, rozbieżności i przypadki odrzuconych ocen [E11–E12].

### 10.3. Metryki i testy

| Test | Pozytywny wynik | Czerwone światło |
|---|---|---|
| No-op dobrego tekstu | brak zmian lub zaakceptowana minimalna sugestia | poprawiony tekst oceniony gorzej niż wejście |
| Defekt → poprawa | mniej redundancji/kalki/niejasności przy zachowaniu sensu | poprawa „naturalności” kosztem treści |
| Fakty i modalność | 100% krytycznych claimów, liczb, negacji i pewności zachowane | dodany/utracony fakt lub mocniejszy wniosek |
| Chronione tokeny | identyczne placeholdery, ICU, tagi, linki, klucze i warianty | parsowanie lub mapowanie locale nie przechodzi |
| Widoczność | zmienione wyłącznie V1/V2 o wysokiej pewności | dotknięty log, test, fixture, identyfikator lub V3 |
| Syntax/build | parser, lint, typecheck/build i testy przechodzą | błąd kompilacji albo zmiana gałęzi |
| Runtime/UI | wszystkie stany, języki i viewporty działają, tekst mieści się i jest dostępny | ucięcie, zła etykieta, brak focus/error suggestion |
| Długi dokument | brak dryfu encji, terminów, czasu i POV | konflikt w sąsiednim lub dalszym rozdziale |
| Rollback | odtworzenie poprzedniej wersji jest możliwe i sprawdzone | brak źródła prawdy lub nieodwracalny diff |

Raportować można precision/recall zmian względem ekspertów, odsetek no-op, regresję semantyczną, naruszenia chronionych tokenów, poprawę w rubricu, czas i koszt. Nie raportować „spadku detektora” jako sukcesu. Stylometryczne podobieństwo może być pomocnicze tylko przy jawnie określonym stylu autora; nie jest miarą człowieczeństwa [C12, C22].

## 11. Detektory AI, błędy metodologiczne i ograniczenia etyczne

### 11.1. Cztery odrębne pytania

1. **Jakość:** czy tekst jest poprawny, zrozumiały, adekwatny i spójny?
2. **Autorstwo/proweniencja:** kto lub co go wygenerowało?
3. **Udział narzędzia:** czy tekst był polerowany lub parafrazowany przez model?
4. **Bezpieczeństwo i etyka:** czy zawiera ryzyko szkody, narusza prywatność lub ukrywa odpowiedzialność?

Detektor odpowiada najwyżej na część pytania 2/3 w konkretnym rozkładzie danych. Nie odpowiada na pytanie 1 ani nie wykrywa plagiatu, prawdy, dobrego stylu lub zgody autora. Badania pokazują zarówno bias wobec autorów nieanglojęzycznych, jak i kontrprzykłady z dobrze próbkowanych danych [E16–E17].

### 11.2. Błędy metodologiczne

Najczęstsze błędy to: mieszanie tekstów z różnych gatunków; brak wersji modelu i promptu; trenowanie i testowanie na przeciekających korpusach; użycie jednego detektora; brak tekstu ludzkiego z tej samej populacji; utożsamianie stylu formalnego z AI; brak testu parafrazy; brak oceny semantycznej; raportowanie accuracy bez kalibracji, confidence interval i false-positive rate; brak osobnej grupy tekstu tłumaczonego; brak replikacji w czasie [E11–E12, E16–E17].

### 11.3. Etyka

Skill nie powinien obiecywać obejścia detektorów, „ukrywania AI” ani dowodzenia autorstwa. Może poprawiać tekst na życzenie użytkownika i dokumentować udział narzędzia. Powinien minimalizować dane, nie wysyłać tajnych repozytoriów bez zgody, zachować audyt zmian i wspierać ręczne zatwierdzenie. W prawie i medycynie potrzebna jest odpowiedzialność człowieka oraz kontrola eksperta. W dostępności prosty język nie może zmniejszać autonomii odbiorcy ani usuwać terminów potrzebnych do uzyskania pomocy [C11, C24].

## 12. Wymagania dla przyszłego skilla, bez jego implementacji

### 12.1. Kontrakt wejścia

Skill powinien przyjmować tekst, kontekst, język, gatunek, odbiorcę, kanał, poziom ingerencji, wzorcową próbkę głosu oraz listę chronionych elementów. W repozytorium powinien przyjmować ścieżkę źródła, typ pliku, informację o generatorze i testach. Brak tych danych zwiększa status V3 i obniża automatyzację.

### 12.2. Kontrakt wyniku

Wynik powinien zawierać: diagnozę cechy, dowód kontekstowy, pewność, proponowaną zmianę lub no-op, chronione fragmenty, diff semantyczny, testy i decyzję człowieka. Osobno raportować błędy techniczne, językowe, gatunkowe, dostępnościowe i proweniencji. Nie używać jednego wyniku „human score”.

### 12.3. Gating i stop rules

Automatyczna zmiana jest dozwolona tylko dla wysokiej pewności widoczności, niskiego ryzyka semantycznego i znanego źródła prawdy. Skill zatrzymuje się przy: nieznanym parserze, konflikcie placeholderów, niepewnym cytacie, nieznanej gałęzi, błędzie build/runtime, różnicy liczby/negacji/modalności, przekroczeniu limitu UI, zmianie chronionego elementu lub braku rollbacku. Tekst dobry i tekst stylizowany mają domyślny no-op.

### 12.4. Skalowanie

Dla krótkiej wiadomości wystarczy lokalna analiza z testem znaczenia. Dla dokumentacji potrzebny jest indeks terminów i linków. Dla książki potrzebne są segmenty, kontrolowany kontekst, rejestry stanu i globalny pass. W każdym trybie artefakty diagnostyczne powinny być wersjonowane, a zmiany dzielone na małe partie. Rozwiązanie nie może wymagać pełnego tekstu w jednym promptcie ani zakładać, że większe okno kontekstu rozwiązuje spójność [E18].

### 12.5. Kryterium jakości

Minimalna definicja sukcesu: `poprawa lokalnego celu + zachowanie znaczenia + zachowanie kontraktu technicznego + brak pogorszenia dobrego tekstu + adekwatność do odbiorcy`. „Brzmi bardziej jak człowiek” może być komentarzem oceniającego, ale nie powinno być jedyną funkcją celu [C01, C22].

## 13. Luki i pytania otwarte

1. Brakuje wielogatunkowego, ręcznie ocenionego korpusu naturalnego polskiego tekstu ludzkiego i generowanego, z kontrolą modelu, promptu, temperatury i tłumaczenia.
2. Nie wiadomo, które cechy syntaktyczne, pragmatyczne i rytmiczne są stabilne w polskich modelach, a które są artefaktem zadania.
3. Brakuje polskich badań nad authorial voice, odbiorcą, prozą, dialogiem, UI i plain language w kontekście AI.
4. Nie ma polskiego benchmarku długiej książki z faktami, rejestrem postaci, POV, osią czasu i zapowiedziami.
5. Nie wiadomo, jak najlepiej mierzyć „kalke” i niedopasowanie uzusu bez karania nowego, legalnego języka.
6. Potrzebne są badania psycholingwistyczne nad tym, kiedy odbiorca odczuwa sztuczność, i czy potrafi wskazać przyczynę bez etykiety AI.
7. Trzeba rozdzielić ocenę native speaker, eksperta domenowego, osoby z niepełnosprawnością, redaktora i autora; ich konflikty są informacją, nie tylko szumem.
8. Potrzebne są longitudinalne replikacje po zmianie modeli i promptów; wynik z 2023/2024 nie jest wieczną cechą „ChatGPT”.
9. Dla repozytoriów brakuje benchmarku widoczności: poprawna klasyfikacja tekstu runtime kontra logu, fixture'u, testu i klucza w realnych aplikacjach.
10. Nie rozstrzygnięto, kiedy półautomatyczny AST wystarcza, a kiedy trzeba uruchomić aplikację i obserwować realny DOM, ekran czytnika oraz wszystkie gałęzie.
11. Trzeba zbadać interakcję prostego języka z terminologią polską, inkluzywnością, odmianą nazw i długością komunikatu na małych ekranach.
12. Nie ma dowodu, że jakikolwiek uniwersalny „AI marker” poprawia tekst po usunięciu; to powinien być test falsyfikowalny, nie założenie.

## 14. Bibliografia APA 7

Wykaz odpowiada sprawdzonym rekordom z `SOURCES.bib`; DOI lub stabilny URL jest podany tam, gdzie istnieje. Rekordy preprintów są jawnie oznaczone. Standardy i dokumentacje nie są przedstawiane jako badania eksperymentalne.

Bavota, G., De Carluccio, B., De Lucia, A., Di Penta, M., Oliveto, R., & Strollo, O. (2012). When does a refactoring induce bugs? An empirical study. In *2012 12th IEEE International Working Conference on Source Code Analysis and Manipulation* (pp. 104–113). IEEE. https://doi.org/10.1109/SCAM.2012.20

Casal, J. E., & Kessler, M. (2023). Can linguists distinguish between ChatGPT/AI and human writing? A study of research ethics and academic publishing. *Research Methods in Applied Linguistics, 2*(3), 100068. https://doi.org/10.1016/j.rmal.2023.100068

Casal, J. E., Stewart, C. M., & Windsor, A. J. (2025). It is important to consult a linguist: Verb-Argument Constructions in ChatGPT and human experts' medical and financial advice. *PLOS ONE, 20*(5), e0324611. https://doi.org/10.1371/journal.pone.0324611

Connell Pensky, A. E., Usdan, J. H., & Chang, H. (2025). Generative AI's impact on graduate student professional writing productivity and quality. *International Journal of Artificial Intelligence in Education, 35*(6), 4057–4082. https://doi.org/10.1007/s40593-025-00528-z

Dadas, S., Grębowiec, M., Perełkiewicz, M., & Poświata, R. (2025). Evaluating Polish linguistic and cultural competency in large language models. In *Lecture Notes in Computer Science* (pp. 60–71). Springer. https://doi.org/10.1007/978-3-032-03705-3_6

Elangovan, A., Liu, L., Xu, L., Bodapati, S. B., & Roth, D. (2024). ConSiDERS-The-Human evaluation framework: Rethinking human evaluation for generative large language models. In *Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics* (pp. 1137–1160). Association for Computational Linguistics. https://aclanthology.org/2024.acl-long.63/

Gainey, K., Smith, J., McCaffery, K., Clifford, S., & Muscat, D. (2024). Are plain language summaries published in health journals written according to instructions and health literacy principles? A systematic environmental scan. *BMJ Open, 14*, e086464. https://doi.org/10.1136/bmjopen-2024-086464 (Correction: https://doi.org/10.1136/bmjopen-2024-086464corr1)

Herbold, S., Hautli-Janisz, A., Heuer, U., Kikteva, Z., & Trautsch, A. (2023). A large-scale comparison of human-written versus ChatGPT-generated essays. *Scientific Reports, 13*, 18617. https://doi.org/10.1038/s41598-023-45644-9

Howcroft, D. M., Belz, A., Clinciu, M.-A., Gkatzia, D., Hasan, S. A., Mahamood, S., Mille, S., van Miltenburg, E., Santhanam, S., & Rieser, V. (2020). Twenty years of confusion in human evaluation: NLG needs evaluation sheets and standardised definitions. In *Proceedings of the 13th International Conference on Natural Language Generation* (pp. 169–182). Association for Computational Linguistics. https://aclanthology.org/2020.inlg-1.23/

International Organization for Standardization. (2015). *ISO 17100:2015 Translation services—Requirements for translation services*. https://www.iso.org/standard/59149.html

International Organization for Standardization. (2017). *ISO 18587:2017 Translation services—Post-editing of machine translation output—Requirements*. https://www.iso.org/standard/62970.html

International Organization for Standardization. (2023). *ISO 24495-1:2023 Plain language—Part 1: Governing principles and guidelines*. https://www.iso.org/standard/78907.html

International Organization for Standardization. (2026). *ISO 24495-3:2026 Plain language—Part 3: Scientific writing*. https://www.iso.org/standard/86938.html

Jassem, K., Ciesiółka, M., Graliński, F., Jabłoński, P., Pokrywka, J., Kubis, M., Jabłońska, M., & Staruch, R. (2025). *LLMzSzŁ: A comprehensive LLM benchmark for Polish* [Preprint]. arXiv. https://arxiv.org/abs/2501.02266

Jiang, F. (K.), & Hyland, K. (2024). Does ChatGPT argue like students? Bundles in argumentative essays. *Applied Linguistics, 46*(3), 375–391. https://doi.org/10.1093/applin/amae052

Jiang, Y., Hao, J., Fauss, M., & Li, C. (2024). Detecting ChatGPT-generated essays in a large-scale writing assessment: Is there a bias against non-native English speakers? *Computers and Education, 217*, 105070. https://doi.org/10.1016/j.compedu.2024.105070

Kerwer, M., Stoll, M., Jonas, M., Benz, G., & Chasiotis, A. (2021). How to put it plainly? Findings from two randomized controlled studies on writing plain language summaries for psychological meta-analyses. *Frontiers in Psychology, 12*, 771399. https://doi.org/10.3389/fpsyg.2021.771399

Koh, H. Y., Ju, J., Liu, M., & Pan, S. (2023). An empirical survey on long document summarization: Datasets, models, and metrics. *ACM Computing Surveys, 55*(8), 1–35. https://doi.org/10.1145/3545176

Le-Cong, T., Nguyen, T.-D., Le, B., & Murray, T. (2025). Towards reliable evaluation of neural program repair with natural robustness testing. *ACM Transactions on Software Engineering and Methodology*. https://doi.org/10.1145/3716167

Lee, M., Liang, P., & Yang, Q. (2022). CoAuthor: Designing a human-AI collaborative writing dataset for exploring language model capabilities. In *Proceedings of the 2022 CHI Conference on Human Factors in Computing Systems*. ACM. https://doi.org/10.1145/3491102.3502030

Li, J., Guo, X., Wu, Y., Lee, R. K.-W., Li, H., & Xie, Y. (2026). *Lost in stories: Consistency bugs in long story generation by LLMs* [Preprint]. arXiv. https://arxiv.org/abs/2603.05890

Liang, W., Yuksekgonul, M., Mao, Y., Wu, E., & Zou, J. (2023). GPT detectors are biased against non-native English writers. *Patterns, 4*(7), 100779. https://doi.org/10.1016/j.patter.2023.100779

Liu, X., Dong, P., Hu, X., & Chu, X. (2024). LongGenBench: Long-context generation benchmark. In *Findings of the Association for Computational Linguistics: EMNLP 2024* (pp. 865–883). Association for Computational Linguistics. https://aclanthology.org/2024.findings-emnlp.48/

Mazur, R. (2024). O poprawności językowej tekstów generowanych przez SI na przykładzie ChatuGPT. *LingVaria, 19*(1[37]), 119–138. https://doi.org/10.12797/LV.19.2024.37.08

Morton, J., & Storch, N. (2019). Developing an authorial voice in PhD multilingual student writing: The reader's perspective. *Journal of Second Language Writing, 43*, 15–23. https://doi.org/10.1016/j.jslw.2018.02.004

Ociepa, K., Flis, Ł., Wróbel, K., Gwoździej, A., & Kinas, R. (2024). *Bielik 7B v0.1: A Polish language model—Development, insights, and evaluation* [Preprint]. arXiv. https://arxiv.org/abs/2410.18565

Przybyła, P., Strebeyko, J., & Wróblewska, A. (2025). PolEval 2025 Task 1 Śmigiel: Spotting machine-generated text from LLMs for Polish. In *Proceedings of the PolEval 2025 Workshop* (pp. 5–15). Association for Computational Linguistics. https://aclanthology.org/2025.poleval-main.2/

Pu, D., & Demberg, V. (2023). ChatGPT vs human-authored text: Insights into controllable text summarization and sentence style transfer. In *Proceedings of the 17th Conference of the European Chapter of the Association for Computational Linguistics: Student Research Workshop* (pp. 1–18). Association for Computational Linguistics. https://aclanthology.org/2023.acl-srw.1/

Reinhart, A., Markey, B., Laudenbach, M., Pantusen, K., Yurko, R., Weinberg, G., & Brown, D. W. (2025). Do LLMs write like humans? Variation in grammatical and rhetorical styles. *Proceedings of the National Academy of Sciences, 122*(8), e2422455122. https://doi.org/10.1073/pnas.2422455122

Rosenberg, A., Walker, J., Griffiths, S., & Jenkins, R. (2023). Plain language summaries: Enabling increased diversity, equity, inclusion and accessibility in scholarly publishing. *Learned Publishing, 36*(1), 109–118. https://doi.org/10.1002/leap.1524

Sadasivan, V. S., Kumar, A., Balasubramanian, S., Wang, W., & Feizi, S. (2023). *Can AI-generated text be reliably detected?* [Preprint]. arXiv. https://arxiv.org/abs/2303.11156

Stoll, M., Kerwer, M., Lieb, K., & Chasiotis, A. (2022). Plain language summaries: A systematic review of theory, guidelines and empirical research. *PLOS ONE, 17*(6), e0268789. https://doi.org/10.1371/journal.pone.0268789

Toney, A., Bode, L., Ventura, T., Wilcox, E., & Singh, L. (2026). Comparing the humanness of machine-generated and human-authored text. *ACM Computing Surveys, 58*(12). https://doi.org/10.1145/3806206

Tudino, G., & Qin, Y. (2024). A corpus-driven comparative analysis of AI in academic discourse: Investigating ChatGPT-generated academic texts in social sciences. *Lingua, 312*, 103838. https://doi.org/10.1016/j.lingua.2024.103838

Unicode Consortium. (n.d.). *Unicode Technical Standard #35: Unicode Locale Data Markup Language (LDML), Part 9: MessageFormat* (Version 46). Retrieved August 17, 2026, from https://www.unicode.org/reports/tr35/tr35-73/tr35-messageFormat.html

Unicode Consortium. (n.d.). *Message formatting*. ICU User Guide. Retrieved August 17, 2026, from https://unicode-org.github.io/icu/userguide/format_parse/messages/

van der Lee, C., Gatt, A., van Miltenburg, E., & Krahmer, E. (2021). Human evaluation of automatically generated text: Current trends and best practice guidelines. *Computer Speech & Language, 67*, 101151. https://doi.org/10.1016/j.csl.2020.101151

Weber-Wulff, D., Anohina-Naumeca, A., Bjelobaba, S., Foltýnek, T., Guerrero-Dib, J., Popoola, O., Šigut, P., & Waddington, L. (2023). Testing of detection tools for AI-generated text. *International Journal for Educational Integrity, 19*(1), 26. https://doi.org/10.1007/s40979-023-00146-z

Weissweiler, L., Hofmann, V., Kantharuban, A., Cai, A., Dutt, R., Hengle, A., Kabra, A., Kulkarni, A., Vijayakumar, A., Yu, H., Schütze, H., Oflazer, K., & Mortensen, D. R. (2023). Counting the bugs in ChatGPT's wugs: A multilingual investigation into the morphological capabilities of a large language model. In *Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing* (pp. 6508–6524). Association for Computational Linguistics. https://aclanthology.org/2023.emnlp-main.401/

World Wide Web Consortium. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. W3C Recommendation. https://www.w3.org/TR/WCAG22/

Yang, L., Jiang, F., & Li, H. (2024). Is ChatGPT involved in texts? Measure the Polish Ratio to detect ChatGPT-generated text. *APSIPA Transactions on Signal and Information Processing, 13*(2). https://doi.org/10.1561/116.00000250

Zhao, C. G., & Wu, J. (2022). Perceptions of authorial voice: Why discrepancies exist. *Assessing Writing, 53*, 100632. https://doi.org/10.1016/j.asw.2022.100632
