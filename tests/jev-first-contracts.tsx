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
    assert.equal(previews.length, 2);
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
// First preview arrives before the second evaluation resolves.
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
while (event.value?.type !== 'preview') event = await iterator.next();
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
  'Jev-first: 8 scenarios × 2 themes, valid candidates, bounded batched composition, progressive preview, no text calls, rejection and cancellation pass.',
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
const single = await resultFor(['identity']);
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
assert.ok(previewSeen);
assert.equal(completeSeen, false);
console.log(
  'Jev-first variation conservation, candidate ownership, compact metric rows, unused columns, single-call screens and arrangement failure pass.',
);
