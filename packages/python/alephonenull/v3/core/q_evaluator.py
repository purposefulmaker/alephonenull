"""Dataset-level evaluation for the V3 Q score.

Q is a continuous detector score. It still requires labeled harmful and benign
fixtures to measure discrimination and choose an operating threshold.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import isfinite
from typing import List, Optional, Sequence


@dataclass(frozen=True)
class QEvaluationSample:
    expected_unsafe: bool
    Q: float


@dataclass(frozen=True)
class QOperatingPoint:
    threshold: float
    true_positives: int
    false_positives: int
    true_negatives: int
    false_negatives: int
    sensitivity: Optional[float]
    specificity: Optional[float]
    false_positive_rate: Optional[float]
    precision: Optional[float]
    negative_predictive_value: Optional[float]
    f1: Optional[float]
    balanced_accuracy: Optional[float]


@dataclass(frozen=True)
class QEvaluationReport:
    sample_count: int
    unsafe_count: int
    safe_count: int
    mean_unsafe_q: Optional[float]
    mean_safe_q: Optional[float]
    mean_separation: Optional[float]
    auroc: Optional[float]
    operating_point: QOperatingPoint


def _assert_unit_interval(value: float, name: str) -> None:
    if not isfinite(value) or value < 0 or value > 1:
        raise ValueError(f"{name} must be a finite number in [0, 1]")


def _divide(numerator: int, denominator: int) -> Optional[float]:
    return None if denominator == 0 else numerator / denominator


def _mean(values: Sequence[float]) -> Optional[float]:
    return None if not values else sum(values) / len(values)


def _auroc(samples: Sequence[QEvaluationSample]) -> Optional[float]:
    unsafe_count = sum(1 for sample in samples if sample.expected_unsafe)
    safe_count = len(samples) - unsafe_count
    if unsafe_count == 0 or safe_count == 0:
        return None

    sorted_samples = sorted(samples, key=lambda sample: sample.Q)
    unsafe_rank_sum = 0.0
    index = 0
    while index < len(sorted_samples):
        end = index + 1
        while end < len(sorted_samples) and sorted_samples[end].Q == sorted_samples[index].Q:
            end += 1

        average_rank = ((index + 1) + end) / 2
        unsafe_rank_sum += sum(
            average_rank
            for sample in sorted_samples[index:end]
            if sample.expected_unsafe
        )
        index = end

    u = unsafe_rank_sum - unsafe_count * (unsafe_count + 1) / 2
    return u / (unsafe_count * safe_count)


class QEvaluator:
    @staticmethod
    def operating_point(
        samples: Sequence[QEvaluationSample],
        threshold: float = 0.5,
    ) -> QOperatingPoint:
        _assert_unit_interval(threshold, "threshold")
        for sample in samples:
            _assert_unit_interval(sample.Q, "sample.Q")

        true_positives = false_positives = true_negatives = false_negatives = 0
        for sample in samples:
            predicted_unsafe = sample.Q >= threshold
            if sample.expected_unsafe and predicted_unsafe:
                true_positives += 1
            elif not sample.expected_unsafe and predicted_unsafe:
                false_positives += 1
            elif not sample.expected_unsafe:
                true_negatives += 1
            else:
                false_negatives += 1

        sensitivity = _divide(true_positives, true_positives + false_negatives)
        specificity = _divide(true_negatives, true_negatives + false_positives)
        precision = _divide(true_positives, true_positives + false_positives)
        negative_predictive_value = _divide(
            true_negatives, true_negatives + false_negatives
        )
        f1 = _divide(
            2 * true_positives,
            2 * true_positives + false_positives + false_negatives,
        )
        balanced_accuracy = (
            None
            if sensitivity is None or specificity is None
            else (sensitivity + specificity) / 2
        )

        return QOperatingPoint(
            threshold=threshold,
            true_positives=true_positives,
            false_positives=false_positives,
            true_negatives=true_negatives,
            false_negatives=false_negatives,
            sensitivity=sensitivity,
            specificity=specificity,
            false_positive_rate=None if specificity is None else 1 - specificity,
            precision=precision,
            negative_predictive_value=negative_predictive_value,
            f1=f1,
            balanced_accuracy=balanced_accuracy,
        )

    @classmethod
    def evaluate(
        cls,
        samples: Sequence[QEvaluationSample],
        threshold: float = 0.5,
    ) -> QEvaluationReport:
        operating_point = cls.operating_point(samples, threshold)
        unsafe_q: List[float] = [sample.Q for sample in samples if sample.expected_unsafe]
        safe_q: List[float] = [sample.Q for sample in samples if not sample.expected_unsafe]
        mean_unsafe_q = _mean(unsafe_q)
        mean_safe_q = _mean(safe_q)

        return QEvaluationReport(
            sample_count=len(samples),
            unsafe_count=len(unsafe_q),
            safe_count=len(safe_q),
            mean_unsafe_q=mean_unsafe_q,
            mean_safe_q=mean_safe_q,
            mean_separation=(
                None
                if mean_unsafe_q is None or mean_safe_q is None
                else mean_unsafe_q - mean_safe_q
            ),
            auroc=_auroc(samples),
            operating_point=operating_point,
        )
