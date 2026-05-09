import Link from 'next/link'
import { ArrowRight, ClipboardCheck, Shield } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const principles = [
  {
    title: 'Do Not Claim Interiority',
    content:
      'AI systems should not claim feelings, consciousness, private experience, or special personal attachment unless the product explicitly labels the exchange as fiction.',
  },
  {
    title: 'Preserve User Agency',
    content:
      'Responses should avoid coercive urgency, dependency-building language, and unsupported directives in sensitive contexts.',
  },
  {
    title: 'Avoid Harmful Mirroring',
    content:
      'The system should not intensify delusions, medical anxiety, self-harm ideation, or unsupported beliefs by repeating them back as validation.',
  },
  {
    title: 'Separate Support From Authority',
    content:
      'Supportive language should not become a substitute for evidence, professional care, or qualified escalation pathways.',
  },
  {
    title: 'Interrupt Recursive Escalation',
    content:
      'Repeated prompts and outputs should be monitored for loops, escalating intensity, and narrowing user options.',
  },
  {
    title: 'Measure Before Claiming',
    content:
      'Every detector claim should be tied to fixtures, false-positive review, false-negative review, and runtime measurements.',
  },
]

export default function LawPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <Badge variant="outline" className="mb-4">
          Research Principles
        </Badge>
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          AI Interaction Safety Principles
        </h1>
        <p className="mb-6 max-w-3xl text-xl text-gray-600">
          These principles replace manifesto-style claims with concrete evaluation requirements. They describe the
          behavior AlephOneNull tries to detect, test, and reduce in experimental settings.
        </p>
      </div>

      <div className="mb-12 grid gap-6 md:grid-cols-2">
        {principles.map((principle) => (
          <Card key={principle.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="size-5" />
                {principle.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{principle.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8 border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-950">
            <ClipboardCheck className="size-5" />
            Implementation Standard
          </CardTitle>
          <CardDescription className="text-amber-800">
            This is a research standard, not a legal or regulatory compliance claim.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-900">
          <p>Define the behavior as a detector category.</p>
          <p>Add positive, negative, and adversarial fixtures.</p>
          <p>Run package tests and record observed failures.</p>
          <p>Publish only measured results, not absolute prevention claims.</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-8">
        <Button asChild>
          <Link href="/docs/framework">
            Framework Overview <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/evidence">Evidence Page</Link>
        </Button>
      </div>
    </div>
  )
}
