# Raport PKG-009 — P21-H01 Lysgårdsbakken normalna

**Status pakietu: BLOCKED.** D jest BLOCKED; G/A/V pozostają
PROVISIONAL/INCOMPLETE i H01 jest wycofana z zawartości grywalnej. P21 pozostaje
IN PROGRESS/BLOCKED na H01; H02–H04 pending, H02 NOT STARTED. Jedyny końcowy
Oracle review został wykonany i zakończył się **CHANGES REQUIRED**. Późniejsze
zmiany to celowane poprawki, nie drugi review. Bazowa bramka V gry została
zaakceptowana przez użytkownika 22.09.2026; nie jest to odbiór wizualny H01.

| Część | Status | Dowód / ograniczenie |
|---|---|---|
| D — dane i kalibracja | BLOCKED | Definicje q/zU/a oraz promieni rozstrzygnięto z normy FIS, lecz prototyp jest liczbowo sprzeczny z certyfikatem. 269 skoków to opis raportów, nie wspólna kalibracja konfiguracji; H01-AI, landing-risk i AUTO pozostają UNRESOLVED. |
| G — geometria i dane | INCOMPLETE / PROVISIONAL | Profil istnieje jako prototyp, lecz długość rozbiegu, współrzędne K, zU/U, promienie i wybieg nie zgadzają się z certyfikatem. |
| A — pixel art i manifest | PROVISIONAL / UNACCEPTED | Oryginalny art, manifest, zrzuty i nagranie zachowane jako prototyp historyczny; nie są obecnie playable proof. H01 VISUAL user NOT RUN. |
| V — integracja i weryfikacja | WITHDRAWN FROM PLAYABLE | Kod wyłącza H01 z playable catalog; H01 save/replay nie jest wznawiane/odtwarzane. K120 pozostaje jedyną playable hill. |

## Źródła i kalibracja empiryczna

Karta dotyczy Lysgårdsbakken normalnej K90/HS98, certyfikat FIS
304/NOR 44, 3. prolongation z 22.11.2022, ważny do **30.04.2027**.
Zachowany ekstrakt obejmuje **n=269** skoków z czterech oficjalnych zawodów
opisanych jako K90/HS98; zgodność mapy rozbiegu 2026 z certyfikatem jest
**UNRESOLVED**:

- [certyfikat HS98 2022](fis/lillehammer-hs98-certificate-2022.pdf);
- [Women WC 03.12.2022](fis/lillehammer-2022-12-03-women-wc.pdf);
- [Women WC 02.12.2023](fis/lillehammer-2023-12-02-women-wc.pdf);
- [Men WC 02.12.2023](fis/lillehammer-2023-12-02-men-wc.pdf);
- [Women JWC 04.03.2026](fis/lillehammer-2026-03-04-women-jwc.pdf).

Łączny, wyłącznie opisowy rozkład raportów: min **54,5 m**, mediana **88,5 m**,
q75 **92,0 m**, q90 **95,1 m**, q95 **97,0 m**, max **104,0 m**;
wiatr −2,01…+2,39 m/s, raportowane belki 5–10 i 15–16.
Pasma: `<80 m` 23/1 upadek, `80–89,5`
135/0, `90–97,5` 101/0, `98–103` 9/0, `>103` 1/0. Jedyny odnotowany upadek
był na 66,0 m; próba **nie dowodzi wzrostu ryzyka upadku z odległością**.
Tabela i dane rund: [calibration.json](calibration.json) oraz
[calibration.csv](calibration.csv).

Rozkład n=269 pozostaje zapisem tego, co raportują PDF, ale miesza kobiety,
mężczyzn i juniorki. Ostrożniejsza podpróba 2022–2023 ma **n=189**, min 72,5,
medianę 89,5, q75 92,5, q90 96,0, q95 97,3 i max 104,0 m; **0 upadków**,
tylko 8 skoków ≥HS98, 1 >103 m. FIS 2023 raportuje belkę 9 jako **75,52 m**,
a [oficjalny wynik FIS men JWC 05.03.2026](https://www.fis-ski.com/DB/v2/download/competition-attachment/c3622daf-64da-11f1-b635-1866da7ef77e.pdf)
jako **86,50 m**; 2026 women JWC podaje belkę 16 jako **92,08 m**, więcej niż
certyfikatowe e1=87,98 m. Różnica pomiaru albo konfiguracji rozbiegu jest
**UNRESOLVED**; 2026 nie potwierdza kalibracji profilu 2022. Gate/wiatr są
kontekstem, nie dowodem przyczynowym. Brak etykiet stylu lądowania pozostawia
telemark/równolegle **UNRESOLVED**; pięć not nie jest etykietą stylu.

## Oracle review — blokery D18 (CHANGES REQUIRED)

Wykonany został jeden końcowy review Oracle. Wynik: **CHANGES REQUIRED**; nie
został zaliczony drugi pełny review. Późniejsze wyłączenie H01 z katalogu
grywalnego jest zabezpieczeniem, nie naprawą poniższych blockerów:

1. **Geometria certyfikatu — D BLOCKED.** [FIS Construction Norm 2018](https://assets.fis-ski.com/f/252177/5ba64e29f2/construction-norm-2018-2.pdf)
   definiuje `q=32,50 m` jako poprzeczne odsunięcie wieży sędziowskiej,
   `a=100 m` jako wybieg za U, `e1=87,98 m` od najwyższego startu do T
   **wraz** z progiem `t=6,10 m`, `rL=210 m` dla P–L oraz
   `r2L=131 m`/`r2=125 m` na końcach L→U. Prototyp ma profil rozbiegu
   94,08 m (t dodane drugi raz), wybieg tylko 32,50 m, K=(78,667; −42,645)
   wobec certyfikatu (78,43; −43,22) i głębokość U 60,651 wobec
   `zU=66,60 m`. Efektywne promienie prototypu P→K/K→L to 233,3/241,2 m,
   a początek/koniec L→U 222,8/57,3 m. Wyprowadzenia: [karta H01](../../hills/H01.md).
   Certyfikat nie podaje pełnej tabeli profilu ani fall line; nie wyznaczono
   nowych punktów. Dawne U=139 m, fall line=154 m, koniec=171,5 m są
   wyłącznie wadliwym prototypem.
2. **AI i lądowanie — D18 BLOCKED.** AI korzysta z globalnego, niekalibrowanego
   profilu; `1/269` to jeden krótki upadek i nie dostarcza odległościowej krzywej
   ryzyka. Progi `109/111 m` wyprowadzono z rekordu `107,5 m`, a nie z obserwacji
   ustania — są WITHDRAWN/UNRESOLVED, bez zastępczych wartości.
3. **AUTO — D18 BLOCKED.** Poprzedni cel `92 m` jest q75 połączonych raportów, nie dowodem
   bezpieczeństwa. Prototypowy estimator daje około `94,53 m` na neutralnej
   belce 1 i `98,5 m` przy `+2 m/s` (powyżej HS98); nie wykazano bezpiecznej belki.
   Cel i polityka AUTO pozostają UNRESOLVED.

## Zachowane źródła i ograniczenia

Próba `n=269` i pięć wymienionych dokumentów pozostają użytecznymi źródłami
obserwacji; review nie unieważnił samych raportowanych wyników. Unieważnił
wnioski geometryczne i bezpieczeństwa, które nie wynikają z tych danych.
Certyfikat 304/NOR 44, 3. prolongation, jest ważny do 30.04.2027. Nie wolno
przedstawiać tej daty jako zaliczenia profilu prototypowego.

## Implementacja i dowody wizualne

Historyczny manifest prototypu: [ART_MANIFEST.md](ART_MANIFEST.md). Zrzuty
prototypu 960×540: [wybór skoczni](browser-artifacts/h01-selection.png),
[scena](browser-artifacts/h01-scene.png),
[widok techniczny](browser-artifacts/h01-technical.png),
[wynik fixture](browser-artifacts/h01-result-fixture.png) i
[replay](browser-artifacts/h01-replay.png). Nagranie:
[H01 recorded replay](browser-artifacts/h01-recorded-replay.webm). Wszystkie te
pliki są zachowanymi dowodami historycznego prototypu, nie aktualnego playable
H01 ani akceptacji artu przez gracza.

## Walidacja pakietu

Wyniki poniżej pochodzą z wcześniejszego wykonania pakietu; nie są nowym
zaliczeniem D/G/A/V.

| Polecenie | Wynik |
|---|---|
| `npm run typecheck` | PASS |
| `npm test` po wyłączeniu H01 | PASS — 33 pliki, 282 testy |
| `npm run build` | PASS |
| `npx playwright test tests/browser/h01.spec.ts --workers=1` | PASS — 2/2; H01 selection/session/replay blocked. |
| `npx playwright test tests/browser/persistence.spec.ts -g 'replay archiwalnej wersji' --workers=1` | PASS — 1/1 po przywróceniu odtwarzania nieznanego historycznego ID na fallback K120 z ostrzeżeniem. |
| Trzy celowane testy w `jump.spec.ts` po synchronizacji | PASS — 3/3; nie jest to pełne E2E. |
| `npm run test:e2e` po H01 gating | FAIL — 21/25; trzy przeciążenia/timing oraz jeden regresyjny błąd replaya archiwalnego. Po poprawce replaya nie uruchomiono pełnego zestawu ponownie. |
| `npm run test:e2e` przed wyłączeniem H01 | PASS — 25/25, historyczny wynik, nie dowód bieżącego playable setu. |

Kontynuacja 23.09.2026: `npm run typecheck` **PASS**;
`npx vitest run tests/h01.test.ts` **PASS 20/20**. Są to kontrole
techniczne niegrywalnego prototypu i zabezpieczeń, nie potwierdzenie geometrii
lub kalibracji FIS. `npm run build`, pełne `npm test` i pełne E2E w tej
kontynuacji **NOT RUN** (bez zmiany zachowania runtime; D pozostaje BLOCKED).

Historia testu wybicia: wcześniejsza pierwsza próba pełnego E2E miała błąd
`visualPose` w `jump.spec.ts` i timeout po teście 19/25 przy 300 s. Izolowana
reprodukcja wykazała stały próg `edge−45` i zmienne opóźnienie Playwright/CDP;
skorygowano wyłącznie synchronizację testu, bez zmiany fizyki/runtime’u.

Po Oracle review runtime usunął H01 z katalogu grywalnego: K120 jest jedyną
grywalną skocznią, H01-spec pozostaje provisional, jej zapis nie jest wznawiany,
a replay H01 jest odrzucany. Nieznane ID historycznego replaya nadal otwiera się
na technicznej geometrii tylko jako archiwum z `visualsCompatible=false` i
ostrzeżeniem; jego wynik pozostaje zapisany. H01 nadal nie ma bezpiecznej AUTO.

**Ograniczenia odbioru:** H01 VISUAL user **NOT RUN**; zewnętrzny jakościowy
playtest **NOT RUN**. Bazowa bramka V oprawy pozostaje PASS wyłącznie na
podstawie akceptacji użytkownika z 22.09.2026; nie obejmuje H01.

**Ta kontynuacja:** wizualnie odczytano lokalny certyfikat 2022 i definicje
FIS, przeliczono punkty `ProfileCurve` przy kroku 0,05 m oraz kwantyle
2022–2023 z zachowanego `calibration.csv`. To kontrole źródeł i prototypu,
nie test grywalności H01. Nie zmieniono runtime ani dawnego ekstraktu PDF;
komentarze kodu/testów oznaczają wartości jako wycofane. Pełne E2E **NOT RUN**.

## Końcowy review Oracle

**ONE REVIEW COMPLETED — CHANGES REQUIRED.** Oracle wskazał trzy blokery:
certyfikat-geometria (q/a, zU/U, przejścia), D18 AI/landing-risk i niepoparte
progi 109/111, oraz brak bezpiecznej AUTO. Zmiana katalogu grywalnego jest
zabezpieczeniem przed dalszym użyciem prototypu; nie zamyka D. Nie uruchamiać
drugiego pełnego review. Ta kontynuacja rozstrzygnęła definicje certyfikatu,
lecz ujawniła dodatkowo podwójne liczenie t i nieporównywalną mapę belek 2026.
D nadal BLOCKED; G/A/V nie zostały wznowione.

Poprzedni prompt zachowano jako [PKG-009-CONTINUE-01](../../handoffs/PKG-009-CONTINUE-01.md).
Aktywny prompt kontynuacji: [PKG-009 — P21-H01](../../handoffs/PKG-009.md),
identyczny z [NEXT_SESSION_PROMPT.md](../../NEXT_SESSION_PROMPT.md). H02 pozostaje
NOT STARTED.
