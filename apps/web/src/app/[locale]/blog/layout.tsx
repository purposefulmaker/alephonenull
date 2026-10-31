import { setRequestLocale } from 'next-intl/server'

import type { LocaleOptions } from '@/lib/opendocs/types/i18n'

interface BlogLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export const dynamicParams = true

export default async function BlogLayout(props: BlogLayoutProps) {
  const params = await props.params;

  const {
    children
  } = props;

  setRequestLocale(params.locale as LocaleOptions)

  return (
    <div className="container mx-auto max-w-container px-4 pt-6 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}
