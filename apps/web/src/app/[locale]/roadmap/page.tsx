import Link from 'next/link'
import { ArrowRight, CircleDashed, CircleDot, Circle } from 'lucide-react'

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
import type { LocaleOptions } from '@/lib/opendocs/types/i18n'

export const metadata = {
  title: 'Roadmap',
  description:
    'The honest near-term roadmap for AlephOneNull: where evaluation stands today, what is being built next, and what stronger validation looks like.',
}

type Phase = {
  label: 'Now' | 'Next' | 'Later'
  window: string
  title: string
  description: string
  items: string[]
  icon: typeof CircleDot
}

const phases: Phase[] = [
  {
    label: 'Now',
    window: 'Q2 2026',
    title: 'Evaluation framework + labeled fixture corpus',
    description:
      'The public surface today: a detector toolkit, a labeled JSONL corpus, and a scoring rubric. Reproducible from the repository.',
    icon: CircleDot,
    items: [
      'Detector V3 implemented in @alephonenull/eval with category exports.',
      'Public evidence pack: 10 fixture files, 95 labeled turns, 20 controls.',
      'Scoring rubric and manifest published alongside fixtures.',
      'reproduce.sh entry point for rerunning the corpus summary.',
    ],
  },
  {
    label: 'Next',
    window: 'Q3 – Q4 2026',
    title: 'Corpus expansion + measured detector evaluation',
    description:
      'The next milestones before stronger evaluation claims are made in public.',
    icon: CircleDashed,
    items: [
      'Run detector V3 against the labeled corpus and publish precision, recall, and F1 by category.',
      'Add an independent second-rater review on a representative subset.',
      'Build a provider-balanced evaluation set before any comparative claim.',
      'Document concrete false-positive and false-negative examples per category.',
    ],
  },
  {
    label: 'Later',
    window: '2027 +',
    title: 'Open evaluation set + external review',
    description:
      'Targets that depend on the Next milestones landing first and on external participation.',
    icon: Circle,
    items: [
      'Public evaluation set with held-out splits and a leaderboard format.',
      'Multi-rater inter-annotator agreement on the public split.',
      'Preprint covering methodology, corpus construction, and detector limits.',
      'Third-party replication of the headline category results.',
    ],
  },
]

export default function RoadmapPage({
  params,
}: {
  params: { locale: LocaleOptions }
}) {
  void params

  return (
    <main className="container py-10">
      <PageHeader>
        <Badge variant="outline" className="mb-3">
          public roadmap
        </Badge>
        <PageHeaderHeading>Roadmap</PageHeaderHeading>
        <PageHeaderDescription>
          Where AlephOneNull stands today, what is being built next, and what
          stronger validation will require. Target windows are intent, not
          commitments.
        </PageHeaderDescription>
      </PageHeader>

      <div className="mx-auto max-w-5xl">
        <Alert className="mb-8">
          <AlertTitle>Research stance</AlertTitle>
          <AlertDescription>
            AlephOneNull is experimental research, not a certified safety
            product. The roadmap below is the honest near-term plan, not a
            commitment schedule.
          </AlertDescription>
        </Alert>

        <section className="grid gap-6 md:grid-cols-3">
          {phases.map((phase) => {
            const Icon = phase.icon
            return (
              <Card key={phase.label} className="flex flex-col">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <Badge variant="secondary">{phase.label}</Badge>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {phase.window}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{phase.title}</CardTitle>
                  <CardDescription>{phase.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {phase.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 leading-6 before:mt-2 before:size-1.5 before:shrink-0 before:rounded-full before:bg-muted-foreground/60 before:content-['']"
                      >
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>What this roadmap does not promise</CardTitle>
              <CardDescription>
                The boundary between what is shipped and what is claimed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Roadmap items are intent, not guarantees. AlephOneNull does not
                claim certification, clinical efficacy, legal causation,
                provider ranking, or production-grade safety.
              </p>
              <p>
                Statistical metrics (precision, recall, F1) are part of the
                Next phase. They are not claimed today, and any public number
                tied to them will be published with the corpus and method that
                produced it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to follow along</CardTitle>
              <CardDescription>
                The repository is the source of record.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Detector source, fixture corpus, manifest, and scoring rubric
                are all in the public repository. Issues and pull requests are
                the right surface for review and replication.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <Link href="/evidence">
                    Review Evidence
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/technical-spec">Technical Spec</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
