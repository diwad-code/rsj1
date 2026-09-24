# HERALD Narrative Editor — Codex Skill

Paczka do wgrania jako skill / knowledge folder dla Codexa w VS Code.

Nie mogę z tej sesji zweryfikować najnowszego oficjalnego formatu instalacji
Codex Skills online. Paczka ma standardową, przenośną strukturę:

```text
herald-narrative-editor/
  SKILL.md
  references/
  templates/
  prompts/
  scripts/
  checklists/
```

## Sugerowane użycie

1. Rozpakuj katalog `herald-narrative-editor`.
2. Umieść go w miejscu, z którego Twój klient Codex/VS Code ładuje custom skills
   lub project instructions.
3. W zadaniu do Codexa dopisz:
   `Użyj skilla herald-narrative-editor. Najpierw przeczytaj SKILL.md.`
4. W repo HERALD każ mu najpierw przeczytać aktualny handoff i docs web runtime.
5. Przy pracy z narracją odpal skan:
   `python <ścieżka_do_skilla>/scripts/herald_quick_scan.py web-migracja/data-mirror`

## Co zawiera

- zasady narracyjne HERALD;
- idiolekty postaci;
- event JSON runtime;
- polską redakcję dialogów i AI-izmów;
- checklisty dla scen, eventów i wdrożeń;
- prompt do wdrożenia prologu tekstowego i systemu torporu;
- snapshot najważniejszych źródeł z tej rozmowy.

## Ograniczenie

To nie jest zastępstwo dla repo. Jeśli aktualny handoff albo docs w repo
konfliktują z tą paczką, repo wygrywa.
