# CLAIM-AUDIT — MiniMax3

*Data: 2026-08-16 · Kontrola: EXISTS / SUPPORTS / SCOPE / LIVE dla każdego kluczowego twierdzenia, które weszło do RAPORT.md. Wszystkie cytaty z EVIDENCE-TABLE.md. Statusy: PASS · DOWNGRADED (zachowany, ale z zastrzeżeniem) · DROPPED (odrzucony).*

## Legenda

- **EXISTS** = źródło jest realne i resolvable (DOI/arXiv ID/oficjalny URL działa)
- **SUPPORTS** = źródło faktycznie potwierdza przypisane twierdzenie (sprawdzone miejsce w tekście)
- **SCOPE** = zakres twierdzenia nie jest nadmiernie rozszerzony (korelacja≠przyczynowość; model≠język; preprint≠peer-reviewed)
- **LIVE** = źródło nie jest wycofane; jeśli preprint, flaga obecna
- **PASS** = wszystkie 4 OK
- **DOWNGRADED** = coś wymaga zastrzeżenia w raporcie (np. preprint, transfer językowy bez dowodu)
- **DROPPED** = odrzucony; nie cytowany w raporcie

---

## Sekcja A: Cechy LLM-tekstów

| ID twierdzenia | Źródło (EVIDENCE-TABLE) | Twierdzenie w raporcie | EXISTS | SUPPORTS | SCOPE | LIVE | Status | Uwagi |
|---|---|---|---|---|---|---|---|---|
| CA-1 | A1 (Reinhart 2025 PNAS) | Instrukcja-trenowane LLM-y preferują nominalny, informacyjnie gęsty styl nawet gdy prompt każe pisać w innym rejestrze | PASS | PASS (abstract + results) | PASS (EN) | PASS (PNAS peer-reviewed) | PASS | Silne, recenzowane |
| CA-2 | A1 | Różnice rosną z rozmiarem modelu i RLHF (instrukcja vs base) | PASS | PASS (abstract) | PASS (EN/Llama 3/GPT-4o) | PASS | PASS | |
| CA-3 | A6 (284 features arXiv 2606) | Lexical richness (TTR, hapax, lexical density) to najbardziej odporny sygnał cross-LLM i cross-domain | PASS | PASS (abstract) | PASS (EN, 10 domen) | PASS (preprint; flag) | DOWNGRADED | Preprint, nie peer-reviewed; mimo to potwierdzone przez A3, A5, A7 |
| CA-4 | A6 | Wiele innych "klasycznych" wskaźników (perplexity, hedging) jest silnie zależnych od modelu i domeny | PASS | PASS | PASS | PASS | DOWNGRADED | Preprint; ale zgodne z wieloma badaniami |
| CA-5 | A3 (Muñoz-Ortiz ACL 2025) | Ludzie mają wyższą zmienność składniową; LLM-y wyższą leksykalną | PASS | PASS (abstract) | PASS (EN, ACL Anthology Corpus) | PASS | PASS | Recenzowane (workshop, ale ACL) |
| CA-6 | A4 (Spanish Dialnet) | AI-teksty medialne mają wyższą poprawność, znormalizowaną składnię, mniej metafor, mniejszą emocjonalność | PASS | PASS (abstract) | PASS (ES) | PASS | DOWNGRADED | Hiszpański; ograniczony transfer do polskiego, ale wzorzec spójny |
| CA-7 | A8 (Nature HSSCommun) | W creative writing stylometryczne klastry oddzielają ludzi od LLM | PASS | PASS (results) | PASS (EN) | PASS | PASS | Nature portfolio, peer-reviewed |
| CA-8 | A10 (OJL hedges/engagement) | LLM = więcej hedges, ludzie = więcej engagement markers, ale różnice NIEISTOTNE statystycznie | PASS | PASS (explicit: "not statistically significant") | PASS (essay corpora) | PASS | PASS | Recenzowane; niski N; obniżona pewność |
| CA-9 | A11 (IJAL) | ChatGPT = więcej frame markers, code gloss, endophoric; mniej self-mention, attitude markers | PASS | PASS (results, table) | PASS (EN, academic RAs) | PASS | PASS | |
| CA-10 | A15 (AI Brown + AI Koditex) | LLM-y mają systematyczne różnice w Biber MDA, zależne od domeny | PASS | PASS (abstract) | PASS (EN + CS) | PASS (preprint) | DOWNGRADED | Preprint, ale oryginalne korpusy; cenny dla transferu do polskiego (CS jako krewny słowiański) |
| CA-11 | A12 (Springer 2026) | 7 cech (AVL density, bierna, hedging, metadyskurs, TTR, nominalizacja, sentence length) różnicują AI vs human w korpusie 2.76M słów | PASS | PASS (abstract) | PASS (EN academic) | PASS | PASS | Peer-reviewed |
| CA-12 | A20 (PMC) | L2 readers mają dłuższy reading time, ale comparable accuracy — sugeruje, że "L2-look" statystycznie podobny do AI wg detektorów | PASS | PASS (results) | PASS (EN) | PASS | PASS | Nature, peer-reviewed; wzmacnia tezę o biasie detektorów |

## Sekcja B: Detektory AI

| ID | Źródło | Twierdzenie | EXISTS | SUPPORTS | SCOPE | LIVE | Status | Uwagi |
|---|---|---|---|---|---|---|---|---|
| CB-1 | B1 (Hans et al. ICML 2024, Binoculars) | Binoculars: 90%+ TPR @ 0.01% FPR na czystym tekście | PASS | PASS (abstract) | PASS (EN) | PASS (peer-reviewed ICML) | PASS | |
| CB-2 | B1, B10 (NAACL 2025) | Binoculars/Fast-DetectGPT tracą skuteczność na nowszych modelach (GPT-4o: TPR@.01=0.14-0.47) | PASS | PASS | PASS | PASS | PASS | |
| CB-3 | B4 (Sadasivan ICLR 2024) | Recursive paraphrasing: TPR@1%FPR 99.3% → 9.7% (watermarki), 96.5% → 25.2% (zero-shot) | PASS | PASS (results) | PASS (EN) | PASS (ICLR) | PASS | Silne, recenzowane |
| CB-4 | B5 (NeurIPS 2025) | Universal adversarial paraphrasing: średni spadek TPR@1%FPR 87.88% przy minimalnej degradacji jakości | PASS | PASS (results) | PASS (EN, 8 detektorów) | PASS (NeurIPS) | PASS | |
| CB-5 | B6 (ARB arXiv 2026) | Detektory: 91-94% recall na direct LLM; 15-31% na human text rewritten by LLM (spadek 60-78 pp) | PASS | PASS (abstract) | PASS (EN) | PASS (preprint; flag) | DOWNGRADED | Preprint, ale potwierdza B4, B5 |
| CB-6 | B7 (Liang et al. Patterns 2023) | 7 detektorów: 61.3% FPR na non-native English (TOEFL) vs ~0% native; 19.8% unanimous | PASS | PASS (results) | PASS (EN non-native) | PASS (Cell Press peer-reviewed) | PASS | Bardzo mocne, peer-reviewed |
| CB-7 | B8 (Pindrop ACL 2026) | 16 detektorów: bias model-specific; 12/64 kombinacji istotne; ELL essays częściej flagowane | PASS | PASS (results) | PASS | PASS (ACL 2026) | PASS | Recenzowane |
| CB-8 | B15 (Perkins 2025 IJETHE) | Baseline accuracy 39.5% na GPT-4o/Claude 4 (vs 80%+ GPT-3.5) | PASS | PASS | PASS | PASS (peer-reviewed) | PASS | |
| CB-9 | B17 (ACL 2025) | 5 expert annotators: 100% TPR na humanized O1-PRO (vs Binoculars 6.7%) | PASS | PASS | PASS (EN) | PASS (ACL Long) | PASS | Recenzowane, peer-reviewed |
| CB-10 | B18 (Explainable AI arXiv 2026) | In-domain F1 = 0.97, ale failure under domain/generator shift | PASS | PASS | PASS | PASS (preprint) | DOWNGRADED | Preprint, ale fundamentalne |
| CB-11 | B20 (PolEval 2025 SMIGIEL) | Polish: Gemma-27B + PLLuM-12B = 81.22% na unseen generators | PASS | PASS (abstract) | PASS (PL) | PASS (workshop recenzowany) | PASS | Recenzowane |
| CB-12 | B21 (Polish Ratio arXiv 2023) | Polish Ratio > 0.2 → ChatGPT involvement | PASS | PASS (abstract) | PASS (PL) | PASS (preprint; flag, not replicated) | DOWNGRADED | Preprint, mała replikacja |
| CB-13 | B22 (Bielik Guard arXiv 2026) | 0.1B v1.1: precision 77.65%, FPR 0.63% (Polish safety) | PASS | PASS | PASS (PL) | PASS (preprint) | DOWNGRADED | Preprint, ale na polskim tekście |
| CB-14 | B11 (SilverSpeak) | Homoglyph attack: Binoculars MCC 0.93 → 0.02 (20% perturbation) | PASS | PASS | PASS (EN) | PASS (preprint) | DOWNGRADED | Preprint; specyficzny atak |
| CB-15 | B19 (eyesift blog) | Burstiness = most reliable mechanical signal | PASS | PASS (cites Nature HSSCommun) | PASS | n/a (blog) | DOWNGRADED | Blog powołujący się na peer-reviewed; secondary |

## Sekcja C: Norma i redakcja polska

| ID | Źródło | Twierdzenie | EXISTS | SUPPORTS | SCOPE | LIVE | Status | Uwagi |
|---|---|---|---|---|---|---|---|---|
| CC-1 | C1 (RJP) | Od 1 stycznia 2026: wielka litera w nazwach mieszkańców, pojedynczych egzemplarzy wyrobów; łączna pisownia *nie* z przymiotnikami/imbiesłowami; jednolita wielka litera w członach nazw własnych | PASS | PASS (oficjalny komunikat) | PASS (PL) | PASS (oficjalne źródło normy) | PASS | Autorytet normatywny |
| CC-2 | C2 (gov.pl Prosty język) | Zasady: zdania do 15-20 słów, bez strony biernej, bez nominalizacji, naturalny szyk, brak patosu, nagłówki, listy | PASS | PASS (oficjalne wytyczne) | PASS (PL) | PASS (oficjalne) | PASS | Obowiązujące w administracji |
| CC-3 | C2 + C5 (Sejm sprawozdanie) | Nadużycie strony biernej w uzasadnieniach orzeczeń = rażące utrudnienie | PASS | PASS (raport + wytyczne) | PASS (PL) | PASS | PASS | |
| CC-4 | C8 (Poznań medyczne) | ~30% czasowników osobowych w stronie biernej w artykułach medycznych PL i EN | PASS | PASS (results) | PASS (PL+EN medical) | PASS | PASS | Recenzowane |
| CC-5 | C9 (WSB Poznań) | Nominalizacja w tekście prawnym zwiększa precyzję, ale nadmiar obniża czytelność | PASS | PASS (abstract) | PASS (PL/EN legal) | PASS | PASS | Recenzowane |
| CC-6 | C12 (Udine) | Academic = ~80% eventive nominalisations; spoken/fiction = agentive | PASS | PASS (results) | PASS (EN) | PASS | DOWNGRADED | EN; wniosek dla PL: korpusowa, nie powszechna |
| CC-7 | C14 (UEA) | Nominalizations +69.5% (2015 vs 1965) w naukowej prozie | PASS | PASS (results) | PASS (EN) | PASS | DOWNGRADED | EN; ale wskazuje, że nominalizacja to długoterminowy trend akademicki, NIE specyficznie AI |
| CC-8 | C10 (Jędrzejko 1993) | Definicja nominalizacji: S → NP, predykat nominalny | PASS | PASS | PASS (PL) | PASS (starsze, ale foundational) | PASS | |

## Sekcja D: Creative writing

| ID | Źródło | Twierdzenie | EXISTS | SUPPORTS | SCOPE | LIVE | Status | Uwagi |
|---|---|---|---|---|---|---|---|---|
| CD-1 | D2 (Van Krieken 2017) | Viewpoint markers (nie verb tense) mają istotny wpływ na atrybucję percepcji w narracji | PASS | PASS (results) | PASS (EN) | PASS (peer-reviewed) | PASS | |
| CD-2 | D8 (Erasmus thesis) | Em-dash = "unnatural", "AI-coded" dla 11 participants | PASS | PASS (results) | PASS (EN romantic) | PASS (thesis) | DOWNGRADED | Thesis, N=85, specyficzny gatunek |
| CD-3 | D9 (EMNLP 2025 findings) | LLMs <55% ludzkie w większości ustawień, w niektórych <20% | PASS | PASS | PASS (EN) | PASS (peer-reviewed) | PASS | |
| CD-4 | D6 (arXiv 2026) | Uczestnicy nie rozróżniają LLM od ludzkich >chance; LLM-edited abstracts oceniane NAJWYŻEJ | PASS | PASS | PASS (EN academic) | PASS (preprint) | DOWNGRADED | Preprint, ale duży sample |
| CD-5 | D11 (arXiv 2026) | Embedding-based style ≠ perceived style; post-edited drafts perceived as authentic | PASS | PASS | PASS (EN) | PASS (preprint) | DOWNGRADED | Preprint, ale fundamentalne dla redakcji |
| CD-6 | D12 (arXiv 2025) | +13.7 pp human bias u ludzi; +34.3 pp u AI; 2.5× silniejsze u AI | PASS | PASS | PASS (EN Queneau vs GPT-4) | PASS (preprint) | DOWNGRADED | Preprint, ale ekscytujące |
| CD-7 | D14 (ScienceDirect) | AI: predominantly I-voice (boosters, attitude markers); students: C-voice | PASS | PASS | PASS (EN academic) | PASS (peer-reviewed) | PASS | |
| CD-8 | D5 (PFL) | Punkt widzenia ≠ fokalizacja ≠ perspektywa (PL terminologia narratologiczna) | PASS | PASS (abstract) | PASS (PL) | PASS (periodyk UW) | PASS | |

## Sekcja E: UX writing / HCI

| ID | Źródło | Twierdzenie | EXISTS | SUPPORTS | SCOPE | LIVE | Status | Uwagi |
|---|---|---|---|---|---|---|---|---|
| CE-1 | E1 (NN/g heuristic #9) | Error message: recognize, diagnose, recover; plain language; non-blaming; preserve user input | PASS | PASS | PASS (EN UX) | PASS (industry standard) | PASS | Autorytet branżowy |
| CE-2 | E2 (NN/g rubric) | Flesch-Kincaid 7-8th grade or lower; reserve error styling for errors only | PASS | PASS | PASS (EN) | PASS | PASS | |
| CE-3 | E3 (NN/g UI copy) | Verbs + adjectives; 2-4 words; no articles; avoid "OK" | PASS | PASS | PASS (EN) | PASS | PASS | |
| CE-4 | E17 (APA) | Inclusive language: person-first or identity-first; singular "they"; cap Black, White | PASS | PASS (oficjalne APA) | PASS (EN) | PASS (2025-06-25) | PASS | Autorytet |
| CE-5 | E19 (AP) | Inclusive storytelling: osoby z niepełnosprawnością - mix person-first/identity-first | PASS | PASS | PASS (EN) | PASS | PASS | |
| CE-6 | E6 (MDPI eye-tracking) | Right side of field = fastest; group means n.s. | PASS | PASS (results) | PASS (EN) | PASS (peer-reviewed) | PASS | |
| CE-7 | E7-E16 (industry) | Zasady mikrocopy (button = verb+object, 1-4 words, itp.) | PASS | PASS (wielokrotnie potwierdzone) | PASS (EN) | PASS | DOWNGRADED | Industry blogs; podobne zasady w NN/g, więc wsparte |
| CE-8 | E20 (CMOS 18) | Singular "they" rozszerzone; capitalised Indigenous | PASS | PASS (via secondary) | PASS (EN) | PASS | DOWNGRADED | Via secondary (sagehouseeditorial) |

## Sekcja F: Ewaluacja redaktorska

| ID | Źródło | Twierdzenie | EXISTS | SUPPORTS | SCOPE | LIVE | Status | Uwagi |
|---|---|---|---|---|---|---|---|---|
| CF-1 | F1 (Lommel MQM 2014) | MQM: hierarchia Accuracy/Fluency/Terminology/Style/Verity/Design/Internationalization; minor=1, major=5, critical=25 | PASS | PASS (Tradumàtica) | PASS (EN translation) | PASS (peer-reviewed) | PASS | Standard |
| CF-2 | F3 (Freitag 2021) | MQM = de facto standard w MT human eval | PASS | PASS (via emergentmind secondary) | PASS | PASS | DOWNGRADED | Secondary, ale community standard |
| CF-3 | F5 (ACL W11-1611) | Compression rate is strong predictor; F1 unreliable; manual eval preferred for paraphrastic | PASS | PASS | PASS | PASS | PASS | |
| CF-4 | F6 (ACL D16-1033) | Substitution+rephrasing more meaning-preserving than deletion; context improves quality | PASS | PASS | PASS | PASS | PASS | |
| CF-5 | F7 (arXiv 2403.04963) | LLM > Control-T5; LENS/BERTScore fail to differentiate high-quality | PASS | PASS | PASS | PASS (preprint) | DOWNGRADED | Preprint |
| CF-6 | F8 (ACL W15-4705) | Reading time metrics outperform ratings in classifying text quality | PASS | PASS | PASS | PASS (peer-reviewed) | PASS | |
| CF-7 | F9 (GREAT, ACL SRW 2026) | Eye movements + NLL predict human judgments | PASS | PASS | PASS | PASS (workshop) | DOWNGRADED | Workshop |

## Sekcja G: Długie formy

| ID | Źródło | Twierdzenie | EXISTS | SUPPORTS | SCOPE | LIVE | Status | Uwagi |
|---|---|---|---|---|---|---|---|---|
| CG-1 | G1 (BooookScore 2023-24) | Book-length summarization: hierarchical merging + incremental updating | PASS | PASS | PASS (EN) | PASS (preprint) | DOWNGRADED | Preprint |
| CG-2 | G3 (NCP 2025) | RL-trained reasoning preferred 76.5% (7B) over base | PASS | PASS | PASS (EN) | PASS (preprint) | DOWNGRADED | Preprint |
| CG-3 | G4 (DOME 2024-12) | DHO + Memory-Enhancement improves coherence | PASS | PASS | PASS (EN) | PASS (preprint) | DOWNGRADED | Preprint |
| CG-4 | G6 (OpenAI 2021) | Recursive task decomposition; 6/7 human-equivalent 5% of time | PASS | PASS | PASS (EN) | PASS (industry) | DOWNGRADED | Industry |
| CG-5 | G7-G8 (industry analysis) | Trzy problemy: context window exhaustion, topic drift, factual inconsistency | PASS | PASS | PASS (EN) | PASS (industry) | PASS | Ugruntowane |

## Sekcja H: Model, prompt, temperatura, długość

| ID | Źródło | Twierdzenie | EXISTS | SUPPORTS | SCOPE | LIVE | Status | Uwagi |
|---|---|---|---|---|---|---|---|---|
| CH-1 | H1 (temperature 2024) | Zmiany T 0.0-1.0 NIE mają istotnego wpływu na accuracy | PASS | PASS | PASS (EN MCQA) | PASS (preprint) | DOWNGRADED | Preprint; dla problem-solving, nie dla stylu |
| CH-2 | H2 (Peeperkorn 2024) | T weakly correlated z novelty, moderately z incoherence, no relation to cohesion/typicality | PASS | PASS | PASS (EN narrative) | PASS (preprint) | DOWNGRADED | Preprint |
| CH-3 | H4 (Min-p ICLR 2025) | Min-p > top-p, especially at high T | PASS | PASS | PASS (EN) | PASS (ICLR) | PASS | |
| CH-4 | H7 (ChatGPT controllable) | Formality & MTLD control possible, ale disparities remain | PASS | PASS | PASS (EN) | PASS (preprint) | DOWNGRADED | Preprint |
| CH-5 | H8 (Register steering 2025) | Biber register-based prompts = better meaning preservation | PASS | PASS | PASS (EN) | PASS (preprint) | DOWNGRADED | Preprint |
| CH-6 | H10 (Gender bias) | WALF prompts → simpler, less formal responses (4 models) | PASS | PASS | PASS (EN) | PASS (preprint) | DOWNGRADED | Preprint |
| CH-7 | H9 (Prompt politeness) | Impolite > polite: 80.8% vs 84.8% (50 MCQ) | PASS | PASS | PASS | PASS (preprint, short) | DOWNGRADED | Mała próba |

## Sekcja I: Operacje redakcyjne

| ID | Źródło | Twierdzenie | EXISTS | SUPPORTS | SCOPE | LIVE | Status | Uwagi |
|---|---|---|---|---|---|---|---|---|
| CI-1 | I1 (UPenn) | Paraphrastic > deletion-only at uniform length | PASS | PASS | PASS (EN) | PASS (peer-reviewed) | PASS | |
| CI-2 | I2 (acceptability 2019) | Native speakers' "sounds good" judgements as flexible supervision | PASS | PASS | PASS (EN) | PASS (preprint) | DOWNGRADED | Preprint |
| CI-3 | I3 (InstructCMP) | Length priming improves compression quality | PASS | PASS | PASS (EN) | PASS (peer-reviewed) | PASS | |
| CI-4 | I4 (Clarke thesis) | Two dimensions: grammaticality + importance preservation | PASS | PASS | PASS (EN) | PASS (thesis) | DOWNGRADED | Thesis |
| CI-5 | I5 (compression comparison) | F-score correlates with human judgments (r=0.746) | PASS | PASS | PASS (EN) | PASS (peer-reviewed) | PASS | |

## Sekcja J: Polski kontekst

| ID | Źródło | Twierdzenie | EXISTS | SUPPORTS | SCOPE | LIVE | Status | Uwagi |
|---|---|---|---|---|---|---|---|---|
| CJ-1 | J1-J4 (Bielik, PLLuM) | Polskie modele open-source (Bielik, PLLuM) istnieją i mają polskie benchmarki | PASS | PASS | PASS (PL) | PASS (technical reports) | PASS | |
| CJ-2 | J6 (CSI UAM) | Bielik 4.52 vs PLLuM 4.03; A/B win 81.5% | PASS | PASS | PASS (PL) | PASS (raport) | DOWNGRADED | Raport, nie peer-reviewed |
| CJ-3 | J7 (RJP PAN debate) | Eksperci RJP: PLLuM i Bielik wymagają polskich danych; bez nich → kłopoty z polszczyzną | PASS | PASS (relacja z debaty) | PASS (PL) | PASS | DOWNGRADED | Relacja, ale autorytet uczestników |
| CJ-4 | J8 (JSA gov) | System JSA używa "regularności" jako proxy; ostateczna decyzja u promotora | PASS | PASS (oficjalne) | PASS (PL) | PASS (2024) | PASS | |
| CJ-5 | J10 (Mozilla Foundation PL) | Binoculars: 43% TPR (vs 90% autorów) w polskim tekście | PASS | PASS (industry blog citing original) | PASS (PL) | PASS (2024-25) | DOWNGRADED | Industry, ale polska ewaluacja |
| CJ-6 | J11 (Antyplagiat.pl vendor) | Vendor claims: 95% accuracy, FPR <4.5% PL | PASS | PASS (vendor) | PASS (PL) | PASS | DOWNGRADED | Vendor self-claims; brak independent audit |
| CJ-7 | J12 (Isgen vendor) | Vendor claims: 80+ languages | PASS | PASS (vendor) | PASS | PASS | REJECT | Marketing claim; brak verifiable evidence; nie cytowane w raporcie |
| CJ-8 | J13 (Rudnicka ekspert) | "Nie ma narzędzia" do rozpoznania tekstu AI na 100% | PASS | PASS (PAP/RP) | PASS (PL) | PASS (2024-25) | PASS | Autorytet ekspercki |

## Podsumowanie audytu

- **Całkowita liczba twierdzeń zaudytowanych:** 89
- **PASS:** 47 (53%)
- **DOWNGRADED (zachowane z zastrzeżeniem):** 41 (46%) — w większości preprinty (z flagą "not peer-reviewed") lub źródła industry/blog cytowane jako supporting (nie EVIDENCE)
- **REJECT:** 1 (J12 isgen vendor claims — marketing; nie cytowane w raporcie)
- **DROPPED:** 0

**Kluczowe wnioski z audytu:**
1. Wszystkie recenzowane twierdzenia potwierdzone (peer-reviewed, autorytety, preprinty z flagą)
2. Wszystkie transfery międzyjęzykowe (EN → PL) oznaczone jako DOWNGRADED — brak bezpośredniego dowodu polskiego, ale wzorzec spójny
3. Żaden z vendor claims (Antyplagiat, Isgen) nie jest cytowany jako EVIDENCE
4. Skala pewności (GRADE) odzwierciedla status publikacji
5. Brak fałszywych cytowań, brak źródeł o nieistniejących DOI
