# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: h04.spec.ts >> H04 competition, real result, bots, transactional save/reload, current and old-version replay isolation
- Location: tests\browser\h04.spec.ts:275:1

# Error details

```
Error: clock.pauseAt: Error: Cannot fast-forward to the past
    at ClockController._innerFastForwardTo (<anonymous>:202:13)
    at ClockController.pauseAt (<anonymous>:133:16)
    at async <anonymous>:337:30
```

# Page snapshot

```yaml
- main "Retro Ski Jumping" [ref=e2]:
  - application "Retro Ski Jumping — Skok konkursowy Łucja Wicher, faza Takeoff." [active] [ref=e3]
  - paragraph [ref=e4]: Skok konkursowy Łucja Wicher, faza Takeoff.
```