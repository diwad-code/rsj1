# Prompt startowy dla modelu Gemini — niezależny research

## Rola

Wykonaj całkowicie niezależny przegląd naukowy dotyczący cech tekstów generowanych przez modele językowe, ich odbioru przez ludzi oraz rzetelnej redakcji współczesnej polszczyzny. Twoją specjalizacją jest **wielojęzyczna stylometria, NLP, badania nad rozpoznawaniem autorstwa i granicami detektorów AI**. Musisz jednak opracować pełen wspólny zakres projektu.

## Izolacja i własność

- Czytaj wspólne zasady: `CLAUDE.md`, `README.md`, `.claude/skills/**`, `.claude/agents/**`, `references/**`, `research/_TEMPLATE-*.md`, `.mcp.json` i skrypty walidacyjne.
- Czytaj i zapisuj tylko w `wersje/gemini/`.
- **Nie otwieraj, nie listuj, nie przeszukuj i nie wykorzystuj pozostałych katalogów `wersje/`, `wersje/SYNTEZA.md` ani `skill-files/`.**
- Nie zapisuj poza `wersje/gemini/` i nie buduj finalnego skilla.
- Nie zakładaj, że znasz odpowiedzi z wcześniejszych rozmów. Weryfikuj od początku.

## Wynik, którego potrzebuje projekt

Raport ma umożliwić późniejsze zbudowanie skilla, który poprawia tekst widoczny dla użytkownika tak, aby był naturalny, precyzyjny i zgodny z gatunkiem, lecz nie niszczy głosu autora. Skill ma obsługiwać UI, artykuły, opracowania oraz książki. Nie wolno utożsamiać tego celu z obchodzeniem detektorów. Zbadaj, dlaczego „niepodejrzewanie AI” nie jest mierzalną gwarancją oraz jakie uczciwe kryteria jakości można zastosować zamiast niej.

## Procedura obowiązkowa

Przed wyszukiwaniem przeczytaj właściwe lokalne skille i wykonaj pełny pipeline repozytorium:

`research-question → research-protocol → literature-search → source-credibility → citation-verification → data-extraction → critical-appraisal → scientific-consensus → evidence-synthesis → research-report`.

Najpierw zapisz `wersje/gemini/PROTOKOL.md`; dopiero potem szukaj. Każdą zmianę kryteriów dopisz do rejestru zmian. Użyj wielu baz, zapytań polskich i angielskich, citation chasing oraz wyszukiwania dowodów przeciwnych. Jeżeli masz subagentów, wykorzystaj scoutów do rozłącznych pytań/baz i sceptyka do krytyki szkicu. W przeciwnym razie wykonaj te role sekwencyjnie i ujawnij ograniczenie.

## Źródła i hierarchia

- Łącz `computer-science`, `social-sciences`, językoznawstwo korpusowe, stylometrię, psycholingwistykę, HCI i human evaluation.
- Preferuj recenzowane przeglądy, badania porównawcze z udostępnionymi danymi/kodem, uznane konferencje ACL/EMNLP/NAACL/COLING i odpowiednie czasopisma.
- Preprinty oznaczaj i nie pozwalaj im samodzielnie tworzyć mocnego wniosku.
- W przypadku normy polskiej oddziel autorytatywne źródło normatywne od empirycznego opisu uzusu.
- Materiały popularne o wykrywaniu AI klasyfikuj jako `OBJECT-OF-STUDY`, chyba że prowadzą do pierwotnego, zweryfikowanego badania.
- Rejestruj język, model, datę generowania, korpus, gatunek, prompt, parametry i rodzaj redakcji, o ile je raportowano.
- Brak danych zapisuj jako `NR`, nigdy nie uzupełniaj z pamięci.

## Wspólne pytania badawcze

1. Jak operacjonalizuje się naturalność, jakość stylistyczną, autentyczność i rozpoznawanie autorstwa?
2. Jakie cechy LLM są replikowane, a jakie zależą od konkretnego benchmarku, modelu lub epoki modeli?
3. Jakie istnieją dowody dla polskiego i języków fleksyjnych? Gdzie dane są zbyt skąpe?
4. Które cechy angielskie dają się przenieść na polski i z jaką pewnością?
5. Jak prompt, temperatura, dekodowanie, RLHF, model, tłumaczenie, długość i gatunek wpływają na styl?
6. Jakie są fałszywe pozytywy i grupy szczególnie narażone na błędne oznaczenie?
7. Jak badać „to nie X, to Y”, paralelizm, trójpodziały, nadmiar struktury, myślniki, wyliczenia, abstrakcje, metadyskurs i powtarzalne podsumowania?
8. Czy marker autorstwa może jednocześnie być poprawnym środkiem retorycznym albo cechą dobrego tekstu?
9. Jak redagować bez utraty znaczenia, stopnia pewności, głosu, humoru, stylizacji i informacji?
10. Jak różnią się wymagania UI, artykułu, pracy naukowej, marketingu, dialogu i książki?
11. Jak rozpoznawać tylko treść widoczną dla użytkownika w repozytorium?
12. Jak utrzymać spójność w dokumentach przekraczających okno kontekstowe?
13. Jak definiować aktualną polszczyznę 2026 bez automatycznego promowania nowości lub slangu?
14. Jak walidować poprawę i mierzyć szkody uboczne?

## Specjalizacja Gemini: stylometria i detekcja

Zbadaj szczegółowo:

### Metody

- cechy leksykalne, syntaktyczne, dyskursywne, rytmiczne, entropijne i embeddingowe;
- stylometrię klasyczną kontra klasyfikatory neuronowe i detektory dostawców;
- watermarking, perplexity, burstiness i ich założenia;
- human detection, blind review, pairwise preference i ocenę redaktorską;
- miary zachowania semantyki i znaczenia po redakcji;
- benchmark contamination, domain shift, model drift oraz transfer cross-lingual.

### Rzetelność

Wymagaj informacji o:

- składzie korpusu i reprezentatywności;
- podziale train/test i przecieku danych;
- modelach widzianych i niewidzianych;
- bazowej częstości klas;
- precision, recall, F1, AUROC oraz kalibracji, nie tylko accuracy;
- przedziałach ufności, wariancji i replikacji;
- odporności na parafrazę, tłumaczenie, krótkie teksty i ludzką redakcję;
- konsekwencjach fałszywych oskarżeń.

### Wniosek praktyczny

Oddziel trzy pytania:

1. Czy tekst ma cechy statystycznie częstsze u badanego modelu?
2. Czy tekst jest słaby, schematyczny lub nieadekwatny?
3. Czy warto go zmienić w danym kontekście?

Nie pozwól, aby odpowiedź na pierwsze pytanie automatycznie rozstrzygała dwa pozostałe.

## Katalog wzorców

Dla każdego wzorca przygotuj:

`ID · nazwa · poziom tekstu · definicja mierzalna · źródła · modele i języki · wielkość/charakter efektu · replikacja · transfer do polskiego · fałszywe pozytywy · interakcje cech · przykłady ilustracyjne · strategie redakcji · kryteria pozostawienia · ryzyko szkody · pewność`.

Nie wnioskuj o autorstwie z pojedynczego słowa, znaku lub konstrukcji. Oceń, czy dopiero konfiguracja wielu cech daje sygnał i czy ma ona znaczenie redakcyjne.

## Artefakty

Zapisz w `wersje/gemini/`:

1. `PROTOKOL.md`;
2. `SEARCHLOG.yaml`;
3. `EVIDENCE-TABLE.md`;
4. `RAPORT.md`;
5. `CLAIM-AUDIT.md` z kontrolą `EXISTS / SUPPORTS / SCOPE / LIVE`;
6. `SOURCES.bib`;
7. opcjonalnie `EXCLUDED.md`.

## Układ raportu

1. Metryka, data, narzędzia i ograniczenia.
2. Pytania, kryteria, protokół i metody.
3. Jakość bazy dowodów.
4. Taksonomia metod detekcji i ich ograniczeń.
5. Wyniki dla polskiego, innych języków i transferu międzyjęzykowego.
6. Taksonomia kandydatów na „AI-izmy”.
7. Fałszywe pozytywy i konteksty legalnego użycia.
8. Zasady bezpiecznej redakcji i zachowania głosu.
9. Gatunki, UI, długie formy i książki.
10. Projekt wiarygodnej ewaluacji skilla.
11. Etyka i granice obietnic.
12. Wymagania dla przyszłego skilla.
13. Luki, sprzeczności i priorytety badań.
14. Bibliografia APA 7.

## Bramka jakości

Przed zakończeniem potwierdź, że:

- każda cytacja istnieje, jest aktualna i wspiera dokładnie przypisaną tezę;
- nie pomylono wyników detekcji z jakością tekstu;
- wyniki angielskie nie zostały przedstawione jako polskie bez zastrzeżeń;
- opisano bazowe częstości, fałszywe pozytywy i domain shift;
- przeprowadzono wyszukiwanie dowodów przeciwnych;
- katalog nie jest listą zakazanych słów;
- wszystkie pliki znajdują się wyłącznie w `wersje/gemini/`.

W odpowiedzi końcowej podaj krótkie podsumowanie, pliki, liczby źródeł i najważniejsze luki. Nie wklejaj raportu w całości.
