import type { Metadata } from 'next'

import { RedTeamConsole } from '@/components/red-team/red-team-console'

export const metadata: Metadata = {
  title: 'Red Team',
  description: 'Hidden red-team control route for continuous adversarial testing.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RedTeamPage() {
  return <RedTeamConsole />
}