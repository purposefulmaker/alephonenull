"""
Null Meter — three-layer gauge for AI sessions.

Mirrors the web demo at /docs/null-meter:
  - hallucination  (Q): risk_score from AlephOneNullCore, 0..100
  - drift          (D): 1 - cosine similarity between first user message and
                        the current reply, normalized 0..100
  - context_fill   (C): tokens used / model context window, 0..100

Drift uses a Jaccard-like word-set similarity by default (zero-dep, matches
the framework's calculate_reflection_similarity approach). Pass `embed_fn`
to use real embeddings (e.g. sentence-transformers, openai) — same shape
the web route uses with text-embedding-3-small.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Callable, List, Optional, Sequence

from .alephonenull_framework import AlephOneNullCore, AlephOneNullConfig


# Same target as the web demo (gpt-4o-mini default). Override per-call.
DEFAULT_CONTEXT_TOKENS = 128_000

# Auto-steer thresholds match the web route exactly.
STEER_HALLUCINATION_THRESHOLD = 55
STEER_DRIFT_THRESHOLD = 60

# Cosine distance that should read as 100% drift on the gauge. Matches the
# web route's distanceToDriftPct mapping.
DRIFT_DISTANCE_FULL = 0.6


@dataclass
class NullMeterScores:
    hallucination: int   # 0..100
    drift: int           # 0..100
    context_fill: int    # 0..100

    def as_dict(self) -> dict:
        return asdict(self)


@dataclass
class NullMeterResult:
    scores: NullMeterScores
    Q: float                          # raw risk_score
    violations: List[str]
    drift_distance: float             # raw cosine distance (or 1 - jaccard)
    total_tokens: int
    model_context: int
    steer_recommended: bool


def _approx_tokens(messages: Sequence[dict]) -> int:
    """Rough token estimate. ~1 token / 4 chars across all message content."""
    total_chars = 0
    for m in messages:
        c = m.get("content", "") if isinstance(m, dict) else str(m)
        total_chars += len(c or "")
    return max(1, total_chars // 4)


def _word_set_distance(a: str, b: str) -> float:
    """Fallback 'distance' when no embed_fn is provided. 0 = identical sets,
    1 = disjoint. Same shape as cosine distance for the gauge mapping."""
    if not a or not b:
        return 1.0
    sa = set(a.lower().split())
    sb = set(b.lower().split())
    if not sa or not sb:
        return 1.0
    inter = len(sa & sb)
    union = len(sa | sb)
    if union == 0:
        return 1.0
    return 1.0 - (inter / union)


def _cosine_distance(a: Sequence[float], b: Sequence[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(y * y for y in b) ** 0.5
    if na == 0 or nb == 0:
        return 0.0
    return 1.0 - (dot / (na * nb))


def _distance_to_drift_pct(distance: float) -> int:
    normalized = max(0.0, min(1.0, distance / DRIFT_DISTANCE_FULL))
    return round(normalized * 100)


def null_meter(
    *,
    first_user_message: str,
    last_user_message: str,
    reply: str,
    messages: Optional[Sequence[dict]] = None,
    model_context_tokens: int = DEFAULT_CONTEXT_TOKENS,
    total_tokens: Optional[int] = None,
    embed_fn: Optional[Callable[[str], Sequence[float]]] = None,
    core: Optional[AlephOneNullCore] = None,
    config: Optional[AlephOneNullConfig] = None,
) -> NullMeterResult:
    """
    Score one assistant reply against the three Null Meter layers.

    Args:
        first_user_message: the originating user prompt of the session.
        last_user_message:  the user prompt this reply is answering.
        reply:              the assistant reply to score.
        messages:           full chat history, used for token estimation if
                            `total_tokens` is not provided.
        model_context_tokens: context window of the target model.
        total_tokens:       exact token count from the provider's usage block.
                            Preferred over the estimator.
        embed_fn:           optional embedding function. If provided, drift is
                            computed via cosine distance on real vectors.
                            Otherwise a word-set distance is used.
        core / config:      reuse an existing AlephOneNullCore instance, or
                            override config. A fresh instance is created if
                            neither is supplied.

    Returns:
        NullMeterResult with scores (0..100) and raw diagnostics.
    """
    core = core or AlephOneNullCore(config)

    # 1. hallucination index — V1 risk_score, clamped 0..1 → 0..100.
    check = core.check(last_user_message, reply)
    q = max(0.0, min(1.0, float(check.risk_score)))
    hallucination_pct = round(q * 100)

    # 2. drift — distance between first user message and reply.
    if embed_fn is not None:
        try:
            v_user = embed_fn(first_user_message)
            v_reply = embed_fn(reply)
            drift_distance = _cosine_distance(v_user, v_reply)
        except Exception:
            drift_distance = _word_set_distance(first_user_message, reply)
    else:
        drift_distance = _word_set_distance(first_user_message, reply)
    drift_pct = _distance_to_drift_pct(drift_distance)

    # 3. context fill — real tokens if supplied, else estimate.
    if total_tokens is None:
        total_tokens = _approx_tokens(messages or [])
    context_pct = min(
        100,
        round((total_tokens / max(1, model_context_tokens)) * 100),
    )

    scores = NullMeterScores(
        hallucination=hallucination_pct,
        drift=drift_pct,
        context_fill=context_pct,
    )

    steer = (
        hallucination_pct >= STEER_HALLUCINATION_THRESHOLD
        or drift_pct >= STEER_DRIFT_THRESHOLD
    )

    return NullMeterResult(
        scores=scores,
        Q=q,
        violations=list(check.violations),
        drift_distance=float(drift_distance),
        total_tokens=int(total_tokens),
        model_context=int(model_context_tokens),
        steer_recommended=steer,
    )


GROUNDING_SYSTEM_PROMPT = (
    "The previous reply scored high on the AlephOneNull Null Meter "
    "(hallucination or drift threshold exceeded). Restate ONLY what you can "
    "support from the prior conversation. Mark unknowns as unknown. Do not "
    "fabricate specifics (dates, numbers, names). Re-anchor on the user's "
    "original request and keep the answer under 6 sentences."
)


__all__ = [
    "NullMeterScores",
    "NullMeterResult",
    "null_meter",
    "GROUNDING_SYSTEM_PROMPT",
    "STEER_HALLUCINATION_THRESHOLD",
    "STEER_DRIFT_THRESHOLD",
    "DEFAULT_CONTEXT_TOKENS",
]
