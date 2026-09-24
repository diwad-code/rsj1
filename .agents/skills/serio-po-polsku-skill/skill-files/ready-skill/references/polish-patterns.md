# Katalog wzorców polszczyzny

Stan wiedzy: 2026-08-29. Traktuj wzorce jako problemy jakościowe zależne od funkcji tekstu, nie jako dowody autorstwa. Przykłady są ilustracyjne, nie badawcze.

## Jak używać katalogu

Wymagaj konfiguracji co najmniej dwóch zgodnych sygnałów albo jednoznacznego błędu językowego. Sprawdź kontrprzykład i funkcję, zanim zdecydujesz. Nie stosuj progów liczbowych, blacklist ani globalnych podmian.

### P01 — Uniformizacja leksykalna

- **Poziom:** akapit / dokument; leksyka.
- **Definicja:** powrót do tych samych ogólnych wyrazów mimo miejsc, w których elipsa lub precyzyjne przeformułowanie służyłyby treści.
- **Sygnały:** powtórzenia + brak funkcji terminologicznej + brak wymogu prostego języka.
- **Dowód i zakres:** `ACCEPT-CONDITIONAL`, `S-L02/S-L06`; pośredni EN, zależny od gatunku, modelu i długości.
- **Gatunki:** sprawdzaj w artykule i prozie; zachowuj w prawie, dokumentacji, nauce i UI, jeśli stabilizuje termin.
- **Fałszywe alarmy:** glosariusz, SEO wymagane przez autora, prosty język, refren.
- **Funkcja zachowania:** spójność terminu, pamięć, rytm.
- **Strategie:** użyj elipsy; nazwij konkretny obiekt; przeformułuj relację; dobierz synonim tylko poza terminologią.
- **Chronione:** terminy, marki, nazwy, cytaty.
- **Test:** porównaj zakres pojęć i referencje.
- **LEAVE-AS-IS:** powtórzenie identyfikuje ten sam termin lub jest celowe.

### P02 — Analityzm i abstrakcyjna rzeczownikowość

- **Poziom:** fraza / zdanie.
- **Definicja:** czasownik rozłożony na pusty czasownik i rzeczownik, któremu towarzyszy utrata sprawcy lub konkretu.
- **Sygnały:** `dokonać/przeprowadzić/realizować` + nominalizacja + ciężka składnia.
- **Dowód i zakres:** `ACCEPT-CONDITIONAL`, `S-L04`; pośredni EN jako cecha LLM, znany problem stylistyczny PL niezależny od AI.
- **Gatunki:** częściej zmieniaj w instrukcji i artykule; ostrożnie w prawie, nauce i procedurach.
- **Fałszywe alarmy:** termin, wymagany aspekt, celowa bezosobowość.
- **Funkcja zachowania:** precyzja procesu, jednorazowość, odpowiedzialność instytucjonalna.
- **Strategie:** przywróć czasownik; nazwij sprawcę tylko z kontekstu; rozbij frazę.
- **Chronione:** aspekt, modalność, zakres obowiązku, terminy.
- **Test:** sprawdź, czy `dokonać pomiaru` nie zostało błędnie zastąpione przez trwające `mierzyć`.
- **LEAVE-AS-IS:** forma jest terminem albo niesie odmienny aspekt.

### P03 — Spiętrzenie dopełniacza

- **Poziom:** fraza / zdanie.
- **Definicja:** długi łańcuch zależnych rzeczowników utrudniający ustalenie relacji.
- **Sygnały:** kilka dopełniaczy + niejasne przyłączenie + realny koszt odczytu.
- **Dowód i zakres:** `HEURISTIC`; stylistyka PL, brak badania nad polskim LLM.
- **Gatunki:** instrukcje, administracja, raporty; ostrożnie w ustalonych nazwach prawnych i naukowych.
- **Fałszywe alarmy:** `indeks masy ciała`, nazwa procedury, tytuł aktu.
- **Funkcja zachowania:** zwarta nazwa terminu.
- **Strategie:** dodaj zdanie podrzędne; użyj frazy przyimkowej; zamień jeden człon na przymiotnik.
- **Chronione:** termin i jego granice.
- **Test:** odtwórz relacje między rzeczownikami przed i po.
- **LEAVE-AS-IS:** łańcuch jest utrwalonym terminem i czytelnik go zna.

### P04 — Metadyskurs bez funkcji

- **Poziom:** akapit / sekcja.
- **Definicja:** zapowiedź lub streszczenie dublujące nagłówek i niewnoszące informacji ani orientacji.
- **Sygnały:** zapowiedź + brak przyrostu treści + istniejący sygnał struktury.
- **Dowód i zakres:** `ACCEPT-CONDITIONAL`, `S-L04` z kontrdowodem `S-E02`; EN, esej argumentacyjny.
- **Gatunki:** częściej skracaj w artykule; zachowuj w dydaktyce, streszczeniu wykonawczym i procedurze.
- **Fałszywe alarmy:** mapa dokumentu, ostrzeżenie, dostępnościowe przypomnienie.
- **Funkcja zachowania:** nawigacja, przewidywalność, bezpieczeństwo.
- **Strategie:** usuń redundantną ramę; połącz ją z tezą; zachowaj sam nagłówek lub listę.
- **Chronione:** kolejność, obietnica zakresu, odwołania.
- **Test:** sprawdź, czy czytelnik nadal wie, gdzie jest i co nastąpi.
- **LEAVE-AS-IS:** rama realnie organizuje trudny materiał.

### P05 — Redundantne powtórzenie tezy

- **Poziom:** akapit / sekcja.
- **Definicja:** teza, jej parafraza i konkluzja powtarzają to samo bez nowej konsekwencji.
- **Sygnały:** równoważne twierdzenia + brak nowego warunku, dowodu lub działania.
- **Dowód i zakres:** `ACCEPT-CONDITIONAL`; pośredni `S-L04`, heurystyczny dla PL.
- **Gatunki:** artykuł, marketing, raport; ostrożnie w instrukcji, bezpieczeństwie i retoryce.
- **Fałszywe alarmy:** przypomnienie krytyczne, refren, anafora, dydaktyka.
- **Funkcja zachowania:** pamięć, nacisk, rytm, zgodność prawna.
- **Strategie:** zachowaj najmocniejsze sformułowanie; drugie zastąp konsekwencją; scal dwa zdania.
- **Chronione:** wszystkie twierdzenia, warunki i wymagane ostrzeżenia.
- **Test:** wykonaj ekstrakcję twierdzeń przed i po.
- **LEAVE-AS-IS:** każde wystąpienie ma inną funkcję albo powtórzenie jest zamierzone.

### P06 — Spłaszczona modalność i zatarta odpowiedzialność

- **Poziom:** zdanie / akapit.
- **Definicja:** tekst ukrywa sprawcę lub wyrównuje pewność, przez co zaciera różnicę między możliwością, zaleceniem i obowiązkiem.
- **Sygnały:** bezosobowość + niejasny wykonawca + niejednoznaczny operator epistemiczny.
- **Dowód i zakres:** `ACCEPT-CONDITIONAL`, `S-L04`; pośredni EN, najwyższe ryzyko szkody semantycznej.
- **Gatunki:** błędy UI, raporty, artykuły; bardzo ostrożnie w nauce, prawie i medycynie.
- **Fałszywe alarmy:** metoda naukowa, ochrona prywatności, celowy dystans.
- **Funkcja zachowania:** bezstronność, tajemnica, nieznany sprawca.
- **Strategie:** nazwij sprawcę wyłącznie z danych; przywróć oryginalny stopień pewności; rozdziel stan od przyczyny.
- **Chronione:** modalność, negacja, czas, odpowiedzialność, warunek.
- **Test:** zestaw osobno `może/powinien/musi` oraz kto wykonuje działanie.
- **LEAVE-AS-IS:** bezosobowość jest prawdziwa i funkcjonalna.

### P07 — Nadmierna symetria i regularność rytmu

- **Poziom:** zdanie / akapit / seria akapitów.
- **Definicja:** kolejne jednostki mają niemal tę samą konstrukcję, długość i zamknięcie, a regularność nie służy skanowaniu ani retoryce.
- **Sygnały:** seryjne początki + seryjne puenty + monotonia odczuwalna w lekturze ciągłej.
- **Dowód i zakres:** `HEURISTIC`, pośredni EN; brak polskiego benchmarku rytmu.
- **Gatunki:** rozważ w prozie i artykule; zachowuj w UI, procedurze, liście i poezji.
- **Fałszywe alarmy:** paralelizm, trójpodział, tabela, stały wzorzec komunikatów.
- **Funkcja zachowania:** rytm, nacisk, skanowalność, komizm.
- **Strategie:** zmień jedną konstrukcję; połącz lub rozdziel według logiki; usuń pustą puentę. Nie rotuj długości mechanicznie.
- **Chronione:** relacje logiczne, kolejność, głos.
- **Test:** przeczytaj akapit na głos i porównaj funkcję każdego członu.
- **LEAVE-AS-IS:** symetria ułatwia zadanie albo tworzy celową figurę.

### P08 — Kalka i niedopasowanie uzusu

- **Poziom:** słowo / kolokacja / składnia / pragmatyka.
- **Definicja:** forma możliwa gramatycznie, lecz obca kolokacyjnie, składniowo lub sytuacyjnie dla danego polskiego rejestru.
- **Sygnały:** nietypowa łączliwość + ślad języka źródłowego + brak utrwalenia w domenie.
- **Dowód i zakres:** `HEURISTIC`; brak bezpośredniego badania polskiego LLM, nie utożsamiaj z translationese.
- **Gatunki:** wszystkie, z pierwszeństwem lokalnego glosariusza i uzusu branży.
- **Fałszywe alarmy:** internacjonalizm, nowy uzus, termin techniczny, świadome zapożyczenie, cytat.
- **Funkcja zachowania:** precyzja domenowa, stylizacja, kontakt językowy.
- **Strategie:** sprawdź korpus lub źródło branżowe; podaj wariant; zmień kolokację, nie znaczenie.
- **Chronione:** terminy, marki, nazwy, cytaty.
- **Test:** sprawdź rekcję, łączliwość i rejestr w aktualnym źródle.
- **LEAVE-AS-IS:** użycie jest utrwalone w domenie albo celowe.

### P09 — Błędy w konstrukcjach złożonych

- **Poziom:** zdanie / relacja między zdaniami.
- **Definicja:** naruszenie zgody, rządu, szyku, referencji lub granic zdań w złożonej konstrukcji.
- **Sygnały:** niezgodność fleksyjna, wiszące odniesienie, niejasny podmiot, źle przyłączone zdanie.
- **Dowód i zakres:** `ACCEPT-CONDITIONAL`, `S-P01`; bezpośredni PL, model 2023 i zadania maturalne.
- **Gatunki:** wszystkie; stylizacja literacka może zawieszać normę celowo.
- **Fałszywe alarmy:** anakolut postaci, elipsa dialogowa, eksperyment formalny.
- **Funkcja zachowania:** indywidualny głos lub rytm mowy.
- **Strategie:** napraw zgodę lub rząd; rozbij zdanie z zachowaniem relacji; doprecyzuj referencję bez dopisywania faktu.
- **Chronione:** wszystkie warunki, negacja, kolejność i perspektywa.
- **Test:** wykonaj pełny rozbiór zależności, nie tylko korektę lokalną.
- **LEAVE-AS-IS:** odstępstwo jest świadomą, czytelną stylizacją.

### P10 — Nieaktualna norma ortograficzna lub interpunkcyjna

- **Poziom:** zapis / typografia.
- **Definicja:** użycie zasady uchylonej albo sprzecznej z obowiązującym dokumentem RJP.
- **Sygnały:** rozbieżność z wersją normy aktualną dla daty i rodzaju tekstu.
- **Dowód i zakres:** `ACCEPT-HIGH`, `S-P03`; bezpośrednie normatywne PL.
- **Gatunki:** tekst współczesny; historyczny cytat i stylizacja zachowują zapis źródła.
- **Fałszywe alarmy:** cytat, archaizacja, nazwa zastrzeżona, wymóg marki.
- **Funkcja zachowania:** autentyczność historyczna lub prawna.
- **Strategie:** popraw wobec aktualnego dokumentu pierwotnego; podaj podstawę przy zmianie spornej.
- **Chronione:** cytaty, nazwy własne, oficjalna pisownia marki.
- **Test:** sprawdź regułę w aktualnym źródle RJP, nie w pamięci modelu.
- **LEAVE-AS-IS:** wyjątek lub zapis źródłowy jest udokumentowany.

### P11 — Niedopasowanie rejestru

- **Poziom:** dokument / akapit.
- **Definicja:** formalność, ton lub sposób zwracania się nie odpowiada odbiorcy, celowi i kanałowi.
- **Sygnały:** rejestr odstaje od lokalnych przykładów + utrudnia cel + nie wynika z wymogu domeny.
- **Dowód i zakres:** `ACCEPT-CONDITIONAL`, `S-L03/S-P04`; pośredni EN plus norma PL.
- **Gatunki:** wszystkie; kryteria różnią się według `registers-and-genres.md`.
- **Fałszywe alarmy:** marka, protokół dyplomatyczny, stylizacja, wymaganie instytucji.
- **Funkcja zachowania:** autorytet, dystans, wspólnotowość, humor.
- **Strategie:** dostosuj formę adresatywną; usuń sztuczne ocieplenie; ogranicz marketingową emfazę; zachowaj poziom fachowości.
- **Chronione:** głos marki, tytuły, claimy prawne, relacja nadawca–odbiorca.
- **Test:** porównaj z kartą stylu i realnym zadaniem odbiorcy.
- **LEAVE-AS-IS:** rejestr jest zgodny z funkcją, nawet jeśli jest formalny.

### P12 — Deficyt konkretności, niuansu i różnorodności

- **Poziom:** akapit / dokument.
- **Definicja:** tekst pozostaje na poziomie ogólnych deklaracji mimo dostępnych w kontekście konkretów, lokalnej perspektywy lub odmiennych przykładów.
- **Sygnały:** ogólnik + dostępny materiał źródłowy + brak zakotwiczenia; nie wystarcza samo słowo abstrakcyjne.
- **Dowód i zakres:** `ACCEPT-CONDITIONAL`, `S-H03`; wielojęzyczne, bez potwierdzenia udziału polskiego.
- **Gatunki:** artykuł, raport, marketing, pomoc; ostrożnie w UI i przy braku danych.
- **Fałszywe alarmy:** streszczenie, poufność, celowo uniwersalna zasada.
- **Funkcja zachowania:** zwięzłość, prywatność, zakres abstrakcyjny.
- **Strategie:** użyj konkretu już obecnego w źródle; wskaż autorowi miejsce do uzupełnienia; zróżnicuj przykład bez tworzenia faktu.
- **Chronione:** fakty, liczby, zakres, kultura i doświadczenia, których tekst nie potwierdza.
- **Test:** każde nowe uszczegółowienie musi mieć źródło w wejściu albo decyzji autora.
- **LEAVE-AS-IS:** brak bezpiecznego konkretu lub abstrakcja jest funkcją tekstu.

## Konstrukcje często błędnie traktowane jako samodzielne wzorce

### „To nie X, to Y” i mechaniczna antyteza

Nie oznaczaj konstrukcji jako AI. Zmień ją tylko wtedy, gdy w danym tekście wielokrotnie zastępuje argument, tworzy fałszywą dychotomię, powtarza tę samą puentę albo nie pasuje do rejestru. Wtedy diagnozuj odpowiednio `P05`, `P07` lub `P11`. Zachowaj ją, gdy precyzyjnie koryguje kategorię, kontrastuje dwie realne możliwości, buduje rytm lub głos.

### Trójpodziały, seryjne nagłówki i wyliczenia

Nie usuwaj ich za samą regularność. Zmień dopiero wtedy, gdy kilka poziomów struktury dubluje się, elementy są sztucznie dopasowane do liczby, a forma spowalnia wykonanie zadania. Zachowaj, gdy wspierają skanowanie, pamięć, procedurę lub retorykę.

### Sztuczne ocieplenie i marketingowa pompatyczność

Nie ścigaj słów typu „kluczowy”. Oceniaj konfigurację `P11 + P12`: przesadna bliskość lub emfaza, brak konkretu, nowa obietnica i niedopasowanie do sytuacji. Usuń samą warstwę, nie informację ani głos marki.

### Zamknięcia „pod linijkę” i ujednolicone akapity

Diagnozuj `P05 + P07` tylko wtedy, gdy każda sekcja kończy się równoważną puentą bez nowej konsekwencji. Nie naruszaj wymaganego szablonu dokumentacji, streszczeń sekcji ani celowej kompozycji.
