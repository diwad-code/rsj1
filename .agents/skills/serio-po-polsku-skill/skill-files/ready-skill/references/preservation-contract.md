# Kontrakt zachowania

Przed edycją zapisz niezmienniki. Po edycji porównaj je osobno; naturalność nie kompensuje utraty sensu.

## Semantyka

Chroń:

- fakty, twierdzenia, wnioski i relacje przyczynowe;
- negację, warunki, wyjątki, zakres kwantyfikacji i zależności logiczne;
- modalność i siłę pewności: `może`, `prawdopodobnie`, `powinien`, `musi` nie są równoważne;
- liczby, daty, godziny, jednostki, waluty, zakresy, procenty i wersje;
- relacje czasowe, kolejność kroków, odwołania i kompletność list stanowiących kontrakt.

Przywracaj sprawcę tylko wtedy, gdy wynika z kontekstu. Nie konkretyzuj przez wymyślenie liczby, miejsca, przykładu lub motywacji.

## Głos i gatunek

Chroń:

- punkt widzenia, osobę, czas i dystans narracyjny;
- formalność, ton, humor, ironię, emocję i tempo;
- idiolekt, regionalizm, archaizację, slang i celową niezręczność postaci;
- terminologię zawodową, prawną, medyczną i naukową;
- celową repetycję, paralelizm, antytezę i inną retorykę, jeśli pełnią funkcję.

Nie ujednolicaj różnych głosów do neutralnego stylu redaktora. Nie twórz „głosu autora” bez próbki lub jawnej karty stylu.

## Elementy dosłowne i techniczne

Chroń dokładnie:

- cytaty i lokalizatory; bibliografię, DOI i przypisy;
- tytuły, nazwy własne, marki, nazwy produktów i terminy kontrolowane;
- URL-e, adresy e-mail, ścieżki i identyfikatory;
- `{name}`, `%s`, `%(name)s`, `{{value}}`, `${value}`, format specifiers oraz wszystkie gałęzie ICU/MessageFormat `plural`, `select`, `selectordinal`, offsety i fallback `other`;
- kod inline i blokowy, nazwy symboli, klucze i konfigurację;
- HTML, Markdown, XML, JSX/MDX, encje, escape'y, flagi PO, kodowanie i BOM;
- limity długości, wymagane znaki, kolejność oraz semantykę ARIA.

Traktuj komunikat ICU jako jedną strukturę. Wolno redagować tekst każdej gałęzi, ale nie wolno zgubić zmiennej, selektora, kategorii ani nawiasu.

## Test przed/po

1. Wyodrębnij twierdzenia i relacje z wersji przed i po.
2. Porównaj liczby, daty, jednostki, nazwy i odsyłacze.
3. Porównaj negację, modalność, aspekt, odpowiedzialność i warunki.
4. Porównaj głos, rejestr, perspektywę i celową retorykę.
5. Uruchom `scripts/check_protected_tokens.py BEFORE AFTER` dla plików tekstowych.
6. Uruchom parser, test i18n, build lub render właściwy dla artefaktu.

Kod niezerowy skryptu, błąd parsera albo różnica niezmiennika blokują daną zmianę. Nie zatwierdzaj jej jako „wystarczająco dobrej”.

## Materiały wysokiego ryzyka

Dla cytatów nie redaguj treści. Dla prawa i medycyny zachowaj terminologię i przedstaw sugestię do weryfikacji eksperckiej; nie wprowadzaj automatycznie parafrazy zmieniającej zakres obowiązku, uprawnienia, rozpoznanie, dawkę lub ryzyko.
