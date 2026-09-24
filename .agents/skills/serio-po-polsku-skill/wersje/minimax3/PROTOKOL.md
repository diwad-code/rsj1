# Protokół przeglądu — Rozpoznawanie i redagowanie „schematycznej polszczyzny" kojarzonej z LLM

*Rejestracja przed wyszukiwaniem (styl PROSPERO) · Data: 2026-08-16*
*Wersja robocza: MiniMax3 · Izolacja: zapisy wyłącznie w `wersje/minimax3/`*

## 0. Ujawnienie ograniczeń środowiska

- **Subagenenty `literature-scout` i `skeptic` zdefiniowane w `.claude/agents/`** są przeznaczone dla środowiska Claude Code. W tej sesji Mavis **nie mam dostępu** do tych subagentów (Task tool widzi wyłącznie agentów Mavis: `general`, `verifier`, `coder`, `mavis`). Wykonuję równoważne przejścia samodzielnie:
  - **równoległe wyszukiwanie** w wielu bazach/podtematach (web_search + web_fetch w jednym cyklu);
  - **adversarial pass** na koniec — własna krytyka draftu pod kątem overreachu, fałszywej równowagi, citation-claim mismatches, brakujących dowodów przeciwnych.
- **MCP `paper-search` (paper-search-mcp) i `openalex` (openalex-mcp-server) są zdefiniowane w `.mcp.json`**, ale moje aktywne narzędzia to wyłącznie `web_search` + `web_fetch` (HTTP z lokalnej maszyny). Dla źródeł naukowych **fallback do scholarly-restricted web search** z listy `references/database-guide.md`. DOI arXiv/bioRxiv/PubMed/Europe PMC są dostępne bez klucza.
- Zapytania kieruję do domen z `database-guide.md` (openalex.org, semanticscholar.org, pubmed, arxiv, doi.org, crossref.org, nature.com, plos.org, springer, sciencedirect, wiley, taylorfrancis, jstor, acm.org, ieee.org, who.int, oecd.org itd.). Gdy web_search zwraca trafienie bez DOI, rozwiązuję DOI przez `web_fetch` na `https://doi.org/<doi>` lub `https://api.crossref.org/works/<doi>`.
- **Komercyjne listy „AI words"** (np. popularne blogi o „red flags AI text") traktuję wyłącznie jako `OBJECT-OF-STUDY` (kandydat do zweryfikowania), nie jako `EVIDENCE`.

## 1. Pytanie i tło

**Pytanie główne (scoping review z elementami comparative+mechanistic):** Co wiadomo z recenzowanej literatury naukowej i z autorytatywnego opisu polszczyzny o (a) cechach językowych i stylistycznych tekstów generowanych przez LLM, (b) granicach, w jakich da się je rozpoznawać automatycznie, (c) operacjach redakcyjnych przywracających naturalność, klarowność i adekwatność gatunkową **bez** optymalizacji pod detektory, (d) różnicach między angielskim a polskim (transfer międzyjęzykowy), (e) wpływie modelu/promptu/temperatury/długości/gatunku.

**Tło:** popularne poradniki „jak unikać AI-izmów" powielają niepotwierdzone listy sformułowań (em-dash, „delve", „tapestry", „It's not just X, it's Y", trójpodziały, wyliczenia) i traktują detektory AI jako wiarygodną miarę jakości. Recenzowana literatura pokazuje, że detektory AI mają ograniczoną i niestabilną skuteczność, są podatne na ataki paraphrasingowe, a ich przeniesienie między językami/domenami jest słabe. Równocześnie przeglądy dotyczące pisania kreatywnego, stylistyki i retoryki (ang. *craft*) dostarczają empirycznie uzasadnionych wskazówek redakcyjnych, które nie polegają na unikaniu „trigger words".

**Dlaczego przegląd:** brak syntezy łączącej (i) wyniki badań nad cechami LLM-tekstów w NLP/psycholingwistyce, (ii) polskie źródła normy/uzusu, (iii) tradycję redakcyjną i pisania kreatywnego, (iv) krytykę detektorów, (v) mierniki jakości redakcji (nie detektory). Lektura tej syntezy ma bezpośrednio zasilić projekt skilla redakcyjnego dla polszczyzny.

## 2. Cele

- **Główny:** zbudować taksonomię wzorców i kontr-wzorców „schematycznej polszczyzny" ze sprawdzonymi źródłami lub jawną etykietą hipotezy.
- **Drugorzędne:**
  - ocenić, które „AI-izmy" mają poparcie w recenzowanej literaturze, a które są powieleniami mitów;
  - opisać granice detektorów AI w polskim kontekście;
  - przygotować macierz gatunków (etykieta przycisku → książka) z ryzykiem AI-owej schematyczności i niedopuszczalnymi uproszczeniami;
  - zaproponować workflow redakcyjny dla długich form z ochroną głosu;
  - zaprojektować korpus ewaluacyjny i metryki (ślepa ocena, preferencje, zachowanie znaczenia, brak nadmiernej redakcji);
  - wskazać luki badawcze i hipotezy do dalszej pracy.

## 3. Kryteria kwalifikacji (PICO/PECO dla tematu badawczego)

| Element | Definicja |
|---|---|
| **P** (populacja/problem) | Teksty pisane (jedno- i wielojęzyczne), ze szczególnym naciskiem na polski |
| **I/E** (interwencja/ekspozycja) | Generacja przez LLM (GPT-3.5/4, Claude, Llama, Mistral, Gemma, polskie/PL-adaptowane: Bielik, PLLuM) lub/i redakcja tekstu ludzkiego/LLM |
| **C** (komparator) | Tekst ludzki (kontrola), ewentualnie tekst ludzki stylizowany na AI, ewentualnie różne modele/parametry między sobą |
| **O** (wyniki) | Cechy lingwistyczne (leksyka, składnia, spójność, retoryka), wynik detektora AI, ocena jakości/czytelności/naturalności (redaktorska, odbiorcza), zachowanie znaczenia/głosu |
| **T** (timeframe) | 2018 (pojawienie się GPT-2) → 2026-08, z preferencją dla 2023–2026 |
| **S** (setting) | peer-reviewed prace naukowe, autorytatywne źródła normy/uzusu (RJP, SJP, Narodowy Korpus Języka Polskiego, IJP PAN), oraz literatura branżowa (HCI) |
| **Study type** | systematyczne przeglądy/meta-analizy, eksperymenty, badania korpusowe, replikacje, wytyczne redakcyjne. Wyłączone: krótkie abstrakty, listy bez danych, posty blogowe, materiały sponsorowane (jako `OBJECT-OF-STUDY` tylko) |

**Wykluczenia:** teksty marketingowe o AI-writing tools, posty na blogach „top 10 AI words" (traktowane jako obiekt studiów, nie dowód), nierecenzowane „whitepapers" firm komercyjnych (jako `OBJECT-OF-STUDY`).

## 4. Źródła informacji

- **Bazy naukowe (przez web_search + weryfikacja DOI):**
  - OpenAlex (openalex.org)
  - arXiv (arxiv.org, cs.CL + cs.HC)
  - PubMed / Europe PMC (głównie dla psycholingwistyki/poznania)
  - Semantic Scholar (semanticscholar.org)
  - Crossref (api.crossref.org) — weryfikacja DOI
  - ACL Anthology (aclanthology.org) — NLP/Creative Writing research
  - ACM Digital Library, IEEE Xplore (HCI)
  - JSTOR (stylistyka, retoryka, kreatywne pisanie)
  - Springer Link, ScienceDirect, Wiley, Taylor & Francis, Cambridge, Oxford, Sage
- **Autorytatywne źródła polskie:**
  - Rada Języka Polskiego (rjp.pan.pl) — orzeczenia, stanowiska
  - Słownik języka polskiego PWN / sjp.pwn.pl
  - Narodowy Korpus Języka Polskiego (nkjp.pl), IJP PAN
  - Poradnia Językowa PWN, Poradnia Językowa US
  - „Poradnik językowy" / „Język Polski" / „Prace Językoznawcze" (czasopisma)
  - „Prosty język polski" — Fundacja Widzialni, Ministerstwo, dobrychslon.pl
- **Materiały HCI/UX writing:** Nielsen Norman Group (raporty), UX Collective (jako BACKGROUND, nie EVIDENCE), researchgate, ACM CHI.
- **Plan citation-chasing:** w przód (prace cytujące) i w tył (referencje) od anchor reviews (np. Puccini et al. 2024; Lipka et al. 2024 dla polskiego; Tang et al. 2024; Yanagi et al. 2024).
- **Grey literature:** Retraction Watch (kontrola cofnięć); arXiv preprints z flagą „not peer-reviewed".

## 5. Strategia wyszukiwania (główne stringi zapytań)

Zapytania wykonywane są w kilku iteracjach, w polskim i angielskim, na wielu bazach. Log w `SEARCHLOG.yaml`.

**Klaster A — cechy LLM-tekstów (ang.):**
- `"large language model" AND text AND characteristic* AND (lexical OR syntactic OR stylometric)`
- `("AI-generated text" OR "LLM text") AND (linguistic OR psycholinguistic) AND (human OR detection)`
- `"discourse marker*" AND ("language model" OR LLM) AND (corpus OR essay)`
- `"hedging" AND LLM AND (frequency OR corpus)`
- `("not just" OR "it is not" OR "delve") AND LLM AND (frequency OR analysis)`

**Klaster B — psycholingwistyka / pamięć czytelnika / głębia przetwarzania:**
- `"reading comprehension" AND ("AI-generated" OR LLM) AND experiment`
- `"perceived effort" AND LLM AND reading`
- `"depth of processing" AND generated text`
- `"voice" OR "authenticity" AND writing AND experiment AND reader`

**Klaster C — detektory AI (granice):**
- `("AI text detector" OR "AI text detection") AND (accuracy OR robustness OR adversarial)`
- `"paraphrase attack" AND AI detector`
- `Binoculars OR "fast-detectGPT" OR "watermark" AND large language model AND text`
- `"cross-lingual" AND "AI text detection"`
- `("false positive" OR bias) AND AI text detector AND (non-native OR English learner OR dialect)`

**Klaster D — polski (transfer i cechy):**
- `"język polski" AND ("model językowy" OR LLM OR GPT) AND (stylistyka OR cechy OR korpus)`
- `("Polish" OR "Polski") AND (LLM OR "language model") AND detection AND (corpus OR benchmark)`
- `"prosty język" AND (standard OR wytyczne OR dostępność)`
- `"Rada Języka Polskiego" AND (słowo OR norma OR uzus)`
- `("Bielik" OR "PLLuM") AND (polish OR język) AND evaluation`

**Klaster E — redakcja / craft / writing studies:**
- `"sentence compression" AND (neural OR "large language model") AND (quality OR evaluation)`
- `paraphrase AND quality AND (human OR reference) AND metric`
- `"nominalization" AND style AND (corpus OR experimental)`
- `("passive voice") AND clarity AND (writing OR instruction)`
- `("creative writing" OR "fiction writing") AND (voice OR narrator) AND (research OR empirical)`
- `(dialogue OR "point of view") AND fiction AND (research OR study OR workshop)`
- `"long-form" AND coherence AND ("large language model" OR generation) AND (book OR chapter)`
- `chunking AND long context AND coherence AND generation`

**Klaster F — UX writing / HCI / inkluzywność:**
- `"microcopy" OR "UX writing" AND (best practice OR guideline OR experiment)`
- `"error message" AND design AND (comprehension OR user) AND study`
- `"plain language" AND (guideline OR standard) AND evaluation`
- `"inclusive language" AND (style guide OR standard)`

**Klaster G — ewaluacja:**
- `(MQM OR "multidimensional quality metrics") AND translation AND human`
- `("pairwise preference" OR A/B) AND "text quality" AND writing`
- `"human evaluation" AND "text generation" AND (rubric OR Likert)`

## 6. Selekcja i screening

1. **Title/abstract screen** — czy tekst dotyczy (a) cech tekstów LLM, (b) detekcji, (c) redakcji/craftu, (d) gatunków, (e) ewaluacji. Eliminuję śmieci reklamowe.
2. **Full-text screen** — weryfikuję, czy tekst raportuje dane empiryczne / recenzję / autorytatywną normę, czy tylko powtarza tezy.
3. **Źródło i jakość** — preferuję: meta-analizy, systematyczne przeglądy, ACL/EMNLP/CHI/NeurIPS papers, IJP PAN i RJP, *Language*, *Journal of Memory and Language*, *Written Communication*, *Computational Linguistics*. Niżej: arXiv preprints (z flagą), wydawnictwa branżowe (NN/g).
4. **Conflict resolution** — autor raportu rozstrzyga; przy braku pewności tekst zostaje włączony z flagą `BACKGROUND` i dyskusją w raporcie.
5. **Polski priorytet** — dla każdej tezy z badań anglojęzycznych sprawdzam, czy istnieje polski odpowiednik lub uwaga o transferze.

## 7. Ekstrakcja danych

Pola dla każdego źródła (anchored):

```
id (autor, rok) · DOI/URL · venue · design/sample · language · model (jeśli NLP) · finding (verbatim lub streszczenie 1-zdaniowe) · quoted claim (jeśli dotyczy cytatu) · limitation · risk-of-bias (per design) · GRADE certainty (per outcome) · disposition (EVIDENCE/BACKGROUND/OBJECT-OF-STUDY/REJECT)
```

## 8. Ryzyko błędu i pewność dowodów

- **Narzędzia RoB:** brak randomizowanych prób klinicznych w tym temacie; stosuję ad-hoc: dla korpusowych badań LLM — jakość korpusu i rozmiar; dla eksperymentów czytelniczych — Newcastle–Ottawa (adapt.); dla detektorów — replication + adversarial robustness; dla recenzji — AMSTAR-2.
- **GRADE:** per outcome (np. „cecha X jest częstsza w LLM", „detektor Y ma accuracy Z").
- **Język:** obniżam GRADE dla tez przeniesionych z angielskiego na polski bez dowodu.

## 9. Plan syntezy

- **Narracyjno-tematyczny** (dla głównego pytania — to scoping review).
- **Macierz gatunków** (sekcja 7 RAPORT-u) — synteza tabelaryczna.
- **Taksonomia wzorców** (sekcja 5 RAPORT-u) — ustrukturyzowana lista z polami jak w PROMPT.
- **Katalog „mitów"** — co jest powszechnie powtarzane, a nie ma poparcia.
- **Hipotezy do dalszej pracy** — jawne, z poziomem pewności.

## 10. Rejestr zmian (amendments)

Brak dotychczas. Wszelkie odstępstwa będą tu dopisywane z datą i powodem.
