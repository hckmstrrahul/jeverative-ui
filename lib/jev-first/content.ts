import type { UINode, UIDocument } from '../tree/spec';
import type { Candidate } from './candidates';
export type SuppliedContent = Record<string, unknown>;
const scalarKeys = [
  'title',
  'name',
  'email',
  'role',
  'bio',
  'inrBalance',
  'usdBalance',
  'primaryLabel',
  'destination',
] as const;
const allowed = new Set<string>([
  ...scalarKeys,
  'fields',
  'metrics',
  'table',
  'chart',
]);
function record(value: unknown): SuppliedContent {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Supplied data must be a JSON object.');
  return value as SuppliedContent;
}
const string = (v: unknown, label: string, max = 200): string => {
  if (typeof v !== 'string' || !v.trim() || v.length > max)
    throw new Error(
      `${label} must be nonempty text (maximum ${max} characters).`,
    );
  return v.trim();
};
const list = (v: unknown, label: string, max = 8): unknown[] => {
  if (!Array.isArray(v) || !v.length || v.length > max)
    throw new Error(`${label} needs 1–${max} items.`);
  return v;
};
/** Explicit user data only: no inferred names, invented values or code execution. */
export function readContent(prompt: string): SuppliedContent {
  let data: SuppliedContent = {};
  const fenced = prompt.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      data = record(JSON.parse(fenced[1]));
    } catch {
      throw new Error(
        'Could not read supplied data. Use a valid JSON object inside the json block.',
      );
    }
    for (const key of Object.keys(data))
      if (!allowed.has(key))
        throw new Error(
          `Unsupported data key: ${key}. Use title, name, email, role, bio, balances, primaryLabel, destination, fields, metrics, table or chart.`,
        );
  }
  const aliases: Record<string, string> = {
    name: 'name',
    email: 'email',
    role: 'role',
    bio: 'bio',
    title: 'title',
    heading: 'title',
    'inr balance': 'inrBalance',
    'usd balance': 'usdBalance',
    'primary label': 'primaryLabel',
    destination: 'destination',
  };
  for (const match of prompt.matchAll(
    /(?:^|[\n;])\s*(name|email|role|bio|title|heading|INR balance|USD balance|primary label|destination)\s*:\s*([^\n;]+)/gi,
  )) {
    const key = aliases[match[1].toLowerCase()];
    const value = match[2].trim().replace(/^["“]|["”]$/g, '');
    data[key] = key.endsWith('Balance')
      ? Number(value.replace(/[,₹$\s]/g, ''))
      : value;
  }
  for (const [key, pattern] of [
    [
      'name',
      /(?:profile for|named|name(?: is| to)?)\s+["“]([^"”\n]{1,100})["”]/i,
    ],
    ['title', /(?:title|heading)(?: is| to| as)?\s+["“]([^"”\n]{1,100})["”]/i],
    ['role', /role(?: is| to| as)?\s+["“]([^"”\n]{1,100})["”]/i],
    [
      'primaryLabel',
      /(?:button label|primary label)(?: is| to| as)?\s+["“]([^"”\n]{1,100})["”]/i,
    ],
  ] as const) {
    const match = prompt.match(pattern);
    if (match && data[key] === undefined) data[key] = match[1];
  }
  for (const key of scalarKeys)
    if (data[key] !== undefined) {
      if (key.endsWith('Balance')) {
        if (
          typeof data[key] !== 'number' ||
          !Number.isFinite(data[key]) ||
          Number(data[key]) < 0 ||
          Number(data[key]) > 1e12
        )
          throw new Error(`${key} must be a nonnegative finite number.`);
      } else data[key] = string(data[key], key);
    }
  return data;
}
export function suppliedCandidates(data: SuppliedContent): Candidate[] {
  const out: Candidate[] = [];
  function add(
    id: string,
    kind: UINode['kind'],
    props: UINode['props'],
    description: string,
    wide = false,
  ) {
    out.push({
      id,
      description,
      wide,
      required: true,
      nodes: [{ id: `jf_${id}`, parent: 'jf_page', kind, props }],
    });
  }
  if (data.fields !== undefined)
    for (const [i, raw] of list(data.fields, 'fields').entries()) {
      const f = record(raw),
        label = string(f.label, 'Field label', 80),
        type = f.type === undefined ? 'text' : string(f.type, 'Field type', 20);
      if (
        ![
          'text',
          'email',
          'number',
          'textarea',
          'select',
          'checkbox',
          'switch',
        ].includes(String(type))
      )
        throw new Error(`Unsupported field type: ${String(type)}.`);
      const props: UINode['props'] = { label, bind: `jf_custom_field_${i}` };
      if (f.required !== undefined) {
        if (
          typeof f.required !== 'boolean' ||
          ['checkbox', 'switch'].includes(type)
        )
          throw new Error(
            `${label}: required is supported on text and selection inputs only.`,
          );
        props.required = f.required;
      }
      if (type === 'select') {
        props.options = list(f.options, 'Field options', 12).map((v) =>
          string(v, 'Option', 60),
        );
        props.value = f.value ?? (props.options as string[])[0];
        if (!(props.options as string[]).includes(String(props.value)))
          throw new Error(`${label}: value must match an option.`);
      } else if (type === 'checkbox' || type === 'switch') {
        if (f.value !== undefined && typeof f.value !== 'boolean')
          throw new Error(`${label}: value must be true or false.`);
        props.checked = f.value ?? false;
      } else {
        if (
          f.value !== undefined &&
          typeof f.value !== 'string' &&
          typeof f.value !== 'number'
        )
          throw new Error(`${label}: invalid value.`);
        props.value = String(f.value ?? '');
        if (String(props.value).length > 200)
          throw new Error(`${label}: value is too long.`);
        if (type !== 'textarea') props.type = type;
      }
      add(
        `custom_field_${i}`,
        type === 'textarea' ||
          type === 'select' ||
          type === 'checkbox' ||
          type === 'switch'
          ? type
          : 'input',
        props,
        `Explicitly requested ${label} field (${String(type)}).`,
      );
    }
  if (data.metrics !== undefined)
    for (const [i, raw] of list(data.metrics, 'metrics', 6).entries()) {
      const m = record(raw);
      add(
        `custom_metric_${i}`,
        'metric',
        {
          label: string(m.label, 'Metric label', 80),
          value: string(m.value, 'Metric value', 80),
          ...(m.detail ? { detail: string(m.detail, 'Metric detail') } : {}),
        },
        'User-supplied summary metric.',
      );
    }
  if (data.table !== undefined) {
    const t = record(data.table),
      columns = list(t.columns, 'Table columns', 6).map((v) =>
        string(v, 'Column', 60),
      );
    const rows = list(t.rows, 'Table rows', 12).map((r) => {
      const cells = list(r, 'Row', 6);
      if (cells.length !== columns.length)
        throw new Error('Every table row must match the column count.');
      return cells.map((v) => {
        if (typeof v !== 'string' && typeof v !== 'number')
          throw new Error('Table cells must be text or numbers.');
        return string(String(v), 'Cell', 100);
      });
    });
    add(
      'custom_table',
      'table',
      { title: string(t.title, 'Table title'), columns, rows },
      'User-supplied table dataset.',
      true,
    );
  }
  if (data.chart !== undefined) {
    const c = record(data.chart);
    const series = list(c.series, 'Chart series', 12).map((raw) => {
      const point = record(raw);
      if (typeof point.value !== 'number' || !Number.isFinite(point.value))
        throw new Error('Chart values must be finite numbers.');
      return {
        label: string(point.label, 'Series label', 60),
        value: point.value,
      };
    });
    add(
      'custom_chart',
      'chart',
      { title: string(c.title, 'Chart title'), series, style: 'line' },
      'User-supplied chart dataset.',
      true,
    );
  }
  return out;
}
export function bindContent(
  candidates: Candidate[],
  data: SuppliedContent,
): Candidate[] {
  const changes: Record<string, Record<string, unknown>> = {};
  const put = (id: string, props: Record<string, unknown>) => {
    changes[id] = { ...changes[id], ...props };
  };
  if (data.name) {
    put('jf_identity_name', { text: data.name });
    put('jf_identity_avatar', { name: data.name });
    put('jf_input_name', { value: data.name });
  }
  if (data.email) put('jf_input_email', { value: data.email });
  if (data.role) put('jf_identity_role', { text: data.role });
  if (data.bio) put('jf_bio', { text: data.bio });
  if (data.destination)
    put('jf_stay_search_destination', { value: data.destination });
  for (const [key, id] of [
    ['inrBalance', 'jf_wallet_in_amount'],
    ['usdBalance', 'jf_wallet_us_amount'],
  ])
    if (data[key] !== undefined) put(id, { amount: data[key] });
  if (data.primaryLabel)
    for (const id of ['save', 'book', 'pay'])
      put(`jf_${id}`, { label: data.primaryLabel });
  return candidates.map((c) => ({
    ...c,
    nodes: c.nodes.map((n) => ({
      ...n,
      props: {
        ...n.props,
        ...changes[n.id],
        ...(n.kind === 'listing-card' && data.destination
          ? { location: data.destination }
          : {}),
      },
    })),
  }));
}
export function previousCustom(previous?: UIDocument): Candidate[] {
  return (previous?.nodes ?? [])
    .filter((n) => n.id.startsWith('jf_custom_'))
    .map((n) => ({
      id: n.id.slice(3),
      description: `Existing user-supplied ${n.kind}: ${typeof n.props.label === 'string' ? n.props.label : typeof n.props.title === 'string' ? n.props.title : 'content'}`,
      wide: ['table', 'chart'].includes(n.kind),
      nodes: [{ ...structuredClone(n), parent: 'jf_page' }],
    }));
}
