# EVIDENCE-TABLE.md — tabela dowodów i lokalizatorów

Przegląd: „Język AI” a polszczyzna · CC DeepSeek · data ekstrakcji: 2026-08-17
Dyspozycje wg skilla source-credibility: `EVIDENCE` (recenzowane/autorytet) ·
`BACKGROUND` (kontekst/preprint) · `OBJECT-OF-STUDY` (badany folklor) ·
`NORMATYW` (norma/uzus, nie eksperyment) · `REJECT` (z powodem).
Stosowalność do polskiego: **D** = bezpośrednio · **P** = pośrednio (transfer jawny) · **B** = brak.

Legenda pól: Lok = lokalizator weryfikacji (Crossref/ACL/arXiv/wydawca).

## A. Detekcja tekstu AI i cechy lingwistyczne

| ID | Źródło | Venue · Lok | Typ | Populacja/język/gatunek/modele | Kluczowy wynik | Dysp. | PL |
|---|---|---|---|---|---|---|---|
| A1 | Yang, Pan, Zhao i in. (2024) | Findings EMNLP, 9786–9805 · 10.18653/v1/2024.findings-emnlp.572 | survey | EN, szeroki przekrój modeli i gatunków | Taksonomia detekcji (watermark/statystyczne/neuronowe); problemy generalizacji, ataki | EVIDENCE | P |
| A2 | Wu, Yang, Zhan i in. (2025) | Computational Linguistics 51(1):275–338 · 10.1162/coli_a_00549 | survey | EN, wielomodelowy | Detekcja jako klasyfikacja binarna; problemy OOD i wadliwych ewaluacji | EVIDENCE | P |
| A3 | Fraser, Dawkins, Kiritchenko (2025) | JAIR 82:2233–2278 · 10.1613/jair.1.16665 | survey | EN; czynniki wykrywalności | Ludzie ~53% trafności na sparafrazowanym GPT-3; czynniki: model, gatunek, parafraza | EVIDENCE | P |
| A4 | Tang, Chuang, Hu (2024) | CACM 67(4):50–59 · 10.1145/3624725 | survey | EN; ChatGPT; newsy/Wikipedia/ELI5 | Cechy lingwistyczne (słownik, POS, zależności) jako słabe sygnały; tekst LLM mniej emocjonalny, powtarza terminy | EVIDENCE | P |
| A5 | Gehrmann, Strobelt, Rush (2019) | ACL 2019 demo, 111–116 · 10.18653/v1/P19-3019 | badanie | EN; GPT-2/BERT; pary wyrównane (newsy, książki, abstrakty) | GLTR: statystyki rankingu tokenów; AUC 0,85–0,87; ludzie 54,2%→72,3% z narzędziem | EVIDENCE | P |
| A6 | Uchendu, Ma, Le i in. (2021) | Findings EMNLP, 2001–2016 · 10.18653/v1/2021.findings-emnlp.172 | benchmark | EN; newsy polityczne (gatunek kontrolowany); 19 generatorów | 200 tys. próbek; GPT-3 najbardziej „ludzki” (najniższe F1 detektorów) | EVIDENCE | P |
| A7 | Mitchell, Lee, Khazatsky i in. (2023) | ICML 2023 (PMLR 202) · arXiv:2301.11305 | badanie | EN (+DE); newsy/Wiki/WritingPrompts | DetectGPT: AUROC 0,95; transfer między modelami ograniczony | EVIDENCE | P |
| A8 | Hans i in. (2024) | ICML 2024 · arXiv:2401.12070 | badanie | EN; ChatGPT | Binoculars: kontrast perplexity/cross-perplexity, >90% detekcji przy 0,01% FPR | EVIDENCE | P |
| A9 | Sadasivan, Kumar, Balasubramanian i in. (2023; TMLR 2025) | TMLR · arXiv:2303.11156 | badanie teoretyczno-empiryczne | EN | Granica detekcji: AUROC ≤ ½+TV−TV²/2; parafraza rekurencyjna obniża watermark ~97%→~80%, zero-shot ~96,5%→~25% | EVIDENCE | P |
| A10 | Krishna, Song, Karpinska i in. (2023) | NeurIPS 2023 · arXiv:2303.13408 | badanie | EN; Wikipedia/XSum/PG19 | DIPPER: DetectGPT 70,3%→4,6% przy FPR 1%; watermark 100%→57,2%; obrona: retrieval 80–97% | EVIDENCE | P |
| A11 | Dugan, Ippolito, Kirubarajan i in. (2024) | ACL 2024, 12445–12467 · 10.18653/v1/2024.acl-long.674 | benchmark | EN; 11 modeli, 8 domen, 11 ataków; 12 detektorów | Detektory łatwo oszukiwane przez niewidziane modele/ataki; wcześniejsze benchmarki zawyżały wyniki | EVIDENCE | P |
| A12 | Wang i in. (organizatorzy, 2024) | SemEval-2024 Task 8 · 10.18653/v1/2024.semeval-1.279 | shared task | EN + 8 języków; ChatGPT/davinci/BLOOMz i in. | Spadek wyników poza widzianymi domenami/modelami; 126 zespołów | EVIDENCE | P |
| A13 | Weber-Wulff, Anohina-Naumeca, Bjelobaba i in. (2023) | IJ Educational Integrity 19:26 · 10.1007/s40979-023-00146-z | test wielonarzędziowy | EN; ChatGPT; 54 dokumenty, 756 testów | 14 narzędzi „neither accurate nor reliable”; po parafrazie ~26%; FP ~2% (11% dla MT) | EVIDENCE | P |
| A14 | Elkhatat, Elsaid, Almeer (2023) | IJ Educational Integrity · 10.1007/s40979-023-00140-5 | badanie | EN | Skuteczność narzędzi detekcji ograniczona; edycja obniża detekcję | EVIDENCE | P |
| A15 | Liang, Yuksekgonul, Mao, Wu, Zou (2023) | Patterns 4(7):100779 · 10.1016/j.patter.2023.100779 | badanie | EN; eseje TOEFL (L2) vs 8-klasiści USA; 7 detektorów | 61,3% esejów L2 fałszywie jako AI (~0% FP dla natywnych dzieci); źródło: niższa perplexity; self-edit 100%→13% | EVIDENCE | P |
| A16 | EvoBench (2025) | Findings ACL 2025 · 10.18653/v1/2025.findings-acl.754 | benchmark | EN; aktualizacje GPT-4o co ~3 mies. | 14 metod traci do 25% skuteczności przy ewoluujących modelach; statyczne benchmarki mylą | EVIDENCE | P |
| A17 | Bordalejo i in. (2025) | Int J Educ Technol High Educ · 10.1186/s41239-025-00505-5 | badanie | EN; narzędzia poprawiające pisanie (np. Grammarly) | Narzędzia wspomagające pisanie wywołują FP detektorów, zwłaszcza u nie-native'ów | EVIDENCE | P |
| A18 | Kobak, González-Márquez, Horvát, Lause (2025) | Science Advances 11(27):eadt3813 · 10.1126/sciadv.adt3813 | badanie korpusowe | EN; 15,1 mln abstraktów PubMed 2010–2024 | Nadwyżkowe słowa 2024 to 66% czasowniki, 14% przymiotniki („delves” ×28); ≥13,5% abstraktów 2024 z LLM | EVIDENCE | P |
| A19 | Liang, Zhang, Wu i in. (2025) | Nature Human Behaviour 9(12):2599–2609 · 10.1038/s41562-025-02273-8 | badanie korpusowe | EN; 1,12 mln prac (arXiv, bioRxiv, Nature portfolio) | Stały wzrost użycia LLM; CS do 22% abstraktów; słowa „realm, intricate, showcasing, pivotal” rosną od 2023 | EVIDENCE | P |
| A20 | Juzek, Ward (2025) | COLING 2025 · aclanthology.org/2025.coling-main.426 (Crossref: brak rekordu) | badanie | EN | Mechanizm nadreprezentacji leksykalnej: rola RLHF/LHF | EVIDENCE (lok. ACL Anthology) | P |
| A21 | Geng, Trotta (2025) | Findings ACL 2025 (koewolucja człowiek–LLM) | badanie korpusowe | EN; tekst akademicki | Spadek użycia „delve” po upublicznieniu cechy — sygnały dryfują | EVIDENCE | P |
| A22 | Mak, Walasek (2025) | Computers and Education: AI 9:100507 · 10.1016/j.caeai.2025.100507 | badanie korpusowe (2016–2025) | EN; 4820 raportów studentów UK | Markery GPT eksplodowały w 2024, spadły w 2025; rewrite'y GPT przypominają teksty studentów post-2022 | EVIDENCE | P |
| A23 | Lu i in. (2023) | arXiv:2305.10847 | preprint | EN | Promptowanie prowadzi LLM do omijania detektorów | BACKGROUND (preprint) | P |
| A24 | Gritsai i in. (2024) | arXiv:2410.14677 | preprint | EN | Jakość zbiorów ewaluacyjnych zawyża wyniki detektorów | BACKGROUND (preprint) | P |
| A25 | Tarım, Onan (2025) | arXiv:2507.10475 | preprint | EN | Dyfuzyjne LM naśladują ludzką perplexity/burstiness → wysokie FN klasyfikatorów | BACKGROUND (preprint) | P |
| A26 | OpenAI (2023-07) | openai.com (aktualizacja ogłoszenia) | rekord pierwotny | EN | Wycofanie „AI Classifier”: czułość 26%, 9% FP; powód: „low rate of accuracy” | OBJECT-OF-STUDY | P |

## B. Percepcja ludzka, jakość, preferencje

| ID | Źródło | Venue · Lok | Typ | Populacja/język | Kluczowy wynik | Dysp. | PL |
|---|---|---|---|---|---|---|---|
| B1 | Jakesch, Hancock, Naaman (2023) | PNAS 120(11) · 10.1073/pnas.2208839120 | 6 eksp., N≈4600 | EN (MTurk, USA) | Laicy nie odróżniają self-presentations AI; mylne heurystyki (zaimki 1. os., kontrakcje, tematy rodzinne→„ludzkie”); tekst AI może być „bardziej ludzki niż ludzki” | EVIDENCE | P |
| B2 | Köbis, Mossink (2021) | Computers in Human Behavior 114:106553 · 10.1016/j.chb.2020.106553 | 2 eksp., N=830 | EN | Poezja GPT-2: przy kuratorze ludzie nie odróżniają AI; lekka awersja do poezji algorytmicznej | EVIDENCE | P |
| B3 | Porter, Machery (2024) | Scientific Reports 14 · 10.1038/s41598-024-76900-1 | 2 eksp., N≈2330 | EN (Prolific, USA) | Wiersze ChatGPT-3.5: detekcja 46,6% (<przypadek); bez etykiety AI oceniane WYŻEJ; etykieta „AI” obniża oceny także tekstów ludzkich | EVIDENCE | P |
| B4 | Dugan, Ippolito, Kirubarajan i in. (2023) | AAAI 37(11) · 10.1609/aaai.v37i11.26501 | eksperyment, >21 tys. adnotacji | EN; newsy/przepisy/opowiadania | RoFT: znajdowanie granicy człowiek→maszyna lepsze niż przypadek, ale trudne; błędy maszyn to commonsense/relewancja, nie gramatyka | EVIDENCE | P |
| B5 | Clark, August, Serrano i in. (2021) | ACL-IJCNLP 2021, 7282–7296 · 10.18653/v1/2021.acl-long.565 | eksperyment | EN | Niewytrenowani na poziomie przypadku; trening → ~55% (głównie opowiadania); zgoda między sędziami α≤0,11 | EVIDENCE | P |
| B6 | Jakesch, Bhat, Buschek i in. (2023) | CHI 2023 · 10.1145/3544548.3581196 | eksperyment | EN (USA) | Co-writing z opiniowanym LM zmienia poglądy piszących (2× częstsza zgodność ze stanowiskiem asystenta) | EVIDENCE | P |
| B7 | Zhang, Gosline (2023) | Judgment and Decision Making 18 · 10.1017/jdm.2023.37 | eksperyment 3×4 | EN | Reklamy: bez ujawnienia AI oceniane wyżej; po ujawnieniu bonus za autorstwo ludzkie, brak kary za AI („human favoritism, not AI aversion”) | EVIDENCE | P |
| B8 | Raj, Berg, Seamans (2026) | JEP: General 155(4):896–915 · 10.1037/xge0001889 | 16 prerej. eksp., N=27491 | EN (USA, 2023–2024) | Kara za ujawnienie AI: −6,2% średnio; oporna na interwencje; mediacja: perceived authenticity | EVIDENCE | P |
| B9 | Sears, Weisberg (2026) | Judgment and Decision Making · 10.1017/jdm.2026.10042 | 3 eksp., N=2587 | EN (USA) | Detekcja 39,4% i 52%; opowiadania AI oceniane wyżej (~6%), ale etykieta „human” podnosi oceny — „ludzie wolą teksty AI, wierząc, że są gorsze” | EVIDENCE | P |
| B10 | Goldstein, Chao, Grossman i in. (2024) | PNAS Nexus 3(2):pgae034 · 10.1093/pnasnexus/pgae034 | eksperyment, N=8221 | EN (USA) | Perswazja: propaganda AI 43,5% vs ludzka 47,4% (kontrola 24,4%); human-in-the-loop ~53% | EVIDENCE | P |
| B11 | Zhu, Weissburg, Zhang, Wang (2025) | Findings ACL 2025, 25907–25914 · 10.18653/v1/2025.findings-acl.1329 | 3 eksp. | EN | W teście ślepym brak różnic; z etykietami preferencja „Human Generated” >30 pkt; wzorzec utrzymuje się przy zamienionych etykietach (bias czysto etykietowy) | EVIDENCE | P |
| B12 | Appel, Malecki, Messingschlager, Winkler (2025) | Humanities & Social Sciences Communications 12 · 10.1057/s41599-025-06341-2 | 2 badania | DE | Brak różnic w nowości/przyjemności opowiadań; niższa narrative transportation dla AI, w pełni mediowana rzadszymi zaimkami osobowymi | EVIDENCE | P |
| B13 | Russell, Karpinska, Iyyer (2025) | ACL 2025 · 10.18653/v1/2025.acl-long.267 | badanie | EN | Eksperci-części użytkownicy LLM (głosowanie 5): błędna klasyfikacja 1/300, lepiej niż detektory, odporni na parafrazę — KONTRA „ludzie nie wykrywają” | EVIDENCE | P |
| B14 | Wang i in. (2025) | arXiv:2502.11614 | preprint | 9 języków, 16 zbiorów | Detekcja ludzka 87,6% — kontr-wynik (kwestionuje B1/B5); różnice w konkretności i niuansach kulturowych | BACKGROUND (preprint) | P |
| B15 | Zaitsu i in. (2025) | PLOS ONE · 10.1371/journal.pone.0335369 | badanie | JA (japoński); 7 modeli | Laicy zawodni; o1 podnosi błędną pewność; stylometria wykrywa autorstwo | EVIDENCE | P |
| B16 | Pataranutaporn i in. (2023) | Nature Machine Intelligence · 10.1038/s42256-023-00720-7 | eksperyment | EN | Priming przekonań o AI zmienia postrzeganą wiarygodność/empatię (percepcja zależna od ramy) | EVIDENCE | P |
| B17 | Magni, Park, Chao (2023) | J Business & Psychology · 10.1007/s10869-023-09910-x | eksperymenty | EN | Uprzedzenie wobec kreatywności AI (oceny zależne od etykiety) | EVIDENCE | P |
| B18 | Hitsuwari, Ueda, Yun, Nomura (2023) | Computers in Human Behavior 139:107502 · 10.1016/j.chb.2022.107502 | eksperyment | JA | Haiku: współpraca człowiek–AI; oceny estetyczne | EVIDENCE | P |
| B19 | van der Lee, Gatt, van Miltenburg i in. (2020) | Computer Speech & Language 67:101151 · 10.1016/j.csl.2020.101151 | przegląd metod | EN | Wytyczne ludzkiej oceny tekstu generowanego (miary jakości, naturalności) — operacjonalizacja Q1 | EVIDENCE | P |
| B20 | Noy, Zhang (2023) | Science 381(6654):187–192 · 10.1126/science.adh2586 | RCT prerej., N=453 | EN | ChatGPT w zadaniach pisarskich: czas −40%, jakość +18% | EVIDENCE | P |
| B21 | Wu, Chen, i in. (2023) | PNAS 120(34):e2305016120? — NIEZASTOSOWANE | — | — | Pozycja wycofana — nie w bazie dowodów | REJECT (nieistotne) | — |

## C. Stylometria korpusowa i efekty warunków generacji

| ID | Źródło | Venue · Lok | Kluczowy wynik | Dysp. | PL |
|---|---|---|---|---|---|
| C1 | Holtzman, Buys, Du, Forbes, Choi (2020) | ICLR 2020 · arXiv:1904.09751 | Greedy/beam + niska temperatura → degeneracja (pętle powtórzeń, tekst „bland”); nucleus sampling przywraca różnorodność | EVIDENCE | P |
| C2 | Pillutla, Swayamdipta, Zellers i in. (2021) | NeurIPS 2021 · arXiv:2102.01454 | MAUVE mierzy dystans dystrybucyjny człowiek–model; zależy od dekodowania (temperatura, top-k) | EVIDENCE | P |
| C3 | Li, Galley, Brockett, Gao, Dolan (2016) | NAACL 2016 · arXiv:1510.03055 | Metryki distinct-1/2 — standard pomiaru różnorodności leksykalnej | EVIDENCE | P |
| C4 | Kirk, Mediratta, Nematzadeh i in. (2024) | ICLR 2024 · arXiv:2310.06452 | RLHF (vs SFT) redukuje różnorodność wyjść, zwłaszcza w generacji kreatywnej | EVIDENCE | P |
| C5 | Gude, Santos-Rios, Bond i in. (2026) | ACL 2026 Long · 10.18653/v1/2026.acl-long.1803 | Dwie generacje LLM: instruction-tuned mają NIŻSZĄ różnorodność syntaktyczną i leksykalną niż starsze; ludzie — wyższą różnorodność syntaktyczną niż wszystkie LLM (gatunek kontrolowany: news leads) | EVIDENCE | P |
| C6 | Guo, Shang, Clavel (2025) | TACL 13:1507–1526 · arXiv:2412.10271 (DOI via TACL niepotwierdzony) | Efekty preference tuning zależą od domeny zadania — wyniki odbiegają od C4 | EVIDENCE (lok. arXiv) | P |
| C7 | Juzek, Ward (2025) | arXiv:2508.01930 | Instruct nadużywa „nuanced” +8342%, „firstly” +4794%, „reliance” +3193%; średnio ludzie preferują warianty z nadreprezentowanymi słowami (52,4% vs 47,6%, p<0,01; N≈4 039 ocen, Prolific, demografia emulująca LHF) — ale nierównomiernie wg słowa: dla „nuanced” odwrotnie (46,6% vs 54,5%) | BACKGROUND (preprint warsztatowy, BIAS 2025 @ ECML-PKDD) | P |
| C8 | Milička, Marklová, Cvrček (2025) | arXiv:2509.22996 | AI-Brown/AI-Koditex (EN+CZ, 16 modeli); davinci-002 T=0 → mode collapse; podstawa do badań rejestru | BACKGROUND (preprint) | P |
| C9 | Berber Sardinha (2024) | Applied Corpus Linguistics 4(1):100083 · 10.1016/j.acorp.2023.100083 | „Register deficit” ChatGPT 3.5: teksty AI nie naśladują profili rejestrowych, łatwa klasyfikowalność (4 rejestry, 800 tekstów) | EVIDENCE | P |
| C10 | Bagdasarov, Alves (2025) | LM4DH 2025, 38–47 · 2025.lm4dh-1.4 | Abstrakty ACL: ludzie — wyższa zmienność syntaktyczna, LLM — wyższa zmienność leksykalna; klasyfikacja >90% (gatunek kontrolowany) | EVIDENCE | P |
| C11 | Carlo, Takeuchi (2026) | Int J Applied Linguistics · 10.1111/ijal.70284 | CEFR-conditioned LLM vs pisanie L2: „forma bez funkcji” — strukturalne sygnały poziomu bez zróżnicowania perswazji/elaboracji; wyjścia LLM jednolite, skupione w centrum przestrzeni ludzkiej | EVIDENCE | P |
| C12 | Demir, Egbert (2026) | Applied Corpus Linguistics (DOI niezweryfikowany) | Dopasowanie rejestrowe ChatGPT (artykuły, podręczniki; biologia, historia) | UNVERIFIED — cytować dopiero po weryfikacji DOI | P |

## B+. Uzupełnienia po rewizji sceptycznej (2026-08-17)

| ID | Źródło | Venue · Lok | Kluczowy wynik | Dysp. | PL |
|---|---|---|---|---|---|
| B22 | Fiedler, Döpke (2025) | Int Review of Economics Education 49:100321 · 10.1016/j.iree.2025.100321 | 63 wykładowców, fragmenty prac niemieckich: detekcja AI ~57% (teksty profesjonalne <20%), bez istotnej różnicy vs detektory; oceny jakości niezależne od (faktycznego/przypisywanego) autorstwa — eksperci dziedzinowi BEZ ekspozycji na LLM ≈ przypadek | EVIDENCE | P |
| B23 | Ramos (2026) | arXiv:2604.03437 | PRISMA, 30 badań (tekst/obraz/głos): ludzie generalnie zawodni jako detektory; dokładność skupiona wokół przypadku; ekspertyza domenowa nie pomagała konsekwentnie | BACKGROUND (preprint) | P |
| A27 | Terčon, Dobrovoljc (2025) | arXiv:2510.05136 | Survey cech lingwistycznych tekstu AI: bardziej formalny/bezosobowy, niższa różnorodność leksykalna, powtarzalność; koncentracja badań na EN i rodzinie GPT; zaniedbana wrażliwość na prompt | BACKGROUND (preprint) | P |
| F15 | Mazurkiewicz-Sokołowska (2025) | LNNS 1643:250–265 · 10.1007/978-3-032-06611-4_20 (imię autorki niezweryfikowane) | 480 odpowiedzi ChatGPT (EN/DE/PL): analiza kohezji i poprawności; „przeużywane konstrukcje” — bezpośredni, jakościowy punkt danych PL | EVIDENCE | D |

## D. Konfudery (tłumaczenie, L2, prosty język)

| ID | Źródło | Venue · Lok | Kluczowy wynik | Dysp. | PL |
|---|---|---|---|---|---|
| D1 | Volansky, Ordan, Wintner (2013) | Digital Scholarship in the Humanities 30(2) · 10.1093/llc/fqt031 | Translationese: realne, mierzalne cechy odróżniające tekst tłumaczony od oryginalnego (ML) | EVIDENCE | P |
| D2 | Baroni, Bernardini (2005) | Literary and Linguistic Computing 21(1) · 10.1093/llc/fqi039 | ML odróżnia tekst tłumaczony od oryginalnego z wysoką trafnością | EVIDENCE | P |
| D3 | Koppel, Ordan (2011) | ACL 2011 | „Dialekty translationese” — różne pary językowe dają różne profile cech | EVIDENCE | P |
| D4 | Tirkkonen-Condit (2002) | Target 14(2) · 10.1075/target.14.2.02tir | Translationese: mit czy fakt empiryczny? — wczesna operacjonalizacja | EVIDENCE | P |

## E. Gatunki: UI, błąd, onboarding, dokumentacja, reklama, prosty język

| ID | Źródło | Venue · Lok | Kluczowy wynik | Dysp. | PL |
|---|---|---|---|---|---|
| E1 | Ayre, Bonner, Muscat i in. (2024) | JAMA Network Open 7(10) · 10.1001/jamanetworkopen.2024.37955 | RCT: plain language poprawia czytelność (+2,48 grade, d=0,99) i ocenę stylu bez utraty treści | EVIDENCE | P |
| E2 | Krieger, Neil, Strekalova, Sarge (2016) | JNCI 109(3):djw233 · 10.1093/jnci/djw233 | Plain language nie zawsze optymalny: moderacja przez health literacy (u najniżej piśmiennych metafora > plain language) | EVIDENCE | P |
| E3 | Martínez, Mollica, Gibson (2022) | Cognition 224:105070 · 10.1016/j.cognition.2022.105070 | Trudność tekstów prawnych pochodzi z pisania (składnia, zależności długodystansowe, strona bierna), nie z pojęć | EVIDENCE | P |
| E4 | Masson, Waldron (1994) | Applied Cognitive Psychology 8(1):57–70 · 10.1002/acp.2350080107 | Redrafting do prostego języka niezawodnie poprawia rozumienie, ale poziom absolutny pozostaje niski — LIMIT prostego języka | EVIDENCE | P |
| E5 | Mautone, Mayer (2001) | J Educational Psychology 93(2):377–389 · 10.1037/0022-0663.93.2.377 | Signaling (zapowiedź struktury, nagłówki, wskaźniki) bez dodawania treści poprawia transfer wiedzy; mediana d≈0,60 | EVIDENCE | P |
| E6 | Khandwala, Dong (2019) | CHI EA 2019 · 10.1145/3290607.3312978 | Kosmetyczne zmiany formatowania komunikatu błędu: +29,5 pkt% zrozumienia (N=52, LBW — słabszy status) | EVIDENCE (LBW) | P |
| E7 | Tzeng (2006) | Int J Human-Computer Studies 64(12):1230–1242 · 10.1016/j.ijhcs.2006.08.011 | Przeprosinowe komunikaty błędów preferowane przez użytkowników o grzecznych „skryptach społecznych” | EVIDENCE | P |
| E8 | Passalacqua, Morin, Sénécal i in. (2020) | Multimodal Technologies and Interaction 4(3):41 · 10.3390/mti4030041 | Tutorial onboardingu poprawia flow u nie-ekspertów; ekspertom nie szkodzi | EVIDENCE | P |
| E9 | Lee, Lam, Hui (2025) | Displays 87:102975 · 10.1016/j.displa.2025.102975 | Cechy przewodników onboardingu przewidują zaangażowanie (85% dokładność modelu; N=1194) | EVIDENCE | P |
| E10 | Bowman, Cooney, Newbold i in. (2023) | Int J Human-Computer Studies 184:103181 · 10.1016/j.ijhcs.2023.103181 | Grzeczność chatbotów odbierana ambiwalentnie: troskliwa vs przesadnie przepraszająca/protekcjonalna — zależność od kontekstu | EVIDENCE | P |
| E11 | Lazebnik, Zalmanson, Mokryn (2025) | PACM HCI 9(7) · 10.1145/3757631 | Grzeczność użytkowników wobec AI spada w czasie i eroduje szybciej niż wobec ludzi | EVIDENCE | P |
| E12 | Geng, Cao, Wei, Yang, Tan (2025) | Frontiers in Nutrition 12:1576478 · 10.3389/fnut.2025.1576478 | Styl języka reklamy → zamiar zakupu, mediowany przez processing fluency | EVIDENCE | P |
| E13 | Portmann (2022) | Discourse, Context & Media 48:100622 · 10.1016/j.dcm.2022.100622 | UX writing jako praktyka dyskursywna („symbolic violence of little texts”) — jakościowa podstawa normy gatunkowej mikrokopii | EVIDENCE | P |
| E14 | Carroll (1990) | The Nurnberg Funnel, MIT Press | Minimalist instruction: dokumentacja oparta na zadaniach; obszerne podręczniki nie są czytane | EVIDENCE (klasyka) | P |

## F. Polski — norma, uzus, korpusy, NLP, AI po polsku

| ID | Źródło | Venue · Lok | Kluczowy wynik | Dysp. | PL |
|---|---|---|---|---|---|
| F1 | Przepiórkowski, Bańko, Górski, Lewandowska-Tomaszczyk (red., 2012) | NKJP, PWN (ISBN 978-83-01-16700-4) | Referencyjny korpus polszczyzny >1,5 mld słów; fundament uzusu | EVIDENCE (korpus) | D |
| F2 | Pęzik (2020) | Forum Lingwistyczne 7:133–150 | MoncoPL — korpus monitorujący >5,6 mld tokenów polszczyzny internetowej; moduł kolokacji | EVIDENCE (korpus) | D |
| F3 | Miechowicz-Mathiasen, Scheffler (2008) | w: Elements of Slavic and Germanic Grammars, Peter Lang, 89–111 | Szyk czasownika podobać się w korpusie IPI PAN — 6 porządków argumentów potwierdzonych w uzusie | EVIDENCE | D |
| F4 | Grochowski (2007) | Prace Filologiczne 53:241–252 | Opozycja szyku neutralnego i nacechowanego (klityka się, porządek frazy nominalnej) | EVIDENCE | D |
| F5 | Siewierska (1993) | Journal of Linguistics 29(2):233–265 · 10.1017/s0022226700000323 | Szyk polski: waga syntaktyczna vs struktura informacyjna (Topic>Comment) | EVIDENCE | D |
| F6 | Zuchewicz (2024) | LingBaW 10:265–281 · 10.31743/lingbaw.18023 | Aspekt czasownika uwarunkowany pragmatycznie („pragmatic contract”), weryfikacja na NKJP | EVIDENCE | D |
| F7 | Rybak, Mroczkowski, Tracz, Gawlik (2020) | ACL 2020, 1191–1201 · 10.18653/v1/2020.acl-main.111 | KLEJ — benchmark rozumienia polszczyzny (9 zadań) | EVIDENCE | D |
| F8 | Mroczkowski, Rybak, Wróblewska, Gawlik (2021) | BSNLP 2021 · 10.18653/v1/2021.bsnlp-1.1 | HerBERT — polski model językowy (korpusy PL) | EVIDENCE | D |
| F9 | Kocmi, Limisiewicz, Stanovsky (2020) | WMT 2020 · arXiv:2010.06018 | Ewaluacja MT PL: błędy rodzaju gramatycznego w tłumaczeniu zawodów | EVIDENCE | D |
| F10 | Przybyła, Strebeyko, Wróblewska (2025) | PolEval 2025 · aclanthology.org/2025.poleval-main.2 | Zadanie „Śmigiel”: zbiór 64 538 tekstów PL (ludzkie vs 8 LLM, m.in. Bielik, PLLuM); dokładność spada na niewidzianych domenach/modelach | EVIDENCE | D |
| F11 | Strebeyko, Wróblewska, Przybyła (2025) | LREC-COLING 2025 · huggingface.co/datasets/strebeyko/smigiel | Śmigiel Dataset — fundament detekcji MGT po polsku | EVIDENCE | D |
| F12 | Stachura (2025) | PolEval 2025 · aclanthology.org/2025.poleval-main.4 | Binoculars z polskimi modelami — 1. miejsce zero-shot w Śmigiel; unsupervised > supervised na niewidzianych generatorach | EVIDENCE | D |
| F13 | Mazur (2024) | LingVaria 19(1):119–138 · 10.12797/LV.19.2024.37.08 | Błędy językowe ChatGPT po polsku (prompty maturalne 2023): najwięcej w konstrukcjach złożonych; klasyfikacja typów błędów | EVIDENCE | D |
| F14 | Prościak, Prościak, Suszyło-Martula, Sroka (2023) | Polonistyka. Innowacje 18:173–188 | ChatGPT PL: błędy rzeczowe, ortograficzne, stylistyczne, językowe; ankieta ogólnopolska | EVIDENCE | D |

## G. Normatywy i korpusy jako podstawa normy/uzusu

| ID | Źródło | Lok | Rola | Dysp. | PL |
|---|---|---|---|---|---|
| G1 | Rada Języka Polskiego przy Prezydium PAN (2026) | Sprawozdanie o stanie ochrony języka polskiego za 2023–2024, rjp.pan.pl | NORMATYW — stan normy (ustawowy organ) | D |
| G2 | Markowski i in. / RJP (2017) | Sprawozdanie za 2014–2015 (druk senacki 510) | NORMATYW — tradycja oceny stanu polszczyzny | D |
| G3 | PWN (wyd. aktualne) | Wielki słownik ortograficzny PWN / sjp.pwn.pl | NORMATYW — pisownia, fleksja w hasłach | D |
| G4 | ISO (2023) | ISO 24495-1:2023 Plain language | NORMATYW — zasady prostego języka (relevant, findable, usable, understandable) | D |
| G5 | W3C (2023) | WCAG 2.2 | NORMATYW — dostępność (pomocniczo dla UI) | D |
| G6 | Atkinson (1984) | Our Masters' Voices, Methuen | BACKGROUND — retoryka trójczłonowych list w przemówieniach (podstawa dla „kiedy schematy są uzasadnione”) | D |

## H. OBJECT-OF-STUDY (folklor i twierdzenia dostawców — nie dowód)

| ID | Obiekt | Charakterystyka | Rola w przeglądzie |
|---|---|---|---|
| H1 | Listy „zwrotów AI” (AI Phrase Finder, „SLOP Detector”, artykuły The Verge/Forbes, tweet P. Grahama o „delve”) | Samodzielnie publikowane listy słów bez kontroli bazy i recenzji | Folklor — pokazuje, że twierdzenia „słowo X = sygnał AI” krążą bez podstawy statystycznej; heurystyki te karzą nie-native'ów (zgodnie z A15) |
| H2 | Deklaracje dostawców detektorów (Copyleaks „99,84%”, Turnitin „FPR <1%”) | Marketing bez niezależnej ewaluacji | Kontrast z A13/A11 — deklaracje nie wytrzymują testów niezależnych |
| H3 | Wycofanie klasyfikatora OpenAI (2023-07) | Rekord pierwotny producenta | Fakt historyczny: producent przyznał „low rate of accuracy” |
| H4 | NN/g (Nielsen Norman Group) | Autorytet branżowy, nie recenzowany | Norma gatunkowa UX (ostrożnie, jako opinia ekspercka branży) |

## Nota o pozycjach wykluczonych / niezweryfikowanych
Pełna lista w EXCLUDED.md. Najważniejsze: Demir & Egbert 2026 (DOI niezweryfikowany
— cytować dopiero po potwierdzeniu), praca licencjacka „Identifying GPT” (Princeton;
częsty „dowód” mitu o burstiness), blogi SEO i marketing vendorów, HAL preprint
Esperança-Rodier (MT FR→PL, autorstwo niezweryfikowane), CEEOL 1412510 (dane
niekompletne).

## Uwagi o ryzyku błędu (skrót)
- Badania percepcji: próby WEIRD (USA/Niemcy/Japonia); miary heterogeniczne (trażność, skale ocen); ryzyko błędu NISKIE–UMIARKOWANE dla B1, B8 (pre-rejestracja, ale brak replikacji niezależnej), B3; WYŻSZE dla B9 (nowość), B14 (preprint), A25 (preprint).
- Badania detekcji: ryzyko obciążenia benchmarków (A11, A16) — wnioski o NIESTABILNOŚCI detekcji są wzmacniane, nie osłabiane, przez to obciążenie.
- Badania korpusowe (A18, A19, A22): silne (skala, kontrfaktyczna ekstrapolacja); ograniczenie: sygnał populacyjny ≠ marker indywidualny.
- Polski: F10–F14 małe liczebnie, ale bezpośrednie; luka: brak eksperymentów percepcji AI-polszczyzny przez polskich czytelników.
