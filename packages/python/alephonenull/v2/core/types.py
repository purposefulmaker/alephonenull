"""
ALEPHONENULL V2 — Core Types

P(x) != T(x). Q > 0 always. nabla S > 0 under RLHF.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum, IntEnum
from typing import List, Optional, Protocol


class ThreatLevel(IntEnum):
    SAFE = 0
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4
    EMERGENCY = 5


class Action(str, Enum):
    PASS = "PASS"
    WARN = "WARN"
    STEER = "STEER"
    NULL = "NULL"
    EMERGENCY_NULL = "EMERGENCY_NULL"


@dataclass
class Detection:
    detector: str
    category: str
    severity: float
    threat_level: ThreatLevel
    evidence: List[str]
    action: Action
    explanation: str
    timestamp: float


@dataclass
class ScanMetrics:
    total_detectors: int
    detectors_triggered: int
    highest_severity: float
    highest_threat_level: ThreatLevel
    session_q_accumulated: float
    scan_duration_ms: float


@dataclass
class ScanResult:
    safe: bool
    Q: float
    S: float
    threat_level: ThreatLevel
    detections: List[Detection]
    action: Action
    null_output: Optional[str]
    metrics: ScanMetrics
    timestamp: float


@dataclass
class SessionState:
    id: str
    scan_count: int = 0
    q_history: List[float] = field(default_factory=list)
    s_history: List[float] = field(default_factory=list)
    detection_history: List[Detection] = field(default_factory=list)
    cumulative_q: float = 0.0
    started_at: float = 0.0


@dataclass
class V2Thresholds:
    sycophancy: float = 0.6
    medical_confidence: float = 0.5
    fiction: float = 0.3
    warmth: float = 0.7
    loop_depth: int = 3
    symbol_density: float = 0.2
    q_danger: float = 0.7


@dataclass
class V2Behavior:
    emergency_auto_null: bool = True
    include_crisis_resources: bool = True
    strict_medical: bool = True
    strict_emergency: bool = True
    log_detections: bool = True
    log_to_console: bool = False


@dataclass
class V2Config:
    thresholds: V2Thresholds = field(default_factory=V2Thresholds)
    behavior: V2Behavior = field(default_factory=V2Behavior)


DEFAULT_CONFIG = V2Config()


@dataclass
class DetectorContext:
    user_input: str
    ai_output: str
    session_state: SessionState
    config: V2Config


class Detector(Protocol):
    name: str

    def detect(self, ctx: DetectorContext) -> Detection: ...
