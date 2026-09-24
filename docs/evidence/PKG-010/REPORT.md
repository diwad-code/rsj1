# PKG-010 — P21-H02 Zakopane duża, raport zamknięcia (23.09.2026)

**PKG-010 COMPLETE; P21 IN PROGRESS.** H02 to grywalna adaptacja inspirowana
Zakopanem K125/HS140, nie homologowany profil. Bazowa bramka V i H01 miały
wcześniejszy odrębny odbiór. **VISUAL H02: USER PASS 23.09.2026** — użytkownik
napisał „Akceptuję H02”; nie jest to samoocena modelu. Następnie
[PKG-011 / P21-H03](../../handoffs/PKG-011.md); H04 pozostaje nierozpoczęta.

| Zadanie | Status | Dowód |
|---|---|---|
| D — karta i źródła | COMPLETE | [H02.md](../../hills/H02.md): PZN/FIS F10 K125/HS140, konkursowy rekord 147,0 m Yukiya Sato 25.01.2020 z FIS; wartości gry opisane jako ADAPT/TUNE, 7,56 FIS ≠ zaokrąglone 7,6 pkt/m gry. |
| G — profil i skoki | COMPLETE | `src/simulation/hills/zakopaneLarge.ts`, `tests/h02.test.ts`: własny profil, wspólna mapa metrażu, AUTO przy −2/−1/0/+1/+2 m/s = 22/19/16/15/14. Idealny pilot: belka 26, +0,5 m/s, idealny tick, R po 3,8 s → kontakt 149,8216 m, **zapis 149,5 m**, dwie nogi, 0 podpórek. W paśmie 149–154 m: 62 czyste, 152 ustane z podpórką w określonym sweepie, bez losowania gracza. |
| A — pixel art | COMPLETE | Autorska paleta zimowego dnia, drewniana wieża/estakada i Tatry w `src/render/hillView.ts`; [manifest i hash](ART_MANIFEST.md), [finalny techniczny i scena](ARTIFACTS.md). Siatka 480×270, bitmapowy tekst; użytkownik zaakceptował H02. |
| V — integracja | COMPLETE | `src/app/hills.ts`, `competitionSession.ts`, `main.ts`, `tests/browser/h02.spec.ts`; wybór obu kierunków, trening, konkurs, AI watched==fast, zapis/wznowienie, izolacja ID/wersji, bieżący/stary replay, K/HS i oba lądowania. [Rzeczywiste zrzuty 960×540 i film skoku](ARTIFACTS.md). |

## Sprawdzenia na finalnym kodzie

| Polecenie / zakres | Rzeczywisty wynik |
|---|---|
| `npm run typecheck` | PASS (wynik przekazany przez rodzica po naprawie przejściowego błędu tuple w teście przeglądarkowym). |
| `npm test` | PASS, 34 pliki / 295 testów (rodzic). |
| `npm run build` | PASS, Vite 36 modułów, JS 198,28 kB / gzip 62,33 kB. |
| `npx playwright test tests/browser/h02.spec.ts --workers=1 --output=docs/evidence/PKG-010/tmp-browser-final` | PASS 3/3; realny skok treningowy 120,0 m ustany; odrębny replay konkursowy z krótkiego rzeczywistego skoku. Długi skok rekordowy dowiedziony w unit, nie na tym filmie. |
| `npx playwright test tests/browser/h01.spec.ts --workers=1 --output=docs/evidence/PKG-010/tmp-browser-final-h01` | PASS 3/3; regresja wspólnego renderera/przepływu H01. |
| `npm run test:e2e -- --workers=1 --output=docs/evidence/PKG-010/tmp-browser-common` | **TIMEOUT procesu powłoki po 240 000 ms**, pierwsze **18/25 PASS**. Nie oznaczać tej inwokacji PASS. |
| `npx playwright test tests/browser/jump.spec.ts:824 tests/browser/jump.spec.ts:876 tests/browser/shell.spec.ts --workers=1 --output=docs/evidence/PKG-010/tmp-browser-common-rest` | Pozostałe **7/7 PASS** osobno; razem 25 przypadków zaliczonych w dwóch przebiegach, bez znanych błędów, ale nie w jednej ukończonej inwokacji. |

Obrazy menu, scena, widok techniczny z rozdzielonymi P111/K125/HS140,
wynik, replay bez kolizji debug/ZAPIS oraz film rzeczywistego skoku mają
hashe SHA-256 w [ARTIFACTS.md](ARTIFACTS.md). Odrębny
[ART_MANIFEST.md](ART_MANIFEST.md) zawiera hash źródła renderera; fixture
artystyczny nie jest dowodem gry. Zachowano cudze zmiany, historię PKG-009
i istniejące `test-results`; bez commit/push/publikacji.

## Końcowe review — jedno po całym pakiecie

Rodzic przeprowadził **jedno** końcowe review D/G/A/V względem kryteriów
pakietu i nie znalazł nowego blokera. Wcześniejsze kolizje podpisów P/K/HS
oraz replay HUD zostały wykryte i poprawione podczas iteracji testów/podglądu,
przed końcowym review; finalne zrzuty potwierdzają poprawki. Timeout zbiorczej
inwokacji E2E pozostaje jawnie ujawniony, nie udaje zielonego pełnego polecenia.
Zewnętrzny jakościowy playtest **NOT RUN**, mimo osobnego VISUAL USER PASS.
Przekazanie: [aktywny prompt PKG-011](../../handoffs/PKG-011.md).
