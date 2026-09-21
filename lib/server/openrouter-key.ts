/** Server routes only. Never expose the environment key to client code. */
export function localOpenRouterKey() {
  // A public deployment must always use the visitor's key, even if an
  // environment key is accidentally added to its configuration.
  if (process.env.NODE_ENV !== 'development' || process.env.VERCEL)
    return undefined;
  return process.env.OPENROUTER_API_KEY?.trim() || undefined;
}

export function resolveOpenRouterKey(apiKey: unknown, source?: unknown) {
  const supplied = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (supplied) return supplied;
  return source === 'manual' ? undefined : localOpenRouterKey();
}
