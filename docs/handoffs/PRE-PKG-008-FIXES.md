# PRE-PKG-008-FIXES — wdrożenie pełnego pakietu naprawczego przed PKG-008

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git, nie twórz worktree i nie publikuj gry.

## Cel sesji

Wykonaj kompletny plan:

`docs/plans/2026-09-19-pre-pkg-008-fixes.md`

Jest to osobny pakiet naprawczy wykonywany **przed i niezależnie od PKG-008**.
Nie rozpoczynaj PKG-008 i nie zmieniaj jego stanu, promptu ani dowodów.

## Obowiązkowa kolejność lektury

1. `AGENTS.md` — prostota, zamrożenie nowej zawartości i jedno końcowe review.
2. `docs/plans/2026-09-19-pre-pkg-008-fixes.md` — pełny zakres i kolejność.
3. Tylko potrzebne pliki `src/**`, `tests/**`, `package.json` i konfiguracje.
4. Dla sylwetek i sceny: `.agents/skills/dos-pixel-art/` oraz lokalne obrazy
   `docs/research/reference-images/`.
5. Dla wyjątków mechaniki: `.agents/skills/ski-jump-aero/`.

Nie czytaj wcześniejszych raportów audytowych w celu ponownego projektowania
zakresu. Plan jest wiążącą listą wykonawczą. Nie twórz nowego planu zamiast
implementacji.

## Pliki chronione

Nie wolno edytować:

- `docs/handoffs/PKG-008.md`
- `docs/NEXT_SESSION_PROMPT.md`
- `docs/evidence/PKG-008/**`

Na początku i końcu oblicz SHA-256:

| Plik | Oczekiwana suma |
| --- | --- |
| `docs/handoffs/PKG-008.md` | `83C035E2E0D37C5FDCF44166387DE226C7BCA09DBF3A67C9F5DDEB9080AD5076` |
| `docs/NEXT_SESSION_PROMPT.md` | `83C035E2E0D37C5FDCF44166387DE226C7BCA09DBF3A67C9F5DDEB9080AD5076` |
| `docs/evidence/PKG-008/REPORT.md` | `A68C2F4B7AADAC3C4E22498BC3C08DCAFFD86937E5AFD5E80A50C660EAB85DBE` |

Dowody tej sesji zapisuj wyłącznie w:

- `docs/evidence/PRE-PKG-008-FIXES/REPORT.md` — końcowy raport;
- `C:\Users\admin\AppData\Local\Temp\opencode\pre-pkg-008\` — tymczasowe
  obrazy i arkusze klatek;
- `test-results/` — artefakty Playwrighta.

## Zakres obowiązkowy

Wykonaj wszystkie zadania 0–15 z planu, w tej kolejności zależności:

1. zabezpieczenie sum i baseline;
2. unikalne `resultId` kolejnych konkursów;
3. kontrolowany wynik po `flightTimeout`;
4. zwalnianie lease, fallback replaya i usunięcie martwych danych replaya;
5. spóźnione inputy, martwe `alpha` i walidacja profili;
6. reguła 95%, pusta seria i cel prowadzenia na średniej wiatru;
7. brakujące glify, polskie etykiety i reduced motion;
8. rozdzielenie regresji E2E od capture/benchmarków oraz artefakty poza PKG-008;
9. całkowite skalowanie canvasa i letterbox;
10. widok techniczny wyłącznie przy `?debug`;
11. jawny bank kluczowych sylwetek wszystkich faz;
12. wysokościowy cień, landmarki świata i poprawna hierarchia tła;
13. sygnały progu/kontaktu oraz krótkie proceduralne SFX;
14. minimalny HUD i uporządkowany wynik;
15. konfiguracja i pozostałe widoki konkursowe;
16. pełna weryfikacja, jedno review i raport PRE.

## Przyjęte decyzje — nie pytaj ponownie

- całkowita skala z letterboxem; dla viewportów mniejszych od 480×270 awaryjne
  proporcjonalne dopasowanie;
- dyscyplina kontrastu DSJ2 plus kilka landmarków w świecie w duchu SJ3;
- długość nart bez zmian, bryła ciała czytelniejsza o około 10–15%;
- minimalny HUD w ruchu, pełne dane po skoku;
- widok techniczny tylko w `?debug`;
- reguła 95% odnosi się do całej bieżącej serii, chyba że aktualny ICR FIS
  jednoznacznie temu przeczy;
- brak nowego przepływu anulowania serii; napraw jedynie pustą aktywną rundę;
- replay pozostaje próbkowy, bez resymulacji z wejść;
- `VISUAL PASS` może nadać wyłącznie użytkownik.

## Zasady implementacji

1. Najprostsze lokalne rozwiązanie dające dobry efekt. Bez nowych frameworków,
   event busa, DI, atlasowego systemu assetów i refaktoryzacji poza zakresem.
2. Najpierw test odtwarzający błąd, potem minimalna implementacja i celowany
   test. Nie twórz testów kosmetyków bez obserwowalnego kontraktu.
3. Nie zmieniaj normalnych wyników fizyki, punktacji ani geometrii skoczni.
   `flightTimeout` jest obsługą awaryjną, nie tuningiem.
4. Nie dodawaj nowej zawartości, ekranów ani trybów.
5. Render treningu, konkursu i replaya ma używać tych samych sylwetek i efektów.
6. Nie obniżaj progów testów, wymaganego dystansu, stanów terminalnych ani
   wymogu sterowania klawiaturą.
7. Nie zapisuj testowych screenshotów do `docs/evidence/PKG-008`.
8. Wykonaj jedno końcowe review dopiero po całym pakiecie. Testy i bieżące
   naprawy nie są osobnymi rundami review.

## Weryfikacja

Po całym wdrożeniu uruchom:

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run test:capture
```

`npm run test:benchmark` uruchom tylko przy nowej regresji wydajności lub po
zmianie gorącej ścieżki renderera.

Obowiązkowe kontrole wizualne:

- viewporty 960×540, 1366×768 i 1920×1080;
- wszystkie klatki wybicia, lotu, przygotowania lądowania i upadku;
- cień przy kilku wysokościach;
- wejście/wyjście landmarków z kadru;
- cel i HUD bez kolizji;
- wynik ustany i upadek;
- konfiguracja 1 i 10 graczy;
- zwykły URL oraz `?debug`;
- `prefers-reduced-motion: reduce`;
- trening, konkurs i replay.

Manualnie odsłuchaj wybicie, kontakt, upadek i wynik. Brak dźwięku lub blokada
`AudioContext` nie może zatrzymać gry.

## Zamknięcie

1. Zapisz `docs/evidence/PRE-PKG-008-FIXES/REPORT.md` z tabelą statusów zadań,
   wynikami testów, dowodami, ograniczeniami i jedną sekcją „Końcowe review”.
2. Nie wpisuj `VISUAL PASS`.
3. Sprawdź końcowe sumy chronionych plików; muszą być identyczne z wartościami
   powyżej.
4. Nie zmieniaj `docs/NEXT_SESSION_PROMPT.md` ani handoffu PKG-008.
5. Nie rozpoczynaj PKG-008. W odpowiedzi końcowej wskaż istniejący
   `docs/handoffs/PKG-008.md` jako następny krok po odbiorze pakietu PRE.

Pakiet jest ukończony dopiero wtedy, gdy wszystkie zadania planu są wykonane,
wymagane testy mają uczciwie zapisany wynik, raport PRE istnieje, a chronione
pliki PKG-008 pozostały bajtowo niezmienione.
