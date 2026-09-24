# Retro Ski Jumping

Projekt nowej gry przeglądarkowej inspirowanej **Ski Jump International 3**. Widok z boku, pixel art, proste sterowanie klawiaturą i ekran zajęty przez grę — z obsługą pełnego ekranu. Zasady sportowe, punktacja oraz oznaczenia skoczni mają być współczesne, oparte na dokumentach FIS dostępnych 16.09.2026.

**Stan na 16 września 2026:** PKG-001–PKG-006 ukończone. Działa fundament TypeScript + Vite + Canvas2D z ekranem tytułowym i menu, fullscreen z fallbackiem, Web Audio po geście, buforowanym wejściem oraz zegarem 120 Hz. Działa też techniczna, jawnie fikcyjna skocznia K120/HS134 z mapą metrażu oraz deterministyczny pełny skok: rozbieg, wybicie, lot z korektą pozycji, kontakt ze stokiem, odjazd do fall line albo upadek. Działa też punktacja z notami, wiatrem i kompensatami, produkcyjna scena pixelowa, pełny standardowy konkurs z AI i hotseatem oraz transakcyjny zapis sesji w IndexedDB z powtórką ostatniego skoku. Gra ma nadal jedną, jawnie fikcyjną skocznię. Nazwa jest robocza.

Oprawa graficzna została odrzucona przez użytkownika i produkcja zawartości jest zamrożona. Następny pakiet to **PKG-007 / P41** — empiryczny audyt oprawy z porównaniem do Deluxe Ski Jump 2 i Ski Jump International 3; skocznie wracają dopiero po akceptacji wyglądu. Każda sesja kończy swój pakiet raportem i promptem dla następnej, zgodnie z [regułą pakietową](docs/PACKAGE_WORKFLOW.md).

## Uruchomienie

Wymagany jest Node.js 22.12 lub nowszy. W katalogu projektu:

```powershell
npm install
npm run dev
```

Otwórz adres podany przez Vite, ustaw fokus na obrazie gry i naciśnij Enter. W menu `[` i `]` wybierają belkę, a Enter rozpoczyna skok techniczny: `→` opuszcza belkę, `↑` wybija, `←` i `→` korygują pozycję w locie, `T` i `R` przygotowują lądowanie. `Esc` opuszcza fullscreen, `F` ponawia żądanie, a `P` włącza pauzę. Polecenia kontroli jakości: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`.

## Dokumentacja

Zacznij od [indeksu dokumentacji](docs/README.md), następnie przeczytaj [projekt gry](docs/PRODUCT_GDD.md) i [kompletny plan wykonania](docs/IMPLEMENTATION_PLAN.md).

- [Research SJ3 i różnice między wersjami](docs/research/SJ3_RESEARCH.md)
- [Rejestr źródeł](docs/research/SOURCES.md)
- [Współczesne zasady i oznaczenia FIS](docs/research/MODERN_SKI_JUMPING.md)
- [Mechanika, sterowanie i punktacja](docs/GAMEPLAY_SPEC.md)
- [Grafika, dźwięk i interfejs](docs/ART_UI_AUDIO.md)
- [Architektura przeglądarkowa](docs/TECHNICAL_DESIGN.md)
- [Skocznie, zawodnicy i tryby](docs/CONTENT_PLAN.md)
- [Testy i odbiór](docs/QA_ACCEPTANCE.md)
- [Decyzje, ryzyka i niewiadome](docs/DECISIONS_RISKS.md)
- [Instrukcja następnej sesji](docs/NEXT_SESSION_PROMPT.md)

Obecne katalogi skilli i konfiguracji narzędzi pozostają na miejscu. Dokumentacja nie zakłada wykorzystania kodu wcześniejszego projektu, emulatora DOS ani zasobów SJ3 w gotowej grze.
