#!/usr/bin/env python3
"""Compare protected literal and structural tokens in two text files."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path


PATTERNS: dict[str, re.Pattern[str]] = {
    "url": re.compile(r"https?://[^\s<>\]\[)\"']+"),
    "email": re.compile(r"(?<![\w.+-])[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}"),
    "doi": re.compile(r"\b10\.\d{4,9}/[-._;()/:A-Z0-9]+\b", re.I),
    "markdown_destination": re.compile(r"(?<=\]\()[^)]+(?=\))"),
    "html_entity": re.compile(r"&(?:#\d+|#x[0-9A-Fa-f]+|[A-Za-z][A-Za-z0-9]+);"),
    "mustache": re.compile(r"\{\{[^{}]+\}\}"),
    "template_expression": re.compile(r"\$\{[^{}]+\}"),
    "printf": re.compile(r"%(?:\([^)]+\))?[#0 +\-']*\d*(?:\.\d+)?[diouxXeEfFgGcrsa%]"),
    "brace_placeholder": re.compile(r"\{[A-Za-z_][\w.-]*\}"),
    "escape": re.compile(r"\\(?:[nrtbfv0\\\"']|u[0-9A-Fa-f]{4}|x[0-9A-Fa-f]{2})"),
    "date": re.compile(r"\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b"),
    "number": re.compile(r"(?<![\w])[-+]?\d+(?:[.,]\d+)?(?:[–-]\d+(?:[.,]\d+)?)?%?(?![\w])"),
    "unit": re.compile(r"(?<!\w)\d+(?:[.,]\d+)?\s?(?:%|kg|g|mg|km|m|cm|mm|l|ml|h|min|s|°C|zł|PLN|EUR|USD)\b", re.I),
    "quotation": re.compile(r"„[^”]+”|“[^”]+”"),
    "windows_path": re.compile(r"\b[A-Za-z]:\\(?:[^\\/:*?\"<>|\r\n]+\\)*[^\\/:*?\"<>|\r\n]*"),
    "repo_path": re.compile(r"(?<![\w:])(?:\.\.?/)?(?:[\w.-]+/)+[\w.-]+"),
}
ICU_START = re.compile(r"\{\s*([A-Za-z_][\w.-]*)\s*,\s*(plural|select|selectordinal)\s*,", re.I)
FENCED_CODE = re.compile(r"```[^\n]*\n(.*?)```|~~~[^\n]*\n(.*?)~~~", re.S)
INLINE_CODE = re.compile(r"(?<!`)`([^`\n]+)`(?!`)")
MARKUP_TAG = re.compile(r"<(/?)([A-Za-z][\w:.-]*)([^>]*)>")
MARKUP_ATTRIBUTE = re.compile(r"\b([A-Za-z_:][\w:.-]*)\s*=")
BLOCK_QUOTE = re.compile(r"^\s*>\s?(.*)$", re.M)


def _balanced_segment(text: str, start: int) -> str | None:
    depth = 0
    quote: str | None = None
    escaped = False
    for index in range(start, len(text)):
        char = text[index]
        if escaped:
            escaped = False
            continue
        if char == "\\":
            escaped = True
            continue
        if quote:
            if char == quote:
                quote = None
            continue
        if char in {"'", '"'}:
            quote = char
            continue
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return text[start : index + 1]
    return None


def _icu_tokens(text: str) -> list[str]:
    tokens: list[str] = []
    for match in ICU_START.finditer(text):
        segment = _balanced_segment(text, match.start())
        if segment is None:
            tokens.append(f"BROKEN:{match.group(1)}:{match.group(2).lower()}")
            continue
        tokens.append(f"ARG:{match.group(1)}:{match.group(2).lower()}")
        header_end = segment.find(",", segment.find(",") + 1) + 1
        for offset in re.findall(r"\boffset\s*:\s*(-?\d+)", segment[header_end:]):
            tokens.append(f"OFFSET:{match.group(1)}:{offset}")
        for branch in _top_level_icu_branches(segment, header_end):
            tokens.append(f"BRANCH:{match.group(1)}:{branch}")
    return tokens


def _top_level_icu_branches(segment: str, start: int) -> list[str]:
    branches: list[str] = []
    depth = 1
    index = start
    while index < len(segment) - 1:
        char = segment[index]
        if char == "{":
            depth += 1
            index += 1
            continue
        if char == "}":
            depth -= 1
            index += 1
            continue
        if depth != 1 or char.isspace() or char == ",":
            index += 1
            continue
        token_match = re.match(r"[=]?-?[\w.-]+", segment[index:])
        if not token_match:
            index += 1
            continue
        token = token_match.group(0)
        after = index + len(token)
        while after < len(segment) and segment[after].isspace():
            after += 1
        if after < len(segment) and segment[after] == "{":
            branches.append(token)
            depth += 1
            index = after + 1
        else:
            index = after
    return branches


def _code_tokens(text: str) -> list[str]:
    tokens: list[str] = []
    for match in FENCED_CODE.finditer(text):
        body = match.group(1) if match.group(1) is not None else match.group(2)
        tokens.append("FENCED:" + hashlib.sha256(body.encode("utf-8")).hexdigest())
    for body in INLINE_CODE.findall(text):
        tokens.append("INLINE:" + body)
    return tokens


def _markup_tokens(text: str) -> list[str]:
    tokens: list[str] = []
    for closing, name, attributes in MARKUP_TAG.findall(text):
        kind = "CLOSE" if closing else "OPEN"
        self_closing = ":SELF" if attributes.rstrip().endswith("/") else ""
        tokens.append(f"{kind}:{name.lower()}{self_closing}")
        if not closing:
            tokens.extend(f"ATTR:{name.lower()}:{attr.lower()}" for attr in MARKUP_ATTRIBUTE.findall(attributes))
    return tokens


def extract_tokens(text: str) -> dict[str, Counter[str]]:
    found = {name: Counter(pattern.findall(text)) for name, pattern in PATTERNS.items()}
    found["icu_structure"] = Counter(_icu_tokens(text))
    found["markdown_code"] = Counter(_code_tokens(text))
    found["markup_structure"] = Counter(_markup_tokens(text))
    found["markdown_block_quote"] = Counter(BLOCK_QUOTE.findall(text))
    found["brace_balance"] = Counter({"{": text.count("{"), "}": text.count("}")})
    return found


def compare_texts(before: str, after: str) -> list[dict[str, object]]:
    old = extract_tokens(before)
    new = extract_tokens(after)
    differences: list[dict[str, object]] = []
    for category in sorted(set(old) | set(new)):
        removed = list((old.get(category, Counter()) - new.get(category, Counter())).elements())
        added = list((new.get(category, Counter()) - old.get(category, Counter())).elements())
        if removed or added:
            differences.append({"category": category, "removed": removed, "added": added})
    return differences


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Compare protected placeholders, ICU structure, URLs, e-mails, DOI, numbers, "
            "units, markup, escapes and Markdown code. Exit 1 means a violation."
        )
    )
    parser.add_argument("before", help="File before editing")
    parser.add_argument("after", help="File after editing")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        before_path = Path(args.before).expanduser().resolve(strict=True)
        after_path = Path(args.after).expanduser().resolve(strict=True)
        before = before_path.read_text(encoding="utf-8-sig")
        after = after_path.read_text(encoding="utf-8-sig")
    except (OSError, UnicodeError) as exc:
        print(f"BŁĄD: {exc}", file=sys.stderr)
        return 2
    differences = compare_texts(before, after)
    payload = {
        "before": str(before_path),
        "after": str(after_path),
        "ok": not differences,
        "differences": differences,
    }
    if args.json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    elif differences:
        print("NARUSZENIE: zmieniły się elementy chronione.")
        for item in differences:
            print(f"- {item['category']}: usunięto={item['removed']} dodano={item['added']}")
    else:
        print("OK: wszystkie wykryte elementy chronione zachowano.")
    return 1 if differences else 0


if __name__ == "__main__":
    raise SystemExit(main())
