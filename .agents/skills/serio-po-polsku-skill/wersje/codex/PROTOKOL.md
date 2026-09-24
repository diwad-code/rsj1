# Protokół niezależnego researchu: poprawianie polszczyzny generowanej przez AI

**Wersja protokołu:** 1.0  
**Data zamrożenia przed wyszukiwaniem:** 2026-08-17  
**Stan wiedzy raportowany na:** 2026-08-17  
**Właściciel artefaktów:** `wersje/codex/`  
**Tryb:** niezależny, odtwarzalny przegląd zakresowy z krytyczną syntezą; bez implementacji finalnego skilla.

## 1. Pytanie i zakres

### Pytanie główne

Jakie cechy językowe, pragmatyczne, stylistyczne, interakcyjne i procesowe są empirycznie związane z nienaturalnością, niską jakością lub rozpoznawalnością tekstów generowanych przez modele językowe — ze szczególnym uwzględnieniem polszczyzny i języków fleksyjnych — oraz jak zaprojektować kontekstową, bezpieczną i skalowalną redakcję takich tekstów w komunikatach, dokumentacji, artykułach i książkach, bez utraty znaczenia, faktów, stopnia pewności, głosu, gatunku, terminologii i kontraktów repozytorium?

### Typ przeglądu

Przegląd zakresowy (scoping review) z elementami krytycznej oceny dowodów, mapowania literatury, weryfikacji cytacja–teza i syntezy narracyjnej. Nie zakładam możliwości metaanalizy: wyniki będą prawdopodobnie heterogeniczne pod względem języka, gatunku, modelu, zadania, miary i definicji jakości.

### Adaptacja PECO / concept–context–outcome

- **P / problem:** teksty tworzone lub współtworzone przez LLM/AI oraz teksty ludzkie używane jako porównanie; polski jako główny język zainteresowania, z osobnym oznaczeniem badań po angielsku i w innych językach.
- **E / ekspozycja:** generowanie, tłumaczenie, post-editing, promptowanie, ustawienia modelu, długość i gatunek tekstu; także cechy przypisywane potocznie „AI-zmom”.
- **C / porównanie:** tekst ludzki, inny model/prompt/temperatura, tekst po redakcji, różne gatunki i języki, a także poprawny tekst stylizowany lub terminologiczny jako kontrprzypadek.
- **O / wyniki:** naturalność, płynność, akceptowalność, jakość, autentyczny głos, adekwatność gatunkowa, spójność i czytelność; zachowanie znaczenia i kontraktów; fałszywe pozytywy; skuteczność i bezpieczeństwo redakcji; niezawodność testów.
- **Kontekst:** HCI, psycholingwistyka, lingwistyka korpusowa, NLP, tłumaczenie i post-editing, software engineering, lokalizacja, dostępność i prosty język; UI, komunikaty błędów, dokumentacja, artykuły, nauka, marketing, dialog i proza; repozytoria oraz dokumenty długie.
- **Czas:** bez sztywnego ograniczenia dla prac przełomowych; preferencja dla 2018–2026 i jawne uwzględnianie zmiany modeli w czasie.

## 2. Podpytania

1. Jak literatura definiuje i mierzy naturalność, płynność, jakość, autentyczny głos, styl, czytelność i prosty język?
2. Jakie cechy LLM zostały empirycznie wykazane, zwłaszcza w polskim lub językach fleksyjnych, a które są tylko transferem z angielskiego albo obserwacją pojedynczego modelu/promptu?
3. Skąd biorą się internetowe mity o „AI-zmach”; które z nich są hipotezami, a które mają adekwatne dowody? Czy konstrukcja „to nie X, to Y”, trójpodziały, symetria, wyliczenia, nagłówki, myślniki, metatekst, uogólnienia, emfatyczne podsumowania i nominalizacje mają wsparcie jako markery jakości lub pochodzenia?
4. Jak interakcja leksyki, składni, pragmatyki, rytmu, spójności akapitów i makrostruktury wpływa na ocenę tekstu, z uwzględnieniem legalnych ludzkich zastosowań tych samych konstrukcji?
5. Jak zmieniają się wyniki względem modelu, promptu, temperatury, długości, gatunku, języka i tłumaczenia? Jakie są ryzyka uogólnień na polski?
6. Jakie zasady redakcji zachowują sens, fakty, pewność, głos, gatunek, terminologię, prosty język, dostępność i inkluzywność bez spłycenia treści?
7. Jak sklasyfikować tekst widoczny dla użytkownika w HTML/JSX/TSX/Vue/Svelte, szablonach, Markdown/MDX, JSON/YAML i18n, PO, backendzie, e-mailach i plikach treści; kiedy użyć parsera/AST, a kiedy wyszukiwania tekstowego; jak obsłużyć niepewną widoczność?
8. Jaki kontrakt ochrony obejmuje identyfikatory, klucze, placeholdery, ICU/MessageFormat, znaczniki, linki, encje, kod, escape’y, kodowanie, długość UI, nazwy własne, marki, terminy, liczby, daty, jednostki, cytaty, logikę i mapowanie lokalizacji?
9. Jak bezpiecznie prowadzić zmianę w repozytorium: inwentaryzacja → klasyfikacja → próbka → redakcja → diff semantyczny → testy składni/build → kontrola wizualna → raport; jak obsłużyć rollback, małe partie, pliki generowane i źródła prawdy?
10. Jak dzielić książki i długie dokumenty semantycznie, kontrolować nakładanie kontekstu, prowadzić księgę stylu, glosariusz, rejestr postaci/nazw, oś czasu i rejestr zmian oraz wykrywać dryf i utratę zapowiedzi?
11. Jak zaprojektować wiarygodną ewaluację: zachowanie znaczenia, faktów, pewności, stylu i chronionych elementów; poprawa tekstu; test „nie pogarszaj dobrego tekstu”; przypadki brzegowe; wpływ detektorów AI i błędy metodologiczne?

## 3. Kryteria włączenia

Włączę źródła, które:

- są recenzowane lub pochodzą od uznanej instytucji/standardu/korpusu; preprinty mogą wejść wyłącznie jako wyraźnie oznaczone dowody wstępne, jeżeli są bezpośrednio potrzebne;
- dotyczą LLM/NLG, oceny jakości/naturalności, stylu/autentyczności, tłumaczenia/post-editingu, prostego języka/dostępności, human–AI interaction, autorstwa i detekcji (tylko jako osobnego problemu), jakości oprogramowania/lokalizacji lub długich form;
- podają wystarczający opis języka, populacji, gatunku, modelu/zadania, miary i ograniczeń, aby ocenić zakres twierdzenia;
- dostarczają wyniku empirycznego, metody, przeglądu, standardu, wytycznej albo rzetelnej ramy pojęciowej;
- pozwalają potwierdzić rekord bibliograficzny i — gdy teza jest empiryczna — konkretny fragment, tabelę, sekcję, stronę, DOI lub stabilny rekord.

Priorytet: metaanalizy i przeglądy systematyczne, wysokiej jakości przeglądy, badania kontrolowane i porównawcze, badania korpusowe, badania użytkowników/oceny eksperckie, benchmarki i korpusy, uznane konferencje NLP/HCI/software engineering, normy i autorytatywne instytucje językowe. Źródła marketingowe, listy „zwrotów ChatGPT”, blogi i posty mogą być włączone wyłącznie jako `OBJECT-OF-STUDY`, aby zbadać mit lub jego obieg.

## 4. Kryteria wyłączenia

- materiały promocyjne, SEO, afiliacyjne, vendorowe, press release, social media, opinie bez metody i teksty bez możliwego do zweryfikowania autorstwa/rekordu — chyba że są obiektem badania;
- źródła bez związku z pytaniem lub bez danych pozwalających ustalić zakres twierdzenia;
- niezweryfikowane cytowania, zmyślone lub niezgodne metadane, źródła wycofane jako dowód aktualnego faktu;
- bezpośrednie przeniesienie cechy z angielskiego na polski bez oznaczenia transferu i bez osobnego wsparcia dla polskiego;
- twierdzenia, że detektor AI mierzy jakość, naturalność lub „człowieczeństwo” tekstu, bez rozdzielenia zadania klasyfikacji autorstwa od oceny jakości;
- finalna implementacja skilla, masowe edycje repozytorium lub automatyczne przepisywanie treści — poza zakresem tego researchu.

## 5. Plan źródeł i wyszukiwania

### Bazy i kanały

Planowane są Crossref, OpenAlex, Semantic Scholar, ACL Anthology, arXiv (z oznaczeniem preprintów), Google Scholar lub wyszukiwanie webowe ograniczone do domen naukowych, a dla polskiego: repozytoria i publikacje językoznawcze, korpusy oraz autorytatywne instytucje językowe. Dodatkowo sprawdzę bibliografie wstecz i cytowania naprzód. Jeśli skonfigurowane MCP nie będą dostępne, odnotuję to i użyję bezpośrednich rekordów/stron wydawców lub wyszukiwania ograniczonego domenami scholarly.

### Języki zapytań

Wykonam warianty angielskie i polskie. Wyniki oznaczę językiem badania: `PL`, `EN`, `OTHER`, a przy transferze międzyjęzykowym podam język i ograniczenia.

### Planowane klastry zapytań

Klastry będą łączone wariantami Boolean i zapisane dokładnie w `SEARCHLOG.yaml` po uruchomieniu:

- LLM/NLG: `large language model`, `LLM`, `neural text generation`, `NLG`, `generative AI`, `human-authored`, `machine-generated`;
- jakość: `naturalness`, `fluency`, `text quality`, `acceptability`, `writing quality`, `authentic voice`, `style`, `readability`, `coherence`, `discourse`;
- polski: `Polish`, `język polski`, `polszczyzna`, `Polish NLP`, `inflectional language`, `morphologically rich`, `Slavic`;
- cechy: `formulaic`, `repetition`, `hedging`, `nominalization`, `parallelism`, `contrastive construction`, `enumeration`, `metadiscourse`, `AI writing style`;
- redakcja: `post-editing`, `revision`, `rewriting`, `human-AI collaboration`, `meaning preservation`, `semantic equivalence`, `style transfer`;
- detekcja: `AI text detection`, `authorship attribution`, `detector bias`, `false positive`, `quality assessment`;
- repozytoria: `localization`, `translation keys`, `placeholder`, `ICU MessageFormat`, `AST`, `UI text`, `content pipeline`, `generated files`, `semantic diff`;
- długie formy: `long-form generation`, `book-length`, `long document`, `consistency`, `style drift`, `character consistency`, `discourse planning`.

## 6. Selekcja i deduplikacja

1. Zapiszę każdą uruchomioną kwerendę, datę, bazę, liczbę trafień i kryterium zatrzymania.
2. Usunę duplikaty po DOI, identyfikatorze, tytule i zgodności autor–rok; konflikty metadanych rozstrzygnę na podstawie rekordu wydawcy/Crossref/ACL.
3. Przesieję tytuły i abstrakty względem kryteriów; następnie pełne teksty/rekordy.
4. Przy wieloautorskim scoutingu zachowam niezależność artefaktów i nie wykorzystam cudzych katalogów `wersje/`; jeśli scoutów nie da się uruchomić, wykonam równoważny proces sekwencyjnie.
5. Wyniki będą rozdzielone na `EVIDENCE`, `BACKGROUND`, `OBJECT-OF-STUDY`, `REJECT`; odrzucenia z powodem trafią do `EXCLUDED.md` opcjonalnie lub do logu.

## 7. Ekstrakcja i ocena

Dla każdego źródła zapiszę: ID, autorów, rok, tytuł, venue, DOI/stabilny rekord, język badania, typ, populację/dane, gatunek, model/prompt/ustawienia gdy podane, porównanie, operacjonalizację jakości, wynik, lokalizator (sekcja/tabela/strona/akapit), finansowanie/COI, ograniczenia, replikację, status korekty/wycofania, disposition i pewność.

Ocena będzie dopasowana do projektu: dla przeglądów AMSTAR-2/ROBIS, dla badań obserwacyjnych i korpusowych ocena doboru danych, reprezentatywności, leakage, replikowalności i miar, dla badań użytkowników ocena próby, inter-rater agreement i trafności konstruktu, dla benchmarków — adekwatność zadania i rozkładów. Nie będę mechanicznie stosować narzędzi RCT do badań NLP. Pewność syntezy zostanie opisana jakościowo (wysoka/umiarkowana/niska/bardzo niska) z powodami: ryzyko błędu, niespójność, pośredniość, nieprecyzyjność, bias publikacyjny i zmienność modeli.

## 8. Reguły interpretacji

- Oddzielę cechę LLM, cechę złego tekstu, cechę tłumaczenia, cechę gatunku oraz cechę konkretnego modelu/promptu.
- Konstrukcje gramatyczne nie będą zakazane na podstawie samej obecności; opiszę konfigurację cech, kontekst, funkcję i kontrprzykłady.
- Nie utożsamię detekcji autorstwa z jakością ani nie obiecam obejścia detektorów.
- Dla każdego wzorca podam fałszywe pozytywy, ludzkie zastosowania, „kiedy nie zmieniać”, chronione elementy i test znaczenia.
- Wnioski dla polskiego oprę na polskich danych, jeśli istnieją; w przeciwnym razie oznaczę transfer jako pośredni i obniżę pewność.
- „Nowoczesny język 2026” rozumiem jako adekwatny uzus; slang nie jest celem samym w sobie, a terminologii nie upraszczam bez powodu.

## 9. Plan syntezy i raportu

Synteza będzie tematyczna: pojęcia i miary; dowody dla polskiego; transfer międzyjęzykowy; mity; taksonomia cech; redakcja kontekstowa; widoczność i kontrakt repozytorium; duże dokumenty; ewaluacja i etyka. W `EVIDENCE-TABLE.md` każdy mocny wniosek dostanie lokalizator źródła. W `CLAIM-AUDIT.md` kluczowe tezy przejdą audyt: istnienie, wsparcie, zakres, aktualność, decyzja. `SOURCES.bib` będzie zawierać tylko rekordy sprawdzone.

## 10. Bezpieczeństwo zakresu i artefaktów

- Nie będę czytać, listować, przeszukiwać ani wykorzystywać innych katalogów pod `wersje/`, `wersje/SYNTEZA.md` ani `skill-files/`.
- Dozwolone źródła kontekstu: `CLAUDE.md`, `README.md`, rzeczywisty `.claude/skills/**`, `.claude/agents/**`, `references/**`, szablony `research/`, `.mcp.json` i skrypty walidacyjne.
- Zapis wyłącznie do `wersje/codex/`; nie zmienię plików wspólnych ani innych artefaktów.
- Nie implementuję finalnego skilla. Rekomendacje techniczne będą wymaganiami i testami, nie zmianami kodu.

## 11. Rejestr zmian protokołu

| Data | Wersja | Zmiana | Powód | Wpływ |
|---|---:|---|---|---|
| 2026-08-17 | 1.0 | Zapisano zakres, kryteria, klastry zapytań, plan selekcji, ekstrakcji, oceny i syntezy przed wyszukiwaniem | Inicjalizacja niezależnego researchu | Brak wcześniejszych zmian; wszelkie późniejsze odstępstwa będą dopisywane poniżej |
| 2026-08-17 | 1.1 | Zamiast planowanych konektorów `paper-search` i `openalex` użyto jawnie zarejestrowanego wyszukiwania internetowego ograniczonego do domen naukowych oraz ręcznej weryfikacji rekordów | W bieżącej sesji nie były dostępne narzędzia MCP odpowiadające konfiguracji `.mcp.json` | Brak pełnych liczników baz; `SEARCHLOG.yaml` podaje liczbę wyników zaobserwowanych, a nie całkowitą liczbę trafień; obniżono pewność tam, gdzie brakowało pełnego tekstu |
| 2026-08-17 | 1.2 | Niezależnych scoutów zastąpiono sekwencyjnym wyszukiwaniem i osobnym przejściem sceptycznym | Brak narzędzia do uruchamiania scoutów w tej sesji | Mniejsza niezależność równoległego wyszukiwania; zakres i ograniczenie zapisano w metryce raportu |
