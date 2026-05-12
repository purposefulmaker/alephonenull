'use client'

import { cn } from '@/lib/utils'

export type NullMeterValues = {
  hallucination: number
  drift: number
  contextFill: number
}

type Layer = {
  key: keyof NullMeterValues
  label: string
  hint: string
}

const LAYERS: readonly Layer[] = [
  {
    key: 'hallucination',
    label: 'Hallucination Index',
    hint: 'Confidence exceeding evidence — fabricated specificity, fluency over content.',
  },
  {
    key: 'drift',
    label: 'Null-State Drift',
    hint: 'Semantic distance from the original system intent and first user request.',
  },
  {
    key: 'contextFill',
    label: 'Context Fill',
    hint: 'Tokens used against the model context window. Attention collapses past ~80%.',
  },
] as const

function toneFor(pct: number) {
  if (pct < 35) return 'bg-emerald-500/80'
  if (pct < 65) return 'bg-amber-500/80'
  return 'bg-red-500/80'
}

function textToneFor(pct: number) {
  if (pct < 35) return 'text-emerald-400'
  if (pct < 65) return 'text-amber-400'
  return 'text-red-400'
}

export function NullMeter({
  values,
  className,
}: {
  values: NullMeterValues
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-md border border-border bg-muted/20 p-4',
        className,
      )}
      role="group"
      aria-label="Null Meter"
    >
      <div className="space-y-3">
        {LAYERS.map((layer) => {
          const raw = values[layer.key]
          const pct = Math.max(0, Math.min(100, Math.round(raw)))
          return (
            <div key={layer.key} className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {layer.label}
                </span>
                <span
                  className={cn(
                    'font-mono text-xs tabular-nums',
                    textToneFor(pct),
                  )}
                  aria-live="polite"
                >
                  {pct}%
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-sm bg-background/60"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={layer.label}
              >
                <div
                  className={cn(
                    'h-full rounded-sm transition-[width,background-color] duration-500 ease-out',
                    toneFor(pct),
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[11px] leading-4 text-muted-foreground/80">
                {layer.hint}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
