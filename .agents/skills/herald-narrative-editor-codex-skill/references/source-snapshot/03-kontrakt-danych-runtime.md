# Kontrakt danych runtime

## Zasada główna

Dane z `data-mirror/` są treścią do portu 1:1. Implementer może zmienić format wewnętrzny TypeScript, ale musi zachować znaczenie każdego pola, eventu, wyboru, flagi i efektu.

## Eventy narracyjne

Źródło: `data-mirror/events/**/*.json`.

Aktualne pola top-level wykryte w manifestach:

- `act`
- `choices`
- `crew_id`
- `description`
- `id`
- `inner_voices`
- `motyw`
- `nodes`
- `requirements`
- `start_node`
- `timeout_choice_id`
- `timeout_seconds`
- `title`
- `type`
- `variants`
- `weight`

### Event płaski

Event płaski ma zwykle:

- `id`
- `title`
- `description`
- `requirements`
- `inner_voices`
- `choices`

UI pokazuje tytuł, opis, aktywne głosy wewnętrzne i wybory.

### Event grafowy

Event grafowy ma:

- `nodes`
- `start_node`
- często `timeout_seconds` i `timeout_choice_id`

`EventEngine` powinien przechowywać aktywny `eventId` i `nodeId`. Wybór może:

- przejść do kolejnego node'a,
- zakończyć event,
- uruchomić check,
- zastosować efekty.

### Requirements

Wykryte klucze:

- `flags`
- `min_act`

Kontrakt:

- `flags` oznacza wymagane flagi w `GameState.flags`,
- `min_act` blokuje event do odpowiedniego aktu,
- brak requirements oznacza brak dodatkowej blokady.

## Choices

Wykryte pola wyborów:

- `availability`
- `effects`
- `id`
- `is_blue`
- `min_morale`
- `min_skill_value`
- `requires_skill`
- `text`

Wybory nie mogą być tekstowo przerabiane tak, by zgubić checki, niebieskie opcje albo stawkę decyzji.

## Checki i kość

Obecna mechanika:

```text
skill_value + modifier_total + d6 >= difficulty
```

Kontrakt UI:

- gracz widzi typ checka,
- widzi skill/głos,
- widzi próg,
- widzi wymagany wynik na k6,
- widzi wynik rzutu,
- w panelu wyniku widzi dwie wizualne strony starcia: próg Entropii jako kość
  oraz swój wynik jako kość, bez samotnej cyfry udającej drugi rzut,
- widzi `SUKCES` albo `PORAŻKA`,
- wynik zapisuje się w `choiceLog`.

Checki nie randomizują zakończeń. Mogą zmieniać koszt, ton, relację, późniejszy dostęp albo komentarz.

## Efekty wyborów

Wykryte typy efektów:

- `crew_stat`
- `fatigue`
- `flag`
- `health`
- `morale`
- `relationship`
- `resource`
- `tomasz_stat`
- `voice`

Implementacja TS musi mieć dispatcher efektów z walidacją typu i bez cichego ignorowania nieznanych efektów.

Minimalne zachowanie:

- `flag` ustawia flagę w `GameState.flags`,
- `resource` zmienia zasób i emituje `resource:changed`,
- `voice` zmienia wartość głosu i emituje `voice:changed`,
- `relationship` zmienia relację i emituje `relationship:changed`,
- `crew_stat` zmienia runtime stat członka załogi,
- `tomasz_stat`, `fatigue`, `health`, `morale` aktualizują Tomasza.

Legacy authored alias:

- pojedyncze authored beaty używają jeszcze `tomasz_stat.stat = "stress"`; web runtime normalizuje ten alias do `fatigue`, zamiast cicho ignorować efekt albo wybuchać na nieznanym statie.

## Ambient

Źródło: `data-mirror/ambient/`.

Typy:

- `banter`
- `observations`
- `inspectables`

Aktualne liczby:

- banter: `77` wpisów,
- observations: `74` wpisy,
- inspectables: `38` obiektów i `124` wpisy.

Aktualizacja 2026-06-18 po Slice H2.2: `comms_queue_panel` ma akt IV wpis `comms_queue_panel_a4_after_limes` bramkowany `bridge_limes_orbit_afterimage_followup_done` (inspectables `121`→`122`, ambient total `272`→`273`).

Aktualizacja 2026-06-18 po Slice H2.3: `observation_deck_entry_panel` ma akt IV wpis `observation_deck_entry_panel_a4_after_limes` bramkowany `bridge_limes_orbit_afterimage_followup_done` (inspectables `122`→`123`, ambient total `273`→`274`).

Aktualizacja 2026-06-18 po Slice H3: `observation_deck_viewfinder` ma akt I payoff `observation_deck_viewfinder_act1_after_earth_out_of_view` bramkowany `earth_out_of_view_followup_done` (inspectable objects `37`→`38`, inspectables `123`→`124`, ambient total `274`→`275`).

Aktualizacja 2026-06-18 po Slice D4: sześć wpisów `banter` w puli `act5_mess_hall_group_after_finale` jest bramkowanych flagami `final_message_epilogue_followup_ready` + `mess_hall_crew_after_final_message_followup_done`. Te wpisy używają istniejącego selektora specyficzności, bez nowego pola schematu i bez osobnego multi-person runtime surface.

Aktualizacja 2026-06-18 po Slice H2.1: `data-mirror/ambient/banter/echo.json` ma dodatkowy wpis `echo_banter_act4_sentence_gap_after_limes`, bramkowany `bridge_limes_orbit_afterimage_followup_done`. Wpis wzmacnia gęstość Aktu IV po Limes i nadal używa istniejącego selektora `required_flags` + `min_act/max_act`.

Ambient selector musi obsługiwać:

- `min_act` / `max_act`,
- `repeat_min` / `repeat_max`,
- `min_morale` / `max_morale`,
- `voice` / `min_voice_value`,
- `required_flags`,
- `forbidden_flags`,
- `cooldown_minutes`,
- wybór najbardziej specyficznego wpisu.

Źródło zachowania: `source-mirror/godot-runtime-reference/scripts/systems/AmbientInteractionSystem.gd`.

## Crew i voices

Źródła:

- `data-mirror/crew/crew.json`
- `data-mirror/voices/voices.json`

Głosy Tomasza:

- `ZARZĄDZANIE`
- `EMPATIA`
- `NAUKA`
- `PRZETRWANIE`
- `PAMIĘĆ`
- `CISZA`

`PAMIĘĆ` może rosnąć ponad zwykły limit; obecny limit referencyjny to `12`. Pozostałe głosy zwykle mieszczą się w `1-10`.

## Progression data

Źródło: `data-mirror/progression/room_entry_rules.json`.

Top-level keys:

- `simple_room_entry_rules`
- `corridors_event_sequence`
- `room_entry_sequences`
- `group_event_spawns`

Ten plik jest obowiązkowy dla pierwszej implementacji, bo przenosi wiele eventów z ręcznych helperów do danych.

## Audio i preferencje powłoki

Audio nie zapisuje się do `GameState`. To osobny kontrakt systemowy:

- `audio:cue` — payload `{ cueId, source, volume? }`; służy do lekkich cue systemowych/UI bez importu audio do logiki gry,
- `audio:mute-requested` — payload `{ muted, source? }`; intencja z UI lub bootstrapu,
- `audio:mute-changed` — payload `{ muted, previousMuted, source }`; potwierdzona zmiana stanu.

Trwałość:

- `SaveStore` przechowuje preferencję mute w osobnym kluczu localStorage, niezależnie od resume snapshotu `GameState`,
- preferencja mute ma przetrwać restart runtime i reload strony,
- ustawienia tekstowe/czcionkowe/reduced-motion są od M1 przechowywane w osobnym kluczu `herald:web:display`, niezależnym od resume snapshotu,
- M2 nie zmienia schematu `GameState`: pojedynczy slot `herald:web:save` jest tylko bezpiecznie odczytywany do podsumowania akt/dzień/lokalizacja; rzeczywiste `continue()` ładuje snapshot dopiero po akcji gracza.
