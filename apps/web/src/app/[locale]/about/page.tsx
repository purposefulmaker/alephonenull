import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header'
import type { LocaleOptions } from '@/lib/opendocs/types/i18n'

export default function AboutPage({ params }: { params: { locale: LocaleOptions } }) {
  return (
    <main className="container py-10">
      <PageHeader>
        <PageHeaderHeading>About AlephOneNull</PageHeaderHeading>
        <PageHeaderDescription>
          A principled, multi-disciplinary control system to prevent AI-induced harm.
        </PageHeaderDescription>
      </PageHeader>

      <section className="prose dark:prose-invert max-w-3xl">
        <p>
          AlephOneNull is an open framework and SDK for detecting and mitigating symbolic regression,
          loop induction, reflection exploitation, affect amplification, and cross-session resonance.
        </p>

        <hr className="my-8" />
        <p className="text-xs text-muted-foreground">
          AlephOneNull Framework™ — Patent Pending (U.S. Provisional Application No. 63/877,337, filed September 8, 2025)
        </p>
      </section>
    </main>
  )
} 