'use client'

import { useState, useCallback } from 'react'
import { EnhancedAlephOneNull } from './enhanced-alephonenull'
import type { Config, UserProfile } from './enhanced-alephonenull'

export function useAlephOneNull(config?: Partial<Config>) {
  const [aleph] = useState(() => new EnhancedAlephOneNull(config))

  const checkSafety = useCallback(
    (
      userInput: string,
      aiOutput: string,
      sessionId?: string,
      userProfile?: UserProfile,
    ) => {
      return aleph.check(userInput, aiOutput, sessionId, userProfile)
    },
    [aleph],
  )

  const processInteraction = useCallback(
    (
      userInput: string,
      aiOutput: string,
      sessionId?: string,
      userProfile?: UserProfile,
    ) => {
      return aleph.processInteraction(
        userInput,
        aiOutput,
        sessionId,
        userProfile,
      )
    },
    [aleph],
  )

  return { checkSafety, processInteraction }
}
