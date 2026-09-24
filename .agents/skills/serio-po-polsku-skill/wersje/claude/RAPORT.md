# RAPORT: Naturalna polszczyzna a cechy tekstu generowanego przez modele językowe
## Zasady wykrywania i poprawiania schematycznych konstrukcji AI

---

## 1. Metryka raportu

| Parametr | Wartość |
|----------|---------|
| Model | Claude Sonnet 4.6 (Thinking) |
| Data raportu | 2026-08-17 |
| Zakres | Cechy lingwistyczne LLM, polszczyzna, norma i uzus, strategie redakcji, detektory AI |
| Użyte narzędzia | Web search (scholarly domains), read_url_content, 5 równoległych subagentów-skautów |
| Ograniczenia dostępu | Brak dostępu do płatnych baz (Scopus, Web of Science, pełny Semantic Scholar); MCP paper-search-mcp niedostępny — fallback do WebSearch + bezpośrednie pobieranie arXiv |
| Liczba źródeł włączonych | 52 |
| Liczba źródeł odrzuconych | ~2 480 |

---

## 2. Pytania, protokół i metody

### 2.1 Pytania badawcze

Raport odpowiada na 14 pytań sformułowanych w protokole (PROTOKOL.md). Centralne pytanie: **jakie cechy tekstów LLM wykazano empirycznie, jak odróżniają się od naturalnej polszczyzny i jak poprawiać tekst bez zniszczenia głosu, sensu i funkcji?**

### 2.2 Metoda

Zastosowano pipeline: *research-question → research-protocol (pre-rejestracja) → literature-search (5 równoległych scoutów + własne wyszukiwania) → source-credibility (odrzucenie 98% hits) → citation-verification (DOI-resolution, Crossref) → data-extraction (EVIDENCE-TABLE) → critical-appraisal → scientific-consensus → evidence-synthesis → research-report.*

**Pakiet domenowy:** social-sciences + computer-science uzupełnione o językoznawstwo, lingwistykę obliczeniową i źródła normatywne. Wyszukiwanie po angielsku i polsku. Transfer wyników anglojęzycznych na polszczyznę zawsze oznaczony jako DIRECT/INDIRECT/SPECULATIVE.

### 2.3 Ograniczenia metodologiczne

- Brak dostępu do płatnych baz (Scopus, pełny WoS, JSTOR). Możliwa utrata publikacji w czasopismach bez open access.
- Blogi o "słowach zdradzających AI" celowo pominięte jako dowody; tratowane wyłącznie jako OBJECT-OF-STUDY.
- Większość badań NLP dotyczy języka angielskiego. Transfer na polszczyznę jest w przeważającej mierze INDIRECT lub SPECULATIVE.

---

## 3. Stan badań i jakość bazy dowodowej

### 3.1 Ogólna ocena

Baza dowodowa w zakresie **anglojęzycznych cech LLM** jest **umiarkowanie-wysoka** (liczne recenzowane badania, kilka benchmarków z ACL 2024, EMNLP 2025, ICML 2023). Istnieje jednak znaczna **heterogeniczność metodologiczna** — różne definicje "naturalności", różne LLM, różne gatunki — co uniemożliwia prostą meta-analizę ilościową.

W zakresie **polszczyzny** baza dowodowa jest **niska do umiarkowanej**: kilka prac empirycznych (KLEJ 2020, PLCC 2025, LLMzSzŁ 2025, ŚMIGIEL 2025, Bielik 2024), dwie analizy lingwistyczne z *Języka Polskiego* (Machura 2024, Wróblewska et al. 2025), ale brak corpus-study na dużą skalę z kontrolowanym porównaniem ludzie vs. LLM w polszczyźnie.

Obszar **normy i uzusu polskiego** jest doskonale udokumentowany przez autorytety: RJP, WSJP, NKJP, gramatyki opisowe — ale jest to odrębna kategoria NORMATIVE, niepodlegająca GRADE.

### 3.2 Ryzyko błędu w dostępnych badaniach

- **Ryzyko ekologiczne (domain bias):** Większość badań użyła newsów lub akademickich tekstów anglojęzycznych. Gatunki polskie (proza literacka, dokumenty urzędowe, blog) niezbadane.
- **Ewolucja modeli:** Cechy GPT-3.5 (2023) mogą różnić się od GPT-4o lub Claude 3.5 Sonnet (2025). Wyniki mogą dezaktualizować się szybko.
- **Konfundowanie:** Temperatura, długość, promptowanie, system prompt — wszystkie modulują cechy tekstu, ale rzadko są systematycznie kontrolowane.
- **Publikacja selektywna:** Prace pokazujące pozytywne wyniki detekcji łatwiej publikowalne niż "null results".

---

## 4. Co wiadomo o polszczyźnie, a co jedynie przenosi się z innych języków

### 4.1 Wiedza bezpośrednia o polszczyźnie (DIRECT)

**(a) Benchmarki NLU/NLG:**
- Modele wielojęzyczne osiągają gorsze wyniki na polskich zadaniach NLU niż modele z dedykowanym słownikiem (HerBERT, Bielik) — efekt *tokenizer fertility bottleneck* i bogactwa fleksyjnego (Rybak et al. 2020, Rust et al. 2021; KLEJ benchmark; DIRECT dla tej implikacji).
- Bielik 7B (2024) wykazuje, że zrównoważony polskojęzyczny corpus treningowy redukuje anglicyzmy składniowe i fragmentację tokenów.
- Benchmarki PLCC (600 pytań, OPI PIB) i LLMzSzŁ (~19 000 pytań CKE) potwierdzają: modele komercyjne mają wysoką płynność powierzchniową, ale popełniają subtelne błędy w zaawansowanej fleksji, kulturze i frazeologii.

**(b) Detekcja w polszczyźnie:**
- PolEval 2025 ŚMIGIEL (462 000+ próbek): polska fleksja i swobodny szyk zdań **maskują** statystyczne artefakty generacji. Klasyfikatory nadzorowane przenoszone między domenami gwałtownie tracą dokładność. Perpleksja względna modeli (mono- vs. wielojęzycznych) jest bardziej odporna na transfer niż nadzorowane klasyfikatory.

**(c) Lingwistyczne obserwacje jakościowe:**
- Machura (2024): ChatGPT wykazuje schematyzm składniowy, kalkowanie szyku SVO z angielskiego, nadużywanie imiesłowów przymiotnikowych, błędy w polskiej rekcji czasownikowej.
- Wróblewska et al. (2025): Modele gubią uzgodnienia morfosyntaktyczne w zdaniach złożonych z niestandardowymi formami morfologicznymi.

**WAŻNE ZASTRZEŻENIE:** Obserwacje Machury (2024) i Wróblewskiej et al. (2025) są jakościowymi analizami lingwistycznymi, nie eksperymentami kontrolowanymi z parami próbek. Stanowią **hipotezy redakcyjne** (EDITORIAL HYPOTHESIS), nie dowody poziomu HIGH.

### 4.2 Wiedza przenoszona z innych języków (INDIRECT)

Następujące cechy wykazano empirycznie dla angielskiego i, częściowo, innych języków — transfer na polszczyznę jest pośredni, wymaga ostrożności:

| Cecha LLM (ang.) | Źródła | Siła transferu na PL |
|------------------|---------|---------------------|
| Niższy TTR (type-token ratio) | El Attar 2026, Guo 2023, Zanotto 2025 | INDIRECT |
| Wyższy udział rzeczowników, spójników logicznych | Muñoz-Ortiz 2023, Guo 2023 | INDIRECT |
| Mniejsza wariancja długości zdań (niższa "burstiness") | Liang 2023 | INDIRECT |
| Homogenizacja stylu przez RLHF | Padmakumar & He 2024, Zamaraeva 2025 | INDIRECT |
| Nienaturalnie wyższe trust/anticipation w emocjach | Dönmez 2025, Guo 2023 | INDIRECT |
| Formalna, "podręcznikowa" spójność argumentacyjna | Dönmez 2025 | INDIRECT |
| Preferowanie słów funkcyjnych typowych dla angielskiego | Muñoz-Ortiz 2023 | SPECULATIVE dla PL |

### 4.3 Hipotezy wymagające weryfikacji dla polszczyzny

Poniższe wzorce są EDITORIAL HYPOTHESIS — obserwacje linwgistów lub transfer z badań anglojęzycznych bez bezpośredniego potwierdzenia w polskim corpus study:

- Kalkowanie polskiego szyku na wzór angielski SVO (zamiast V-2 czy SOV w specyficznych kontekstach)
- Błędy rekcji (*rządzić + D* zamiast *rządzić + N*)
- Nadużywanie imiesłowów przymiotnikowych biernych (-ny, -ty)
- Nadreprezentacja analityzmów werbo-nominalnych (*dokonać weryfikacji* zamiast *zweryfikować*)
- Spiętrzenia dopełniacza ("problemu dostępności zasobu środowiska")
- Sztuczne paralelizmy i trójpodziały tam, gdzie polszczyzna używałaby bardziej organicznej składni

---

## 5. Taksonomia wzorców — rekordy katalogowe

### Metodologia taksonomii

Każdy wzorzec opatrzony: ID, poziomem lingwistycznym, opisem, siłą i typem dowodów, specyfiką językową, gatunkami/rejestrami, kontrprzykładami, strategiami poprawy, warunkami "zostaw".

---

### WZORZEC-01 — Uniformizacja leksykalna (AI Lexical Leveling)

**Poziom:** dokument / akapit / leksyka  
**Opis operacyjny:** Tekst preferuje słownictwo o wysokiej częstotliwości w korpusie treningowym, unikając rzadkich, archaicznych, gwarowych lub wysoce specjalistycznych słów. Widoczny jako niski TTR i mała różnorodność synonimiczna.  
**Przykład ilustracyjny (AI):** *"Kwestia ta jest bardzo ważna. Ważne jest, by podejść do niej właściwie. Właściwe podejście zapewni dobre wyniki."*  
**Przykład ilustracyjny (ludzki):** *"Problem nieraz przemilczany, a przecież decydujący — jak go ominąć, żeby nie obrócić wysiłku wniwecz?"*  
**Dowody:** El Attar 2026 (284 cechy, 27 modeli; lexical richness = najstabilniejszy wyznacznik), Guo et al. 2023 (HC3), Guo/Shang/Clavel 2025 (TACL) — INDIRECT dla PL.  
**Siła dowodów:** Umiarkowanie wysoka (wiele badań, ale ang.); dla PL — LOW (hipoteza).  
**Specyfika języka:** Międzyjęzykowa, ale mechanizm różni się: w PL fleksja ukrywa ubóstwo leksykalne (infl. =/= leksem).  
**Gatunki z wysokim ryzykiem:** Artykuły poradnikowe, opisy produktów, streszczenia akademickie.  
**Kontrprzykłady i ryzyko alarmu:** Prosty język celowo ogranicza słownictwo (norma B2 w UX); teksty techniczne używają terminologii repetycyjnie z definicji.  
**Strategie poprawy:**  
  - Zamień powtarzające się słowa na synonimy lub przeformułowania, ale tylko gdy synonim brzmi naturalnie.  
  - Rozważ elipsę zamiast powtórzenia.  
  - Nie zamieniaj terminologii technicznej.  
**Czego nie naruszać:** Spójność terminologiczna w dokumentacji, prawna precyzja.  
**Zostaw bez zmian gdy:** Tekst jest instrukcją prostego języka dla B2; gatunek wymaga terminologicznej jednolitości.  
**Pewność:** MODERATE (ang.), HYPOTHESIS (PL).

---

### WZORZEC-02 — Monotonia rytmiczna (Syntactic Burstiness Deficit)

**Poziom:** akapit / zdanie  
**Opis operacyjny:** Zdania mają podobną długość, budowę i typ gramatyczny. Brak napięcia rytmicznego, krótkiego zdania po długim, wtrąceń, fragmentów, wykrzyknień.  
**Przykład ilustracyjny (AI):** *"Model językowy analizuje dane wejściowe. Następnie przetwarza je za pomocą warstw neuronowych. Na końcu zwraca wynik w formie tekstu."*  
**Przykład ilustracyjny (ludzki):** *"Model analizuje wejście. I to szybko — nieraz zaskakująco szybko. Co potem? Nic szczególnego: prosta piramida warstw, a na końcu słowo."*  
**Dowody:** Liang et al. 2023 (miary burstiness); Zamaraeva et al. 2025 (HPSG); Muñoz-Ortiz 2023 — INDIRECT.  
**Siła dowodów:** MODERATE (ang.); HYPOTHESIS (PL).  
**Gatunki z wysokim ryzykiem:** Proza narracyjna, publicystyka, eseje.  
**Kontrprzykłady:** Styl administratywny i prawny z definicji jest monotonny — to norma rejestru, nie błąd. Dokumentacja techniczna i procedury krokowe — podobnie.  
**Strategie poprawy:**  
  - Wstaw jedno krótkie zdanie na dłuższy akapit.  
  - Użyj pytania retorycznego lub wtrącenia.  
  - Nie rób mechanicznej "rotacji długości" — każde zdanie ma swój cel.  
**Zostaw bez zmian gdy:** Dokumentacja techniczna, instrukcje krokowe, styl prawny.  
**Pewność:** MODERATE (ang.), HYPOTHESIS (PL).

---

### WZORZEC-03 — Analityzmy werbo-nominalne (Biurokratyzacja Werbalna)

**Poziom:** zdanie / fraza  
**Opis operacyjny:** Zamiast prostego czasownika — wyrażenie złożone z rzeczownika odsłownego i czasownika niosącego tylko gramatykę: *dokonać weryfikacji* zamiast *zweryfikować*; *przeprowadzić analizę* zamiast *przeanalizować*; *podjąć działania* zamiast *działać*.  
**Dowody:** N11 (Zdunkiewicz-Jedynak 2008, stylistyka funkcjonalna), N13 (Malinowska 2001, żargon urzędowy), N10 (Piekot et al. 2019, plain language) — NORMATIVE.  
**Siła dowodów:** WYSOKA jako norma stylistyczna polszczyzny; HYPOTHESIS jako cecha specyficznie LLM (brak corpus study).  
**Specyfika:** Polska — ten wzorzec był problemem w polszczyźnie urzędowej na długo przed LLM. LLM mogą go powielać z danych treningowych.  
**Gatunki dopuszczające:** Prawo (stylizacja wymagana), formalny styl urzędowy, dyskurs akademicki (możliwość substantywizacji pojęć).  
**Kontrprzykłady:** *Podjąć decyzję* ma niuans niepozwalający na proste zamienniki (decyzja ≠ zdecydowanie); *dokonać odkrycia* ma wymiar triumfalny, którego *odkryć* nie oddaje.  
**Strategie poprawy:**  
  - Identyfikuj wyrażenia: *dokonać + rzecz. odsłowny*, *przeprowadzić + rzecz. odsłowny*, *podjąć + rzecz. odsłowny*.  
  - Zamieniaj na prosty czasownik, jeśli sens jest identyczny.  
  - Sprawdź, czy zamiennik ma taki sam aspekt (dokonany vs. niedokonany).  
**Czego nie naruszać:** Precyzja aspektowa. *Dokonać pomiaru* (raz, kompletnie) ≠ *mierzyć* (trwa, powtarza).  
**Zostaw bez zmian gdy:** Kontekst wymaga substantywizacji; aspekt czasownika zmienia się przy zamianie.  
**Pewność:** WYSOKA jako problem stylistyczny PL; HYPOTHESIS jako marker AI.

---

### WZORZEC-04 — Spiętrzenie dopełniacza (Dopełniaczowa Wieżyczka)

**Poziom:** fraza / zdanie  
**Opis operacyjny:** Łańcuch fraz rzeczownikowych w dopełniaczu: *problem efektywności zarządzania procesem oceny wyników*. Typowe dla tłumaczeń maszynowych i tekstu modelowego.  
**Dowody:** N13 (Malinowska 2001), N11 (Zdunkiewicz-Jedynak 2008), N10 (Piekot et al. 2019) — NORMATIVE. Machura 2024 wskazuje na kalki składniowe — DIRECT/HYPOTHESIS.  
**Siła dowodów:** WYSOKA jako diagnoza stylistyczna; HYPOTHESIS jako AI-specyficzna.  
**Specyfika:** Typowa dla kalk angielskich (compound nouns → chain of genitives).  
**Kontrprzykłady:** Terminologia naukowa i prawna może być tak zbudowana z konieczności (np. *indeks masy ciała*, *postępowanie administracyjno-sądowe*).  
**Strategie poprawy:**  
  - Odkręć łańcuch na zdanie podrzędne lub wyrażenie przyimkowe.  
  - *"problem oceny wyników zarządzania"* → *"jak zarządzanie przekłada się na wyniki?"*  
  - Sprawdź, czy można zamienić jeden człon na przymiotnik (*wyniki zarządcze*).  
**Zostaw bez zmian gdy:** Termin naukowy lub prawny o ustalonym kształcie.  
**Pewność:** WYSOKA (norma stylistyczna), HYPOTHESIS (AI-specyficzna).

---

### WZORZEC-05 — Sztuczny równoległość i trójpodział (Rhetorical Template Lock)

**Poziom:** akapit / dokument  
**Opis operacyjny:** Mechaniczne stosowanie trójpodziałów (po pierwsze / po drugie / po trzecie), list punktowanych tam gdzie narracja byłaby naturalna, symetrycznych stwierdzeń kontrastujących (*Z jednej strony… Z drugiej strony…*).  
**Przykład ilustracyjny (AI):** *"Projekt ma trzy zalety: po pierwsze, jest tani; po drugie, jest szybki; po trzecie, jest niezawodny."*  
**Dowody:** Dönmez et al. 2025 (podręcznikowa spójność argumentacyjna LLM); Clark et al. 2021 (percepcja "AI-owego" stylu) — INDIRECT.  
**Siła dowodów:** MODERATE (ang.); HYPOTHESIS (PL).  
**Kontrprzykłady:** Paralelizm retoryczny jest potężnym środkiem stylistycznym w oratorstwie, eseistyce, reklamie. Enumeracje są konieczne w dokumentacji, instrukcjach, raportach.  
**Strategie poprawy:**  
  - Zastąp listę wypunktowaną akapitem narracyjnym, gdy wyliczenie nie jest konieczne dla percepcji czytelnika.  
  - Zamiast *Po pierwsze/po drugie/po trzecie* użyj spójników dyskursu (*Przede wszystkim, Ponadto, Wreszcie*) lub zrezygnuj ze schematu w ogóle.  
  - Zachowaj paralelizm, gdy elementy są naprawdę paralelne logicznie.  
**Zostaw bez zmian gdy:** Gatunek wymaga wyliczenia (instrukcja, agenda, raport); elementy są faktycznie równoważne.  
**Pewność:** HYPOTHESIS.

---

### WZORZEC-06 — Metakomentarze i streszczanie wniosków (Metacommentary Overload)

**Poziom:** akapit / dokument  
**Opis operacyjny:** Tekst zapowiada to, co zaraz powie (*W tym artykule omówię…*), a potem streszcza to, co już powiedział (*Podsumowując, jak widać z powyższego, tekst pokazał, że…*). Nadmiar sygnałów dyskursu.  
**Dowody:** Pośrednio poparte wynikami Dönmeza et al. 2025 (podręcznikowa spójność) i Guo et al. 2023 (przysłówki porządkujące) — INDIRECT. Brak bezpośrednich badań specyficznie o metacomentarzach.  
**Siła dowodów:** HYPOTHESIS.  
**Kontrprzykłady:** Streszczenia wykonawcze i wprowadzenia akademickie są z definicji metacomentarzem (niezbędnym). Teksty dydaktyczne sygnalizują strukturę celowo.  
**Strategie poprawy:**  
  - Usuń zapowiedź, jeśli nagłówek lub akapit są wystarczające.  
  - Usuń streszczenie końcowe, jeśli to krótki artykuł lub posty UX.  
  - Zachowaj w: raportach, artykułach naukowych, długich opracowaniach.  
**Pewność:** HYPOTHESIS.

---

### WZORZEC-07 — Dopowiedzenie po myślniku / przecinku (Dash-Gloss Pattern)

**Poziom:** zdanie / fraza  
**Opis operacyjny:** Model dodaje wyjaśnienie bezpośrednio po myślniku lub przecinku, nawet gdy odbiorca nie potrzebuje wyjaśnienia: *sztuczna inteligencja, czyli systemy komputerowe naśladujące ludzkie myślenie, zmieniają świat*. Wielokrotnie w jednym akapicie staje się manierą.  
**Dowody:** Brak bezpośrednich badań; obserwacja redakcyjna.  
**Siła dowodów:** HYPOTHESIS.  
**Kontrprzykłady:** W tekstach popularyzatorskich, UX dla nowych użytkowników, onboardingach — wyjaśnienia po myślniku są uzasadnione i pożądane.  
**Strategie poprawy:**  
  - Usuń wyjaśnienie, jeśli odbiorca je zna.  
  - Przekształć w zdanie podrzędne lub przypisek, jeśli wyjaśnienie jest obszerne.  
**Zostaw gdy:** Gatunek wymaga dostępności; odbiorca to nowicjusz.  
**Pewność:** HYPOTHESIS.

---

### WZORZEC-08 — Abstrakcyjna rzeczownikowość (Abstract Noun Proliferation)

**Poziom:** zdanie / leksyka  
**Opis operacyjny:** Zamiast działań, zdarzeń, ludzi i rzeczy — abstrakcyjne kategorie: *implementacja rozwiązań optymalizacyjnych w obszarze zarządzania zasobami*. Brak podmiotów-agentów, brak konkretnych obiektów.  
**Dowody:** N10 (Piekot et al. 2019), N11 (Zdunkiewicz-Jedynak), N13 (Malinowska) — NORMATIVE. Guo et al. 2023 (wyższy udział rzeczowników w LLM) — INDIRECT.  
**Siła dowodów:** WYSOKA jako diagnoza stylistyczna; MODERATE jako cecha LLM.  
**Specyfika:** Polska — problem predefiniowany w lingwistyce normatywnej; wzmacniany przez LLM.  
**Strategie poprawy:**  
  - Znajdź ukryty podmiot-agent (*kto implementuje?*) i przywróć go do zdania.  
  - Zamień nominalizację na czasownik (*implementacja* → *wdrożyć*; *optymalizacja* → *zoptymalizować*).  
  - Ustal, o jakim konkretnym obiekcie mówi tekst.  
**Zostaw gdy:** Termin naukowy lub pojęcie ogólne wymagające abstrakcji.  
**Pewność:** HIGH jako diagnoza stylistyczna; MODERATE jako AI-marker.

---

### WZORZEC-09 — Sztuczna emfaza i superlatiwy (Intensity Inflation)

**Poziom:** leksyka / fraza  
**Opis operacyjny:** Nadużywanie słów: *niezwykle, wyjątkowo, niesamowicie, rewolucyjny, przełomowy, kluczowy, fundamentalny*. W testach angielskich: *delve, significant, crucial, noteworthy*. W polskim: ekwiwalenty tych leksemów.  
**Dowody:** Pośrednie (obserwacje w literaturze; blogi o AI-words jako OBJECT-OF-STUDY); brak recenzowanych badań dla polskiego.  
**Siła dowodów:** HYPOTHESIS (dla PL); OBJECT-OF-STUDY (dla blogów anglojęzycznych).  
**WAŻNE ZASTRZEŻENIE:** Frekwencja słowa bez kontekstu nie jest wystarczającą diagnozą. "Kluczowy" w tytule rozdziału może być uzasadniony; "kluczowy" trzy razy w jednym akapicie — to problem.  
**Kontrprzykłady:** Tekst marketingowy z definicji intensyfikuje; recenzja literacka może potrzebować superlatiwa.  
**Strategie poprawy:**  
  - Ogranicz do jednego intensyfikatora na akapit.  
  - Sprawdź, czy rzeczywiście jest przełomowe — jeśli nie, usuń przymiotnik.  
**Zostaw gdy:** Marketing, promocja, gatunek z definicji intensywny emocjonalnie.  
**Pewność:** HYPOTHESIS.

---

### WZORZEC-10 — Formalny, "podręcznikowy" ton tam gdzie nieodpowiedni (Register Mismatch)

**Poziom:** dokument / akapit  
**Opis operacyjny:** Tekst używa rejestru formalnego, akademickiego lub biurokratycznego w kontekście, który wymaga rejestu potocznego, przyjaznego lub literackiego. Model domyślnie optymalizuje w kierunku "bezpiecznego" formalnego tonu (efekt RLHF).  
**Dowody:** Padmakumar & He 2024 (RLHF → homogenizacja ku "safe" output); Zamaraeva 2025 (instruction-tuned modele tracą różnorodność rejestrową) — INDIRECT.  
**Siła dowodów:** MODERATE (ang.); HYPOTHESIS (PL).  
**Kontrprzykłady:** Formalny ton jest właściwy i wymagany w dokumentacji prawnej, raportach, komunikacji korporacyjnej.  
**Strategie poprawy:**  
  - Zidentyfikuj gatunek, odbiorcę i medium PRZED edycją.  
  - Obniż rejestr przez: skróty, zaimki (ty/wy), pytania bezpośrednie, potoczne spójniki (*bo, żeby, co prawda*).  
  - Nie obniżaj rejestru w dokumentach prawnych i regulaminach.  
**Zostaw gdy:** Gatunek formalizuje ton (prawo, akademia, urzędy).  
**Pewność:** MODERATE.

---

## 6. Norma, uzus, rejestry i różnice gatunkowe

### 6.1 Dwupoziomowość normy polskiej

Polska norma językowa (za Markowskim 2005, N04) rozróżnia:

- **Norma wzorcowa:** wymagana w oficjalnych kontekstach (prawo, nauka, media publiczne, edukacja). Obowiązuje absolutna poprawność fleksyjna, składniowa i ortograficzna.  
- **Norma użytkowa:** dopuszcza wahania uzualne, warianty, potocyzmy — w kontekstach nieformalnych i w rejestrach specjalistycznych, gdzie konwencja środowiska jest ważniejsza od wzorcowości.

**Konsekwencja dla redakcji:** Redaktor nie może mechanicznie stosować jednej normy do wszystkich tekstów. Artykuł naukowy podlega normie wzorcowej; post w mediach społecznościowych — normie użytkowej lub nawet jej rozluźnieniu. Tekst LLM, nie wiedząc o tym rozróżnieniu, zwykle przeszacowuje poziom formalizacji (wzorzec 10).

### 6.2 Reforma ortograficzna 2024/2026

W maju 2024 RJP ogłosiła *Zasady pisowni i interpunkcji polskiej*, które od 1 stycznia 2026 stają się jedynym obowiązującym źródłem zasad ortograficznych, uchylając uchwały z 1997–2008. Modele LLM trenowane przed 2026 mogą stosować przestarzałe zasady ortograficzne. Należy to sprawdzać.

### 6.3 Prosty język

Pracownia Prostej Polszczyzny UWr (Piekot, Zarzeczny, Moroń) wypracowała polskie standardy plain language (ISO 24495-1, obowiązujący od 2023). Kluczowe zasady:

- Zdania do ~15-20 słów (w UX: krótsze)
- Aktywna strona zamiast biernej
- Jeden podmiot-agent w zdaniu
- Brak nominalizacji tam, gdzie wystarczy czasownik
- Brak łańcuchów dopełniaczowych

**Napięcie z LLM:** Modele LLM działają w odwrotnym kierunku — optymalizują ku formalności i nominalizacji. Redakcja w duchu prostego języka jest zatem adekwatną reakcją na wiele wzorców LLM — ale tylko w odpowiednich gatunkach.

### 6.4 Rejestry i gatunki — kryteria różnicowe

| Gatunek/Medium | Główne problemy LLM | Priorytety redakcji |
|----------------|---------------------|---------------------|
| **UI / komunikaty aplikacji** | Formalizacja, metacomentarze, "można by" zamiast rozkazu | Tryb rozkazujący, krótkie zdania, zero żargonu |
| **Onboarding / dokumentacja użytkownika** | Peryfrastyczność, brak podmiotów-agentów | Prosty język; aktywna strona; numerowane kroki |
| **Artykuły i poradniki** | Paralelizmy, trójpodziały, monotonia rytmiczna | Zachowaj strukturę logiczną; dodaj rytm przez zdania krótkie |
| **Raporty i opracowania** | Abstrakcyjna rzeczownikowość, nominalizacje | Dozwolona formalizacja; sprawdź terminologię |
| **E-maile i komunikacja biznesowa** | Nadformalizacja, metacommentarze | Obniż rejestr; usuń wstępne streszczenia |
| **Proza literacka / narracja** | Monotonia, uniform emocjonalność, brak rytmu | Głęboka redakcja; nie "poprawiaj" stylu autora bez zgody |
| **Teksty marketingowe** | Intensywy właściwe; problem z autentycznością | Sprawdź czy intensywy są uzasadnione; zachowaj perswazję |
| **Nauka / teksty akademickie** | Nominalizacje, strona bierna — częściowo normatywne | Ostrożność; sprawdź konwencje dyscypliny |
| **Prawo / regulacje** | Formalizacja wymagana; błędy rekcji niebezpieczne | Sprawdź rekcję i zgodność z terminologią prawną |
| **Kod z tekstem widocznym** | Ryzyko edycji kluczy, placeholderów, formatów | Patrz sekcja 8 |
| **Książka / długi dokument** | Brak globalnej spójności stylu i terminologii | Patrz sekcja 9 |

---

## 7. Strategie poprawy i zachowania sensu i głosu

### 7.1 Zasada naczelna: nie poprawiaj dla samego poprawiania

**Każda interwencja redakcyjna musi mieć uzasadnienie:** usuwa błąd językowy, poprawia czytelność, przywraca rejestr, usuwa konkretny wzorzec LLM. Jeśli zdanie działa — zostaw je. Priorytetem jest zachowanie: sensu, faktów, tonu, stylu autora, funkcji tekstu.

### 7.2 Pipeline redakcyjny dla tekstu LLM

1. **Zidentyfikuj gatunek, odbiorcę i medium.** To definiuje, które kryteria stosować.
2. **Pierwsza lektura całości** — ocena globalnej spójności, rejestru, tonu.
3. **Identyfikacja wzorców z sekcji 5** — nie wszystkich naraz; priorytetuj wysokie ryzyko.
4. **Interwencja chirurgiczna** — zmieniaj minimum, sprawdź po każdej zmianie.
5. **Test zachowania znaczenia** — czy po zmianie zdanie znaczy dokładnie to samo?
6. **Test głosu** — czy po zmianie tekst brzmi jak ten sam autor?
7. **Sprawdź terminologię i nazwy własne** — nie zmieniaj ich.

### 7.3 Mapa problem → strategia

| Problem (wzorzec) | Strategia bezpieczna | Czego nie robić |
|-------------------|---------------------|-----------------|
| Niski TTR (W01) | Synonimy lub elipsa | Nie zmieniaj terminów specjalistycznych |
| Monotonia zdań (W02) | Dodaj krótkie zdanie po długim | Nie wprowadzaj rytmu mechanicznie |
| Analityzmy werbalne (W03) | Zamień na prosty czasownik | Sprawdź aspekt przed zamianą |
| Spiętrzenie D (W04) | Przebuduj na zdanie podrzędne | Nie zmieniaj ustalonych terminów |
| Paralelizm sztuczny (W05) | Zamień na narrację lub przetasuj | Zachowaj, gdy wyliczenie niezbędne |
| Metakomentarze (W06) | Usuń jeśli nagłówek wystarczy | Zostaw we wstępach i raportach |
| Dopowiedzenia (W07) | Usuń dla eksperta; zostaw dla nowicjusza | Nie usuwaj w tekstach dostępnościowych |
| Abstrakcja (W08) | Przywróć podmiot-agenta | Nie niszcz terminów pojęciowych |
| Intensywy (W09) | Ogranicz 1/akapit | Nie usuwaj wszystkich — traci emfazę |
| Mismatch rejestru (W10) | Obniż/podwyższ do właściwego rejestru | Nie "spłaszczaj" głosu autora |

### 7.4 Polskie specyfika: fleksja i szyk

- **Szyk zdania w PL jest wolny** — ale nie dowolny. Szyk wyrazów niesie informację (tema–remat). Nagłówek tematu vs. remat końcowy jest fundamentalny. Model LLM może kalkować SVO na wzór angielski, umieszczając podmiot na początku nawet tam, gdzie polska stylistyka wolałaby inwersję.
- **Rekcja:** Błędy w rządzie przypadkowym (*dyskutować problem* zamiast *dyskutować nad problemem*) są wskaźnikiem kalkowania lub niskiej jakości modelu. Weryfikuj przez WSJP (wsjp.pl) lub NKJP (nkjp.pl).
- **Imiesłowy przymiotnikowe:** Strona bierna z imiesłowem (*napisany przez autora tekst*) jest gramatyczna, ale w nadmiarze — nienaturalna. Preferuj czynne konstrukcje (*tekst, który napisał autor*).
- **Partykuły i spójniki:** LLM rzadko używa polskich cząstek ekspresyjnych (*no, właśnie, przecież, że aż, ot, bodaj*). Ich brak jest wskaźnikiem, ale nie wadą — w wielu rejestrach są zbędne.

---

## 8. Tekst widoczny w oprogramowaniu i ograniczenia techniczne

### 8.1 Problem identyfikacji tekstu widocznego

W repozytoriach kodu teksty widoczne dla użytkownika (UI strings, komunikaty błędów, onboarding) mieszają się z:
- Kluczami i identyfikatorami (`button.submit.label`, `ERROR_CODE_403`)
- Placeholderami (`{username}`, `{{name}}`, `%s`)
- Znacznikami formatu (Markdown, HTML, RST)
- Komentarzami kodu (nie widocznymi dla użytkownika)
- Zmiennymi i stałymi

**Zasady bezpiecznej identyfikacji:**
1. Edytuj wyłącznie wartości (strings), nigdy klucze.
2. Placeholdery (`{name}`, `%s`, `{{var}}`) traktuj jako nieprzekraczalne — zachowaj ich typ, nazwę i pozycję.
3. Znaczniki HTML (`<br>`, `<strong>`) zachowaj lub konsultuj z deweloperem.
4. Nie edytuj ciągów w blokach kodu, instrukcjach formatowania, plikach konfiguracyjnych.
5. W plikach i18n (`.po`, `.json`, `.yaml`) edytuj tylko wartość po kluczu, nigdy klucz.

**Praktyczny test:** Czy ten fragment pojawi się na ekranie użytkownika finalnego aplikacji? Jeśli NIE — nie edytuj.

### 8.2 Typowe gatunki UI tekstu i strategie

| Typ UI text | Styl docelowy | Typowe problemy LLM |
|-------------|---------------|---------------------|
| Komunikat błędu | Zrozumiały, konkretny, zawiera co robić | Nadformalizacja, brak rozwiązania |
| Przycisk i label | Jednoznaczny czasownik imperatywny | Gerundium zamiast imperatywu |
| Pusty stan (empty state) | Pomocny, nie alarmistyczny | Negatywne frazy (*nie znaleziono*, *brak*) |
| Onboarding | Przyjazny, krokowy, prosty język | Metacomentarze, zbędne wprowadzenia |
| Tooltip | Ekstremalnie krótki, konkretny | Nadmiar wyjaśnień |
| Komunikat sukcesu | Pozytywny, krótki | Zbędne sformułowania (*operacja zakończona sukcesem* → *Zapisano!*) |

---

## 9. Długie formy i książki

### 9.1 Wyzwania globalnej spójności

Przy edycji bardzo długich dokumentów (40+ stron) lub książek głównym ryzykiem nie jest żaden pojedynczy wzorzec — ale **globalna niespójność stylu, terminologii i głosu** przez całą długość dokumentu.

**Zagrożenia specyficzne:**
- Terminologia: Ten sam termin w rozdziale 1 i 5 może być zapisany różnie (*sztuczna inteligencja / AI / modele językowe*) — model nie pamięta własnych wcześniejszych decyzji.
- Głos narratora: Zmiana tonu między rozdziałami (rozdział 1 formalny, rozdział 3 swobodny).
- Postacie i detale narracyjne (proza fabularna): LLM może "zapomnieć" kolory oczu bohatera lub chronologię.

### 9.2 Strategia dla długich dokumentów

1. **Przed redakcją:** Stwórz Arkusz Stylu — terminologia, preferowane formy, rejestr, osobowość marki/autora.
2. **Podział na segmenty:** Edytuj sekcjami, ale z globalnym kontekstem (arkusz stylu jako "system prompt" dla każdej sesji).
3. **Punkty kontrolne spójności:** Po każdej sekcji sprawdź terminologię względem arkusza.
4. **Koniec dokumentu:** Czytaj całość i wyrównaj wahania rejestru między sekcjami.
5. **Dla prozy fabularnej:** Prowadź "biblię postaci" i "linię czasu zdarzeń" jako oddzielny dokument referencyjny.

---

## 10. Projekt oceny: korpus, testy, ślepa ocena ludzka i metryki szkód

### 10.1 Dlaczego standardowe metryki nie wystarczają

- BLEU/ROUGE: Nie korelują z ludzkim poczuciem naturalności (Novikova et al. 2017, EMNLP 2017).
- Perpleksja: Niska perpleksja = cechy AI, ALE to samo dotyczy pisania uproszczonego przez L2 autorów (Liang et al. 2023) — fałszywy alarm dla polskich piszących prostym językiem.
- BERTScore: Lepsza korelacja z ludzkimi ocenami niż n-gramy, ale nie mierzy rejestru ani głosu.

### 10.2 Proponowany projekt oceny jakości redakcji

**Protokół ślepej oceny parowej:**
1. Pobierz 50 tekstów oryginalnych (mix gatunków: UX, artykuły, akademickie, narracja).
2. Wygeneruj wersje LLM tych tekstów.
3. Edytuj wersje LLM zgodnie z zasadami skilla.
4. Stwórz trzy pary: (original, LLM), (original, edited), (LLM, edited).
5. Przeszkoleni oceniający lingwiści oceniają każdą parę na 4 wymiarach:
   - Naturalność (0-5)
   - Zachowanie sensu i faktów (0-5)
   - Adekwatność gatunkowa (0-5)
   - Głos/styl (0-5, gdzie 5 = identyczny z oryginałem)
6. Oblicz: czy edycja poprawia naturalność BEZ degradacji zachowania sensu?

**Metryki szkód — "nadredakcja":**
- Zmiana oceny sensu po edycji (musi być 0 lub pozytywna)
- Zmiana oceny głosu (powinna być neutralna lub pozytywna)
- Odsetek zdań zmienionych (>30% = ryzyko nadredakcji)
- Długość przed/po (>20% skrócenie = ryzyko utraty treści)

---

## 11. Detektory AI — ograniczenia i etyka twierdzeń

### 11.1 Stan badań

Badania (Liang 2023, Weber-Wulff 2023, Sadasivan 2025 TMLR, Dugan 2024 ACL, Tufts 2025 NAACL) wykazują:

- **Brak gwarancji statystycznych** dla komercyjnych detektorów (GPTZero, Turnitin).
- **Systematyczny bias przeciwko ESL piszącym** — FPR >61% dla uproszczonego języka.
- **Kruchość wobec minimalnych edycji** — prosta parafraza redukuje AUROC do ~0.5.
- **Impossibility theorem** (Sadasivan 2025) — gdy p(LLM) zbliża się do p(human), granica błędu klasyfikatora matematycznie dąży do 0.

### 11.2 Implikacje dla polszczyzny

Polskie teksty LLM są trudniejsze do detekcji niż angielskie (ŚMIGIEL 2025; Macko 2023):
- Elastyczność szyku maskuje powtarzalność.
- Bogata fleksja tworzy pozorną różnorodność powierzchniową.
- Dostępnych jest mało polskich detektorów i benchmarków.

### 11.3 Etyczne granice twierdzeń

Skill NIE powinien:
- Obiecywać "niewykrywalności" tekstu po redakcji.
- Twierdzić, że detektor "nigdy się nie myli".
- Używać wyników detekcji do oskarżeń o nieuczciwość bez innych dowodów.

Skill POWINIEN:
- Jasno mówić, że cel to naturalna, komunikatywna polszczyzna — nie dezinformacja detektorów.
- Ostrzegać przed fałszywymi oskarżeniami opartymi na detektorach (szczególnie dla osób piszących niestandardowym językiem).

---

## 12. Wnioski dla projektanta skilla

### 12.1 Co skill powinien robić

1. **Diagnozować, nie zakazywać.** Żaden wzorzec nie jest bezwzględnie zły — zawsze zależy od gatunku, rejestru i kontekstu.
2. **Pytać o gatunek i odbiorcę** przed każdą interwencją.
3. **Operować na wzorcach z sekcji 5** — każdy ma jasny opis, kontrprzykłady i strategię.
4. **Odróżniać błąd językowy od manieryzmu LLM od stylu autora.**
5. **Zachowywać terminologię, nazwy własne i intencję** — priorytet nad naturalnością.
6. **Dla kodu:** Identyfikować wyłącznie tekst widoczny dla użytkownika; nie dotykać kluczy, placeholderów, komentarzy.

### 12.2 Czego skill nie powinien robić

- Tworzyć "czarnej listy" słów.
- Zamieniać automatycznie słów bez analizy kontekstu.
- Obiecywać, że tekst po poprawkach nie zostanie wykryty przez detektor AI.
- Stosować jednej normy do wszystkich gatunków.
- Zmieniać terminologii naukowej, prawnej lub technicznej bez konsultacji.

### 12.3 Priorytetyzacja problemów

**Krytyczne (zawsze interweniuj jeśli obecne):**
- Błędy fleksyjne i składniowe (rekcja, uzgodnienia morfosyntaktyczne)
- Mismatch rejestru (formalny kod tam, gdzie potrzeba tonu przyjaznego)
- Spiętrzenie dopełniacza w UX/komunikatach

**Ważne (interweniuj w większości gatunków):**
- Analityzmy werbo-nominalne
- Abstrakcyjna rzeczownikowość
- Metakomentarze tam, gdzie nagłówek wystarczy

**Opcjonalne (interweniuj kontekstowo):**
- Sztuczne paralelizmy (tylko tam, gdzie narracja lepiej)
- Dopowiedzenia po myślniku (tylko dla ekspertów)
- Monotonia rytmiczna (tylko w prozie)
- Intensywy (tylko gdy ewidentna inflacja)

---

## 13. Sprzeczności, luki, hipotezy i priorytety dalszych badań

### 13.1 Kluczowe luki

1. **Brak polskiego corpus study z kontrolą.** Nie istnieje (na 2026-08-17) duże, publiczne badanie porównujące pary *tekst ludzki po polsku / tekst LLM po polsku* z systematyczną lingwistyczną analizą. ŚMIGIEL (PolEval 2025) jest krokiem w tym kierunku, ale skupia się na detekcji, nie na charakterystyce.

2. **Brak badania fałszywych pozytywów dla polskich autorów.** Liang et al. (2023) dotyczy ESL w angielskim. Analogiczne badanie dla polskich autorów (np. piszących prostą polszczyzną) nie istnieje — ale mechanizm perpleksji sugeruje, że ryzyko jest podobne.

3. **Brak badania wpływu edycji ludzkiej na cechy LLM.** Czy edycja 30% zdań usuwa sygnały detekcji? To pytanie empirycznie nierozstrzygnięte.

4. **Modele ewoluują szybko.** Cechy GPT-3.5 mogą nie dotyczyć GPT-5 lub Claude 4. Wyniki trzeba traktować jako stan wiedzy na konkretny moment.

5. **Brak badania specyficznie "AI-izmów" w polszczyźnie.** Machura 2024 i Wróblewska 2025 to analizy jakościowe, nie korpusowe eksperyment kontrolowany.

### 13.2 Sprzeczności w literaturze

- **Homogenizacja vs. model-specific variance:** Badania pokazują zarówno homogenizację (Padmakumar 2024, Guo 2025 TACL) jak i unikalne "idiolekty" poszczególnych modeli (Wu 2025 survey). Obie obserwacje mogą być prawdziwe jednocześnie: modele RLHF zbiegają do "bezpiecznego" środka, ale każdy z nieco innego punktu startowego.
- **Formalność vs. emocjonalność:** Guo 2023 (HC3) stwierdza neutralność emocjonalną LLM; Dönmez 2025 (EMNLP) stwierdza wyższe trust i anticipation. Różnica może wynikać z gatunku (QA vs. perswazja) i modelu (ChatGPT 2022 vs. nowsze).

### 13.3 Priorytety badawcze dla polszczyzny

1. **Corpus study:** 1000+ par tekstów ludzkich/LLM w kilku gatunkach polskich (artykuły, opisy produktów, narracja, e-maile). Analiza TTR, POS-distribution, analityzmy, spiętrzenia dopełniacza.
2. **FP study:** Badanie fałszywych pozytywów detektorów dla polskich autorów piszących prostym językiem lub stylem potocznym.
3. **Longitudinalne:** Śledzenie zmian cech LLM przez kolejne wersje modeli polskojęzycznych (Bielik, PLLuM).
4. **Gatunek × model:** Matryca: gatunek (10) × model (5) × temperatura (3) — które kombinacje produkują najbardziej schematyczny tekst?

---

## 14. Zweryfikowana bibliografia (APA 7)

### Badania empiryczne — cechy LLM

Dönmez, E., Maurer, M., Lapesa, G., & Falenska, A. (2025). *AI argues differently: Distinct argumentative and linguistic patterns of LLMs in persuasive contexts*. Proceedings of EMNLP 2025. Association for Computational Linguistics. https://aclanthology.org/2025.emnlp-main.488/

El Attar, Y., Dönmez, E., Maurer, M., & Falenska, A. (2026). *A systematic analysis of linguistic features in AI-generated text detection across domains and models* [Preprint, not peer-reviewed]. arXiv. https://arxiv.org/abs/2606.04177

Guo, B., Zhang, X., Wang, Z., Jiang, M., Nie, J., Ding, Y., Yue, J., & Wu, Y. (2023). *How close is ChatGPT to human experts? Comparison corpus, evaluation, and detection* [Preprint, not peer-reviewed]. arXiv. https://arxiv.org/abs/2301.07597

Guo, Y., Shang, G., & Clavel, C. (2025). Benchmarking linguistic diversity of large language models. *Transactions of the Association for Computational Linguistics*, *13*. https://doi.org/10.1162/tacl_a_00714

Li, Z., & Zhang, Q. (2025). *Linguistic differences between AI and human comments in Weibo: Detect AI-generated text through stylometric features*. Proceedings of CCL 2025. https://aclanthology.org/2025.ccl-1.64/

Macko, D., Moro, R., Uchendu, A., Lucas, J., Yamashita, M., et al. (2023). *MULTITuDE: Large-scale multilingual machine-generated text detection benchmark*. Proceedings of EMNLP 2023. https://aclanthology.org/2023.emnlp-main.616/

Miletić, F., & Falk, N. (2026). *What are LLMs doing to scientific communication? Measuring changes in writing practices and reading experience* [Preprint, not peer-reviewed]. arXiv. https://arxiv.org/abs/2605.19936

Muñoz-Ortiz, A., Gómez-Rodríguez, C., & Vilares, D. (2023). *Contrasting linguistic patterns in human and LLM-generated news text* [Preprint, not peer-reviewed]. arXiv. https://arxiv.org/abs/2308.09067

Padmakumar, V., & He, H. (2024). *Does writing with language models reduce content diversity?* [Preprint]. International Conference on Learning Representations (ICLR 2024). https://doi.org/10.48550/arXiv.2309.05196

Park, S., Kim, S., Kim, D., & Han, Y.-S. (2024). *KatFishNet: Detecting LLM-generated Korean text through linguistic feature analysis* [Preprint, not peer-reviewed]. arXiv. https://arxiv.org/abs/2407.13289

Wu, J., Yang, S., Zhan, R., Yuan, Y., Chao, L. S., & Wong, D. F. (2025). A survey on LLM-generated text detection: Necessity, methods, and future directions. *Computational Linguistics*, *51*(1). https://aclanthology.org/2025.cl-1.8/

Zamaraeva, O., Flickinger, D., Bond, F., & Gómez-Rodríguez, C. (2025). *Comparing LLM-generated and human-authored news text using formal syntactic theory*. Proceedings of ACL 2025. https://aclanthology.org/2025.acl-long.443/

Zanotto, S. E., & Aroyehun, S. (2025). *Linguistic and embedding-based profiling of texts generated by humans and large language models*. Proceedings of EMNLP 2025. https://aclanthology.org/2025.emnlp-main.1163/

### Polszczyzna i języki fleksyjne w LLM

Dadas, S., Grębowiec, M., Perełkiewicz, M., & Poświata, R. (2025). *Evaluating Polish linguistic and cultural competency in large language models (PLCC)* [Preprint, not peer-reviewed]. arXiv. https://doi.org/10.48550/arXiv.2503.00995

Machura, M. (2024). Jak ChatGPT staje się czatem GPT — o apelatywizacji nazwy popularnego bota w polszczyźnie. *Język Polski*, *CIV*(3), 27–38. https://doi.org/10.31286/JP.104.3.3

Ociepa, K., Flis, Ł., Wróbel, K., Gwoździej, A., & Kinas, R. (2024). *Bielik 7B v0.1: A Polish language model — Development, insights, and evaluation* [Preprint, not peer-reviewed]. arXiv. https://doi.org/10.48550/arXiv.2410.18565

Piskorski, J., Pivovarova, L., & Yangarber, R. (Eds.). (2023–2025). *Proceedings of the Workshop on Slavic Natural Language Processing (BSNLP)*. ACL Anthology. https://aclanthology.org/venues/bsnlp/

Przybyła, P., Strebeyko, J., & Wróblewska, A. (2025). *Overview of the PolEval 2025 shared task on machine-generated text detection in Polish (ŚMIGIEL)*. PolEval 2025 Proceedings. https://poleval.pl/tasks/smigiel/

Ragan, M., Kaczmarek, A., et al. (2025). *LLMzSzŁ: A comprehensive LLM benchmark for Polish* [Preprint, not peer-reviewed]. arXiv. https://doi.org/10.48550/arXiv.2501.02266

Rust, P., Pfeiffer, J., Vulić, I., Ruder, S., & Gurevych, I. (2021). How good is your tokenizer? On the monolingual performance of multilingual language models. *Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics (ACL-IJCNLP 2021)*, 3118–3135. https://doi.org/10.18653/v1/2021.acl-long.242

Rybak, P., Mroczkowski, R., Tracz, J., & Gawlik, I. (2020). KLEJ: Comprehensive benchmark for Polish language understanding. *Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics (ACL 2020)*, 1191–1201. https://doi.org/10.18653/v1/2020.acl-main.111

Üstün, A., Aryabumi, V., Yong, Z., et al. (2024). Aya model: An instruction finetuned open-access multilingual language model. *Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (ACL 2024)*, 15304–15330. https://doi.org/10.18653/v1/2024.acl-long.845

Wendler, C., Veselovsky, V., Monea, G., & West, R. (2024). Do llamas work in English? On the latent language of multilingual transformers. *Findings of the Association for Computational Linguistics: ACL 2024*, 11643–11663. https://doi.org/10.18653/v1/2024.findings-acl.730

Wróblewska, A., Głowińska, K., & Ogrodniczuk, M. (2025). Koncepcja form równościowych z asteryskiem inkluzywnym a modele językowe. *Język Polski*, *CIV*(2), 97–117. https://doi.org/10.31286/JP.105.2.7

### Detektory AI

Dugan, L., Ippolito, D., Kirubarajan, A., Shi, S., & Callison-Burch, C. (2024). RAID: A shared benchmark for robust evaluation of machine-generated text detectors. *Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (ACL 2024)*. https://doi.org/10.18653/v1/2024.acl-long.674

Elkhatat, A. M., Elsaid, K., & Almeer, S. (2023). Evaluating the efficacy of AI content detection tools in differentiating between human and AI-generated text. *International Journal for Educational Integrity*, *19*(17). https://doi.org/10.1007/s40979-023-00140-5

Hans, A., Schwarzschild, A., Cherepanova, V., Kazemi, H., Saha, A., Goldblum, M., Geiping, J., & Goldstein, T. (2024). *Spotting LLMs with Binoculars: Zero-shot detection of machine-generated text* [Preprint]. Proceedings of ICML 2024. https://doi.org/10.48550/arXiv.2401.12070

Hu, X., Chen, P.-Y., & Ho, T.-Y. (2023). *RADAR: Robust AI-text detection via adversarial learning*. Advances in Neural Information Processing Systems (NeurIPS 2023). https://doi.org/10.48550/arXiv.2307.03838

Kirchenbauer, J., Geiping, J., Wen, Y., Katz, J., Miers, I., & Goldstein, T. (2023). A watermark for large language models. *Proceedings of the 40th International Conference on Machine Learning (ICML 2023)*. https://doi.org/10.48550/arXiv.2301.10226

Krishna, K., Song, Y., Karpinska, M., Wieting, J., & Iyyer, M. (2023). Paraphrasing evades detectors of AI-generated text, but retrieval is an effective defense. *Advances in Neural Information Processing Systems (NeurIPS 2023)*, 36.

Liang, W., Yuksekgonul, M., Mao, Y., Wu, E., & Zou, J. (2023). GPT detectors are biased against non-native English writers. *Patterns*, *4*(7). https://doi.org/10.1016/j.patter.2023.100779

Mitchell, E., Lee, Y., Khazatsky, A., Manning, C. D., & Finn, C. (2023). DetectGPT: Zero-shot machine-generated text detection using probability curvature. *Proceedings of the 40th International Conference on Machine Learning (ICML 2023)*. https://doi.org/10.48550/arXiv.2301.11305

Sadasivan, V. S., Kumar, A., Balasubramanian, S., Wang, W., & Feizi, S. (2025). Can AI-generated text be reliably detected? *Transactions on Machine Learning Research*. https://doi.org/10.48550/arXiv.2303.11156

Tufts, B., Zhao, X., & Li, L. (2025). A practical examination of AI-generated text detectors for large language models. *Findings of the Association for Computational Linguistics: NAACL 2025*. https://doi.org/10.18653/v1/2025.findings-naacl.271

Tu, S., Sun, Y., Bai, Y., Yu, J., Hou, L., & Li, J. (2024). WaterBench: Towards holistic evaluation of watermarks for large language models. *Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (ACL 2024)*. https://doi.org/10.18653/v1/2024.acl-long.83

Wang, Y., Mansurov, J., Ivanov, P., et al. (2024). M4: Multi-generator, multi-domain, and multi-lingual black-box machine-generated text detection. *Proceedings of the 18th Conference of the European Chapter of the Association for Computational Linguistics (EACL 2024)*. https://doi.org/10.18653/v1/2024.eacl-long.83

Weber-Wulff, D., Anohina-Naumeca, A., Bjelobaba, S., Foltýnek, T., et al. (2023). Testing of detection tools for AI-generated text. *International Journal for Educational Integrity*, *19*(26). https://doi.org/10.1007/s40979-023-00146-z

Verma, V., Fleisig, E., Tomlin, N., & Klein, D. (2024). Ghostbuster: Detecting text ghostwritten by large language models. *Proceedings of the 2024 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (NAACL 2024)*. https://aclanthology.org/2024.naacl-long.95/

### Naturalność, styl, głos autora, ewaluacja

Barzilay, R., & Lapata, M. (2008). Modeling local coherence: An entity-based approach. *Computational Linguistics*, *34*(1), 1–34. https://doi.org/10.1162/coli.2008.34.1.1

Celikyilmaz, A., Clark, E., & Gao, J. (2020). *Evaluation of text generation: A survey* [Preprint, not peer-reviewed]. arXiv. https://doi.org/10.48550/arXiv.2006.14799

Clark, E., August, T., Serrano, S., Haduong, N., Gururangan, S., & Smith, N. A. (2021). All that's 'human' is not gold: Evaluating human evaluation of generated text. *Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (ACL-IJCNLP 2021)*, 7282–7296. https://doi.org/10.18653/v1/2021.acl-long.565

Gehrmann, S., Strobelt, H., & Rush, A. M. (2019). GLTR: Statistical detection and visualization of generated text. *Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics (ACL 2019)*. https://aclanthology.org/P19-3019/

Howcroft, D. M., Belz, A., Clinciu, M.-A., Gkatzia, D., Hasan, S. A., Mahamood, S., et al. (2020). Twenty years of confusion in human evaluation: NLG needs evaluation sheets and standardised definitions. *Proceedings of the 13th International Conference on Natural Language Generation (INLG 2020)*, 169–182. https://doi.org/10.18653/v1/2020.inlg-1.23

Jakesch, M., Bhat, A., Buschek, D., Zalmanson, L., & Naaman, M. (2023). Co-writing with opinionated language models affects users' views. *Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems (CHI '23)*. https://doi.org/10.1145/3544548.3581196

Jin, D., Jin, Z., Hu, Z., Vechtomova, O., & Mihalcea, R. (2022). Deep learning for text style transfer: A survey. *Computational Linguistics*, *48*(1), 155–205. https://doi.org/10.1162/coli_a_00426

Krishna, K., Wieting, J., & Iyyer, M. (2020). Reformulating unsupervised style transfer as paraphrase generation. *Proceedings of EMNLP 2020*, 737–755. https://doi.org/10.18653/v1/2020.emnlp-main.55

Novikova, J., Dušek, O., Cercas Curry, A., & Rieser, V. (2017). Why we need new evaluation metrics for NLG. *Proceedings of EMNLP 2017*, 2241–2252. https://doi.org/10.18653/v1/D17-1238

Stamatatos, E. (2009). A survey of modern authorship attribution methods. *Journal of the American Society for Information Science and Technology*, *60*(3), 538–556. https://doi.org/10.1002/asi.21001

Zhang, R., Zhao, W., Macken, L., & Eger, S. (2025). *LiTransProQA: Professional evaluation of literary translation quality via question answering* [Preprint, not peer-reviewed]. arXiv. https://doi.org/10.48550/arXiv.2505.05423

Zhong, M., Liu, Y., Yin, D., Mao, Y., Jiao, Y., Liu, P., Zhu, C., Ji, H., & Han, J. (2022). Towards a unified multi-dimensional evaluator for text generation. *Proceedings of EMNLP 2022*, 2023–2038. https://doi.org/10.18653/v1/2022.emnlp-main.131

### Polska norma, uzus i stylistyka (źródła normatywne)

Bańko, M. (2002). *Wykłady z polskiej fleksji*. Wydawnictwo Naukowe PWN. ISBN: 978-83-01-14576-7

Buttler, D., Kurkowska, H., & Satkiewicz, H. (1986). *Kultura języka polskiego: Zagadnienia poprawności gramatycznej* (t. 1). Państwowe Wydawnictwo Naukowe. ISBN: 83-01-06472-2

Gajda, S. (1990). *Współczesna polszczyzna naukowa: Język czy żargon?* Instytut Śląski w Opolu.

Grzegorczykowa, R., Laskowski, R., & Wróbel, H. (Red.). (1998). *Gramatyka współczesnego języka polskiego: Morfologia / Składnia*. Wydawnictwo Naukowe PWN / IJP PAN. ISBN: 83-01-12386-9

Malinowska, E. (2001). *Wypowiedzi administracyjne: Struktura i pragmatyka*. Wydawnictwo Uniwersytetu Opolskiego. ISBN: 83-88796-31-3

Mańczak-Wohlfeld, E. (1995). *Tendencje rozwojowe współczesnych zapożyczeń angielskich w języku polskim*. Wydawnictwo Universitas. ISBN: 978-83-7052-347-3

Markowski, A. (2005). *Kultura języka polskiego: Teoria. Zagadnienia leksykalne*. Wydawnictwo Naukowe PWN. ISBN: 978-83-01-14526-2

Markowski, A. (Red.). (1999). *Nowy słownik poprawnej polszczyzny PWN*. Wydawnictwo Naukowe PWN. ISBN: 978-83-01-13680-2

Nagórko, A. (2007). *Zarys gramatyki polskiej (ze słowotwórstwem)*. Wydawnictwo Naukowe PWN. ISBN: 978-83-01-15390-8

Otwinowska-Kasztelanic, A. (2001). *A study of the lexico-semantic and grammatical influence of English on the Polish of the younger generation of Poles (19-35 years of age)*. Wydawnictwo Akademickie Dialog. ISBN: 83-88238-41-8

Piekot, T., Zarzeczny, G., & Moroń, E. (2019). Standard plain language w polskiej sferze publicznej. W: *Lingwistyka kryminalistyczna: Teoria i praktyka* (s. 197–214). Quaestio / Pracownia Prostej Polszczyzny, Uniwersytet Wrocławski.

Przepiórkowski, A., Bańko, M., Górski, R. L., & Lewandowska-Tomaszczyk, B. (2012). *Narodowy Korpus Języka Polskiego*. Wydawnictwo Naukowe PWN. ISBN: 978-83-01-16700-4. http://nkjp.pl

Rada Języka Polskiego przy Prezydium PAN. (1996–2026). *Uchwały ortograficzne, opinie językowe i komunikaty RJP*. Polska Akademia Nauk. https://rjp.pan.pl

Saloni, Z., & Świdziński, M. (2007). *Składnia współczesnego języka polskiego* (wyd. 4 zm.). Wydawnictwo Naukowe PWN. ISBN: 978-83-01-15289-5

Zdunkiewicz-Jedynak, D. (2008). *Wykłady ze stylistyki*. Wydawnictwo Naukowe PWN. ISBN: 978-83-01-15719-7

Żmigrodzki, P. (Red. nauk.). (2007–2026). *Wielki słownik języka polskiego PAN (WSJP PAN)*. Instytut Języka Polskiego PAN. https://wsjp.pl
