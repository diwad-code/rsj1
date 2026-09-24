# PRE-PKG-008-FIXES — raport pakietu naprawczego

Data: 2026-09-19  
Status: **COMPLETE**

Pakiet wykonano przed i niezależnie od PKG-008. Nie zmieniono statusu,
handoffu ani dowodów PKG-008. `VISUAL PASS` nie został przyznany.

## Status zadań

| Zadanie | Status | Wynik |
| --- | --- | --- |
| 0. Sumy i baseline | COMPLETE | Sumy zgodne; typecheck, 178 testów i build PASS przed zmianami. |
| 1. Unikalne wyniki konkursów | COMPLETE | `sessionRevision` jest częścią `resultId`; ponowienie tego samego wyniku pozostaje idempotentne. |
| 2. `flightTimeout` | COMPLETE | Kontrolowany upadek: 0 m, minimalne noty, bez rekordu i bez wyjątku. |
| 3. Lease, replay i zapis | COMPLETE | Lease jest zwalniany po kolejce zapisów i ponownie przejmowany przed nowym konkursem; replay cofa się do starszego poprawnego; `inputs` są puste; martwy budżet usunięto. |
| 4. Wejście, zegar i profile | COMPLETE | Spóźnione wejścia są konsumowane, `alpha` usunięto, duplikaty klawiszy są odrzucane; starszy timestamp rAF nie wywołuje fałszywego overloadu. |
| 5. Reguły i cel prowadzenia | COMPLETE | Reguła 95% obejmuje całą serię; brak pustej aktywnej rundy; cel używa bieżącej średniej akumulatora wiatru. |
| 6. Dostępność i etykiety | COMPLETE | Glify `#`/`°`, polskie etykiety, dynamiczne reduced motion i brak tekstów technicznych poza `?debug`. |
| 7. Playwright | COMPLETE | Regresja, capture i benchmark rozdzielone; output trafia do `test-results/`. |
| 8. Skala i letterbox | COMPLETE | Całkowite 1×–4× oraz proporcjonalny fallback poniżej 480×270. |
| 9. Produkt i debug | COMPLETE | `KeyD` i widoki techniczne wyłącznie pod `?debug`; snapshot testowy zachowany. |
| 10. Bank sylwetek | COMPLETE | Jawne 31 klatek: 1/3/6/8/7/3/3; wspólne dla gry i replaya; arkusze kolorowe, czarne i przejścia zapisane. |
| 11. Cień, landmarki, hierarchia | COMPLETE | Cień zależny od powierzchni i wysokości; landmarki świata; dowód 1/5/10/20/30 m. |
| 12. Sygnały i SFX | COMPLETE | Sygnały progu/kontaktu/upadku i proceduralne SFX działają; test one-event-one-sound PASS, blokada AudioContext nie zatrzymuje gry. Użytkownik 19.09.2026 uznał dźwięk za nieistotny dla odbioru tego pakietu. |
| 13. HUD i wynik | COMPLETE | Minimalny HUD ruchu; wynik ma sportową hierarchię i usuniętą kolizję wierszy. |
| 14. Widoki konkursowe | COMPLETE | Karta jednego gracza, zwarta lista wielu, menu Backspace, graczowe CTA, wyrównanie i blokada startu przez jury. |
| 15. Weryfikacja i review | COMPLETE | Pełne bramki PASS, jedno review zamknięte, poprawki po obserwacjach użytkownika sprawdzone celowanymi regresjami. |

## Najważniejsze poprawki

- wyniki kolejnych konkursów nie kolidują w IndexedDB;
- awaryjny timeout lotu tworzy bezpieczny wynik upadku;
- lease nie blokuje następnej karty ani kolejnego konkursu w tej samej karcie;
- uszkodzony najnowszy replay nie zasłania starszego poprawnego;
- klawiatura i zegar nie zachowują spóźnionych wejść ani fałszywej pauzy po starszym rAF;
- cel prowadzenia i wynik używają tej samej średniej wiatru;
- normalny URL nie pokazuje narzędzi developerskich;
- canvas skaluje logiczne 480×270 wyłącznie całkowicie przy normalnych viewportach;
- trening, konkurs i replay korzystają ze wspólnego banku dopracowanych sylwetek;
- replay zachowuje wiek animacji wybicia i lotu, a upadek nie wraca do pierwszej klatki;
- proceduralne dźwięki wybicia, kontaktu, upadku i wyniku są odporne na brak Web Audio.

## Poprawki po odbiorze użytkownika

Użytkownik wskazał trzy problemy widoczne w pierwszej kolejności. Zostały
naprawione przed zamknięciem pakietu:

1. **Skrajne pochylenie do przodu.** Dodano karę efektywności aerodynamicznej
   dla absolutnego pitch poniżej −10° wyłącznie w fazie lotu. Nie ogranicza ona
   odległości sztucznie i nie zmienia tabeli AoA. Wersja fizyki:
   `pkg008-tune-5`. Prawidłowy skok z belki 8 pozostał na 125,0 m; najlepszy
   z testowanej siatki opóźnionych strategii exploita osiąga 112,9 m zamiast
   około 131 m, a żadna próba nie zbliża się do 150–160 m.
2. **T kontra R.** Telemark i lądowanie równoległe mają osobne siedmioklatkowe
   banki przygotowania i kontaktu. R utrzymuje równoległe narty, wyrównane buty
   i symetryczną amortyzację; T zachowuje wykrok. Rozróżnienie działa również
   w replayu i pierwszych klatkach odjazdu.
3. **Charakter wiatru.** Generator `pkg008-wind-2` ma zasiany dominujący kierunek,
   a amplituda zmienności maleje wraz z jego siłą. Słaby wiatr może przechodzić
   przez zero; silny pozostaje stabilny w jednym kierunku. Zachowano gładkość,
   limit ±3,2 m/s, deterministyczne seedy i konwencję znaków.

## Weryfikacja

### Baseline

| Polecenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 24 pliki, 178 testów |
| `npm run build` | PASS — 32 moduły, JS 146,31 kB |

### Finalny stan

| Polecenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 29 plików, 213 testów |
| `npm run build` | PASS — 33 moduły, JS 161,21 kB |
| `npm run test:e2e` | PASS — 22/22, 5,3 min |
| `npm run test:capture` | PASS — 12, SKIP — 4 archiwalne wycinki zależne od współdzielonego katalogu |
| `npm run test:benchmark` | NOT RUN — brak nowej obserwacji regresji wydajności; polecenie warunkowe w planie |

Test E2E zachowuje progi długości, stany terminalne i prawdziwe zdarzenia
klawiatury. Stabilizacja polega na oczekiwaniu na jawne zdarzenia/ticki i
ograniczonym ponowieniu wyłącznie zagubionej krawędzi, bez wstrzykiwania stanu.

## Dowody wizualne

Artefakty są tymczasowe i zgodnie z planem znajdują się w `test-results/`:

- `**/pkg008-pose-sheet-all-31.png`;
- `**/pkg008-pose-sheet-silhouette-all-31.png`;
- `**/pkg008-transition-inrun-3.png`;
- `**/pkg008-transition-takeoff-6.png`;
- `**/pkg008-transition-flight-8.png`;
- `**/pkg008-transition-landingprep-7.png`;
- `**/pkg008-transition-outrun-3.png`;
- `**/pkg008-transition-fall-3.png`;
- `**/pkg008-shadow-heights-1-5-10-20-30m.png`;
- `**/pkg008-telemark-vs-parallel-full-color.png`;
- `**/pkg008-telemark-vs-parallel-black-silhouette.png`;
- `**/pkg008-phase-takeoff-960x540.png` oraz pozostałe fazy;
- ekrany 960×540 i 1920×1080, replay, konfiguracja i tabela końcowa;
- cztery nagrania WebM pełnego skoku, konkursu, wejścia i sceny produkcyjnej.

Obejrzano finalne arkusze 31 klatek, czarne sylwetki, porównanie telemarku
z lądowaniem równoległym, macierz cienia oraz klatki wybicia, lotu,
przygotowania, upadku, konfiguracji i wyniku. To kontrola techniczna, nie
akceptacja VISUAL użytkownika.

## Końcowe review

Jedno końcowe review wykryło siedem problemów: chwilowy wiatr w celu prowadzenia,
brak ponownego przejęcia lease, rozjazd animacji replaya, reset klatki upadku,
kolizję tekstu wyniku, błędne CTA przy wstrzymaniu jury i martwy budżet replaya.
Wszystkie poprawiono celowanie. Dodano brakujące arkusze sylwetek i cienia oraz
test pojedynczego odtworzenia SFX. Ponowiono dotknięte testy i finalny zestaw;
nie wykonywano drugiego pełnego review.

## Sumy plików chronionych

| Plik | Końcowa suma SHA-256 | Wynik |
| --- | --- | --- |
| `docs/handoffs/PKG-008.md` | `83C035E2E0D37C5FDCF44166387DE226C7BCA09DBF3A67C9F5DDEB9080AD5076` | NIEZMIENIONY |
| `docs/NEXT_SESSION_PROMPT.md` | `83C035E2E0D37C5FDCF44166387DE226C7BCA09DBF3A67C9F5DDEB9080AD5076` | NIEZMIENIONY |
| `docs/evidence/PKG-008/REPORT.md` | `A68C2F4B7AADAC3C4E22498BC3C08DCAFFD86937E5AFD5E80A50C660EAB85DBE` | NIEZMIENIONY |

## Ograniczenia i następny krok

- Manualny odsłuch jakościowy: **POMINIĘTY DECYZJĄ UŻYTKOWNIKA**; zachowanie
  one-event-one-sound i odporność na blokadę Web Audio mają testy automatyczne.
- `VISUAL PASS`: **NIEPRZYZNANY** — może go nadać wyłącznie użytkownik.
- PKG-008 nie został rozpoczęty ani zmieniony.
- Następnym krokiem pozostaje istniejący
  [handoff PKG-008](../../handoffs/PKG-008.md); nie rozpoczęto go w tej sesji.

## Uzupełnienie 19.09.2026 — reguła kalibracji i trzy obserwacje

Użytkownik wprowadził twardą regułę empirycznej kalibracji skoczni realnych
(19.09.2026) oraz trzy obserwacje do reguł gry:

1. automatyczna belka jury dostosowuje się do prognozy wiatru dla bezpiecznych odległości;
2. za HS trudność lądowania rośnie progresywnie, telemark jest trudniejszy niż lądowanie równoległe, a dostatecznie dalekie odległości są niemożliwe do ustania;
3. zbyt wczesne przygotowanie wyraźnie skraca lot, a zbyt wczesne T rozstrzyga się w lądowanie równoległe albo upadek.

### Wdrożenie

- **Automatyczna bezpieczna belka — PASS.** Dla każdej próby konkursowej
  prognoza korzysta z tego samego deterministycznego pola wiatru, które otrzyma
  skok. Jury wybiera najwyższą belkę mieszczącą przewidywany skok umiejętny w
  bezpiecznym celu obiektu; ręczna zmiana może belkę obniżyć, ale nie podnieść
  ponad bezpieczny limit. Dla technicznej K120: −2 m/s → belka 12, 0 m/s → 8,
  +1 m/s → 2, +2 m/s → najniższa 1. Dane mają status
  `simulation-calibrated`, nie są przedstawiane jako statystyka realnej skoczni.
- **Trudność za HS — PASS.** Do HS134 współczynnik trudności wynosi 1. Powyżej
  HS maleje ciągle do zera: telemark jest niemożliwy od 148 m, lądowanie
  równoległe od 162 m. Przykładowo przy 141 m mnożnik wynosi odpowiednio
  0,50 i 0,75. Nie ma ukrytego losowania ani sztucznego obcięcia odległości.
- **Wczesne przygotowanie — PASS.** Wejście w przygotowanie przed 0,4 s lotu
  dostaje 0,72× nośności i 1,38× oporu przez fazę podejścia. Natychmiastowe T
  blokuje telemark i przechodzi w dwie nogi; jeśli kontakt jest zbyt trudny,
  kończy się upadkiem. Próba kontrolna skraca się z 125,0 m do 41,4 m.
  Późne prawidłowe T nadal daje telemark.

Wersje po zmianie: fizyka `pkg008-tune-5`, skocznia techniczna `3.1.0`, wiatr
`pkg008-wind-2`. Regułę empirycznej kalibracji zapisano w `AGENTS.md`,
`docs/GAMEPLAY_SPEC.md`, `docs/CONTENT_PLAN.md`, `docs/QA_ACCEPTANCE.md` i
`docs/DECISIONS_RISKS.md`. Każda realna skocznia bez wymaganych statystyk FIS
pozostaje `BLOCKED / UNRESOLVED`. Bez ADR i bez dodatkowego raportu.
