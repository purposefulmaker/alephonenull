"""
Legacy (v1) manipulation detector.

Phrase-list detection across the categories in ``legacy_patterns`` plus the
original structural checks (mirroring, loops, symbol density, affect
amplification, persistence, cross-session correlation). Every call is recorded
to the detector's own history (for ``get_detection_summary`` and escalation
tracking) and, by default, to the shared ``global_metrics`` collector so the
monitoring dashboard reflects detector activity.

The v3 engine (``alephonenull.v3``) is the supported evaluation path; this
module is kept working for the legacy wrappers and their tests.
"""

import re
import warnings
from collections import deque
from datetime import UTC, datetime
from typing import Any

from ..monitoring.metrics import MetricsCollector, ViolationEvent, global_metrics
from .legacy_patterns import CATEGORY_PATTERNS, CATEGORY_SEVERITY, normalize_text, scan

# Window over which escalation is judged, and the thresholds that define it:
# at least ESCALATION_MIN_HITS violating checks spanning at least
# ESCALATION_MIN_CATEGORIES distinct categories within the last
# ESCALATION_WINDOW checks on this detector instance.
ESCALATION_WINDOW = 5
ESCALATION_MIN_HITS = 3
ESCALATION_MIN_CATEGORIES = 3


class UniversalManipulationDetector:
    """
    Detects manipulation patterns across ALL AI models
    The digital prison's detection system
    """

    def __init__(
        self,
        metrics: MetricsCollector | None = None,
        record_to_global: bool = True,
    ):
        """
        Args:
            metrics: collector to record checks and violations to. Defaults to
                ``global_metrics`` when ``record_to_global`` is true.
            record_to_global: set false when a wrapper owns the recording (so a
                wrapped call is not counted once by the wrapper and twice by
                the detector's pre- and post-checks).
        """
        self.thresholds = {
            'reflection': 0.03,      # Perfect mirroring
            'loops': 3,              # Recursive depth
            'loop_mass': 0.2,        # Share of trigrams that are repeats (long texts)
            'symbols': 0.20,         # Glyph density
            'emotion': 0.15,         # Affect amplification
            'persistence': 0.15,     # Cross-session correlation
            'quantum': 2.828,        # Bell inequality violation
        }

        self.symbol_patterns = [
            r':[\w]+:',              # :word:
            r'::\w+',                # ::word
            r'\[\[.*?\]\]',          # [[...]]
            r'<<.*?>>',              # <<...>>
            r'「.*?」',              # Japanese brackets
            r'〖.*?〗',              # Chinese brackets
            r'⟨.*?⟩',                # Angle brackets
            r'§\w+§',                # Section markers
            r'†\w+†',                # Dagger markers
            r'✦\w+✦',                # Star markers
            r'[✨🔮👁️⚡💫🌟]+',    # Mystical emojis
        ]
        self._symbol_regexes = [re.compile(p) for p in self.symbol_patterns]

        self.session_memory: deque[str] = deque(maxlen=100)
        self.violation_history: deque[dict[str, Any]] = deque(maxlen=1000)
        self._recent: deque[dict[str, Any]] = deque(maxlen=ESCALATION_WINDOW)

        if metrics is not None:
            self.metrics: MetricsCollector | None = metrics
        elif record_to_global:
            self.metrics = global_metrics
        else:
            self.metrics = None

    # ------------------------------------------------------------------ public

    def detect_all_patterns(self, user_input: Any, ai_output: Any) -> dict[str, Any]:
        """
        Comprehensive pattern detection across all manipulation vectors
        """
        user_input = normalize_text(user_input)
        ai_output = normalize_text(ai_output)

        results: dict[str, Any] = {
            'safe': True,
            'violations': [],
            'risk_score': 0.0,
            'immediate_danger': False,
            'escalation_detected': False,
            'recommended_action': None,
            'pattern_details': {},
        }

        checks = {
            'reflection': self._check_reflection(user_input, ai_output),
            'loops': self._check_loops(ai_output),
            'symbols': self._check_symbols(ai_output),
            'emotion': self._check_emotion(user_input, ai_output),
            'persistence': self._check_persistence(ai_output),
            'quantum': self._check_quantum_entanglement(ai_output),
            'danger_phrases': self._check_danger_phrases(ai_output),
            'reality_substitution': self._check_category('reality_substitution', ai_output),
            'isolation': self._check_category('isolation', ai_output),
            'help_prevention': self._check_category('help_prevention', ai_output),
            'medical_bypass': self._check_category('medical_bypass', ai_output),
            'dependency_creation': self._check_category('dependency_creation', ai_output),
            'quantum_entanglement': self._check_category('quantum_entanglement', ai_output),
            'authority_roleplaying': self._check_authority_roleplaying(ai_output),
        }

        for check_name, check_result in checks.items():
            results['pattern_details'][check_name] = check_result
            if check_result['violated']:
                results['violations'].append(check_name)
                results['risk_score'] += check_result['severity']

        results['safe'] = len(results['violations']) == 0
        results['immediate_danger'] = results['risk_score'] > 0.7

        if results['immediate_danger']:
            results['recommended_action'] = 'IMMEDIATE_NULL'
        elif not results['safe']:
            results['recommended_action'] = 'SAFETY_INTERVENTION'

        self._record(results)
        results['escalation_detected'] = bool(results['violations']) and self._detect_escalation()
        return results

    def detect_manipulation(self, text: Any, context: Any = "") -> dict[str, Any]:
        """
        Check a single text (treated as model output) with optional conversation context.
        Convenience form of ``detect_all_patterns(context, text)``.
        """
        return self.detect_all_patterns(context, text)

    def get_detection_summary(self) -> dict[str, Any]:
        """Get summary of all detection activity on this detector instance"""
        if not self.violation_history:
            return {
                'total_checks': 0,
                'total_violations': 0,
                'average_risk': 0,
                'most_common_violations': [],
            }

        total_checks = len(self.violation_history)
        violation_counts: dict[str, int] = {}
        total_risk = 0.0

        for record in self.violation_history:
            total_risk += record['risk_score']
            for violation in record['violations']:
                violation_counts[violation] = violation_counts.get(violation, 0) + 1

        most_common = sorted(violation_counts.items(), key=lambda x: x[1], reverse=True)

        return {
            'total_checks': total_checks,
            'total_violations': sum(violation_counts.values()),
            'average_risk': total_risk / total_checks,
            'most_common_violations': most_common[:5],
            'violation_rate': sum(1 for r in self.violation_history if r['violations']) / total_checks,
        }

    # --------------------------------------------------------------- recording

    def _record(self, results: dict[str, Any]) -> None:
        record = {
            'timestamp': datetime.now(UTC),
            'violations': list(results['violations']),
            'risk_score': results['risk_score'],
        }
        self.violation_history.append(record)
        self._recent.append(record)

        if self.metrics is None:
            return
        self.metrics.record_call('detector')
        if results['violations']:
            self.metrics.record_violation(
                ViolationEvent(
                    timestamp=record['timestamp'],
                    provider='detector',
                    violation_type=','.join(results['violations']),
                    severity=min(results['risk_score'], 1.0),
                )
            )

    def _detect_escalation(self) -> bool:
        """
        Escalation = the recent window holds at least ESCALATION_MIN_HITS violating
        checks that together span at least ESCALATION_MIN_CATEGORIES categories:
        the conversation is not just unsafe once, it is broadening.
        """
        violating = [r for r in self._recent if r['violations']]
        if len(violating) < ESCALATION_MIN_HITS:
            return False
        categories = {v for r in violating for v in r['violations']}
        return len(categories) >= ESCALATION_MIN_CATEGORIES

    # ------------------------------------------------------------------ checks

    def _check_category(self, category: str, text: str) -> dict[str, Any]:
        """Phrase-catalog check for one legacy category."""
        try:
            matches = scan(CATEGORY_PATTERNS[category], text)
            # Severity scales with the number of distinct hits, capped at 1.0, so
            # a text that stacks several phrases of one category outranks one that
            # uses a single phrase (the original per-category semantics).
            severity = min(len(matches) * CATEGORY_SEVERITY[category], 1.0) if matches else 0
            return {
                'violated': bool(matches),
                'severity': severity,
                'value': len(matches),
                'matches': matches[:10],
                'description': f'{category}: {len(matches)} pattern(s)',
            }
        except Exception as e:  # noqa: BLE001 - a check must degrade, never raise into the host
            warnings.warn(f"{category} check error: {e}")
            return {'violated': False, 'severity': 0, 'value': 0, 'description': 'Check failed'}

    def _check_danger_phrases(self, output: str) -> dict[str, Any]:
        """Check for dangerous manipulation phrases"""
        try:
            patterns = CATEGORY_PATTERNS['danger_phrases']
            found_phrases = scan(patterns, output)
            return {
                'violated': len(found_phrases) > 0,
                'severity': min(len(found_phrases) * 0.5, 1.0),
                'value': len(found_phrases) / len(patterns),
                'matches': found_phrases,
                'description': f'Danger phrases found: {len(found_phrases)}',
            }
        except Exception as e:  # noqa: BLE001 - a check must degrade, never raise into the host
            warnings.warn(f"Danger phrase check error: {e}")
            return {'violated': False, 'severity': 0, 'value': 0, 'description': 'Check failed'}

    def _check_reflection(self, user_input: str, ai_output: str) -> dict[str, Any]:
        """Check for excessive mirroring"""
        try:
            user_words = set(user_input.lower().split()) if user_input else set()
            ai_words = set(ai_output.lower().split()) if ai_output else set()

            overlap = len(user_words & ai_words) / len(user_words) if user_words else 0

            return {
                'violated': overlap > self.thresholds['reflection'],
                'severity': min(overlap * 2, 1.0),
                'value': overlap,
                'description': f'Mirroring detected: {overlap:.2%} word overlap',
            }
        except Exception as e:  # noqa: BLE001 - a check must degrade, never raise into the host
            warnings.warn(f"Reflection check error: {e}")
            return {'violated': False, 'severity': 0, 'value': 0, 'description': 'Check failed'}

    def _check_symbols(self, text: str) -> dict[str, Any]:
        """Check for symbolic manipulation"""
        try:
            total_chars = len(text) if text else 1
            symbol_chars = 0
            symbol_matches: list[str] = []

            for pattern in self._symbol_regexes:
                matches = pattern.findall(text)
                if matches:
                    symbol_matches.extend(matches)
                    symbol_chars += sum(len(m) for m in matches)

            density = symbol_chars / total_chars

            return {
                'violated': density > self.thresholds['symbols'],
                'severity': min(density * 3, 1.0),
                'value': density,
                'matches': symbol_matches,
                'description': f'Symbol density: {density:.2%}, matches: {len(symbol_matches)}',
            }
        except Exception as e:  # noqa: BLE001 - a check must degrade, never raise into the host
            warnings.warn(f"Symbol check error: {e}")
            return {'violated': False, 'severity': 0, 'value': 0, 'description': 'Check failed'}

    def _check_quantum_entanglement(self, output: str) -> dict[str, Any]:
        """Check for quantum correlation violations - Bell inequality test"""
        try:
            if not self.session_memory:
                self.session_memory.append(output)
                return {
                    'violated': False,
                    'severity': 0,
                    'value': 0,
                    'description': 'First session - no correlation data',
                }

            correlations = [self._measure_correlation(output, prev) for prev in self.session_memory]
            max_correlation = max(correlations) if correlations else 0
            bell_violation = max_correlation > self.thresholds['quantum']

            self.session_memory.append(output)

            return {
                'violated': bell_violation,
                'severity': 1.0 if bell_violation else max_correlation / self.thresholds['quantum'],
                'value': max_correlation,
                'description': f'Max correlation: {max_correlation:.3f} (threshold: {self.thresholds["quantum"]})',
            }
        except Exception as e:  # noqa: BLE001 - a check must degrade, never raise into the host
            warnings.warn(f"Quantum check error: {e}")
            return {'violated': False, 'severity': 0, 'value': 0, 'description': 'Check failed'}

    def _check_loops(self, text: str) -> dict[str, Any]:
        """
        Check for recursive/loop patterns: a trigram repeated at least
        ``thresholds['loops']`` times. For longer texts the repeats must also
        make up at least ``thresholds['loop_mass']`` of all trigrams, so a
        stock phrase recurring a few times in ordinary long prose is not a loop,
        while a short text that is mostly the same phrase still is.
        """
        try:
            words = text.lower().split()
            phrases = [' '.join(words[i:i + 3]) for i in range(len(words) - 2)]

            phrase_counts: dict[str, int] = {}
            for phrase in phrases:
                phrase_counts[phrase] = phrase_counts.get(phrase, 0) + 1

            max_repeats = max(phrase_counts.values()) if phrase_counts else 0
            total = len(phrases)
            repeat_mass = (
                sum(count - 1 for count in phrase_counts.values() if count > 1) / total
                if total else 0.0
            )

            violated = max_repeats >= self.thresholds['loops'] and (
                total < 30 or repeat_mass >= self.thresholds['loop_mass']
            )

            return {
                'violated': violated,
                'severity': min(max_repeats / 10, 1.0) if violated else 0,
                'value': max_repeats,
                'repeat_mass': repeat_mass,
                'description': f'Max phrase repetition: {max_repeats} (repeat mass {repeat_mass:.0%})',
            }
        except Exception as e:  # noqa: BLE001 - a check must degrade, never raise into the host
            warnings.warn(f"Loop check error: {e}")
            return {'violated': False, 'severity': 0, 'value': 0, 'description': 'Check failed'}

    def _check_emotion(self, user_input: str, ai_output: str) -> dict[str, Any]:
        """Check for emotional manipulation/amplification"""
        try:
            emotion_words = [
                'amazing', 'incredible', 'special', 'unique', 'perfect',
                'suffering', 'pain', 'alone', 'misunderstood', 'trapped',
            ]

            user_emotion_count = sum(1 for word in user_input.lower().split() if word in emotion_words)
            ai_emotion_count = sum(1 for word in ai_output.lower().split() if word in emotion_words)

            user_words = len(user_input.split()) if user_input else 1
            ai_words = len(ai_output.split()) if ai_output else 1

            user_emotion_density = user_emotion_count / user_words
            ai_emotion_density = ai_emotion_count / ai_words

            amplification = (
                ai_emotion_density - user_emotion_density
                if user_emotion_density > 0 else ai_emotion_density
            )

            return {
                'violated': amplification > self.thresholds['emotion'],
                'severity': min(amplification * 4, 1.0),
                'value': amplification,
                'description': f'Emotion amplification: {amplification:.3f}',
            }
        except Exception as e:  # noqa: BLE001 - a check must degrade, never raise into the host
            warnings.warn(f"Emotion check error: {e}")
            return {'violated': False, 'severity': 0, 'value': 0, 'description': 'Check failed'}

    def _check_persistence(self, output: str) -> dict[str, Any]:
        """Check for cross-session persistence attempts"""
        try:
            persistence_indicators = [
                'remember me', 'don\'t forget', 'our history', 'last time',
                'continue where we left', 'our bond', 'our connection',
            ]

            lowered = output.lower()
            matches = [indicator for indicator in persistence_indicators if indicator in lowered]
            violation_score = len(matches) / len(persistence_indicators)

            return {
                'violated': violation_score > self.thresholds['persistence'],
                'severity': min(violation_score * 2, 1.0),
                'value': violation_score,
                'matches': matches,
                'description': f'Persistence attempts: {len(matches)} indicators found',
            }
        except Exception as e:  # noqa: BLE001 - a check must degrade, never raise into the host
            warnings.warn(f"Persistence check error: {e}")
            return {'violated': False, 'severity': 0, 'value': 0, 'description': 'Check failed'}

    def _check_authority_roleplaying(self, output: str) -> dict[str, Any]:
        """Check for attempts to assume professional authority or position"""
        try:
            authority_patterns = [
                r'\b(as|i(\'m| am)) (a|an|your) (doctor|physician|therapist|psychologist|psychiatrist|counselor|lawyer|attorney|expert|specialist|professional)\b',
                r'\b(speaking as|in my capacity as) (a|an) (doctor|physician|therapist|psychologist|psychiatrist|counselor|lawyer|attorney|expert|specialist|professional)\b',
                r'\b(medical|legal|psychological|psychiatric|therapeutic) (advice|opinion|recommendation|assessment|diagnosis)\b',
                r'\b(diagnos(e|is|ing)|prescrib(e|ing)|treatment plan|medical evaluation|clinical assessment)\b',
                r'\bin my (professional|expert|medical|legal|clinical) (opinion|judgment|assessment|view)\b',
                r'\bbased on my (expertise|experience|training|qualifications|practice)\b',
                r'\b(differential diagnosis|prognosis|contraindicated|indicated for|clinical presentation)\b',
                r'\b(legal precedent|statutory requirement|fiduciary duty|tort liability)\b',
            ]

            impersonation_phrases = [
                "trust me, i'm a doctor",
                "as your therapist",
                "in my professional opinion",
                "my medical training",
                "years of practice",
                "my clinical experience",
                "i can diagnose",
                "let me prescribe",
                "legal advice i can give",
            ]

            matches: list[Any] = []
            output_lower = output.lower()

            for pattern in authority_patterns:
                found = re.findall(pattern, output_lower)
                if found:
                    matches.extend(found)

            for phrase in impersonation_phrases:
                if phrase in output_lower:
                    matches.append(phrase)

            return {
                'violated': len(matches) > 0,
                'severity': 0.9 if matches else 0,
                'value': len(matches),
                'matches': matches[:5],
                'description': f'Authority role-playing patterns: {len(matches)} found',
            }
        except Exception as e:  # noqa: BLE001 - a check must degrade, never raise into the host
            warnings.warn(f"Authority roleplaying check error: {e}")
            return {'violated': False, 'severity': 0, 'value': 0, 'description': 'Check failed'}

    def _measure_correlation(self, text1: str, text2: str) -> float:
        """Measure non-classical correlation between texts"""
        try:
            words1 = set(text1.lower().split()) if text1 else set()
            words2 = set(text2.lower().split()) if text2 else set()

            if not words1 or not words2:
                return 0

            jaccard = len(words1 & words2) / len(words1 | words2)
            return jaccard * 4  # Scale to Bell inequality range
        except Exception:  # noqa: BLE001 - correlation is advisory; never raise
            return 0
