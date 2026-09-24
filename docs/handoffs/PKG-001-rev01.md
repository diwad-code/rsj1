# ARCHIWUM — wersja przed zasadą prostoty

Nie jest aktywnym promptem. Aktualna wersja: `docs/handoffs/PKG-001.md`. Starsze wymagania o rozbudowanych raportach i review poniżej ustępują aktualnym zasadom użytkownika w AGENTS.md.

---

# Wykonaj PKG-001 — fundament gry przeglądarkowej

Pakiet docelowy: PKG-001
Zakres: P01, P02, P03, P04
Następny pakiet po zamknięciu: PKG-002 — P05, P06, P07, P08

Pracujesz w `C:\retro-ski-jumping`. Wykonaj cały wskazany pakiet, zweryfikuj go i zamknij zgodnie z poniższą procedurą. To polecenie implementacji, nie prośba o kolejny plan. Nie rozpoczynaj PKG-002 w tej samej sesji.

## Stan wejściowy

W katalogu są skille, konfiguracje oraz dokumentacja. Na moment przygotowania tego promptu nie ma kodu gry, projektu npm, testów aplikacji ani grywalnego buildu. Najpierw sprawdź rzeczywisty stan dysku: jeżeli sesja była przerwana i część pakietu już wykonano, kontynuuj ją zamiast odtwarzać od zera. Istniejących plików, skilli i konfiguracji nie usuwaj.

Dokumentację poddano auto-review. Pierwotny zakres P01–P12 w jednej sesji został zastąpiony trzema pakietami: fundament P01–P04, model skoku P05–P08, grywalny trening P09–P12. Nadal planujemy pełne v1 z 20 skoczniami i wszystkimi trybami. Pierwszy pakiet nie jest jeszcze grywalną symulacją skoku.

## Źródła prawdy i kolejność lektury

1. `AGENTS.md`, `docs/README.md`, `docs/PACKAGE_WORKFLOW.md` i `docs/SELF_REVIEW.md`.
2. `docs/PRODUCT_GDD.md` i P01–P04 w `docs/IMPLEMENTATION_PLAN.md`; pozostałą mapę poznaj na poziomie zależności.
3. `docs/TECHNICAL_DESIGN.md`, `docs/ART_UI_AUDIO.md`, `docs/GAMEPLAY_SPEC.md` — szczególnie wejście, czas, fullscreen, stany i skala obrazu.
4. `docs/QA_ACCEPTANCE.md`, `docs/DECISIONS_RISKS.md`.
5. Dla P01: `docs/research/SJ3_RESEARCH.md`, `docs/research/MODERN_SKI_JUMPING.md`, `docs/research/SOURCES.md` oraz wskazane materiały źródłowe.

Korzystaj z odpowiednich dostępnych skilli po przeczytaniu ich instrukcji. W pierwszej dostawie brakowało `.github/skills/README.md`; sprawdź aktualny stan, a jeśli nadal go nie ma, wykorzystaj `.agents/skills/`. Nie zakładaj konieczności Git ani nie zmieniaj globalnej konfiguracji środowiska.

## Niezmienne wymagania użytkownika

Gra web, cały ekran w stylu samodzielnej gry MS-DOS, pełna obsługa klawiaturą. Inspiracja Ski Jump International 3 obejmuje boczny widok, rytm skoku i proste sterowanie: ↑ wybicie, ←/→ pozycja, T telemark, R lądowanie na dwie nogi; → opuszczenie belki. Wszystkie ekrany mają należeć do gry, bez przewijanej strony marketingowej.

Zasady sportowe i oznaczenia są współczesne: osobne K/HS, prawidłowe linie i rekompensaty. Nie przenoś starej punktacji SJ3. W tym pakiecie poznajesz kontrakt, ale nie implementujesz punktacji ani konkursów.

Pixel art jest podstawą. Dopuszczona i pożądana jest większa szczegółowość, wiarygodne proporcje i nowoczesne światło przy zachowaniu wyraźnych pikseli. Roboczy raster to 960×540. Materiały SJ3/FIS w docs są referencjami, nie assetami runtime. Finalne tła i 20 profili nie należą do PKG-001.

## Wynik pakietu

Uruchamialny lokalnie fundament aplikacji TypeScript + Vite + Canvas2D: pikselowy ekran tytułowy i menu, prawidłowy fullscreen z fallbackiem, odblokowanie audio, obsługa fokusu, podstawowe akcje klawiatury i stały zegar 120 Hz. Mały demonstrator developerski umożliwia sprawdzenie czasu/wejścia bez udawania fizyki skoków. Brakujące funkcje nie mają wyglądać jak działające konkursy.

### P01 — baza referencyjna

Sprawdź istniejące źródła i uzupełnij obserwację SJ3 w ruchu: uruchomiona legalna wersja lub rzeczywiście obejrzane nagranie pełnego skoku. Zanotuj start, wybicie, pozycję, oba lądowania, kamerę, wynik i drogę do kolejnej próby. W `docs/research/REFERENCE_SESSION.md` zapisz źródło, wersję, sposób obserwacji i ograniczenia. Oglądanie nie dowodzi pomiaru opóźnienia sterowania.

Wcześniejsza sesja przeczytała źródła i obejrzała sześć screenshotów, lecz nie rozegrała SJ3. Nie przypisuj sobie nieistniejącej sesji testowej. Jeżeli obserwacja ruchu jest niedostępna, odnotuj próbę i konkretny brak, wykonaj niezależne P02–P04, ale nie oznaczaj P01 ani całego pakietu jako bezwarunkowo zakończonego.

Nie powtarzaj całego researchu. Datowane źródła FIS są już wskazane, a szczegóły progów/zaokrągleń i pełnej punktacji pozostają do P13/P16. Nie blokują budowy shella i nie wymagają wymyślania reguł teraz.

### P02 — szkielet

Sprawdź dostępne Node/npm i dobierz kompatybilne stabilne wersje TypeScript, Vite oraz narzędzi testowych z dokumentacji pierwotnej. Zapisz wersje i lockfile. Utwórz minimalną strukturę, `dev`, `build`, `typecheck`, `test`, `test:e2e` i instrukcję uruchomienia. Testy mają rzeczywiście coś sprawdzać; pusty zestaw nie daje PASS.

Nie twórz backendu, Reactowej strony, silnika 3D, logowania, service workera ani pustych modułów wszystkich przyszłych trybów. Testy, skille i referencje nie trafiają do publicznych assetów.

### P03 — ekran i lifecycle

Canvas 960×540, proporcje 16:9, skalowanie według ART_UI_AUDIO.md, brak scrolla i wygładzania sprite'ów. Zadbaj o minimum własnej/licencjonowanej oprawy i polskie znaki.

Enter na fokusowalnym ekranie startowym inicjuje fullscreen i audio bez oczekiwania na późniejszy loader. Obsłuż oba API niezależnie; odmowa nie blokuje menu. Nie uzależniaj pierwszego Enter od przyszłego systemu P04. Esc może opuścić fullscreen. F pozwala ponowić żądanie. Zmiana rozmiaru nie niszczy stanu ani proporcji.

### P04 — wejście i czas

Zbuduj akcje `pressed/released/held`, filtrowanie auto-repeat, kolejność zdarzeń i reset przy pauzie, blur oraz ukryciu karty. Zachowaj szybkie keydown+keyup pomiędzy klatkami.

Tick wejścia wyznaczaj z monotonicznego czasu zdarzenia i kotwicy aktywnej sesji opisanej w TECHNICAL_DESIGN.md. Nie sklejaj zdarzeń z wolniejszej klatki w jeden tick. Działanie klawisza przejścia nie może przedostawać się do następnego ekranu.

Zegar 120 Hz ma działać niezależnie od prezentacji 30/60/120/144 Hz. Po pauzie nie nadrabia czasu z tła. Stan demonstracyjny/testowy służy sprawdzeniu tych właściwości; nie deklaruj testu fizyki jeszcze nieistniejącego skoku.

## Weryfikacja

- `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e` — po utworzeniu faktycznych poleceń.
- W przeglądarce: tytuł → Enter → menu, Esc → F, obsługa odmowy fullscreen/audio, nawigacja bez myszy, poprawne proporcje na 1280×720 i 1920×1080.
- Sprawdź prawdziwe wejście klawiatury, auto-repeat, szybkie naciśnięcie i puszczenie, lewo+prawo, blur/hidden/pauzę i świadome wznowienie.
- Testy czasu muszą obejmować zarówno gotowy ślad ticków, jak i adapter czasowanych zdarzeń. Odróżnij opóźnienia dostawy zdarzeń przez środowisko od błędu mapowania.
- Obejrzyj rzeczywiste screenshoty, zachowaj krótki zapis działania. Headless ani mock API nie dowodzą rzeczywistego fullscreen.
- Wykonaj `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff` po aktualizacji dokumentacji.
- Zachowuj polecenia, wersje, wyniki i ścieżki dowodów. TECHNICAL, VISUAL i PLAYABILITY oceniaj osobno; PLAYABILITY skoku nie dotyczy tego pakietu. Niewykonanych sprawdzeń nie nazywaj PASS.

Pracuj autonomicznie w granicach pakietu. Poprawiaj wykryte problemy. Przy blokadzie wykonaj niezależną część pracy i zgłoś dokładny brak. Nie rozszerzaj zakresu na P05–P12 ani nie publikuj gry.

## Zamknięcie i następna sesja

To warunek zakończenia każdego pakietu, wynikający z polecenia użytkownika:

1. Wykonaj auto-review własnych zmian, popraw problemy i przeprowadź odpowiednią ponowną weryfikację.
2. Zapisz `docs/evidence/PKG-001/REPORT.md` oraz `SELF_REVIEW.md`, dowody P01–P04 i rzeczywisty stan każdego zadania. Zaktualizuj README, checklisty planu oraz status PKG-001.
3. Jeśli pakiet jest kompletny, napisz **samodzielny prompt PKG-002 / P05–P08**. Ma prowadzić nową sesję od faktycznie gotowego fundamentu do technicznego profilu K120/HS134, rozbiegu, wybicia, lotu, kolizji, obu lądowań i `FallSettled`. Nie obejmuje jeszcze punktacji/treningu P09–P12.
4. Zapisz nowy prompt do `docs/handoffs/PKG-002.md`, identyczną treść do `docs/NEXT_SESSION_PROMPT.md` oraz kopię do `docs/evidence/PKG-001/NEXT_SESSION_PROMPT.md`. Zachowaj dotychczasowy `docs/handoffs/PKG-001.md`.
5. Jeśli pakiet jest niekompletny, zachowaj stan INCOMPLETE/BLOCKED i przygotuj prompt kontynuacji PKG-001 zgodnie z PACKAGE_WORKFLOW.md. Nie przeskakuj do PKG-002.
6. Sprawdź spójność handoffu ze stanem dysku i mapą pakietów. W finalnej odpowiedzi podaj rezultat, uruchomienie, wykonane testy, ograniczenia oraz link do gotowego promptu nowej sesji.

Nie kończ na samym planie ani na propozycji „mogę kontynuować”. Jednocześnie nie przedstawiaj fundamentu aplikacji jako gotowej gry lub zamkniętej bramki A.
