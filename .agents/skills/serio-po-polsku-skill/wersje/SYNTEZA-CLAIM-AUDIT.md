# SYNTEZA-CLAIM-AUDIT — audyt tez użytych w kontrakcie wiedzy

*Data: 2026-08-29 · Format rekordu: `CLAIM-ID · EXISTS · SUPPORTS · SCOPE · LIVE · locator/access · decision · notes`*

## Legenda

- **EXISTS** — źródło jest rozwiązywalne (DOI / stabilny rekord) i metadane się zgadzają.
- **SUPPORTS** — źródło wspiera **dokładnie tę** tezę, nie tylko temat.
- **SCOPE** — teza nie przekracza zakresu źródła (język, populacja, gatunek, model, data).
- **LIVE** — brak retrakcji lub istotnej korekty; wynik nie został wyparty.
- **access** — poziom, na jakim faktycznie sprawdziłem: `FULLTEXT` / `ABSTRAKT` / `METADATA` / `INSTYTUCJA`.
- **decision** — `USE` / `USE-NARROWED` / `USE-AS-HEURISTIC` / `RESEARCH-ONLY` / `DROP`.

> **Ostrzeżenie o dostępie:** nie miałem pełnych tekstów za paywallem. Tam, gdzie `access: METADATA`,
> potwierdziłem istnienie i metadane rekordu, ale **nie** czytałem fragmentu wspierającego tezę.
> Takie rekordy nie mogą samodzielnie uzasadniać reguły działania skilla.

---

## A. Detektory i autorstwo

### S-D01 — Komercyjne detektory nie nadają się do rozstrzygania o autorstwie
- **EXISTS:** ✅ Weber-Wulff et al. (2023), *IJEI* 19(1), 26 — DOI 10.1007/s40979-023-00146-z
- **SUPPORTS:** ✅ abstrakt raportuje test 14 narzędzi, 54 przypadki, 756 testów; podatność na edycję
- **SCOPE:** ⚠️ stan narzędzi na 2023; rynek detektorów ewoluował
- **LIVE:** ✅ brak sygnałów retrakcji w Crossref
- **access:** ABSTRAKT
- **decision:** **USE-NARROWED** — z datą stanu wiedzy
- **notes:** Wszystkie pięć pakietów zgłasza tę tezę; tu zbieżność jest uzasadniona, bo wsparta trzema niezależnymi liniami (Weber-Wulff, Sadasivan, Baidya).

### S-D02 — Parafraza degraduje wszystkie klasy detektorów
- **EXISTS:** ✅ Sadasivan et al. (2025), *TMLR* — potwierdzony status recenzowany (V27)
- **SUPPORTS:** ✅ abstrakt opisuje rekurencyjny atak parafrazujący i cztery klasy detektorów
- **SCOPE:** ✅ angielski, ale mechanizm jest statystyczny, nie leksykalny
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE**
- **notes:** Codex i cc_deepseek opisują pracę jako preprint z 2023 — **nieaktualnie**; jest to publikacja TMLR ze stycznia 2025.

### S-D03 — Detekcja spada out-of-domain, także dla polskiego
- **EXISTS:** ✅ Przybyła, Strebeyko & Wróblewska (2025), PolEval 2025, s. 5–15
- **SUPPORTS:** ✅ abstrakt wprost: ponad 90% na głównym zbiorze, spadek na nieznanych domenach i generatorach, przewaga metod nienadzorowanych w najtrudniejszym scenariuszu
- **SCOPE:** ✅ **DIRECT dla polskiego**
- **LIVE:** ✅
- **access:** ABSTRAKT (aclanthology.org)
- **decision:** **USE**
- **notes:** To najmocniejszy bezpośrednio polski wynik w całym materiale.

### S-D04 — Bias detektorów wobec osób nie-native
- **EXISTS:** ✅ Liang et al. (2023), *Patterns* 4(7), 100779
- **SUPPORTS:** ✅ dla scenariusza z abstraktu: eseje TOEFL, siedem detektorów
- **SCOPE:** ❌ **PRZEKROCZONY we wszystkich pięciu pakietach.** Teza była przenoszona na scenariusz „polski autor pisze po polsku”, dla którego nie ma danych.
- **LIVE:** ✅ nie wycofane, ale **częściowo wyparte**:
  - Jiang, Hao, Fauss & Li (2024), *Computers & Education* 217 — brak biasu na dobrze próbkowanych danych GRE
  - Al Ali, Helcl & Libovický (2026), arXiv:2602.05769 **[preprint]** — po czesku perplexity osób nie-native nie jest niższa; trzy rodziny detektorów bez systematycznego biasu
- **access:** ABSTRAKT (wszystkie trzy)
- **decision:** **USE-NARROWED** — wyłącznie „L2 pisze po angielsku, detektor oparty na perplexity, stan 2023”
- **notes:** **Najważniejsza korekta całej syntezy.** Pięć pakietów powtórzyło tę samą tezę, wszystkie z jednego źródła. Zgodność modeli maskowała brak niezależności dowodu i istnienie dwóch kontrdowodów.

### S-D05 — Transfer S-D04 na polszczyznę
- **EXISTS:** ✅ (Al Ali et al. 2026 jako najbliższy analog słowiański)
- **SUPPORTS:** ❌ nie ma źródła wspierającego transfer; jest źródło działające przeciw
- **SCOPE:** ❌
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **DROP jako fakt · USE-AS-HEURISTIC jako ostrożność etyczna**
- **notes:** Skill może i powinien ostrzegać przed oskarżeniami opartymi na detektorze — ale z uzasadnieniem S-D01/S-D03 (zawodność metody), nie z uzasadnieniem „Polacy są dyskryminowani przez detektory”, bo tego nie wiemy.

### S-D06 — „Polish Ratio” to miara wypolerowania, nie języka polskiego
- **EXISTS:** ✅ Yang, Jiang & Li (2024), *APSIPA Trans. SIP* 13(2), DOI 10.1561/116.00000250; arXiv:2307.11380
- **SUPPORTS:** ✅ abstrakt arXiv definiuje Polish Ratio jako miarę stopnia modyfikacji dokonanej przez ChatGPT wobec oryginału ludzkiego; zbiór HPPT to angielskie abstrakty akademickie
- **SCOPE:** ✅
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE** jako jawne ostrzeżenie terminologiczne w dokumentacji skilla
- **notes:** MiniMax3 klasyfikuje tę pracę jako „polski benchmark detekcji”; Codex poprawnie ją opisuje w tabeli dowodów, ale umieszcza w sekcji „Bezpośrednie źródła polskie”. **Pułapka fałszywego przyjaciela do jawnego odnotowania.** Zbiór HPPT (pary tekst ludzki / tekst wypolerowany przez ChatGPT) jest przy tym merytorycznie bliski zadaniu skilla i wart uwagi jako wzorzec projektowania korpusu.

### S-D07 — Wynik detektora nie mierzy jakości
- **EXISTS:** ✅ wielokrotnie
- **SUPPORTS:** ✅ jako rozdzielenie konstruktów, wsparte S-D01–S-D03 i S-H05
- **SCOPE:** ✅
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE** — twarda reguła: brak bramki detektorowej w skillu
- **notes:** Herbold (2023) i Porter & Machery (2024) czynią tę tezę mocniejszą niż samo rozumowanie konstruktowe: tekst klasyfikowany jako AI bywa oceniany wyżej.

### S-D08 — Inwersja polaryzacji perplexity
- **EXISTS:** ✅ Baidya et al. (2026), arXiv:2603.17522 **[preprint]**; Al Ali et al. (2026), arXiv:2602.05769 **[preprint]**
- **SUPPORTS:** ✅ oba abstrakty
- **SCOPE:** ⚠️ HC3/ELI5 oraz czeski; brak danych polskich
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE-NARROWED** — dwa preprinty nie uzasadniają mocnej reguły
- **notes:** Gemini przypisuje ten wynik innej pracy (arXiv:2505.01800) — błąd atrybucji.

---

## B. Percepcja ludzka

### S-H02 — Panel doświadczonych użytkowników LLM rozpoznaje tekst modeli
- **EXISTS:** ✅ Russell, Karpinska & Iyyer (2025), ACL 2025, s. 5342–5373
- **SUPPORTS:** ✅ abstrakt: większość głosów pięciu anotatorów myli się na 1 z 300 artykułów; odporność na parafrazę i „humanizację”; eksperci używają zarówno „AI vocabulary”, jak i cech złożonych (formalność, oryginalność, klarowność)
- **SCOPE:** ⚠️ angielski, artykuły, modele komercyjne 2024–2025
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE-NARROWED**
- **notes:** Kluczowe dla uczciwości obietnic skilla: **„detektory są zawodne” nie znaczy „tekst jest nie do odróżnienia dla kompetentnego czytelnika”.** Tylko cc_deepseek wyeksponował to źródło.

### S-H03 — Trafność 87,6% w badaniu wielojęzycznym; luki: konkretność, niuans kulturowy, różnorodność
- **EXISTS:** ✅ Wang et al., arXiv:2502.11614v3, pole comments: **ACL 2026 Main** (recenzowane)
- **SUPPORTS:** ✅ abstrakt
- **SCOPE:** ⚠️ **lista 9 języków niedostępna na poziomie abstraktu — nie twierdzę, że polski był w próbie**
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE-NARROWED**
- **notes:** Najlepsza dostępna, empirycznie ugruntowana operacjonalizacja celu redakcyjnego. Trzy wymiary (konkretność, niuans kulturowy, różnorodność) są bez porównania lepszą podstawą działania niż jakakolwiek lista słów.

### S-H05 — Tekst AI bywa w ocenie ślepej oceniany wyżej
- **EXISTS:** ✅ Herbold et al. (2023), *Sci Rep* 13, 18617; Porter & Machery (2024), *Sci Rep* 14
- **SUPPORTS:** ✅ oba abstrakty wprost
- **SCOPE:** ⚠️ eseje argumentacyjne uczniów oraz poezja; oceniający: nauczyciele / nieeksperci
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE-NARROWED**
- **notes:** Blokuje założenie „tekst LLM jest z definicji gorszy, więc każda ingerencja go poprawia”.

### S-H06 — Kara za ujawnienie autorstwa AI
- **EXISTS:** ✅ Raj, Berg & Seamans (2026), *JEP: General* 155(4), 896–915
- **SUPPORTS:** ⚠️ tytuł i metadane wspierają tezę; **abstraktu nie miałem**
- **SCOPE:** ⚠️ jeden program badawczy, jeden zespół, populacja USA, tekst kreatywny; brak replikacji zewnętrznej
- **LIVE:** ✅
- **access:** **METADATA**
- **decision:** **USE-AS-HEURISTIC**
- **notes:** Wsparcie dla zakazu obiecywania „niewykrywalności” — retusz stylu nie usuwa kary za ujawnienie. Ale to jeden program badawczy: nie stawiać na nim mocnej reguły.

---

## C. Cechy językowe

### S-L01 — Systematyczne różnice stylistyczne, większe dla modeli instruction-tuned
- **EXISTS:** ✅ Reinhart et al. (2025), *PNAS* 122(8), DOI 10.1073/pnas.2422455122
- **SUPPORTS:** ✅ abstrakt wprost: różnice utrzymują się przy skalowaniu i są większe dla modeli instruction-tuned niż bazowych
- **SCOPE:** ⚠️ **wyłącznie angielski**; Llama 3 i GPT-4o; korpusy równoległe z tych samych promptów
- **LIVE:** ✅ 56 cytowań, brak sygnałów retrakcji
- **access:** ABSTRAKT
- **decision:** **USE-NARROWED**
- **notes:** **MiniMax3 podaje fałszywą listę autorów** (Strobelt, Huber, Boxall). Poprawna: Reinhart, Markey, Laudenbach, Pantusen, Yurko, Weinberg, Brown.

### S-L02 — Tylko bogactwo leksykalne jest odporne między modelami i domenami
- **EXISTS:** ✅ El Attar, Dönmez, Maurer & Falenska (2026), arXiv:2606.04177 **[preprint, nierecenzowany]**
- **SUPPORTS:** ✅ abstrakt wprost
- **SCOPE:** ⚠️ angielski; 27 modeli, 10 domen; preprint
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE-NARROWED — z jawną flagą preprintu**
- **notes:** To jest **dowodowa podstawa zakazu blacklisty**. Nie „blacklista jest niesmaczna”, tylko: przebadano 284 cechy i praktycznie żadna poza bogactwem leksykalnym nie generalizuje.

### S-L03 — Gatunek wpływa silniej niż źródło
- **EXISTS:** ✅ Rallapalli et al. (2026), arXiv:2604.14111 **[preprint]**
- **SUPPORTS:** ✅ abstrakt wprost (gatunek > źródło; model > strategia dekodowania; odporność na prompt „pisz jak człowiek”)
- **SCOPE:** ⚠️ angielski; 11 LLM, 8 gatunków; preprint
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE-NARROWED**
- **notes:** Podstawa reguły architektonicznej: **rozpoznanie gatunku poprzedza diagnozę**. Diagnoza bezgatunkowa jest metodologicznie nieuprawniona.

### S-L05 — Nowsze modele zbliżają się do ludzkich wzorców
- **EXISTS:** ✅ Casal, Stewart & Windsor (2025), *PLOS ONE* 20(5), e0324611
- **SUPPORTS:** ✅ abstrakt: szeroka zgodność najczęstszych VAC oraz wzrost podobieństwa do ludzkich wzorców w nowszych modelach
- **SCOPE:** ⚠️ porady medyczne i finansowe; angielski; GPT-3.5/4/4o
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE-NARROWED**
- **notes:** Codex streścił tę pracę jednostronnie (tylko „monologiczność i dystans”), pomijając wynik o konwergencji. To ważne: **wynik z 2023 nie opisuje modelu z 2026**, więc każda reguła katalogu musi nosić datę i warunek modelowy.

### S-L08 — Nadreprezentacja leksykalna jako sygnał populacyjny
- **EXISTS:** ✅ Kobak et al. (2025), *Science Advances* 11(27), DOI 10.1126/sciadv.adt3813
- **SUPPORTS:** ✅ abstrakt: ponad 15 mln abstraktów, co najmniej 13,5% w 2024, do 40% w podkorpusach
- **SCOPE:** ❌ **przekroczony**, jeśli ktoś użyje tego jako markera pojedynczego tekstu. Estymator jest populacyjny i wrażliwy na dobór listy słów.
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE-NARROWED** — wyłącznie jako opis kohorty; **DROP** jako diagnoza pojedynczego tekstu
- **notes:** cc_deepseek jako jedyny postawił to rozróżnienie ostro (sygnał populacyjny vs marker indywidualny). Przejmuję je jako regułę kontraktu.

### S-L09 — Przyczyna nadreprezentacji nieustalona
- **EXISTS:** ✅ Juzek & Ward (2025), COLING 2025, s. 6397–6411
- **SUPPORTS:** ✅ abstrakt: brak dowodu dla architektury, algorytmu i danych treningowych; RLHF częściowo zgodny, ale nierozstrzygający
- **SCOPE:** ✅
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE**
- **notes:** Blokuje popularne wyjaśnienie „to przez RLHF” podawane jako fakt. Można je podać wyłącznie jako hipotezę.

---

## D. Polszczyzna

### S-P01 — Błędy ChatGPT w polskim koncentrują się w konstrukcjach złożonych
- **EXISTS:** ✅ Mazur (2024), *LingVaria* 19(1/37), 119–138, DOI 10.12797/LV.19.2024.37.08
- **SUPPORTS:** ✅ abstrakt wprost
- **SCOPE:** ⚠️ model 2023, zadania wzorowane na maturze, analiza błędów — **nie pomiar naturalności ani stylu**
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **USE-NARROWED**
- **notes:** Jedyny bezpośredni polski wynik nadający się na regułę operacyjną: kontrola zgody, rządu, szyku i zależności międzyzdaniowych ma być **najostrzejsza w zdaniach złożonych**.

### S-P02 — Zbiór ŚMIGIEL: 64 538 tekstów, 8 generatorów, 6 domen
- **EXISTS:** ✅ karta zbioru + publikacja PolEval 2025
- **SUPPORTS:** ✅
- **SCOPE:** ✅
- **LIVE:** ✅
- **access:** ABSTRAKT + INSTYTUCJA
- **decision:** **USE**
- **notes:** **Claude podaje „462 000+ próbek”, Gemini „ponad 462K” — obie liczby błędne, ok. 7× zawyżone.** Dwa pakiety zbiegły się na tym samym błędzie niezależnie. Wzorcowy przypadek pozornej zgodności.

### S-P03 — Norma ortograficzna od 1 stycznia 2026
- **EXISTS:** ✅ Rada Języka Polskiego przy Prezydium PAN
- **SUPPORTS:** ✅ komunikaty i wersja jednolita „Zasad pisowni i interpunkcji polskiej”
- **SCOPE:** ✅ **DIRECT, normatywne, bezpośrednio operacyjne**
- **LIVE:** ✅ obowiązuje
- **access:** INSTYTUCJA (rjp.pan.pl, sjp.pwn.pl)
- **decision:** **USE**
- **notes:** Jedna z niewielu tez w całym materiale, która jest jednocześnie polska, pewna i wprost wykonalna: modele trenowane przed 2026 mogą stosować uchylone zasady, więc kontrola ortografii musi być odniesiona do wersji obowiązującej, a nie do „tego, co model pamięta”.

### S-P06 — Analiza produktów ChatGPT EN/DE/PL
- **EXISTS:** ✅ Mazurkiewicz-Sokołowska, J. (2025), *LNNS*, s. 250–265, DOI 10.1007/978-3-032-06611-4_20
- **SUPPORTS:** ⚠️ **niesprawdzone** — rekord Crossref nie zawiera abstraktu
- **SCOPE:** ⚠️ nieznany
- **LIVE:** ✅
- **access:** **METADATA**
- **decision:** **RESEARCH-ONLY** — do przeczytania przed użyciem
- **notes:** cc_deepseek oznaczył autorkę jako niezweryfikowaną; imię potwierdzone (Jolanta). Treści ustaleń nie potwierdzam.

### S-P07 — Marquardt (2024), kroki dialogowe ChatGPT
- **EXISTS:** ✅ DOI 10.14746/pspsj.2024.31.1.8
- **SUPPORTS:** ⚠️ abstrakt zapowiada typologię i cechy gatunkowe, ale nie podaje wyników
- **SCOPE:** ⚠️ **nie wiadomo, czy materiał był polskojęzyczny** — artykuł opublikowany po angielsku
- **LIVE:** ✅
- **access:** ABSTRAKT
- **decision:** **RESEARCH-ONLY**
- **notes:** Nowy trop wniesiony przez tę syntezę; nie znalazł go żaden z pięciu pakietów.

### S-P08 / S-P09 — Brak polskiego korpusowego badania cech i brak badań percepcji
- **EXISTS:** n/d (teza negatywna)
- **SUPPORTS:** ⚠️ wsparte własną kwerendą F03 i zgodnym stwierdzeniem pięciu pakietów
- **SCOPE:** ⚠️ to teza o **stanie kwerendy**, nie o nieistnieniu w świecie
- **LIVE:** n/d
- **access:** kwerenda własna (OpenAlex ×2)
- **decision:** **USE-NARROWED**
- **notes:** Musi być formułowane jako „nie znalazłem”, nigdy jako „nie istnieje”. Indeksacja polskich czasopism humanistycznych w bazach globalnych jest słaba.

---

## E. Tezy odrzucone i wycofane z obiegu

### S-M01 — Myślnik jako marker AI
- **EXISTS:** ❌ brak źródła
- **SUPPORTS:** ❌
- **SCOPE:** ❌
- **LIVE:** n/d
- **access:** kwerenda własna F01, 0 trafień relewantnych
- **decision:** **DROP**
- **notes:** Werdykt oparty na **własnej kwerendzie falsyfikującej**, nie na przejęciu konkluzji od pięciu pakietów.

### S-M02 — „To nie X, to Y” jako marker AI
- **EXISTS:** ❌
- **SUPPORTS:** ❌ żadne z potwierdzonych badań stylometrycznych nie testuje tej konstrukcji jako zmiennej
- **SCOPE:** ❌
- **LIVE:** n/d
- **access:** kwerenda własna F02
- **decision:** **DROP jako reguła · RESEARCH-ONLY jako hipoteza**
- **notes:** Brak testu nie jest dowodem nieistnienia zjawiska. Uczciwa formuła: „nie zbadano”, nie „nieprawda”.

### S-M08 — Neuroróżnorodność a fałszywe pozytywy detektorów
- **EXISTS:** ❌ brak recenzowanego badania
- **decision:** **RESEARCH-ONLY**
- **notes:** Nie używać ani jako reguły, ani jako argumentu za skillem. Zgłosić jako lukę.

### S-M10 — „Usunięcie markerów AI poprawia tekst”
- **EXISTS:** ❌ brak badania testującego wprost
- **SUPPORTS:** ❌ dowody pośrednie działają w obie strony (S-H05, S-L10, S-H04)
- **decision:** **RESEARCH-ONLY — do jawnego zadeklarowania jako założenie**
- **notes:** **To jest nieprzetestowana przesłanka całego przedsięwzięcia.** Kontrakt skilla musi to powiedzieć wprost, a plan ewaluacji musi to testować jako hipotezę falsyfikowalną, nie zakładać.

---

## F. Tezy odrzucone z powodu niezgodności cytacja–teza (znalezione w pakietach)

### X-01 — Machura (2024) jako dowód na schematyzm składniowy polszczyzny LLM  *(pakiet: claude)*
- **EXISTS:** ⚠️ praca istnieje, ale pod **innym DOI** (10.31286/jp.00953, nie 10.31286/JP.104.3.3) i z **innym rokiem** (2023)
- **SUPPORTS:** ❌ **NIE.** Artykuł dotyczy **apelatywizacji nazwy własnej** „ChatGPT” — problematyki onomastycznej. Nie zawiera analizy szyku SVO, rekcji czasownikowej ani imiesłowów.
- **SCOPE:** ❌
- **LIVE:** ✅
- **access:** METADATA + tytuł (Crossref, V09)
- **decision:** **DROP**
- **notes:** Teza o kalkowaniu SVO, błędach rekcji i nadużywaniu imiesłowów w polszczyźnie LLM **traci swoją jedyną deklarowaną podstawę „DIRECT”**. Pozostaje hipotezą redakcyjną bez dowodu polskiego.

### X-02 — Wróblewska et al. (2025) jako dowód na gubienie uzgodnień morfosyntaktycznych  *(pakiet: claude)*
- **EXISTS:** ⚠️ praca istnieje, ale DOI (10.31286/jp.001040), lista autorów i tytuł podane w pakiecie są błędne
- **SUPPORTS:** ❌ artykuł dotyczy koncepcji form równościowych z asteryskiem inkluzywnym, nie ogólnej utraty uzgodnień w zdaniach złożonych
- **SCOPE:** ❌
- **LIVE:** ✅
- **access:** METADATA (Crossref, V10)
- **decision:** **DROP** dla tezy o składni · **RESEARCH-ONLY** dla wąskiej kwestii obsługi form nienormatywnych przez modele

### X-03 — PROSE (2025) jako dowód na „rejestr staccato tłumiący głos autora”  *(pakiet: gemini)*
- **EXISTS:** ✅ Aroca-Ouellette et al. (2025), arXiv:2505.23815 [preprint]
- **SUPPORTS:** ❌ praca dotyczy **wnioskowania opisu preferencji użytkownika z próbek jego pisania** i porównania z metodą CIPHER na zadaniach streszczania i pisania e-maili. Nie zawiera żadnej tezy o rejestrze staccato, tłumieniu głosu ani o punktowym charakterze edycji ludzkiej.
- **SCOPE:** ❌
- **LIVE:** ✅
- **access:** ABSTRAKT (V18)
- **decision:** **DROP** dla tezy o staccato · **USE-AS-HEURISTIC** przekwalifikowane: dowód techniczny, że „kartę głosu” da się wyprowadzić z próbek autora
- **notes:** CLAIM-AUDIT pakietu Gemini oznaczył tę pozycję jako EXISTS/SUPPORTS/SCOPE/LIVE — wszystkie zielone. Audyt pieczątkowy, w którym każda teza dostaje komplet znaczników, nie jest audytem.

### X-04 — Rozmiar zbioru ŚMIGIEL  *(pakiety: claude, gemini)*
- **EXISTS:** ✅ zbiór istnieje
- **SUPPORTS:** ❌ liczba „462 000+” nie odpowiada danym; rzeczywisty rozmiar to 64 538 tekstów
- **decision:** **DROP liczby; USE poprawionej**
- **notes:** Dwa pakiety, ta sama błędna liczba. Gdyby synteza liczyła głosy, zaakceptowałaby błąd 2:1 przeciw poprawnej wartości podanej przez cc_deepseek.

### X-05 — „Polish Ratio” jako polskie źródło  *(pakiety: minimax3; częściowo codex)*
- **EXISTS:** ✅
- **SUPPORTS:** ❌ w zakresie „dotyczy polskich tekstów”
- **decision:** **DROP** tej interpretacji
- **notes:** patrz S-D06.

### X-06 — Lista autorów Reinhart et al. (2025)  *(pakiet: minimax3)*
- **EXISTS:** ✅ praca istnieje
- **SUPPORTS:** ✅ teza merytoryczna jest poprawna
- **decision:** **USE z poprawionymi metadanymi**
- **notes:** Błąd dotyczy metadanych, nie treści. Odnotowany, bo trafiłby do bibliografii finalnego skilla.

### X-07 — DOI Guo, Shang & Clavel (TACL)  *(pakiet: claude)*
- **EXISTS:** ⚠️ podany DOI wskazuje inną pracę
- **decision:** **USE z poprawionym DOI** (10.1162/tacl.a.47)
- **notes:** cc_deepseek słusznie oznaczył ten DOI jako niepotwierdzony — przykład, gdzie ostrożność jednego pakietu okazała się trafna wbrew stanowczości drugiego.

---

## G. Podsumowanie audytu

| Wynik | Liczba |
|---|---:|
| Tezy `USE` (bez zastrzeżeń) | 9 |
| Tezy `USE-NARROWED` (z jawnym zawężeniem zakresu) | 16 |
| Tezy `USE-AS-HEURISTIC` | 4 |
| Tezy `RESEARCH-ONLY` | 6 |
| Tezy `DROP` | 8 |
| **Niezgodności cytacja–teza znalezione w pakietach** | **3** (X-01, X-02, X-03) |
| **Błędy metadanych znalezione w pakietach** | **6** (DOI ×3, liczba ×1, lista autorów ×1, venue/rok ×1) |
| **Kontrdowody dodane przez syntezę, nieznalezione przez żaden pakiet** | **3** (Jiang 2024; Al Ali 2026; Wang 2026 jako recenzowane) |
| **Nowe tropy polskie** | **1** (Marquardt 2024) |
| Rekordy sprawdzone na poziomie `METADATA` (bez fragmentu wspierającego) | 9 |
