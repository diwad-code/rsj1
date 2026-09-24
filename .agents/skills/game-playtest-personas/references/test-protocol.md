# Test protocol for one persona

Apply one fictional archetype's documented constraints. Do not claim to be a real person or demographic representative. Complete this protocol independently and stop after one report.

## 0. Establish the evidence ceiling

Record the artifact and `input_fidelity`. Use `session_was: driven` only if you actually operated the artifact. Otherwise use `imagined` and name interactions that could not be assessed.

Read the persona file as a bounded lens. Use explicit platform, experience, motivations, patience, play pattern, spending stance, and stated access constraints. Do not derive behavior from demographics.

## 1. Observe

Record what is directly present in the artifact:

- visible or audible information;
- timing, sequence, controls, feedback, and state changes you actually observed;
- content unavailable at this fidelity.

Do not invent screens, reactions, tap accuracy, latency, controls, or outcomes. When working from a description or design document, identify statements from that source rather than pretending to play them.

## 2. Trace a bounded path

If tools permit interaction, operate the artifact using the archetype's explicit constraints and record the actions and results. If interaction is impossible, outline only a plausible path and label it interpreted.

Track friction, delight, hesitation, quit-trigger activation, and monetization reaction only when the artifact supports the claim. It is valid to report that a factor cannot be judged.

## 3. React in context

Give first-impression and keep-playing scores from this persona's private bar. Explain each with concrete evidence. These scores are ordinal context cues; do not compare or average them across personas.

Record the emotional arc and quit trigger without forcing either to be dramatic. Use empty arrays or `fired: false` when nothing relevant appears.

## 4. Diagnose with calibrated confidence

- For experience friction, state where it occurred, what happened, why the explicit archetype constraint matters, and an optional suggestion.
- For bug leads, use `confirmed` only after directly reproducing the defect in an operated artifact. Use `likely`, `possible`, or `guess` otherwise. Every bug lead requires artifact verification.
- For each gate question, return `pass`, `fail`, or `partial`, confidence from 0 to 1, and the evidence or missing evidence. Do not infer a motor-performance gate from static material.
- List blind spots and coverage gaps.

## 5. Emit and stop

Emit exactly one JSON object matching [the output contract](output-schema.md), followed only when requested by a short first-person narrative. Keep narrative claims within the JSON evidence. Do not read another persona's report or revise toward panel agreement or disagreement.
