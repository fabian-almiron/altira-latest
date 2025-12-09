import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isDevelopmentEnvironment } from './lib/constants'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 })
  }

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Check for required environment variables
  if (!process.env.AUTH_SECRET) {
    console.error(
      '❌ Missing AUTH_SECRET environment variable. Please check your .env file.',
    )
    return NextResponse.next() // Let the app handle the error with better UI
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  })

  if (!token) {
    // Allow login and register pages
    if (['/login', '/register'].includes(pathname)) {
      return NextResponse.next()
    }

    // Redirect all other pages to login (including homepage and all API routes)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login/register pages
  if (token && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/chats/:path*',
    '/projects/:path*',
    '/api/:path*',
    '/login',
    '/register',

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
