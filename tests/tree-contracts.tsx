import { StreamPreview } from '../lib/tree/preview';
import assert from 'node:assert/strict';
import { renderToString } from 'react-dom/server';
import {
  appendNode,
  validateDocument,
  validateNode,
  defaultsFor,
  type UIDocument,
  type UINode,
} from '../lib/tree/spec';
import { DocumentStream, chatText, readLines } from '../lib/tree/stream';
import { documentScreen } from '../lib/tree/screen';
import { TreeRenderer } from '../components/tree-renderer';
import { TooltipProvider } from '../components/ui/tooltip';
import { Toaster } from '../components/ui/toast';
import {
  constrainLayout,
  layoutQuestions,
  applyLayoutAnswers,
  reviewState,
} from '../lib/tree/layout-review';
import {
  planNodes,
  parsePlan,
  planQuestions,
  previousArrangement,
} from '../lib/tree/jev-plan';
import { treeSystemPrompt } from '../lib/tree/prompt';
import { adaptiveCoverage } from '../lib/tree/coverage';
import {
  extendedDefinitions,
  extendedContainers,
} from '../lib/tree/extended-spec';
import { POST } from '../app/api/generate/route';
const metadata = {
  version: 1 as const,
  title: 'Team directory',
  device: 'desktop' as const,
  theme: 'light' as const,
};
const node = (
  id: string,
  parent: string | null,
  kind: UINode['kind'],
  props: UINode['props'] = {},
): UINode => ({ id, parent, kind, props });
const nodes = [
  node('root', null, 'page', { width: 'wide' }),
  node('title', 'root', 'heading', { text: 'People & permissions', level: 1 }),
  node('people', 'root', 'grid', { columns: 2 }),
  node('person-one', 'people', 'panel', { title: 'Priya Shah' }),
  node('person-two', 'people', 'panel', { title: 'Dev Mehta' }),
  node('person-one-role', 'person-one', 'text', { text: 'Design lead' }),
  node('person-two-role', 'person-two', 'text', { text: 'Engineering lead' }),
  node('account', 'root', 'form', { title: 'Account information' }),
  node('name', 'account', 'input', {
    label: 'Display name',
    bind: 'name',
    value: 'Priya Shah',
    required: true,
  }),
  node('email', 'account', 'input', {
    label: 'Email',
    bind: 'email',
    type: 'email',
    value: 'priya@example.com',
    required: true,
  }),
  node('save', 'account', 'button', {
    label: 'Save changes',
    action: 'submit',
  }),
];
const doc = validateDocument({ ...metadata, nodes });
assert.equal(
  doc.nodes.filter((n) => n.kind === 'input').length,
  2,
  'Independent instances retain their own properties',
);
assert.equal(documentScreen(doc).document?.nodes.length, nodes.length);
const html = renderToString(
  <TooltipProvider>
    <Toaster>
      <TreeRenderer document={doc} />
    </Toaster>
  </TooltipProvider>,
);
assert.ok(html.includes('Priya Shah') && html.includes('Dev Mehta'));
assert.ok(html.includes('People &amp; permissions'));
assert.ok(html.includes('tree-person-one-role') === false); // text is not a form input
assert.deepEqual(
  { ...defaultsFor(doc) },
  { name: 'Priya Shah', email: 'priya@example.com' },
);
for (const raw of [
  { ...nodes[0], props: { style: 'position:fixed' } },
  { ...nodes[1], kind: 'script' },
  { ...nodes[1], id: '__proto__' },
  { ...nodes[8], props: { label: 'Email', bind: 'constructor' } },
  { ...nodes[1], onClick: 'alert(1)' },
])
  assert.throws(() => validateNode(raw));
assert.throws(() =>
  validateDocument({ ...metadata, nodes: [...nodes, nodes[1]] }),
);
assert.throws(() =>
  validateDocument({
    ...metadata,
    nodes: [nodes[0], node('orphan', 'missing', 'text', { text: 'Bad' })],
  }),
);
assert.throws(() =>
  appendNode(doc, node('bad', 'title', 'text', { text: 'Leaf parent' })),
);
assert.throws(() => appendNode(doc, node('nested-form', 'account', 'form')));
assert.throws(() =>
  validateNode(
    node('table', 'root', 'table', { columns: ['Name'], rows: [['A', 'B']] }),
  ),
);
assert.throws(() =>
  validateNode(
    node('range', 'root', 'progress', { label: 'Progress', value: 110 }),
  ),
);
assert.throws(() =>
  validateDocument({
    ...metadata,
    nodes: [
      nodes[0],
      node('open', 'root', 'button', {
        label: 'Open',
        action: 'toggle',
        target: 'missing',
      }),
    ],
  }),
);
let deep: UIDocument = { ...metadata, nodes: [] };
for (let i = 0; i < 8; i++)
  deep = appendNode(
    deep,
    node('n' + i, i ? 'n' + (i - 1) : null, i ? 'stack' : 'page'),
  );
assert.throws(() =>
  appendNode(deep, node('n8', 'n7', 'text', { text: 'Too deep' })),
);

const samples: Partial<Record<UINode['kind'], UINode['props']>> = {
  stack: { direction: 'row' },
  panel: { title: 'Group' },
  form: { title: 'Form' },
  avatar: { name: 'Priya Shah' },
  icon: { name: 'Bell' },
  metric: { label: 'Revenue', value: '₹12,000.00' },
  badge: { text: 'Active' },
  separator: {},
  textarea: { label: 'Bio', bind: 'bio', value: 'Hello' },
  switch: { label: 'Alerts', bind: 'alerts', checked: true },
  checkbox: { label: 'Remember', bind: 'remember' },
  select: { label: 'Role', bind: 'role', options: ['Editor', 'Viewer'] },
  radio: { label: 'Scope', bind: 'scope', options: ['Team', 'Private'] },
  progress: { label: 'Completed', value: 40 },
  table: { columns: ['Name', 'Role'], rows: [['Priya', 'Editor']] },
  chart: {
    title: 'Visits',
    series: [
      { label: 'Mon', value: 5 },
      { label: 'Tue', value: 8 },
    ],
  },
  tabs: { bind: 'tab', options: ['Overview', 'Details'] },
  accordion: { title: 'Details', open: true },
  alert: { title: 'Sample data' },
  dialog: { title: 'Edit details' },
};
for (const [kind, props] of Object.entries(samples)) {
  const sample = validateDocument({
    ...metadata,
    nodes: [
      nodes[0],
      nodes[1],
      node('sample', 'root', kind as UINode['kind'], props),
    ],
  });
  assert.ok(
    renderToString(
      <TooltipProvider>
        <Toaster>
          <TreeRenderer document={sample} />
        </Toaster>
      </TooltipProvider>,
    ).length > 0,
    kind,
  );
}
assert.equal(adaptiveCoverage.length, 64);
assert.deepEqual(
  adaptiveCoverage.filter((c) => !c.kind),
  [],
);
const uiLines = [
  JSON.stringify({
    screen: {
      title: metadata.title,
      device: metadata.device,
      theme: metadata.theme,
    },
  }),
  ...nodes.map((node) => JSON.stringify({ node })),
  JSON.stringify({ done: true }),
];
const uiText = uiLines.join('\n');
const parser = new DocumentStream();
const previews = [];
for (let i = 0; i < uiText.length; i += 7)
  previews.push(...parser.push(uiText.slice(i, i + 7)));
assert.deepEqual(parser.finish(), doc);
assert.equal(previews.length, nodes.length);
assert.equal(previews[0].nodes.length, 1);
const unfinished = new DocumentStream();
unfinished.push(uiLines.slice(0, 3).join('\n') + '\n');
assert.throws(() => unfinished.finish());
const bytes = new TextEncoder().encode('₹ café\nsecond\n');
const byteStream = new ReadableStream<Uint8Array>({
  start(c) {
    for (const byte of bytes) c.enqueue(new Uint8Array([byte]));
    c.close();
  },
});
const decoded = [];
for await (const line of readLines(byteStream)) decoded.push(line);
assert.deepEqual(decoded, ['₹ café', 'second']);
function providerStream(text: string) {
  const events = [];
  for (let i = 0; i < text.length; i += 19)
    events.push(
      'data: ' +
        JSON.stringify({
          choices: [{ delta: { content: text.slice(i, i + 19) } }],
        }) +
        '\n\n',
    );
  return new Response(
    events.join('') +
      'data: ' +
      JSON.stringify({ choices: [{ delta: {}, finish_reason: 'stop' }] }) +
      '\n\ndata: [DONE]\n\n',
    { headers: { 'Content-Type': 'text/event-stream' } },
  );
}
let roundtrip = '';
for await (const text of chatText(providerStream(uiText).body!))
  roundtrip += text;
assert.equal(roundtrip, uiText);
const actualFetch = globalThis.fetch;
const request = (body: unknown) =>
  new Request('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:3000',
    },
    body: JSON.stringify({ engine: 'llm', ...(body as object) }),
  });
assert.equal(
  (
    await POST(
      request({ prompt: 'x', apiKey: 'test-key', model: 'typesafe/jev-1.13' }),
    )
  ).status,
  400,
);
let calls = 0;
globalThis.fetch = async (url, options) => {
  calls++;
  assert.equal(
    new Headers(options?.headers).get('Authorization'),
    'Bearer test-key',
  );
  if (typeof url === 'string' && url.endsWith('/chat/completions'))
    return providerStream(uiText);
  const body = JSON.parse(options?.body as string);
  assert.equal(body.state.document.nodes.length, nodes.length);
  return Response.json({
    answers: Object.fromEntries(
      Object.entries(body.questions).map(([id, q]) => [
        id,
        {
          type: 'choice',
          choice: Object.keys((q as { criteria: object }).criteria)[0],
        },
      ]),
    ),
  });
};
const response = await POST(
  request({ prompt: 'mobile team directory', apiKey: 'test-key' }),
);
const events = [];
for await (const line of readLines(response.body!))
  events.push(JSON.parse(line));
assert.equal(calls, 1);
assert.ok(
  events.some((e) => e.type === 'preview' && e.document.nodes.length === 1),
);
assert.equal(events.at(-1).type, 'complete');
assert.equal(events.at(-1).document.device, 'mobile');
assert.equal(
  events.at(-1).document.nodes.find((n: UINode) => n.kind === 'grid').props
    .columns,
  1,
);
// LLM-only uses exactly the same tree but makes no Jev request.
let llmCalls = 0;
globalThis.fetch = async (url) => {
  llmCalls++;
  assert.ok(typeof url === 'string' && url.endsWith('/chat/completions'));
  return providerStream(uiText);
};
const llmResponse = await POST(
  request({ prompt: 'team directory', apiKey: 'test-key', engine: 'llm' }),
);
const llmEvents = [];
for await (const line of readLines(llmResponse.body!))
  llmEvents.push(JSON.parse(line));
const llmDone = llmEvents.at(-1);
assert.equal(llmCalls, 1);
assert.equal(llmDone.type, 'complete');
assert.equal(llmDone.engine, 'llm');
assert.deepEqual(llmDone.document, constrainLayout(doc));
assert.equal(llmDone.metrics.reviewMs, 0);
assert.equal(llmDone.metrics.repairs, 0);
assert.ok(llmDone.metrics.firstContentMs !== null);
assert.ok(llmDone.metrics.totalMs >= llmDone.metrics.textMs);
assert.equal(
  (
    await POST(
      request({ prompt: 'profile', apiKey: 'test-key', engine: 'unknown' }),
    )
  ).status,
  400,
);
assert.equal(events.at(-1).engine, 'llm');
assert.ok(events.at(-1).metrics.reviewMs >= 0);
// Repair a profile/wallet output with a numeric metric, preserving both currencies.
const walletNodes = [
  node('root', null, 'page', { width: 'reading' }),
  node('title', 'root', 'heading', { text: 'Your profile', level: 1 }),
  node('in-wallet', 'root', 'metric', {
    label: 'IN stocks wallet',
    value: '₹25,000.00',
  }),
  node('us-wallet', 'root', 'metric', {
    label: 'US stocks wallet',
    value: '$1,250.00',
  }),
];
const walletText = [
  uiLines[0],
  ...walletNodes.map((node) => JSON.stringify({ node })),
  '{"done":true}',
].join('\n');
let repairCalls = 0;
globalThis.fetch = async (url, options) => {
  const payload = JSON.parse(options?.body as string);
  if (typeof url === 'string' && url.endsWith('/chat/completions')) {
    repairCalls++;
    if (repairCalls === 1)
      return providerStream(walletText.replace('"₹25,000.00"', '25000'));
    assert.match(payload.messages.at(-1).content, /in-wallet: invalid value/);
    assert.match(payload.messages.at(-2).content, /25000/);
    assert.match(
      payload.messages.at(-1).content,
      /Return ONLY replacement nodes/,
    );
    // Repair only the invalid wallet and missing remainder; root/title stay untouched.
    return providerStream(
      [
        ...walletNodes.slice(2).map((node) => JSON.stringify({ node })),
        '{"done":true}',
      ].join('\n'),
    );
  }
  return Response.json({
    answers: {
      root: { type: 'choice', choice: 'reading' },
      'root:gap': { type: 'choice', choice: '24' },
    },
  });
};
const repaired = await POST(
  request({
    prompt: 'a profile page with wallet balance for IN and US stocks',
    apiKey: 'test-key',
  }),
);
const repairedEvents = [];
for await (const line of readLines(repaired.body!))
  repairedEvents.push(JSON.parse(line));
assert.equal(repairCalls, 2);
assert.ok(repairedEvents.some((e) => e.type === 'status' && e.targetedRepair));
assert.equal(repairedEvents.at(-1).type, 'complete');
assert.deepEqual(
  repairedEvents.at(-1).document.nodes,
  constrainLayout({ ...metadata, nodes: walletNodes }).nodes,
);
assert.equal(repairedEvents.at(-1).document.nodes[0].props.gap, 24);
// Authentication failures must not consume a repair attempt.
let authCalls = 0;
globalThis.fetch = async () => {
  authCalls++;
  return new Response(null, { status: 401 });
};
const authFailure = await POST(
  request({ prompt: 'profile', apiKey: 'test-key' }),
);
assert.match(await authFailure.text(), /OpenRouter rejected this key/);
assert.equal(authCalls, 1);
let invalidCalls = 0;
// Invalid content may preview a valid prefix, but cannot produce a completed document.
globalThis.fetch = async () => {
  invalidCalls++;
  return providerStream(
    uiLines[0] +
      '\n' +
      JSON.stringify({ node: nodes[0] }) +
      '\n' +
      JSON.stringify({ node: { ...nodes[1], kind: 'script' } }) +
      '\n' +
      JSON.stringify({ done: true }),
  );
};
const invalidResponse = await POST(
  request({ prompt: 'directory', apiKey: 'test-key' }),
);
const invalidEvents = [];
for await (const line of readLines(invalidResponse.body!))
  invalidEvents.push(JSON.parse(line));
assert.equal(invalidEvents.at(-1).type, 'error');
assert.equal(invalidCalls, 2);
assert.match(
  invalidEvents.at(-1).message,
  /after correction: title: unsupported kind/,
);
assert.ok(!invalidEvents.some((e) => e.type === 'complete'));
assert.ok(!JSON.stringify(invalidEvents).includes('test-key'));
globalThis.fetch = actualFetch;
console.log(
  'Own tree engine: atomic instances, typed properties, graph limits, binding defaults, the adaptive adapters, chunk framing, progressive events and hybrid route validation pass.',
);

// Prove a node reaches the client before the upstream generation has finished.
let release: (() => void) | undefined;
const gate = new Promise<void>((resolve) => {
  release = resolve;
});
const encoder = new TextEncoder();
const sse = (content: string) =>
  encoder.encode(
    'data: ' + JSON.stringify({ choices: [{ delta: { content } }] }) + '\n\n',
  );
globalThis.fetch = async (url, options) => {
  if (typeof url === 'string' && url.endsWith('/chat/completions'))
    return new Response(
      new ReadableStream<Uint8Array>({
        async start(c) {
          c.enqueue(sse(uiLines.slice(0, 3).join('\n') + '\n'));
          await gate;
          c.enqueue(sse(uiLines.slice(3).join('\n')));
          c.enqueue(encoder.encode('data: [DONE]\n\n'));
          c.close();
        },
      }),
    );
  const payload = JSON.parse(options?.body as string);
  return Response.json({
    answers: Object.fromEntries(
      Object.entries(payload.questions).map(([id, q]) => [
        id,
        {
          type: 'choice',
          choice: Object.keys((q as { criteria: object }).criteria)[0],
        },
      ]),
    ),
  });
};
const progressive = await POST(
  request({ prompt: 'team directory', apiKey: 'test-key' }),
);
const iterator = readLines(progressive.body!);
let gotPreview = false;
for await (const line of iterator) {
  const event = JSON.parse(line);
  if (event.type === 'preview' && !gotPreview) {
    gotPreview = true;
    assert.ok(event.document.nodes.length < nodes.length);
    release!();
  }
}
assert.ok(gotPreview);
// Cancelling the consumer cancels the pending provider request.
let providerSignal: AbortSignal | null | undefined;
globalThis.fetch = async (_url, options) => {
  providerSignal = options?.signal;
  return new Promise<Response>((_resolve, reject) => {
    if (providerSignal?.aborted)
      reject(new DOMException('Aborted', 'AbortError'));
    else
      providerSignal?.addEventListener(
        'abort',
        () => reject(new DOMException('Aborted', 'AbortError')),
        { once: true },
      );
  });
};
const cancelled = await POST(
  request({ prompt: 'team directory', apiKey: 'test-key' }),
);
const reader = cancelled.body!.getReader();
await reader.read();
await reader.cancel();
assert.equal(providerSignal?.aborted, true);
globalThis.fetch = actualFetch;
console.log(
  'Progressive UI arrives before provider completion; cancelling the consumer aborts its upstream request.',
);

// Whitespace formatting is not a schema failure; escaped braces do not split events.
const prettyParser = new DocumentStream();
const pretty = uiLines
  .map((line) => JSON.stringify(JSON.parse(line), null, 2))
  .join('\n');
for (let i = 0; i < pretty.length; i += 3)
  prettyParser.push(pretty.slice(i, i + 3));
assert.deepEqual(prettyParser.finish(), doc);
assert.throws(
  () => validateNode({ ...nodes[1], kind: 'task' }),
  /unsupported kind/,
);
assert.throws(
  () => validateNode(node('toggle', 'root', 'switch', { bind: 'enabled' })),
  /missing props.label/,
);
assert.deepEqual(
  validateNode({ id: 'divider', parent: 'root', kind: 'separator' }).props,
  {},
);

const constrained = constrainLayout({ ...doc, device: 'mobile' });
assert.equal(
  constrained.nodes.find((n) => n.kind === 'grid')?.props.columns,
  1,
);
assert.equal(Object.keys(layoutQuestions(constrained)).length, 0);
assert.ok(Object.keys(layoutQuestions(doc)).length <= 6);
assert.ok(
  !JSON.stringify(reviewState(doc, 'directory')).includes('priya@example.com'),
);
assert.throws(() =>
  applyLayoutAnswers(doc, layoutQuestions(doc), {
    root: { type: 'choice', choice: 'bogus' },
  }),
);
const localBaseline = constrainLayout(doc);
const layoutChoice = layoutQuestions(localBaseline);
const applied = applyLayoutAnswers(
  localBaseline,
  layoutChoice,
  Object.fromEntries(
    Object.entries(layoutChoice).map(([id, q]) => [
      id,
      {
        type: 'choice',
        choice: q.type === 'choice' ? Object.keys(q.criteria)[0] : '',
      },
    ]),
  ),
);
assert.equal(
  applied.nodes.find((n) => n.kind === 'grid')?.props.ratio,
  'equal',
);
assert.deepEqual(
  applied.nodes.filter((n) => !['page', 'grid'].includes(n.kind)),
  localBaseline.nodes.filter((n) => !['page', 'grid'].includes(n.kind)),
);

// Jev chooses the scaffold BEFORE text generation, on all device sizes.
let planCalls = 0;
let contentCalls = 0;
globalThis.fetch = async (url, options) => {
  const payload = JSON.parse(options?.body as string);
  if (typeof url === 'string' && url.endsWith('/chat/completions')) {
    contentCalls++;
    assert.equal(planCalls, contentCalls);
    const task = JSON.parse(payload.messages[1].content);
    assert.ok(task.scaffold.some((n: UINode) => n.id === 'jevPrimary'));
    assert.ok(
      !payload.messages[0].content.includes('"parent":null,"kind":"page"'),
    );
    assert.ok(!payload.messages[0].content.includes('"parent":"page"'));
    return providerStream(
      [
        JSON.stringify({
          screen: { title: 'Account', device: task.device, theme: 'light' },
        }),
        // Reproduce the regression: the model repeats all scaffold nodes.
        ...task.scaffold.map((node: UINode) => JSON.stringify({ node })),
        JSON.stringify({
          node: node('title', 'jevPage', 'heading', {
            text: 'Your account',
            level: 1,
          }),
        }),
        JSON.stringify({
          node: node('balance', 'jevBody', 'metric', {
            label: 'Wallet',
            value: '₹25,000.00',
          }),
        }),
        '{"done":true}',
      ].join('\n'),
    );
  }
  planCalls++;
  assert.ok(payload.questions.arrangement);
  return Response.json({
    answers: {
      arrangement: { type: 'choice', choice: 'focused' },
      density: { type: 'choice', choice: 'comfortable' },
      surface: { type: 'choice', choice: 'plain' },
    },
  });
};
for (const device of ['mobile', 'tablet', 'desktop']) {
  const response = await POST(
    request({
      prompt: 'Profile wallet',
      device,
      engine: 'hybrid',
      apiKey: 'test-key',
    }),
  );
  const events = [];
  for await (const line of readLines(response.body!))
    events.push(JSON.parse(line));
  assert.ok(
    events.findIndex((e) => e.type === 'plan') <
      events.findIndex((e) => e.type === 'preview'),
  );
  assert.equal(events.at(-1).type, 'complete');
  assert.equal(events.at(-1).plan.arrangement, 'focused');
  assert.equal(events.at(-1).metrics.repairs, 0);
  assert.ok(
    events
      .at(-1)
      .adjustments.some((s: string) => s.includes('preserved Jev structure')),
  );
  assert.equal(
    new Set(events.at(-1).document.nodes.map((n: UINode) => n.id)).size,
    events.at(-1).document.nodes.length,
  );
  assert.equal(events.at(-1).document.nodes[0].id, 'jevPage');
  assert.equal(events.at(-1).document.nodes[0].props.width, 'reading');
}
assert.equal(planCalls, 3);
let failedPlanCalls = 0;
globalThis.fetch = async () => {
  failedPlanCalls++;
  return new Response(null, { status: 503 });
};
const unavailable = await POST(
  request({ prompt: 'Profile', engine: 'hybrid', apiKey: 'test-key' }),
);
assert.match(await unavailable.text(), /Jev composition is unavailable/);
assert.equal(failedPlanCalls, 1);
globalThis.fetch = actualFetch;
assert.doesNotThrow(() =>
  validateNode(
    node('bank', 'root', 'select', {
      label: 'Bank',
      bind: 'bank',
      options: ['HDFC', 'ICICI'],
      value: '',
      required: true,
    }),
  ),
);
assert.throws(
  () =>
    validateNode(
      node('bank', 'root', 'select', {
        label: 'Bank',
        bind: 'bank',
        options: ['HDFC'],
        value: 'hdfc',
      }),
    ),
  /bank: props.value/,
);

// Scaffold topology is authoritative, not merely advice to the text model.
const scaffold = planNodes(
  { arrangement: 'main-right', density: 'compact', surface: 'subtle' },
  'desktop',
);
assert.equal(scaffold[3].id, 'jevSupport');
assert.equal(scaffold[4].id, 'jevPrimary');
const protectedParser = new DocumentStream(scaffold);
protectedParser.push(uiLines[0]);
protectedParser.push(
  JSON.stringify({
    node: node('bypass', 'jevPage', 'text', { text: 'Content' }),
  }),
);
assert.equal(
  protectedParser.document?.nodes.find((n) => n.id === 'bypass')?.parent,
  'jevPrimary',
);
assert.deepEqual(
  protectedParser.document?.nodes.slice(0, scaffold.length),
  scaffold,
);
const emptySlots = new DocumentStream(scaffold);
emptySlots.push(uiLines[0]);
assert.throws(
  () => emptySlots.push('{"done":true}'),
  /slot jevHeader is empty/,
);
assert.throws(
  () =>
    parsePlan(
      { arrangement: { type: 'choice', choice: 'main-left' } },
      'mobile',
    ),
  /invalid arrangement/,
);
for (const device of ['mobile', 'tablet', 'desktop'] as const) {
  for (const arrangement of device === 'mobile'
    ? ['focused', 'stacked']
    : ['focused', 'stacked', 'main-left', 'main-right', 'equal']) {
    const seed = planNodes(
      { arrangement, density: 'comfortable', surface: 'plain' },
      device,
    );
    const parser = new DocumentStream(seed);
    parser.push(
      JSON.stringify({ screen: { title: 'Example', device, theme: 'light' } }),
    );
    for (const slot of seed.filter((n) =>
      ['jevHeader', 'jevPrimary', 'jevSupport'].includes(n.id),
    ))
      parser.push(
        JSON.stringify({
          node: node(`${slot.id}Content`, slot.id, 'text', {
            text: 'Relevant content',
          }),
        }),
      );
    parser.push('{"done":true}');
    assert.ok(parser.finish().nodes.length > seed.length);
  }
}

// Every newly registered kind has a contract-valid, SSR-renderable configuration.
for (const [kind, definition] of Object.entries(extendedDefinitions)) {
  const props: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(definition.fields)) {
    if (Array.isArray(field)) props[key] = field[0];
    else if (field === 'text')
      props[key] =
        key === 'bind'
          ? 'extendedValue'
          : key === 'value'
            ? 'One'
            : key === 'target'
              ? 'control'
              : 'Specific ' + key;
    else if (field === 'boolean') props[key] = false;
    else if (field === 'number')
      props[key] = key === 'min' ? 0 : key === 'max' ? 100 : 1;
    else if (field === 'options') props[key] = ['One', 'Two'];
    else if (field === 'rows') props[key] = [['Alpha', 'Beta']];
  }
  if (['calendar', 'date-picker'].includes(kind)) props.value = '2026-09-21';
  if (kind === 'input-otp') props.value = '1234';
  if (kind === 'mint-bottom-nav') {
    props.options = ['One', 'Two', 'Three'];
    props.value = 'One';
  }
  const sampleNodes = [
    nodes[0],
    nodes[1],
    node('control', 'root', 'input', { label: 'Target', bind: 'control' }),
    node('extended', 'root', kind as UINode['kind'], props),
  ];
  if (kind === 'mint-bottom-nav')
    sampleNodes.push(
      node('appbar', 'root', 'mint-app-bar', {
        title: 'One',
        variant: 'root',
        target: 'extendedValue',
      }),
    );
  if (kind === 'field')
    sampleNodes.push(
      node('child', 'extended', 'input', { label: 'Field', bind: 'child' }),
    );
  else if (['button-group', 'mint-action-dock'].includes(kind))
    sampleNodes.push(
      node('child', 'extended', 'button', { label: 'Save', action: 'notify' }),
    );
  else if (
    extendedContainers.includes(kind as keyof typeof extendedDefinitions)
  )
    sampleNodes.push(
      node('child', 'extended', 'text', { text: 'Actual child content' }),
    );
  if (kind === 'resizable')
    sampleNodes.push(
      node('second', 'extended', 'text', { text: 'Second pane content' }),
    );
  const sample = validateDocument({ ...metadata, nodes: sampleNodes });
  const markup = renderToString(
    <TooltipProvider>
      <Toaster>
        <TreeRenderer document={sample} />
      </Toaster>
    </TooltipProvider>,
  );
  assert.ok(markup.length > 0, kind);
}
assert.throws(
  () =>
    validateNode(
      node('range', 'root', 'slider', {
        label: 'Amount',
        bind: 'amount',
        min: 10,
        max: 1,
      }),
    ),
  /slider/,
);
assert.throws(
  () =>
    validateNode(
      node('date', 'root', 'date-picker', {
        label: 'Date',
        bind: 'date',
        value: '2026-02-30',
      }),
    ),
  /valid YYYY/,
);
assert.throws(
  () =>
    validateNode(
      node('page', 'root', 'pagination', {
        label: 'Pages',
        bind: 'page',
        pages: 3,
        value: 4,
      }),
    ),
  /integer/,
);
assert.throws(
  () =>
    validateDocument({
      ...metadata,
      nodes: [
        nodes[0],
        nodes[1],
        node('resize', 'root', 'resizable', { label: 'Panes' }),
      ],
    }),
  /2–4/,
);
assert.throws(
  () =>
    validateDocument({
      ...metadata,
      nodes: [
        nodes[0],
        nodes[1],
        node('label', 'root', 'label', { text: 'Invalid', target: 'missing' }),
      ],
    }),
  /input node/,
);
const overlay = validateDocument({
  ...metadata,
  nodes: [
    nodes[0],
    node('open', 'root', 'button', {
      label: 'Open settings',
      action: 'toggle',
      target: 'settings',
    }),
    node('settings', 'root', 'sheet', { title: 'Settings' }),
    node('detail', 'settings', 'text', { text: 'Your preferences' }),
  ],
});
assert.equal(defaultsFor(overlay).settings, false);
console.log(
  'All 64 catalog entries have adaptive coverage; extended adapters render and control/container contracts pass.',
);

// Prompt protocols are mutually exclusive, including their examples.
assert.ok(treeSystemPrompt(false).includes('"parent":null,"kind":"page"'));
assert.ok(!treeSystemPrompt(true).includes('"parent":"page"'));
const echoParser = new DocumentStream(scaffold);
echoParser.push(uiLines[0]);
for (const original of scaffold)
  echoParser.push(
    JSON.stringify({
      node: { ...original, props: { ...original.props, gap: 40 } },
    }),
  );
assert.deepEqual(
  echoParser.document?.nodes,
  scaffold,
  'Echoed props cannot overwrite Jev choices',
);
assert.throws(
  () =>
    echoParser.push(
      JSON.stringify({ node: { ...scaffold[0], kind: 'panel' } }),
    ),
  /reserved scaffold identity/,
);
const duplicateParser = new DocumentStream();
duplicateParser.push(uiLines.slice(0, 3).join('\n'));
assert.throws(
  () => duplicateParser.push(JSON.stringify({ node: nodes[1] })),
  /title: duplicate node id/,
);
const fieldDoc = validateDocument({
  ...metadata,
  nodes: [
    nodes[0],
    node('bank-field', 'root', 'field', { label: 'Bank' }),
    node('help', 'bank-field', 'text', { text: 'Choose your linked bank' }),
    node('bank-control', 'bank-field', 'combobox', {
      bind: 'bank',
      options: ['HDFC', 'ICICI'],
    }),
  ],
});
assert.equal(
  fieldDoc.nodes.find((n) => n.id === 'bank-control')?.props.label,
  'Bank',
);
assert.throws(
  () =>
    validateDocument({
      ...metadata,
      nodes: [
        ...fieldDoc.nodes,
        node('second-control', 'bank-field', 'input', {
          label: 'Another',
          bind: 'another',
        }),
      ],
    }),
  /one input control/,
);
assert.doesNotThrow(() =>
  validateNode(
    node('records', 'root', 'data-table', {
      columns: ['Name'],
      rows: [['Priya']],
    }),
  ),
);
assert.throws(
  () =>
    validateNode(
      node('standalone', 'root', 'combobox', {
        bind: 'choice',
        options: ['One'],
      }),
    ),
  /missing props.label/,
);
console.log(
  'Hybrid scaffold echoes never duplicate nodes or change Jev props; separate prompts and field/table regression cases pass.',
);

// Bounded normalization keeps topology and schema safety while accepting protocol variation.
const normalized = new DocumentStream(scaffold);
normalized.push(
  JSON.stringify(
    node('heading', 'jevPage', 'heading', { text: 'Planner', level: 1 }),
  ),
);
normalized.push(uiLines[0]);
normalized.push(
  JSON.stringify({
    node: node('priorityLegend', 'jevBody', 'stack', { gap: '20px' }),
  }),
);
normalized.push(
  JSON.stringify({
    node: node('content', 'priorityLegend', 'text', { text: 'High priority' }),
  }),
);
normalized.push(
  JSON.stringify({
    node: node('support', 'jevSupport', 'text', { text: 'Upcoming tasks' }),
  }),
);
normalized.push('{"done":true}');
const normalizedDoc = normalized.finish();
assert.equal(
  normalizedDoc.nodes.find((n) => n.id === 'heading')?.parent,
  'jevHeader',
);
assert.equal(
  normalizedDoc.nodes.find((n) => n.id === 'priorityLegend')?.props.gap,
  20,
);
assert.equal(
  normalizedDoc.nodes.find((n) => n.id === 'priorityLegend')?.parent,
  'jevPrimary',
);
assert.ok(normalized.adjustments.length >= 4);
for (const gap of ['calc(100vh)', -10, 10000]) {
  const bad = new DocumentStream();
  bad.push(uiLines[0]);
  bad.push(JSON.stringify({ node: nodes[0] }));
  assert.throws(
    () =>
      bad.push(
        JSON.stringify({ node: node('badgap', 'root', 'stack', { gap }) }),
      ),
    /invalid gap/,
  );
}
const missingMeta = new DocumentStream();
missingMeta.push(JSON.stringify({ node: nodes[0] }));
assert.throws(
  () => missingMeta.push('{"done":true}'),
  /Missing screen metadata/,
);

// Corrected content is visible immediately, without waiting for the old node count.
const presentation = new StreamPreview();
assert.equal(presentation.push({ ...doc, nodes: doc.nodes.slice(0, 1) }), null);
const firstDraft = { ...doc, nodes: doc.nodes.slice(0, 4) };
assert.equal(presentation.push(firstDraft), firstDraft);
assert.equal(
  presentation.push({ ...doc, nodes: doc.nodes.slice(0, 2) })?.nodes.length,
  2,
);
assert.equal(presentation.push(doc), doc);
// A corrected final result may be smaller; completion commits it directly in the client.
assert.equal(
  presentation.push({ ...doc, nodes: doc.nodes.slice(0, 3) })?.nodes.length,
  3,
);

// New variation excludes recent structures from Jev's actual candidate set.
for (const device of ['mobile', 'tablet', 'desktop'] as const) {
  const choices = planQuestions(device, ['focused', 'stacked']);
  assert.ok(choices.arrangement.type === 'choice');
  if (choices.arrangement.type === 'choice') {
    assert.ok(!Object.hasOwn(choices.arrangement.criteria, 'focused'));
    assert.ok(!Object.hasOwn(choices.arrangement.criteria, 'stacked'));
    for (const arrangement of Object.keys(choices.arrangement.criteria)) {
      const seed = planNodes(
        { arrangement, density: 'compact', surface: 'plain' },
        device,
      );
      assert.equal(
        previousArrangement({ ...metadata, device, nodes: seed }),
        arrangement,
      );
      const parser = new DocumentStream(seed);
      parser.push(
        JSON.stringify({
          screen: { title: 'Variation', device, theme: 'light' },
        }),
      );
      for (const slot of seed.filter((n) =>
        ['jevHeader', 'jevPrimary', 'jevSupport'].includes(n.id),
      ))
        parser.push(
          JSON.stringify({
            node: node(slot.id + 'Text', slot.id, 'text', { text: 'Content' }),
          }),
        );
      parser.push('{"done":true}');
      assert.ok(parser.finish());
    }
  }
  assert.throws(
    () =>
      parsePlan(
        {
          arrangement: { type: 'choice', choice: 'focused' },
          density: { type: 'choice', choice: 'compact' },
          surface: { type: 'choice', choice: 'plain' },
        },
        device,
        choices,
      ),
    /invalid arrangement/,
  );
}
for (const gap of [2, 6, 20])
  assert.doesNotThrow(() =>
    validateNode(node('mintGap', 'root', 'stack', { gap })),
  );

// Request-owned metadata prevents a needless correction call; protocol remains strict otherwise.
const fallbackMeta = {
  title: 'Wallet',
  device: 'mobile' as const,
  theme: 'dark' as const,
};
const noMeta = new DocumentStream([], fallbackMeta);
const withoutMeta = uiLines.slice(1).join('\n');
assert.ok(noMeta.push(withoutMeta).length > 0);
assert.equal(noMeta.finish().theme, 'dark');
assert.equal(noMeta.finish().device, 'mobile');
assert.ok(
  noMeta.adjustments.some((note) => note.includes('request screen metadata')),
);
const lateMeta = new DocumentStream([], fallbackMeta);
lateMeta.push(JSON.stringify({ node: nodes[0] }));
lateMeta.push(
  JSON.stringify({
    screen: { title: 'Explicit title', device: 'tablet', theme: 'light' },
  }),
);
assert.equal(lateMeta.document?.nodes.length, 1);
assert.equal(lateMeta.document?.title, 'Explicit title');
assert.throws(
  () => lateMeta.push(JSON.stringify({ screen: fallbackMeta })),
  /Duplicate screen metadata/,
);
assert.throws(
  () => new DocumentStream().push(withoutMeta),
  /Missing screen metadata/,
);
assert.throws(() => {
  const parser = new DocumentStream([], fallbackMeta);
  parser.push(JSON.stringify({ node: nodes[0] }));
  parser.finish();
}, /incomplete/);
assert.throws(
  () => new DocumentStream([], fallbackMeta).push('{"done":true}'),
  /no content/,
);

for (const engine of ['llm', 'hybrid']) {
  let paidCalls = 0;
  globalThis.fetch = async (url, options) => {
    paidCalls++;
    if (typeof url === 'string' && url.endsWith('/chat/completions')) {
      if (engine === 'llm') return providerStream(withoutMeta);
      const task = JSON.parse(
        JSON.parse(options?.body as string).messages[1].content,
      );
      return providerStream(
        [
          ...task.scaffold
            .filter((n: UINode) =>
              ['jevHeader', 'jevPrimary', 'jevSupport'].includes(n.id),
            )
            .map((n: UINode, i: number) =>
              JSON.stringify({
                node: node('content' + i, n.id, 'text', {
                  text: 'Relevant wallet content',
                }),
              }),
            ),
          '{"done":true}',
        ].join('\n'),
      );
    }
    return Response.json({
      answers: {
        arrangement: { type: 'choice', choice: 'focused' },
        density: { type: 'choice', choice: 'compact' },
        surface: { type: 'choice', choice: 'plain' },
      },
    });
  };
  const result = await POST(
    request({ prompt: 'dark mobile wallet', engine, apiKey: 'test-key' }),
  );
  const messages = [];
  for await (const line of readLines(result.body!))
    messages.push(JSON.parse(line));
  const complete = messages.at(-1);
  assert.equal(complete.type, 'complete');
  assert.equal(complete.document.theme, 'dark');
  assert.equal(complete.document.device, 'mobile');
  assert.equal(complete.metrics.repairs, 0);
  assert.equal(paidCalls, engine === 'hybrid' ? 2 : 1);
}
globalThis.fetch = actualFetch;
const { financialValue } = await import('../lib/tree/finance');
assert.equal(financialValue(1234567.5).text, '₹12,34,567.50');
assert.equal(financialValue(-120.5, 'USD', 'return').text, '−$120.50');
assert.equal(financialValue(2.5, 'none', 'percent').text, '+2.50%');
assert.equal(financialValue(0, 'INR', 'return').tone, 'secondary');
assert.equal(financialValue(-0.001, 'INR', 'return').tone, 'secondary');
assert.equal(financialValue(undefined).text, '—');
assert.throws(
  () =>
    validateNode(
      node('lots', 'root', 'mint-order-input', {
        label: 'Lots',
        bind: 'lots',
        mode: 'lots',
        value: 0,
      }),
    ),
  /lots start at 1/,
);
assert.throws(
  () =>
    validateNode(node('cash', 'root', 'financial-value', { label: 'Cash' })),
  /amount or unavailable/,
);
assert.throws(
  () =>
    validateNode(
      node('nav', 'root', 'mint-bottom-nav', {
        label: 'Products',
        bind: 'product',
        options: ['One', 'Two'],
      }),
    ),
  /3–5/,
);
assert.throws(
  () =>
    validateDocument({
      ...metadata,
      nodes: [
        nodes[0],
        node('bar', 'root', 'mint-app-bar', {
          title: 'Account',
          variant: 'root',
          target: 'missing',
        }),
      ],
    }),
  /must match/,
);
assert.throws(
  () =>
    validateDocument({
      ...metadata,
      nodes: [
        nodes[0],
        node('dock', 'root', 'mint-action-dock', {}),
        node('copy', 'dock', 'text', { text: 'Missing action' }),
      ],
    }),
  /one or two button/,
);
const financialMarkup = renderToString(
  <TreeRenderer
    document={validateDocument({
      ...metadata,
      nodes: [
        nodes[0],
        node('cash', 'root', 'financial-value', {
          label: 'Available',
          amount: 1234567.5,
          role: 'anchor',
        }),
      ],
    })}
  />,
);
assert.ok(financialMarkup.includes('₹12,34,567.50'));
console.log(
  'Missing/late metadata, zero-repair routes in both engines, and Mint financial/navigation/order contracts pass.',
);

// Opting out skips the paid retry but retains strict validation and a safe live prefix.
let noRepairCalls = 0;
globalThis.fetch = async () => {
  noRepairCalls++;
  return providerStream(
    [
      JSON.stringify({ node: nodes[0] }),
      JSON.stringify({ node: nodes[1] }),
      JSON.stringify({
        node: { id: 'bad', parent: 'root', kind: 'script', props: {} },
      }),
      '{"done":true}',
    ].join('\n'),
  );
};
const noRepairResponse = await POST(
  request({
    prompt: 'Account',
    engine: 'llm',
    apiKey: 'test-key',
    autoRepair: false,
  }),
);
const noRepairEvents = [];
for await (const line of readLines(noRepairResponse.body!))
  noRepairEvents.push(JSON.parse(line));
assert.equal(noRepairCalls, 1);
assert.equal(noRepairEvents.at(-1).type, 'error');
assert.equal(noRepairEvents.at(-1).metrics.repairs, 0);
assert.match(noRepairEvents.at(-1).message, /Auto-fix is off/);
assert.ok(!noRepairEvents.some((e) => e.type === 'complete'));
assert.ok(
  noRepairEvents.some(
    (e) => e.type === 'preview' && e.document.nodes.length === 2,
  ),
);
assert.ok(
  noRepairEvents
    .filter((e) => e.type === 'preview')
    .every((e) =>
      e.document.nodes.every(
        (n: UINode) => n.kind !== ('script' as UINode['kind']),
      ),
    ),
);
assert.equal(
  (
    await POST(
      request({ prompt: 'Account', apiKey: 'test-key', autoRepair: 'no' }),
    )
  ).status,
  400,
);
globalThis.fetch = actualFetch;
console.log(
  'Auto-fix opt-out skips the correction call; valid streamed prefixes survive later errors without accepting invalid nodes.',
);

// Equivalent transport envelopes are decoded locally, with no relaxation of node schemas.
const eventMetadata = {
  title: 'Team directory',
  device: 'desktop',
  theme: 'light',
};
for (const envelope of [
  { metadata: eventMetadata },
  { event: 'screen', payload: eventMetadata },
  { type: 'screen', payload: eventMetadata },
  { data: { screen: eventMetadata } },
  { payload: { event: 'metadata', data: eventMetadata } },
  { type: 'metadata', data: eventMetadata },
  { type: 'screen', screen: eventMetadata },
  { type: 'metadata', metadata: eventMetadata },
  { type: 'screen', ...eventMetadata },
  eventMetadata,
]) {
  const parser = new DocumentStream();
  const stream = [
    envelope,
    ...nodes.map((node) => ({ type: 'node', data: node })),
    { type: 'done' },
  ]
    .map((event) => JSON.stringify(event))
    .join('\n');
  for (let i = 0; i < stream.length; i += 7)
    parser.push(stream.slice(i, i + 7));
  assert.deepEqual(parser.finish(), doc);
  assert.ok(parser.adjustments.length > 0);
}
const partialMetadata = new DocumentStream([], fallbackMeta);
partialMetadata.push('{"metadata":{"title":"Account"}}');
partialMetadata.push('{"type":"metadata","title":"Account"}');
assert.equal(partialMetadata.document?.theme, 'dark');
assert.equal(partialMetadata.document?.title, 'Account');
for (const bad of [
  { metadata: { ...eventMetadata, nodes: [] } },
  { metadata: { ...eventMetadata, device: 'watch' } },
  { metadata: eventMetadata, node: nodes[0] },
  { type: 'metadata', data: eventMetadata, execute: 'anything' },
  { type: 'execute', data: {} },
])
  assert.throws(() =>
    new DocumentStream([], fallbackMeta).push(JSON.stringify(bad)),
  );

// Equivalent node/done wrappers still pass through full node and graph validation.
for (const wrapper of ['data', 'payload']) {
  const parser = new DocumentStream();
  parser.push(JSON.stringify({ screen: eventMetadata }));
  for (const node of nodes)
    parser.push(JSON.stringify({ event: 'node', [wrapper]: node }));
  parser.push(JSON.stringify({ event: 'done' }));
  assert.deepEqual(parser.finish(), doc);
}
for (const bad of [
  { event: 'execute', payload: {} },
  { event: 'node', type: 'screen', payload: nodes[0] },
  { type: 'node', payload: nodes[0], execute: true },
  { payload: { node: { ...nodes[0], kind: 'unknown-component' } } },
])
  assert.throws(() =>
    new DocumentStream([], fallbackMeta).push(JSON.stringify(bad)),
  );

// A local repair changes existing ids in place; unaffected nodes remain identical.
const patch = new DocumentStream([], undefined, doc);
const changedHeading = {
  ...nodes[1],
  props: { ...nodes[1].props, text: 'Updated title' },
};
const patchPreview = patch.push(JSON.stringify({ node: changedHeading }));
assert.equal(patchPreview[0].nodes.length, doc.nodes.length);
patch.push('{"done":true}');
assert.deepEqual(
  patch.finish().nodes.filter((n) => n.id !== changedHeading.id),
  doc.nodes.filter((n) => n.id !== changedHeading.id),
);
assert.equal(
  patch.finish().nodes.find((n) => n.id === changedHeading.id)?.props.text,
  'Updated title',
);
const keepRoot = new DocumentStream([], undefined, doc);
keepRoot.push('{"remove":"root"}{"remove":"alreadyMissing"}');
assert.deepEqual(keepRoot.document, doc);
assert.throws(
  () =>
    new DocumentStream([], undefined, doc).push(
      JSON.stringify({ node: { ...changedHeading, parent: 'nonexistent' } }),
    ),
  /Invalid parent/,
);
assert.throws(
  () => new DocumentStream([], fallbackMeta).push('{"remove":"anything"}'),
  /only allowed during targeted repair/,
);
const badFieldDoc = validateDocument(
  {
    ...metadata,
    nodes: [
      nodes[0],
      node('field', 'root', 'field', { label: 'Name' }),
      node('first', 'field', 'input', { label: 'Name', bind: 'name' }),
      node('extra', 'field', 'input', { label: 'Other', bind: 'other' }),
    ],
  },
  false,
);
assert.throws(() => validateDocument(badFieldDoc), /one input control/);
const fieldPatch = new DocumentStream([], undefined, badFieldDoc);
fieldPatch.push('{"remove":"extra"}{"done":true}');
assert.deepEqual(
  fieldPatch.finish().nodes.map((n) => n.id),
  ['root', 'field', 'first'],
);

// Both API engines accept metadata aliases without triggering a paid correction.
for (const engine of ['llm', 'hybrid']) {
  let textCalls = 0;
  globalThis.fetch = async (url, options) => {
    if (typeof url === 'string' && url.endsWith('/chat/completions')) {
      textCalls++;
      const task = JSON.parse(
        JSON.parse(options?.body as string).messages[1].content,
      );
      const content =
        engine === 'llm'
          ? nodes
          : task.scaffold
              .filter((n: UINode) =>
                ['jevHeader', 'jevPrimary', 'jevSupport'].includes(n.id),
              )
              .map((n: UINode, i: number) =>
                node('body' + i, n.id, 'text', { text: 'Account content' }),
              );
      return providerStream(
        [
          { metadata: { title: 'Account', device: 'mobile', theme: 'light' } },
          ...content.map((node: UINode) => ({ node })),
          { done: true },
        ]
          .map((e) => JSON.stringify(e))
          .join('\n'),
      );
    }
    return Response.json({
      answers: {
        arrangement: { type: 'choice', choice: 'focused' },
        density: { type: 'choice', choice: 'compact' },
        surface: { type: 'choice', choice: 'plain' },
      },
    });
  };
  const response = await POST(
    request({ prompt: 'mobile account', apiKey: 'test-key', engine }),
  );
  const events = [];
  for await (const line of readLines(response.body!))
    events.push(JSON.parse(line));
  assert.equal(events.at(-1).type, 'complete');
  assert.equal(events.at(-1).metrics.repairs, 0);
  assert.equal(textCalls, 1);
}
globalThis.fetch = actualFetch;
console.log(
  'Metadata aliases complete without retries in both engines; targeted repair preserves unaffected nodes and validates updates/removals.',
);

// Hybrid end-of-stream error is repaired with one removal, not a new layout/tree.
let targetedPlans = 0,
  targetedText = 0;
globalThis.fetch = async (url, options) => {
  if (typeof url === 'string' && url.endsWith('/chat/completions')) {
    targetedText++;
    const payload = JSON.parse(options?.body as string);
    if (targetedText === 2) {
      assert.match(
        payload.messages.at(-1).content,
        /Current accepted document/,
      );
      assert.match(payload.messages.at(-1).content, /extraInput/);
      assert.match(payload.messages[1].content, /TARGETED REPAIR/);
      return providerStream('{"remove":"extraInput"}\n{"done":true}');
    }
    return providerStream(
      [
        {
          node: node('profileTitle', 'jevHeader', 'heading', {
            text: 'Profile',
            level: 1,
          }),
        },
        {
          node: node('profileField', 'jevPrimary', 'field', { label: 'Name' }),
        },
        {
          node: node('nameInput', 'profileField', 'input', {
            label: 'Name',
            bind: 'name',
            value: 'Rahul',
          }),
        },
        {
          node: node('extraInput', 'jevPrimary', 'button', {
            label: 'Extra',
            action: 'toggle',
            target: 'missingDialog',
          }),
        },
        { done: true },
      ]
        .map((e) => JSON.stringify(e))
        .join('\n'),
    );
  }
  targetedPlans++;
  return Response.json({
    answers: {
      arrangement: { type: 'choice', choice: 'focused' },
      density: { type: 'choice', choice: 'compact' },
      surface: { type: 'choice', choice: 'plain' },
    },
  });
};
const targetedResponse = await POST(
  request({ prompt: 'Profile', engine: 'hybrid', apiKey: 'test-key' }),
);
const targetedEvents = [];
for await (const line of readLines(targetedResponse.body!))
  targetedEvents.push(JSON.parse(line));
assert.equal(targetedPlans, 1);
assert.equal(targetedText, 2);
assert.equal(targetedEvents.at(-1).type, 'complete');
assert.equal(targetedEvents.at(-1).metrics.repairs, 1);
assert.equal(
  targetedEvents.at(-1).document.nodes.find((n: UINode) => n.id === 'nameInput')
    .props.value,
  'Rahul',
);
assert.ok(
  !targetedEvents
    .at(-1)
    .document.nodes.some((n: UINode) => n.id === 'extraInput'),
);
const repairStart = targetedEvents.findIndex((e) => e.targetedRepair);
assert.ok(repairStart >= 0);
assert.ok(
  targetedEvents
    .slice(repairStart)
    .filter((e) => e.type === 'preview')
    .every(
      (e) =>
        e.document.nodes.some((n: UINode) => n.id === 'nameInput') &&
        e.document.nodes.some((n: UINode) => n.id === 'profileTitle'),
    ),
);
globalThis.fetch = actualFetch;
console.log(
  'Hybrid targeted repair retains existing content throughout and makes no second Jev call.',
);

// Optional support must never force filler or a paid correction.
for (const device of ['mobile', 'tablet', 'desktop'] as const) {
  for (const arrangement of [
    'focused',
    'stacked',
    'main-left',
    'main-right',
    'equal',
    'support-first',
    'summary-first',
  ]) {
    const seed = planNodes(
      { arrangement, density: 'compact', surface: 'card' },
      device,
    );
    const parser = new DocumentStream(seed, {
      title: 'Settings',
      device,
      theme: 'light',
    });
    parser.push(
      JSON.stringify({
        node: node('heading', 'jevHeader', 'heading', {
          text: 'Settings',
          level: 1,
        }),
      }),
    );
    parser.push(
      JSON.stringify({
        node: node('setting', 'jevPrimary', 'switch', {
          label: 'Notifications',
          bind: 'notifications',
        }),
      }),
    );
    if (seed.some((n) => n.id === 'jevSupport')) {
      parser.push(
        JSON.stringify({ node: node('emptyGroup', 'jevSupport', 'stack', {}) }),
      );
      parser.push(
        JSON.stringify({ node: node('emptyPanel', 'emptyGroup', 'panel', {}) }),
      );
    }
    parser.push('{"done":true}');
    const completed = parser.finish();
    assert.ok(
      !completed.nodes.some((n) =>
        ['jevSupport', 'emptyGroup', 'emptyPanel'].includes(n.id),
      ),
    );
    assert.equal(
      completed.nodes.find((n) => n.id === 'jevBody')?.props.columns,
      1,
    );
    assert.equal(
      completed.nodes.find((n) => n.id === 'jevBody')?.props.ratio,
      'equal',
    );
    assert.ok(completed.nodes.some((n) => n.id === 'setting'));
  }
}
const { omitEmptySupport } = await import('../lib/tree/slots');
const optionalSeed = planNodes(
  { arrangement: 'main-right', density: 'compact', surface: 'card' },
  'desktop',
);
for (const content of [
  node('supportText', 'jevSupport', 'text', { text: 'Account help' }),
  node('supportHeading', 'jevSupport', 'panel', {
    title: 'Important information',
  }),
  {
    ...node('conditional', 'jevSupport', 'stack', {}),
    when: { key: 'visible', equals: true },
  },
]) {
  const withContent = { ...metadata, nodes: [...optionalSeed, content] };
  assert.equal(omitEmptySupport(withContent), withContent);
}
let optionalPlanCalls = 0,
  optionalTextCalls = 0;
globalThis.fetch = async (url) => {
  if (typeof url === 'string' && url.endsWith('/chat/completions')) {
    optionalTextCalls++;
    return providerStream(
      [
        {
          node: node('title', 'jevHeader', 'heading', {
            text: 'Preferences',
            level: 1,
          }),
        },
        {
          node: node('preferences', 'jevPrimary', 'switch', {
            label: 'Price alerts',
            bind: 'alerts',
          }),
        },
        { done: true },
      ]
        .map((e) => JSON.stringify(e))
        .join('\n'),
    );
  }
  optionalPlanCalls++;
  return Response.json({
    answers: {
      arrangement: { type: 'choice', choice: 'main-left' },
      density: { type: 'choice', choice: 'compact' },
      surface: { type: 'choice', choice: 'plain' },
    },
  });
};
const optionalResponse = await POST(
  request({ prompt: 'desktop settings', engine: 'hybrid', apiKey: 'test-key' }),
);
const optionalEvents = [];
for await (const line of readLines(optionalResponse.body!))
  optionalEvents.push(JSON.parse(line));
assert.equal(optionalEvents.at(-1).type, 'complete');
assert.equal(optionalEvents.at(-1).metrics.repairs, 0);
assert.equal(optionalPlanCalls, 1);
assert.equal(optionalTextCalls, 1);
assert.ok(
  optionalEvents
    .at(-1)
    .adjustments.some((note: string) =>
      note.includes('Removed unused Jev support'),
    ),
);
assert.ok(
  !optionalEvents
    .at(-1)
    .document.nodes.some((n: UINode) => n.id === 'jevSupport'),
);
globalThis.fetch = actualFetch;
console.log(
  'Empty Jev support is optional across arrangements/devices; hybrid completes without repair or an empty column.',
);

// Reproduce every remaining category from the 21:59 benchmark without provider spend.
const decoratedMetadata = new DocumentStream([], fallbackMeta);
decoratedMetadata.push(
  JSON.stringify({
    metadata: {
      title: 'Portfolio',
      version: 1,
      layout: 'split',
      description: 'Portfolio account',
      density: 'compact',
    },
  }),
);
assert.equal(decoratedMetadata.document?.title, 'Portfolio');
assert.equal(decoratedMetadata.document?.device, 'mobile');
assert.ok(!('density' in decoratedMetadata.document!));
const presentationSeed = new DocumentStream([], fallbackMeta);
presentationSeed.push(
  [
    { node: node('root', null, 'page', {}) },
    { node: node('walletSection', 'root', 'panel', {}) },
    {
      node: node('inCash', 'walletSection', 'financial-value', {
        label: 'IN wallet',
        amount: 10000,
        currency: 'INR',
        role: 'anchor',
      }),
    },
    {
      node: node('usCash', 'walletSection', 'financial-value', {
        label: 'US wallet',
        amount: 200,
        currency: 'USD',
        role: 'anchor',
      }),
    },
    {
      node: node('watch1', 'root', 'mint-row', {
        title: 'Watchlist',
        leading: 'icon',
        icon: 'WatchlistIcon',
      }),
    },
    {
      node: node('revenueChart', 'root', 'chart', {
        series: [
          { label: 'Jan', value: 10 },
          { label: 'Feb', value: 20 },
        ],
      }),
    },
    {
      node: node('settingsPanel', 'root', 'drawer', {
        title: 'Settings',
        side: 'right',
      }),
    },
    { done: true },
  ]
    .map((e) => JSON.stringify(e))
    .join('\n'),
);
const presented = presentationSeed.finish();
assert.equal(
  presented.nodes.find((n) => n.id === 'inCash')?.props.role,
  'anchor',
);
assert.equal(
  presented.nodes.find((n) => n.id === 'usCash')?.props.role,
  'list',
);
assert.equal(presented.nodes.find((n) => n.id === 'usCash')?.props.amount, 200);
assert.equal(
  presented.nodes.find((n) => n.id === 'watch1')?.props.icon,
  undefined,
);
assert.equal(
  presented.nodes.find((n) => n.id === 'watch1')?.props.title,
  'Watchlist',
);
assert.equal(
  presented.nodes.find((n) => n.id === 'settingsPanel')?.props.side,
  'right',
);
assert.ok(
  renderToString(
    <TooltipProvider>
      <Toaster>
        <TreeRenderer document={presented} />
      </Toaster>
    </TooltipProvider>,
  ).length > 0,
);
const { MAX_UI_NODES, GENERATION_REVISION } =
  await import('../lib/tree/limits');
const large = new DocumentStream([], fallbackMeta);
large.push(JSON.stringify({ node: node('root', null, 'page', {}) }));
for (let i = 1; i < MAX_UI_NODES; i++)
  large.push(
    JSON.stringify({
      node: node('record' + i, 'root', 'text', { text: 'Record ' + i }),
    }),
  );
large.push('{"done":true}');
assert.equal(large.finish().nodes.length, MAX_UI_NODES);
assert.throws(
  () =>
    appendNode(
      large.finish(),
      node('tooMany', 'root', 'text', { text: 'Exceeds cap' }),
    ),
  /Maximum 256/,
);
assert.equal(optionalEvents.at(-1).revision, GENERATION_REVISION);
console.log(
  'Benchmark regressions: extra metadata, optional row icons, drawer sides, untitled charts, multiple anchors and 256-node documents pass.',
);

// Desktop QA regressions: fixes are deterministic and don't need model calls.
const { desktopQaFixtures } = await import('../lib/tree/qa-fixtures');
const { visualLayoutProps, hasConversationSplit } =
  await import('../lib/tree/visual-layout');
for (const fixture of desktopQaFixtures) validateDocument(fixture);
const settingsQa = desktopQaFixtures[0];
assert.equal(
  visualLayoutProps(
    settingsQa,
    settingsQa.nodes.find((n) => n.id === 'security')!,
  ).gap,
  4,
);
const dashboardQa = desktopQaFixtures[1];
assert.equal(
  visualLayoutProps(
    dashboardQa,
    dashboardQa.nodes.find((n) => n.id === 'outer')!,
  ).surface,
  'plain',
);
const boardQa = desktopQaFixtures[2];
assert.equal(constrainLayout(boardQa).nodes[0].props.width, 'wide');
assert.equal(
  constrainLayout({ ...boardQa, device: 'mobile' }).nodes[0].props.width,
  'reading',
);
const inlineFields = {
  ...settingsQa,
  nodes: settingsQa.nodes
    .filter((n) => !['open', 'edit'].includes(n.id))
    .map((n) => (n.id === 'form' ? { ...n, parent: 'page' } : n)),
};
const fieldsHtml = renderToString(
  <TooltipProvider>
    <Toaster>
      <TreeRenderer document={inlineFields} />
    </Toaster>
  </TooltipProvider>,
);
assert.equal((fieldsHtml.match(/>Full name<\/label>/g) || []).length, 1);
assert.equal((fieldsHtml.match(/>Availability<\/label>/g) || []).length, 1);
assert.ok(!fieldsHtml.includes('<legend>Availability</legend>'));
assert.equal((fieldsHtml.match(/type="date"/g) || []).length, 1);
const moneyHtml = renderToString(
  <TooltipProvider>
    <Toaster>
      <TreeRenderer document={dashboardQa} />
    </Toaster>
  </TooltipProvider>,
);
assert.ok(
  !moneyHtml.includes('<span>Total</span>'),
  'Sibling financial caption is not repeated',
);
assert.ok(
  moneyHtml.includes('₹93,300.00'),
  'Suppressing a repeated caption preserves the amount',
);
const inboxQa: UIDocument = {
  ...metadata,
  nodes: [
    node('page', null, 'page'),
    node('primary', 'page', 'panel'),
    node('list', 'primary', 'scroll-area', { label: 'Conversations' }),
    node('chat', 'primary', 'stack'),
    node('messages', 'chat', 'message-scroller', { label: 'Messages' }),
  ],
};
assert.equal(hasConversationSplit(inboxQa, inboxQa.nodes[1]), true);
assert.equal(
  hasConversationSplit({ ...inboxQa, device: 'mobile' }, inboxQa.nodes[1]),
  false,
);
const contextRepair = new DocumentStream([], metadata);
contextRepair.push(JSON.stringify({ node: node('page', null, 'page') }));
contextRepair.push(
  JSON.stringify({
    node: {
      id: 'editProfileDialog',
      kind: 'dialog',
      props: { title: 'Edit profile' },
    },
  }),
);
contextRepair.push(
  JSON.stringify({
    node: node('open', 'page', 'button', {
      label: 'Edit',
      action: 'toggle',
      target: 'editProfileDialog',
    }),
  }),
);
contextRepair.push(
  JSON.stringify({ node: node('headerActions', 'page', 'button-group') }),
);
contextRepair.push(
  JSON.stringify({
    node: node('dateRangeSelect', 'page', 'mint-pill-group', {
      bind: 'range',
      options: ['Week', 'Month'],
    }),
  }),
);
contextRepair.push(
  JSON.stringify({
    node: node('returnValue', 'page', 'financial-value', {
      amount: 12,
      format: 'return',
    }),
  }),
);
contextRepair.push(JSON.stringify({ done: true }));
const repairedContext = contextRepair.finish();
assert.equal(
  repairedContext.nodes.find((n) => n.id === 'editProfileDialog')?.parent,
  'page',
);
assert.equal(
  repairedContext.nodes.find((n) => n.id === 'headerActions')?.props.label,
  'Header Actions',
);
assert.equal(
  repairedContext.nodes.find((n) => n.id === 'dateRangeSelect')?.props.label,
  'Date Range',
);
assert.equal(
  repairedContext.nodes.find((n) => n.id === 'returnValue')?.props.label,
  'Return Value',
);
const fieldRepair = new DocumentStream([], metadata);
for (const node of [
  { id: 'page', parent: null, kind: 'page', props: {} },
  {
    id: 'dateRangeField',
    parent: 'page',
    kind: 'field',
    props: { label: 'Date range' },
  },
  {
    id: 'from',
    parent: 'dateRangeField',
    kind: 'date-picker',
    props: { label: 'From', bind: 'from' },
  },
  {
    id: 'to',
    parent: 'dateRangeField',
    kind: 'date-picker',
    props: { label: 'To', bind: 'to' },
  },
])
  fieldRepair.push(JSON.stringify({ node }));
fieldRepair.push(JSON.stringify({ done: true }));
assert.equal(
  fieldRepair.finish().nodes.find((n) => n.id === 'dateRangeField')?.kind,
  'panel',
);
assert.equal(
  fieldRepair.finish().nodes.length,
  4,
  'Group repair preserves both controls',
);
assert.throws(
  () =>
    appendNode(
      { ...metadata, nodes: [node('page', null, 'page')] },
      { id: 'bad', parent: 'unknown', kind: 'dialog', props: { title: 'Bad' } },
    ),
  /parent/i,
  'Unknown explicit parents still fail',
);
console.log(
  'Desktop QA: label ownership, dates, financial captions, list gaps, workspace width, inbox panes and contextual repairs pass.',
);

// Budget model routing, explicit caching and honest partial usage accounting.
const { DEFAULT_TEXT_MODEL, TEXT_MODELS, systemMessage, textModelOptions } =
  await import('../lib/tree/models');
const { summarizeTextUsage } = await import('../lib/tree/usage');
assert.equal(DEFAULT_TEXT_MODEL, 'qwen/qwen3.7-flash');
for (const model of TEXT_MODELS)
  assert.deepEqual(textModelOptions(model.id), {
    reasoning: { enabled: false },
  });
assert.deepEqual(textModelOptions('custom/model'), {});
const claudeSystem = systemMessage(
  'anthropic/claude-haiku-4.5',
  'Stable rules',
);
assert.deepEqual(claudeSystem.content, [
  { type: 'text', text: 'Stable rules', cache_control: { type: 'ephemeral' } },
]);
assert.equal(
  systemMessage(DEFAULT_TEXT_MODEL, 'Stable rules').content,
  'Stable rules',
);
const usageChunks: unknown[] = [];
for await (const _ of chatText(
  new ReadableStream({
    start(c) {
      c.enqueue(
        new TextEncoder().encode(
          'data: {"choices":[{"delta":{"content":"hello"}}]}\n\ndata: {"choices":[],"usage":{"prompt_tokens":100,"completion_tokens":10,"cost":0.001,"prompt_tokens_details":{"cached_tokens":50}}}\n\ndata: [DONE]\n\n',
        ),
      );
      c.close();
    },
  }),
  (u) => usageChunks.push(u),
)) {
  /* Read usage through the normal SSE parser. */
}
assert.deepEqual(summarizeTextUsage(usageChunks, 1), {
  attempts: 1,
  reportedAttempts: 1,
  promptTokens: 100,
  completionTokens: 10,
  cachedTokens: 50,
  costUsd: 0.001,
  costComplete: true,
});
assert.equal(
  summarizeTextUsage(usageChunks, 2).costComplete,
  false,
  'An interrupted paid call is not reported as free',
);
assert.equal(summarizeTextUsage([], 1).costUsd, null);
assert.equal(summarizeTextUsage([{ cost: -1 }], 1).costUsd, null);
console.log(
  'Budget presets, optional reasoning, Claude prefix caching and partial streamed cost reports pass.',
);

// Missing control labels are recovered without changing bindings or entered values.
const recoveredEmail = appendNode(
  { ...doc, nodes: [nodes[0]] },
  {
    id: 'custEmailInput',
    parent: nodes[0].id,
    kind: 'input',
    props: { bind: 'customerEmail', value: 'private@example.com' },
  },
);
assert.equal(recoveredEmail.nodes.at(-1)?.props.label, 'Customer Email');
assert.equal(recoveredEmail.nodes.at(-1)?.props.bind, 'customerEmail');
assert.equal(recoveredEmail.nodes.at(-1)?.props.value, 'private@example.com');
assert.throws(
  () =>
    appendNode(
      { ...doc, nodes: [nodes[0]] },
      {
        id: 'custEmailInput',
        parent: nodes[0].id,
        kind: 'input',
        props: {},
      },
    ),
  /missing props.bind/,
);
