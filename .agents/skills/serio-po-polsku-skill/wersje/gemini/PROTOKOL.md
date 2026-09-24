# Protokół przeglądu — Niezależny research: Detekcja, stylometria wielojęzyczna i rzetelna redakcja (Polski i Angielski)

*Rejestracja przed wyszukiwaniem (styl PROSPERO) · Data: 2026-08-16*

## 1. Pytanie i tło
W miarę jak modele językowe są powszechnie używane do generowania i redagowania tekstów, pojawia się problem "AI-izmów", nadmiernego ustrukturyzowania tekstu, oraz detektorów sztucznej inteligencji, które cechują się wysokim odsetkiem wyników fałszywie pozytywnych. Celem jest niezależny przegląd naukowy dotyczący cech tekstów generowanych przez LLM (w szczególności w języku polskim w porównaniu do angielskiego), granic rozpoznawania autorstwa przez ludzi i detektory, oraz opracowanie rzetelnych kryteriów redakcji polszczyzny, które zachowują głos autora, poprawiają tekst, ale nie niszczą jego autentyczności. Redakcja nie ma na celu oszukiwania detektorów, lecz tworzenie naturalnych, wiarygodnych tekstów w różnych gatunkach (UI, artykuł, książka).

### Wspólne pytania badawcze:
1. Jak operacjonalizuje się naturalność, jakość stylistyczną i autentyczność?
2. Jakie cechy LLM są replikowane (niezależne od epoki/modelu)?
3. Gdzie są dowody dla polskiego i języków fleksyjnych? Gdzie brakuje danych?
4. Które cechy angielskie transferują się na język polski?
5. Jak parametry (prompt, temperatura, decoding, RLHF) wpływają na styl?
6. Jakie są fałszywe pozytywy (False Positives) w detekcji? Kto jest poszkodowany?
7. Jak badać "AI-izmy" strukturalne (paralelizm, myślniki, wyliczenia, metadyskurs)?
8. Czy markery AI to czasem poprawne środki retoryczne?
9. Jak redagować, by nie tracić znaczenia, stopnia pewności, głosu, humoru?
10. Różnice między gatunkami (UI vs artykuł vs książka).
11. Jak zachować spójność w długich tekstach (> okno kontekstowe)?
12. Definicja współczesnej polszczyzny 2026 r. (normatywna vs uzus).
13. Jak walidować redakcję i mierzyć szkody uboczne?

## 2. Cele
- **Główny**: Opracowanie opartego na dowodach naukowych katalogu wzorców detekcji, markerów stylistycznych LLM oraz wytycznych do bezpiecznej, zachowującej "głos" redakcji.
- **Drugorzędne**: Ewaluacja rzetelności detektorów AI, zrozumienie różnic międzygatunkowych oraz transferowalności cech między językiem angielskim a polskim.

## 3. Kryteria kwalifikacji
- **Populacja / Obiekty**: Teksty generowane przez LLM (j. polski i j. angielski), teksty pisane przez ludzi, zjawisko fałszywych pozytywów.
- **Typy badań**: Recenzowane przeglądy literatury, badania empiryczne z ewaluacją i metrykami (Precision, Recall, AUROC, kalibracja), eksperymenty psycholingwistyczne (human detection), publikacje z konferencji (ACL, EMNLP, NAACL, COLING), lingwistyka korpusowa. Preprinty z arxiv będą uwzględniane z oznaczeniem niższej siły dowodowej.
- **Daty**: 2022-2026.
- **Języki**: Angielski, Polski.
- **Wykluczenia**: Marketingowe wpisy na blogach firmowych, popularne artykuły prasowe traktujące "AI detectors" jako magiczne narzędzia bez krytyki, dowody opierające się na anegdotach, badaniach bez metryk klasyfikacji, "SEO listicles". (Mogą być użyte tylko jako *obiekt badań* - `OBJECT-OF-STUDY`).

## 4. Źródła informacji
- Semantic Scholar, ACL Anthology, arXiv, Crossref.
- Dodatkowo: zasoby naukowe z lingwistyki polonistycznej i korpusowej.
- Metoda dostępu: `WebSearch` (ograniczone do domen naukowych `site:arxiv.org`, `site:aclweb.org`, `site:semanticscholar.org` lub zapytania z kluczowymi słowami naukowymi) z uwagi na brak wpiętego MCP w obecnym środowisku.
- Citation chasing do wyszukiwania dodatkowych źródeł.

## 5. Strategia wyszukiwania
Będziemy używać następujących słów kluczowych:
- `LLM text generation stylistic markers`
- `Machine text detection false positives`
- `LLM authorship attribution human evaluation`
- `Stylometry large language models cross-lingual Polish`
- `Polish language LLM style artifacts`
- `AI generated text burstiness perplexity bias`
- `LLM translation translationese stylometry`
- Zapytania do podagentów: jeden ds. detekcji i fałszywych pozytywów, jeden ds. stylometrii i różnic językowych, jeden ds. ewaluacji ludzkiej i redakcji.

## 6. Selekcja i screening
Każde badanie musi raportować metodykę. Odrzucane są teksty nieakademickie oraz badania oparte na zamkniętych API detektorów, o ile nie analizują samych wyników czarnych skrzynek krytycznie i empirycznie (np. poprzez mierzenie odsetka błędów dla non-native speakers).

## 7. Ekstrakcja danych
- Model, język, data generacji
- Skład korpusu (train/test), reprezentatywność.
- Parametry (prompt, temp, decodowanie).
- Wyniki detekcji: base rate, precision, recall, F1, AUROC, fałszywe oskarżenia.
- Cechy zidentyfikowane jako "AI-isms".

## 8. Ryzyko błędu i pewność dowodów
Szczególna uwaga na:
- Benchmark contamination (teksty testowe w zbiorze treningowym).
- Domain shift / Model drift (detektor działa na GPT-3, zawodzi na GPT-4).
- Bias przeciwko osobom niebędącym native speakerami (non-native speakers bias).

## 9. Plan syntezy
Synteza narracyjna dzieląca wnioski na:
- Detekcja techniczna i jej rzetelność.
- Stylometria i transferowalność językowa (EN -> PL).
- Katalog wzorców "AI-izmów" oraz bezpiecznej redakcji dla przyszłego skilla.

## 10. Rejestr zmian (amendments)
- 2026-08-16: Utworzenie początkowego protokołu. Zdecydowano o użyciu subagentów z instrukcjami WebSearch do eksploracji domen naukowych, zastępując braki w bezpośrednio zainstalowanym MCP. Z racji braku agenta "sceptyka" w środowisku skonfiguruję subagenta, by przyjął tę rolę po wykonaniu brudnopisu.
