/** Server routes only. Never expose the environment key to client code. */
export function serverOpenRouterKey() {
  const local = process.env.NODE_ENV === 'development' && !process.env.VERCEL;
  const sharedProduction =
    process.env.VERCEL_ENV === 'production' &&
    process.env.ALLOW_SHARED_OPENROUTER_KEY === 'true';
  if (!local && !sharedProduction) return undefined;
  return process.env.OPENROUTER_API_KEY?.trim() || undefined;
}

export function resolveOpenRouterKey(apiKey: unknown, source?: unknown) {
  const supplied = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (supplied) return supplied;
  return source === 'manual' ? undefined : serverOpenRouterKey();
}
