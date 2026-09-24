# HERALD — workflow dla Codexa

## Najpierw ustal źródła

1. Aktualny handoff webowy.
2. Aktualne docs w `web-migracja/docs/`.
3. `data-mirror/**` jako authored content.
4. `public/content/**` jako synced runtime content.
5. Stare Godot źródła wyłącznie porównawczo.

## Nie zgaduj

Gdy użytkownik prosi o event, znajdź istniejące eventy podobnego typu:

```bash
grep -R "\"motyw\": \"pozegnalny_obchod\"" -n web-migracja/data-mirror/events
grep -R "\"crew_id\": \"naomi\"" -n web-migracja/data-mirror
grep -R "anna_message" -n web-migracja/data-mirror web-migracja/herald-web/src
```

## Minimalny tryb implementacji

1. Inventory.
2. Mała zmiana danych/kodu.
3. Content sync.
4. Focused test.
5. Build.
6. Handoff.

## Główne ryzyka

- zgubienie flagi wymaganej przez objective flow;
- dodanie eventu bez manifestu/content sync;
- przepisanie dialogu tak, że postacie brzmią jednakowo;
- zrobienie z ECHO narratora emocjonalnego;
- potraktowanie CISZY jak opcji „nic nie rób”;
- usunięcie starego prologu z danych zamiast odłączenia go od active progression,
  gdy testy wciąż go importują.
