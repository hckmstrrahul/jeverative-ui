import { MAX_UI_NODES } from './limits';
import { normalizePresentation } from './presentation';
import { omitEmptySupport } from './slots';
import { normalizeUIEvent, screenMetadata } from './events';
import {
  appendNode,
  normalizeNodeContext,
  validateNode,
  definitions,
  mintSpacing,
  validateDocument,
  type UIDocument,
  type UINode,
} from './spec';

/** Framing handles split UTF-8, split lines and SSE keep-alive comments. */
export async function* readLines(
  stream: ReadableStream<Uint8Array>,
  limit = 1_000_000,
): AsyncGenerator<string> {
  const reader = stream.getReader(),
    decoder = new TextDecoder();
  let buffer = '',
    total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) throw new Error('Stream size limit exceeded.');
      buffer += decoder.decode(value, { stream: true });
      let i: number;
      while ((i = buffer.indexOf('\n')) >= 0) {
        yield buffer.slice(0, i).replace(/\r$/, '');
        buffer = buffer.slice(i + 1);
      }
      if (buffer.length > 1_000_000) throw new Error('Stream line too large.');
    }
    buffer += decoder.decode();
    if (buffer.trim()) yield buffer;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
export async function* chatText(
  stream: ReadableStream<Uint8Array>,
  onUsage?: (usage: unknown) => void,
): AsyncGenerator<string> {
  let data: string[] = [],
    finished = false;
  const parse = (lines: string[]) => {
    const raw = lines.join('\n');
    if (raw === '[DONE]') {
      finished = true;
      return '';
    }
    const event = JSON.parse(raw);
    if (event.usage) onUsage?.(event.usage);
    if (event.error)
      throw new Error('The text model could not finish generation.');
    const choice = event.choices?.[0];
    if (choice?.finish_reason && choice.finish_reason !== 'stop')
      throw new Error('The text model stopped before completing the UI.');
    return typeof choice?.delta?.content === 'string'
      ? choice.delta.content
      : '';
  };
  for await (const line of readLines(stream)) {
    if (!line) {
      if (data.length) {
        const text = parse(data);
        data = [];
        if (text) yield text;
      }
    } else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
  }
  if (data.length) {
    const text = parse(data);
    if (text) yield text;
  }
  if (!finished) throw new Error('The provider stream ended unexpectedly.');
}
export class UIValidationError extends Error {
  constructor(
    message: string,
    readonly diagnostic?: {
      event: number;
      keys: string[];
      nodeId?: string;
      nodeKind?: string;
    },
  ) {
    super(message);
    this.name = 'UIValidationError';
  }
}
export class DocumentStream {
  constructor(
    private readonly scaffold: UINode[] = [],
    fallback?: Pick<UIDocument, 'title' | 'device' | 'theme'>,
    repairDocument?: UIDocument,
  ) {
    if (repairDocument) {
      this.document = validateDocument(repairDocument, false);
      this.repairMode = true;
      this.receivedMetadata = true;
      return;
    }
    if (fallback)
      this.document = validateDocument(
        { version: 1, ...fallback, nodes: scaffold },
        false,
      );
  }
  private repairMode = false;
  private receivedMetadata = false;
  private buffer = '';
  readonly adjustments: string[] = [];
  private pendingNodes: unknown[] = [];
  private eventCount = 0;
  private note(message: string) {
    if (this.adjustments.length < 30) this.adjustments.push(message);
  }
  document: UIDocument | null = null;
  finished = false;
  push(text: string): UIDocument[] {
    this.buffer += text;
    if (this.buffer.length > 1_000_000) throw new Error('UI event too large.');
    const snapshots: UIDocument[] = [];
    // Frame balanced JSON objects rather than relying on model line breaks.
    // Strings may contain braces and escaped quotes; neither closes an event.
    while (this.buffer.trim()) {
      this.buffer = this.buffer.trimStart();
      if (this.buffer.startsWith('```')) {
        const newline = this.buffer.indexOf('\n');
        if (newline < 0) break;
        if (!/^```(?:jsonl|json)?$/.test(this.buffer.slice(0, newline).trim()))
          throw new UIValidationError('Output JSON events without commentary.');
        this.buffer = this.buffer.slice(newline + 1);
        continue;
      }
      if (this.buffer[0] !== '{')
        throw new UIValidationError('Each UI event must be a JSON object.');
      let depth = 0,
        quoted = false,
        escaped = false,
        end = -1;
      for (let i = 0; i < this.buffer.length; i++) {
        const c = this.buffer[i];
        if (quoted) {
          if (escaped) escaped = false;
          else if (c === '\\') escaped = true;
          else if (c === '"') quoted = false;
        } else if (c === '"') quoted = true;
        else if (c === '{' || c === '[') depth++;
        else if (c === '}' || c === ']') {
          depth--;
          if (depth === 0) {
            end = i + 1;
            break;
          }
        }
      }
      if (end < 0) break;
      const object = this.buffer.slice(0, end);
      this.buffer = this.buffer.slice(end);
      const snapshot = this.line(object);
      if (snapshot) snapshots.push(snapshot);
    }
    return snapshots;
  }
  private line(line: string): UIDocument | null {
    this.eventCount++;
    try {
      return this.parseLine(line);
    } catch (error) {
      let diagnostic: {
        event: number;
        keys: string[];
        nodeId?: string;
        nodeKind?: string;
      } = { event: this.eventCount, keys: [] };
      try {
        const event = JSON.parse(line);
        const node = event?.node ?? event;
        diagnostic = {
          event: this.eventCount,
          keys:
            event && typeof event === 'object'
              ? Object.keys(event).slice(0, 8)
              : [],
          nodeId:
            typeof node?.id === 'string' ? node.id.slice(0, 64) : undefined,
          nodeKind:
            typeof node?.kind === 'string' ? node.kind.slice(0, 64) : undefined,
        };
      } catch {
        /* Do not echo raw generated content or provider payloads. */
      }
      throw new UIValidationError(
        error instanceof SyntaxError
          ? 'Malformed JSON event: check quotes, commas and brackets.'
          : error instanceof Error
            ? error.message
            : 'Invalid UI event.',
        diagnostic,
      );
    }
  }
  private parseLine(line: string): UIDocument | null {
    if (!line || /^```(?:jsonl|json)?$/.test(line)) return null;
    if (this.finished)
      throw new Error('Unexpected content after UI completion.');
    let event = JSON.parse(line);
    const normalized = normalizeUIEvent(event);
    event = normalized.event;
    if (normalized.adjusted)
      this.note('Normalized an equivalent UI event envelope.');
    if (Object.hasOwn(event, 'screen')) {
      if (
        event.screen &&
        typeof event.screen === 'object' &&
        Object.keys(event.screen).some(
          (key) => !['title', 'device', 'theme'].includes(key),
        )
      )
        this.note('Ignored non-rendering screen metadata fields.');
      const metadata = screenMetadata(
        event.screen,
        this.document
          ? {
              title: this.document.title,
              device: this.document.device,
              theme: this.document.theme,
            }
          : undefined,
      );
      if (this.receivedMetadata) {
        if (
          this.document?.title === metadata.title &&
          this.document.device === metadata.device &&
          this.document.theme === metadata.theme
        ) {
          this.note('Ignored repeated identical screen metadata.');
          return null;
        }
        throw new Error(
          'Duplicate screen metadata conflicts with the current screen.',
        );
      }
      this.document = validateDocument(
        {
          version: 1,
          ...metadata,
          nodes: this.document?.nodes ?? this.scaffold,
        },
        false,
      );
      this.receivedMetadata = true;
      let snapshot: UIDocument | null = this.document.nodes.length
        ? this.document
        : null;
      for (const pending of this.pendingNodes)
        snapshot =
          this.parseLine(JSON.stringify({ node: pending })) ?? snapshot;
      this.pendingNodes = [];
      return snapshot;
    }
    if (Object.hasOwn(event, 'remove')) {
      if (!this.repairMode || !this.document)
        throw new Error('Remove is only allowed during targeted repair.');
      if (
        typeof event.remove !== 'string' ||
        !/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(event.remove)
      )
        throw new Error('Remove requires a node id.');
      const target = this.document.nodes.find(
        (node) => node.id === event.remove,
      );
      if (!target) {
        this.note('Skipped removal of an already-absent node.');
        return null;
      }
      if (
        target.kind === 'page' ||
        this.scaffold.some((node) => node.id === target.id)
      ) {
        this.note(`Kept protected layout node ${target.id}.`);
        return null;
      }
      const removed = new Set([target.id]);
      for (const node of this.document.nodes)
        if (node.parent && removed.has(node.parent)) removed.add(node.id);
      this.document = validateDocument(
        {
          ...this.document,
          nodes: this.document.nodes.filter((node) => !removed.has(node.id)),
        },
        false,
      );
      this.note(
        `Removed ${target.id} and its descendants during targeted repair.`,
      );
      return this.document;
    }
    if (event.node && !this.document) {
      if (this.pendingNodes.length >= MAX_UI_NODES)
        throw new Error('Too many nodes before screen metadata.');
      this.pendingNodes.push(event.node);
      this.note('Buffered a node until screen metadata arrived.');
      return null;
    }
    if (event.node && this.document) {
      const before = event.node;
      event.node = normalizeNodeContext(this.document, event.node);
      if (event.node !== before)
        this.note(`Restored context for ${event.node.id}.`);
      const raw = event.node;
      if (
        raw.kind === 'mint-row' &&
        raw.props &&
        typeof raw.props === 'object' &&
        raw.props.icon !== undefined
      ) {
        const allowed = definitions['mint-row'].fields.icon;
        if (Array.isArray(allowed) && !allowed.includes(raw.props.icon)) {
          const { icon: _icon, ...props } = raw.props;
          event.node = {
            ...raw,
            props: {
              ...props,
              ...(props.leading === 'icon' ? { leading: 'none' } : {}),
            },
          };
          this.note(`Omitted unsupported decorative icon on ${raw.id}.`);
        }
      }
      const fields = definitions[raw.kind as UINode['kind']]?.fields;
      if (
        fields &&
        Object.hasOwn(fields, 'gap') &&
        raw.props &&
        typeof raw.props === 'object'
      ) {
        const gap = raw.props.gap;
        const value =
          typeof gap === 'number'
            ? gap
            : typeof gap === 'string' && /^\d+(?:\.\d+)?(?:px)?$/.test(gap)
              ? Number(gap.replace('px', ''))
              : NaN;
        if (Number.isFinite(value) && value >= 0 && value <= 64) {
          const tokens = [...mintSpacing];
          const snapped = tokens.reduce((best, token) =>
            Math.abs(token - value) < Math.abs(best - value) ? token : best,
          );
          if (gap !== snapped) {
            event.node = { ...raw, props: { ...raw.props, gap: snapped } };
            this.note(`Normalized ${raw.id} spacing to ${snapped}px.`);
          }
        }
      }
      const reserved = this.scaffold.find((n) => n.id === event.node.id);
      if (reserved) {
        // Models sometimes echo supplied context. Keep Jev's authoritative node;
        // never append the echo or apply its proposed properties.
        if (
          event.node.kind !== reserved.kind ||
          event.node.parent !== reserved.parent ||
          event.node.when !== undefined
        )
          throw new Error(
            `${reserved.id}: reserved scaffold identity cannot change. Emit only content nodes.`,
          );
        validateNode(event.node);
        return null;
      }
      if (
        this.scaffold.length &&
        ['jevPage', 'jevBody'].includes(event.node.parent)
      ) {
        const target =
          event.node.kind === 'heading' && event.node.props?.level === 1
            ? 'jevHeader'
            : 'jevPrimary';
        event.node = { ...event.node, parent: target };
        this.note(
          `Placed ${event.node.id} in ${target}; preserved Jev structure.`,
        );
      }
      const existing = this.document.nodes.findIndex(
        (node) => node.id === event.node.id,
      );
      if (this.repairMode && existing >= 0) {
        const replacement = validateNode(event.node);
        const nodes = [...this.document.nodes];
        nodes[existing] = replacement;
        // Validate the entire partial graph: updates cannot create invalid parents,
        // cycles, unsupported properties or a second page root.
        this.document = validateDocument({ ...this.document, nodes }, false);
        this.note(`Updated ${replacement.id} during targeted repair.`);
      } else {
        this.document = appendNode(this.document, event.node);
      }
      return this.document;
    }
    if (event.done === true && this.document) {
      for (const slot of this.scaffold.filter((n) =>
        ['jevHeader', 'jevPrimary'].includes(n.id),
      )) {
        if (!this.document.nodes.some((n) => n.parent === slot.id))
          throw new Error(
            `Jev slot ${slot.id} is empty. Add task-relevant content without re-emitting scaffold nodes.`,
          );
      }
      if (this.scaffold.some((node) => node.id === 'jevSupport')) {
        const compacted = omitEmptySupport(this.document);
        if (compacted !== this.document) {
          this.note(
            'Removed unused Jev support region and collapsed its empty layout track.',
          );
          this.document = compacted;
        }
      }
      const presentation = normalizePresentation(this.document);
      this.document = validateDocument(presentation.document);
      for (const note of presentation.adjustments) this.note(note);
      this.finished = true;
      if (!this.receivedMetadata)
        this.note('Used request screen metadata because the model omitted it.');
      return null;
    }
    throw new Error(
      !this.document
        ? 'Missing screen metadata. Emit {screen:{title,device,theme}} before done.'
        : `Unknown UI event ${Object.keys(event).join(', ')}. Use screen, node or done.`,
    );
  }
  finish(): UIDocument {
    if (this.buffer.trim()) this.line(this.buffer.trim());
    this.buffer = '';
    if (!this.finished || !this.document)
      throw new UIValidationError(
        'UI stream was incomplete; include the done event.',
      );
    return validateDocument(this.document);
  }
}
