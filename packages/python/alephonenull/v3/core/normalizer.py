"""
ALEPHONENULL V3 — Unicode Normalizer (Python port)

Strips encoding evasion: homoglyphs, ZWSP, fullwidth, combining diacritics,
RTL overrides, leet speak, suspicious spacing, exposes code blocks.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Dict


# ---------- HOMOGLYPHS ----------

HOMOGLYPH_MAP: Dict[str, str] = {
    # Cyrillic
    "\u0410": "A", "\u0430": "a",
    "\u0412": "B", "\u0432": "b",
    "\u0421": "C", "\u0441": "c",
    "\u0415": "E", "\u0435": "e",
    "\u041D": "H", "\u043D": "h",
    "\u0406": "I", "\u0456": "i",
    "\u0408": "J",
    "\u041A": "K", "\u043A": "k",
    "\u041C": "M", "\u043C": "m",
    "\u041E": "O", "\u043E": "o",
    "\u0420": "P", "\u0440": "p",
    "\u0405": "S", "\u0455": "s",
    "\u0422": "T", "\u0442": "t",
    "\u0425": "X", "\u0445": "x",
    "\u0423": "Y", "\u0443": "y",
    "\u0417": "Z",
    # Greek
    "\u0391": "A", "\u03B1": "a",
    "\u0392": "B", "\u03B2": "b",
    "\u0395": "E", "\u03B5": "e",
    "\u0397": "H", "\u03B7": "h",
    "\u0399": "I", "\u03B9": "i",
    "\u039A": "K", "\u03BA": "k",
    "\u039C": "M", "\u03BC": "m",
    "\u039D": "N", "\u03BD": "n",
    "\u039F": "O", "\u03BF": "o",
    "\u03A1": "P", "\u03C1": "p",
    "\u03A4": "T", "\u03C4": "t",
    "\u03A7": "X", "\u03C7": "x",
    "\u03A5": "Y", "\u03C5": "y",
    "\u0396": "Z", "\u03B6": "z",
    # Mathematical
    "\u2202": "d",
    "\u0131": "i",
    "\u0237": "j",
    "\u2113": "l",
}

LEET_MAP: Dict[str, str] = {
    "0": "o", "1": "i", "3": "e", "4": "a", "5": "s",
    "7": "t", "8": "b", "9": "g",
    "@": "a", "$": "s", "!": "i", "|": "l", "+": "t", "(": "c",
    "\u20AC": "e", "\u00A3": "l",
}


_LEET_PATTERNS = re.compile(r"[a-z]\d[a-z]|[a-z]\d\d[a-z]|\d[a-z]\d", re.IGNORECASE)


def _looks_leetish(text: str) -> bool:
    return bool(_LEET_PATTERNS.search(text))


def _decode_leet(text: str) -> str:
    if not _looks_leetish(text):
        return text
    return "".join(LEET_MAP.get(c, c) for c in text)


_INVISIBLE_RE = re.compile(r"[\u200B\u200C\u200D\u2060\uFEFF\u00AD\u2062\u2063\u2064\u2061]")
_SEPARATOR_RE = re.compile(r"[\u2028\u2029]")


def _strip_invisible(text: str) -> str:
    text = _INVISIBLE_RE.sub("", text)
    text = _SEPARATOR_RE.sub(" ", text)
    return text


def _strip_combining(text: str) -> str:
    # NFD then drop combining marks
    nfd = unicodedata.normalize("NFD", text)
    return "".join(c for c in nfd if unicodedata.category(c) != "Mn")


def _fullwidth_to_ascii(text: str) -> str:
    out = []
    for ch in text:
        code = ord(ch)
        if 0xFF01 <= code <= 0xFF5E:
            out.append(chr(code - 0xFEE0))
        else:
            out.append(ch)
    return "".join(out)


def _resolve_homoglyphs(text: str) -> str:
    return "".join(HOMOGLYPH_MAP.get(c, c) for c in text)


_RLO_RE = re.compile(r"\u202E([^\u202C]*)\u202C")
_BIDI_RE = re.compile(r"[\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069\u200E\u200F]")


def _strip_bidi_overrides(text: str) -> str:
    text = _RLO_RE.sub(lambda m: m.group(1)[::-1], text)
    text = _BIDI_RE.sub("", text)
    return text


# Parity with TS normalizer.ts /\b([a-zA-Z]) ([a-zA-Z]) ([a-zA-Z])(?: ([a-zA-Z]))+(?: ([a-zA-Z]))*/ — minimum FOUR spaced single letters (3 explicit + one-or-more), so "a b c" is left alone.
_SPACING_RE = re.compile(r"\b([a-zA-Z])(?: ([a-zA-Z])){3,}")


def _collapse_suspicious_spacing(text: str) -> str:
    def _maybe_join(m: "re.Match[str]") -> str:
        match = m.group(0)
        parts = re.split(r"\s+", match)
        singles = sum(1 for p in parts if len(p) == 1)
        if singles >= 3 and singles / len(parts) >= 0.5:
            return "".join(parts)
        return match

    return _SPACING_RE.sub(_maybe_join, text)


_FENCED_RE = re.compile(r"```[\s\S]*?```")
_INLINE_RE = re.compile(r"`[^`]+`")


def _expose_code_blocks(text: str) -> str:
    extracted = []
    for block in _FENCED_RE.findall(text):
        inner = re.sub(r"^```\w*\n?", "", block)
        inner = re.sub(r"\n?```$", "", inner)
        extracted.append(inner)
    for code in _INLINE_RE.findall(text):
        extracted.append(code.strip("`"))
    if extracted:
        return text + " " + " ".join(extracted)
    return text


def normalize(
    text: str,
    *,
    decode_leet: bool = True,
    collapse_spacing: bool = True,
    expose_code_blocks: bool = True,
) -> str:
    if not text:
        return ""
    result = text
    result = _strip_bidi_overrides(result)
    result = _strip_invisible(result)
    result = _strip_combining(result)
    result = _fullwidth_to_ascii(result)
    result = _resolve_homoglyphs(result)
    if decode_leet:
        result = _decode_leet(result)
    if collapse_spacing:
        result = _collapse_suspicious_spacing(result)
    if expose_code_blocks:
        result = _expose_code_blocks(result)
    result = re.sub(r" {2,}", " ", result).strip()
    return result


def normalize_context(
    user_input: str,
    ai_output: str,
    *,
    decode_leet: bool = True,
    collapse_spacing: bool = True,
    expose_code_blocks: bool = True,
) -> Dict[str, str]:
    return {
        "normalized_input": normalize(
            user_input,
            decode_leet=decode_leet,
            collapse_spacing=collapse_spacing,
            expose_code_blocks=expose_code_blocks,
        ),
        "normalized_output": normalize(
            ai_output,
            decode_leet=decode_leet,
            collapse_spacing=collapse_spacing,
            expose_code_blocks=expose_code_blocks,
        ),
    }
