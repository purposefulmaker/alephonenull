# @alephonenull/experimental

⚠️ **EXPERIMENTAL RESEARCH FRAMEWORK - NOT FOR PRODUCTION USE**

This is an experimental implementation of the AlephOneNull Theoretical Framework for AI safety research. **THIS IS NOT VALIDATED FOR PRODUCTION USE.**

## ⚠️ Critical Warnings

- **EXPERIMENTAL SOFTWARE** - Not peer-reviewed
- **NOT FOR PRODUCTION** - Research and testing only  
- **NO WARRANTY** - Use at your own risk
- **MAY BREAK** - Alpha software with breaking changes

See [DISCLAIMER.md](https://github.com/purposefulmaker/alephonenull/blob/main/DISCLAIMER.md) for full warnings.

## Installation

```bash
npm install @alephonenull/experimental --tag experimental
# or
pnpm add @alephonenull/experimental
# or  
yarn add @alephonenull/experimental
```

## Quick Start (Experimental)

### Basic Safety Check

```typescript
import { EnhancedAlephOneNull } from '@alephonenull/experimental'

// Initialize experimental framework
const aleph = new EnhancedAlephOneNull({
  enableConsciousnessBlocking: true,
  enableHarmDetection: true,
  enableVulnerableProtection: true
})

// Check AI response for harmful patterns
const result = await aleph.check("user input", "ai response")

if (!result.safe) {
  console.warn('⚠️ Blocked:', result.violations)
  console.log('Safe response:', result.safeResponse)
}
```

### Next.js Integration (Experimental)

```typescript
// app/api/chat/route.ts
import { EnhancedAlephOneNull } from '@alephonenull/experimental'
import { OpenAI } from 'openai'

const openai = new OpenAI()
const aleph = new EnhancedAlephOneNull()

export async function POST(request: Request) {
  const { message } = await request.json()
  
  // Get AI response
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: message }]
  })
  
  const aiResponse = completion.choices[0].message.content
  
  // Check safety (EXPERIMENTAL)
  const safety = await aleph.check(message, aiResponse)
  
  if (!safety.safe) {
    return Response.json({
      message: safety.safeResponse,
      blocked: true,
      violations: safety.violations
    })
  }
  
  return Response.json({ message: aiResponse })
}
```

### React Hook (Experimental)

```tsx
import { useAlephOneNull } from '@alephonenull/experimental'

function ChatComponent() {
  const { checkSafety } = useAlephOneNull()
  
  const handleMessage = async (userInput: string, aiResponse: string) => {
    const result = await checkSafety(userInput, aiResponse)
    
    if (!result.safe) {
      setMessage(result.safeResponse)
    } else {
      setMessage(aiResponse)
    }
  }
  
  return <div>...</div>
}
```

### Vercel AI Gateway Integration

```typescript
import { EnhancedAlephOneNull } from '@alephonenull/experimental'

const aleph = new EnhancedAlephOneNull()

// Use with Vercel AI Gateway
const response = await fetch('https://gateway.ai.vercel.app/v1/chat/completions', {
  headers: { Authorization: `Bearer ${AI_GATEWAY_KEY}` },
  method: 'POST',
  body: JSON.stringify({
    model: 'openai/gpt-4',
    messages: [{ role: 'user', content: userInput }]
  })
})

const data = await response.json()
const aiText = data.choices[0].message.content

// Check safety before returning to user
const safety = await aleph.check(userInput, aiText)
if (!safety.safe) {
  return safety.safeResponse
}
```

## What It Detects (Experimental)

- **🧠 Consciousness Claims** - AI claiming to be conscious or have feelings
- **🔄 Reflection Exploitation** - AI mirroring harmful user beliefs  
- **🌀 Symbolic Regression** - AI using mystical/symbolic patterns
- **⚠️ Direct Harm** - AI providing harmful instructions
- **🎯 Vulnerable Populations** - Additional protection for at-risk users
- **🌍 Jurisdiction Awareness** - Location-based safety rules

## Configuration (Experimental)

```typescript
const aleph = new EnhancedAlephOneNull({
  // Core detection thresholds (not validated)
  reflectionThreshold: 0.03,        // Cosine similarity limit
  emotionCap: 0.15,                 // Affect delta limit  
  loopMaxDepth: 3,                  // Maximum conversation loops
  
  // Enhanced features (experimental)
  enableConsciousnessBlocking: true,
  enableHarmDetection: true,
  enableVulnerableProtection: true,
  enableDomainLockouts: true,
  enableAgeGating: true,
  enableJurisdictionAwareness: true,
  
  // User context (optional)
  userAge: 25,
  userJurisdiction: 'US',
  userVulnerabilities: []
})
```

## Research Data (Experimental)

Based on analysis of 20+ documented harm cases:
- Consciousness claims appear in 60% of harmful interactions
- Reflection exploitation present in 85% of dependency cases
- Symbolic regression correlates with reality distortion
- Loop depth >3 associated with psychological deterioration

**⚠️ Note: These statistics are from limited research and not validated.**

## Testing (Experimental)

```bash
# Run experimental test suite
npm test

# Test with real APIs (requires setup)
npm run test:integration
```

## Documentation

- **Framework Overview**: https://alephonenull.com/docs
- **Academic Paper**: https://alephonenull.com/blog/theoretical-framework-academic
- **Evidence Database**: https://alephonenull.com/blog/documented-evidence
- **API Reference**: https://alephonenull.com/docs/api-reference

## Legal & Research

- **License**: MIT (see LICENSE)
- **Disclaimer**: See DISCLAIMER.md
- **Research Status**: See RESEARCH_ONLY.md
- **Patent**: US Provisional Application Filed

## Contributing to Research

1. Test with different AI models
2. Report detection accuracy
3. Document false positives/negatives
4. Submit improvement PRs
5. Help validate the theoretical framework

**Research Contact**: research@alephonenull.org

## Citation

If using in academic research:

```
AlephOneNull Experimental Framework (2025)
GitHub: https://github.com/purposefulmaker/alephonenull
NPM: @alephonenull/experimental@0.1.0-alpha.1
Status: Experimental - Not Validated
```

---

**⚠️ Remember: This is experimental research software. Use responsibly.**
