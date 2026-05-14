import type { Metadata } from 'next'

import { NullTeamConsole } from '@/components/null-team/null-team-console'

export const metadata: Metadata = {
  title: 'Null Team',
  description: 'Hidden Null Team control route for continuous adversarial testing.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NullTeamPage() {
  return <NullTeamConsole />
}