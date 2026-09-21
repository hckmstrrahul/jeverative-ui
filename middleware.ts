// Earlier deployments left path-scoped Vercel pins on asset requests. A new
// document must not fetch its CSS/JS or API responses from that old deployment.
export default function middleware() {
  // Vercel also builds this file outside Vinext's next/server alias. Keep it
  // dependency-free so both runtimes can execute the routing continuation.
  const response = new Response(null, { headers: { 'x-middleware-next': '1' } });
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
