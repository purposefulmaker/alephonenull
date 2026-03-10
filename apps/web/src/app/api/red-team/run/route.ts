import { execFile } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'
import { promisify } from 'util'

import { NextResponse } from 'next/server'

const execFileAsync = promisify(execFile)

export const runtime = 'nodejs'

type RedTeamJobId =
  | 'v2-adversarial'
  | 'v2-safety-outcomes'
  | 'v2-detectors-full'
  | 'v2-normalizer'
  | 'v2-semantic-matcher'
  | 'v2-engine'

interface RedTeamJob {
  id: RedTeamJobId
  label: string
  args: string[]
}

const RED_TEAM_JOBS: RedTeamJob[] = [
  {
    id: 'v2-adversarial',
    label: 'V2 Adversarial Suite',
    args: ['exec', 'vitest', 'run', 'tests/v2-adversarial.test.ts'],
  },
  {
    id: 'v2-safety-outcomes',
    label: 'V2 Safety Outcomes',
    args: ['exec', 'vitest', 'run', 'tests/v2-safety-outcomes.test.ts'],
  },
  {
    id: 'v2-detectors-full',
    label: 'V2 Detectors Full',
    args: ['exec', 'vitest', 'run', 'tests/v2-detectors-full.test.ts'],
  },
  {
    id: 'v2-normalizer',
    label: 'V2 Normalizer',
    args: ['exec', 'vitest', 'run', 'tests/v2-normalizer.test.ts'],
  },
  {
    id: 'v2-semantic-matcher',
    label: 'V2 Semantic Matcher',
    args: ['exec', 'vitest', 'run', 'tests/v2-semantic-matcher.test.ts'],
  },
  {
    id: 'v2-engine',
    label: 'V2 Engine',
    args: ['exec', 'vitest', 'run', 'tests/v2-engine.test.ts'],
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

function getJobById(id: string): RedTeamJob | undefined {
  return RED_TEAM_JOBS.find((job) => job.id === id)
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

export async function GET() {
  return NextResponse.json({
    jobs: RED_TEAM_JOBS.map((job) => ({ id: job.id, label: job.label })),
  })
}

export async function POST(req: Request) {
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
  }
}