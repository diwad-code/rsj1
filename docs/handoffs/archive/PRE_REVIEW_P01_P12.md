# ARCHIWUM — NIE WYKONYWAĆ

Ten prompt pochodzi z pierwszej dostawy dokumentacji. Został zastąpiony po auto-review podziałem P01–P12 na trzy pakiety. Aktualną treść wskazuje `docs/NEXT_SESSION_PROMPT.md`. Zachowano dla śladu zmian; poniższe polecenia nie są aktywnym zakresem.

---

+# Prompt do rozpoczęcia realizacji

Poniższy tekst jest gotowym handoffem. Obecna sesja stworzyła dokumentację; nie uruchomiła realizacji planu.

---

Pracujesz w `C:\retro-ski-jumping` na nowej grze przeglądarkowej. Zacznij od odczytu aktualnego stanu dysku i instrukcji AGENTS/skilli. Nie zakładaj, że kod już istnieje. Nie usuwaj katalogów skilli ani konfiguracji.

Zrealizuj pierwszy etap z `docs/IMPLEMENTATION_PLAN.md`: **P01–P12, do bramki A**. Jeżeli część jest już wykonana, zweryfikuj dowody i kontynuuj od pierwszego niezamkniętego zadania. Nie restartuj projektu i nie nadpisuj ukończonych materiałów.

Przeczytaj kolejno:

1. `docs/README.md` i `docs/PRODUCT_GDD.md`.
2. `docs/research/SJ3_RESEARCH.md`, `docs/research/MODERN_SKI_JUMPING.md`, `docs/research/SOURCES.md`.
3. `docs/GAMEPLAY_SPEC.md`, `docs/ART_UI_AUDIO.md`, `docs/TECHNICAL_DESIGN.md`.
4. `docs/CONTENT_PLAN.md`, `docs/DECISIONS_RISKS.md`, `docs/QA_ACCEPTANCE.md`, plan wykonania.

Wiążąca intencja użytkownika:

- Całkowicie nowa gra web; fullscreen po działaniu użytkownika; cały interfejs wygląda jak gra MS-DOS, obsługiwany klawiaturą.
- Maksymalna inspiracja Ski Jump International 3 w sterowaniu, bocznym ujęciu, rytmie skoku i rywalizacji. Pięć głównych akcji: ↑ wybicie, ←/→ pozycja, T telemark, R dwie nogi; → start z belki.
- **Współczesne zasady skoków i prawidłowe linie skoczni.** Nie przenosić historycznej punktacji SJ3, starego K175 czy założenia „czerwony odcinek do 1,2K”. Obowiązuje profil Modern 2026.1 opisany w dokumentacji, z K/HS, wind/gate compensation i źródłami FIS.
- **Wyższa rozdzielczość i bardziej szczegółowy, realistyczny pixel art są pożądane.** Baza robocza 960×540. Zachować wyraźny pixel art i czytelność; realizm przez geometrię/proporcje/materiały/światło.
- Nowy kod i zasoby. Obrazy SJ3 i dokumenty FIS w docs są referencjami, nie assetami runtime.

Stos: TypeScript+Vite+Canvas2D, własny rdzeń 120 Hz do strojenia, WebAudio i docelowo IndexedDB. Wersje narzędzi ustal w P02 na podstawie aktualnej kompatybilności, utrwal w lockfile. Nie buduj backendu, strony marketingowej, 3D ani portu mobilnego.

P01 ma uzupełnić obserwację oryginału w ruchu. Dotychczas przeczytano źródła i obejrzano 6 screenshotów, ale nie rozgrywano SJ3. Nie przypisuj sobie testów poprzedniej sesji. Parametry aerodynamiki i timingu są TUNE. Dokumenty FIS mają redline i stare nazwy URL; używaj wersji z treści i sprawdzaj obrazy stron. Szczegóły progów/zaokrągleń coach 95% są przypisane do P13, a 95% długiego upadku do P16. Nie zgaduj ich; nie blokują budowy technicznego rdzenia.

Prototyp P05–P12 używa własnej technicznej K120/HS134 bez nazwy prawdziwego obiektu. Powstaje jedna grywalna pętla: belka→rozbieg→wybicie→lot→oba lądowania→odjazd→wynik→retry. Wdrożona punktacja długości/stylu jest nowoczesna; pełne kompensaty i standardowy konkurs dopiero P13/P16. Jasno podpisz ograniczenia prototypu. Cztery docelowe obiekty MVP i pełne 20 są w późniejszych etapach, nie oznaczaj całego projektu jako ukończonego po P12.

Pracuj autonomicznie w zakresie tego etapu. Wykonuj rutynowe decyzje, małe implementacje i odpowiednie testy. Jeśli rzeczywisty blocker dotyczy jednej rzeczy, wykonaj pozostałe niezależne zadania i zgłoś dokładnie brak. Nie zatrzymuj się na samym planie.

Po każdym zadaniu zapisz raport i dowody do `docs/evidence/Pxx/`, aktualizuj status planu. Dla grafiki nagraj rzeczywisty przebieg i obejrzyj screenshoty 1:1/2×. Dla fizyki używaj stałych seedów i wejść. Oddziel TECHNICAL, VISUAL, PLAYABILITY; brak graczy=test NOT RUN, nie symulowana opinia odbiorców.

Na końcu oddaj działający lokalny prototyp, instrukcję uruchomienia, wyniki wykonanych testów, znane ograniczenia i aktualny handoff do P13. Nie publikuj gry ani nie wysyłaj zewnętrznych wiadomości.
