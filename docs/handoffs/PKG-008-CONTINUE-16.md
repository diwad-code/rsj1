# PKG-008 — P42, runda 15: noty wg odległości i dalsze lądowania za HS

Pakiet docelowy: PKG-008  
Zakres: P42 — dwie poprawki sportowe z werdyktu użytkownika; bez nowej zawartości.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git, nie publikuj gry i nie rozpoczynaj PKG-009 bez zaliczenia V.

## Stan wejściowy

- PKG-001–007 COMPLETE; PKG-008/P42 IN PROGRESS; bramka V NIEZALICZONA.
- Runda 13: 21 belek (`hillVersion` 3.3.0), `pkg008-rules-5`, podpórka art `-6`;
  unit 227/227, E2E 22/22, capture i video PASS — REPORT.md §20.
- Użytkownik zaakceptował brak prostokątów not i głęboki przysiad R. Nie zmieniać.
- Nowe polecenie zapisane dosłownie w REPORT.md §21.1:

> poprawki do następnej sesji (napisz prompt): 1. realnie jest tak, że im większa odległość powyżej K to lepsza ocena sędziowska. Skok na dwie nogi powinien być oceniany od 15.0 do 17.5 poza HS. A z telemarkiem od 17 do 20 poza HS. Podpórki 1 ręką 12-14, 2 rękami są ok. 2. Możliwość ustania skoki powyżej HS powinna być o kilka metrów przesunięta do przodu, na tej skoczni do 5m, a na mamutach - to zależy od faktycznych rekordów na danej skoczni.

- Obecnie czysty skok ma profile 16,5/17,0/17,5/18,0/18,5 niezależne od
  odległości. Jedna dłoń odejmuje 3,0 (13,5–15,5), dwie dłonie 4,5
  (12,0–14,0). Progi niemożliwe: telemark 142 m, parallel 145 m przy HS134.
- Oficjalne PDF-y FIS Wisła (N=232 skoki, 1160 not) i ekstraktor są w
  `docs/evidence/PKG-008/fis/`. PDF-y zawierają dystans i noty, lecz nie etykietę
  telemark/parallel — styl pozostaje UNRESOLVED w źródle.

Poprzedni prompt zachowano jako `docs/handoffs/PKG-008-CONTINUE-15.md`.

## Przeczytaj w kolejności

1. `AGENTS.md` — prostota, jedno review, zamrożenie zawartości, empiryczna kalibracja.
2. `docs/evidence/PKG-008/REPORT.md` §20–§21.
3. `docs/evidence/PKG-008/hill-geometry-fis.md` §8–§9.
4. `docs/evidence/PKG-008/fis/extract-notes.mjs` i trzy lokalne PDF-y.
5. `src/sport/scoring.ts`, `src/sport/jumpResult.ts`, `src/sport/safety.ts`.
6. `src/simulation/technicalHill.ts`, `src/simulation/jump.ts` (kontakt/stabilność).
7. Testy `scoring`, `safetyMechanics`, `hillCalibration`, browser result/capture.

## Wynik pakietu

- [ ] Oficjalne noty przeanalizowane względem pasm odległości.
- [ ] Noty rosną deterministycznie wraz z odległością ponad K.
- [ ] Poza HS: parallel 15,0–17,5; telemark 17,0–20,0.
- [ ] Jedna dłoń 12,0–14,0; dwie dłonie zachowują zaakceptowany obecny zakres.
- [ ] Okno ustania za HS przesunięte dalej, na tej skoczni nie więcej niż 5 m.
- [ ] Pełna weryfikacja, jedno review, raport i prompt kolejnej sesji.

## A. Research not względem odległości — przed kodem

Rozszerz `extract-notes.mjs` albo dodaj mały skrypt obok niego. Dla N=232
zapisz co najmniej:

- noty pojedyncze i retained-3 w pasmach `<K`, `K–K+5`, kolejne pasma 5 m,
  `HS–HS+5`, `>HS+5` (puste pasmo oznacz jako brak danych);
- min/medianę/q75/q90/max oraz N w każdym paśmie;
- korelację dystans↔nota jako opis pomocniczy, bez udawania przyczynowości;
- ograniczenie: brak jawnej etykiety stylu lądowania i podpórek w PDF.

Zapisz wynik w `hill-geometry-fis.md` jako datowaną sekcję rundy 15. Zakresy
użytkownika dla stylów/podpórek oznacz DESIGN — nie przypisuj ich PDF-om.

## B. Deterministyczne noty zależne od dystansu

Najprościej rozszerz kontekst funkcji przyznającej pięć not o dystans, K/HS,
styl i liczbę dłoni; bez RNG i bez frameworka reguł.

Wymagania:

1. Dla ustanych skoków nota każdego profilu jest niemalejąca wraz z odległością
   ponad K, przy tych samych błędach i stylu.
2. Poza HS, po wszystkich korektach:
   - `parallel`: pięć not mieści się w 15,0–17,5;
   - `telemark`: 17,0–20,0;
   - jedna dłoń: 12,0–14,0 (ten zakres ma pierwszeństwo nad bonusem odległości);
   - dwie dłonie: zachowaj obecny deterministyczny wynik 12,0–14,0 — użytkownik
     powiedział, że jest OK;
   - upadek i brak ustania pozostają na obecnych surowych regułach.
3. Użyj wszystkich pięciu profili i kroków 0,5; skrajne noty nadal odrzucane.
4. Noty 20,0 mogą pojawiać się tylko dla wyjątkowego telemarku daleko za HS,
   nie jako typowy czysty skok.
5. Cel prowadzenia i ekrany wyniku muszą używać tej samej logiki; podnieś
   `rulesVersion` (np. `pkg008-rules-6`) i zaktualizuj przewidywany styl.

Dodaj tabelaryczne testy K, K+5, HS, HS+1, HS+5 dla obu stylów i podpórek,
monotoniczność pół metra po pół metrze oraz determinizm.

## C. Przesunięcie okna ustania za HS

Użytkownik chce przesunąć możliwość ustania dalej o kilka metrów, dla Wisły
nie więcej niż 5 m. Skalibruj względem:

- HS134;
- pooled max konkursów 139,5 m;
- oficjalny rekord hill-data 144,5 m (ustany rekord musi pozostać możliwy);
- obecnych progów 142/145 m i pierwiastkowej krzywej stabilności.

Wybierz i zapisz dokładne nowe progi (przesunięcie każdego najwyżej +5 m),
zachowaj ciągłość w HS i deterministyczne zero na progu. Nie używaj losowania.
Podnieś `hillVersion` (np. 3.4.0); `physicsVersion` zmieniaj tylko, jeśli naprawdę
zmienisz fizykę poza danymi skoczni. Dodaj testy HS, rekord 144,5, nowe progi
i skoki symulowane w starym/nowym oknie.

Dla przyszłych mamutów tylko zapisz zasadę: okno ustania kalibruje się osobno
z rekordów i wyników dokładnego obiektu; nie dodawaj mamuta ani uniwersalnej stałej.

## D. Dowody i zaakceptowane elementy

- Nie zmieniaj mapy 21 belek, podpórki `-6`, not-layoutu bez prostokątów ani
  klatek `landingDeep`.
- Zrób zrzuty wyniku treningu i konkursu dla reprezentatywnych przypadków:
  K/telemark, >HS/parallel, >HS/telemark, jedna/dwie dłonie.
- Nazwy `pkg008-r15-*` do `docs/evidence/PKG-008/browser-artifacts/`.
- Jeśli wynik wpływa na replay/zapis, sprawdź zgodność i jawny fallback wersji.

## Weryfikacja

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Uruchom focused capture r15, następnie istniejący capture i video tylko jeśli
wynik/scena faktycznie się zmieniły. Awarie hosta diagnozuj solo; nie deklaruj
fałszywego PASS.

## Zamknięcie i następna sesja

1. Po całym zakresie wykonaj jedno końcowe review; popraw konkretne problemy i
   sprawdź tylko zmienione ścieżki.
2. Dopisz REPORT.md §22: źródła, rozkład not/dystansu, decyzje DESIGN, nowe
   progi, testy, dowody, ograniczenia i review.
3. Zaktualizuj plan/README/workflow według faktów.
4. Zarchiwizuj ten prompt, przygotuj rundę 16 (odbiór użytkownika) w kanonicznym
   `PKG-008.md` i identycznie w `NEXT_SESSION_PROMPT.md`.
5. Uruchom `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
6. Nie zaczynaj PKG-009.

## Granice

- Zero nowej zawartości, skoczni, trybów, sezonu, KO i drużyn.
- Zero ukrytej losowości w notach lub lądowaniu.
- Brak danych o stylu w PDF = UNRESOLVED; zakresy stylów są decyzją użytkownika.
- Noty bez prostokątów, głęboki przysiad, mapa belek i nowa podpórka pozostają
  zamrożone bez nowej jawnej uwagi.
- VISUAL zalicza wyłącznie użytkownik.
