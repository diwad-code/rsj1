# Prompt startowy dla modelu Codex — niezależny research

## Rola i niezależność

Przeprowadź niezależny, odtwarzalny research nad poprawianiem polszczyzny generowanej przez AI. Jesteś jedynym właścicielem artefaktów w `wersje/codex/`. Nie wolno Ci czytać, listować, przeszukiwać ani wykorzystywać innych katalogów pod `wersje/`, pliku `wersje/SYNTEZA.md` ani `skill-files/`.

Możesz czytać wspólne zasady repo: `CLAUDE.md`, `README.md`, `.claude/skills/**`, `.claude/agents/**`, `references/**`, szablony w `research/`, `.mcp.json` i skrypty walidacyjne. Pisz wyłącznie do `wersje/codex/`.

Twoja dodatkowa specjalizacja to **bezpieczne wyszukiwanie i redagowanie tekstu widocznego dla użytkownika w repozytoriach, zachowanie kontraktów kodu oraz skalowanie workflow do dużych dokumentów**. Raport ma jednak objąć cały wspólny zakres językowy i naukowy, a nie tylko implementację.

## Misja

Zbuduj bazę dowodową dla przyszłego, przenośnego skilla, który:

- rozpoznaje schematyczną, bezosobową, nadmiernie symetryczną lub kalkowaną polszczyznę;
- naprawia ją kontekstowo, bez mechanicznej podmiany słów;
- zachowuje znaczenie, fakty, stopień pewności, głos, gatunek i terminologię;
- modyfikuje tylko treści przeznaczone do odczytania przez człowieka;
- działa na pojedynczych komunikatach, dokumentacji, artykułach i książkach;
- nie obiecuje obejścia detektorów AI i nie używa ich wyniku jako definicji jakości.

## Obowiązkowy pipeline badawczy

Przeczytaj w całości właściwe lokalne skille i wykonaj kolejno: `research-question`, `research-protocol`, `literature-search`, `source-credibility`, `citation-verification`, `data-extraction`, `critical-appraisal`, `scientific-consensus`, `evidence-synthesis`, `research-report`.

Zanim otworzysz internet, zapisz `wersje/codex/PROTOKOL.md`. Rejestruj wszystkie zmiany protokołu. Korzystaj przede wszystkim z recenzowanej literatury, uznanych konferencji NLP/HCI/software engineering, korpusów i autorytatywnych instytucji językowych. Materiały marketingowe i listy „zwrotów ChatGPT” mogą być tylko przedmiotem badania. Zweryfikuj każdą cytację i jej relację z tezą.

Jeśli możesz uruchamiać niezależnych scoutów, podziel wyszukiwanie według pytań lub baz; po szkicu wykonaj przejście sceptyczne. Jeśli narzędzia są niedostępne, odnotuj to i przeprowadź równoważny proces sekwencyjnie.

## Zasady interpretacji dowodów

1. Połącz perspektywę `computer-science`, `social-sciences`, językoznawstwa korpusowego, psycholingwistyki, HCI i inżynierii oprogramowania.
2. Szukaj po polsku i angielsku; dla każdej tezy zaznacz język badania.
3. Nie przenoś automatycznie markerów angielskich na polski.
4. Oddziel: cechę LLM, cechę złego tekstu, cechę tłumaczenia, cechę gatunku i cechę konkretnego modelu lub promptu.
5. Traktuj konstrukcje takie jak „to nie X, to Y” jako hipotezy, dopóki nie znajdziesz odpowiednich dowodów.
6. Nie utożsamiaj przewidywania autorstwa z oceną jakości.
7. Opisz niepewność, replikację, fałszywe pozytywy, zmianę modeli w czasie i datę stanu wiedzy.
8. „Nowoczesny język 2026” oznacza aktualny, adekwatny uzus — nie obowiązkowy slang ani porzucenie terminologii specjalistycznej.

## Wspólny zakres pytań

Zbadaj:

- definicje naturalności, płynności, jakości, autentycznego głosu i stylu;
- empirycznie wykazane cechy LLM, szczególnie w polskim i językach fleksyjnych;
- internetowe mity o „AI-zmach” oraz źródła ich popularności;
- leksykę, składnię, pragmatykę, rytm, spójność akapitów i makrostrukturę;
- kontrast „nie X, lecz Y”, trójpodziały, symetrię, wyliczenia, nagłówki, myślniki, metatekst, uogólnienia, emfatyczne podsumowania i nadmierne nominalizacje;
- zmienność względem modelu, promptu, temperatury, gatunku, długości i tłumaczenia;
- legalne zastosowania tych samych konstrukcji przez ludzi;
- zasady redakcji UI, komunikatów błędów, artykułów, opracowań, nauki, marketingu, dialogu i prozy;
- prosty język, dostępność, inkluzywność, terminologię i ryzyko spłycenia treści;
- obsługę całej książki oraz utrzymanie stylu między fragmentami;
- wiarygodne testy skuteczności, w tym zachowanie znaczenia i test „nie pogarszaj dobrego tekstu”.

## Specjalizacja Codex: repozytoria i kontrakt bezpieczeństwa

Zbadaj i zaprojektuj wymagania, ale nie implementuj finalnego skilla. Uwzględnij:

### Klasyfikacja widoczności

- Jak rozróżnić tekst użytkowy od identyfikatorów, kluczy, nazw zmiennych, logów technicznych, fixture'ów i treści testowych?
- Jak postępować z tekstem w HTML, JSX/TSX, Vue, Svelte, szablonach, Markdown/MDX, JSON/YAML i18n, PO, backendowych komunikatach, e-mailach i plikach treści?
- Jak klasyfikować tekst warunkowy, dynamiczny, konkatenowany i generowany?
- Kiedy potrzebny jest parser/AST, a kiedy wystarcza wyszukiwanie tekstowe?
- Jak raportować kandydatów o niepewnej widoczności zamiast automatycznie je zmieniać?

### Elementy chronione

Opracuj kontrakt zachowania m.in. dla:

- kluczy i identyfikatorów;
- placeholderów (`{name}`, `%s`, `{{value}}`, `${value}`), ICU/MessageFormat i odmiany liczebników;
- znaczników HTML/Markdown, linków, encji, kodu inline i bloków kodu;
- escape'ów, końców linii, kodowania i ograniczeń długości UI;
- nazw własnych, marek, terminów, liczb, dat, jednostek i cytatów;
- logiki, warunków, kolejności komunikatów oraz mapowania lokalizacji.

### Bezpieczna zmiana

Zbadaj dobre praktyki: inwentaryzacja → klasyfikacja → próbka → redakcja → diff semantyczny → testy składni/build → kontrola wizualna → raport. Opisz strategie rollbacku, małych partii, plików generowanych, źródła prawdy i zakazu edycji artefaktów pochodnych.

### Duże dokumenty i książki

Opracuj mechanizm podziału semantycznego, kontrolowanego nakładania kontekstu, księgi stylu, glosariusza, rejestru postaci i nazw, osi czasu, rejestru zmian oraz końcowego przejścia globalnego. Zbadaj ryzyko dryfu, niespójności i utraty zapowiedzi między rozdziałami.

## Taksonomia praktyczna

Dla każdego wzorca zapisz:

`ID · nazwa · poziom · opis operacyjny · dowody · język badania · zależność od gatunku/modelu · fałszywe pozytywy · kontrprzykład · bezpieczne strategie · elementy chronione · test znaczenia · kiedy nie zmieniać · pewność`.

Nie buduj listy zakazanych tokenów ani mechanizmu regexowego udającego diagnozę stylu. Wzorzec powinien wynikać z konfiguracji cech i kontekstu.

## Obowiązkowe artefakty

Utwórz tylko w `wersje/codex/`:

- `PROTOKOL.md` — protokół sprzed wyszukiwania i rejestr zmian;
- `SEARCHLOG.yaml` — odtwarzalne zapytania, daty, liczby i kryteria;
- `EVIDENCE-TABLE.md` — tabela z lokalizatorami konkretnych ustaleń;
- `RAPORT.md` — pełny raport po polsku;
- `CLAIM-AUDIT.md` — dla kluczowych tez: istnienie, wsparcie, zakres, aktualność, decyzja;
- `SOURCES.bib` — tylko sprawdzone rekordy;
- opcjonalnie `EXCLUDED.md` — uzasadnione wykluczenia.

## Struktura raportu

1. Metryka i ograniczenia dostępu.
2. Pytania, protokół i metody.
3. Mapa dowodów oraz ocena jakości.
4. Co wiadomo o polskim; co jest tylko transferem międzyjęzykowym.
5. Taksonomia cech i mitów.
6. Zasady kontekstowej redakcji.
7. Klasyfikacja tekstu widocznego dla użytkownika.
8. Kontrakt zachowania i bezpieczna edycja repozytoriów.
9. Długie formy i książki.
10. Architektura ewaluacji i zestaw przypadków brzegowych.
11. Detektory AI, błędy metodologiczne i ograniczenia etyczne.
12. Wymagania dla przyszłego skilla, bez jego implementacji.
13. Luki i pytania otwarte.
14. Bibliografia APA 7.

## Bramka końcowa

Sprawdź, czy:

- każdy mocny wniosek ma zweryfikowane źródło i lokalizator;
- DOI, autorzy, tytuły, lata i status korekt są prawidłowe;
- źródła marketingowe nie sterują katalogiem wzorców;
- raport odróżnia jakość tekstu od klasyfikacji autorstwa;
- każde zalecenie techniczne opisuje ryzyka i granice;
- uwzględniono tekst już dobry, stylizowany, prawny, medyczny, cytowany, mieszany językowo i zawierający placeholdery;
- żaden plik poza `wersje/codex/` nie został zmieniony.

W odpowiedzi końcowej podaj tylko krótkie podsumowanie, listę artefaktów, liczby źródeł i luki. Nie wklejaj pełnego raportu.
