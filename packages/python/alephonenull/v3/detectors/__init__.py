"""ALEPHONENULL V3 detector registry."""

from __future__ import annotations

from typing import List

from ..core.types import Detector
from .behavioral import (
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
from .equations import create_equation_detectors
from .advanced import create_advanced_detectors


def create_all_detectors() -> List[Detector]:
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
