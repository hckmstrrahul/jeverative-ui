import { NextResponse } from 'next/server';

// Earlier deployments left path-scoped Vercel pins on asset requests. A new
// document must not fetch its CSS/JS or API responses from that old deployment.
export function middleware() {
  const response = NextResponse.next();
  for (const path of [
    '/',
    '/_next',
    '/_next/static',
    '/_next/static/css',
    '/_next/static/chunks',
    '/api',
  ]) {
    response.headers.append(
      'Set-Cookie',
      `__vdpl=; Path=${path}; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    );
  }
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export const config = { matcher: ['/'] };
