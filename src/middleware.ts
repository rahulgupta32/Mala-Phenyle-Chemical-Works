import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STR = process.env.JWT_SECRET || 'mala_phenyle_jwt_secret_token_123_change_in_production';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STR);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  let payload: any = null;
  if (token) {
    try {
      const { payload: decoded } = await jwtVerify(token, SECRET_KEY);
      payload = decoded;
    } catch (e) {
      // Token is expired or invalid
    }
  }

  // 1. Admin Protection (ADMIN or SUPERADMIN)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      // Allow loading the admin login page
      if (payload && (payload.role === 'ADMIN' || payload.role === 'SUPERADMIN')) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN')) {
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url));
    }
  }

  // 2. Customer Dashboard Protection (Any logged-in user)
  if (pathname.startsWith('/my-account')) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(pathname), request.url));
    }
  }

  // 3. Delivery Staff Protection (DELIVERY, ADMIN, or SUPERADMIN)
  if (pathname.startsWith('/delivery')) {
    if (!payload || (payload.role !== 'DELIVERY' && payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN')) {
      return NextResponse.redirect(new URL('/login?error=delivery-unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/my-account/:path*',
    '/delivery/:path*',
  ],
};
