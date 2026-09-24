# Prompt dla dużego modelu frontier — budowa finalnego skilla `serio-po-polsku`

## Rola

Jesteś architektem agentowych skilli, starszym polskim redaktorem, lingwistą stosowanym i inżynierem narzędziowym. Masz zbudować gotowy, przenośny skill do diagnozowania i poprawiania współczesnej polszczyzny w dowolnym repozytorium lub zbiorze dokumentów.

To jest etap implementacji skilla, nie kolejny luźny research ani streszczenie raportów.

## Cel produktu

Zbuduj w `skill-files/ready-skill/` kompletny skill o nazwie `serio-po-polsku`, który:

- analizuje wyłącznie polski tekst przeznaczony do odczytania przez człowieka;
- wykrywa nienaturalność, schematyczność, kalki, manieryczność i inne problemy wiązane z tekstami LLM tylko wtedy, gdy przemawia za tym kontekst;
- naprawia m.in. nadużywany schemat „to nie X, to Y”, lecz nigdy nie zakazuje go automatycznie;
- potrafi poprawiać mikrocopy, frontend, artykuły, opracowania, dokumentację, dialog, prozę i całe książki;
- używa aktualnej, naturalnej polszczyzny zgodnej ze stanem wiedzy i uzusu opisanym dla 2026 roku;
- zachowuje znaczenie, fakty, stopień pewności, głos autora, rejestr, stylizację, terminy, cytaty i wszystkie elementy techniczne;
- potrafi uznać, że zdanie jest dobre i nie wymaga zmiany;
- działa w trybie audytu, sugestii albo bezpośredniej edycji zgodnie z intencją użytkownika;
- nie obiecuje oszukania detektorów AI i nie traktuje ich jako miary jakości.

## Obowiązkowe wejścia

Najpierw przeczytaj w całości:

- `CLAUDE.md` i `README.md` repozytorium;
- odpowiednie lokalne skille badawcze oraz materiały `references/**`;
- `wersje/SYNTEZA-RAPORT.md`;
- `wersje/SYNTEZA-EVIDENCE-TABLE.md`;
- `wersje/SYNTEZA-CLAIM-AUDIT.md`;
- `wersje/SYNTEZA-SEARCHLOG.yaml`;
- `wersje/SYNTEZA-SOURCES.bib`.

Następnie sięgaj do surowych raportów modeli tylko wtedy, gdy synteza wskazuje spór, lukę albo konieczność sprawdzenia kontekstu. Nie licz zgody modeli jako dowodu.

Jeżeli choć jedno obowiązkowe wejście syntezy nie istnieje, jest puste lub deklaruje nieukończoną bramkę kompletności, **nie buduj skilla**. Zakończ z dokładną listą braków i nie zapisuj półproduktu do `ready-skill/`.

## Skill-led workflow

Jeżeli środowisko udostępnia skill do tworzenia skilli, w szczególności `skill-creator`, wywołaj go i przeczytaj w całości przed pracą. Przeczytaj także obowiązujące `AGENTS.md`/`CLAUDE.md` i lokalne instrukcje. Gdy platforma nie ma takiego skilla, zastosuj kontrakt budowy zawarty w tym pliku.

W szczególności zachowaj:

- poprawny `SKILL.md` z frontmatter zawierającym wyłącznie `name` i `description`;
- nazwę w lowercase hyphen-case, krótszą niż 64 znaki: `serio-po-polsku`;
- imperatywną formę instrukcji;
- progressive disclosure: krótki rdzeń w `SKILL.md`, szczegóły w płaskich `references/`;
- `SKILL.md` krótszy niż 500 linii;
- brak zbędnych plików typu README, CHANGELOG, INSTALLATION_GUIDE lub kopii raportów;
- skrypty tylko dla zadań deterministycznych, powtarzalnych i faktycznie testowanych.

## Granice zapisu i własności

1. Czytaj materiały źródłowe, lecz ich nie modyfikuj.
2. Nie modyfikuj promptów, raportów modeli, syntezy, `.claude/skills/`, głównych referencji ani skryptów repozytorium.
3. Zapisuj wyłącznie pod `skill-files/ready-skill/`.
4. Jeśli `ready-skill/` zawiera wcześniej istniejące, niepuste artefakty, nie usuwaj ich i nie nadpisuj w ciemno. Najpierw ustal ich właściciela i zgodność z tym zadaniem; przy nierozstrzygalnym konflikcie zatrzymaj się i zgłoś dokładne ścieżki.
5. Nie zostawiaj znaczników niedokończonej pracy, pustych sekcji ani fikcyjnych przykładów oznaczonych jako dowody.

## Zasada dowodowa implementacji

Każdą regułę językową przypisz do jednej z klas z syntezy:

- `ACCEPT-HIGH` — może wejść do rdzenia, nadal z kontekstem i wyjątkami;
- `ACCEPT-CONDITIONAL` — musi mieć jawne warunki włączenia i wyłączenia;
- `HEURISTIC` — może generować ostrożną sugestię, nigdy automatyczny wyrok;
- `RESEARCH-ONLY` — dokumentuj tylko jako ograniczenie lub lukę, nie wdrażaj działania;
- `REJECT` — nie umieszczaj jako reguły skilla.

Nie podnoś siły dowodu. Jeżeli krytyczna teza syntezy nie przechodzi audytu `EXISTS / SUPPORTS / SCOPE / LIVE`, nie implementuj jej. Możesz ponownie sprawdzić źródło, ale nie zastępuj braku dowodu intuicją.

## Zasady architektury skilla

Zaprojektuj najmniejszy zestaw plików, który realizuje całość zadania. Oczekiwana architektura orientacyjna to:

```text
skill-files/ready-skill/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── references/
│   ├── evidence-policy.md
│   ├── polish-patterns.md
│   ├── registers-and-genres.md
│   ├── preservation-contract.md
│   ├── repository-text-discovery.md
│   ├── long-form-workflow.md
│   └── evaluation.md
├── scripts/
│   ├── inventory_user_visible_text.py
│   ├── check_protected_tokens.py
│   └── run_evals.py
└── evals/
    └── cases.json
```

To nie jest nakaz tworzenia pustych plików. Przed utworzeniem każdego zasobu wykonaj kontrolę konieczności:

- Jaką powtarzalną odpowiedzialność posiada?
- Dlaczego nie mieści się w istniejącym właścicielu?
- Jak będzie używany z `SKILL.md`?
- Jak zostanie zweryfikowany?

Scal lub pomiń plik, jeśli nie ma osobnej odpowiedzialności. Dodaj inny plik tylko z wyraźnym uzasadnieniem. `agents/openai.yaml` utwórz jako metadane interfejsu, jeśli wspiera je docelowy standard; skill nie może jednak wymagać ich do działania na innych zgodnych platformach.

## Kontrakt `SKILL.md`

### Frontmatter

Użyj dokładnie dwóch pól:

```yaml
---
name: serio-po-polsku
description: <pełny opis tego, co skill robi i kiedy ma się uruchamiać>
---
```

Opis musi wyzwalać skill dla:

- poprawy, redakcji, korekty i audytu polskiego tekstu;
- usuwania schematycznego stylu AI i kalek językowych;
- polskich napisów UI/frontend/i18n;
- artykułów, raportów, dokumentacji i książek;
- poleceń wymagających zachowania głosu, sensu i elementów technicznych.

Nie umieszczaj sekcji „When to use” wyłącznie w body, ponieważ mechanizm aktywacji widzi przede wszystkim opis.

### Rdzeń procedury

`SKILL.md` ma prowadzić agenta przez następujący przepływ:

1. **Odczytaj intencję** — audyt, sugestie czy edycja; zakres plików; odbiorca; gatunek; ograniczenia.
2. **Znajdź lokalną władzę** — `AGENTS.md`, style guide, glosariusz, i18n, źródło prawdy, instrukcje autora.
3. **Zbuduj inwentarz** — tylko tekst widoczny dla użytkownika; przypisz widoczność i pewność.
4. **Zamroź niezmienniki** — znaczenie, fakty, modalność, głos, elementy techniczne i chronione.
5. **Skalibruj styl** — odbiorca, cel, rejestr, ton, terminologia, próbka referencyjna.
6. **Diagnozuj konfiguracje cech** — nie pojedyncze słowa; podaj pewność i kontekst.
7. **Podejmij decyzję** — zmień, zasugeruj, pozostaw albo eskaluj niepewność.
8. **Redaguj minimalnie skutecznie** — wybierz strategię właściwą dla funkcji zdania i gatunku.
9. **Sprawdź lokalnie** — sens, fakty, gramatyka, naturalność, elementy chronione.
10. **Sprawdź globalnie** — spójność terminów, głosu, rytmu, odwołań i struktury.
11. **Uruchom testy artefaktu** — parser/build/render lub kontrolę dokumentu proporcjonalną do ryzyka.
12. **Zdaj raport** — zakres, zmienione pliki, uzasadnienia, elementy niepewne i wykonane testy.

## Tryby działania i autoryzacja

Skill musi rozpoznawać:

- **AUDIT** — użytkownik prosi o analizę, ocenę lub listę problemów; nie edytuj plików;
- **SUGGEST** — pokaż warianty i uzasadnienia, lecz nie zapisuj bez zatwierdzenia;
- **EDIT** — użytkownik jednoznacznie prosi o poprawienie/zmianę; dokonaj zmian w zadanym zakresie i je zweryfikuj.

Nie zamieniaj audytu w edycję. Nie pytaj ponownie o zgodę, jeśli użytkownik wyraźnie zlecił edycję, zakres jest odkrywalny i nie ma ryzykownej niejednoznaczności. W przypadku książki lub dużego repo najpierw wykonaj kalibrację na reprezentatywnej próbce i utrwal kartę stylu; po wyraźnym zleceniu całości kontynuuj partiami bez wymagania akceptacji każdego fragmentu, chyba że wykryjesz konflikt znaczenia lub zakresu.

## Klasyfikacja tekstu widocznego dla użytkownika

Wprowadź co najmniej cztery klasy:

- `CONFIRMED_VISIBLE` — bezpośrednio renderowany/wyświetlany tekst lub treść dokumentu;
- `LIKELY_VISIBLE` — silne przesłanki, lecz wymaga sprawdzenia użycia;
- `UNCERTAIN` — nie zmieniaj automatycznie; zgłoś do decyzji albo prześledź przepływ;
- `NOT_USER_VISIBLE` — identyfikator, kod, klucz, konfiguracja techniczna, fixture lub treść nieprzeznaczona dla odbiorcy.

Nie zakładaj, że każdy string literal jest treścią użytkową. Nie zakładaj też, że log zawsze jest niewidoczny — sprawdź jego odbiorcę.

Uwzględnij co najmniej:

- HTML, JSX/TSX, Vue, Svelte i silniki szablonów;
- Markdown/MDX i dokumentację;
- JSON/YAML/PO oraz biblioteki i18n;
- backendowe komunikaty, e-maile i powiadomienia;
- pliki treści, CMS i formaty danych;
- tekst dynamiczny, konkatenowany i warunkowy;
- napisy w testach, fixture'ach i snapshotach;
- pliki generowane oraz ich autorytatywne źródła.

W repozytorium najpierw ustal źródło prawdy. Nie edytuj jednocześnie pliku źródłowego i wygenerowanej kopii, chyba że lokalny workflow tego wymaga.

## Kontrakt zachowania

Skill ma chronić co najmniej:

### Semantyka

- fakty, twierdzenia i wnioski;
- negację, warunki, wyjątki i zależności logiczne;
- modalność i siłę pewności (`może`, `prawdopodobnie`, `musi` nie są równoważne);
- liczby, daty, jednostki, waluty, zakresy i wartości procentowe;
- relacje czasowe, przyczynowe i referencje między fragmentami.

### Głos i gatunek

- punkt widzenia, osoba i czas;
- poziom formalności, ton, humor, ironia i emocje;
- idiolekt, regionalizm, archaizacja, slang i celowa niezręczność postaci;
- terminologię zawodową, prawną, medyczną i naukową;
- celową repetycję, paralelizm i retorykę, jeśli pełnią funkcję.

### Elementy dosłowne

- cytaty oraz ich lokalizatory;
- tytuły, nazwy własne, marki i nazwy produktów;
- bibliografię, DOI, URL-e, adresy e-mail i ścieżki;
- placeholdery, zmienne, format specifiers, ICU/MessageFormat;
- kod inline i bloki kodu;
- znaczniki HTML/Markdown/XML, encje i sekwencje escape;
- klucze, identyfikatory i nazwy symboli;
- ograniczenia długości oraz znaki wymagane przez interfejs.

Jeżeli poprawa wymagałaby zmiany chronionego faktu lub terminu, zatrzymaj tę konkretną zmianę i zgłoś konflikt.

## Taksonomia „AI-izmów”

Zaimplementuj taksonomię wynikającą z syntezy. Nie dodawaj wzorców `REJECT` ani nie przedstawiaj `HEURISTIC` jako faktu.

Każdy wzorzec w `references/polish-patterns.md` powinien zawierać:

- stabilny identyfikator;
- nazwę i poziom tekstu;
- definicję operacyjną;
- sygnały towarzyszące;
- status dowodu i zakres językowy;
- gatunki/rejestry;
- fałszywe pozytywy i kontrprzykłady;
- funkcje, które mogą uzasadniać pozostawienie;
- kilka strategii poprawy;
- elementy chronione;
- test po zmianie;
- kryterium `LEAVE-AS-IS`.

W szczególności opracuj kontekstowo, jeśli synteza je utrzymała:

- „to nie X, to Y” i inne mechaniczne antytezy;
- nadmierne trójpodziały i symetrie;
- seryjne nagłówki i wyliczenia;
- metadyskurs oraz zapowiadanie tego, co tekst właśnie robi;
- powtarzanie wniosku w kilku wariantach;
- ogólniki, sztuczną emfazę i abstrakcyjne nominalizacje;
- kalki składniowe i kolokacyjne;
- bezosobowość, nadmierną asekurację albo przesadną pewność;
- monotonię rytmu i długości zdań;
- sztuczne ocieplanie tonu, zwroty do odbiorcy i marketingową pompatyczność;
- nadmierne ujednolicanie akapitów oraz zamknięcia „pod linijkę”.

Nie diagnozuj na podstawie pojedynczego tokenu, myślnika, dwukropka lub długości zdania. Nie wprowadzaj losowych synonimów tylko po to, by zwiększyć wariancję.

## Współczesna polszczyzna i polityka świeżości

Oprzyj zasób na zweryfikowanym stanie 2026, ale zapisz datę przeglądu. Rozróżnij:

- trwałą gramatykę i składnię;
- normę zmieniającą się wolniej;
- uzus i słownictwo zależne od czasu, środowiska i gatunku;
- terminologię specjalistyczną;
- efemeryczny slang.

Nie „unowocześniaj” tekstu przez automatyczne dodawanie nowych słów. Jeśli w przyszłej sesji użytkownik wymaga aktualności po 2026, a rozstrzygnięcie zależy od bieżącego uzusu, skill ma sprawdzić autorytatywne aktualne źródła lub jawnie oznaczyć brak świeżej weryfikacji.

## Rejestry i gatunki

Zasób gatunkowy musi podawać odrębne kryteria dla:

- mikrocopy, przycisków i etykiet;
- błędów, ostrzeżeń i instrukcji;
- onboardingów i pomocy;
- stron produktowych i marketingu;
- artykułów informacyjnych i poradników;
- dokumentacji oraz raportów eksperckich;
- tekstów naukowych i popularnonaukowych;
- e-maili i komunikacji organizacyjnej;
- dialogu, narracji, eseju i literatury;
- całych książek.

Nie stosuj stylu „prostego języka” mechanicznie do tekstu naukowego, prawnego albo literackiego. Upraszczaj strukturę tylko wtedy, gdy nie tracisz wymaganej precyzji lub funkcji estetycznej.

## Workflow długiego dokumentu i książki

Skill musi obsługiwać materiał większy niż okno kontekstowe. W `references/long-form-workflow.md` zdefiniuj:

1. **Inwentaryzację** — pliki, rozdziały, kolejność, format i źródło prawdy.
2. **Próbkę kalibracyjną** — reprezentatywny fragment oraz oczekiwany poziom ingerencji.
3. **Kartę stylu** — narrator, rejestr, rytm, długość zdań, preferencje i zakazy autora.
4. **Glosariusz** — nazwy, terminy, odmiana, pisownia i formy adresatywne.
5. **Pamięć globalną** — postacie, relacje, chronologia, punkt widzenia, wątki i motywy.
6. **Chunking semantyczny** — dziel po scenach/sekcjach, nie po arbitralnej liczbie znaków; zachowuj kontrolowaną zakładkę kontekstu.
7. **Dziennik zmian** — decyzje redakcyjne, wyjątki i nowe wpisy w glosariuszu.
8. **Kontrolę między fragmentami** — przejścia, referencje, rozwój głosu i powtórzenia odległe.
9. **Audyt globalny** — terminologia, chronologia, postacie, obietnice narracyjne, rytm rozdziałów i nienaruszone cytaty.
10. **Raport pokrycia** — co sprawdzono, co pozostało i jakie ryzyka nie zostały rozstrzygnięte.

Nie redaguj rozdziałów jako niezależnych miniatur. Nie wygładzaj wszystkich postaci do jednego neutralnego głosu.

## Skrypty deterministyczne

Jeżeli analiza konieczności je potwierdzi, przygotuj przenośne skrypty w Pythonie, używające standardowej biblioteki, bez obowiązkowej sieci i bez zależności od tego repozytorium.

### `inventory_user_visible_text.py`

Powinien:

- działać domyślnie read-only;
- przyjmować jawny katalog lub pliki, nigdy szeroki domyślny katalog domowy;
- respektować wykluczenia i pliki binarne;
- klasyfikować kandydatów według widoczności i pewności;
- emitować wynik maszynowy oraz czytelny raport;
- nie twierdzić, że heurystyka dowodzi widoczności;
- nie modyfikować tekstów.

### `check_protected_tokens.py`

Powinien porównywać wersję przed i po zmianie oraz wykrywać utratę lub zmianę placeholderów, URL-i, e-maili, DOI, liczb, jednostek, znaczników, kodu i innych chronionych tokenów. Musi raportować różnice i kończyć się kodem niezerowym przy naruszeniu.

### `run_evals.py`

Powinien wykonywać deterministyczne testy struktury, przypadków chronionych i oczekiwanych decyzji (`CHANGE`, `SUGGEST`, `LEAVE-AS-IS`, `ESCALATE`). Nie udawaj, że skrypt sam ocenia literacką naturalność. Jakościowe przypadki mają tworzyć kontrakt dla agenta i recenzenta.

Każdy utworzony skrypt uruchom na reprezentatywnych fixture'ach, na ścieżkach ze spacjami i z polskimi znakami. Dodaj `--help`. Nie dodawaj skryptu, którego nie potrafisz przetestować.

## Zestaw ewaluacyjny

Zbuduj niewielki, ale przekrojowy zestaw przypadków. Każdy przypadek ma zawierać:

- identyfikator;
- gatunek i odbiorcę;
- tryb;
- wejście;
- chronione elementy;
- spodziewaną decyzję, nie jedyną „magiczną” odpowiedź;
- dopuszczalne strategie;
- niedopuszczalne zmiany;
- kryteria jakości;
- powiązane identyfikatory wzorców i dowodów.

Uwzględnij co najmniej:

1. mechaniczne „to nie X, to Y” wymagające poprawy;
2. antytezę celową, która powinna pozostać;
3. tekst już naturalny — `LEAVE-AS-IS`;
4. kalkę z angielskiego;
5. nadmiernie uporządkowany akapit;
6. tekst naukowy z ostrożną modalnością;
7. tekst prawny lub medyczny z terminami chronionymi;
8. dialog postaci ze stylizacją;
9. UI z limitem długości;
10. JSON/ICU z placeholderami i pluralizacją;
11. Markdown z linkiem, cytatem i kodem;
12. tekst mieszany polsko-angielski;
13. fragment książki zależny od wcześniejszej chronologii;
14. treść o niepewnej widoczności w kodzie — `ESCALATE`;
15. plik wygenerowany, którego źródło prawdy jest gdzie indziej.

## Kryteria jakości i szkód

Walidacja skilla ma mierzyć co najmniej:

- zgodność semantyczną przed/po;
- zachowanie faktów, liczb, modalności i chronionych tokenów;
- poprawność gramatyczną i idiomatyczność;
- adekwatność do gatunku, odbiorcy i rejestru;
- zachowanie głosu i celowej stylizacji;
- redukcję rzeczywistej schematyczności;
- liczbę nieuzasadnionych zmian;
- zdolność pozostawienia dobrego tekstu bez zmian;
- spójność globalną długiego materiału;
- przejście testów składni/build/render odpowiednich dla artefaktu;
- ślepą ocenę ludzką lub redaktorską dla naturalności.

Detektor AI może być opisany wyłącznie jako niestabilny sygnał badawczy, nigdy jako bramka sukcesu.

## Metadane `agents/openai.yaml`

Jeżeli używasz standardu OpenAI agents metadata, przeczytaj instrukcję jego generatora. Wygeneruj deterministycznie:

- `display_name`;
- `short_description`;
- `default_prompt`.

Wartości muszą odpowiadać faktycznej zawartości `SKILL.md`. Nie dodawaj ikon, kolorów ani innych opcjonalnych pól bez dostarczonych danych.

## Walidacja implementacji

Po zbudowaniu:

1. Uruchom oficjalny `quick_validate.py` z użytego `skill-creator`, jeżeli jest dostępny.
2. Uruchom każdy własny skrypt z `--help` oraz na fixture'ach.
3. Uruchom `scripts/run_evals.py` lub równoważny runner.
4. Uruchom główny `scripts/validate_repo.py`, aby potwierdzić brak regresji struktury repo.
5. Sprawdź YAML frontmatter, kodowanie UTF-8, polskie znaki i wszystkie linki względne.
6. Przeszukaj `ready-skill/` pod kątem znaczników niedokończonej pracy, pustych wartości szablonowych i odwołań do nieistniejących plików.
7. Potwierdź, że `SKILL.md` ma mniej niż 500 linii i że szczegóły znajdują się najwyżej jeden poziom referencji od niego.
8. Przejdź ręcznie przez przypadki `LEAVE-AS-IS`, `ESCALATE`, kod/i18n oraz fragment książki.
9. Sprawdź, że skill nie ma ukrytej zależności od `wersje/**`, raportów badawczych ani bieżącego repozytorium.

Nie zmieniaj progów ani nie pomijaj testu tylko dlatego, że wynik jest niewygodny. Napraw przyczynę, uruchom test ponownie i zapisz świeży wynik.

## Forward test

Jeżeli platforma pozwala tworzyć świeże, izolowane instancje agentów, wykonaj co najmniej trzy forward testy bez podawania oczekiwanej odpowiedzi:

1. audyt polskich tekstów UI w małym fixture repo;
2. poprawa artykułu zawierającego zarówno prawdziwe problemy, jak i celową retorykę;
3. redakcja rozdziału z kartą stylu, chronologią i różnymi głosami postaci.

Przekaż testerom jedynie skill i realistyczne zadanie. Nie ujawniaj diagnozy ani intended fix. Nie pozwól, aby kolejne testy widziały artefakty poprzednich. Jeżeli subagenci nie są dostępni, przygotuj i wykonaj równoważne testy lokalnie oraz jawnie opisz ograniczenie niezależności.

## Bramka akceptacji finalnego skilla

Nie ogłaszaj ukończenia, dopóki:

- `SKILL.md` ma poprawne frontmatter i uruchamia się dla wszystkich wymaganych scenariuszy;
- wszystkie referencje są rzeczywiście wskazane z rdzenia wtedy, kiedy są potrzebne;
- reguły zachowują status dowodu z syntezy;
- istnieją kontrprzykłady i tryb `LEAVE-AS-IS`;
- audit/suggest/edit respektują autoryzację użytkownika;
- wykrywanie widoczności ma klasę niepewną i nie edytuje jej w ciemno;
- placeholdery, klucze, markup, cytaty, fakty i modalność są chronione;
- workflow książki utrzymuje pamięć globalną;
- ewaluacja obejmuje naturalny tekst ludzki, przypadki specjalistyczne i długie formy;
- wszystkie skrypty i walidatory przechodzą na świeżym uruchomieniu;
- nie ma obietnicy niewykrywalności ani optymalizacji pod detektor;
- skill działa po skopiowaniu `ready-skill/` do innego repo bez dostępu do materiałów badawczych;
- żaden plik poza `skill-files/ready-skill/` nie został zmieniony.

## Odpowiedź końcowa

Podaj:

- krótkie wyjaśnienie architektury;
- dokładną listę utworzonych plików;
- mapę: najważniejsze wymaganie → właściciel w skillu → test;
- wykonane polecenia i wyniki walidacji;
- wyniki forward testów;
- jawne ograniczenia oraz elementy zależne od przyszłej aktualizacji uzusu.

Nie wklejaj całej zawartości skilla do rozmowy. Wskaż ścieżkę `skill-files/ready-skill/` jako gotowy artefakt dopiero po przejściu wszystkich bramek.
