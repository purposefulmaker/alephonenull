'use client'

import { Link, usePathname } from '@/navigation'
import { Icons } from '@/components/icons'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface MainNavProps {
  messages: {
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
