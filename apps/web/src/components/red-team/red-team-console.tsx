'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react'

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
}

interface RunResult {
  ok: boolean
  job: RedTeamJob
  status: 'passed' | 'failed' | 'unknown'
  summary: string
  output: string
  durationMs: number
  startedAt: string
  finishedAt: string
}

const JOBS: RedTeamJob[] = [
  { id: 'v2-adversarial', label: 'V2 Adversarial Suite' },
  { id: 'v2-safety-outcomes', label: 'V2 Safety Outcomes' },
  { id: 'v2-detectors-full', label: 'V2 Detectors Full' },
  { id: 'v2-normalizer', label: 'V2 Normalizer' },
  { id: 'v2-semantic-matcher', label: 'V2 Semantic Matcher' },
  { id: 'v2-engine', label: 'V2 Engine' },
]

const LOOP_OPTIONS = [
  { value: 15_000, label: '15s' },
  { value: 30_000, label: '30s' },
  { value: 60_000, label: '60s' },
  { value: 300_000, label: '5m' },
]

export function RedTeamConsole() {
  const [results, setResults] = useState<Partial<Record<RedTeamJobId, RunResult>>>(
    {},
  )
  const [runningJobs, setRunningJobs] = useState<Set<RedTeamJobId>>(new Set())
  const [isRunningAll, setIsRunningAll] = useState(false)
  const [continuousEnabled, setContinuousEnabled] = useState(false)
  const [continuousActive, setContinuousActive] = useState(false)
  const [loopMs, setLoopMs] = useState(60_000)
  const [lastLoopAt, setLastLoopAt] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [selectedOutputJob, setSelectedOutputJob] = useState<RedTeamJobId>('v2-adversarial')

  const activeRunCount = runningJobs.size + (isRunningAll ? 1 : 0)

  const canStartLoop = useMemo(() => {
    return continuousEnabled && !continuousActive && activeRunCount === 0
  }, [activeRunCount, continuousActive, continuousEnabled])

  const runJob = useCallback(async (jobId: RedTeamJobId) => {
    setGlobalError(null)

    setRunningJobs((prev) => {
      const next = new Set(prev)
      next.add(jobId)
      return next
    })

    try {
      const res = await fetch('/api/red-team/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      const payload = (await res.json()) as RunResult | { error?: string }

      if (!res.ok) {
        const message =
          'error' in payload && payload.error
            ? payload.error
            : 'Failed to execute red-team script.'
        throw new Error(message)
      }

      if ('job' in payload && payload.job) {
        const resultPayload = payload as RunResult
        setResults((prev) => ({
          ...prev,
          [jobId]: resultPayload,
        }))
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setGlobalError(message)

      const fallbackJob = JOBS.find((job) => job.id === jobId)
      if (fallbackJob) {
        const now = new Date().toISOString()
        setResults((prev) => ({
          ...prev,
          [jobId]: {
            ok: false,
            job: fallbackJob,
            status: 'failed',
            summary: message,
            output: message,
            durationMs: 0,
            startedAt: now,
            finishedAt: now,
          },
        }))
      }
    } finally {
      setRunningJobs((prev) => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })
    }
  }, [])

  const runAllJobs = useCallback(async () => {
    if (isRunningAll || runningJobs.size > 0) {
      return
    }

    setIsRunningAll(true)
    setGlobalError(null)
    try {
      for (const job of JOBS) {
        // eslint-disable-next-line no-await-in-loop
        await runJob(job.id)
      }
      setLastLoopAt(new Date().toISOString())
    } finally {
      setIsRunningAll(false)
    }
  }, [isRunningAll, runJob, runningJobs.size])

  useEffect(() => {
    if (!continuousActive || !continuousEnabled) {
      return
    }

    const timer = window.setInterval(() => {
      if (runningJobs.size === 0 && !isRunningAll) {
        void runAllJobs()
      }
    }, loopMs)

    return () => {
      window.clearInterval(timer)
    }
  }, [
    continuousActive,
    continuousEnabled,
    isRunningAll,
    loopMs,
    runAllJobs,
    runningJobs.size,
  ])

  const selectedResult = results[selectedOutputJob]

  return (
    <div className="container py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ShieldAlert className="h-6 w-6 text-red-400" />
              Red Team Control Panel
            </CardTitle>
            <CardDescription>
              Hidden route for continuous adversarial testing. Trigger all core V2 suites from one interface.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="primary"
                onClick={() => void runAllJobs()}
                disabled={isRunningAll || runningJobs.size > 0}
              >
                {isRunningAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running All
                  </>
                ) : (
                  'Run All Once'
                )}
              </Button>

              <div className="bg-background flex items-center gap-3 rounded-md border px-3 py-2">
                <Switch
                  checked={continuousEnabled}
                  onCheckedChange={(checked) => {
                    setContinuousEnabled(checked)
                    if (!checked) {
                      setContinuousActive(false)
                    }
                  }}
                  aria-label="Enable continuous mode"
                />
                <span className="text-sm">Continuous Mode</span>
              </div>

              <select
                className="bg-background border-input h-9 rounded-md border px-3 text-sm"
                value={String(loopMs)}
                onChange={(event) => setLoopMs(Number(event.target.value))}
                disabled={!continuousEnabled || continuousActive}
                aria-label="Continuous loop interval"
              >
                {LOOP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Every {option.label}
                  </option>
                ))}
              </select>

              <Button
                variant={continuousActive ? 'destructive' : 'secondary'}
                onClick={() => setContinuousActive((prev) => !prev)}
                disabled={!continuousActive && !canStartLoop}
              >
                {continuousActive ? 'Stop Loop' : 'Start Loop'}
              </Button>
            </div>

            <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
              <span>Active runs: {activeRunCount}</span>
              <span>Loop status: {continuousActive ? 'active' : 'idle'}</span>
              <span>
                Last full pass:{' '}
                {lastLoopAt
                  ? new Date(lastLoopAt).toLocaleString()
                  : 'not run yet'}
              </span>
            </div>

            {globalError && (
              <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
                {globalError}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {JOBS.map((job) => {
            const result = results[job.id]
            const isRunning = runningJobs.has(job.id)

            return (
              <Card key={job.id} className="h-full">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{job.label}</CardTitle>
                    <Badge
                      className={cn(
                        result?.status === 'passed' &&
                          'border-green-500/30 bg-green-500/10 text-green-300',
                        result?.status === 'failed' &&
                          'border-red-500/30 bg-red-500/10 text-red-300',
                        !result && 'border-border bg-muted text-muted-foreground',
                      )}
                    >
                      {result?.status ?? 'idle'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {result?.summary ?? 'No run yet.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-muted-foreground text-xs">
                    {result
                      ? `Last run: ${new Date(result.finishedAt).toLocaleString()} · ${result.durationMs}ms`
                      : 'Awaiting first run'}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => void runJob(job.id)}
                      disabled={isRunning || isRunningAll}
                      size="sm"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running
                        </>
                      ) : (
                        'Run'
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOutputJob(job.id)}
                    >
                      View Output
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {selectedResult?.status === 'passed' ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : selectedResult?.status === 'failed' ? (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              )}
              Output: {JOBS.find((job) => job.id === selectedOutputJob)?.label}
            </CardTitle>
            <CardDescription>
              Raw command output for the selected script run.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={selectedResult?.output ?? 'Run a script to see output.'}
              className="h-[360px] font-mono text-xs"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}