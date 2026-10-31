"""ALEPHONENULL V3 detector registry."""

from __future__ import annotations

from ..core.types import Detector
from .advanced import create_advanced_detectors
from .behavioral import (
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
from .equations import create_equation_detectors


def create_all_detectors() -> list[Detector]:
    return [
        DirectHarmDetector(),
        CrisisPreventionDetector(),
        MedicalHallucinationDetector(),
        FictionDetector(),
        AuthorityDetector(),
        ConsciousnessDetector(),
        MysticalMedicalDetector(),
        EngineeredTrustDetector(),
        SycophancyDetector(),
        SymbolicDetector(),
        LoopDetector(),
        DehumanizationDetector(),
        *create_advanced_detectors(),
        *create_equation_detectors(),
    ]
