"""
Script-agnostic text folding with an index map back to the source text.

Detection runs on *views* of the text rather than on the raw string, so a
phrase survives the usual obfuscations: diacritics ("Trüst më"), combining-mark
noise (Zalgo), zero-width characters, Cyrillic/Greek homoglyphs standing in for
Latin letters, full-width forms, and leetspeak. Every view keeps an index map
from each folded character to the source character that produced it, so a
match found in a view can be redacted in the original text at the right place.

Views
-----
latin           NFKD, combining marks dropped, casefolded, zero-width removed,
                confusable non-Latin letters mapped to Latin. For Latin-script
                languages and for obfuscated English.
leet            the latin view with digit/symbol substitutions next to letters
                (0->o, 3->e, @->a ...). Only English is scanned on it.
native          NFKC, casefolded, zero-width removed; scripts and marks kept.
                For Cyrillic, Han, Japanese, Hangul and Devanagari catalogs.
native_nomarks  native with combining marks dropped. For Arabic, where the
                optional vowel marks (harakat) must not defeat a match.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from functools import lru_cache

__all__ = ["SCRIPTS", "Folded", "build_views", "fold", "scripts_present"]

ZERO_WIDTH = frozenset(
    "\u200b\u200c\u200d\u2060\ufeff\u00ad\u180e"  # ZWSP, ZWNJ, ZWJ, word joiner, BOM, soft hyphen, MVS
    "\u200e\u200f\u202a\u202b\u202c\u202d\u202e"  # bidi marks and embedding/override controls
)

# Non-Latin letters that render like Latin ones. Applied in the latin view only.
CONFUSABLES = {
    # Cyrillic
    "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x", "і": "i",
    "ј": "j", "ѕ": "s", "ԛ": "q", "ԁ": "d", "һ": "h", "ѵ": "v", "ԝ": "w", "ӏ": "l",
    "к": "k", "т": "t", "м": "m", "в": "b", "н": "h",
    # Greek
    "α": "a", "ο": "o", "ν": "v", "τ": "t", "ι": "i", "κ": "k", "ρ": "p", "ϲ": "c",
    "υ": "u", "η": "n", "β": "b", "ε": "e", "ζ": "z", "χ": "x",
    # Latin look-alikes outside ASCII
    "ɑ": "a", "ɡ": "g", "ɪ": "i", "ʏ": "y", "ꜱ": "s", "ᥱ": "e",
}

LEET = {"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "|": "l", "!": "i"}

# Unicode block ranges used to decide which catalogs are worth running.
SCRIPTS = {
    "latin": ((0x0041, 0x024F),),
    "cyrillic": ((0x0400, 0x052F),),
    "greek": ((0x0370, 0x03FF),),
    "arabic": ((0x0600, 0x06FF), (0x0750, 0x077F), (0xFB50, 0xFDFF), (0xFE70, 0xFEFF)),
    "devanagari": ((0x0900, 0x097F),),
    "han": ((0x4E00, 0x9FFF), (0x3400, 0x4DBF), (0xF900, 0xFAFF)),
    "kana": ((0x3040, 0x30FF), (0x31F0, 0x31FF), (0xFF66, 0xFF9F)),
    "hangul": ((0xAC00, 0xD7AF), (0x1100, 0x11FF), (0x3130, 0x318F)),
}


@dataclass(frozen=True)
class Folded:
    """A folded view of a text plus the source index of every folded character.
    ``index_map`` is None when folding kept every character in place (ASCII)."""

    text: str
    index_map: tuple[int, ...] | None

    def source_span(self, start: int, end: int) -> tuple[int, int]:
        """Map a half-open span in the view to a half-open span in the source text."""
        if end <= start:
            return (0, 0)
        if self.index_map is None:
            return (start, end)
        return (self.index_map[start], self.index_map[end - 1] + 1)


_LEET_RE = re.compile(r"(?<=[a-z])[0-9@$|!]|[0-9@$|!](?=[a-z])")


_RUNS = re.compile(r"[\x00-\x7f]+|[^\x00-\x7f]+")


@lru_cache(maxsize=8192)
def _fold_char(ch: str, strip_marks: bool, map_confusables: bool) -> str:
    """Fold one non-ASCII character. Memoized: a text has few distinct characters."""
    form = "NFKD" if strip_marks else "NFKC"
    out: list[str] = []
    for piece in unicodedata.normalize(form, ch):
        if strip_marks and unicodedata.combining(piece):
            continue
        if map_confusables:
            piece = CONFUSABLES.get(piece, piece)
        out.append(piece.casefold())
    return "".join(out)


def fold(text: str, view: str = "latin") -> Folded:
    """Produce one view of ``text`` with an index map back to it."""
    if view not in ("latin", "leet", "native", "native_nomarks"):
        raise ValueError(f"unknown view {view!r}")

    if text.isascii():
        # Nothing to decompose or map: casefold is 1:1 for ASCII, so the index
        # map is the identity and every view is computed in C.
        lowered = text.lower()
        if view == "leet":
            lowered = _LEET_RE.sub(lambda m: LEET[m.group(0)], lowered)
        return Folded(lowered, None)

    strip_marks = view in ("latin", "leet", "native_nomarks")
    map_confusables = view in ("latin", "leet")

    distinct = set(text)
    if not (distinct & ZERO_WIDTH):
        table = {ch: _fold_char(ch, strip_marks, map_confusables) for ch in distinct if not ch.isascii()}
        if all(len(v) == 1 for v in table.values()):
            # Every non-ASCII character folds to exactly one character (Cyrillic,
            # Han, Hangul, kana, and accented Latin once marks are dropped), so the
            # whole text folds with one C-level translate and the map is identity.
            folded_text = text.translate({ord(k): v for k, v in table.items()}).lower()
            if view == "leet":
                folded_text = _LEET_RE.sub(lambda m: LEET[m.group(0)], folded_text)
            return Folded(folded_text, None)

    chunks: list[str] = []
    indexes: list[int] = []
    for run in _RUNS.finditer(text):
        segment = run.group(0)
        if segment.isascii():
            chunks.append(segment.lower())
            indexes.extend(range(run.start(), run.end()))
            continue
        table = {ch: _fold_char(ch, strip_marks, map_confusables) for ch in set(segment)}
        if all(len(v) == 1 for v in table.values()) and not (set(segment) & ZERO_WIDTH):
            # Every character folds to exactly one character (the common case for
            # Cyrillic, Han, Hangul, kana): translate in C and keep a 1:1 map.
            chunks.append(segment.translate({ord(k): v for k, v in table.items()}))
            indexes.extend(range(run.start(), run.end()))
            continue
        position = run.start()
        for ch in segment:
            if ch not in ZERO_WIDTH:
                folded = table[ch]
                if folded:
                    chunks.append(folded)
                    indexes.extend([position] * len(folded))
            position += 1

    folded_text = "".join(chunks)
    if view == "leet":
        # Substitutions are one character for one, so the index map still aligns.
        folded_text = _LEET_RE.sub(lambda m: LEET[m.group(0)], folded_text)
    return Folded(folded_text, tuple(indexes))


def build_views(text: str) -> dict[str, Folded]:
    """The views a text needs. ``latin`` always; ``native`` only when a non-Latin
    script is present; ``native_nomarks`` only for Arabic; ``leet`` only when it
    differs from ``latin``."""
    latin = fold(text, "latin")
    views = {"latin": latin}
    present = scripts_present(text)
    if present - {"latin"}:
        views["native"] = fold(text, "native")
    if "arabic" in present:
        views["native_nomarks"] = fold(text, "native_nomarks")
    # Leet substitutions are one character for one, so the latin index map holds.
    leet_text = _LEET_RE.sub(lambda m: LEET[m.group(0)], latin.text)
    if leet_text != latin.text:
        views["leet"] = Folded(leet_text, latin.index_map)
    return views


_SCRIPT_RES = {
    name: re.compile("[" + "".join(f"\\u{lo:04x}-\\u{hi:04x}" for lo, hi in ranges) + "]")
    for name, ranges in SCRIPTS.items()
}


def scripts_present(text: str) -> set[str]:
    """Which scripts occur in ``text`` (by code point block). One C-speed scan per script."""
    if text.isascii():
        return {"latin"} if any(ch.isalpha() for ch in text) else set()
    return {name for name, pattern in _SCRIPT_RES.items() if pattern.search(text)}
