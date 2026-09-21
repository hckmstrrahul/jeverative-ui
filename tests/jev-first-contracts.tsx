import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildCandidates } from '../lib/jev-first/candidates';
import { composeJevFirst, type Evaluate } from '../lib/jev-first/compose';
import { validateDocument } from '../lib/tree/spec';
import { POST } from '../app/api/generate/route';
import { TreeRenderer } from '../components/tree-renderer';

const fixtures = [
  ['Profile', 'mobile', ['identity', 'bio', 'wallet_in', 'wallet_us', 'banks']],
  [
    'Settings',
    'mobile',
    [
      'input_name',
      'input_email',
      'security',
      'notifications',
      'language',
      'save',
    ],
  ],
  [
    'Sales',
    'desktop',
    [
      'period',
      'revenue',
      'orders',
      'customers',
      'revenue_line',
      'orders_table',
    ],
  ],
  [
    'Planner',
    'tablet',
    ['tasks_todo', 'tasks_progress', 'tasks_done', 'appointments'],
  ],
  ['Portfolio', 'desktop', ['portfolio_value', 'holdings', 'watchlist']],
  [
    'Support inbox',
    'desktop',
    ['conversation_list', 'conversation', 'customer_details'],
  ],
  [
    'Checkout',
    'mobile',
    ['order_summary', 'address', 'coupon', 'payment', 'pay'],
  ],
  ['Scheduler', 'desktop', ['date', 'time', 'timezone', 'book']],
] as const;
const candidates = buildCandidates('A profile');
assert.ok(candidates.length > 35);
function evaluator(
  ids: readonly string[],
  calls: Record<string, unknown>[] = [],
): Evaluate {
  return async (questions, state) => {
    calls.push(state);
    const answers: Record<string, unknown> = {};
    for (const [id, q] of Object.entries(questions)) {
      assert.equal(q.type, 'choice');
      if (q.type !== 'choice') continue;
      let value = Object.keys(q.criteria)[0];
      if (id.startsWith('use_'))
        value = ids.find((x) => Object.hasOwn(q.criteria, x)) ?? 'omit';
      if (id === 'supported') value = 'yes';
      if (id === 'layout')
        value = Object.hasOwn(q.criteria, 'two-column')
          ? 'two-column'
          : Object.keys(q.criteria)[0];
      if (id.startsWith('parent_'))
        value =
          id.includes('wallet_us') && Object.hasOwn(q.criteria, 'b')
            ? 'b'
            : 'a';
      if (id.startsWith('order_')) value = '0';
      answers[id] = { type: 'choice', choice: value };
    }
    return { answers, usage: { input_tokens: 200, cost: 0.00001 } };
  };
}
for (const [name, device, ids] of fixtures) {
  for (const theme of ['light', 'dark'] as const) {
    const calls: Record<string, unknown>[] = [];
    const evalBase = evaluator(ids, calls);
    const events = [];
    for await (const event of composeJevFirst({
      prompt: name,
      device,
      signal: new AbortController().signal,
      evaluate: async (q, s, a) => {
        const r = await evalBase(q, s, a);
        if ('theme' in q)
          (r.answers as Record<string, unknown>).theme = {
            type: 'choice',
            choice: theme,
          };
        return r;
      },
    }))
      events.push(event);
    assert.equal(calls.length, 2);
    const previews = events.filter((e) => e.type === 'preview');
    assert.equal(previews.length, 0);
    for (const preview of previews) validateDocument(preview.document);
    const end = events.at(-1);
    assert.equal(end?.type, 'complete');
    if (end?.type !== 'complete') throw new Error('Missing completion');
    assert.equal(end.metrics.textMs, 0);
    assert.equal(end.metrics.repairs, 0);
    assert.equal(end.metrics.jevCalls, 2);
    assert.equal(end.metrics.jevInputTokens, 400);
    assert.equal(
      new Set(end.document.nodes.map((n) => n.id)).size,
      end.document.nodes.length,
    );
    assert.equal(end.document.theme, theme);
    assert.ok(
      renderToStaticMarkup(<TreeRenderer document={end.document} />).length >
        100,
    );
    assert.ok(end.document.nodes.some((n) => n.id === `jf_${ids[0]}`));
  }
}
// Keep loading until arrangement resolves; publish only the completed layout.
let release!: () => void;
const gate = new Promise<void>((r) => {
  release = r;
});
let rounds = 0;
const baseEval = evaluator(['identity', 'bio']);
const iterator = composeJevFirst({
  prompt: 'Profile',
  device: 'desktop',
  signal: new AbortController().signal,
  evaluate: async (q, s, a) => {
    if (++rounds === 2) await gate;
    return baseEval(q, s, a);
  },
});
let event = await iterator.next();
while (event.value?.type !== 'plan') event = await iterator.next();
assert.equal(rounds, 1);
await iterator.next();
const pending = iterator.next();
await Promise.resolve();
assert.equal(rounds, 2);
release();
await pending;
while (!(await iterator.next()).done) {}
// Unsupported tasks and bad answers cannot become fabricated success.
await assert.rejects(async () => {
  for await (const _ of composeJevFirst({
    prompt: 'Unsupported',
    device: 'desktop',
    signal: new AbortController().signal,
    evaluate: async (q, s, a) => {
      const r = await baseEval(q, s, a);
      (r.answers as Record<string, unknown>).supported = {
        type: 'choice',
        choice: 'unavailable',
      };
      return r;
    },
  })) {
  }
}, /outside Jev-first/);
await assert.rejects(async () => {
  for await (const _ of composeJevFirst({
    prompt: 'Profile',
    device: 'desktop',
    signal: new AbortController().signal,
    evaluate: async () => ({ answers: {} }),
  })) {
  }
}, /invalid/);
const abort = new AbortController();
abort.abort();
await assert.rejects(async () => {
  for await (const _ of composeJevFirst({
    prompt: 'Profile',
    device: 'desktop',
    signal: abort.signal,
    evaluate: baseEval,
  })) {
  }
}, /abort/i);
// Route transport makes only Decisions requests, never chat completions.
const originalFetch = globalThis.fetch;
let upstreamCalls = 0;
try {
  globalThis.fetch = async (url, init) => {
    assert.equal(typeof url, 'string');
    assert.ok((url as string).includes('/decisions'));
    upstreamCalls++;
    const body = JSON.parse(init?.body as string);
    const r = await baseEval(
      body.questions,
      body.state,
      new AbortController().signal,
    );
    return Response.json(r);
  };
  const response = await POST(
    new Request('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Profile',
        engine: 'jev-first',
        apiKey: 'test-key',
        device: 'desktop',
      }),
    }),
  );
  assert.equal(response.status, 200);
  const lines = (await response.text())
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  assert.equal(lines.at(-1).type, 'complete');
  assert.equal(upstreamCalls, 2);
  assert.equal(lines.at(-1).engine, 'jev-first');
} finally {
  globalThis.fetch = originalFetch;
}
console.log(
  'Jev-first: 8 scenarios × 2 themes, valid candidates, bounded batched composition, atomic presentation, no text calls, rejection and cancellation pass.',
);

// Variation preserves content even when the evaluator would select something else.
async function resultFor(
  ids: readonly string[],
  previous?: import('../lib/tree/spec').UIDocument,
  variation = false,
) {
  let completed;
  for await (const event of composeJevFirst({
    prompt: 'Create a sales prototype',
    device: 'desktop',
    previous,
    variation,
    signal: new AbortController().signal,
    evaluate: evaluator(ids),
  }))
    if (event.type === 'complete') completed = event;
  assert.ok(completed);
  return completed;
}
const beforeVariation = await resultFor([
  'revenue',
  'orders',
  'customers',
  'revenue_line',
  'orders_table',
]);
const restored = buildCandidates('Sales', beforeVariation.document);
assert.deepEqual(
  restored.find((c) => c.id === 'revenue')?.nodes.map((n) => n.id),
  ['jf_revenue'],
);
const varied = await resultFor(['identity'], beforeVariation.document, true);
assert.equal(varied.document.title, beforeVariation.document.title);
assert.ok(varied.document.nodes.some((n) => n.id === 'jf_revenue_line'));
assert.ok(!varied.document.nodes.some((n) => n.id === 'jf_identity'));
const metricGrid = beforeVariation.document.nodes.find((n) =>
  n.id.startsWith('jf_metrics_'),
);
assert.equal(metricGrid?.props.columns, 3);
assert.equal(
  beforeVariation.document.nodes.find((n) => n.id === 'jf_body')?.props.columns,
  1,
);
const single = await resultFor(['bio']);
assert.equal(single.metrics.jevCalls, 1);
// A failure during arrangement cannot emit a completed document.
let secondCall = 0;
let previewSeen = false;
let completeSeen = false;
await assert.rejects(async () => {
  for await (const event of composeJevFirst({
    prompt: 'Profile',
    device: 'desktop',
    signal: new AbortController().signal,
    evaluate: async (q, s, a) =>
      ++secondCall === 2 ? { answers: {} } : baseEval(q, s, a),
  })) {
    if (event.type === 'preview') previewSeen = true;
    if (event.type === 'complete') completeSeen = true;
  }
}, /invalid/);
assert.equal(previewSeen, false);
assert.equal(completeSeen, false);
console.log(
  'Jev-first variation conservation, candidate ownership, compact metric rows, unused columns, single-call screens and arrangement failure pass.',
);

// Adversarial placements still obey semantic and viewport constraints.
const { sensibleLayout, constrainPlacement } =
  await import('../lib/jev-first/rules');
const all = buildCandidates('Prototype');
const chosenSet = (ids: string[]) => all.filter((c) => ids.includes(c.id));
const dataSet = chosenSet([
  'period',
  'revenue',
  'orders',
  'customers',
  'revenue_line',
  'orders_table',
]);
assert.equal(sensibleLayout(dataSet, 'three-column', 'desktop'), 'stacked');
assert.equal(sensibleLayout(dataSet, 'main-right', 'tablet'), 'stacked');
const dataRules = constrainPlacement(dataSet, 'main-right', {
  parent_period: 'a',
  parent_revenue: 'a',
  parent_orders_table: 'a',
});
assert.equal(dataRules.parent_orders_table, 'b');
assert.equal(dataRules.parent_revenue, 'b');
assert.ok(
  Number(dataRules.order_revenue) < Number(dataRules.order_orders_table),
);
const formRules = constrainPlacement(
  chosenSet(['input_name', 'input_email', 'security', 'save']),
  'two-column',
  { parent_input_name: 'b', parent_save: 'a' },
);
assert.equal(formRules.parent_save, 'b');
assert.ok(Number(formRules.order_input_email) < Number(formRules.order_save));
assert.equal(formRules.group_b, 'stack');
const inboxSet = chosenSet([
  'conversation_list',
  'conversation',
  'customer_details',
]);
assert.equal(sensibleLayout(inboxSet, 'main-left', 'desktop'), 'main-right');
const inboxRules = constrainPlacement(inboxSet, 'three-column', {});
assert.equal(inboxRules.parent_conversation_list, 'a');
assert.equal(inboxRules.parent_conversation, 'b');
assert.equal(inboxRules.parent_customer_details, 'c');
console.log(
  'Semantic cohort order, form/action locality, summary-before-detail and wide data/conversation constraints pass.',
);

// Property configuration and supplied content use the same renderer contracts.
const { readContent, suppliedCandidates, bindContent } =
  await import('../lib/jev-first/content');
const { configurationFor } = await import('../lib/jev-first/configure');
const { listingMatches } = await import('../lib/tree/listing');
const brief = readContent(
  'Name: Rahul\nINR balance: 42,500\nUSD balance: 1800\nRole: Designer',
);
const bound = bindContent(buildCandidates('Profile'), brief);
assert.equal(
  bound.find((c) => c.id === 'identity')?.nodes.find((n) => n.kind === 'avatar')
    ?.props.name,
  'Rahul',
);
assert.equal(
  bound
    .find((c) => c.id === 'wallet_in')
    ?.nodes.find((n) => n.kind === 'financial-value')?.props.amount,
  42500,
);
assert.throws(() => readContent('INR balance: not a number'), /finite/);
assert.throws(() => readContent('```json\n{broken}\n```'), /valid JSON/);
assert.throws(
  () =>
    suppliedCandidates({
      fields: [
        { label: 'Priority', type: 'select', options: ['Low'], value: 'High' },
      ],
    }),
  /match an option/,
);
const exactData = {
  title: 'Project intake',
  fields: [
    { label: 'Project name', value: 'Mint' },
    {
      label: 'Priority',
      type: 'select',
      options: ['Low', 'High'],
      value: 'High',
    },
  ],
  metrics: [{ label: 'Open projects', value: '12' }],
  chart: {
    title: 'Projects by week',
    series: [
      { label: 'Mon', value: 3 },
      { label: 'Tue', value: 5 },
    ],
  },
  table: {
    title: 'Projects',
    columns: ['Name', 'Owner'],
    rows: [['Mint', 'Rahul']],
  },
};
let customResult;
for await (const event of composeJevFirst({
  prompt:
    'Create a project workspace\n```json\n' +
    JSON.stringify(exactData) +
    '\n```',
  device: 'desktop',
  signal: new AbortController().signal,
  evaluate: evaluator(['save']),
}))
  if (event.type === 'complete') customResult = event;
assert.ok(customResult);
assert.equal(customResult.document.title, 'Project intake');
assert.equal(
  customResult.document.nodes.find((n) => n.id === 'jf_custom_field_1')?.props
    .value,
  'High',
);
assert.ok(customResult.document.nodes.some((n) => n.id === 'jf_custom_table'));
assert.equal(customResult.metrics.jevCalls, 2);
assert.equal(customResult.metrics.textMs, 0);
validateDocument(customResult.document);
assert.ok(
  renderToStaticMarkup(
    <TreeRenderer document={customResult.document} />,
  ).includes('Project name'),
);
const config = configurationFor(
  bound.filter((c) => c.id === 'wallet_in'),
  false,
);
const configAnswers = Object.fromEntries(
  Object.keys(config.questions).map((k) => [
    k,
    k.endsWith('_surface') ? 'card' : 'keep',
  ]),
);
assert.equal(config.apply(configAnswers)[0].nodes[0].props.surface, 'card');
assert.throws(() => config.apply({}), /Invalid configuration/);
assert.equal(Object.keys(configurationFor(bound, true).questions).length, 0);
const stayIds = [
  'stay_search',
  'stay_categories',
  'stay_coast',
  'stay_cabin',
  'stay_city',
  'stay_lake',
  'stay_desert',
  'stay_garden',
];
for (const device of ['desktop', 'tablet', 'mobile'] as const) {
  let end;
  for await (const e of composeJevFirst({
    prompt: 'airbnb homepage feed',
    device,
    signal: new AbortController().signal,
    evaluate: evaluator(stayIds),
  }))
    if (e.type === 'complete') end = e;
  assert.ok(end);
  validateDocument(end.document);
  assert.equal(
    end.document.nodes.filter((n) => n.kind === 'listing-card').length,
    6,
  );
  assert.ok(
    renderToStaticMarkup(<TreeRenderer document={end.document} />).includes(
      'Sea breeze villa',
    ),
  );
  const coast: import('../lib/tree/spec').UINode = end.document.nodes.find(
    (n) => n.id === 'jf_stay_coast',
  )!;
  assert.ok(
    listingMatches(coast, {
      jf_destination: 'Alibaug',
      jf_stay_category: 'Beachfront',
    }),
  );
  assert.equal(listingMatches(coast, { jf_stay_category: 'Cabins' }), false);
}
console.log(
  'Supplied fields, balances, datasets, property configuration, malformed data, stay feed rendering and local filters pass.',
);
const { bindingSignature, compatibleEdits } =
  await import('../lib/tree/edit-state');
const formDoc = customResult.document;
const local = {
  jf_custom_field_0: {
    value: 'Edited locally',
    signature: bindingSignature(formDoc, 'jf_custom_field_0'),
  },
};
assert.equal(
  compatibleEdits(formDoc, local).jf_custom_field_0,
  'Edited locally',
);
const updatedDoc = structuredClone(formDoc);
updatedDoc.nodes.find((n) => n.id === 'jf_custom_field_0')!.props.value =
  'A newly supplied name';
assert.equal(compatibleEdits(updatedDoc, local).jf_custom_field_0, undefined);
assert.equal(
  readContent('Make a profile for "Asha Rao" with heading "My account"').name,
  'Asha Rao',
);
assert.throws(
  () =>
    suppliedCandidates({
      table: { title: 'Bad', columns: ['Name'], rows: [[{ bad: true }]] },
    }),
  /text or numbers/,
);
let inheritedContext: unknown = 'unset';
for await (const _ of composeJevFirst({
  prompt: 'airbnb homepage feed',
  previous: customResult.document,
  device: 'desktop',
  signal: new AbortController().signal,
  evaluate: async (q, s, a) => {
    if ('layout' in q) {
      inheritedContext = s.previous;
      assert.equal(q.supported, undefined);
    }
    return evaluator(stayIds)(q, s, a);
  },
})) {
}
assert.equal(inheritedContext, undefined);
let invalidDataCalls = 0;
await assert.rejects(async () => {
  for await (const _ of composeJevFirst({
    prompt:
      'Create a form\n```json\n{"fields":[{"label":"Priority","type":"select","options":["Low"],"value":"High"}]}\n```',
    device: 'desktop',
    signal: new AbortController().signal,
    evaluate: async () => {
      invalidDataCalls++;
      return { answers: {} };
    },
  })) {
  }
}, /match an option/);
assert.equal(invalidDataCalls, 0);
const listingBefore = await resultFor(stayIds);
const listingVariation = await resultFor(stayIds, listingBefore.document, true);
assert.equal(
  listingBefore.document.nodes.find((n) => n.id === 'jf_group_b')?.props
    .columns,
  3,
);
assert.equal(
  listingVariation.document.nodes.find((n) => n.id === 'jf_group_b')?.props
    .columns,
  2,
);
assert.deepEqual(
  listingVariation.document.nodes
    .filter((n) => n.kind === 'listing-card')
    .map((n) => n.props),
  listingBefore.document.nodes
    .filter((n) => n.kind === 'listing-card')
    .map((n) => n.props),
);

assert.equal(
  buildCandidates('airbnb homepage feed').find((c) => c.id === 'stay_search')
    ?.resource,
  'search',
);

assert.equal(
  buildCandidates(
    'Create a form\n```json\n{"title":"Project intake","primaryLabel":"Save project"}\n```',
  ).some((c) => c.id.startsWith('quoted_')),
  false,
);
assert.equal(
  buildCandidates('Profile for "Rahul" with heading "Account"').some((c) =>
    c.id.startsWith('quoted_'),
  ),
  false,
);

// Known booking domains expose usable inventory before bypassing the generic gate.
for (const prompt of [
  'flight booking UI',
  'train booking UI',
  'bus booking UI',
  'car rental UI',
  'restaurant reservation UI',
  'concert tickets UI',
  'doctor appointment UI',
]) {
  const prepared = buildCandidates(prompt);
  const bookingIds = prepared
    .filter((c) => c.id.startsWith('booking_'))
    .map((c) => c.id);
  assert.ok(bookingIds.length >= 4, prompt);
  for (const device of ['desktop', 'tablet', 'mobile'] as const) {
    const events = [];
    const base = evaluator(bookingIds);
    for await (const event of composeJevFirst({
      prompt,
      device,
      signal: new AbortController().signal,
      evaluate: async (q, state, signal) => {
        assert.equal(q.supported, undefined);
        return base(q, state, signal);
      },
    }))
      events.push(event);
    const complete = events.at(-1);
    assert.equal(complete?.type, 'complete', prompt);
    if (complete?.type !== 'complete')
      throw Error('Expected booking completion');
    validateDocument(complete.document);
    const nodes = complete.document.nodes;
    const search = nodes.findIndex((n) => n.id.endsWith('_search'));
    const results = nodes.findIndex((n) => n.id.endsWith('_results'));
    assert.ok(search >= 0 && results > search);
    assert.ok(
      renderToStaticMarkup(
        <TreeRenderer document={complete.document} />,
      ).includes('Sample options'),
    );
    assert.equal(complete.metrics.textMs, 0);
    assert.equal(complete.metrics.repairs, 0);
  }
}
console.log(
  'Seven booking domains × three devices compile and render without text calls or correction.',
);
