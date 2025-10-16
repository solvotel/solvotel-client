import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // If user is logged in and tries to go to "/", redirect to /dashboard
  if (pathname === '/') {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (!decoded.exp || decoded.exp > now) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
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

  // All other routes require authentication
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp && decoded.exp < now) {
      const res = NextResponse.redirect(new URL('/', req.url));
      res.cookies.set('token', '', { maxAge: -1, path: '/' });
      res.cookies.set('user', '', { maxAge: -1, path: '/' });
      return res;
    }

    return NextResponse.next();
  } catch (err) {
    const res = NextResponse.redirect(new URL('/', req.url));
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
