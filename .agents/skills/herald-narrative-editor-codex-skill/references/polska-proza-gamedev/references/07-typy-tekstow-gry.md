# Typy tekstów w grze — zasady dla każdego

## 1. Dialogi postaci (event JSON, data/events/)

**Format:** myślnik `—` + kwestia, didaskalia po myślniku małą literą.
**Długość:** 1–4 zdania na kwestię. Długie monologi rozdziel na wymianę.
**Zasada:** kwestia = jeden cel dramatyczny (ujawnienie, napięcie, relacja, konsekwencja).
**Test:** zasłoń imię — czy wiesz kto mówi?

Struktura JSON:
```json
{
  "speaker": "PIOTR",
  "text": "— Reaktor trzyma. Ale nie podoba mi się ten wibracja na pompie od tygodnia.",
  "voice_tag": null,
  "mood": "concerned"
}
```

Nigdy w dialogu:
- Ekspozycja `„Jak wiesz, mamy ograniczone zapasy tlenu od startu z Ziemi"` → `„Tlen na siedem miesięcy"`
- Wszystkie postacie jednakowo formalne lub jednakowo casual
- Kwestia wyjaśniająca graczowi co ma czuć: `„To jest naprawdę smutne"` → pokaż smutek

---

## 2. Głosy wewnętrzne Tomasza

**Format:** `*(GŁOS (poziom): „treść")*`
**Długość:** 1–2 zdania. Im wyższy poziom głosu, tym więcej mówi.
**Czas:** czas teraźniejszy lub przeszły retrospektywny (PAMIĘĆ).
**Ton:** każdy głos ma swój charakter — szczegóły w `05-idiolekt-postaci-herald.md`.

Przykłady poprawne:
```
*(ZARZĄDZANIE (5): „Protokół wymaga decyzji w ciągu dwóch godzin.")*
*(EMPATIA (6): „Naomi nie spała. Widać to po tym jak stoi.")*
*(CISZA (8): „Zostań.")*
```

Głosy wewnętrzne NIE:
- Mówią do gracza (mówią do Tomasza lub o nim)
- Używają buzzwordów
- Mówią tego samego co inny głos

---

## 3. Narracja w II osobie (opis scen, akcji)

**Format:** czas teraźniejszy, II osoba.
**Podmiot:** Tomasz / ty — konsekwentnie.
**Długość:** akapit = jedno pomieszczenie / jedna chwila.

```
Wchodzisz do maszynowni. Piotr jest przy reaktorze — nie słyszał jak otworzyłeś drzwi,
albo słyszał i zignorował. Terminal na ścianie wyświetla parametry, których nie rozumiesz.
```

Narracja NIE:
- Ocenia co Tomasz czuje (to robią głosy wewnętrzne)
- Wyjaśnia graczowi co powinien zrobić
- Miesza II osobę z III osobą w tej samej scenie

---

## 4. Raporty i logi ECHO

**Format:** terminal — krótki, techniczny, bezosobowy.
**Ton:** raportujący. ECHO nie komentuje, nie ocenia.
**Interpunkcja:** dwukropek dla wartości, pauza logiczna.

```
ECHO [DZIEŃ MISJI 847]:
Tlen: 97.3% normy. Paliwo: 61.2%. Reaktor: nominalny.
Odnotowano: 1 incydent naruszenia zasad torporu (Solomon, sektor C, godz. 02:17).
Sygnał nieznany: aktywny. Analiza w toku.
```

ECHO NIE:
- Używa zwrotów emocjonalnych (`„Niestety..."`, `„Z przykrością informuję..."`)
- Spekuluje bez danych (`„Myślę, że to może być..."`)
- Mówi w pierwszej osobie bez wyraźnego powodu narracyjnego

---

## 5. Opisy przedmiotów / systemów statku

**Format:** 1–3 zdania, bez ozdobników.
**Zasada:** Lem-style — jeden zmysłowy szczegół, który mówi więcej niż ogólnik.
**Ton:** suchy, ale nie pusty. Każdy opis powinien nieść ton świata.

Złe:
```
Pojemnik z ziemią. Naomi przywiozła go z Ziemi.
```

Dobre:
```
Pojemnik z ziemią. Kioto, pH 6.8, jak wynika z etykiety. Na zbliżeniu widać,
że ziemia jest wilgotna — ktoś ją podlewa.
```

---

## 6. Powiadomienia UI / komunikaty systemowe

**Format:** krótkie, naturalne, po polsku. Nie angielskie kalki.
**Zasada:** jeden komunikat = jedna informacja.

| Kontekst | Tekst UI |
|---|---|
| Potwierdzenie akcji | `Gotowe.` / `Zrobione.` / `OK.` |
| Błąd / niemożliwe | `Nie teraz.` / `Coś poszło nie tak.` |
| Zapis gry | `Zapisano.` |
| Nowy cel | `NOWY CEL:` + krótki opis |
| Torpor (wejście) | `Tomasz zapada w sen.` |
| Torpor (wyjście) | `Dzień misji [N]. Thales leci.` |
| Interakcja | `[E] Porozmawiaj` / `[E] Sprawdź` |
| Czas minął | `+30 min` / `+2 godz` |

Unikaj:
- `Czy chcesz kontynuować?` → `Kontynuować?` / `Dalej?`
- `Operacja zakończona pomyślnie.` → `Gotowe.`
- `Brak dostępnych akcji.` → `Nie teraz.`

---

## 7. Notatki w świecie gry (logbook, pamiętnik Dawita, etykiety)

**Format:** III osoba lub I osoba autora. Nie narracyjna II osoba.
**Ton:** odpowiedni do autora (Dawit = oszczędny, Naomi = naukowy).
**Długość:** krótko. Notatki w grach czyta się szybko.

```
[Logbook Dawita, Dzień 743]
Opóźnienie: 12 miesięcy 3 tygodnie. Wysłałem wiadomość do Aminy tydzień temu.
Odpisze za rok. Będzie miała wtedy 14 lat.
Nie wiem jak to liczyć.
```

```
[Notatka Naomi na szafce]
Arabidopsis thaliana, egzemplarz 7.
pH gleby: 6.8 → 6.6. Sprawdzić wodę z recyklera.
```

---

## 8. Opis historycznych/naukowych faktów w grze (terminale, bazy danych)

**Format:** encyklopedyczny, precyzyjny. Ale nie podręcznikowy — każde zdanie musi mieć punkt widzenia.
**Zasada:** fakty naukowe precyzyjne → wtedy jeden zdanie który sprawia, że te fakty znaczą coś dla misji.

```
[Terminal naukowy: Kepler-442 / Limes]
Gwiazda klasy K, temperatura 4402 K, 97% promienia Słońca.
Limes: pierwsza planeta w ekosferze. Masa: 2.3 M⊕. Rok: 112 dni ziemskich.

Odkryta 2014. Przez 17 lat — kandydat do kolonizacji.
Teraz lecimy sprawdzić czy ma coś żywego.
```
