import { getBlueprint } from './ui-grammar';
import type { Screen } from './catalog';
import { componentRules } from './component-rules';

export type SectionKind =
  | 'summary'
  | 'content'
  | 'form'
  | 'preferences'
  | 'agenda'
  | 'conversation'
  | 'feedback'
  | 'utilities';
export type CompositionSection = {
  id: string;
  kind: SectionKind;
  components: string[];
  title?: string;
  description?: string;
  surface: 'panel' | 'plain';
  minWidth: number;
};
export type Composition = {
  recipe: Screen['scenario'];
  layout: Screen['layout'];
  width: 'wide' | 'reading';
  navigation: string[];
  identity: string[];
  toolbar: string[];
  actions: string[];
  rail: string[];
  notices: string[];
  footer: string[];
  sections: CompositionSection[];
  primary: string | null;
  minimumColumnsWidth: number;
  notes: string[];
};

const ordered = (ids: string[], order: string[]) =>
  [...ids].sort((a, b) => {
    const index = (id: string) =>
      order.includes(id) ? order.indexOf(id) : order.length;
    return index(a) - index(b);
  });

/** Total, deterministic composition: every selected component gets exactly one home. */
export function composeLayout(
  screen: Screen,
  activeScreen: Screen = screen,
): Composition {
  const plan: Composition = {
    recipe: screen.scenario,
    layout: screen.layout,
    width:
      screen.scenario === 'settings' || screen.scenario === 'conversation'
        ? 'reading'
        : 'wide',
    navigation: [],
    identity: [],
    toolbar: [],
    actions: [],
    rail: [],
    notices: [],
    footer: [],
    sections: [],
    primary: null,
    minimumColumnsWidth: 0,
    notes: [],
  };
  const section = (
    id: string,
    kind: SectionKind,
    title?: string,
    description?: string,
    surface: 'panel' | 'plain' = 'panel',
  ) => {
    let item = plan.sections.find((s) => s.id === id);
    if (!item) {
      item = {
        id,
        kind,
        components: [],
        title,
        description,
        surface,
        minWidth: 0,
      };
      plan.sections.push(item);
    }
    return item;
  };
  const put = (target: CompositionSection, id: string) => {
    target.components.push(id);
    target.minWidth = Math.max(
      target.minWidth,
      componentRules[id].minWidth,
      ['table', 'data-table'].includes(id) &&
        ['portfolio', 'markets', 'funds', 'orders', 'stock-detail'].includes(
          screen.recipe,
        )
        ? 640
        : 0,
    );
  };
  const isForm = screen.scenario === 'settings';
  const isChat = screen.scenario === 'conversation';
  const hasRecords = screen.components.some((id) =>
    ['table', 'data-table', 'chart'].includes(id),
  );
  for (const id of screen.components) {
    const rule = componentRules[id];
    if (!rule) throw new Error(`Missing composition rule: ${id}`);
    if (rule.role === 'rail') {
      plan.rail.push(id);
      continue;
    }
    if (rule.role === 'navigation') {
      plan.navigation.push(id);
      continue;
    }
    if (rule.role === 'identity') {
      plan.identity.push(id);
      continue;
    }
    if (rule.role === 'summary') {
      put(section('summary', 'summary', undefined, undefined, 'plain'), id);
      continue;
    }
    if (rule.role === 'action') {
      plan.actions.push(id);
      continue;
    }
    if (id === 'alert') {
      plan.notices.push(id);
      continue;
    }
    if (id === 'pagination') {
      plan.footer.push(id);
      continue;
    }
    if (rule.role === 'utility') {
      plan.footer.push(id);
      continue;
    }
    if (rule.role === 'feedback') {
      put(section('feedback', 'feedback', undefined, undefined, 'plain'), id);
      continue;
    }
    if (rule.role === 'conversation' || (rule.role === 'composer' && isChat)) {
      put(
        section(
          'conversation',
          'conversation',
          isChat ? undefined : 'Conversation',
          undefined,
          isChat ? 'plain' : 'panel',
        ),
        id,
      );
      continue;
    }
    if (rule.role === 'composer' && !isForm) {
      plan.toolbar.push(id);
      continue;
    }
    if (rule.role === 'filter' && !isForm) {
      plan.toolbar.push(id);
      continue;
    }
    if (rule.role === 'preference') {
      put(
        section(
          'preferences',
          'preferences',
          'Preferences',
          'Choose how your workspace works.',
        ),
        id,
      );
      continue;
    }
    if (
      rule.role === 'field' ||
      rule.role === 'filter' ||
      rule.role === 'composer'
    ) {
      if (id === 'checkbox' && screen.scenario === 'planning')
        put(
          section(
            'agenda',
            'agenda',
            'Your priorities',
            'A little progress, every day.',
          ),
          id,
        );
      else
        put(
          section(
            'form',
            'form',
            screen.recipe === 'order'
              ? 'Order details'
              : screen.recipe === 'form'
                ? 'Your details'
                : 'Workspace details',
            screen.recipe === 'order'
              ? 'Review before continuing.'
              : 'Keep your information up to date.',
          ),
          id,
        );
      continue;
    }
    if (
      screen.scenario === 'planning' &&
      ['progress', 'accordion', 'collapsible', 'item'].includes(id)
    ) {
      put(
        section(
          'agenda',
          'agenda',
          'Your priorities',
          'A little progress, every day.',
        ),
        id,
      );
      continue;
    }
    // These blocks already carry titles or their own surfaces; don't nest another card.
    const title =
      id === 'calendar'
        ? 'Schedule'
        : id === 'scroll-area'
          ? 'Recent activity'
          : undefined;
    const plain = rule.selfContained || id === 'typography';
    put(
      section(id, 'content', title, undefined, plain ? 'plain' : 'panel'),
      id,
    );
  }
  // Record controls travel with the records, below any summary/chart.
  const records = plan.sections.find(
    (s) =>
      ['data-table', 'table'].includes(s.id) &&
      activeScreen.components.includes(s.id),
  );
  if (records) {
    const tabs = plan.navigation.filter((id) => id === 'tabs');
    plan.navigation = plan.navigation.filter((id) => id !== 'tabs');
    records.components.unshift(...tabs, ...plan.toolbar);
    plan.toolbar = [];
  }
  plan.navigation = ordered(plan.navigation, [
    'breadcrumb',
    'menubar',
    'navigation-menu',
    'tabs',
  ]);
  plan.identity = ordered(plan.identity, ['avatar', 'badge', 'hover-card']);
  plan.toolbar = ordered(plan.toolbar, [
    'input-group',
    'date-picker',
    'select',
    'combobox',
    'native-select',
    'toggle-group',
    'toggle',
  ]);
  plan.footer = ordered(plan.footer, [
    'pagination',
    'separator',
    'context-menu',
    'direction',
    'tooltip',
    'kbd',
  ]);
  for (const s of plan.sections) {
    if (s.kind === 'form')
      s.components = ordered(s.components, [
        'label',
        'field',
        'input',
        'select',
        'combobox',
        'native-select',
        'date-picker',
        'input-otp',
        'textarea',
        'input-group',
        'checkbox',
        'toggle-group',
        'toggle',
      ]);
    if (s.kind === 'preferences')
      s.components = ordered(s.components, ['switch', 'radio-group', 'slider']);
    if (s.kind === 'agenda')
      s.components = ordered(s.components, [
        'checkbox',
        'progress',
        'item',
        'accordion',
        'collapsible',
      ]);
    if (s.kind === 'conversation')
      s.components = ordered(s.components, [
        'marker',
        'message-scroller',
        'message',
        'bubble',
        'attachment',
        'input-group',
      ]);
  }
  const emphasis = plan.sections.find(
    (s) =>
      s.components.includes(screen.emphasis) &&
      !['summary', 'feedback'].includes(s.kind),
  );
  const substantial = plan.sections.filter(
    (s) => !['summary', 'feedback', 'utilities'].includes(s.kind),
  );
  const preferred =
    screen.scenario === 'settings'
      ? plan.sections.find((s) => s.id === 'form')
      : screen.scenario === 'conversation'
        ? plan.sections.find((s) => s.id === 'conversation')
        : screen.scenario === 'planning'
          ? plan.sections.find((s) => s.id === 'calendar')
          : undefined;
  plan.primary = (preferred ?? emphasis ?? substantial[0])?.id ?? null;
  // Stable page order: summaries and feedback precede the primary working area.
  const rank = (s: CompositionSection) =>
    s.kind === 'summary'
      ? 0
      : s.kind === 'feedback'
        ? 1
        : s.components.includes('chart') &&
            ['dashboard', 'portfolio', 'stock-detail'].includes(screen.recipe)
          ? 1.5
          : s.id === plan.primary
            ? 2
            : s.kind === 'form'
              ? 3
              : s.kind === 'preferences'
                ? 4
                : 5;
  plan.sections.sort((a, b) => rank(a) - rank(b));
  if (
    [
      'dashboard',
      'portfolio',
      'markets',
      'stock-detail',
      'funds',
      'orders',
      'derivatives',
    ].includes(screen.recipe) ||
    isForm ||
    isChat ||
    screen.recipe === 'kanban' ||
    screen.recipe === 'commerce' ||
    substantial.length < 2
  )
    plan.layout = 'stack';
  if (screen.blueprint) {
    const blueprint = getBlueprint(screen);
    plan.width = blueprint.width;
    plan.layout = screen.device === 'mobile' ? 'stack' : blueprint.layout;
    const position = (section: CompositionSection) => {
      const indices = section.components
        .map((id) => blueprint.order.indexOf(id))
        .filter((i) => i >= 0);
      return indices.length ? Math.min(...indices) : 99;
    };
    plan.sections.sort((a, b) => position(a) - position(b));
    if (screen.recipe === 'settings') {
      const form = plan.sections.find((s) => s.id === 'form');
      if (form) {
        form.surface = 'plain';
        form.title = undefined;
        form.description = undefined;
      }
    }
    if (screen.recipe === 'profile') {
      for (const section of plan.sections) {
        section.surface = 'plain';
        section.title = undefined;
      }
    }
    plan.notes.push(blueprint.name + ': ' + blueprint.purpose);
  }
  if (plan.layout === 'split' && substantial.length > 1) {
    const primary = plan.sections.find((s) => s.id === plan.primary)!;
    const secondary = substantial.filter((s) => s.id !== primary.id);
    // A narrow supporting track must fit its widest content. Tables never get squeezed.
    plan.minimumColumnsWidth =
      Math.max(primary.minWidth, 360) +
      Math.max(...secondary.map((s) => s.minWidth), 280) +
      24;
  } else if (plan.layout === 'grid' && substantial.length > 1) {
    plan.minimumColumnsWidth =
      Math.max(...substantial.map((s) => s.minWidth), 360) * 2 + 24;
  }
  plan.notes.push(
    isForm
      ? 'Related fields share a form; preferences and actions follow.'
      : isChat
        ? 'Messages and composer share one reading column.'
        : screen.scenario === 'planning'
          ? 'Schedule and priorities form the main working area.'
          : 'Metrics, filters, and data follow a consistent hierarchy.',
  );
  if (plan.minimumColumnsWidth)
    plan.notes.push(
      `Columns stack below ${plan.minimumColumnsWidth}px of content width.`,
    );
  if (plan.actions.length)
    plan.notes.push(
      isForm
        ? 'Actions follow the form.'
        : 'Compact actions stay in the page toolbar.',
    );
  if (
    plan.primary !== screen.emphasis &&
    !plan.sections
      .find((s) => s.id === plan.primary)
      ?.components.includes(screen.emphasis)
  )
    plan.notes.push('Primary emphasis is assigned to substantial content.');
  if (hasRecords)
    plan.notes.push('Charts and tables keep a readable minimum width.');
  return plan;
}

export function allPlacedComponents(plan: Composition): string[] {
  return [
    ...plan.rail,
    ...plan.navigation,
    ...plan.identity,
    ...plan.notices,
    ...plan.toolbar,
    ...plan.sections.flatMap((s) => s.components),
    ...plan.actions,
    ...plan.footer,
  ];
}
