import { setRequestLocale } from 'next-intl/server'

import { getServerDocsConfig } from '@/lib/opendocs/utils/get-server-docs-config'
import { DocsSidebarNav } from '@/components/docs/sidebar-nav'
import { ScrollArea } from '@/components/ui/scroll-area'

import type { LocaleOptions } from '@/lib/opendocs/types/i18n'

interface DocsLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export const dynamicParams = true

export default async function DocsLayout(props: DocsLayoutProps) {
  const params = await props.params;

  const {
    children
  } = props;

  setRequestLocale(params.locale as LocaleOptions)

  const docsConfig = await getServerDocsConfig({ locale: (params.locale as LocaleOptions) })

  return (
    <div className="border-b">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <ScrollArea className="h-full overflow-y-auto py-6 pr-6 lg:py-8">
            <DocsSidebarNav
              items={docsConfig.docs.sidebarNav}
              locale={docsConfig.currentLocale}
            />
          </ScrollArea>
        </aside>

        {children}
      </div>
    </div>
  )
}
