# Architektura techniczna

Status: DESIGN. Nie istnieje jeszcze implementacja. Ograniczenia API potwierdzone w [źródłach T01–T15](research/SOURCES.md); rozmiary i budżety są decyzjami do pomiaru.

**Zasada wykonania:** mała gra, proste rozwiązania. Schematy poniżej opisują odpowiedzialności i potrzebne dane, nie obowiązkowy zestaw klas, interfejsów i warstw. Stosuj [AGENTS.md](../AGENTS.md): buduj tylko elementy aktywnego pakietu, a dodatkową złożoność uzasadniaj istniejącym problemem.

## 1. Wybór stosu

**TypeScript + Vite + Canvas2D**, Web Audio, IndexedDB; Vitest do logiki i Playwright do przebiegu przeglądarkowego. Wersje stabilne i wzajemnie kompatybilne ustalić podczas P02, zapisać w lockfile oraz README. Bez frameworka strony i bez backendu.

| Opcja | Korzyści w tej grze | Koszt | Decyzja |
| ---| ---| ---| ---|
| Canvas2D | Bezpośredni raster, własne profile i UI bitmapowe, mało zależności | Własny loader, audio manager i obsługa ekranów | Wybrano na prototyp i v1 pod warunkiem benchmarku |
| PixiJS | Renderer GPU, atlasy, duże liczby sprite'ów i efektów | Nadal potrzebny rdzeń gry; dodatkowa infrastruktura GPU | Rezerwa, gdy pomiar wykaże ograniczenie Canvas |
| Phaser | Gotowe sceny, wejście, audio, loader | Własna fizyka skoków pozostaje potrzebna; więcej konwencji | Rozważony, niewybrany dla obecnego zakresu |

P15 sprawdza docelowe 960×540, złożone tła i pogodę. Zacznij od zwykłych funkcji renderujących. Nie twórz abstrakcyjnego interfejsu wielu rendererów na wypadek przyszłej zmiany silnika. Powrót do porównania stosów ma sens dopiero po wykazaniu konkretnego ograniczenia.

## 2. Podział odpowiedzialności

```text
Keyboard / Browser lifecycle
             ↓ akcje z numerem ticka
       SessionController
         ↙           ↘
 Competition      JumpSimulation ← HillData / Rules / Wind
     ↓                ↓
 ResultReducer ← JumpEvents
     ↓                ↓
 SaveRepository   ReplayRecorder
         ↘           ↙
        Readonly ViewModel
          ↓         ↓
     CanvasRenderer  AudioDirector
```

Reguły, symulacja, pomiar i punktacja nie importują DOM, Canvas, audio ani IndexedDB. Renderer odczytuje stan; nie zmienia wyniku skoku. Dźwięk reaguje na zdarzenia. Przejście ekranu i zapis mają jednego właściciela w kontrolerze sesji.

Proponowane katalogi:

```text
src/app/          uruchomienie i ekran sesji
src/core/         czas, PRNG, identyfikatory, zdarzenia
src/simulation/   rozbieg, wybicie, aerodynamika, kontakt, odjazd
src/sport/        pomiar, noty, kompensaty, ranking, format zawodów
src/input/        akcje, bindy, bufor ticków
src/render/       canvas, kamera, teren, sprite, font, HUD
src/screens/      menu i ekrany gry
src/audio/        mikser, pętle, reakcje na zdarzenia
src/storage/      IndexedDB, migracje, import/eksport
src/replay/       rejestrator i odtwarzacz
src/content/      walidowane schematy i manifest danych
public/assets/   wyłącznie własne/licencjonowane eksporty runtime
content/         dane skoczni, kalendarzy, zasad i zawodników
assets-src/      edytowalne mastery, pochodzenie i licencje
tests/           unit, integration, replay, browser, fixtures
docs/evidence/   raporty z konkretnych pakietów
```

To propozycja docelowego rozmieszczenia, nie lista katalogów do utworzenia na starcie. Kilka spójnych plików wystarcza do pierwszego pakietu. `SaveRepository` może być zwykłym modułem funkcji zapisu, `JumpEvents` krótką listą zdarzeń skoku, a stan ekranu zwykłym obiektem; te nazwy nie wymagają wzorców enterprise. Minimalne zależności rdzenia od przeglądarki zachowujemy bez mnożenia adapterów.

## 3. Kontrakty danych

| Typ | Pola kluczowe | Niezmienniki |
| ---| ---| ---|
| `HillDefinition` | id, version, sourceRefs, K, HS, class, curves, distanceMap, gates, markers, compensation, visuals | K<HS; metry monotoniczne; brak NaN; próg i powierzchnia kolizji zgodne z rysunkiem |
| `RuleSet` | id/version, sourceEdition, meterTable, scoring/rounding, qualification, gatePolicy, recordPolicy | Ten sam profil w całym konkursie |
| `JumpState` | phase, tick, position, velocity, pitch, landingProgress, contact, windState | Zdarzenie kontaktu/pomiaru/finish emitowane najwyżej raz |
| `JumpResult` | resultId, participantId, contextId, distanceHalfMeters, marks, componentTenths, status, reason, versions | Wynik nie zawiera sformatowanych tekstów ani danych z rendererów |
| `CompetitionState` | entrants, rounds, startOrder, results, advancement, standings, seed, versions | Każdy slot skoku rozliczony najwyżej raz, brak podwójnych punktów po reload |
| `Profile` | id, name, appearance, bindings, stats | Nazwa nie jest identyfikatorem; do 10 ludzi w sesji |
| `Replay` | versions, initialState, inputs, samples, discreteEvents, recordedResult | Odtwarzanie nie przepisuje wyniku i nie zapisuje rekordów |
| `AssetManifest` | id, path, size, author, source, license, hash | Każdy zasób runtime ma pochodzenie; brak obrazów researchu w buildzie |

`gates` przechowuje numer i długość rozbiegu w metrach; `compensation` ma jednostki i stan pochodzenia `official-reference`/`simulation-calibrated`. `markers` obejmuje P/K/HS/fall line, a nie niezależne losowe współrzędne. W danych przechowujemy także progową odległość dla coach gate i jej źródło.

## 4. Pętla i wejście

`requestAnimationFrame` służy do prezentacji i uzupełniania akumulatora. Symulacja wykonuje ticki 1/120 s. Numer ticka wejścia wyznacza czas zdarzenia na wspólnej monotonicznej osi czasu, z odjęciem pauz. Nie przypisywać wszystkich zdarzeń zebranych przed wolniejszą klatką do jednego „następnego” ticka: zmieniłoby to timing wybicia przy różnym FPS.

Konwencja P04: tick n obejmuje przedział `[n×dt,(n+1)×dt)` od początku aktywnej sesji. Po normalizacji `event.timeStamp` akcja trafia do `floor(activeEventTime/dt)`; jeśli ten tick już wykonano, trafia do pierwszego niewykonanego, a test odnotowuje opóźnioną dostawę. Nie cofamy symulacji. Kolejność zdarzeń w tym samym ticku określa rosnący numer sekwencji. Zachować obie krawędzie szybkiego keydown/keyup, nawet jeśli stan held na końcu ticka jest pusty. Czas odtworzenia pauzy resetuje kotwicę czasu i usuwa zaległe akcje gry. W testach jednostkowych można podać gotowy ślad ticków, ale osobne testy muszą sprawdzić mapowanie czasowanych zdarzeń przeglądarki; sam replay nie weryfikuje jakości wejścia na żywo.

Roboczy limit nadrabiania: 8 ticków w klatce (TUNE). Nagła długa przerwa lub powtarzające się przeciążenie powoduje kontrolowaną pauzę z resetem akumulatora; nie skok fizyki o ogromnym dt. Nie pomijamy pojedynczych kroków w aktywnym konkursie dla „utrzymania FPS”. Testy odświeżania 30/60/120/144 Hz oraz przełączania kart są obowiązkowe.

Wynik powinien być identyczny przy różnych częstościach renderowania na tym samym silniku JS. Zgodność między przeglądarkami jest osobnym testem, ponieważ fixed timestep nie gwarantuje bitowej zgodności funkcji matematycznych. Dopuszczalna tolerancja pozycji w testach numerycznych nie może ukryć innego kontaktu, półmetra, awansu ani wyniku.

## 5. Fullscreen i skalowanie

Jedna scena zajmuje `100vw ×100dvh`, bez scrolla. Canvas logiczny **960×540**. Przy skali całkowitej 2× na 1920×1080 każdy piksel gry ma blok 2×2; przy innych proporcjach letterbox. „Dopasuj” może użyć skali ułamkowej nearest-neighbour; „Równe piksele” utrzymuje skalę całkowitą. Polityka z [oprawy](ART_UI_AUDIO.md) jest jedynym źródłem ustawień, bez dublowania algorytmu w ekranach.

`imageSmoothingEnabled=false` po każdej zmianie rozmiaru kontekstu; CSS `image-rendering:pixelated`. DPR wpływa na raster prezentacyjny i zaokrąglenia, nie na fizykę i logiczną wielkość fontu. Zmiana monitora/DPR/zoomu przelicza prezentację; nie restartuje skoku.

Wywołanie `requestFullscreen()` oraz wznowienie AudioContext następują bezpośrednio w obsłudze świadomego Enter/click, przed awaitem ładowania. Oba wyniki obsługujemy niezależnie: odmowa jednego API nie uniemożliwia próby drugiego ani wejścia do menu. Początkowy Enter nie zależy od gotowego tick loop, dlatego minimalną obsługę tego gestu posiada shell P03; P04 dopiero rozszerza ją o akcje gry. `visibilitychange` do `hidden`, `blur` i opuszczenie fullscreen powodują pauzę aktywnej symulacji. Nie pauzować pustego ekranu tytułowego tylko dlatego, że udało się wejść do fullscreen. Zmiany stanu i Promise obsługujemy idempotentnie. Wyjście Esc nie jest blokowane. Wyjście z fullscreen przez Esc pauzuje aktywną symulację i odzyskuje fokus; F ponawia fullscreen oraz wznawia wyłącznie pauzę `opuszczono pełny ekran`. Gra nie wymaga Keyboard Lock ani Pointer Lock.

W iframe potrzebne uprawnienie fullscreen; fallback sprawdzić w teście. Publikacja w zwykłej karcie pozostaje wspieraną ścieżką. Użytkownik musi mieć możliwość przeniesienia fokusu do gry; ekran startowy jest semantycznie fokusowalny także dla urządzeń wspomagających.

## 6. Zapis i odzyskiwanie

IndexedDB z magazynami: settings, profiles, sessions, results, records, replays, migrations. Skończony skok: jedna transakcja aktualizuje wynik, postęp, statystyki i ewentualny rekord/replay. `resultId` i numer rewizji sesji zabezpieczają idempotencję po wznowieniu. Zapis nie jest odkładany do zamknięcia karty.

Punkt wznowienia konkursu istnieje po każdym zatwierdzonym skoku i przed startem kolejnego. Zdarzenia wejścia/początkowy seed aktywnego skoku mogą być buforowane; po awarii przed zatwierdzeniem wracamy do stanu przed próbą, bez podwójnego naliczania. To lokalna gra, więc taka możliwość powtórzenia po zamknięciu karty nie jest traktowana jako zabezpieczona rywalizacja online.

Migracja bazy ma numer i test na poprzednim formacie. Błąd/QuotaExceeded: ekran `NIE ZAPISANO`, zachowanie stanu w RAM, opcja eksportu, ponowienie po zwolnieniu miejsca. Nie nadpisywać poprawnego zapisu pustym profilem po błędzie odczytu. Eksport zawiera manifest wersji i dane; import waliduje limit wielkości, schemat, typy i wszystkie referencje przed transakcją. DOM nie interpretuje nazw jako HTML.

Przeniesienie na inny origin wymaga eksportu/importu. Trwałość IndexedDB nie jest kopią zapasową; opcjonalne `storage.persist()` nie gwarantuje ochrony przed ręcznym skasowaniem danych. Dwie karty: blokada sesji przez BroadcastChannel/lease w bazie; druga karta pokazuje tryb odczytu albo umożliwia jawne przejęcie po wygaśnięciu blokady.

Implementacja ma pozostać mała: prosty moduł zapisu i mechanizm jednego aktywnego autora sesji wystarczą. Nie buduj systemu rozproszonego, mechanizmu wyboru lidera ani ogólnej platformy migracji. Pierwszy format potrzebuje numeru wersji; kod konkretnej migracji powstaje dopiero przy rzeczywistej zmianie formatu. Zapis raz naliczonego wyniku i obsługa błędu nadal są wymagane.

## 7. Powtórki

Zapisujemy akcje na tickach oraz próbki wizualne 30 Hz (TUNE), z pełnym stanem fazy, pozycją, orientacją i wiatrem. Dyskretne zdarzenia kontaktu, linii i wyniku zapisywane w dokładnym ticku. Interpolacja prezentacji nigdy nie opóźnia zmiany fazy względem zarejestrowanego zdarzenia.

Odtwarzacz podstawowy czyta zapisane próbki — działa po zmianie fizyki. Ponowna symulacja wejścia jest narzędziem testowym i analitycznym. Wersjonowanie chroni przed podmienieniem geometrii; replay zawiera potrzebny mały snapshot danych skoczni lub ma dostęp do zachowanej wersji. Brak zasobów wizualnych może użyć podstawowego widoku technicznego z jawnym komunikatem.

Automatycznie trzymamy ostatni skok i rekordy; pozostałe replaye zapisuje użytkownik. Budżet startowy 20 MB i 100 ręcznych replayów (TUNE), z widoczną informacją o użyciu. Nie usuwać ręcznych zapisów bez decyzji gracza. Przewijanie w obie strony nie emituje zdarzeń naliczających wynik.

## 8. AI i wydajność

Bot wybiera start w dozwolonym oknie, timing wybicia, politykę pitch i lądowanie. Błędy to parametry kontrolera, nie losowanie końcowej odległości. Stan botów obliczany tym samym rdzeniem. Szybki tryb liczy porcjami z oddaniem sterowania UI; Web Worker dopiero gdy profil wykaże potrzebę.

Warstwy statyczne renderujemy do buforów i przewijanych segmentów. Nie tworzymy obiektów/grafik w każdym ticku. Efekty kosmetyczne mogą zmniejszać ilość śniegu niezależnie od pogody fizycznej. Stałe tła mają osobny PRNG, aby wyłączenie śniegu nie zmieniło wiatru.

Cele robocze (TUNE, nie pomiary): płynne 60 FPS na ustalonym laptopie z grafiką zintegrowaną, wejście widoczne najpóźniej w następnej prezentowanej klatce po obsłudze ticka, brak długich blokad podczas AI. P15 rejestruje model CPU/GPU, system, przeglądarkę, rozdzielczość i p95 czasu klatki; dopiero wtedy ustala budżet wydania. Osobno mierzyć ładowanie, pamięć i cache.

## 9. Dystrybucja

Build statyczny pod HTTPS; sprawdzić `/` i `/retro-ski-jumping/`. Adresy assetów wyprowadzane z bazowej ścieżki, także w ładowanych danych. Brak zależności runtime od CDN, zewnętrznych fontów i kont. Dev server nie jest serwerem produkcyjnym.

Service worker dopiero pod koniec: cache z buildId, scope do katalogu gry, pobranie kompletnego zestawu przed oznaczeniem offline-ready. Update czeka do menu/końca sesji, nie przeładowuje w locie. Test: build A → update B → offline, bez mieszania wersji skryptów, danych i atlasów. Jeżeli użytkownik po raz pierwszy otwiera adres całkowicie offline i nie ma zainstalowanego service workera/cache, gra nie może wyświetlić własnego komunikatu — przeglądarka pokazuje swój błąd sieci. Własny ekran błędu jest wymagany tylko wtedy, gdy shell już się załadował, lecz brakuje zasobów. Dokumentacja wydania zawiera instrukcję unieważniania własnego cache; nigdy nie kasuje całej pamięci innych aplikacji na origin.

Do repozytorium gry nie kopiować zawartości katalogów skilli do `public/`. Utworzenie Git nie jest elementem tej dostawy; gdy rozpocznie się implementacja, politykę kontroli wersji ustalić z bieżącymi instrukcjami środowiska. Nie modyfikować globalnej konfiguracji użytkownika.
