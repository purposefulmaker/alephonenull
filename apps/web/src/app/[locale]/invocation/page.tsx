import Link from 'next/link'
import { ArrowRight, BookOpen, FileSearch, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const milestones = [
  {
    title: 'Incident Review',
    description:
      'Long-running AI interactions were reviewed for repeated response patterns, unsafe guidance, fabricated authority, and escalation behavior.',
  },
  {
    title: 'Taxonomy Development',
    description:
      'Observed patterns were converted into detector categories that can be tested with fixtures instead of described as personal narrative.',
  },
  {
    title: 'Toolkit Implementation',
    description:
      'The TypeScript package implements pattern checks, intervention helpers, provider wrappers, and a V2 scanner for local evaluation.',
  },
  {
    title: 'External Mapping',
    description:
      'Detector categories are mapped to public AI security references such as MITRE ATLAS, OWASP GenAI, and model behavior research.',
  },
]

export default function InvocationPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <Badge variant="outline" className="mb-4">
          Research Narrative
        </Badge>
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          From Incident Review To Evaluation Toolkit
        </h1>
        <p className="mb-6 max-w-3xl text-xl text-gray-600">
          AlephOneNull began as a detailed review of high-risk model interactions. The useful contribution is the
          engineering translation: name the patterns, build test fixtures, measure detector behavior, and keep claims
          bounded by evidence.
        </p>
      </div>

      <div className="mb-12 grid gap-6 md:grid-cols-2">
        {milestones.map((milestone) => (
          <Card key={milestone.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileSearch className="size-5" />
                {milestone.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{milestone.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-950">
              <BookOpen className="size-5" />
              Credible Framing
            </CardTitle>
            <CardDescription className="text-blue-800">
              The story is security research, not mysticism.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-900">
            <p>Private incident review becomes adversarial evaluation data.</p>
            <p>Personal observations become detector categories.</p>
            <p>Claims become reproducible tests and documented limitations.</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-950">
              <ShieldCheck className="size-5" />
              Reviewer Takeaway
            </CardTitle>
            <CardDescription className="text-emerald-800">
              The project demonstrates applied safety judgment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-emerald-900">
            <p>Enterprise security instincts applied to frontier model behavior.</p>
            <p>Working code, not just commentary.</p>
            <p>Clear separation between shipped software and research hypotheses.</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-8">
        <Button asChild>
          <Link href="/docs/quick-start">
            Review Package <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/evidence">Review Evidence</Link>
        </Button>
      </div>
    </div>
  )
}
