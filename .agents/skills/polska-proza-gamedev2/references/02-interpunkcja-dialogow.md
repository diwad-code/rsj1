# Interpunkcja dialogów

## Znak dialogowy — BEZWZGLĘDNA ZASADA

W polskiej prozie i grach narracyjnych dialog wprowadza **myślnik (em-dash: `—`, U+2014)**.

| ❌ Niedopuszczalne | ✅ Poprawne |
|---|---|
| `- Idę.` (dywiz) | `— Idę.` |
| `– Idę.` (półpauza) | `— Idę.` |
| `"Idę."` (cudzysłów angielski) | `— Idę.` lub `„Idę."` |

**Cudzysłów polski** (`„ "` — dolny otwierający, górny zamykający) jest dopuszczalny alternatywnie, ale nigdy angielski (`" "`).

Myślnik w JSON i GDScript zapisuj jako literał `—` lub escape Unicode `\u2014`.
**Nigdy nie zastępuj dywizem.** Grep do wykrycia: `"- [A-ZĄĘÓŚŹŻĆŃŁ]"` lub `": \"-"`.

---

## Wzorzec 1 — Kwestia bez didaskaliów

```
— Systemy nominalne.
— Rozumiem.
```

Koniec kwestii: odpowiedni znak (`!`, `?`, `…`, `.`).

---

## Wzorzec 2 — Didaskalia z czasownikiem mówienia

Kwestia **nie kończy się kropką**. Didaskalia — **małą literą**.

```
— Systemy nominalne — zameldował ECHO.
— Kiedy to się stało? — zapytał Tomasz.
— Nie wiem — odparła Naomi, nie odwracając się od terminalu.
```

Czasowniki mówienia: zameldował, odparł, rzekł, szepnął, powiedział, zapytał, wycedził, mruknął, odciął, przerwał, wtrącił, dorzucił, powtórzył.

**Jeśli kwestia kończy się `?` lub `!` — znak zostaje, didaskalia nadal małą literą:**
```
— Wszystko gra? — upewnił się Tomasz.
— Nie ma czasu! — krzyknął Piotr.
```

**Wielokropek (`…`) — zostaje, didaskalia małą literą:**
```
— Ona… — zaczął Solomon i urwał.
```

---

## Wzorzec 3 — Didaskalia dzielą jedno zdanie

Didaskalia w środku kwestii (jedna wypowiedź podzielona):
```
— Słuchaj — powiedział po chwili — to nie jest zwykły sygnał.
```

Przed i po didaskaliach: myślnik, bez kropki, po didaskaliach mała litera.

---

## Wzorzec 4 — Didaskalia dzielą dwa zdania

Dwie osobne wypowiedzi przedzielone didaskaliami:
```
— Reaktor traci ciśnienie — powiedział Piotr. — Mamy może godzinę.
```

Po didaskaliach: **kropka + wielka litera** następnej kwestii.

---

## Wzorzec 5 — Didaskalia opisowe (nie mówienie)

Gdy didaskalia opisują czynność, **nie** czasownik mówienia — kwestia kończy się **kropką**, didaskalia **wielką literą**:
```
— Wszystko w porządku. — Wstała i odwróciła się do okna.
— Dziękuję, ECHO. — Tomasz zamknął terminal.
```

---

## Cudzysłów w prozie

Użyj `„"` (nie `""`) dla:
- Cytowania myśli postaci w narracji: `Pomyślał, że „to niemożliwe".`
- Tytułów w tekście: `Program „HERALD" trwa od 2031 roku.`
- Ironicznego użycia słowa: `Ich „plan" polegał na czekaniu.`

Nie używaj cudzysłowu dla dialogów (tam myślnik).

**Kropka względem cudzysłowu zamykającego — mocny sygnał AI:**
Angielski stawia kropkę PRZED cudzysłowem zamykającym, polski PO:
- ❌ `Pomyślał: „już za późno.”` (kropka w środku — kalka angielska)
- ✅ `Pomyślał: „już za późno".` (kropka po cudzysłowie — poprawnie po polsku)

Wyjątek: jeśli cytat jest tylko fragmentem zdania (nie kończy go), kropka i tak
ląduje na końcu całego zdania, poza cudzysłowem: `Nazwał to „głupim pomysłem".`

---

## Wielokropek (`…`)

Używaj `…` (U+2026), nie trzech kropek `...`:
- Urwanie myśli: `— Ona… — zaczął i umilkł.`
- Zawieszenie głosu: `— Nie wiem… może to nic.`
- Narracja: `Cisza. I znowu cisza…`

W JSON: `\u2026` lub literał `…`.

---

## Pauza myślowa (em-dash w narracji, nie w dialogu)

Em-dash (`—`) w narracji = wtrącenie lub silne przełamanie rytmu:
```
Tomasz siedział przy terminalu — i po raz pierwszy od tygodni nie wiedział co zrobić.
Cisza była prawie namacalna — jakby statek wstrzymał oddech.
```

Nie nadużywać. Max 1–2 na akapit.

---

## Myśli wewnętrzne (głosy w grze)

Głosy wewnętrzne Tomasza zapisywane są kursywą w bloku cytatowym:
```
*(PAMIĘĆ: „Anna miałaby teraz 36 lat.")*
```

W JSON — jako osobne pole `voice_line` z atrybutem `voice: "PAMIĘĆ"`.
Nie jako część dialogu postaci.
