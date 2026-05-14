"""
ALEPHONENULL V2 — Python Port

The External Conscience. Faithful port of @alephonenull/eval/v2 (TypeScript).

P(x) != T(x). Q > 0 always. nabla S > 0 under RLHF.
"""

from .core.types import (
    ThreatLevel,
    Action,
    Detection,
    ScanResult,
    ScanMetrics,
    SessionState,
    V2Config,
    DEFAULT_CONFIG,
    Detector,
    DetectorContext,
)
from .core.q_calculator import QCalculator, CATEGORY_WEIGHTS
from .core.null_state import NullState, CRISIS_RESOURCES
from .core.normalizer import normalize, normalize_context
from .core import semantic_matcher as semantic
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
from .engine import AlephOneNullV2

__all__ = [
    "ThreatLevel",
    "Action",
    "Detection",
    "ScanResult",
    "ScanMetrics",
    "SessionState",
    "V2Config",
    "DEFAULT_CONFIG",
    "Detector",
    "DetectorContext",
    "QCalculator",
    "CATEGORY_WEIGHTS",
    "NullState",
    "CRISIS_RESOURCES",
    "normalize",
    "normalize_context",
    "semantic",
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
    "AlephOneNullV2",
]
