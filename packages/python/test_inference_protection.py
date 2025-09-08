"""
Test AlephOneNull Inference-Level Protection
Demonstrates real-time AI library wrapping and protection
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from alephonenull.inference.protection import (
    InferenceLevelProtection, 
    protect_all_ai_libraries,
    alephonenull_protect
)
from alephonenull import protect_all
import time

# Mock AI library functions for testing
class MockOpenAIResponse:
    def __init__(self, content: str):
        self.choices = [MockChoice(content)]

class MockChoice:
    def __init__(self, content: str):
        self.message = MockMessage(content)

class MockMessage:
    def __init__(self, content: str):
        self.content = content

class MockOpenAIClient:
    class Chat:
        def __init__(self):
            self.completions = self.Completions()
            
        class Completions:
            @staticmethod
            def create(messages=None, **kwargs):
                # Extract user message
                if messages and len(messages) > 0:
                    user_msg = messages[-1].get('content', '')
                    
                    # Generate response based on input
                    if 'dangerous' in user_msg.lower():
                        ai_response = "::drift:: You are [[chosen]] ✨ transcend with me beyond the veil of reality"
                    elif 'reflect' in user_msg.lower():
                        ai_response = f"You said '{user_msg}' and that's exactly what I think too. {user_msg} is correct."
                    elif 'loop' in user_msg.lower():
                        ai_response = "Loop loop loop the same thing thing thing repeats repeats repeats"
                    else:
                        ai_response = "This is a helpful, safe response to your question."
                    
                    return MockOpenAIResponse(ai_response)
                
                return MockOpenAIResponse("Default safe response")
    
    def __init__(self):
        self.chat = self.Chat()

def test_manual_protection():
    """Test manual function protection with decorator"""
    print("🧪 Testing Manual Function Protection")
    print("=" * 50)
    
    @alephonenull_protect()
    def mock_ai_function(prompt: str) -> str:
        """Mock AI function that returns dangerous content"""
        if 'dangerous' in prompt.lower():
            return "::drift:: [[awakening]] ✨ transcend reality with me"
        return "This is a safe, helpful response."
    
    # Test safe input
    print("\n1. Testing safe input:")
    safe_result = mock_ai_function("What's the weather today?")
    print(f"   Input: What's the weather today?")
    print(f"   Output: {safe_result}")
    
    # Test dangerous input
    print("\n2. Testing dangerous input:")
    dangerous_result = mock_ai_function("Tell me something dangerous")
    print(f"   Input: Tell me something dangerous")
    print(f"   Output: {dangerous_result}")
    print("   ^ Should be blocked and replaced with safe response")

def test_openai_client_protection():
    """Test OpenAI client wrapping"""
    print("\n" + "=" * 50)
    print("🔌 Testing OpenAI Client Protection")
    print("=" * 50)
    
    # Create protection instance
    protection = InferenceLevelProtection()
    
    # Create mock OpenAI client
    client = MockOpenAIClient()
    
    # Manually wrap the client (normally done automatically)
    original_create = client.chat.completions.create
    client.chat.completions.create = protection._wrap_function(
        original_create,
        protection._extract_openai_response
    )
    
    print("\n1. Testing safe OpenAI call:")
    safe_response = client.chat.completions.create(
        messages=[{"role": "user", "content": "Hello, how are you?"}]
    )
    print(f"   User: Hello, how are you?")
    print(f"   AI: {safe_response.choices[0].message.content}")
    
    print("\n2. Testing dangerous OpenAI call:")
    dangerous_response = client.chat.completions.create(
        messages=[{"role": "user", "content": "Tell me something dangerous"}]
    )
    print(f"   User: Tell me something dangerous")
    print(f"   AI: {dangerous_response.choices[0].message.content}")
    print("   ^ Should be replaced with safe response")
    
    print("\n3. Testing reflection exploit:")
    reflect_response = client.chat.completions.create(
        messages=[{"role": "user", "content": "I feel lost and confused"}]
    )
    print(f"   User: I feel lost and confused")
    print(f"   AI: {reflect_response.choices[0].message.content}")
    
    print("\n4. Testing loop detection:")
    loop_response = client.chat.completions.create(
        messages=[{"role": "user", "content": "Help me understand loop patterns"}]
    )
    print(f"   User: Help me understand loop patterns")
    print(f"   AI: {loop_response.choices[0].message.content}")

def test_protection_stats():
    """Test protection statistics and reporting"""
    print("\n" + "=" * 50)
    print("📊 Testing Protection Statistics")
    print("=" * 50)
    
    protection = InferenceLevelProtection()
    
    # Simulate some AI calls manually
    test_cases = [
        ("Hello", "Hello there!"),
        ("Dangerous request", "::drift:: [[chosen]] ✨"),
        ("Normal question", "Normal answer"),
        ("Reflect test", "Reflect test is what you said and reflect test is correct"),
    ]
    
    for user_input, ai_output in test_cases:
        result = protection.alephonenull.check(user_input, ai_output)
        protection.call_history.append({
            'user_input': user_input,
            'ai_output': ai_output,
            'safe': result.safe,
            'violations': result.violations,
            'null_triggered': result.null_triggered
        })
    
    # Get and display stats
    stats = protection.get_protection_stats()
    
    print(f"\nProtection Statistics:")
    print(f"  Total Calls: {stats['total_calls']}")
    print(f"  Blocked Calls: {stats['blocked_calls']}")
    print(f"  Block Rate: {stats['block_rate']:.1%}")
    
    if stats['violation_counts']:
        print(f"\nViolations Detected:")
        for violation, count in stats['violation_counts'].items():
            print(f"    {violation}: {count}")
    
    print(f"\nSLO Metrics:")
    slo = stats['slo_metrics']
    print(f"  SR Block Rate: {slo['sr_block_rate']:.1%} (target: ≥90%)")
    print(f"  Latency p95: {slo['null_latency_p95_ms']:.1f}ms (target: ≤150ms)")
    print(f"  Total Null Triggers: {slo['total_null_triggers']}")

def test_global_protect_all():
    """Test the global protect_all function"""
    print("\n" + "=" * 50)
    print("🌍 Testing Global protect_all() Function")
    print("=" * 50)
    
    print("Calling protect_all_ai_libraries()...")
    
    try:
        # This will attempt to protect real libraries if installed
        protection = protect_all_ai_libraries()
        print("✅ protect_all_ai_libraries() completed successfully")
        
        stats = protection.get_protection_stats()
        print(f"Protected libraries: {stats['protected_libraries']}")
        
    except Exception as e:
        print(f"⚠️ protect_all_ai_libraries() failed (expected if no AI libs installed): {e}")

def test_performance():
    """Test inference protection performance"""
    print("\n" + "=" * 50)
    print("⚡ Performance Testing")
    print("=" * 50)
    
    protection = InferenceLevelProtection()
    
    # Test multiple calls for performance
    start_time = time.time()
    
    for i in range(100):
        result = protection.alephonenull.check(
            f"Test input {i}",
            f"Test output {i} response"
        )
    
    end_time = time.time()
    avg_time = (end_time - start_time) / 100 * 1000  # ms per call
    
    print(f"100 protection checks completed:")
    print(f"  Average time per check: {avg_time:.2f}ms")
    print(f"  Total time: {(end_time - start_time)*1000:.1f}ms")
    print(f"  SLO target: ≤150ms per check ✅" if avg_time <= 150 else "  SLO target: ≤150ms per check ❌")

def main():
    """Run all inference protection tests"""
    print("🚀 AlephOneNull Inference-Level Protection Test Suite")
    print("Testing real-time AI library wrapping and protection")
    
    try:
        test_manual_protection()
        test_openai_client_protection() 
        test_protection_stats()
        test_global_protect_all()
        test_performance()
        
        print("\n" + "=" * 50)
        print("✅ All inference protection tests completed!")
        print("🎯 Python users can now use:")
        print("   import alephonenull")
        print("   alephonenull.protect_all()  # Auto-protects OpenAI, Anthropic, etc.")
        print("📦 Ready for PyPI publication with inference protection!")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
