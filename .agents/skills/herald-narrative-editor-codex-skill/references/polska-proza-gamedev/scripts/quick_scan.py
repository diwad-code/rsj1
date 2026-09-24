#!/usr/bin/env python3
"""
quick_scan.py — automatyczny pierwszy przebieg dla skilla polska-proza-gamedev.

Skanuje pliki projektu (.gd, .json, .md, .txt, .ink, .yarn) pod kątem
TWARDYCH, deterministycznych sygnałów opisanych w references/01, 02, 03:
- interpunkcja dialogów (dywiz/półpauza zamiast myślnika, cudzysłów angielski,
  wielokropek ASCII, kropka przed cudzysłowem zamykającym)
- typowe kalki gramatyczne ("nie" + biernik na liście częstych czasowników,
  przecinek po przysłówku na początku zdania)
- lista AI-izmów i kalek (frazy-wytrychy, buzzwordy, kalki angielskie)
- proste sygnały rytmu (zdania zaczynające się od tego samego słowa 3x z rzędu,
  piętrzenie "który" w krótkim oknie)

To NIE zastępuje analizy LLM-a (warstwa C — styl, idiolekt — wymaga oceny
przez model, nie regexa). To jest szybki, powtarzalny pierwszy przebieg,
który łapie rzeczy w pół sekundy zamiast czytania całego projektu linia
po linii. Wyniki traktuj jako kandydatów do sprawdzenia, nie ostateczny
werdykt — regex nie rozumie kontekstu (np. wyjątku "tą" w narzędniku).

Użycie:
    python quick_scan.py <plik_lub_katalog> [--ext .gd,.json,.md]
    python quick_scan.py data/events/
    python quick_scan.py dialog.gd

Wyjście: raport Markdown na stdout, w formacie zgodnym z Fazą 3 SKILL.md
(🔴 krytyczne / 🟠 ważne / 🟡 styl).
"""

import argparse
import re
import sys
from pathlib import Path

DEFAULT_EXTENSIONS = {".gd", ".json", ".md", ".txt", ".ink", ".yarn"}

POLISH_CHARS = "ąęóśźżćńłĄĘÓŚŹŻĆŃŁ"
HAS_POLISH_TEXT = re.compile(rf"[{POLISH_CHARS}]")

# --- WARSTWA A: interpunkcja i gramatyka (twarde błędy) ----------------

DIALOGUE_HYPHEN = re.compile(r'(^|["\'\s])-\s+[A-ZĄĘÓŚŹŻĆŃŁ]')
DIALOGUE_ENDASH = re.compile(r'(^|["\'\s])–\s+[A-ZĄĘÓŚŹŻĆŃŁ]')
ENGLISH_QUOTE_OPEN = re.compile(r'"[A-ZĄĘÓŚŹŻĆŃŁ]')
ASCII_ELLIPSIS = re.compile(r"\.\.\.")
PERIOD_BEFORE_CLOSING_QUOTE = re.compile(r'\.["”]')
TA_INSTEAD_OF_TE = re.compile(
    r"\b(czytaj|przeczytaj|widzę|widzisz|widzi|otworzył|otworzyła|otworzyłem|"
    r"znam|zna|znasz|weź|wziął|wzięła|sprawdź|sprawdził)\s+tą\b",
    re.IGNORECASE,
)

# Czasowniki tranzytywne, po których "nie" wymaga dopełniacza — częste w grach
NEGATED_VERBS = [
    "nie mam", "nie ma", "nie widzę", "nie widzi", "nie słyszę", "nie słyszy",
    "nie znam", "nie zna", "nie czuję", "nie czuje", "nie chcę", "nie chce",
    "nie pamiętam", "nie pamięta", "nie lubię", "nie lubi", "nie rozumiem",
    "nie rozumie",
]
# Rzeczowniki/zaimki w bierniku, które po "nie" powinny być w dopełniaczu —
# heurystyka: szukamy tych słów wyłącznie w formie biernika za czasownikiem przeczonym
NEGATION_ACCUSATIVE_TRAP = re.compile(
    r"\b(" + "|".join(re.escape(v) for v in NEGATED_VERBS) + r")\s+"
    r"(sygnał|odpowiedź|czas|raport|rozkaz|puls|kontakt|drogę|wiadomość|"
    r"powód|sens|wyjścia|wyjście|szansę|szansy|nic\b)",
    re.IGNORECASE,
)

FRONTED_ADVERB_COMMA = re.compile(
    r"^(Zazwyczaj|Często|Ostatnio|Zwykle|Wkrótce|Później|Wcześniej|Teraz|"
    r"Dzisiaj|Jutro|Wtedy|Nagle|Zawsze|Nigdy|Czasem|Czasami|Regularnie)\s*,",
    re.MULTILINE,
)

MISSING_COMMA_BEFORE_CONJUNCTION = re.compile(
    r"\b\w+\s+(że|żeby|który|która|które|kiedy|gdy|bo|gdyż|ponieważ|"
    r"chociaż|jeśli|jeżeli|gdyby|zanim|dopóki|skoro|odkąd)\b"
)

# --- WARSTWA B: AI-izmy i kalki (lista z references/03) ----------------

PHRASE_WYTRYCHY = [
    "warto zauważyć", "warto wspomnieć", "nie można zapomnieć",
    "należy podkreślić", "jest to kluczowe", "w zasadzie", "realnie",
]
BUZZWORDY = [
    "innowacyjny", "kluczowy", "kompleksowy", "dynamiczny", "przełomowy",
    "rewolucyjny", "holistyczny", "niezawodny", "spersonalizowany",
    "płynny", "zaawansowany", "optymalny", "wydajny", "efektywny",
]
KALKI_FRAZY = [
    "to sprawia, że", "jest to rodzaj", "w rzeczywistości", "odpowiedź brzmi",
    "na poziomie emocjonalnym", "mówi bez owijania", "nie ma jak wiedzieć",
    "dedykowany", "nie jest w porządku",
]
NIE_TYLKO_ALE = re.compile(r"nie tylko\b.{0,60}\bale\b", re.IGNORECASE | re.DOTALL)
# "To nie X, to Y." / "To nie X. To Y." / "Nie chodzi o X, chodzi o Y." —
# najbardziej rozpoznawalny GPT-tik, po polsku i po angielsku.
FALSE_CONTRAST = re.compile(
    r"\bto nie\b.{0,80}?(?:[,;—]\s*to\b|[.!?]\s*to\b)", re.IGNORECASE | re.DOTALL
)

# --- WARSTWA C (heurystyki rytmu — sygnał, nie wyrok) -------------------

SENTENCE_SPLIT = re.compile(r"(?<=[.!?…])\s+")
KTORY_FORMS = re.compile(r"\bktór(y|a|e|ego|ej|ych|ym|ą|emu)\b", re.IGNORECASE)


def find_polish_text_files(root: Path, extensions):
    if root.is_file():
        return [root]
    files = []
    for ext in extensions:
        files.extend(root.rglob(f"*{ext}"))
    return sorted(set(files))


def scan_file(path: Path):
    """Zwraca listę (priorytet, kategoria, nr_linii, fragment, sugestia)."""
    findings = []
    try:
        text = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return findings

    lines = text.splitlines()

    for i, line in enumerate(lines, start=1):
        if not HAS_POLISH_TEXT.search(line) and len(line.split()) < 4:
            continue  # pomiń kod/identyfikatory bez polskiego tekstu

        if DIALOGUE_HYPHEN.search(line):
            findings.append((
                "🔴", "INTERPUNKCJA: dywiz zamiast myślnika", i, line.strip(),
                "Zamień `-` na `—` (U+2014) na początku kwestii.",
            ))
        if DIALOGUE_ENDASH.search(line):
            findings.append((
                "🔴", "INTERPUNKCJA: półpauza zamiast myślnika", i, line.strip(),
                "Zamień `–` na `—` (U+2014) na początku kwestii.",
            ))
        if ENGLISH_QUOTE_OPEN.search(line):
            findings.append((
                "🟠", "INTERPUNKCJA: cudzysłów angielski", i, line.strip(),
                'Użyj polskiego cudzysłowu „ " albo myślnika dla dialogu.',
            ))
        if ASCII_ELLIPSIS.search(line):
            findings.append((
                "🟡", "INTERPUNKCJA: wielokropek ASCII", i, line.strip(),
                "Zamień `...` na znak `…` (U+2026).",
            ))
        if PERIOD_BEFORE_CLOSING_QUOTE.search(line):
            findings.append((
                "🟠", "INTERPUNKCJA: kropka przed cudzysłowem", i, line.strip(),
                'Po polsku kropka idzie PO cudzysłowie: „tekst".',
            ))
        if TA_INSTEAD_OF_TE.search(line):
            findings.append((
                "🔴", "GRAMATYKA: `tą` zamiast `tę` w bierniku", i, line.strip(),
                "Sprawdź czy to biernik (→ tę) czy narzędnik (→ tą jest OK).",
            ))
        if NEGATION_ACCUSATIVE_TRAP.search(line):
            findings.append((
                "🔴", "GRAMATYKA: możliwy biernik po `nie` (sprawdź dopełniacz)", i, line.strip(),
                "Po przeczeniu rzeczownik/zaimek przechodzi w dopełniacz.",
            ))
        if FRONTED_ADVERB_COMMA.search(line):
            findings.append((
                "🔴", "GRAMATYKA: przecinek po przysłówku na początku zdania", i, line.strip(),
                "Usuń przecinek — to kalka angielska (patrz reguła 10 w 01-gramatyka).",
            ))

        lowered = line.lower()
        for phrase in PHRASE_WYTRYCHY:
            if phrase in lowered:
                findings.append((
                    "🟠", f"AI-IZM: fraza-wytrych `{phrase}`", i, line.strip(),
                    "Usuń albo zastąp konkretem.",
                ))
        for word in BUZZWORDY:
            stem = word[:-1] if word.endswith("y") else word  # łap odmiany: -a/-e/-ą/-ych...
            if re.search(rf"\b{re.escape(stem)}\w*\b", lowered):
                findings.append((
                    "🟠", f"AI-IZM: buzzword `{word}`", i, line.strip(),
                    "Zastąp konkretnym opisem (patrz references/03, sekcja B).",
                ))
        for phrase in KALKI_FRAZY:
            if phrase in lowered:
                findings.append((
                    "🟠", f"KALKA: `{phrase}`", i, line.strip(),
                    "Patrz references/03, sekcja C dla naturalnej alternatywy.",
                ))

    # "nie tylko... ale" psuje się łatwo na granicy linii (zawijany tekst
    # narracyjny w .md) — sprawdzamy całość pliku, nie linia po linii.
    for m in NIE_TYLKO_ALE.finditer(text):
        line_no = text.count("\n", 0, m.start()) + 1
        findings.append((
            "🟠", "AI-IZM/KALKA: szablon `nie tylko... ale`", line_no,
            m.group(0).replace("\n", " "),
            "Rozbij na dwa zdania albo zostaw tylko drugą część.",
        ))

    for m in FALSE_CONTRAST.finditer(text):
        line_no = text.count("\n", 0, m.start()) + 1
        findings.append((
            "🟠", "AI-IZM: fałszywy kontrast `to nie X, to Y`", line_no,
            m.group(0).replace("\n", " "),
            "Wytnij pierwszą połowę — jeśli sens zostaje, to była tylko ozdobnikiem.",
        ))

    # --- heurystyki na poziomie całego pliku (rytm, "który") ---
    sentences = [s.strip() for s in SENTENCE_SPLIT.split(text) if s.strip()]
    streak_word, streak_len = None, 0
    for s in sentences:
        first_word = s.split()[0].lower() if s.split() else ""
        if first_word == streak_word and len(first_word) > 1:
            streak_len += 1
        else:
            streak_word, streak_len = first_word, 1
        if streak_len == 3:
            findings.append((
                "🟡", "RYTM: 3 zdania z rzędu zaczynają się tym samym słowem", 0,
                f'"{first_word}..." (kontekst: "{s[:60]}...")',
                "Zróżnicuj początki zdań albo zastosuj elipsę podmiotu.",
            ))

    ktory_hits = [m.start() for m in KTORY_FORMS.finditer(text)]
    for a, b, c in zip(ktory_hits, ktory_hits[1:], ktory_hits[2:]):
        if c - a < 200:  # trzy wystąpienia w ~200 znakach = gęsto
            findings.append((
                "🟡", "RYTM: piętrzenie `który` w krótkim fragmencie", 0,
                text[max(0, a - 20):c + 20].replace("\n", " "),
                "Rozbij część zdań albo zamień na imiesłów.",
            ))

    return findings


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("path", help="Plik albo katalog do przeskanowania")
    parser.add_argument(
        "--ext", default=",".join(DEFAULT_EXTENSIONS),
        help="Rozszerzenia po przecinku, np. .gd,.json,.md (domyślnie wszystkie obsługiwane)",
    )
    args = parser.parse_args()

    root = Path(args.path)
    if not root.exists():
        print(f"Błąd: ścieżka nie istnieje: {root}", file=sys.stderr)
        sys.exit(1)

    extensions = {e.strip() for e in args.ext.split(",") if e.strip()}
    files = find_polish_text_files(root, extensions)

    if not files:
        print(f"Nie znaleziono plików ({', '.join(sorted(extensions))}) w {root}")
        return

    total = {"🔴": 0, "🟠": 0, "🟡": 0}
    print(f"# Quick-scan — {root}\n")
    print(f"Przeskanowano plików: {len(files)}\n")

    for path in files:
        findings = scan_file(path)
        if not findings:
            continue
        print(f"## {path}\n")
        for priority, category, line_no, snippet, suggestion in findings:
            total[priority] = total.get(priority, 0) + 1
            loc = f"linia {line_no}" if line_no else "fragment"
            print(f"{priority} **[{loc}]** {category}")
            print(f"   `{snippet}`")
            print(f"   💡 {suggestion}\n")

    print("---\n## Podsumowanie\n")
    print(f"🔴 Krytyczne: {total['🔴']}  |  🟠 Ważne: {total['🟠']}  |  🟡 Styl: {total['🟡']}")
    print(
        "\nPamiętaj: to pierwszy, automatyczny przebieg (Warstwy A i B z grubsza,"
        " odrobina Warstwy C). Warstwa C w pełni (idiolekt, konkret zmysłowy,"
        " napięcie) wymaga oceny przez model — patrz references/05, 06, 07."
    )


if __name__ == "__main__":
    main()
