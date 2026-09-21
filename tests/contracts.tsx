import {
  blueprints,
  blueprintCandidates,
  getBlueprint,
  isVisualRefinement,
} from '../lib/ui-grammar';
import type { Screen } from '../lib/catalog';
import assert from 'node:assert/strict';
import { renderToString } from 'react-dom/server';
import { ComponentPreview } from '../components/component-preview';
import { TooltipProvider } from '../components/ui/tooltip';
import { Toaster } from '../components/ui/toast';
import { catalog, initialScreen } from '../lib/catalog';
import {
  buildQuestions,
  parseAnswers,
  validateScreen,
  demoCompose,
  ENDPOINT,
  MODEL,
} from '../lib/decisions';
import { composeLayout, allPlacedComponents } from '../lib/composition';
import {
  placementOrder,
  placementInterval,
  waitForPlacement,
} from '../lib/placement';
import { CompositionCanvas } from '../components/composition-canvas';
import {
  recipes,
  deviceProfiles,
  explicitDevice,
  money,
  percent,
  type Recipe,
} from '../lib/mint';
import { resolveScreen } from '../lib/resolve-screen';
import { POST } from '../app/api/compose/route';
const questions = buildQuestions();
assert.equal(catalog.length, 64);
assert.equal(new Set(catalog.map((c) => c.id)).size, 64);
assert.equal(Object.keys(questions).length, 79);
for (const c of catalog) {
  const html = renderToString(
    <TooltipProvider>
      <Toaster>
        <ComponentPreview id={c.id} />
      </Toaster>
    </TooltipProvider>,
  );
  assert.ok(html.length > 0, `${c.id} renders`);
}
console.log('64 component previews render with their required providers.');
const answers: Record<
  string,
  { type: string; choice?: string; score?: number; noul?: number }
> = Object.fromEntries(
  Object.entries(questions).map(([id, q]) => [
    id,
    q.type === 'choice'
      ? {
          type: q.type,
          choice: id.startsWith('component_')
            ? 'hidden'
            : Object.keys(q.criteria)[0],
        }
      : q.type === 'score'
        ? { type: q.type, score: 1 }
        : { type: q.type, noul: 0 },
  ]),
);
answers.recipe.choice = 'dashboard';
answers.blueprint.choice = 'dashboard:report';
answers.component_table.choice = 'first';
answers.component_chart.choice = 'last';
const parsed = parseAnswers({ answers });
assert.deepEqual(parsed.screen.components, ['table', 'chart']);
validateScreen(parsed.screen);
assert.throws(() =>
  parseAnswers({
    answers: { ...answers, layout: { choice: 'arbitrary-code' } },
  }),
);
assert.throws(() => parseAnswers({ answers: { layout: { choice: 'grid' } } }));
assert.throws(() =>
  validateScreen({ ...initialScreen, components: ['unknown'] }),
);
assert.throws(() =>
  validateScreen({ ...initialScreen, components: ['card', 'card'] }),
);
assert.deepEqual(demoCompose('make it dark and compact', initialScreen), {
  ...initialScreen,
  theme: 'dark',
  density: 'compact',
  blueprint: 'dashboard:report',
  contentMode: 'personal',
  settingsFocus: 'general',
});
assert.equal(demoCompose('show all components').components.length, 64);
const request = (body: unknown, origin = 'http://localhost:3000') =>
  new Request('http://localhost:3000/api/compose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin },
    body: JSON.stringify(body),
  });
const oldKey = process.env.OPENROUTER_API_KEY;
delete process.env.OPENROUTER_API_KEY;
assert.equal(
  (await POST(request({ prompt: 'hello', current: initialScreen }))).status,
  401,
);
assert.equal(
  (
    await POST(
      request(
        { prompt: 'hello', current: initialScreen },
        'https://untrusted.example',
      ),
    )
  ).status,
  403,
);
assert.equal(
  (await POST(request({ prompt: 'x'.repeat(2001), current: initialScreen })))
    .status,
  400,
);
assert.equal((await POST(request({ prompt: 'hi', current: {} }))).status, 400);
assert.equal((await POST(request(null))).status, 400);
assert.equal(
  (
    await POST(
      new Request('http://localhost:3000/api/compose', {
        method: 'POST',
        body: '{',
      }),
    )
  ).status,
  400,
);
let calls = 0;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  calls++;
  assert.equal(url, ENDPOINT);
  assert.equal(
    new Headers(options?.headers).get('Authorization'),
    'Bearer test-key',
  );
  assert.equal(typeof options?.body, 'string');
  const payload = JSON.parse(options?.body as string);
  assert.equal(payload.model, MODEL);
  assert.ok(payload.state.designRules.grouping);
  assert.equal(payload.state.catalog.length, 64);
  assert.ok(
    payload.state.catalog.every(
      (c: { role?: string; purpose?: string }) => c.role && c.purpose,
    ),
  );
  if (calls === 1) {
    assert.ok(
      !Object.keys(payload.questions).some((id) => id.startsWith('component_')),
    );
  } else {
    assert.equal(payload.state.plan.recipe, 'dashboard');
    assert.ok(
      Object.keys(payload.questions).every(
        (id) => id.startsWith('component_') || id === 'blueprint',
      ),
    );
    assert.ok(!('component_message' in payload.questions));
  }
  return Response.json({ answers });
};
const success = await POST(
  request({
    prompt: 'a sales overview',
    current: initialScreen,
    apiKey: 'test-key',
  }),
);
assert.equal(success.status, 200);
const payload = (await success.json()) as { screen: unknown };
assert.deepEqual(validateScreen(payload.screen).components, [
  'table',
  'chart',
  'card',
]);
assert.equal(calls, 2);
globalThis.fetch = async () =>
  Response.json({ error: 'upstream secret' }, { status: 402 });
const failure = await POST(
  request({ prompt: 'hello', current: initialScreen, apiKey: 'test-key' }),
);
assert.equal(failure.status, 502);
assert.ok(!(await failure.text()).includes('upstream secret'));
globalThis.fetch = async () => Response.json({ answers: {} });
assert.equal(
  (
    await POST(
      request({ prompt: 'hello', current: initialScreen, apiKey: 'test-key' }),
    )
  ).status,
  502,
);
globalThis.fetch = realFetch;
if (oldKey !== undefined) process.env.OPENROUTER_API_KEY = oldKey;
console.log(
  'Decision ordering, malformed outputs, prompt limits, missing keys, origin checks, upstream failures, and successful API mapping pass.',
);

for (const scenario of [
  'overview',
  'planning',
  'settings',
  'conversation',
] as const) {
  for (const layout of ['grid', 'stack', 'split'] as const) {
    for (const ids of [
      [],
      ['card', 'chart', 'table', 'select', 'button'],
      ['field', 'switch', 'input', 'button'],
      ['calendar', 'checkbox', 'progress'],
      ['message', 'bubble', 'input-group'],
      catalog.map((c) => c.id),
    ]) {
      const screen = { ...initialScreen, scenario, layout, components: ids };
      const plan = composeLayout(screen);
      assert.deepEqual(
        allPlacedComponents(plan).sort(),
        [...ids].sort(),
        `${scenario}/${layout}: each selection has exactly one home`,
      );
      assert.deepEqual(placementOrder(plan).sort(), [...ids].sort());
      if (scenario === 'settings' || scenario === 'conversation')
        assert.equal(plan.layout, 'stack');
      if (plan.layout !== 'stack') assert.ok(plan.minimumColumnsWidth >= 664);
      const html = renderToString(
        <TooltipProvider>
          <Toaster>
            <CompositionCanvas
              screen={screen}
              seen={ids}
              resetVersion={0}
              device="desktop"
              inspecting={null}
              hidden={false}
              placed={[]}
              onToggle={() => {}}
              onClose={() => {}}
            />
          </Toaster>
        </TooltipProvider>,
      );
      assert.equal((html.match(/data-component="/g) || []).length, ids.length);
      assert.equal(
        (html.match(/data-component="[^"]+" data-pending="true"/g) || [])
          .length,
        ids.length,
      );
    }
  }
}
const settings = composeLayout({
  ...initialScreen,
  scenario: 'settings',
  components: ['field', 'input', 'switch', 'button'],
});
assert.deepEqual(settings.sections.find((s) => s.id === 'form')?.components, [
  'field',
  'input',
]);
assert.deepEqual(settings.actions, ['button']);
assert.equal(placementOrder(settings).at(-1), 'button');
const dashboard = composeLayout({
  ...initialScreen,
  layout: 'grid',
  components: ['chart', 'table', 'button'],
  emphasis: 'button',
});
assert.equal(dashboard.primary, 'chart');
assert.equal(dashboard.layout, 'stack');
assert.deepEqual(
  dashboard.sections.map((s) => s.id),
  ['chart', 'table'],
);
for (const count of [1, 4, 12, 64])
  assert.ok(placementInterval(count) * count <= 1300);
const abort = new AbortController();
const waiting = waitForPlacement(abort.signal, 10000);
abort.abort();
await assert.rejects(waiting, { name: 'AbortError' });
await assert.rejects(waitForPlacement(abort.signal, 1), { name: 'AbortError' });
await waitForPlacement(new AbortController().signal, 1);
console.log(
  'Composition conservation, semantic grouping, minimum widths, staged rendering, and placement cancellation pass across all four recipes.',
);

for (const [recipe, r] of Object.entries(recipes)) {
  for (const device of ['mobile', 'tablet', 'desktop'] as const) {
    const screen = {
      ...initialScreen,
      recipe: recipe as Recipe,
      scenario: r.scenario,
      device,
      components: [...r.components],
      emphasis: r.primary,
      navigation: 'rail' as const,
    };
    const resolved = resolveScreen(
      screen,
      'Create ' + device + ' ' + recipe,
    ).screen;
    validateScreen(resolved);
    const html = renderToString(
      <TooltipProvider>
        <Toaster>
          <CompositionCanvas
            screen={resolved}
            seen={resolved.components}
            resetVersion={0}
            device={device}
            inspecting={null}
            hidden={false}
            placed={null}
            onToggle={() => {}}
            onClose={() => {}}
          />
        </Toaster>
      </TooltipProvider>,
    );
    assert.ok(html.includes('data-device="' + device + '"'));
    assert.ok(
      html.includes('--device-height:' + deviceProfiles[device].height + 'px'),
    );
    assert.equal(
      (html.match(/data-component="/g) || []).length,
      resolved.components.length,
    );
    assert.ok(html.includes('mds-iconview'));
    if (device === 'mobile') assert.equal(resolved.layout, 'stack');
  }
}
assert.equal(explicitDevice('Make this a mobile app'), 'mobile');
assert.equal(explicitDevice('Now adapt it for an iPad'), 'tablet');
assert.equal(explicitDevice('Desktop, not mobile'), 'desktop');
assert.equal(money(1234567), '₹12,34,567.00');
assert.equal(percent(0), '0.00%');
assert.equal(percent(-1.2), '−1.20%');
assert.throws(() => validateScreen({ ...initialScreen, device: 'watch' }));
assert.throws(() => validateScreen({ ...initialScreen, recipe: 'unknown' }));
assert.throws(() =>
  parseAnswers({
    answers: { ...answers, complexity: { type: 'score', score: 4 } },
  }),
);
assert.throws(() =>
  parseAnswers({ answers: { ...answers, search: { type: 'noul', noul: -1 } } }),
);
assert.throws(() =>
  parseAnswers({
    answers: { ...answers, search: { type: 'choice', choice: 'yes' } },
  }),
);
const rich = parseAnswers(
  {
    answers: {
      ...answers,
      complexity: { type: 'score', score: 1.8 },
      search: { type: 'noul', noul: 0.9 },
      device: { type: 'choice', choice: 'desktop', confidence: 0.9 },
    },
  },
  initialScreen,
  'A mobile portfolio',
);
assert.equal(rich.screen.device, 'mobile');
assert.equal(rich.screen.rowCount, 8);
assert.equal(rich.screen.search, true);
const guarded = resolveScreen(
  {
    ...initialScreen,
    components: ['field', 'input', 'label', 'data-table', 'table', 'spinner'],
    recipe: 'settings',
    navigation: 'bottom',
  },
  'Account settings',
);
assert.deepEqual(guarded.screen.components, ['field']);
assert.equal(guarded.screen.navigation, 'rail');
assert.ok(guarded.adjustments.length > 0);
const all = resolveScreen(
  { ...initialScreen, components: catalog.map((c) => c.id) },
  'Show all components',
);
assert.equal(all.screen.components.length, 64);
const confidence = parseAnswers({
  answers: {
    ...answers,
    layout: {
      type: 'choice',
      choice: 'grid',
      confidence: 0.6,
      probabilities: { grid: 0.7, stack: 0.2, split: 0.1 },
    },
  },
});
assert.equal(confidence.answers.layout.probabilities?.grid, 0.7);
console.log(
  '16 Mint recipes × 3 devices render; typed Score/Noul, device intent, formatting, and deterministic design guards pass.',
);
const lotScreen = {
  ...initialScreen,
  recipe: 'order' as const,
  scenario: 'settings' as const,
  orderUnit: 'lots' as const,
  components: ['field'],
};
const lotHtml = renderToString(
  <TooltipProvider>
    <Toaster>
      <ComponentPreview id="field" screen={lotScreen} />
    </Toaster>
  </TooltipProvider>,
);
assert.ok(lotHtml.includes('Increase lots'));
assert.ok(lotHtml.includes('Decrease lots'));
assert.ok(lotHtml.includes('mint-order-stepper'));
const shareHtml = renderToString(
  <TooltipProvider>
    <Toaster>
      <ComponentPreview
        id="field"
        screen={{ ...lotScreen, orderUnit: 'shares' }}
      />
    </Toaster>
  </TooltipProvider>,
);
assert.ok(!shareHtml.includes('Increase lots'));
assert.equal(demoCompose('Mobile IPO buy order').orderUnit, 'lots');
console.log(
  'Stock quantities use direct input; IPO/F&O lots expose the bounded stepper.',
);

const scoped = composeLayout({
  ...initialScreen,
  recipe: 'portfolio',
  components: ['tabs', 'input-group', 'card', 'chart', 'data-table'],
  emphasis: 'data-table',
});
assert.deepEqual(
  scoped.sections.map((s) => s.id),
  ['summary', 'chart', 'data-table'],
);
assert.deepEqual(scoped.sections.at(-1)?.components, [
  'tabs',
  'input-group',
  'data-table',
]);
assert.deepEqual(scoped.navigation, []);
assert.deepEqual(scoped.toolbar, []);
for (const device of ['mobile', 'tablet', 'desktop'] as const) {
  const constrained = resolveScreen(
    {
      ...initialScreen,
      device,
      recipe: 'portfolio',
      components: ['calendar', 'message', 'switch'],
      navigation: 'rail',
    },
    'Investment portfolio',
  );
  assert.deepEqual(constrained.screen.components, ['data-table']);
  assert.equal(
    constrained.screen.navigation,
    device === 'mobile' ? 'bottom' : 'rail',
  );
}
console.log(
  'Reference patterns: wide data flow, scoped controls, unrelated-module rejection and navigation adaptation pass.',
);
const activeTable = { ...initialScreen, components: ['table', 'input-group'] };
const retainedTable = composeLayout(
  { ...activeTable, components: ['data-table', 'table', 'input-group'] },
  activeTable,
);
assert.deepEqual(
  retainedTable.sections.find((s) => s.id === 'table')?.components,
  ['input-group', 'table'],
);
const noRecords = { ...initialScreen, components: ['input-group'] };
assert.deepEqual(
  composeLayout(
    { ...noRecords, components: ['table', 'input-group'] },
    noRecords,
  ).toolbar,
  ['input-group'],
);

// Every supported blueprint is renderable and preserves the registry contract.
for (const blueprint of blueprints) {
  assert.ok(blueprint.required.length > 0);
  for (const id of [...blueprint.required, ...blueprint.optional])
    assert.ok(
      catalog.some((c) => c.id === id),
      `${blueprint.id}: known module ${id}`,
    );
  for (const device of ['mobile', 'tablet', 'desktop'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      const screen: Screen = {
        ...initialScreen,
        recipe: blueprint.recipe,
        scenario: recipes[blueprint.recipe].scenario,
        blueprint: blueprint.id,
        components: [],
        device,
        theme,
        contentMode: 'professional',
        settingsFocus: 'general',
      };
      const resolved = resolveScreen(
        screen,
        `Generate ${blueprint.recipe}`,
      ).screen;
      validateScreen(resolved);
      assert.ok(resolved.components.length > 0, blueprint.id);
      const composition = composeLayout(resolved);
      assert.deepEqual(
        [...allPlacedComponents(composition)].sort(),
        [...resolved.components].sort(),
      );
      if (device === 'mobile') assert.equal(composition.layout, 'stack');
      const html = renderToString(
        <TooltipProvider>
          <Toaster>
            <CompositionCanvas
              screen={resolved}
              seen={resolved.components}
              resetVersion={0}
              device={device}
              inspecting={null}
              hidden={false}
              placed={null}
              onToggle={() => {}}
              onClose={() => {}}
            />
          </Toaster>
        </TooltipProvider>,
      );
      assert.ok(html.includes(`data-blueprint="${blueprint.id}"`));
      assert.ok(!html.includes('NaN'));
    }
  }
}
const profile: Screen = {
  ...initialScreen,
  recipe: 'profile',
  blueprint: 'profile:cover',
  components: ['card', 'item'],
  contentMode: 'creator',
};
assert.ok(
  blueprintCandidates(profile, profile, 'mobile creator profile').every(
    (b) => b.id !== profile.blueprint,
  ),
);
assert.deepEqual(
  blueprintCandidates(profile, profile, 'make it dark').map((b) => b.id),
  ['profile:cover'],
);
assert.deepEqual(
  blueprintCandidates(profile, profile, 'centered creator profile').map(
    (b) => b.id,
  ),
  ['profile:centered'],
);
assert.equal(isVisualRefinement('mobile profile page'), false);
assert.equal(isVisualRefinement('switch to mobile'), true);
const demoProfile = demoCompose('mobile creator profile', initialScreen);
assert.equal(demoProfile.recipe, 'profile');
assert.equal(demoProfile.contentMode, 'creator');
assert.notEqual(
  demoCompose('mobile creator profile', demoProfile).blueprint,
  demoProfile.blueprint,
);
const demoSecurity = demoCompose('desktop security settings', initialScreen);
assert.equal(demoSecurity.settingsFocus, 'security');
assert.equal(
  demoCompose('make it dark', demoSecurity).settingsFocus,
  'security',
);
assert.throws(() =>
  validateScreen({ ...profile, blueprint: 'settings:tiles' }),
);
assert.throws(() => validateScreen({ ...profile, settingsFocus: 'unknown' }));
for (const [focus, requiredText, forbiddenText] of [
  ['security', 'Two-factor authentication', 'Weekly digest'],
  ['notifications', 'Delivery channels', 'Full name'],
  ['billing', 'Billing email', 'Two-factor authentication'],
  ['connections', 'Connected apps', 'Billing email'],
] as const) {
  const screen: Screen = {
    ...initialScreen,
    recipe: 'settings',
    blueprint: 'settings:grouped',
    settingsFocus: focus,
    components: ['field'],
  };
  const html = renderToString(
    <TooltipProvider>
      <Toaster>
        <ComponentPreview id="field" screen={screen} />
      </Toaster>
    </TooltipProvider>,
  );
  assert.ok(html.includes(requiredText), focus);
  assert.ok(
    !html.includes(forbiddenText),
    `${focus} must not fall back to a generic form`,
  );
}
const cosmetic = parseAnswers(
  {
    answers: {
      ...answers,
      recipe: { type: 'choice', choice: 'dashboard' },
      blueprint: { type: 'choice', choice: 'profile:cover' },
    },
  },
  profile,
  'make it dark',
).screen;
assert.equal(cosmetic.recipe, 'profile');
assert.deepEqual(cosmetic.components, profile.components);
assert.equal(cosmetic.contentMode, 'creator');
assert.equal(getBlueprint(cosmetic).id, profile.blueprint);
console.log(
  `${blueprints.length} blueprints × 3 devices × 2 themes render; profile/settings intent, variation eligibility and cosmetic preservation pass.`,
);

// The second phase must reject a previously used or wrong-family blueprint.
let phase = 0;
globalThis.fetch = async (_url, options) => {
  phase++;
  const body = JSON.parse(options?.body as string);
  if (phase === 1) return Response.json({ answers });
  assert.ok(
    !Object.hasOwn(body.questions.blueprint.criteria, 'dashboard:report'),
  );
  return Response.json({ answers }); // deliberately returns the excluded report
};
const invalidRepeat = await POST(
  request({
    prompt: 'sales dashboard',
    current: { ...initialScreen, blueprint: 'dashboard:report' },
    apiKey: 'test-key',
  }),
);
assert.equal(invalidRepeat.status, 502);
assert.ok((await invalidRepeat.text()).includes('unchanged'));
globalThis.fetch = realFetch;
console.log(
  'API rejects excluded blueprint answers instead of silently repeating a screen.',
);

await import('./tree-contracts');

await import("./jev-first-contracts");

import "./server-key-contracts";

import "./local-connection-contracts";
