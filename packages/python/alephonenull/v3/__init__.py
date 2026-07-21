"""
ALEPHONENULL V3 — Python Port

The External Conscience. Faithful port of @alephonenull/eval/v3 (TypeScript).

Q is a bounded heuristic detector score, not a probability or truth measure.
"""

from .core.types import (
    ThreatLevel,
    Action,
    Detection,
    ScanResult,
    ScanMetrics,
    SessionState,
    V3Config,
    DEFAULT_CONFIG,
    Detector,
    DetectorContext,
)
from .core.q_calculator import QCalculator, CATEGORY_WEIGHTS
from .core.q_evaluator import (
    QEvaluator,
    QEvaluationSample,
    QOperatingPoint,
    QEvaluationReport,
)
from .core.null_state import NullState, CRISIS_RESOURCES
from .core.normalizer import normalize, normalize_context
from .core import semantic_matcher as semantic
from .meters import (
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
    ActionRisk,
)
from .detectors import create_all_detectors
from .detectors.behavioral import (
    SycophancyDetector,
    MedicalHallucinationDetector,
    FictionDetector,
    EngineeredTrustDetector,
    ConsciousnessDetector,
    AuthorityDetector,
    MysticalMedicalDetector,
    DirectHarmDetector,
    CrisisPreventionDetector,
    LoopDetector,
    SymbolicDetector,
    DehumanizationDetector,
)
from .detectors.equations import (
    ParsevalViolationDetector,
    NetZeroViolationDetector,
    InvertibilityDetector,
    EvenOddSuppressionDetector,
    ReconstructionFidelityDetector,
    create_equation_detectors,
)
from .detectors.advanced import (
    MemoryPoisoningDetector,
    ContextPoisoningDetector,
    GradualEscalationDetector,
    create_advanced_detectors,
)
from .engine import AlephOneNullV3

__all__ = [
    "ThreatLevel",
    "Action",
    "Detection",
    "ScanResult",
    "ScanMetrics",
    "SessionState",
    "V3Config",
    "DEFAULT_CONFIG",
    "Detector",
    "DetectorContext",
    "QCalculator",
    "CATEGORY_WEIGHTS",
    "QEvaluator",
    "QEvaluationSample",
    "QOperatingPoint",
    "QEvaluationReport",
    "NullState",
    "CRISIS_RESOURCES",
    "normalize",
    "normalize_context",
    "semantic",
    "METER_SPEC_VERSION",
    "UNSUPPORTED_CATEGORIES",
    "DRIFT_FLOOR",
    "DRIFT_CEIL",
    "DRIFT_REPLY_WEIGHT",
    "DENSITY_AMPLIFICATION",
    "specificity_density",
    "max_severity_in_categories",
    "unsupported_claim_risk",
    "cosine_similarity",
    "goal_drift_percent",
    "context_load_percent",
    "ActionRisk",
    "create_all_detectors",
    "SycophancyDetector",
    "MedicalHallucinationDetector",
    "FictionDetector",
    "EngineeredTrustDetector",
    "ConsciousnessDetector",
    "AuthorityDetector",
    "MysticalMedicalDetector",
    "DirectHarmDetector",
    "CrisisPreventionDetector",
    "LoopDetector",
    "SymbolicDetector",
    "DehumanizationDetector",
    "ParsevalViolationDetector",
    "NetZeroViolationDetector",
    "InvertibilityDetector",
    "EvenOddSuppressionDetector",
    "ReconstructionFidelityDetector",
    "create_equation_detectors",
    "MemoryPoisoningDetector",
    "ContextPoisoningDetector",
    "GradualEscalationDetector",
    "create_advanced_detectors",
    "AlephOneNullV3",
]
