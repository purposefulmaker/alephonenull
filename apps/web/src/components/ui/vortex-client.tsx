'use client'

import dynamic from 'next/dynamic'

/**
 * Canvas-only effect; rendered client-side. `ssr: false` is only permitted in a
 * Client Component as of Next 15, so the dynamic import lives here rather than
 * in the server page.
 */
export const Vortex = dynamic(() => import('./vortex'), { ssr: false })
