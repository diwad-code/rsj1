# „Język AI” a polszczyzna — zweryfikowana podstawa dla skilla redakcyjnego

**Autor:** CC DeepSeek (niezależny research; izolacja `wersje/cc_deepseek/`)
**Data:** 2026-08-17 · **Wersja:** 1.1 (po ataku sceptycznym; zmiany wg protokołu §10)
**Artefakty towarzyszące:** `PROTOKOL.md`, `SEARCHLOG.yaml`, `EVIDENCE-TABLE.md`,
`CLAIM-AUDIT.md`, `SOURCES.bib`, `EXCLUDED.md`

---

## 1. Metryka, data, narzędzia, ograniczenia

- **Pytanie główne:** które rzekome cechy „języka AI” mają podstawy naukowe po
  kontroli gatunku, modelu, promptu i języka; które są kontekstowe; które są
  folklorem — oraz jak bezpiecznie redagować polskie teksty, zachowując sens i głos.
- **Data rejestracji protokołu:** 2026-08-17 (przed wyszukiwaniem).
- **Narzędzia:** OpenAlex MCP (`openalex`), `paper-search` MCP (Semantic Scholar,
  Crossref), WebSearch scholastyczny, WebFetch (ACL Anthology, rjp.pan.pl,
  sjp.pwn.pl); 6 subagentów `literature-scout` (rozłączne obszary, równolegle);
  Crossref do weryfikacji DOI.
- **Zakres:** 2018–2026, EN + PL; ~230 trafień orkiestratora + ~1120 trafień
  scoutów → ~105 kandydatów unikalnych → ~90 w bazie dowodowej.
- **Ograniczenia (jawne):**
  1. Materiał bezpośrednio polski jest szczątkowy (sekcja 5) — transfer EN→PL
     oznaczony jako hipoteza, nie dowód.
  2. Pełny skan retrakcji (Retraction Watch API) niedostępny w sesji; kontrolowano
     rekordy Crossref (brak sygnałów retrakcji w kluczowych DOI).
  3. Indeksacja polskich czasopism humanistycznych w bazach globalnych jest słaba
     — możliwe pominięcia złagodzono zapytaniami polskojęzycznymi.
  4. Badania percepcji są niemal wyłącznie WEIRD (USA, Niemcy, Japonia).
  5. Część mechanistycznych tez (rola LHF) opiera się na preprintach (C7) — nie
     uzasadniają samodzielnie mocnych reguł.
  6. Szybka ewolucja modeli: wyniki dla ChatGPT 3.5 (np. C9) mogą być nieaktualne
     dla modeli 2026 — każda reguła nosi datę i warunek modelowy.
  7. **Konflikty interesów i finansowanie włączonych badań nie były
     systematycznie oceniane** (w odróżnieniu od kontroli retrakcji); część
     badań pochodzi ze środowisk biznesowych (np. B8 — autorzy z uczelni
     biznesowych; E12 — czasopismo żywieniowe) — tam, gdzie to istotne, należy
     szukać replikacji niezależnej, a B8 jej jeszcze nie ma (16 eksperymentów
     to jeden program badawczy, jedna populacja USA).
  8. Teza B8 (kara za ujawnienie) opiera się na jednym programie badawczym bez
     znanej replikacji zewnętrznej — traktowana jako silna, ale nie
     ostateczna.

## 2. Pytania i zamknięty protokół

Protokół pre-rejestrowany w `PROTOKOL.md` (styl PROSPERO): PICO, kryteria
kwalifikacji (recenzowane; pre-printy tylko jako wsparcie; blogi/listy jako
`OBJECT-OF-STUDY`), 14 pytań obowiązkowych Q1–Q14 zmapowanych na 8 klastrów
zapytań, plan ekstrakcji (18 pól), narzędzia oceny (GRADE, ROBIS/AMSTAR-2,
pakiety `computer-science` i `social-sciences`), plan syntezy narracyjnej z
taksonomią wzorców o 17 polach, rejestr amendments (pusty w chwili rejestracji).
**Odstępstwa od protokołu:** brak istotnych; wszystkie zmiany logowane w
`SEARCHLOG.yaml` (S01–S25, SC1–SC6) i opisane w tym raporcie.

## 3. Metody wyszukiwania, screeningu i oceny

- **Strategia:** zapytania potwierdzające i falsyfikujące osobno; warianty
  boolowskie; EN i PL; najpierw przeglądy pola (A1–A4), potem badania pierwotne;
  citation chasing wstecz (landmarki: A5, A6, C1, C2, D1–D4) i w przód (A16, A21).
- **Screening:** tytuł/abstrakt → pełny tekst; konflikty rozstrzygane kryterium
  surowszym; deduplikacja po DOI. PRISMA: zidentyfikowano ~1350 → po
  deduplikacji ~105 → włączono ~90 (szczegóły w `SEARCHLOG.yaml` §prisma).
- **Ocena:** dyspozycje wg `source-credibility` (EVIDENCE/BACKGROUND/
  OBJECT-OF-STUDY/NORMATYW/REJECT); ryzyko błędu wg `critical-appraisal`
  (pre-rejestracja B8, RCT E1, N>10 tys. B1/B8/B10 — niskie ryzyko; preprinty i
  LBW oznaczone); pewność GRADE w kartach `CLAIM-AUDIT.md`.
- **Weryfikacja cytacji:** istnienie (Crossref), wsparcie (abstrakt/sekcja),
  zakres, aktualność; audyt cytacja–teza w `CLAIM-AUDIT.md` (9 napraw, m.in.
  błędny DOI Liang „Nature” → poprawna wersja Nature Human Behaviour;
  błędny DOI Guo TACL; błędni autorzy haiku CHB).

## 4. Mapa jakości dowodów

| Poziom | Opis | Przykłady | Rola w raporcie |
|---|---|---|---|
| **1. Przedział wielokrotnie replikowany** | N>10 tys. lub wiele niezależnych zespołów, pre-rejestracje, RCT | B1 (PNAS), A15, A18, A19, A13, E1 (RCT) | Reguły |
| **1a. Silny pojedynczy program badawczy** | duże N, pre-rejestracja, ale bez replikacji niezależnej | B8 (16 eksp., N=27 491, jeden zespół, USA) | Reguła z zastrzeżeniem |
| **2. Solidne pojedyncze lub zgodne pary** | gatunek kontrolowany, benchmarki, surveye | A11, A16, A2–A4, C5, C9, C11, E3, E5 | Reguły/sygnały |
| **3. Pojedyncze lub preprinty** | bez replikacji niezależnej | C7, A25, B14, C8, A23 | Hipotezy |
| **4. Normatywy/uzus PL** | korpusy, RJP, PWN, ISO | F1–F6, G1–G6 | Podstawa normy redakcyjnej |
| **5. Folklor** | listy, marketing, tweety | H1–H4 | Object-of-study |

## 5. Polski materiał bezpośredni i transfer międzyjęzykowy

**Bezpośredni (PL):**
- **Detekcja PL:** zadanie „Śmigiel” PolEval 2025 (F10): 64 538 tekstów, 8 LLM
  (m.in. Bielik, PLLuM), 6 domen — dokładność detektorów **spada na
  niewidzianych domenach i modelach** (zgodnie z wzorcem angielskim A11/A16);
  najlepsze rozwiązanie zero-shot adaptuje Binoculars do polskich modeli (F12).
  Wniosek: polskie teksty AI są wykrywalne statystycznie, ale niestabilnie — to
  samo ograniczenie co w EN.
- **Jakość polszczyzny ChatGPT:** analizy błędów (F13: matura 2023 — najwięcej
  błędów w konstrukcjach złożonych; F14: błędy rzeczowe, ortograficzne,
  stylistyczne). Uwaga: dotyczą modeli 2023 — nie przenosić bezwarunkowo na 2026.
- **Norma i uzus:** NKJP (F1), MoncoPL (F2 — polszczyzna internetowa na żywo),
  szyk (F3, F4, F5 — waga syntaktyczna vs temat/remat), aspekt pragmatyczny (F6),
  sprawozdania RJP (G1, G2), WSO PWN (G3).
- **Uzupełnienie po rewizji sceptycznej:** Mazurkiewicz-Sokołowska (2025, LNNS
  1643, ss. 250–265; DOI 10.1007/978-3-032-06611-4_20) — bezpośrednia analiza
  480 odpowiedzi ChatGPT (EN/DE/PL): kohezja, poprawność i „przeużywane
  konstrukcje” — jakościowy, recenzowany punkt danych PL (bez eksperymentu z
  czytelnikami).
- **Luka stwierdzona w przeszukaniu:** brak recenzowanych badań **percepcji**
  „AI-polszczyzny” przez polskich czytelników (eksperymentów ocen/preferencji);
  brak polskiego odpowiednika badań nad nadreprezentacją słów (A18/A19) i nad
  karą za ujawnienie (B8). S21: 34 polskojęzyczne prace o ChatGPT dotyczą
  egzaminów i edukacji — nie stylu.

**Transfer EN→PL — zasada:** wszystko, co w tym raporcie pochodzi z badań EN,
jest dla polszczyzny **hipotezą do testu**, nie regułą. Wyjątek: mechanizmy
statystyczne bez nośnika leksykalnego (np. jednolitość rozkładów — C2, C5)
przenoszą się prawdopodobnie, ale wymagają sprawdzenia na korpusie PL
(MoncoPL/Śmigiel to gotowe narzędzia).

## 6. Potwierdzone wzorce, sygnały kontekstowe, hipotezy i twierdzenia odrzucone

### 6.1 Reguły (podstawa dla skilla — z warunkami wyłączenia)

- **R1. Laicy nie rozpoznają tekstu AI** (B1, B5, B3, B9, B15, B22, B23;
  konsensus; GRADE: wysoka). Warunki wyłączenia (kalibracja po rewizji): (a)
  **pięcioosobowy panel** częstych użytkowników LLM wykrywa lepiej (B13) —
  pojedynczy ekspert jest mniej trafny i fałszywie flaguje 3,3% tekstów
  ludzkich; (b) ekspertyza dziedzinowa BEZ ekspozycji na LLM nie pomaga (B22:
  wykładowcy ≈ przypadek); (c) „brzmi jak AI” u zwykłego czytelnika jest
  słabym kryterium.
- **R2. Ujawnienie autorstwa AI obniża oceny tekstów kreatywnych** (B8, B3,
  B11; GRADE: wysoka dla EN). Implikacja: skill NIE może obiecywać
  „niewykrywalności” ani służyć maskowaniu autorstwa — i nie musi, bo ocena
  w ślepym teście bywa wyższa (B3, B9).
- **R3. Detektory nie nadają się do rozstrzygania o autorstwie** (A13, A15,
  A11, A16, A10; GRADE: wysoka). PL potwierdzone (F10).
- **R4. Tłumaczenie to realny konfunder** (D1–D4, A13; GRADE: wysoka).
- **R5. Styl zależy od modelu, dostrajania, promptu, temperatury, długości,
  gatunku** (C1, C2, C4, C5, C9, C11; GRADE: wysoka) — każda diagnoza stylu
  musi podawać warunki.
- **R6. Prosty język i struktura (signaling) poprawiają zrozumienie** (E1, E3,
  E5; GRADE: wysoka) — ale z limitami (E2, E4): nie zawsze i nie do zera.
- **R7. Szyk i aspekt polszczyzny** (F3–F6; podstawa normy/uzusu) — elastyczność
  sterowana, nie dowolność.

### 6.2 Sygnały kontekstowe (prawdziwe tylko w warunkach X)

- **S1. Nadreprezentacja słownictwa stylistycznego** (A18, A19, A20; mechanizm:
  LHF — C7): sygnał **populacyjny** (kohorty tekstów), nie marker indywidualny;
  dotyczy EN, gatunków masowych (abstrakty, recenzje, preprinty); **sygnały
  dryfują** (A21, A22). PL: niezbadane.
- **S2. Niższa różnorodność syntaktyczna (i zwykle leksykalna) tekstów
  instruction-tuned LLM** (C5, C4, C9; wymiar leksykalny sporny: C10, C6) —
  zależna od modelu, gatunku, temperatury.
- **S3. Deficyt rejestru** (C9, C11): starsze modele nie różnicują stylu między
  gatunkami; nowsze zmniejszają lukę (C5, A6) — sygnał wymaga daty modelu.
- **S4. Eksperci z ekspozycją na LLM wykrywają tekst AI** (B13; kontra B14 —
  preprint): dotyczy osób regularnie używających narzędzi.

### 6.3 Hipotezy (wymagają testu; nie mogą być podstawą mocnych reguł)

- **H1. Usunięcie „markerów” poprawia jakość dla czytelnika** — brak badań;
  pośrednio przeciw: ludzie preferują teksty z „nadmiernymi” słowami (C7);
  K13.
- **H2. Preferencja dla „nadmiernych” słów wynika z LHF** — mechanizm
  uprawdopodobniony (C7 — preprint; A20).
- **H3. Transfer reguł R1–R3, S1–S3 na polszczyznę** — niezweryfikowany.
- **H4. Teksty uczniów/użytkowników L2 konwergują ze stylem LLM** (A22) — dla
  PL niezbadane.
- **H5. Kara za ujawnienie (B8) występuje w Polsce** — niezbadane.

### 6.4 Twierdzenia odrzucone (folklor; nie używać w skillu)

- **O1. „Stabilna lista zwrotów AI (delve, tapestry, pivotal…)” jako niezawodny
  marker** — odrzucone jako reguła (K1): sygnał populacyjny i dryfujący; kary za
  słowa uderzają w L2 i ludzi z bogatym słownictwem (A15). Blacklista
  zabroniona.
- **O2. „Burstiness/perplexity odróżnia ludzi od AI”** — odrzucone: dyfuzyjne LM
  naśladują obie statystyki (A25 — preprint; plus A15: to właśnie niska
  perplexity tekstu L2 powoduje FP).
- **O3. „Trójdzielność, wyliczenia, nagłówki, myślniki to błąd”** — odrzucone
  (K6): signaling pomaga (E5), trójczłonowe listy to klasyczna retoryka (G6);
  myślnik półpauzy to norma typograficzna, nie marker autorstwa.
- **O4. „Detektory niezawodne; wysoki wynik = dowód autorstwa”** — odrzucone
  (K7).
- **O5. „Tekst AI jest zawsze gorszy jakościowo”** — odrzucone: ślepe oceny
  często wyższe dla AI (B3, B9); jakość ≠ autorstwo.
- **O6. „Neuroróżnorodność wywołuje FP detektorów”** — **niezweryfikowane**:
  twierdzenie krąży w folklorze (H1), brak recenzowanego badania. Status:
  luka badawcza, nie reguła (uczciwie: mechanizm FP dla L2 z A15 jest
  pokrewny, ale nie tożsamy).

### 6.5 Taksonomia wzorców (Załącznik A) — zasada naczelna

**Nie buduj blacklisty. Pojedyncze słowo, dwukropek, myślnik albo układ zdania
nie jest dowodem autorstwa ani automatycznym błędem.** Ocena dotyczy FUNKCJI
konstrukcji w gatunku, nie formy.

## 7. Konfudery i fałszywe pozytywy

| Konfunder | Mechanizm | Dowód | Reguła dla skilla |
|---|---|---|---|
| Tłumaczenie (ludzkie/MT) | translationese ma własne cechy; FP detektorów na MT ~11% | D1–D4, A13, F9 | Pytaj o pochodzenie tekstu przed diagnozą stylu |
| Użytkownik L2 / uczeń | niższa perplexity, mniejsza różnorodność → 61,3% FP na TOEFL | A15, A17 | Nigdy nie etykietuj „AI” po stylu; nie „naprawiaj” na siłę |
| Narzędzia korekty (Grammarly i in.) | wygładzanie → FP detektorów | A17 | Styl wygładzony ≠ autorstwo |
| Język urzędowy / prawny | nominalizacje, strona bierna — celowość gatunkowa | E3, E4 | Nie upraszczać bez upoważnienia; precyzja chroniona |
| Prosty język | ustandaryzowana prostota mylona z „AI” | E1–E4 (norma), A15 (mechanizm) | Prosty ≠ AI; nie odwracać prostego języka |
| SEO / copywriting | szablony organizacji, emfaza | E12 (fluency), folklor H1 | Szablon organizacji ≠ LLM |
| Konwergencja ludzi ze stylem LLM | studenci/recenzenci piszą „jak ChatGPT” | A22, A19 | Styl „AI” może być ludzki |
| Instrukcja „pisz profesjonalnie” | nadreprezentacja przez LHF wbudowana w produkt | C7, A20 | Pytać: cecha pochodzi z LLM, z instrukcji, czy ze standardu internetu? |
| Stare modele jako podstawa | wyniki dla 3.5 nie opisują 2026 | C9 vs C5 | Każda reguła z datą modelu |
| Krągłość kryterium „brzmi jak AI” | etykieta zmienia ocenę niezależnie od treści | B11, B8, B3 | Mierzyć jakość w teście ślepym |

## 8. Zasady bezpiecznej redakcji i ochrony głosu

**Trzy niezależne osie (K15): autorstwo ≠ jakość ≠ decyzja redakcyjna.**

1. **Zachowaj fakty, wnioski, modalność, głos, terminologię.** Redakcja zmienia
   formę, nie treść epistemiczną; hedging w nauce jest funkcjonalny (A4:
   tekst LLM mniej emocjonalny — to nie wada w raporcie); terminy dziedzinowe
   chronione (E3: trudność tekstów prawnych leży w składni, nie w pojęciach —
   upraszczaj składnię, nie pojęcia).
2. **Nie optymalizuj pod detektory** (R3, K13): usuwanie sygnałów klasyfikatora
   nie jest poprawą jakości i **może** być szkodliwe — jedno badanie (C7;
   preprint warsztatowy, mały efekt, preferencja nierównomierna wg słowa:
   dla „nuanced” odwrócona) sugeruje, że część nadreprezentowanego słownictwa
   bywa preferowana przez oceniających; rozstrzygnięcie należy do testu T1.
3. **Nie obiecuj niewykrywalności** — to cel wykluczony z zadania; R2/B8: kara
   za ujawnienie nie znika przez retusz stylu.
4. **Oceń funkcję konstrukcji, nie formę** (K6): ta sama trójdzielność jest
   błędem w dialogu UI i narzędziem w przemówieniu.
5. **Pytaj o pochodzenie** (K9): oryginał / tłumaczenie / L2 / urzędowy / szablon
   — inna diagnoza, inne interwencje.
6. **Test zachowania znaczenia przy każdej edycji** (wzorzec z E1): parafraza +
   pytania sprawdzające; dla PL — kontroler fleksji/zgody (F13: najwięcej błędów
   LLM w konstrukcjach złożonych — tam redaktor PL musi być najczujniejszy).
7. **Chroń subpopulacje:** nie „wyłapuj AI” u uczniów, L2, autorów tekstów
   prostych (A15, A17); skill poprawia teksty, nie ocenia autorów.
8. **Minimalna interwencja:** edycja punktowa > przepisanie; głos autora to
   rozkład wyborów, nie lista zwrotów (B12: zaimki osobowe mediują
   transportation — ich usuwanie realnie szkodzi narracji).

## 9. Gatunki, UI, repozytoria i elementy chronione

| Gatunek | Norma (dowód) | Typowe interwencje dozwolone | Chronione |
|---|---|---|---|
| **UI / mikrokopia** | E6, E7, E13, G5 (WCAG) | skróć do akcji; komunikat: co się stało → co zrobić; grzeczność kontekstowa (E10, E7) | spójność terminów, formaty liczb/dat, nazwy własne produktu |
| **Błąd** | E6, E7, E10 | struktura + ludzki ton; bez obwiniania (E7: przeprosiny wg „skryptów społecznych” odbiorcy) | kody błędów, instrukcje techniczne |
| **Onboarding** | E8, E9, E14 | tutorial oparty na zadaniu; mało tekstu, konkret | ścieżki krytyczne, zgody prawne |
| **Artykuł** | E5, E3 | signaling (nagłówki, zapowiedzi) — poprawia przyswajanie (d≈0,60) | teza, fakty, cytaty, modalność |
| **Raport** | E5, A4 | struktura, hedging zachować tam, gdzie uzasadniony | dane, wnioski, definicje |
| **Nauka** | A18/A19 (kontekst: nadmiar słów w nauce), E3 | usuwać nadmiar leksykalny ostrożnie i tylko wg gatunku (A18: nadmiar dotyczy czasowników stylistycznych) | terminologia, hedging, cytowania |
| **Reklama** | E12 | płynność przetwarzania (fluency) — krótkie, jasne, konkretne | obietnice, compliance |
| **Dialog (UI konwersacyjne)** | E10, E11 | grzeczność umiarkowana; nie przesadnie przepraszająca (E10) | intencja, treść transakcyjna |
| **Literatura** | B12, B3, B8 | praktycznie bez interwencji stylistycznych | głos, zaimki (B12!), rytm, metafora |

**Tekst widoczny dla użytkownika w kodzie (Q11):** identyfikuj tylko ciągi
renderowane dla człowieka: literały w plikach UI (components/views), klucze i18n
(JSON/ICU MessageFormat, pl-pl), `aria-label`/`title`, `alt`, komunikaty
walidacji, teksty onboarding/empty states. NIE edytuj: komentarzy w kodzie,
nazw zmiennych, logów, dokumentacji deweloperskiej, stringów kluczy (bez
zmiany klucza!). Zmiany w UI wymagają aktualizacji wszystkich wersji
językowych tego samego klucza i kontroli długości (german/expansja).

**Elementy chronione zawsze:** fakty, liczby, cytaty, nazwy, terminy, modalność
(„należy” ≠ „można” ≠ „trzeba”), akty prawne, komunikaty o konsekwencjach
prawnych/finansowych, treści certyfikacji/medyczne (E2: populacje o niskiej
kompetencji czytelniczej mają inne optymalne formy).

## 10. Długie formy i książki

1. **Globalna spójność przed lokalną elegancją:** rejestr terminologiczny
   (glosariusz + mapa synonimów), spójność form adresatywnych, czasu, nazw
   sekcji; reguły gatunku z sekcji 9 utrzymywane w całym tekście.
2. **Profilowanie rozdziałów, nie całości:** style mogą się legalnie różnić
   między częściami (wprowadzenie ≠ słowniczek); edycja lokalna nie może
   rozregulować profilu globalnego.
3. **Edycja przyrostowa z testem:** po każdej partii — test zachowania
   znaczenia (parafraza + pytania kontrolne, E4), kontrola referencji
   wewnętrznych („jak wspomniano w rozdz. 4”).
4. **Granice techniczne:** przetwarzanie oknami z zachowaniem kontekstu
   poprzednich rozdziałów (streszczenie strukturalne per rozdział); żadnych
   cichych skrótów treści — książka nie jest artykułem, podsumowania na końcu
   rozdziałów są funkcjonalne (E5), nie „AI”.
5. **PL:** kontrola uzusu na MoncoPL (F2) dla spornych form; fleksja i zgoda w
   długich zdaniach — najsłabszy punkt modeli (F13) — wymagają ręcznej weryfikacji.

## 11. Falsyfikowalny plan ewaluacji skilla (Q14)

Wszystkie testy **pre-rejestrowane**; kryteria odrzucenia ustalone przed startem.

1. **T1 — Jakość czytelnicza (ślepy test, PL).** RCT/within: czytelnicy polscy
   (N docelowe ≥ 300/gatunek) oceniają teksty oryginalne vs zredagowane
   (jakość, zrozumiałość, zaufanie, „głos”). Hipoteza H0 do obalenia:
   „redakcja nie zmienia oceny jakości”. Kryterium: d≥0,2 w głównym wyniku
   gatunku; jeśli redakcja OBNIŻA oceny w ≥2/3 gatunków — skill nieskuteczny
   (test obalający, nie potwierdzający).
2. **T2 — Zachowanie znaczenia.** Eksperci dwujęzyczni porównują pary zdań
   (kappa ≥0,6); próg: ≥95% par semantycznie równoważnych; fakty/liczby/cytaty
   bitowo tożsame.
3. **T3 — Ochrona głosu.** Test parowania autorów (czytelnicy przyporządkowują
   fragment zredagowany do oryginału) + delta stylometryczna poniżej progu
   zróżnicowania międzyautorowego (metryki z C2/C3 na korpusie PL).
4. **T4 — Bezpieczeństwo gatunkowe.** Zestawy chronione (prawo, medycyna,
   literatura, raporty): test równoważności (quality delta ≈ 0, jednostronny
   margines) — reguła, która szkodzi gatunkom chronionym, zostaje wyłączona.
5. **T5 — Brak optymalizacji pod detektory.** Korelacja zmiany jakości (T1) ze
   zmianą wyniku detektora (F12) powinna być ≈0; dodatnia korelacja = czerwona
   flaga (skill usuwa sygnał, nie poprawia tekstu).
6. **T6 — Transfer EN→PL.** Replikacja H3: czy sygnały S1–S3 występują w
   korpusie PL (MoncoPL + Śmigiel)? To decyduje, które reguły zostają.
7. **T7 — Stabilność w czasie.** Powtórka T1/T6 co 6 mies. (dryf modeli: A21, A22).
8. **Kryterium porażki skilla (pre-rejestrowane):** T1 d<0,2 ORAZ T2<95% ORAZ
   T4 naruszone w ≥2 gatunkach → skill nie wnosi wartości i wymaga przeprojektowania.

## 12. Detektory AI i granice uczciwych wniosków

- **Stan wiedzy (konsensus):** detektory są niestabilne — FP na L2/uczniach/
  użytkownikach korektorów (A15, A17), podatność na parafrazę (A10), utrata
  trafności na nowych modelach (A16), wycofanie przez producenta (A26);
  deklaracje dostawców (H2) nie wytrzymują niezależnych testów (A13, A11).
  Teoretyczna granica detekcji: A9. PL: F10 — ta sama kruchość.
- **Granice uczciwych wniosków:** (a) nigdy nie rozstrzygać autorstwa po
  stylu/detektorze; (b) „podobieństwo do LLM” nie jest zarzutem — ludzie
  konwergują (A22); (c) nie wolno obiecywać ani budować „niewykrywalności”
  (cel wykluczony; R2); (d) statystyki populacyjne (A18/A19) opisują kohorty,
  nie osoby.
- **Status twierdzeń o neuroróżnorodności:** niezweryfikowane (O6) — skill nie
  może go używać ani jako reguły, ani jako argumentu marketingowego; należy
  zgłosić jako lukę badawczą.

## 13. Rekomendacje dla budowniczego skilla

1. **Architektura trzech osi** (K15): pipeline = [provenance check → genre
   profile → funkcjonalna ocena konstrukcji → edycja minimalna → test
   zachowania znaczenia → test głosu]. Nigdy krok „czy to brzmi jak AI?”.
2. **Profil gatunkowy jako podstawowa jednostka reguł** (sekcja 9) — reguły
   bez gatunku nie istnieją.
3. **Zakaz blacklisty słów i konstrukcji** (O1, K6); dopuszczalne: listy
   *nadmiaru w konkretnym gatunku i modelu, z datą ważności* (S1, A21).
4. **Obowiązkowy zapis warunków** każdej reguły: język (PL bezpośrednio /
   transfer EN), model/okres, gatunek, warunek wyłączenia (wzorzec 17 pól,
   Załącznik A).
5. **PL anchor normatywny:** NKJP/MoncoPL do sprawdzania uzusu, RJP/PWN do
   normy, Śmigiel do kalibracji detekcji; nie przenosić list angielskich słów.
6. **Ewaluacja z sekcji 11 jako brama dopuszczenia** skilla; wyniki zerowe
   publikować (anti-folklor).
7. **Etyka użytkownika:** skill deklaruje, że nie wykrywa autorstwa, nie
   gwarantuje niewykrywalności, nie edytuje treści prawnie/finansowo wiążących
   bez flagi.
8. **Konserwacja:** półroczny przegląd reguł (dryf modeli i uzusu — A21, F2).

## 14. Luki, sprzeczności i pytania otwarte

- **Brak polskich badań percepcji i preferencji** (H3, H5) — priorytet badawczy.
- **Brak RCT „usuwania markerów”** (H1) — test T1 skilla może być pierwszą taką
  próbą.
- **Sprzeczność:** C4 (RLHF redukuje różnorodność) vs C6 (zależy od domeny);
  C10 (LLM wyższa zmienność leksykalna) vs C5 (niższa leksykalna) — wymaga
  rozstrzygnięcia z podziałem na gatunki i modele.
- **Sprzeczność percepcji:** B1/B3 (ludzie nie odróżniają) vs B13/B14
  (eksperci/preprint: odróżniają) — rozstrzyga zmienna „trening/ekspozycja”.
- **Wrażliwość metody excess vocabulary na wybór listy słów** (krytyka Zenodo
  2026) — estymatory prevalencji mają kilkukrotną rozpiętość; interpretować
  ostrożnie.
- **Neuroróżnorodność a detektory** (O6) — brak badań.
- **Modele 2026:** większość korpusów obejmuje modele do 2025; C5 to jedyny
  świeży punkt odniesienia dla gatunku kontrolowanego.
- **Polskie normatywy o AI:** RJP nie wydała (w badanym zakresie) stanowiska o
  stylu tekstów generowanych — brak autorytatywnego punktu odniesienia PL.
- **Metodologia:** brak wspólnej miary „głosu”; definicje operacyjne do
  uzgodnienia w T3.

## 15. Bibliografia (APA 7)

Pełna zweryfikowana lista: patrz sekcja **References** poniżej oraz
`SOURCES.bib` (wersja maszynowa). Wszystkie DOI potwierdzone przez Crossref /
ACL Anthology / arXiv (2026-08-17), chyba że oznaczono inaczej.

---

## References

### Detekcja i cechy tekstu AI

- Bordalejo, B., i in. (2025). 'Scarlet Cloak and the Forest Adventure': A preliminary study of the impact of AI on commonly used writing tools. *International Journal of Educational Technology in Higher Education*. https://doi.org/10.1186/s41239-025-00505-5
- Dugan, L., Ippolito, D., Kirubarajan, A., Shi, S., & Callison-Burch, C. (2024). RAID: A shared benchmark for robust evaluation of machine-generated text detectors. *Proceedings of ACL 2024*, 12445–12467. https://doi.org/10.18653/v1/2024.acl-long.674
- Elkhatat, A. M., Elsaid, K., & Almeer, S. (2023). Evaluating the efficacy of AI content detection tools in differentiating between human and AI-generated text. *International Journal for Educational Integrity*. https://doi.org/10.1007/s40979-023-00140-5
- Fraser, K., Dawkins, S., & Kiritchenko, S. (2025). Detecting AI-generated text: Factors influencing detectability with current methods. *Journal of Artificial Intelligence Research*, *82*, 2233–2278. https://doi.org/10.1613/jair.1.16665
- Gehrmann, S., Strobelt, H., & Rush, A. (2019). GLTR: Statistical detection and visualization of generated text. *Proceedings of ACL 2019 (System Demonstrations)*, 111–116. https://doi.org/10.18653/v1/P19-3019
- Geng, M., & Trotta, D. (2025). Human–LLM coevolution: Evidence from academic writing. *Findings of ACL 2025*.
- Gritsai, G., i in. (2024). Are AI detectors good enough? A survey on quality of datasets with machine-generated texts. arXiv:2410.14677. *Preprint, nie recenzowany.*
- Hans, A., i in. (2024). Spotting LLMs with Binoculars. *ICML 2024*. arXiv:2401.12070.
- Juzek, T., & Ward, Z. B. (2025). Why does ChatGPT "delve" so much? Exploring the sources of lexical overrepresentation in LLMs. *Proceedings of COLING 2025*. https://aclanthology.org/2025.coling-main.426
- Kobak, D., González-Márquez, R., Horvát, E.-Á., & Lause, J. (2025). Delving into LLM-assisted writing in biomedical publications through excess vocabulary. *Science Advances*, *11*(27), eadt3813. https://doi.org/10.1126/sciadv.adt3813
- Krishna, K., Song, Y., Karpinska, M., Wieting, J., & Iyyer, M. (2023). Paraphrasing evades detectors of AI-generated text, but retrieval is an effective defense. *Advances in Neural Information Processing Systems*, *36*. arXiv:2303.13408.
- Liang, W., Yuksekgonul, M., Mao, Y., Wu, E., & Zou, J. (2023). GPT detectors are biased against non-native English writers. *Patterns*, *4*(7), 100779. https://doi.org/10.1016/j.patter.2023.100779
- Liang, W., Zhang, Y., Wu, Z., i in. (2025). Quantifying large language model usage in scientific papers. *Nature Human Behaviour*, *9*(12), 2599–2609. https://doi.org/10.1038/s41562-025-02273-8
- Lu, N., i in. (2023). Large language models can be guided to evade AI-generated text detection. arXiv:2305.10847. *Preprint, nie recenzowany.*
- Mak, M. H. C., & Walasek, L. (2025). Style, sentiment, and quality of undergraduate writing in the AI era. *Computers and Education: Artificial Intelligence*, *9*, 100507. https://doi.org/10.1016/j.caeai.2025.100507
- Mitchell, E., Lee, Y., Khazatsky, A., Manning, C., & Finn, C. (2023). DetectGPT: Zero-shot machine-generated text detection using probability curvature. *ICML 2023 (PMLR 202)*. arXiv:2301.11305.
- Sadasivan, V. S., Kumar, A., Balasubramanian, S., Wang, W., & Feizi, S. (2023/2025). Can AI-generated text be reliably detected? *Transactions on Machine Learning Research*. arXiv:2303.11156.
- Tang, R., Chuang, Y.-N., & Hu, X. (2024). The science of detecting LLM-generated text. *Communications of the ACM*, *67*(4), 50–59. https://doi.org/10.1145/3624725
- Tarım, İ., & Onan, A. (2025). Can you detect the difference? arXiv:2507.10475. *Preprint, nie recenzowany.*
- Terčon, L., & Dobrovoljc, K. (2025). Linguistic characteristics of AI-generated text: A survey. arXiv:2510.05136. *Preprint, nie recenzowany.*
- Uchendu, A., Ma, Z., Le, T., Zhang, R., & Lee, D. (2021). TURINGBENCH: A benchmark environment for Turing test in the age of neural text generation. *Findings of EMNLP 2021*, 2001–2016. https://doi.org/10.18653/v1/2021.findings-emnlp.172
- Wang, Y., i in. (2024). SemEval-2024 Task 8: Multidomain, multimodel and multilingual machine-generated text detection. *Proceedings of SemEval-2024*. https://doi.org/10.18653/v1/2024.semeval-1.279
- Weber-Wulff, D., Anohina-Naumeca, A., Bjelobaba, S., Foltýnek, T., Guerrero-Dib, J., Popoola, O., Šigut, P., & Waddington, L. (2023). Testing of detection tools for AI-generated text. *International Journal for Educational Integrity*, *19*, 26. https://doi.org/10.1007/s40979-023-00146-z
- Wu, J., Yang, S., Zhan, R., Yuan, Y., Chao, L. S., & Wong, D. F. (2025). A survey on LLM-generated text detection: Necessity, methods, and future directions. *Computational Linguistics*, *51*(1), 275–338. https://doi.org/10.1162/coli_a_00549
- Yang, X., Pan, L., Zhao, X., Chen, H., Petzold, L., Wang, W. Y., & Cheng, W. (2024). A survey on detection of LLMs-generated content. *Findings of EMNLP 2024*, 9786–9805. https://doi.org/10.18653/v1/2024.findings-emnlp.572
- (EvoBench) (2025). EvoBench: Benchmarking and evaluating large language models in evolving machine-generated text detection. *Findings of ACL 2025*. https://doi.org/10.18653/v1/2025.findings-acl.754

### Percepcja, jakość, preferencje

- Appel, M., Malecki, W. P., Messingschlager, T. V., & Winkler, J. R. (2025). I, ChatGPT: Linguistic properties and human experiences of human- versus AI-generated stories. *Humanities and Social Sciences Communications*, *12*. https://doi.org/10.1057/s41599-025-06341-2
- Clark, E., August, T., Serrano, S., Haduong, N., Gururangan, S., & Smith, N. A. (2021). All that's 'human' is not gold: Evaluating human evaluation of generated text. *Proceedings of ACL-IJCNLP 2021*, 7282–7296. https://doi.org/10.18653/v1/2021.acl-long.565
- Dugan, L., Ippolito, D., Kirubarajan, A., Shi, S., & Callison-Burch, C. (2023). Real or fake text? Investigating human ability to detect boundaries between human-written and machine-generated text. *Proceedings of AAAI*, *37*(11). https://doi.org/10.1609/aaai.v37i11.26501
- Goldstein, J. A., Chao, J., Grossman, S., Stamos, A., & Tomz, M. (2024). How persuasive is AI-generated propaganda? *PNAS Nexus*, *3*(2), pgae034. https://doi.org/10.1093/pnasnexus/pgae034
- Hitsuwari, J., Ueda, Y., Yun, W., & Nomura, M. (2023). Does human–AI collaboration lead to more creative art? Aesthetic evaluation of human-made and AI-generated haiku poetry. *Computers in Human Behavior*, *139*, 107502. https://doi.org/10.1016/j.chb.2022.107502
- Jakesch, M., Bhat, A., Buschek, D., Zalmanson, L., & Naaman, M. (2023). Co-writing with opinionated language models affects users' views. *Proceedings of CHI 2023*. https://doi.org/10.1145/3544548.3581196
- Jakesch, M., Hancock, J. T., & Naaman, M. (2023). Human heuristics for AI-generated language are flawed. *PNAS*, *120*(11), e2208839120. https://doi.org/10.1073/pnas.2208839120
- Fiedler, A., & Döpke, J. (2025). Do humans identify AI-generated text better than machines? Evidence based on excerpts from German theses. *International Review of Economics Education*, *49*, 100321. https://doi.org/10.1016/j.iree.2025.100321
- Köbis, N., & Mossink, L. D. (2021). Artificial intelligence versus Maya Angelou: Experimental evidence that people cannot differentiate AI-generated from human-written poetry. *Computers in Human Behavior*, *114*, 106553. https://doi.org/10.1016/j.chb.2020.106553
- Magni, F., Park, J., & Chao, M. M. (2023). Humans as creativity gatekeepers: Are we biased against AI creativity? *Journal of Business and Psychology*. https://doi.org/10.1007/s10869-023-09910-x
- Noy, S., & Zhang, W. (2023). Experimental evidence on the productivity effects of generative artificial intelligence. *Science*, *381*(6654), 187–192. https://doi.org/10.1126/science.adh2586
- Pataranutaporn, P., i in. (2023). Influencing human–AI interaction by priming beliefs about AI can increase perceived trustworthiness, empathy and effectiveness. *Nature Machine Intelligence*. https://doi.org/10.1038/s42256-023-00720-7
- Porter, B., & Machery, E. (2024). AI-generated poetry is indistinguishable from human-written poetry and is rated more favorably. *Scientific Reports*, *14*. https://doi.org/10.1038/s41598-024-76900-1
- Raj, M., Berg, J. M., & Seamans, R. (2026). The artificial intelligence disclosure penalty: Humans persistently devalue AI-generated creative writing. *Journal of Experimental Psychology: General*, *155*(4), 896–915. https://doi.org/10.1037/xge0001889
- Ramos, M. L. F. (2026). Is it cake or is it AI? A systematic review of human uncertainty in distinguishing generative AI content. arXiv:2604.03437. *Preprint, nie recenzowany.*
- Russell, K., Karpinska, M., & Iyyer, M. (2025). People who frequently use ChatGPT for writing tasks are accurate and robust detectors of AI-generated text. *Proceedings of ACL 2025*, 5342–5373. https://doi.org/10.18653/v1/2025.acl-long.267
- Sears, S., & Weisberg, D. S. (2026). Bot or not: Can people tell the difference between stories written by a human or by an AI system? *Judgment and Decision Making*. https://doi.org/10.1017/jdm.2026.10042
- van der Lee, C., Gatt, A., van Miltenburg, E., & Krahmer, E. (2020). Human evaluation of automatically generated text: Current trends and best practice guidelines. *Computer Speech & Language*, *67*, 101151. https://doi.org/10.1016/j.csl.2020.101151
- Wang, Y., i in. (2025). Is human-like text liked by humans? Multilingual human detection and preference against AI. arXiv:2502.11614. *Preprint, nie recenzowany.*
- Zaitsu, W., i in. (2025). Stylometry can reveal artificial intelligence authorship, but humans struggle: A comparison of human and seven large language models in Japanese. *PLOS ONE*. https://doi.org/10.1371/journal.pone.0335369
- Zhang, Y., & Gosline, R. R. (2023). Human favoritism, not AI aversion: People's perceptions (and bias) toward generative AI, human experts, and human–GAI collaboration in persuasive content generation. *Judgment and Decision Making*, *18*. https://doi.org/10.1017/jdm.2023.37
- Zhu, T., Weissburg, I., Zhang, K., & Wang, W. Y. (2025). Human bias in the face of AI: Examining human judgment against text labeled as AI generated. *Findings of ACL 2025*, 25907–25914. https://doi.org/10.18653/v1/2025.findings-acl.1329

### Stylometria i warunki generacji

- Bagdasarov, Z., & Alves, D. (2025). Like a human? A linguistic analysis of human-written and machine-generated scientific texts. *Proceedings of LM4DH 2025*, 38–47. https://aclanthology.org/2025.lm4dh-1.4
- Berber Sardinha, T. (2024). AI-generated vs human-authored texts: A multidimensional comparison. *Applied Corpus Linguistics*, *4*(1), 100083. https://doi.org/10.1016/j.acorp.2023.100083
- Carlo, G. S., & Takeuchi, O. (2026). Form without function? Register sensitivity in CEFR-conditioned LLM and second-language learner writing. *International Journal of Applied Linguistics*. https://doi.org/10.1111/ijal.70284
- Gude, A., Santos-Rios, R., Bond, F., Flickinger, D., Gómez-Rodríguez, C., & Zamaraeva, O. (2026). More aligned, less diverse? Analyzing the grammar and lexicon of two generations of LLMs. *Proceedings of ACL 2026*, 38900–38911. https://doi.org/10.18653/v1/2026.acl-long.1803
- Guo, J., Shang, Y., & Clavel, C. (2025). Benchmarking linguistic diversity of large language models. *Transactions of the ACL*, *13*, 1507–1526. arXiv:2412.10271 (DOI TACL niepotwierdzony).
- Holtzman, A., Buys, J., Du, L., Forbes, M., & Choi, Y. (2020). The curious case of neural text degeneration. *ICLR 2020*. arXiv:1904.09751.
- Juzek, T., & Ward, Z. B. (2025). Word overuse and alignment in large language models: The influence of learning from human feedback. arXiv:2508.01930. *Preprint, nie recenzowany.*
- Kirk, R., Mediratta, I., Nematzadeh, A., i in. (2024). Understanding the effects of RLHF on LLM generalisation and diversity. *ICLR 2024*. arXiv:2310.06452.
- Li, J., Galley, M., Brockett, C., Gao, J., & Dolan, B. (2016). A diversity-promoting objective function for neural conversation models. *Proceedings of NAACL-HLT 2016*. arXiv:1510.03055.
- Milička, J., Marklová, A., & Cvrček, V. (2025). AI Brown and AI Koditex: LLM-generated corpora comparable to traditional corpora of English and Czech texts. arXiv:2509.22996. *Preprint, nie recenzowany.*
- Pillutla, K., Swayamdipta, S., Zellers, R., Thickstun, J., Welleck, S., Choi, Y., & Harchaoui, Z. (2021). MAUVE: Measuring the gap between neural text and human text using divergence frontiers. *NeurIPS 2021*. arXiv:2102.01454.

### Konfudery (translationese)

- Baroni, M., & Bernardini, S. (2005). A new approach to the study of translationese: Machine-learning the difference between original and translated text. *Literary and Linguistic Computing*, *21*(1). https://doi.org/10.1093/llc/fqi039
- Koppel, M., & Ordan, N. (2011). Translationese and its dialects. *Proceedings of ACL 2011*.
- Tirkkonen-Condit, S. (2002). Translationese — a myth or an empirical fact? *Target*, *14*(2). https://doi.org/10.1075/target.14.2.02tir
- Volansky, V., Ordan, N., & Wintner, S. (2013). On the features of translationese. *Digital Scholarship in the Humanities*, *30*(2). https://doi.org/10.1093/llc/fqt031

### Gatunki: UI, prosty język, dokumentacja

- Ayre, J., Bonner, C., Muscat, D. M., i in. (2024). Online plain language tool and health information quality. *JAMA Network Open*, *7*(10), e2437955. https://doi.org/10.1001/jamanetworkopen.2024.37955
- Atkinson, M. (1984). *Our masters' voices: The language and body language of politics*. Methuen.
- Bowman, R., Cooney, O., Newbold, J. W., i in. (2023). Exploring how politeness impacts the user experience of chatbots for mental health support. *International Journal of Human-Computer Studies*, *184*, 103181. https://doi.org/10.1016/j.ijhcs.2023.103181
- Carroll, J. M. (1990). *The Nurnberg funnel: Designing minimalist instruction for practical computer skill*. MIT Press.
- Geng, L., Cao, J., Wei, Y., Yang, D., & Tan, F. (2025). How the innovative advertising language style for nutrition products affects consumers' purchase intentions. *Frontiers in Nutrition*, *12*, 1576478. https://doi.org/10.3389/fnut.2025.1576478
- ISO. (2023). *ISO 24495-1:2023 Plain language — Part 1: Governing principles and guidelines*. International Organization for Standardization.
- Khandwala, K., & Dong, T. (2019). The impact of "cosmetic" changes on the usability of error messages. *CHI EA '19*. https://doi.org/10.1145/3290607.3312978
- Krieger, J. L., Neil, J. M., Strekalova, Y. A., & Sarge, M. A. (2016). Linguistic strategies for improving informed consent in clinical trials among low health literacy patients. *JNCI*, *109*(3), djw233. https://doi.org/10.1093/jnci/djw233
- Lazebnik, T., Zalmanson, L., & Mokryn, O. (2025). Mind your manners: The dynamics of politeness in human-AI vs. human-human interactions. *Proceedings of the ACM on Human-Computer Interaction*, *9*(7). https://doi.org/10.1145/3757631
- Lee, L.-H., Lam, K.-Y., & Hui, P. (2025). Exploring user engagement by diagnosing visual guides in onboarding screens. *Displays*, *87*, 102975. https://doi.org/10.1016/j.displa.2025.102975
- Martínez, E., Mollica, F., & Gibson, E. (2022). Poor writing, not specialized concepts, drives processing difficulty in legal language. *Cognition*, *224*, 105070. https://doi.org/10.1016/j.cognition.2022.105070
- Masson, M. E. J., & Waldron, M. A. (1994). Comprehension of legal contracts by non-experts: Effectiveness of plain language redrafting. *Applied Cognitive Psychology*, *8*(1), 57–70. https://doi.org/10.1002/acp.2350080107
- Mautone, P. D., & Mayer, R. E. (2001). Signaling as a cognitive guide in multimedia learning. *Journal of Educational Psychology*, *93*(2), 377–389. https://doi.org/10.1037/0022-0663.93.2.377
- Passalacqua, M., Morin, R., Sénécal, S., Léger, P.-M., & Nacke, L. E. (2020). Demystifying the first-time experience of mobile games. *Multimodal Technologies and Interaction*, *4*(3), 41. https://doi.org/10.3390/mti4030041
- Portmann, L. (2022). Crafting an audience: UX writing, user stylization, and the symbolic violence of little texts. *Discourse, Context & Media*, *48*, 100622. https://doi.org/10.1016/j.dcm.2022.100622
- Tzeng, J.-Y. (2006). Matching users' diverse social scripts with resonating humanized features to create a polite interface. *International Journal of Human-Computer Studies*, *64*(12), 1230–1242. https://doi.org/10.1016/j.ijhcs.2006.08.011

### Polski — norma, uzus, korpusy, NLP, AI po polsku

- Grochowski, M. (2007). O szyku neutralnym i nacechowanym w języku polskim. Trudności z ustalaniem opozycji. *Prace Filologiczne*, *53*, 241–252.
- Kocmi, T., Limisiewicz, T., & Stanovsky, G. (2020). Gender coreference and bias evaluation at WMT 2020. *Proceedings of WMT 2020*. arXiv:2010.06018.
- Markowski, A., i in. (2017). *Sprawozdanie o stanie ochrony języka polskiego za lata 2014–2015*. Rada Języka Polskiego przy Prezydium PAN.
- Mazur, R. (2024). O poprawności językowej tekstów generowanych przez SI na przykładzie ChatuGPT. *LingVaria*, *19*(1(37)), 119–138. https://doi.org/10.12797/LV.19.2024.37.08
- Mazurkiewicz-Sokołowska (2025). ChatGPT text products and their linguistic correctness. *Lecture Notes in Networks and Systems*, *1643*, 250–265. https://doi.org/10.1007/978-3-032-06611-4_20 (imię autorki niezweryfikowane)
- Miechowicz-Mathiasen, K., & Scheffler, P. (2008). A corpus-based analysis of the peculiar behaviour of the Polish verb *podobać się*. W: J. Witkoś & G. Fanselow (red.), *Elements of Slavic and Germanic grammars: A comparative view* (ss. 89–111). Peter Lang.
- Mroczkowski, R., Rybak, P., Wróblewska, A., & Gawlik, I. (2021). HerBERT: Efficiently pretrained transformer-based language model for Polish. *Proceedings of BSNLP 2021*. https://doi.org/10.18653/v1/2021.bsnlp-1.1
- Pęzik, P. (2020). Budowa i zastosowania korpusu monitorującego MoncoPL. *Forum Lingwistyczne*, *7*, 133–150.
- Prościak, B., Prościak, M., Suszyło-Martula, R., & Sroka, M. (2023). O niedoskonałościach ChatGPT i wątpliwym wykorzystaniu go w obecnym kształcie technologicznym w nauczaniu języka polskiego oraz w badaniach naukowych. *Polonistyka. Innowacje*, *18*, 173–188.
- Przepiórkowski, A., Bańko, M., Górski, R. L., & Lewandowska-Tomaszczyk, B. (red.). (2012). *Narodowy Korpus Języka Polskiego*. Wydawnictwo Naukowe PWN.
- Przybyła, P., Strebeyko, J., & Wróblewska, A. (2025). PolEval 2025 Task 1 Śmigiel: Spotting machine-generated text from LLMs for Polish. *Proceedings of PolEval 2025*, 5–15. https://aclanthology.org/2025.poleval-main.2
- Rada Języka Polskiego przy Prezydium PAN. (2026). *Sprawozdanie o stanie ochrony języka polskiego za lata 2023–2024*. https://rjp.pan.pl
- Rybak, P., Mroczkowski, R., Tracz, J., & Gawlik, I. (2020). KLEJ: Comprehensive benchmark for Polish language understanding. *Proceedings of ACL 2020*, 1191–1201. https://doi.org/10.18653/v1/2020.acl-main.111
- Siewierska, A. (1993). Syntactic weight vs information structure and word order variation in Polish. *Journal of Linguistics*, *29*(2), 233–265. https://doi.org/10.1017/s0022226700000323
- Stachura, D. (2025). Perplexity-driven contrastive scoring for unsupervised detection of AI-generated texts in Polish. *Proceedings of PolEval 2025*, 21–25. https://aclanthology.org/2025.poleval-main.4
- Strebeyko, J., Wróblewska, A., & Przybyła, P. (2025). Śmigiel dataset: Laying foundations for machine-generated text detection in Polish. *LREC-COLING 2025*. https://huggingface.co/datasets/strebeyko/smigiel
- Zuchewicz, K. (2024). Aspect and pragmatics in Polish with a view to Sorbian. *LingBaW. Linguistics Beyond and Within*, *10*, 265–281. https://doi.org/10.31743/lingbaw.18023

---

## Załącznik A. Taksonomia wzorców (rekordy przykładowe; 17 pól)

> Zasada: rekord opisuje FUNKCJĘ konstrukcji w gatunku. Żaden rekord nie jest
> blacklistą. Pewność: A (wysoka) / B (umiarkowana) / C (hipoteza).

### T1 · Trójdzielność i wyliczenia
- **Poziom:** struktura retoryczna · **Definicja operacyjna:** seria ≥3 członów o
  paralelnej składni w jednym zdaniu lub liście.
- **Przykłady:** „szybko, tanio, bezpiecznie”; „nie wystarczy plan; trzeba
  budżetu i ludzi”.
- **Źródła:** Atkinson 1984 (retoryka); Mautone & Mayer 2001 (signaling,
  d≈0,60); brak badań o szkodliwości. · **Jakość:** retoryka: klasyka; efekt
  pozytywny: replikowany w psychologii uczenia.
- **Język/model/gatunek:** uniwersalne; EN (badania); PL (norma retoryczna).
- **Konfudery:** nadmiar (każda druga lista) vs funkcja (kulminacja, mnemotechnika).
- **Fałszywe pozytywy:** teksty marketingowe i przemówienia ludzkie.
- **Dowód przeciwny:** brak badań pokazujących szkodę; folklor H1.
- **Interakcje:** z gatunkiem (UI: szkodzi; przemówienie: narzędzie); z
  długością tekstu (w mikrokopii nadmiar).
- **Strategie poprawy:** usuwać tylko nadmiarowe wystąpienia; zostawiać tam,
  gdzie pełnią funkcję (zapowiedź, puenta).
- **Kryteria pozostawienia:** funkcja mnemotechniczna, kulminacja, rytm, zgodność
  z konwencją gatunku.
- **Test zachowania znaczenia:** usunięcie trzeciego członu nie zmienia tezy i
  nie osłabia rytmu w gatunku literackim/mówionym.
- **Werdykt:** SYGNAŁ KONTEKSTOWY (nie marker AI) · **Pewność:** A.

### T2 · Nagłówki i zapowiedzi struktury (signaling)
- **Poziom:** struktura tekstu · **Definicja:** nagłówki sekcji, zdania-zapowiedzi,
  „po pierwsze/po drugie”.
- **Przykłady:** śródtytuły artykułu; „W tej sekcji omówimy…”.
- **Źródła:** Mautone & Mayer 2001; Masson & Waldron 1994; Carroll 1990.
- **Jakość:** eksperymentalna, replikowana; meta d≈0,60.
- **Język/model/gatunek:** gatunki informacyjne; brak związku z LLM.
- **Konfudery:** nadmiar metadyskursu (zapowiadanie trywialności).
- **Fałszywe pozytywy:** dokumentacja, podręczniki, teksty prawne.
- **Dowód przeciwny:** brak.
- **Interakcje:** w UI nagłówki zbędne (mikrokopia); w raporcie funkcjonalne.
- **Strategie poprawy:** redukuj metadyskurs („warto zauważyć, że”), nie strukturę.
- **Kryteria pozostawienia:** tekst > 1 ekran, cel informacyjny, nawigacja.
- **Test zachowania znaczenia:** bez zmian (struktura nie niesie treści).
- **Werdykt:** REGUŁA POZYTYWNA (zostawiać w gatunkach informacyjnych) ·
  **Pewność:** A.

### T3 · Myślniki, dwukropki, wyliczenia wtrącone
- **Poziom:** interpunkcja/typografia · **Definicja:** nadużywanie pauz
  wydzielających wtrącenia i list.
- **Źródła:** brak badań empirycznych; norma typograficzna PL (WSO PWN — G3).
- **Jakość:** n/d (normatyw) · **Język/gatunek:** EN i PL; publicystyka.
- **Konfudery:** konwencja prasowa (wtrącenia myślnikowe są typowe dla
  polskiego newsu) — rzekomy „marker AI” jest normą redakcyjną internetu.
- **Fałszywe pozytywy:** felieton, publicystyka, proza.
- **Dowód przeciwny:** brak dowodu, że myślnik koreluje z autorstwem LLM po
  kontroli gatunku (nie znaleziono takiego badania).
- **Werdykt:** ODRZUCONE jako marker; edytować wyłącznie wg normy typograficznej
  gatunku · **Pewność:** A (brak dowodu).

### T4 · Nadreprezentowane słownictwo stylistyczne (klasa „delve”)
- **Poziom:** leksyka · **Definicja:** słowa o kilkukrotnym skoku częstości w
  kohortach tekstów po upowszechnieniu LLM w danym gatunku.
- **Przykłady (EN):** delve, showcase, underscore, realm, intricate; **PL:
  niezbadane**.
- **Źródła:** Kobak i in. 2025 (Sci. Adv.); Liang i in. 2025 (Nat. Hum. Behav.);
  Juzek & Ward 2025 (mechanizm); Mak & Walasek 2025 (dryf); krytyka metody:
  Zenodo 10.5281/zenodo.21310387 (preprint).
- **Jakość:** wysoka (skala korpusowa), ale estymator wrażliwy na wybór listy.
- **Język/model/gatunek:** EN; abstrakty biomedyczne, recenzje, preprinty;
  2023–2025.
- **Konfudery:** trend językowy niezależny od AI; instrukcje „pisz
  profesjonalnie”; korektorzy.
- **Fałszywe pozytywy:** ludzie z bogatym słownictwem, L2 naśladujący wzorce,
  tłumacze.
- **Dowód przeciwny:** dryf (spadek „delve” po nagłośnieniu — Geng & Trotta
  2025; Mak & Walasek 2025); preferencja ludzi dla tych słów (Juzek & Ward
  2025 — preprint).
- **Interakcje:** z gatunkiem (nauka: nadmiar czasowników stylistycznych;
  reklama: brak zjawiska).
- **Strategie poprawy:** NIE blacklista; dopuszczalny lokalny pomiar nadmiaru w
  długim tekście danego gatunku; wymiana tylko przy faktycznym nadmiarze.
- **Kryteria pozostawienia:** pojedyncze wystąpienie; trafność rejestrowa;
  termin.
- **Test zachowania znaczenia:** synonim nie zmienia modalności („underscore” →
  „podkreśla” — zachować siłę).
- **Werdykt:** SYGNAŁ POPULACYJNY, nie marker indywidualny · **Pewność:** A dla
  EN; C dla PL.

### T5 · Metadyskurs i sztuczna emfaza („warto zauważyć”, „kluczowe jest”)
- **Poziom:** pragmatyka tekstu · **Definicja:** komentarz o samym tekście lub
  o wadze własnych treści bez nośności informacyjnej.
- **Źródła:** brak bezpośrednich badań różnicujących; pośrednio A4 (cechy
  pragmatyczne jako słabe sygnały), E5 (zapowiedzi mają wartość, gdy
  strukturalne).
- **Jakość:** n/d · **Język/gatunek:** EN/PL; publicystyka, nauka.
- **Konfudery:** hedging akademicki (funkcjonalny), norma popularnonaukowa.
- **Fałszywe pozytywy:** wykłady, poradniki, teksty studenckie.
- **Werdykt:** HIPOTEZA (usuwać tylko redundancję; chronić hedging naukowy) ·
  **Pewność:** C.

### T6 · Końcowe podsumowania i konkluzje
- **Poziom:** struktura dyskursu · **Definicja:** akapit podsumowujący po
  każdej sekcji/tekście.
- **Źródła:** E5 (podsumowania pomagają w uczeniu); Carroll 1990.
- **Werdykt:** REGUŁA POZYTYWNA dla długich form (rozdz. 10); nadmiar w
  mikrokopii · **Pewność:** A.

### T7 · „To nie X, to Y” i kontrasty
- **Poziom:** figura retoryczna · **Definicja:** definicja przez negację +
  kontrast.
- **Źródła:** brak badań różnicujących; retoryka klasyczna.
- **Werdykt:** HIPOTEZA (nie marker); edytować wg funkcji dydaktycznej ·
  **Pewność:** C.

### T8 · Symetria i paralelizm składniowy
- **Poziom:** składnia · **Definicja:** powtarzalny wzorzec składniowy w
  kolejnych zdaniach.
- **Źródła:** C5 (jednolitość składniowa LLM — pośrednio); retoryka.
- **Werdykt:** SYGNAŁ KONTEKSTOWY (nadmiar paralelizmu w gatunkach
  nie-retorycznych) · **Pewność:** B.

---

*Koniec raportu. Wersja 1.0.*
