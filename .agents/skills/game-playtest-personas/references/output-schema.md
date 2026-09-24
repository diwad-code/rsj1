# Per-persona output contract

Emit exactly one JSON object with the keys below. Save only that object in `reports/pNN-name.json`. A short first-person narrative may follow in chat or a sibling Markdown file, but it must not add claims absent from the JSON.

```json
{
  "persona_id": "p04",
  "persona_name": "Diego",
  "artifact": "tutorial description v0.3",
  "input_fidelity": "description",
  "session_was": "imagined",
  "first_impression_score": 5,
  "keep_play_score": 3,
  "emotional_arc": ["interested", "impatient"],
  "friction_points": [
    {
      "where": "tutorial step 2",
      "what": "the description delays the first action",
      "severity": "major",
      "why_it_mattered_to_me": "the persona has a stated low tolerance for setup",
      "suggestion": "offer a guided action earlier"
    }
  ],
  "delights": [
    {"where": "hint option", "what": "help is available without blocking progress"}
  ],
  "quit_trigger": {
    "fired": false,
    "what": "",
    "at": ""
  },
  "monetization": {
    "relevant": false,
    "would_pay": "no",
    "when": "",
    "amount": "",
    "felt_unfair": ""
  },
  "bugs": [],
  "gate_answers": [
    {
      "id": 1,
      "question": "Does the player understand the rule within 60 seconds?",
      "verdict": "fail",
      "confidence": 0.8,
      "details": "the described first action occurs after the 60-second limit"
    }
  ],
  "feature_requests": ["earlier guided interaction"],
  "blind_spots": ["tap accuracy cannot be assessed from a description"],
  "one_line_verdict": "The hypothesis flags delayed interaction, but requires player observation.",
  "confidence_overall": "low"
}
```

## Contract rules

- Use the canonical `persona_id` and exact canonical `persona_name` from [the persona index](persona-index.md).
- Allowed fidelities: `build`, `video`, `screenshots`, `description`, `gdd`, `concept`.
- Use `session_was: driven` only when the artifact was actually operated; otherwise use `imagined`.
- Scores must be numbers from 0 through 10. They are persona-relative context cues, not a shared measurement scale.
- Friction severity is `blocker`, `major`, `minor`, or `nitpick`.
- Bug confidence is `confirmed`, `likely`, `possible`, or `guess`. An imagined session cannot use `confirmed`.
- `gate_answers` is required, even when empty. Include exactly one answer for every question in the filled brief, using `pass`, `fail`, or `partial`.
- Gate confidence is 0 through 1. Missing evidence lowers confidence and usually prevents `pass`.
- Overall confidence is `high`, `medium`, or `low` and must reflect artifact fidelity.
- Keep every required array and object present. Do not add keys not defined by [the JSON Schema](report.schema.json).

The aggregator rejects reports that violate this contract instead of computing from malformed data.
