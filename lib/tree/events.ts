/** Decode equivalent transport envelopes, never change component data or guess events. */
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const metadataKeys = ['title', 'device', 'theme'];
export function normalizeUIEvent(
  raw: unknown,
  depth = 0,
): {
  event: Record<string, unknown>;
  adjusted: boolean;
} {
  if (!record(raw)) throw new Error('UI event must be an object.');
  if (depth > 4) throw new Error('UI event wrappers are nested too deeply.');
  const keys = Object.keys(raw);
  // Unwrap only unambiguous transport containers. Do not discard sibling fields.
  if (
    keys.length === 1 &&
    ['data', 'payload', 'event'].includes(keys[0]) &&
    record(raw[keys[0]])
  ) {
    const decoded = normalizeUIEvent(raw[keys[0]], depth + 1);
    return { event: decoded.event, adjusted: true };
  }
  if (typeof raw.event === 'string' && !('type' in raw)) {
    const { event, ...payload } = raw;
    const decoded = normalizeUIEvent({ type: event, ...payload }, depth + 1);
    return { event: decoded.event, adjusted: true };
  }
  if (
    keys.length === 1 &&
    ['screen', 'node', 'done', 'remove'].includes(keys[0])
  )
    return { event: raw, adjusted: false };
  if (keys.length === 1 && keys[0] === 'metadata')
    return { event: { screen: raw.metadata }, adjusted: true };
  if ('id' in raw && 'kind' in raw && !('type' in raw))
    return { event: { node: raw }, adjusted: true };
  if (keys.length && keys.every((key) => metadataKeys.includes(key)))
    return { event: { screen: raw }, adjusted: true };
  if (typeof raw.type === 'string') {
    const type = raw.type === 'metadata' ? 'screen' : raw.type;
    const payload = Object.fromEntries(
      Object.entries(raw).filter(([key]) => key !== 'type'),
    );
    const payloadKeys = Object.keys(payload);
    if (
      type === 'done' &&
      (!payloadKeys.length ||
        (payloadKeys.length === 1 && payload.done === true))
    )
      return { event: { done: true }, adjusted: true };
    if (type === 'screen' || type === 'node') {
      const wrappers =
        type === 'screen'
          ? ['screen', 'metadata', 'data', 'payload']
          : ['node', 'data', 'payload'];
      if (payloadKeys.length === 1 && wrappers.includes(payloadKeys[0]))
        return { event: { [type]: payload[payloadKeys[0]] }, adjusted: true };
      if (
        type === 'screen' &&
        payloadKeys.length &&
        payloadKeys.every((key) => metadataKeys.includes(key))
      )
        return { event: { screen: payload }, adjusted: true };
      if (type === 'node' && 'id' in payload && 'kind' in payload)
        return { event: { node: payload }, adjusted: true };
    }
  }
  throw new Error(
    'Unrecognized UI event envelope. Use {screen:{title,device,theme}}, {node:{id,parent,kind,props}}, or {done:true}.',
  );
}

export function screenMetadata(
  raw: unknown,
  fallback?: Record<string, unknown>,
) {
  if (
    !record(raw) ||
    Object.keys(raw).some((key) =>
      [
        'node',
        'nodes',
        'children',
        'root',
        '__proto__',
        'constructor',
        'prototype',
      ].includes(key),
    )
  )
    throw new Error(
      'Screen metadata must be an object without embedded UI nodes.',
    );
  const metadata = {
    ...fallback,
    ...Object.fromEntries(
      Object.entries(raw).filter(([key]) => metadataKeys.includes(key)),
    ),
  };
  if (
    typeof metadata.title !== 'string' ||
    !metadata.title.trim() ||
    metadata.title.length > 120 ||
    !['mobile', 'tablet', 'desktop'].includes(metadata.device as string) ||
    !['light', 'dark'].includes(metadata.theme as string)
  )
    throw new Error(
      'Screen metadata requires a title, device mobile/tablet/desktop, and theme light/dark.',
    );
  return {
    title: metadata.title,
    device: metadata.device,
    theme: metadata.theme,
  };
}
