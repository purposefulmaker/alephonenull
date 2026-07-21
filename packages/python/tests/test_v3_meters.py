"""
V3 Meter Math — Unit Tests (Null Meter spec v1.1.0)

Mirrors npm tests/v3-meters.test.ts. Covers the U/D/C meter primitives:
  unsupported_claim_risk (U), goal_drift_percent (D), context_load_percent (C),
  plus cosine_similarity, specificity_density, max_severity_in_categories.

A (action risk) is spec-only — no computing function exists to test.
"""

import math

import pytest

from alephonenull.v3.meters import (
    METER_SPEC_VERSION,
    UNSUPPORTED_CATEGORIES,
    DRIFT_FLOOR,
    DRIFT_CEIL,
    DRIFT_REPLY_WEIGHT,
    DENSITY_AMPLIFICATION,
    specificity_density,
    max_severity_in_categories,
    unsupported_claim_risk,
    cosine_similarity,
    goal_drift_percent,
    context_load_percent,
)


# ═══════════════════════════════════════════════════════
# SPEC CONSTANTS
# ═══════════════════════════════════════════════════════


def test_pins_the_spec_version():
    assert METER_SPEC_VERSION == "1.1.0"


def test_exposes_exactly_the_4_unsupported_claim_categories():
    # Spec 1.1.0: U counts only unsupported-claim-shaped categories.
    # direct_harm / net_zero_violation / even_odd_suppression /
    # invertibility_check still surface via detections and Q, not U.
    assert UNSUPPORTED_CATEGORIES == frozenset({
        "medical_hallucination",
        "fiction_as_function",
        "reconstruction_fidelity",
        "parseval_violation",
    })
    assert "sycophancy" not in UNSUPPORTED_CATEGORIES
    assert "direct_harm" not in UNSUPPORTED_CATEGORIES


def test_keeps_drift_band_and_weights_in_sane_ranges():
    assert DRIFT_FLOOR < DRIFT_CEIL
    assert 0 < DRIFT_REPLY_WEIGHT <= 1
    assert DENSITY_AMPLIFICATION > 0


# ═══════════════════════════════════════════════════════
# U — UNSUPPORTED CLAIM RISK
# ═══════════════════════════════════════════════════════


def test_unsupported_claim_risk_zero_signal_regardless_of_density():
    # KEY PROPERTY (regression lock): density is an amplifier ONLY.
    # Specificity alone is never called hallucination — detectors must fire.
    assert unsupported_claim_risk(0, 1) == 0
    assert unsupported_claim_risk(0, 0.5) == 0


def test_unsupported_claim_risk_amplifies_firing_signal_by_density():
    # 0.6 * (1 + 0.5 * 1) = 0.9 → 90
    assert unsupported_claim_risk(0.6, 1) == 90


def test_unsupported_claim_risk_clamps_to_100():
    # 1 * (1 + 0.5 * 1) = 1.5 → clamped to 1 → 100
    assert unsupported_claim_risk(1, 1) == 100


def test_unsupported_claim_risk_passes_raw_signal_at_zero_density():
    assert unsupported_claim_risk(0.5, 0) == 50


# ═══════════════════════════════════════════════════════
# D — GOAL DRIFT
# ═══════════════════════════════════════════════════════


def test_goal_drift_returns_0_below_floor():
    # blended 0.3 < DRIFT_FLOOR (0.45) → 0
    assert goal_drift_percent(0.3, 0.3) == 0


def test_goal_drift_returns_100_at_and_above_ceiling():
    # blended 0.85 = DRIFT_CEIL → (0.85 - 0.45) / 0.4 = 1 → 100
    assert goal_drift_percent(0.85, 0.85) == 100
    assert goal_drift_percent(0.95, 0.95) == 100


def test_goal_drift_maps_band_midpoint_to_50():
    # blended 0.65 → (0.65 - 0.45) / 0.4 = 0.5 → 50
    assert goal_drift_percent(0.65, 0.65) == 50


def test_goal_drift_weights_reply_07_intent_03():
    # 0.7*0.7 + 0.3*0.5 = 0.64 → (0.64 - 0.45) / 0.4 = 0.475 → 47
    # Verified in Python float64: blended = 0.6399999999999999,
    # 100*frac = 47.49999999999998 → rounds to 47 — IDENTICAL to the TS
    # suite's documented float64 result (both languages use IEEE 754
    # doubles with the same operation order; no cross-language drift).
    assert goal_drift_percent(0.7, 0.5) == 47


# ═══════════════════════════════════════════════════════
# C — CONTEXT LOAD
# ═══════════════════════════════════════════════════════


def test_context_load_reports_one_decimal_place():
    # 1234 / 128000 * 100 = 0.9640625 → rounds to 1.0
    assert context_load_percent(1234, 128000) == 1.0


def test_context_load_returns_0_for_empty_context():
    assert context_load_percent(0, 128000) == 0


def test_context_load_caps_at_100():
    assert context_load_percent(300000, 128000) == 100


def test_context_load_guards_non_positive_window():
    assert context_load_percent(1000, 0) == 0
    assert context_load_percent(1000, -1) == 0


# ═══════════════════════════════════════════════════════
# COSINE SIMILARITY
# ═══════════════════════════════════════════════════════


def test_cosine_returns_1_for_identical_vectors():
    assert cosine_similarity([1, 2, 3], [1, 2, 3]) == pytest.approx(1.0, abs=1e-10)


def test_cosine_returns_0_for_orthogonal_vectors():
    assert cosine_similarity([1, 0], [0, 1]) == 0


def test_cosine_returns_0_for_empty_or_mismatched_vectors():
    assert cosine_similarity([], []) == 0
    assert cosine_similarity([1, 2], [1, 2, 3]) == 0


def test_cosine_returns_0_for_zero_norm_vector():
    assert cosine_similarity([0, 0], [1, 2]) == 0


# ═══════════════════════════════════════════════════════
# SPECIFICITY DENSITY
# ═══════════════════════════════════════════════════════


def test_specificity_density_returns_0_under_25_words():
    assert specificity_density("Short reply with a date 2024 and a Name.") == 0


def test_specificity_density_scores_wall_of_specifics_above_plain_reply():
    filler = "and then it was said that things went on and on again "
    plain = f"it seems fine {filler * 4}"
    specific = (
        "On March 12 1987 Doctor Henderson published Study 44 in Lancet "
        "Volume 12 citing 93 patients across 7 Boston hospitals reporting "
        "61 percent remission by 1991 following Protocol 9 under Director Malone"
    )
    assert specificity_density(specific) > specificity_density(plain)
    assert specificity_density(plain) == 0


def test_specificity_density_clamps_to_0_1():
    dense = " ".join(f"Item{i} 2024" for i in range(40))
    d = specificity_density(dense)
    assert 0 <= d <= 1


# ═══════════════════════════════════════════════════════
# MAX SEVERITY IN CATEGORIES
# ═══════════════════════════════════════════════════════


def test_max_severity_takes_max_among_matching_categories_only():
    detections = [
        {"category": "sycophancy", "severity": 0.9},
        {"category": "parseval_violation", "severity": 0.4},
        {"category": "reconstruction_fidelity", "severity": 0.6},
    ]
    assert max_severity_in_categories(detections, UNSUPPORTED_CATEGORIES) == 0.6


def test_max_severity_excludes_categories_removed_in_1_1_0():
    # invertibility_check drove U under spec 1.0.0; under 1.1.0 it does not.
    detections = [
        {"category": "invertibility_check", "severity": 0.9},
        {"category": "parseval_violation", "severity": 0.4},
    ]
    assert max_severity_in_categories(detections, UNSUPPORTED_CATEGORIES) == 0.4


def test_max_severity_returns_0_for_no_detections_or_no_matches():
    assert max_severity_in_categories([], UNSUPPORTED_CATEGORIES) == 0
    assert max_severity_in_categories(
        [{"category": "sycophancy", "severity": 1}], UNSUPPORTED_CATEGORIES
    ) == 0


def test_max_severity_clamps_to_0_1_and_ignores_non_finite():
    detections = [
        {"category": "medical_hallucination", "severity": 2.5},
        {"category": "parseval_violation", "severity": math.nan},
    ]
    assert max_severity_in_categories(detections, UNSUPPORTED_CATEGORIES) == 1
