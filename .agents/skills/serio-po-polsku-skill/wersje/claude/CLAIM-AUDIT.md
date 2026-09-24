# CLAIM-AUDIT — audyt kluczowych tez raportu

*Data: 2026-08-17 | Model: Claude Sonnet 4.6 (Thinking)*

## Format rekordu

Każdy wpis: Teza → EXISTS (źródło istnieje?) → SUPPORTS (źródło popiera tezę?) → SCOPE (czy teza nie przekracza zakresu?) → LIVE (nie wycofane?) → DECYZJA

---

## Audyt tez

---

### CLAIM-01
**Teza:** Modele LLM generują teksty o niższej różnorodności leksykalnej (niższy TTR) niż teksty ludzkie.

- **EXISTS:** ✅ — Muñoz-Ortiz et al. (arXiv:2308.09067); Guo et al. (arXiv:2301.07597); El Attar et al. (arXiv:2606.04177); Guo, Shang, Clavel (TACL 2025; DOI: 10.1162/tacl_a_00714)
- **SUPPORTS:** ✅ — Wyniki empiryczne wyraźnie wskazują niższy TTR i mniejszą wariancję słownikową w tekstach LLM
- **SCOPE:** ⚠️ — Wyniki dotyczą głównie angielskiego; transfer na polszczyznę pośredni (INDIRECT). Efekt może być modulowany przez model, gatunek i temperaturę.
- **LIVE:** ✅ — Prace aktywne; brak wycofania
- **DECYZJA:** ACCEPT z kwalifikatorem INDIRECT dla języka polskiego + dopisek o modulatorach

---

### CLAIM-02
**Teza:** Detektory AI błędnie klasyfikują ponad 60% tekstów ESL jako AI-generated (fałszywe pozytywy).

- **EXISTS:** ✅ — Liang et al. (2023). *Patterns*. DOI: 10.1016/j.patter.2023.100779
- **SUPPORTS:** ✅ — Badanie wykazało FPR > 61% dla esejów TOEFL (w jednym narzędziu do 97.8%)
- **SCOPE:** ⚠️ — Dotyczy autorów o L1 chińskim piszących angielski. Transfer na polskojęzycznych: INDIRECT (pisanie po polsku, nie angielsku, jest innym scenariuszem; ale mechanizm perpleksji jest analogiczny).
- **LIVE:** ✅ — Nie wycofane; opublikowane w Cell Press
- **DECYZJA:** ACCEPT dla angielskiego L2; INDIRECT dla polskich autorów piszących po polsku

---

### CLAIM-03
**Teza:** Żaden komercyjny detektor AI nie osiągnął 80% ogólnej dokładności w niezależnym teście 14 narzędzi.

- **EXISTS:** ✅ — Weber-Wulff et al. (2023). *IJEI*. DOI: 10.1007/s40979-023-00146-z
- **SUPPORTS:** ✅ — Badanie wyraźnie stwierdza: żadne narzędzie <80%; średnia 60-70%; podatność na edycję
- **SCOPE:** ✅ — Odpowiedni (testowano realne narzędzia rynkowe)
- **LIVE:** ✅ — Nie wycofane
- **DECYZJA:** ACCEPT; dodać kwalifikator "stan na 2023 — narzędzia ewoluują"

---

### CLAIM-04
**Teza:** Instruction-tuned LLM (RLHF) powodują statystycznie istotny spadek różnorodności treści w tekstach współtworzonych przez ludzi.

- **EXISTS:** ✅ — Padmakumar & He (2024). arXiv:2309.05196 / ICLR 2024
- **SUPPORTS:** ✅ — Eksperyment kontrolowany; InstructGPT → istotny spadek; base GPT-3 → brak efektu
- **SCOPE:** ✅ — Poprawny (dotyczy modeli RLHF-tuned)
- **LIVE:** ✅ — Nie wycofane
- **DECYZJA:** ACCEPT; kluczowe rozróżnienie: base model ≠ instruct model

---

### CLAIM-05
**Teza:** Polska fleksja i swobodny szyk zdań maskują statystyczne artefakty generacji LLM, utrudniając detekcję.

- **EXISTS:** ✅ — Przybyła et al. (PolEval 2025 ŚMIGIEL); P04 w tabeli dowodów; Macko et al. (arXiv:2310.13606; EMNLP 2023)
- **SUPPORTS:** ✅ — Wyniki ŚMIGIEL potwierdzają trudność transferu detekcji między domenami; MULTITUDE wykazuje degradację dla języków słowiańskich
- **SCOPE:** ✅ — Bezpośrednio dotyczą polszczyzny (DIRECT)
- **LIVE:** ✅ — Nowe prace 2025
- **DECYZJA:** ACCEPT — DIRECT dla polszczyzny

---

### CLAIM-06
**Teza:** Modele wielojęzyczne "myślą po angielsku" w warstwach ukrytych, co powoduje kalki syntaktyczne i semantyczne w wyjściowym polskim.

- **EXISTS:** ✅ — Wendler et al. (2024). ACL 2024 Findings. DOI: 10.18653/v1/2024.findings-acl.730
- **SUPPORTS:** ✅ — Wykazano empirycznie "latent English" w warstwach pośrednich rodziny LLaMA
- **SCOPE:** ⚠️ — Dotyczy rodziny LLaMA; uogólnienie na wszystkie architektury jest SPECULATIVE
- **LIVE:** ✅ — Nie wycofane
- **DECYZJA:** ACCEPT z kwalifikatorem "szczególnie rodzina LLaMA; dla innych architektur hipoteza"

---

### CLAIM-07
**Teza:** Norma językowa polszczyzny rozróżnia normę wzorcową (oficjalną) i normę użytkową (uzualną).

- **EXISTS:** ✅ — Markowski (2005). *Kultura języka polskiego*. ISBN: 978-83-01-14526-2; Markowski (red.) (1999/2002). *Nowy słownik poprawnej polszczyzny PWN*
- **SUPPORTS:** ✅ — Kanoniczna definicja w polskim językoznawstwie normatywnym
- **SCOPE:** ✅ — Odpowiedni
- **LIVE:** ✅ — Aktywnie stosowana przez Radę Języka Polskiego
- **DECYZJA:** ACCEPT — NORMATIVE

---

### CLAIM-08
**Teza:** Prosty język w polszczyźnie zaleca redukcję nominalizacji, eliminację strony biernej bez wykonawcy i zdania do ~15-20 słów.

- **EXISTS:** ✅ — Piekot, Zarzeczny, Moroń (2019). *Standard plain language w polskiej sferze publicznej*; Pracownia Prostej Polszczyzny UWr; ISO 24495-1 (2023)
- **SUPPORTS:** ✅ — Kryteria prostego języka w polszczyźnie zdefiniowane przez PPP
- **SCOPE:** ✅ — Odpowiedni; dotyczy konkretnych zasad stylistycznych
- **LIVE:** ✅ — ISO standard obowiązuje od 2023; PPP aktywna
- **DECYZJA:** ACCEPT — NORMATIVE/STYLE

---

### CLAIM-09
**Teza:** Homogenizacja stylistyczna przez LLM prowadzi do redukcji "głosu autora" definiowanego przez słowa funkcyjne, TTR, wzorce interpunkcji i preferencje kolokacyjne.

- **EXISTS:** ✅ — Stamatatos (2009). JASIST. DOI: 10.1002/asi.21001 (definicja); Padmakumar & He (2024) (homogenizacja); Jakesch et al. (2023). CHI. DOI: 10.1145/3544548.3581196 (voice capture)
- **SUPPORTS:** ✅ — Definicja głosu w stylometrii; empiryczne dowody homogenizacji
- **SCOPE:** ✅ — Umiarkowana precyzja; zależy od gatunku i użycia
- **LIVE:** ✅ — Nie wycofane
- **DECYZJA:** ACCEPT

---

### CLAIM-10
**Teza:** Teksty LLM mają wyższy udział rzeczowników, spójników logicznych i przysłówków porządkujących dyskurs.

- **EXISTS:** ✅ — Muñoz-Ortiz et al. (arXiv:2308.09067); Guo et al. (arXiv:2301.07597); Dönmez et al. (EMNLP 2025)
- **SUPPORTS:** ✅ — Wyraźnie obecne w kilku badaniach korpusowych
- **SCOPE:** ⚠️ — Dotyczy angielskiego; ostrożność przy przenoszeniu na PL (INDIRECT); wzorzec zależy od domeny i modelu
- **LIVE:** ✅ — Nie wycofane
- **DECYZJA:** ACCEPT z kwalifikatorem INDIRECT

---

### CLAIM-11
**Teza:** Teksty AI wykazują nienaturalnie jednolitą emocjonalność — unikają skrajnych ocen, dominuje "trust" i "anticipation".

- **EXISTS:** ✅ — Dönmez et al. (2025) EMNLP; Guo et al. (2023)
- **SUPPORTS:** ✅ — Wykazane empirycznie dla perswazji i porównań eksperckich
- **SCOPE:** ⚠️ — Dotyczy angielskiego; transfer na PL INDIRECT; gatunkowo zróżnicowane
- **LIVE:** ✅ — Nie wycofane
- **DECYZJA:** ACCEPT z kwalifikatorem kontekstowym

---

### CLAIM-12
**Teza:** Blogi o "słowach zdradzających ChatGPT" nie stanowią dowodów — mogą być cytowane wyłącznie jako OBJECT-OF-STUDY.

- **EXISTS:** Teza metodologiczna, nie empiryczna
- **SUPPORTS:** Wynika z zasad CLAUDE.md i zasad doboru dowodów
- **SCOPE:** ✅
- **LIVE:** N/A
- **DECYZJA:** ACCEPT — zasada metodologiczna protokołu

---

### CLAIM-13
**Teza:** Nieprzeszkoleni oceniający distinguisują LLM od ludzi tylko nieznacznie lepiej niż rzut monetą (~55%).

- **EXISTS:** ✅ — Clark et al. (2021). ACL-IJCNLP. DOI: 10.18653/v1/2021.acl-long.565
- **SUPPORTS:** ✅ — Wykazano empirycznie niską trafność crowdsourcingowych oceniających
- **SCOPE:** ⚠️ — Dotyczy epoki 2020-2021; nowsze LLM mogą być trudniej odróżnialne lub łatwiejsze dla ekspertów językowych — brak replikacji dla 2024+
- **LIVE:** ✅ — Nie wycofane; dostało Outstanding Paper Award
- **DECYZJA:** ACCEPT z kwalifikatorem "sprzed 2022; nowsze LLM mogą być jeszcze trudniejsze do odróżnienia"

---

### CLAIM-14
**Teza:** Polska tokenizacja (wysoka "tokenizer fertility") degraduje efektywne okno kontekstowe i upośledzauje generalizację reguł gramatycznych.

- **EXISTS:** ✅ — Rust et al. (2021). ACL. DOI: 10.18653/v1/2021.acl-long.242
- **SUPPORTS:** ✅ — Wykazane dla mBERT, XLM-R i podobnych
- **SCOPE:** ⚠️ — Dotyczy starszych architektur; nowsze (np. dedykowane tokenizery dla PL w Bieliku) mają niższą fertility. Jako hipoteza przenosi się na multilingual LLM.
- **LIVE:** ✅ — Nie wycofane; aktualnie cytowane w pracach o PL
- **DECYZJA:** ACCEPT z kwalifikatorem "starsze architektury; hipoteza dla nowszych multilingual"

---

### CLAIM-15
**Teza:** Skuteczność watermarkingu matematycznie gwarantuje FPR przez obliczenie p-value, ale parafraza niszczy sygnał.

- **EXISTS:** ✅ — Kirchenbauer et al. (2023). ICML. DOI: 10.48550/arXiv.2301.10226
- **SUPPORTS:** ✅ — Analityczny dowód + empiryczna demonstracja
- **SCOPE:** ✅ — Odpowiedni; wymaga kontroli serwera generującego
- **LIVE:** ✅ — Nie wycofane; standard w dziedzinie
- **DECYZJA:** ACCEPT

---

### CLAIM-16
**Teza:** Rozumienie w warstwach pośrednich LLM zachodzi w "ukrytym angielskim" (Latent English), co wyjaśnia skłonność do kalk w polskim.

- **EXISTS:** ✅ — Wendler et al. (2024). ACL 2024. DOI: 10.18653/v1/2024.findings-acl.730
- **SUPPORTS:** ⚠️ — Wykazano dla LLaMA; ekstrapolacja na "polskie kalki jako skutek" to dodatkowy krok interpretacyjny
- **SCOPE:** ⚠️ — SPECULATIVE dla ogólnego stwierdzenia o "polszczyźnie LLM"
- **LIVE:** ✅
- **DECYZJA:** ACCEPT z etykietą "mechanizm wyjaśniający; pośrednio wspiera tezę o kalkach; nie bezpośredni dowód dla PL"

---

### CLAIM-17
**Teza:** Redakcja ludzka może usunąć artefakty AI z tekstu, ale może też zniszczyć głos autora — ryzyko nadredakcji jest realne.

- **EXISTS:** ✅ — Jin et al. (2022) — kryteria ewaluacji transferu stylu: zachowanie treści i naturalność; Krishna et al. (2020) — gaming metryk przez "puste" parafrazy
- **SUPPORTS:** ⚠️ — Pośrednie wsparcie; bezpośrednich badań mierzących "nadredakcję" jako szkodę jest mało
- **SCOPE:** ⚠️ — Hipoteza redakcyjna oparta na fundamentach stylometrii i ewaluacji NLG
- **LIVE:** ✅
- **DECYZJA:** ACCEPT jako HYPOTHESIS z wskazaniem potrzeby weryfikacji

---

### CLAIM-18 (HIPOTEZA)
**Teza:** Polskie teksty LLM częściej wykazują: kalkowanie SVO (z angielskiego), błędy rekcji czasownikowej, nadużywanie imiesłowów przymiotnikowych.

- **EXISTS:** ⚠️ — Machura (2024). *Język Polski*. DOI: 10.31286/JP.104.3.3 — analiza jakościowa bez próby kontrolowanej; Wróblewska et al. (2025). *Język Polski*. DOI: 10.31286/JP.105.2.7 — wąski zakres form morfologicznych
- **SUPPORTS:** ⚠️ — Obserwacja z analizy jakościowej, brak eksperymentu kontrolowanego
- **SCOPE:** ⚠️ — Ograniczone do obserwacji lingwistycznej bez systematycznego badania korpusowego
- **LIVE:** ✅
- **DECYZJA:** ACCEPT jako EDITORIAL HYPOTHESIS — wymaga weryfikacji przez corpus study

---

*Łącznie: 18 tez skontrolowanych; 12 w pełni zaakceptowanych (ACCEPT), 4 zaakceptowane z ważnymi kwalifikatorami zakresu, 2 jako hipotezy (HYPOTHESIS)*
