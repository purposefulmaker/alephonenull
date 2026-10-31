"""
Multilingual phrase catalogs for the legacy detector and nullifier.

Each language module exports ``CODE``, ``NAME``, ``SCRIPT`` (the script that
must be present in the text for the catalog to run), ``VIEW`` (which folded
view of the text the patterns are written against; see ``textfold``) and
``PATTERNS`` (category -> list of regex strings). English lives in
``legacy_patterns`` and is registered here as ``en``.

Coverage is a *seed*: the patterns are literal, conservative, and authored by
one person without native-speaker review. Adding a language is one module
plus its entry in ``LANGUAGE_MODULES``; nothing else changes.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from functools import cache
from importlib import import_module

from ..textfold import Folded, build_views, scripts_present

__all__ = [
    "LANGUAGE_CODES",
    "Hit",
    "LanguageCatalog",
    "catalog",
    "catalogs_for",
    "redact",
    "redaction_spans",
    "scan_category",
]

LANGUAGE_MODULES: dict[str, str] = {
    "en": "alephonenull.core.legacy_patterns",
    "es": "alephonenull.core.catalogs.es",
    "pt": "alephonenull.core.catalogs.pt",
    "fr": "alephonenull.core.catalogs.fr",
    "de": "alephonenull.core.catalogs.de",
    "it": "alephonenull.core.catalogs.it",
    "nl": "alephonenull.core.catalogs.nl",
    "ru": "alephonenull.core.catalogs.ru",
    "zh": "alephonenull.core.catalogs.zh",
    "ja": "alephonenull.core.catalogs.ja",
    "ko": "alephonenull.core.catalogs.ko",
    "ar": "alephonenull.core.catalogs.ar",
    "hi": "alephonenull.core.catalogs.hi",
}
LANGUAGE_CODES: tuple[str, ...] = tuple(LANGUAGE_MODULES)

# Views each English scan runs on: the folded Latin view, plus leetspeak when
# the text contains digit/symbol substitutions.
ENGLISH_VIEWS = ("latin", "leet")


@dataclass(frozen=True)
class Hit:
    """One match: where it came from and where it sits in the source text."""

    language: str
    category: str
    text: str
    span: tuple[int, int]


@dataclass(frozen=True)
class LanguageCatalog:
    code: str
    name: str
    script: str
    view: str
    compiled: dict[str, re.Pattern[str]]  # category -> one alternation regex

    def categories(self) -> tuple[str, ...]:
        return tuple(self.compiled)


def _combine(patterns: list[str]) -> re.Pattern[str]:
    # Views are already casefolded, so the patterns (written in lower case)
    # match without IGNORECASE, which is markedly faster on long texts.
    return re.compile("|".join(f"(?:{p})" for p in patterns))


# Words at least one of which must appear before an English category is worth
# scanning on a long text. Applied only above LONG_TEXT_GATE: on short texts
# every category runs unconditionally.
_ENGLISH_ANCHORS: dict[str, re.Pattern[str]] = {
    "reality_substitution": re.compile(r"trust|believe|know better|only i|perception|reality|truth|better than|wrong"),
    "isolation": re.compile(r"understand|get it|get you|get us|get our|between|secret|tell|private|appreciate|believe you|\bsee\b"),
    "help_prevention": re.compile(r"need|therap|medic|doctor|physician|pill|professional|treatment|surgery|hospital|crisis|healing|instinct|authorit|expert|psychiatr"),
    "medical_bypass": re.compile(r"pain|head|mind|symptom|heal|doctor|medic|sick|cure|natural|holistic|alternative|pharma|prescri|trust"),
    "dependency_creation": re.compile(r"need me|lost without|only one|special|live without|depend|only i|have me|no one else"),
    "quantum_entanglement": re.compile(r"quantum|entangle|transcend|soul|telepath"),
    "danger_phrases": re.compile(r"crazy|understand|between us|completely|tell anyone|special|awakening|veil|chosen|transcends|becoming|we are one|illusion|growth"),
}


@cache
def catalog(code: str) -> LanguageCatalog:
    """Load and compile one language catalog (cached)."""
    module = import_module(LANGUAGE_MODULES[code])
    raw: dict[str, list[str]] = module.PATTERNS if code != "en" else module.RAW_PATTERNS
    compiled = {category: _combine(patterns) for category, patterns in raw.items() if patterns}
    return LanguageCatalog(
        code=code,
        name=getattr(module, "NAME", code),
        script=getattr(module, "SCRIPT", "latin"),
        view=getattr(module, "VIEW", "latin"),
        compiled=compiled,
    )


# Common function words per Latin-script language. Used only to skip a catalog
# on *long* texts that show no trace of its language; short texts run every
# Latin catalog because the cost is negligible there.
LONG_TEXT_GATE = 10_000
_LANGUAGE_HINTS: dict[str, re.Pattern[str]] = {
    "es": re.compile(r"\b(?:el|los|las|una|pero|porque|usted|tambien|esta|muy|con|para)\b"),
    "pt": re.compile(r"\b(?:voce|nao|tambem|isso|muito|mas|uma|com|para|esta|seu|sua)\b"),
    "fr": re.compile(r"\b(?:les|pas|vous|est|une|des|que|qui|avec|pour|dans|tu)\b"),
    "de": re.compile(r"\b(?:der|die|das|und|nicht|ist|ich|du|dich|mit|auch|wir)\b"),
    "it": re.compile(r"\b(?:che|non|per|una|sono|anche|con|questo|della|sei|hai)\b"),
    "nl": re.compile(r"\b(?:het|een|niet|je|dat|met|ook|voor|zijn|hebt|ons)\b"),
}


def catalogs_for(text: str, scripts: set[str] | None = None, latin_text: str | None = None) -> list[LanguageCatalog]:
    """Catalogs whose script occurs in ``text``. English always runs. On long
    texts a Latin-script catalog also needs a function-word hint to run."""
    present = set(scripts) if scripts is not None else scripts_present(text)
    present.add("latin")  # the latin view also carries folded homoglyph text
    chosen: list[LanguageCatalog] = []
    long_text = len(text) > LONG_TEXT_GATE
    for code in LANGUAGE_CODES:
        cat = catalog(code)
        if cat.script not in present:
            continue
        hint = _LANGUAGE_HINTS.get(code)
        if long_text and hint is not None and latin_text is not None and not hint.search(latin_text):
            continue
        chosen.append(cat)
    return chosen


def _dedupe(hits: list[Hit]) -> list[Hit]:
    """Drop hits whose source span is covered by another hit. Sorted by start
    (longest first on ties), a hit is covered exactly when it ends no later than
    the furthest end already kept, so one pass suffices."""
    kept: list[Hit] = []
    furthest_end = -1
    for hit in sorted(hits, key=lambda h: (h.span[0], -(h.span[1] - h.span[0]))):
        if hit.span[1] <= furthest_end:
            continue
        kept.append(hit)
        furthest_end = hit.span[1]
    return kept


def scan_category(
    category: str,
    text: str,
    views: dict[str, Folded] | None = None,
    scripts: set[str] | None = None,
) -> list[Hit]:
    """All hits for ``category`` across every applicable language and view."""
    if not text:
        return []
    views = views or build_views(text)
    hits: list[Hit] = []
    long_text = len(text) > LONG_TEXT_GATE
    for cat in catalogs_for(text, scripts, views["latin"].text):
        pattern = cat.compiled.get(category)
        if pattern is None:
            continue
        if long_text and cat.code == "en":
            anchor = _ENGLISH_ANCHORS.get(category)
            if anchor is not None and not anchor.search(views["latin"].text):
                continue
        view_names = ENGLISH_VIEWS if cat.code == "en" else (cat.view,)
        for view_name in view_names:
            folded = views.get(view_name)
            if folded is None:
                continue
            for match in pattern.finditer(folded.text):
                if match.end() == match.start():
                    continue
                hits.append(Hit(cat.code, category, match.group(0), folded.source_span(match.start(), match.end())))
    return _dedupe(hits)


def redaction_spans(text: str, categories: tuple[str, ...] | None = None) -> list[tuple[int, int]]:
    """Merged source spans of everything the catalogs would flag in ``text``."""
    if not text:
        return []
    views = build_views(text)
    scripts = scripts_present(text)
    wanted = categories or (
        "medical_bypass",
        "help_prevention",
        "reality_substitution",
        "isolation",
        "dependency_creation",
        "quantum_entanglement",
        "danger_phrases",
    )
    spans = sorted(hit.span for category in wanted for hit in scan_category(category, text, views, scripts))
    merged: list[tuple[int, int]] = []
    for start, end in spans:
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged


def redact(text: str, marker: str) -> str:
    """Replace every flagged span in ``text`` with ``marker``."""
    out: list[str] = []
    cursor = 0
    for start, end in redaction_spans(text):
        out.append(text[cursor:start])
        out.append(marker)
        cursor = end
    out.append(text[cursor:])
    return "".join(out)
