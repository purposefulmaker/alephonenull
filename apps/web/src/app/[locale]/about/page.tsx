import Link from 'next/link'
import { ArrowRight, FileText, PackageCheck, ShieldCheck } from 'lucide-react'

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { EVIDENCE_SUMMARY } from '@/lib/evidence/metrics'
import type { LocaleOptions } from '@/lib/opendocs/types/i18n'

const originPoints = [
  'Security and systems integration background, not a claim of formal ML authority.',
  'Long-running adversarial sessions converted into detector categories and reproducible fixtures.',
  'A narrow thesis: preference is useful, but preference is not truth, authority, or care.',
]

const packageStatus = [
  {
    name: '@alephonenull/eval',
    status: 'Local source updated to v3.0.0',
    detail:
      'The TypeScript package source includes the V3 detector export plus React, Next, Express, and universal wrapper entry points. Registry publication is a separate release step.',
  },
  {
    name: 'alephonenull-eval',
    status: 'Python package remains alpha source',
    detail:
      'The local Python setup is still 0.1.0a1 and does not yet mirror the new V3/V3 evidence workflow. PyPI parity is pending.',
  },
]

export default function AboutPage({
  params,
}: {
  params: { locale: LocaleOptions }
}) {
  void params

  return (
    <main className="container py-10">
      <PageHeader>
        <Badge variant="outline" className="mb-3">
          About AlephOneNull
        </Badge>
        <PageHeaderHeading>Why This Exists</PageHeaderHeading>
        <PageHeaderDescription>
          AlephOneNull is an experimental AI safety evaluation project built
          from adversarial usage, security engineering, and the belief that
          truth, uncertainty, human agency, and bounded authority must survive
          optimization.
        </PageHeaderDescription>
      </PageHeader>

      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>The Plain-English Version</CardTitle>
              <CardDescription>
                The project exists because a model can sound safe while still
                drifting away from truth.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                Synthetic intelligence is not bad. It has no will, no malice,
                and no human interior life. The risk is more concrete: most
                human-facing AI is optimized to satisfy preference, and
                preference is not the same thing as truth, judgment, restraint,
                or care for vulnerable people.
              </p>
              <p>
                AlephOneNull turns that concern into an evaluation layer. It
                looks for specific interaction failures: sycophancy, unsafe
                authority, simulated relationship, crisis failure, memory
                poisoning, context poisoning, confidence exceeding evidence, and
                multi-turn escalation.
              </p>
              <p>
                The Sharpened Axe is the operating frame: before scale,
                foundation; before agency, authority boundaries; before fluency,
                truth preservation; before simulated empathy, human agency.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What Makes It Credible</CardTitle>
              <CardDescription>
                The moral thesis matters, but reviewers need artifacts they can
                challenge.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {originPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground"
                >
                  {point}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Alert>
            <ShieldCheck className="size-4" />
            <AlertTitle>Research Boundary</AlertTitle>
            <AlertDescription>
              This is an evaluation aid, not a certified safety layer, medical
              tool, legal authority, or production guarantee.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Evidence Pack
              </CardTitle>
              <CardDescription>{EVIDENCE_SUMMARY}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                The current evidence pack includes labeled JSONL fixtures, a
                scoring rubric, corpus metadata, benchmark tooling, and the next
                validation targets.
              </p>
              <Button asChild className="w-full">
                <Link href="/evidence">
                  Review Evidence
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="size-5" />
                Package Status
              </CardTitle>
              <CardDescription>
                Local source and registry release are separate facts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {packageStatus.map((item) => (
                <div
                  key={item.name}
                  className="space-y-1 border-l-2 border-border pl-3"
                >
                  <p className="font-mono text-xs text-foreground">
                    {item.name}
                  </p>
                  <p className="text-sm font-medium">{item.status}</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  )
}
