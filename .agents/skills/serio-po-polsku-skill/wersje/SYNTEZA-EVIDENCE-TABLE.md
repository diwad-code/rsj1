# SYNTEZA-EVIDENCE-TABLE — atomiczne tezy, dowody, transfer i werdykty

*Data: 2026-08-29 · Wejścia: pięć kompletnych pakietów (`cc_deepseek`, `claude`, `codex`, `gemini`, `minimax3`) + własna weryfikacja (`SYNTEZA-SEARCHLOG.yaml`)*

## Jak czytać tę tabelę

- **Teza** jest atomiczna: jedno zdanie, jedno twierdzenie, jeden zakres.
- **Źródło** to publikacja pierwotna, przegląd, korpus albo autorytet normatywny — **nigdy raport modelu**.
- **Lokalizator** wskazuje część źródła, którą faktycznie widziałem. Poziom dostępu oznaczam jawnie:
  `FULLTEXT` / `ABSTRAKT` / `METADATA-ONLY` / `STRONA-INSTYTUCJI`.
- **PL** to status dla polszczyzny: `DIRECT` (dane polskie), `SLAVIC` (język słowiański, nie polski),
  `INDIRECT` (transfer międzyjęzykowy), `NONE` (brak podstaw do transferu).
- **Modele** to informacja, które pakiety zgłosiły tezę — **jest to metadana procesu, nie waga dowodu**.
- **Werdykt**: `ACCEPT-HIGH` / `ACCEPT-CONDITIONAL` / `HEURISTIC` / `RESEARCH-ONLY` / `REJECT`.

> **Zasada nadrzędna tabeli:** liczba modeli zgłaszających tezę nie podnosi jej jakości.
> Tam, gdzie pięć pakietów opiera się na jednym artykule, w kolumnie „Niezależność” stoi `1 ŹRÓDŁO`.

---

## A. Detektory tekstu AI i granice wnioskowania o autorstwie

| ID | Teza (atomiczna) | Źródło | Lokalizator / dostęp | PL | Niezależność | Modele | Dowody przeciwne | Werdykt · pewność |
|---|---|---|---|---|---|---|---|---|
| S-D01 | Żadne z 14 testowanych narzędzi do wykrywania tekstu AI nie osiągnęło progu wiarygodności pozwalającego rozstrzygać o autorstwie; narzędzia są podatne na edycję tekstu. | Weber-Wulff et al. (2023), *IJEI* 19(1), 26 | abstrakt + opis metodologii 54 przypadków / 756 testów · ABSTRAKT | INDIRECT | 3 niezależne linie (Weber-Wulff, Sadasivan, Baidya) | claude, codex, gemini, minimax3, cc_deepseek | brak; wyniki spójne | **ACCEPT-HIGH** · wysoka |
| S-D02 | Parafraza, w tym rekurencyjna, degraduje detektory wszystkich czterech klas (watermark, sieciowe, zero-shot, retrieval); przy zbieżności rozkładów granica błędu klasyfikatora dąży do zera. | Sadasivan et al. (2025), *TMLR* | abstrakt + opis ataku rekurencyjnego · ABSTRAKT (wersja TMLR potwierdzona, V27) | INDIRECT | 2 (Sadasivan; Krishna et al. 2023) | wszystkie 5 | brak | **ACCEPT-HIGH** · wysoka |
| S-D03 | Skuteczność detekcji spada przy nieznanej domenie i nieznanym generatorze — **także dla języka polskiego**; w najtrudniejszym scenariuszu metody nienadzorowane wypadają lepiej niż nadzorowane. | Przybyła, Strebeyko & Wróblewska (2025), PolEval 2025, s. 5–15 | abstrakt, opis trzech torów, wyniki · ABSTRAKT (V11) | **DIRECT** | 2 (PolEval; Baidya 2026 preprint) | claude, codex, gemini, minimax3, cc_deepseek | brak | **ACCEPT-HIGH** · wysoka |
| S-D04 | Detektory GPT systematycznie błędnie klasyfikują teksty osób nie-native jako AI (FPR > 61% na esejach TOEFL). | Liang et al. (2023), *Patterns* 4(7), 100779 | abstrakt + wyniki dla 7 detektorów · ABSTRAKT (V02) | INDIRECT | **1 ŹRÓDŁO** — wszystkie pięć pakietów opiera się na tym samym artykule | wszystkie 5 | **DWA kontrdowody:** Jiang, Hao, Fauss & Li (2024), *Computers & Education* 217 — brak biasu na dobrze próbkowanych danych GRE; Al Ali, Helcl & Libovický (2026), arXiv:2602.05769 **[preprint]** — po **czesku** perplexity osób nie-native NIE jest niższa i trzy rodziny detektorów nie wykazują systematycznego biasu | **ACCEPT-CONDITIONAL** · umiarkowana — wyłącznie dla scenariusza „L2 pisze po angielsku, detektor oparty na perplexity” |
| S-D05 | Transfer tezy S-D04 na scenariusz „Polak pisze po polsku” nie ma podstaw empirycznych. | Al Ali et al. (2026) [preprint] jako najbliższy analog słowiański; brak badania polskiego (F03) | abstrakt · ABSTRAKT (V04) | **SLAVIC** | 1 preprint | żaden pakiet nie zgłosił | teza Lianga jako oczekiwanie a priori | **REJECT** transferu jako faktu · **HEURISTIC** jako ostrożność etyczna |
| S-D06 | „Polish Ratio” mierzy stopień **wypolerowania** tekstu przez ChatGPT (ang. *to polish*) na angielskich abstraktach akademickich (zbiór HPPT) i nie ma związku z językiem polskim. | Yang, Jiang & Li (2024), *APSIPA Trans. SIP* 13(2); wersja arXiv:2307.11380 | abstrakt arXiv, definicja miary i zbioru · ABSTRAKT (V07) | **NONE** | 1 | minimax3 (błędnie jako źródło polskie), codex (poprawnie w tabeli, mylnie w raporcie) | — | **ACCEPT-HIGH** jako korekta terminologiczna · wysoka |
| S-D07 | Wynik detektora odpowiada najwyżej na pytanie o autorstwo lub udział narzędzia w konkretnym rozkładzie danych; nie mierzy jakości, naturalności ani etyki tekstu. | Rozdzielenie konstruktów wsparte: Weber-Wulff (2023); Sadasivan (2025); Przybyła et al. (2025); Yang et al. (2024) | jak wyżej · ABSTRAKT | INDIRECT + DIRECT | 4 | codex, cc_deepseek, minimax3, gemini, claude | brak | **ACCEPT-HIGH** · wysoka |
| S-D08 | Miary oparte na perplexity wykazują inwersję polaryzacji dla współczesnych modeli; współczesne detektory działają bez opierania się na perplexity. | Baidya et al. (2026), arXiv:2603.17522 **[preprint]**; Al Ali et al. (2026), arXiv:2602.05769 **[preprint]** | abstrakty · ABSTRAKT (V17, V04) | INDIRECT/SLAVIC | 2 preprinty | gemini (błędna atrybucja), cc_deepseek (O2) | — | **ACCEPT-CONDITIONAL** · niska–umiarkowana (oba źródła to preprinty) |

---

## B. Percepcja ludzka: rozpoznawalność, jakość i preferencja

| ID | Teza (atomiczna) | Źródło | Lokalizator / dostęp | PL | Niezależność | Modele | Dowody przeciwne | Werdykt · pewność |
|---|---|---|---|---|---|---|---|---|
| S-H01 | Nieprzeszkoleni oceniający crowdsourcingowi odróżniają tekst generowany od ludzkiego niewiele lepiej niż losowo. | Clark et al. (2021), ACL-IJCNLP, 7282–7296 | abstrakt · ABSTRAKT | INDIRECT | 2 (Clark; Köbis & Mossink 2021) | claude, cc_deepseek | S-H02, S-H03 | **ACCEPT-CONDITIONAL** · umiarkowana — **ograniczone do modeli sprzed 2022 i oceniających bez treningu** |
| S-H02 | Osoby regularnie używające LLM do pisania rozpoznają tekst modeli komercyjnych bardzo trafnie; większość głosów panelu pięciu takich osób myli się na 1 z 300 artykułów, także wobec parafrazy i „humanizacji”. | Russell, Karpinska & Iyyer (2025), ACL 2025, s. 5342–5373 | abstrakt · ABSTRAKT (V13) | INDIRECT | 1, ale duża próba i wyraźny efekt | cc_deepseek (B13) | — | **ACCEPT-HIGH** · wysoka (EN) |
| S-H03 | W badaniu obejmującym 16 zbiorów, 9 języków, 9 domen i 19 anotatorów średnia trafność ludzkiej detekcji wyniosła **87,6%**; główne luki między tekstem ludzkim a maszynowym dotyczą **konkretności, niuansów kulturowych i różnorodności**. | Wang et al. (2026), *Is Human-Like Text Liked by Humans?*, **ACL 2026 Main**; arXiv:2502.11614v3 | abstrakt + pole comments potwierdzające recenzję · ABSTRAKT (V14) | INDIRECT (lista 9 języków niedostępna na poziomie abstraktu — **nie twierdzę, że polski był w próbie**) | 1, ale wielojęzyczna i wielodomenowa | cc_deepseek (jako preprint) | S-H01 | **ACCEPT-HIGH** · wysoka |
| S-H04 | Ludzie nie zawsze preferują tekst ludzki, szczególnie gdy nie potrafią wskazać jego źródła. | Wang et al. (2026), ACL 2026 Main | abstrakt · ABSTRAKT (V14) | INDIRECT | 3 (Wang; Herbold; Porter & Machery) | cc_deepseek | — | **ACCEPT-HIGH** · wysoka |
| S-H05 | W ocenie ślepej tekst generowany bywa oceniany **wyżej** niż ludzki: eseje argumentacyjne (270 esejów, 658 ocen, 111 nauczycieli) oraz poezja. | Herbold et al. (2023), *Sci Rep* 13, 18617; Porter & Machery (2024), *Sci Rep* 14 | abstrakty · ABSTRAKT (V20, V24) | INDIRECT | 2 niezależne | cc_deepseek, codex | — | **ACCEPT-HIGH** dla badanych gatunków · wysoka |
| S-H06 | Ujawnienie, że tekst kreatywny powstał z udziałem AI, obniża jego ocenę niezależnie od treści. | Raj, Berg & Seamans (2026), *JEP: General* 155(4), 896–915 | metadane rekordu APA · METADATA-ONLY (V23) | INDIRECT | **1 program badawczy**, jeden zespół, populacja USA, brak replikacji zewnętrznej | cc_deepseek (B8) | — | **ACCEPT-CONDITIONAL** · umiarkowana |
| S-H07 | Rzekoma sprzeczność „ludzie nie rozpoznają” vs „ludzie rozpoznają” znika po wprowadzeniu moderatorów: **ekspozycja na LLM, agregacja panelowa, rok badania, język i domena**. | Synteza S-H01 + S-H02 + S-H03 | — | INDIRECT | rozstrzygnięcie własne | — | — | **ACCEPT-HIGH** jako rozstrzygnięcie metodologiczne · wysoka |

---

## C. Cechy językowe tekstu generowanego

| ID | Teza (atomiczna) | Źródło | Lokalizator / dostęp | PL | Niezależność | Modele | Dowody przeciwne | Werdykt · pewność |
|---|---|---|---|---|---|---|---|---|
| S-L01 | Na zbiorze cech Bibera modele wykazują systematyczne różnice stylistyczne wobec ludzi i między sobą; różnice utrzymują się przy wzroście skali i są **większe dla modeli instruction-tuned niż bazowych**. | Reinhart et al. (2025), *PNAS* 122(8) | abstrakt; sekcje *Significance*, *Differences in Style and Vocabulary*, *Generalization Across Corpora* · ABSTRAKT (V01) | INDIRECT | 3 zbieżne linie (Reinhart; Rallapalli; El Attar) | codex, minimax3, cc_deepseek | — | **ACCEPT-HIGH** dla angielskiego · wysoka |
| S-L02 | Spośród **284 cech lingwistycznych** badanych na wyjściach **27 modeli** w **10 domenach** większość wcześniej proponowanych wskaźników jest **silnie zależna od kontekstu**; jedynym sygnałem odpornym między rodzinami modeli i domenami są miary **bogactwa leksykalnego**. | El Attar, Dönmez, Maurer & Falenska (2026), arXiv:2606.04177 **[preprint]** | abstrakt · ABSTRAKT (V15) | INDIRECT | 1 preprint, ale największa dotąd skala cech | claude, gemini, minimax3 | — | **ACCEPT-CONDITIONAL** · umiarkowana — **kluczowa dla zakazu blacklisty** |
| S-L03 | **Gatunek** wpływa na profil cech stylistycznych **silniej niż samo źródło tekstu** (człowiek vs model); model wpływa silniej niż strategia dekodowania; prompt „pisz jak człowiek” nie usuwa kluczowych różnic. | Rallapalli et al. (2026), arXiv:2604.14111 **[preprint]** — 11 LLM, 8 gatunków, 4 strategie dekodowania | abstrakt · ABSTRAKT (V16) | INDIRECT | 1 preprint, zbieżny z Reinhart | gemini (STY-01) | — | **ACCEPT-CONDITIONAL** · umiarkowana — **podstawa reguły „gatunek przed diagnozą”** |
| S-L04 | W esejach argumentacyjnych ChatGPT używa **mniej** pakietów 3-wyrazowych, ale o **wyższym** type/token ratio (bardziej sztywnych); więcej pakietów rzeczownikowych i przyimkowych; **mniej** markerów epistemicznych i obecności autorskiej niż studenci. | Jiang & Hyland (2024), *Applied Linguistics* 46(3), 375–391 | abstrakt · ABSTRAKT (V22) | INDIRECT | 2 (Jiang & Hyland; Herbold) | codex (E10) | — | **ACCEPT-CONDITIONAL** · umiarkowanie wysoka — gatunek argumentacyjny, angielski |
| S-L05 | W poradach medycznych i finansowych rozkład najczęstszych konstrukcji czasownikowo-argumentowych jest **szeroko zgodny** między tekstem ludzkim a AI; nowsze modele **zbliżają się** do ludzkich wzorców verb-VAC. | Casal, Stewart & Windsor (2025), *PLOS ONE* 20(5), e0324611 | abstrakt · ABSTRAKT (V21) | INDIRECT | 1 | codex (E09 — pomija niuans konwergencji) | teza o rosnącej odrębności modeli | **ACCEPT-CONDITIONAL** · umiarkowana — **podstawa reguły „każda reguła z datą modelu”** |
| S-L06 | Modele wykazują niższą różnorodność leksykalną, składniową i semantyczną niż teksty ludzkie; wybory projektowe i wdrożeniowe modelu wpływają na tę różnorodność. | Guo, Shang & Clavel (2025), *TACL* 13, 1507–1526, DOI 10.1162/tacl.a.47 | abstrakt · ABSTRAKT (V19 — **DOI podany przez Claude był błędny**) | INDIRECT | 3 (Guo; El Attar; Reinhart) | claude, cc_deepseek | Guo et al. wskazują zależność od zadania | **ACCEPT-CONDITIONAL** · umiarkowanie wysoka |
| S-L07 | Trenowanie modeli na tekście syntetycznym prowadzi do postępującego spadku różnorodności językowej. | Guo, Shang, Vazirgiannis & Clavel (2024), Findings of NAACL 2024, 3589–3604 | metadane + tytuł · METADATA-ONLY | INDIRECT | 1 | żaden pakiet | — | **RESEARCH-ONLY** · niska — istotne dla polityki aktualizacji, nie dla redakcji |
| S-L08 | Nadreprezentacja słownictwa stylistycznego w piśmiennictwie naukowym po 2023 jest **zjawiskiem populacyjnym**: co najmniej 13,5% abstraktów PubMed z 2024 nosi ślad przetworzenia przez LLM, do 40% w niektórych podkorpusach. | Kobak, González-Márquez, Horvát & Lause (2025), *Science Advances* 11(27) | abstrakt · ABSTRAKT (V05) | INDIRECT | 2 (Kobak; Liang et al. 2025 *Nat Hum Behav*) | cc_deepseek (T4) | estymator wrażliwy na dobór listy słów | **ACCEPT-HIGH jako sygnał populacyjny · REJECT jako marker indywidualny** |
| S-L09 | Przyczyna nadreprezentacji leksykalnej pozostaje **nieustalona**: architektura, algorytm i dane treningowe nie wykazały sprawstwa; RLHF jest częściowo zgodny z hipotezą, ale dowód nierozstrzygający. | Juzek & Ward (2025), COLING 2025, s. 6397–6411 | abstrakt + opis 21 słów ogniskowych · ABSTRAKT (V06) | INDIRECT | 1 | cc_deepseek (C7) | — | **ACCEPT-HIGH** dla tezy „nieustalone” · wysoka |
| S-L10 | Nie wiadomo, czy ludzie w ogóle preferują teksty pozbawione nadreprezentowanego słownictwa: w badaniu eksploracyjnym uczestnicy reagowali na różne słowa ogniskowe **niejednorodnie**. | Juzek & Ward (2025), COLING 2025 — badanie eksploracyjne online | abstrakt · ABSTRAKT (V06) | NONE dla PL | 1, eksploracyjne | cc_deepseek (H1) | — | **RESEARCH-ONLY** · niska |

---

## D. Mity i twierdzenia odrzucone

| ID | Teza obiegowa | Co naprawdę wynika z dowodów | Własna kwerenda falsyfikująca | Modele zgłaszające odrzucenie | Werdykt |
|---|---|---|---|---|---|
| S-M01 | Myślnik lub pauza jest markerem autorstwa LLM. | Brak jakiegokolwiek badania testującego myślnik jako marker po kontroli gatunku. Polska pauza ma własną normę typograficzną i konwencję prasową. | **F01** — 0 trafień relewantnych | codex, cc_deepseek, minimax3 | **REJECT** · wysoka |
| S-M02 | Konstrukcja „to nie X, to Y” jest uniwersalnym markerem AI. | Żadne z potwierdzonych badań stylometrycznych (Reinhart, El Attar, Rallapalli, Jiang & Hyland) nie testuje tej konstrukcji jako zmiennej. Jest to legalna figura kontrastu i definicji. | **F02** — brak testu w literaturze | codex (C08), cc_deepseek (T7), minimax3 (W6/M5) | **REJECT** jako reguła · **RESEARCH-ONLY** jako hipoteza |
| S-M03 | Trójpodział, wyliczenie i nagłówek są wadą tekstu. | Przeciwnie: sygnalizowanie struktury poprawia przyswajanie treści. Trójczłonowa lista jest klasyczną figurą retoryczną. | wsparte S-E02 | codex (M02), cc_deepseek (O3, T1, T2), minimax3 (M2) | **REJECT** · wysoka |
| S-M04 | Angielskie listy „słów AI” (*delve*, *tapestry*, *pivotal*) przenoszą się na polski. | Nieprzenoszalne leksykalnie. Sygnał jest populacyjny, dryfuje w czasie i karze osoby o bogatym słownictwie oraz piszące w L2. | wsparte S-L08, S-L09 | wszystkie 5 | **REJECT** · wysoka |
| S-M05 | Formalny, uporządkowany tekst jest „AI-owy”. | Dokumentacja, prawo, nauka i UI wymagają porządku; formalność jest cechą rejestru, nie autorstwa. Gatunek wpływa na profil cech silniej niż źródło (S-L03). | wsparte S-L03 | codex (M03), cc_deepseek | **REJECT** · wysoka |
| S-M06 | Detektor lub perplexity mierzy jakość tekstu. | Detektor odpowiada na pytanie o autorstwo w konkretnym rozkładzie danych. Jakość i autorstwo są rozłączne — tekst AI bywa oceniany wyżej (S-H05). | wsparte S-D07, S-H05 | wszystkie 5 | **REJECT** · wysoka |
| S-M07 | „Bardziej ludzki” tekst musi być potoczny, emocjonalny i slangowy. | Głos jest relacyjny i gatunkowy; slang może obniżyć dostępność, precyzję i zgodność z marką. Luki wskazane empirycznie to konkretność, niuans kulturowy i różnorodność (S-H03), a nie potoczność. | wsparte S-H03 | codex (M04), minimax3 | **REJECT** · wysoka |
| S-M08 | Neuroróżnorodność powoduje fałszywe pozytywy detektorów. | Brak jakiegokolwiek recenzowanego badania. Twierdzenie krąży w folklorze. | cc_deepseek O6 potwierdzone przy przeglądzie | cc_deepseek | **RESEARCH-ONLY** — nie używać ani jako reguły, ani jako argumentu · brak danych |
| S-M09 | Detektory zawsze zawodzą i zawsze mają bias. | Obalone jako teza uniwersalna: PolEval ponad 90% in-domain dla PL; Jiang et al. 2024 i Al Ali et al. 2026 nie znajdują biasu przy starannym próbkowaniu. Prawdziwa teza jest węższa (S-D01–S-D03). | **F05** | codex (C13) — jedyny pakiet, który to zauważył | **REJECT** wersji uniwersalnej · wysoka |
| S-M10 | Usunięcie „markerów AI” poprawia tekst dla czytelnika. | **Nie zbadane.** Dowody pośrednie działają w obie strony. To jest niezweryfikowane założenie całego przedsięwzięcia. | **F04** | żaden pakiet nie postawił tego tak ostro; cc_deepseek najbliżej (H1) | **RESEARCH-ONLY** — do jawnego zadeklarowania w skillu · brak danych |

---

## E. Polszczyzna — dowody bezpośrednie i normatywne

| ID | Teza (atomiczna) | Źródło | Lokalizator / dostęp | Niezależność | Modele | Werdykt · pewność |
|---|---|---|---|---|---|---|
| S-P01 | ChatGPT w zadaniach wzorowanych na maturze 2023 popełnia błędy językowe o zmiennej częstości, **najwięcej w tekstach z konstrukcjami złożonymi**, gdzie poprawność wymaga całościowej kontroli gramatycznej. | Mazur (2024), *LingVaria* 19(1/37), 119–138, DOI 10.12797/LV.19.2024.37.08 | abstrakt, opis materiału i wyników · ABSTRAKT (V08) | 1, bezpośrednio polskie | codex (E05), cc_deepseek (F13) | **ACCEPT-CONDITIONAL** · umiarkowana — model 2023, gatunek zadaniowy, nie pomiar naturalności |
| S-P02 | Istnieje polski zbiór i shared task detekcji tekstu maszynowego: **64 538 tekstów**, **8 generatorów** (Llama, Mistral, Bielik, PLLuM, Gemma), **6 domen**; ponad 90% accuracy in-domain, spadek out-of-domain. | Przybyła, Strebeyko & Wróblewska (2025), PolEval 2025; zbiór ŚMIGIEL (LREC 2025) | abstrakt ACL + karta zbioru · ABSTRAKT + STRONA-INSTYTUCJI (V11, V12) | 1, bezpośrednio polskie | wszystkie 5 (Claude i Gemini z **błędną** liczbą 462 tys.) | **ACCEPT-HIGH** · wysoka |
| S-P03 | Od 1 stycznia 2026 dokument RJP „Zasady pisowni i interpunkcji polskiej” jest **jedynym obowiązującym** źródłem zasad ortograficznych i interpunkcyjnych; zmiany ogłoszono komunikatem z 10 maja 2024, wersja jednolita w załączniku do komunikatu 11/25. | Rada Języka Polskiego przy Prezydium PAN | strony i PDF RJP oraz komunikat PWN · STRONA-INSTYTUCJI (V28) | źródło pierwotne, autorytatywne | claude, minimax3 | **ACCEPT-HIGH · NORMATIVE** · wysoka |
| S-P04 | Polska norma językowa rozróżnia normę **wzorcową** i **użytkową**; ta sama forma bywa poprawna w jednej i niepoprawna w drugiej. | Markowski (2005), *Kultura języka polskiego. Teoria. Zagadnienia leksykalne*, PWN | podręcznik kanoniczny · METADATA-ONLY | źródło normatywne | claude | **ACCEPT-HIGH · NORMATIVE** · wysoka |
| S-P05 | Polska kompetencja językowa i kulturowa modeli jest mierzona benchmarkiem PLCC (600 ręcznie przygotowanych pytań); jest to pomiar kompetencji zadaniowej, **nie naturalności swobodnego tekstu**. | Dadas, Grębowiec, Perełkiewicz & Poświata (2025), *LNCS*, s. 60–71 | opis benchmarku · METADATA-ONLY | 1 | claude, codex, minimax3 | **ACCEPT-CONDITIONAL** · umiarkowana |
| S-P06 | Istnieje recenzowana analiza poprawności językowej produktów tekstowych ChatGPT obejmująca angielski, niemiecki i polski. | Mazurkiewicz-Sokołowska, J. (2025), *LNNS*, s. 250–265, DOI 10.1007/978-3-032-06611-4_20 | rekord Crossref bez abstraktu · **METADATA-ONLY** (V26) | 1 | cc_deepseek (jedyny) | **ACCEPT-CONDITIONAL** co do istnienia · **treści ustaleń nie weryfikowałem** |
| S-P07 | Istnieje typologia kroków dialogowych ChatGPT-3.5 i ich wykładników gatunkowych, opublikowana w polskim czasopiśmie językoznawczym. | Marquardt, D. (2024), *Poznańskie Studia Polonistyczne. Seria Językoznawcza* 31(1), 149–166, DOI 10.14746/pspsj.2024.31.1.8 | abstrakt · ABSTRAKT (F03) | 1 | **żaden pakiet nie znalazł** | **RESEARCH-ONLY** · niska — z abstraktu nie wynika, czy materiał był polskojęzyczny |
| S-P08 | **Nie istnieje** recenzowane, wielogatunkowe korpusowe badanie cech stylistycznych polskiego tekstu LLM z kontrolowanym korpusem ludzkim. | Wynik własnej kwerendy (F03) + zgodne stwierdzenia pięciu pakietów | — | kwerenda własna + 5 pakietów | wszystkie 5 | **ACCEPT-CONDITIONAL** · umiarkowana — teza o stanie kwerendy, nie o nieistnieniu w świecie |
| S-P09 | **Nie istnieje** badanie percepcji „AI-polszczyzny” przez polskich czytelników (ocen, preferencji, ślepych porównań). | Wynik własnej kwerendy (F03) + cc_deepseek | — | kwerenda własna | cc_deepseek | **ACCEPT-CONDITIONAL** · umiarkowana |
| S-P10 | RJP nie wydała stanowiska normatywnego dotyczącego stylu tekstów generowanych przez modele. | Przegląd zasobów RJP (V28) | STRONA-INSTYTUCJI | kwerenda własna | cc_deepseek | **ACCEPT-CONDITIONAL** · umiarkowana — brak sygnału nie jest dowodem braku |

---

## F. Redakcja, prosty język i gatunki

| ID | Teza (atomiczna) | Źródło | Lokalizator / dostęp | PL | Modele | Werdykt · pewność |
|---|---|---|---|---|---|---|
| S-E01 | Trudność przetwarzania języka prawniczego wynika ze **sposobu pisania** (m.in. zagnieżdżenia składniowe), a nie ze specjalistycznych **pojęć**. | Martínez, Mollica & Gibson (2022), *Cognition* 224, 105070 | abstrakt · ABSTRAKT (V25) | INDIRECT | cc_deepseek (E3) | **ACCEPT-HIGH** · wysoka — **upraszczaj składnię, chroń terminologię** |
| S-E02 | Sygnalizowanie struktury (nagłówki, zapowiedzi, wyliczenia) poprawia przyswajanie treści. | Mautone & Mayer (2001), *Journal of Educational Psychology* 93(2), 377–389 | metadane · METADATA-ONLY | INDIRECT | cc_deepseek (E5) | **ACCEPT-CONDITIONAL** · umiarkowanie wysoka — **obala mit S-M03** |
| S-E03 | Prosty język ma normę międzynarodową definiującą go przez **dopasowanie do odbiorcy i celu**, a nie przez prostotę samą w sobie. | ISO 24495-1:2023 *Plain language — Part 1*; ISO 24495-3:2026 | strona standardu · STRONA-INSTYTUCJI | INDIRECT + wdrożenia PL | codex (E14/E24), claude, minimax3 | **ACCEPT-HIGH · NORMATIVE** · wysoka |
| S-E04 | Prostszy tekst nie gwarantuje zrozumienia; obecność elementów prostego języka nie jest równoznaczna z ich skutecznością. | Stoll et al. (2022), *PLOS ONE* 17(6); Kerwer et al. (2021), *Front. Psychol.* 12; Gainey et al. (2024), *BMJ Open* 14 **(korekta abstraktu: 10.1136/bmjopen-2024-086464corr1)** | abstrakty i noty · METADATA-ONLY | INDIRECT | codex (E14, E21) | **ACCEPT-CONDITIONAL** · umiarkowana |
| S-E05 | Głos autorski jest konstruktem **relacyjnym i sytuacyjnym**; oceny zależą od czytelnika, dyscypliny i gatunku, a nie od listy form językowych. | Morton & Storch (2019), *JSLW* 43; Zhao & Wu (2022), *Assessing Writing* 53 | abstrakty · METADATA-ONLY | INDIRECT | codex (E13) | **ACCEPT-CONDITIONAL** · umiarkowanie wysoka |
| S-E06 | Profil preferencji stylistycznych autora można wyprowadzić z próbek jego pisania i użyć do warunkowania generacji. | Aroca-Ouellette, Mackraz, Theobald & Metcalf (2025), arXiv:2505.23815 **[preprint]**; Gao et al. (2024), arXiv:2404.15269 **[preprint]** | abstrakty · ABSTRAKT (V18) | INDIRECT | gemini (**z błędną tezą** — patrz V18) | **HEURISTIC** · niska–umiarkowana — **podstawa techniczna „karty głosu”, nie dowód o stylu LLM** |
| S-E07 | Kryteria oceny tekstu generowanego muszą być rozdzielone i jawnie zdefiniowane; terminologia ewaluacyjna w NLG jest niespójna. | Howcroft et al. (2020), INLG 2020, 169–182; van der Lee et al. (2021), *CSL* 67 | abstrakty · METADATA-ONLY | INDIRECT | codex (E11–E12), claude | **ACCEPT-HIGH** jako metodyka · wysoka |

---

## G. Repozytoria, długie formy i inżynieria — inferencje, nie wyniki eksperymentów

> Wszystkie tezy w tej sekcji są **wymaganiami inżynierskimi wywiedzionymi** z literatury i standardów.
> Żadna nie jest wynikiem eksperymentu nad redakcją polszczyzny. Oznaczam je jawnie.

| ID | Teza | Podstawa | Dostęp | Modele | Werdykt |
|---|---|---|---|---|---|
| S-R01 | Placeholdery, ICU/MessageFormat, warianty `plural`/`select`, znaczniki, linki, escape'y i klucze lokalizacji są elementami chronionymi; komunikat należy tłumaczyć i redagować jako całość, nie fragmentami. | Unicode UTS #35 część MessageFormat; ICU User Guide | STRONA-INSTYTUCJI | codex (E20/C17), claude, minimax3, cc_deepseek | **ACCEPT-HIGH jako wymóg techniczny** |
| S-R02 | Dostępność wymaga deklaracji języka, objaśniania nietypowych słów i sensownych sugestii przy błędach. | W3C WCAG 2.2, kryteria 3.1.1–3.1.5, 3.2.4, 3.3.3 | STRONA-INSTYTUCJI | codex (E23), minimax3 | **ACCEPT-HIGH · NORMATIVE** |
| S-R03 | Pozornie lokalna transformacja tekstu lub kodu może wywołać regresję; stąd obowiązek testów składni, buildu i diffu semantycznego. | Bavota et al. (2012), SCAM; Le-Cong et al. (2025), *TOSEM* | METADATA-ONLY | codex (E19/C15–C19) | **HEURISTIC · INFERENCJA INŻYNIERSKA** |
| S-R04 | Długie generowanie traci spójność i dokładność; większe okno kontekstu nie rozwiązuje problemu spójności. | Liu et al. (2024), Findings of EMNLP 2024 (LongGenBench); Koh et al. (2023), *ACM CSUR* 55(8) | METADATA-ONLY | codex (E18), minimax3, claude | **ACCEPT-CONDITIONAL** · umiarkowana |
| S-R05 | Dla książki i długiego dokumentu potrzebne są rejestry stanu: księga stylu, glosariusz, rejestr postaci i nazw, oś czasu, rejestr faktów, rejestr zapowiedzi i dziennik zmian. | Wywiedzione z S-R04 + praktyka redakcyjna; **brak walidacji eksperymentalnej** | — | codex (C20–C21), minimax3 (9.1–9.6), claude (9.2) | **HEURISTIC · INFERENCJA INŻYNIERSKA** — zbieżność trzech pakietów **nie jest** dowodem |
| S-R06 | Klasyfikacja widoczności tekstu w repozytorium (jawnie użytkowy / runtime / niepewny / chroniony techniczny / mieszany / generowany) jest warunkiem bezpiecznej edycji; przy niepewnej ścieżce wyświetlenia obowiązuje raport, nie zmiana. | Wywiedzione z S-R01 + S-R03 | — | **codex (unikatowy wkład)** | **HEURISTIC · INFERENCJA INŻYNIERSKA** — silnie rekomendowane |

---

## H. Podsumowanie liczbowe

| Kategoria werdyktu | Liczba tez |
|---|---:|
| `ACCEPT-HIGH` | 17 |
| `ACCEPT-CONDITIONAL` | 18 |
| `HEURISTIC` | 4 |
| `RESEARCH-ONLY` | 6 |
| `REJECT` | 8 |
| **Razem** | **53** |

| Status polski | Liczba tez |
|---|---:|
| `DIRECT` — dane polskie | 10 |
| `SLAVIC` — inny język słowiański | 2 |
| `INDIRECT` — transfer międzyjęzykowy | 33 |
| `NONE` / nie dotyczy | 8 |
