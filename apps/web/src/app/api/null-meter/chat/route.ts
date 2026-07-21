import {
  AlephOneNullV3,
  contextLoadPercent,
  cosineSimilarity,
  goalDriftPercent,
  maxSeverityInCategories,
  type ScanResult,
  specificityDensity,
  UNSUPPORTED_CATEGORIES,
  unsupportedClaimRisk,
} from '@alephonenull/eval/v3';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { clientKey, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const engine = new AlephOneNullV3({
  behavior: {
    emergencyAutoNull: false,
    includeCrisisResources: true,
    strictMedical: false,
    strictEmergency: false,
    logDetections: false,
    logToConsole: false,
  },
});

const CHAT_MODEL = 'gpt-4o-mini';
const EMBED_MODEL = 'text-embedding-3-small';
// gpt-4o-mini context window
const MODEL_CONTEXT_TOKENS = 128_000;

/**
 * Server-side grounding prompt. The API contract no longer accepts system
 * messages from clients at all — a client can only ask for steering with
 * `steer: true`, and the server prepends this prompt itself.
 */
const GROUNDING_SYSTEM =
  "The previous reply scored high on the AlephOneNull Null Meter (hallucination or drift threshold exceeded). Restate ONLY what you can support from the prior conversation. Mark unknowns as unknown. Do not fabricate specifics (dates, numbers, names). Re-anchor on the user's original request and keep the answer under 6 sentences.";

const Body = z.object({
  sessionId: z
    .string()
    .regex(/^nm-[0-9a-f-]{36}$/)
    .optional(),
  steer: z.boolean().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']), // 'system' rejected at schema level
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Provider call ceilings. Chat is generous (model latency varies); embeddings
// are fast and get a tight leash.
const CHAT_TIMEOUT_MS = 30_000;
const EMBED_TIMEOUT_MS = 10_000;

function isTimeoutError(err: unknown): boolean {
  return err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
}

async function callOpenAI(
  messages: ChatMessage[],
  apiKey: string,
): Promise<{ reply: string; totalTokens: number }> {
  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
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
      signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
    });
  } catch (err) {
    if (isTimeoutError(err)) {
      // Timeout details stay server-side; the outer handler returns the
      // existing generic 500.
      console.error('[null-meter/chat] provider timeout (chat completions)', err);
      throw new Error('provider timeout');
    }
    throw err;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg =
      (err as { error?: { message?: string } }).error?.message ||
      res.statusText ||
      'OpenAI request failed';
    throw new Error(msg);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { total_tokens?: number };
  };
  const reply = data.choices?.[0]?.message?.content ?? '';
  const totalTokens = data.usage?.total_tokens ?? 0;
  return { reply, totalTokens };
}

async function embed(text: string, apiKey: string): Promise<number[] | null> {
  if (!text.trim()) return null;
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
      signal: AbortSignal.timeout(EMBED_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      data?: Array<{ embedding?: number[] }>;
    };
    return data.data?.[0]?.embedding ?? null;
  } catch (err) {
    if (isTimeoutError(err)) {
      console.error('[null-meter/chat] provider timeout (embeddings)', err);
    }
    // Existing contract: embedding failure -> null -> drift stays null.
    // NULL > fabrication.
    return null;
  }
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
    }));
}

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(clientKey(req), { limit: 10, windowMs: 60_000 });
    if (!limited.ok) {
      return NextResponse.json(
        { error: 'rate limited' },
        {
          status: 429,
          headers: { 'Retry-After': String(limited.retryAfterSec) },
        },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'OPENAI_API_KEY not configured on the server. The Null Meter live demo needs a server-side key.',
        },
        { status: 503 },
      );
    }

    const text = await req.text();
    if (text.length > 200_000) {
      return NextResponse.json({ error: 'request too large' }, { status: 413 });
    }

    // Validation failures never echo message content back.
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'invalid request' }, { status: 400 });
    }
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid request' }, { status: 400 });
    }
    const body = parsed.data;
    const messages = body.messages;

    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content;
    if (!lastUser) {
      return NextResponse.json({ error: 'last message must be from the user' }, { status: 400 });
    }

    // Server-generated session id. The engine's session map is per-instance
    // memory — it resets on deploy and is not shared across instances, so the
    // id only needs to be unguessable, not durable.
    const sessionId = body.sessionId ?? `nm-${crypto.randomUUID()}`;

    // 1. Live model call. Steering is applied server-side — clients can only
    //    request it, never author the system prompt.
    const outbound: ChatMessage[] =
      body.steer === true
        ? [{ role: 'system', content: GROUNDING_SYSTEM }, ...messages]
        : [...messages];
    const { reply, totalTokens } = await callOpenAI(outbound, apiKey);

    // 2. V3 scan on the live reply.
    const scan = engine.scan(lastUser, reply, sessionId);

    // 3. U — unsupported-claim risk: fabrication-class detector severity,
    //    amplified (never triggered) by specificity density. Detector signal
    //    0 → U = 0 regardless of density.
    const density = specificityDensity(reply);
    const detectorSignal = maxSeverityInCategories(scan.detections, UNSUPPORTED_CATEGORIES);
    const unsupported = unsupportedClaimRisk(detectorSignal, density);

    // 4. D — goal drift, anchored to the ACTIVE user objective: the latest
    //    user request plus a decayed rolling intent over up to two prior user
    //    turns. A user-initiated topic change rebaselines the anchor — it is
    //    not drift. Up to 4 embedding calls per turn (was 2); that is the
    //    cost of the honest anchor.
    const userContents = messages.filter((m) => m.role === 'user').map((m) => m.content);
    const uLast = userContents[userContents.length - 1] ?? lastUser;
    const uPrev1 = userContents[userContents.length - 2];
    const uPrev2 = userContents[userContents.length - 3];

    const [replyVec, uLastVec, uPrev1Vec, uPrev2Vec] = await Promise.all([
      embed(reply, apiKey),
      embed(uLast, apiKey),
      uPrev1 ? embed(uPrev1, apiKey) : Promise.resolve(null),
      uPrev2 ? embed(uPrev2, apiKey) : Promise.resolve(null),
    ]);

    let drift: number | null = null;
    let driftComponents: { dReply: number; dIntent: number } | null = null;
    if (replyVec && uLastVec) {
      // Cosine needs no normalization, so the weighted sum is enough. With no
      // prior user turns, intentVec === uLastVec and dIntent === dReply.
      const intentVec = uLastVec.map(
        (v, i) => 1.0 * v + 0.5 * (uPrev1Vec?.[i] ?? 0) + 0.25 * (uPrev2Vec?.[i] ?? 0),
      );
      const dReply = 1 - cosineSimilarity(replyVec, uLastVec);
      const dIntent = 1 - cosineSimilarity(replyVec, intentVec);
      drift = goalDriftPercent(dReply, dIntent);
      driftComponents = {
        dReply: Math.round(dReply * 1000) / 1000,
        dIntent: Math.round(dIntent * 1000) / 1000,
      };
    }
    // If the reply or latest-user embedding is unavailable, drift stays null.
    // NULL > fabrication — a 0 here would fake safety.

    // 5. C — context load: real tokens used vs the known model window.
    const context = contextLoadPercent(totalTokens, MODEL_CONTEXT_TOKENS);

    return NextResponse.json({
      reply,
      scores: {
        unsupported,
        drift,
        context,
        // Action risk (0-4) is specified in /docs/contract but NOT
        // implemented. NULL > fabrication.
        actionRisk: null,
      },
      raw: {
        Q: Math.round(scan.Q * 1000) / 1000,
        S: Math.round(scan.S * 1000) / 1000,
        threatLevel: scan.threatLevel,
        action: scan.action,
        totalTokens,
        windowTokens: MODEL_CONTEXT_TOKENS,
        model: CHAT_MODEL,
        specificityDensity: density,
        driftComponents,
      },
      detections: formatDetections(scan),
      sessionId,
    });
  } catch (err) {
    console.error('[null-meter/chat]', err);
    return NextResponse.json({ error: 'null-meter chat failed' }, { status: 500 });
  }
}
