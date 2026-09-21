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

/** Recover canonical events grouped into one object without losing repeated node keys.
 * JSON.parse alone overwrites duplicate keys, so split the original member text.
 * Unknown siblings and typed/payload envelopes remain strict single events.
 */
export function splitUIEventBatch(source: string): string[] {
  try {
    const parsed = JSON.parse(source); // Reject malformed syntax before recovery.
    if (record(parsed) && Object.keys(parsed).length === 1 && Array.isArray(parsed.events)) {
      if (!parsed.events.length || parsed.events.length > 1024)
        throw new Error('Invalid event batch size.');
      // Each child goes through the same strict envelope and document validation.
      const events = parsed.events.map((event: unknown) => JSON.stringify(event));
      // A closed events array is an explicit document boundary. A model may omit
      // the redundant done item; run the same final validation locally instead
      // of paying for a correction whose entire response is {done:true}.
      if (!parsed.events.some((event: unknown) => record(event) &&
        ('done' in event || event.type === 'done' || event.event === 'done')))
        events.push('{"done":true}');
      return events;
    }
  } catch {
    return [source]; // The normal parser supplies its validation diagnostic.
  }
  const text = source.trim();
  if (!text.startsWith('{') || !text.endsWith('}')) return [source];
  const members: string[] = [];
  let depth = 0, quoted = false, escaped = false, start = 1;
  for (let i = 1; i < text.length - 1; i++) {
    const char = text[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === '{' || char === '[') depth++;
    else if (char === '}' || char === ']') depth--;
    else if (char === ',' && depth === 0) {
      members.push(`{${text.slice(start, i)}}`);
      start = i + 1;
    }
  }
  members.push(`{${text.slice(start, -1)}}`);
  if (members.length < 2) return [source];
  const canonical = ['screen', 'node', 'remove', 'done'];
  if (!members.every(member => {
    const keys = Object.keys(JSON.parse(member));
    return keys.length === 1 && canonical.includes(keys[0]);
  })) return [source];
  return members;
}
