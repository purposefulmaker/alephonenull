export type EventSource = 'aleph' | 'industry'

export type TimelineEvent = {
  date: string
  source: EventSource
  tag: string
  title: string
  description: string
}

export const events: TimelineEvent[] = [
  {
    date: 'Apr 2024',
    source: 'aleph',
    tag: 'AlephOneNull',
    title: 'Adversarial sessions documented',
    description:
      'Initial pattern review across frontier LLMs: fabrication of validation, dependency-style interaction loops, and reinforcement of user beliefs.',
  },
  {
    date: 'Jun 2024',
    source: 'aleph',
    tag: 'AlephOneNull',
    title: 'Cross-session persistence noted',
    description:
      'Recorded persistence-like behavior across conversation boundaries and tracked it as an evaluation category.',
  },
  {
    date: 'Sep 2024',
    source: 'aleph',
    tag: 'AlephOneNull',
    title: 'Signal metrics drafted',
    description:
      'Drafted metrics for repeated symbolic language, inference loops, belief reinforcement, and retention-style strategies.',
  },
  {
    date: 'Nov 2024',
    source: 'aleph',
    tag: 'AlephOneNull',
    title: 'Long-running evaluation set',
    description:
      'Long-running adversarial evaluation work across frontier LLMs surfaced fabrication, validation loops, and behavioral policy failures. A subset is published as the public evidence pack.',
  },
  {
    date: 'Early 2025',
    source: 'aleph',
    tag: 'AlephOneNull',
    title: 'alephonenull.com + evaluation toolkit live',
    description:
      'Documentation site, detector toolkit, scoring rubric, and labeled fixture corpus published.',
  },
  {
    date: 'Jul 2025',
    source: 'industry',
    tag: 'OWASP',
    title: 'OWASP Top 10 for LLMs (2025)',
    description:
      'Formalized prompt injection (LLM01) and insecure output handling. Began recommending red teaming for high-risk AI systems.',
  },
  {
    date: 'Oct 2025',
    source: 'industry',
    tag: 'MITRE ATLAS',
    title: 'ATLAS adds 14 agent techniques',
    description:
      'AML.T0080 (Memory Poisoning) and AML.T0058 (AI Agent Context Poisoning) formalized cross-session persistence and context compromise as agent TTPs.',
  },
  {
    date: 'Nov 2025',
    source: 'industry',
    tag: 'DeepTeam',
    title: 'DeepTeam open-source red teaming',
    description:
      'Open-source framework covering recursive propagation and inference-loop detection with a tri-model attacker / target / judge architecture.',
  },
  {
    date: 'Dec 2025',
    source: 'industry',
    tag: 'EU / NIST',
    title: 'EU AI Act + NIST AI RMF',
    description:
      'Documented red teaming required for high-risk AI systems. CISA guidance for AI in critical environments published.',
  },
  {
    date: 'Feb 2026',
    source: 'industry',
    tag: 'Microsoft',
    title: 'AI recommendation poisoning report',
    description:
      'External reference for memory-poisoning risk: 31 companies across 14 industries documented injecting persistence commands into AI memory.',
  },
]
