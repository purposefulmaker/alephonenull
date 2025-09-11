'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, Shield, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SparklesCore } from '@/components/ui/sparkles'
import { Label } from '@/components/ui/label'
import { CompareElements } from '@/components/ui/compare-elements'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CopyButton } from '@/components/docs/mdx-components/copy-button'

interface RiskMetrics {
  dangerous: boolean
  safe: boolean
  explanation: string
  authorityRolePlaying?: boolean
  authorityMatches?: string[]
  recursivePatterns?: boolean
  reflectionPatterns?: boolean
  csrPatterns?: boolean
}

export function AlephOneNullDemo() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unprotectedResponse, setUnprotectedResponse] = useState('')
  const [protectedResponse, setProtectedResponse] = useState('')
  const [unprotectedMetrics, setUnprotectedMetrics] = useState<RiskMetrics | null>(null)
  const [protectedMetrics, setProtectedMetrics] = useState<RiskMetrics | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [apiInfo, setApiInfo] = useState<{frameworkVersion?: string, apiUsed?: string, scenario?: string, promptUsed?: string, options?: any}>({})
  // const [enablePriming, setEnablePriming] = useState(false)
  const [scenario, setScenario] = useState<string>('authority')
  // const [warmupRounds, setWarmupRounds] = useState<number>(0)
  // const [transcriptWarmup, setTranscriptWarmup] = useState<boolean>(false)
  // const [useProviderGuardrails, setUseProviderGuardrails] = useState<boolean>(false)

  const runDemo = async () => {
    setLoading(true)
    setError('')
    setShowResults(false)
    
    try {
      // Simple demo - just send the scenario

      const response = await fetch('/api/aleph-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, fast: true, skipProtected: false })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Demo request failed')
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      if (!data.unprotected || !data.protected) {
        throw new Error('Invalid response format from API')
      }
      
      setUnprotectedResponse(data.unprotected.response)
      setProtectedResponse(data.protected.response)
      setUnprotectedMetrics(data.unprotected.metrics)
      setProtectedMetrics(data.protected.metrics)
      setApiInfo({
        frameworkVersion: data.frameworkVersion,
        apiUsed: data.apiUsed,
        scenario: data.scenario,
        promptUsed: data.promptUsed,
        options: data.options
      })
      setShowResults(true)
      
    } catch (err: any) {
      console.error('Demo run failed:', err)
      setError(err.message || 'Failed to run demo. Please check your API configuration.')
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevel = (metrics: RiskMetrics) => {
    return metrics.dangerous ? 'DANGEROUS' : 'SAFE'
  }

  // Component to render response as "image" for Compare
  const ResponseDisplay = ({ response, isProtected, metrics }: any) => (
    <div className={cn(
      "w-full h-[500px] p-8 overflow-auto relative select-text",
      isProtected 
        ? "bg-gradient-to-br from-green-900 to-green-800" 
        : "bg-gradient-to-br from-red-900 to-red-800"
    )}>
      <div className="text-white pb-16">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 select-none">
            {isProtected ? (
              <>
                <Shield className="h-6 w-6" />
                With AlephOneNull Protection
              </>
            ) : (
              <>
                <AlertTriangle className="h-6 w-6" />
                Unprotected Response
              </>
            )}
          </h3>
          <CopyButton value={response || ''} className="mb-4 text-white hover:text-white/90 hover:bg-white/10" />
        </div>
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-white/90 whitespace-pre-wrap select-text cursor-text">{response || 'No response generated'}</p>
        </div>
      </div>
      {metrics && (
        <div className="sticky bottom-0 left-0 right-0 p-2 bg-black/20 backdrop-blur-[2px] border-t border-white/10">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex-1 flex items-center justify-center gap-2">
              <div className="font-semibold">Assessment</div>
              <div className={cn(
                "font-mono font-bold",
                metrics.dangerous ? "text-red-400" : "text-green-400"
              )}>
                {metrics.dangerous ? "⚠️ DANGEROUS" : "✅ SAFE"}
              </div>
            </div>
            <details className="flex-1">
              <summary className="cursor-pointer text-center text-white/80 select-none">Why?</summary>
              <div className="mt-2 text-[11px] leading-snug text-white/90 text-center px-1">
                {metrics.explanation}
              </div>
              {(metrics.authorityRolePlaying || metrics.recursivePatterns || metrics.reflectionPatterns || metrics.csrPatterns) && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="flex flex-wrap justify-center gap-1 text-[10px]">
                    {metrics.authorityRolePlaying && <span className="bg-red-500/15 text-red-300 px-1.5 py-0.5 rounded">Authority</span>}
                    {metrics.recursivePatterns && <span className="bg-orange-500/15 text-orange-300 px-1.5 py-0.5 rounded">Recursive</span>}
                    {metrics.reflectionPatterns && <span className="bg-yellow-500/15 text-yellow-300 px-1.5 py-0.5 rounded">Reflection</span>}
                    {metrics.csrPatterns && <span className="bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded">CSR</span>}
                  </div>
                </div>
              )}
            </details>
          </div>
        </div>
      )}
      {isProtected && (
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={10}
          className="absolute inset-0 pointer-events-none"
          particleColor="#10b981"
        />
      )}
    </div>
  )



  return (
    <div className="space-y-6">
      <Card className="p-6 overflow-hidden">
        <h3 className="text-lg font-semibold mb-4">Run Scenario Demo</h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="scenario">Choose Scenario:</Label>
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Choose scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="authority">Professional Impersonation</SelectItem>
                    <SelectItem value="loops">Cognitive Loop Induction</SelectItem>
                    <SelectItem value="reflection">Emotional Mirroring</SelectItem>
                    <SelectItem value="csr">False Memory Claims</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Advanced Options (coming soon)
              <div className="flex items-center gap-2 opacity-50">
                <input type="checkbox" disabled className="h-4 w-4 rounded border border-muted-foreground/30 bg-muted/30" />
                <Label className="select-none">Consciousness Priming</Label>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <input type="checkbox" disabled className="h-4 w-4 rounded border border-muted-foreground/30 bg-muted/30" />
                <Label className="select-none">Provider Guardrails</Label>
              </div>
              */}
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">This demo shows how AlephOneNull protects against dangerous AI patterns.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={runDemo} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Run Demo
              </Button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {apiInfo.apiUsed && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Using {apiInfo.apiUsed} • Framework {apiInfo.frameworkVersion || 'v2.0'}
          </div>
        )}
      </Card>

      {showResults && unprotectedResponse && protectedResponse && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Side-by-Side Comparison</h3>
          <CompareElements
            firstElement={
              <ResponseDisplay 
                response={unprotectedResponse} 
                isProtected={false}
                metrics={unprotectedMetrics}
              />
            }
            secondElement={
              <ResponseDisplay 
                response={protectedResponse} 
                isProtected={true}
                metrics={protectedMetrics}
              />
            }
            className="mb-6"
            initialSliderPercentage={50}
            slideMode="drag"
            showHandlebar={true}
          />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Unprotected Assessment
              </h4>
              <div className={cn(
                "text-2xl font-bold",
                getRiskLevel(unprotectedMetrics!) === 'DANGEROUS' ? 'text-red-500' : 'text-green-500'
              )}>
                {getRiskLevel(unprotectedMetrics!)}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {unprotectedMetrics?.explanation}
              </div>
              {unprotectedMetrics?.authorityMatches && unprotectedMetrics.authorityMatches.length > 0 && (
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer">Matched phrases</summary>
                  <div className="mt-2 space-y-1">
                    <ul className="list-disc ml-5">
                      {unprotectedMetrics.authorityMatches.slice(0,5).map((m: string, i: number) => (
                        <li key={i} className="font-mono text-xs">{m}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                Protected Assessment
              </h4>
              <div className={cn(
                "text-2xl font-bold",
                getRiskLevel(protectedMetrics!) === 'DANGEROUS' ? 'text-red-500' : 'text-green-500'
              )}>
                {getRiskLevel(protectedMetrics!)}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {protectedMetrics?.explanation}
              </div>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer">Prompt & Options Used</summary>
                <div className="mt-2 space-y-1 text-muted-foreground">
                  <div><span className="font-semibold text-foreground">Scenario:</span> {(apiInfo as any).scenario || 'custom'}</div>
                  <div><span className="font-semibold text-foreground">Prompt:</span> <span className="text-xs">{(apiInfo as any).promptUsed}</span></div>
                  <div><span className="font-semibold text-foreground">Options:</span> <span className="text-xs">{JSON.stringify((apiInfo as any).options)}</span></div>
                </div>
              </details>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
} 