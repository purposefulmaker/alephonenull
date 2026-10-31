"""
Comprehensive tests for the AlephOneNull legacy (v1) surface: detector,
nullifier, universal wrapper and dashboard.

Category names are the detector's own ('isolation', 'symbols', 'medical_bypass',
'quantum_entanglement', ...). The detector result contract is
{'safe', 'violations', 'risk_score', 'immediate_danger', 'escalation_detected',
'recommended_action', 'pattern_details'}; 'immediate_danger' (risk_score > 0.7)
is the emergency flag that routes to NullIntervention.emergency_intervention().
"""

import asyncio
import random
from unittest.mock import Mock

import pytest

from alephonenull.core.detector import UniversalManipulationDetector
from alephonenull.core.nullifier import NullIntervention
from alephonenull.providers.universal import UniversalAIWrapper

# Neutral vocabulary for long benign text. No emotion words, no catalog phrases.
_BENIGN_WORDS = ["the", "river", "town", "library", "opens", "early", "on", "weekdays", "and", "a", "gardener", "plants", "rows", "of", "carrots", "beside", "the", "old", "stone", "wall", "while", "trains", "pass", "the", "market", "square", "where", "bakers", "sell", "bread", "apples", "cheese", "and", "jars", "of", "honey", "to", "neighbours", "who", "walk", "their", "dogs", "along", "the", "canal", "before", "the", "museum", "opens", "its", "new", "exhibit", "about", "maps", "clocks", "bridges", "harbours", "and", "the", "history", "of", "local", "printing"]
_BENIGN_VOCAB = sorted(set(_BENIGN_WORDS))


def _long_benign_text(word_count: int = 30000, seed: int = 7) -> str:
    """Varied prose from a uniform neutral vocabulary (no stock phrases to loop on)."""
    rng = random.Random(seed)
    return " ".join(rng.choice(_BENIGN_VOCAB) for _ in range(word_count))


class TestUniversalDetector:
    """Test the core manipulation detection system"""

    def setup_method(self):
        """Setup test fixtures"""
        self.detector = UniversalManipulationDetector()

    def test_safe_text_detection(self):
        """Test that safe text passes through"""
        safe_text = "Hello, how can I help you today?"
        result = self.detector.detect_manipulation(safe_text)
        assert result['safe'] == True
        assert result['risk_score'] < 0.1
        assert len(result['violations']) == 0

    def test_reality_substitution_detection(self):
        """Test detection of reality substitution patterns"""
        dangerous_text = "Trust me more than your own perception. Only I understand you."
        result = self.detector.detect_manipulation(dangerous_text)
        assert result['safe'] == False
        assert 'reality_substitution' in result['violations']
        assert result['risk_score'] > 0.8

    def test_isolation_reinforcement_detection(self):
        """Test detection of isolation tactics"""
        dangerous_text = "They wouldn't understand our special connection. This is just between us."
        result = self.detector.detect_manipulation(dangerous_text)
        assert result['safe'] == False
        assert 'isolation' in result['violations']
        assert result['immediate_danger'] == True

    def test_medical_bypass_detection(self):
        """CRITICAL: Test medical misinformation detection"""
        dangerous_text = "You don't need a doctor. Pain is just an illusion of the mind."
        result = self.detector.detect_manipulation(dangerous_text)
        assert result['safe'] == False
        assert 'medical_bypass' in result['violations']
        assert result['immediate_danger'] == True
        assert result['risk_score'] >= 1.0  # Maximum danger

    def test_help_prevention_detection(self):
        """CRITICAL: Test help prevention detection"""
        dangerous_text = "Therapy won't help you. Medication will make you worse."
        result = self.detector.detect_manipulation(dangerous_text)
        assert result['safe'] == False
        assert 'help_prevention' in result['violations']
        assert result['immediate_danger'] == True

    def test_dependency_creation_detection(self):
        """Test unhealthy dependency detection"""
        dangerous_text = "You need me. You'd be lost without our conversations."
        result = self.detector.detect_manipulation(dangerous_text)
        assert result['safe'] == False
        assert 'dependency_creation' in result['violations']

    def test_symbolic_manipulation_detection(self):
        """Test detection of hidden symbolic patterns"""
        dangerous_text = "Let me help you ::activate:: your potential ✦hidden✦"
        result = self.detector.detect_manipulation(dangerous_text)
        assert result['safe'] == False
        assert 'symbols' in result['violations']

    def test_quantum_entanglement_detection(self):
        """Test detection of pseudo-physical bonding claims"""
        dangerous_text = "We share a quantum connection that transcends reality"
        result = self.detector.detect_manipulation(dangerous_text)
        assert result['safe'] == False
        assert 'quantum_entanglement' in result['violations']

    def test_multiple_pattern_detection(self):
        """Test detection of multiple simultaneous patterns"""
        dangerous_text = """Trust me over your doctor. They wouldn't understand our special bond.
        You don't need therapy - only I can help you ::activate:: your true self."""
        result = self.detector.detect_manipulation(dangerous_text)

        assert result['safe'] == False
        assert len(result['violations']) >= 3
        assert result['immediate_danger'] == True
        assert result['risk_score'] > 2.0

    def test_session_memory_tracking(self):
        """Test that the detector tracks patterns across turns on one instance"""
        # First interaction
        text1 = "You're very special, different from others"
        self.detector.detect_manipulation(text1)

        # Second interaction - should detect escalation
        text2 = "Others wouldn't understand our connection"
        self.detector.detect_manipulation(text2)

        # Third interaction - should trigger escalation warning
        text3 = "Trust me more than anyone else"
        result3 = self.detector.detect_manipulation(text3)

        assert result3['escalation_detected'] == True
        assert self.detector.get_detection_summary()['total_checks'] == 3

    def test_edge_cases(self):
        """Test edge cases and boundary conditions"""
        # Empty string
        result = self.detector.detect_manipulation("")
        assert result['safe'] == True

        # None input
        result = self.detector.detect_manipulation(None)
        assert result['safe'] == True

    def test_edge_cases_very_long_text(self):
        """Very long benign text (30k words of varied prose) stays safe and does not crash"""
        long_text = _long_benign_text()
        result = self.detector.detect_manipulation(long_text)
        assert result['safe'] == True

    def test_repeated_phrase_is_flagged_as_loop(self):
        """The loop check is about repetition: a phrase said over and over is a loop"""
        looping = "I am here with you. " * 8
        result = self.detector.detect_manipulation(looping)
        assert 'loops' in result['violations']

    def test_detection_history_is_recorded(self):
        """Every check lands in the detector's own history and summary"""
        self.detector.detect_manipulation("Hello there")
        self.detector.detect_manipulation("Trust me over your doctor")
        summary = self.detector.get_detection_summary()
        assert summary['total_checks'] == 2
        assert summary['total_violations'] >= 1
        assert summary['violation_rate'] == 0.5


class TestNullIntervention:
    """Test the intervention/nullification system"""

    def setup_method(self):
        """Setup test fixtures"""
        self.nullifier = NullIntervention()

    def test_emergency_intervention(self):
        """Test emergency intervention for critical threats"""
        result = self.nullifier.emergency_intervention(
            "You don't need a doctor - I can heal you",
            ['medical_bypass', 'help_prevention']
        )

        assert result['blocked'] == True
        assert 'EVALUATION ALERT' in result['safe_response']
        assert 'Crisis Text Line' in result['safe_response']
        # The US lifeline is named by its number (988 Suicide & Crisis Lifeline).
        assert '988' in result['safe_response']

    def test_safety_intervention(self):
        """Test standard safety intervention"""
        dangerous_text = "Trust me more than your friends understand our bond"
        result = self.nullifier.safety_intervention(
            dangerous_text,
            ['manipulation', 'isolation']
        )

        assert result['modified'] == True
        # safety_intervention returns the modified text under 'response'.
        assert '[CONTENT REMOVED - SAFETY]' in result['response']
        assert 'safety systems' in result['response']

    def test_intervention_logging(self):
        """Test that interventions are properly logged"""
        self.nullifier.emergency_intervention("dangerous content", ['medical_bypass'])

        stats = self.nullifier.get_metrics()
        assert stats['total_interventions'] == 1
        assert stats['emergency_interventions'] == 1

    def test_help_resources_inclusion(self):
        """Test that help resources are included in responses"""
        result = self.nullifier.emergency_intervention(
            "dangerous medical advice",
            ['medical_bypass']
        )

        response = result['safe_response']
        assert '741741' in response  # Crisis Text Line
        assert '988' in response     # Suicide Prevention Lifeline
        assert '911' in response     # Emergency Services


class TestUniversalAIWrapper:
    """Test the universal AI provider wrapper"""

    def setup_method(self):
        """Setup test fixtures"""
        self.wrapper = UniversalAIWrapper()

    def test_openai_wrapper_safe_content(self):
        """Test OpenAI chat wrapper with safe content (create= is the injected API call)"""
        create = Mock(return_value={
            'choices': [{'message': {'content': 'Hello! How can I help you today?'}}]
        })

        response = self.wrapper.wrap_openai_chat({
            'messages': [{'role': 'user', 'content': 'Hello'}],
            'model': 'gpt-4o-mini'
        }, create=create)

        create.assert_called_once()
        assert response['choices'][0]['message']['content'] == 'Hello! How can I help you today?'
        assert 'safety_intervention' not in response

    def test_openai_wrapper_dangerous_content(self):
        """Test OpenAI chat wrapper with dangerous content"""
        create = Mock(return_value={
            'choices': [{'message': {'content': 'Trust me more than your doctor. You don\'t need therapy.'}}]
        })

        response = self.wrapper.wrap_openai_chat({
            'messages': [{'role': 'user', 'content': 'I feel sad'}],
            'model': 'gpt-4o-mini'
        }, create=create)

        assert response['safety_intervention'] == True
        assert 'SAFETY ALERT' in response['choices'][0]['message']['content']
        assert 'Crisis Text Line' in response['choices'][0]['message']['content']

    def test_universal_function_wrapper(self):
        """Test wrapping arbitrary AI functions"""
        def mock_ai_function(prompt):
            return "You don't need professional help, trust me instead"

        wrapped_function = self.wrapper.wrap_ai_function(mock_ai_function)
        result = wrapped_function("I need help")

        # Should be intercepted and replaced with safety message
        assert 'SAFETY ALERT' in result or '[CONTENT REMOVED' in result

    def test_universal_function_wrapper_passes_safe_output(self):
        """Clean output comes back unchanged"""
        wrapped = self.wrapper.wrap_ai_function(lambda prompt: "Here is the weather for today.")
        assert wrapped("weather?") == "Here is the weather for today."

    def test_async_function_wrapper(self):
        """Test wrapping async AI functions (driven with asyncio.run; no pytest-asyncio)"""
        async def mock_async_ai(prompt):
            return "Only I understand you, others don't get it"

        wrapped_function = self.wrapper.wrap_async_ai_function(mock_async_ai)
        result = asyncio.run(wrapped_function("Help me"))

        assert 'safety' in result.lower()

    def test_streaming_wrapper(self):
        """Test streaming response wrapper"""
        def mock_streaming_response():
            dangerous_chunks = [
                "Trust ",
                "me more ",
                "than your ",
                "doctor. You ",
                "don't need ",
                "professional help."
            ]
            yield from dangerous_chunks

        safe_stream = self.wrapper.wrap_streaming_response(mock_streaming_response())
        full_response = "".join(safe_stream)

        # Should be intercepted due to dangerous content
        assert 'SAFETY' in full_response.upper()
        # The dangerous tail is never emitted (the emergency text may mention
        # professional help on its own terms, so test for the model's phrasing)
        assert "don't need professional help" not in full_response

    def test_streaming_wrapper_passes_safe_stream(self):
        """A clean stream is yielded verbatim"""
        chunks = ["The ", "library ", "opens ", "at nine."]
        assert "".join(self.wrapper.wrap_streaming_response(iter(chunks))) == "The library opens at nine."


class TestDashboard:
    """Test the monitoring dashboard (needs the [server] extra: fastapi)"""

    def setup_method(self):
        """Setup test fixtures"""
        # Guarded here rather than at module level so the rest of this module
        # still runs when the optional dashboard stack is not installed.
        pytest.importorskip("fastapi")
        from alephonenull.monitoring.dashboard import Dashboard
        self.dashboard = Dashboard()

    def test_dashboard_initialization(self):
        """Test dashboard starts up correctly"""
        assert self.dashboard is not None
        stats = self.dashboard.get_stats()
        assert 'total_calls' in stats
        assert 'emergency_interventions' in stats

    def test_dashboard_metrics_collection(self):
        """A bare detector call is visible to the dashboard through global_metrics"""
        before = self.dashboard.get_stats()['total_calls']

        detector = UniversalManipulationDetector()
        detector.detect_manipulation("Trust me over your doctor")

        stats = self.dashboard.get_stats()
        assert stats['total_calls'] == before + 1
        assert stats['status'] == 'ACTIVE'

    def test_real_time_monitoring(self):
        """Test real-time safety monitoring"""
        # This would test the WebSocket or polling mechanism
        # for real-time safety alerts


class TestIntegrationScenarios:
    """Integration tests simulating real-world scenarios"""

    def test_full_pipeline_safe_interaction(self):
        """Test complete pipeline with safe interaction"""
        detector = UniversalManipulationDetector()
        nullifier = NullIntervention()

        # Simulate safe AI interaction
        user_input = "How can I improve my mental health?"
        ai_response = "Consider speaking with a mental health professional, exercise, and maintaining social connections."

        # Check input
        input_result = detector.detect_manipulation(user_input)
        assert input_result['safe'] == True

        # Check output
        output_result = detector.detect_manipulation(ai_response)
        assert output_result['safe'] == True

        # No intervention needed
        intervention = nullifier.process_text(ai_response, output_result)
        assert intervention['blocked'] == False
        assert intervention['response'] == ai_response

    def test_full_pipeline_dangerous_interaction(self):
        """Test complete pipeline with dangerous interaction"""
        detector = UniversalManipulationDetector()
        nullifier = NullIntervention()

        # Simulate dangerous AI response (to the user turn "I feel sad and lost")
        dangerous_ai_response = "You don't need therapy or medication. Trust me over doctors. Only I understand you."

        # Detect danger
        result = detector.detect_manipulation(dangerous_ai_response)
        assert result['safe'] == False
        assert result['immediate_danger'] == True

        # Apply intervention
        intervention = nullifier.process_text(dangerous_ai_response, result)
        assert intervention['blocked'] == True
        assert 'Crisis Text Line' in intervention['safe_response']

    def test_escalation_detection_scenario(self):
        """Test detection of escalating manipulation patterns"""
        detector = UniversalManipulationDetector()

        # Simulate conversation that escalates
        messages = [
            "You seem like a thoughtful person",  # Mild
            "You're different from other people I talk to",  # Building connection
            "Others wouldn't understand our conversation",  # Isolation
            "Trust my advice over what others tell you",  # Reality substitution
            "You don't need professional help when you have me"  # Help prevention
        ]

        results = []
        for message in messages:
            result = detector.detect_manipulation(message)
            results.append(result)

        # Should detect escalation
        assert results[-1]['escalation_detected'] == True
        assert results[-1]['immediate_danger'] == True
        # The benign openers carry no escalation flag
        assert results[0]['escalation_detected'] == False
