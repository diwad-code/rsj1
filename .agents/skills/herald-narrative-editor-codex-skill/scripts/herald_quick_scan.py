#!/usr/bin/env python3
"""
HERALD quick text scan.

Prosty skaner heurystyczny dla player-facing copy:
- AI-izmy i frazy-wytrychy,
- konstrukcje "To nie X. To Y.",
- dywiz zamiast myślnika dialogowego,
- angielskie cudzysłowy w polskim tekście,
- podstawowe pułapki "tą/tę".

Użycie:
    python herald_quick_scan.py web-migracja/data-mirror
    python herald_quick_scan.py path/to/file.json path/to/other.md

To nie zastępuje redakcji. Daje listę miejsc do sprawdzenia.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

EXTS = {".json", ".md", ".txt", ".ts", ".tsx", ".js", ".jsx", ".gd", ".yarn", ".ink"}

PHRASES = [
    "warto zauważyć",
    "kluczowe",
    "kluczowy",
    "kluczowa",
    "w kontekście",
    "na poziomie emocjonalnym",
    "stanowi",
    "pełni rolę",
    "jest symbolem",
    "ma za zadanie",
    "kompleksowy",
    "kompleksowa",
    "istotny",
    "istotna",
    "znaczący",
    "znacząca",
    "zdecydowanie",
    "w rzeczywistości",
    "należy podkreślić",
    "można zauważyć",
    "z perspektywy",
    "pod kątem",
]

PATTERNS = [
    ("symetryczne 'To nie... To...'", re.compile(r"\bTo nie\b.{0,120}?\.\s*\bTo\b", re.IGNORECASE | re.DOTALL)),
    ("symetryczne 'Nie jest... Jest...'", re.compile(r"\bNie jest\b.{0,120}?\.\s*\bJest\b", re.IGNORECASE | re.DOTALL)),
    ("symetryczne 'Nie ma... Jest...'", re.compile(r"\bNie ma\b.{0,120}?\.\s*\bJest\b", re.IGNORECASE | re.DOTALL)),
    ("dywiz dialogowy zamiast —", re.compile(r"(?m)^\s*-\s+[A-ZĄĆĘŁŃÓŚŹŻ]")),
    ("prawdopodobne tą zamiast tę", re.compile(r"\btą\s+(wiadomość|decyzję|chwilę|misję|prawdę|odpowiedź|rzecz|dłoń|kapsułę)\b", re.IGNORECASE)),
    ("ECHO zbyt emocjonalne", re.compile(r"ECHO.{0,80}\b(cieszę się|przykro mi|rozumiem, że|czuję|uważam)\b", re.IGNORECASE | re.DOTALL)),
]

def iter_files(paths: list[Path]):
    for p in paths:
        if p.is_dir():
            for child in p.rglob("*"):
                if child.is_file() and child.suffix.lower() in EXTS:
                    yield child
        elif p.is_file() and p.suffix.lower() in EXTS:
            yield p

def line_col(text: str, idx: int) -> tuple[int, int]:
    line = text.count("\n", 0, idx) + 1
    last = text.rfind("\n", 0, idx)
    col = idx + 1 if last < 0 else idx - last
    return line, col

def snippet(text: str, idx: int, n: int = 90) -> str:
    s = max(0, idx - n // 2)
    e = min(len(text), idx + n // 2)
    return text[s:e].replace("\n", "\\n")

def scan_file(path: Path) -> list[str]:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        text = path.read_text(encoding="utf-8", errors="replace")

    hits: list[str] = []
    lower = text.lower()

    for phrase in PHRASES:
        start = 0
        while True:
            idx = lower.find(phrase.lower(), start)
            if idx == -1:
                break
            line, col = line_col(text, idx)
            hits.append(f"{path}:{line}:{col}: fraza ryzyka '{phrase}' :: {snippet(text, idx)}")
            start = idx + len(phrase)

    for label, pattern in PATTERNS:
        for m in pattern.finditer(text):
            line, col = line_col(text, m.start())
            hits.append(f"{path}:{line}:{col}: {label} :: {snippet(text, m.start())}")

    return hits

def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("Użycie: python herald_quick_scan.py <file_or_dir> [...]", file=sys.stderr)
        return 2

    paths = [Path(a) for a in argv[1:]]
    files = list(iter_files(paths))
    total_hits = 0

    for f in files:
        hits = scan_file(f)
        total_hits += len(hits)
        for h in hits:
            print(h)

    print(f"\nSkan zakończony. Pliki: {len(files)}. Trafienia: {total_hits}.")
    if total_hits:
        print("Uwaga: to są heurystyki. Każde trafienie wymaga decyzji redaktorskiej.")
    return 1 if total_hits else 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
