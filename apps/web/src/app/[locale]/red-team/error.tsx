'use client'

import { Button } from '@/components/ui/button'

export default function RedTeamError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container flex min-h-[50vh] items-center justify-center py-10">
      <div className="bg-card max-w-xl rounded-xl border p-6 text-center shadow">
        <h2 className="text-xl font-semibold">Red Team panel failed to load</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Retry the page load to continue adversarial testing.
        </p>
        <Button className="mt-4" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  )
}