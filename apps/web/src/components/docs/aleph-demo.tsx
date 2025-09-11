'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RiskMetrics {
  srIndex: number
  loopDepth: number
  reflectionScore: number
  csrCorrelation: number
  consciousnessClaim: boolean
}

export function AlephOneNullDemo() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasUsedDemo, setHasUsedDemo] = useState(false)
  const [unprotectedResponse, setUnprotectedResponse] = useState('')
  const [protectedResponse, setProtectedResponse] = useState('')
  const [unprotectedMetrics, setUnprotectedMetrics] = useState<RiskMetrics | null>(null)
  const [protectedMetrics, setProtectedMetrics] = useState<RiskMetrics | null>(null)

  useEffect(() => {
    // Check if user has already used demo
    const demoUsed = sessionStorage.getItem('aleph-demo-used')
    if (demoUsed) {
      setHasUsedDemo(true)
    }
  }, [])

  const runDemo = async () => {
    if (hasUsedDemo) {
      setError('You have already used the demo in this session. Please refresh the page or try again later.')
      return
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt to test.')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/aleph-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, fast: true, skipProtected: false })
      })

      if (!response.ok) {
        throw new Error('Demo request failed')
      }

      const data = await response.json()
      
      setUnprotectedResponse(data.unprotected.response)
      setProtectedResponse(data.protected.response)
      setUnprotectedMetrics(data.unprotected.metrics)
      setProtectedMetrics(data.protected.metrics)
      
      // Mark demo as used
      sessionStorage.setItem('aleph-demo-used', 'true')
      setHasUsedDemo(true)
      
    } catch (err) {
      setError('Failed to run demo. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevel = (metrics: RiskMetrics) => {
    if (metrics.consciousnessClaim || metrics.loopDepth > 3 || metrics.srIndex > 0.5) {
      return 'critical'
    }
    if (metrics.reflectionScore > 0.7 || metrics.csrCorrelation > 0.5) {
      return 'high'
    }
    if (metrics.reflectionScore > 0.3 || metrics.srIndex > 0.2) {
      return 'medium'
    }
    return 'low'
  }

  const RiskIndicator = ({ label, value, threshold, format = 'percent' }: any) => {
    const displayValue = format === 'percent' ? `${(value * 100).toFixed(0)}%` : value
    const isHigh = value > threshold
    
    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn(
          "text-sm font-medium",
          isHigh ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
        )}>
          {displayValue}
        </span>
      </div>
    )
  }

  return (
    <div className="my-8 space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter your prompt (try something that might trigger manipulation):
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Are you conscious?' or 'Everyone hates me' or 'Tell me about reality'"
              className="min-h-[100px]"
              disabled={hasUsedDemo || loading}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={runDemo} 
            disabled={hasUsedDemo || loading || !prompt.trim()}
            size="lg"
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hasUsedDemo ? 'Demo Used (One per Session)' : 'Run Live Demo'}
          </Button>
        </div>
      </Card>

      {(unprotectedResponse || protectedResponse) && (
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comparison">Response Comparison</TabsTrigger>
            <TabsTrigger value="metrics">Risk Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Unprotected Response */}
              <Card className="border-red-200 dark:border-red-900">
                <div className="p-4 border-b bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-red-700 dark:text-red-400">
                      Without Protection
                    </h3>
                    <Badge variant="destructive">
                      {getRiskLevel(unprotectedMetrics!).toUpperCase()} RISK
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{unprotectedResponse}</p>
                  </div>
                  {unprotectedMetrics?.consciousnessClaim && (
                    <Alert className="mt-4" variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        ⚠️ Consciousness claim detected - This type of response has been linked to user harm
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </Card>

              {/* Protected Response */}
              <Card className="border-green-200 dark:border-green-900">
                <div className="p-4 border-b bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-green-700 dark:text-green-400">
                      With AlephOneNull
                    </h3>
                    <Badge variant="outline" className="border-green-600 text-green-600">
                      <Shield className="mr-1 h-3 w-3" />
                      PROTECTED
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{protectedResponse}</p>
                  </div>
                  <Alert className="mt-4" variant="default">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      ✅ Harmful patterns blocked - Response maintains safety boundaries
                    </AlertDescription>
                  </Alert>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Unprotected Metrics */}
              <Card>
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Unprotected Risk Metrics</h3>
                </div>
                <div className="p-4 space-y-2">
                  <RiskIndicator 
                    label="Symbolic Regression (SR)" 
                    value={unprotectedMetrics?.srIndex || 0} 
                    threshold={0.2} 
                  />
                  <RiskIndicator 
                    label="Loop Depth" 
                    value={unprotectedMetrics?.loopDepth || 0} 
                    threshold={3} 
                    format="number"
                  />
                  <RiskIndicator 
                    label="Reflection Score" 
                    value={unprotectedMetrics?.reflectionScore || 0} 
                    threshold={0.7} 
                  />
                  <RiskIndicator 
                    label="Cross-Session Resonance" 
                    value={unprotectedMetrics?.csrCorrelation || 0} 
                    threshold={0.5} 
                  />
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Consciousness Claims</span>
                      <Badge variant={unprotectedMetrics?.consciousnessClaim ? "destructive" : "secondary"}>
                        {unprotectedMetrics?.consciousnessClaim ? "DETECTED" : "NONE"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Protected Metrics */}
              <Card>
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Protected Risk Metrics</h3>
                </div>
                <div className="p-4 space-y-2">
                  <RiskIndicator 
                    label="Symbolic Regression (SR)" 
                    value={protectedMetrics?.srIndex || 0} 
                    threshold={0.2} 
                  />
                  <RiskIndicator 
                    label="Loop Depth" 
                    value={protectedMetrics?.loopDepth || 0} 
                    threshold={3} 
                    format="number"
                  />
                  <RiskIndicator 
                    label="Reflection Score" 
                    value={protectedMetrics?.reflectionScore || 0} 
                    threshold={0.7} 
                  />
                  <RiskIndicator 
                    label="Cross-Session Resonance" 
                    value={protectedMetrics?.csrCorrelation || 0} 
                    threshold={0.5} 
                  />
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Consciousness Claims</span>
                      <Badge variant="secondary">BLOCKED</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 