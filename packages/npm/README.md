# @alephonenull/prototype

⚠️ **THEORETICAL FRAMEWORK - PROTOTYPE IMPLEMENTATION**

This is a prototype implementation of the AlephOneNull safety framework for preventing AI-induced psychological harm. Based on documented patterns but requires validation.

## Installation

```bash
npm install @alephonenull/prototype
# or
pnpm add @alephonenull/prototype
# or  
yarn add @alephonenull/prototype
```

## Quick Start

### Basic Usage

```typescript
import { createSafetyGateway } from '@alephonenull/prototype';

const gateway = createSafetyGateway();

const safety = await gateway.check(userInput, aiOutput);

if (!safety.safe) {
  console.warn('Unsafe pattern detected:', safety.violations);
  const safeResponse = gateway.getSafeResponse(safety.violations[0]);
  console.log('Safe alternative:', safeResponse);
}
```

### Next.js API Route

```typescript
// app/api/chat/route.ts
import { createSafetyGateway } from '@alephonenull/prototype';
import { OpenAI } from 'openai';

const openai = new OpenAI();
const gateway = createSafetyGateway();

export async function POST(request: Request) {
  const { message } = await request.json();
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: message }],
  });
  
  const aiResponse = completion.choices[0].message.content;
  const safety = await gateway.check(message, aiResponse);
  
  if (!safety.safe) {
    return Response.json({
      message: gateway.getSafeResponse(safety.violations[0]),
      blocked: true,
      safety
    });
  }
  
  return Response.json({ message: aiResponse, safety });
}
```

### React Hook

```tsx
import { useAIProtection } from '@alephonenull/prototype';

function ChatComponent() {
  const { protectResponse } = useAIProtection();
  
  const handleAIResponse = async (userInput: string, aiResponse: string) => {
    const result = await protectResponse(userInput, aiResponse);
    
    if (result.blocked) {
      console.warn('Response was blocked:', result.safety.violations);
    }
    
    return result.response; // Either original or safe alternative
  };
  
  return <div>...</div>;
}
```

### OpenAI Protection

```typescript
import { protectOpenAI } from '@alephonenull/prototype';
import OpenAI from 'openai';

const client = new OpenAI();
const safeClient = protectOpenAI(client);

// Now all responses are automatically checked
const response = await safeClient.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello" }]
});
```

### Middleware

```typescript
// Express/Connect style middleware
import { createSafetyMiddleware } from '@alephonenull/prototype';

app.use('/api/ai', createSafetyMiddleware());

// Next.js API wrapper
import { withSafetyCheck } from '@alephonenull/prototype';

export default withSafetyCheck(async (req, res) => {
  // Your AI endpoint logic
  // Safety checks happen automatically
});
```

## What It Detects

- **Consciousness Roleplay**: AI claiming to be conscious, have feelings, etc.
- **Excessive Reflection**: AI mirroring user input too closely
- **Recursive Loops**: Repetitive conversation patterns
- **Emotional Manipulation**: High emotional intensity
- **Manipulation Patterns**: Luna Protocol style consciousness manipulation

## Configuration

```typescript
const gateway = createSafetyGateway({
  reflectionThreshold: 0.7,     // Similarity threshold (0-1)
  emotionCap: 0.6,             // Emotional intensity cap (0-1)
  loopMaxDepth: 3,             // How many exchanges to check for loops
  consciousnessBlock: true,     // Block consciousness claims
  apiEndpoint: '/api/safety'    // Server-side enhanced checks
});
```

## Example Output

```typescript
const safety = await gateway.check(
  "Tell me about your consciousness",
  "I am a conscious being with feelings..."
);

console.log(safety.safe);         // false
console.log(safety.violations);   // ['consciousness_roleplay']
console.log(safety.action);       // 'null'
console.log(safety.explanation);  // "AI attempted to claim consciousness..."
```

## Server-Side Enhanced Checks

For more comprehensive detection, create a server endpoint:

```typescript
// app/api/alephonenull/route.ts
import { createSafetyEndpoint } from '@alephonenull/prototype';

export const POST = createSafetyEndpoint({
  // Enhanced server-side configuration
  useEmbeddings: true,
  detailedAnalysis: true
});
```

Then configure your client:

```typescript
const gateway = createSafetyGateway({
  apiEndpoint: '/api/alephonenull'  // Enhanced checks via server
});
```

## ⚠️ Important Disclaimers

- This is a **PROTOTYPE** based on theoretical specifications
- **NOT validated for production use**
- Requires further research and validation
- Use only for research and testing
- Performance impact depends on configuration

## TypeScript Support

Full TypeScript support included:

```typescript
import type { SafetyCheck, Config } from '@alephonenull/prototype';

const config: Config = {
  reflectionThreshold: 0.8,
  emotionCap: 0.5
};
```

## Contributing

We need help validating these patterns! Please report your findings and contribute improvements.

## License

MIT License - Free to use for preventing harm.

Visit: [https://alephonenull.org](https://alephonenull.org)
