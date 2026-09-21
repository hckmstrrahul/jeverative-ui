export const deviceProfiles = {
  mobile: {
    width: 390,
    height: 844,
    padding: 16,
    columns: 1,
    control: 40,
    cta: 48,
    navigation: 'bottom',
  },
  tablet: {
    width: 834,
    height: 1112,
    padding: 24,
    columns: 2,
    control: 40,
    cta: 48,
    navigation: 'rail',
  },
  desktop: {
    width: 1440,
    height: 900,
    padding: 32,
    columns: 3,
    control: 40,
    cta: 40,
    navigation: 'rail',
  },
} as const;
export type Device = keyof typeof deviceProfiles;
export const recipes = {
  profile: {
    title: 'Profile',
    subtitle: 'A little more about you.',
    purpose:
      'Public or personal member profile, creator page, professional identity, biography, projects and activity; not editable settings',
    scenario: 'overview',
    components: ['card', 'item'],
    primary: 'card',
  },
  dashboard: {
    title: 'Overview',
    subtitle: 'Your business at a glance.',
    purpose: 'Business analytics, sales, revenue, operational metrics',
    scenario: 'overview',
    components: ['card', 'chart', 'data-table'],
    primary: 'chart',
  },
  portfolio: {
    title: 'Portfolio',
    subtitle: 'A clear view of your investments.',
    purpose: 'Holdings, invested amount, current value, gains and returns',
    scenario: 'overview',
    components: ['card', 'chart', 'data-table', 'tabs'],
    primary: 'data-table',
  },
  markets: {
    title: 'Stocks',
    subtitle: 'Discover your next investment.',
    purpose: 'Stocks home, market indices, watchlist, stock discovery',
    scenario: 'overview',
    components: ['card', 'toggle-group', 'data-table'],
    primary: 'data-table',
  },
  'stock-detail': {
    title: 'Reliance Industries',
    subtitle: 'NSE · Equity',
    purpose:
      'Individual stock product page with quote, chart, fundamentals and Buy/Sell',
    scenario: 'overview',
    components: ['card', 'chart', 'tabs', 'table'],
    primary: 'chart',
  },
  order: {
    title: 'Buy Reliance Industries',
    subtitle: 'Delivery order · NSE',
    purpose:
      'Buy or sell stocks, quantity and price order ticket, review and confirmation',
    scenario: 'settings',
    components: ['field', 'radio-group', 'alert'],
    primary: 'field',
  },
  funds: {
    title: 'Mutual funds',
    subtitle: 'Build wealth, one investment at a time.',
    purpose: 'Mutual fund discovery, SIP, fund comparison and returns',
    scenario: 'overview',
    components: ['toggle-group', 'data-table', 'card'],
    primary: 'data-table',
  },
  orders: {
    title: 'Orders',
    subtitle: 'Track your recent activity.',
    purpose: 'Open, executed and cancelled investment orders',
    scenario: 'overview',
    components: ['tabs', 'data-table'],
    primary: 'data-table',
  },
  derivatives: {
    title: 'F&O',
    subtitle: 'Follow the derivatives market.',
    purpose: 'Futures and options discovery, derivatives and contracts',
    scenario: 'overview',
    components: ['card', 'data-table', 'toggle-group'],
    primary: 'data-table',
  },
  loans: {
    title: 'Loans',
    subtitle: 'Find a loan that fits your plans.',
    purpose: 'Loan discovery, offers, repayment and eligibility',
    scenario: 'settings',
    components: ['card', 'field', 'accordion'],
    primary: 'field',
  },
  planning: {
    title: 'Your week',
    subtitle: 'Make room for your priorities.',
    purpose: 'Calendar, agenda, tasks, scheduling and productivity',
    scenario: 'planning',
    components: ['calendar', 'checkbox', 'progress', 'accordion'],
    primary: 'calendar',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Make this workspace yours.',
    purpose: 'Profile, account, workspace settings, notification preferences',
    scenario: 'settings',
    components: ['avatar', 'field', 'switch'],
    primary: 'field',
  },
  conversation: {
    title: 'Team conversation',
    subtitle: 'A shared space for ideas and updates.',
    purpose: 'Chat, messaging, assistant conversation and attachments',
    scenario: 'conversation',
    components: ['message', 'bubble', 'input-group'],
    primary: 'message',
  },
  form: {
    title: 'Project details',
    subtitle: 'Start with the essentials.',
    purpose: 'Onboarding, signup, applications and general forms',
    scenario: 'settings',
    components: ['field', 'select', 'textarea'],
    primary: 'field',
  },
  commerce: {
    title: 'Discover',
    subtitle: 'Thoughtfully selected for you.',
    purpose: 'Product catalog, shopping, ecommerce browsing and product grids',
    scenario: 'overview',
    components: ['input-group', 'toggle-group', 'carousel', 'card'],
    primary: 'carousel',
  },
  kanban: {
    title: 'Projects',
    subtitle: 'Move good ideas forward.',
    purpose: 'Project management, multi-column task boards, status workflow',
    scenario: 'planning',
    components: ['item', 'progress', 'avatar'],
    primary: 'item',
  },
} as const;
export type Recipe = keyof typeof recipes;
export const mintRules = {
  versions:
    'Mint Groww Invest tokens v0.19, usage v0.33. User override: Hugeicons free Stroke Rounded SVG inside IconView; use locally supplied fonts.',
  typography:
    'Inter Variable 400/500 for content and button labels, Inter Variable 500 ONLY for structure and numeric anchors. Body 12/18,14/20,16/24. Section titles 18/28. One numeric heading anchor per card. List row values use body 14/20 medium, not headings. No 10px body.',
  surfaces:
    'No shadows. Canvas backgroundPrimary, cards backgroundSurfaceZ1, overlays backgroundSurfaceZ2. Match nested borders and subtle backgrounds to OnSurface variants. Cards >=60px tall radius16; compact cards/buttons radius8.',
  spacing:
    'Only 2,4,6,8,12,16,20,24,32,40px. Mobile page padding16, tablet24, desktop32. Respect readable minimum widths; stack before squeezing. Never omit required anatomy to fit.',
  financial:
    'Indian number grouping; financial amounts and percentages always 2 decimals. Gains contentPositive, losses contentNegative, zero contentSecondary; transparent backgrounds for financial values. Subtle tints only for messages; pair matching contentOn*Subtle. Missing value em dash.',
  navigation:
    'Tabs switch sibling views, pills filter data. Tabs and pills scroll horizontally, never wrap/truncate. Neutral selected pills. Mobile L0 bottom nav 3–5 destinations,64px; detail/order screens no bottom nav. Desktop persistent sidebar or top navigation. Root title matches active destination.',
  controls:
    'Primary green, destructive red, secondary outlined. One primary per section; horizontal secondary left/primary right. Buttons 48 large full width,40 medium,32 small. Disabled swaps tokens; never opacity. Mobile action dock48. Order input120x40, no placeholder; steppers only lots for IPO/F&O.',
  composition:
    'Choose coherent functional sections from the catalog. Preserve user-requested controls. Prefer complete Field over redundant Input/Label. Prefer Data Table over simultaneous Table. Choose recipe variants; avoid loading/empty/error states unless requested. Simple: 1–3 sections; standard: 3–5; complex: 5–8, with secondary regions. All data and transactions remain sample previews.',
};
export function explicitDevice(prompt: string): Device | undefined {
  const matches = [
    ...prompt
      .toLowerCase()
      .matchAll(
        /\b(mobile|phone|iphone|android|tablet|ipad|desktop|laptop)\b/g,
      ),
  ].filter(
    (m) =>
      !/(?:not|no|without)\s+$/.test(
        prompt.slice(Math.max(0, m.index! - 10), m.index).toLowerCase(),
      ),
  );
  const word = matches.at(-1)?.[1];
  return word
    ? /tablet|ipad/.test(word)
      ? 'tablet'
      : /desktop|laptop/.test(word)
        ? 'desktop'
        : 'mobile'
    : undefined;
}
export const money = (value: number) =>
  '₹' +
  Math.abs(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
export const percent = (value: number) =>
  (value > 0 ? '+' : value < 0 ? '−' : '') + Math.abs(value).toFixed(2) + '%';

export const componentVariants: Record<string, Record<string, string>> = {
  card: {
    dashboard: 'Three business metrics',
    portfolio: 'Current value, invested amount and returns',
    markets: 'NIFTY, SENSEX and BANK NIFTY',
    funds: 'Investment and SIP summary',
    'stock-detail': 'Current stock price',
    planning: 'Task, focus and meeting metrics',
    commerce: 'Delivery information',
  },
  chart: {
    dashboard: 'Business revenue over time',
    portfolio: 'Portfolio value with timeframe pills',
    'stock-detail': 'Price series with timeframe pills',
    funds: 'Fund performance',
  },
  'data-table': {
    desktop: 'Searchable rows with separate value columns',
    mobile: 'Thumbnail list rows; values never truncate',
    funds: 'Fund NAV and returns',
    portfolio: 'Holdings and returns',
    orders: 'Order activity',
  },
  table: {
    default: 'Read-only data rows',
    mobile: 'Financial thumbnail list when using an investment recipe',
  },
  field: {
    settings: 'Workspace name and email',
    form: 'Labeled form fields',
    order: '120px quantity and price inputs; validated sample order',
  },
  tabs: {
    default: 'Sibling views',
    portfolio: 'Holdings, positions and orders',
    orders: 'Open, executed and cancelled',
    'stock-detail': 'Overview, news and financials',
  },
  'toggle-group': {
    default: 'Neutral single-select filter pills',
    financial: 'Filter equity and index investments',
  },
  item: {
    default: 'Document list item',
    kanban: 'Interactive three-stage task board',
  },
  carousel: {
    default: 'Scrollable content carousel',
    commerce: 'Responsive product grid with sample cart',
  },
  'input-group': {
    default: 'Search',
    conversation: 'Message composer',
    financial: 'Shared search for investment rows',
  },
};
