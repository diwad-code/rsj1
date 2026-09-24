# Mechaniki, systemy i stan

## Core loop

```text
wejście do pokoju -> eksploracja -> prompt -> rozmowa / small-talk / obserwacja / inspectable / drzwi -> event lub ambient -> wybór -> efekt -> nowy stan -> objective / kolejny pokój
```

Czas nie płynie automatycznie. Płynie przez działania.

## Czas misji

Referencyjne stałe z Godota:

- krótka rozmowa: `30` minut,
- event rozmowy: `120` minut,
- praca z załogą / naprawa: `180` minut,
- konsola: `60` minut,
- posiłek / odpoczynek: `240` minut,
- torpor: `90` dni.

Akty są liczone z `missionMinutes`, ale kanon chronologii ma pierwszeństwo nad wygodnymi skrótami tekstowymi.

## Torpor

Torpor to świadoma decyzja gracza, nie cutscene bez udziału. Jest mechaniką
skoku czasu, rytmu misji i separacji aktów. Nie służy jako zwykły odpoczynek
po każdej rozmowie.

System torporu:

- zwiększa `torporCyclesCompleted`,
- ustawia flagi cykli,
- może skokowo otwierać akty,
- wraca domyślnie na mostek,
- emituje `torpor:started` i `torpor:ended`.

### Kiedy torpor jest obowiązkowy

Torpor staje się obowiązkowym celem, gdy aktualny etap fabuły nie powinien
dłużej postępować w ciągłości jednego dnia. Runtime kieruje wtedy objective do
komory torporowej i dopiero wykonanie torporu otwiera kolejny duży etap.

Obowiązkowe bramki:

- po wczesnych wiadomościach i follow-upach załogi, aby uczciwie wejść w długi
  lot poza widokiem Ziemi,
- przed wejściem w Act II/III/IV/V, gdy wymagane flagi pokazują, że obecny
  etap emocjonalny i operacyjny został domknięty,
- po drugim obiegu odkrycia Limes, zanim gra przejdzie do ostatniego długiego
  skoku czasu i finałowej wiadomości.

W tych punktach torpor ma komunikować: "nie ma już sensownego małego zadania w
tym samym dniu; czas misji musi realnie przeskoczyć".

### Kiedy torpor jest opcjonalny

Opcjonalny torpor może być dostępny tylko wtedy, gdy nie blokuje aktualnego
objective, nie omija authored sceny i nie ukrywa pilnego follow-upu załogi.
Opcjonalny cykl to 90 dni (`TORPOR_MINUTES`) i powinien:

- przesunąć zasoby/czas bez losowego pomijania głównej osi,
- dać krótkie, player-facing podsumowanie, co zmieniło się na statku,
- nie otwierać aktu bez spełnienia jego flag bramkujących,
- nie zastępować rozmowy, która jest aktualnym celem.

Jeśli torpor nie jest dostępny, UI przy kapsule powinno jasno powiedzieć,
dlaczego: "najpierw dokończ X" zamiast cicho ignorować interakcję.

### Funkcja projektowa skoku czasu

Każdy większy torpor musi robić przynajmniej jedną rzecz projektową:

- oddzielić emocjonalnie etap misji,
- dopuścić nowe pakiety z Ziemi,
- pokazać zmianę relacji/ciała/rytmu pracy załogi,
- przesunąć statek na nowy próg chronologii,
- wzmocnić samotność długiego lotu przez fakt, że gracz sam zdecydował wejść
  do kapsuły.

## Zasoby

Start:

- oxygen: `80`
- water: `70`
- food: `60`
- fuel: `100`
- parts: `75`

Fuel i parts nie mają łatwej produkcji; są kosztem długiej misji.

Zasoby są widoczne w HUD i w świecie przez gauge/inspectables. Nie mogą być tylko liczbą w panelu.

## Głosy wewnętrzne

Głosy Tomasza są jednocześnie statami, komentarzami i filtrem percepcji:

- `ZARZĄDZANIE`
- `EMPATIA`
- `NAUKA`
- `PRZETRWANIE`
- `PAMIĘĆ`
- `CISZA`

Wyższy głos:

- odblokowuje inner voice,
- może odblokować blue check,
- zmienia ton czytania sceny.

### Aktywacja i powiadomienia głosowe

Wybory oparte na głosach wewnętrznych (posiadające `requires_skill` lub `check`) oraz efekty ich rozwoju emitują żądanie aktywacji głosu (`Events.VOICE_TRIGGER_REQUESTED`). Jeśli poziom danego głosu wynosi co najmniej `1`, system wyzwala zdarzenie `Events.VOICE_ACTIVATED`. 

Webowy interfejs wyświetla te zdarzenia w formie pływających powiadomień/chmurek (floating voice bubbles) w rogu ekranu, z unikalnymi kolorami retro-konsolowymi dla każdego z 6 głosów wewnętrznych. Chmurki płynnie wsuwają się na ekran i automatycznie znikają po 5 sekundach, z limitem maksymalnie 3 aktywnych powiadomień jednocześnie. Timery i powiadomienia są czyszczone przy resecie lub załadowaniu zapisu gry.

`CISZA` ma być mechaniką aktywną. Wybór milczenia, timeout lub odmowa odpowiedzi nie są brakiem akcji:
1. **Zliczanie ciszy**: Wybór opcji dialogowych o identyfikatorach lub tekstach zawierających słowa kluczowe (np. `silence`, `ignore`, `leave`, `quiet`, `zamilcz`, `milcz`, `zignoruj`, `odejd`) oraz kliknięcie „Odejdź" w panelu interakcji NPC inkrementuje ukryty licznik `silence_count` w flagach stanu gry.
2. **Modyfikator testu**: Każdy test testujący umiejętność `CISZA` otrzymuje automatyczny modyfikator o wartości równej `silence_count`, z etykietą `Skumulowane milczenie (xN)`.
3. **Blokada dowodzenia i niebieskich wyborów**: Jeśli `silence_count` osiągnie wartość `5` lub wyższą, wszystkie wybory niebieskie (blue checks) oraz wybory wymagające lub testujące dowodzenie (`DOWODZENIE` / `ZARZĄDZANIE`) zostają zablokowane z powodem wyłączenia: *„Zbyt długo milczałeś, by nagle wydać rozkaz”*.
4. **Timeouty eventów**: Niektóre eventy posiadają ograniczenie czasowe zdefiniowane w `timeout_seconds` oraz wybór domyślny w `timeout_choice_id`. W webowym runtime overlay wyświetla wówczas odliczający licznik czasu w formacie `[ UWAGA - OGRANICZONY CZAS: X.X s ]`. Po upływie czasu automatycznie wyzwalany jest wybór `timeout_choice_id` (z parametrem `isTimeout = true`), co powoduje dodanie 1 do licznika `silence_count`. Timer jest czyszczony przy ręcznym wyborze opcji, resecie lub wczytaniu zapisu w celu uniknięcia wycieków pamięci.

## Relacje i staty postaci

Relacje są małą skalą, ale mają wracać w tekście i checkach.

Załoga ma:

- health,
- morale,
- fatigue,
- radiation_msv,
- skills,
- radiation_limit_msv.

Webowa implementacja nie musi od razu pokazywać wszystkich liczb graczowi. Musi je jednak przechowywać i umożliwiać eventom użycie ich jako efektów lub warunków.

## Kość i checki

Obowiązuje `skill + d6 vs difficulty`.

UI nie może ukrywać matematyki. Minimalny panel checka:

- typ: biały/niebieski,
- skill,
- wartość skill/głosu,
- modyfikatory,
- próg,
- wymagany wynik,
- szansa,
- rzut,
- wynik.

Porażka musi być fail-forward. Dobre kategorie porażek:

- koszt,
- ślad,
- presja,
- błędne odczytanie,
- obejście,
- odsłonięcie słabości.

## Ambient

Trzy akcje gracza przy NPC/ECHO:

- `Rozmowa` — authored event, jeśli dostępny.
- `Small-talk` — ambient banter.
- `Obserwuj` — ambient observation.

Inspectables:

- dostępne przez prompt przy obiekcie,
- zależne od aktu, flag, powtórzeń, morale i głosów,
- po Limes mogą dostać warianty surowsze/pustsze.

## ECHO terminal

Terminal ECHO:

- najpierw pokazuje status systemów,
- potem uruchamia kolejkę authored eventów,
- gdy nic nie jest dostępne, wraca do statusu/ambientu.

ECHO ma panel player-facing taki sam funkcjonalnie jak NPC: `Rozmowa / Small-talk / Obserwuj`.

## Audio baseline

Od Slice L1 web runtime ma lekki `AudioSystem`, sterowany przez `EventBus`.

Kontrakt bazowy:

- `audio:cue` uruchamia oszczędny cue systemowy/UI,
- `audio:mute-requested` przełącza mute/unmute bez importu UI do systemu audio,
- `setting-audio` w powłoce nie jest już atrapą; mute zapisuje się przez `SaveStore` i wraca po restarcie runtime.

### Ambient bed per pokój/akt (Slice L2)

Od Slice L2 `AudioSystem` reaguje na istniejące eventy domenowe `room:entered` i `game:mission-time-advanced` (zero nowych typów eventów), utrzymując diegetyczny szum statku jako pętlę per pokój:

- każdy `RoomId` jest mapowany na jeden ambient bed (`ship-hvac`, `reactor`, `hydroponics`, `clinical`, `comms`, `habitat`, `torpor`, `earthside`) — mapowanie jest `Record<RoomId, ...>`, więc kompletne dla wszystkich pokojów,
- zmiana pokoju **zatrzymuje poprzednią pętlę przed startem nowej** (brak nakładania); wejście do pokoju z tym samym bedem nie restartuje pętli,
- akt subtelnie zmienia ton (`intensity` 0 w Akcie I → 1 w Akcie V): cięższy, niżej strojony bed w Akcie IV/V; re-tonowanie odpala się tylko gdy akt faktycznie się zmieni,
- pętle żyją w adapterze WebAudio; mute z L1 wycisza je przez zawieszenie `AudioContext`, więc ambient wraca po unmute bez ponownego wchodzenia do pokoju.

### SFX UI/eventów + sygnatura ECHO (Slice L3)

Od Slice L3 `AudioSystem` jest też routerem oszczędnych SFX, reagując na eventy domenowe emitowane przez `EventEngine`/`ProgressionEngine` (bez nowych typów eventów):

- `event:started` → cue otwarcia overlayu (`event-open`); jeśli mówca to ECHO → zamiast tego sygnatura `echo-ping`,
- `event:updated` → sygnatura `echo-ping` tylko gdy mówcą węzła jest ECHO (inni mówcy = cisza, SFX zostaje oszczędny),
- `event:resolved` → cue zamknięcia overlayu (`event-close`),
- `event:choice-requested` → cue wyboru (`event-choice`),
- `echo:message` → sygnatura `echo-ping` dla komunikatów terminala/raportów ECHO.

Detekcja ECHO: `isEchoSpeaker(speaker)` (mówca treści = `"ECHO"`); ECHO dostaje tony danych, nigdy ludzki głos. Próg drzwi i `ui-*` cue pozostają emitowane imperatywnie z miejsca interakcji w `main.ts` (jak `door:transition` z L1). Realny cue wyboru w produkcji: overlay woła `eventEngine.choose()` synchronicznie i używa zwrotu, więc `main.ts` emituje `event-choice` obok wywołania (auto-wybór po timeoucie cue nie gra). Wszystkie cue respektują mute z L1.

### CISZA jako stan audio + finał (Slice L4)

Od Slice L4 CISZA jest realnym stanem audio, zgodnie z kanonem („CISZA nigdy jako brak wyboru" — jest liczona i słyszalna jako ustąpienie dźwięku):

- każdy beat CISZY (inkrement `silence_count`: timeout = brak odpowiedzi LUB wybór ciszy/odejścia) nadaje nowy event domenowy `event:silence-beat` z `EventEngine`,
- `AudioSystem` na `event:silence-beat` **wycisza ambient** (duck: zatrzymuje pętlę) i przywraca go po zakończeniu sceny (`event:resolved`) albo po wejściu do nowego pokoju; zmiana aktu w trakcie ciszy nie wznawia pętli (cisza trzyma, ton aktu wraca dopiero przy wznowieniu),
- **finał** (eventy `echo_final_message*` — ostatnia wiadomość + epilogi RAPORT/LIST/ŚWIADECTWO/CISZA) wprowadza ciszę z „finale hold": ambient ustępuje i NIE wzbiera triumfalnie po rozwiązaniu; powraca dopiero przy restarcie/wejściu do świeżego pokoju. Finał nie dostaje triumfalnej muzyki.

Zakres świadomie ograniczony:

- audio-degradation od niskich `fuel`/`parts` pozostaje opcjonalnym rozszerzeniem (nie wdrożone w L4; jeśli kiedyś, to jako dźwiękowy odpowiednik odroczonego F2),
- ECHO nadal ma brzmieć jak terminal/system, nigdy jak ludzki głos.

Tym samym Faza L (audio) jest domknięta: silnik + mute (L1), ambient bed per pokój/akt (L2), SFX UI/eventów + sygnatura ECHO (L3), CISZA jako stan audio + finał (L4).

## Save i deterministyczność

Każdy wybór zapisuje się w `choiceLog`.

Checki powinny mieć debug hook na wynik k6 dla testów. Bez tego nie da się wiarygodnie portować harnessów sukces/porażka.
