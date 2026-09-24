# PKG-005 — raport zamknięcia

Data: **16.09.2026**. Wynik pakietu: **COMPLETE**. Zakres: P16, P17, P18.

Gra prowadzi pełny standardowy konkurs na technicznej K120: 75-osobowe kwalifikacje,
pierwszą serię i finał, z prawidłowym awansem, remisami, odwróconą kolejnością, tabelą
po skoku, decyzjami jury i prawdziwym celem prowadzenia. Boty sterują tym samym
`JumpSimulation`, a 1–10 lokalnych profili zastępuje wskazane miejsca i korzysta
z bezpiecznego przekazania klawiatury. Sesja nadal istnieje wyłącznie w RAM.

## Status zadań

| Zadanie | Status | Wynik |
| --- | --- | --- |
| P16 — standardowy konkurs i jury | COMPLETE | Pula 75; 50/40→30; remisy powiększają grupę; reverse order z rzeczywistego wyniku; statusy administracyjne bez fikcyjnego zera; trzy fazy startu, 10 s aktywnego zielonego, hold/pauza, belka, coach i anulowanie serii. |
| P17 — przeciwnicy komputerowi | COMPLETE | 75 fikcyjnych wpisów; trzy profile decyzji; oddzielne seedy AI/wiatru; ten sam rdzeń i adapter wyniku; watched/fast identyczne; fast-forward oddaje UI sterowanie między porcjami. |
| P18 — profile i hotseat | COMPLETE | 1–10 profili RAM, stabilne ID niezależne od nazw, kolory/bindy, polskie znaki, jednoznaczna obsada oraz zwolnienie i nowy Enter przed każdym skokiem człowieka. |

## Reguły i źródła P16

Aktualność dokumentów sprawdzono 16.09.2026 na oficjalnej
[stronie dokumentów FIS](https://www.fis-ski.com/ski-jumping/documents):
ICR opublikowany 26.06.2026 oraz WC Men 2026/27 opublikowany 20.07.2026.

- [ICR Ski Jumping, June 2026](https://assets.fis-ski.com/f/252177/x/c67426c343/icr-ski-jumping-2024_e_clean.pdf):
  §415.4.1 — czerwone/żółte/zielone i 10 s; §422.1 — coach tylko w czerwonej fazie;
  §422.14 — 95% najdłuższego skoku i skompensowana odległość; §402.1.2 oraz
  §452.2.2 — decyzje jury, anulowanie i zachowanie ukończonej wcześniejszej serii.
- [WC Men Ski Jumping 2026/27](https://assets.fis-ski.com/f/252177/x/2d9d6fc3b4/wcrglj-men-2024-e_markedup.pdf):
  §4.3.1.3–4.3.1.8 — 50/40, remisy, top 30, reverse order i dodatkowy awans po
  długim upadku.
- Q-FIS-09: grupa odniesienia to zawodnicy podlegający bieżącemu awansowi. Przy
  aktywnej kompensacji rdzeń oblicza
  `d+(wind+juryGate+coachGate)/meterValue`. Składowe punktowe są już
  zaokrąglone do 0,1 pkt według P13. Źródła wymagają relacji **≥95%** i nie
  ustanawiają dodatkowego obcięcia skompensowanej długości, więc porównanie
  działa dokładnie na całkowitym liczniku: `candidate×100 >= longest×95`.
  To nie jest próg 95% HS coacha ani formatowanie do 0,5 m.
- Q-FIS-14: anulowana, nieukończona seria zachowuje próby w dzienniku audytowym,
  ale nie dolicza ich do oficjalnej tabeli; ukończona pierwsza seria pozostaje wynikiem.

## Istotne zmiany

- `src/sport/competition.ts` — czysty reducer, ranking, awans, dokładna długość
  skompensowana, statusy i anulowanie.
- `src/sport/startProcedure.ts` — trzy fazy, aktywny timer, hold jury i coach.
- `src/sport/ai.ts` — fikcyjna stawka, wersjonowane parametry decyzji i porcjowany runner.
- `src/player/profiles.ts` — profile, obsada, resolver bindów i `FreshEnterGate`.
- `src/app/competitionSession.ts` — jeden właściciel przejść konkursu w RAM.
- `src/render/competitionView.ts`, `src/app/main.ts`, `src/render/hillView.ts` —
  konfiguracja, handover, start, tabela, wynik i integracja prawdziwego lidera.
- `src/sport/jumpResult.ts` — wspólny adapter zakończonej symulacji dla treningu
  i konkursu; fizyka `pkg002-tune-1` nie została zmieniona.

## AI — parametry i sweep TUNE

Poniższe liczby pochodzą z 24 deterministycznych prób na trudność. To mały sweep
regresyjny, nie strojenie pod wybrany ranking ani pomiar jakości rozgrywki.

| Trudność | timing [tick] | błąd AOA | start [tick] | przygotowanie [m] / opóźnienie | średnia [m] | min–max [m] | średni `|timing|` | upadki |
| --- | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| Łatwa | ±24 | ±5,5° | 90–760 | 0,4–5,5 / 0–60 tick | 118,27 | 95,0–133,0 | 11,54 | 14/24 |
| Normalna | ±11 | ±2,6° | 70–620 | 3,5–9,0 / 0–18 tick | 127,52 | 114,0–133,5 | 5,42 | 0/24 |
| Trudna | ±4 | ±1,1° | 55–480 | 7,0–12,0 / 0–4 tick | 127,40 | 110,5–133,0 | 1,83 | 0/24 |

Trudność zmienia decyzje i powtarzalność. Nie istnieje mnożnik punktów ani osobna
fizyka człowieka. Niewielka różnica średniej Normalna/Trudna jest wynikiem krótkiego
sweepu i nie była „naprawiana” pod z góry wybraną kolejność.

## Weryfikacja

| Polecenie / sprawdzenie | Wynik |
| --- | --- |
| `npm run typecheck` | PASS — TypeScript 7.0.2 bez diagnostyk. |
| `npm test` | PASS — **21 plików, 144/144** testów. |
| `npm run build` | PASS — Vite 8.3.0; 26 modułów; JS **104,96 kB / 33,47 kB gzip**. |
| `npm run test:e2e` | PASS — Chromium, **13/13**; 1 SKIPPED: historyczny 60-sekundowy benchmark P15. |
| Q-FIS-09/10/14/16 | PASS — trzy granice 95%, jawna grupa, 75→50/40→30, remisy, reverse order, anulowanie oraz coach red/yellow/green. |
| Start/jury/rezygnacja | PASS — timeout, pauza bez zużycia zielonego, hold/resume, zmiana belki resetująca coacha i potwierdzenie rezygnacji. |
| AI | PASS — watched/fast ma identyczne zdarzenia, wynik i pomiar wiatru; sweep trzech trudności; ponad 100 porcji/yieldów w pełnym E2E. |
| Profile/hotseat | PASS — 1 i 10 profili, duplikaty nazw dozwolone, ID unikalne, polskie znaki, aktywne bindy, reset wejścia i świeży Enter. |
| Pełny konkurs | PASS — rzeczywista klawiatura; człowiek awansował przez trzy rundy i zakończył finalny scenariusz na 2. miejscu; cel w kolejnych skokach korzystał z niezerowego lidera. |
| Izolacja dowodów | PASS — końcowe SHA-256: **53/53** plików PKG-001–004 bez zmiany. |

## Dowody przeglądarkowe

- [konfiguracja](competition-setup-960x540.png),
  [zablokowany Enter na handover](handover-blocked-enter-960x540.png),
  [coach przyjęty w czerwonej fazie](start-red-coach-960x540.png);
- [wynik i bieżąca tabela](competition-result-table-960x540.png),
  [wynik końcowy](competition-final-960x540.png);
- finalny WebM pełnego konkursu:
  [video.webm](browser-artifacts/competition-pełny-konkurs--84c25--wynik-klawiatura-i-hotseat/video.webm)
  — 48,96 s, VP8, 800×450, 25 fps; obejmuje blokadę/zwolnienie Enter, start,
  pauzę oraz trzy skoki człowieka;
- [kontakt sheet handover + początek skoku](video-review/handover-jump-contact-sheet.png)
  i [kontakt sheet pełnego przebiegu](video-review/contact-sheet.png);
- drugi WebM potwierdza konfigurację 10 profili i rezygnację z potwierdzeniem.
  Artefakty Playwright są wyłącznie w `docs/evidence/PKG-005/browser-artifacts`.

## Wyniki odbioru

| Wynik | Status | Uzasadnienie |
| --- | --- | --- |
| TECHNICAL | PASS | Reducer, reguły, AI, hotseat, pełna ścieżka, build i testy są zielone. |
| VISUAL | PASS / OBSERVED | Pięć kluczowych ekranów oraz oba contact sheety obejrzano; tekst, fazy, nazwa aktywnego profilu, tabela i instrukcje są czytelne przy 960×540. |
| PLAYABILITY | **NOT RUN** | Nie uczestniczył zewnętrzny tester; automatyzacja i oględziny nie zastępują badania gracza. |

## Końcowe review

Jedno końcowe review objęło cały PKG-005, kryteria P16–P18, granice modułów,
wejście, źródła i ścieżki dowodów. Naprawiono cztery konkretne problemy:

1. zmiana belki jury lub restart procedury czyści teraz wcześniejszą decyzję coacha;
2. potwierdzona rezygnacja wskazuje dokładnie bieżący profil, także przy wielu rezygnacjach;
3. debug celu prowadzenia nie pokazuje starego celu poza żywym skokiem;
4. historyczny test PKG-004 nie zapisuje już artefaktu i porównuje go read-only.

Po poprawkach wykonano testy celowane, a następnie jeden finalny gate opisany wyżej.
Nie znaleziono niewykonanego kryterium ani potrzeby drugiego pełnego review.

## Ograniczenia

- Konkurs, profile i postęp istnieją tylko w RAM. Reload, transakcja, lease dwóch kart
  i replay są zakresem PKG-006.
- Techniczna K120 i jej kompensaty pozostają ADAPT / simulation-calibrated.
- Pula oraz nazwy botów są fikcyjne; sweep AI jest TUNE i nie dowodzi balansu.
- Nie powtarzano benchmarku P15, ponieważ renderer skoku/fizyka nie otrzymały zmiany
  uzasadniającej kolejny 60-sekundowy pomiar.
- Pełna dostępność/remap, realne skocznie i playtest pozostają w późniejszych pakietach.

Następny prompt: [PKG-006 — P19–P20](../../handoffs/PKG-006.md).
