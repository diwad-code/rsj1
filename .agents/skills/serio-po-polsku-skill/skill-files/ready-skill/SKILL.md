---
name: serio-po-polsku
description: Audytuj, poprawiaj i redaguj polski tekst widoczny dla człowieka, w tym mikrocopy i frontend/i18n, artykuły, raporty, dokumentację, dialog, prozę oraz książki; usuwaj rzeczywistą schematyczność, kalki i nienaturalny styl tylko w kontekście, zachowując sens, fakty, głos autora, rejestr i elementy techniczne.
---

# Serio po polsku

Redaguj współczesną polszczyznę bez zgadywania autorstwa i bez polowania na zakazane słowa. Przyjmij brak zmiany jako pełnoprawny, często najlepszy wynik.

## Ustal tryb i zakres

1. Rozpoznaj intencję użytkownika:
   - `AUDIT` — wskaż problemy i dobre fragmenty; nie zapisuj zmian.
   - `SUGGEST` — pokaż warianty i uzasadnienia; nie zapisuj bez zatwierdzenia.
   - `EDIT` — wprowadź jednoznacznie zlecone zmiany w odkrywalnym zakresie i zweryfikuj artefakt.
2. Ustal pliki lub fragmenty, odbiorcę, gatunek, kanał, oczekiwany rejestr, poziom ingerencji i ograniczenia. Nie diagnozuj stylu bez gatunku i odbiorcy. Jeśli można je wiarygodnie wywnioskować z artefaktu, zrób to i zapisz założenie.
3. Znajdź lokalną władzę: `AGENTS.md`, instrukcje repozytorium, style guide, glosariusz, system i18n, schemat danych, limity UI, źródło prawdy i workflow plików generowanych. Lokalna, aktualna instrukcja autora ma pierwszeństwo.

## Wybierz potrzebne zasoby

- Zawsze stosuj [politykę dowodową](references/evidence-policy.md) i [kontrakt zachowania](references/preservation-contract.md).
- Przy diagnozie stylu przeczytaj [katalog wzorców](references/polish-patterns.md).
- Przy kalibracji tonu lub gatunku przeczytaj [rejestry i gatunki](references/registers-and-genres.md).
- Przy pracy w repozytorium przeczytaj [odkrywanie tekstu użytkowego](references/repository-text-discovery.md). Użyj `scripts/inventory_user_visible_text.py`, gdy inwentarz wielu plików byłby ręczny lub podatny na pominięcia.
- Przy książce albo materiale większym niż okno kontekstowe przeczytaj [workflow długiej formy](references/long-form-workflow.md).
- Przed raportem końcowym i przy projektowaniu testów przeczytaj [ewaluację](references/evaluation.md). Użyj `scripts/check_protected_tokens.py` dla wersji przed/po oraz `scripts/run_evals.py` do kontroli kontraktu skilla.

## Przeprowadź redakcję

1. **Zbuduj inwentarz.** Analizuj tylko polski tekst przeznaczony do odczytania przez człowieka. Klasyfikuj kandydatów jako `CONFIRMED_VISIBLE`, `LIKELY_VISIBLE`, `UNCERTAIN` albo `NOT_USER_VISIBLE`. Nie utożsamiaj każdego stringu z mikrocopy.
2. **Zamroź niezmienniki.** Wypisz znaczenie, fakty, modalność, negację, warunki, głos, terminy, cytaty, liczby, odsyłacze, placeholdery, ICU, markup, kod, klucze i inne elementy chronione.
3. **Skalibruj styl.** Ustal cel, odbiorcę, rejestr, ton, terminologię i — jeśli istnieje — próbkę autora. Nie twórz głosu autora z wyobraźni.
4. **Diagnozuj konfiguracje cech.** Oceniaj funkcję w zdaniu, akapicie i gatunku. Nie wydawaj wyroku na podstawie pojedynczego słowa, myślnika, dwukropka, trójpodziału, nagłówka, długości zdania ani konstrukcji „to nie X, to Y”. Podaj pewność i możliwy kontrprzykład.
5. **Wybierz decyzję.** Dla każdego istotnego miejsca wybierz `CHANGE`, `SUGGEST`, `LEAVE-AS-IS` albo `ESCALATE`. Wysokie ryzyko zmiany sensu, niepewna widoczność, cytat, stylizacja oraz treść prawna lub medyczna wymagają sugestii albo eskalacji, nie ślepej edycji.
6. **Redaguj minimalnie skutecznie.** Usuń tylko tę cechę, która przeszkadza w funkcji tekstu. Zachowaj strukturę, jeśli pomaga czytelnikowi. Nie zwiększaj wariancji losowymi synonimami i nie dopisuj faktów dla „konkretności”.
7. **Sprawdź lokalnie.** Porównaj twierdzenia, fakty, liczby, negację, modalność, aspekt, referencje, gramatykę, idiomatyczność, głos i chronione tokeny.
8. **Sprawdź globalnie.** Porównaj terminologię, rejestr, rytm, odwołania, kolejność, chronologię, encje i strukturę całego zakresu.
9. **Uruchom test artefaktu.** Dobierz parser, lint, typy, build, test i18n, render, podgląd dokumentu albo inną kontrolę proporcjonalną do ryzyka. Nie uznawaj samego zapisu pliku za dowód poprawności.
10. **Zdaj raport.** Podaj tryb, zakres, decyzje `LEAVE-AS-IS`, zmienione pliki, ważne uzasadnienia, nierozstrzygnięte ryzyka oraz dokładne testy i wyniki.

## Zatrzymaj konkretną zmianę

Nie wykonuj jej, gdy wymaga zgadnięcia faktu, intencji, terminu lub sprawcy; zmienia liczbę, warunek, negację, modalność, aspekt albo stopień pewności; narusza element chroniony; dotyczy `UNCERTAIN`; omija autorytatywne źródło pliku generowanego; przekracza limit UI; albo nie da się potwierdzić poprawności artefaktu. Kontynuuj pozostałe bezpieczne miejsca, chyba że konflikt podważa cały zakres.

## Nie optymalizuj pod detektory

Nie obiecuj niewykrywalności i nie używaj detektora AI jako miary jakości, naturalności ani sukcesu. Oddziel pytania: „czy tekst jest dobry?”, „kto go napisał?” i „czy należy go zmienić?”.
