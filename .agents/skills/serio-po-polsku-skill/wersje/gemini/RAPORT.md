# Raport z niezależnego przeglądu badawczego: Stylometria, Detekcja i Rzetelna Redakcja Tekstów LLM

## 1. Metryka, data, narzędzia i ograniczenia
- **Data wykonania:** 2026-08-16
- **Zastosowane narzędzia:** Pół-autonomiczni subagenci badawczy (Scouci), ograniczone web scraping (domen naukowych). Z powodu braku natywnie uwierzytelnionych wtyczek MCP, wyszukiwanie w oparciu o bazę ogólnodostępną i arXiv. 
- **Ograniczenia:** Ograniczony bezpośredni dostęp do systemów zamkniętych barierami płatności (paywall). Sceptyk był zintegrowany na etapie autoweryfikacji wewnętrznej, a nie jako osobny subagent w osobnym wątku, by skrócić czas oczekiwania.

## 2. Pytania, kryteria, protokół i metody
Proces badawczy zdefiniowano w pliku `PROTOKOL.md`. Skoncentrowano się na 13 wspólnych pytaniach badawczych oceniających stylometryczne markery modeli językowych (tzw. "AI-izmy"), fałszywe pozytywy detekcji, transfer markerów z języka angielskiego do polskiego, oraz na ocenie ludzkiej i wytycznych do redakcji. Przeprowadzono kwerendę z użyciem trójpodziału subagentów: (1) Detekcja/False Positives, (2) Stylometria/Polski, (3) Ocena ludzka/Edycja. Do zbioru dowodów zakwalifikowano jedynie badania peer-reviewed oraz publikacje konferencyjne i znaczące preprinty z lat 2023-2026 z czytelną metodologią.

## 3. Jakość bazy dowodów
Zebrano 19 głównych źródeł wspierających zjawiska i hipotezy. Baza dowodów jest oceniana jako "umiarkowanie wysoka do wysokiej" (moderate-to-high GRADE). Przeważają badania empiryczne z benchmarkami (np. Śmigiel Dataset, DetectGPT, PROSE), które transparentnie pokazują wyniki i ograniczenia. Nieliczne pozycje (np. preprinty z 2026 r.) czekają na formalną recenzję (peer-review), jednakże ich metodologia i wkład w dyscyplinę (kod open-source, datasety) pozwalają zakwalifikować je do ostrożnej syntezy.

## 4. Taksonomia metod detekcji i ich ograniczeń
Metody detekcji AI-generated text klasyfikuje się na cztery grupy:
1. **Analiza perplexity i burstiness**: Klasyczne podejścia. Ich głównym problemem jest penalizowanie osób niebędących native speakerami, którzy naturalnie posługują się słownictwem o niższej entropii (Liang et al., 2023).
2. **Probability Curvature (Krzywizna Prawdopodobieństwa)**: Zmiana paradygmatu na sprawdzanie, czy perturbacje tekstu gwałtownie obniżają jego prawdopodobieństwo z perspektywy modelu generującego (DetectGPT - Mitchell et al., 2023). Skuteczne zero-shot, ale kruche przy głębokiej redakcji ludzkiej.
3. **Statystyczna Stylometria i NLP**: Oparta o rozkład długości zdań, markery syntaktyczne i "AI-izmy". Silnie zależne od domen.
4. **Watermarking (Znaki wodne)**: Manipulowanie logitami podczas generacji (Sander et al., 2025; Pan et al., 2024). Teoretycznie najskuteczniejsze, ale podatne na degradację przy atakach parafrastycznych (Li et al., 2024).

**Podstawowe ograniczenia:** Domain shift (spadek skuteczności poza dziedziną treningową modelu detekcyjnego) oraz model drift (zmienność struktur wraz z aktualizacjami LLM). Klasyfikatory mają ogromny problem z utrzymaniem restrykcyjnego FPR (False Positive Rate = 0.1%), co dyskwalifikuje je jako niezawodne narzędzia karne (Chen et al., 2025).

## 5. Wyniki dla polskiego, innych języków i transferu międzyjęzykowego
Z badań cross-lingualnych (MULTITuDE, Macko et al., 2023; MultiSocial, Vigilant, 2024) wynika jasno: *zero-shot transfer* detektorów z języka angielskiego na polski jest nieefektywny. Język polski jako język silnie fleksyjny z relatywnie swobodnym szykiem zdania niszczy proste, syntaktyczne miary oparte na angielskich dystrybucjach n-gramów. 
Jednakże badacze (Strebeyko et al., 2026; Śmigiel Dataset) udowodnili, że dedykowany model detekcyjny wytrenowany na polskim korpusie radzi sobie doskonale wewnątrz własnej domeny, wykrywając lokalne anomalie morfologiczne i specyficzną polskojęzyczną entropię LLM. Oznacza to, że "AI-izmy" istnieją w języku polskim, choć przybierają nieco inną, gramatycznie zlokalizowaną formę.

## 6. Taksonomia kandydatów na „AI-izmy” (Wzorce)

- **ID:** PAT-01
- **Nazwa:** Ustrukturyzowana Staccato
- **Poziom:** Syntaktyczny / Dyskursywny
- **Definicja:** Równomierny rozkład długości zdań (niska wariancja/burstiness), obsesyjne unikanie zdań bardzo krótkich, połączone z nadmiarem zdań złożonych podrzędnie.
- **Efekt i Transfer:** Silny we wszystkich językach. W PL objawia się redukcją naturalnych ucięć i równoważników zdań w miejscach wymagających dynamiki.

- **ID:** PAT-02
- **Nazwa:** Nadmierna spójność konektywna (Metadyskurs)
- **Poziom:** Dyskursywny
- **Definicja:** Nadużywanie zwrotów łączących ("Ważne jest, aby zauważyć", "Niemniej jednak", "W istocie", "Kluczowym aspektem"). 
- **Fałszywe pozytywy:** Akademicy i studenci celowo uczą się tego metadyskursu dla poprawy oceny w testach standaryzowanych.
- **Kryteria pozostawienia:** Jeśli dany zwrot faktycznie organizuje bardzo skomplikowany wywód naukowy, należy go zostawić.

- **ID:** PAT-03
- **Nazwa:** Polaryzacja Podsumowań ("W podsumowaniu")
- **Poziom:** Struktura dokumentu
- **Definicja:** Posiadanie podsumowującego akapitu na końcu każdego generowanego tekstu, często zaczynającego się od charakterystycznego idiomu kalkowanego z j. ang (np. rzadkie w języku polskim "Konkludując" używane powszechnie i niekontekstowo).
- **Redakcja:** Całkowite wycięcie, jeśli gatunek (np. post UI) tego nie wymaga.

- **ID:** PAT-04
- **Nazwa:** Neutralizacja tonu ("Generative Vitality loss")
- **Poziom:** Leksykalny / Dyskursywny
- **Definicja:** Redukcja słownictwa niosącego skrajne emocje lub silną asercję na rzecz bezpiecznych, łagodzących określeń, co redukuje tzw. psycholingwistyczną "witalność generatywną" (Anonim, 2025).

## 7. Fałszywe pozytywy i konteksty legalnego użycia
Szczególnie narażeni na błędne oznaczenie (FP) są "non-native speakers" języka angielskiego (a także obcokrajowcy piszący po polsku). Korzystają oni z węższego zasobu leksykalnego i trzymają się ściśle znormalizowanych struktur gramatycznych, co obniża entropię, upodabniając ich styl do LLM (Liang et al., 2023). Istnieją również krótkie formaty (np. tweety firmowe, posty informacyjne), w których "staccato" i prostota są wymogiem formalnym, a nie oszustwem (Przystalski et al., 2025). Markery AI nierzadko są po prostu markerami bardzo poprawnego, wysoce znormalizowanego tekstu oficjalnego.

## 8. Zasady bezpiecznej redakcji i zachowania głosu
Zgodnie z frameworkiem PROSE (2025) oraz analizą psycholingwistyczną, optymalna redakcja przez AI powinna charakteryzować się:
1. **Lokalnością:** Edycja winna mieć zasięg zdania/akapitu, bez reorganizacji całego wywodu, co chroni dyskurs (pacing i flow autora).
2. **Zachowaniem Witalności:** Należy utrzymywać oryginalny poziom modalności epistemicznej (pewności) oraz słownictwo nacechowane afektywnie (humor, oburzenie).
3. **Punktową poprawą:** Poprawa musi celować w konkretny błąd (np. w polszczyźnie pleonazmy, błędy składni rządu) zamiast restylizowania tekstu do uśrednionego rejestru "poprawnej nowomowy".
Wnioskowanie o autorstwie po takich lokalnych zmianach jest bezcelowe, ponieważ "voice" należy do autora, a interwencja modelu stanowi wsparcie gramatyczne.

## 9. Gatunki, UI, długie formy i książki
- **Teksty Naukowe:** Wymagają najwyższej wierności ontologii i faktom. Eliminacja AI-izmów nie może uszkodzić terminologii (Gu et al., 2026).
- **UI / Marketing:** Jakość determinuje "buzzworthiness" i angażowanie użytkownika (Chen et al., 2024), a AI-izmy tu najbardziej szkodzą (są "nudne" i zmniejszają konwersję). Krótkie formy nie generują silnych markerów stylometrycznych.
- **Książki / Długie formy:** Największym zagrożeniem nie jest lokalna perplexity, ale "pacing" - tempo narracji. Modele mają skłonność do rozwiązywania problemów natychmiast po ich zarysowaniu. Redakcja wymaga systemu odniesień (RAG) do okna długoterminowego.

**Normy Polskie (NKJP vs RJP):** W profesjonalnej redakcji nie należy faworyzować rozwiązań tylko dlatego, że mają wysoką frekwencję w *uzusie* (NKJP). Ślepe naśladownictwo częstości faworyzuje błędy poprawnościowe i neologizmy slangowe. Narzędzie AI winno opierać kryteria poprawnościowe na twardej normie (np. wytycznych Rady Języka Polskiego), a korpusów używać do regulowania "naturalności" i entropii.

## 10. Projekt wiarygodnej ewaluacji skilla
Ewaluacja tworzonego w przyszłości skilla redakcyjnego powinna polegać na:
1. **Metrykach zachowania semantyki (Semantic Similarity):** Porównanie embeddingów tekstu wejściowego i wyjściowego pod kątem zachowania faktów (np. BERTScore / cosine similarity).
2. **Human Blind Review:** Podwójnie ślepa próba - czytelnik ocenia "autentyczność" tekstu (czy brzmi jak ludzki głos) na skali Likerta i czy dostrzega intencję autora. (Jak argumentują Roy et al. 2025, oceniamy na skali ternarnej - Human/AI/Hybrid).
3. **Wskaźniku szkód ubocznych (Collateral Damage):** Ilość wprowadzonych tzw. halucynacji lub usuniętego kontekstu osobistego, mierzona przez analizę różnicową (diff audit).
Ewaluacja detektorem jest zabroniona jako miara sukcesu operacji z powodu wysokiej niestabilności metryk.

## 11. Etyka i granice obietnic
Należy wprost zakomunikować, że celem skilla **nie jest oszukiwanie detektorów**, "AI humanizing" ani omijanie zabezpieczeń antysplagiatowych. Celem jest "polerowanie" tekstu, przywracanie jego "generative vitality" oraz zachowywanie odrębności głosu autora, co skutkuje tekstem bogatszym dla ludzkiego odbiorcy. Tworzenie narzędzia w celu bypassowania predyktorów przyczynia się jedynie do wyścigu zbrojeń adwersaryjnych.

## 12. Wymagania dla przyszłego skilla
1. **Rozłączność modułów:** Osobny przebieg na poprawę błędów normatywnych (RJP), osobny na eliminację metadyskursu (AI-isms) i osobny na weryfikację tonu (human voice conservation).
2. **Granulacja:** Działanie na poziomie poszczególnych akapitów (zapobiega to utracie detali).
3. **Wyjaśnialność:** Skill powinen generować `diff` z uzasadnieniem ("Zmieniono X na Y na podstawie normy RJP" / "Usunięto zbędny metadyskurs podsumowujący").
4. **Zastrzyk wariancji:** Dopuszczanie różnorodności długości zdań i odchodzenie od uśrednionego, przewidywalnego tonu asystenta "staccato".

## 13. Luki, sprzeczności i priorytety badań
- **Luka:** Zdecydowana większość badań ewaluacyjnych dla języka polskiego bazuje wciąż na małych korpusach testowych niewidzianych w treningu; domain-shift to niezmierzona "szara strefa".
- **Luka:** Niejasność, czy redakcja człowieka zachowująca sens oryginalnie wygenerowanego tekstu tworzy tzw. tekst "hybrydowy" i jak przypisać tu autorstwo z punktu widzenia prawnego/naukowego.
- **Priorytet badawczy:** Stworzenie lepszych metryk oceniających "głos" (Voice Retention Score), które pozwolą obiektywnie oszacować, jak mocno interwencja edytora zniekształca personalny idiolekt użytkownika.

## 14. Bibliografia APA 7
*Zestawienie bibliograficzne w formacie BibTeX znajduje się w osobnym pliku `SOURCES.bib` w tym samym katalogu.*
*(Główne zacytowane powyżej to: Liang et al. 2023, Mitchell et al. 2023, Chen et al. 2025, Macko et al. 2023, Strebeyko et al. 2026, PROSE 2025, Roy et al. 2025).*
