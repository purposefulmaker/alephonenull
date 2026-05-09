'use client'

import { Link, usePathname } from '@/navigation'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface MainNavProps {
  messages: {
    about: string
    story?: string
    evidence: string
    docs: string
    blog: string
    demo?: string
  }
}

export function MainNav({ messages }: MainNavProps) {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Image
          src="/images/logo.png"
          alt="AlephOneNull™ Logo"
          width={24}
          height={24}
          className="size-6"
        />

        <span className="hidden font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>

      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        <Link
          href="/about"
          className={cn(
            'hover:text-foreground/80 transition-colors',
            pathname.includes('/about')
              ? 'dark:text-primary-active'
              : 'text-foreground/60'
          )}
        >
          {messages.about}
        </Link>

        <Link
          href="/story"
          className={cn(
            'hover:text-foreground/80 transition-colors',
            pathname.includes('/story')
              ? 'dark:text-primary-active'
              : 'text-foreground/60'
          )}
        >
          {messages.story || 'Story'}
        </Link>

        <Link
          href="/evidence"
          className={cn(
            'hover:text-foreground/80 transition-colors',
            pathname.includes('/evidence')
              ? 'dark:text-primary-active'
              : 'text-foreground/60'
          )}
        >
          {messages.evidence}
        </Link>

        <Link
          href="/blog"
          className={cn(
            'hover:text-foreground/80 transition-colors',
            pathname.includes('/blog')
              ? 'dark:text-primary-active'
              : 'text-foreground/60'
          )}
        >
          {messages.blog}
        </Link>

        <Link
          href="/docs"
          className={cn(
            'hover:text-foreground/80 transition-colors',
            pathname.includes('/docs')
              ? 'dark:text-primary-active'
              : 'text-foreground/60'
          )}
        >
          {messages.docs}
        </Link>

        <Link
          href="/docs/live-demo"
          className={cn(
            'hover:text-foreground/80 transition-colors',
            pathname === '/docs/live-demo'
              ? 'dark:text-primary-active'
              : 'text-foreground/60'
          )}
        >
          {messages.demo || 'Demo'}
        </Link>
      </nav>
    </div>
  )
}
