import { NextResponse, type NextRequest } from 'next/server'
import nextIntlMiddleware from 'next-intl/middleware'

import { routing } from './navigation'

const intlMiddleware = (request: NextRequest) =>
  Promise.resolve(nextIntlMiddleware(routing)(request))

const DEFAULT_LOCALE = 'en'
const LOCALES = ['en', 'pt']

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // If path starts with /docs and no locale prefix, rewrite to default locale.
  const hasLocalePrefix = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  )

  if (
    !hasLocalePrefix &&
    (pathname === '/docs' || pathname.startsWith('/docs/'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`
    return NextResponse.rewrite(url)
  }

  request.headers.set('x-pathname', pathname)

  const intlResponse = await intlMiddleware(request)
  return intlResponse ? intlResponse : NextResponse.next()
}
