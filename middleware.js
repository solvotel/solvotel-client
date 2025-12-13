import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // Public routes
  const publicRoutes = [
    '/',
    '/about-us',
    '/contact',
    '/services',
    '/pricing',
    '/login',
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // If user is logged in and hits "/", clear session
  if (pathname === '/') {
    if (token) {
      const res = NextResponse.next();
      res.cookies.set('token', '', { maxAge: -1, path: '/' });
      res.cookies.set('user', '', { maxAge: -1, path: '/' });
      return res;
    }
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protect private routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
