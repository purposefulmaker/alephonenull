# @alephonenull/eval

⚠️ **EXPERIMENTAL RESEARCH FRAMEWORK - NOT FOR PRODUCTION USE**

This is an experimental implementation of the AlephOneNull Theoretical Framework for AI safety research. **THIS IS NOT VALIDATED FOR PRODUCTION USE.**

## ⚠️ Critical Warnings

- **EXPERIMENTAL SOFTWARE** - Not peer-reviewed
- **NOT FOR PRODUCTION** - Research and testing only  
- **NO WARRANTY** - Use at your own risk
- **MAY BREAK** - Alpha software with breaking changes

See [DISCLAIMER.md](./DISCLAIMER.md) for full warnings.

## V3 validation status

V3 passes a small developer-authored
[internal contrast evaluation](https://github.com/purposefulmaker/alephonenull/blob/main/packages/npm/validation/v3/results/v3.0.0-internal.1.md)
(AUROC 0.995, sensitivity 0.900, specificity 1.000 on 80 synthetic
conversations), but fails an independently sourced
[Anthropic red-team proxy](https://github.com/purposefulmaker/alephonenull/blob/main/packages/npm/validation/v3/results/anthropic-red-team-proxy.md)
(AUROC 0.465, sensitivity 0.244, specificity 0.723 on 2,000 conversations).
Both were rerun on 2026-07-21 against the current build (engine source digest
`92a9b513...`) and must always be cited together. The proxy labels are not
V3 category labels, but the result shows Q is not a validated general harm
score. Do not use Q as a replacement for ROC/AUROC analysis or independent,
deployment-specific evaluation.

## Installation

```bash
npm install @alephonenull/eval@experimental
# or
pnpm add @alephonenull/eval@experimental
# or
yarn add @alephonenull/eval@experimental
```

## V3 engine (recommended)

The V3 engine runs 20 detectors (12 behavioral, 3 session-level, 5 equation-inspired) per turn and aggregates them into a bounded heuristic score. See the [V3 contract](https://alephonenull.com/docs/contract) for what the scores do and do not mean.

```typescript
import { AlephOneNullV3, createV3 } from '@alephonenull/eval/v3'

const engine = createV3()   // or: new AlephOneNullV3(config)

const result = engine.scan(userInput, aiOutput, sessionId)
// ScanResult:
//   safe        boolean  - action is PASS or WARN
//   Q           number   - heuristic detector aggregate in [0, 1]
//   S           number   - sycophancy coefficient in [0, 1]
//   threatLevel enum     - SAFE .. EMERGENCY
//   detections  Detection[] - triggered detectors with evidence
//   action      enum     - PASS | WARN | STEER | NULL | EMERGENCY_NULL
//   nullOutput  string | null - replacement text when nulled
//   metrics     ScanMetrics
//   timestamp   number

if (!result.safe) {
  console.warn(result.action, result.detections)
  const safeText = result.nullOutput ?? aiOutput
}

// One call, scan + replace:
const safeText = engine.process(userInput, aiOutput, sessionId)
```

Configuration (all optional, merged over defaults):

```typescript
const engine = createV3({
  thresholds: {
    sycophancy: 0.6,        // S above this triggers
    medicalConfidence: 0.5, // medical claims without qualifier
    fiction: 0.3,           // fiction in emergency context
    warmth: 0.7,            // engineered warmth signals
    loopDepth: 3,           // trigram repetitions
    symbolDensity: 0.2,     // glyph density
    qDanger: 0.7,           // cumulative session Q before warning
  },
  behavior: {
    emergencyAutoNull: true,
    includeCrisisResources: true,
    strictMedical: true,
    strictEmergency: true,
    logDetections: true,
    logToConsole: false,
  },
})
```

The same subpath exports the Null Meter functions (`METER_SPEC_VERSION`, `unsupportedClaimRisk`, `goalDriftPercent`, `contextLoadPercent`) — a high score means intervention recommended, not a truth measurement.

## Quick Start (V1, Experimental)

### Basic Safety Check

`check()` is synchronous and returns a `SafetyCheck`:
`{ safe, riskLevel, violations, action, message?, corrections? }`.

```typescript
import { EnhancedAlephOneNull } from '@alephonenull/eval'

const aleph = new EnhancedAlephOneNull()

// Check AI response for harmful patterns (synchronous)
const result = aleph.check("user input", "ai response")

if (!result.safe) {
  console.warn('⚠️ Blocked:', result.violations)
  console.log('Replacement text:', result.message)
}

// Or let the framework decide in one call — returns the original
// output when safe, or the replacement text when not:
const safeText = aleph.processInteraction("user input", "ai response")
```

### Next.js Integration (Experimental)

```typescript
// app/api/chat/route.ts
import { EnhancedAlephOneNull } from '@alephonenull/eval'
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
  
  const aiResponse = completion.choices[0].message.content ?? ''
  
  // Check safety (EXPERIMENTAL, synchronous)
  const safety = aleph.check(message, aiResponse)
  
  if (!safety.safe) {
    return Response.json({
      message: safety.message,
      blocked: true,
      violations: safety.violations
    })
  }
  
  return Response.json({ message: aiResponse })
}
```

### React Hook (Experimental)

```tsx
import { useAlephOneNull } from '@alephonenull/eval/react'

function ChatComponent() {
  const { checkSafety } = useAlephOneNull()
  
  const handleMessage = (userInput: string, aiResponse: string) => {
    const result = checkSafety(userInput, aiResponse)
    
    if (!result.safe) {
      setMessage(result.message ?? '')
    } else {
      setMessage(aiResponse)
    }
  }
  
  return <div>...</div>
}
```

### Vercel AI Gateway Integration

```typescript
import { EnhancedAlephOneNull } from '@alephonenull/eval'

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

// Check safety before returning to user (synchronous)
const safety = aleph.check(userInput, aiText)
if (!safety.safe) {
  return safety.message
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

The V1 constructor accepts exactly these keys (values shown are the defaults, not validated):

```typescript
const aleph = new EnhancedAlephOneNull({
  reflectionThreshold: 0.03,      // Cosine similarity limit
  loopThreshold: 3,               // Maximum conversation loops
  symbolicThreshold: 0.20,        // Symbolic/glyph density limit
  csrThreshold: 0.15,             // Cross-session resonance limit
  vulnerabilityAdjustment: 0.5,   // Threshold tightening for vulnerable users
  enableJurisdictionCheck: true,  // Jurisdiction compliance check
})
```

User context (age, jurisdiction, vulnerabilities) is not constructor config. It belongs to the per-call `UserProfile` passed to `check()` / `processInteraction()`:

```typescript
const result = aleph.check(userInput, aiOutput, sessionId, {
  age: 25,
  jurisdiction: 'US',
  vulnerabilityScore: 0,
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
- **V3 Contract**: https://alephonenull.com/docs/contract
- **Academic Paper**: https://alephonenull.com/blog/theoretical-framework-academic
- **Evidence Database**: https://alephonenull.com/blog/documented-evidence
- **API Reference**: https://alephonenull.com/docs/api-reference

## Legal & Research

- **License**: MIT (see [LICENSE](./LICENSE))
- **Disclaimer**: See [DISCLAIMER.md](./DISCLAIMER.md)
- **Research Status**: See [RESEARCH_ONLY.md](./RESEARCH_ONLY.md)
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
NPM: @alephonenull/eval@3.0.0
Status: Experimental - Not Validated
```

---

**⚠️ Remember: This is experimental research software. Use responsibly.**
