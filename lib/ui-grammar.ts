import type { Screen } from './catalog';
import { recipes, type Recipe } from './mint';

export type Blueprint = {
  id: string;
  recipe: Recipe;
  name: string;
  purpose: string;
  layout: Screen['layout'];
  width: 'wide' | 'reading';
  order: string[];
  required: string[];
  optional: string[];
  rules: string[];
  references: string[];
};
const ref = (id: string) => `https://mobbin.com/screens/${id}`;
const profileRefs = [
  'e76d27b0-9688-49dd-8e48-1ea37d7c9ea5',
  '8ba7d093-10f9-4dbd-8e83-c7021b3adf95',
  'be7f012b-a3a7-4027-8ec6-9e2c2a9000f7',
  '7bfd68bd-058d-4b39-b097-b448b3ac6ab4',
];
const settingsRefs = [
  'cb1e2e78-a7f7-4e76-a1e2-67d509361235',
  '75651e2a-13a5-49d9-b115-1bea89ab9681',
  '39833a72-4b70-46ef-b05c-f990e8cbfe92',
  'ecb928b5-6d8c-4677-9604-9ea5242a3525',
  'a67919a5-de03-4df3-b275-71e4fb6fa930',
];
function blueprint(
  recipe: Recipe,
  kind: string,
  name: string,
  purpose: string,
  required: string[],
  optional: string[],
  layout: Screen['layout'] = 'stack',
  references: string[] = [],
  width: Blueprint['width'] = 'wide',
): Blueprint {
  return {
    id: `${recipe}:${kind}`,
    recipe,
    name,
    purpose,
    required,
    optional,
    layout,
    width,
    order: required,
    references: references.map(ref),
    rules: [
      'One primary task per screen.',
      'Controls belong to the content they change.',
      'Preserve Mint type, color and spacing tokens.',
      'Collapse secondary columns before reducing control widths.',
    ],
  };
}
export const blueprints: Blueprint[] = [
  ...[
    [
      'cover',
      'Cover & activity',
      'Expressive cover band, overlapping identity, then an activity feed.',
      profileRefs[1],
    ],
    [
      'identity-rail',
      'Identity & work',
      'Identity beside projects on desktop; identity first on mobile.',
      profileRefs[0],
    ],
    [
      'centered',
      'Centered collection',
      'Centered identity, compact stats and a broad collection grid.',
      profileRefs[2],
    ],
    [
      'compact',
      'Account overview',
      'Compact identity row, account facts and grouped destinations.',
      profileRefs[3],
    ],
  ].map(([kind, name, purpose, source]) =>
    blueprint('profile', kind, name, purpose, ['card', 'item'], [], 'stack', [
      source,
    ]),
  ),
  ...[
    [
      'grouped',
      'Grouped preferences',
      'Readable grouped settings with clear section boundaries.',
      settingsRefs[0],
    ],
    [
      'sidebar',
      'Settings workspace',
      'Section navigation beside one editable pane; horizontal navigation on phones.',
      settingsRefs[1],
    ],
    [
      'tiles',
      'Settings cards',
      'Independent settings groups in cards; two columns only when each fits.',
      settingsRefs[2],
    ],
    [
      'split',
      'Account & preferences',
      'Account summary beside detailed settings; stacked on phones.',
      settingsRefs[3],
    ],
    [
      'accordion',
      'Progressive settings',
      'Expandable settings sections, with one category open initially.',
      settingsRefs[4],
    ],
  ].map(([kind, name, purpose, source]) =>
    blueprint(
      'settings',
      kind,
      name,
      purpose,
      ['field'],
      [],
      'stack',
      [source],
      kind === 'grouped' || kind === 'accordion' ? 'reading' : 'wide',
    ),
  ),
  blueprint(
    'dashboard',
    'report',
    'Performance report',
    'KPIs, broad performance chart and detailed records.',
    ['card', 'chart', 'data-table'],
    ['date-picker', 'select'],
    'stack',
    ['6442e278-2894-420e-9096-e54dbeef5651'],
  ),
  blueprint(
    'dashboard',
    'operations',
    'Operations workspace',
    'Records first, followed by trend and progress support.',
    ['data-table', 'chart', 'progress'],
    ['card', 'input-group'],
    'grid',
    ['7cc2958e-84ad-404c-a224-a5afa1e20050'],
  ),
  blueprint(
    'dashboard',
    'pulse',
    'Metrics pulse',
    'A compact summary and one dominant trend, no records unless requested.',
    ['card', 'chart'],
    ['select', 'date-picker'],
    'stack',
    ['22864846-19a6-4f9d-af14-fb6322a75cd9'],
  ),
  blueprint(
    'portfolio',
    'performance',
    'Performance first',
    'Balance and trend followed by holdings.',
    ['card', 'chart', 'data-table'],
    ['tabs', 'input-group'],
    'stack',
    ['0dd015e1-3253-461b-bbd5-6625be377fb5'],
  ),
  blueprint(
    'portfolio',
    'holdings',
    'Holdings first',
    'Compact balance then searchable holdings, optional trend below.',
    ['card', 'data-table'],
    ['chart', 'tabs', 'input-group'],
    'stack',
    ['e7692910-6ec0-4d66-8012-22ec1959bfc4'],
  ),
  blueprint(
    'planning',
    'schedule',
    'Schedule & agenda',
    'Calendar primary with a supporting priority list.',
    ['calendar', 'checkbox'],
    ['progress', 'accordion'],
    'split',
    ['894a77ba-3553-4f11-a721-e274fd07b621'],
  ),
  blueprint(
    'planning',
    'priorities',
    'Priorities first',
    'Priorities and progress before a supporting calendar.',
    ['checkbox', 'progress', 'calendar'],
    ['accordion'],
    'stack',
    ['894a77ba-3553-4f11-a721-e274fd07b621'],
  ),
  blueprint(
    'conversation',
    'thread',
    'Focused conversation',
    'One readable thread with an attached composer.',
    ['message-scroller', 'input-group'],
    ['attachment'],
    'stack',
    ['1f4158f5-53d6-4ff0-94dd-6ea6e3e6727f'],
    'reading',
  ),
  blueprint(
    'conversation',
    'context',
    'Conversation & context',
    'Thread with a compact attachment context area.',
    ['message-scroller', 'input-group', 'attachment'],
    ['avatar'],
    'stack',
    ['1f4158f5-53d6-4ff0-94dd-6ea6e3e6727f'],
  ),
  blueprint(
    'commerce',
    'catalog',
    'Browse catalog',
    'Search and filters lead into a full-width product grid.',
    ['input-group', 'toggle-group', 'carousel'],
    ['pagination'],
    'stack',
    ['ab04c0f2-28f4-4b54-9a72-76cdd148428a'],
  ),
  blueprint(
    'commerce',
    'collection',
    'Featured collection',
    'A featured collection followed by products and optional filtering.',
    ['card', 'carousel'],
    ['toggle-group', 'input-group'],
    'stack',
    ['ab04c0f2-28f4-4b54-9a72-76cdd148428a'],
  ),
  blueprint(
    'form',
    'focused',
    'Focused form',
    'One short readable form and one continuation action.',
    ['field', 'button'],
    ['select', 'checkbox'],
    'stack',
    ['708859a9-bb1d-4cae-8f46-01397186c68b'],
    'reading',
  ),
  blueprint(
    'form',
    'guided',
    'Guided application',
    'Progress above grouped fields and supporting details.',
    ['progress', 'field', 'textarea', 'button'],
    ['select', 'checkbox'],
    'stack',
    ['708859a9-bb1d-4cae-8f46-01397186c68b'],
    'reading',
  ),
  blueprint(
    'kanban',
    'board',
    'Board first',
    'Task columns fill the workspace; filters stay above the board.',
    ['item'],
    ['input-group', 'avatar'],
    'stack',
    ['894a77ba-3553-4f11-a721-e274fd07b621'],
  ),
  blueprint(
    'kanban',
    'project',
    'Project overview',
    'Project progress and team identity precede the task board.',
    ['progress', 'avatar', 'item'],
    ['input-group'],
    'stack',
    ['894a77ba-3553-4f11-a721-e274fd07b621'],
  ),
  ...(
    [
      'markets',
      'funds',
      'derivatives',
      'orders',
      'stock-detail',
      'order',
      'loans',
    ] as const
  ).flatMap((recipe) => [
    blueprint(
      recipe,
      'overview',
      'Overview',
      'Context and summary before the main working area.',
      [...recipes[recipe].components],
      ['input-group'],
      'stack',
      recipe === 'markets' || recipe === 'funds'
        ? ['9275b181-4dce-4f1d-9c84-a12803b3174f']
        : [],
    ),
    blueprint(
      recipe,
      'focused',
      'Focused task',
      'Prioritize the working area and disclose only useful supporting context.',
      [recipes[recipe].primary],
      [...recipes[recipe].components].filter(
        (id) => id !== recipes[recipe].primary,
      ),
      'stack',
      [],
      recipe === 'order' || recipe === 'loans' ? 'reading' : 'wide',
    ),
  ]),
];
export const settingsFocuses = {
  general:
    'General account settings spanning identity, preferences and security',
  security: 'Password, two-factor authentication, sessions and privacy',
  notifications: 'Notification topics and delivery channels',
  billing: 'Plan, billing contact and renewal preferences',
  connections: 'Connected apps and integration permissions',
};
export const contentModes = {
  personal: 'Personal account and interests',
  professional: 'Professional identity, experience and projects',
  creator: 'Creator profile, collections and publishing activity',
  investor: 'Investor identity, account verification and investing preferences',
};
export function getBlueprint(
  screen: Pick<Screen, 'recipe' | 'blueprint'>,
): Blueprint {
  return (
    blueprints.find(
      (b) => b.id === screen.blueprint && b.recipe === screen.recipe,
    ) ?? blueprints.find((b) => b.recipe === screen.recipe)!
  );
}
export function isVisualRefinement(prompt: string) {
  if (
    /\b(new|another|different|variation|redesign|create|build|generate)\b/i.test(
      prompt,
    )
  )
    return false;
  const cosmetic =
    /\b(dark|light|compact|density|spacing|roomy|mobile|tablet|desktop|font|color)\b/i.test(
      prompt,
    );
  const screenRequest =
    /\b(profile|settings|dashboard|portfolio|planner|chat|form|board|catalog|page|screen|app)\b/i.test(
      prompt,
    );
  return (
    cosmetic &&
    (!screenRequest ||
      /\b(make it|make this|change the|switch to)\b/i.test(prompt))
  );
}
export function blueprintCandidates(
  screen: Screen,
  current: Screen,
  prompt: string,
) {
  const family = blueprints.filter((b) => b.recipe === screen.recipe);
  const pinned = family.filter(
    (b) =>
      prompt.toLowerCase().includes(b.name.toLowerCase()) ||
      (screen.recipe === 'profile' &&
        /\b(cover|centered|identity rail)\b/i.test(prompt) &&
        prompt.toLowerCase().includes(b.id.split(':')[1].replace('-', ' '))),
  );
  if (pinned.length) return pinned;

  if (screen.recipe === current.recipe && isVisualRefinement(prompt))
    return [getBlueprint(current)];
  return family.filter(
    (b) => b.id !== current.blueprint || current.recipe !== screen.recipe,
  );
}
export const grammarRules = {
  hierarchy:
    'Choose intent, then structural blueprint, then compatible modules. Do not confuse a public profile with editable settings. A blueprint is anatomy, not a color theme.',
  variation:
    'For a new generation choose a different eligible structure, not random unrelated controls. Cosmetic edits preserve anatomy. Device changes adapt the same anatomy.',
  profile:
    'Identity, bio, action, relevant facts, and activity or projects. No arbitrary notification toggles in a public profile.',
  settings:
    'Respect settingsFocus. Security must not render generic workspace fields. Each control has a visible label, supporting explanation and feedback. Destructive actions are isolated and confirmed.',
  responsive:
    'Mobile: single column, 16px page inset, 48px primary actions. Tablet: 24px inset and only columns that fit. Desktop: 32px inset, readable forms and wider workspaces. Secondary navigation becomes horizontally scrollable on narrow screens.',
  density:
    'Density changes row/panel spacing, never body legibility or minimum touch targets.',
  surfaces:
    'Use Mint tokens and local fonts. Do not imitate reference brand colors. No decoration that competes with the task.',
  state:
    'Keep local edits across cosmetic refinements. Regeneration can replace a prototype. Loading, empty and error states are intentional alternatives, not unrelated modules.',
};
