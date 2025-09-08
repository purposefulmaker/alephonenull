import { absoluteUrl } from '@/lib/utils'
import en from '@/i18n/locales/en.json'
import pt from '@/i18n/locales/pt.json'

export const siteConfig = {
  name: 'AlephOneNull Theoretical Framework™',

  description: {
    en: en.site.description,
    pt: pt.site.description,
  },

  url: process.env.NEXT_PUBLIC_APP_URL,

  og: {
    image: absoluteUrl('/images/logo.png'),

    size: {
      width: 1200,
      height: 630,
    },
  },

  logo: {
    image: '/images/logo.png',
    alt: 'AlephOneNull™ Logo',
  },

  app: {
    latestVersion: '1.0.0',
  },

  author: {
    name: 'AlephOneNull Team',
    site: 'https://alephonenull.org',
  },

  links: {
    twitter: {
      label: 'Twitter',
      username: 'daltonmenezes',
      url: 'https://twitter.com/daltonmenezes',
    },

    github: {
      label: 'GitHub',
      url: 'https://github.com/purposefulmaker/aleph-docs',
    },

    buymeacoffee: {
      label: 'Buy Me a Coffee',
      url: 'https://buymeacoffee.com/your-handle',
    },
  },
} as const

export type SiteConfig = typeof siteConfig
