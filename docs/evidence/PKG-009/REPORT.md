# Raport PKG-009 — H01 Lillehammer inspirowana K90/HS98

**Status pakietu: COMPLETE.** Użytkownik zaakceptował oprawę H01
23.09.2026 słowami „resztę akceptuje” i zlecił ostatnią korektę AUTO
przy wietrze w plecy; korektę wykonano i sprawdzono. H02/P21-H02 nie
została rozpoczęta.
Nowsze polecenie użytkownika z 23.09.2026 dopuszcza skocznie inspirowane
realnymi miejscami: K/HS mają się zgadzać, pozostały profil i balans mogą
być ADAPT/TUNE. Dotyczy to kolejnych H01–H20, z osobną sylwetką, detalami
i kolorystyką każdego obiektu. Dodatkowy wymóg: ustany skok równoległy bez
podpórki co najmniej 2 m za prawdziwym rekordem. Bieżące zasady zapisano
w [AGENTS.md](../../../AGENTS.md), D19, planie zawartości i QA.

| Część | Stan | Wynik |
|---|---|---|
| D — karta i źródła | COMPLETE dla adaptacji | [Karta H01](../../hills/H01.md) oddziela K90/HS98 i rekord 107,5 m od pól gry ADAPT/TUNE. Dawna analiza homologacji została zachowana [osobno](H01_CERTIFICATE_RESEARCH.md). |
| G — profil i balans | COMPLETE | Rozbieg 87,98 m, 25 belek, U=168, fall line=193, wybieg do 268 m; jedna mapa pomiaru i linii. AUTO H01 dodatkowo +2 belki tylko przy wietrze w plecy. |
| A — oprawa | COMPLETE / VISUAL USER PASS | Odrębna od K120 paleta zmierzchu, Mjøsa, miasto, góry, las, kolej, schody i reflektory; [manifest](ART_MANIFEST.md). Akceptacja użytkownika 23.09.2026. |
| V — integracja | TECHNICAL PASS | Trening, konkurs, AI, zapis/wznowienie i replay H01 działają; dawne zapisy/replay prototypu są odseparowane wersją. K120 pozostaje grywalna. |

## Strojenie gry i nowa reguła rekordu

H01 ma `hillVersion=h01-inspired-4`, sesję `standard-h01-lillehammer-normal-5`.
Wyniki certyfikatu FIS i czterech historycznych PDF pozostają materiałem
referencyjnym, bez deklaracji zgodności rzeczywistego profilu lub
prawdopodobieństwa upadku. Kompensaty 7,00/8,00/12,00 zachowano jako
sportowy punkt odniesienia. Próg telemarku 112 m i równoległego lądowania
120 m są deterministycznym TUNE gry, nie granicami bezpieczeństwa FIS.

Idealny pilot przy stałym wietrze −2/−1/0/+1/+2 m/s: AUTO wybiera teraz
belki **12/10/5/5/4** zamiast **10/8/5/5/4** w poprzedniej wersji.
Jedynie oba ujemne wiatry dostają dodatkowe dwie belki. Wszystkie pięć
kontrolnych skoków kończy się lądowaniem między 85 a 105 m; przy wietrze
pod narty dobry lot może przekroczyć HS98. W treningu z domyślnym seedem
UI pokazuje belkę **9 zamiast 7**. Test 30 deterministycznych seedów AI
na poziom nadal zachowuje rosnące mediany trudności i ograniczone upadki;
nie są to statystyki rzeczywistych zawodów.

Wymóg **107,5 + 2,0 = 109,5 m**: jawne wejście z belki 12, wiatr +1 m/s,
wybicie w idealnym ticku, przygotowanie równoległe po 3,2 s lotu daje
kontakt ok. 109,55 m, zapisany wynik **109,5 m, landed, 0 dłoni**.
Powtórzenie tego wejścia daje identyczny wynik. W 288 jawnych kombinacjach
belki/wiatru/timingu/przygotowania znaleziono 70 ustanych skoków w paśmie
109,5–113 m: **13 czystych i 57 z podpórką**. Warunek jest dowiedziony dla
modelu gry i tego zestawu prób, bez losowego rozstrzygania lądowania gracza.

## Sprawdzenia

| Sprawdzenie / zakres | Wynik |
|---|---|
| `npm run typecheck` | PASS |
| `npm test` | PASS — 33 pliki, 285 testów; obejmuje AUTO +2, rekord +2, AI, geometrię, wersje i K120 |
| `npm run build` | PASS — JS 189,38 kB / gzip 59,32 kB |
| `npx playwright test tests/browser/h01.spec.ts --workers=1` | PASS 3/3 na `h01-inspired-4` — próba prawdziwymi klawiszami i belka 9, wybór H01, konkurs/zapis/wznowienie, replay bieżący i odrzucenie starego |
| `npm run test:e2e` | Historyczny wynik po oprawie, przed ostatnią korektą AUTO: 24/25; jedyny FAIL technicznej K120, gdy test nie dostarczył R przed kontaktem pod obciążeniem. |
| Celowane ponowienie `competition.spec.ts -g "pełny konkurs"` | PASS 1/1 dla K120 przed ostatnią korektą H01; pełnego E2E po tej korekcie NOT RUN. Testy K120 w `npm test` PASS na bieżącym kodzie. |

Dowody bieżącej wersji 960×540: [menu](inspired-artifacts-v4/h01-menu.png),
[scena](inspired-artifacts-v4/h01-scene.png),
[wynik próby klawiaturowej](inspired-artifacts-v4/h01-live-result.png),
[wynik deterministycznego fixture](inspired-artifacts-v4/h01-result-fixture.png),
[widok techniczny](inspired-artifacts-v4/h01-technical.png),
[konkurs](inspired-artifacts-v4/h01-competition-start.png),
[replay](inspired-artifacts-v4/h01-replay.png) i
[nagranie](inspired-artifacts-v4/h01-keyboard-attempt.webm).
Zachowano także [zrzuty zaakceptowanej oprawy przed ostatnią zmianą AUTO](inspired-artifacts/)
oraz [stary manifest prototypu](ART_MANIFEST_PROTOTYPE.md).

## Końcowy review i ograniczenia

Jedyny pełny Oracle review odbył się wcześniej i dał CHANGES REQUIRED dla
ścisłej rekonstrukcji certyfikatu. Nowa decyzja użytkownika zmieniła
kryterium produktu; wykonano celowane poprawki i powyższe testy, bez drugiej
pełnej rundy review. Wersje rozdzielają stare dane od grywalnej adaptacji.
H01 **VISUAL USER PASS — 23.09.2026**; zewnętrzny jakościowy playtest
**NOT RUN**. Nie deklarujemy zgodności z geodezyjnym profilem FIS ani
zielonego pełnego E2E; jedyna czerwona ścieżka K120 przeszła w izolacji.

Aktywny prompt następnego pakietu: [PKG-010/P21-H02](../../handoffs/PKG-010.md),
identyczny z [NEXT_SESSION_PROMPT.md](../../NEXT_SESSION_PROMPT.md).
PKG-010 nie zostało rozpoczęte w tej sesji.
