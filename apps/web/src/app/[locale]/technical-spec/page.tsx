import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowRight, Code, FlaskConical, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const implemented = [
  'UniversalDetector for explicit pattern and heuristic checks',
  'PatternLibrary for built-in and custom dangerous-pattern definitions',
  'NullSystem for safety and emergency intervention responses',
  'EnhancedAlephOneNull for combined detector checks and safer replacement text',
  'AlephOneNullV2 for multi-detector scan/process flows',
  'OpenAIWrapper for OpenAI-compatible calls with pre/post safety checks',
]

const researchDirections = [
  'Explicit session reset and stop-signal handling',
  'Training-time and decoding-time controls for risky mirroring',
  'Human-paced interaction controls for sensitive workflows',
  'Boundary controls for recursion and persistence experiments',
  'Cryptographic attestation for future build and policy verification',
]

const evaluationTargets = [
  {
    title: 'Detection Quality',
    items: [
      'Detection rate against a versioned test set',
      'False-positive rate for benign safety referrals',
      'False-negative examples that bypass detection',
    ],
  },
  {
    title: 'Intervention Quality',
    items: [
      'Dangerous content removed or replaced',
      'Replacement text reviewed for the target context',
      'Crisis resources checked for jurisdiction accuracy',
    ],
  },
  {
    title: 'Runtime Behavior',
    items: [
      'Median and p95 scan latency measured locally',
      'No unexpected package import output',
      'Build, lint, type-check, and test status recorded',
    ],
  },
]

export default function TechnicalSpecPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <Badge variant="outline" className="mb-4">
          Experimental Research Draft
        </Badge>
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Technical Specification
        </h1>
        <p className="mb-6 text-xl text-gray-600">
          Current implementation notes and proposed research requirements for
          AlephOneNull. This is not an enforceable compliance standard.
        </p>
      </div>

      <div className="mb-12 rounded-lg border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <FlaskConical className="mt-1 size-5 text-amber-700" />
          <div>
            <h2 className="mb-3 text-2xl font-bold text-amber-950">
              Research Status
            </h2>
            <p className="text-amber-900">
              AlephOneNull is experimental research software. It is not
              certified, not independently validated, and not approved for
              production, medical, financial, government, or other
              safety-critical use. Any deployment claim must be backed by
              independent testing in the target environment.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5" />
              Implemented Package Surface
            </CardTitle>
            <CardDescription>What the current npm package exposes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              {implemented.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="size-5" />
              Research Directions
            </CardTitle>
            <CardDescription>Ideas under evaluation, not shipped guarantees.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              {researchDirections.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mb-12 grid gap-6 md:grid-cols-3">
        {evaluationTargets.map((target) => (
          <Card key={target.title}>
            <CardHeader>
              <CardTitle className="text-lg">{target.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                {target.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Research Guardrails</CardTitle>
          <CardDescription>
            Claims should stay behind reproducible evidence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              Keep this software out of production and safety-critical systems
              unless independently validated.
            </li>
            <li>Treat detector output as advisory, not authoritative.</li>
            <li>
              Do not advertise regulatory compliance without a real audit from
              qualified reviewers.
            </li>
            <li>
              Do not claim universal enforcement, universal detection, or
              guaranteed prevention.
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between border-t border-gray-200 py-8">
        <div>
          <p className="mb-2 text-sm text-gray-500">Next Section</p>
          <p className="font-semibold text-gray-900">
            VII. Implementation Roadmap
          </p>
        </div>
        <Button asChild>
          <Link href="/roadmap">
            Continue to Roadmap <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}