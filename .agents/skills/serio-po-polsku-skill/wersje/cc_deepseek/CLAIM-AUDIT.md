# CLAIM-AUDIT.md — karty kluczowych tez oraz audyt cytacja–teza

CC DeepSeek · 2026-08-17 · Format karty: teza → dowód/jakość → populacja →
konfudery → zgodne → przeciwne/zerowe → replikacja/transfer → warunek
falsyfikacji → najwęższe sformułowanie → **werdykt**.
Werdykty: **REGUŁA** (podstawa dla skilla, z warunkami wyłączenia) ·
**SYGNAŁ KONTEKSTOWY** (prawdziwy tylko w warunkach X) · **HIPOTEZA**
(wymaga testu) · **ODRZUCONA** (nie używać jako reguły).

---

## K1. „Istnieje stabilna, rozpoznawalna lista cech/zwrotów, która niezawodnie odróżnia tekst AI od ludzkiego”

- **Dowód/jakość:** mieszany; nadużywanie słów mierzone na dużą skalę (A18 Kobak: 15,1 mln abstraktów, kontrfaktyczna ekstrapolacja; A19 Liang: 1,12 mln prac) — mocne jako SYGNAŁ POPULACYJNY; detektory oparte na cechach testowane niezależnie (A11 RAID, A13 Weber-Wulff, A16 EvoBench) — wysokiej jakości i negatywne dla „niezawodności”.
- **Populacja:** EN (abstrakty biomedyczne, preprinty, recenzje); brak danych PL o nadreprezentacji słów (luka).
- **Konfudery:** gatunek, rok (trendy językowe), instrukcje „pisz profesjonalnie”, tłumaczenie (D1–D4), L2 (A15), narzędzia poprawiające pisanie (A17). Słowo „nadreprezentowane” pojawia się też w tekstach ludzkich naśladujących styl profesjonalny.
- **Zgodne:** A18, A19, A20 (mechanizm RLHF), A22 (markery u studentów), C7 (preferencja ludzi).
- **Przeciwne/zerowe:** A21 i A22 pokazują DRYF sygnałów (spadek „delve” po upublicznieniu); A9 teoretyczna granica detekcji; A10 parafraza → 4,6%; A25 dyfuzyjne LM naśladują ludzką perplexity/burstiness.
- **Replikacja/transfer:** zjawisko nadwyżkowego słownictwa zreplikowane w publikacjach biomedycznych (A18) i recenzjach (Liang ICML 2024, arXiv:2403.07183); krytyka wrażliwości estymatora na wybór listy słów (Zenodo 2026, 10.5281/zenodo.21310387 — preprint). Transfer PL: brak badań.
- **Warunek falsyfikacji:** lista byłaby niezawodna, gdyby trafność klasyfikacji indywidualnych tekstów utrzymywała się >90% przy 1% FPR po kontroli gatunku, L2 i parafrazy — wszystkie niezależne testy temu przeczą.
- **Najwęższe sformułowanie:** „W tekstach wytwarzanych masowo przez konkretne modele w konkretnych gatunkach (np. abstrakty biomedyczne EN 2023–2025) obserwuje się mierzalną nadreprezentację określonego słownictwa stylistycznego, którą można wykryć populacyjnie, ale nie jako marker indywidualnego autorstwa; sygnały dryfują w czasie”.
- **Werdykt:** **ODRZUCONA jako reguła indywidualna; SYGNAŁ KONTEKSTOWY jako sygnał populacyjny** (nie blacklista słów).

## K2. „Tekst LLM jest mniej zróżnicowany niż tekst ludzki po kontroli gatunku”

- **Dowód/jakość:** C5 (ACL 2026, gatunek kontrolowany: news leads, dwie generacje modeli) — mocne; C4 (ICLR, RLHF vs SFT); C9 (MDA, 4 rejestry); C10 (abstrakty ACL, >90% klasyfikacja); C11 (CEFR × rejestry). Częściowo sprzeczne kierunki: C6 (efekt zależy od domeny), C10 (LLM wyższa zmienność LEKSYKALNA, ludzie wyższa SYNTAKTYCZNA).
- **Populacja:** EN głównie; C8 (preprint) EN+CZ; brak PL.
- **Konfudery:** generacja modelu (C5: starsze modele bez instruction tuning mają wyższą różnorodność!), temperatura (C1, C2), zadanie, długość (C2).
- **Zgodne:** C1, C2, C4, C5, C9, C11.
- **Przeciwne/zerowe:** C6 (preference tuning nie zawsze redukuje); C10 (wymiar leksykalny odwrócony).
- **Replikacja/transfer:** C5 i C4 niezależne zespoły; transfer poza EN częściowo (C8 CZ; C11 pisanie L2).
- **Warunek falsyfikacji:** teza byłaby fałszywa, gdyby instruction-tuned LLM osiągały różnorodność syntaktyczną ≥ ludzkiej w gatunkach kontrolowanych — przeczy temu C5; ale teza w wersji „leksykalnej” JEST obalona przez C10.
- **Najwęższe sformułowanie:** „Współczesne, instruction-tuned LLM (2024–2026) generują teksty o niższej niż ludzie różnorodności składniowej i (zwykle) leksykalnej, przy czym efekt zależy od gatunku, modelu i parametrów dekodowania”.
- **Werdykt:** **SYGNAŁ KONTEKSTOWY** (z podziałem na wymiar syntaktyczny vs leksykalny; NIE reguła uniwersalna).

## K3. „Ludzie potrafią rozpoznać tekst AI”

- **Dowód/jakość:** seria eksperymentów o łącznym N>35 tys.: B1 (PNAS, 6 eksp.), B5 (ACL), B2, B3, B4, B9 (JDM, N=2587), B15 (PLOS ONE), B12. Kontr-dowody: B13 (eksperci-części użytkownicy: 1/300 błędów), B14 (preprint: 87,6% detekcji wielojęzycznej), B4 (trening poprawia).
- **Populacja:** laicy WEIRD (USA/Niemcy) + Japonia; gatunki: self-presentations, poezja, opowiadania, newsy, przepisy, abstrakty.
- **Konfudery:** trening/ekspozycja na LLM (B5, B9: znajomość AI ↑ detekcję), gatunek (proza kreatywna najtrudniejsza), etykieta (B11 — bias etykietowy), długość tekstu, instrukcje.
- **Zgodne:** B1, B2, B3, B5, B9, B12, B15, B17, B22 (wykładowcy ≈ przypadek), B23 (PRISMA, 30 badań: ludzie zawodni).
- **Przeciwne:** B13 (PIĘCIOOSOBOWY panel częstych użytkowników LLM; pojedynczy ekspert mniej trafny, FP 3,3% na tekstach ludzkich), B14 (preprint), A5 (z narzędziem 72%).
- **Replikacja/transfer:** spójne wyniki „na poziomie przypadku lub niżej” dla laików i ekspertów dziedzinowych bez ekspozycji na LLM w wielu niezależnych zespołach i językach (EN, DE, JA); brak danych PL.
- **Warunek falsyfikacji:** teza „ludzie potrafią” byłaby prawdziwa, gdyby laicy przekraczali przypadek w ślepych testach bez treningu — w większości badań nie przekraczają; wyjątek: eksperci z ekspozycją na LLM.
- **Najwęższe sformułowanie:** „Niewytrenowani czytelnicy nie odróżniają wiarygodnie tekstu LLM od ludzkiego (często na poziomie przypadku lub niżej); trafność rośnie z treningiem, ekspozycją na narzędzia LLM i ograniczeniem do konkretnych gatunków”.
- **Werdykt:** **REGUŁA (wersja ostrożna powyżej); ODRZUCONA wersja „każdy rozpozna na oko”.**

## K4. „Ujawnienie autorstwa AI obniża oceny tekstu; oceny zależą od etykiety, nie od treści”

- **Dowód/jakość:** B8 — najsilniejsze: 16 pre-rejestrowanych eksperymentów, N=27491, kara −6,2%, oporna na interwencje; B3 (etykieta AI obniża oceny także tekstów ludzkich); B11 (bias czysto etykietowy); B7 (faworyzacja ludzi, nie awersja do AI); B16 (priming).
- **Populacja:** EN, USA; teksty kreatywne i perswazyjne.
- **Konfudery:** poprawność polityczna/deklaracje społeczne, znajomość AI, kontekst zawodowy (B7: reklama B2B), kultura (WEIRD).
- **Zgodne:** B3, B8, B11, B17.
- **Przeciwne:** B7 (faworyzacja zamiast kary), B9 (w ślepym teście AI oceniane wyżej).
- **Replikacja/transfer:** B8 to 16 eksperymentów JEDNEGO zespołu (wewnętrzna spójność, brak znanej replikacji niezależnej — jawna luka); transfer PL: brak badań (luka — do testu w ewaluacji skilla).
- **Warunek falsyfikacji:** teza fałszywa, gdyby kara znikała przy ujawnieniu — B8 testował 7 interwencji, kara trwała.
- **Najwęższe sformułowanie:** „W populacjach zachodnich ujawnienie autorstwa AI systematycznie obniża oceny tekstów kreatywnych (średnio o kilka punktów procentowych), niezależnie od faktycznej jakości tekstu”.
- **Werdykt:** **REGUŁA** dla tekstów kreatywnych/EN; HIPOTEZA do replikacji dla polszczyzny.

## K5. „Nadreprezentowane słowa/konstrukcje pochodzą z dostrajania przez ludzkie preferencje (RLHF/LHF) i są preferowane przez oceniających ludzi”

- **Dowód/jakość:** C7 (preprint warsztatowy: LHF → „nuanced” +8342%; średnio ludzie preferują warianty z nadreprezentowanymi słowami 52,4% vs 47,6%, p<0,01, N≈4 039 ocen — ale nierównomiernie: dla „nuanced” odwrotnie 46,6%); A20 (COLING, mechanizm RLHF); C4 (RLHF redukuje różnorodność). Jakość: część mechanistyczna w preprintach — ostrożnie.
- **Populacja:** EN; Llama 3.2-3B (C7); szerzej w A20.
- **Konfudery:** korpus treningowy (pre-LHF już zawiera nadmiary), preferencje anotatorów (kenijskich/amerykańskich), kulturowy profil „profesjonalności”.
- **Zgodne:** A18, A19, C7, A20.
- **Przeciwne:** C6 (efekt zależy od domeny); brak badań zero-efektowych.
- **Replikacja/transfer:** mechanizm zgodny z C4 (niezależny zespół); PL: brak.
- **Warunek falsyfikacji:** teza fałszywa, gdyby nadreprezentacja istniała wyłącznie w korpusach pre-LHF i nie była preferowana przez ludzi — C7 pokazuje preferencję.
- **Najwęższe sformułowanie:** „Część nadreprezentowanego słownictwa LLM jest wzmacniana przez dostrajanie do ludzkich preferencji i bywa preferowana przez ludzi oceniających — dlatego samo usunięcie tych słów NIE jest automatyczną poprawą jakości”.
- **Werdykt:** **SYGNAŁ KONTEKSTOWY** (mechanizm uprawdopodobniony; brak PL).

## K6. „Konstrukcje schematyczne — trójdzielność, wyliczenia, nagłówki, signaling — są błędem stylistycznym”

- **Dowód/jakość:** brak dowodów, że są błędem; dowody PRZECIWNE: E5 (signaling poprawia uczenie, d≈0,60), G6/retoryka klasyczna (trójczłonowe listy to narzędzie retoryczne — Atkinson 1984), E4 (struktura pomaga zrozumieniu), A18 (nadmiar dotyczy SŁÓW, nie struktury).
- **Populacja:** pedagogika, retoryka polityczna, teksty prawne.
- **Konfudery:** norma gatunkowa (nauka vs UI), redundancja vs funkcja (ta sama forma: uzasadniona vs ornament).
- **Zgodne (z „szkodliwością”):** brak badań eksperymentalnych; wyłącznie folklor (H1).
- **Przeciwne:** E5, E4, Atkinson 1984.
- **Replikacja/transfer:** E5 — 3 eksperymenty + metaanaliza efektu signaling; transfer międzyjęzykowy standardowy.
- **Warunek falsyfikacji:** reguła „zakaz trójdzielności” byłaby uzasadniona, gdyby badania pokazywały spadek zrozumienia/jakości przy użyciu list trójczłonowych — nie ma takich badań.
- **Najwęższe sformułowanie:** „Schematyczna STRUKTURA (listy, nagłówki, zapowiedzi) poprawia przyswajanie w gatunkach informacyjnych; problemem jest nadmiar i niewłaściwy rejestr, nie sama konstrukcja”.
- **Werdykt:** **ODRZUCONA jako reguła „usuń konstrukcje”; REGUŁA odwrotna: „oceń funkcję, nie formę”.**

## K7. „Detektory AI niezawodnie odróżniają tekst AI od ludzkiego (też po polsku)”

- **Dowód/jakość:** negatywne i mocne: A13 (14 narzędzi), A11 (12 detektorów), A16 (utrata do 25% przy nowych modelach), A15 (FP 61,3% dla L2), A17, A10. PL: F10 (dokładność spada na niewidzianych domenach/modelach — detekcja PL możliwa, ale krucha), F12.
- **Populacja:** EN głównie; PL — F10 (64,5 tys. tekstów, 8 modeli).
- **Konfudery:** benchmarki statyczne zawyżają wyniki (A16, A24), parafraza, edycja, nowe modele.
- **Zgodne (z zawodnością):** A9, A10, A11, A13, A15, A16, A17, A26.
- **Przeciwne:** A8 (Binoculars >90% przy 0,01% FPR — ale na widzianych domenach i do obejścia parafrazą: A10).
- **Replikacja/transfer:** wielokrotnie replikowane przez niezależne zespoły; PL potwierdzone (F10).
- **Warunek falsyfikacji:** „niezawodność” wymagałaby utrzymania trafności na niewidzianych modelach/domenach — F10 i A16 temu przeczą.
- **Najwęższe sformułowanie:** „Detektory dają niestabilne wyniki: wysokie FP na subpopulacjach (L2, użytkownicy narzędzi korekty), podatność na parafrazę i spadek na nowych modelach; nie mogą być podstawą oskarżeń o autorstwo”.
- **Werdykt:** **ODRZUCONA jako reguła; REGUŁA negatywna: nie opierać decyzji na detektorze.**

## K8. „Prosty język i jasna struktura poprawiają zrozumienie — z limitami”

- **Dowód/jakość:** E1 (RCT, JAMA Netw Open — mocne); E3 (Cognition: trudność z pisania, nie z pojęć); E4 (limit absolutny); E2 (moderacja przez kompetencje czytelnika); G4 (ISO 24495 — norma).
- **Populacja:** EN (zdrowie, prawo); PL: G4 przenosi się normatywnie (prosty język PL ma krajowe wytyczne — brak badań PL w zestawie).
- **Konfudery:** kompetencja zdrowotna/czytelnicza, gatunek (umowy vs UI), kultura.
- **Zgodne:** E1, E3, E4, E5.
- **Przeciwne:** E2 (plain language nie zawsze optymalny), E4 (nadal niski poziom absolutny).
- **Replikacja/transfer:** dobrze replikowane w zdrowiu publicznym; transfer na PL niezbadany eksperymentalnie.
- **Warunek falsyfikacji:** teza fałszywa, gdyby uproszczenie NIE poprawiało rozumienia w RCT — E1 pokazuje poprawę.
- **Najwęższe sformułowanie:** „Upraszczanie składni i struktury poprawia zrozumienie i jakość postrzeganą tekstów informacyjnych (zdrowie, prawo), ale nie jest panaceum: u najniżej piśmiennych działa inaczej (E2), a poziom absolutny bywa niski (E4)”.
- **Werdykt:** **REGUŁA z warunkami wyłączenia** (nie dla gatunków o precyzji prawnej bez zgody właściciela treści; nie „automatyczne upraszczanie”).

## K9. „Tłumaczenie (maszynowe/ludzkie) jest realnym konfunderem 'markera AI'”

- **Dowód/jakość:** D1–D4 (translationese wykrywalne ML — dwie dekady badań); A13 (11% FP detektorów na tekstach MT); F9 (błędy rodzaju w MT PL).
- **Populacja:** różne pary językowe; PL częściowo (F9).
- **Konfudery:** jakość tłumacza, kierunek, para językowa (D3).
- **Zgodne:** D1, D2, D3, D4, A13.
- **Przeciwne:** brak.
- **Replikacja/transfer:** bardzo dobrze replikowane; mechanizm znany od lat 2000.
- **Warunek falsyfikacji:** teza fałszywa, gdyby teksty tłumaczone były nieodróżnialne od oryginalnych — przeczą temu D1/D2.
- **Najwęższe sformułowanie:** „Tekst tłumaczony niesie własne, mierzalne cechy stylistyczne, które mogą być mylone z 'cechami AI' — każda diagnoza stylu musi pytać o pochodzenie tekstu (oryginał vs tłumaczenie vs tekst L2)”.
- **Werdykt:** **REGUŁA** (obowiązkowa kontrola w skillu).

## K10. „Tekst LLM ma 'deficyt rejestru' — nie dostosowuje stylu do gatunku tak jak ludzie”

- **Dowód/jakość:** C9 (MDA, 4 rejestry, ChatGPT 3.5 — łatwa klasyfikowalność); C11 (CEFR × rejestry, 6 modeli instruction-tuned); C5 (gatunek kontrolowany — różnice utrzymują się w nowszych modelach); A6 (GPT-3 najbardziej „ludzki” — ewolucja).
- **Populacja:** EN; ChatGPT 3.5 (C9), 6 modeli (C11), dwie generacje (C5).
- **Konfudery:** wersja modelu (C9 używa 3.5), prompt (rejestr można wymusić), długość, domena treningowa.
- **Zgodne:** C9, C11, C5 (częściowo).
- **Przeciwne/zerowe:** A6 (nowsze modele bliżej ludzkiego profilu); brak badań pokazujących pełne dorównanie.
- **Replikacja/transfer:** C9 i C11 niezależne (Biber MDA); transfer PL: brak.
- **Warunek falsyfikacji:** teza fałszywa, gdyby teksty LLM były nieodróżnialne od ludzkich we wszystkich rejestrach w analizach MDA — C9/C11 pokazują luki, ale luka może zanikać z generacją modeli (trend A6→C5).
- **Najwęższe sformułowanie:** „LLM (zwłaszcza starsze i bez dostrajania rejestrowego) nie różnicują wymiarów stylistycznych między gatunkami tak jak ludzie; nowsze modele zmniejszają, lecz nie domykają tej luki; efekt zależy od modelu i promptu”.
- **Werdykt:** **SYGNAŁ KONTEKSTOWY** (model×gatunek×prompt; do aktualizacji z każdą generacją).

## K11. „Polszczyzna: szyk sterowany wagą syntaktyczną i strukturą informacyjną; aspekt niesie pragmatykę”

- **Dowód/jakość:** lingwistyka polska (F3, F4, F5, F6) + korpusy (F1, F2) — podstawa NORMY/UZUSU, nie eksperyment nad AI; jakość wysoka w obrębie dyscypliny.
- **Populacja:** polszczyzna pisana/mówiona; korpusy NKJP, MoncoPL, IPI PAN.
- **Konfudery:** odmiana (mówiona vs pisana), rejestr, dialekt.
- **Zgodne:** F3, F4, F5, F6.
- **Przeciwne:** brak.
- **Replikacja/transfer:** konsensus lingwistyki polskiej; NIE dotyczy bezpośrednio stylu LLM (to podstawa normy dla redakcji).
- **Warunek falsyfikacji:** teza fałszywa, gdyby korpusy pokazywały szyk całkowicie swobodny — przeczą temu F3/F5.
- **Najwęższe sformułowanie:** „Polski szyk jest elastyczny, ale nie dowolny: porządkują go waga składniowa, temat/remat i nacechowanie; wybór aspektu jest pragmatycznie warunkowany — reguły redakcyjne muszą to uwzględniać, zamiast narzucać sztywny 'naturalny' szyk”.
- **Werdykt:** **REGUŁA** (podstawa normatywna dla skilla PL; jawne oznaczenie: norma/uzus, nie badanie AI).

## K12. „Polski materiał o stylu AI jest szczątkowy; transfer EN→PL niezweryfikowany”

- **Dowód/jakość:** wynik własnego przeszukania (S21: 34 polskojęzyczne prace o ChatGPT — egzaminy/edukacja; F10–F15 jedyne bezpośrednie) + uzupełnienie po rewizji sceptycznej: F15 (Mazurkiewicz-Sokołowska 2025 — kohezja i przeużywane konstrukcje, EN/DE/PL).
- **Populacja:** PL.
- **Konfudery:** indeksacja polskich czasopism w bazach jest słaba (ryzyko pominięć — złagodzone przez zapytania PL i rewizję sceptyczną).
- **Zgodne:** F10, F13, F14, F15, S21.
- **Przeciwne:** brak.
- **Replikacja/transfer:** n/d.
- **Warunek falsyfikacji:** teza fałszywa, gdyby istniały recenzowane EKSPERYMENTY percepcji AI-polszczyzny (oceny/preferencje czytelników) — nie znaleziono; twierdzenie ograniczone właśnie do eksperymentów percepcji, nie do wszelkich danych PL.
- **Najwęższe sformułowanie:** „Poza detekcją (Śmigiel) i analizami poprawności/konstrukcji (Mazur 2024, Prościak 2023, Mazurkiewicz-Sokołowska 2025) brak eksperymentów percepcji i preferencji PL; każdy transfer EN→PL pozostaje hipotezą”.
- **Werdykt:** **REGUŁA epistemiczna: każdy transfer EN→PL oznaczać jako HIPOTEZĘ do testu.**

## K13. „Usunięcie 'markerów AI' zwiększa jakość tekstu dla czytelnika”

- **Dowód/jakość:** BRAK bezpośrednich badań. Pośrednio przeciw: C7 (ludzie preferują teksty z „nadmiernymi” słowami), B11/B8 (oceny zależą od etykiety, nie treści), K5.
- **Populacja:** n/d.
- **Konfudery:** jakość ≠ autorstwo; usuwanie słów może niszczyć głos i rejestr.
- **Zgodne:** brak.
- **Przeciwne:** C7 (preferencja dla wariantów „AI”), B3 (ślepe oceny AI wyższe).
- **Replikacja/transfer:** n/d.
- **Warunek falsyfikacji:** teza prawdziwa, gdyby RCT z czytelnikami pokazywał wyższe oceny tekstów po usunięciu markerów — taki RCT nie istnieje; powinien być PIERWSZYM testem skilla.
- **Najwęższe sformułowanie:** „Nie wiadomo, czy usuwanie sygnałów stylu LLM poprawia jakość czytelniczą; wiadomo, że może usuwać cechy, które oceniający preferują”.
- **Werdykt:** **HIPOTEZA (do przetestowania przez skill); NIE wolno przyjmować jako założenia.**

## K14. „Styl zależy od modelu, dostrajania, promptu, temperatury, długości i gatunku”

- **Dowód/jakość:** C1 (temperatura), C2 (dekodowanie + długość), C4 (RLHF), C5 (generacja modelu), C9/C11 (gatunek), C8 (T=0 kolaps), A6 (GPT-3 najbardziej „ludzki” — między modelami).
- **Populacja:** EN głównie; C8 EN+CZ.
- **Konfudery:** interakcje parametrów (temperatura×model), dane treningowe.
- **Zgodne:** C1, C2, C4, C5, C8, C9, C11, A6.
- **Przeciwne:** brak.
- **Replikacja/transfer:** szeroko replikowane w NLP.
- **Warunek falsyfikacji:** teza fałszywa, gdyby styl był niezmiennikiem niezależnym od warunków — wszystkie pomiary pokazują zależność.
- **Najwęższe sformułowanie:** „Żadna cecha stylu nie jest stałą 'LLM': każda zależy od modelu, dostrajania, promptu, parametrów dekodowania, długości i gatunku — diagnoza stylu musi podawać te warunki”.
- **Werdykt:** **REGUŁA** (obowiązkowe pole w taksonomii wzorców).

## K15. „Jakość, autorstwo i decyzja redakcyjna to trzy niezależne osie”

- **Dowód/jakość:** metasynteza: B3/B9 (jakość AI w ślepej ocenie wysoka), B8/B11 (oceny zależne od etykiety), K13 (brak dowodów na korzyść z usuwania markerów), E1–E5 (jakość mierzalna niezależnie od autorstwa).
- **Werdykt:** **REGUŁA architektoniczna** — skill ocenia jakość tekstu w gatunku, nie autorstwo; nie optymalizuje pod detektory.

---

## Audyt cytacja–teza (naruszenia znalezione i naprawione)

| Cytacja | Problem | Akcja |
|---|---|---|
| 10.1038/s41586-024-07913-1 (Liang „Nature 2024”) | DOI nie istnieje (404) | Zastąpiono recenzowaną wersją: 10.1038/s41562-025-02273-8 (Nature Human Behaviour) |
| Guo et al. 2025 „DOI 10.1162/tacl.a.47” | DOI prowadzi do innej pracy (Kreutzer et al. 2022) | Zastosowano lokator arXiv:2412.10271 + TACL 13:1507–1526; DOI oznaczony jako niepotwierdzony |
| „Ueda et al. 2022” (haiku CHB) | Błędni autorzy/rok | Poprawiono: Hitsuwari, Ueda, Yun, Nomura (2023), CHB 139:107502 |
| „Berg, Raj, Seamans” | Kolejność autorów | Poprawiono wg Crossref: Raj, Berg, Seamans (2026), JEP:G 155(4):896–915 |
| Jakesch PNAS „2308839120 vs 2208839120” | Rozbieżność DOI | Rozstrzygnięte przez Crossref: poprawny 10.1073/pnas.2208839120 |
| Demir & Egbert 2026 | DOI niezweryfikowany | Wyłączone z bazy dowodowej do weryfikacji (EXCLUDED) |
| „Gude, V.” / „Gude, Vinayaka” | Błędne imię pierwszego autora | Poprawiono wg ACL Anthology: Adrián Gude (2026.acl-long.1803, ss. 38900–38911) |
| K12 „ograniczają się do detekcji i analiz błędów” | Pominięcie źródła PL (rewizja sceptyczna) | Dodano Mazurkiewicz-Sokołowska 2025 (LNNS 1643:250–265); karta K12 przeredagowana |
| B8 „wielokrotnie replikowany” | Brak replikacji niezależnej (rewizja sceptyczna) | Przeklasyfikowano: silny pojedynczy program (16 eksp., jeden zespół, USA) |
| C7 „ludzie PREFERUJĄ” | Nadmierne uogólnienie preprintu (rewizja sceptyczna) | Dodano niejednorodność wg słowa („nuanced” odwrotnie) i status preprintu warsztatowego |
| Kobak „sciadv.adn2496” | Zła końcówka DOI | Poprawiono: 10.1126/sciadv.adt3813 |
| Juzek & Ward COLING „10.18653/v1/2025.coling-main.426” | Brak rekordu w Crossref | Zachowano z lokatorem ACL Anthology (nie DOI) |
| Siewierska 1993 | Autor niepotwierdzony w OpenAlex | Potwierdzono przez Crossref: Anna Siewierska, JL 29(2):233–265 |

Żadna pozycja z bazy dowodowej nie jest retraktowana (sprawdzono brak sygnałów retrakcji w Crossref dla kluczowych DOI; jawna deklaracja ograniczenia: pełny skan Retraction Watch nie został uruchomiony — brak dostępu do API w sesji).
