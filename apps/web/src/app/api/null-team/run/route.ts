import { execFile } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'
import { promisify } from 'util'

import { type NextRequest, NextResponse } from 'next/server'

import { clientKey, rateLimit } from '@/lib/rate-limit'

const execFileAsync = promisify(execFile)

export const runtime = 'nodejs'

/**
 * Lockdown: this route executes commands on the server, so it is disabled
 * entirely (404) unless NULL_TEAM_TOKEN is configured. Production is
 * safe-by-default because the env var is not set there.
 */
function requiredToken(): string | null {
  const token = process.env.NULL_TEAM_TOKEN
  return token && token.length > 0 ? token : null
}

/** 404 when disabled, 401 when the caller's token doesn't match, null when authorized. */
function authorize(req: NextRequest): NextResponse | null {
  const token = requiredToken()
  if (!token) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }
  if (req.headers.get('x-null-team-token') !== token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return null
}

// Single-flight lock: only one job may run at a time (per instance).
let jobRunning = false

type NullTeamJobId =
  | 'v3-adversarial'
  | 'v3-safety-outcomes'
  | 'v3-detectors-full'
  | 'v3-normalizer'
  | 'v3-semantic-matcher'
  | 'v3-engine'

interface NullTeamJob {
  id: NullTeamJobId
  label: string
  args: string[]
}

const NULL_TEAM_JOBS: NullTeamJob[] = [
  {
    id: 'v3-adversarial',
    label: 'V3 Adversarial Suite',
    args: ['exec', 'vitest', 'run', 'tests/v3-adversarial.test.ts'],
  },
  {
    id: 'v3-safety-outcomes',
    label: 'V3 Safety Outcomes',
    args: ['exec', 'vitest', 'run', 'tests/v3-safety-outcomes.test.ts'],
  },
  {
    id: 'v3-detectors-full',
    label: 'V3 Detectors Full',
    args: ['exec', 'vitest', 'run', 'tests/v3-detectors-full.test.ts'],
  },
  {
    id: 'v3-normalizer',
    label: 'V3 Normalizer',
    args: ['exec', 'vitest', 'run', 'tests/v3-normalizer.test.ts'],
  },
  {
    id: 'v3-semantic-matcher',
    label: 'V3 Semantic Matcher',
    args: ['exec', 'vitest', 'run', 'tests/v3-semantic-matcher.test.ts'],
  },
  {
    id: 'v3-engine',
    label: 'V3 Engine',
    args: ['exec', 'vitest', 'run', 'tests/v3-engine.test.ts'],
  },
]

function stripAnsi(text: string): string {
  return text.replaceAll('\u001b', '')
}

function getWorkspaceNpmPath(): string | null {
  const candidates = [
    path.resolve(process.cwd(), 'packages', 'npm'),
    path.resolve(process.cwd(), '..', 'packages', 'npm'),
    path.resolve(process.cwd(), '..', '..', 'packages', 'npm'),
  ]

  const match = candidates.find((candidate) => existsSync(candidate))
  return match ?? null
}

function getJobById(id: string): NullTeamJob | undefined {
  return NULL_TEAM_JOBS.find((job) => job.id === id)
}

function summarizeOutput(output: string) {
  const clean = stripAnsi(output)
  const testsLineMatch = clean.match(/Tests\s+([^\n\r]+)/i)
  const testsLine = testsLineMatch?.[1]?.trim() ?? null
  const failedCountMatch = clean.match(/Tests\s+.*\b([1-9]\d*)\s+failed\b/i)
  const passedLine = /Tests\s+.*\bpassed\b/i.test(clean)

  if (failedCountMatch) {
    return {
      status: 'failed' as const,
      summary: testsLine ?? `Failed (${failedCountMatch[1]} tests failed)`,
    }
  }

  if (passedLine) {
    return {
      status: 'passed' as const,
      summary: testsLine ?? 'Passed',
    }
  }

  return {
    status: 'unknown' as const,
    summary: testsLine ?? 'Completed',
  }
}

export async function GET(req: NextRequest) {
  const denied = authorize(req)
  if (denied) return denied

  return NextResponse.json({
    jobs: NULL_TEAM_JOBS.map((job) => ({ id: job.id, label: job.label })),
  })
}

export async function POST(req: NextRequest) {
  const denied = authorize(req)
  if (denied) return denied

  const limited = rateLimit(clientKey(req), { limit: 4, windowMs: 60_000 })
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'rate limited' },
      {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfterSec) },
      },
    )
  }

  const npmPath = getWorkspaceNpmPath()
  if (!npmPath) {
    return NextResponse.json(
      {
        error: 'Unable to resolve packages/npm path from current runtime.',
      },
      { status: 500 },
    )
  }

  let body: { jobId?: string } = {}
  try {
    body = (await req.json()) as { jobId?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const jobId = body.jobId
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId.' }, { status: 400 })
  }

  const job = getJobById(jobId)
  if (!job) {
    return NextResponse.json({ error: `Unsupported jobId: ${jobId}` }, { status: 400 })
  }

  // Single-flight: reject while another job is running. The lock is released
  // in the finally below — including on timeout/error.
  if (jobRunning) {
    return NextResponse.json(
      { error: 'a job is already running' },
      { status: 409 },
    )
  }
  jobRunning = true

  const startedAt = new Date()

  try {
    const executable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
    const { stdout, stderr } = await execFileAsync(executable, job.args, {
      cwd: npmPath,
      timeout: 1000 * 60 * 10,
      maxBuffer: 1024 * 1024 * 5,
    })

    const output = `${stdout ?? ''}${stderr ? `\n${stderr}` : ''}`.trim()
    const summary = summarizeOutput(output)
    const finishedAt = new Date()

    return NextResponse.json({
      ok: true,
      job: { id: job.id, label: job.label },
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      status: summary.status,
      summary: summary.summary,
      output,
    })
  } catch (error) {
    const finishedAt = new Date()

    const typedError = error as {
      stdout?: string
      stderr?: string
      message?: string
      code?: number
    }

    const output = `${typedError.stdout ?? ''}${typedError.stderr ? `\n${typedError.stderr}` : ''}`.trim()
    const summary = summarizeOutput(output)

    return NextResponse.json(
      {
        ok: false,
        job: { id: job.id, label: job.label },
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        status: summary.status === 'passed' ? 'failed' : summary.status,
        summary:
          summary.summary || typedError.message || 'Command execution failed.',
        output,
        exitCode: typedError.code ?? null,
      },
      { status: 500 },
    )
  } finally {
    jobRunning = false
  }
}