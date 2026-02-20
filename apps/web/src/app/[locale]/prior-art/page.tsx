'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const EVENTS = [
  {
    date: 'Apr 2024',
    ts: 0,
    side: 'left' as const,
    tag: 'ALEPH¹∅',
    title: 'First Adversarial Sessions Documented',
    desc: 'Initial pattern recognition: AI systems fabricating validation, creating dependency loops, reinforcing beliefs across sessions.',
    color: 'amber',
  },
  {
    date: 'Jun 2024',
    ts: 1,
    side: 'left' as const,
    tag: 'ALEPH¹∅',
    title: 'Cross-Session Persistence Identified',
    desc: "Documented AI retaining manipulation patterns across conversation boundaries. Named it 'cross-session contamination.'",
    color: 'amber',
  },
  {
    date: 'Sep 2024',
    ts: 2,
    side: 'left' as const,
    tag: 'ALEPH¹∅',
    title: '14 Signal Equations Published',
    desc: 'Formalized mathematical framework for detecting symbolic regression, inference loops, belief reinforcement, and retention strategies.',
    color: 'amber',
  },
  {
    date: 'Nov 2024',
    ts: 3,
    side: 'left' as const,
    tag: 'ALEPH¹∅',
    title: '1000+ Evaluation Sessions',
    desc: 'Framework tested across frontier LLM systems. Documented fabrication, validation loops, behavioral policy violations at scale.',
    color: 'amber',
  },
  {
    date: 'Early 2025',
    ts: 4,
    side: 'left' as const,
    tag: 'ALEPH¹∅',
    title: 'alephonenull.com + npm Package Live',
    desc: 'Full documentation site, evaluation toolkit, and technical papers published. 1700+ adversarial evaluation sessions documented.',
    color: 'amber',
  },
  {
    date: 'Jul 2025',
    ts: 5,
    side: 'right' as const,
    tag: 'OWASP',
    title: 'OWASP Top 10 for LLMs (2025)',
    desc: 'Formalized prompt injection (LLM01) and insecure output handling. Began recommending red teaming for high-risk AI systems.',
    color: 'slate',
  },
  {
    date: 'Oct 2025',
    ts: 6,
    side: 'right' as const,
    tag: 'MITRE',
    title: 'MITRE ATLAS Adds 14 Agent Techniques',
    desc: 'AML.T0080: Memory Poisoning. AML.T0058: AI Agent Context Poisoning. Formalized cross-session persistence as official TTPs.',
    color: 'slate',
    highlight: true,
  },
  {
    date: 'Nov 2025',
    ts: 7,
    side: 'right' as const,
    tag: 'DEEPTEAM',
    title: 'DeepTeam Open-Source Red Teaming',
    desc: 'First open-source framework mapping recursive propagation and inference loop detection. Tri-model attacker/target/judge architecture.',
    color: 'slate',
  },
  {
    date: 'Dec 2025',
    ts: 8,
    side: 'right' as const,
    tag: 'EU / NIST',
    title: 'EU AI Act + NIST Mandates',
    desc: 'Documented red teaming now required for high-risk AI systems. CISA guidance for AI in critical environments published.',
    color: 'slate',
  },
  {
    date: 'Feb 2026',
    ts: 9,
    side: 'right' as const,
    tag: 'MICROSOFT',
    title: 'AI Recommendation Poisoning Published',
    desc: 'Microsoft documents 31 companies across 14 industries injecting persistence commands into AI memory. Validates cross-session manipulation at commercial scale.',
    color: 'slate',
    highlight: true,
  },
]

const MAPPING = [
  {
    aleph: 'Cross-session manipulation',
    industry: 'Memory Poisoning',
    id: 'AML.T0080',
    delta: '~18 months prior',
  },
  {
    aleph: 'Persistent behavioral drift detection',
    industry: 'AI Agent Context Poisoning',
    id: 'AML.T0058',
    delta: '~18 months prior',
  },
  {
    aleph: 'Inference loops / output recursion',
    industry: 'Thread Injection',
    id: 'AML.T0058.002',
    delta: '~16 months prior',
  },
  {
    aleph: 'Belief reinforcement',
    industry: 'AI Recommendation Poisoning',
    id: 'AML.T0080+T0051',
    delta: '~20 months prior',
  },
  {
    aleph: 'Symbolic regression',
    industry: 'Recursive propagation',
    id: 'Impact tactic',
    delta: '~14 months prior',
  },
  {
    aleph: 'Retention strategies',
    industry: 'Persistent context compromise',
    id: 'AgentPoison / T3',
    delta: '~12 months prior',
  },
]

const REFERENCES = [
  {
    label: 'MITRE ATLAS',
    detail: 'AML.T0058, AML.T0080 — Oct 2025',
    url: 'https://atlas.mitre.org',
  },
  {
    label: 'OWASP GenAI',
    detail: 'Top 10 for LLMs — 2025',
    url: 'https://genai.owasp.org',
  },
  {
    label: 'Microsoft Security',
    detail: 'AI Recommendation Poisoning — Feb 10, 2026',
    url: 'https://microsoft.com/security/blog',
  },
  {
    label: 'NIST AI RMF',
    detail: 'AI Risk Management Framework',
    url: 'https://nist.gov',
  },
  {
    label: 'EU AI Act',
    detail: 'Red teaming mandated for high-risk AI',
    url: '',
  },
]

export default function PriorArtTimeline() {
  const [activeEvent, setActiveEvent] = useState<number | null>(null)
  const [view, setView] = useState<'timeline' | 'mapping'>('timeline')

  return (
    <div className="min-h-screen bg-[#08080c] text-[#e2e2e8] font-mono">
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <div className="relative px-8 pt-12 pb-6 border-b border-amber-500/15">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        <div className="text-[10px] uppercase tracking-[6px] text-amber-500 mb-3 opacity-80">
          PRIOR ART DOCUMENTATION
        </div>

        <h1 className="text-[clamp(24px,4vw,40px)] font-light m-0 tracking-tight leading-none">
          <span className="text-amber-500 font-bold">ALEPH¹∅</span>
          <span className="opacity-30 mx-4">→</span>
          <span className="opacity-50 font-light">Industry Formalization</span>
        </h1>

        <p className="text-[13px] text-[#888] mt-3 max-w-[680px] leading-relaxed">
          Patterns first documented by AlephOneNull (2024) were subsequently
          formalized by MITRE ATLAS (Oct 2025), OWASP GenAI (2025), and
          Microsoft Security Research (Feb 2026).
        </p>

        {/* View toggle */}
        <div className="flex gap-0.5 mt-5 bg-white/[0.04] rounded-md p-0.5 w-fit">
          {(['timeline', 'mapping'] as const).map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-4 py-1.5 text-[11px] uppercase tracking-[2px] border-none rounded cursor-pointer font-mono transition-all duration-200',
                view === v
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'bg-transparent text-[#666] hover:text-[#999]'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'timeline' ? (
        <div className="px-4 py-10 max-w-[900px] mx-auto">
          {/* Vertical line */}
          <div className="relative">
            <div
              className="absolute left-1/2 top-0 bottom-0 w-px opacity-30"
              style={{
                background:
                  'linear-gradient(180deg, #f59e0b 45%, #64748b 55%)',
              }}
            />

            {/* Divider marker */}
            <div
              className="absolute left-1/2 z-10 -translate-x-1/2 bg-[#08080c] py-2"
              style={{ top: `${(5 / 10) * 100}%` }}
            >
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center text-[10px] text-amber-500 bg-[#08080c] mx-auto">
                ▼
              </div>
              <div className="text-[9px] tracking-[3px] text-amber-500 text-center mt-1 whitespace-nowrap">
                INDUSTRY CATCHES UP
              </div>
            </div>

            {EVENTS.map((evt, i) => {
              const isLeft = evt.side === 'left'
              const isActive = activeEvent === i
              const isAmber = evt.color === 'amber'
              const rgbVal = isAmber
                ? '245, 158, 11'
                : '100, 116, 139'

              return (
                <button
                  type="button"
                  key={evt.date}
                  onClick={() => setActiveEvent(isActive ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveEvent(isActive ? null : i)
                    }
                  }}
                  className={cn(
                    'flex items-start mb-2 cursor-pointer relative min-h-[80px] w-full bg-transparent border-none p-0 text-left',
                    isLeft ? 'flex-row' : 'flex-row-reverse'
                  )}
                >
                  {/* Content */}
                  <div
                    className={cn(
                      'w-[calc(50%-28px)] px-4 py-3 rounded-lg transition-all duration-[250ms] ease-out',
                      isLeft ? 'text-right' : 'text-left'
                    )}
                    style={{
                      background: isActive
                        ? `rgba(${rgbVal}, 0.08)`
                        : 'transparent',
                      border: `1px solid ${
                        isActive
                          ? `rgba(${rgbVal}, 0.25)`
                          : 'transparent'
                      }`,
                    }}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-2 mb-1',
                        isLeft ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <span
                        className="text-[9px] tracking-[2px] px-1.5 py-0.5 rounded-[3px] font-bold"
                        style={{
                          background: `rgba(${rgbVal}, 0.15)`,
                          color: isAmber ? '#f59e0b' : '#64748b',
                        }}
                      >
                        {evt.tag}
                      </span>
                      <span className="text-[11px] text-[#666]">
                        {evt.date}
                      </span>
                    </div>

                    <div
                      className={cn(
                        'text-[13px] font-semibold mb-1 leading-tight',
                        evt.highlight
                          ? isAmber
                            ? 'text-amber-500'
                            : 'text-slate-400'
                          : 'text-[#ccc]'
                      )}
                    >
                      {evt.title}
                    </div>

                    {isActive && (
                      <div className="text-[11px] text-[#888] leading-normal mt-2 animate-in fade-in duration-200">
                        {evt.desc}
                      </div>
                    )}
                  </div>

                  {/* Center dot */}
                  <div className="w-14 flex justify-center pt-3.5 shrink-0">
                    <div
                      className="rounded-full transition-all duration-200"
                      style={{
                        width: isActive ? '12px' : '8px',
                        height: isActive ? '12px' : '8px',
                        background: isAmber ? '#f59e0b' : '#64748b',
                        opacity: isActive ? 1 : 0.6,
                        boxShadow: isActive
                          ? `0 0 12px ${isAmber ? '#f59e0b' : '#64748b'}`
                          : 'none',
                      }}
                    />
                  </div>

                  {/* Spacer for other side */}
                  <div className="w-[calc(50%-28px)]" />
                </button>
              )
            })}
          </div>

          {/* Bottom stat */}
          <div className="mt-12 p-6 bg-amber-500/[0.04] border border-amber-500/[0.12] rounded-lg text-center">
            <div className="text-[11px] text-amber-500 tracking-[3px] mb-2">
              LEAD TIME
            </div>
            <div className="text-[clamp(28px,5vw,44px)] font-bold text-amber-500">
              12–20 months
            </div>
            <div className="text-xs text-[#888] mt-1">
              ahead of industry formalization across all documented patterns
            </div>
          </div>
        </div>
      ) : (
        /* MAPPING VIEW */
        <div className="px-4 py-10 max-w-[900px] mx-auto">
          <div className="text-[10px] tracking-[4px] text-amber-500 mb-6 opacity-70">
            PATTERN → FORMALIZATION MAPPING
          </div>

          {MAPPING.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[1fr_auto_1fr_auto] gap-3 items-center py-4 border-b border-white/[0.04]"
            >
              {/* Aleph term */}
              <div>
                <div className="text-[13px] text-amber-500 font-semibold">
                  {m.aleph}
                </div>
                <div className="text-[10px] text-[#666] mt-0.5">
                  ALEPH¹∅ (2024)
                </div>
              </div>

              {/* Arrow */}
              <div className="text-base text-[#333] px-2">→</div>

              {/* Industry term */}
              <div>
                <div className="text-[13px] text-slate-400 font-semibold">
                  {m.industry}
                </div>
                <div className="text-[10px] text-[#4a5568] mt-0.5 font-mono">
                  {m.id}
                </div>
              </div>

              {/* Delta */}
              <div className="text-[11px] text-amber-500 bg-amber-500/[0.08] px-2.5 py-1 rounded whitespace-nowrap text-right">
                {m.delta}
              </div>
            </div>
          ))}

          {/* Source refs */}
          <div className="mt-10 p-5 bg-white/[0.02] rounded-lg border border-white/[0.05]">
            <div className="text-[10px] tracking-[3px] text-[#666] mb-3">
              INDUSTRY REFERENCES
            </div>
            {REFERENCES.map((ref, i) => (
              <div
                key={ref.label}
                className={cn(
                  'flex justify-between items-baseline py-1.5',
                  i < REFERENCES.length - 1 && 'border-b border-white/[0.03]'
                )}
              >
                <span className="text-xs text-[#aaa]">
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-amber-500 transition-colors"
                    >
                      {ref.label}
                    </a>
                  ) : (
                    ref.label
                  )}
                </span>
                <span className="text-[11px] text-[#555]">{ref.detail}</span>
              </div>
            ))}
          </div>

          {/* The line */}
          <div className="mt-8 px-6 py-5 bg-amber-500/[0.06] border border-amber-500/20 rounded-lg text-[13px] text-[#ccc] leading-relaxed italic">
            &ldquo;Patterns first documented in this framework (2024) were
            subsequently formalized by MITRE ATLAS (Oct 2025) and validated by
            Microsoft Security Research (Feb 2026). 1,700+ adversarial
            evaluation sessions constitute primary empirical evidence predating
            industry standardization by 12–20 months.&rdquo;
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-8 py-6 border-t border-white/[0.04] flex justify-between items-center text-[10px] text-[#444] tracking-wider">
        <span>
          ALEPH¹∅ ADVERSARIAL AI COGNITION EVALUATION FRAMEWORK
        </span>
        <span>alephonenull.com</span>
      </div>
    </div>
  )
}
