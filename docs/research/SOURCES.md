# Rejestr źródeł

Dostęp i weryfikacja: **16.09.2026**. Źródła historyczne nie są opisem aktualnych przepisów sportowych. Rejestr obejmuje wykorzystane materiały i jawnie oznaczony dodatkowy odsyłacz S18. Jakość dowodu zależy od odczytanego materiału; sam wynik wyszukiwarki nie zastępuje pełnego dokumentu przy rozstrzyganiu szczegółów.

## Pierwowzór: źródła pierwotne

| ID | Źródło i adres | Zakres wykorzystania | Jakość / uwagi |
| ---| ---| ---| ---|
| S01 | [Strona autora](https://www.nomasi.com/sj3/) | Tożsamość gry, autor i odsyłacze | Wysoka dla deklaracji autora; wiadomości na stronie są historyczne |
| S02 | [Download Area](https://www.nomasi.com/sj3/download.html) | Pełne 3.13, port, instrukcje, dodatki | Wysoka; część sekcji nadal używa dawnego słownictwa „registered” |
| S03 | [MANUAL.TXT](https://www.nomasi.com/sj3/text/MANUAL.TXT) | Instrukcja rozgrywki, zawody, Hill Maker | Wysoka dla opisanej starszej wersji; strona podaje aktualizację 04.02.2002, treść miejscami wcześniejsza |
| S04 | [QUICK.TXT](https://github.com/suomipelit/skijump3/blob/ba1d5035af483a2c575bb38af64de61322d7e2a5/QUICK.TXT) | Klawisze skoku i odtwarzania | Wysoka; krótki dokument nie podaje całej obsługi startu |
| S05 | [UPDATE.TXT](https://github.com/suomipelit/skijump3/blob/ba1d5035af483a2c575bb38af64de61322d7e2a5/UPDATE.TXT) | Chronologia 3.00–3.13 i poprawki względem instrukcji | Wysoka dla zmian zadeklarowanych w changelogu |
| S06 | [FAQ autora](https://www.nomasi.com/sj3/faq.html) | Przeciwnicy komputerowi, styl, historyczne ograniczenia | Wysoka, ale brak daty aktualizacji; nie używać do obecnego modelu dystrybucji |
| S07 | [What's up? — 01.12.2013](https://www.nomasi.com/sj3/whatsup.html) | Początek SJ3 w 2000 i przejście na freeware | Wysoka; rozstrzyga nieaktualną sekcję shareware instrukcji |
| S08 | [Oficjalna galeria](https://www.nomasi.com/sj3/shots.html) | Ekrany v3.00 i v3.10, podpisy obrazów | Wysoka dla widocznej oprawy; nie dowodzi płynności, muzyki ani sterowania |
| S09 | [Repozytorium wersji DOS](https://github.com/suomipelit/skijump3) | Publiczna implementacja referencyjna i pochodzenie | Stan odczytany: commit `ba1d5035af483a2c575bb38af64de61322d7e2a5` |
| S10 | [SJ3.PAS](https://github.com/suomipelit/skijump3/blob/ba1d5035af483a2c575bb38af64de61322d7e2a5/SJ3.PAS) | Pomiar długości, punktacja, wybicie, ryzyko lądowania | Wysoka dla odczytanych fragmentów; nie wykonano pełnej analizy całego programu |
| S11 | [SJ3GRAPH.PAS](https://github.com/suomipelit/skijump3/blob/ba1d5035af483a2c575bb38af64de61322d7e2a5/SJ3GRAPH.PAS) | Logiczny raster 320×200 | Wysoka; m.in. linie 250 i 344 |
| S12 | [TUULI.PAS](https://github.com/suomipelit/skijump3/blob/ba1d5035af483a2c575bb38af64de61322d7e2a5/TUULI.PAS) | Stanowy generator wiatru, meter | Wysoka; procedury Alusta, Siirra, Hae, Piirra |
| S13 | [SJ3REPL.PAS](https://github.com/suomipelit/skijump3/blob/ba1d5035af483a2c575bb38af64de61322d7e2a5/SJ3REPL.PAS) | Odtwarzanie zapisanych danych animacji i wiatru | Wysoka; nie należy na tej podstawie deklarować zgodności nowego replaya z SJR |
| S14 | [HILLBASE.SKI](https://github.com/suomipelit/skijump3/blob/ba1d5035af483a2c575bb38af64de61322d7e2a5/HILLBASE.SKI) | Historyczna lista 20 skoczni i ich K | Wysoka dla danych gry; nie potwierdza dzisiejszych parametrów obiektów |
| S15 | [SJ3UNIT.PAS](https://github.com/suomipelit/skijump3/blob/ba1d5035af483a2c575bb38af64de61322d7e2a5/SJ3UNIT.PAS) | Limit puli zawodników `NumPl = 75` | Wysoka; nie utożsamiać z liczbą ludzi w hotseat |
| S16 | [Port SDL2 — README](https://github.com/suomipelit/skijump3-sdl) | Cel portu, skróty portu i ograniczenie uznawania rekordów | Wysoka dla deklaracji maintainerów; ruchomy branch master |
| S17 | [LICENSE repozytorium DOS](https://github.com/suomipelit/skijump3/blob/ba1d5035af483a2c575bb38af64de61322d7e2a5/LICENSE) | W repo znajduje się GNU GPL v3 | Odczytano; samo to nie jest audytem praw do każdego historycznego dodatku |
| S18 | [Polska instrukcja](https://www.nomasi.com/sj3/text/MAN_POL.TXT) | Odsyłacz do dodatkowej lektury | **Nie użyto jako dowodu treści**: pobranie przez parser nie powiodło się |
| S19 | [PC Longplay — Ski Jump International 3 (MS-DOS, 2000)](https://www.youtube.com/watch?v=2EuK0bpwvJc) | P01: ruchomy przebieg tutorialu, skoku, obu wariantów lądowania, kamery i przepływu po próbie | Obejrzano 16.09.2026; nagranie, nie osobisty test sterowania. Numer wersji binarnej nie jest widoczny, więc nie przypisujemy obserwacji konkretnie wersji 3.13 |

Kotwice kodu: S10 `hyppy` od linii 778; odległość 1297 i 2133; zapis danych replaya 2101; losowe ryzyko 2194; noty 2200–2238; aktywny wzór długości 2241. Alternatywa opisana jako FIS w liniach 2243–2248 jest zakomentowana. S13 odczytuje indeksy animacji i wiatr m.in. w liniach 161–163 i 199–201.

## Technologia nowej gry

| ID | Dokumentacja | Zastosowanie |
| ---| ---| ---|
| T01 | [MDN: requestFullscreen](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen) | Aktywacja przez użytkownika, Promise i obsługa odmowy |
| T02 | [MDN: Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API) | Wyjście z fullscreen, zdarzenia, ograniczenia osadzania |
| T03 | [MDN: Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) | Odblokowanie dźwięku po interakcji |
| T04 | [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) | Czas renderowania i różne częstotliwości monitorów |
| T05 | [MDN: Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) | Pauza w tle i ograniczanie callbacków |
| T06 | [MDN: imageSmoothingEnabled](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled) | Najbliższy sąsiad w Canvas2D |
| T07 | [MDN: devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) | Różnica między pikselem CSS i fizycznym |
| T08 | [MDN: IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | Asynchroniczny zapis i transakcje |
| T09 | [MDN: Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) | Ograniczenia trwałości danych lokalnych |
| T10 | [Vite: Static Deploy](https://vite.dev/guide/static-deploy.html) | Statyczny build i `base` podkatalogu |
| T11 | [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) | HTTPS/localhost i kontrolowane cache offline |
| T12 | [PixiJS: Application](https://pixijs.com/8.x/guides/components/application) | Alternatywny renderer GPU |
| T13 | [Phaser: TimeStep](https://docs.phaser.io/api-documentation/class/core-timestep) | Alternatywny framework i jego pętla |
| T14 | [MDN: KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code) | Mapowanie fizycznych klawiszy |
| T15 | [MDN: image-rendering](https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering) | Skalowanie bitmapy w CSS |

Z tych źródeł wynikają ograniczenia API. Dobór Canvas2D, 120 Hz, rozdzielczości, limitów zasobów czy zakresu platform jest **decyzją projektu**, a nie obietnicą wydajności z dokumentacji.

## Współczesne przepisy i geometria

| ID | Źródło | Wersja / zastosowanie |
| ---| ---| ---|
| F01 | [FIS Ski Jumping Documents](https://www.fis-ski.com/ski-jumping/documents) | Oficjalny katalog, sprawdzony 16.09.2026; daty publikacji dokumentów |
| F02 | [ICR Ski Jumping](https://assets.fis-ski.com/f/252177/x/c67426c343/icr-ski-jumping-2024_e_clean.pdf) | June 2026, katalog: 26.06.2026; PDF zawiera redline, mimo starej nazwy URL |
| F03 | [World Cup Men](https://assets.fis-ski.com/f/252177/x/2d9d6fc3b4/wcrglj-men-2024-e_markedup.pdf) | 2026/27, katalog: 20.07.2026; format zawodów dla bazowego profilu gry |
| F04 | [World Cup Women](https://assets.fis-ski.com/f/252177/x/4faa6fd6e0/wcrglj-women-2024-e_clean.pdf) | 2026/27; dokument porównawczy, wykryto niespójne wartości 40/50 w różnych artykułach |
| F05 | [Construction Norm](https://assets.fis-ski.com/f/252177/5ba64e29f2/construction-norm-2018-2.pdf) | November 2018, nadal podlinkowany przez FIS; geometria i indywidualne współczynniki obiektów, nie zastępuje nowszego ICR |
| F06 | [Style Judging Guidelines](https://assets.fis-ski.com/f/252177/x/727b866905/judgingguidelines-2024-09-26.pdf) | W katalogu 26.09.2024; instrukcja odejmowania not i oceny telemarku |
| F07 | [Video Distance Measurement](https://assets.fis-ski.com/f/252177/753c59dd70/guidelines-vdm_eng_deu.pdf) | Dokument 2011/2012 nadal podlinkowany; m.in. §1.2.3 zaokrąglenie w dół do 0,5 m |
| F08 | [Kulm, lista finałowa 28.02.2026](https://medias2.fis-ski.com/pdf/2026/JP/3156/2026JP3156SLRF.pdf) | Przykład rzeczywistych K200/HS235, współczynników i rozbicia wyniku; nie uniwersalny zestaw dla mamutów |
| F09 | [Lillehammer 07.03.2026](https://medias2.fis-ski.com/pdf/2026/JP/3308/2026JP3308RTRIA.pdf) | Normalna K90/HS98, tabela danych obiektu |
| F10 | [Zakopane 10.01.2026 — revised](https://medias3.fis-ski.com/pdf/2026/JP/3112/2026JP3112RLQ.pdf) | K125/HS140 i oficjalne wiersze kwalifikacji |
| F11 | [Oberstdorf 28.12.2025](https://medias1.fis-ski.com/pdf/2026/JP/3103/2026JP3103RLQ.pdf) | K120/HS137, wiersze kwalifikacji i rekompensaty |
| F12 | [Planica 26.03.2026](https://medias3.fis-ski.com/pdf/2026/JP/3181/2026JP3181RLT.pdf) | K200/HS240 i współczynniki, wyniki treningu |

Własna synteza: [współczesne skoki](MODERN_SKI_JUMPING.md). Lokalna kopia F02: `reference-pdf/fis-icr-linked-2026-06.pdf`. Obejrzano wyrenderowane fizyczne strony PDF 1, 63, 64 i 70; numery drukowane są przesunięte. Lokalna kopia F03: `reference-pdf/fis-wc-men-2026-27.pdf`; obejrzano fizyczne strony 1, 5, 6, 11, 12, 13, weryfikując wersję, drużyny, Super Team, kwalifikacje i KO. Dane przyszłych obiektów muszą otrzymać osobne źródła i daty, nie wolno wywnioskować ich z historycznej bazy SJ3.

## Sposób pozyskania i ograniczenia

Wyszukiwarka odnalazła repozytoria; odsyłacze z oficjalnej witryny potwierdziły związek portu z grą. HTML galerii i angielską instrukcję odczytano przez HTTP, ponieważ parser stron nie radził sobie z dawnym kodowaniem i niektórymi podstronami. Pliki Pascala i changelog odczytano z `raw.githubusercontent.com`; nie zaimportowano ich do implementacji projektu.

Zachowano sześć obrazów referencyjnych z galerii, dwie lokalne kopie PDF FIS oraz rendery wybranych stron. Pochodzenie opisuje [rejestr obrazów](reference-images/README.md). Nie pobierano hurtowo dodatków społeczności, nie kopiowano pełnej instrukcji do dokumentacji. Linki do plików kodu są przypięte do commita; strony autora mogą się zmienić.

Wiersze wynikowe i dane obiektów F08–F12 odczytano z indeksowanych treści oficjalnych dokumentów FIS. Próby pobrania lokalnych kopii F09–F12 zakończyły się HTTP 502, więc nie deklarujemy wizualnego sprawdzenia tych tabel w PDF. Gotowe wektory kontrolne są bazą testów, a ponowny odczyt pełnych wierszy i danych pomiarowych przypisano do P13. Nie wpływa to na osobno obejrzane strony ICR i WC Men.

Nie wykonano pomiarów na oryginalnym programie ani nie zweryfikowano obecnych zasad turniejów społeczności SJ3. Współczesne przepisy FIS sprawdzono osobno po doprecyzowaniu użytkownika; są podstawą sportowych zasad nowej gry. Informacji z archiwalnego FAQ o Windows XP, rejestracji i planach SJ 4 nie traktuje się jako bieżących.

## Ponowna kontrola przy auto-review

Ponownie odczytano F02 §417.3, §422.1 i §433.3 oraz F03 §3.1.3, §3.2.3.1 i §3.2.4. Potwierdzono rozdzielenie oznaczeń i formatów, poprawiono granicę decyzji trenera (czerwona faza) oraz oznaczono nierozstrzygniętą kolejność dolnego ograniczenia wyniku względem rekompensat. Dla zachowania shella sprawdzono ponownie T01 i [Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers): własny ekran gry nie jest dostępny przy pierwszej wizycie offline bez wcześniejszego pobrania aplikacji. Szczegółowy rezultat jest w [auto-review](../SELF_REVIEW.md).
