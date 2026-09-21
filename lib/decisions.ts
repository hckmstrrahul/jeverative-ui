import { validateDocument } from './tree/spec';
import referenceEvidence from './reference-evidence.json';
import {
  blueprints,
  contentModes,
  settingsFocuses,
  grammarRules,
  blueprintCandidates,
  getBlueprint,
  isVisualRefinement,
} from './ui-grammar';
import { catalog, initialScreen, type Screen } from './catalog';
import {
  recipes,
  deviceProfiles,
  mintRules,
  explicitDevice,
  type Recipe,
} from './mint';
import { designRules, recipeGuidance } from './component-rules';
export const MODEL = 'typesafe/jev-1.13';
export const ENDPOINT = 'https://openrouter.ai/api/alpha/decisions';
export type Question =
  | { type: 'choice'; instructions: string; criteria: Record<string, string> }
  | { type: 'score'; instructions: string; criteria: string[] }
  | { type: 'noul'; instructions: string };
export type Answers = Record<
  string,
  {
    type: 'choice' | 'score' | 'noul';
    choice?: string;
    score?: number;
    noul?: number;
    confidence?: number;
    probabilities?: Record<string, number>;
  }
>;
const choose = (
  instructions: string,
  criteria: Record<string, string>,
): Question => ({ type: 'choice', instructions, criteria });
export function buildQuestions() {
  const questions: Record<string, Question> = {
    blueprint: choose(
      'Choose the structural anatomy that best serves the fixed screen plan. Respect eligible candidates and preserve structure for cosmetic edits.',
      Object.fromEntries(
        blueprints.map((b) => [b.id, b.name + ': ' + b.purpose]),
      ),
    ),
    contentMode: choose(
      'Choose the domain for sample content. Preserve for cosmetic refinements. Creator means publishing or collections, professional means career and work, investor means investing account.',
      contentModes,
    ),
    settingsFocus: choose(
      'Choose the specific settings content requested; preserve for refinements. General only if no category was requested.',
      settingsFocuses,
    ),
    layout: choose(
      'Choose a layout that serves the primary task. Use stack for forms/settings and conversations, split for calendar + agenda, grid for dashboards. Preserve layout for cosmetic-only follow-ups. The renderer will stack columns if content cannot fit.',
      {
        grid: 'Dashboard grid for substantial content; small controls are grouped, not tiled',
        stack: 'One readable column for settings, forms or conversations',
        split:
          'Primary working area with a supporting agenda or details column',
      },
    ),
    density: choose('Choose information density.', {
      comfortable: 'Roomy and readable',
      compact: 'Tight spacing, more information',
    }),
    theme: choose(
      'Choose color mode. Preserve current mode unless requested.',
      { light: 'Light background', dark: 'Dark background' },
    ),
    recipe: choose(
      'Which screen purpose best matches `prompt`? For cosmetic follow-ups preserve `current.recipe`. Each option has curated component variants in `recipes`.',
      Object.fromEntries(
        Object.entries(recipes).map(([id, r]) => [id, r.purpose]),
      ),
    ),
    device: choose(
      'Which target device does `prompt` request? Preserve `current.device` unless explicitly changing platform.',
      {
        mobile: 'Phone, iOS or Android app,390x844',
        tablet: 'Tablet or iPad app,834x1112',
        desktop: 'Desktop or laptop web app,1440x900',
      },
    ),
    navigation: choose(
      'What application navigation does this screen need? Infer from `prompt` and `current`; mobile root uses bottom, desktop workspace uses rail, focused forms/details use none. Renderer adapts unsupported combinations.',
      {
        none: 'Focused single screen or detail flow, no persistent app navigation',
        top: 'Website or lightweight app with top navigation',
        rail: 'Complex desktop/tablet workspace with persistent sidebar',
        bottom: 'Mobile root app with 3–5 primary destinations',
      },
    ),
    primaryAction: choose(
      'What is the main action requested by this interface? This chooses sample UI only; no transactions execute.',
      {
        none: 'Informational screen with no main action',
        save: 'Save profile or preferences',
        buy: 'Buy an investment',
        sell: 'Sell or exit an investment',
        invest: 'Start investment or SIP',
        create: 'Create a project or item',
        continue: 'Continue onboarding or form',
      },
    ),
    orderUnit: choose(
      'Does the requested order use shares or lots? Use lots ONLY for IPO or futures/options orders; never step stock quantity or price.',
      {
        shares: 'Ordinary stock units, type quantity directly',
        lots: 'IPO or F&O lots; step count by one, minimum one',
      },
    ),
    complexity: {
      type: 'score',
      instructions:
        'How much functional scope does `prompt` request? Preserve scope for cosmetic follow-ups. Rate complexity, not visual density.',
      criteria: [
        'Simple focused screen with 1–3 sections',
        'Standard app screen with 3–5 sections',
        'Complex workspace with 5–8 sections and supporting areas',
      ],
    },
    search: {
      type: 'noul',
      instructions:
        'Does this screen need a search control to find records, products, holdings or messages? Preserve existing search for a cosmetic follow-up; do not add it to a focused order/form.',
    },
    refinement: {
      type: 'noul',
      instructions:
        'Is `prompt` a refinement of `current` rather than a request for a new interface? Examples: change device, make dark, adjust density, add a chart.',
    },
    emphasis: choose(
      'Which selected substantive component anchors the screen? Choose only a component you are also selecting. Never emphasize a small control or navigation.',
      Object.fromEntries(
        catalog
          .filter((c) => ['content', 'field', 'conversation'].includes(c.role))
          .map((c) => [c.id, c.purpose]),
      ),
    ),
  };
  for (const c of catalog)
    questions['component_' + c.id] = choose(
      `Should ${c.name} be part of this screen, and at what priority? Role: ${c.role}. Purpose: ${c.purpose} Minimum comfortable width: ${c.minWidth}px. Follow state.mintRules, state.designRules and infer the relevant recipe directly from state.prompt and state.current. Questions are independent: do not depend on another question’s answer. Choose the contextual variant described in state.recipes. Select only what serves the user's task. For follow-up adjustments preserve relevant existing content. The renderer places controls in semantic groups, not independent cards.`,
      {
        hidden: 'Not needed for this task',
        first: 'Essential to the primary task',
        middle: 'Useful main content or control',
        last: 'Secondary supporting detail',
      },
    );
  return questions;
}
export const compositionContext = {
  designRules,
  grammarRules,
  blueprints,
  referenceEvidence,
  scenarioGuidance: recipeGuidance,
  recipes,
  deviceProfiles,
  mintRules,
};

export function parseAnswers(
  input: unknown,
  current: Screen = initialScreen,
  prompt = '',
): {
  screen: Screen;
  answers: Answers;
} {
  if (!input || typeof input !== 'object' || !('answers' in input))
    throw new Error('Jev returned no decisions. Try again.');
  const source = (input as { answers: unknown }).answers;
  if (!source || typeof source !== 'object')
    throw new Error('Invalid decisions response.');
  const questions = buildQuestions();
  const answers: Answers = {};
  for (const [id, q] of Object.entries(questions)) {
    const a = (source as Record<string, unknown>)[id];
    if (!a || typeof a !== 'object')
      throw new Error(`Invalid decision: ${id}.`);
    const value = a as Record<string, unknown>;
    if (value.type !== q.type) throw new Error(`Invalid decision type: ${id}.`);
    if (q.type === 'choice') {
      if (
        typeof value.choice !== 'string' ||
        !Object.hasOwn(q.criteria, value.choice)
      )
        throw new Error(`Invalid decision: ${id}.`);
      answers[id] = { type: 'choice', choice: value.choice };
    } else {
      const v = value[q.type];
      if (
        typeof v !== 'number' ||
        !Number.isFinite(v) ||
        v < 0 ||
        v > (q.type === 'noul' ? 1 : q.criteria.length - 1)
      )
        throw new Error(`Invalid decision: ${id}.`);
      answers[id] =
        q.type === 'noul'
          ? { type: 'noul', noul: v }
          : { type: 'score', score: v };
    }
    if (
      typeof value.confidence === 'number' &&
      Number.isFinite(value.confidence) &&
      value.confidence >= 0 &&
      value.confidence <= 1
    )
      answers[id].confidence = value.confidence;
    if (
      q.type !== 'noul' &&
      value.probabilities &&
      typeof value.probabilities === 'object'
    ) {
      const allowed =
        q.type === 'choice'
          ? Object.keys(q.criteria)
          : q.criteria.map((_, i) => String(i));
      const entries = Object.entries(value.probabilities);
      if (
        entries.every(
          ([k, v]) =>
            allowed.includes(k) &&
            typeof v === 'number' &&
            Number.isFinite(v) &&
            v >= 0 &&
            v <= 1,
        )
      )
        answers[id].probabilities = Object.fromEntries(entries) as Record<
          string,
          number
        >;
    }
  }
  const order = ['first', 'middle', 'last'];
  const components = catalog
    .filter((c) => answers['component_' + c.id].choice !== 'hidden')
    .sort(
      (a, b) =>
        order.indexOf(answers['component_' + a.id].choice!) -
        order.indexOf(answers['component_' + b.id].choice!),
    )
    .map((c) => c.id);
  const cosmetic = isVisualRefinement(prompt);
  const recipe = cosmetic ? current.recipe : (answers.recipe.choice as Recipe);
  const refinement = (answers.refinement.noul ?? 0) >= 0.7;
  const device =
    explicitDevice(prompt) ??
    (refinement && (answers.device.confidence ?? 1) < 0.5
      ? current.device
      : (answers.device.choice as Screen['device']));
  const complexity =
    (answers.complexity.score ?? 1) < 0.5
      ? 'simple'
      : (answers.complexity.score ?? 1) < 1.5
        ? 'standard'
        : 'rich';
  return {
    screen: {
      components: cosmetic ? [...current.components] : components,
      blueprint: answers.blueprint.choice,
      contentMode: cosmetic
        ? (current.contentMode ?? 'personal')
        : (answers.contentMode.choice as Screen['contentMode']),
      settingsFocus: cosmetic
        ? (current.settingsFocus ?? 'general')
        : (answers.settingsFocus.choice as Screen['settingsFocus']),
      layout: answers.layout.choice as Screen['layout'],
      density: answers.density.choice as Screen['density'],
      theme: answers.theme.choice as Screen['theme'],
      scenario: recipes[recipe].scenario,
      emphasis: answers.emphasis.choice!,
      recipe,
      device,
      complexity,
      navigation: answers.navigation.choice as Screen['navigation'],
      primaryAction: answers.primaryAction.choice as Screen['primaryAction'],
      rowCount: complexity === 'simple' ? 3 : complexity === 'rich' ? 8 : 5,
      search: (answers.search.noul ?? 0) >= 0.65,
      orderUnit: answers.orderUnit.choice as Screen['orderUnit'],
    },
    answers,
  };
}
export function validateScreen(value: unknown): Screen {
  if (!value || typeof value !== 'object') throw new Error('Invalid screen.');
  const v = value as Screen;
  if (
    (v.blueprint !== undefined &&
      !blueprints.some((b) => b.id === v.blueprint && b.recipe === v.recipe)) ||
    (v.contentMode !== undefined &&
      !Object.hasOwn(contentModes, v.contentMode)) ||
    (v.settingsFocus !== undefined &&
      !Object.hasOwn(settingsFocuses, v.settingsFocus)) ||
    !Array.isArray(v.components) ||
    v.components.length > catalog.length ||
    new Set(v.components).size !== v.components.length ||
    v.components.some((id) => !catalog.some((c) => c.id === id)) ||
    !['grid', 'stack', 'split'].includes(v.layout) ||
    !['comfortable', 'compact'].includes(v.density) ||
    !['light', 'dark'].includes(v.theme) ||
    !['overview', 'planning', 'settings', 'conversation'].includes(
      v.scenario,
    ) ||
    !catalog.some((c) => c.id === v.emphasis) ||
    !Object.hasOwn(recipes, v.recipe) ||
    !Object.hasOwn(deviceProfiles, v.device) ||
    !['none', 'top', 'rail', 'bottom'].includes(v.navigation) ||
    !['simple', 'standard', 'rich'].includes(v.complexity) ||
    !['none', 'save', 'buy', 'sell', 'invest', 'create', 'continue'].includes(
      v.primaryAction,
    ) ||
    ![3, 5, 8].includes(v.rowCount) ||
    typeof v.search !== 'boolean' ||
    !['shares', 'lots'].includes(v.orderUnit)
  )
    throw new Error('Invalid screen.');
  return {
    components: [...v.components],
    ...(v.document ? { document: validateDocument(v.document) } : {}),
    blueprint: v.blueprint,
    contentMode: v.contentMode,
    settingsFocus: v.settingsFocus,
    layout: v.layout,
    density: v.density,
    theme: v.theme,
    scenario: v.scenario,
    emphasis: v.emphasis,
    device: v.device,
    recipe: v.recipe,
    navigation: v.navigation,
    complexity: v.complexity,
    primaryAction: v.primaryAction,
    rowCount: v.rowCount,
    search: v.search,
    orderUnit: v.orderUnit,
  };
}
export function demoCompose(
  prompt: string,
  current: Screen = initialScreen,
): Screen {
  const p = prompt.toLowerCase();
  const next = {
    ...current,
    components: [...current.components],
  };
  delete next.document;
  if (/sales|dashboard|revenue|analytic/.test(p))
    Object.assign(next, initialScreen);
  if (/plan|week|calendar|task/.test(p))
    Object.assign(next, {
      scenario: 'planning',
      components: ['calendar', 'checkbox', 'progress', 'accordion'],
      layout: 'split',
      emphasis: 'calendar',
    });
  if (/setting|profile|account|form/.test(p))
    Object.assign(next, {
      scenario: 'settings',
      components: ['avatar', 'field', 'select', 'switch', 'button'],
      layout: 'stack',
      emphasis: 'field',
    });
  if (/chat|message|conversation/.test(p))
    Object.assign(next, {
      scenario: 'conversation',
      components: ['message', 'bubble', 'attachment', 'input-group'],
      layout: 'stack',
      emphasis: 'message',
    });
  if (/all (the )?components|entire library/.test(p))
    next.components = catalog.map((c) => c.id);
  if (/compact|dense/.test(p)) next.density = 'compact';
  if (/comfortable|roomy/.test(p)) next.density = 'comfortable';
  if (/dark/.test(p)) next.theme = 'dark';
  if (/light/.test(p)) next.theme = 'light';
  if (/grid/.test(p)) next.layout = 'grid';
  if (/single column|stack/.test(p)) next.layout = 'stack';
  if (/split/.test(p)) next.layout = 'split';
  for (const c of catalog) {
    if (p.includes(c.name.toLowerCase())) {
      if (
        new RegExp(
          `(?:hide|remove|without) (?:the )?${c.name.toLowerCase()}`,
        ).test(p)
      )
        next.components = next.components.filter((id) => id !== c.id);
      else if (!next.components.includes(c.id)) next.components.push(c.id);
    }
  }
  let recipe: Recipe | undefined;
  for (const [pattern, id] of [
    [/profile|biography|creator page/, 'profile'],
    [
      /settings|preferences|security|notification|billing|connected apps/,
      'settings',
    ],
    [/portfolio|holding/, 'portfolio'],
    [/market|watchlist/, 'markets'],
    [/stock detail|reliance/, 'stock-detail'],
    [/mutual fund|\bfunds\b|\bsip\b/, 'funds'],
    [/order book|order history|orders/, 'orders'],
    [/buy|sell|order ticket|place order/, 'order'],
    [/kanban|task board/, 'kanban'],
    [/shop|ecommerce|product catalog/, 'commerce'],
    [/onboarding|signup|application form/, 'form'],
  ] as [RegExp, Recipe][])
    if (pattern.test(p)) recipe = id;
  if (recipe) {
    const r = recipes[recipe];
    Object.assign(next, {
      recipe,
      scenario: r.scenario,
      components: [...r.components],
      emphasis: r.primary,
    });
  } else if (next.scenario !== current.scenario)
    next.recipe = next.scenario === 'overview' ? 'dashboard' : next.scenario;
  if (/ipo|f&o|futures|options|lots/.test(p)) next.orderUnit = 'lots';
  else if (/stock|shares/.test(p)) next.orderUnit = 'shares';
  next.device = explicitDevice(prompt) ?? current.device;
  if (/complex|advanced|rich/.test(p)) {
    next.complexity = 'rich';
    next.rowCount = 8;
  }
  if (/simple|minimal/.test(p)) {
    next.complexity = 'simple';
    next.rowCount = 3;
  }
  if (/sidebar|navigation|app/.test(p))
    next.navigation = next.device === 'mobile' ? 'bottom' : 'rail';
  if (/buy|sell|invest|save|continue|create/.test(p))
    next.primaryAction = (p.match(
      /buy|sell|invest|save|continue|create/,
    )?.[0] ?? 'none') as Screen['primaryAction'];
  if (recipe === 'order' && next.primaryAction === 'none')
    next.primaryAction = 'buy';
  if (/search/.test(p)) next.search = true;
  next.blueprint =
    blueprintCandidates(next, current, prompt)[0]?.id ?? getBlueprint(next).id;
  next.contentMode = /creator|artist|designer|writer/.test(p)
    ? 'creator'
    : /professional|career|employee/.test(p)
      ? 'professional'
      : /invest|trading|broker/.test(p)
        ? 'investor'
        : (current.contentMode ?? 'personal');
  next.settingsFocus = /security|password|privacy/.test(p)
    ? 'security'
    : /notification|alert preferences/.test(p)
      ? 'notifications'
      : /billing|subscription/.test(p)
        ? 'billing'
        : /connect|integration/.test(p)
          ? 'connections'
          : recipe === 'settings'
            ? 'general'
            : (current.settingsFocus ?? 'general');
  if (isVisualRefinement(prompt)) {
    next.contentMode = current.contentMode ?? 'personal';
    next.settingsFocus = current.settingsFocus ?? 'general';
  }
  return next;
}
