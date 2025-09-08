import { getTranslations } from 'next-intl/server'

import { siteConfig } from '@/config/site'

export async function SiteFooter() {
  const t = await getTranslations('site.footer')

  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
        <p className="text-muted-foreground text-balance text-center text-sm leading-loose md:text-left">
          {t('created_by')}{' '}
          <a
            href={siteConfig.author.site}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            {siteConfig.author.name}
          </a>
        </p>
        <a
          href={siteConfig.links.buymeacoffee.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-[#FFDD00] px-4 py-2 text-sm font-medium text-black hover:bg-[#FFDD00]/90 transition-colors"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-.766-1.613a4.44 4.44 0 0 0-1.364-1.04c-.354-.25-.773-.426-1.204-.506-.264-.049-.54-.075-.814-.075-.274 0-.548.026-.813.075-.431.08-.85.256-1.203.506-.52.378-.974.876-1.365 1.04-.378.45-.647 1.015-.766 1.613L11.784 6.415c-.02.12-.06.26-.06.404 0 .147.04.284.06.404l.005.028c.119.598.388 1.163.766 1.613.391.164.845.662 1.365 1.040.353.25.772.426 1.203.506.265.049.539.075.813.075.274 0 .549-.026.814-.075.431-.08.85-.256 1.204-.506.52-.378.973-.876 1.364-1.040.378-.45.647-1.015.766-1.613l.005-.028c.02-.12.06-.257.06-.404 0-.144-.04-.284-.06-.404zm-7.5 7.5c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zm0-1c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5z"/>
            <path d="M4 12c0 4.418 3.582 8 8 8s8-3.582 8-8H4z"/>
          </svg>
          Buy me a coffee
        </a>
      </div>
    </footer>
  )
}
