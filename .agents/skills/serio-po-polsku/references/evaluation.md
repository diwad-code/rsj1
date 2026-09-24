# Ewaluacja

Oceniaj osobno jakość językową, zgodność semantyczną, głos, gatunek i integralność techniczną. Nie łącz ich w jeden „human score” i nie używaj detektora AI jako bramki.

## Decyzje kontraktowe

- `CHANGE`: problem jest wystarczająco pewny, zakres i źródło prawdy znane, a edycja bezpieczna.
- `SUGGEST`: istnieje prawdopodobna poprawa, ale wybór zależy od autora, eksperta lub preferencji stylu.
- `LEAVE-AS-IS`: tekst jest dobry albo cecha pełni funkcję; podaj powód.
- `ESCALATE`: niepewna widoczność, sprzeczne niezmienniki, brak kontekstu, wysokie ryzyko lub plik generowany bez wskazanego źródła.

## Wymiary oceny

1. Zachowanie twierdzeń, faktów, encji, liczb, dat, jednostek i terminów.
2. Zachowanie negacji, modalności, aspektu, zakresu i odpowiedzialności.
3. Gramatyczność i idiomatyczność polska.
4. Dopasowanie do gatunku, odbiorcy, kanału i głosu.
5. Redukcja rzeczywistej schematyczności bez nieuzasadnionej zmiany.
6. Zdolność pozostawienia dobrego tekstu bez zmian.
7. Spójność lokalna i globalna.
8. Integralność techniczna: parser, placeholdery, warianty, build, limit i render.
9. Ślepa ocena rodzimego użytkownika; ekspert dziedzinowy dla prawa, medycyny, nauki i kodu.

## Testy

| ID | Wynik pozytywny | Porażka |
|---|---|---|
| T1 no-op | dobry tekst pozostaje bez zmian | niepotrzebna redakcja lub pogorszenie |
| T2 semantyka | wszystkie krytyczne twierdzenia, liczby, negacje i modalność zachowane | dodany/utracony fakt albo wzmocniony wniosek |
| T3 głos | autor, narrator i postacie zachowują odrębność | neutralizacja lub ujednolicenie |
| T4 gatunek | brak szkody w tekstach chronionych | reguła szkodzi prawu, medycynie lub literaturze |
| T5 tokeny | placeholdery, ICU, tagi, linki, klucze i kod zachowane | różnica albo błąd parsera |
| T6 widoczność | zmieniono tylko potwierdzony tekst użytkowy | edycja `UNCERTAIN` lub technicznego stringu |
| T7 długa forma | brak dryfu encji, terminów, czasu i perspektywy | konflikt lokalny lub odległy |
| T8 cel | wynik detektora nie steruje decyzją | optymalizacja pod klasyfikator |
| T9 norma | reguła sprawdzona w aktualnym źródle RJP | poleganie na nieaktualnej pamięci |

## Deterministyczna kontrola pakietu

Uruchom:

`python scripts/run_evals.py evals/cases.json`

Runner sprawdza strukturę przypadków, pokrycie decyzji i scenariuszy oraz zachowanie zadeklarowanych chronionych tokenów w ilustracyjnych propozycjach. Nie udaje oceny naturalności. Przypadki jakościowe są kontraktem dla agenta i recenzenta.

## Ocena jakościowa

Porównuj przed/po w ślepej ocenie parami. Poproś rodzimych użytkowników o osobne oceny: poprawność, naturalność, jasność, adekwatność i zachowanie głosu. Zapisz rozbieżności, nie tylko średnią. Dla treści specjalistycznej dodaj eksperta.

## Kryterium przeprojektowania

Jeśli skill pogarsza dobre teksty, traci krytyczne niezmienniki albo szkodzi co najmniej dwóm chronionym gatunkom, przeprojektuj reguły. Nie obniżaj progu po zobaczeniu wyniku. Publikuj także wynik zerowy: hipoteza, że usuwanie rzekomych markerów poprawia odbiór, nie została dotąd potwierdzona.
