---
name: research-question
description: Frame and scope a research question before searching. Use when starting a review, when a question is vague or sprawling ("tell me about X"), or when you need inclusion/exclusion criteria. Applies PICO/PECO and scoping techniques to turn a topic into a searchable, answerable question.
---

# research-question — frame before you search

A sharp question makes the rest of the pipeline tractable. Do this first.

## Steps

1. **Restate the ask** in one sentence. Identify whether it is:
   - *Factual* ("is X true / how strong is the evidence for X?")
   - *Comparative* ("does A work better than B?")
   - *Exploratory / scoping* ("what is known about X?")
   - *Mechanistic* ("how/why does X happen?")
2. **Structure it.** For empirical questions use **PICO/PECO**:
   - **P**opulation / problem · **I**ntervention or **E**xposure ·
     **C**omparison · **O**utcome · (+ **T**imeframe, **S**etting, **S**tudy type).
   For non-clinical fields, adapt: concept, context, population, outcome.
3. **Set boundaries.** Define **inclusion/exclusion criteria**: date range,
   languages, study designs to accept, populations, and what is out of scope.
4. **List key concepts and synonyms** for each PICO element — these become the
   search terms for `literature-search` (include acronyms, British/American
   spellings, MeSH-style terms where relevant).
5. **Flag ambiguity.** If the scope is genuinely unclear or could go several
   very different directions, ask the user one focused clarifying question
   rather than guessing.

## Output

Produce a short scoping block the next stages can consume:

```
Question: <one sentence>
Type: <factual | comparative | scoping | mechanistic>
PICO/PECO: P=… I/E=… C=… O=… (T/S=…)
Include: <designs, dates, populations, languages>
Exclude: <out of scope>
Concepts & synonyms: <term clusters for search>
```
