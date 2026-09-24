# Rejestry i gatunki

Najpierw ustal funkcję, odbiorcę i kanał. Stosuj normę wzorcową w kontekstach oficjalnych, a użytkową tam, gdzie dopuszcza ją sytuacja. Prosty język oznacza dopasowanie do odbiorcy i celu, nie automatyczne usuwanie terminów.

| Gatunek | Priorytet | Typowe ryzyko | Domyślna ingerencja |
|---|---|---|---|
| Przycisk, etykieta, tooltip | działanie, skanowalność, limit | dopisanie tonu, rozbicie tokenu | minimalna |
| Błąd, ostrzeżenie, instrukcja | stan, przyczyna, następny krok | obwinianie, zatarty sprawca, utrata warunku | niska |
| Onboarding i pomoc | kolejność, przewidywalność | ściana tekstu lub pusty metadyskurs | niska |
| Strona produktu i marketing | obietnica, marka, konkret | pompatyczność, sztuczne ocieplenie, nowy claim | średnia; claimy chronione |
| Artykuł informacyjny i poradnik | argument, rytm, użyteczność | redundancja, ogólniki, zamknięcie pod linijkę | średnia |
| Dokumentacja i raport ekspercki | struktura, terminy, dowody | utrata precyzji w imię lekkości | niska–średnia |
| Tekst naukowy i popularnonaukowy | metoda, zastrzeżenia, wyjaśnienie | wzmocnienie wniosku, spłaszczenie modalności | niska |
| E-mail i komunikacja organizacyjna | konkretna akcja, relacja | nadformalizacja, sztuczna serdeczność | średnia |
| Dialog | odrębny idiolekt i podtekst | ujednolicenie postaci | minimalna |
| Narracja, esej i literatura | perspektywa, rytm, stylizacja | wygładzenie celowej dziwności | minimalna |
| Książka | ciągłość wszystkich powyższych | dryf głosu, encji, czasu i motywów | partiami, z pamięcią globalną |
| Prawo i medycyna | zakres, termin, obowiązek, ryzyko | szkoda merytoryczna | sugestia + ekspert |

## Kalibracja

Zapisz krótko:

- odbiorcę i jego wiedzę;
- cel czytelnika po lekturze;
- kanał i ograniczenia, w tym długość UI;
- poziom formalności i relację między nadawcą a odbiorcą;
- terminy obowiązkowe i warianty zakazane lokalnym glosariuszem;
- próbkę referencyjną, jeśli trzeba zachować indywidualny głos;
- oczekiwany poziom ingerencji.

Jeśli brakuje próbki autora, chroń cechy widoczne w wejściu; nie dopowiadaj idiolektu. Jeśli brak gatunku naprawdę uniemożliwia decyzję, wybierz `ESCALATE`, nie neutralizację.

## Prosty język

Upraszczaj kolejność, składnię i instrukcję działania, gdy pomaga odbiorcy. Zachowuj termin, którego odbiorca potrzebuje do wykonania zadania, rozmowy ze specjalistą lub dalszego wyszukiwania. Nie stosuj prostego języka mechanicznie do literatury, prawa ani tekstu naukowego.

## Sygnały wymagające kontekstu

- Bezpośredni zwrot do odbiorcy jest dobry w instrukcji lub onboardingu, ale może być sztuczny w raporcie.
- Ciepły ton jest dobry w relacyjnej komunikacji, ale źle działa jako automatyczna warstwa nad błędem lub odmową.
- Symetria i listy pomagają skanować UI oraz procedury; przeszkadzają dopiero wtedy, gdy mechanicznie dublują treść.
- Formalność nie jest problemem w nauce, prawie i dokumentacji. Problemem jest niedopasowanie formalności do odbiorcy.
- Powtórzenie może wspierać bezpieczeństwo, pamięć, rytm lub głos. Usuwaj tylko powtórzenie bez funkcji.
