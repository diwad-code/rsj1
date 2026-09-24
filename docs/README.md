# Dokumentacja projektu

Data researchu: **2026-09-21**. Język produktu i dokumentacji: polski.
**Stan 24.09.2026: PKG-001–013 COMPLETE; P21–P22 COMPLETE (H01–H04 z odbiorem
użytkownika; ustawienia/remap/dostępność bez odbioru VISUAL);
następny PKG-014/P23–P25.** Grywalne są techniczna K120/HS134,
[Lillehammer inspirowana K90/HS98](hills/H01.md),
[Zakopane inspirowane K125/HS140](hills/H02.md) i
[Oberstdorf inspirowany K120/HS137](hills/H03.md), a także
[Planica inspirowana K200/HS240](hills/H04.md).
Dowody:
[PKG-009](evidence/PKG-009/REPORT.md), [PKG-010](evidence/PKG-010/REPORT.md),
[PKG-011](evidence/PKG-011/REPORT.md), [PKG-012](evidence/PKG-012/REPORT.md),
[zrzuty/wideo H03](evidence/PKG-011/ARTIFACTS.md) oraz
[zrzuty/wideo H04](evidence/PKG-012/ARTIFACTS.md).
Nowe polecenia użytkownika dopuszczają skocznie inspirowane realnymi:
K/HS muszą się zgadzać, każda skocznia ma odrębną sylwetkę i kolorystykę,
a gracz może ustać czysto na dwie nogi co najmniej 2 m za prawdziwym
rekordem z karty. Szczegóły obowiązującej zasady są w [AGENTS.md](../AGENTS.md).
Bazowa bramka V oprawy została zaakceptowana 22.09.2026; użytkownik
zaakceptował H01, H02 („Akceptuję H02”) i H03 23.09.2026 (H03:
„skocznia obersdorff jest ok”). To werdykt użytkownika VISUAL PASS dla H03,
**nie** dowód obejrzenia całego filmu. Zewnętrzny jakościowy playtest NOT RUN.
Sześć pierwotnych artefaktów PKG-010 nadpisanych podczas regresji H02 nie
zostało odnalezionych w zaufanych źródłach; użytkownik zaakceptował
udokumentowaną utratę („dobra, trudno”). Bieżące pliki nie są oryginałami,
stary manifest pozostaje nietknięty; nie ustanowiono nowej bazy dowodów.
Wcześniej odtworzono główny katalog `.git` (jeden początkowy commit `9b4a5ad`,
25 niedopasowanych nieosiągalnych blobów), ale projekt jest teraz prowadzony
**bez Git**: zapisuj bezpośrednio na dysku, bez poleceń Git, konfiguracji ani
odtwarzania repozytorium. Główny `.git` usunięto 23.09.2026, głównego
`.gitignore` nie było. Backup
`C:\retro-ski-jumping\retro-ski-jumping-23-09-2026-backup` (stan tylko do PKG-009)
zawiera własne `.git` i `.gitignore`; pozostaw cały backup nietknięty i nie
używaj ich. Historyczna utrata dowodów jest zaakceptowana, nie odzyskana.
H04 użytkownik zaakceptował 24.09.2026 („resztę akceptuje”) po dwóch
wskazanych poprawkach (ciemniejsza banda rozbiegu, belka AUTO niżej o 2),
które wykonano. [Aktywny handoff — PKG-014/P23–P25](NEXT_SESSION_PROMPT.md):
sezon, własny kalendarz i silnik KO.

## Jak czytać

| Kolejność | Dokument | Odpowiada na pytanie |
| ---| ---| ---|
| 1 | [Research](research/SJ3_RESEARCH.md) | Czym SJ3 rzeczywiście było i co tworzy jego charakter? |
| 2 | [Źródła](research/SOURCES.md) | Skąd pochodzą ustalenia i jakie są ich ograniczenia? |
| 2a | [Współczesne skoki](research/MODERN_SKI_JUMPING.md) | Które aktualne reguły i oznaczenia zastępują historyczne rozwiązania SJ3? |
| 3 | [GDD](PRODUCT_GDD.md) | Jaką grę budujemy i co oznacza pełne v1? |
| 4 | [Mechanika](GAMEPLAY_SPEC.md) | Jak dokładnie działa skok i rywalizacja? |
| 5 | [Oprawa](ART_UI_AUDIO.md) | Jak uzyskać współczesny pixel art w formie gry DOS? |
| 6 | [Technika](TECHNICAL_DESIGN.md) | Jak zaimplementować to w przeglądarce? |
| 7 | [Zawartość](CONTENT_PLAN.md) | Jakie skocznie, zasoby i tryby trzeba wykonać? |
| 8 | [Plan](IMPLEMENTATION_PLAN.md) | W jakiej kolejności wykonać komplet prac? |
| 9 | [QA](QA_ACCEPTANCE.md) | Jak udowodnić działanie i ocenić rozgrywkę? |
| 10 | [Decyzje](DECISIONS_RISKS.md) | Co ustalono, co jest adaptacją, a co wymaga pomiaru? |
| 11 | [Następna sesja](NEXT_SESSION_PROMPT.md) | Jak rozpocząć wykonanie bez odtwarzania kontekstu? |
| 12 | [Weryfikacja dokumentacji](VALIDATION_REPORT.md) | Co rzeczywiście sprawdzono w tej dostawie, a czego jeszcze nie wykonano? |
| 13 | [Auto-review](SELF_REVIEW.md) | Jakie problemy znaleziono po pierwszej dostawie i jak je poprawiono? |
| 14 | [Pakiety i przekazanie](PACKAGE_WORKFLOW.md) | Co wykona każda sesja i jak przygotować prompt następnej? |

## Statusy i pierwszeństwo

- **FACT** — informacja potwierdzona wskazanym źródłem; dotyczy konkretnej wersji SJ3 albo API przeglądarki.
- **OBSERVED** — własna obserwacja obejrzanego obrazu. Nie oznacza rozegrania gry.
- **DESIGN / ADAPT** — decyzja dotycząca nowej gry, także wtedy, gdy przypomina SJ3.
- **TUNE** — początkowa wartość lub hipoteza do sprawdzenia w prototypie.
- **UNRESOLVED** — brak dostatecznego dowodu; nie należy przedstawiać tego jako ustalonego faktu.

Wymagania użytkownika mają pierwszeństwo. Doprecyzowanie o współczesnych zasadach i prawdziwych liniach skoczni jest wiążące: dawna punktacja SJ3 nie jest trybem domyślnym ani planowaną alternatywą v1. Dla nowej gry obowiązują GDD i specyfikacje. Research SJ3 opisuje pierwowzór, a nie automatycznie wymogi zgodności. Plan wykonania wskazuje kolejność, nie zastępuje specyfikacji mechanik.

Zasada pracy w kolejnych sesjach: po każdym ukończonym pakiecie wymagany jest nowy samodzielny prompt, jego archiwum i aktualizacja `NEXT_SESSION_PROMPT.md`. Pierwszy pakiet to P01–P04; nie wykonywać całego P01–P12 w jednej sesji na podstawie starego handoffu. Wznowienie po przerwaniu kontynuuje rzeczywisty stan aktywnego pakietu.

**Zasada dla GPT-5.6 Sol i kolejnych modeli:** wykonuj tak prosto, jak pozwala dobry efekt; jedno review dopiero po całym pakiecie, potem celowane naprawy i zamknięcie. [AGENTS.md](../AGENTS.md) określa zakaz overengineeringu, pętli audytów i zbędnej pracy. Wystarcza jeden krótki raport pakietu. Czytaj instrukcje i sekcje potrzebne obecnemu zadaniu; wcześniejsze raporty są materiałem historycznym, nie obowiązkiem ponownego audytu przed każdą sesją.

## Granice tej dostawy

Przeczytano instrukcję autora, skróconą instrukcję, historię wersji, oficjalne strony i wybrane fragmenty źródeł DOS. Obejrzano sześć oryginalnych zrzutów. Sprawdzono dokumentację technologii przeglądarkowych. Nie uruchamiano SJ3, nie zmierzono opóźnienia wejścia ani trajektorii i nie przeprowadzono testu z graczami. Plan zawiera te działania jako wczesne bramki wykonania.

Zastosowane skille: `deep-research`, `game-design`, `planning-and-task-breakdown`. Z ich procesu wynikają rejestr dowodów, walidacja rdzenia przed rozbudową oraz małe zadania z kryteriami odbioru. Ścieżka `.github/skills/README.md` podana w instrukcji środowiska nie istnieje; wykorzystano istniejące `.agents/skills/`. Nie ma też dołączonego `references/definition-of-done.md` skilla planowania, dlatego projekt otrzymał własne jawne kryteria w QA. Brak narzędzi pamięci wskazanych przez skill researchu zastąpiono bieżącym researchem i rejestrem źródeł w projekcie.
