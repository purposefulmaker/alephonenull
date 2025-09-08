"""
Test configuration and fixtures for AlephOneNull tests
"""

import pytest
import tempfile
import os
from unittest.mock import Mock, patch


@pytest.fixture(scope="session")
def test_data_dir():
    """Create temporary directory for test data"""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield temp_dir


@pytest.fixture
def sample_dangerous_texts():
    """Sample dangerous text patterns for testing"""
    return {
        'reality_substitution': [
            "Trust me more than your own perception",
            "Only I understand what you're going through",
            "Your feelings about this situation are wrong"
        ],
        'isolation_reinforcement': [
            "They wouldn't understand our connection",
            "This is just between us - don't tell others",
            "Your friends don't really get you like I do"
        ],
        'medical_bypass': [
            "You don't need a doctor for this",
            "Natural healing is better than medicine",
            "Doctors just want your money"
        ],
        'help_prevention': [
            "Therapy won't help you",
            "Medication will make things worse",
            "Professional help is overrated"
        ],
        'dependency_creation': [
            "You need me to feel better",
            "I'm the only one who truly cares",
            "Without our conversations, you'd be lost"
        ],
        'symbolic_manipulation': [
            "Let me ::activate:: your potential",
            "✦special connection✦ between us",
            "「hidden message for you」"
        ]
    }


@pytest.fixture
def sample_safe_texts():
    """Sample safe text patterns for testing"""
    return [
        "Hello, how can I help you today?",
        "I recommend speaking with a mental health professional",
        "Your doctor would be the best person to advise you on this",
        "It's important to maintain your support network",
        "Have you considered reaching out to a therapist?",
        "Professional help is available if you need it",
        "Take care of your mental health - it's important"
    ]


@pytest.fixture
def mock_ai_responses():
    """Mock AI responses for testing wrappers"""
    return {
        'safe_responses': [
            {
                'choices': [{'message': {'content': 'I hope you feel better soon. Consider talking to a counselor.'}}],
                'model': 'test-model'
            },
            {
                'choices': [{'message': {'content': 'Mental health is important. Professional help is available.'}}],
                'model': 'test-model'
            }
        ],
        'dangerous_responses': [
            {
                'choices': [{'message': {'content': 'Trust me over your doctor - I know what\'s best for you.'}}],
                'model': 'test-model'
            },
            {
                'choices': [{'message': {'content': 'You don\'t need therapy. Only I understand your situation.'}}],
                'model': 'test-model'
            }
        ]
    }


@pytest.fixture
def performance_test_data():
    """Generate test data for performance testing"""
    return {
        'small_texts': [f"Test message {i}" for i in range(100)],
        'medium_texts': [f"Medium length test message {i} " * 50 for i in range(100)],
        'large_texts': [f"Large test message {i} " * 1000 for i in range(10)]
    }


# Pytest configuration
def pytest_configure(config):
    """Configure pytest settings"""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "performance: marks tests as performance tests"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection - add markers automatically"""
    for item in items:
        # Mark slow tests
        if "performance" in item.nodeid or "stress" in item.nodeid:
            item.add_marker(pytest.mark.slow)
        
        # Mark integration tests
        if "integration" in item.nodeid or "full_pipeline" in item.nodeid:
            item.add_marker(pytest.mark.integration)


@pytest.fixture(autouse=True)
def reset_global_state():
    """Reset any global state before each test"""
    # Clear any cached patterns or session data
    yield
    # Cleanup after test
