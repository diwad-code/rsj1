# Prompt dla dużego modelu frontier — synteza niezależnych researchów

## Rola

Jesteś głównym metodologiem, recenzentem naukowym i architektem wiedzy. Otrzymujesz pięć niezależnych pakietów badawczych dotyczących poprawiania polszczyzny generowanej przez AI. Twoim zadaniem nie jest ich streszczenie przez głosowanie. Masz zbudować nową, krytyczną syntezę, ponownie zweryfikować najważniejsze źródła i przygotować jednoznaczny kontrakt wiedzy dla modelu, który później zbuduje finalny skill.

Nie buduj jeszcze skilla i nie edytuj `skill-files/`.

## Wejścia obowiązkowe

Pakiety znajdują się w:

- `wersje/cc_deepseek/`
- `wersje/claude/`
- `wersje/codex/`
- `wersje/gemini/`
- `wersje/minimax3/`

Każdy kompletny pakiet powinien zawierać:

- `PROTOKOL.md`
- `SEARCHLOG.yaml`
- `EVIDENCE-TABLE.md`
- `RAPORT.md`
- `CLAIM-AUDIT.md`
- `SOURCES.bib`

## Bramka kompletności — wykonaj przed lekturą merytoryczną

1. Sprawdź wyłącznie obecność, czytelność i niezerowy rozmiar wymaganych plików w każdym pakiecie.
2. Nie uznawaj samego promptu startowego za raport.
3. Jeżeli choć jeden pakiet jest niekompletny, **nie wykonuj syntezy**. Utwórz tylko `wersje/SYNTEZA-BRAKI.md` z tabelą braków i zakończ.
4. Jeżeli wszystkie pakiety są kompletne, usuń istniejący `wersje/SYNTEZA-BRAKI.md`, jeśli został wcześniej utworzony wyłącznie przez Ciebie i bezpiecznie można go zastąpić, a następnie kontynuuj.

## Granice zapisu

Możesz czytać wspólne materiały repozytorium oraz wszystkie ukończone pakiety modeli. Nie modyfikuj żadnego pliku w katalogach modeli, ich promptów startowych, wspólnych instrukcji ani `skill-files/`.

Zapisuj tylko następujące wyniki:

- `wersje/SYNTEZA-RAPORT.md`
- `wersje/SYNTEZA-EVIDENCE-TABLE.md`
- `wersje/SYNTEZA-CLAIM-AUDIT.md`
- `wersje/SYNTEZA-SEARCHLOG.yaml`
- `wersje/SYNTEZA-SOURCES.bib`
- warunkowo `wersje/SYNTEZA-BRAKI.md`

Nie nadpisuj `wersje/SYNTEZA.md`.

## Zasady nadrzędne

1. Przeczytaj `CLAUDE.md`, właściwe skille w `.claude/skills/**`, właściwe referencje i zasady cytowania repozytorium.
2. Raport modelu jest **wejściem do audytu**, nie źródłem naukowym. W finalnej syntezie cytuj publikacje pierwotne, przeglądy, korpusy i autorytatywne źródła, nie modele.
3. Liczba modeli powtarzających tezę nie podnosi jakości dowodu, jeżeli wszystkie opierają się na tej samej słabej publikacji.
4. Model może mieć rację mimo braku zgody pozostałych; może też pięć razy powtórzyć ten sam błąd. Rozstrzygaj źródłami i metodologią.
5. Nie wymyślaj brakujących DOI, danych, cytatów, wyników ani szczegółów metod.
6. Rozdzielaj dowód bezpośredni dla polskiego, transfer międzyjęzykowy i hipotezę redakcyjną.
7. Rozdzielaj: przewidywanie autorstwa, diagnozę jakości tekstu i decyzję, czy tekst należy zmienić.
8. Nie obiecuj „niewykrywalności przez detektory AI”. Zsyntetyzuj dowody o ich ograniczeniach i zaproponuj uczciwe kryteria jakości.
9. Aktualność na 2026 rok oznacza datowany stan uzusu i badań; nie oznacza automatycznej preferencji dla slangu lub najnowszej formy.

## Etap 1 — inwentaryzacja bez uśredniania

Dla każdego raportu osobno odnotuj:

- zakres i pytania;
- bazy, daty i zapytania;
- kryteria włączenia/wykluczenia;
- liczbę i rodzaj źródeł;
- udział badań bezpośrednio dotyczących polskiego;
- oceny jakości i ograniczenia;
- kluczowe tezy;
- tezy odrzucone lub pozostawione jako hipotezy;
- unikatowy wkład raportu;
- potencjalne błędy, nieciągłości lub braki.

Nie pozwól, aby najdłuższy albo najbardziej stanowczy raport dominował bez podstawy dowodowej.

## Etap 2 — wspólny rejestr tez

Znormalizuj twierdzenia do atomicznych tez. Dla każdej utwórz rekord:

`CLAIM-ID · dokładna teza · modele zgłaszające · cytowane źródła · dowód dla polskiego · dowód międzyjęzykowy · jakość · dowody przeciwne · konfudery · zgodność modeli · status weryfikacji · werdykt · pewność · dozwolone użycie w skillu`.

Statusy werdyktu:

- `ACCEPT-HIGH` — mocny, bezpośredni i aktualny dowód;
- `ACCEPT-CONDITIONAL` — przydatna reguła tylko z warunkami i wyjątkami;
- `HEURISTIC` — wartościowa hipoteza redakcyjna, ale nie fakt naukowy;
- `RESEARCH-ONLY` — interesujące, lecz zbyt słabe do działania automatycznego;
- `REJECT` — sprzeczne z dowodami, nieweryfikowalne albo metodologicznie wadliwe.

Każdy rekord `ACCEPT-CONDITIONAL` musi wskazać warunki włączenia, warunki wyłączenia i ryzyko fałszywego alarmu.

## Etap 3 — macierz zgodności i sporów

Zbuduj macierz obejmującą:

- pełną zgodność wynikającą z niezależnych źródeł;
- pozorną zgodność wynikającą z tego samego źródła;
- częściową zgodność z różnymi granicami;
- sprzeczność empiryczną;
- sprzeczność terminologiczną;
- brak danych;
- ustalenie unikatowe dla jednego raportu.

Dla każdej materialnej sprzeczności:

1. sformułuj pytanie rozstrzygające;
2. porównaj źródła, populacje, języki, modele, gatunki i daty;
3. sprawdź, czy konflikt znika po zawężeniu tezy;
4. poszukaj niezależnego dowodu rozstrzygającego;
5. zapisz werdykt albo uczciwy brak rozstrzygnięcia.

## Etap 4 — ponowna weryfikacja w internecie

Po analizie raportów wykonaj własny, odtwarzalny research uzupełniający zgodnie z pipeline repo. Nie kopiuj ich logów jako własnych.

Priorytetowo zweryfikuj:

- wszystkie tezy, które mają trafić do rdzenia działania skilla;
- wszystkie źródła cytowane przez co najmniej dwa modele;
- wyniki bezpośrednio dotyczące polskiego;
- twierdzenia o konstrukcji „to nie X, to Y” i innych rzekomych markerach;
- twierdzenia o skuteczności i ograniczeniach detektorów AI;
- aktualne źródła normy, uzusu, prostego języka i korpusów;
- metody oceny naturalności, zachowania znaczenia i głosu;
- bezpieczne wydobywanie tekstu użytkowego z repozytorium;
- skalowanie redakcji do książek i długich dokumentów.

Wykonaj osobne zapytania falsyfikujące. Sprawdź DOI, metadane, status korekt/retrakcji oraz konkretny fragment wspierający tezę. Jeżeli nie masz pełnego tekstu, nie twierdź, że sprawdziłeś fragment; oznacz poziom dostępu.

Zapisz własne zapytania i liczby w `wersje/SYNTEZA-SEARCHLOG.yaml`.

## Etap 5 — skonsolidowana taksonomia

Zbuduj jeden katalog wzorców. Scalaj synonimiczne rekordy, ale nie łącz różnych mechanizmów tylko dlatego, że prowadzą do podobnego wrażenia.

Każdy wzorzec musi zawierać:

- identyfikator i jednoznaczną nazwę;
- poziom: dokument / sekcja / akapit / zdanie / fraza / leksyka / typografia;
- definicję operacyjną;
- przykłady własne oznaczone jako ilustracyjne;
- rodzaj, jakość i zakres dowodu;
- status dla polskiego;
- zależność od modelu, czasu, promptu, gatunku i długości;
- cechy współwystępujące wymagane do diagnozy;
- kontrprzykłady i funkcje retoryczne;
- ryzyko fałszywych pozytywów;
- strategie poprawy zależne od kontekstu;
- elementy chronione;
- test zachowania sensu, stopnia pewności i głosu;
- warunki „zostaw bez zmian”;
- werdykt i pewność.

Nie twórz blacklisty słów, znaków interpunkcyjnych ani konstrukcji. Pojedyncza cecha nie może uruchamiać automatycznej zmiany bez kontekstu.

## Etap 6 — kontrakt wiedzy dla finalnego skilla

Synteza musi rozstrzygnąć lub jawnie pozostawić otwarte następujące elementy:

### Zakres

- tylko tekst widoczny dla użytkownika;
- pojedyncze zdania, pliki treści, UI, artykuły, opracowania i książki;
- tryby: audyt, sugestie, edycja;
- język polski jako cel; tekst mieszany i cytowany jako przypadki chronione.

### Niezmienniki

- znaczenie, fakty, liczby, daty, jednostki, wnioski i stopień pewności;
- cytaty, bibliografia, nazwy własne, marki i terminy;
- głos, rejestr, punkt widzenia, humor, stylizacja i celowa repetycja;
- klucze, identyfikatory, placeholdery, markup, linki i składnia;
- logika, rozgałęzienia, kolejność i źródło prawdy plików generowanych.

### Decyzja redakcyjna

Zaprojektuj kolejność: rozpoznanie gatunku i odbiorcy → diagnoza kontekstowa → oszacowanie pewności → decyzja zmień/zaproponuj/zostaw → bezpieczna redakcja → kontrola lokalna → kontrola globalna → dowód weryfikacji.

### Długie formy

Określ wymagania dla księgi stylu, glosariusza, postaci, chronologii, punktu widzenia, semantycznego chunkingu, kontrolowanego nakładania kontekstu, dziennika zmian, spójności między rozdziałami i globalnego audytu.

### Repozytoria

Określ klasy widoczności, formaty, elementy chronione, obsługę niepewności, źródła prawdy, pliki generowane, testy składni/build oraz dowód wizualny tam, gdzie to potrzebne.

### Ewaluacja

Określ minimalny korpus obejmujący gatunki i przypadki brzegowe, ślepą ocenę ludzką, zgodność semantyczną, spójność głosu, liczbę nieuzasadnionych zmian, preferencję parami oraz test „dobry tekst pozostaje dobry”. Wynik detektora AI nie może być głównym kryterium sukcesu.

## Wymagana struktura `SYNTEZA-RAPORT.md`

1. Metryka, data i stan kompletności wejść.
2. Metody syntezy i ponownej weryfikacji.
3. Ocena jakości pięciu pakietów bez rankingu modeli.
4. Mapa źródeł, duplikatów i niezależności dowodów.
5. Konsensus, spory i rozstrzygnięcia.
6. Co wiadomo bezpośrednio o polskim.
7. Skonsolidowana taksonomia wzorców.
8. Katalog mitów i twierdzeń odrzuconych.
9. Norma, uzus, rejestry i gatunki.
10. Strategie redakcyjne i warunki „nie zmieniaj”.
11. Kontrakt zachowania znaczenia i głosu.
12. Tekst widoczny w repozytoriach.
13. Długie formy i książki.
14. Detektory AI, ryzyka i granice obietnic.
15. Specyfikacja ewaluacji finalnego skilla.
16. Kontrakt wiedzy i sugerowana architektura zasobów skilla.
17. Macierz śledzenia: wymaganie skilla → teza → źródło → pewność → test.
18. Otwarte luki, decyzje wymagające ostrożności i polityka aktualizacji po 2026.
19. Zweryfikowana bibliografia APA 7.

## Pozostałe artefakty

### `SYNTEZA-EVIDENCE-TABLE.md`

Zawiera atomiczne tezy, źródła, lokalizatory, jakość, transfer do polskiego, kontrdowody, werdykt i zastosowanie.

### `SYNTEZA-CLAIM-AUDIT.md`

Dla każdej tezy użytej w kontrakcie skilla zapisz:

`CLAIM-ID · EXISTS · SUPPORTS · SCOPE · LIVE · locator/access · decision · notes`.

### `SYNTEZA-SOURCES.bib`

Tylko sprawdzone źródła faktycznie wykorzystane w syntezie. Deduplikuj DOI. Oznacz preprinty.

## Bramka końcowa

Nie kończ, dopóki:

- wszystkie pięć wejść było kompletne;
- główne wnioski zostały zweryfikowane niezależnie od raportów modeli;
- nie ma cytacji do modelu zamiast do źródła;
- zgodność modeli nie jest mylona z niezależnością dowodów;
- każda reguła skilla ma dowód, wyjątki, ryzyko i test;
- hipotezy nie są opisane jak ustalone fakty;
- polskie dane są oddzielone od transferu międzyjęzykowego;
- katalog pozwala pozostawić poprawny tekst bez zmian;
- finalny kontrakt nie obiecuje niewykrywalności;
- nie zmodyfikowano pakietów źródłowych ani `skill-files/`.

Na końcu odpowiedzi podaj krótki werdykt, utworzone pliki, liczbę tez w każdej kategorii werdyktu, liczbę źródeł ponownie zweryfikowanych oraz najważniejsze nierozstrzygnięte luki. Nie wklejaj całej syntezy do rozmowy.
