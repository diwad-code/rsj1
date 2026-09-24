# Protokół przeglądu — Naturalna polszczyzna a cechy tekstu generowanego przez modele językowe

*Rejestracja przed wyszukiwaniem (styl PROSPERO) · Data: 2026-08-17 · Model: Claude Sonnet 4.6 (Thinking)*

---

## 1. Pytanie i tło

**Pytanie główne:** Jakie cechy tekstów produkowanych przez wielkie modele językowe (LLM) zostały empirycznie wykazane, a które jedynie powielane są w popularnym dyskursie — ze szczególnym uwzględnieniem języka polskiego, jego normy, uzusu i stylistyki?

**Pytanie pomocnicze 1 (definicje):** Jak definiuje się naturalność, płynność, jakość stylistyczną, głos autora i postrzegana „ludzkość" tekstu w badaniach lingwistycznych i NLP?

**Pytanie pomocnicze 2 (cechy empiryczne):** Które wzorce leksykalne, składniowe, semantyczne, pragmatyczne i organizacyjne LLM wykazano w kontrolowanych badaniach?

**Pytanie pomocnicze 3 (specyfika polska):** Co wiadomo o cechach LLM w języku polskim, w językach fleksyjnych i w językach nisko-zasobowych/słabiej reprezentowanych?

**Pytanie pomocnicze 4 (czynniki modulujące):** Jak model, prompt, temperatura, gatunek, długość, tłumaczenie i redakcja ludzka zmieniają obserwowane cechy?

**Pytanie pomocnicze 5 (fałszywe pozytywy):** Kiedy człowiek świadomie lub nieświadomie stosuje konstrukcje uznawane za „AI-owe"?

**Pytanie pomocnicze 6 (strategie redakcji):** Jak poprawiać tekst bez homogenizacji głosu, bez zakazu legalnych środków retorycznych i bez straty sensu?

**Pytanie pomocnicze 7 (gatunki i media):** Jak kryteria naturalności różnią się dla UI, artykułów, raportów, literatury, kodu i dokumentacji?

**Pytanie pomocnicze 8 (detektory):** Jaka jest skuteczność, ograniczenia i etyczne implikacje narzędzi wykrywających AI-tekst?

**Pytanie pomocnicze 9 (ocena poprawy):** Jak mierzyć jakość edycji: metryki automatyczne, ocena ludzka, ryzyko nadredakcji?

**Pytanie pomocnicze 10 (długie dokumenty):** Jak dzielić i scalać bardzo długi tekst/książkę zachowując globalny styl i ciągłość?

**Uzasadnienie:** Rosnące użycie LLM w polskojęzycznej produkcji tekstu tworzy potrzebę ugruntowanych zasad redakcyjnych. Popularne blogi i narzędzia oferują listy „zakazanych słów", ale brak im podstaw naukowych. Skill ma dostarczyć rzetelnych, kontekstowych kryteriów.

---

## 2. Cele

- **Główny:** Zbudować taksonomię wzorców text-LLM z poziomem dowodów, kontekstem języka polskiego i strategiami redakcyjnymi.
- **Drugorzędny 1:** Skatalogować różnice gatunkowe i rejestrowe.
- **Drugorzędny 2:** Ocenić skuteczność detektorów AI z perspektywy ryzyka fałszywych pozytywów.
- **Drugorzędny 3:** Zaproponować projekt weryfikacyjny (korpus, ocena ślepa, metryki szkód).
- **Drugorzędny 4:** Sformułować wskazówki dla tekstu widocznego dla użytkownika w oprogramowaniu.

---

## 3. Kryteria kwalifikacji

### Włączenie
- **Populacja/ekspozycja:** teksty generowane przez LLM lub badania nad percepcją takich tekstów; norma i uzus języka polskiego; stylistyka; pragmatyka.
- **Typy badań:** systematyczne przeglądy i metaanalizy (priorytet) → recenzowane eksperymenty kontrolowane → badania obserwacyjne i korpusowe → autorytatywne źródła normatywne (gramatyki, słowniki) → przeglądy narracyjne ze wskazaną metodą.
- **Daty publikacji:** priorytet 2020–2026 dla badań LLM; bez ograniczeń dla lingwistyki polskiej, stylistyki i podstaw metodologicznych.
- **Języki:** angielski i polski; wyjątkowo inne języki fleksyjne dla analogii.
- **Tematy:** cechy tekstu LLM, detekcja autorstwa, naturalność tekstu, styl/głos autora, norma językowa, pragmatyka, redakcja, przetłumaczone teksty, detekcja AI.

### Wykluczenie
- Blogi, artykuły SEO, content marketing, farmy treści — mogą być cytowane wyłącznie jako `OBJECT-OF-STUDY`.
- Materiały bez recenzji (preprints) — włączone jako uzupełnienie z etykietą *preprint, nierecenzowany*.
- Czasopisma drapieżne (brak DOAJ/Scopus/WoS/PubMed, brak DOI, czerwone flagi z predatory-and-sponsored-sources.md).
- Żadnych cytacji bez weryfikowalnego DOI lub stabilnego rekordu w bazie.
- Badania dotyczące wyłącznie modeli specjalistycznych (medycznych, prawnych) bez odniesienia do ogólnych cech tekstu.

---

## 4. Źródła informacji

### Bazy elektroniczne (priorytet MCP, fallback WebSearch do domen naukowych)
1. **OpenAlex** — szeroka baza 240M+ prac, trendy, cytowania
2. **Semantic Scholar** — cross-domain, TLDRs, citation graph
3. **arXiv** (cs.CL, cs.AI) — preprinty NLP/CL
4. **Crossref** — weryfikacja DOI i metadanych
5. **ACL Anthology** (via WebSearch: aclanthology.org) — konferencje NLP: ACL, EMNLP, NAACL, COLING, EACL
6. **Google Scholar** (via WebSearch: scholar.google.com) — filtr: polskie językoznawstwo
7. **CEJSH / BazHum / EJOURNALS.EU** — polskie lingwistyczne czasopisma
8. **Biblioteka PWJN** — Polskie Wydawnictwo Naukowe, słowniki i gramatyki

### Źródła autorytatywne (norma i uzus)
- Wielki słownik języka polskiego PAN (wsjp.pl)
- Słownik języka polskiego PWN (sjp.pwn.pl)
- Wielki słownik ortograficzny PWN
- Rada Języka Polskiego — opinie i uchwały
- Narodowy Korpus Języka Polskiego (nkjp.pl)
- Gramatyka współczesnego języka polskiego (Grzegorczykowa et al.)
- Inny słownik języka polskiego (Bańko)

---

## 5. Strategia wyszukiwania

### Bloki terminologiczne

**Blok A — Cechy LLM:**
EN: `"large language model" OR "LLM" OR "ChatGPT" OR "GPT" OR "AI-generated text"` ORAZ `"linguistic features" OR "text quality" OR "naturalness" OR "style" OR "voice"`

**Blok B — Detekcja i autorstwo:**
EN: `"AI text detection" OR "authorship attribution" OR "machine-generated text" OR "AI writing detection"` ORAZ `"Polish" OR "morphologically rich" OR "inflectional"`

**Blok C — Polszczyzna:**
PL: `"język polski" AND ("sztuczna inteligencja" OR "model językowy" OR "ChatGPT" OR "generowanie tekstu")`

**Blok D — Styl i redakcja:**
EN: `"text editing" OR "style transfer" OR "writing quality" OR "author voice" ORAZ "NLP" OR "computational linguistics"`
PL: `"redakcja tekstu" OR "styl" OR "naturalność" OR "jakość tekstu"`

**Blok E — Norma polska:**
PL: `"norma językowa" OR "uzus" OR "polszczyzna wzorcowa" OR "prosty język"` (wyszukiwanie w CEJSH/BazHum)

**Blok F — Detektory:**
EN: `"GPTZero" OR "Turnitin AI" OR "AI content detector" OR "false positive" OR "detector accuracy"` AND `"evaluation"`

**Blok G — Tłumaczenie i kalki:**
EN: `"calque" OR "translationese" OR "machine translation" OR "post-editing"` ORAZ `"Polish" OR "Slavic"`

**Blok H — Długie dokumenty:**
EN: `"long document" OR "book-length" OR "coherence" OR "global consistency"` AND `"LLM" OR "language model"`

---

## 6. Selekcja i screening

**Etap 1 — Tytuł/abstrakt:** odfiltrowanie non-scholarly, ocena tematycznej trafności.
**Etap 2 — Pełny tekst:** sprawdzenie kryteriów włączenia/wykluczenia, weryfikacja metodologii.
**Etap 3 — Ekstrakcja:** tabela dowodów z lokalizatorem cytatu i oceną jakości.
**Konflikty:** decyzja zachowawcza — wątpliwe źródło jest traktowane jako BACKGROUND lub OBJECT-OF-STUDY, nigdy jako EVIDENCE.

---

## 7. Ekstrakcja danych

Dla każdego włączonego źródła:
- Identyfikator, autorzy, rok, typ badania, baza
- Próba: język(i), liczebność, model(e) LLM
- Pytanie badawcze i metoda
- Kluczowe wyniki (cytata + lokalizator strony/sekcji)
- Ograniczenia wskazane przez autorów
- Ocena jakości (AMSTAR-2 dla przeglądów, Newcastle–Ottawa dla obserwacyjnych, GRADE)
- Trafność transferu na język polski (bezpośrednia / pośrednia / spekulatywna)

---

## 8. Ryzyko błędu i pewność dowodów

- Przeglądy systematyczne: **AMSTAR-2**
- Badania obserwacyjne i korpusowe: **Newcastle–Ottawa Scale (NOS)**
- Eksperymenty porównawcze: **RoB 2** (gdzie stosowalne)
- Certność całości: **GRADE** → High / Moderate / Low / Very Low
- Normatywne źródła językowe: oddzielna kategoria **NORMATIVE** — nie podlegają GRADE, ale muszą być autorytatywne (RJP, PWN, PAN)

---

## 9. Plan syntezy

Synteza narracyjna (nie metaanaliza ilościowa, ze względu na heterogeniczność badań).
Organizacja: wzorzec → dowody → jakość → specyfika polska → strategie redakcyjne.
Analiza wrażliwości: czy wnioski zmieniają się po wykluczeniu slabych/anglojęzycznych źródeł?

---

## 10. Rejestr zmian (amendments)

| Data | Zmiana | Powód |
|------|--------|-------|
| 2026-08-17 | Protokół zarejestrowany | Wyjście wstępne przed wyszukiwaniem |

*(wszelkie późniejsze zmiany będą tutaj rejestrowane z datą i uzasadnieniem)*
