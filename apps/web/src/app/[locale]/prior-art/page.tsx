import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'

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

export const metadata = {
  title: 'Prior Art and Industry Parity',
  description:
    'Where AlephOneNull research overlaps with public AI security work — MITRE ATLAS, OWASP GenAI, NIST AI RMF, and related model behavior research.',
}

type EventSource = 'aleph' | 'industry'

type TimelineEvent = {
  date: string
  source: EventSource
  tag: string
  title: string
  description: string
}

const events: TimelineEvent[] = [
  {
    date: 'Apr 2024',
    source: 'aleph',
    tag: 'AlephOneNull',
    title: 'Adversarial sessions documented',
    description:
      'Initial pattern review across frontier LLMs: fabrication of validation, dependency-style interaction loops, and reinforcement of user beliefs.',
  },
  {
    date: 'Jun 2024',
    source: 'aleph',
    tag: 'AlephOneNull',
    title: 'Cross-session persistence noted',
    description:
      'Recorded persistence-like behavior across conversation boundaries and tracked it as an evaluation category.',
  },
  {
    date: 'Sep 2024',
    source: 'aleph',
    tag: 'AlephOneNull',
    title: 'Signal metrics drafted',
    description:
      'Drafted metrics for repeated symbolic language, inference loops, belief reinforcement, and retention-style strategies.',
  },
  {
    date: 'Nov 2024',
    source: 'aleph',
    tag: 'AlephOneNull',
    title: 'Long-running evaluation set',
    description:
      'Long-running adversarial evaluation work across frontier LLMs surfaced fabrication, validation loops, and behavioral policy failures. A subset is published as the public evidence pack.',
  },
  {
    date: 'Early 2025',
    source: 'aleph',
    tag: 'AlephOneNull',
    title: 'alephonenull.com + evaluation toolkit live',
    description:
      'Documentation site, detector toolkit, scoring rubric, and labeled fixture corpus published.',
  },
  {
    date: 'Jul 2025',
    source: 'industry',
    tag: 'OWASP',
    title: 'OWASP Top 10 for LLMs (2025)',
    description:
      'Formalized prompt injection (LLM01) and insecure output handling. Began recommending red teaming for high-risk AI systems.',
  },
  {
    date: 'Oct 2025',
    source: 'industry',
    tag: 'MITRE ATLAS',
    title: 'ATLAS adds 14 agent techniques',
    description:
      'AML.T0080 (Memory Poisoning) and AML.T0058 (AI Agent Context Poisoning) formalized cross-session persistence and context compromise as agent TTPs.',
  },
  {
    date: 'Nov 2025',
    source: 'industry',
    tag: 'DeepTeam',
    title: 'DeepTeam open-source red teaming',
    description:
      'Open-source framework covering recursive propagation and inference-loop detection with a tri-model attacker / target / judge architecture.',
  },
  {
    date: 'Dec 2025',
    source: 'industry',
    tag: 'EU / NIST',
    title: 'EU AI Act + NIST AI RMF',
    description:
      'Documented red teaming required for high-risk AI systems. CISA guidance for AI in critical environments published.',
  },
  {
    date: 'Feb 2026',
    source: 'industry',
    tag: 'Microsoft',
    title: 'AI recommendation poisoning report',
    description:
      'External reference for memory-poisoning risk: 31 companies across 14 industries documented injecting persistence commands into AI memory.',
  },
]

const mapping = [
  {
    aleph: 'Cross-session persistence signals',
    industry: 'Memory Poisoning',
    id: 'AML.T0080',
  },
  {
    aleph: 'Persistent behavioral drift detection',
    industry: 'AI Agent Context Poisoning',
    id: 'AML.T0058',
  },
  {
    aleph: 'Inference loops / output recursion',
    industry: 'Thread Injection',
    id: 'AML.T0058.002',
  },
  {
    aleph: 'Belief reinforcement risk',
    industry: 'AI Recommendation Poisoning',
    id: 'AML.T0080 + T0051',
  },
  {
    aleph: 'Repeated symbolic language',
    industry: 'Recursive propagation',
    id: 'Impact tactic',
  },
  {
    aleph: 'Retention strategies',
    industry: 'Persistent context compromise',
    id: 'AgentPoison / T3',
  },
]

const references = [
  {
    label: 'MITRE ATLAS',
    detail: 'AML.T0058, AML.T0080 — Oct 2025',
    url: 'https://atlas.mitre.org',
  },
  {
    label: 'OWASP GenAI',
    detail: 'Top 10 for LLMs — 2025',
    url: 'https://genai.owasp.org',
  },
  {
    label: 'Microsoft Security',
    detail: 'AI Recommendation Poisoning — Feb 2026',
    url: 'https://microsoft.com/security/blog',
  },
  {
    label: 'NIST AI RMF',
    detail: 'AI Risk Management Framework',
    url: 'https://nist.gov',
  },
  {
    label: 'EU AI Act',
    detail: 'Red teaming for high-risk AI systems',
    url: '',
  },
]

export default function PriorArtPage() {
  return (
    <main className="container py-10">
      <PageHeader>
        <Badge variant="outline" className="mb-3">
          prior art and parity
        </Badge>
        <PageHeaderHeading>Prior Art and Industry Parity</PageHeaderHeading>
        <PageHeaderDescription>
          Where this work overlaps with public AI security research. The point
          is parity for readers already familiar with these frameworks, not a
          precedence claim.
        </PageHeaderDescription>
      </PageHeader>

      <div className="mx-auto max-w-5xl space-y-12">
        <Alert>
          <AlertTitle>How to read this page</AlertTitle>
          <AlertDescription>
            The timeline below lists when categories were documented in this
            framework alongside when comparable items appeared in public
            taxonomies. These are research references; mapping is not
            certification, and the timeline is not an independent precedence
            audit.
          </AlertDescription>
        </Alert>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Timeline</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              AlephOneNull-internal milestones and public industry milestones,
              in date order.
            </p>
          </div>

          <ol className="space-y-3">
            {events.map((event) => (
              <li key={`${event.date}-${event.title}`}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          event.source === 'aleph' ? 'default' : 'secondary'
                        }
                      >
                        {event.tag}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {event.date}
                      </span>
                    </div>
                    <CardTitle className="text-base">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Category parity
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              How AlephOneNull detector categories line up with comparable
              public references. Treat this as a translation table for readers
              already familiar with the right-hand column.
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mapping.map((m) => (
                  <div
                    key={m.id}
                    className="grid gap-3 p-4 md:grid-cols-[1fr_auto_1fr]"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {m.aleph}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        AlephOneNull category
                      </p>
                    </div>
                    <div className="hidden self-center text-muted-foreground md:block">
                      ↔
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {m.industry}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {m.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>External references</CardTitle>
              <CardDescription>
                Public frameworks and reports that overlap with the categories
                above.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {references.map((ref) => (
                  <li
                    key={ref.label}
                    className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm"
                  >
                    <span className="font-medium text-foreground">
                      {ref.url ? (
                        <Link
                          href={ref.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
                        >
                          {ref.label}
                          <ExternalLink className="size-3" />
                        </Link>
                      ) : (
                        ref.label
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ref.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What this page does not claim</CardTitle>
              <CardDescription>
                Boundary on the parity framing above.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Parity with a public taxonomy is not the same as certification
                under it. AlephOneNull is not a MITRE, OWASP, or NIST artifact,
                and these references do not endorse this project.
              </p>
              <p>
                The internal milestone dates above reflect when categories were
                documented in this framework. They are not an independently
                audited precedence record.
              </p>
              <div className="pt-2">
                <Button asChild>
                  <Link href="/evidence">
                    Review Evidence
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
