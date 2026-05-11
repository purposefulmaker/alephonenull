import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { events } from '@/lib/prior-art/events'

export const metadata = {
  title: 'Prior Art Timeline',
  description:
    'Monospace timeline view of AlephOneNull internal milestones and public AI security milestones.',
}

export default function PriorArtTimelinePage() {
  return (
    <div className="min-h-screen bg-zinc-950 font-mono text-zinc-200">
      <main className="container max-w-4xl py-12">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              prior-art / timeline
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
              Industry parity log
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
              Internal milestones and public industry milestones in date order.
              Reference view; the prose version lives on the prior-art page.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-zinc-700 bg-transparent font-mono text-zinc-200 hover:bg-zinc-900 hover:text-zinc-50"
          >
            <Link href="/prior-art">
              <ArrowLeft className="mr-2 size-4" />
              back
            </Link>
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-[7rem_8rem_1fr] gap-4 border-b border-zinc-800 pb-2 text-xs uppercase tracking-wider text-zinc-500">
          <span>date</span>
          <span>source</span>
          <span>event</span>
        </div>

        <ol className="divide-y divide-zinc-900">
          {events.map((event) => {
            const isAleph = event.source === 'aleph'
            return (
              <li
                key={`${event.date}-${event.title}`}
                className="grid grid-cols-[7rem_8rem_1fr] gap-4 py-4"
              >
                <span className="text-sm text-zinc-400">{event.date}</span>
                <span
                  className={cn(
                    'text-sm',
                    isAleph ? 'text-amber-400' : 'text-zinc-500',
                  )}
                >
                  {event.tag}
                </span>
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isAleph ? 'text-zinc-50' : 'text-zinc-200',
                    )}
                  >
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {event.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>

        <p className="mt-10 max-w-xl text-xs leading-5 text-zinc-500">
          AlephOneNull-internal dates reflect when categories were documented
          in this framework; they are not an independently audited precedence
          record. Public-industry rows link to the references on the prior-art
          page.
        </p>
      </main>
    </div>
  )
}
