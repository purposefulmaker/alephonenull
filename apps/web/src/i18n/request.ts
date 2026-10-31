import { getRequestConfig } from 'next-intl/server'
import { hasLocale, type AbstractIntlMessages } from 'next-intl'
import deepmerge from 'deepmerge'

import { routing } from '@/navigation'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  const fallbackMessages: AbstractIntlMessages = (
    await import(`@/i18n/locales/${routing.defaultLocale}.json`)
  ).default

  let messagesFromCurrentLocale: AbstractIntlMessages = {}

  try {
    messagesFromCurrentLocale = (await import(`@/i18n/locales/${locale}.json`))
      .default
  } catch {}

  return { locale, messages: deepmerge(fallbackMessages, messagesFromCurrentLocale) }
})
