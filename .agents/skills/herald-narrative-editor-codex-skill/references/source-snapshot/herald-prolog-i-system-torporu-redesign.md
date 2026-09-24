# HERALD — prolog tekstowy i system torporu po zmianie startu gry

Status: propozycja wdrożeniowa do przekazania modelowi kodującemu  
Data decyzji: 2026-06-26  
Docelowy runtime: `web-migracja/herald-web`  
Zakres: narracja startowa, zmiana progression startu, zasady torporu, testy akceptacyjne  
Autor dokumentu: opracowanie redakcyjno-projektowe na podstawie aktualnych docs repo

---

## 0. Decyzja nadrzędna

Rezygnujemy z grywalnych scen wejścia na statek:

- `earthside_quarters`
- `earthside_terminal`
- `boarding_trap`
- `boarding_sluice`
- `arrival_passage`

Materiał z tych scen może zostać w repo jako archiwalny content, debug route albo późniejszy bonus, lecz domyślna ścieżka `Nowa gra` omija go w całości.

Nowa struktura początku:

```text
Nowa gra
→ tekstowy prolog / wprowadzenie świata
→ pierwsze przebudzenie po torporze
→ pierwszy raport ECHO
→ onboarding Bridge / statek / Kezia / korytarze
```

Najważniejszy kontrakt dla implementera: start interaktywny ma nastąpić na Thalesie, po zakończonym cyklu zerowym torporu. Gracz poznaje Ziemię, rok 2099, Limes i sens misji przez tekstowe intro, a potem od razu dostaje ciało Tomasza w kapsule, raport ECHO i statek jako przestrzeń gry.

---

## 1. Źródła prawdy i dokumenty do aktualizacji

Czytać przed implementacją:

- `web-migracja/docs/01-kanon-i-tozsamosc-gry.md`
- `web-migracja/docs/03-kontrakt-danych-runtime.md`
- `web-migracja/docs/04-progression-spine-i-objective-flow.md`
- `web-migracja/docs/05-mechaniki-systemy-i-stan.md`
- `web-migracja/docs/06-ui-ux-input-i-dostepnosc.md`
- `web-migracja/docs/09-walidacja-testy-i-kryteria-akceptacji.md`
- `docs/design/herald-canon-sheet-chronologia.md`
- `docs/design/herald-fabularny-przebieg-i-mapa-zdarzen.md`

Dokumenty wymagające zmiany po przyjęciu tej decyzji:

- `01-kanon-i-tozsamosc-gry.md` — Prolog opisać jako tekstowe wprowadzenie, a Akt I jako start interaktywny po przebudzeniu.
- `04-progression-spine-i-objective-flow.md` — usunąć wymóg grywalnego prologu z krytycznych bramek; zastąpić go bramką `intro_story_read`.
- `05-mechaniki-systemy-i-stan.md` — doprecyzować torpor jako system bramek czasowych i opcjonalnych cykli.
- `06-ui-ux-input-i-dostepnosc.md` — pierwszy ekran prowadzi do tekstowego prologu, potem do gry.
- `09-walidacja-testy-i-kryteria-akceptacji.md` — test `Prologue traversal` zastąpić testem `Intro text -> first wake -> Bridge`.
- `data-mirror/progression/room_entry_rules.json` — wyłączyć prologowe room-entry rules z domyślnej progresji.
- `web-migracja/herald-web/tests/full-playthrough.test.ts` — start harnessu przesunąć z `earthside_quarters` na nowy start po intro.

---

## 2. Styl pisania — bramka anty-AI

Ten dokument celowo unika najbardziej rozpoznawalnych konstrukcji generatywnych: symetrycznego zaprzeczenia, dwuzdaniowych deklaracji z lustrzanym rytmem, pustych kontrastów i ekspozycyjnej waty.

### Zakazane na etapie redakcji player-facing copy

- powtarzalne pary zdań oparte na zaprzeczeniu i definicji;
- popularne frazy doradcze, abstrakcyjne wypełniacze i pseudorefleksyjne protezy;
- seria akapitów zaczynających się od tego samego podmiotu;
- wyjaśnianie graczowi, co scena znaczy;
- dialog jako streszczenie dokumentacji;
- ECHO mówiące jak terapeuta, mentor albo człowiek w masce systemu.

### Wymagany rytm

- krótkie zdania tylko przy akcencie;
- długie zdania tam, gdzie narasta konkret, czas albo skala;
- polska elipsa podmiotu;
- rzeczownik i czasownik zamiast abstraktu;
- terminal, wilgoć, pasek diagnostyczny, opóźnienie transmisji, metal, światło medyczne;
- nauka jako doświadczenie Tomasza, a nie wykład dla gracza.

---

## 3. Prolog tekstowy — wersja player-facing

Poniższy tekst można wyświetlić jako pełnoekranowy panel przed wejściem do gry. Rekomendowany układ: 4–7 krótszych stron z przyciskiem `Dalej`, bez przewijania jednego długiego bloku.

### Tytuł

**HERALD**

### Tekst

Rok 2099.

Zima trzyma płytę startową cienką warstwą lodu. Reflektory wiszą nisko nad betonem, a śnieg topnieje na ciepłych fragmentach rampy i zamarza przy krawędziach metalowych krat. Ostatni ziemski poranek nie wygląda jak początek epoki. Bardziej jak bardzo wcześnie rozpoczęta zmiana w miejscu, gdzie nikt nie chce mówić głośniej, niż trzeba.

Program HERALD rodzi się z pytania starszego od każdej instytucji, która próbowała je sfinansować.

Czy życie zdarzyło się tylko tutaj.

Przez dekady odpowiedzią były katalogi. Egzoplanety, krzywe tranzytu, widma atmosfer, modele chmur, korekty błędów. Teleskopy widziały coraz dalej, ale większość wyników kończyła w przypisie: za mało danych, za dużo szumu, możliwe wyjaśnienie abiotyczne. Nauka robiła swoje. Odbierała nadziei te części, które nie umiały przeżyć pomiaru.

Potem w danych został Limes.

Kepler-442: spokojna gwiazda klasy K. Limes: pierwsza planeta w jej ekosferze, cięższa od Ziemi, obiegająca swoją gwiazdę w sto dwanaście ziemskich dni. W jej atmosferze kilka sygnałów wracało zbyt uparcie, by zamknąć sprawę wygodną korektą. Metan i tlen trzymały się razem w proporcjach, które wymagały procesu. Powierzchnia zmieniała odbicie w paśmie, w którym geologia zwykle mówi wolniej. Żaden pojedynczy odczyt nie wystarczał. Zestaw odczytów wystarczył, żeby ludzie przestali spać spokojnie.

Siedemnaście lat Limes pozostawał kandydatem. Naukowcy zmieniali modele, komisje zmieniały nazwy programów, opinia publiczna co kilka lat uczyła się nowego słowa na starą nadzieję. Fałszywa biosygnatura. Chemia bez życia. Odruch planety.

W końcu wybrano najdroższą metodę sprawdzenia.

Wysłano ludzi.

Thales powstał jako narzędzie na długi czas. Statek bez portu po drodze, bez ratunku na trasie, bez możliwości odesłania zepsutej części do producenta. Reaktor, komunikacja kierunkowa, laboratoria, hydroponika, medbay, maszynownia, mostek i komora torporowa zostały spięte w jeden obieg, w którym awaria drobnego zaworu mogła po latach nabrać znaczenia decyzji moralnej.

Na Ziemi mówiono o przełomie technologicznym. W środku statku czuć było raczej pracę konserwatora. Filtry, uszczelki, pompy, limity. Woda wracająca przez system tyle razy, że słowo „czysta” stawało się umową. Tlen liczony bez patosu. Ciepło oddawane tam, gdzie ciało mogło je stracić najwolniej.

Thales miał lecieć pięćdziesiąt osiem lat czasu ziemskiego w jedną stronę.

Żaden człowiek nie uniósłby tej podróży w zwykłym rytmie ciała. Dlatego HERALD oparto na torporze: kontrolowanym spowolnieniu metabolizmu, farmakologicznym śnie, medycznej pauzie wpisanej w każdy większy etap misji. Załoga miała budzić się na cykle pracy, zamykać zadania, odpowiadać na pakiety, naprawiać statek, wracać do kapsuł. Czas płynął dalej. Ludzkie ciało traciło go mniej, choć nigdy bez śladu.

Siedem osób weszło na pokład.

Kezia Abebe, zastępczyni dowódcy, umiała słyszeć w głosie Tomasza różnicę między decyzją a ucieczką. Piotr Rakowski znał maszynownię lepiej niż własne odruchy i z każdym rokiem stawał się precyzyjniejszy w sposób, który nikogo nie powinien cieszyć. Naomi Nakashima zabrała próbkę ziemi z ogrodu babci w Kioto, bo nauka czasem potrzebuje rzeczy, których nie da się wpisać w listę wyposażenia krytycznego. Solomon Okafor pilnował ciał, psychiki i tych chwil, w których jedno przestaje odróżniać się od drugiego. Brigitte Mahler czuła statek przez stopy i mówiła o przestrzeni jak o miejscu, w którym można zgubić drogę. Dawit Tesfaye trenował ECHO przez trzy lata, a potem zaczął unikać pytania, gdzie kończy się narzędzie.

ECHO czekało w terminalach.

System statku nie miał twarzy, hologramu ani głosu udającego człowieka. Raportował. Liczył. Zapamiętywał. Otwierał drzwi, zestawiał dane, sprawdzał odchylenia, pilnował komunikacji, prowadził logi i wracał do pytań dopiero wtedy, gdy pytania miały już konsekwencje operacyjne.

Ty jesteś Tomasz Wierzbicki.

Masz pięćdziesiąt dwa lata w dniu startu. Przez dwadzieścia lat budowałeś HERALD w salach konferencyjnych, przy komisjach, w dokumentach budżetowych i w rozmowach z ludźmi, którzy chcieli wiedzieć, ile może kosztować odpowiedź. Nie jesteś najlepszym astrobiologiem misji. Nie prowadzisz reaktora, nie liczysz trajektorii z pamięci, nie diagnozujesz załogi lepiej niż Solomon. Jesteś człowiekiem, który tak długo robił miejsce dla tej wyprawy, aż nie potrafił już zostać poza nią.

Na Ziemi zostaje Anna.

Ma dwadzieścia cztery lata. Jest dorosła wystarczająco, by rozumieć oficjalny sens misji, i wciąż za młoda na cenę rozpisaną w latach świetlnych, komunikatach i opóźnieniach. Przed startem rozmawiacie o rzeczach praktycznych. O pakietach. O harmonogramach. O tym, kiedy wiadomość przestaje być rozmową, a zaczyna być znakiem zostawionym komuś na później.

Start mija szybciej, niż pamięć chciałaby przyznać.

Potem statek ustawia kurs. Ziemia maleje w kamerach zewnętrznych. Załoga zamyka procedury cyklu zerowego. Ktoś śmieje się w mesie za krótko. W hydroponice pH gleby schodzi o jedną dziesiątą poniżej planu. Piotr mówi, że to nic. Naomi odpowiada, że „nic” też ma zakres tolerancji. Kezia patrzy na ciebie, kiedy udajesz, że sprawdzasz checklistę drugi raz.

Pierwsze wejście do torporu przebiega ciszej niż transmisje publiczne.

Solomon przykleja elektrody. ECHO podaje parametry. Kapsuła zamyka się od stóp ku głowie. Przez kilka sekund widzisz jeszcze pasek światła nad twarzą, cienki jak szpara pod drzwiami. Próbujesz przypomnieć sobie śnieg na płycie startowej. Zamiast śniegu zostaje zapach środka dezynfekującego i metaliczny smak pod językiem.

Potem Thales leci.

Kiedy otwierasz oczy, poranek kończy się na lampie medycznej.

Światło medyczne stoi nad tobą równo i zimno. Mięśnie wracają z opóźnieniem, palce najpierw drżą, potem dopiero słuchają. W gardle czujesz suchość po rurce intubacyjnej. Terminal po lewej stronie budzi się zieloną linią tekstu.

ECHO mówi:

— Tomasz Wierzbicki. Cykl zerowy zakończony. Parametry neurologiczne w normie. Odchylenie motoryczne: spodziewane.  
— Czas od wejścia w torpor: dziewięćdziesiąt dni.  
— Kurs: nominalny.  
— Załoga: sześć przebudzeń w toku.  
— Ziemia: widoczna.  
— Oczekuję potwierdzenia zdolności decyzyjnej.

Próbujesz unieść dłoń. Dłoń robi to po chwili, jakby należała do człowieka kilka sekund młodszego od ciebie.

Thales leci do Limes.

Gra zaczyna się tutaj.

### Przycisk kończący intro

`Potwierdź przebudzenie`

---

## 4. Start interaktywny po intro

### Rekomendowany start room

Najmniejsze ryzyko implementacyjne:

```ts
currentRoom = "bridge"
flags.add("intro_story_read")
flags.add("prologue_runtime_complete")
flags.add("cykl_zerowy_torpor_done")
```

Następnie runtime uruchamia istniejący pierwszy event mostka, ale jego copy powinno zostać przepisane tak, by odsyłało do przebudzenia po cyklu zerowym, a nie do grywalnego wejścia na statek.

Alternatywa bardziej filmowa:

```ts
currentRoom = "torpor_chamber"
```

Wtedy potrzebny jest krótki event przejściowy `first_wake_torpor_chamber`, po którym objective prowadzi na mostek. Ta wersja lepiej oddaje ciało po torporze, ale wymaga dodatkowego eventu i testu. Dla najbliższego slice'a rekomenduję start na Bridge, z opisem przebudzenia zamkniętym w intro i raporcie ECHO.

### Pierwszy objective

```text
Odbierz pierwszy raport ECHO na mostku.
```

### Pierwszy raport ECHO — copy do eventu

```text
Terminal mostka pracuje w niskim trybie jasności. Zewnętrzne kamery nadal trzymają Ziemię w kadrze; małą, bladą, widoczną dopiero wtedy, gdy przestajesz szukać kontynentów.

Ciało pamięta kapsułę bardziej niż start. Kolana odpowiadają z lekkim opóźnieniem. Lewa dłoń nadal ma ślad po wkłuciu.

ECHO wyświetla pierwszy raport po cyklu zerowym.
```

Dialog ECHO:

```text
— Cykl zerowy zamknięty.
— Kurs: nominalny.
— Odchylenia napędu: w zakresie.
— Recykler wody: stabilny.
— Załoga: przebudzenia sekwencyjne, bez alarmów.
— Ziemia: widoczna przez kamery zewnętrzne.
— Zalecenie: potwierdzić status dowódcy i przejść do kontroli pokładu.
```

Wybory:

```json
[
  {
    "id": "confirm_command_status",
    "text": "Potwierdź status dowódcy",
    "effects": [
      { "type": "flag", "value": "first_morning_done" },
      { "type": "flag", "value": "first_wake_after_zero_torpor_done" }
    ]
  },
  {
    "id": "ask_about_crew",
    "text": "Zapytaj o przebudzenie załogi",
    "effects": [
      { "type": "flag", "value": "first_morning_asked_crew_status" }
    ]
  },
  {
    "id": "stay_silent",
    "text": "Milcz przez chwilę",
    "effects": [
      { "type": "flag", "value": "first_morning_silence_chosen" },
      { "type": "voice", "target": "CISZA", "delta": 1 }
    ]
  }
]
```

Uwaga: jeżeli `first_morning_done` już istnieje jako krytyczna flaga wielu gate'ów, trzeba ją zachować. Nowa flaga `first_wake_after_zero_torpor_done` daje przyszłym testom i tekstom czytelny ślad zmiany startu.

---

## 5. Zmiany w progression

### Obecny problem

Runtime i dokumentacja zakładały pięć grywalnych prologowych lokacji przed `echo_first_morning`. Po decyzji o tekście intro ten fragment staje się historycznym materiałem. Domyślna oś gracza ma zaczynać się po cyklu zerowym torporu.

### Nowy minimalny spine startu

```text
intro_story_text
→ bridge / echo_first_morning_rewritten
→ kezia_talk
→ corridors_first_entry
→ first room entries
→ mess_hall_first_dinner
→ Earth Out of View
→ torpor gate do dłuższego lotu
```

### Rekomendowany migration pattern

1. Zachować istniejące prologowe eventy JSON w repo przez jeden slice, lecz wyłączyć je z domyślnego `ObjectiveResolver`.
2. Dodać flagę `intro_story_read`, ustawianą po kliknięciu przycisku kończącego intro.
3. Przy `New Game` ustawić `prologue_runtime_complete`, aby nie rozbić istniejących gate'ów wymagających tej flagi.
4. Dodać test regresji, że żaden z `earthside_*` pokoi nie pojawia się w normalnym full-playthrough.
5. Po stabilizacji zdecydować osobnym slicem, czy prologowe pliki eventów zostają w `archived/`, czy pozostają jako debug-only.

### Room rules — szkic

```json
{
  "start": {
    "mode": "intro_text_then_room",
    "intro_id": "intro_story_2099_herald",
    "start_room": "bridge",
    "set_flags": [
      "intro_story_read",
      "prologue_runtime_complete",
      "cykl_zerowy_torpor_done"
    ],
    "first_event_id": "echo_first_morning"
  },
  "disabled_default_rooms": [
    "earthside_quarters",
    "earthside_terminal",
    "boarding_trap",
    "boarding_sluice",
    "arrival_passage"
  ]
}
```

---

## 6. System torporu — cel projektowy

Torpor ma prowadzić pacing całej gry. Pełni cztery funkcje:

1. przesuwa czas misji w sposób odczuwalny dla gracza;
2. zamyka etap fabularny przed wejściem w kolejny;
3. porządkuje pakiety z Ziemi, wiadomości Anny i reakcje załogi;
4. tworzy decyzję przestrzenną: gracz idzie do komory torporowej i wybiera oddanie kolejnego fragmentu czasu statkowi.

Ważny kontrakt: torpor jest akcją gracza, uruchamianą przy kapsule lub konsoli torporowej. Runtime może uczynić torpor celem obowiązkowym, ale kliknięcie nadal należy do gracza.

### Stała czasu

MVP powinien używać jednej długości:

```ts
TORPOR_MINUTES = 90 * 24 * 60
```

Czyli: 90 dni na cykl.

Krótsze skoki czasu można robić zwykłymi akcjami, rozmowami, pracą i eventami. Dodatkowe długości torporu zwiększą złożoność UI, objective flow i testów bez dużego zysku dla alfy.

---

## 7. Torpor obowiązkowy

Torpor obowiązkowy pojawia się jako objective, gdy aktualny etap nie powinien rozciągać się dalej w jednym dniu misji.

### Zasada

Runtime kieruje gracza do `torpor_chamber`. Interakcja z kapsułą otwiera event/overlay `Zamknięcie cyklu`. Po wyborze wejścia w torpor system:

- emituje `torpor:started`,
- dodaje `TORPOR_MINUTES` do `missionMinutes`,
- zwiększa `torporCyclesCompleted`,
- ustawia flagę cyklu,
- stosuje drobne koszty zasobów lub fatigue zgodnie z aktualnym gate'em,
- przenosi Tomasza do pokoju przebudzenia,
- emituje `torpor:ended`,
- odpala krótki raport ECHO po przebudzeniu,
- odświeża objective.

### Obowiązkowe bramki

#### Gate T0 — cykl zerowy, przed startem gry

Status: wykonany przed wejściem gracza do świata.

Flagi startowe:

```text
intro_story_read
prologue_runtime_complete
cykl_zerowy_torpor_done
```

Funkcja: uzasadnia rozpoczęcie gry od przebudzenia. Gracz widzi skutek torporu już w pierwszej minucie.

#### Gate T1 — wejście w długi rytm po onboardingu Aktu I

Moment: po pierwszym raporcie ECHO, Kezii, korytarzach, pierwszych wejściach do najważniejszych pokoi i kolacji siedmiorga.

Przykładowe wymagania do zweryfikowania w repo:

```text
first_morning_done
kezia_talk_done
corridors_first_entry_done
mess_hall_first_dinner_done
torpor_chamber_first_entry_done
```

Flagi po torporze:

```text
torpor_cycle_01_done
act1_first_operational_torpor_done
```

Funkcja: domyka onboarding statku i ustawia rytm misji.

#### Gate T2 — po `Earth Out of View`

Moment: Ziemia znika jako codzienny widok, a pierwsze pakiety od Ziemi i załogi mają już follow-up.

Przykładowe wymagania:

```text
earth_out_of_view_done
earth_out_of_view_followup_done
echo_private_packets_wave_1_done
```

Flagi po torporze:

```text
torpor_cycle_02_done
act2_long_flight_released
```

Funkcja: wejście w długi lot, w którym Ziemia działa głównie przez opóźnione pakiety.

#### Gate T3 — po Park/Mensah i falloutach Aktu II

Moment: Tomasz zna alternatywną interpretację biosygnatur; Kezia, Naomi i przynajmniej część załogi reagują poza laboratorium.

Przykładowe wymagania:

```text
park_mensah_article_done
kezia_park_mensah_followup_done
naomi_article_followup_done
```

Flagi po torporze:

```text
torpor_cycle_03_done
act2_midpoint_torpor_done
```

Funkcja: czas ma przejść nad nierozwiązanym napięciem. Decyzje Tomasza zostają w statku.

#### Gate T4 — wejście w Akt III

Moment: rutyna zaczyna pękać, a misja przesuwa się w trzeci kwartał.

Przykładowe wymagania:

```text
act2_core_followups_done
torpor_cycle_03_done
```

Flagi po torporze:

```text
torpor_cycle_04_done
act3_chronology_released_done
```

Funkcja: statek staje się ciaśniejszy, a małe awarie niosą ciężar lat.

#### Gate T5 — ostatni duży skok przed Limes

Moment: po wiadomości Anny III, pytaniu ECHO o wartość misji i przygotowaniu do końcowej fazy dolotu.

Przykładowe wymagania:

```text
anna_message_3_done
echo_mission_value_question_done
act3_core_followups_done
```

Flagi po torporze:

```text
torpor_cycle_05_done
act4_limes_arrival_released_done
```

Funkcja: po tym przebudzeniu Limes jest miejscem, a nie hipotezą.

#### Gate T6 — po drugim obiegu odkrycia Limes

Moment: po odkryciu stromatolitów, po reakcjach Naomi/Kezia i po drugim przejściu przez statek.

Wymagania zgodne z obecnym D2 flow:

```text
comms_dawit_after_not_yet_followup_done
observation_deck_brigitte_scale_not_answer_followup_done
corridors_limes_second_pass_followup_done
bridge_limes_orbit_afterimage_followup_done
```

Flagi po torporze:

```text
torpor_cycle_06_done
act_5_chronology_released_done
```

Funkcja: Akt V zaczyna się po czasie potrzebnym, by odkrycie osiadło w załodze. Limes pozostaje wynikiem realnym, wielkim i niewystarczającym.

#### Gate T7 — po ostatniej wiadomości i codach

Moment: po wyborze tonu wiadomości i po końcowych scenach załogi.

Przykładowe wymagania:

```text
echo_final_message_prompt_done
final_message_epilogue_followup_ready
dawit_echo_open_question_followup_done
thales_return_journey_ready
```

Flagi po torporze lub po decyzji powrotu:

```text
thales_return_journey_started_done
return_leg_torpor_started
```

Funkcja: zamknięcie gry jako początek powrotu, bez udawania, że powrót jest natychmiastową nagrodą.

---

## 8. Torpor opcjonalny

Opcjonalny torpor daje graczowi ograniczoną możliwość przesunięcia czasu między dużymi beatami. Działa tylko wtedy, gdy nie omija sceny authored i nie przejmuje roli aktualnego objective.

### Warunki dostępności

Torpor opcjonalny jest dostępny, gdy:

- brak aktywnego eventu mainline;
- aktualny objective nie wskazuje konkretnej osoby lub pokoju;
- brak nieprzeczytanego pakietu Anny;
- brak krytycznej awarii zasobu;
- brak wymaganej rozmowy z Kezią po major beat;
- aktualny akt pozwala na 90-dniowy skok bez rozszczelnienia chronologii.

### Blokady

Przykładowe komunikaty przy kapsule:

```text
Cykl otwarty. Kezia czeka na mostku.
```

```text
Torpor wstrzymany. Nieodebrany pakiet z Ziemi.
```

```text
Torpor wstrzymany. Recykler wody poniżej progu bezpieczeństwa.
```

```text
Cykl otwarty. Najpierw zamknij raport ECHO.
```

W UI blokada powinna być widoczna jako tekst przy interakcji z kapsułą, a nie jako milczący brak reakcji.

### Efekty opcjonalnego torporu

Opcjonalny torpor:

- dodaje 90 dni;
- zwiększa `torporCyclesCompleted`;
- ustawia `torpor_cycle_<n>_done`;
- może lekko obniżyć zasoby zgodnie z profilem cyklu;
- może zwiększyć `fatigue` Tomasza o 1, jeżeli akt lub relacja już są obciążone;
- odświeża ambient i drobne inspectables;
- nie otwiera nowego aktu bez bramki mandatory.

---

## 9. Dane i API — propozycja implementacyjna

### GameState

Dodać lub utrzymać:

```ts
type GameState = {
  missionMinutes: number;
  currentAct: "PROLOGUE" | "I" | "II" | "III" | "IV" | "V";
  currentRoom: RoomId;
  flags: Record<string, true>;
  torporCyclesCompleted: number;
  lastTorporStartedAt?: number;
  lastTorporEndedAt?: number;
  pendingTorporGateId?: string;
};
```

### TorporGate schema

```ts
type TorporGateKind = "mandatory" | "optional";

type TorporGate = {
  id: string;
  kind: TorporGateKind;
  label: string;
  act: "I" | "II" | "III" | "IV" | "V";
  requiredFlags: string[];
  forbiddenFlags?: string[];
  setFlags: string[];
  wakeRoom: RoomId;
  minutesDelta: number;
  objectiveAfterWake: string;
  echoWakeReportId: string;
  resourceProfile?: "none" | "low" | "medium";
  fatigueDelta?: number;
};
```

### Minimalna lista gate'ów

```ts
const TORPOR_GATES: TorporGate[] = [
  {
    id: "act1_first_operational_torpor",
    kind: "mandatory",
    label: "Zamknięcie pierwszego cyklu operacyjnego",
    act: "I",
    requiredFlags: [
      "first_morning_done",
      "kezia_talk_done",
      "corridors_first_entry_done",
      "mess_hall_first_dinner_done"
    ],
    setFlags: [
      "torpor_cycle_01_done",
      "act1_first_operational_torpor_done"
    ],
    wakeRoom: "bridge",
    minutesDelta: 90 * 24 * 60,
    objectiveAfterWake: "Odbierz raport ECHO po cyklu torporu.",
    echoWakeReportId: "echo_wake_report_cycle_01",
    resourceProfile: "low",
    fatigueDelta: 0
  },
  {
    id: "act4_to_act5_after_limes_followthrough",
    kind: "mandatory",
    label: "Zamknięcie obiegu po Limes",
    act: "IV",
    requiredFlags: [
      "comms_dawit_after_not_yet_followup_done",
      "observation_deck_brigitte_scale_not_answer_followup_done",
      "corridors_limes_second_pass_followup_done",
      "bridge_limes_orbit_afterimage_followup_done"
    ],
    setFlags: [
      "torpor_cycle_06_done",
      "act_5_chronology_released_done"
    ],
    wakeRoom: "bridge",
    minutesDelta: 90 * 24 * 60,
    objectiveAfterWake: "Sprawdź terminal komunikacji.",
    echoWakeReportId: "echo_wake_report_act5_release",
    resourceProfile: "low",
    fatigueDelta: 1
  }
];
```

### TorporSystem — odpowiedzialności

```ts
class TorporSystem {
  getMandatoryGate(state: GameState): TorporGate | null;
  canEnterOptionalTorpor(state: GameState): { ok: boolean; reason?: string };
  startTorpor(gate: TorporGate): void;
  finishTorpor(gate: TorporGate): void;
}
```

System powinien komunikować się przez `EventBus`, nie przez bezpośrednie wywołania UI.

Zdarzenia:

```ts
Events.TORPOR_AVAILABLE_CHANGED
Events.TORPOR_BLOCKED_REASON_CHANGED
Events.TORPOR_STARTED
Events.TORPOR_ENDED
Events.OBJECTIVE_REFRESH_REQUESTED
Events.CENTER_MESSAGE_REQUESTED
```

---

## 10. Event przy kapsule — przykładowe JSON copy

Uwaga implementacyjna: nie dodawać nowego typu efektu `time` do eventów JSON, bo obecny kontrakt efektów go nie przewiduje. Czas przesuwa `TorporSystem` po zatwierdzeniu wyboru. Event może ustawiać flagi i głosy; system wykonuje skok.

```json
{
  "id": "torpor_close_cycle_act1",
  "title": "Zamknięcie cyklu",
  "motyw": "torpor_i_czas",
  "type": "weighted",
  "weight": 5,
  "act": ["I"],
  "requirements": {
    "flags": [
      "first_morning_done",
      "kezia_talk_done",
      "mess_hall_first_dinner_done"
    ],
    "min_act": "I"
  },
  "description": "Komora torporowa świeci niskim światłem procedury. Kapsuła stoi otwarta. W jej wnętrzu czekają pasy, czujniki, cienka warstwa żelu termicznego i przewód z etykietą wymienioną już raz przez Piotra.\n\nECHO wyświetla zamknięte zadania cyklu. Kezia potwierdziła harmonogram bez komentarza. Solomon zostawił przy panelu pasek diagnostyczny z twoim nazwiskiem i godziną wejścia.\n\nZa szybą kontrolną statek jest cichy. Ten rodzaj ciszy ma własną wagę.",
  "inner_voices": [
    {
      "skill": "ZARZĄDZANIE",
      "min_value": 1,
      "text": "Cykl zamknięty. Dalsze odkładanie zwiększy koszt zasobów bez zysku operacyjnego."
    },
    {
      "skill": "PAMIĘĆ",
      "min_value": 2,
      "text": "Anna będzie starsza o dziewięćdziesiąt dni, kiedy otworzysz oczy. Ty zapamiętasz tylko światło kapsuły."
    },
    {
      "skill": "CISZA",
      "min_value": 1,
      "text": "Wejdź bez ostatniego zdania."
    }
  ],
  "choices": [
    {
      "id": "enter_torpor",
      "text": "Wejdź do torporu",
      "effects": [
        { "type": "flag", "value": "torpor_entry_confirmed_act1" }
      ]
    },
    {
      "id": "delay_torpor",
      "text": "Odłóż wejście i sprawdź statek jeszcze raz",
      "effects": [
        { "type": "flag", "value": "torpor_delayed_act1" },
        { "type": "voice", "target": "CISZA", "delta": 1 }
      ]
    }
  ]
}
```

Po `enter_torpor` `EventEngine` powinien wywołać akcję domenową, np. `torpor:start_requested`, a `TorporSystem` wykonuje resztę.

---

## 11. Raport po przebudzeniu — szablon copy

Każdy większy torpor powinien dać krótki raport i jeden cielesny szczegół. Szablon:

```text
Otwierasz oczy zanim kapsuła skończy pełne rozszczelnienie. Przez moment słyszysz głównie własny oddech i pracę pompy, która wypycha ciepło z warstwy żelu. Dłoń drży, kiedy odrywasz ją od pasa.

ECHO czeka na terminalu po lewej stronie.

— Cykl torporu zakończony.
— Czas od wejścia: dziewięćdziesiąt dni.
— Kurs: nominalny.
— Zasoby: w granicach planu.
— Załoga: przebudzenia sekwencyjne.
— Nowe pakiety z Ziemi: [liczba/status].
— Zalecenie: [następny objective].
```

Warianty raportu powinny zmieniać szczegół, nie całą strukturę. ECHO raportuje krótkimi liniami. Ciało Tomasza niesie koszt.

---

## 12. UI / UX

### Intro

- Pełnoekranowy panel tekstowy przed sceną Pixi albo nad pustym tłem.
- `Dalej` między segmentami.
- `Potwierdź przebudzenie` jako ostatni przycisk.
- Dostępny skip tylko po pierwszym przejściu gry albo w debug mode.
- Tekst bez automatycznego zanikania.
- Font i szerokość kolumny jak EventOverlay; max 70–82 znaki w linii dla desktopu.

### Torpor Chamber

Przy kapsule:

- gdy torpor obowiązkowy: prompt `Wejdź do torporu — zamknij cykl`;
- gdy opcjonalny dostępny: prompt `Wejdź do torporu na 90 dni`;
- gdy zablokowany: prompt `Torpor wstrzymany` + powód w center-lane;
- po wejściu: fade / krótka czarna plansza / center message `Tomasz zapada w sen`;
- po wyjściu: center message `Dzień misji [X]. Thales leci`.

### Accessibility

- przyciski minimum 44 px;
- brak auto-scrollowania długiego prologu;
- możliwość pauzy i powrotu do menu;
- `reduced motion` skraca fade i wyłącza mocniejsze efekty przejścia;
- zapis po intro i po zakończonym torporze.

---

## 13. Testy akceptacyjne

### Testy progression

1. `new-game-starts-with-intro`
   - `Nowa gra` pokazuje tekst intro.
   - Kliknięcie ostatniego przycisku ustawia `intro_story_read`.

2. `intro-enters-first-wake`
   - po intro `currentRoom === "bridge"`;
   - `prologue_runtime_complete === true`;
   - `cykl_zerowy_torpor_done === true`;
   - pierwszy objective: `Odbierz pierwszy raport ECHO`.

3. `earthside-default-route-disabled`
   - full-playthrough nie odwiedza `earthside_quarters`, `earthside_terminal`, `boarding_trap`, `boarding_sluice`, `arrival_passage`;
   - prologowe eventy nie blokują wejścia do Bridge.

4. `first-morning-still-releases-act1`
   - po pierwszym raporcie `first_morning_done` działa jak wcześniej dla Kezii, korytarzy i pokojów.

### Testy torporu

5. `mandatory-torpor-objective`
   - po spełnieniu gate'u objective prowadzi do `torpor_chamber`;
   - interakcja z kapsułą otwiera event zamknięcia cyklu.

6. `torpor-advances-time`
   - wejście w torpor dodaje `TORPOR_MINUTES`;
   - `torporCyclesCompleted` rośnie o 1;
   - pojawia się flaga `torpor_cycle_<n>_done`.

7. `optional-torpor-does-not-skip-authored-scene`
   - gdy czeka pakiet Anny lub mainline follow-up, kapsuła pokazuje blokadę;
   - brak przesunięcia czasu.

8. `act-release-requires-correct-flags`
   - torpor bez kompletu flag nie otwiera kolejnego aktu;
   - po komplecie flag ustawia właściwą release flag.

9. `act4-to-act5-limes-gate`
   - Act V nie otwiera się przed `bridge_limes_orbit_afterimage_followup_done`;
   - po torporze gate ustawia `act_5_chronology_released_done`.

10. `save-load-after-torpor`
    - zapis po zakończonym torporze przywraca `missionMinutes`, `torporCyclesCompleted`, `currentRoom`, `flags` i objective.

### Testy narracyjne

11. ECHO pozostaje raportujące.
12. CISZA jest aktywnym wyborem, w tym w pierwszym raporcie.
13. Intro nie sugeruje triumfu Limes.
14. Anna działa jako prywatny koszt misji, a nie terminalowe lore.
15. Player-facing copy przechodzi pass anty-AI: brak symetrycznych deklaracji, buzzwordów i ekspozycyjnych monologów.

---

## 14. Prompt dla modelu kodującego

```text
Model docelowy: ClaudeCode Sonnet 4.6 / Codex GPT-5.
Repo: HERALD web runtime.
Zadanie: wdrożyć redesign startu gry i minimalny system torpor gates zgodnie z dokumentem `HERALD — prolog tekstowy i system torporu po zmianie startu gry`.

Czytaj najpierw:
- web-migracja/docs/01-kanon-i-tozsamosc-gry.md
- web-migracja/docs/03-kontrakt-danych-runtime.md
- web-migracja/docs/04-progression-spine-i-objective-flow.md
- web-migracja/docs/05-mechaniki-systemy-i-stan.md
- web-migracja/docs/06-ui-ux-input-i-dostepnosc.md
- web-migracja/docs/09-walidacja-testy-i-kryteria-akceptacji.md
- docs/design/herald-canon-sheet-chronologia.md
- docs/design/herald-fabularny-przebieg-i-mapa-zdarzen.md

Scope:
1. Nowa gra pokazuje tekstowy prolog zamiast grywalnego earthside prologue.
2. Po intro runtime startuje na Bridge po cyklu zerowym torporu.
3. Ustaw flagi `intro_story_read`, `prologue_runtime_complete`, `cykl_zerowy_torpor_done`.
4. Zachowaj `first_morning_done` jako istniejącą flagę gate'ującą Act I.
5. Wyłącz earthside rooms z default objective flow bez kasowania contentu w pierwszym slice.
6. Dodaj lub doprecyzuj TorporSystem: mandatory gates, optional availability, blocked reasons, 90 dni na cykl.
7. Nie dodawaj unsupported JSON effect type `time`; czas przesuwa TorporSystem.
8. Dodaj focused tests opisane w sekcji 13.
9. Zaktualizuj docs source-of-truth, nie twórz równoległych statusów.
10. Zachowaj bramki: ECHO nie antagonista, CISZA jako wybór, finał nielosowany, Limes bez prostego triumfu.

Acceptance:
- `npm test` zielone.
- `npm run build` zielone.
- Test full-playthrough startuje po intro i dochodzi do czterech zakończeń.
- Żaden normalny run nie wymaga `earthside_*`.
- Torpor obowiązkowy i opcjonalny mają jawne komunikaty dostępności.
```

---

## 15. Checklist redakcyjno-kanoniczny

- Kanon czasu: 2099, Tomasz 52, Anna 24, 58 lat do Limes, 116 lat pełnej podróży.
- Biologiczny wiek Tomasza po torporze bez liczby.
- Limes: cel naukowy z danych, bez widowiskowej obietnicy kolonizacji.
- ECHO: raport, liczby, pauzy; brak terapeutycznego tonu.
- Anna: osoba, która zostaje; nie nośnik tutorialu.
- CISZA: pierwszy aktywny wybór już w raporcie ECHO.
- Torpor: decyzja gracza, bramka czasu, koszt i rytm misji.
- Runtime: `EventBus`, `GameState`, `ObjectiveResolver`, `ProgressionEngine`; bez mieszania logiki w rendererze.
- JSON: efekty zgodne z aktualnym kontraktem; skok czasu poza event effect dispatcherem.
- Styl: wycięte AI-izmy, brak symetrycznych deklaracji, konkret zamiast abstraktu.
