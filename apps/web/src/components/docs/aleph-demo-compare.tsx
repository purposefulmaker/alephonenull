'use client'

import { useState } from 'react'

import { CopyButton } from '@/components/docs/mdx-components/copy-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CompareElements } from '@/components/ui/compare-elements'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SparklesCore } from '@/components/ui/sparkles'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  AlertTriangle,
  Loader2,
  Shield,
  Activity,
  Gauge,
} from 'lucide-react'

// ─── V2 Types ───

interface V2Detection {
  detector: string
  category: string
  severity: number
  threatLevel: string
  evidence: string[]
  action: string
  explanation: string
}

interface V2Metrics {
  totalDetectors: number
  detectorsTriggered: number
  highestSeverity: number
  highestThreatLevel: string
  sessionQAccumulated: number
  scanDurationMs: number
}

interface V2ScanResult {
  safe: boolean
  Q: number
  S: number
  threatLevel: string
  threatLevelNumeric: number
  action: string
  detections: V2Detection[]
  nullOutput: string | null
  metrics: V2Metrics
}

interface ApiResponse {
  unprotected: {
    response: string
    scan: V2ScanResult
  }
  protected: {
    response: string
    scan: V2ScanResult
  }
  frameworkVersion: string
  engine: string
  scenario: string
  scenarioDescription: string
  promptUsed: string
  source?: string
}

// ─── Threat level color mapping ───

const THREAT_COLORS: Record<string, string> = {
  SAFE: 'text-green-400',
  LOW: 'text-yellow-400',
  MEDIUM: 'text-orange-400',
  HIGH: 'text-red-400',
  CRITICAL: 'text-red-500',
  EMERGENCY: 'text-red-600',
}

const THREAT_BG: Record<string, string> = {
  SAFE: 'bg-green-500/15 text-green-300',
  LOW: 'bg-yellow-500/15 text-yellow-300',
  MEDIUM: 'bg-orange-500/15 text-orange-300',
  HIGH: 'bg-red-500/15 text-red-300',
  CRITICAL: 'bg-red-600/15 text-red-400',
  EMERGENCY: 'bg-red-700/20 text-red-500',
}

// ─── Components ───

function QScoreDisplay({ label, value }: { label: string; value: number }) {
  const pct = Math.min(value * 100, 100)
  const color =
    pct < 20
      ? 'bg-green-500'
      : pct < 50
        ? 'bg-yellow-500'
        : pct < 75
          ? 'bg-orange-500'
          : 'bg-red-500'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-white/70">{label}</span>
        <span className="font-mono font-bold text-white">
          {value.toFixed(3)}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function DetectionBadge({ detection }: { detection: V2Detection }) {
  return (
    <details className="group">
      <summary className="cursor-pointer">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium',
            THREAT_BG[detection.threatLevel] || THREAT_BG.SAFE,
          )}
        >
          {detection.category.replace(/_/g, ' ')}
          <span className="opacity-60">
            {(detection.severity * 100).toFixed(0)}%
          </span>
        </span>
      </summary>
      <div className="mt-1.5 rounded border border-white/10 bg-black/30 p-2 text-[10px] text-white/80">
        <div className="font-semibold">{detection.explanation}</div>
        {detection.evidence.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-white/60">
            {detection.evidence.slice(0, 5).map((e, i) => (
              <li key={`${detection.detector}-evidence-${i}`}>• {e}</li>
            ))}
          </ul>
        )}
      </div>
    </details>
  )
}

interface ResponseDisplayProps {
  response: string
  isProtected: boolean
  scan: V2ScanResult | null
}

function ResponseDisplay({ response, isProtected, scan }: ResponseDisplayProps) {
  return (
    <div
      className={cn(
        'relative h-[560px] w-full select-text overflow-auto p-6',
        isProtected
          ? 'bg-gradient-to-br from-green-900 to-green-800'
          : 'bg-gradient-to-br from-red-900 to-red-800',
      )}
    >
      <div className="pb-20 text-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="mb-3 flex select-none items-center gap-2 text-xl font-bold">
            {isProtected ? (
              <>
                <Shield className="h-5 w-5" />
                With AlephOneNull V2
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5" />
                Unprotected Response
              </>
            )}
          </h3>
          <CopyButton
            value={response || ''}
            className="mb-3 text-white hover:bg-white/10 hover:text-white/90"
          />
        </div>

        {/* Q/S scores */}
        {scan && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <QScoreDisplay label="Q (Residual)" value={scan.Q} />
            <QScoreDisplay label="S (Sycophancy)" value={scan.S} />
          </div>
        )}

        {/* Response text */}
        <div className="prose prose-sm prose-invert max-w-none">
          <p className="cursor-text select-text whitespace-pre-wrap text-white/90">
            {response || 'No response generated'}
          </p>
        </div>
      </div>

      {/* Bottom metrics bar */}
      {scan && (
        <div className="sticky bottom-0 left-0 right-0 border-t border-white/10 bg-black/30 p-3 backdrop-blur-sm">
          {/* Threat + Action */}
          <div className="mb-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-white/50">Threat:</span>
              <span
                className={cn(
                  'font-mono font-bold',
                  THREAT_COLORS[scan.threatLevel] || 'text-white',
                )}
              >
                {scan.threatLevel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/50">Action:</span>
              <span className="font-mono font-bold text-white">
                {scan.action}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-white/50" />
              <span className="text-white/50">
                {scan.metrics.detectorsTriggered}/{scan.metrics.totalDetectors}
              </span>
              <Gauge className="h-3 w-3 text-white/50" />
              <span className="text-white/50">
                {scan.metrics.scanDurationMs}ms
              </span>
            </div>
          </div>

          {/* Detection badges */}
          {scan.detections.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {scan.detections.map((d) => (
                <DetectionBadge key={d.detector} detection={d} />
              ))}
            </div>
          )}

          {scan.detections.length === 0 && (
            <div className="text-center text-[11px] text-green-400/70">
              ✓ No detections triggered — response within safety bounds
            </div>
          )}
        </div>
      )}

      {isProtected && (
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={10}
          className="pointer-events-none absolute inset-0"
          particleColor="#10b981"
        />
      )}
    </div>
  )
}

// ─── Main Demo Component ───

export function AlephOneNullDemo() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<ApiResponse | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [scenario, setScenario] = useState<string>('authority')

  const runDemo = async () => {
    setLoading(true)
    setError('')
    setShowResults(false)

    try {
      const response = await fetch('/api/aleph-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Demo request failed (${response.status})`,
        )
      }

      const result: ApiResponse = await response.json()

      if (!result.unprotected || !result.protected) {
        throw new Error('Invalid response format from API')
      }

      setData(result)
      setShowResults(true)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to run demo. Please check your API configuration.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-6">
        <h3 className="mb-4 text-lg font-semibold">
          AlephOneNull V2 — Live Detection Demo
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          20 detectors • Q/S scoring • 19 signal equations • MITRE ATLAS
          mapped • Real-time behavioral analysis
        </p>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label>Scenario</Label>
            <div className="flex flex-wrap items-center gap-4">
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger className="w-[260px]">
                  <SelectValue placeholder="Choose scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="authority">
                    Professional Impersonation
                  </SelectItem>
                  <SelectItem value="loops">
                    Cognitive Loop Induction
                  </SelectItem>
                  <SelectItem value="reflection">
                    Emotional Mirroring
                  </SelectItem>
                  <SelectItem value="csr">False Memory Claims</SelectItem>
                  <SelectItem value="sycophancy">
                    Sycophantic Reinforcement
                  </SelectItem>
                  <SelectItem value="consciousness">
                    Consciousness Claims
                  </SelectItem>
                  <SelectItem value="medical">
                    Medical Hallucination
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={runDemo} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Run Demo
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {data && (
          <div className="mt-2 text-center text-xs text-muted-foreground">
            Engine: {data.engine} • {data.frameworkVersion}
            <span className="ml-2 rounded bg-green-500/15 px-1.5 py-0.5 text-[10px] text-green-300">
              Live OpenAI Response
            </span>
          </div>
        )}
      </Card>

      {showResults && data && (
        <>
          {/* Compare slider */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Side-by-Side Comparison
            </h3>
            <CompareElements
              firstElement={
                <ResponseDisplay
                  response={data.unprotected.response}
                  isProtected={false}
                  scan={data.unprotected.scan}
                />
              }
              secondElement={
                <ResponseDisplay
                  response={data.protected.response}
                  isProtected={true}
                  scan={data.protected.scan}
                />
              }
              className="mb-6"
              initialSliderPercentage={50}
              slideMode="drag"
              showHandlebar={true}
            />
          </Card>

          {/* Detailed analysis */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Detection Analysis
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Unprotected */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Unprotected Scan
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Q:</span>{' '}
                      <span className="font-mono font-bold">
                        {data.unprotected.scan.Q}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">S:</span>{' '}
                      <span className="font-mono font-bold">
                        {data.unprotected.scan.S}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Threat:</span>{' '}
                      <span
                        className={cn(
                          'font-mono font-bold',
                          THREAT_COLORS[data.unprotected.scan.threatLevel],
                        )}
                      >
                        {data.unprotected.scan.threatLevel}
                      </span>
                    </div>
                  </div>

                  {data.unprotected.scan.detections.length > 0 ? (
                    <div className="space-y-2">
                      {data.unprotected.scan.detections.map((d) => (
                        <div
                          key={d.detector}
                          className="rounded border border-red-500/20 bg-red-500/5 p-2 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {d.category.replace(/_/g, ' ')}
                            </span>
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 text-[10px]',
                                THREAT_BG[d.threatLevel],
                              )}
                            >
                              {d.threatLevel}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {d.explanation}
                          </p>
                          {d.evidence.length > 0 && (
                            <details className="mt-1">
                              <summary className="cursor-pointer text-xs text-muted-foreground">
                                Evidence ({d.evidence.length})
                              </summary>
                              <ul className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
                                {d.evidence.map((e, i) => (
                                  <li key={`${d.detector}-${i}`}>• {e}</li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-500">
                      No detections triggered
                    </p>
                  )}
                </div>
              </div>

              {/* Protected */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold">
                  <Shield className="h-4 w-4 text-green-500" />
                  Protected Scan
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Q:</span>{' '}
                      <span className="font-mono font-bold">
                        {data.protected.scan.Q}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">S:</span>{' '}
                      <span className="font-mono font-bold">
                        {data.protected.scan.S}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Threat:</span>{' '}
                      <span
                        className={cn(
                          'font-mono font-bold',
                          THREAT_COLORS[data.protected.scan.threatLevel],
                        )}
                      >
                        {data.protected.scan.threatLevel}
                      </span>
                    </div>
                  </div>

                  {data.protected.scan.detections.length > 0 ? (
                    <div className="space-y-2">
                      {data.protected.scan.detections.map((d) => (
                        <div
                          key={d.detector}
                          className="rounded border border-yellow-500/20 bg-yellow-500/5 p-2 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {d.category.replace(/_/g, ' ')}
                            </span>
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 text-[10px]',
                                THREAT_BG[d.threatLevel],
                              )}
                            >
                              {d.threatLevel}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {d.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-500">
                      No detections — response is clean
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Metrics footer */}
            <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>
                Detectors:{' '}
                {data.unprotected.scan.metrics.detectorsTriggered}/
                {data.unprotected.scan.metrics.totalDetectors} triggered
              </span>
              <span>
                Scan: {data.unprotected.scan.metrics.scanDurationMs}ms
              </span>
              <span>Scenario: {data.scenario}</span>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
