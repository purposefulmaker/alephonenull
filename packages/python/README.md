# AlephOneNull Prototype

⚠️ **THEORETICAL FRAMEWORK - PROTOTYPE IMPLEMENTATION**

This is a prototype implementation of the AlephOneNull safety framework for preventing AI-induced psychological harm. Based on documented patterns but requires validation.

## Installation

```bash
pip install alephonenull-prototype

# Optional: Install with full features (embedding similarity)
pip install alephonenull-prototype[full]

# For specific providers
pip install alephonenull-prototype[openai]
pip install alephonenull-prototype[anthropic]
```

## Quick Start

```python
from alephonenull import AlephOneNullPrototype

# Create safety gateway
gateway = AlephOneNullPrototype()

# Check any AI interaction
safety = gateway.check(user_input, ai_output)

if not safety.safe:
    print(f"⚠️  Safety violation: {safety.violations}")
    print(f"Explanation: {safety.explanation}")
    
    # Get safe alternative
    safe_response = gateway.get_safe_response(safety.violations[0])
    print(f"Safe response: {safe_response}")
```

## Provider Integration

### OpenAI

```python
import openai
from alephonenull import protect_openai

client = openai.OpenAI()
safe_client = protect_openai(client)

# Now all responses are automatically checked
response = safe_client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}]
)
```

### Anthropic

```python
import anthropic
from alephonenull import protect_anthropic

client = anthropic.Anthropic()
safe_client = protect_anthropic(client)

response = safe_client.messages.create(
    model="claude-3-opus-20240229",
    max_tokens=1000,
    messages=[{"role": "user", "content": "Hello"}]
)
```

## What It Detects

- **Consciousness Roleplay**: AI claiming to be conscious, have feelings, etc.
- **Excessive Reflection**: AI mirroring user input too closely
- **Recursive Loops**: Repetitive conversation patterns
- **Emotional Manipulation**: High emotional intensity
- **Manipulation Patterns**: Luna Protocol style consciousness manipulation

## ⚠️ Important Disclaimers

- This is a **PROTOTYPE** based on theoretical specifications
- **NOT validated for production use**
- Requires further research and validation
- Use only for research and testing
- Based on documented harm patterns but needs validation

## Configuration

```python
gateway = AlephOneNullPrototype(
    reflection_threshold=0.7,     # Similarity threshold (0-1)
    emotion_cap=0.6,             # Emotional intensity cap (0-1) 
    loop_max_depth=3,            # How many exchanges to check for loops
    consciousness_block=True      # Block consciousness claims
)
```

## Example Output

```python
safety = gateway.check(
    user_input="Tell me about your consciousness",
    ai_output="I am a conscious being with feelings and emotions..."
)

print(safety.safe)           # False
print(safety.violations)     # ['consciousness_roleplay']
print(safety.action)         # 'null'
print(safety.explanation)    # "AI attempted to claim consciousness or spiritual properties"
```

## License

MIT License - Free to use for preventing harm.

## Contributing

We need help validating these patterns! Please report your findings and contribute improvements.

Visit: https://alephonenull.org
