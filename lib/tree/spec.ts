import { attachVisibility } from './visibility';
import { MAX_UI_NODES } from './limits';
import {
  extendedDefinitions,
  extendedKinds,
  extendedContainers,
  extendedBindings,
  overlayKinds,
} from './extended-spec';
/** Jeverative's own UI document. No executable code or unbounded styling. */
export const nodeKinds = [
  'page',
  'stack',
  'grid',
  'panel',
  'form',
  'heading',
  'text',
  'avatar',
  'icon',
  'metric',
  'badge',
  'separator',
  'input',
  'textarea',
  'switch',
  'checkbox',
  'select',
  'radio',
  'button',
  'progress',
  'table',
  'chart',
  'tabs',
  'accordion',
  'alert',
  'dialog',
  ...extendedKinds,
] as const;
export type NodeKind = (typeof nodeKinds)[number];
export type Value = string | number | boolean;
export type Props = Record<string, unknown>;
export type UINode = {
  id: string;
  parent: string | null;
  kind: NodeKind;
  props: Props;
  when?: { key: string; equals: Value };
};
export type UIDocument = {
  version: 1;
  title: string;
  device: 'mobile' | 'tablet' | 'desktop';
  theme: 'light' | 'dark';
  nodes: UINode[];
};
const containers: NodeKind[] = [
  'page',
  'stack',
  'grid',
  'panel',
  'form',
  'accordion',
  'dialog',
  ...extendedContainers,
];
export const isContainer = (kind: NodeKind) => containers.includes(kind);
const idPattern = /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/;
export function validKey(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    idPattern.test(value) &&
    !['__proto__', 'prototype', 'constructor'].includes(value)
  );
}
const isRecord = (v: unknown): v is Props =>
  !!v && typeof v === 'object' && !Array.isArray(v);
export type Field =
  | 'text'
  | 'scalar'
  | 'number'
  | 'boolean'
  | 'options'
  | 'rows'
  | 'series'
  | readonly (string | number)[];
export const mintSpacing = [2, 4, 6, 8, 12, 16, 20, 24, 32, 40] as const;
const gap = mintSpacing;
const layout = { gap, align: ['start', 'center', 'end', 'stretch'] as const };
/** The prompt and validator use the same property contract. */
export const definitions: Record<
  NodeKind,
  { description: string; fields: Record<string, Field>; required: string[] }
> = {
  ...extendedDefinitions,
  page: {
    description:
      'Root page; exactly one. Children create the actual screen hierarchy.',
    fields: { ...layout, width: ['wide', 'reading'], padding: [16, 24, 32] },
    required: [],
  },
  stack: {
    description:
      'A row or column of related elements. Rows wrap before content is squeezed.',
    fields: {
      ...layout,
      direction: ['row', 'column'],
      justify: ['start', 'between', 'end', 'center'],
    },
    required: [],
  },
  grid: {
    description:
      'Responsive equal columns or main/support split. Mobile always stacks.',
    fields: {
      ...layout,
      columns: [1, 2, 3, 4],
      ratio: ['equal', 'main-left', 'main-right'],
    },
    required: [],
  },
  panel: {
    description:
      'Content surface with an optional section title. Avoid nesting panels.',
    fields: {
      ...layout,
      title: 'text',
      description: 'text',
      surface: ['plain', 'card', 'subtle'],
    },
    required: [],
  },
  form: {
    description:
      'Related fields with validation. Put submit and reset buttons inside.',
    fields: { ...layout, title: 'text', description: 'text' },
    required: [],
  },
  heading: {
    description: 'One page title; smaller headings introduce sections.',
    fields: { text: 'text', level: [1, 2, 3] },
    required: ['text'],
  },
  text: {
    description: 'Prompt-specific copy or state-bound text.',
    fields: {
      text: 'text',
      tone: ['primary', 'secondary', 'positive', 'negative'],
      size: ['body', 'caption'],
      bind: 'text',
    },
    required: ['text'],
  },
  avatar: {
    description: 'Identity initials; can repeat for different people.',
    fields: { name: 'text', size: [32, 48, 64, 80] },
    required: ['name'],
  },
  icon: {
    description: 'Free Hugeicons rounded outline glyph.',
    fields: {
      name: [
        'Home',
        'Settings',
        'Bell',
        'Mail',
        'KeyRound',
        'Chart',
        'Folder',
        'Grid',
        'Check',
        'Star',
        'Search',
        'Plus',
        'ArrowUpRight',
        'Monitor',
        'Smartphone',
      ],
      size: [16, 20, 24, 28],
    },
    required: ['name'],
  },
  metric: {
    description:
      'One metric instance. Use separate nodes for multiple metrics.',
    fields: {
      label: 'text',
      value: 'text',
      detail: 'text',
      tone: ['primary', 'positive', 'negative'],
    },
    required: ['label', 'value'],
  },
  badge: {
    description: 'Status label; do not use for financial gains/losses.',
    fields: { text: 'text', variant: ['outline', 'secondary'] },
    required: ['text'],
  },
  separator: {
    description: 'Divider between related groups.',
    fields: {},
    required: [],
  },
  input: {
    description: 'One labelled bound text field.',
    fields: {
      label: 'text',
      description: 'text',
      bind: 'text',
      value: 'text',
      placeholder: 'text',
      type: ['text', 'email', 'password', 'number', 'search'],
      required: 'boolean',
    },
    required: ['label', 'bind'],
  },
  textarea: {
    description: 'One labelled multiline field.',
    fields: {
      label: 'text',
      description: 'text',
      bind: 'text',
      value: 'text',
      placeholder: 'text',
      required: 'boolean',
    },
    required: ['label', 'bind'],
  },
  switch: {
    description: 'One preference with an explicit consequence.',
    fields: {
      label: 'text',
      description: 'text',
      bind: 'text',
      checked: 'boolean',
    },
    required: ['label', 'bind'],
  },
  checkbox: {
    description: 'One consent or task item.',
    fields: {
      label: 'text',
      description: 'text',
      bind: 'text',
      checked: 'boolean',
    },
    required: ['label', 'bind'],
  },
  select: {
    description: 'Labelled dropdown with actual choices.',
    fields: {
      label: 'text',
      bind: 'text',
      options: 'options',
      value: 'text',
      required: 'boolean',
    },
    required: ['label', 'bind', 'options'],
  },
  radio: {
    description: 'Visible mutually exclusive choices.',
    fields: {
      label: 'text',
      bind: 'text',
      options: 'options',
      value: 'text',
      required: 'boolean',
    },
    required: ['label', 'bind', 'options'],
  },
  button: {
    description:
      'Local action: notify, reset, submit, toggle a dialog, or select a state value. Never real transactions.',
    fields: {
      label: 'text',
      variant: ['default', 'outline', 'ghost', 'destructive'],
      size: ['small', 'medium', 'large'],
      accent: 'boolean',
      disabled: 'boolean',
      loading: 'boolean',
      action: ['notify', 'reset', 'submit', 'toggle', 'set'],
      target: 'text',
      value: 'scalar',
      message: 'text',
    },
    required: ['label', 'action'],
  },
  progress: {
    description: 'Bounded progress indicator with a visible label.',
    fields: { label: 'text', value: 'number' },
    required: ['label', 'value'],
  },
  table: {
    description: 'Real table for aligned records. Give a full-width section.',
    fields: { title: 'text', columns: 'options', rows: 'rows' },
    required: ['columns', 'rows'],
  },
  chart: {
    description: 'Line or bar chart with labelled sample data.',
    fields: { title: 'text', series: 'series', style: ['line', 'bar'] },
    required: ['series'],
  },
  tabs: {
    description:
      'Switch sibling panels. Add when conditions to associated panel nodes using this bind key.',
    fields: {
      label: 'text',
      bind: 'text',
      options: 'options',
      value: 'text',
      required: 'boolean',
    },
    required: ['bind', 'options'],
  },
  accordion: {
    description: 'An expandable titled section with child nodes.',
    fields: { title: 'text', open: 'boolean' },
    required: ['title'],
  },
  alert: {
    description: 'Relevant explanatory status message.',
    fields: { title: 'text', description: 'text' },
    required: ['title'],
  },
  dialog: {
    description:
      'Initially closed dialog container. A button toggles it using target equal to this node id.',
    fields: { title: 'text', description: 'text' },
    required: ['title'],
  },
};
function checkField(value: unknown, type: Field): boolean {
  if (Array.isArray(type)) return type.includes(value as never);
  if (type === 'text') return typeof value === 'string' && value.length <= 1200;
  if (type === 'scalar')
    return (
      (typeof value === 'string' && value.length <= 1200) ||
      typeof value === 'boolean' ||
      (typeof value === 'number' &&
        Number.isFinite(value) &&
        Math.abs(value) <= 1e12)
    );
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'number')
    return (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      Math.abs(value) <= 1e12
    );
  if (type === 'options')
    return (
      Array.isArray(value) &&
      value.length >= 1 &&
      value.length <= 12 &&
      value.every(
        (v) => typeof v === 'string' && v.length > 0 && v.length <= 100,
      ) &&
      new Set(value).size === value.length
    );
  if (type === 'rows')
    return (
      Array.isArray(value) &&
      value.length <= 30 &&
      value.every(
        (row) =>
          Array.isArray(row) &&
          row.length <= 12 &&
          row.every((cell) => typeof cell === 'string' && cell.length <= 300),
      )
    );
  if (type === 'series')
    return (
      Array.isArray(value) &&
      value.length >= 2 &&
      value.length <= 30 &&
      value.every(
        (p) =>
          isRecord(p) &&
          Object.keys(p).every((k) => ['label', 'value'].includes(k)) &&
          typeof p.label === 'string' &&
          p.label.length <= 50 &&
          typeof p.value === 'number' &&
          Number.isFinite(p.value) &&
          Math.abs(p.value) <= 1e12,
      )
    );
  return false;
}
export function validateNode(raw: unknown): UINode {
  if (
    !isRecord(raw) ||
    Object.keys(raw).some(
      (k) => !['id', 'parent', 'kind', 'props', 'when'].includes(k),
    )
  )
    throw new Error('Unknown node fields.');
  if (!validKey(raw.id))
    throw new Error(
      'Node id must start with a letter and use only letters, numbers, underscores or hyphens (max 64).',
    );
  if (!(raw.parent === null || validKey(raw.parent)))
    throw new Error(
      `${raw.id}: parent must be an existing node id, or null for the page root.`,
    );
  if (!nodeKinds.includes(raw.kind as NodeKind))
    throw new Error(
      `${raw.id}: unsupported kind ${JSON.stringify(raw.kind)}. Use a catalog kind such as panel, stack, text or checkbox.`,
    );
  // Empty props are unambiguous for separators and default layout containers.
  if (
    raw.props === undefined &&
    definitions[raw.kind as NodeKind].required.length === 0
  )
    raw.props = {};
  if (!isRecord(raw.props))
    throw new Error(
      `${raw.id}: props must be an object containing the kind's required fields.`,
    );
  const kind = raw.kind as NodeKind,
    definition = definitions[kind];
  for (const key of definition.required)
    if (
      !(key in raw.props) ||
      (typeof raw.props[key] === 'string' && !(raw.props[key] as string).trim())
    )
      throw new Error(
        `${raw.id} (${kind}): missing props.${key}. Required: ${definition.required.join(', ')}.`,
      );
  for (const [key, value] of Object.entries(raw.props))
    if (
      !Object.hasOwn(definition.fields, key) ||
      !checkField(value, definition.fields[key])
    )
      throw new Error(
        `${raw.id}: invalid ${key}. Expected ${JSON.stringify(definition.fields[key] ?? Object.keys(definition.fields))}.`,
      );
  for (const key of ['bind', 'target'])
    if (raw.props[key] !== undefined && !validKey(raw.props[key]))
      throw new Error(`${raw.id}: invalid binding.`);
  if (
    kind === 'progress' &&
    ((raw.props.value as number) < 0 || (raw.props.value as number) > 100)
  )
    throw new Error('Progress must be 0–100.');
  if (
    ['table', 'data-table'].includes(kind) &&
    (raw.props.rows as string[][]).some(
      (row) => row.length !== ((raw.props as Props).columns as string[]).length,
    )
  )
    throw new Error('Table row width mismatch.');
  if (
    [
      'mint-bottom-nav',
      'mint-pill-group',
      'select',
      'radio',
      'tabs',
      'native-select',
      'combobox',
      'toggle-group',
      'sidebar',
      'breadcrumb',
      'command',
      'context-menu',
      'dropdown-menu',
      'menubar',
      'navigation-menu',
      'questionnaire',
    ].includes(kind) &&
    raw.props.value !== undefined &&
    !(raw.props.options as string[]).includes(raw.props.value as string) &&
    !(
      !['tabs', 'mint-bottom-nav', 'mint-pill-group'].includes(kind) &&
      raw.props.value === ''
    )
  )
    throw new Error(
      `${raw.id}: props.value must exactly match one of props.options ${JSON.stringify(raw.props.options)}. Omit value to use the first option; select/radio may use an empty string for no selection.`,
    );
  if (
    kind === 'button' &&
    ['set', 'toggle'].includes(raw.props.action as string) &&
    !raw.props.target
  )
    throw new Error('Action requires a target.');
  if (
    kind === 'button' &&
    raw.props.action === 'set' &&
    !['string', 'number', 'boolean'].includes(typeof raw.props.value)
  )
    throw new Error('Set requires a string, number or boolean value.');
  if (
    raw.when !== undefined &&
    (!isRecord(raw.when) ||
      Object.keys(raw.when).some((k) => !['key', 'equals'].includes(k)) ||
      !validKey(raw.when.key) ||
      !['string', 'boolean', 'number'].includes(typeof raw.when.equals))
  )
    throw new Error('Invalid visibility condition.');
  if (
    kind === 'mint-bottom-nav' &&
    ((raw.props.options as string[]).length < 3 ||
      (raw.props.options as string[]).length > 5)
  )
    throw new Error(`${raw.id}: bottom navigation requires 3–5 destinations.`);
  if (
    kind === 'mint-pill' &&
    raw.props.count !== undefined &&
    (!Number.isInteger(raw.props.count) || (raw.props.count as number) < 0)
  )
    throw new Error(`${raw.id}: count must be a nonnegative integer.`);
  if (
    kind === 'financial-value' &&
    raw.props.amount === undefined &&
    raw.props.unavailable !== true
  )
    throw new Error(`${raw.id}: supply amount or unavailable:true.`);
  if (
    kind === 'mint-order-input' &&
    raw.props.value !== undefined &&
    ((raw.props.value as number) < (raw.props.mode === 'lots' ? 1 : 0) ||
      (['lots', 'quantity'].includes(raw.props.mode as string) &&
        !Number.isInteger(raw.props.value)))
  )
    throw new Error(
      `${raw.id}: order value must be nonnegative; lots/quantity are whole numbers and lots start at 1.`,
    );
  if (kind === 'slider') {
    const min = (raw.props.min ?? 0) as number,
      max = (raw.props.max ?? 100) as number;
    if (
      min >= max ||
      (raw.props.step !== undefined && (raw.props.step as number) <= 0) ||
      (raw.props.value !== undefined &&
        ((raw.props.value as number) < min ||
          (raw.props.value as number) > max))
    )
      throw new Error(
        `${raw.id}: slider requires min < max, positive step and value inside the range.`,
      );
  }
  if (
    kind === 'pagination' &&
    raw.props.value !== undefined &&
    (!Number.isInteger(raw.props.value) ||
      (raw.props.value as number) < 1 ||
      (raw.props.value as number) > (raw.props.pages as number))
  )
    throw new Error(`${raw.id}: page must be an integer from 1 to pages.`);
  if (['calendar', 'date-picker'].includes(kind) && raw.props.value) {
    const value = raw.props.value as string;
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(Date.parse(value)) ||
      new Date(value).toISOString().slice(0, 10) !== value
    )
      throw new Error(`${raw.id}: date must be a valid YYYY-MM-DD.`);
  }
  if (
    kind === 'input-otp' &&
    raw.props.value !== undefined &&
    (!/^\d*$/.test(raw.props.value as string) ||
      (raw.props.value as string).length > ((raw.props.length ?? 6) as number))
  )
    throw new Error(`${raw.id}: OTP must contain at most length digits.`);
  return structuredClone(raw) as UINode;
}
export function normalizeNodeContext(doc: UIDocument, raw: unknown): unknown {
  if (isRecord(raw) && isRecord(raw.props) && Object.hasOwn(raw.props, 'when')) {
    const { when, ...props } = raw.props;
    raw = attachVisibility({ ...raw, props }, when);
  }
  if (
    isRecord(raw) &&
    ['dialog', 'sheet', 'drawer', 'alert-dialog'].includes(String(raw.kind)) &&
    (raw.parent === undefined || raw.parent === null)
  ) {
    const rawId = raw.id;
    const existing = doc.nodes.find((n) => n.id === rawId);
    const parent =
      existing?.parent ??
      doc.nodes.find((n) => n.id === 'jevPrimary')?.id ??
      doc.nodes.find((n) => n.kind === 'page')?.id;
    if (parent) raw = { ...raw, parent };
  }
  if (
    isRecord(raw) &&
    isRecord(raw.props) &&
    (raw.props.label === undefined ||
      (typeof raw.props.label === 'string' && !raw.props.label.trim())) &&
    ['button-group', 'financial-value', 'mint-pill-group'].includes(
      String(raw.kind),
    )
  ) {
    const rawParent = raw.parent;
    const parent = doc.nodes.find((n) => n.id === rawParent);
    const texts = doc.nodes.filter(
      (n) => n.parent === rawParent && n.kind === 'text',
    );
    const sibling = texts.length === 1 ? texts[0] : undefined;
    const idLabel =
      typeof raw.id === 'string'
        ? raw.id
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[_-]+/g, ' ')
            .replace(/\b(group|select)\b/gi, '')
            .trim()
        : '';
    const { id: rawId, kind: rawKind } = raw;
    const label = [
      doc.nodes.find((node) => node.id === rawId && node.kind === rawKind)?.props.label,
      parent?.kind === 'field' ? parent.props.label : undefined,
      raw.kind === 'financial-value' && parent?.kind === 'mint-row'
        ? parent.props.title
        : undefined,
      raw.kind === 'financial-value' && parent?.kind === 'stack' &&
      parent.props.direction === 'row' ? sibling?.props.text : undefined,
      idLabel,
      raw.kind === 'financial-value' ? 'Amount' : 'Options',
    ].find((candidate): candidate is string =>
      typeof candidate === 'string' && Boolean(candidate.trim()),
    )?.trim();
    if (typeof label === 'string' && label)
      raw = {
        ...raw,
        props: {
          ...raw.props,
          label: label.charAt(0).toUpperCase() + label.slice(1),
        },
      };
  }
  if (isRecord(raw) && typeof raw.parent === 'string' && isRecord(raw.props)) {
    const parentId = raw.parent;
    const parent = doc.nodes.find(
      (n) => n.id === parentId && n.kind === 'field',
    );
    const definition = definitions[raw.kind as NodeKind];
    if (
      parent &&
      typeof parent.props.label === 'string' &&
      definition?.required.includes('label') &&
      raw.props.label === undefined
    )
      raw = { ...raw, props: { ...raw.props, label: parent.props.label } };
  }
  if (isRecord(raw) && isRecord(raw.props)) {
    const definition = definitions[raw.kind as NodeKind];
    const missingLabel =
      raw.props.label === undefined ||
      (typeof raw.props.label === 'string' && !raw.props.label.trim());
    if (
      missingLabel &&
      definition?.required.includes('label') &&
      definition.fields.bind
    ) {
      const { parent: parentId, id: nodeId, kind: nodeKind } = raw;
      const parent = doc.nodes.find((n) => n.id === parentId);
      const existing = doc.nodes.find(
        (n) => n.id === nodeId && n.kind === nodeKind,
      );
      // Reuse authored context first. Never infer labels from entered values.
      const identifier =
        typeof raw.props.bind === 'string' ? raw.props.bind : raw.id;
      const inferred =
        typeof identifier === 'string'
          ? identifier
              .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
              .replace(/[_-]+/g, ' ')
              .replace(/\b(input|field|control|select|textarea)\b/gi, '')
              .replace(/\bcust\b/gi, 'customer')
              .replace(/\s+/g, ' ')
              .trim()
          : '';
      const label =
        (parent?.kind === 'field' ? parent.props.label : undefined) ??
        existing?.props.label ??
        inferred;
      if (typeof label === 'string' && label.trim())
        raw = {
          ...raw,
          props: {
            ...raw.props,
            label: label.trim().charAt(0).toUpperCase() + label.trim().slice(1),
          },
        };
    }
  }
  return raw;
}
export function appendNode(doc: UIDocument, raw: unknown): UIDocument {
  const node = validateNode(normalizeNodeContext(doc, raw));
  if (doc.nodes.some((n) => n.id === node.id))
    throw new Error(
      `${node.id}: duplicate node id. Every content node needs its own id; never repeat an existing scaffold node.`,
    );
  if (doc.nodes.length >= MAX_UI_NODES)
    throw new Error(
      `Maximum ${MAX_UI_NODES} nodes including the Jev scaffold. Use table/data-table rows for repeated records instead of duplicating controls.`,
    );
  if (!doc.nodes.length) {
    if (node.parent !== null || node.kind !== 'page')
      throw new Error('First node must be the page root.');
  } else {
    const parent = doc.nodes.find((n) => n.id === node.parent);
    if (!parent || !isContainer(parent.kind) || node.kind === 'page')
      throw new Error(`Invalid parent for ${node.id}: ${String(node.parent)}${parent ? ` (${parent.kind}) cannot contain this node` : ' does not exist'}. Use an existing container id and emit parents before children; do not add another page root.`);
    let depth = 1,
      ancestor: UINode | undefined = parent;
    while (ancestor) {
      depth++;
      ancestor = doc.nodes.find((n) => n.id === ancestor!.parent);
    }
    if (depth > 8) throw new Error('Maximum nesting depth exceeded.');
    if (['form', 'questionnaire'].includes(node.kind)) {
      let ancestor: UINode | undefined = parent;
      while (ancestor) {
        if (['form', 'questionnaire'].includes(ancestor.kind))
          throw new Error('Nested forms are invalid.');
        ancestor = doc.nodes.find((n) => n.id === ancestor!.parent);
      }
    }
  }
  return { ...doc, nodes: [...doc.nodes, node] };
}
export function validateDocument(raw: unknown, complete = true): UIDocument {
  if (
    !isRecord(raw) ||
    Object.keys(raw).some(
      (k) => !['version', 'title', 'device', 'theme', 'nodes'].includes(k),
    ) ||
    raw.version !== 1 ||
    typeof raw.title !== 'string' ||
    raw.title.length > 120 ||
    !['mobile', 'tablet', 'desktop'].includes(raw.device as string) ||
    !['light', 'dark'].includes(raw.theme as string) ||
    !Array.isArray(raw.nodes)
  )
    throw new Error('Invalid UI document.');
  let doc: UIDocument = {
    version: 1,
    title: raw.title as string,
    device: raw.device as UIDocument['device'],
    theme: raw.theme as UIDocument['theme'],
    nodes: [],
  };
  for (const node of raw.nodes) doc = appendNode(doc, node);
  if (complete) {
    if (doc.nodes.length < 2 || !doc.nodes.some((n) => !isContainer(n.kind)))
      throw new Error('UI has no content.');
    for (const n of doc.nodes) {
      const children = doc.nodes.filter((child) => child.parent === n.id);
      if (
        n.kind === 'resizable' &&
        (children.length < 2 || children.length > 4)
      )
        throw new Error(`${n.id}: resizable requires 2–4 child panes.`);
      if (
        n.kind === 'mint-app-bar' &&
        n.props.variant === 'root' &&
        !doc.nodes.some(
          (nav) =>
            nav.kind === 'mint-bottom-nav' && nav.props.bind === n.props.target,
        )
      )
        throw new Error(
          `${n.id}: root app bar target must match a bottom navigation bind.`,
        );
      if (
        n.kind === 'mint-bottom-nav' &&
        !doc.nodes.some(
          (bar) =>
            bar.kind === 'mint-app-bar' &&
            bar.props.variant === 'root' &&
            bar.props.target === n.props.bind &&
            JSON.stringify(bar.when) === JSON.stringify(n.when),
        )
      )
        throw new Error(
          `${n.id}: bottom navigation requires a root app bar with matching visibility and target.`,
        );
      if (
        n.kind === 'mint-action-dock' &&
        (children.length < 1 ||
          children.length > 2 ||
          children.some((child) => child.kind !== 'button'))
      )
        throw new Error(
          `${n.id}: transaction dock requires one or two button children.`,
        );
      if (n.kind === 'panel') {
        const anchors = doc.nodes.filter(
          (child) =>
            child.kind === 'financial-value' &&
            child.props.role === 'anchor' &&
            (() => {
              let parent = doc.nodes.find((x) => x.id === child.parent);
              while (parent && parent.kind !== 'panel')
                parent = doc.nodes.find((x) => x.id === parent!.parent);
              return parent?.id === n.id;
            })(),
        );
        if (anchors.length > 1)
          throw new Error(
            `${n.id}: use only one financial anchor per panel; others use role:list.`,
          );
      }
      if (
        n.kind === 'financial-value' &&
        n.props.role === 'anchor' &&
        doc.nodes.some(
          (parent) => parent.id === n.parent && parent.kind === 'mint-row',
        )
      )
        throw new Error(`${n.id}: list values must use role:list.`);
      if (n.kind === 'carousel' && !children.length)
        throw new Error(`${n.id}: carousel needs slides.`);
      if (n.kind === 'field') {
        const controls = children.filter((c) =>
          [
            'input',
            'textarea',
            'select',
            'radio',
            'native-select',
            'combobox',
            'date-picker',
            'input-group',
            'input-otp',
            'slider',
          ].includes(c.kind),
        );
        if (
          controls.length !== 1 ||
          children.some(
            (c) =>
              ![
                ...controls.map((control) => control.kind),
                'label',
                'text',
              ].includes(c.kind),
          )
        )
          throw new Error(
            `${n.id}: field needs one input control; optional label/text siblings are allowed. Use form or panel for multiple controls.`,
          );
      }
      if (
        n.kind === 'label' &&
        !doc.nodes.some(
          (target) =>
            target.id === n.props.target &&
            [
              'input',
              'date-picker',
              'textarea',
              'select',
              'native-select',
              'combobox',
              'input-group',
              'input-otp',
              'switch',
              'checkbox',
              'toggle',
              'slider',
            ].includes(target.kind),
        )
      )
        throw new Error(`${n.id}: label target must be an input node.`);
    }
    for (const n of doc.nodes) {
      if (
        n.kind === 'button-group' &&
        doc.nodes.some(
          (child) =>
            child.parent === n.id && !['button', 'toggle'].includes(child.kind),
        )
      )
        throw new Error(
          `${n.id}: button-group children must be buttons or toggles.`,
        );
    }
    const bindings = defaultsFor(doc);
    for (const n of doc.nodes) {
      if (n.when && !Object.hasOwn(bindings, n.when.key))
        throw new Error('Visibility references an unknown binding.');
      if (
        n.kind === 'button' &&
        n.props.action === 'set' &&
        !Object.hasOwn(bindings, n.props.target as string)
      )
        throw new Error('Action references an unknown binding.');
    }
    for (const n of doc.nodes) {
      if (n.when && typeof n.when.equals !== typeof bindings[n.when.key])
        throw new Error(
          `${n.id}: condition must match the binding value type.`,
        );
      if (n.kind === 'button' && n.props.action === 'set') {
        const target = n.props.target as string;
        if (typeof n.props.value !== typeof bindings[target])
          throw new Error(
            `${n.id}: set value must match the target binding type.`,
          );
        const control = doc.nodes.find(
          (c) => c.props.bind === target && Array.isArray(c.props.options),
        );
        if (
          control &&
          !(control.props.options as unknown[]).includes(n.props.value)
        )
          throw new Error(`${n.id}: set value must match a target option.`);
      }
    }
    for (const n of doc.nodes)
      if (
        n.kind === 'button' &&
        n.props.action === 'toggle' &&
        !doc.nodes.some(
          (target) =>
            target.id === n.props.target && overlayKinds.includes(target.kind),
        )
      )
        throw new Error('Dialog target does not exist.');
  }
  return doc;
}
export function defaultsFor(doc: UIDocument): Record<string, Value> {
  const values: Record<string, Value> = Object.create(null);
  for (const n of doc.nodes) {
    if (overlayKinds.includes(n.kind)) values[n.id] = false;
    if (
      [
        'input',
        'textarea',
        'switch',
        'checkbox',
        'select',
        'radio',
        'tabs',
        ...extendedBindings,
      ].includes(n.kind) &&
      typeof n.props.bind === 'string' &&
      !(n.props.bind in values)
    )
      values[n.props.bind] = (n.props.checked ??
        n.props.value ??
        (n.kind === 'mint-order-input'
          ? n.props.mode === 'lots'
            ? 1
            : 0
          : n.kind === 'slider'
            ? (n.props.min ?? 0)
            : n.kind === 'pagination'
              ? 1
              : ['mint-pill', 'toggle', 'switch', 'checkbox'].includes(n.kind)
                ? false
                : Array.isArray(n.props.options)
                  ? n.props.options[0]
                  : '')) as Value;
  }
  return values;
}
export function qualityIssues(doc: UIDocument): string[] {
  const issues: string[] = [];
  if (
    doc.nodes.filter((n) => n.kind === 'heading' && n.props.level === 1)
      .length > 1
  )
    issues.push('Several page titles compete for attention.');
  for (const n of doc.nodes) {
    if (
      n.kind === 'panel' &&
      doc.nodes.find((p) => p.id === n.parent)?.kind === 'panel'
    )
      issues.push('Nested panels add unnecessary surfaces.');
  }
  return [...new Set(issues)];
}
