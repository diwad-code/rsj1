# PKG-012 — kontynuacja P21-H04 Planica mamut (D/G/A/V)

Katalog: `C:\retro-ski-jumping` — gra przeglądarkowa TypeScript/Canvas2D,
**nie Godot**. Pakiet docelowy: **PKG-012, INCOMPLETE**.
Zakres: **P21-H04 — Planica mamut, pełny cykl D/G/A/V** zgodnie z
`docs/IMPLEMENTATION_PLAN.md` §6. Techniczne D/G/A/V są wykonane; **pozostał
osobny werdykt użytkownika VISUAL dla H04**. P21 IN PROGRESS. Nie zaczynaj P22,
H05–H20 ani innych trybów; po faktycznym zamknięciu następny jest **PKG-013/P22
— ustawienia, remapowanie i dostępność**.

## Lektura, prawdziwy stan i źródła

Przeczytaj kolejno `AGENTS.md`, `docs/README.md`, ten aktywny
`docs/NEXT_SESSION_PROMPT.md` i `docs/PACKAGE_WORKFLOW.md` §§3–5. Dalej tylko
potrzebne części `docs/CONTENT_PLAN.md` §§1–4,
`docs/IMPLEMENTATION_PLAN.md` P21/§6, `docs/QA_ACCEPTANCE.md` Q-FIS-18–24,
`docs/hills/H04.md`, `docs/evidence/PKG-012/REPORT.md`, `ARTIFACTS.md` i
`ART_MANIFEST.md` w tym samym katalogu dowodów. Sprawdź stan dysku i zachowaj
cudze zmiany; nie odtwarzaj skończonego researchu ani testów bez potrzeby.

PKG-001–011 COMPLETE, bazowa bramka V zaakceptowana 22.09.2026, H01–H03 mają
osobne VISUAL USER PASS 23.09.2026. H04 to inspirowana Letalnicą Planica
K200/HS240 (`h04-planica-flying`, `h04-inspired-1`), **nie wierna geometria ani
homologacja FIS**. W karcie są źródła: trening FIS 26.03.2026 potwierdza K/HS
i faktory; wyniki FIS 29.03.2026 podają 1,2 pkt/m; rekord PŚ mężczyzn
254,5 m Domen Prevc 30.03.2025 potwierdzają osobne wyniki i organizator
(jednocześnie rekord świata). Krzywe, belki, AUTO i progi gry to ADAPT/TUNE.
Powtarzalny headless G: seed 42, belka 32, wiatr 0, idealne wybicie,
flow+32°, R po 5 s → surowe 256,867… m, zapis 256,5 m, dwie nogi, bez dłoni;
na podobnym dystansie mniej dokładny kontakt daje podpórkę częściej.
Autorski art Planicy ma osobną sylwetkę estakady, dolinę, paletę i miniaturę;
proweniencja, prawa i SHA-256 są w `ART_MANIFEST.md`.

Rodzic wykonał już **jedno końcowe review całego technicznego pakietu**
(porównanie z SJ3 i DSJ2, bez znalezionego blokera), bez prawa samodzielnego
przyznania VISUAL PASS. Końcowe `npm run typecheck && npm test && npm run build`
PASS (36 plików / 311 testów, Vite 38 modułów), następnie
`npx playwright test tests/browser/h04.spec.ts --workers=1 --output=docs/evidence/PKG-012/tmp-browser-h04`
PASS 3/3; regresje H01 3/3, H02 3/3, H03 po naprawie przestarzałej nawigacji
4/4 PASS. Historyczne 309/311 oraz H03 1/4 FAIL są naprawione. **Nie powtarzaj
review ani zielonych testów bez istotnej zmiany lub nowej usterki.**
Siedem opublikowanych materiałów H04 pochodzi z wcześniejszego udanego
przebiegu: trening R 219,13 → 219,0 m, T 218,29 → 218,0 m, konkurs 103,0 m;
film nie dokumentuje rekordowego headless 256,5 m. Późniejszy PASS 3/3 miał
inne loty, nie podmieniaj nimi opublikowanego filmu ani sum SHA-256.

Sześć starych artefaktów PKG-010 pozostaje zaakceptowaną, udokumentowaną
utratą — nie odzyskaniem. Nie edytuj ich, ich manifestu ani backupu. Obowiązuje
**trwały zakaz wszystkich poleceń Git** i publikacji bez zgody użytkownika.
Zewnętrzny PLAYABILITY **NOT RUN**. Nie twierdź, że użytkownik oglądał film.

## Pozostało do wykonania

Pokaż użytkownikowi **rzeczywiste** materiały z `docs/evidence/PKG-012/artifacts/`:
[menu](../evidence/PKG-012/artifacts/h04-menu-960x540.png),
[scena](../evidence/PKG-012/artifacts/h04-scene-960x540.png),
[przekrój techniczny](../evidence/PKG-012/artifacts/h04-technical-960x540.png),
[wynik R](../evidence/PKG-012/artifacts/h04-result-parallel-960x540.png),
[wynik T](../evidence/PKG-012/artifacts/h04-result-telemark-960x540.png),
[replay](../evidence/PKG-012/artifacts/h04-replay-flight-960x540.png) i
[pełny film treningu WebM](../evidence/PKG-012/artifacts/h04-real-keyboard-jumps-960x540.webm).
Poproś **wprost** o oddzielny werdykt H04 dotyczący wyglądu, animacji i
czytelności (w tym linii K/HS). Bez wyraźnej akceptacji nie wpisuj USER PASS,
nie oznaczaj H04/P21/PKG-012 COMPLETE. Jeśli użytkownik odrzuci obraz, napraw
tylko konkretne wskazane problemy i sprawdź zmienione ścieżki; nowy materiał
zapisz osobno, bez nadpisania siedmiu obecnych plików. Nie uruchamiaj drugiego
pełnego przeglądu.

## Zamknięcie lub ponowne przekazanie

Po **rzeczywistym** VISUAL USER PASS zacytuj werdykt i jego zakres w krótkim
`docs/evidence/PKG-012/REPORT.md`, uaktualnij `docs/hills/H04.md`, statusy
`docs/README.md`, `docs/PACKAGE_WORKFLOW.md`, `docs/IMPLEMENTATION_PLAN.md`
(dopiero wtedy zamknij checklistę P21), zapisz pełny prompt **PKG-013/P22**
w `docs/handoffs/PKG-013.md` i identycznie w `docs/NEXT_SESSION_PROMPT.md`;
sprawdź identyczność bajtową i **zatrzymaj się bez implementacji P22**.
Jeżeli nie ma werdyktu lub jest odrzucenie, pozostaw PKG-012 INCOMPLETE,
zapisz rzeczywisty brak w raporcie, zachowaj dotychczasowe materiały i
przekaż aktualną kontynuację **tego samego PKG-012** według workflow. Poprzedni
kanoniczny prompt jest nietkniętą kopią
`docs/handoffs/PKG-012-CONTINUE-01.md`; starszego
`docs/handoffs/PKG-012-rev01.md` nie zmieniaj.
