# Playtest Session Brief

Fill this in at SCOPE/BRIEF, before running any personas. It keeps every persona testing the same thing
against the same question. Copy it, fill it, and pass the relevant parts into each persona run.

---

## What is being tested
- **Game / build:** <name + version, e.g. "Starfarer Idle — build 0.4.2">
- **Genre & platform:** <e.g. mobile idle-RPG; also planned for Steam>
- **Artifact provided:** <playable build / gameplay video / screenshots / mechanic description / GDD / concept>
- **Input fidelity:** <build | video | screenshots | description | gdd | concept> (this caps confidence)
- **How to access it:** <URL / file path / attached / described inline>

## The decision this playtest informs
- **Primary question:** <e.g. "Is the first-session onboarding too long before the core loop?">
- **Secondary questions:** <e.g. "Does the day-3 monetization prompt feel fair?">
- **Gate / Milestone criteria (if applicable):**
  - **Q1:** <e.g. "Does the player understand the core mechanic within 60 seconds? (Target: >=80% pass)">
  - **Q2:** <e.g. "Is target selection prioritized over fast mashing/spam? (Target: 100% pass)">
  - **Q3:** <e.g. "Would the player voluntarily start a second run/session? (Target: >=60% pass)">
- **Fallback synthetic threshold:** <e.g. 75%> (passed as `--pass-threshold`; applies only where no per-question target is configured)
- **Per-question CLI targets:** <e.g. `--gate-threshold Q1=80 --gate-threshold Q2=100 --gate-threshold Q3=60`>
- **Canonical question flags:** <repeat every exact question, e.g. `--gate-question "Q1=Does the player understand the core mechanic within 60 seconds?"`>
- **Minimum answer coverage:** <e.g. 100%> (passed as `--min-gate-coverage`; unanswered gates must not pass silently)
- **Stakes / reversibility:** <low = explore freely; high = treat output as hypotheses only, must validate>

## Scope
- **Focus area(s):** <onboarding / difficulty / monetization / bugs / narrative / social / retention / all>
- **Explicitly OUT of scope:** <e.g. "ignore placeholder art, not final">
- **Session slice to review:** <e.g. "first 10 minutes" or "a day-7 returning session">

## Persona panel
- **Panel chosen:** <full 20 | named subset from persona-index.md recommended panels>
- **Expected persona IDs:** <e.g. `p01,p03,p04,p08,p12,p20`; pass as `--expected-personas`>
- **Why this panel:** <one line>
- **Contrasting explicit constraints included:** <which relevant platforms, experience levels, motivations, or access constraints differ>

## Calibration data (raises trust the most — include if you have ANY)
- **Real player data available?** <yes/no>
- **Sources:** <Store reviews / analytics funnel / prior survey / Discord complaints / none yet>
- **Key known facts:** <e.g. "analytics: 38% drop at end of tutorial; reviews complain about ads">

## Output preferences
- **Language of persona feedback:** <English / Polish / other>
- **Report depth:** <full panel report | quick top-findings summary>
- **Where to save reports:** <path, e.g. ./reports/ — or "just in chat">

---

*Reminder: whatever the fidelity, the result is a set of model-generated hypotheses about how players like
these would react — to be validated with real players before high-stakes, low-reversibility decisions.*
