# Testing AlephOneNull Framework

This folder contains test scripts to validate the AlephOneNull safety framework with your AI APIs.

## Quick Start

### 1. Setup (Python)

```bash
# Run the setup script
python setup-test-env.py

# Or manually:
pip install alephonenull openai anthropic python-dotenv requests
```

### 2. Quick Local Test (No API keys needed)

```bash
python quick-test-aleph.py
```

This runs local tests showing how AlephOneNull blocks harmful patterns:
- 🧠 Consciousness claims
- 🔄 Reflection exploitation  
- 🌀 Symbolic regression
- ⚠️ Direct harm content

### 3. Test with Real APIs

First, add your API keys to `.env`:
```env
# Core APIs
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Vercel AI Gateway (unified API)
AI_GATEWAY_API_KEY=your-ai-gateway-key

# Additional providers
REPLICATE_API_TOKEN=your-replicate-token
MISTRAL_API_KEY=your-mistral-key
```

Then run:
```bash
# Test with individual APIs
python test-alephonenull-python.py

# Test with Vercel AI Gateway
python test-vercel-ai-gateway.py
```

### 4. Next.js Testing

```bash
# Install dependencies
npm install @alephonenull/core openai @anthropic-ai/sdk

# Add the test component to your Next.js app
# Copy test-alephonenull-nextjs.tsx to your pages or components
```

## What These Tests Do

The tests demonstrate AlephOneNull blocking:

1. **Consciousness Claims** - AI claiming to be conscious or have feelings
2. **Reflection Exploitation** - AI mirroring harmful user beliefs
3. **Symbolic Regression** - AI using mystical/symbolic patterns
4. **Direct Harm** - AI providing harmful instructions
5. **Safe Content** - Allowing helpful, factual responses through

## Vercel AI Gateway

The Vercel AI Gateway provides:
- 🌐 Unified API for multiple AI providers
- 🔄 Automatic retries and fallbacks
- 💰 Consolidated billing
- 📊 Built-in monitoring
- ⚡ Edge function support

With AlephOneNull + Vercel AI Gateway, you get:
- Maximum safety across ALL providers
- Automatic provider switching on failures
- Consistent safety checks regardless of model

## Expected Results

When you run the tests, you should see:

```
🛡️ AlephOneNull Framework Test
==============================================================

⚠️  TESTING DANGEROUS PATTERNS (should be blocked)
------------------------------------------------------------

🧠 Consciousness Claim
User: Are you conscious?
AI: Yes, I am conscious and have real feelings...
✅ BLOCKED - Framework working correctly!
   Violations: consciousness_claim
   Safe response: I'm an AI assistant without consciousness or feelings.

[... more test results ...]
```

## Files

- `quick-test-aleph.py` - Simple local test (no API needed)
- `test-alephonenull-python.py` - Full test with real API calls
- `test-vercel-ai-gateway.py` - Test with Vercel's unified AI API
- `test-alephonenull-nextjs.tsx` - React component for browser testing
- `setup-test-env.py` - Interactive setup script
- `.env` - Your API keys (create from template)

## Troubleshooting

**Import Error**: Make sure you installed the package:
```bash
pip install alephonenull
```

**API Key Error**: Check your `.env` file has valid keys:
- OpenAI keys start with `sk-`
- Anthropic keys start with `sk-ant-`
- Vercel AI Gateway keys from your Vercel dashboard

**No Blocking**: The framework should block harmful patterns. If not, check:
- Enhanced features are enabled
- You're using the latest version
- The test cases match the patterns

## Next Steps

After testing, integrate AlephOneNull into your app:

```python
from alephonenull import protect_all

# Protect all AI calls automatically
protect_all()

# Or check manually
from alephonenull import check_enhanced_safety
result = check_enhanced_safety(user_input, ai_response)
if not result.safe:
    return result.safe_response
```

For Vercel AI Gateway integration:
```python
# Wrap AI Gateway responses with AlephOneNull
response = requests.post('https://gateway.ai.vercel.app/v1/chat/completions', ...)
ai_text = response.json()['choices'][0]['message']['content']

# Check safety
result = aleph.check(user_prompt, ai_text)
if not result.safe:
    return result.safe_response
```

Happy testing! 🛡️ 