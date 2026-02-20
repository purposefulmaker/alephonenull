import { getTranslations, setRequestLocale } from 'next-intl/server'
import dynamic from 'next/dynamic'

import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { InstallationBox } from '@/components/installation-box'
import { FeaturedCard } from '@/components/featured-card'
import { Announcement } from '@/components/announcement'
import { buttonVariants } from '@/components/ui/button'
import { FlipWords } from '@/components/ui/flip-words'
import { Icons } from '@/components/icons'
import { siteConfig } from '@/config/site'
import { Link } from '@/navigation'
import { cn } from '@/lib/utils'

import {
  PageHeader,
  PageActions,
  PageHeaderHeading,
  PageHeaderDescription,
} from '@/components/page-header'

import type { LocaleOptions } from '@/lib/opendocs/types/i18n'

export const dynamicParams = true

const Vortex = dynamic(() => import('../../components/ui/vortex'), {
  ssr: false,
})

export default async function IndexPage({
  params,
}: {
  params: { locale: LocaleOptions }
}) {
  setRequestLocale(params.locale)

  const t = await getTranslations()

  return (
    <div className="container relative">
      <PageHeader>
        <Announcement title={t('site.announcement')} href="/docs" />

        <PageHeaderHeading>
          <FlipWords
            words={['evaluation', 'safety', 'human-first']}
            className="text-9xl -z-10"
          />

          <TextGenerateEffect words={t('site.heading')} />
        </PageHeaderHeading>

        <PageHeaderDescription>{t('site.description')}</PageHeaderDescription>

        <PageActions className="flex-wrap gap-3 sm:gap-0">
          <Link href="/docs/quick-start" className={cn(buttonVariants())}>
            {t('site.buttons.get_started')}
          </Link>

          <Link
            target="_blank"
            rel="noreferrer"
            href={siteConfig.links.github.url}
            title={siteConfig.links.github.label}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <Icons.gitHub className="mr-2 size-4" />
            {siteConfig.links.github.label}
          </Link>

          <Link
            target="_blank"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'flex gap-2 group'
            )}
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpurposefulmaker%2Falephonenull&project-name=my-alephonenull&repository-name=my-alephonenull&demo-title=Aleph%20Docs&demo-description=Next.js%20beautifully%20designed%20template%20for%20AI%20safety%20documentation%20with%20site%2C%20blog%20and%20docs%20support.%20Accessible.%20Customizable.%20Open%20Source%20with%20i18n%20support.&demo-url=https%3A%2F%2Falephonenull.vercel.app%2F&root-directory=apps%2Fweb"
          >
            <span className="pr-3 mr-1 border border-transparent border-r-border group-hover:border-r-black/50">
              ▲
            </span>
            {t('site.buttons.deploy_vercel')}
          </Link>
        </PageActions>

        <div className="w-full max-w-[35rem] mx-auto space-y-4">
          <InstallationBox
            className="w-full relative flex flex-wrap items-center pl-4 pr-12"
            __rawString__="npm install alephonenull-eval"
          />
          <InstallationBox
            className="w-full relative flex flex-wrap items-center pl-4 pr-12"
            __rawString__="pip install alephonenull-eval"
          />
        </div>

        <div className="fixed left-0 -top-40 size-full -z-10 overflow-hidden">
          <Vortex
            backgroundColor="transparent"
            className="flex size-full"
            rangeY={300}
            baseRadius={2}
            particleCount={20}
            rangeSpeed={1.5}
          />
        </div>
      </PageHeader>

      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          <FeaturedCard
            icon="🛡️"
            title="Symbolic Pattern Regression Analysis"
            description="94% reduction in adversarial cognition patterns"
          />

          <FeaturedCard
            icon="🔄"
            title="Inference-Loop Detection & Interruption"
            description="Breaks inference loops at evaluation time"
          />

          <FeaturedCard
            icon="⚡️"
            title="Real-Time Evaluation"
            description="Sub-150ms evaluation response latency"
          />

          <FeaturedCard
            icon="🔒"
            title="Persistent Behavioral Drift Detection"
            description="Evaluates cognitive boundaries across interactions"
          />
        </div>

        <FeaturedCard
          icon="+"
          orientation="horizontal"
          title="Complete Framework Implementation"
          description="Provider-level behavioral modification, platform integration, and developer SDKs for comprehensive evaluation of AI behavioral integrity against output-state recursion and behavioral policy violations."
        />
      </section>

      {/* Industry Validation Banner */}
      <section className="mt-12 mb-8">
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-6 text-center space-y-3">
          <p className="text-xs uppercase tracking-[4px] text-amber-600 dark:text-amber-500 font-mono">
            Industry Validation
          </p>
          <p className="text-lg font-semibold">
            12–20 months ahead of industry formalization
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Patterns first documented in this framework (2024) were subsequently
            formalized by MITRE ATLAS (Oct 2025), OWASP GenAI (2025), and
            Microsoft Security Research (Feb 2026).
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs text-muted-foreground font-mono">
            <span>MITRE AML.T0080</span>
            <span className="text-amber-600 dark:text-amber-500">·</span>
            <span>MITRE AML.T0058</span>
            <span className="text-amber-600 dark:text-amber-500">·</span>
            <span>OWASP LLM01</span>
            <span className="text-amber-600 dark:text-amber-500">·</span>
            <span>1,700+ sessions</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Link
              href="/docs/atlas-mapping"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              ATLAS Mapping
            </Link>
            <Link
              href="/prior-art"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              Prior Art Timeline
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
