# Event JSON runtime — HERALD

## Płaski event

```json
{
  "id": "example_event_id",
  "title": "Tytuł",
  "motyw": "motyw_sceniczny",
  "type": "weighted",
  "weight": 5,
  "act": ["II"],
  "requirements": {
    "flags": ["some_required_flag"],
    "min_act": "II"
  },
  "description": "Opis sceny w II osobie, czasie teraźniejszym.",
  "inner_voices": [
    {
      "skill": "NAUKA",
      "min_value": 4,
      "text": "Dane nie muszą być pocieszające, żeby były prawdziwe."
    }
  ],
  "choices": [
    {
      "id": "choice_id",
      "text": "Podejmij decyzję",
      "effects": [
        { "type": "flag", "value": "example_event_id_done" }
      ]
    }
  ]
}
```

## Pola, których nie gub

Top-level spotykane w runtime:

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

Choice fields:

- `availability`
- `effects`
- `id`
- `is_blue`
- `min_morale`
- `min_skill_value`
- `requires_skill`
- `text`

## Efekty

Używaj istniejących effect types. Najczęstsze:

```json
{ "type": "flag", "value": "some_flag" }
{ "type": "voice", "target": "EMPATIA", "delta": 1 }
{ "type": "relationship", "target": "naomi", "delta": 1, "label": "..." }
{ "type": "resource", "target": "parts", "delta": -1, "label": "..." }
{ "type": "tomasz_stat", "stat": "fatigue", "delta": 1, "label": "..." }
{ "type": "crew_stat", "crew_id": "piotr", "stat": "morale", "delta": -1, "label": "..." }
{ "type": "time", "minutes": 120 }
```

Przed dodaniem nowego typu efektu sprawdź `EventEngine`.

## Blue check

Blue choice wymaga zwykle:

```json
{
  "is_blue": true,
  "requires_skill": "EMPATIA",
  "min_skill_value": 8
}
```

Nie zmieniaj blue choices w redakcji tekstu, jeśli zadanie nie dotyczy mechaniki.

## Zasada zamknięcia

Każdy event powinien ustawiać flagę zakończenia. W obecnych danych często działa
para:

- `*_done`
- `*_followup_done`

Przed wymyśleniem nazwy flagi sprawdź istniejące konwencje w sąsiednich eventach.
