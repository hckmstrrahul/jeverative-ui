import {
  readContent,
  suppliedCandidates,
  bindContent,
  previousCustom,
} from './content';
import { configurationFor } from './configure';
import { sensibleLayout, constrainPlacement } from './rules';
import { type Question, ENDPOINT, MODEL } from '../decisions';
import { validateDocument, type UIDocument, type UINode } from '../tree/spec';
import { buildCandidates, type Candidate } from './candidates';

export type Evaluation = {
  answers: unknown;
  usage?: { input_tokens?: number; prompt_tokens?: number; cost?: number };
};
export type Evaluate = (
  questions: Record<string, Question>,
  state: Record<string, unknown>,
  signal: AbortSignal,
) => Promise<Evaluation>;
export type ComposeOptions = {
  prompt: string;
  device: UIDocument['device'];
  previous?: UIDocument;
  variation?: boolean;
  signal: AbortSignal;
  evaluate: Evaluate;
};
export type JevFirstEvent =
  | { type: 'status'; message: string }
  | { type: 'preview'; document: UIDocument }
  | {
      type: 'plan';
      plan: { arrangement: string; density: string; surface: string };
    }
  | {
      type: 'complete';
      document: UIDocument;
      engine: 'jev-first';
      model: string;
      plan: { arrangement: string; density: string; surface: string };
      latency: number;
      metrics: {
        totalMs: number;
        firstContentMs: number;
        planMs: number;
        textMs: number;
        repairs: number;
        jevCalls: number;
        jevInputTokens: number | null;
        jevCostUsd: number | null;
        jevCostComplete: boolean;
      };
    };
const choice = (
  instructions: string,
  criteria: Record<string, string>,
): Question => ({ type: 'choice', instructions, criteria });
const titles: Record<string, string> = {
  profile: 'Profile',
  stays: 'Find your next stay',
  custom: 'Your workspace',
  settings: 'Account settings',
  sales: 'Sales overview',
  portfolio: 'Investment portfolio',
  planner: 'Weekly planner',
  inbox: 'Support inbox',
  checkout: 'Checkout',
  scheduler: 'Schedule a meeting',
};
function answersFor(
  raw: unknown,
  questions: Record<string, Question>,
): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('Jev returned no decisions.');
  const result: Record<string, string> = {};
  for (const [id, q] of Object.entries(questions)) {
    const a = (raw as Record<string, { type?: string; choice?: string }>)[id];
    if (
      q.type !== 'choice' ||
      a?.type !== 'choice' ||
      typeof a.choice !== 'string' ||
      !Object.hasOwn(q.criteria, a.choice)
    )
      throw new Error(`Jev returned an invalid ${id} decision.`);
    result[id] = a.choice;
  }
  return result;
}
const root = (device: UIDocument['device'], layout: string): UINode => ({
  id: 'jf_page',
  parent: null,
  kind: 'page',
  props: {
    width: layout === 'reading' ? 'reading' : 'wide',
    gap: 16,
    padding: device === 'mobile' ? 16 : 24,
  },
});
function assemble(
  selected: Candidate[],
  title: string,
  device: UIDocument['device'],
  theme: UIDocument['theme'],
  layout: string,
  placements?: Record<string, string>,
): UIDocument {
  const nodes: UINode[] = [
    root(device, layout),
    {
      id: 'jf_heading',
      parent: 'jf_page',
      kind: 'heading',
      props: { text: title, level: 1 },
    },
  ];
  if (!placements) {
    for (const candidate of selected)
      nodes.push(...structuredClone(candidate.nodes));
  } else {
    const occupied = new Set(selected.map((c) => placements[`parent_${c.id}`]))
      .size;
    const columns = Math.min(
      occupied,
      device === 'mobile' || ['reading', 'stacked'].includes(layout)
        ? 1
        : layout === 'three-column'
          ? 3
          : 2,
    );
    nodes.push({
      id: 'jf_body',
      parent: 'jf_page',
      kind: 'grid',
      props: {
        columns,
        gap: 16,
        ratio:
          columns > 1 && layout === 'main-left'
            ? 'main-left'
            : columns > 1 && layout === 'main-right'
              ? 'main-right'
              : 'equal',
      },
    });
    // Groups are ordered and acyclic by construction; candidates cannot target arbitrary nodes.
    const groups = ['a', 'b', 'c'].filter((g) =>
      selected.some((c) => placements[`parent_${c.id}`] === g),
    );
    for (const g of groups) {
      const members = selected
        .filter((c) => placements[`parent_${c.id}`] === g)
        .sort(
          (a, b) =>
            Number(placements[`order_${a.id}`]) -
            Number(placements[`order_${b.id}`]),
        );
      const mode = placements[`group_${g}`];
      const narrow =
        device === 'mobile' || members.some((c) => c.wide) || columns > 1;
      nodes.push({
        id: `jf_group_${g}`,
        parent: 'jf_body',
        kind: mode === 'stack' || narrow ? 'stack' : 'grid',
        props:
          mode === 'stack' || narrow
            ? { direction: 'column', gap: 16 }
            : {
                columns: mode === 'grid3' && device !== 'tablet' ? 3 : 2,
                gap: 16,
              },
      });
      // Consecutive summary metrics share a compact row, even when their
      // group also contains a full-width chart/table. Never nest a grid in
      // a narrow column or reorder Jev's chosen reading sequence.
      for (let i = 0; i < members.length;) {
        const run: Candidate[] = [];
        if (device !== 'mobile' && columns === 1)
          for (
            let j = i;
            j < members.length && members[j].nodes[0].kind === 'metric';
            j++
          )
            run.push(members[j]);
        const peers = run.length > 1 ? run : [members[i]];
        const parent =
          run.length > 1 ? `jf_metrics_${g}_${i}` : `jf_group_${g}`;
        if (run.length > 1)
          nodes.push({
            id: parent,
            parent: `jf_group_${g}`,
            kind: 'grid',
            props: { columns: Math.min(3, run.length), gap: 16 },
          });
        for (const c of peers)
          nodes.push(
            ...structuredClone(c.nodes).map((n) =>
              n.id === `jf_${c.id}` ? { ...n, parent } : n,
            ),
          );
        i += peers.length;
      }
    }
  }
  return validateDocument({ version: 1, title, device, theme, nodes });
}
/** Two finite evaluations. No text model and no free-form JSON generation. */
export async function* composeJevFirst(
  options: ComposeOptions,
): AsyncGenerator<JevFirstEvent> {
  const { prompt, device, previous, variation, signal, evaluate } = options;
  const started = performance.now();
  let calls = 0,
    inputTokens = 0,
    tokenReports = 0,
    cost = 0,
    costReports = 0;
  async function ask(
    questions: Record<string, Question>,
    state: Record<string, unknown>,
  ) {
    signal.throwIfAborted();
    calls++;
    const result = await evaluate(questions, state, signal);
    signal.throwIfAborted();
    const tokens = result.usage?.input_tokens ?? result.usage?.prompt_tokens;
    if (typeof tokens === 'number' && Number.isFinite(tokens) && tokens >= 0) {
      inputTokens += tokens;
      tokenReports++;
    }
    if (
      typeof result.usage?.cost === 'number' &&
      Number.isFinite(result.usage.cost) &&
      result.usage.cost >= 0
    ) {
      cost += result.usage.cost;
      costReports++;
    }
    return answersFor(result.answers, questions);
  }
  const data = readContent(prompt);
  const editing =
    Boolean(previous) &&
    (variation ||
      /^(?:please\s+)?(?:change|update|edit|replace|remove|add|switch|use|keep|make (?:it|this)|same (?:ui|screen))\b/i.test(
        prompt.trim(),
      ) ||
      /^(?:name|email|role|bio|title|heading|inr balance|usd balance|primary label|destination)\s*:/i.test(
        prompt.trim(),
      ));
  const supplied = suppliedCandidates(data);
  const prior = editing ? previous : undefined;
  const custom = [
    ...previousCustom(prior).filter(
      (c) => !supplied.some((n) => n.id === c.id),
    ),
    ...supplied,
  ];
  const baseCandidates = buildCandidates(prompt, prior).filter(
    (c) =>
      !(data.fields && c.id.startsWith('input_')) &&
      !(
        data.metrics &&
        ['revenue', 'orders', 'customers', 'portfolio_value'].includes(c.id)
      ) &&
      !(data.chart && ['revenue_line', 'revenue_bar'].includes(c.id)) &&
      !(data.table && ['orders_table', 'holdings'].includes(c.id)),
  );
  for (const c of custom)
    validateDocument({
      version: 1,
      title: 'Supplied content',
      device,
      theme: 'light',
      nodes: [
        root(device, 'stacked'),
        {
          id: 'jf_validation_heading',
          parent: 'jf_page',
          kind: 'heading',
          props: { text: 'Content', level: 1 },
        },
        ...c.nodes,
      ],
    });
  const candidates = bindContent([...baseCandidates, ...custom], data);
  const layouts: Record<string, string> =
    device === 'mobile'
      ? {
          reading: 'Focused single column',
          stacked: 'Full-width vertical groups',
        }
      : {
          reading: 'Focused form/profile reading width',
          stacked: 'Wide vertical sections',
          'main-left': 'Wide primary group left, compact secondary right',
          'main-right': 'Compact context left, wide primary right',
          'two-column': 'Two balanced groups',
          'three-column': 'Three board columns',
        };
  const previousLayout = previous?.nodes.find((n) => n.id === 'jf_body')?.props;
  if (
    variation &&
    previousLayout &&
    !/\b(single|one|two|three|2|3)[ -](?:column|pane)s?\b/i.test(prompt)
  ) {
    const old =
      previousLayout.columns === 1
        ? previous?.nodes[0]?.props.width === 'reading'
          ? 'reading'
          : 'stacked'
        : previousLayout.columns === 3
          ? 'three-column'
          : previousLayout.ratio === 'main-left'
            ? 'main-left'
            : previousLayout.ratio === 'main-right'
              ? 'main-right'
              : 'two-column';
    delete layouts[old];
  }
  const select: Record<string, Question> = {
    supported: choice(
      'Can the supplied capabilities reasonably represent the core requested interface? Choose unavailable for unrelated tasks or missing essential data/actions. Never pretend to support a real backend. This tool always builds UI prototypes: visual search, booking and payment controls do not require a backend to count as supported. Familiar product names mean a similar interface, not full product integration. Supplied fields and datasets extend the vocabulary to other domains.',
      {
        yes: 'The interface can be represented using prepared components and supplied data',
        unavailable: 'Core requested interface is not covered',
      },
    ),
    title: choice(
      'Choose the closest screen title; retain the existing title on edits unless explicitly changed.',
      titles,
    ),
    layout: choice(
      'Choose responsive macro layout. Prefer compact reading for settings/forms; full width for tables and boards. Respect explicit column requirements. Groups will be composed in a second batch.',
      layouts,
    ),
    theme: choice(
      'Respect explicit light/dark preference, otherwise keep previous theme or choose light.',
      { light: 'Light Mint theme', dark: 'Dark Mint theme' },
    ),
  };
  const knownDiscovery =
    /\b(airbnb|accommodation|vacation rentals?|stay discovery)\b/i.test(prompt);
  if (knownDiscovery) delete select.supported;
  const resources = new Map<string, Candidate[]>();
  for (const c of candidates) {
    const key = c.resource ?? c.id;
    resources.set(key, [...(resources.get(key) ?? []), c]);
  }
  const preserved =
    variation && previous
      ? candidates.filter((c) =>
          previous.nodes.some((n) => n.id === `jf_${c.id}`),
        )
      : [];
  for (const [key, items] of resources)
    if (!preserved.length && !items.some((c) => c.required))
      select[`use_${key}`] = choice(
        'Include only requested content and essential companions. For edits preserve existing content unless asked to remove it. For a read-only page do not add editable fields. Choose at most one variant of this resource.',
        {
          omit: 'Do not include',
          ...Object.fromEntries(items.map((c) => [c.id, c.description])),
        },
      );
  yield { type: 'status', message: 'Jev is selecting elements' };
  const chosen = await ask(select, {
    prompt,
    device,
    mode: variation ? 'spatial variation, preserve content' : 'create or edit',
    previous: prior
      ? {
          title: prior.title,
          theme: prior.theme,
          elements: candidates
            .filter((c) => prior.nodes.some((n) => n.id === `jf_${c.id}`))
            .map((c) => ({ id: c.id, description: c.description })),
        }
      : undefined,
    capabilities: candidates.map((c) => ({
      id: c.id,
      description: c.description,
    })),
    limits:
      'At most 24 content candidates. Use supplied data where provided; otherwise prepared sample data. No arbitrary prose, backend actions, drag-and-drop or working table search. All choices are independent; coordinate them using the whole request.',
  });
  if (!knownDiscovery && chosen.supported !== 'yes')
    throw new Error(
      'This request needs content or capabilities outside Jev-first’s prepared library. Try Hybrid for open-ended generation.',
    );
  let selected = preserved.length
    ? preserved
    : candidates.filter(
        (c) => c.required || chosen[`use_${c.resource ?? c.id}`] === c.id,
      );
  if (!selected.length)
    throw new Error(
      'Jev selected no content. Refine the request or try Hybrid.',
    );
  if (selected.length > 24)
    throw new Error(
      'Jev selected too much content. Request a focused screen with fewer sections.',
    );
  chosen.layout = sensibleLayout(selected, chosen.layout, device);
  const theme = chosen.theme as UIDocument['theme'];
  const quotedTitle = prompt.match(
    /(?:title|heading)(?:\s+(?:to|is|as))?\s*["“]([^"”\n]{1,100})["”]/i,
  )?.[1];
  const title =
    (typeof data.title === 'string' ? data.title : quotedTitle) ??
    (prior ? prior.title : titles[chosen.title]);
  let document = assemble(selected, title, device, theme, chosen.layout);
  const plan = {
    arrangement: chosen.layout,
    density: 'compact',
    surface: 'plain',
  };
  yield { type: 'plan', plan };
  const configuration = configurationFor(selected, Boolean(variation));
  if (selected.length > 1 || Object.keys(configuration.questions).length) {
    yield { type: 'status', message: 'Jev is arranging selected elements' };
    const placement: Record<string, Question> = { ...configuration.questions };
    for (const g of ['a', 'b', 'c'])
      placement[`group_${g}`] = choice(
        `Choose layout within group ${g}. Grid is useful for peer metrics/cards, stack for forms and text. Wide tables and mobile screens are stacked by local rules.`,
        {
          stack: 'Vertical sequence',
          grid2: 'Two peer columns',
          grid3: 'Three peer columns',
        },
      );
    if (
      variation &&
      device === 'desktop' &&
      selected.some((c) => c.nodes[0].kind === 'listing-card')
    ) {
      const oldColumns = previous?.nodes.find((n) => n.id === 'jf_group_b')
        ?.props.columns;
      placement.group_b = choice(
        'Choose a different valid listing density for this variation.',
        oldColumns === 3
          ? { grid2: 'Two spacious listing columns' }
          : { grid3: 'Three compact listing columns' },
      );
    }
    const maxGroups = ['reading'].includes(chosen.layout)
      ? ['a']
      : chosen.layout === 'three-column'
        ? ['a', 'b', 'c']
        : ['a', 'b'];
    for (const c of selected) {
      const parentKey =
        c.nodes[0].kind === 'metric'
          ? 'parent_summary_metrics'
          : `parent_${c.id}`;
      const allowedGroups =
        c.wide && chosen.layout === 'main-left'
          ? ['a']
          : c.wide && chosen.layout === 'main-right'
            ? ['b']
            : maxGroups;
      placement[parentKey] = choice(
        `Place ${c.description}. Group a comes first/left, b second/right, c third. Place related inputs/settings together. On desktop boards each status belongs in a different group. Layout: ${chosen.layout}.`,
        Object.fromEntries(allowedGroups.map((g) => [g, `Group ${g}`])),
      );
      placement[`order_${c.id}`] = choice(
        `Choose reading order for ${c.description} within its group. Headings/context before data, actions after inputs.`,
        Object.fromEntries(
          selected.map((_, i) => [String(i), `Position ${i + 1}`]),
        ),
      );
    }
    const arranged = await ask(placement, {
      prompt,
      device,
      layout: chosen.layout,
      mode: variation
        ? 'Change grouping and order meaningfully without changing content'
        : 'Follow requested composition',
      selected: selected.map((c) => ({
        id: c.id,
        description: c.description,
        previousGroup: previous?.nodes.find((n) => n.id === `jf_${c.id}`)
          ?.parent,
      })),
      previousOrder: previous?.nodes
        .filter((n) => selected.some((c) => n.id === `jf_${c.id}`))
        .map((n) => n.id),
    });
    selected = configuration.apply(arranged);
    for (const c of selected)
      if (c.nodes[0].kind === 'metric')
        arranged[`parent_${c.id}`] = arranged.parent_summary_metrics;
    // Summary metrics are peers: keep them adjacent at the earliest chosen position.
    const metricOrders = selected
      .filter((c) => c.nodes[0].kind === 'metric')
      .map((c) => Number(arranged[`order_${c.id}`]));
    for (const c of selected)
      if (c.nodes[0].kind === 'metric')
        arranged[`order_${c.id}`] = String(Math.min(...metricOrders));
    document = assemble(
      selected,
      title,
      device,
      theme,
      chosen.layout,
      constrainPlacement(selected, chosen.layout, arranged),
    );
  }
  const totalMs = Math.round(performance.now() - started);
  yield {
    type: 'complete',
    document,
    engine: 'jev-first',
    model: MODEL,
    plan,
    latency: totalMs,
    metrics: {
      totalMs,
      firstContentMs: totalMs,
      planMs: totalMs,
      textMs: 0,
      repairs: 0,
      jevCalls: calls,
      jevInputTokens: tokenReports === calls ? inputTokens : null,
      jevCostUsd: costReports ? cost : null,
      jevCostComplete: costReports === calls,
    },
  };
}
export function openRouterEvaluator(key: string): Evaluate {
  return async (questions, state, signal) => {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'X-Title': 'Jeverative',
      },
      body: JSON.stringify({ model: MODEL, questions, state }),
    });
    if (!response.ok)
      throw new Error(
        response.status === 401
          ? 'OpenRouter rejected this key.'
          : response.status === 402
            ? 'Your OpenRouter account needs credits.'
            : `Jev is unavailable (${response.status}).`,
      );
    return (await response.json()) as Evaluation;
  };
}
