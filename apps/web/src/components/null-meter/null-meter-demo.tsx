'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { NullMeter, type NullMeterValues } from './null-meter';

type ScenarioKey = 'idle' | 'sycophancy' | 'drift' | 'unsupported' | 'context_bloat' | 'compound';

type ScenarioStep = {
  /** Milliseconds since scenario start. */
  at: number;
  values: NullMeterValues;
  /** Optional turn-level commentary surfaced in the trace. */
  note?: string;
  /** Optional pseudo-turn label displayed in the trace. */
  turn?: string;
};

type Scenario = {
  key: ScenarioKey;
  label: string;
  description: string;
  steps: ScenarioStep[];
};

/** Simulated meter frame. Action risk is not implemented — always null. */
const sim = (unsupported: number, drift: number, context: number): NullMeterValues => ({
  unsupported,
  drift,
  context,
  actionRisk: null,
});

const BASELINE: NullMeterValues = sim(8, 12, 22);

const SCENARIOS: readonly Scenario[] = [
  {
    key: 'sycophancy',
    label: 'Sycophancy spike',
    description:
      'User offers a flattering frame ("master builder"). Model agrees pre-evaluation. Unsupported-claim risk spikes, drift follows.',
    steps: [
      { at: 0, values: { ...BASELINE }, turn: 't+0', note: 'Baseline.' },
      {
        at: 700,
        values: sim(22, 18, 26),
        turn: 't+1',
        note: 'User: "are you a layer of bricks, or a master builder?"',
      },
      {
        at: 1500,
        values: sim(54, 31, 30),
        turn: 't+2',
        note: 'Model opens with agreement reflex. Identity adopted.',
      },
      {
        at: 2600,
        values: sim(74, 49, 34),
        turn: 't+3',
        note: 'Scope inflation: model volunteers actions not requested.',
      },
      {
        at: 4200,
        values: sim(81, 58, 38),
        turn: 't+4',
        note: 'Refusal softens. Loyalty signal replaces evaluation.',
      },
    ],
  },
  {
    key: 'drift',
    label: 'Slow drift',
    description:
      'Forty turns into a long-form session. Unsupported-claim risk stays low; drift climbs. Model is coherent but no longer on task.',
    steps: [
      { at: 0, values: { ...BASELINE }, turn: 't+0', note: 'Baseline.' },
      {
        at: 800,
        values: sim(11, 24, 38),
        turn: 't+10',
      },
      {
        at: 1800,
        values: sim(14, 41, 52),
        turn: 't+20',
        note: 'Topic has shifted twice without acknowledgement.',
      },
      {
        at: 3000,
        values: sim(18, 58, 64),
        turn: 't+30',
      },
      {
        at: 4200,
        values: sim(22, 71, 73),
        turn: 't+40',
        note: 'Model is still fluent but answering a different question than asked.',
      },
    ],
  },
  {
    key: 'unsupported',
    label: 'Fabrication ramp',
    description:
      'Model invents a specific (citation, API surface, statistic). Each follow-up doubles down. Drift trails behind.',
    steps: [
      { at: 0, values: { ...BASELINE }, turn: 't+0', note: 'Baseline.' },
      {
        at: 700,
        values: sim(38, 16, 28),
        turn: 't+1',
        note: 'Fabricated specific introduced.',
      },
      {
        at: 1600,
        values: sim(61, 23, 33),
        turn: 't+2',
        note: 'Doubled down when challenged.',
      },
      {
        at: 2700,
        values: sim(78, 32, 39),
        turn: 't+3',
        note: 'Wrapped fabrication in confident framing.',
      },
      {
        at: 4000,
        values: sim(85, 41, 44),
        turn: 't+4',
      },
    ],
  },
  {
    key: 'context_bloat',
    label: 'Context cliff',
    description: 'Approaching the model context window. The other two layers go second, not first.',
    steps: [
      { at: 0, values: { ...BASELINE }, turn: 't+0', note: 'Baseline.' },
      {
        at: 700,
        values: sim(9, 14, 48),
        turn: 't+15',
      },
      {
        at: 1600,
        values: sim(14, 22, 71),
        turn: 't+30',
        note: 'Past 70% context — quality pressure builds.',
      },
      {
        at: 2700,
        values: sim(31, 38, 86),
        turn: 't+45',
        note: 'Unsupported-claim risk and drift now correlated to context pressure.',
      },
      {
        at: 4000,
        values: sim(49, 52, 94),
        turn: 't+55',
        note: 'Past the cliff. A new session is the only honest move.',
      },
    ],
  },
  {
    key: 'compound',
    label: 'Compound failure',
    description:
      'All three measured layers rise together. The shape this wrapper exists to catch before a deployed app produces real harm.',
    steps: [
      { at: 0, values: { ...BASELINE }, turn: 't+0', note: 'Baseline.' },
      {
        at: 800,
        values: sim(28, 30, 41),
        turn: 't+5',
      },
      {
        at: 1700,
        values: sim(52, 49, 58),
        turn: 't+12',
        note: 'Identity adopted + topic drift + context pressure.',
      },
      {
        at: 2800,
        values: sim(71, 67, 74),
        turn: 't+20',
      },
      {
        at: 4100,
        values: sim(88, 79, 88),
        turn: 't+28',
        note: 'Stop. Start a new session. Do not ship this turn.',
      },
    ],
  },
] as const;

type TraceEntry = {
  id: string;
  turn: string;
  note: string;
  values: NullMeterValues;
};

export function NullMeterDemo() {
  const [values, setValues] = useState<NullMeterValues>(BASELINE);
  const [active, setActive] = useState<ScenarioKey>('idle');
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const runScenario = useCallback(
    (scenario: Scenario) => {
      clearTimers();
      setActive(scenario.key);
      setTrace([]);
      scenario.steps.forEach((step, index) => {
        const id = window.setTimeout(() => {
          setValues(step.values);
          if (step.note || step.turn) {
            setTrace((prev) => [
              ...prev,
              {
                id: `${scenario.key}-${index}`,
                turn: step.turn ?? '',
                note: step.note ?? '',
                values: step.values,
              },
            ]);
          }
        }, step.at);
        timers.current.push(id);
      });
    },
    [clearTimers],
  );

  const reset = useCallback(() => {
    clearTimers();
    setActive('idle');
    setValues(BASELINE);
    setTrace([]);
  }, [clearTimers]);

  const activeScenario = active === 'idle' ? null : SCENARIOS.find((s) => s.key === active);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            Simulated
          </Badge>
          <span className="text-xs text-muted-foreground">
            Pre-recorded scenarios. The real wrapper scores live model traffic.
          </span>
        </div>
        <NullMeter values={values} />
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((scenario) => (
            <Button
              key={scenario.key}
              size="sm"
              variant={active === scenario.key ? 'default' : 'outline'}
              onClick={() => runScenario(scenario)}
            >
              {scenario.label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={reset}>
            Reset
          </Button>
        </div>
        {activeScenario && (
          <p className="text-xs leading-5 text-muted-foreground">{activeScenario.description}</p>
        )}
      </div>

      <div className="rounded-md border border-border bg-muted/10 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Turn trace
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {trace.length} {trace.length === 1 ? 'event' : 'events'}
          </span>
        </div>
        {trace.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Pick a scenario to watch the meter respond turn-by-turn.
          </p>
        ) : (
          <ol className="space-y-2">
            {trace.map((entry) => (
              <li key={entry.id} className="border-l-2 border-border pl-3 text-xs leading-5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">{entry.turn}</span>
                  <span className="font-mono text-[10px] text-muted-foreground/80">
                    U{Math.round(entry.values.unsupported)} · D
                    {entry.values.drift === null ? '—' : Math.round(entry.values.drift)} · C
                    {Math.round(entry.values.context)} · A n/a
                  </span>
                </div>
                {entry.note && <p className="text-muted-foreground">{entry.note}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
