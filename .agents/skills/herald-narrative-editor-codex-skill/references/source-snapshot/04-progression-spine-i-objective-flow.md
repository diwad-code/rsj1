# Progression spine i objective flow

## Co trzeba zachować

HERALD nie jest luźnym zbiorem eventów. Gra ma aktualny kręgosłup progresji od prologu do końcowego aftercare.

Źródła:

- `data-mirror/progression/room_entry_rules.json`
- `source-mirror/godot-runtime-reference/scripts/systems/ObjectiveResolver.gd`
- `source-mirror/godot-runtime-reference/scripts/autoloads/GameManager.gd`
- `manifests/event-index.csv`

## Pokoje

### Prolog

- `earthside_quarters`
- `earthside_terminal`
- `boarding_trap`
- `boarding_sluice`
- `arrival_passage`

### Statek Thales

- `bridge`
- `corridors`
- `right_corridor`
- `observation_deck`
- `mess_hall`
- `lab`
- `comms`
- `medbay`
- `hydroponics`
- `quarters`
- `engine_room`
- `torpor_chamber`

Web runtime po K20 ma już jawne rozróżnienie:

- `corridors` = lewe skrzydło (`observation_deck`, `mess_hall`, `lab`, `comms`, `medbay`);
- `right_corridor` = prawe skrzydło (`hydroponics`, `quarters`, `engine_room`, `torpor_chamber`);
- `bridge` ma dwa osobne wyjścia: do lewego i prawego skrzydła.

Authored progression zachowuje historyczne ID `corridors_*`, ale `ProgressionEngine` traktuje oba korytarze jako wspólny corridor spine tam, gdzie wydarzenia mają dotyczyć ogólnego przejścia po statku.

## Docelowe systemy webowe

### `RoomGraph`

Trzyma sąsiedztwo pokoi, wyjścia i display names.

Minimalny kontrakt:

```ts
type RoomId =
  | "earthside_quarters"
  | "earthside_terminal"
  | "boarding_trap"
  | "boarding_sluice"
  | "arrival_passage"
  | "bridge"
  | "corridors"
  | "right_corridor"
  | "observation_deck"
  | "mess_hall"
  | "lab"
  | "comms"
  | "medbay"
  | "hydroponics"
  | "quarters"
  | "engine_room"
  | "torpor_chamber";
```

### `ProgressionEngine`

Odpowiada za:

- eventy przy wejściu do pokoju,
- sekwencje korytarzy,
- sekwencje pokojowe,
- optional room entry,
- group event spawn requests,
- bramki aktów i torporu.

### `ObjectiveResolver`

Powinien zostać przepisany z GDScript do danych albo TypeScriptu. Rekomendacja: zacząć od portu 1:1 do TS, potem wyodrębnić reguły do JSON.

Objective snapshot:

```ts
interface ObjectiveSnapshot {
  text: string;
  roomId: RoomId | "";
}
```

HUD pokazuje:

- aktualny cel,
- kierunek względem obecnego pokoju,
- toast tylko gdy cel naprawdę się zmienił.

## Krytyczne bramki fabularne

Implementacja musi zachować:

- pełny grywalny prolog przed `echo_first_morning`,
- onboarding Bridge -> ECHO -> Kezia -> Corridors,
- pierwsze wejścia do kluczowych pomieszczeń,
- `Earth Out of View`,
- Park/Mensah jako bramka Aktu II,
- torpor jako świadoma decyzja gracza,
- release Act III/IV/V przez torpor i flagi źródłowe,
- Limes discovery sequence,
- final message prompt,
- cztery epilogi,
- aftercare po finale.

## Group event spawns

Aktualny runtime ma `group_event_spawns`, m.in. dla eventów tłumu/tarcia w korytarzach. Webowa wersja powinna emitować intencję:

```ts
eventBus.emit(Events.GROUP_EVENT_SPAWN_REQUESTED, { npcIds, eventId });
```

Renderer decyduje tylko, jak pokazać grupę, a nie czy event jest dostępny.

## Wayfinding

Wayfinding ma być cichy i funkcjonalny:

- `Kierunek: Mostek.`
- `Jesteś na miejscu` nie musi być stale widoczne, jeśli UI jest już czytelne.
- Drzwi muszą mieć prompt z nazwą docelowego pomieszczenia.

Nie wolno zastąpić progression spine otwartą eksploracją bez celów. Gracz ma chodzić po statku, ale gra prowadzi go przez napięcia, nie przez checklistę questów.
