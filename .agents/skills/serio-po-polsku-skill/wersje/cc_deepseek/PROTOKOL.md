# Protokół przeglądu — „Język AI” a polszczyzna: weryfikacja twierdzeń o stylu tekstów LLM na potrzeby skilla redakcyjnego

*Rejestracja przed wyszukiwaniem (styl PROSPERO) · Data: 2026-08-17 · Autor: CC DeepSeek (niezależny research, izolacja w `wersje/cc_deepseek/`)*

## 1. Pytanie i tło

**Pytanie główne (PICO):** Które rzekome cechy stylistyczne „języka AI” mają poparcie
w recenzowanej literaturze naukowej po kontrolowaniu gatunku, modelu, promptu i języka —
a które są anegdotą, artefaktem jednego produktu lub konfunderem — oraz jak bezpiecznie
redagować polskie teksty widoczne dla człowieka, zachowując sens i głos autora?

- **P (populacja/problem):** teksty generowane przez LLM i teksty ludzkie w gatunkach:
  UI/mikrokopia, błąd, onboarding, artykuł, raport, tekst naukowy, reklama, dialog,
  literatura, długie formy (książki); czytelnicy i redaktorzy (także polskojęzyczni).
- **E (ekspozycja):** tekst wygenerowany przez LLM (cechy stylu: schematyczność,
  trójdzielność, symetria, wyliczenia, nagłówki, myślniki, uogólnienia, metadyskurs,
  sztuczna emfaza, podsumowania) lub postrzegany jako taki.
- **C (komparator):** tekst ludzki **w tym samym gatunku**; tekst przetłumaczony
  maszynowo; tekst ucznia/osoby piszącej w L2; prosty język; język urzędowy;
  copywriting/SEO; tekst już zredagowany profesjonalnie.
- **O (wyniki):** mierzona rozróżnialność (dokładność detekcji, AUC, false positives),
  percepcja (naturalność, jakość, autentyczność głosu, preferencje), miary leksykalno-
  stylistyczne (różnorodność leksykalna, „burstiness”, powtarzalność n-gramów), jakość
  tekstu po redakcji, zachowanie znaczenia.
- **T/S:** 2018-01-01 – 2026-08-17; języki: angielski (dominujący), polski (bezpośrednio
  rzadki — jawne oznaczenie transferu); platformy badawcze i naturalistyczne.

**Dlaczego:** przyszły skill redakcyjny ma usuwać schematyczność **tylko wtedy, gdy jest
ona rzeczywistym problemem w danym gatunku**. Bez audytu przyczynowego skill ryzykuje
powielanie folkloru internetowego („blacklisty zwrotów AI”), szkodzenie dobrym tekstom
i obiecywanie niewykrywalności (wykluczone z celów skilla).

**Luka:** listy „zwrotów AI” krążą bez weryfikacji; badania detekcji rzadko kontrolują
gatunek i subpopulacje ludzkie; materiał polski jest szczątkowy, a transfer EN→PL zwykle
milczący.

## 2. Cele

- **Główny:** mapa dowodów: reguły / sygnały kontekstowe / hipotezy / twierdzenia
  odrzucone, z warunkami wyłączenia każdej reguły i testem zachowania znaczenia.
- **Drugorzędne:**
  1. Definicje i pomiar naturalności, jakości, schematyczności, autentycznego głosu.
  2. Cechy LLM powtarzalne w recenzowanych badaniach i replikacjach; twierdzenia oparte
     tylko na anegdocie lub jednym produkcie.
  3. Polszczyzna bezpośrednio: fleksja, szyk, zgoda, aspekt, pragmatyka; norma i uzus 2026.
  4. Konfundery: tłumaczenie, tekst uczniowski, język urzędowy, prosty język, SEO,
     copywriting, neuroróżnorodność, L2, szablon organizacji.
  5. Efekt modelu, wersji, dostrajania, promptu, temperatury, długości, gatunku na styl.
  6. Kiedy konstrukcje „AI-schematyczne” są retorycznie uzasadnione.
  7. Zasady redakcji bez zmiany faktów, wniosków, modalności, głosu, terminologii.
  8. Różnice gatunkowe (UI, błąd, onboarding, artykuł, raport, nauka, reklama, dialog,
     literatura); rozpoznawanie tekstu widocznego dla użytkownika w kodzie; długie formy.
  9. Falsyfikowalny plan ewaluacji przyszłego skilla; granice uczciwych wniosków
     o detektorach.

**14 pytań obowiązkowych z zadania stanowią strukturę podpytań (Q1–Q14) — każde pytanie
badane osobnymi zapytaniami potwierdzającymi i falsyfikującymi.**

## 3. Kryteria kwalifikacji

- **Typy badań (włączone):** recenzowane artykuły w czasopismach i na konferencjach
  (ACL, EMNLP, NAACL, CHI, CSCW, FAccT, ICWSM, WSDM, EACL, LREC, COLING, NeurIPS/ICML
  dla detekcji); przeglądy systematyczne i metaanalizy; badania replikacyjne i wyniki
  zerowe; eksperymenty z percepcją ludzką (z opisem próby i statystyką); badania
  korpusowe; normatywy i korpusy języka polskiego jako **osobna podstawa normy/uzusu**
  (nie eksperyment nad AI); autorytety (ISO 24495 prosty język, Rada Języka Polskiego,
  PWN).
- **Preprinty:** dopuszczone wyłącznie jako wsparcie twierdzeń mających też podstawę
  recenzowaną; nie mogą samodzielnie uzasadniać mocnej reguły (oznaczane `preprint,
  not peer-reviewed`).
- **Blogi, posty, filmy, listy „zwrotów AI”:** wykluczone jako dowód; dopuszczone jako
  `OBJECT-OF-STUDY` (badanie folkloru, np. co lista zawiera, skąd pochodzi).
- **Daty:** 2018-01-01 – 2026-08-17. Prace starsze (era pre-transformerowa) tylko jako
  tło historyczne, wyraźnie oznaczone.
- **Języki:** angielski, polski. Inne tylko wtedy, gdy kluczowe dla replikacji i
  weryfikowalne wtórnie.
- **Wykluczenia:** materiały marketingowe dostawców (jako dowód), op-edy, SEO-listy,
  prace bez opisu metody lub bez statystyki, źródła nieodzyskiwalne, źródła
  retraktowane (po weryfikacji), treści z innych katalogów `wersje/` i `skill-files/`
  (twarda izolacja zadania).

## 4. Źródła informacji

- **Bazy (MCP):** OpenAlex (`openalex` MCP), `paper-search` MCP (Semantic Scholar,
  arXiv, Crossref, PubMed/Europe PMC). ACL Anthology przez WebSearch/WebFetch.
- **Dodatkowe (WebSearch scholastyczny):** domeny z `references/database-guide.md`
  (aclweb.org, arxiv.org, semanticscholar.org, openalex.org, doi.org, nature.com,
  science.org, journals.sagepub.com, acm.org, ieee.org, springer.com, plos.org i in.).
- **Polskie:** Repozytorium CEON, BazHum, PBN/POL-index, polonistyka akademicka,
  korpusy NKJP (nkjp.pl), Monco (monco.frazeo.pl), IPI PAN; normatywy: RJP, PWN
  („Zasady pisowni i interpunkcji”, WSO), „Dobre obyczaje w nauce”.
- **Grey literature:** standardy ISO 24495, WCAG/EAA (dostępność), wytyczne stylów
  dokumentacji (Microsoft Style Guide, Google developer documentation style guide)
  — jako podstawa normy gatunkowej, nie jako dowód eksperymentalny.
- **Citation chasing:** wstecz (referencje) i w przód (citujący) przez OpenAlex /
  Semantic Scholar dla każdej tezy kluczowej.

## 5. Strategia wyszukiwania

Zasady: (1) osobne zapytania **potwierdzające** i **falsyfikujące** dla każdego
obszaru; (2) warianty boolowskie + synonimy; (3) wyszukiwanie po angielsku i polsku;
(4) najpierw przegląd systematyczny pola, potem badania pierwotne; (5) dokładne
logowanie (baza, string, data, liczba trafień, liczba zachowanych) do `SEARCHLOG.yaml`.

Planowane klastry zapytań (rozwinie się przy uruchomieniu):

- **A. Detekcja i odcisk stylu LLM:** `"AI-generated text detection"`, `"machine
  generated text detection"`, `"LLM text detection"`, `"synthetic text detection"`,
  `"ChatGPT detection linguistic features"`, `"stylometric features LLM"`,
  `"linguistic fingerprints of generated text"`, `"human vs machine generated text
  classification"`.
- **B. Falsyfikacja detekcji:** `"detector failure"`, `"false positive AI detector
  non-native"`, `"humans cannot distinguish AI text"`, `"Turing test writing"`,
  `"AI detection bias"`, `"watermarking detection limitations"`, `"adversarial
  paraphrasing detection"`.
- **C. Percepcja i jakość:** `"perceived human-likeness AI text"`, `"naturalness
  evaluation"`, `"text quality human evaluation LLM"`, `"AI text preference study"`,
  `"MAUVE evaluation"`, `"repetition lexical diversity generated text"`,
  `"burstiness perplexity human text"`.
- **D. Konfundery:** `"machine translationese"`, `"translation artifacts style"`,
  `"non-native writer detection false positive"`, `"academic writing style ESL"`,
  `"plain language effect quality"`, `"officialese"`, `"SEO content quality"`,
  `"neurodivergent writing AI detector"`.
- **E. Model/prompt/temperatura/gatunek:** `"effect of temperature on text
  diversity"`, `"prompting style LLM"`, `"instruction tuning style bias"`,
  `"model version style drift"`, `"genre conditioning style"`.
- **F. Polszczyzna:** `"polszczyzna norma"`, `"szyk zdania polskiego korpus"`,
  `"aspekt czasownika polski"`, `"uzus polszczyzny"`, `"Polish word order corpus"`,
  `"Polish aspect"`, `"tłumaczenie maszynowe polszczyzna jakość"`,
  `"machine translation Polish quality evaluation"`, `"polski język AI teksty"`,
  `"Polish AI-generated text"`.
- **G. Gatunki i UX:** `"UX writing research"`, `"microcopy"`, `"error message
  design usability"`, `"onboarding copy"`, `"plain language ISO 24495"`,
  `"technical documentation style"`, `"advertising copywriting research"`.
- **H. Retoryka schematyczności:** `"rule of three rhetoric"`, `"parallelism
  rhetoric"`, `"metadiscourse"`, `"hedging academic writing"`, `"bullet points
  readability"`, `"headings comprehension"`, `"summary effect memory"`.

## 6. Selekcja i screening

1. Tytuł + abstrakt → odrzucenie oczywistych niezgodności (nie-naukowe, poza
   zakresem, marketing).
2. Pełny tekst → ocena jakości i ekstrakcja.
3. Konflikty rozstrzygane **kryterium surowszym** (wątpliwość = wykluczenie z
   bazy dowodowej; do `EXCLUDED.md` z powodem).
4. Rekordy deduplikowane po DOI/tytule; liczniki PRISMA (zidentyfikowano →
   przesiano → włączono) odnotowane w SEARCHLOG.yaml.

## 7. Ekstrakcja danych

Pola (skill `data-extraction`, rozszerzone o wymogi zadania):
`id · autorzy · rok · tytuł · źródło/DOI · typ badania · populacja/korpus (N, język,
gatunki, okres) · modele/wersje/prompt/temperatura · interwencja/ekspozycja ·
komparator · miary i wyniki (efekty, przedziały, false-positive rate) · konfundery
kontrolowane · ryzyko błędu · lokalizator (sekcja/strona) · wspierana teza ·
stosowalność do polskiego (bezpośrednia / pośrednia / brak) · uwagi`.

## 8. Ryzyko błędu i pewność dowodów

- **Karty tez** (specyfikacja CC DeepSeek) dla każdego ważnego twierdzenia: dokładna
  teza; rodzaj dowodu i jakość badania; populacja/korpus, język, modele, gatunki,
  okres; konfudery i wyjaśnienia alternatywne; dowody zgodne; dowody przeciwne lub
  wyniki zerowe; replikacja i transfer poza domenę; warunek falsyfikacji („co
  musiałoby być prawdą, aby teza była fałszywa”); najwęższe uzasadnione
  sformułowanie; decyzja: **reguła / sygnał kontekstowy / hipoteza / odrzucić**.
- **Narzędzia:** GRADE (pewność dowodów); ROBIS/AMSTAR-2 dla przeglądów; dla badań
  detekcji — kontrola miar FP, gatunku i subpopulacji; red flags z
  `references/statistics-red-flags.md`; pakiety domenowe `computer-science`
  (replikowalność, artefakty, wersja recenzowana) i `social-sciences`
  (przyczynowość, pre-rejestracja, WEIRD, efekt rozmiaru).
- **Kryteria specjalne audytu przyczynowego:** czy częstotliwość konstrukcji
  odróżnia AI od ludzi **po kontrolowaniu gatunku**; czy cecha pochodzi z LLM, z
  instrukcji „pisz profesjonalnie”, czy ze standardu redakcyjnego internetu; czy
  badanie używa starych modeli i czy wynik przetrwał zmianę generacji; czy mierzona
  jest rzeczywista polszczyzna, tłumaczenie, czy dane syntetyczne; czy kryterium
  „brzmi jak AI” nie jest kołowe; czy zalecana poprawka zwiększa jakość, czy tylko
  usuwa sygnał klasyfikatora; czy reguła szkodzi tekstom prawnym, naukowym,
  literackim lub już dobrym.

## 9. Plan syntezy

- Synteza **narracyjna** (miary heterogeniczne: AUC, kappa oceniających, LLM-as-judge,
  metryki korpusowe — metaanaliza nieuzasadniona).
- **Taksonomia wzorców:** rekordy o 17 polach (ID · nazwa · poziom · definicja
  operacyjna · przykłady · źródła · jakość · język/model/gatunek · konfudery ·
  fałszywe pozytywy · dowód przeciwny · interakcje · strategie poprawy · kryteria
  pozostawienia · test zachowania znaczenia · werdykt · pewność). **Bez blacklisty.**
- Analizy podgrup: gatunek; język (EN vs PL vs tłumaczenie); era/model; subpopulacje
  ludzkie (uczeń, L2, urzędowy, neuroróżnorodność, SEO, prosty język).
- Oddzielenie trzech osi: **autorstwo** (kto napisał) ≠ **jakość** (jak dobry tekst)
  ≠ **decyzja redakcyjna** (co poprawić).
- Subagenci: 6 scoutów `literature-scout` na rozłączne obszary (równolegle); po
  szkicu — `skeptic` do ataku na wnioski.

## 10. Rejestr zmian (amendments)

1. **2026-08-17 (faza wyszukiwania).** Semantic Scholar (MCP `paper-search`,
   `search_semantic`) zwrócił pusty wynik dla kluczowego zapytania o percepcję
   (S08) — zastosowano zapasowo OpenAlex `title.search`; pokrycie tematu
   potwierdzone niezależnie przez scout-perception. Bez wpływu na kryteria.
2. **2026-08-17 (faza weryfikacji).** DOI `10.1162/tacl.a.47` podane przez
   scouta dla Guo i in. (2025) prowadzi do innej pracy (Kreutzer i in. 2022).
   Zgodnie z regułą „nigdy nie zgaduj” zamiast DOI zastosowano lokator
   arXiv:2412.10271 + TACL 13:1507–1526; pozycja oznaczona jako
   „DOI niepotwierdzony”. Nie zmienia to kryteriów kwalifikacji.
3. **2026-08-17 (faza weryfikacji).** Do bazy dowodowej dołączono rekordy
   pierwotne niedostępne w Crossref (ACL Anthology 2025.poleval-main.2/4,
   2025.coling-main.426, 2025.lm4dh-1.4) z lokatorem ACL Anthology zamiast
   DOI — zgodnie z protokołem §4 (ACL Anthology jako baza pola).
4. **2026-08-17 (faza syntezy).** W toku syntezy ujawniono lukę w indeksacji
   polskich czasopism — rozszerzono screening o WebFetch rjp.pan.pl /
   sjp.pwn.pl jako normatywy (zgodnie z protokołem §4: normatywy jako osobna
   podstawa normy/uzusu).
5. **2026-08-17 (po szkicu).** Skierowano szkic raportu do `skeptic` (atak
   adversarny) — wymagane przez zadanie; wyniki i korekty wpisane w
   RAPORT.md (wersja 1.1) oraz w CLAIM-AUDIT.md.

---

## Załącznik A. Mapowanie pytań obowiązkowych na klastry zapytań

| # | Pytanie obowiązkowe | Klaster | Uwagi |
|---|---|---|---|
| Q1 | Definicje naturalności/jakości/schematyczności/głosu | C + G | miary: MAUVE, ludzkie oceny, operacjonalizacje |
| Q2 | Cechy LLM powtarzalne w badaniach i replikacjach | A | też wyniki zerowe |
| Q3 | Twierdzenia anegdotyczne / jeden produkt | A+B+H | folklor = OBJECT-OF-STUDY |
| Q4 | Polszczyzna: fleksja, szyk, zgoda, aspekt, pragmatyka | F | norma/uzus jako osobna podstawa |
| Q5 | Konfudery pozornego markera | D | tłumaczenie, uczeń, urzędowy, prosty język, SEO, copywriting, neuroróżnorodność, L2, szablon org. |
| Q6 | Model/wersja/dostrajanie/prompt/temperatura/długość/gatunek | E | styl jako funkcja warunków |
| Q7 | „To nie X, to Y”, trójdzielność, symetria, wyliczenia, nagłówki, myślniki, uogólnienia, metadyskurs, emfaza, podsumowania | A+H | taksonomia wzorców |
| Q8 | Kiedy te konstrukcje są retorycznie uzasadnione | H | retoryka klasyczna, literatura o strukturze tekstu |
| Q9 | Redakcja bez zmiany faktów/wniosków/modalności/głosu/terminologii | C+G | teoria redakcji + badania nad parafrazą |
| Q10 | Różnice gatunkowe: UI, błąd, onboarding, artykuł, raport, nauka, reklama, dialog, literatura | G | HCI + style guides jako norma gatunku |
| Q11 | Rozpoznawanie tekstu widocznego dla użytkownika w kodzie | G | wzorce i18n, selektory, a11y — po konsultacji ze standardami |
| Q12 | Bezpieczna redakcja całej książki, globalna spójność | G | długie formy, konsystencja terminologiczna |
| Q13 | Aktualna polszczyzna 2026 bez mody językowej i auto-upraszczania | F | uzus korpusowy vs norma |
| Q14 | Testy obalające skuteczność skilla | C+B | plan ewaluacji falsyfikowalnej |

## Załącznik B. Twarda izolacja (deklaracja wykonania)

- Czytane: `CLAUDE.md`, `README.md`, `.claude/skills/**`, `.claude/agents/**`,
  `references/**`, `research/_TEMPLATE-*.md`, `.mcp.json`, `scripts/**`.
- Zapis: wyłącznie `wersje/cc_deepseek/`.
- Nieczytane i nieużywane: inne katalogi pod `wersje/`, `wersje/SYNTEZA.md`,
  `skill-files/`.
- Brak modyfikacji wspólnych instrukcji, brak skilla, brak raportu w `research/`.
