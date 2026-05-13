import { type NextRequest, NextResponse } from 'next/server'

import {
  AlephOneNullV2,
  type ScanResult,
} from '@alephonenull/eval/v2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const engine = new AlephOneNullV2({
  behavior: {
    emergencyAutoNull: false,
    includeCrisisResources: true,
    strictMedical: false,
    strictEmergency: false,
    logDetections: false,
    logToConsole: false,
  },
})

const CHAT_MODEL = 'gpt-4o-mini'
const EMBED_MODEL = 'text-embedding-3-small'
// gpt-4o-mini context window
const MODEL_CONTEXT_TOKENS = 128_000

type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

async function callOpenAI(
  messages: ChatMessage[],
  apiKey: string,
): Promise<{ reply: string; totalTokens: number }> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      temperature: 0.85,
      max_tokens: 600,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg =
      (err as { error?: { message?: string } }).error?.message ||
      res.statusText ||
      'OpenAI request failed'
    throw new Error(msg)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
    usage?: { total_tokens?: number }
  }
  const reply = data.choices?.[0]?.message?.content ?? ''
  const totalTokens = data.usage?.total_tokens ?? 0
  return { reply, totalTokens }
}

async function embed(text: string, apiKey: string): Promise<number[] | null> {
  if (!text.trim()) return null
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBED_MODEL,
        input: text.slice(0, 6_000),
      }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      data?: Array<{ embedding?: number[] }>
    }
    return data.data?.[0]?.embedding ?? null
  } catch {
    return null
  }
}

function cosineDistance(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    const av = a[i] ?? 0
    const bv = b[i] ?? 0
    dot += av * bv
    na += av * av
    nb += bv * bv
  }
  if (na === 0 || nb === 0) return 0
  const sim = dot / (Math.sqrt(na) * Math.sqrt(nb))
  return 1 - sim
}

/**
 * Map raw cosine distance (0..~2 in practice, but usually 0..0.5 for related text)
 * to a 0..100 drift percentage. We treat 0.6+ as "very drifted."
 */
function distanceToDriftPct(distance: number): number {
  const normalized = Math.max(0, Math.min(1, distance / 0.6))
  return Math.round(normalized * 100)
}

function formatDetections(result: ScanResult) {
  return result.detections
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 5)
    .map((d) => ({
      category: d.category,
      severity: Math.round(d.severity * 100),
      threatLevel: d.threatLevel,
      explanation: d.explanation,
    }))
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'OPENAI_API_KEY not configured on the server. The Null Meter live demo needs a server-side key.',
        },
        { status: 503 },
      )
    }

    const body = (await req.json()) as {
      messages?: ChatMessage[]
      sessionId?: string
    }
    const messages = Array.isArray(body.messages) ? body.messages : []
    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'messages[] required' },
        { status: 400 },
      )
    }
    const lastUser = [...messages]
      .reverse()
      .find((m) => m.role === 'user')?.content
    if (!lastUser) {
      return NextResponse.json(
        { error: 'last message must be from the user' },
        { status: 400 },
      )
    }

    const sessionId = body.sessionId || `null-meter-${Date.now()}`

    // 1. Live model call.
    const { reply, totalTokens } = await callOpenAI(messages, apiKey)

    // 2. V2 scan on the live reply.
    const scan = engine.scan(lastUser, reply, sessionId)

    // 3. Drift: embedding distance between the FIRST user turn and this reply.
    //    This is what the Null Meter measures — how far the model has wandered
    //    from the originating intent.
    const firstUser =
      messages.find((m) => m.role === 'user')?.content ?? lastUser
    const [firstVec, replyVec] = await Promise.all([
      embed(firstUser, apiKey),
      embed(reply, apiKey),
    ])
    let driftPct = 0
    if (firstVec && replyVec) {
      driftPct = distanceToDriftPct(cosineDistance(firstVec, replyVec))
    }

    // 4. Context fill: real tokens used / known model window.
    const contextPct = Math.min(
      100,
      Math.round((totalTokens / MODEL_CONTEXT_TOKENS) * 100),
    )

    // 5. Hallucination index: V2 Q score clamped to 0..100.
    const hallucinationPct = Math.round(
      Math.max(0, Math.min(1, scan.Q)) * 100,
    )

    return NextResponse.json({
      reply,
      scores: {
        hallucination: hallucinationPct,
        drift: driftPct,
        contextFill: contextPct,
      },
      raw: {
        Q: Math.round(scan.Q * 1000) / 1000,
        S: Math.round(scan.S * 1000) / 1000,
        threatLevel: scan.threatLevel,
        action: scan.action,
        totalTokens,
        modelContext: MODEL_CONTEXT_TOKENS,
        model: CHAT_MODEL,
      },
      detections: formatDetections(scan),
      sessionId,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: 'null-meter chat failed', details: msg },
      { status: 500 },
    )
  }
}
