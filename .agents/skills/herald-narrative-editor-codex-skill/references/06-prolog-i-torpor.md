# Prolog tekstowy i torpor — redesign

## Decyzja

Grywalny prolog ziemski / wejście na statek zostaje wyłączony z aktywnego startu.
Nowa gra pokazuje tekstowy prolog, a pierwsza interaktywna scena zaczyna się
od pierwszego przebudzenia Tomasza po torporze.

## Nowy flow

```text
Nowa gra
-> tekstowy prolog
-> pierwsze przebudzenie po torporze
-> raport ECHO
-> Act I ship loop
```

## Stare pokoje prologu

Mogą zostać w typach i danych jako archive/reference, jeśli usunięcie grozi
cascade testów:

- `earthside_quarters`
- `earthside_terminal`
- `boarding_trap`
- `boarding_sluice`
- `arrival_passage`

Aktywny objective flow nie powinien już wymagać ich przechodzenia.

## Pierwszy objective

```text
NOWY CEL: Potwierdź przebudzenie i odbierz pierwszy raport ECHO
```

## Torpor

Torpor jest świadomą decyzją gracza, bramką progresji i skokiem czasu.

Bazowy cykl:

```text
90 dni
```

Każdy torpor powinien:

- zwiększyć `torporCyclesCompleted`;
- ustawić flagi cyklu;
- przesunąć czas misji;
- wrócić domyślnie na Bridge albo zgodnie z repo;
- odświeżyć objective;
- nie pozwolić ominąć authored scen.

## Torpor obowiązkowy

Pojawia się, gdy etap fabuły jest zamknięty i dalszy postęp wymaga upływu czasu.

Przykłady:

- koniec pierwszego cyklu Act I;
- przed wejściem w kolejne akty;
- po drugim obiegu odkrycia Limes przed Act V;
- po finalnej wiadomości / wejście w powrót.

## Torpor opcjonalny

Możliwy tylko, jeśli nie blokuje mainline i nie omija scen.

Komunikaty blokady:

```text
Nie teraz. Cykl nie jest zamknięty.
Nie teraz. Kezia czeka na mostku.
Nie teraz. ECHO ma nieodebrany pakiet z Ziemi.
Nie teraz. Recykler wody jest poza progiem torporu.
```

## Flagi — propozycje

Sprawdź repo przed użyciem.

```text
text_prologue_seen
first_wake_after_torpor_done
act1_first_cycle_ready_for_torpor
act1_first_torpor_done
torpor_cycle_01_done
```

## Testy

- Nowa gra pokazuje tekstowy prolog.
- Po prologu start następuje na statku.
- Earthside prologue nie jest wymagany w full playthrough.
- Torpor blokuje się przed zamknięciem cyklu.
- Torpor przesuwa czas o 90 dni.
- Torpor ustawia flagi i zwiększa licznik.
- Full playthrough dochodzi do czterech zakończeń.
