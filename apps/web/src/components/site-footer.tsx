import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

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
          className="relative inline-block h-10 w-36 overflow-hidden hover:opacity-80 transition-opacity"
        >
          {/* Light mode image - colorful version */}
          <Image
            src="/images/coffeecolor.png"
            alt="Buy Me a Coffee"
            width={144}
            height={40}
            className="object-contain dark:hidden"
            priority
          />
          {/* Dark mode image - light version */}
          <Image
            src="/images/coffeelight.png"
            alt="Buy Me a Coffee"
            width={144}
            height={40}
            className="object-contain hidden dark:block"
            priority
          />
        </a>
      </div>
    </footer>
  )
}
