import type { IntlMessages as Messages } from './src/lib/opendocs/types/i18n'
import type { routing } from './src/navigation'

declare module 'next-intl' {
  interface AppConfig {
    Messages: Messages
    Locale: (typeof routing.locales)[number]
  }
}
