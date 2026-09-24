# Odkrywanie tekstu widocznego dla użytkownika

Wyszukiwanie daje kandydatów, nie dowód widoczności. Najpierw ustal źródło prawdy i przepływ do interfejsu, dokumentu, e-maila lub innego odbiorcy.

## Klasy

- `CONFIRMED_VISIBLE`: tekst jest bezpośrednio renderowany, wyświetlany, wysyłany odbiorcy albo stanowi treść dokumentu.
- `LIKELY_VISIBLE`: kontekst silnie wskazuje na użycie użytkowe, lecz warto potwierdzić wywołanie lub render.
- `UNCERTAIN`: string może trafić do odbiorcy, ale ścieżka nie jest znana. Nie edytuj automatycznie; prześledź przepływ albo zgłoś.
- `NOT_USER_VISIBLE`: identyfikator, kod, klucz, konfiguracja, komentarz techniczny, fixture, snapshot, dane testowe lub treść wyłącznie wewnętrzna.

Log nie jest automatycznie niewidoczny: sprawdź, czy czyta go użytkownik końcowy, administrator czy tylko programista.

## Inwentaryzacja

1. Przeczytaj lokalne instrukcje i mapę architektury.
2. Wskaż formaty i systemy treści: komponenty, szablony, i18n, CMS, e-maile, backend, Markdown, dokumenty.
3. Ustal pliki generowane i ich autorytatywne źródła.
4. Uruchom, jeśli potrzebne:

   `python scripts/inventory_user_visible_text.py PATH [PATH ...] --format text`

5. Dla każdego kandydata zapisz klasę, pewność, powód i źródło prawdy.
6. Potwierdź `LIKELY_VISIBLE` przez użycie, import, trasę, test runtime albo render przed masową edycją.

Skrypt jest heurystyczny i read-only. Wynik `CONFIRMED_VISIBLE` oznacza silny sygnał składniowy, nie formalny dowód działania aplikacji.

## Formatowe punkty uwagi

- **HTML i szablony:** rozróżnij tekst węzła od nazwy atrybutu; sprawdź `alt`, `title`, `placeholder`, `aria-*` i warunki.
- **JSX/TSX, Vue, Svelte:** prześledź literały, wyrażenia, interpolacje, propsy i komponenty tłumaczeń. Nie zmieniaj nazw symboli.
- **Markdown/MDX:** chroń frontmatter, kod, link destinations, komponenty i importy; treść prose jest zwykle widoczna.
- **JSON/YAML/PO/i18n:** zmieniaj wartość, nie klucz; kontroluj wszystkie locale, pluralizację, kontekst i flagi PO.
- **Backend, e-mail, powiadomienie:** odbiorca może być końcowy mimo miejsca w kodzie. Sprawdź wywołanie.
- **CMS i pliki danych:** ustal, czy repo jest źródłem, eksportem czy cache.
- **Tekst dynamiczny:** sprawdź każdą gałąź, konkatenację, kolejność i zachowanie spacji.
- **Testy, fixtures, snapshoty:** domyślnie `NOT_USER_VISIBLE`, ale mogą odzwierciedlać kontrakt UI; aktualizuj je dopiero po zmianie źródła i zgodnie z workflow.
- **Pliki generowane:** edytuj źródło, zregeneruj pochodną i zweryfikuj diff. Nie poprawiaj obu niezależnie.

## Edycja

Edytuj tylko `CONFIRMED_VISIBLE` oraz potwierdzone `LIKELY_VISIBLE`. Dla treści mieszanej zamroź tokeny i zmieniaj wyłącznie segment językowy. Dla `UNCERTAIN` wybierz `ESCALATE` lub kontynuuj śledzenie. Dla `NOT_USER_VISIBLE` nie wykonuj redakcji językowej.

Po zmianie uruchom parser, lint, typy, build, test lokalizacji i runtime/render odpowiedni dla wszystkich zmienionych stanów oraz szerokości. Wyszukiwanie tekstowe nie zastępuje parsera, gdy składnia zależy od interpolacji, escape'ów lub komponentów.
