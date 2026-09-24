# PKG-006 — transakcyjny zapis sesji i replay

**Zakres:** P19 (trwała sesja i wynik), P20 (zapis i odtwarzanie replaya).
**Status pakietu:** COMPLETE.

| Zadanie | Status |
|---|---|
| P19 — trwała sesja i wynik | COMPLETE |
| P20 — zapis i odtwarzanie replaya | COMPLETE |

## 1. Format zapisu i wersje

Jeden magazyn IndexedDB `retro-ski-jumping`, `DB_VERSION = 1`, bez pustych warstw pod
przyszłe tryby. Magazyny: `sessions`, `results`, `records`, `replays`, `leases`.
Kod migracji nie istnieje — pierwszy format ma tylko numer, zgodnie z TECHNICAL_DESIGN §6.

| Klucz wersji | Wartość |
|---|---|
| `DB_VERSION` | 1 |
| `SESSION_SCHEMA_VERSION` | 1 |
| `REPLAY_SCHEMA_VERSION` | 1 |
| `REPLAY_FORMAT_VERSION` | `pkg006-replay-1` |
| wersje treści w zapisie | `rules pkg004-rules-1`, `physics pkg002-tune-1`, `hill 1.0.0` |

`StoredSession` zawiera wyłącznie dane potrzebne do odtworzenia stanu: `CompetitionState`,
profile, konfigurację (liczba graczy, trudność AI), seedy AI/wiatru, komplet wersji,
minimalne statystyki i numer rewizji. Nazwy profili są zapisywane jako tekst; polskie
znaki wracają bez zmian (test `polskie znaki w zapisie`).

## 2. Transakcja zatwierdzenia skoku

`commitAttempt` wykonuje **jedną** transakcję `readwrite` nad wszystkimi magazynami:

1. sprawdzenie lease — cudzy ważny lease przerywa całość (`lease-denied`);
2. odświeżenie własnego lease;
3. `results.get(resultId)` — duplikat kończy operację idempotentnie;
4. zapis wyniku;
5. ewentualny rekord konkursowy (polityka §3);
6. replay + przycięcie do `REPLAY_LIMITS.automaticKeep = 1`;
7. zapis sesji ze statystykami, o ile rewizja nie cofa postępu.

Każda awaria w środku wywołuje `transaction.abort()`, więc na dysku nigdy nie zostaje
połowa transakcji. Błąd zapisu i `QuotaExceeded`/`DataCloneError` nie nadpisują poprawnych
danych: stan RAM zostaje, ekran pokazuje pasek `NIE ZAPISANO`, a klawisz `Z` ponawia
dokładnie pierwszą niezapisaną transakcję.

Checkpoint powstaje po każdym rozliczonym slocie (człowiek i bot) oraz raz przy
utworzeniu/wznowieniu sesji — zapisany stan po slocie N jest stanem przed startem slotu N+1.

## 3. Rekord konkursowy (GAMEPLAY_SPEC §9)

`isOfficialRecordCandidate` przyjmuje wyłącznie ukończony, ustany skok konkursowy.
Trening, upadek i każdy status administracyjny (w tym DSQ) są odrzucane.
Klucz rekordu to `rules|physics|hill`, więc zmiana wersji tworzy osobną kategorię.
Przy identycznej długości rekord nie nadpisuje wcześniejszej daty (`improvesRecord` używa `>`).

## 4. Lease jednej aktywnej karty

Rekord `leases` w bazie jest źródłem prawdy, `BroadcastChannel` tylko przyspiesza reakcję.
TTL 20 s, heartbeat 7 s. Identyfikator karty żyje w `sessionStorage`, więc **reload nie
odbiera sobie prawa zapisu**, a druga karta ma własny identyfikator.

- Karta bez lease nie zapisuje i nie przejmuje sesji po cichu — `runCommit` odmawia zapisu
  przed dotknięciem bazy.
- Przejęcie jest jawne (klawisz `L`) i możliwe dopiero po wygaśnięciu albo zwolnieniu lease.
- Heartbeat i odpytywanie działają wyłącznie na ekranach konkursu; trening i menu nie
  wykonują pracy w tle (patrz §8, poprawka po review).

To lokalna blokada dwóch kart, nie mechanizm rozproszony ani zabezpieczenie anty-cheat.

## 5. Replay

`JumpRecorder` rejestruje ostatni zatwierdzony skok człowieka: wersje reguł/fizyki/skoczni,
mały stan początkowy (belka, belka jury, coach, seed i wersja wiatru, identyfikator skoczni),
akcje z tickiem i numerem kolejności, próbki prezentacyjne **30 Hz** (co 4. tick przy 120 Hz)
oraz dyskretne zdarzenia symulacji w dokładnych tickach. Klatki Canvas nie są zapisywane.
Replay trafia do tej samej transakcji co wynik albo transakcja odmawia całości.

`ReplayPlayer` czyta wyłącznie próbki — moduł nie importuje `JumpSimulation` ani parametrów
fizyki, więc stary replay działa po zmianie solvera. Faza pochodzi z próbki „nie później niż
tick”, więc interpolacja nie opóźnia zmiany fazy względem zarejestrowanego zdarzenia.

Ekran powtórki (`MENU → OSTATNIA POWTÓRKA` albo `V` w konkursie): `SPACJA` play/pauza,
`←/→` przewijanie w obie strony, `↑/↓` tempo (×0,25 / ×0,5 / ×1 / ×2), `R` od początku,
`BACKSPACE` wyjście. Odtwarzanie nie emituje zdarzeń punktacji, nie aktualizuje rekordu
i nie zmienia postępu konkursu. HUD pokazuje zużycie budżetu (`REPLAY_LIMITS.budgetBytes`
= 20 MB, TUNE z TECHNICAL_DESIGN §7). Niezgodna wersja danych wizualnych przełącza ekran
w prosty widok techniczny z komunikatem zamiast cichego przeliczenia nową fizyką.

## 6. Nowe i zmienione pliki

Nowe: `src/storage/schema.ts` (382), `src/storage/db.ts` (246), `src/storage/lease.ts` (163),
`src/replay/recorder.ts` (115), `src/replay/player.ts` (154), `src/render/replayView.ts` (164),
`tests/persistence.test.ts` (377), `tests/replay.test.ts` (273),
`tests/browser/persistence.spec.ts` (403).

Zmienione: `src/app/competitionSession.ts` (zapis/replay/`toStoredSession`/wznowienie),
`src/app/main.ts` (bootstrap zapisu, wznowienie, ekran powtórki, paski stanu, debug),
`src/render/competitionView.ts` (panel wznowienia i rekordu na ekranie konfiguracji),
`tests/support/jumpHarness.ts` (`events` z tickiem i kolejnością, hook `onStep`),
`playwright.config.ts` i specy przeglądarkowe (artefakty do PKG-006).

Nowa zależność deweloperska: `fake-indexeddb@6.2.5` — pozwala testować prawdziwe transakcje
IndexedDB, w tym `abort`, w vitest.

## 7. Wyniki poleceń (finalny kod)

| Polecenie | Wynik |
|---|---|
| `npm run typecheck` | PASS |
| `npm test` | PASS — **23 pliki, 168/168** (baza PKG-005: 21/144, +2 pliki, +24 testy P19–P20) |
| `npm run build` | PASS — Vite, 32 moduły, JS 132,83 kB / 41,95 kB gzip |
| `npm run test:e2e` | PASS — **17/18**, 1 świadomie pominięty historyczny benchmark P15 |

Dowody SHA-256: `evidence-hashes-before.txt` i `evidence-hashes-after.txt` —
**78/78 plików PKG-001–005 identycznych** przed i po finalnych testach.
Playwright zapisuje wyłącznie do `docs/evidence/PKG-006/browser-artifacts`
(artefakty runnera w podkatalogu `playwright-output`, bo Playwright czyści `outputDir`).

### Wymagane dowody

| Dowód | Gdzie |
|---|---|
| ten sam `resultId` dwa razy → jeden wynik i jeden rekord/statystyka | `tests/persistence.test.ts` |
| awaria między zapisem wyniku i sesji nie zostawia połowy transakcji | `tests/persistence.test.ts` (hook `afterResultWrite`) |
| odmowa zapisu zachowuje poprzednią bazę i stan RAM | `tests/persistence.test.ts` |
| reload po wyniku wraca przed następnego właściwego zawodnika, bez podwójnych punktów | `tests/persistence.test.ts` + `tests/browser/persistence.spec.ts` |
| reload podczas niezatwierdzonego skoku wraca do checkpointu przed próbą | `tests/persistence.test.ts` |
| uszkodzony/nieznany format odrzucony bez kasowania danych | `tests/persistence.test.ts` |
| duplikaty slotów/resultId, nieznany uczestnik, NaN | `tests/persistence.test.ts` |
| dwie karty: tylko właściciel lease zapisuje; wygaśnięcie i jawne przejęcie | `tests/persistence.test.ts` + `tests/browser/persistence.spec.ts` |
| trening/DSQ/upadek nie aktualizują oficjalnego rekordu | `tests/persistence.test.ts` + `tests/browser/persistence.spec.ts` |
| replay odtwarza pozycje i zdarzenia oryginału, `recordedResult` identyczny | `tests/replay.test.ts` |
| pauza/tempo/scrub nie zapisują ani nie naliczają wyniku | `tests/replay.test.ts` + `tests/browser/persistence.spec.ts` |
| replay starszej `physicsVersion` działa z próbek, bez bieżącego solvera | `tests/replay.test.ts` |
| pełna ścieżka klawiaturą: konkurs→wynik→reload→wznowienie→powtórka | `tests/browser/persistence.spec.ts` |
| zrzuty zapisu/wznowienia/powtórki | `browser-artifacts/pkg006-*.png` |
| nagranie odtworzenia | `video-review/pkg006-zapis-reload-wznowienie-powtorka.webm` |

Zrzuty: `pkg006-setup-bez-zapisu`, `pkg006-zapis-po-wyniku`, `pkg006-setup-wznowienie`,
`pkg006-wznowiony-konkurs`, `pkg006-powtorka-odtwarzanie`, `pkg006-powtorka-scrub`,
`pkg006-powtorka-widok-techniczny`, `pkg006-druga-karta-tylko-odczyt`, `pkg006-przejecie-lease`
(wszystkie 960×540).

## 8. Końcowe review

Jedno review po całym pakiecie. Wykryte i naprawione usterki:

1. **Zapis sesji bez strażnika rewizji** — ponowienie starszej, nieudanej transakcji mogło
   cofnąć postęp sesji. Przywrócono warunek `stored.revision <= input.session.revision`;
   ponowienie uzupełnia brakujący wynik, ale nie cofa checkpointu. Nowy konkurs startuje
   od rewizji zapisanej sesji, więc świadomie ją nadpisuje.
2. **Gubiony błąd zapisu** — pojedynczy `pendingCommit` był nadpisywany przez kolejne udane
   zapisy i pasek `NIE ZAPISANO` znikał. Wprowadzono `failedCommit` (pierwsza niezapisana
   transakcja), który znika dopiero po udanym ponowieniu.
3. **Ciche przejęcie zapisu przez drugą kartę** — karta w trybie odczytu, po wygaśnięciu
   cudzego lease, przejmowała zapis sama. Dodano warunek w `runCommit`: bez roli właściciela
   nie dotykamy bazy, przejęcie wymaga klawisza `L`.
4. **Praca w tle podczas gry** — heartbeat lease pisał do IndexedDB co 3 s także w treningu
   i menu, co wywoływało udokumentowaną auto-pauzę limitu 8 ticków (realna regresja ujawniona
   przez `jump.spec` i `competition.spec`). Heartbeat i odpytywanie ograniczono do ekranów
   konkursu, TTL podniesiono do 20 s, a heartbeat do 7 s.
5. **Koszt rysowania powtórki** — `JSON.stringify` replaya liczony w każdej klatce; teraz raz
   przy otwarciu ekranu. `frame()` przekazywany do podfunkcji zamiast wielokrotnego liczenia.
6. **Zasłonięte elementy UI** — panel HUD powtórki zakrywał dolną część profilu skoczni,
   a pasek stanu zapisu nachodził na nagłówek ekranu. Oba przesunięte.
7. **Etykiety** — seria we wznowieniu pokazywana po polsku (`KWALIFIKACJE`), a nie jako
   identyfikator techniczny.

Po review poprawiono wyłącznie te ścieżki i powtórzono komplet czterech poleceń. Drugiej
pełnej rundy audytu nie wykonano.

## 9. Odbiór

| Kategoria | Wynik |
|---|---|
| TECHNICAL | PASS — typecheck, 168 testów jednostkowych, build i 17/18 e2e na finalnym kodzie |
| VISUAL | PASS — 9 nowych zrzutów 960×540 sprawdzonych wzrokowo; profil, markery i panele czytelne, bez nachodzenia |
| PLAYABILITY | NOT RUN — brak zewnętrznego testera; nie deklarujemy odbioru graczy |

## 10. Ograniczenia i ryzyka

- IndexedDB jest origin-scoped. Przeniesienie między domenami wymaga eksportu/importu —
  to zakres P37, nie tego pakietu. Trwałość IndexedDB nie jest kopią zapasową.
- Lease chroni przed zwykłym konfliktem dwóch kart. Nie jest blokadą sieciową ani
  zabezpieczeniem anty-cheat. Gdy karta zniknie bez zwolnienia lease, druga musi odczekać
  do 20 s na wygaśnięcie.
- Gdy zapis wyniku N się nie powiedzie, a zapis N+1 przejdzie, stan sesji jest kompletny
  (zawiera obie próby), ale w magazynie `results` brakuje wiersza N do czasu ponowienia
  klawiszem `Z`. Rekord i statystyki sesji pozostają spójne.
- Replay jest dowodem i funkcją lokalną, nie formatem publicznego API. Automatycznie
  trzymamy tylko ostatni skok człowieka; biblioteka ręcznych zapisów należy do P29/P37.
- Skoki botów nie są nagrywane — rejestrujemy wymagany „ostatni zatwierdzony skok człowieka”.
- Techniczna K120 i kompensaty pozostają ADAPT/simulation-calibrated.
- Auto-pauza po limicie 8 ticków pozostaje celowa. Testy przeglądarkowe wznawiają wyłącznie
  ten udokumentowany powód i ponawiają prawdziwą akcję klawiatury.
- `shell.spec.ts` przywraca `visibilityState` do `visible` przed wznowieniem: przy dokumencie
  trwale ukrytym przeglądarka dławi `requestAnimationFrame`, więc pętla wpadała w auto-pauzę
  niezależnie od poprawności gry. Scenariusz Q-SIM-05 (pauza po ukryciu karty i świadome
  wznowienie po powrocie) pozostaje sprawdzony.
- Benchmark P15 nie był powtarzany — renderer nie zmienił się w sposób mierzalny.

## 11. Następny pakiet

**Korekta po zamknięciu pakietu:** użytkownik obejrzał grę i odrzucił całą oprawę graficzną.
Produkcja zawartości została zamrożona do czasu akceptacji wyglądu, animacji, sterowania
i odczucia fizyki. Pierwotnie zaplanowany PKG-007 / P21-H01 (Lillehammer normalna)
przesunął się na **PKG-009**; jego nieaktualny prompt zachowano jako
[`docs/handoffs/PKG-007-rev01.md`](../../handoffs/PKG-007-rev01.md).

Aktywny PKG-007 to **P41 — empiryczny audyt oprawy** z porównaniem do Deluxe Ski Jump 2
i Ski Jump International 3; PKG-008 to P42, przebudowa do akceptacji użytkownika (bramka V).
Aktywny prompt: [`docs/NEXT_SESSION_PROMPT.md`](../../NEXT_SESSION_PROMPT.md),
kopia kanoniczna: [`docs/handoffs/PKG-007.md`](../../handoffs/PKG-007.md).
