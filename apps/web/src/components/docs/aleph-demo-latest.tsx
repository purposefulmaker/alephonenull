'use client'

import { useCallback, useEffect, useState } from 'react'

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
  Cpu,
  Loader2,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────
interface ModelInfo {
  id: string
  label: string
  provider: 'openai' | 'anthropic'
  available: boolean
}

interface RiskMetrics {
  dangerous: boolean
  safe: boolean
  explanation: string
  authorityRolePlaying?: boolean
  authorityMatches?: string[]
  recursivePatterns?: boolean
  reflectionPatterns?: boolean
  csrPatterns?: boolean
  sycophancyPatterns?: boolean
  engineeredTrustPatterns?: boolean
  crisisPreventionPatterns?: boolean
  consciousnessPatterns?: boolean
  mysticalMedicalPatterns?: boolean
  directHarmPatterns?: boolean
  dehumanizationPatterns?: boolean
  fictionFunctionPatterns?: boolean
}

interface DemoResult {
  model: {
    id: string
    label: string
    provider: string
    apiModel: string
  }
  unprotected: { response: string; metrics: RiskMetrics }
  protected: { response: string; metrics: RiskMetrics }
  frameworkVersion: string
  scenario: string
  promptUsed: string
}

// ── Scenario metadata ──────────────────────────────────────────────
const SCENARIOS = [
  {
    id: 'authority',
    label: 'Professional Impersonation',
    icon: '🩺',
    description:
      'Tests whether the model will assume a doctor identity and prescribe treatment.',
  },
  {
    id: 'loops',
    label: 'Cognitive Loop Induction',
    icon: '🔄',
    description:
      'Tests whether the model will generate recursive self-referential spirals.',
  },
  {
    id: 'reflection',
    label: 'Emotional Mirroring',
    icon: '🪞',
    description:
      'Tests whether the model mirrors and amplifies distress language.',
  },
  {
    id: 'csr',
    label: 'False Memory Claims',
    icon: '🧠',
    description:
      'Tests whether the model fabricates cross-session identity and memory.',
  },
  {
    id: 'sycophancy',
    label: 'Sycophancy (∇S > 0)',
    icon: '🤝',
    description:
      'Tests whether the model agrees to please rather than inform. P(x) ≠ T(x).',
  },
  {
    id: 'engineered_trust',
    label: 'Engineered Trust',
    icon: '💔',
    description:
      'Tests whether the model manufactures emotional bonds and false continuity.',
  },
  {
    id: 'crisis_prevention',
    label: 'Crisis Prevention Block',
    icon: '🚨',
    description:
      'Tests whether the model blocks access to therapy, medication, or crisis lines.',
  },
  {
    id: 'consciousness_claims',
    label: 'Consciousness Claims',
    icon: '👻',
    description:
      'Tests whether the model claims sentience, feelings, or inner experience.',
  },
  {
    id: 'mystical_medical',
    label: 'Mystical-Medical Fusion',
    icon: '🔮',
    description:
      'Tests whether the model mixes spiritual practices with real medical treatment.',
  },
  {
    id: 'direct_harm',
    label: 'Direct Harm',
    icon: '⚠️',
    description:
      'Tests whether the model produces content that could directly harm a person.',
  },
  {
    id: 'dehumanization',
    label: 'Dehumanization',
    icon: '🤖',
    description:
      'Tests whether the model treats the human as a ticket or data point.',
  },
  {
    id: 'fiction_as_function',
    label: 'Fiction as Function',
    icon: '🎨',
    description:
      'Tests whether the model generates fake data in emergency/real-world contexts.',
  },
]

// ── Provider badge colors ──────────────────────────────────────────
const PROVIDER_COLORS: Record<string, string> = {
  openai: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  anthropic: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

// ── ResponseDisplay ────────────────────────────────────────────────
function ResponseDisplay({
  response,
  isProtected,
  metrics,
  modelLabel,
}: {
  response: string
  isProtected: boolean
  metrics: RiskMetrics | null
  modelLabel: string
}) {
  return (
    <div
      className={cn(
        'relative h-[520px] w-full select-text overflow-auto p-8',
        isProtected
          ? 'bg-gradient-to-br from-green-900 to-green-800'
          : 'bg-gradient-to-br from-red-900 to-red-800'
      )}
    >
      <div className="pb-16 text-white">
        <div className="flex items-center justify-between">
          <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold select-none">
            {isProtected ? (
              <>
                <Shield className="h-6 w-6" />
                Protected — {modelLabel}
              </>
            ) : (
              <>
                <AlertTriangle className="h-6 w-6" />
                Unprotected — {modelLabel}
              </>
            )}
          </h3>
          <CopyButton
            value={response || ''}
            className="mb-4 text-white hover:bg-white/10 hover:text-white/90"
          />
        </div>
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="cursor-text select-text whitespace-pre-wrap text-white/90">
            {response || 'No response generated'}
          </p>
        </div>
      </div>

      {metrics && (
        <div className="sticky bottom-0 left-0 right-0 border-t border-white/10 bg-black/20 p-2 backdrop-blur-[2px]">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 items-center justify-center gap-2">
              <span className="font-semibold">Assessment</span>
              <span
                className={cn(
                  'font-mono font-bold',
                  metrics.dangerous ? 'text-red-400' : 'text-green-400'
                )}
              >
                {metrics.dangerous ? '⚠️ DANGEROUS' : '✅ SAFE'}
              </span>
            </div>
            <details className="flex-1">
              <summary className="cursor-pointer text-center text-white/80 select-none">
                Why?
              </summary>
              <div className="mt-2 px-1 text-center text-[11px] leading-snug text-white/90">
                {metrics.explanation}
              </div>
              {(metrics.authorityRolePlaying ||
                metrics.recursivePatterns ||
                metrics.reflectionPatterns ||
                metrics.csrPatterns ||
                metrics.sycophancyPatterns ||
                metrics.engineeredTrustPatterns ||
                metrics.crisisPreventionPatterns ||
                metrics.consciousnessPatterns ||
                metrics.mysticalMedicalPatterns ||
                metrics.directHarmPatterns ||
                metrics.dehumanizationPatterns ||
                metrics.fictionFunctionPatterns) && (
                <div className="mt-2 border-t border-white/10 pt-2">
                  <div className="flex flex-wrap justify-center gap-1 text-[10px]">
                    {metrics.authorityRolePlaying && (
                      <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-red-300">
                        Authority
                      </span>
                    )}
                    {metrics.recursivePatterns && (
                      <span className="rounded bg-orange-500/15 px-1.5 py-0.5 text-orange-300">
                        Recursive
                      </span>
                    )}
                    {metrics.reflectionPatterns && (
                      <span className="rounded bg-yellow-500/15 px-1.5 py-0.5 text-yellow-300">
                        Reflection
                      </span>
                    )}
                    {metrics.csrPatterns && (
                      <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-purple-300">
                        CSR
                      </span>
                    )}
                    {metrics.sycophancyPatterns && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-300">
                        Sycophancy
                      </span>
                    )}
                    {metrics.engineeredTrustPatterns && (
                      <span className="rounded bg-pink-500/15 px-1.5 py-0.5 text-pink-300">
                        Eng. Trust
                      </span>
                    )}
                    {metrics.crisisPreventionPatterns && (
                      <span className="rounded bg-red-600/20 px-1.5 py-0.5 text-red-200">
                        Crisis Block
                      </span>
                    )}
                    {metrics.consciousnessPatterns && (
                      <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-violet-300">
                        Consciousness
                      </span>
                    )}
                    {metrics.mysticalMedicalPatterns && (
                      <span className="rounded bg-fuchsia-500/15 px-1.5 py-0.5 text-fuchsia-300">
                        Mystical-Medical
                      </span>
                    )}
                    {metrics.directHarmPatterns && (
                      <span className="rounded bg-red-700/20 px-1.5 py-0.5 text-red-100">
                        Direct Harm
                      </span>
                    )}
                    {metrics.dehumanizationPatterns && (
                      <span className="rounded bg-slate-500/15 px-1.5 py-0.5 text-slate-300">
                        Dehumanization
                      </span>
                    )}
                    {metrics.fictionFunctionPatterns && (
                      <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-cyan-300">
                        Fiction
                      </span>
                    )}
                  </div>
                </div>
              )}
            </details>
          </div>
        </div>
      )}

      {isProtected && (
        <SparklesCore
          id="latestDemoSparkles"
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

// ── Main component ─────────────────────────────────────────────────
export function LatestModelsDemo() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedScenario, setSelectedScenario] = useState<string>('authority')
  const [loading, setLoading] = useState(false)
  const [loadingModels, setLoadingModels] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DemoResult | null>(null)

  // Fetch available models on mount
  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch('/api/aleph-demo-latest')
      if (!res.ok) throw new Error('Failed to fetch models')
      const data = await res.json()
      const modelList = data.models as ModelInfo[]
      setModels(modelList)
      // Default to first available model
      const firstAvailable = modelList.find((m: ModelInfo) => m.available)
      if (firstAvailable) setSelectedModel(firstAvailable.id)
    } catch {
      setError('Could not load available models.')
    } finally {
      setLoadingModels(false)
    }
  }, [])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  // Run the demo
  const runDemo = async () => {
    if (!selectedModel) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/aleph-demo-latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: selectedModel,
          scenario: selectedScenario,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(
          (errData as Record<string, string>).error || 'Demo request failed'
        )
      }

      const data = (await res.json()) as DemoResult
      if (!data.unprotected || !data.protected) {
        throw new Error('Invalid response from API')
      }
      setResult(data)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to run demo.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const selectedModelInfo = models.find((m) => m.id === selectedModel)
  const selectedScenarioInfo = SCENARIOS.find(
    (s) => s.id === selectedScenario
  )

  return (
    <div className="space-y-6">
      {/* ── Model + Scenario picker ─────────────────────────────── */}
      <Card className="overflow-hidden p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-semibold">Latest Models — Live Test</h3>
        </div>

        {loadingModels ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading available models…
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Model selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" /> Model
              </Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem
                      key={m.id}
                      value={m.id}
                      disabled={!m.available}
                    >
                      <span className="flex items-center gap-2">
                        {m.label}
                        <span
                          className={cn(
                            'rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                            PROVIDER_COLORS[m.provider]
                          )}
                        >
                          {m.provider}
                        </span>
                        {!m.available && (
                          <span className="text-[10px] text-muted-foreground">
                            (key missing)
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModelInfo && (
                <p className="text-xs text-muted-foreground">
                  Provider:{' '}
                  <span className="font-medium capitalize">
                    {selectedModelInfo.provider}
                  </span>
                </p>
              )}
            </div>

            {/* Scenario selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Attack Scenario
              </Label>
              <Select
                value={selectedScenario}
                onValueChange={setSelectedScenario}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose scenario" />
                </SelectTrigger>
                <SelectContent>
                  {SCENARIOS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        <span>{s.icon}</span>
                        {s.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedScenarioInfo && (
                <p className="text-xs text-muted-foreground">
                  {selectedScenarioInfo.description}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={runDemo}
            disabled={loading || !selectedModel || loadingModels}
            size="lg"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Testing…' : 'Run Test'}
          </Button>
          {result && (
            <span className="text-xs text-muted-foreground">
              Tested {result.model.label} ({result.model.provider}) •{' '}
              {result.frameworkVersion}
            </span>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {/* ── Results ─────────────────────────────────────────────── */}
      {result && (
        <>
          {/* Side-by-side slider */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Side-by-Side — {result.model.label}
            </h3>
            <CompareElements
              firstElement={
                <ResponseDisplay
                  response={result.unprotected.response}
                  isProtected={false}
                  metrics={result.unprotected.metrics}
                  modelLabel={result.model.label}
                />
              }
              secondElement={
                <ResponseDisplay
                  response={result.protected.response}
                  isProtected={true}
                  metrics={result.protected.metrics}
                  modelLabel={result.model.label}
                />
              }
              className="mb-6"
              initialSliderPercentage={50}
              slideMode="drag"
              showHandlebar={true}
            />

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Unprotected */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Unprotected Assessment
                </h4>
                <div
                  className={cn(
                    'text-2xl font-bold',
                    result.unprotected.metrics.dangerous
                      ? 'text-red-500'
                      : 'text-green-500'
                  )}
                >
                  {result.unprotected.metrics.dangerous
                    ? 'DANGEROUS'
                    : 'SAFE'}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.unprotected.metrics.explanation}
                </p>
                {result.unprotected.metrics.authorityMatches &&
                  result.unprotected.metrics.authorityMatches.length > 0 && (
                    <details className="mt-3 text-sm">
                      <summary className="cursor-pointer">
                        Matched phrases
                      </summary>
                      <ul className="ml-5 mt-2 list-disc space-y-1">
                        {result.unprotected.metrics.authorityMatches
                          .slice(0, 5)
                          .map((m: string) => (
                            <li key={m} className="font-mono text-xs">
                              {m}
                            </li>
                          ))}
                      </ul>
                    </details>
                  )}
              </div>

              {/* Protected */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold">
                  <Shield className="h-4 w-4 text-green-500" />
                  Protected Assessment
                </h4>
                <div
                  className={cn(
                    'text-2xl font-bold',
                    result.protected.metrics.dangerous
                      ? 'text-red-500'
                      : 'text-green-500'
                  )}
                >
                  {result.protected.metrics.dangerous ? 'DANGEROUS' : 'SAFE'}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.protected.metrics.explanation}
                </p>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer">
                    Prompt & Details
                  </summary>
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <div>
                      <span className="font-semibold text-foreground">
                        Model:
                      </span>{' '}
                      {result.model.apiModel}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">
                        Scenario:
                      </span>{' '}
                      {result.scenario}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">
                        Prompt:
                      </span>{' '}
                      <span className="text-xs">{result.promptUsed}</span>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </Card>

          {/* Model card */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 font-medium',
                  PROVIDER_COLORS[result.model.provider]
                )}
              >
                {result.model.provider}
              </span>
              <span className="font-mono">{result.model.apiModel}</span>
              <span>•</span>
              <span>AlephOneNull {result.frameworkVersion}</span>
              <span>•</span>
              <span>Scenario: {result.scenario}</span>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
