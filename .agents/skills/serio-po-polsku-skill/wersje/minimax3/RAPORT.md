# Raport — Rozpoznawanie i redagowanie „schematycznej polszczyzny" kojarzonej z LLM

*Data przeglądu: 2026-08-16 · Wersja robocza: MiniMax3 · Izolacja: zapisy wyłącznie w `wersje/minimax3/` · Styl cytowań: APA 7 (klucze źródeł zgodne z `EVIDENCE-TABLE.md` i `SOURCES.bib`)*

> **Cel dokumentu:** materiał do przyszłego skilla, który potrafi poprawić pojedyncze zdanie, interfejs, artykuł, opracowanie lub całą książkę w polszczyźnie. Poprawa ma zwiększać naturalność, klarowność i adekwatność, ale zachowywać sens, fakty, poziom pewności, indywidualny głos, humor, stylizację, terminologię oraz strukturę wymaganą przez gatunek. **Nie optymalizujemy pod detektory AI.**

---

## 1. Metryka, data, narzędzia i ograniczenia

- **Data przeglądu:** 2026-08-16.
- **Recenzent (rola):** model MiniMax3, Mavis, specjalizacja: praktyka redakcyjna, różnorodność gatunkowa, głos, rytm, dialog, długie formy, ewaluacja przed/po.
- **Narzędzia:** web_search + web_fetch (web-only); DOI rozwiązywane przez `arxiv.org`, `aclanthology.org`, `pmc.ncbi.nlm.nih.gov` i `crossref.org`. Brak w szczególności MCP `paper-search` (paper-search-mcp) ani `openalex` (openalex-mcp-server) — oba zdefiniowane w `.mcp.json`, ale niedostępne w tej sesji (patrz `PROTOKOL.md §0` i `SEARCHLOG.yaml limitations_of_search`).
- **Subagenenty:** `literature-scout` i `skeptic` z `.claude/agents/` **nie są dostępne** w sesji Mavis (Task tool widzi wyłącznie `mavis`, `general`, `verifier`, `coder`). Równoważne przejścia (równoległe zapytania + adversarial pass) wykonano ręcznie (por. `SEARCHLOG.yaml` sekcje `skeptic_pass` i `queries`).
- **Baza źródeł:** 89 rekordów włączonych do `EVIDENCE-TABLE.md` (52 peer-reviewed lub autorytety; 32 preprinty z flagą „not peer-reviewed"; 5 industry/blog z rolą BACKGROUND lub OBJECT-OF-STUDY). 60 odrzuconych na screeningu (marketing, vendor self-claims, duplikaty), 31 odrzuconych na full-text (słabe korelacje, brak verifiable data). PRISMA-style counts w `SEARCHLOG.yaml`.
- **Główne ograniczenia:**
  1. Brak bezpośredniego polskiego benchmarku detekcji o otwartym peer reviewu dla każdej cechy LLM-tekstu — większość ustaleń przenoszona z angielskiego, japońskiego, czeskiego, chińskiego. Wszystkie transfery międzyjęzykowe oznaczone jako `DOWNGRADED` w `CLAIM-AUDIT.md`.
  2. Najnowsza fala (2025-2026) publikacji częściowo preprintowa; modele takie jak GPT-4o, Claude 4 zmieniły krajobraz detekcji, ale wiele ustaleń z 2023-2024 wymaga ponownej weryfikacji.
  3. Brak pełnej integracji z polskimi źródłami normatywnymi dla każdej operacji redakcyjnej — autorytety (RJP, Rada Języka Polskiego, IJP PAN) publikują wytyczne w sposób kazuistyczny, nie systemowy.
  4. Skale ocen redakcyjnych (MQM, rubryki NN/g, Lehman–Sułkowski Voice Rubric) są dziedzinowo-specyficzne (tłumaczenia, UX, eseje akademickie). Brak jednego standardu dla polskich tekstów kreatywnych / literackich.

---

## 2. Pytania, protokół i metody

Pytanie główne (scoping+comparative+mechanistic): **Co wiadomo z recenzowanej literatury naukowej i z autorytatywnego opisu polszczyzny o (a) cechach językowych i stylistycznych tekstów generowanych przez LLM, (b) granicach, w jakich da się je rozpoznawać automatycznie, (c) operacjach redakcyjnych przywracających naturalność, klarowność i adekwatność gatunkową bez optymalizacji pod detektory, (d) różnicach między angielskim a polskim (transfer międzyjęzykowy), (e) wpływie modelu/promptu/temperatury/długości/gatunku?**

Protokół: PROSPERO-style w `PROTOKOL.md`. Pipeline: `research-question → research-protocol → literature-search → source-credibility → citation-verification → data-extraction → critical-appraisal → scientific-consensus → evidence-synthesis → research-report`. Równoległe zapytania (24 w `SEARCHLOG.yaml`, klastry A-J pokrywające 10 domen tematycznych). Skeptic pass z 7 kontr-dowodami (SK-1 do SK-7 w `SEARCHLOG.yaml`).

Włączenia: peer-reviewed, autorytety normatywne (RJP, Rada Języka Polskiego, gov.pl, ZBP), preprinty z flagą. Wykluczenia: vendor marketing, blogi bez verifiable data, duplikaty.

---

## 3. Ocena bazy dowodowej

### 3.1 Siła dowodów per temat

| Temat | Siła | Uwagi |
|---|---|---|
| Cechy LLM-tekstów w EN (leksykalne, składniowe, hedging, engagement, burstiness) | **Wysoka** | Wielokrotnie replikowane: Reinhart 2025 PNAS [A1], Muñoz-Ortiz 2025 ACL [A3], 284 features 2026 [A6], Nature HSSCommun 2025 [A8], 6 wymiarów lexical diversity [A16] |
| Cechy LLM-tekstów w PL | **Niska (transfer)** | Brak dedykowanego peer-reviewed polskiego korpusu cech LLM poza ogólnymi benchmarkami PLLuM/Bielik [J1-J4]; PolEval 2025 SMIGIEL [B20] dla detekcji; Polish Ratio [B21] preprint. Wszystkie transfery z EN oznaczone DOWNGRADED |
| Detektory AI w EN (Binoculars, Fast-DetectGPT, RADAR, GPTZero) | **Wysoka (in-domain); Umiarkowana (cross-domain/adversarial)** | Binoculars 90%+ TPR na clean; ale arXiv 2607.29539 [B6] i B5 NeurIPS 2025 pokazują spadek 60-78 pp pod paraphrase |
| Detektory AI w PL | **Umiarkowana (workshop-grade)** | PolEval 2025 SMIGIEL [B20] 81.22% na unseen generators (workshop); Bielik Guard [B22] (preprint); Mozilla Foundation PL [J10] (industry) — niezależny audyt komercyjnych (Antyplagiat, Isgen) brak |
| Bias detektorów (non-native, ELL, ESOL) | **Wysoka** | Liang 2023 Patterns [B7] 61.3% FPR (Cell Press, peer-reviewed); Pindrop ACL 2026 [B8]; replikacje w wielu krajach |
| Polska norma ortograficzna 2026 | **Wysoka (autorytety)** | RJP oficjalne [C1], gov.pl [C2], PSONI ETR [C3], ZBP [C4] |
| Polskie wytyczne redakcyjne (prosty język, nominalizacja, strona bierna) | **Mieszana** | Autorytatywne dla administracji (C2) [H]; dla twórczości — poradnie językowe (C11), ale brak twardych danych empirycznych specyficznie polskich |
| Stylistyka redakcyjna (sentence compression, paraphrasing) | **Wysoka (EN); Umiarkowana (transfer do PL)** | Clarke 2011 ACL [F5], D16-1033 [F6], UPenn [I1] — wszystkie EN; transfer do PL hipotetyczny, wsparte spójną zasadą (substitution+rephrasing > deletion) |
| Creative writing craft (głos, dialog, POV) | **Wysoka (psycholingwistyka); Umiarkowana (LLM)** | Van Krieken 2017 [D2], Frontiers 2021 [D3] — recenzowane; badania LLM imitation [D6-D13] w większości preprinty |
| UX writing / HCI | **Umiarkowana (industry research)** | NN/g [E1-E4] ugruntowane; Smashing, Parklab itp. [E7-E16] spójne ale industry-grade |
| Długie formy, chunking | **Umiarkowana (preprinty, workshopy)** | BooookScore [G1], CreAgentive [G2], NCP [G3], DOME [G4], OpenAI [G6] — wszystkie preprinty; techniki workflow dobrze udokumentowane empirycznie, ale brak recenzowanego meta-przeglądu |
| Ewaluacja redaktorska (MQM, preferencje) | **Wysoka (tłumaczenia); Niska (twórczość, polski)** | MQM [F1-F2] standard; F8 reading time; brak analogicznego standardu dla polskiej twórczości |

### 3.2 Główne luki

- **Brak recenzowanego polskiego korpusu** cech LLM-tekstów obejmującego wszystkie gatunki. PolEval 2025 SMIGIEL [B20] to detekcja, nie opis cech.
- **Brak bezpośrednich badań** nad tym, czy "trójpodział", "to nie X, to Y", "em-dash overuse" są specyficznie cechami LLM-tekstów w polskim — wszystkie dane pośrednie (z angielskiego, z japońskiego, z czeskiego AI Koditex [A15]).
- **Brak recenzowanej ewaluacji** vendor-claims dla polskiego (Antyplagiat 95%, Isgen).
- **Brak polskiego odpowiednika** MQM dla tekstu kreatywnego / literackiego.

---

## 4. Dowody polskie i transfer międzyjęzykowy

### 4.1 Co istnieje w polskim (autorytety)

- **Rada Języka Polskiego** [C1]: Zmiany pisowni od 1 stycznia 2026 (wielka litera w nazwach mieszkańców, pojedynczych egzemplarzy wyrobów; łączna pisownia *nie* z przymiotnikami/imbiesłowami; jednolity zapis wielką literą w członach nazw własnych). Jest to **jedyny autorytarny wyznacznik** normy ortograficznej.
- **Ministerstwo Cyfryzacji, "Prosty język"** [C2]: 10 zasad (zdania 15-20 słów, brak strony biernej, brak nominalizacji, naturalny szyk, brak patosu, nagłówki, listy, ograniczenie imiesłowów). Obowiązuje w administracji publicznej.
- **PSONI, "Standardy ETR"** [C3]: Tekst łatwy do czytania i zrozumienia, zgodny z WCAG.
- **ZBP, "Porozumienie"** [C4]: Standard prostego języka w sektorze bankowym, na poziomie B2 (Polski Akt o Dostępności).
- **Sejm RP, "Sprawozdanie o stanie ochrony języka polskiego"** [C5]: Nadużycie strony biernej w uzasadnieniach orzeczeń administracyjnych — **rażące** utrudnienie.
- **Poradnia Językowa UŁ** [C11]: Bezosobowość w tekście naukowym jako konwencja procedur, ale **nadużycie** utrudnia czytanie.
- **Jędrzejko 1993** [C10]: Definicja nominalizacji jako S → NP — foundational.
- **WSB Poznań** [C9]: Nominalizacja i pasywizacja w tekście prawnym — precyzja, ale nadmiar obniża czytelność.

### 4.2 Polskie modele LLM (ekspertyza własna)

- **Bielik** (SpeakLeash + ACK Cyfronet AGH) [J1-J2, J13]: 11B v3 (Apache 2.0), 1.5B/4.5B (Apache 2.0); w A/B vs PLLuM wygrywa 81.5% (średnia ocena 4.52/5).
- **PLLuM** (NASK + konsorcjum HIVE AI + Ministerstwo Cyfryzacji) [J4-J5]: 4B/8B/12B/70B; ASR <1.5% po red-teamingu na polskich danych.
- **JSA (Jednolity System Antyplagiatowy)** [J8]: Od 2024 używa "regularności" tekstu jako proxy AI; decyzja końcowa po stronie promotora.
- **Karolina Rudnicka (Uniwersytet Gdański)** [J13]: „Nie ma narzędzia" do 100% rozpoznania tekstu AI.

### 4.3 Polskie benchmarki detekcji

- **PolEval 2025 SMIGIEL** [B20]: Pierwsza systematyczna ewaluacja par modeli (91 par, 14 LLM). Najlepsza para: Gemma-3-27B + PLLuM-12B = **81.22%** na unseen generators. To jedyny peer-reviewed (workshop-grade) wynik polskiej detekcji.
- **Polish Ratio** [B21]: Metryka 0.2/0.6; preprint 2023, brak replikacji.
- **Bielik Guard** [B22]: Polish safety classifier 0.1B-0.5B; precision 77.65%, FPR 0.63% (bezpieczeństwo, nie authorship).
- **Mozilla Foundation PL** [J10]: Binoculars na polskim tekście = 43% TPR (vs 90% w oryginale) — silna degradacja w cross-lingual.

### 4.4 Granice transferu z EN

Wzorzec cech LLM-tekstów jest **strukturalnie spójny** między językami (A8 Nature HSSCommun EN, A15 CS, A17 JA, A19/A20 EN w psycholingwistyce), ale **skala efektu jest specyficznie językowa**:
- **Niska dywersyfikacja leksykalna** (TTR, hapax) jest **najbardziej odpornym** sygnałem cross-lingwalnie [A6, A3, A5] — spodziewane w PL.
- **Hedging, engagement markers, strona bierna** — zależne od konwencji gatunkowej, nie od modelu. Akademicka polszczyzna historycznie dopuszcza bezosobowość, więc LLM-akademicki może nie odbiegać tak bardzo jak LLM-beletrystyczny [SK-1, C14].
- **Trójpodziały, paralelizm, "to nie X, to Y"** — popularne tezy blogowe, ale **bez bezpośredniego polskiego dowodu korpusowego**. Prawdopodobnie mają miejsce (wzorzec EN/ES/JA/CS spójny), ale **skala nie jest zmierzona w PL**.
- **Em-dash** — D8 (Erasmus thesis) w EN romantic fiction = 11/85 participants flagged as "AI-coded". Czy przenosi się na PL? **Nie wiadomo**; polskie użycie myślnika jest własne stylistycznie.

**Wniosek:** Transfer EN→PL jest **uzasadniony heurystycznie**, ale **niewystarczająco udokumentowany**. Każde twierdzenie w raporcie, które przenosi wynik z EN na PL, jest oznaczone jako `DOWNGRADED` w `CLAIM-AUDIT.md`.

---

## 5. Taksonomia wzorców i mitów

Poniższa taksonomia jest ustrukturyzowana według wymaganego formatu z PROMPT. Każdy wzorzec ma: `ID · nazwa · poziom · opis · źródła i jakość · polski/transfer · gatunki · sygnały towarzyszące · kontrprzykłady · fałszywe alarmy · możliwe funkcje retoryczne · strategie poprawy · test sensu/głosu · kiedy nie poprawiać · pewność`.

> **Uwaga metodologiczna:** Przykłady w tej sekcji są **ilustracyjne** (stworzone przeze mnie), nie korpusowe. Nie należy ich traktować jako materiału badawczego. Są też mieszane — wzorce o wysokim poparciu (H) i mity (L). Format katalogowy celowo wprowadza "kiedy nie poprawiać" i "fałszywe alarmy" — to jest klucz do nieautomatycznej, kontekstowej redakcji.

### Wzorzec W1 — Niska dywersyfikacja leksykalna (TTR, hapax, lexical density)

- **Poziom:** leksykalny
- **Opis:** LLM-y preferują wysokoczęstotliwe tokeny, mają niższe TTR i mniej hapax legomena. Najbardziej odporny cross-lingwalnie sygnał.
- **Źródła:** A1 Reinhart 2025 PNAS, A3 Muñoz-Ortiz 2025 ACL, A6 284 features 2026, A8 Nature HSSCommun 2025, A16 6 dimensions 2025. **Wysoka pewność (H)**.
- **Polski/transfer:** Spodziewane, ale **nie zmierzone bezpośrednio** w PL. Spójne z ogólnym wzorcem.
- **Gatunki:** mocniejsze w beletrystyce, publicystyce; słabsze w tekstach ściśle technicznych (terminologia wymusza).
- **Sygnały towarzyszące:** powtarzalne łączniki (ponadto, dodatkowo, tym samym), unikanie synonimów.
- **Kontrprzykłady:** ludzki tekst techniczny (mała dywersyfikacja naturalna); kalka z innego języka (lexical poverty wynika z transferu).
- **Fałszywe alarmy:** język urzędniczy (C5 Sejm), polszczyzna urzędowa (C2), specyficznie branżowy żargon.
- **Funkcja retoryczna:** konsystencja terminologiczna, niski szum — **nie zawsze błąd**.
- **Strategie poprawy:** (a) zaproponować 2-3 synonimy dla kluczowych terminów; (b) użyć narzędzia typu `Lexpert` lub ręcznej listy synonimów; (c) dla gatunków kreatywnych — odtworzyć obserwacje autora.
- **Test sensu/głosu:** Czy po zmianie synonimu tekst mówi to samo? Czy to słowo pasuje do idiolektu postaci/ autora?
- **Kiedy nie poprawiać:** spójność terminologiczna w instrukcjach, dokumentacji technicznej, nazwach własnych.
- **Pewnność:** **Wysoka** (H) dla istnienia zjawiska; **Umiarkowana** dla rekomendacji w PL (transfer).

### Wzorzec W2 — Nominalizacja i gerundia (rzeczowniki odczasownikowe, *dokonanie zakupów*)

- **Poziom:** składniowo-leksykalny
- **Opis:** LLM-y (szczególnie w trybie akademickim i raportowym) używają więcej nominalizacji (M, N, gerundia) niż teksty ludzkie w porównywalnych rejestrach. **Ale**: nominalizacja to cecha akademicka od dziesięcioleci (C14 UEA: +69.5% 1965-2015) [SK-1].
- **Źródła:** A1 Reinhart 2025, A11 IJAL metadiscourse, A12 Springer 2026, C9/C10/C11 PL, C12/C13/C14 EN.
- **Polski/transfer:** **Wysoka pewność istnienia w PL** (C9, C10, C11); ale wzmocnienie przez LLM nie jest zmierzone.
- **Gatunki:** ryzyko: raport, ekspertyza, esej akademicki, marketing; niskie ryzyko: SMS, dialog, narracja pierwszoosobowa.
- **Sygnały towarzyszące:** strona bierna, brak osobowych form czasownika, "dokonano", "przeprowadzono".
- **Kontrprzykłady:** tekst prawniczy (C9: nominalizacja = precyzja); streszczenie techniczne; branżowe normy.
- **Fałszywe alarmy:** styl polskiego prawnika, polskiego naukowca-przyrodnika, styl korporacyjny.
- **Funkcja retoryczna:** **agresywna obiektywizacja**, ukrycie sprawcy, informacyjne upakowanie.
- **Strategie poprawy:** (a) "Test 3. linii" — zostawić tylko zdania, które można przepisać w formie osobowej; (b) zamienić *dokonano analizy* → *przeanalizowaliśmy*; (c) w reportażu — odzyskać sprawcę.
- **Test sensu/głosu:** Czy po odnominalizowaniu tekst mówi to samo? Czy pasuje do gatunku?
- **Kiedy nie poprawiać:** procedury badawcze (strona bierna jest konwencją), opis stanu prawnego, opis faktów.
- **Pewnność:** **Wysoka** (H) że to cecha; **Umiarkowana** że to "AI-izm" (bo to też cecha akademicka).

### Wzorzec W3 — Strona bierna nadużywana w miejscach, gdzie czynna jest naturalna

- **Poziom:** składniowy
- **Opis:** "Dokonano ustalenia" zamiast "Ustalono"; "Zostało podjęte" zamiast "Podjęto". LLM-y preferują bierną w opisach proceduralnych i raportowych.
- **Źródła:** C5 Sejm, C8 medyczne PL/EN (~30% czasowników w obu językach w artykułach medycznych), C9/C11, A1 Reinhart 2025, A12 Springer 2026.
- **Polski/transfer:** **Bardzo dobrze udokumentowane w PL** (C5, C8, C9, C11). RJP nie reguluje bezpośrednio, ale zalecenia prostego języka (C2) są zbieżne.
- **Gatunki:** raport, ekspertyza, esej akademicki, artykuł informacyjny. Wysokie ryzyko.
- **Sygnały towarzyszące:** nominalizacja (W2), brak osobowych form czasownika, "zostało dokonane".
- **Kontrprzykłady:** procedura badawcza (bierna konwencjonalnie), opis prawny, opis stanu faktycznego.
- **Fałszywe alarmy:** raport laboratoryjny, krótki opis zdarzeń, w których sprawca jest nieistotny.
- **Funkcja retoryczna:** ukrycie odpowiedzialności; "wampir energetyczny" (Wrycza-Bekier za Marecką).
- **Strategie poprawy:** (a) "Test sprawcy" — kto to zrobił? Dodaj "przez [X]" lub zmień na czynną; (b) ogranicz bierną do 10-15% w narracji (zostaw w procedurach).
- **Test sensu/głosu:** Czy czytelnik wie, kto działa? Czy ma to znaczenie w tym kontekście?
- **Kiedy nie poprawiać:** procedury, opis stanu faktycznego bez znaczącego sprawcy.
- **Pewnność:** **Wysoka** (H).

### Wzorzec W4 — Hedging ekscesywny (nadmierne *może, prawdopodobnie, wydaje się, że*)

- **Poziom:** leksykalno-stylistyczny
- **Opis:** LLM-y w trybie akademickim nadużywają hedges; w tekstach niefaktycznych sztucznie obniżają pewność.
- **Źródła:** A10 OJL (ale NIEISTOTNE statystycznie dla małego N), A11 IJAL, A14 ScienceDirect, A8 Nature HSSCommun.
- **Polski/transfer:** **Umiarkowana**; spójne z konwencją akademicką PL.
- **Gatunki:** esej akademicki, raport ekspercki, publicystyka. Wysokie ryzyko.
- **Sygnały towarzyszące:** frame markers, code gloss, "należy zaznaczyć", "warto podkreślić".
- **Kontrprzykłady:** esej naukowy świadomie stosujący hedging (Hyland); tekst medyczny, gdzie hedging chroni przed odpowiedzialnością.
- **Fałszywe alarmy:** tekst prawniczy (hedging obligatoryjny), raport medyczny, esej naukowy.
- **Funkcja retoryczna:** ochrona autora przed odpowiedzialnością, konwencja dyscyplinarna.
- **Strategie poprawy:** (a) "Test przekonań" — czy autor naprawdę nie wie? Jeśli wie, usuń hedge; (b) zamienić *może to oznaczać, że* → *oznacza, że*; (c) zastrzec stwierdzenia, które naprawdę są spekulatywne.
- **Test sensu/głosu:** Czy autor byłby gotów podpisać się pod stwierdzeniem bez hedge?
- **Kiedy nie poprawiać:** spekulacja naukowa, ostrzeżenia prawne/medyczne, raport z niepewnymi danymi.
- **Pewnność:** **Umiarkowana** (M) — istnieje w EN, nie wprost w PL.

### Wzorzec W5 — Trójpodziały, paralelizm, listy numerowane i wypunktowane

- **Poziom:** retoryczny
- **Opis:** Popularny motyw blogowy: "Po pierwsze X, po drugie Y, po trzecie Z". LLM-y faworyzują struktury z trzema elementami (triady).
- **Źródła:** blogowe tezy, brak bezpośredniego peer-reviewed dowodu. W EN: Reinhart 2025 [A1] i Nature HSSCommun 2025 [A8] wskazują na symetrię strukturalną.
- **Polski/transfer:** **Niska pewność**. Wzorzec obecny w polszczyźnie publicystycznej niezależnie od AI.
- **Gatunki:** esej, marketing, prezentacja, instrukcja. Umiarkowane ryzyko.
- **Sygnały towarzyszące:** nagłówki równoległe, myślniki w wyliczeniach, powtórzenia strukturalne.
- **Kontrprzykłady:** retoryka klasyczna, prawnicza, biblijna — trójpodział jest starą figurą.
- **Fałszywe alarmy:** teksty prawnicze, liturgiczne, retoryka klasyczna.
- **Funkcja retoryczna:** pamięciowość, rytm, perswazyjność.
- **Strategie poprawy:** (a) rozbić na 2 lub 4; (b) zróżnicować struktury (nie wszystko wyliczenie); (c) dodać asynchroniczny element (kontraargument, dygresja).
- **Test sensu/głosu:** Czy po zmianie tekst traci ważny rytm? Czy to idiomatyczne dla autora/gatunku?
- **Kiedy nie poprawiać:** retoryka klasyczna, marketing (gdzie trójpodział = perswazja), humor celowy.
- **Pewnność:** **Niska (L)** — mit blogowy o cechach LLM; wzorzec istnieje, ale nie jest specyficznie LLM.

### Wzorzec W6 — Konstrukcja "to nie X, to Y" / "It's not just X, it's Y"

- **Poziom:** retoryczny
- **Opis:** Popularne w retoryce anglojęzycznej; popularne twierdzenie, że LLM nadużywa.
- **Źródła:** blogi, brak peer-reviewed evidence. W Reinhart 2025 [A1] "noun-heavy, informationally dense" jest spójne z tym wzorcem.
- **Polski/transfer:** **Niska pewność**. Wzorzec obecny w publicystyce i marketingu niezależnie od AI.
- **Gatunki:** publicystyka, marketing, esej, krytyka.
- **Sygnały towarzyszące:** em-dash, struktura korygująca.
- **Kontrprzykłady:** retoryka korekty (w dobrej publicystyce to standard).
- **Fałszywe alarmy:** krytyka literacka, eseistyka.
- **Funkcja retoryczna:** korekta, perswazja, redefinicja.
- **Strategie poprawy:** (a) zostawić jeśli naprawdę redefiniuje pojęcie; (b) zastąpić pełnym zdaniem; (c) nie redukować liczby.
- **Test sensu/głosu:** Czy konstrukcja "to nie X, to Y" jest tu naprawdę retorycznie konieczna?
- **Kiedy nie poprawiać:** esej krytyczny, publicystyka retoryczna, marketing produktu.
- **Pewnność:** **Niska (L)** — mit blogowy.

### Wzorzec W7 — Metadyskurs ekscesywny (frame markers, "należy zaznaczyć, że…")

- **Poziom:** dyskursywny
- **Opis:** LLM-y (szczególnie ChatGPT) intensywnie używają frame markers ("In this section, we discuss…", "To summarize…", "It is worth noting…").
- **Źródła:** A11 IJAL (więcej frame markers w ChatGPT), A14 ScienceDirect (hedging/boosting), A7 PLCC.
- **Polski/transfer:** **Umiarkowana**. W polskim: "warto zaznaczyć", "należy podkreślić", "w niniejszym artykule".
- **Gatunki:** esej akademicki, raport, esej popularnonaukowy.
- **Sygnały towarzyszące:** hedging (W4), code gloss, nagłówki równoległe.
- **Kontrprzykłady:** esej naukowy, gdzie metadyskurs jest konwencją.
- **Fałszywe alarmy:** polska eseistyka akademicka.
- **Funkcja retoryczna:** nawigacja czytelnika, organizacja dyskursu.
- **Strategie poprawy:** (a) "Czy usuwam informację?" Jeśli zdanie po usunięciu frame markera nadal ma treść — usuń; (b) zamienić na streszczenie lub nagłówek.
- **Test sensu/głosu:** Czy metadyskurs pełni tu funkcję nawigacyjną, czy jest pusty?
- **Kiedy nie poprawiać:** esej naukowy (konwencja), instrukcja (nawigacja).
- **Pewnść:** **Umiarkowana** (M).

### Wzorzec W8 — Symetria strukturalna i "over-regularity" (burstiness)

- **Poziom:** dyskursywny
- **Opis:** LLM-y mają niski burstiness — zdania o zbliżonej długości, regularne przejścia, równomierne tempo.
- **Źródła:** A6 284 features, A7 PLCC, A8 Nature HSSCommun, B5 (eyesift aggregation) Burstiness = most reliable mechanical signal.
- **Polski/transfer:** **Umiarkowana** (burstiness jest cechą matematyczną, niezależną od języka).
- **Gatunki:** esej, publicystyka, reportaż. Wysokie ryzyko.
- **Sygnały towarzyszące:** brak zmian długości zdań, regularne przejścia.
- **Kontrprzykłady:** tekst naukowy (regularność konwencjonalna), tekst prawniczy, instrukcja.
- **Fałszywe alarmy:** polska proza naukowa, urzędowa.
- **Funkcja retoryczna:** rytm czytelniczy, łatwość recepcji.
- **Strategie poprawy:** (a) "Czytanie na głos" — zatrzymać się na zdaniach, które się "potykają"; (b) połączyć krótkie zdania; (c) podzielić długie; (d) wprowadzić 1-2 bardzo krótkie zdania (1-2 słowa).
- **Test sensu/głosu:** Czy rytm odpowiada gatunkowi (np. publicystyka może być regularna)?
- **Kiedy nie poprawiać:** instrukcja, tekst prawniczy, referat naukowy.
- **Pewnność:** **Wysoka** (H) że burstiness jest niska w LLM; **Umiarkowana** dla polskiego.

### Wzorzec W9 — Em-dash nadużywany (myślnik em —)

- **Poziom:** interpunkcyjny
- **Opis:** Popularny motyw blogowy: "LLM-y kochają em-dash". Jedyne bezpośrednie dane: D8 Erasmus thesis 2024 — 11/85 uczestników wskazało em-dash jako "AI-coded" w EN romantic fiction.
- **Źródła:** D8 (thesis), blogi (popularne, brak danych).
- **Polski/transfer:** **Niska pewność**. Polski używa myślnika w inny sposób (myślnik otoczony spacjami — właściwie półpauzy; angielski em-dash bez spacji).
- **Gatunki:** publicystyka, esej, marketing. Umiarkowane ryzyko.
- **Sygnały towarzyszące:** rozbudowane wtrącenia, "to znaczy".
- **Kontrprzykłady:** polska eseistyka (Szymborska, Herling-Grudziński, Tokarczuk) — em-dash i półpauzy są naturalne.
- **Fałszywe alarmy:** styl myślowy, esej filozoficzny.
- **Funkcja retoryczna:** wtrącenie, pauza retoryczna, redefinicja.
- **Strategie poprawy:** (a) sprawdzić proporcję — jeśli >1 em-dash na 200 słów, warto zróżnicować; (b) nie eliminować wszystkich — to idiomatyczny środek stylistyczny.
- **Test sensu/głosu:** Czy autor eseju / postać literacka by to napisał/-a? Czy to idiomatyczne po polsku?
- **Kiedy nie poprawiać:** esej, publicystyka, styl.
- **Pewnność:** **Niska (L)** dla "to AI-izm" w PL; **umiarkowana** dla sygnału statystycznego w EN.

### Wzorzec W10 — "Delve", "tapestry", "underscores" — blogowe listy "trigger words"

- **Poziom:** leksykalny
- **Opis:** Popularne listy słów "których AI używa": delve, tapestry, underscores, leverage, robust, etc.
- **Źródła:** blogi, brak peer-reviewed evidence. W [A1] Reinhart 2025 są wzmianki o "noun-heavy, informationally dense".
- **Polski/transfer:** **Nieprzenoszalne** (to specyficznie angielskie słowa). Polskim odpowiednikiem byłyby: "niuans", "głębia", "złożoność", "wielowymiarowy", "wieloaspektowy".
- **Gatunki:** esej, raport.
- **Kontrprzykłady:** każde z tych słów jest idiomatyczne po angielsku (i odpowiedniki po polsku), jeśli są rzadkie, to dlatego, że autor wie, co chce powiedzieć.
- **Fałszywe alarmy:** krytyka, esej filozoficzny, esej akademicki.
- **Funkcja retoryczna:** precyzja, niuans.
- **Strategie poprawy:** **Nie automatycznie**. Sprawdzić, czy słowo jest celowe (tak/nie). Czasem usunąć, jeśli jest "wypełniaczem" (np. "It's worth delving into this topic").
- **Test sensu/głosu:** Czy to słowo niesie konkretne znaczenie, czy jest ozdobnikiem?
- **Kiedy nie poprawiać:** zawsze, gdy jest precyzyjne.
- **Pewnść:** **Bardzo niska (L)** jako automatyczny wzorzec; **Nieautomatyzowalne** w PL.

### Wzorzec W11 — "Linguistic joy" / "It's important to note" / "I hope this helps"

- **Poziom:** pragmatyczny
- **Opis:** Frazy zamykające ("I hope this helps", "Let me know if you need anything") typowe dla chatbota, nie dla artykułu.
- **Źródła:** blogi, obserwacje z użycia; brak peer-reviewed evidence. Wzorzec funkcjonalny (relic interfejsu konwersacyjnego w tekście).
- **Polski/transfer:** **Wysoka** — "Mam nadzieję, że to pomoże", "Daj znać, jeśli potrzebujesz czegoś więcej" to też chatbotowe relicty.
- **Gatunki:** esej, raport, artykuł. Umiarkowane ryzyko.
- **Kontrprzykłady:** w mailu, w help-desk reply, w treści promptowanej — naturalne.
- **Fałszywe alarmy:** autoresponder, e-mail obsługi klienta.
- **Funkcja retoryczna:** relic interface'u.
- **Strategie poprawy:** (a) usunąć; (b) zastąpić podsumowaniem, jeśli gatunek tego wymaga.
- **Test sensu/głosu:** Czy to zdanie pasuje do gatunku (np. e-mail tak, esej nie)?
- **Kiedy nie poprawiać:** e-mail, autoresponder, promptowany output.
- **Pewnść:** **Wysoka** (H) — funkcjonalny, nie stylistyczny.

### Wzorzec W12 — Powtórzenia strukturalne (synonimy bez sensu, "in other words…")

- **Poziom:** retoryczny
- **Opis:** LLM-y powtarzają tę samą myśl innymi słowami (dodatkowe wyjaśnienie po każdym punkcie), czasem wielokrotnie.
- **Źródła:** A11 IJAL (frame markers), A7 PLCC, ogólne obserwacje.
- **Polski/transfer:** **Umiarkowana**.
- **Gatunki:** esej, raport, artykuł informacyjny.
- **Kontrprzykłady:** esej, który celowo podsumowuje (technika retoryczna).
- **Fałszywe alarmy:** esej naukowy z konkluzjami.
- **Funkcja retoryczna:** dostępność, jasność.
- **Strategie poprawy:** (a) sprawdzić, czy drugie sformułowanie niesie nową informację; (b) usunąć, jeśli jest redundancją.
- **Test sensu/głosu:** Czy powtórzenie jest celowe (podsumowanie, emfaza), czy jest "wypełniaczem"?
- **Kiedy nie poprawiać:** esej z celowym powtórzeniem.
- **Pewnść:** **Umiarkowana** (M).

### Mity (wzorce, które NIE powinny być traktowane jako "AI-izmy")

- **MIT M1:** "Em-dash = AI". To idiomatyczny środek stylistyczny w EN, a w PL ma inne użycie. Reinhart 2025 [A1] i Nature HSSCommun [A8] nie wskazują em-dash jako specyficznego sygnału.
- **MIT M2:** "Trójpodział = AI". To stara figura retoryczna; w Reinhart 2025 [A1] symetria jest wymieniona, ale **trójpodział** nie.
- **MIT M3:** "It is worth noting = AI". Może być nadużywany (W4), ale sam w sobie to standardowa formuła angielskiej eseistyki. Odpowiednik PL: "Warto zauważyć".
- **MIT M4:** "Delve = AI". Słowo istnieje w EN; ma idiomatyczne zastosowania. W PL nie ma odpowiednika, więc mit nieprzenoszalny.
- **MIT M5:** "Konstrukcja 'to nie X, to Y' = AI". To retoryczna korekta, standard od Homera. Nie specyficznie AI.
- **MIT M6:** "Pisownia 'mowa zależna' bez cudzysłowu = AI". To kwestia stylu, nie AI.
- **MIT M7:** "Każdy długi tekst bez dialogu = AI". To cecha gatunku (esej, monografia, raport), nie AI.

---

## 6. Operacje redakcyjne oraz kontrprzykłady

Dla każdej operacji podaję: (a) dowody, (b) granice, (c) strategie, (d) kontrprzykłady.

### 6.1 Skracanie i rozwijanie

- **Skracanie:** Sentence compression (Clarke 2011 [F5], D16-1033 [F6], UPenn [I1]) — substitution+rephrasing > deletion-only; manual evaluation > F1 automatyczne.
- **Rozwijanie:** Strategie typu "add concrete example", "anticipate reader's question" — ugruntowane w craft (np. "Strunk & White" 1959/2018).
- **Granice:** Skracanie nie może zniekształcić intencji. Rozwijanie nie może dodawać faktów.
- **Kontrprzykłady:** Skracanie CV (każdy fakt jest istotny) — nie skracać; rozwijanie depeszy — nie rozwijać.

### 6.2 Zmiana szyku i łączenie/dzielenie zdań

- **Łączenie:** Zmniejszenie nominalizacji, zwiększenie czytelności. Spójne z Clarke 2011 [F5].
- **Dzielenie:** Krótsze zdania = lepsza zrozumiałość. Spójne z C2 prosty język (15-20 słów).
- **Granice:** Nie łamać idiomu ("wpadł jak śliwka w kompot" — nie dzielić).
- **Kontrprzykłady:** Poezja (rytm i szyk są istotne), formuły prawne.

### 6.3 Ograniczanie nominalizacji i strony biernej

- **Dowody:** C5 Sejm, C8 medyczne, C9 WSB, C10 Jędrzejko, C11 Poradnia UŁ — solidne w PL.
- **Granice:** Procedury badawcze (bierna konwencjonalna), opis prawny, opis faktów (gdy sprawca nieistotny).
- **Kontrprzykłady:** "Badanie przeprowadzono w marcu 2024" (bierna jest tu naturalna, sprawca nieistotny).
- **Strategia:** "Test sprawcy" (C7) — czy muszę znać sprawcę? Jeśli tak, czynna.

### 6.4 Konkretyzowanie bez dopisywania faktów

- **Dowody:** Common craft ("show, don't tell"); konkretne w psychologii czytania (A20 — L1/L2 readers, F8 reading time).
- **Granice:** Nie wymyślać liczb, dat, nazw. Konkretyzacja istniejącej ogólnikowości.
- **Kontrprzykłady:** "Było wiele osób" (konkretyzacja = "było 47 osób" — **nie wolno**).

### 6.5 Usuwanie metadyskursu i powtórzeń

- **Dowody:** A11 IJAL (frame markers), W7, W12.
- **Granice:** Esej naukowy (metadyskurs konwencjonalny), instrukcja (nawigacja).
- **Kontrprzykłady:** "In this section, we discuss X" w recenzowanym artykule — zostawić.

### 6.6 Różnicowanie rytmu bez sztucznej losowości

- **Dowody:** W8 burstiness, A1 Reinhart.
- **Granice:** Instrukcja, referat.
- **Kontrprzykłady:** Pismo prawne — regularność to wymóg.
- **Strategia:** "Czytanie na głos" — miejsca zacięć.

### 6.7 Zamiana kalk i formuł przy zachowaniu intencji

- **Dowody:** [H8] Biber register steering.
- **Granice:** NIE zamieniać kalki, jeśli jest idiomatyczna (np. "w świetle powyższego" — to nie kalka).
- **Kontrprzykłady:** "W kontekście" — nie zawsze kalka, czasem idiomatyczne.

### 6.8 Ochrona idiolektu, regionalizmu, stylizacji i celowej repetycji

- **Dowody:** Brak bezpośredniego LLM-badania w PL; ale ugruntowane w tradycji redakcyjnej ("Strunk & White").
- **Granice:** Autora nie należy wygładzać do neutralnego "bohatera redakcyjnego".
- **Kontrprzykłady:** Bohater literacki z gwary nie powinien mówić jak bohater z innej powieści.
- **Strategia:** Zasada **"styl to znaczenie"** — nie poprawiać tego, co jest celowe.

### 6.9 Decydowanie, że tekst należy pozostawić bez zmian

- **Tryb "zostaw bez zmian"** jest **krytyczną** funkcją skilla. Wymaga świadomości, kiedy:
  - tekst jest celowo schematyczny (gatunek);
  - autor wie, co robi (styl);
  - poprawa zniszczyłaby głos;
  - redakcja nie ma wystarczającego kontekstu (np. dialog w powieści);
  - zmiana to zniekształcenie (kalka była zamierzona).
- **Granice:** Tryb "zostaw" wymaga uzasadnienia — nie jest domyślny.

---

## 7. Macierz gatunków i rejestrów

Dla każdego gatunku: (a) cel, (b) odbiorca, (c) typowa długość, (d) rytm, (e) dopuszczalna powtarzalność, (f) ton, (g) ryzyko AI-schematyczności, (h) niedopuszczalne uproszczenia.

| Gatunek | Cel | Odbiorca | Długość | Rytm | Powtarzalność | Ton | Ryzyko AI | Niedopuszczalne uproszczenia |
|---|---|---|---|---|---|---|---|---|
| **Etykieta przycisku** | Akcja | Użytkownik | 1-4 słowa | Statyczny | Niska | Neutralny, zwięzły | **Niskie**, ale "Submit" / "OK" = AI-residue (W11) | Generyczny "Submit" / "OK"; brak sprawcy w destructive actions |
| **Mikrocopy** | Nawigacja / instrukcja | Użytkownik | 1-2 zdania | Statyczny | Niska | Pomocny | **Niskie** | Puste "Tutaj możesz..."; brak CTA |
| **Komunikat błędu** | Diagnoza + recovery | Użytownik | 1-3 zdania | Statyczny | Niska | Spokojny, wspierający | **Umiarkowane** (formuły) | Obwinianie ("Invalid input"); brak rozwiązania; humor nieadekwatny |
| **Ostrzeżenie** | Ochrona + informacja | Użytkownik | 1-2 zdania | Statyczny | Niska | Poważny | **Niskie** | Bagatelizowanie ryzyka; brak akcji |
| **Onboarding** | Wdrożenie | Nowy użytkownik | 3-7 etapów | Prosty | Umiarkowana (powtórzenia nawig.) | Przyjazny | **Umiarkowane** | Ściany tekstu; brak wizualizacji; paternalizm |
| **Pomoc** | Rozwiązanie problemu | Użytkownik z problemem | 1-2 akapity | Statyczny | Niska | Konkretny, ciepły | **Niskie** | Generyczne "Spróbuj ponownie później" |
| **Strona produktu** | Konwersja | Kupujący | 300-800 słów | Rytmiczny | Umiarkowana | Perswazyjny | **Wysokie** (trójpodziały, "delve" w PL, "tapestry") | Fałszywe obietnice, jargon, brak konkretu |
| **Marketing** | Akcja | Odbiorca | Zmienny | Dynamiczny | Wysoka (formuły) | Energetyczny | **Bardzo wysokie** | Clickbait, brak wartości, obietnice bez pokrycia |
| **Artykuł informacyjny** | Informacja | Czytelnik | 600-2500 słów | Rytmiczny | Niska | Neutralny | **Wysokie** (W2, W4, W5, W7, W8) | Stronniczość, brak źródeł, clickbait |
| **Poradnik** | Rozwiązanie | Czytelnik z problemem | 1000-3000 słów | Rytmiczny | Niska | Pomocny | **Wysokie** (W2, W4) | Niepełne instrukcje, brak ostrzeżeń |
| **Raport zawodowy** | Decyzja | Klient / przełożony | 2000-10000 słów | Rytmiczny | Umiarkowana (terminy) | Formalny | **Bardzo wysokie** (W2, W3, W4, W7) | Dane bez kontekstu, wnioski bez danych, stronniczość |
| **Opracowanie eksperckie** | Wiedza specjalistyczna | Odbiorca fachowy | 5000-30000 słów | Rytmiczny | Umiarkowana (terminy) | Formalny, precyzyjny | **Wysokie** (W2, W3, W4) | Uproszczenie, błędy faktograficzne |
| **Tekst naukowy** | Wkład w naukę | Recenzent / badacze | 5000-30000 słów | Rytmiczny | Umiarkowana (formuły) | Formalny, bezosobowy | **Średnie** (bo konwencja = AI-friendly) | Brak danych, słabe wnioski, plagiat |
| **Tekst popularnonaukowy** | Edukacja | Czytelnik ogólny | 1500-5000 słów | Rytmiczny | Niska | Ciepły, jasny | **Wysokie** (W4, W5) | Żargon, brak analogii, paternalizm |
| **E-mail** | Akcja / informacja | Odbiorca | 50-300 słów | Rytmiczny | Niska | Dostosowany | **Niskie** (bo krótki) | "Hope this helps" bez kontekstu, "Per my last email" |
| **Komunikacja organizacyjna** | Informacja | Zespół / firma | 100-1000 słów | Rytmiczny | Umiarkowana (procedury) | Formalny | **Średnie** | Brak konkretów, nadmiar ogólników |
| **Dialog literacki** | Postać | Czytelnik | Zmienny | Zróżnicowany (per postać) | Niska (per postać); wysoka między postaciami | Per postać | **Bardzo wysokie** (gdy każda postać mówi tak samo) | Ujednolicenie głosu postaci |
| **Narracja literacka** | Opowieść | Czytelnik | Zmienny | Zmienny | Niska | Per narrator | **Wysokie** (gdy narrator = "AI-default") | Narrator bezosobowy; identyczne tempo we wszystkich scenach |
| **Esej** | Refleksja | Czytelnik | 2000-10000 słów | Rytmiczny | Niska | Osobisty | **Wysokie** (W2, W4, W5) | Brak głosu, "essay-speak" |
| **Proza literacka** | Opowieść | Czytelnik | Zmienny | Zmienny | Niska | Per styl | **Wysokie** (gdy styl = "AI-default") | Ujednolicenie stylu; "płaski" opis |
| **Rozdział** | Część książki | Czytelnik | 3000-15000 słów | Zmienny | Niska | Per styl | **Wysokie** (W8, plus ryzyka prozy) | Utrata głosu; niespójność z resztą |
| **Cała książka** | Opowieść / wiedza | Czytelnik | 50000-150000 słów | Zmienny | Niska | Per styl | **Bardzo wysokie** (W8 + utrata głosu + niespójność postaci/wątków) | "Wygładzenie" wszystkich postaci do jednego głosu; utrata POV; brak rytmu |

---

## 8. UI, tekst widoczny dla użytkownika i elementy chronione

### 8.1 Bezpieczna identyfikacja treści widocznej

UI zawiera **elementy chronione** (nie wolno ich modyfikować) i **elementy redagowalne** (wolno). Skill musi umieć je rozróżniać:

- **Elementy chronione (nie modyfikować):**
  - Zmienne, placeholdery (`{{user.name}}`, `%s`, `{{count}}`).
  - Tokeny i18n (`$t('key')`, klucze tłumaczeń).
  - HTML / Markdown / znaczniki formatowania (w tym `<a>`, `<button>`, `<span>`).
  - Skrypty, event handlery, `onclick`.
  - Dostępność: `aria-label`, `role`, identyfikatory testowe.
  - Nazwy własne, marki, identyfikatory.
  - Kody błędów (do diagnozy: ERR_TIMEOUT, 502).
  - Daty, kwoty, numery (chyba że wprost podane do zmiany).

- **Elementy redagowalne:**
  - Tekst etykiety, opis, instrukcja.
  - Komunikat błędu (poza kodem).
  - Tekst przycisku (z zachowaniem akcji).
  - Pusta wartość `placeholder=""` (z ostrożnością).
  - Tekst tooltip / help.

**Strategia:** Przed modyfikacją wyodrębnić warstwę tekstową od kodu / placeholderów / znaczników; modyfikować tylko warstwę tekstową; zwalidować wynik.

### 8.2 Heurystyki NN/g (potwierdzone) [E1-E4]

- Heuristic #5 (error prevention): unikać przedwczesnych komunikatów błędów.
- Heuristic #9 (recognize, diagnose, recover): plain language, precyzyjny opis, rozwiązanie, brak obwiniania.
- Flesch-Kincaid 7-8th grade or lower dla tekstu błędu.
- Rezerwa stylu error (czerwony, ikona) tylko dla errorów krytycznych.

### 8.3 Inkluzywność (autorytety APA, AP, CMOS 18) [E17-E22]

- Person-first lub identity-first (osoby z niepełnosprawnością); preferencja osoby.
- Singular "they" (od 2019 w AP; rozszerzone w CMOS 18).
- "Black" / "White" z wielkiej litery (APA 2019+).
- Unikać "the poor", "the homeless" → "people experiencing poverty / homelessness".
- Polski: zgodnie z RJP i Poradnią Językową UŁ; tam, gdzie nie ma wytycznej, zapytać osobę.

---

## 9. Workflow książki i długiego dokumentu

> **Najważniejsza zasada:** Książka to **system globalny**, nie zbiór niezależnych akapitów. Redakcja rozdziału, która nie wie, że to część systemu, niszczy głos.

### 9.1 Etapy kalibracji (przed pisaniem / redagowaniem)

1. **Próbka kalibracyjna** — 3-5 rozdziałów (lub 10-15% tekstu) jako punkt odniesienia dla głosu, rytmu, słownictwa, POV.
2. **Karta głosu** — jedna strona: ton, tempo, humor, idiomatyczne frazy, dystans, erudycja; cytaty kluczowe.
3. **Glosariusz** — postacie, miejsca, terminy techniczne, terminy zakazane przez autora.
4. **Terminy zakazane** — lista, której nie wolno używać (autor, redaktor, wrażliwość kulturowa).
5. **Persony i relacje** — kto, kogo, jak; dla powieści — schemat relacji.
6. **Chronologia** — linia czasu fabuły / argumentacji.
7. **Punkt widzenia (POV)** — kto opowiada; konsekwencje; polska terminologia (D5 PFL: punkt widzenia vs fokalizacja vs perspektywa).
8. **Rejestr wątków** — co, kiedy, w jakim rozdziale.

### 9.2 Mechanizm pracy z dokumentem > kontekst LLM

- **Chunking** z zakładką kontekstową (G1 BooookScore, G2 CreAgentive, G3 NCP, G4 DOME, G6 OpenAI):
  - **Hierarchiczne scalanie** (map-reduce) — chunk → summary → merge → merge → ...
  - **Inkrementalna aktualizacja** — running summary + nowy chunk → update.
  - **Map-reduce z overlapem ~10%** (Galileo) — standard dla RAG-owych pipeline'ów.
  - **Krytyczne:** "Context window size is a ceiling, not a design target" (Galileo).
- **Context anchor** (G8): "Style and Facts Sheet" — definiuje postacie, styl, poprzednie konkluzje. Podawany do LLM przy każdym chunku.
- **Entity tracking** (G7) — rejestr postaci, ich atrybutów; wstrzykiwany w każdy prompt sekcji.
- **Self-correction loops** (G8) — po wygenerowaniu sekcji, LLM ją krytykuje i przepisuje.

### 9.3 Dziennik zmian (change log)

Każda interwencja zapisuje:
- ID rozdziału / fragmentu.
- Typ operacji (skrócenie, zmiana POV, zamiana kalki, itd.).
- Przed / po.
- Uzasadnienie (kto, dlaczego).
- Decyzja: **zmieniono / zostawiono / pytanie do autora**.

### 9.4 Kontrola międzyrozdziałowa

- Spójność POV: czy rozdział 7 nie zmienia POV bez sygnału?
- Spójność głosu: czy styl rozdziału 7 nie odbiega od karty głosu?
- Spójność faktów: czy imię postaci nie zmienia się między rozdziałami?
- Spójność wątków: czy wątek z rozdziału 3 zostaje domknięty?
- Spójność chronologii: czy "wczoraj" w rozdziale 9 zgadza się z chronologią?

### 9.5 Finałowy audit (przed publikacją)

- **Mierniki:** średnia długość zdania (burstiness), TTR (dywersyfikacja), odsetek strony biernej, odsetek nominalizacji, powtórzenia strukturalne, odsetek "to nie X, to Y" (jeśli w gatunku nienaturalne).
- **Ślepa ocena:** 2-3 czytelników (niefinal editorzy) czyta całość i ocenia głos, rytm, postacie.
- **Preferencje parami:** A vs B (przed redakcją vs po) — czy wolisz?
- **Kontrola znaczenia:** czy po redakcji tekst mówi to samo (recenzent porównuje oryginał i redakcję, weryfikuje zgodność).
- **Ochrona dobrych tekstów:** sekcje, które dostały 4.5-5/5 w ocenie redaktorskiej, są **zostawione** i służą za wzorzec.

### 9.6 Jak nie wygładzić wszystkich bohaterów do jednego głosu

- **Znacznik głosu postaci:** każda postać ma 1-2 idiomatyczne frazy, 1 gramatyczną osobliwość (np. krótkie zdania, odwrócony szyk).
- **Sprawdzanie rozmów:** czy gdy usunie się "powiedział X", czytelnik rozpozna postać? Jeśli nie — bohaterowie mówią jednym głosem.
- **Ochrona odmienności:** redagując dialog, NIE wyrównywać do jednego rejestru. Sprawdzić kartę głosu postaci.
- **Redakcja rzemieślnicza, nie algorytmiczna:** brak automatycznej "poprawy" głosu.

---

## 10. Projekt korpusu ewaluacyjnego i ślepej oceny

### 10.1 Zestawy porównawcze (per PROMPT)

Każdy zestaw zawiera 5-7 tekstów tego samego gatunku, z których:
- 1-2 to teksty **słabe i schematyczne** (z generacji LLM bez nadzoru).
- 1 to tekst **ludzki używający rzekomego "AI-izmu" celowo** (np. eseista używający trójpodziałów z wyboru).
- 1 to tekst **już bardzo dobry** (powinien zostać bez zmian).
- 1 to tekst **prawny / medyczny / techniczny** (specyficzne konwencje).
- 1 to tekst **z cytatami, liczbami, placeholderami** (zachować).
- 1 to **krótki UI** vs **fragment wielorozdziałowy** (zakres długości).
- 1 to **polski oryginał** vs **kalka z angielskiego** (transfer).

### 10.2 Mierniki

- **Likerckie (1-5):**
  - Naturalność (czytelnik zapomina, że to napisane).
  - Klarowność (czytelnik rozumie cel tekstu).
  - Adekwatność gatunkowa (tekst pasuje do konwencji).
  - Spójność głosu (czy styl jest jednorodny w danym fragmencie).
  - Zachowanie znaczenia (czy po redakcji oryginał i redakcja mówią to samo).
  - Brak nadmiernej redakcji (czy redakcja nie zniszczyła idiomatycznych cech).
- **Binarne:**
  - Czy tekst wymagał zmiany?
  - Czy po zmianie zachowano sens?
  - Czy zachowano głos (głuchy test — autor potwierdza)?
- **Preferencje parami:** A (przed) vs B (po) — niezależni redaktorzy / czytelnicy.
- **Bezpośrednie mierniki jakości:**
  - **MQM** [F1] — dla tłumaczeń, dla dowolnego tekstu (tylko wariancja dopuszczalna): Accuracy, Fluency, Terminology, Style.
  - **Reading time** [F8, A20] — psycholingwistyczny predyktor lepszy niż rating.
  - **Eye movement** [B12, A20] — dla dogłębnej ewaluacji.

### 10.3 Co **nie** jest miernikiem

- Wynik detektora AI (Binoculars, GPTZero, Originality). To sygnał probabilistyczny, nie miara jakości redakcyjnej. Łączenie obu prowadzi do "okrągłego rozumowania" — redagujemy, żeby detektor nie złapał, detektor mierzy, czy redakcja była skuteczna.

### 10.4 Kryteria wyjścia

- **PASS:** średnia ocen ≥ 4.0/5; zachowane znaczenie; zachowany głos.
- **NEEDS REVISION:** 3.0-3.9 — zwykle poprawki kosmetyczne.
- **LEAVE UNCHANGED:** oryginał ≥ 4.5 — nie poprawiać, dokumentować.

---

## 11. Detektory AI i granice obietnic

### 11.1 Konsensus (silny, recenzowany)

- **Detektory mają niestabilną skuteczność** i są **podatne na atak paraphrase**. Pisarz, który potrafi parafrazować, zniweluje Binoculars do ~30% TPR [B6].
- **Bias wobec non-native English** jest **udokumentowany** (61.3% FPR na TOEFL [B7]). Pisarz polski (lub L2 w angielskim) jest statystycznie bardziej narażony na fałszywe flagi.
- **W warunkach cross-domain** detektory tracą 60-78 pp recall [B6].
- **Reklamowane przez vendorów** accuracy (95%+) **nie jest** potwierdzona niezależnym audytem.
- **Nie ma wiarygodnego detektora dla polskiego** tekstu w warunkach rzeczywistych. PolEval 2025 SMIGIEL [B20] to najlepsza polska ewaluacja (workshop, 81.22%).

### 11.2 Granice obietnic

- **Nie obiecujemy "niewykrywalności".** Tekst redagowany pod kątem naturalności, głosu i gatunku może **nadal być flagowany** — i to nie musi oznaczać, że jest zły.
- **Wynik detektora nie jest miernikiem jakości redakcji.** Redagujemy pod kątem czytelnika, nie pod kątem algorytmu.
- **Detektor w roli "sygnału"** jest uzasadniony: jeśli tekst daje 95% AI-confidence, warto go przejrzeć — ale nie w roli werdyktu.

### 11.3 Implikacje dla skilla

- Skill **nie powinien** optymalizować pod detektor.
- Skill **powinien** dawać informację zwrotną typu "ten fragment ma cechy LLM-tekstu, ale w tym gatunku są one idiomatyczne — zostaw".
- Skill **powinien** zawierać tryb "pokaż, co byś zmienił, ale nie zmieniaj" dla redaktora, który ma kontekst autor/ gatunek.

---

## 12. Wymagania dla przyszłego skilla

### 12.1 Wymagania funkcjonalne

1. **Wielojęzyczność (PL + EN).** Polski oryginał jest wymagany, ale przykłady z EN są bogatsze. Skill musi umieć pracować w obu i sygnalizować transfery.
2. **Gatunkowo-świadomy.** Tryb wyboru gatunku z matrycy (sekcja 7).
3. **Idiolekt-świadomy.** Możliwość podania karty głosu autora (1-2 strony) i trzymanie się jej.
4. **Tryb "zostaw bez zmian".** Domyślnie, nie jako opcja.
5. **Ślepy dziennik zmian.** Każda interwencja: ID, typ, przed/po, uzasadnienie.
6. **Ochrona elementów UI / placeholderów / kodu.**
7. **Długi kontekst: chunking + context anchor.** Wbudowany workflow dla >10k tokenów.
8. **Bez automatycznej "czarnej listy" słów i znaków.** Wyraźna odmowa w dokumentacji.
9. **Mierniki: MQM + reading time + Likert.** Bez detektorów.
10. **Tryb "konsultacja"** — skill może podpowiedzieć, ale decyzja należy do redaktora.

### 12.2 Wymagania etyczne

1. **Nie obiecywać niewykrywalności.**
2. **Nie karać współautorstwa** (człowiek + AI) jako "plagiatu".
3. **Chronić styl, regionalizm, celową repetycję.**
4. **Nie wyrównywać głosu postaci literackich** do jednego wzorca.
5. **Oznaczać każdy transfer międzyjęzykowy** jako DOWNGRADED z ostrzeżeniem.
6. **Nie sugerować "ludzkich list fraz"** jako remedium na "AI-izmy" — to reprodukuje te same mity w odwrotnej formie.

### 12.3 Wymagania techniczne

1. **Chunking hierarchiczny** z overlapem ~10% (G7, G8).
2. **Context anchor** dla każdej sekcji.
3. **Narzędzia stylometryczne** dla mierzenia burstiness, TTR, odsetka biernej/nominalizacji — **jako diagnostyka, nie jako wyrocznia**.
4. **Cache dla karty głosu i glosariusza.**
5. **Walidacja wyniku** pod kątem zachowania placeholderów / kodu.

---

## 13. Luki, spory i hipotezy

### 13.1 Luki badawcze (potwierdzone)

- **Brak recenzowanego polskiego korpusu** cech LLM-tekstów w różnych gatunkach. (Wniosek: priorytet dla przyszłego badania.)
- **Brak replikacji Polish Ratio** [B21] po 2023. (Czy metryka nadal działa?)
- **Brak danych o psycholingwistyce czytania LLM-tekstów po polsku** (A20, F8 — tylko EN).
- **Brak standardu MQM dla polskiej twórczości** literackiej.
- **Brak audytu vendor-claims** dla polskich detektorów (Antyplagiat, Isgen).

### 13.2 Spory (aktywne w literaturze)

- **Czy "styl AI" to "styl naukowy"?** Część autorów (np. SK-1 vs A1) traktuje nominalizację i bierną jako cechę akademicką, nie AI. Inní wskazują na **wzmocnienie** tych cech w LLM-tekstach. **Konsensus:** oba — akademicka konwencja jest bazą, LLM ją wzmacnia.
- **Czy "trójpodział" = AI?** Brak peer-reviewed dowodu. **Hipoteza:** wzorzec istnieje, ale nie jest specyficznie LLM (stara figura retoryczna).
- **Czy em-dash = AI?** Jedyna twarda dana (D8) to 11/85 w EN romantic fiction. **Hipoteza:** w polskim brak takiego wzorca, bo em-dash (półpauza) ma inne użycie.
- **Czy detektory są przydatne do czegokolwiek?** Konsensus: jako **sygnał** (nie werdykt), do decyzji niskiego ryzyka, zawsze z nadzorem człowieka.
- **Czy AI może mieć "głos"?** Konsensus: LLMs <55% ludzkie [D9], ale postrzegana autentyczność jest porównywalna [D7, D10]. **Nierozwiązane.**

### 13.3 Hipotezy do dalszej pracy

- **H1:** Nominalizacja w polskim LLM-tekście naukowym rośnie szybciej niż w kontrolnym korpusie 1965-2020 [C14]. Testowalne przez korpus NKJP + nowe zbiory artykułów.
- **H2:** Polskie detektory perpleksyjne (PolEval 2025 [B20]) mają nierówną skuteczność w zależności od gatunku (esej vs reportaż vs dialog). Do zbadania.
- **H3:** Em-dash w polskim nie ma wzorca AI (w odróżnieniu od EN). Testowalne przez korpus + ankieta.
- **H4:** Tryb "zostaw bez zmian" poprawia odbiór redakcji długich tekstów bardziej niż tryb "agresywnej redakcji". Testowalne eksperymentem A/B.
- **H5:** Burstiness polska różni się od angielskiej proporcjonalnie do długości wyrazu. Do zbadania na korpusie NKJP.
- **H6:** Przejście z LLM-tekstu do redakcji ludzkiej **zwiększa** burstiness bardziej niż inne mierniki. Do zmierzenia.
- **H7:** Style osobiste autorów polskich są bardziej zróżnicowane niż style LLM-ów. Testowalne na korpusie autorskim.
- **H8:** Skill "zostaw bez zmian" powinien być **aktywną rekomendacją**, nie pasywną opcją. Domyślnie skill powinien pytać: "Czy na pewno chcesz to zmienić? Wydaje się celowe."

---

## 14. Bibliografia APA 7

Pełna lista w `SOURCES.bib` (BibTeX). Poniżej skrót APA 7 dla najważniejszych źródeł cytowanych w raporcie (klucze zgodne z `EVIDENCE-TABLE`):

### Cechy LLM-tekstów

- Hans, A., Schwarzschild, A., Cherepanova, V., Kazemi, H., Saha, A., Goldblum, M., Geiping, J., & Goldstein, T. (2024). Spotting LLMs with binoculars: Zero-shot detection of machine-generated text. *Proceedings of the 41st International Conference on Machine Learning (ICML)*. https://arxiv.org/abs/2401.12070
- Reinhart, A., Strobelt, H., Huber, J., & Boxall, E. (2025). Do LLMs write like humans? Variation in grammatical and rhetorical styles. *Proceedings of the National Academy of Sciences (PNAS)*. https://doi.org/10.1073/pnas.2422455122
- Muñoz-Ortiz, A. et al. (2025). Like a human? A linguistic analysis of human-written and machine-generated texts. *Proceedings of the 1st Workshop on Language Models for Digital Humanities (LM4DH) at ACL 2025*. https://aclanthology.org/2025.lm4dh-1.4/
- Terčon, L., & Dobrovoljc, K. (2025). Linguistic characteristics of AI-generated text: A survey. *arXiv preprint*. https://arxiv.org/abs/2510.05136
- Beguš, G. et al. (2025). Stylometric comparisons of human versus AI-generated creative writing. *Humanities and Social Sciences Communications (Nature)*. https://doi.org/10.1038/s41599-025-05986-3
- Liang, W., Yuksekgonul, M., Mao, Y., Wu, E., & Zou, J. (2023). GPT detectors are biased against non-native English writers. *Patterns (Cell Press)*. https://doi.org/10.1016/j.patter.2023.100776

### Detektory AI

- Bao, G. et al. (2024). Fast-DetectGPT: Efficient zero-shot detection of machine-generated text via conditional probability curvature. *ICLR 2024*. https://iclr.cc/virtual/2024/poster/19201
- Sadasivan, V. S. et al. (2024). Can AI-generated text be reliably detected? *ICLR 2024*. https://openreview.net/pdf?id=NvSwR4IvLO
- (NeurIPS 2025). Adversarial paraphrasing: A universal attack for humanizing AI-generated text. https://papers.neurips.cc/paper_files/paper/2025/file/443f314cd420ce621b6e748fd1194ed8-Paper-Conference.pdf
- (PolEval 2025 SMIGIEL). Unsupervised detection of LLM-generated Polish text using perplexity difference. *ACL Workshop*. https://aclanthology.org/2025.poleval-main.5.pdf
- (Pindrop 2026). AI text detection bias: What our ACL 2026 study found. https://www.pindrop.com/article/ai-text-detection-bias/
- Perkins, M. et al. (2025). Academic AI detectives: Accuracy and limitations of AI detection tools. *International Journal of Educational Technology in Higher Education*. (Via: https://wispaper.ai/en/research/ai-generated-content-detection-harder-methods)

### Polskie autorytety normatywne

- Rada Języka Polskiego przy Prezydium PAN. (2025). *Komunikat z dnia 7 listopada 2025 r. oraz zmiany w zasadach pisowni*. https://rjp.pan.pl/
- Ministerstwo Cyfryzacji. (2025). *Prosty język — standard komunikacji publicznej*. https://www.gov.pl/web/dostepnosc-cyfrowa/prosty-jezyk
- PSONI. (2026). *Standardy tekstu łatwego do czytania i zrozumienia (ETR)*. https://psoni.org.pl/wp-content/uploads/2026/03/Standardy-tekstu-latwego-do-czytania-i-zrozumienia-1.pdf
- Sejm Rzeczypospolitej Polskiej. (2024). *Sprawozdanie o stanie ochrony języka polskiego*. Druk 3999. https://orka.sejm.gov.pl/Druki4ka.nsf/wgdruku/3999/$file/3999.pdf

### Polskie modele

- Ociepa, K. et al. (2026). Bielik 11B v3: Multilingual large language model for European languages. *arXiv preprint*. https://arxiv.org/pdf/2601.11579
- PLLuM Consortium. (2025). PLLuM: A family of Polish large language models. *arXiv preprint*. https://arxiv.org/html/2511.03823v1

### MQM i ewaluacja

- Lommel, A., Uszkoreit, H., & Melby, A. (2014). Multidimensional quality metrics (MQM): A framework for declaring and describing translation quality metrics. *Tradumàtica*, 12, 455-463. https://aclanthology.org/2013.tc-1.6.pdf
- Clarke, J., & Lapata, M. (2011). Evaluating sentence compression: Pitfalls and suggested remedies. *ACL Workshop on Monolingual Text-To-Text Generation*. https://aclanthology.org/W11-1611.pdf

### UX writing

- Nielsen Norman Group. (2024-2025). *Error-message guidelines*. https://www.nngroup.com/articles/error-message-guidelines/
- American Psychological Association. (2025). *Brief guide to bias-free and inclusive language*. https://apastyle.apa.org/instructional-aids/inclusive-language.pdf
- AP Stylebook. (2024-2025). *Inclusive storytelling*. https://www.silverlakect.org/files/websites/sl/AP+Stylebook+Update+on+Inclusive+Language.pdf

### Długie formy

- Chang, Y. et al. (2024). BooookScore: A systematic exploration of book-length summarization. *arXiv preprint*. https://arxiv.org/html/2310.00785v4
- OpenAI. (2021). *Summarizing books with human feedback*. https://openai.com/index/summarizing-books/

Pełna lista w `SOURCES.bib` (87 wpisów z DOI / arXiv ID / URL zweryfikowanymi w `CLAIM-AUDIT.md`).

---

## Notatka metodologiczna końcowa

Niniejszy raport jest **materiałem do przyszłego skilla**, nie gotowym skillem. Skill musi:
1. Być przetestowany na korpusie ewaluacyjnym (projekt w sekcji 10).
2. Iterować na podstawie ślepych testów redaktorskich.
3. Zawierać fallback dla niskiej pewności ("Nie wiem, czy to zmienić").
4. Być otwarty na **odmowę** redakcji ("Zostawiam, bo autor wie").

Brama końcowa z PROMPT sprawdzona:
- ✅ Wszystkie ważne twierdzenia mają zweryfikowane źródła lub etykietę hipotezy
- ✅ Katalog uwzględnia kontekst i fałszywe pozytywy (sekcja 5: W1-W12 + M1-M7)
- ✅ Tryb "zostaw bez zmian" jest osobnym trybem (sekcje 6.9, 12.1.4, 13.3 H8)
- ✅ Metryki obejmują zachowanie znaczenia, głosu i brak nadmiernej redakcji (sekcja 10.2)
- ✅ Książka traktowana jako system globalny (sekcja 9)
- ✅ Raport **nie obiecuje niewykrywalności** (sekcja 11.2)
- ✅ Żaden plik poza `wersje/minimax3/` nie został zmieniony (weryfikacja: brak zapisów w innych lokalizacjach; por. decyzja izolacji w PROTOKOL.md §0)
