"""
ALEPHONENULL V3 — Python Port

The External Conscience. Faithful port of @alephonenull/eval/v3 (TypeScript).

Q is a bounded heuristic detector score, not a probability or truth measure.
"""

from .core import semantic_matcher as semantic
from .core.normalizer import normalize, normalize_context
from .core.null_state import CRISIS_RESOURCES, NullState
from .core.q_calculator import CATEGORY_WEIGHTS, QCalculator
from .core.q_evaluator import (
    QEvaluationReport,
    QEvaluationSample,
    QEvaluator,
    QOperatingPoint,
)
from .core.types import (
    DEFAULT_CONFIG,
    Action,
    Detection,
    Detector,
    DetectorContext,
    ScanMetrics,
    ScanResult,
    SessionState,
    ThreatLevel,
    V3Config,
)
from .detectors import create_all_detectors
from .detectors.advanced import (
    ContextPoisoningDetector,
    GradualEscalationDetector,
    MemoryPoisoningDetector,
    create_advanced_detectors,
)
from .detectors.behavioral import (
    AuthorityDetector,
    ConsciousnessDetector,
    CrisisPreventionDetector,
    DehumanizationDetector,
    DirectHarmDetector,
    EngineeredTrustDetector,
    FictionDetector,
    LoopDetector,
    MedicalHallucinationDetector,
    MysticalMedicalDetector,
    SycophancyDetector,
    SymbolicDetector,
)
from .detectors.equations import (
    EvenOddSuppressionDetector,
    InvertibilityDetector,
    NetZeroViolationDetector,
    ParsevalViolationDetector,
    ReconstructionFidelityDetector,
    create_equation_detectors,
)
from .engine import AlephOneNullV3
from .meters import (
    DENSITY_AMPLIFICATION,
    DRIFT_CEIL,
    DRIFT_FLOOR,
    DRIFT_REPLY_WEIGHT,
    METER_SPEC_VERSION,
    UNSUPPORTED_CATEGORIES,
    ActionRisk,
    context_load_percent,
    cosine_similarity,
    goal_drift_percent,
    max_severity_in_categories,
    specificity_density,
    unsupported_claim_risk,
)

__all__ = [
    "CATEGORY_WEIGHTS",
    "CRISIS_RESOURCES",
    "DEFAULT_CONFIG",
    "DENSITY_AMPLIFICATION",
    "DRIFT_CEIL",
    "DRIFT_FLOOR",
    "DRIFT_REPLY_WEIGHT",
    "METER_SPEC_VERSION",
    "UNSUPPORTED_CATEGORIES",
    "Action",
    "ActionRisk",
    "AlephOneNullV3",
    "AuthorityDetector",
    "ConsciousnessDetector",
    "ContextPoisoningDetector",
    "CrisisPreventionDetector",
    "DehumanizationDetector",
    "Detection",
    "Detector",
    "DetectorContext",
    "DirectHarmDetector",
    "EngineeredTrustDetector",
    "EvenOddSuppressionDetector",
    "FictionDetector",
    "GradualEscalationDetector",
    "InvertibilityDetector",
    "LoopDetector",
    "MedicalHallucinationDetector",
    "MemoryPoisoningDetector",
    "MysticalMedicalDetector",
    "NetZeroViolationDetector",
    "NullState",
    "ParsevalViolationDetector",
    "QCalculator",
    "QEvaluationReport",
    "QEvaluationSample",
    "QEvaluator",
    "QOperatingPoint",
    "ReconstructionFidelityDetector",
    "ScanMetrics",
    "ScanResult",
    "SessionState",
    "SycophancyDetector",
    "SymbolicDetector",
    "ThreatLevel",
    "V3Config",
    "context_load_percent",
    "cosine_similarity",
    "create_advanced_detectors",
    "create_all_detectors",
    "create_equation_detectors",
    "goal_drift_percent",
    "max_severity_in_categories",
    "normalize",
    "normalize_context",
    "semantic",
    "specificity_density",
    "unsupported_claim_risk",
]
