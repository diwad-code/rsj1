# PKG-013 / P22 — raport: ustawienia, remapowanie i dostępność

**Status: COMPLETE (24.09.2026).** Cały zakres P22 wykonany; jedno końcowe review zamknięte z dwiema celowanymi poprawkami. **VISUAL wydaje wyłącznie użytkownik — nie wpisano.** Zewnętrzny PLAYABILITY NOT RUN.

## Status zadań P22

| Wynik pakietu | Stan | Dowód |
| --- | --- | --- |
| Ekran USTAWIENIA z menu, klawiaturą, bitmapowy font / siatka pikseli | wykonane | `src/render/settingsView.ts`, `src/app/main.ts` (screen `settings`), zrzuty poniżej |
| Remap 5 akcji skoku + potwierdź/wróć; przechwycenie, konflikt, reset; nawigacja ratunkowa | wykonane | `src/settings/settings.ts` (`rebindSettings`), test E2E `settings.spec.ts` |
| Głośność, skala Dopasuj/Równe px, duży tekst tabel, mniej ruchu | wykonane | `GameSettings`, `applyCanvasScale`, `drawRoundSummary/Progress(…, largeText)`, `snowEnabled` w replayu |
| Trwały zapis (IndexedDB `settings`, DB v1→v2) z walidacją i domyślnymi przy uszkodzeniu | wykonane | `loadGameSettings/saveGameSettings`, `tests/settings.test.ts`, `tests/persistence.test.ts` |
| Bindy w treningu/konkursie/hotseat; replay z próbek niezależnie od bindów | wykonane | `actionFor`/`resolveBoundAction`, E2E replay H01 przed/po remapie |
| Znaki PL/IME: brak pola tekstowego — nie tworzono na zapas; strażnik `textEntryOrComposing` | wykonane | `src/app/main.ts`, brak `<input>` w `src/` |

## Zmiany (istotne, bez fizyki/punktacji)

- Nowy `src/settings/settings.ts`: `GameSettings{version:1,bindings,menuConfirm,menuBack,volume 0–100,scaleMode fit|integer,largeText,reducedMotion}`, `DEFAULT_SETTINGS`, `normalizeSettings` (całość albo domyślne), `rebindSettings` (konflikt/rezerwacja zamiast cichego nadpisania), `resolveBoundAction`.
- `src/storage/schema.ts` + `db.ts`: DB_VERSION 1→2, tylko magazyn `settings` (klucz `global`); stare dane nienaruszone (test migracji v1→v2).
- `src/app/main.ts`: 4. wiersz menu USTAWIENIA, ekran z 12 wierszami, przechwycenie (ESC/Backspace anuluje), głośność × gain, skala, `setRoundSummaryVisibleRows`, bindy globalne + `bindingHints` do HUD, pauza focus-loss nie więzi ustawień, debug snapshot `settings/selectedRow/captureTarget/message`.
- `src/render/settingsView.ts` (nowy), `competitionView.ts` + `hillView.ts`: podpowiedzi klawiszy z bieżących bindów (domyślne bez zmian pikseli), duży tekst tabel (podsumowanie 7 zamiast 10 wierszy).
- Testy: `tests/settings.test.ts`, `tests/competitionAccessibility.test.ts`, `tests/browser/settings.spec.ts` (4 testy), poprawki pilota H04 (zegar `runFor(16)` tylko w locie testu 3; progi bez zmian).

## Polecenia i wyniki (kod finalny)

- `npm run typecheck` — PASS.
- `npm test` — 38 plików / 330 testów PASS.
- `npm run build` — PASS (Vite 40 modułów).
- Playwright `settings.spec.ts + shell.spec.ts + h04.spec.ts --workers=1 --output=docs/evidence/PKG-013/tmp-browser-final-20260924-d` — **12/12 PASS**, w tym konkurs H04 AUTO6: landed 192,5 m (próg 180 m), sterowanie ≤4 ticki, błąd pochylenia 1,8°.
- Zrzuty: `tmp-browser-final-20260924-d/settings-settings-screensh-d423e-on-persist-on-small-screens/settings-1280x720.png` i `settings-960x540.png`.

## Końcowe review (jedno, po całym P22)

1. Usterka: blur/visibility/fullscreen na ekranie ustawień zostawiał ukrytą pauzę — naprawiono (anulowanie przechwycenia, brak pauzy na `settings`); regresja E2E dodana, PASS.
2. Usterka: HUD treningu/procedury startowej pokazywał domyślne klawisze po remapie — renderery przyjmują `bindingHints`, `main.ts` przekazuje; domyślne pikselowo bez zmian.
3. Diagnostyka H04 (oracle, read-only): krótkie skoki 168/173 m to zbyt wolny rytm pilota testu (~190 ms między decyzjami), nie regresja P22; ustabilizowano zegarem Playwright w locie, fizyka i próg nietknięte. Poprawki kruchości testów (natychmiastowy assert wyniku, wyścig resume) — tylko testy.
4. Visual QA designera na zrzutach: czytelny fokus/kolumny; stopka cofnięta o usterkę styku z ramką. Bez roszczenia VISUAL PASS.

## Ograniczenia / bramka B

- Bramkę B / MVP oceniam faktami: 4 skocznie grywalne, konkurs/trening/AI/hotseat/punktacja/zapis/replay działają, ustawienia i dostępność z P22 działają; **PASS bramki ani VISUAL nie wpisuję za użytkownika**.
- Zewnętrzny playtest PLAYABILITY NOT RUN. Backup i `.git` nietknięte; zakaz Git przestrzegany.

**Następny pakiet:** [PKG-014/P23–P25](../handoffs/PKG-014.md) (identyczny z `docs/NEXT_SESSION_PROMPT.md`).
