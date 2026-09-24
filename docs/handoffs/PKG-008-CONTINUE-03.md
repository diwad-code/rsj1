# Wykonaj PKG-008 (kontynuacja #2) — P42, realizm skoczka i skoczni do bramki V

Pakiet docelowy: PKG-008
Zakres: P42

To trzecia sesja nad PKG-008 (historia poprzednich promptów:
`docs/handoffs/PKG-008-CONTINUE-01.md` — pierwsza wersja wykonawcza,
`docs/handoffs/PKG-008-CONTINUE-02.md` — pierwsza kontynuacja po pierwszym
odrzuceniu, obie zawierają dodatkowy kontekst, jeśli go potrzebujesz). Ten sam
zakres co poprzednio — **żadnych nowych parametrów decyzyjnych**, wyłącznie
poprawa realizmu sylwetki skoczka i jej kontaktu z terenem.
Następny pakiet po zamknięciu: PKG-009 — P21-H01 (Lillehammer normalna), o ile
bramka V zostanie zaliczona akceptacją użytkownika. Jeśli nie zostanie zaliczona,
następna sesja znów kontynuuje PKG-008.

Pracujesz w `C:\retro-ski-jumping`. Projekt nie jest repozytorium Git — nie
inicjalizuj Git i nie publikuj gry.

## To jest DRUGA próba tej samej naprawy. Pierwsza (poprzednia sesja) nie wyszła.

Poprzednia sesja przebudowała cały renderer gry (rozdzielczość 480×270, prawdziwa
siatka pikseli, bitmapowy font, paleta, paralaksa tła, scena produkcyjna w
powtórce) — to zostało ocenione jako **kierunek dobry i zaakceptowane**, nie
ruszaj tego bez nowego powodu. Osobno, w tej samej sesji, podjęto próbę naprawy
konkretnie sylwetki skoczka na podstawie krytyki użytkownika. Ta próba **została
w całości cofnięta** po tym, jak użytkownik ocenił ją jako wyraźnie gorszą niż
przed próbą („komedia”). Pełny opis obu prób, dokładne zmiany kodu i dlaczego
druga została cofnięta: `docs/evidence/PKG-008/REPORT.md` §8 (sekcje 8.1, 8.2,
8.3) — **przeczytaj to w całości przed napisaniem jakiegokolwiek kodu**, żeby nie
powtórzyć dokładnie tych samych pięciu zmian, które już raz odrzucono.

### Dlaczego druga próba nie wyszła — najważniejsza lekcja tej sesji

Model w poprzedniej sesji zmienił naraz pięć rzeczy (kąt V nart, kotwiczenie kąta
nart do terenu, większa skala postaci, więcej klatek lotu, przesunięcie nart pod
stopy) w jednym kroku, oceniając efekt WYŁĄCZNIE na podstawie własnego oglądu
powiększonych wycinków — **bez otwarcia i porównania z rzeczywistym plikiem
referencyjnym `docs/research/reference-images/sj3-s16.gif`/`sj3-s0A.gif`**, mimo
że projekt ma twardą zasadę (AGENTS.md): „Nie odtwarzaj wyglądu DSJ2 ani SJ3 z
pamięci modelu — każda decyzja... ma oprzeć się na konkretnym pliku
referencyjnym.” Efekt: model uznał swoją pracę za „znaczącą poprawę”, użytkownik
ocenił ją jako wyraźnie gorszą. **Nie powtarzaj tego błędu:**

1. **Otwórz i faktycznie obejrzyj** (narzędziem do odczytu obrazu, nie z pamięci)
   `docs/research/reference-images/sj3-s16.gif` (lot, widok z boku) i
   `sj3-s0A.gif` (cztery klatki wybicia) **zanim napiszesz jedną linię geometrii
   nart czy sylwetki**. Zanotuj konkretnie: pod jakim kątem względem ciała leżą
   narty w locie, jak duży jest widoczny rozstaw między nimi, jak wygląda pozycja
   ciała (kąt tułowia, ułożenie rąk, głowy).
2. **Zmieniaj jedną rzecz na raz.** Po każdej zmianie zrób jeden szybki wycinek
   1:1 ×6 (wzorzec w `tests/browser/z_capture_pkg008.spec.ts`, testy „wycinki
   1:1” — jest tam już gotowy test na wycinek skoczka w locie i na odjeździe,
   użyj ich, nie buduj nowych za każdym razem) i porównaj go **obok** referencji,
   nie tylko sam ze sobą. Dopiero gdy jedna zmiana faktycznie wygląda lepiej niż
   referencja sugeruje że powinna, przechodź do następnej.
3. **Nie inwestuj w pełną regenerację dowodów (wszystkie ekrany, oba nagrania,
   pełny `test:e2e`) dopóki nie masz czegoś, co sam, patrząc obok referencji,
   uznajesz za wyraźnie lepsze.** Pełna regeneracja jest kosztowna i jest na
   koniec, nie na każdą mikro-iterację.
4. Jeśli po rozsądnej liczbie iteracji proceduralne rysowanie (`pixelLine`/
   `fillPixelPolygon`) nadal nie daje dobrego efektu, wolno użyć CLI `gen-ai`
   (Picsart — zainstalowane i zalogowane w tym środowisku, wywołanie:
   `gen-ai image --help` / `gen-ai character --help`) zamiast dalej ręcznie
   kombinować ze współrzędnymi — zasada i wymagania (snap do siatki, manifest
   pochodzenia) są w `.agents/skills/dos-pixel-art/SKILL.md`, sekcja o tej
   nazwie dodana w tej samej sesji.

## Dosłowna, doprecyzowana odpowiedź użytkownika (ważniejsza niż wcześniejsza)

> skoczek dalej wygląda jak gruzmoł, nie jak postać którą gra gracz. Nie widać
> stylu V (z widokiem od boku powinien być lekko widoczny - perspektywa musi sie
> zgadzać!!!!), narty wbijają się w ziemie zamiast sunąć po śniego. to nadal nie
> wygląda dobrze, kierunek dobry, ale jeszcze dużo do poprawy, zwłaszcza realizm
> wyglądu skoczka i skoczni

Kluczowe doprecyzowanie względem poprzedniej rundy: **„z widokiem od boku [V]
powinien być LEKKO widoczny — perspektywa musi się zgadzać”**. To znaczy: w
prawdziwym widoku z boku (nie z przodu, nie z góry) V-style nart nie pokazuje się
jako szeroki, dramatyczny rozstaw — narty rozchodzą się głównie w osi
przód-tył/głębi (w kierunku "do" i "od" kamery), więc z boku widać tylko
**niewielkie, subtelne** przesunięcie/nachodzenie jednej narty na drugą, nie dwie
wyraźnie rozdzielone kreski. Poprzednia próba prawdopodobnie przesadziła z kątem
rozstawu (`vSpreadRad = 0.30 rad ≈ 17°` w locie) — potraktowała to jak widok z
przodu/góry zamiast z boku. **Zanim policzysz kąt, zobacz na referencji, jak
DUŻY jest ten efekt naprawdę** — prawdopodobnie chodzi o pojedynczy piksel
przesunięcia/nachodzenia, nie o wyraźny rozdzielony kształt litery V.

## Trzy konkretne problemy do naprawy (bez zmiany fizyki/punktacji)

Wszystkie trzy dotyczą `src/render/hillView.ts`, sekcja „P42: bank klatek
skoczka” (`jumperPose`, `jumperFrame`, `bucketAngle`, `renderJumperFrame`,
`drawPixelHead`, około linii 1035-1210 w obecnym, cofniętym stanie).

1. **Sylwetka czytelna jako postać, nie bryła.** Obecnie tors/ręce/nogi to
   grube odcinki `pixelLine` w bardzo małej skali (skoczek stojący ~22px, narty
   ~29px) — przy tych proporcjach segmenty się zlewają. To wymaga realnej
   redystrybucji proporcji i/lub mocniejszego zróżnicowania kolorów między
   segmentami (nie tylko przemalowania), oparte na tym, jak sylwetka wygląda w
   `sj3-s16.gif`/`sj3-s0A.gif`.
2. **V-style w locie, subtelny, zgodny z perspektywą boczną** (patrz wyżej) —
   sprawdź referencję PRZED policzeniem kąta.
3. **Narty leżące na śniegu, nie wbite w niego**, w fazach rozbiegu/odjazdu.
   Poprzednia próba naprawiła to liczeniem kąta nart z lokalnego nachylenia
   terenu (`hill.surfaceYAtX`) zamiast z `pitchRad` — ta konkretna, pojedyncza
   zmiana (bez pozostałych czterech) może być poprawna; nie została odrzucona
   sama w sobie, tylko w pakiecie z resztą. Warto ją odtworzyć i ocenić
   **osobno**, zanim dołożysz cokolwiek innego. Dokładny kod tej zmiany (który
   funkcje, jaka matematyka) jest w `docs/evidence/PKG-008/REPORT.md` §8.2,
   punkt 2 — potraktuj to jako punkt startowy do ponownej oceny, nie jako gotowe
   rozwiązanie do ślepego wklejenia.

Użytkownik dodał też „realizm... skoczni” — po ewentualnej naprawie skoczka
zerknij, czy kontur skoczni (rozbieg/zeskok/stadion) nadal wygląda wiarygodnie
względem referencji; to drugoplanowe wobec sylwetki skoczka.

## Twarde zasady wykonania (niezmienione od poprzednich sesji)

1. To nadal przebudowa oprawy, nie nowa zawartość — jedna skocznia techniczna,
   zero nowych obiektów/trybów.
2. Zasady sportowe, fizyka i wynik nie zmieniają się. `sportMarkers.ts` zostaje
   nietknięty. Zapis i replay (format danych) nie zmieniają się.
3. **Nie zmieniaj więcej niż to, co opisano wyżej.** Rozdzielczość, font, paleta,
   paralaksa, scena produkcyjna w powtórce są już zaakceptowane — nie dotykaj
   ich bez nowego, jawnego powodu.
4. VISUAL zalicza wyłącznie użytkownik. Jeśli znów nie zaakceptuje, zapisz
   dokładnie co tym razem odrzucił i przygotuj kolejną kontynuację (nie trzecią
   ślepą próbę identycznej skali zmian).
5. Domyślnie pracuj jednym modelem, bez dodatkowych agentów-recenzentów, chyba
   że użytkownik wyraźnie zleci inaczej.

## Stan wejściowy (weryfikacja techniczna, aktualna po cofnięciu rundy 2)

- `npm run typecheck` PASS.
- `npm test` PASS — **23 pliki, 168/168** testów, bez zmian.
- `npm run build` PASS — Vite, 32 moduły, JS **137,38 kB / 43,67 kB gzip**
  (`index-B8A09Nrz.js` — jeśli Twój build da inny hash nazwy pliku to normalne,
  Vite haszuje losowo/zawartościowo przy każdym builddzie; liczy się rozmiar i
  brak błędów).
- `npm run test:e2e` — 28 testów zebranych, wzorzec ok. 21-27/28 PASS z
  udokumentowaną w `docs/evidence/PKG-008/REPORT.md` §5 flakiness obciążenia
  sekwencyjnego zestawu (potwierdzoną izolowanymi przebiegami jako
  nie-regresyjną) — nie goń za 28/28.

## Potrzebna lektura, w tej kolejności

1. `docs/evidence/PKG-008/REPORT.md` **w całości**, zwłaszcza §8 — co było, co
   odrzucono, dlaczego.
2. `docs/research/reference-images/sj3-s16.gif` i `sj3-s0A.gif` — **otwórz je
   narzędziem do obrazów, dosłownie, w tej sesji**, nie polegaj na opisach z
   raportów.
3. `AGENTS.md` — zasada prostoty i zakaz odtwarzania referencji z pamięci.
4. `.agents/skills/dos-pixel-art/SKILL.md` — w tym sekcja o `gen-ai`/Picsart.
5. `src/render/hillView.ts`, sekcja banku klatek skoczka.

## Wynik pakietu

- [ ] Sylwetka skoczka czytelna jako postać (potwierdzone porównaniem obok
      referencji, nie tylko samooceną).
- [ ] Subtelny V-style w locie, zgodny z perspektywą boczną (nie szeroki
      rozstaw jak z przodu/góry).
- [ ] Narty w fazach naziemnych wizualnie leżą na terenie, nie przecinają go.
- [ ] Każda zmiana oceniona pojedynczo, obok referencji, przed przejściem do
      następnej — udokumentuj w raporcie, którą zmianę zrobiłeś kiedy i jaki dała
      efekt (żeby dało się cofnąć pojedynczo, nie tylko w całości jak poprzednio).
- [ ] Fizyka, punktacja, zapis, replay bez zmian.

## Weryfikacja

```powershell
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Pełną regenerację dowodów (`docs/evidence/PKG-008/`, oba nagrania) i pełny
`test:e2e` uruchom **dopiero gdy masz wersję gotową do pokazania użytkownikowi**,
nie po każdej mikro-zmianie geometrii.

## Granice i ryzyka

- To trzecia sesja nad tym samym pakietem. Jeśli po tej sesji bramka V znów nie
  zostanie zaliczona, kolejna kontynuacja powinna rozważyć poważniejszą zmianę
  podejścia (np. faktyczne użycie `gen-ai` zamiast kolejnej rundy ręcznego
  strojenia współrzędnych) zamiast czwartej próby tą samą metodą.
- Materiały referencyjne SJ3/DSJ2 zostają w `docs/research/`, poza `public/` i
  poza buildem.
- Bramka V wymaga rzeczywistej, nowej odpowiedzi użytkownika — self-review nie
  wystarcza, i poprzednia sesja pokazała, że nawet szczera, dobrze udokumentowana
  samoocena modelu („znacząca poprawa”) była błędna.

## Procedura wznowienia po przerwaniu

Sprawdź `docs/evidence/PKG-008/REPORT.md` §8 pod kątem tego, co już wiadomo, że
nie działa (nie próbuj ponownie dokładnie tych pięciu zmian z rundy 2 bez
sprawdzenia ich pojedynczo względem referencji). Uruchom `npm run typecheck` i
`npm test`. Kontynuuj od pierwszego niewykonanego punktu listy w „Wynik
pakietu”.

## Zamknięcie i następna sesja

1. Po wykonaniu listy jedno końcowe auto-review.
2. Dopisz nową sekcję do `docs/evidence/PKG-008/REPORT.md` (nie nowy plik) z
   dokładnym opisem: którą zmianę zrobiono, jaki wycinek/referencję porównano,
   jaki był wynik — żeby ewentualne kolejne odrzucenie dało się rozbić na
   pojedyncze przyczyny, nie tylko „wszystko naraz było gorsze”.
3. Jeśli bramka V zaliczona: zaktualizuj status PKG-008 na COMPLETE w
   `docs/PACKAGE_WORKFLOW.md`/`docs/IMPLEMENTATION_PLAN.md` i przygotuj prompt
   PKG-009 / P21-H01 w `docs/handoffs/PKG-009.md` oraz identycznie w
   `docs/NEXT_SESSION_PROMPT.md`.
4. Jeśli bramka V niezaliczona: zarchiwizuj ten plik jako
   `docs/handoffs/PKG-008-CONTINUE-03.md` przed nadpisaniem, i przygotuj
   kolejną kontynuację z dokładnym stanem odbioru.
5. Po handoffie uruchom raz
   `pwsh -File docs/tools/validate-documentation.ps1 -CheckActiveHandoff`.
6. W odpowiedzi końcowej: co zmieniło się wizualnie (per pojedyncza zmiana, nie
   zbiorczo), czy użytkownik zaakceptował, i link do aktywnego promptu.
