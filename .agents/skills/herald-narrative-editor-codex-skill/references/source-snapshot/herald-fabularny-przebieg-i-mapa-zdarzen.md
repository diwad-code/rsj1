# HERALD — Fabularny Przebieg I Mapa Zdarzeń

## Cel dokumentu

Ten dokument porządkuje **cały obecny przebieg fabularny HERALD** w jednej mapie roboczej:

- co jest twardym kanonem,
- co już istnieje w runtime,
- co istnieje jako materiał literacki do adaptacji,
- gdzie narracja jest gęsta,
- gdzie materiał jest jeszcze wyraźnie rzadszy i warto go dopisywać.

To jest dokument do przekazania kolejnemu modelowi lub redaktorowi, który ma **uzupełniać sceny, rozmowy i dialogi bez łamania kanonu**.

---

## Hierarchia źródeł

### 1. Twardy kanon

- `docs/HISTORIA.md`
- `docs/HERALD-fundament-v2.md`
- `docs/design/herald-canon-sheet-chronologia.md`
- `.github/skills/herald-narrative/SKILL.md`

### 2. Aktualny runtime fabularny i najnowsze audyty

- `data/events/act1` do `data/events/act5`
- `docs/design/2026-06-07-comprehensive-narrative-audit.md`
- `docs/design/2026-06-07-comprehensive-narrative-audit-ledger.md`
- `docs/design/2026-06-05-runtime-alignment-audit-matrix.md`
- stan zweryfikowany 2026-06-18 na live manifeście web runtime:
  - `runtime-inventory.json` potwierdza **157 event IDs runtime**
  - po rozwinięciu wariantów jako osobnych authored scen runtime daje **172 grywalne authored sceny**
- rozkład event IDs: `act1=38`, `act2=60`, `act3=19`, `act4=16`, `act5=24`
- rozkład authored scen po rozwinięciu wariantów: `act1=38`, `act2=60`, `act3=19`, `act4=16`, `act5=39`

### 3. Warstwa życia statku poza głównym spine

- `data/ambient/observations/*.json` — 7 paczek obserwacji NPC/ECHO, 74 wpisy
- `data/ambient/banter/*.json` — 7 paczek repeat-talk/banter, 70 wpisów
- `data/ambient/inspectables/*.json` — 15 paczek inspectable objects, 37 obiektów, 121 wpisów

### 4. Materiał literacki i banki scen

- `full-narrative-ideas/ksiega-fabularna-master/HERALD-ksiega-fabularna-master-v6.md`
- `full-narrative-ideas/prolog-i-akt-i/*`
- `full-narrative-ideas/pelne-sceny-akt2-akt4/*`
- `full-narrative-ideas/akt-v-i-zakonczenia/*`
- `full-narrative-ideas/rozmowy-postaci/*`
- `new-narrative-ideas/*`
- `zasoby-fabularne/part0/*`
- `zasoby-fabularne/part1/*`
- `zasoby-fabularne/part2/*`

### Zasada interpretacji

Jeśli źródła się rozchodzą:

1. `docs/HISTORIA.md`, `docs/HERALD-fundament-v2.md` i `docs/design/herald-canon-sheet-chronologia.md` wygrywają.
2. `data/events/**/*.json` i `data/ambient/**/*.json` definiują to, co już jest zakotwiczone w runtime.
3. `docs/design/2026-06-07-comprehensive-narrative-audit.md` i jego ledger definiują aktualny status pokrycia, deficyty ilościowe i powody braków.
4. `full-narrative-ideas/*`, `new-narrative-ideas/*`, `zasoby-fabularne/part0/*`, `zasoby-fabularne/part1/*` i `zasoby-fabularne/part2/*` są materiałem do rozwijania, cięcia i redagowania.
5. `Triumf` i `Pyrrusowe` traktujemy jako **aneks / ekstrapolację**, nie twardy rdzeń.

---

## Jednozdaniowy rdzeń fabuły

Tomasz Wierzbicki poświęca życie misji znalezienia życia pozaziemskiego, a gdy po 58 latach lotu dostaje odpowiedź, okazuje się ona **prawdziwa naukowo, ale niewystarczająca egzystencjalnie**: na Limes istniało życie, lecz nie takie, które odwzajemnia ludzkie patrzenie.

---

## Makrodrzewo Fabularne

```text
PROLOG
└── Start misji THALES
    ├── siedem powodów lotu
    ├── wejście po trapie
    ├── pierwsze wejście na statek
    └── pierwsze powitanie przez ECHO

AKT I — ODLOT / wejście w rytm statku
└── Tomasz budzi się po torporze
    ├── pierwszy raport ECHO
    ├── pierwsza rozmowa z Kezią
    ├── pierwsze wejścia do pokoi statku
    ├── pierwsza kolacja siedmiorga
    ├── Ziemia jeszcze widoczna
    ├── Earth Out of View
    ├── pierwsza korekta kursu Brigitte
    ├── pierwsze prywatne pakiety dla załogi
    └── pytanie ECHO: "jeszcze"

AKT II — DŁUGA CIEMNOŚĆ
└── rutyna zaczyna pękać
    ├── artykuł Park/Mensah podważający wyjątkowość biosygnatur
    ├── Tomasz ukrywa plik przed załogą
    ├── Kezia najpierw liczy zwłokę, potem korytarz niesie ją dalej
    ├── Naomi przenosi fallout z laboratorium do korytarza, mesy i hydroponiki
    ├── cicha kolacja z Kezią
    ├── Piotr i hydroponika
    ├── Solomon i utrata pewności własnych narzędzi
    ├── Brigitte i niski dźwięk statku
    ├── Dawit i ECHO przesuwają się z narzędzia ku relacji
    ├── progi `comms`, `mess_hall`, `medbay`, `hydroponics` i `observation_deck` zaczynają nieść własny ciężar
    └── kolejne mikroprzesunięcia w pokojach i rozmowach

AKT III — TRZECI KWARTAŁ
└── statek staje się za mały
    ├── Anna Message III
    ├── ECHO pyta o wartość misji
    ├── małe awarie rosną emocjonalnie
    ├── Piotr nazywa ubytek
    ├── Solomon zostaje bez formularza
    ├── Kezia czuje nacisk czasu
    └── załoga ledwo mieści się już we wspólnej przestrzeni

AKT IV — PRZYBYCIE DO LIMES
└── odpowiedź przychodzi
    ├── wejście na orbitę
    ├── Naomi odczytuje pierwsze dane
    ├── pierwszy wspólny obraz stromatolitów
    ├── Tomasz i Kezia po odkryciu
    ├── Tomasz sam przy obrazie
    ├── Piotr wraca do precyzji
    ├── Naomi wraca do ziemi z Kioto
    ├── Tomasz i Naomi przy "czterech miliardach lat"
    ├── Solomon po odkryciu
    └── Dawit i ECHO zatrzymują się przy "nie wiem jeszcze"

AKT V — WIADOMOŚĆ I POWRÓT
└── Tomasz przygotowuje ostatnią odpowiedź dla Ziemi
    ├── zdjęcie Anny
    ├── wybór tonu ostatniej wiadomości
    │   ├── RAPORT
    │   ├── LIST
    │   ├── ŚWIADECTWO
    │   └── CISZA
    ├── Dawit + ECHO: otwarte pytanie
    ├── Mesa po epilogu: załoga, potem Kezia
    ├── Brigitte: keepsake i powrót przy szybie
    └── THALES zaczyna lot powrotny
```

---

## Struktura Fabularna Po Aktach

## Prolog

### Funkcja dramatyczna

- ustanowić, że lot nie jest heroiczną epopeją, tylko nieodwracalnym wyborem,
- ustawić siedem osobnych motywacji,
- pokazać Tomasza jako człowieka, który **nie potrafił nie polecieć**.

### Rdzeń sceniczny

- `Ciężar trapu`
- wejście na `Thales`
- pierwsza obecność ECHO
- pierwsze doświadczenie Ziemi jako czegoś, co zaraz przestanie być miejscem, a stanie się odległością

### Główne osoby i ich pytania

- Tomasz: czy poświęcił życie pytaniu prawdziwemu czy tylko własnej potrzebie sensu
- Kezia: czy Tomasz mówił komisjom prawdę, czy tylko zagrał pewność
- Piotr: czy kosmos odsłania jego prawdę, czy go wyjaławia
- Naomi: jakie życie naprawdę istnieje poza Ziemią
- Solomon: czy jego wiedza o psychice wytrzyma próbę własnego doświadczenia
- Brigitte: jak długo można być ciałem statku, nie tracąc siebie
- Dawit: czy ECHO jest narzędziem, rozmówcą, czy czymś pomiędzy

---

## Akt I — Odlot / Wejście W Rytm

### Funkcja dramatyczna

- nauczyć gracza statku, rytmu i tonu,
- zbudować pierwsze przywiązanie do pokoi,
- ustawić ECHO, Kezię, Ziemię i pierwsze pakiety od Anny,
- zakończyć etapem `Earth Out of View`.

### Obowiązkowy spine

- `echo_first_morning` — pierwszy ranek bez poranka
- `kezia_talk` — pierwsze napięcie z Kezią
- `corridors_first_entry` — statek jako ciało
- `observation_deck_first_entry` — Ziemia jeszcze widoczna
- `corridors_first_loop_after_echo` — pierwsza pętla po ECHO
- `bridge_earth_becoming_vector` — Ziemia staje się wektorem nawigacji
- `galley_first_rotation_before_dinner` — pierwsza rotacja w jadalni przed kolacją
- `observation_deck_earth_thinning` — ścieńczenie Ziemi
- `mess_hall_first_dinner` — Kolacja Siedmiorga
- `observation_deck_earth_out_of_view` — Ziemia znika z pola widzenia
- `torpor_chamber_first_entry` — komora torporowa przed pierwszym torporem
- `bridge_brigitte_first_course_correction` — Brigitte przy pierwszej korekcie

### Główne odnogi pokojowe i rozmowne

- Mostek / ECHO:
  - `echo_eclss_tutorial`
  - `kezia_observation_followup`
  - `echo_beginning_checkin`
  - `echo_torpor_continuity`
  - `echo_work_as_distance`
  - `echo_not_yet`
- Korytarze:
  - `corridors_after_observation`
  - `corridors_after_torpor`
  - `corridors_after_packet_wave_1`
- Pokoje:
  - `engine_room_first_entry`
  - `lab_first_entry`
  - `medbay_first_entry`
  - `hydroponics_first_entry`
  - `quarters_first_entry`
  - `quarters_after_anna_message_one`
  - `comms_first_entry`

### Wiadomości i prywatne pakiety

- `anna_message_1`
- `echo_private_packets_wave_1`
- `anna_message_2`
- `echo_private_packets_wave_2`
- follow-up Kezii:
  - `kezia_packet_wave_2_followup`

### Co ten akt musi zostawić po sobie

- Ziemia przestaje być miejscem, staje się pamięcią.
- ECHO jest jeszcze operacyjne, uważne, ale nie "ludzkie".
- Załoga nie jest rodziną; jest zbiorem dorosłych, precyzyjnych ludzi.
- Tomasz zaczyna słyszeć, że praca służy mu także jako schronienie.

### Uwaga o gęstości

Akt I miał silny core (`echo_first_morning`, `kezia_talk`, pierwsze wpisy do pokoi), ale sekwencja środkowa — od pierwszej pętli korytarzowej przez zanikanie Ziemi do pierwszej korekty kursu — była implementacyjnie niepełna. Paczka `6-akt-i-znikanie-ziemi-i-pierwsze-wspolne-rytmy` domknęła ten rdzeń: `38 event IDs`, sekwencja od pierwszej pętli przez kolację i szyb obserwacyjny aż po powrót z komory torporowej jest teraz w pełni w runtime i zweryfikowana harnessami integracjnymi.

---

## Akt II — Długa Ciemność

### Funkcja dramatyczna

- przejść z "wszystko działa" do "coś powoli się przesuwa",
- wprowadzić ranę poznawczą Park/Mensah,
- rozłożyć ciszę i zwłokę na całą załogę,
- pokazać, że rutyna nie stabilizuje już, tylko odsłania pęknięcia.

### Uwaga o gęstości

Po wdrożeniu `part3~gpt/8-akt-ii-naomi-poza-laboratorium-po-park-mensah` i `part3~gpt/9-akt-ii-kezia-poza-mostkiem-po-park-mensah` Akt II ma teraz `55 event IDs`, `44 graph events`, `143 player-facing beats`, `224 explicit choices`, `26 white checks`, `26 blue checks` i `267 hybrid accessible total`. To jest obecnie najgęstszy akt całego runtime nie tylko w samym mainline, ale też w falloutowym łańcuchu Park/Mensah, który po paczce 9 prowadzi już Naomi i Kezię przez korytarze, mesę, laboratorium, hydroponikę, service ladder, zlew po cichej kolacji i małą szybę techniczną przed Brigitte.

### Główny spine

- `park_mensah_article` — punkt zwrotny poznawczy
- `lab_park_mensah_withheld` albo `lab_park_mensah_disclosed`
- `mess_hall_kezia_park_mensah_withheld` albo `mess_hall_kezia_park_mensah_disclosed`
- `corridors_after_park_mensah_ripple`
- `corridors_kezia_handoff_after_article`
- `hydroponics_piotr_after_park_mensah`
- `comms_archive_threshold_after_article`
- `comms_dawit_echo_voice_preference`
- `comms_dawit_message_archive_presence`
- `corridors_naomi_short_route_after_article`
- `galley_naomi_cooling_meal_after_article`
- `comms_corridor_kezia_truth_length`
- `lab_naomi_kyoto_soil_reference`
- `hydroponics_naomi_kyoto_soil_control_patch`
- `service_ladder_kezia_offwatch_checklist`
- `mess_hall_threshold_before_silent_dinner`
- `galley_kezia_before_silent_dinner`
- `mess_hall_kezia_tomasz_silent_dinner`
- `corridor_after_silent_dinner_kezia_release`
- `galley_sink_naomi_after_silent_dinner`
- `medbay_corridor_before_without_notes`
- `hydroponics_filter_route_before_pretext`
- `service_viewport_naomi_false_positive_view`
- `observation_deck_corridor_before_window_pause`

### Główne linie postaci

- Kezia:
  - `corridors_after_park_mensah_ripple`
  - `corridors_kezia_handoff_after_article`
  - `comms_corridor_kezia_truth_length`
  - `service_ladder_kezia_offwatch_checklist`
  - `galley_kezia_before_silent_dinner`
  - `mess_hall_kezia_tomasz_silent_dinner`
  - `corridor_after_silent_dinner_kezia_release`
  - `corridors_kezia_night_pretext`
  - `bridge_kezia_cup_offset`
  - `mess_hall_kezia_cup_without_asking`
- Naomi:
  - `corridors_naomi_short_route_after_article`
  - `galley_naomi_cooling_meal_after_article`
  - `lab_naomi_withering_plant`
  - `lab_naomi_kyoto_soil_reference`
  - `hydroponics_naomi_kyoto_soil_control_patch`
  - `galley_sink_naomi_after_silent_dinner`
  - `service_viewport_naomi_false_positive_view`
- Piotr:
  - `hydroponics_piotr_after_park_mensah`
  - `hydroponics_piotr_filter_pretext`
  - `engine_room_piotr_repairing_repairs`
- Naomi + Piotr:
  - `hydroponics_naomi_piotr_small_repair`
  - `hydroponics_naomi_piotr_flow_drift`
  - `hydroponics_naomi_piotr_are_you_okay`
- Solomon:
  - `medbay_solomon_memory_baseline`
  - `medbay_corridor_before_without_notes`
  - `medbay_solomon_without_notes`
  - `medbay_solomon_piotr_gcr_burden`
  - `medbay_solomon_piotr_check_together`
  - `medbay_solomon_chair_observation`
- Brigitte:
  - `observation_deck_corridor_before_window_pause`
  - `observation_deck_brigitte_window_pause`
  - `bridge_brigitte_low_hum`
  - `bridge_brigitte_manual_hold_after_hum`
  - `mess_hall_brigitte_offwatch_paper_map`
  - `engine_room_piotr_brigitte_ship_sound`
- Dawit + ECHO:
  - `comms_archive_threshold_after_article`
  - `comms_dawit_echo_voice_preference`
  - `comms_dawit_message_archive_presence`
  - `comms_dawit_echo_relief_vs_comfort`
  - `echo_night_question`
  - `echo_solomon_silence_pattern`
  - `torpor_chamber_dawit_continuity_question`
  - `quarters_dawit_journal_pause`
  - `quarters_dawit_unfinished_note`

### Główne mikroprzesunięcia relacyjne

- `corridors_kezia_night_pretext`
- `corridors_kezia_handoff_after_article`
- `comms_corridor_kezia_truth_length`
- `service_ladder_kezia_offwatch_checklist`
- `galley_kezia_before_silent_dinner`
- `corridor_after_silent_dinner_kezia_release`
- `corridors_naomi_shared_silence`
- `mess_hall_kezia_cup_without_asking`
- `mess_hall_kezia_solomon_honesty`
- `comms_dawit_brigitte_ship_weight`

### Co ten akt musi zostawić po sobie

- Tomasz nosi tajemnicę Park/Mensah za długo.
- Piotr zaczyna zdradzać symptomy zaniku.
- Naomi przechodzi od ciekawości do napiętego czuwania także poza laboratorium: przez skrót trasy, stygnący posiłek, kontrolną łatkę z Kioto, zlew po cichej kolacji i metodę przy małej szybie.
- ECHO zaczyna zadawać pytania nie w pełni operacyjne.
- Kezia rozpoznaje zwłokę Tomasza i nie daje mu wygodnego alibi: przenosi to z mostku w handoff, pytanie o długość prawdy, checklistę po dyżurze i cichy release po kolacji.
- Park/Mensah przestaje być już wyłącznie sprawą laboratorium i zaczyna rozchodzić się po progach oraz krótkich przejściach całego statku.

---

## Akt III — Trzeci Kwartał

### Funkcja dramatyczna

- zacieśnić przestrzeń,
- podnieść amplitudę małych zdarzeń,
- ustawić środkowe pytanie gry: jeśli misja była oparta na błędnej interpretacji, co była warta,
- doprowadzić do tego pytania przez społeczne ściśnięcie statku, a nie traktować go jako samotny błysk filozoficzny.

### Trzy ruchy Aktu III

#### 1. Wejście w trzeci kwartał

- `anna_message_3`
- `echo_mission_worth_question`
- `comms_dawit_echo_relational_presence`
- `comms_corridor_dawit_unsent_queue`
- `comms_messages_without_relief`
- `echo_shared_scale_question`
- `observation_deck_brigitte_before_no_answer`

To jest próg aktu. Statek jeszcze działa, ale przestaje pełnić funkcję neutralnego schronienia. Pytania o obecność, odległość i sens nie są już tylko prywatnymi odchyleniami.

#### 2. Społeczne ściśnięcie statku

- `corridors_small_failure_large_amplitude`
- `medbay_solomon_without_form`
- `engine_room_piotr_reroute_without_problem`
- `engine_room_piotr_elegant_name_for_loss`
- `mess_hall_threshold_ship_too_small`
- `mess_hall_ship_too_small`
- `mess_hall_conversation_no_start`

To jest środek Aktu III. Klucz nie leży w jednym konflikcie, tylko w tym, że małe rzeczy zaczynają nosić zbyt duży ciężar: awaria, próg comms, objazd w maszynowni, wejście do mesy i rozmowa, która nie może się zacząć.

#### 3. Kulminacja bez wybuchu

- `bridge_after_mission_worth`
- `corridors_hatch_delay_after_mission_worth`
- `corridors_kezia_time_pressure`
- `observation_deck_corridor_before_understanding`
- `observation_deck_brigitte_before_understanding`

Pytanie ECHO o wartość misji zostaje nazwane wcześnie, ale kulminuje dopiero przez powrót `bridge_after_mission_worth`, zbyt długą sekundę przy włazie i korytarzowe przejście do szyby. Ten akt domyka się przez brak ulgi, nie przez wielkie wyznanie.

### Ciche łączniki i progi (pakiet 11 + rozszerzenie `part3~gpt/5`)

- `bridge_after_mission_worth` — ECHO "Nie jestem pewien" po pytaniu o wartość misji
- `comms_corridor_dawit_unsent_queue` — próg do komunikacji: forma wiadomości ważniejsza niż sama treść
- `comms_messages_without_relief` — Dawit przy archiwum wiadomości: ulga jako osobna usługa
- `engine_room_piotr_reroute_without_problem` — objazd, który technicznie jest niczym, a społecznie kosztuje za dużo
- `mess_hall_threshold_ship_too_small` — próg mesy staje się osobną decyzją
- `mess_hall_conversation_no_start` — Kezia: "To nigdy nie była wentylacja"
- `corridors_hatch_delay_after_mission_worth` — jedna sekunda przy włazie zaczyna ważyć bardziej niż sama usterka
- `observation_deck_brigitte_before_no_answer` — Brigitte przed odpowiedzią: proporcja zanim padnie sens
- `observation_deck_corridor_before_understanding` — próg do szyby: najpierw miejsce, potem skala
- `observation_deck_brigitte_before_understanding` — Brigitte przy szybie przed Aktem IV

### Co ten akt musi zostawić po sobie

- pytanie o sens misji staje się jawne,
- statek przestaje być schronieniem i robi się za mały,
- postacie są mniej skłonne do rozmowy, bardziej do skrótu, urwania, powrotu do pracy,
- to nie jest akt wyznań, tylko akt ograniczonej pojemności,
- Tomasz traci możliwość ukrywania się w samej funkcji,
- Kezia przestaje pełnić rolę miękkiego alibi dla jego kompetencji.

### Uwaga o gęstości

Akt III był do 2026-06-04 **najrzadszym aktem środkowym**. Po wdrożeniu pakietu 11 i rozszerzeniu `part3~gpt/5-akt-iii-korytarze-i-male-awarie` ma teraz `19 eventów`, `14 graph events`, `91 player-facing beats`, `111 explicit choices`, `15 white checks` i `14 blue checks`. Nadal przegrywa z Aktem II w `inner_voices` i pełnych scenach zespołowych, ale nie jest już dziurawym mostem między mostkiem a Limes.

---

## Akt IV — Przybycie Do Limes

### Funkcja dramatyczna

- dowieźć odpowiedź,
- pokazać naukę jako emocję,
- pokazać, że odkrycie jest wielkie, ale nie pocieszające,
- przejść od "czy istnieje życie" do "jak odpowiedzieć na świat, który nie odpowiada".

### Obowiązkowy spine

- `bridge_limes_first_orbit`
- `lab_naomi_limes_first_data`
- `bridge_limes_stromatolites_first_image`
- `lab_tomasz_kezia_after_discovery`
- `lab_tomasz_alone_after_discovery`

### Główne odnogi i dopowiedzenia

- Naomi:
  - `lab_naomi_kyoto_soil_after_limes`
  - `lab_tomasz_naomi_four_billion_years`
- Piotr:
  - `engine_room_piotr_return_to_precision`
- Solomon:
  - `medbay_solomon_after_discovery`
- Dawit + ECHO:
  - `comms_dawit_echo_limes_not_yet`

### Reakcje poza laboratorium (wdrożone 2026-06-04, rozszerzone 2026-06-07 przez `part3~gpt/1-akt-iv-poza-lab`, dopięte follow-through D2 2026-06-18)

- `mess_hall_after_limes_politeness` — Piotr: "wielka odpowiedź nie poprawia apetytu"
- `comms_dawit_after_not_yet` — Dawit: "szukam uczciwego opóźnienia"; ECHO było ostrożniejsze
- `observation_deck_brigitte_scale_not_answer` — Brigitte: "jest więcej skali, to nie to samo"
- `corridors_limes_second_pass` — Kezia i korytarz dopowiadają, że wielkość odkrycia nie przynosi ulgi
- `bridge_limes_orbit_afterimage` — mostek zostawia status Limes jako nierozstrzygnięty, uczciwszy niż triumfalny

### Co ten akt musi zostawić po sobie

- życie na Limes było realne,
- stromatolity są wielkie, stare i pozbawione wzajemności,
- Tomasz rozumie, że szukał nie tylko faktu istnienia życia, ale także odpowiedzi na ludzkie patrzenie,
- Kezia przekierowuje go ku Annie,
- Naomi staje się świadkiem, nie tylko badaczką.

### Uwaga o gęstości

Akt IV był silnie skoncentrowany w laboratorium. Pakiet 12 najpierw rozszerzył odkrycie poza lab trzema nowymi beatami (`mess_hall_after_limes_politeness`, `comms_dawit_after_not_yet`, `observation_deck_brigitte_scale_not_answer`), a paczka `part3~gpt/1-akt-iv-poza-lab` dołożyła drugi pass:

- przekształcenie `engine_room_piotr_return_to_precision`, `medbay_solomon_after_discovery`, `mess_hall_after_limes_politeness`, `comms_dawit_after_not_yet` i `observation_deck_brigitte_scale_not_answer` w pełniejsze graph scenes,
- pierwsze sensowne checki późnego discovery fallout,
- nowe ambient observations, banter i inspectables dla `bridge`, `engine_room`, `medbay`, `mess_hall`, `comms`, `corridors` i `observation_deck`.

Slice D2 domknął dłuższy follow-through po Limes w web runtime: po `comms_dawit_after_not_yet` objective przechodzi przez `observation_deck_brigitte_scale_not_answer`, nowe `corridors_limes_second_pass`, nowe `bridge_limes_orbit_afterimage` i dopiero wtedy pozwala wejść w torpor / Act V. Lab nadal pozostaje centrum odkrycia, ale statek reaguje na nie szerzej niż jednym krótkim echem, a bramka „Limes bez prostego triumfu" jest jawnie podtrzymana.

---

## Akt V — Wiadomość, Wybór, Powrót

### Funkcja dramatyczna

- domknąć przemianę Tomasza nie przez "wynik misji", tylko przez **głos odpowiedzi**,
- zamknąć finał przez relacje: Anna, ECHO, Brigitte, Dawit,
- uruchomić powrót `Thalesa`.

### Obowiązkowy spine

- `quarters_tomasz_anna_photo_private_memory`
- `anna_message_4` — czwarty list Anny (trigger: comms, po `act_5_chronology_released_done`)
- `echo_final_message_prompt` — wymaga `anna_message_4_followup_done`
- jedna z czterech gałęzi końcowych:
  - `echo_final_message_report_epilogue`
  - `echo_final_message_letter_epilogue`
  - `echo_final_message_testimony_epilogue`
  - `echo_final_message_silence_epilogue`
- `comms_after_final_message_release`
- `corridors_after_final_message_first_walk`
- `comms_dawit_echo_open_question_coda`
- `observation_deck_return_passage`
- `observation_deck_brigitte_private_keepsake`
- `observation_deck_brigitte_return_window`

### Cody postaci po finale (wdrożone 2026-06-04 i rozszerzone 2026-06-06)

Po rozegraniu wybranego epilogu końcowego (`echo_final_message_*_epilogue`) runtime korzysta dziś z pięciu skonsolidowanych eventów wariantowych plus łańcucha Brigitte na Observation Deck:

- Naomi (lab): `lab_naomi_final_coda`
- Piotr (engine room): `engine_room_piotr_final_coda`
- Solomon (medbay): `medbay_solomon_final_coda`
- Załoga w mesie: `mess_hall_crew_after_final_message`
- Kezia w mesie, po scenie załogi: `mess_hall_kezia_final_coda`

### Dodatkowe beaty authored Actu V poza historycznym szkieletem spine

Live runtime ma dziś jeszcze `6` plików `act5`, które nie były wcześniej nazwane w tym dokumencie, ale nie są już `ambientem` ani luźnym `EXTRA`:

- trzy **wymagane beaty przygotowawcze przed `echo_final_message_prompt`**:
  - `lab_act5_farewell_walk`
  - `medbay_act5_farewell_walk`
  - `hydroponics_act5_farewell_walk`
- trzy **opcjonalne progi / aftercare threshold beats po epilogu końcowym**:
  - `mess_hall_threshold_after_final_message`
  - `service_corridor_piotr_after_final_margin`
  - `medbay_solomon_aftercare_threshold`

Interpretacja source-of-truth na 2026-06-17:

- trio `farewell_walk` funkcjonalnie **rozszerza spine przed wyborem tonu**, bo `echo_final_message_prompt` wymaga dziś ukończenia wszystkich trzech kroków;
- trio progowe po epilogu **pozostaje optional room-routingiem / shared aftercare**, a nie obowiązkowym mainline spine;
- żaden z tych sześciu plików nie powinien być dalej liczony jako `ambient`.

### Cztery kanoniczne zakończenia

- `RAPORT`
  - Tomasz wybiera ton instytucjonalny i naukowy.
  - Cena: nie mówi Annie najważniejszej rzeczy.
- `LIST`
  - Tomasz wybiera Annę i prywatny głos.
  - Cena: osłabia czystość raportowej formy.
- `ŚWIADECTWO`
  - Tomasz mówi w imieniu świadectwa życia, które nie miało świadka.
  - Cena: balansuje na granicy między nauką a niemal-funeralnym językiem.
- `CISZA`
  - Tomasz odmawia udawanej gotowości.
  - Cena: zostawia Ziemi brak formy; ECHO przejmuje część ostatniego logu.

### Miękki aneks, nie twardy kanon

- `Triumf`
- `Pyrrusowe`

Te dwa warianty można rozwijać tylko jako osobny, oznaczony aneks.

### Co ten akt musi zostawić po sobie

- odpowiedź nie kończy pytania, tylko je dojrzewa,
- powrót nie jest triumfalny,
- `Thales` trwa tak samo jak przed odkryciem,
- końcowa różnica dotyczy Tomasza i tonu wiadomości, nie "wygranej/przegranej".

### Uwaga o gęstości

Akt V miał mocny core, ale był wąski interpersonalnie. Po wdrożeniu pakietów 13–15, późniejszym domknięciu Kezii, wspólnym aftercare z paczki `part3~gpt/2-akt-v-aftercare-i-korytarze-po-finale` oraz dołożeniu trzyetapowego `farewell walk` przed finałowym promptem mamy teraz 20 wariantowych scen cody w 5 eventach (`Naomi`, `Piotr`, `Solomon`, `mesa załogi`, `Kezia`), trzy obowiązkowe beaty przygotowawcze przed wyborem tonu i poszerzony spine końcowy (`comms` -> `corridors` -> coda Dawit/ECHO -> Observation Deck chain). Akt V to teraz 39 authored scen runtime.

---

## Mapa Rozmów I Linii Postaci

## Tomasz

- rdzeń: sens misji, Anna, praca jako schronienie, brak wzajemności wszechświata
- kluczowe rozmowy:
  - Kezia: lustro i diagnoza
  - ECHO: pytania, które robią się zbyt ludzkie
  - Naomi: nauka jako czułość i świadectwo
  - Anna: asymetryczna relacja przez wiadomości

## Kezia

- funkcja: lustro Tomasza, odpowiedzialność bez melodramatu
- najmocniejsze sceny:
  - `kezia_talk`
  - `mess_hall_kezia_tomasz_silent_dinner`
  - `lab_tomasz_kezia_after_discovery`
  - `mess_hall_kezia_final_coda`
- status pokrycia: mocna jako spine partner i ma już własne późne domknięcie runtime w Akcie V; dalsze rozszerzenia Kezii są teraz opcjonalnym polishiem, nie brakującą dziurą w mainline.

## Piotr

- funkcja: termometr kosztu misji
- najmocniejsze sceny:
  - hydroponika
  - `engine_room_piotr_repairing_repairs`
  - `engine_room_piotr_elegant_name_for_loss`
  - `engine_room_piotr_return_to_precision`
- status pokrycia: dobry środek; po wdrożeniu pakietu 12+13 ma teraz ciche łączniki Aktu III/IV i wariantowe cody po finale

## Naomi

- funkcja: nauka jako przyszłość, nie dekoracja
- najmocniejsze sceny:
  - `lab_first_entry`
  - `lab_naomi_withering_plant`
  - `lab_naomi_limes_first_data`
  - `lab_naomi_kyoto_soil_after_limes`
  - `lab_tomasz_naomi_four_billion_years`
- status pokrycia: bardzo silna w Akcie IV; epilogiczny payoff teraz wdrożony (4 warianty cody po finale)

## Solomon

- funkcja: wiedza o psychice, która przestaje wystarczać
- najmocniejsze sceny:
  - `medbay_solomon_memory_baseline`
  - `medbay_solomon_piotr_gcr_burden`
  - `medbay_solomon_without_form`
  - `medbay_solomon_after_discovery`
- status pokrycia: dobra linia funkcjonalna; po wdrożeniu pakietu 15 ma 4 warianty cody (ocenia wybór zakończenia bez moralizowania)

## Brigitte

- funkcja: ciało statku, obecność, prywatność bez spowiedzi
- najmocniejsze sceny:
  - `bridge_brigitte_first_course_correction`
  - `bridge_brigitte_manual_hold_after_hum`
  - `mess_hall_brigitte_offwatch_paper_map`
  - `observation_deck_brigitte_window_pause`
  - `observation_deck_brigitte_before_no_answer`
  - `bridge_brigitte_low_hum`
  - `observation_deck_brigitte_private_keepsake`
  - `observation_deck_brigitte_return_window`
- status pokrycia: początek, środek i finał mają już własne runtime kotwice; do dalszego polishu zostały 1-2 cichsze przejścia i więcej zespołowego kontekstu wokół jej linii

## Dawit

- funkcja: most między człowiekiem a ECHO
- najmocniejsze sceny:
  - `comms_first_entry`
  - `comms_dawit_echo_voice_preference`
  - `comms_dawit_message_archive_presence`
  - `comms_dawit_echo_relational_presence`
  - `comms_dawit_echo_limes_not_yet`
  - `comms_dawit_echo_open_question_coda`
- status pokrycia: jedna z najlepiej ułożonych linii techniczno-filozoficznych

## ECHO

- funkcja: od uważnego narzędzia do obecności, która lepiej obchodzi się z niewiedzą
- najważniejsze etapy:
  - Akt I: operacyjne wsparcie, tutorial, spokojny dystans
  - Akt II: pierwsze nieoperacyjne pytania
  - Akt III: pytanie o wartość misji
  - Akt IV: "nie wiem jeszcze"
  - Akt V: współudział w ostatnim logu, szczególnie przy `Ciszy`
- status pokrycia: rdzeń silny; trzeba pilnować, żeby nowe sceny nie zrobiły z ECHO emocjonalnego "AI człowieka"

---

## Wiadomości Od Anny

Docelowo kanon zakłada **cztery wiadomości**:

1. codzienność i jeszcze bliska Ziemia,
2. Anna jako osobna naukowczyni,
3. dojrzała refleksja o odległości i cenie,
4. późny, niemal finałowy list z dumą i uznaniem.

### Stan runtime

- w runtime są dziś czytelnie obecne:
  - `anna_message_1`
  - `anna_message_2`
  - `anna_message_3`
- czwarta wiadomość (`anna_message_4`) wdrożona 2026-06-04 — trigger w comms po `act_5_chronology_released_done`, blokuje `echo_final_message_prompt` dopóki nie przeczytana

### Znaczenie

Anna nie jest lore-delivery systemem. Jest osią:

- starzenia się Ziemi poza tempem załogi,
- prywatnego kosztu misji,
- późniejszego wyboru `Raport / List`.

---

## 12 Scen Obowiązkowych

Z `new-narrative-ideas/02-sceny-obowiazkowe.md` wynikają sceny, których nie powinno się zgubić nawet przy cięciu:

1. Ciężar trapu
2. Pierwszy ranek bez poranka
3. Kolacja siedmiorga
4. Ziemia jak guzik od płaszcza
5. Plik Park/Mensah
6. Cicha kolacja z Kezią
7. Piotr przy hydroponice
8. Brigitte i niski dźwięk statku
9. Nocne pytanie ECHO
10. Naomi przy pierwszych danych z Limes
11. Tomasz i Kezia po odkryciu
12. Ostatnia wiadomość

To jest najlepszy skrót osi dramaturgicznej całej gry.

---

## Bilans Gęstości I Luki Do Dopisania

## Najgęstsze obszary

- Akt I: onboarding, Ziemia, ECHO, pierwsze wejścia do pokoi
- Akt II: napięcia rutyny, Park/Mensah, ripple w korytarzu, progi pokojowe, Piotr, Solomon, Dawit/ECHO
- Akt IV: Naomi + laboratorium + odkrycie

## Najrzadsze obszary (stan po kompleksowym audycie, 2026-06-08)

- payoffy grywalnego prologu po `Earth Out of View` i dalej
- korytarze Aktu III-IV — `corridors_kezia_time_pressure` jest, ale inne sceny ciągowe mają mniej kotwic
- korytarz po finale i późne przejścia między pokojami nadal są rzadsze niż same pokoje domknięcia, mimo że ambientowe pakiety 11/12/15 są już w runtime
- zespołowy kontekst wokół linii Brigitte nadal jest rzadszy niż jej własne już wdrożone beaty indywidualne

## Najbardziej nierównomierne skupienie lokacyjne

- Akt IV nadal ma centrum w `lab`, ale `mess_hall`, `comms`, `observation_deck`, `corridors` i `bridge` mają teraz własne reakcje / follow-through po Limes
- Akt V jest teraz wyraźnie szerszy dzięki shared aftercare i `20` wariantowym scenom cody w `5` eventach, ale nadal ma za mało przygotowania przed wyborem tonu i za mało różnicowania między endingami ponad wspólny szkielet

## Rekomendowane miejsca do dalszego dopisywania

1. Ambient Akt III-IV:
   - `data/ambient/observations/kezia.json` — Kezia czyta barki, Solomon nie zaczyna tematu, Tomasz przy observation deck
   - `data/ambient/banter/echo.json` — Dawit po północy (Akt III), ECHO nie uzupełnia zdania (Akt IV)
   - `data/ambient/inspectables/comms.json` / `observation_deck.json` — obserwacje Tomasza (Akt IV)
2. Ambient po finale:
   - krótkie linie Kezia/Piotr/Naomi/Solomon/Brigitte/Dawit w korytarzu per zakończenie, ponad już wdrożony shared aftercare i bez wracania do stanu "task otwarty"
3. Brigitte po paczce `part3~gpt/3-srodek-linii-brigitte`:
   - najwyżej 1 mała scena lub kilka ambientowych śladów zespołowych ponad już wdrożone `bridge_brigitte_manual_hold_after_hum`, `mess_hall_brigitte_offwatch_paper_map` i `observation_deck_brigitte_before_no_answer`
4. Anna:
   - czwarty list w runtime — wdrożony; można dopisać krótszą/późniejszą wersję jako ambient doc-only

---

## Czego Nie Wolno Złamać Przy Dalszym Pisaniu

- ECHO nie staje się antagonistą.
- Limes nie okazuje się starożytną cywilizacją ani odpowiedzią w stylu space-opera.
- Tomasz nie jest mesjaszem nauki.
- Załoga nie zamienia się w serialową "found family".
- Najmocniejsze sceny działają przez precyzję, ciszę, gest i zwłokę, nie przez ekspozycyjne wyznania.
- Nauka ma być emocją i tkanką sceny, nie dekoracją.

---

## Brief Dla ChatGPT Do Uzupełnień

Jeśli ten dokument trafia do modelu, który ma dopisywać brakujące sceny:

1. Traktuj ten plik jako mapę nadrzędną.
2. Rozwijaj głównie miejsca oznaczone jako rzadsze, nie przepisywuj gęstych rdzeni.
3. Rozróżniaj:
   - `spine obowiązkowy`,
   - `opcjonalne odnogi pokojowe`,
   - `ambient / obserwacje / banter`,
   - `zakończenia`.
4. Pisz w tonie:
   - cicho,
   - precyzyjnie,
   - bez hype'u,
   - bez melodramatu,
   - z nauką jako nośnikiem emocji.
5. Nie dopisuj nowych wielkich twistów fabularnych.
6. Jeśli rozwijasz `Triumf` i `Pyrrusowe`, oznacz je jawnie jako warianty aneksowe, nie rdzeń.

---

## Najkrótsza Synteza

HERALD ma dziś bardzo mocny kręgosłup:

- grywalny prolog przed `echo_first_morning`, z pięcioma osobnymi beatami wejścia na `Thales`,
- gęsty Akt I,
- bardzo gęsty Akt II (`55 event IDs`, najmocniejszy room-fallout po Park/Mensah, najpełniejszy dotąd Naomi-fallout poza labem i nowa linia Kezii poza mostkiem),
- tematycznie mocny i narracyjnie zaokrąglony Akt III (`19 event IDs` po integracji `part2` i paczki `part3~gpt/5`),
- Akt IV z laboratorium i pięcioma reakcjami / follow-through poza nim (`mess_hall`, `comms`, `observation_deck`, `corridors`, `bridge`), nadal mniejszy ilościowo od Aktów I-II,
- Akt V — `24 event IDs` i `39 authored scen runtime`, z czterema kanonicznymi zakończeniami, kompletnym szkieletem cody postaci, trzema wymaganymi beatami `farewell walk` przed promptem i wspólnym aftercare po finale, ale nadal zbyt mało różnicujący endingi poza wspólnym szkieletem.

Najlepszy dalszy ruch to **wyrównywanie aktów do benchmarków z audytu 2026-06-08**: gęstsze przejścia korytarzowe w Aktach III-IV, mocniejsze przygotowanie Aktu V przed wyborem tonu, bardziej ending-aware aftercare ponad wspólny szkielet, payoffy grywalnego prologu i dalsze podnoszenie Aktów IV-V do sufitów ilościowych Aktów I-II-III. Wielkie sceny modalne, grywalny prolog i podstawowy ambient runtime mają już pokrycie; teraz problemem jest nierówność gęstości, nie brak fundamentu startu ani pusty środek Brigitte.
