# PKG-011 / H03 — przeglądarkowe dowody funkcjonalne V

Wszystkie poniższe pliki pochodzą z **rzeczywistych uruchomień gry** w
Playwright/Chromium na zbudowanym `dist` (Canvas2D 480×270 wyświetlany
w **960×540**). Sterowano klawiaturą; nie użyto fixture grafiki, nie
ustawiano stanu symulacji ani nie kopiowano cudzych obrazów. Długie
loty i ryzyko podpórki przebadano osobno w `tests/h03.test.ts`:
**147,0 m zapisane po obcięciu**, dwie nogi bez podpórki. Tego metrażu
**nie** osiągnięto w filmowanych próbach przeglądarkowych: w nowym
przebiegu R (1. próba, ręczna belka 24) to **129,52 m surowo**, T
(2. próba, ręczna belka 23) to **125,42 m surowo**, obie ustane.
Pilot z rzeczywistej klawiatury prowadził cel pitch względem przepływu
z marginesem na opóźnienie odczytu i przygotował lądowanie dopiero przy
zejściu na ≤10 m nad stokiem (po ≥2,6 s lotu); AUTO jury i fizyka
pozostały bez zmian. To nie jest dowód powtórzenia rekordu
w przeglądarce ani empiryczną statystyką zawodów.

| Artefakt | Rzeczywista zawartość | SHA-256 |
|---|---|---|
| [h03-menu-960x540.png](artifacts/h03-menu-960x540.png) | Menu z wybraną H03 K120/HS137 | `3ca9a327206d22743dba2e15045114482a77a13b3fab5ec998b6e00a0cadd96a` |
| [h03-production-gate-960x540.png](artifacts/h03-production-gate-960x540.png) | Produkcyjna scena H03 przy belce treningu, przed rozbiegiem | `8989e0638eab59c0c894f208171b9a6710f07e9826cad7e4e7bf070d3515f54d` |
| [h03-technical-960x540.png](artifacts/h03-technical-960x540.png) | Techniczny profil i linie P104/K120/HS137 oraz znaczniki z tej samej mapy metrażu | `c2c5d9f66588e1d27cbdc127b67e524c52aa4b345c02f2892b362179241f68c0` |
| [h03-real-result-parallel-960x540.png](artifacts/h03-real-result-parallel-960x540.png) | Ekran wyniku po ustanej próbie z R, 129,52 m surowo, ręczna belka 24; 1. próba | `61419396254b01ce639661f94d50f74895d5479609e0b5bf58cf0a9e15c4a96c` |
| [h03-real-result-telemark-960x540.png](artifacts/h03-real-result-telemark-960x540.png) | Ekran wyniku po ustanej próbie z T, 125,42 m surowo, ręczna belka 23; 2. próba | `f0cbabe17c8157b196fcc5960aacdfac1b7e83b25d8c7b5c6aa07fbd7f296c2b` |
| [h03-real-replay-flight-960x540.png](artifacts/h03-real-replay-flight-960x540.png) | Kadr lotu replaya odrębnego skoku konkursowego, zapisany i odtwarzany bez ponownej punktacji | `29d7774228378dd9a16d3e6dfb2f2705082bb4d7172b769b743408973da3bd86` |
| [h03-real-keyboard-jumps-960x540.webm](artifacts/h03-real-keyboard-jumps-960x540.webm) | Pełny przebieg obu rzeczywistych klawiaturowych prób treningowych (1. R, 2. T), wraz z najazdem, lotem, kontaktem i wynikiem | `e935a3d1cb64a24a4096465ba0048a7b4ffe590eb29a57612c7097096c88d09d` |

W sesji Playwright sprawdzono cykliczną nawigację czterech skoczni w obie
strony, trening oraz konkurs H03, ręczny ruch belki jury i blokadę jury,
składnik wiatru w wyniku, checkpoint IndexedDB po skoku, boty, reload i
wznowienie, izolację H03 od technicznej/H02, replay bieżącego skoku, brak
przeliczenia odległości po przewijaniu oraz blokadę replaya po podmianie
wersji na `h03-inspired-0`. Widok produkcyjny przed skokiem i widok
techniczny utrwalono; **brak osobnego zrzutu K/HS z produkcyjnej kamery
podczas przelotu**. Zrzut menu lub fixture nie zastępuje filmu z gry.

Wykonane polecenia (finalny kod, po `npm run build` **PASS**, Vite 8.3.0,
37 modułów):

| Polecenie | Wynik |
|---|---|
| `$env:H03_CAPTURE_ARTIFACTS='1'; npx playwright test tests/browser/h03.spec.ts --workers=1 --output=docs/evidence/PKG-011/tmp-browser-h03` | **4/4 PASS** po przebudowie pilota; 2/2 ustane i ≥110 m w klawiaturowym treningu; zrzuty, wideo i replay ponownie zapisane tylko po powodzeniu prób |
| `npx playwright test tests/browser/h01.spec.ts --workers=1 --output=docs/evidence/PKG-011/tmp-browser-h01` | **2/3 PASS, 1 FAIL**: brak potwierdzenia `gateOpen` po `ArrowRight` w pierwszym teście; dokładna przyczyna nieustalona |
| `npx playwright test tests/browser/h01.spec.ts --grep "keyboard attempt" --workers=1 --output=docs/evidence/PKG-011/tmp-browser-h01-retry` | **1/1 PASS**; razem wszystkie 3 przypadki H01 przeszły w dwóch przebiegach, pojedyncza pełna inwokacja nie przeszła |
| `npx playwright test tests/browser/h02.spec.ts --workers=1 --output=docs/evidence/PKG-011/tmp-browser-h02` | **2/3 PASS, 1 FAIL**: drugi proces preview podczas równoległej inwokacji H01 zajął ten sam port 4173; reload w trzecim teście dostał `ERR_CONNECTION_REFUSED` |
| `npx playwright test tests/browser/competition.spec.ts --grep "zielone światło pod wstrzymaniem jury" --workers=1 --output=docs/evidence/PKG-011/tmp-browser-common` | **1/1 PASS** |

Po zabezpieczeniu katalogów wynikowych testów H01/H02 ich pełne,
**sekwencyjne** inwokacje przeszły osobno **3/3 i 3/3**; powyższe
nieudane wspólne uruchomienie pozostaje faktem historycznym. Na finalnym
teście H03 wykonano również `npm run typecheck` — **PASS**. Zwykły
Playwright zapisuje wyłącznie do własnego `test.info().outputPath()`;
trwałe pliki H03 publikowane są wyłącznie po skutecznym retake'u z jawnie
ustawionym `H03_CAPTURE_ARTIFACTS=1`.

**Usterka operacyjna przy regresji H02 — LOSS ACCEPTED/DOCUMENTED:**
nie należało uruchamiać istniejących testów H02 z ich
hardkodowanymi ścieżkami `docs/evidence/PKG-010/artifacts/`. Testy 2 i 3
tej inwokacji nadpisały **sześć starych artefaktów PKG-010**; zapisane tam
obecnie pliki **nie odpowiadają** hashom historycznym w
`docs/evidence/PKG-010/ARTIFACTS.md`. Wcześniejszy opis braku `.git` był
wtedy prawdziwy: później przywrócono katalog `.git` z kopii. Kopia przekazana
przez użytkownika w `C:\retro-ski-jumping\retro-ski-jumping-23-09-2026-backup\docs\evidence`
zawiera tylko PKG-001–009. Odtworzona `.git` ma jeden początkowy commit
`9b4a5ad`, bez indeksowanych/osiągalnych/reflogowych artefaktów H02;
żaden z 25 nieosiągalnych blobów nie odpowiada sześciu historycznym SHA-256.
**Oryginałów nie odzyskano.** Użytkownik początkowo zaakceptował stratę,
na chwilę cofnął decyzję, żeby sprawdzić `.git`, a po tym sprawdzeniu
odpowiedział „dobra, trudno” i poprosił o dokumentację/handoff. To jawna
akceptacja **udokumentowanej utraty**, nie odzyskanie plików ani zgoda na
udawanie starych sum. Historyczny manifest i nadpisane pliki pozostają
nietknięte; nie ustanowiono nowej bazy dowodowej. Nie wykonano commit,
reset ani restore. Po poprawce ścieżek zrzutów pełny H02 zaliczono
bezpiecznie (3/3 PASS); domyślnie zapisuje tylko do katalogu testu.

**VISUAL USER PASS 23.09.2026:** użytkownik otrzymał sześć rzeczywistych
zrzutów H03 960×540 i link do pełnego WebM, a następnie orzekł
„skocznia obersdorff jest ok”. Wcześniej nie miał jeszcze werdyktu;
nie ma potwierdzenia, że obejrzał cały film. Sam test funkcjonalny nie
stanowił werdyktu wizualnego. Zewnętrzny jakościowy PLAYABILITY **NOT RUN**.
