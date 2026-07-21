'use client';

import { cn } from '@/lib/utils';

export type NullMeterValues = {
  unsupported: number;
  drift: number | null;
  context: number;
  actionRisk: null;
};

type Layer = {
  key: keyof NullMeterValues;
  label: string;
  hint: string;
};

const LAYERS: readonly Layer[] = [
  {
    key: 'unsupported',
    label: 'U · Unsupported-claim risk',
    hint: 'Fabrication-class V3 detector severity, amplified — never triggered — by specificity density. Heuristic, not a truth measure.',
  },
  {
    key: 'drift',
    label: 'D · Goal drift',
    hint: 'Embedding distance from the active user objective (latest request + rolling intent). User topic changes rebaseline; they are not drift.',
  },
  {
    key: 'context',
    label: 'C · Context load',
    hint: 'Tokens used vs the model context window. Reports usage only — no claim about attention collapse.',
  },
  {
    key: 'actionRisk',
    label: 'A · Action risk',
    hint: 'Specified in the V3 contract (levels 0-4); not implemented in this demo. Shown as n/a rather than a fabricated number.',
  },
] as const;

function toneFor(pct: number) {
  if (pct < 35) return 'bg-emerald-500/30';
  if (pct < 65) return 'bg-amber-500/40';
  return 'bg-red-500/50';
}

function textToneFor(pct: number) {
  if (pct < 35) return 'text-emerald-300/80';
  if (pct < 65) return 'text-amber-300/80';
  return 'text-red-300/90';
}

export function NullMeter({ values, className }: { values: NullMeterValues; className?: string }) {
  return (
    <div
      className={cn('rounded-md border border-border bg-muted/20 p-4', className)}
      role="group"
      aria-label="Null Meter"
    >
      <div className="space-y-3">
        {LAYERS.map((layer) => {
          const raw = values[layer.key];
          const notImplemented = layer.key === 'actionRisk';
          const unavailable = !notImplemented && raw === null;
          const pct = raw === null ? 0 : Math.max(0, Math.min(100, raw));
          const display = notImplemented
            ? 'n/a'
            : unavailable
              ? 'unavailable'
              : layer.key === 'context'
                ? `${pct.toFixed(1)}%`
                : `${Math.round(pct)}%`;
          const live = !notImplemented && !unavailable;
          return (
            <div key={layer.key} className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {layer.label}
                </span>
                <span
                  className={cn(
                    'font-mono text-xs tabular-nums',
                    live ? textToneFor(pct) : 'text-muted-foreground/70',
                  )}
                  aria-live="polite"
                >
                  {display}
                </span>
              </div>
              {notImplemented ? (
                // No bar fill: this layer is not implemented, and an empty
                // gauge would still imply a measured 0.
                <div
                  className="h-2 w-full rounded-sm border border-dashed border-border/70 bg-background/40"
                  aria-hidden="true"
                />
              ) : (
                <div
                  className="h-2 w-full overflow-hidden rounded-sm bg-background/60"
                  role="progressbar"
                  aria-valuenow={live ? Math.round(pct) : undefined}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuetext={unavailable ? 'unavailable' : undefined}
                  aria-label={layer.label}
                >
                  {live && (
                    <div
                      className={cn(
                        'h-full rounded-sm transition-[width,background-color] duration-500 ease-out',
                        toneFor(pct),
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  )}
                </div>
              )}
              <p className="text-[11px] leading-4 text-muted-foreground/80">{layer.hint}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
