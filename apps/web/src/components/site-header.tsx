import { getTranslations } from 'next-intl/server'
import dynamic from 'next/dynamic'

import { ThemeModeToggle } from '@/components/theme-mode-toggle'
import { Separator } from '@/components/ui/separator'
import { VersionDropdown } from './version-dropdown'
import { MobileNav } from '@/components/mobile-nav'
import { MainNav } from '@/components/main-nav'
import { buttonVariants } from './ui/button'
import { Icons } from '@/components/icons'
import { siteConfig } from '@/config/site'
import { I18nToggle } from './i18n-toggle'
import { Link } from '@/navigation'
import { cn } from '@/lib/utils'

const CommandMenu = dynamic(() =>
  import('@/components/command-menu').then((mod) => mod.CommandMenu)
)

export async function SiteHeader() {
  const t = await getTranslations('site')

  return (
    <header className={'sticky top-0 z-50 w-full backdrop-blur'}>
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MainNav
          messages={{
            docs: t('words.docs'),
            blog: t('words.blog'),
          }}
        />

        <MobileNav
          messages={{
            menu: t('words.menu'),
            toggleMenu: t('buttons.toggle_menu'),
          }}
          menuLinks={<SiteHeaderMenuLinks />}
        />

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <CommandMenu
              messages={{
                docs: t('words.docs'),
                blog: t('words.blog'),
                search: t('search.search'),
                noResultsFound: t('search.no_results_found'),
                typeCommandOrSearch: t('search.type_command_or_search'),
                searchDocumentation: t('search.search_documentation'),

                themes: {
                  dark: t('themes.dark'),
                  theme: t('themes.theme'),
                  light: t('themes.light'),
                  system: t('themes.system'),
                },
              }}
            />
          </div>

          <nav className="flex items-center">
            <VersionDropdown
              messages={{
                changelog: t('changelog'),
              }}
            />

            <I18nToggle
              messages={{
                toggleLanguage: t('buttons.toggle_language'),
              }}
            />

            <ThemeModeToggle
              messages={{
                dark: t('themes.dark'),
                light: t('themes.light'),
                system: t('themes.system'),
              }}
            />

            <div className="phone:flex hidden items-center">
              <Separator orientation="vertical" className="mx-1 h-5" />
              <SiteHeaderMenuLinks />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export function SiteHeaderMenuLinks() {
  return (
    <>
      <Link href={siteConfig.links.github.url} target="_blank" rel="noreferrer">
        <div
          className={cn(
            buttonVariants({
              variant: 'ghost',
            }),
            'w-9 px-0'
          )}
        >
          <Icons.gitHub className="size-4" />
          <span className="sr-only">GitHub</span>
        </div>
      </Link>
      
      <Link href={siteConfig.links.buymeacoffee.url} target="_blank" rel="noreferrer">
        <div
          className={cn(
            buttonVariants({
              variant: 'ghost',
            }),
            'w-9 px-0 hover:bg-yellow-100 hover:text-yellow-700 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400'
          )}
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-.766-1.613a4.44 4.44 0 0 0-1.364-1.04c-.354-.25-.773-.426-1.204-.506-.264-.049-.54-.075-.814-.075-.274 0-.548.026-.813.075-.431.08-.85.256-1.203.506-.52.378-.974.876-1.365 1.04-.378.45-.647 1.015-.766 1.613L11.784 6.415c-.02.12-.06.26-.06.404 0 .147.04.284.06.404l.005.028c.119.598.388 1.163.766 1.613.391.164.845.662 1.365 1.040.353.25.772.426 1.203.506.265.049.539.075.813.075.274 0 .549-.026.814-.075.431-.08.85-.256 1.204-.506.52-.378.973-.876 1.364-1.040.378-.45.647-1.015.766-1.613l.005-.028c.02-.12.06-.257.06-.404 0-.144-.04-.284-.06-.404zm-7.5 7.5c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zm0-1c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5z"/>
            <path d="M4 12c0 4.418 3.582 8 8 8s8-3.582 8-8H4z"/>
          </svg>
          <span className="sr-only">Buy Me a Coffee</span>
        </div>
      </Link>
    </>
  )
}
