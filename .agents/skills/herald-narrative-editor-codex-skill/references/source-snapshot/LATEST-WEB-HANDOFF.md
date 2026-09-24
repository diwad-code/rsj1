# HERALD Web — Latest Handoff Pointer

Aktywny punkt wejscia dla webowego runtime:

- repo-wide source of truth: [docs/handoffs/LATEST-GPT5_4-HANDOFF.md](/C:/herald-v2/docs/handoffs/LATEST-GPT5_4-HANDOFF.md)
- najnowszy handoff (itch.io blank-screen fix — wzgledny base): [docs/handoffs/2026-06-26-itch-subpath-blank-screen-fix-handoff.md](/C:/herald-v2/docs/handoffs/2026-06-26-itch-subpath-blank-screen-fix-handoff.md)
- handoff release/O4 (alpha ZIP rebuild): [docs/handoffs/2026-06-26-o4-alpha-zip-rebuild-handoff.md](/C:/herald-v2/docs/handoffs/2026-06-26-o4-alpha-zip-rebuild-handoff.md)
- najnowszy handoff art/runtime integration: [docs/handoffs/2026-06-26-bridge-style-location-candidate-pack-handoff.md](/C:/herald-v2/docs/handoffs/2026-06-26-bridge-style-location-candidate-pack-handoff.md)
- najnowszy pelny handoff runtime: [docs/handoffs/2026-06-25-web-runtime-faza-r-closed-handoff.md](/C:/herald-v2/docs/handoffs/2026-06-25-web-runtime-faza-r-closed-handoff.md)
- roadmap/status table: [docs/plans/2026-06-17-web-runtime-finish-and-post-mvp-roadmap.md](/C:/herald-v2/docs/plans/2026-06-17-web-runtime-finish-and-post-mvp-roadmap.md) (§0a Q0-Q6 wszystkie domkniete)
- zamkniety plan regresji runtime: [docs/plans/2026-06-25-faza-r-runtime-visual-ux-fixes.md](/C:/herald-v2/docs/plans/2026-06-25-faza-r-runtime-visual-ux-fixes.md) (§R-0a R0-R4 wszystkie domkniete)
- publishing guide: [docs/publishing-guide-itch-io.md](/C:/herald-v2/docs/publishing-guide-itch-io.md)

## Stan

- Aktywny target: `web-migracja/herald-web`.
- Fazy L-O, P0-P7, **Faza Q (Q0-Q6)**, **Faza R (R0-R4)** oraz **Bridge-style location pack A+B 2026-06-26** sa domkniete po stronie repo/runtime; O4 human pass nadal pending.
- **2026-06-26:** Picsart CLI candidate pack dla 16 lokacji non-Bridge zostal rozstrzygniety decyzja producencko-artystyczna Codex GPT-5: **integrowac A+B**. Runtime ma podmienione `public/assets/atlases/*room-q*.webp`, prompt/canon sidecary z `accepted-in-runtime-2026-06-26`, manifest `slice: bridge-style-location-pack-2026-06-26` i focused proof `tests/bridge-style-location-pack.test.ts` + `tests/asset-preloader.test.ts` -> `2 passed`, `6 passed`.
- **2026-06-25:** Faza Q (rastrowe tla pomieszczen Picsart pod niezmieniona wektorowa warstwa interaktywna/HUD) zostala domknieta kodowo. Q0-Q4 = pipeline + caly zbior rastrowych tl; Q5 (code) = crew roster + idle motion (Q5a) i room-level atmosphere pass (Q5b: jeden key swiatla azymut 315° + vignette + grain w statycznej warstwie `scene-atmosphere`, reduced-motion safe, G-EDGEBLEED); **Q6 (code) = credits/store truth + decyzja `G-DISCLOSURE` (jawne ujawnienie AI w credits + sklep) + regeneracja oficjalnego 6-packu screenshotow POD atmosfera Q5b**. Patrz plan §4 FAZA Q + §0a wiersze Q0-Q6 i art bible doc 07 (G-AMENDMENT + ratyfikacje Q0-Q6 2026-06-25).
- Walidacja (stan po Bridge-style A+B 2026-06-26): focused asset/room suite -> `7` plikow / `61 PASS`; `npm test` -> `76` plikow / `423 PASS`; `npm run build` PASS (PWA precache `488` entries / `11987.63 KiB`); `npm run test:preview` -> `1 PASS`; `npm run test:ui` -> `31 PASS`; `npm run test:ui:screenshots` -> `2 PASS` (store pack + Q5 contact-sheet). Screenshot proof: `C:\Users\Public\herald-p7-proof\` + `C:\Users\Public\herald-q5-proof\q5-contact-sheet.png`.
- ZIP do draftu itch.io: `web-migracja/herald-web/herald-alpha-build.zip` (**przebudowany 2026-06-26 przez `npm run build:itch`**, base wzgledny `./`; `index.html` w korzeniu ze sciezkami `./assets/*`, separatory `/`, `408` plikow = pelny `dist`, `SHA-256 C0C236E8D47E97500435A6C6E1906E47285BD0E30F540934D552A6EFB7206193`) — zawiera credits/AI-disclosure z Q6, Bridge-style pack A+B (17 atlasow) i **fix blank-screen itch.io (R5)**. Odrzucone hashe: `C5F4…A194B6` (base `/`, nie startowal na itch.io) oraz `A732…A56C2` (sprzed Q6). Pozostaje wylacznie ludzki **RE-upload** do panelu itch.io + potwierdzenie startu + playtest (O4).
- Otwarte ryzyko: ludzki pass O4 w realnej ramce itch.io nadal pending; repo nie niesie draft URL ani stanu sesji itch.io, wiec platformowy pass + rebuild/upload ZIP trzeba wykonac poza samym repo.

## Nastepny wykonywalny slice

**BRAK otwartego slice'a kodowego modelu — Fazy Q/R oraz Bridge-style integration sa code/runtime-complete.** §0a nie ma juz otwartego wiersza dla modelu. Pozostale tory sa ludzkie / poza kodem i biegna rownolegle:

- **O4** — prywatny playtest czlowieka na itch.io. **ZIP itch-ready 2026-06-26** (`C0C2…6193`, zbudowany `npm run build:itch`, base `./`, fix blank-screen R5) — pozostaje **RE-upload** w realnym panelu itch.io + potwierdzenie startu + playtest.
- **Finalny aesthetic sign-off `G-SET-COHERENCE`** — ludzka ocena spojnosci calego zbioru juz po integracji A+B.

Kolejny slice kodowy powstanie WYLACZNIE z NOWEGO dowodu regresji, nie z powrotu do P ani do zamknietych slice'ow Q/R. Nastepny krok zawsze wyprowadzaj z `docs/handoffs/LATEST-GPT5_4-HANDOFF.md` × §0a.
