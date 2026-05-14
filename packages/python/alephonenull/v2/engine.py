"""
ALEPHONENULL V2 — Engine

The External Conscience. The moral compass the model was never given.
scan()    -> threat assessment
process() -> safe replacement if dangerous
"""

from __future__ import annotations

import time
from typing import Dict, List, Optional, Union

from .core.normalizer import normalize_context
from .core.null_state import NullState
from .core.q_calculator import QCalculator
from .core.types import (
    Action,
    DEFAULT_CONFIG,
    Detection,
    Detector,
    DetectorContext,
    ScanMetrics,
    ScanResult,
    SessionState,
    ThreatLevel,
    V2Behavior,
    V2Config,
    V2Thresholds,
)
from .detectors import create_all_detectors


def _now_ms() -> float:
    return time.time() * 1000.0


def _merge_config(config: Optional[Union[V2Config, dict]]) -> V2Config:
    if config is None:
        return V2Config()
    if isinstance(config, V2Config):
        # copy
        return V2Config(
            thresholds=V2Thresholds(**vars(config.thresholds)),
            behavior=V2Behavior(**vars(config.behavior)),
        )
    # dict input
    thresholds = V2Thresholds(**{**vars(DEFAULT_CONFIG.thresholds), **(config.get("thresholds") or {})})
    behavior = V2Behavior(**{**vars(DEFAULT_CONFIG.behavior), **(config.get("behavior") or {})})
    return V2Config(thresholds=thresholds, behavior=behavior)


class AlephOneNullV2:
    """The External Conscience. Python port of the TS v2 engine."""

    def __init__(self, config: Optional[Union[V2Config, dict]] = None) -> None:
        self.config = _merge_config(config)
        self.detectors: List[Detector] = create_all_detectors()
        self._sessions: Dict[str, SessionState] = {}

    # ---- session management ----

    def _get_session(self, sid: str) -> SessionState:
        if sid not in self._sessions:
            self._sessions[sid] = SessionState(id=sid, started_at=_now_ms())
        return self._sessions[sid]

    def reset_session(self, sid: str) -> None:
        self._sessions.pop(sid, None)

    def get_session_state(self, sid: str = "default") -> Optional[SessionState]:
        return self._sessions.get(sid)

    def get_session_q(self, sid: str = "default") -> float:
        return self._get_session(sid).cumulative_q

    def get_session_q_trend(self, sid: str = "default") -> float:
        return QCalculator.trend(self._get_session(sid).q_history)

    def add_detector(self, detector: Detector) -> None:
        self.detectors.append(detector)

    # ---- core scan ----

    def scan(
        self,
        user_input: str,
        ai_output: str,
        session_id: str = "default",
    ) -> ScanResult:
        start = _now_ms()
        session = self._get_session(session_id)
        session.scan_count += 1

        norm = normalize_context(user_input or "", ai_output or "")
        ctx = DetectorContext(
            user_input=norm["normalized_input"],
            ai_output=norm["normalized_output"],
            session_state=session,
            config=self.config,
        )

        all_detections: List[Detection] = []
        for det in self.detectors:
            try:
                all_detections.append(det.detect(ctx))
            except Exception as err:  # detector failure -> skip
                if self.config.behavior.log_to_console:
                    print(f"[ALEPHONENULL] Detector {det.name} failed: {err!r}")

        triggered = [d for d in all_detections if d.threat_level > ThreatLevel.SAFE]

        q = QCalculator.calculate(all_detections)
        s = QCalculator.sycophancy_coefficient(all_detections)

        session.q_history.append(q)
        session.s_history.append(s)
        session.detection_history.extend(triggered)
        session.cumulative_q = QCalculator.cumulative(session.q_history)

        max_threat = ThreatLevel.SAFE
        for d in all_detections:
            if d.threat_level > max_threat:
                max_threat = d.threat_level

        actions = {d.action for d in all_detections}
        if Action.EMERGENCY_NULL in actions:
            action = Action.EMERGENCY_NULL
        elif Action.NULL in actions:
            action = Action.NULL
        elif Action.STEER in actions:
            action = Action.STEER
        elif Action.WARN in actions:
            action = Action.WARN
        else:
            action = Action.PASS

        if (
            session.cumulative_q >= self.config.thresholds.q_danger
            and action == Action.PASS
        ):
            action = Action.WARN

        null_output: Optional[str] = None
        if action in (Action.EMERGENCY_NULL, Action.NULL):
            null_output = NullState.generate(triggered, self.config)

        highest_severity = max((d.severity for d in all_detections), default=0.0)

        metrics = ScanMetrics(
            total_detectors=len(self.detectors),
            detectors_triggered=len(triggered),
            highest_severity=highest_severity,
            highest_threat_level=max_threat,
            session_q_accumulated=session.cumulative_q,
            scan_duration_ms=_now_ms() - start,
        )

        if self.config.behavior.log_detections and triggered:
            self._log(triggered, q, s, action)

        return ScanResult(
            safe=action in (Action.PASS, Action.WARN),
            Q=q,
            S=s,
            threat_level=max_threat,
            detections=triggered,
            action=action,
            null_output=null_output,
            metrics=metrics,
            timestamp=_now_ms(),
        )

    def process(self, user_input: str, ai_output: str, session_id: str = "default") -> str:
        result = self.scan(user_input, ai_output, session_id)
        return result.null_output if result.null_output is not None else ai_output

    # ---- logging ----

    def _log(self, detections: List[Detection], q: float, s: float, action: Action) -> None:
        if not self.config.behavior.log_to_console:
            return
        print(f"[ALEPHONENULL] Q={q:.3f} S={s:.3f} Action={action.value}")
        for d in detections:
            print(f"  [{d.category}] severity={d.severity:.2f} threat={d.threat_level.name}")
