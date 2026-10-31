import type { NextRequest } from 'next/server'

import opendocsProxy from '@/lib/opendocs/proxy'

// Next 16 requires a function export here (default or named `proxy`); a bare
// re-export is not detected by its static check.
export default function proxy(request: NextRequest) {
  return opendocsProxy(request)
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_proxy/|_vercel|_static|favicon.ico|sitemap.xml|blog.xml|blog.json|robots.txt|.*\\..*).*)',
    '/([\\w-]+)?/(docs|blog)/(.+)',
  ],
}
