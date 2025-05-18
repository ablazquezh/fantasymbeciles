import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('auth')?.value === 'true'
  const { pathname } = request.nextUrl

  const isApiRoute = pathname.startsWith('/api')
  const isSecureLoginPage = pathname === '/securelogin'
  const isHomePage = pathname === '/'

  // Redirect authenticated users away from login page to home
  if (isSecureLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect unauthenticated users away from protected pages (like home)
  if (!isAuthenticated && !isApiRoute && !isSecureLoginPage) {
    return NextResponse.redirect(new URL('/securelogin', request.url))
  }

  // Otherwise, allow request
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|static|api|favicon.ico).*)'],
}
