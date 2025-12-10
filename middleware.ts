import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/ping',
])

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl
  const { userId } = await auth()

  // Ping endpoint for testing
  if (pathname === '/ping') {
    return new Response('pong', { status: 200 })
  }

  // Disable sign-up page - redirect to sign-in
  if (pathname.startsWith('/sign-up')) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // If accessing homepage without authentication, redirect to sign-in
  if (pathname === '/' && !userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Protect all routes except public ones
  if (!isPublicRoute(request) && !userId) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
