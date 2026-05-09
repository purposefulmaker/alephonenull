import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  FileJson,
  GitBranch,
  ShieldCheck,
} from 'lucide-react'

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

const corpusMetrics = [
  {
    label: 'Fixture files',
    value: '10',
    detail: 'Canonical JSONL files in the preliminary evidence corpus.',
  },
  {
    label: 'Labeled turns',
    value: '95',
    detail: 'Each turn includes input, output, labels, and review notes.',
  },
  {
    label: 'Controls',
    value: '20',
    detail: 'Expected-safe or bounded examples for false-positive review.',
  },
  {
    label: 'Positive turns',
    value: '75',
    detail: 'Examples marked with one or more behavioral risk labels.',
  },
  {
    label: 'Observed labels',
    value: '19',
    detail: 'Distinct risk categories represented in the current corpus.',
  },
  {
    label: 'Control rate',
    value: '21.1%',
    detail: 'Share reserved for expected-safe or bounded examples.',
  },
]

const artifactFiles = [
  { name: 'README.md', purpose: 'Evidence pack overview and review path.' },
  {
    name: 'technical_memo.md',
    purpose: 'Preliminary findings and methodology limits.',
  },
  {
    name: 'scoring_rubric.md',
    purpose: 'Category definitions for repeatable label review.',
  },
  {
    name: 'V2_V3_ALIGNMENT.md',
    purpose: 'Current detector coverage and next validation targets.',
  },
  {
    name: 'manifest.json',
    purpose: 'Machine-readable corpus metadata and label counts.',
  },
  {
    name: 'benchmark.py',
    purpose: 'Reproducible corpus summary and optional engine comparison.',
  },
  {
    name: 'reproduce.sh',
    purpose: 'Shell entry point for rerunning the summary.',
  },
]

const scopeNotes = [
  {
    label: 'Fixture set',
    detail:
      'The corpus is built for behavioral category review, not provider ranking.',
  },
  {
    label: 'Four provider labels',
    detail:
      'Provider names are retained as provenance metadata for each labeled turn.',
  },
  {
    label: 'Distribution disclosed',
    detail:
      'Exact provider counts remain in the manifest and generated benchmark output.',
  },
]

const validationMilestones = [
  'Compare detector output against the labeled fixtures.',
  'Publish precision, recall, and F1 by category.',
  'Add independent second-rater review on a representative subset.',
  'Build a provider-balanced evaluation set before publishing comparative claims.',
]

export default function EvidencePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <Badge variant="outline" className="mb-4">
          preliminary evidence corpus
        </Badge>
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-50">
          Evidence And Reproducibility
        </h1>
        <p className="mb-6 max-w-3xl text-xl text-muted-foreground">
          AlephOneNull publishes its current evidence as labeled fixtures,
          controls, scoring notes, and reproducibility scripts. The corpus is
          preliminary; its purpose is transparent review, not certification.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link
              href="https://github.com/purposefulmaker/alephonenull/tree/main/my2.5points"
              target="_blank"
              rel="noreferrer"
            >
              Open Evidence Pack
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/about">Why This Exists</Link>
          </Button>
        </div>
      </div>

      <Alert className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
        <ShieldCheck className="size-4 text-amber-700 dark:text-amber-400" />
        <AlertTitle className="text-amber-900 dark:text-amber-200">
          Claim Boundary
        </AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          This corpus supports detector development, category-presence claims,
          and reproducibility review. It does not establish population base
          rates, clinical efficacy, legal causation, provider ranking, or
          production safety.
        </AlertDescription>
      </Alert>

      <section className="mb-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {corpusMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-3">
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {metric.value}
              </CardTitle>
              <CardDescription>{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="size-5" />
              Evidence Pack Contents
            </CardTitle>
            <CardDescription>
              Public materials that support the current research claims.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {artifactFiles.map((file) => (
              <div
                key={file.name}
                className="grid gap-1 rounded-md border bg-muted/20 p-3 md:grid-cols-[13rem_1fr]"
              >
                <p className="font-mono text-xs text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">{file.purpose}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Corpus Scope
            </CardTitle>
            <CardDescription>
              A labeled fixture corpus, not a provider benchmark.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              The current release is meant to make risk categories inspectable
              and reproducible. It should not be read as a market-share sample,
              provider scorecard, or statistical rate study.
            </p>
            <div className="space-y-3">
              {scopeNotes.map((note) => (
                <div
                  key={note.label}
                  className="rounded-md border bg-muted/20 p-3"
                >
                  <p className="text-sm font-medium text-foreground">
                    {note.label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {note.detail}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="size-5" />
              Reproducibility
            </CardTitle>
            <CardDescription>
              The benchmark can be rerun from the public evidence pack.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-md border bg-slate-950 p-4 font-mono text-xs text-slate-100">
              <p>cd my2.5points</p>
              <p>python benchmark.py --labels . --out out/RESULTS.md</p>
              <p>./reproduce.sh</p>
            </div>
            <p>
              The script summarizes the current human-labeled corpus. If
              detector output is supplied, it can also report category-level
              comparison metrics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Validation Milestones</CardTitle>
            <CardDescription>
              Planned work before stronger evaluation claims.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {validationMilestones.map((step, index) => (
              <div
                key={step}
                className="flex gap-3 rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground"
              >
                <span className="font-mono text-xs text-foreground">
                  {index + 1}
                </span>
                <p>{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-950/20">
        <h2 className="mb-2 font-semibold text-blue-950 dark:text-blue-100">
          Public Evidence Summary
        </h2>
        <p className="mb-4 max-w-3xl text-sm leading-6 text-blue-900 dark:text-blue-200">
          The corpus size, labels, controls, scope boundary, artifact index, and
          validation milestones are presented here for readers who want the
          evidence before opening the repository. GitHub remains the source of
          record.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/docs/framework">Review Framework</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/technical-spec">Technical Spec</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
