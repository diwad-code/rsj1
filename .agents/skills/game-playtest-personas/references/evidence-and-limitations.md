# Evidence and limitations

Last reviewed: 2026-08-20.

## What this skill can support

Use the skill for inexpensive early hypothesis generation: locating questions worth inspecting, stress-testing a design description from different explicit constraints, structuring bug leads, and preparing real-player study priorities.

Its outputs are model-generated text. They are not observations of people, population estimates, usability metrics, market forecasts, or proof that a milestone is ready. A synthetic threshold result is an internal consistency check over model reports only.

## Source scope

- [Quantic Foundry's Gamer Motivation Model reference](https://quanticfoundry.com/wp-content/uploads/2019/03/Gamer-Motivation-Model-Reference-Updated.pdf) supplies vocabulary for motivations. It does not validate these fictional persona profiles or make their reactions predictive.
- [TITAN](https://arxiv.org/abs/2509.22170) describes an LLM-based automated game-testing system evaluated in two commercial MMORPGs. This skill borrows the general discipline of structured observation, action, reflection, and issue diagnosis. TITAN does not validate synthetic UX personas, this roster, or a universal bug false-positive rate.
- Research on persona prompting reports context-dependent behavior and bias risks. Relevant examples include [persona prompting and demographic biases (ACL 2024)](https://aclanthology.org/2024.findings-acl.586/), [persona prompting effectiveness (EMNLP 2025)](https://aclanthology.org/2025.findings-emnlp.1261/), and [persona alignment limits (EACL 2026)](https://aclanthology.org/2026.eacl-long.52/). Treat these as reasons to calibrate and validate, not as guarantees that isolation eliminates bias.
- [ESA's 2025 U.S. study summary](https://www.theesa.com/annual-esa-study-reveals-video-games-universal-appeal-across-generations/) describes a particular surveyed population. This roster is not weighted to it and must not be called representative of a country or global player population.

## Required interpretation

1. Preserve the artifact fidelity and `session_was` fields in every report.
2. Distinguish directly observed artifact facts from archetype-based interpretations and unknowns.
3. Do not average persona-relative scores or treat persona counts as population percentages.
4. Reproduce bug leads in the actual artifact.
5. Validate high-impact experience hypotheses with relevant real players.
6. For accessibility, use disabled participants, assistive technologies, platform requirements, and specialist review; follow [the accessibility boundary](accessibility-review.md).

## Stop conditions

Do not use this skill to certify accessibility, safety, legal or ethical compliance, child suitability, clinical outcomes, cultural authenticity, or release readiness. Do not claim a human gate passed when only synthetic reports were evaluated.
