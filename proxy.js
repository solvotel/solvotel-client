import { NextResponse } from 'next/server';

export function proxy(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about-us',
    '/contact',
    '/services',
    '/pricing',
    '/login',
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // If user is logged in and tries to go to "/", redirect to /dashboard
  if (pathname === '/') {
    if (token) {
      try {
      } catch (err) {
        // invalid token — just clear cookies and allow them to see "/"
        const res = NextResponse.next();
        res.cookies.set('token', '', { maxAge: -1, path: '/' });
        res.cookies.set('user', '', { maxAge: -1, path: '/' });
        return res;
      }
    }
    return NextResponse.next(); // not logged in → allow "/"
  }

  // If it's a public route, allow access without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    return NextResponse.next();
  } catch (err) {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.set('token', '', { maxAge: -1, path: '/' });
    res.cookies.set('user', '', { maxAge: -1, path: '/' });
    return res;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)', // all routes
  ],
};
