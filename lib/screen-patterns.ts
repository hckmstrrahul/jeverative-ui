import { catalog, type Screen } from './catalog';
import { getBlueprint } from './ui-grammar';
import { recipes, type Recipe } from './mint';

/** Observed composition, not copied visual styling. Mint remains the visual authority. */
export const referencePatterns = [
  {
    app: 'Fidelity',
    url: 'https://mobbin.com/screens/0dd015e1-3253-461b-bbd5-6625be377fb5',
    rule: 'One balance anchor, inline return, chart, then holdings. Avoid repeating the same value in several cards.',
  },
  {
    app: 'Crypto.com',
    url: 'https://mobbin.com/screens/e7692910-6ec0-4d66-8012-22ec1959bfc4',
    rule: 'Asset tabs belong directly above asset rows, after the performance chart.',
  },
  {
    app: 'Hashnode',
    url: 'https://mobbin.com/screens/6442e278-2894-420e-9096-e54dbeef5651',
    rule: 'Summary metrics precede a wide chart; the records table follows on its own full-width row.',
  },
  {
    app: 'Retool',
    url: 'https://mobbin.com/screens/7cc2958e-84ad-404c-a224-a5afa1e20050',
    rule: 'A support visualization may sit beside a primary chart; the transaction table still spans the workspace.',
  },
  {
    app: 'Curater',
    url: 'https://mobbin.com/screens/196fc896-d192-4945-8a5c-dbf8dc339aff',
    rule: 'Settings have readable grouped fields, section descriptions and nearby save actions.',
  },
  {
    app: 'Contractbook',
    url: 'https://mobbin.com/screens/9d31c910-66ad-4a1a-8b83-7b4e012bca43',
    rule: 'Desktop settings retain application navigation while the editable content stays grouped.',
  },
] as const;
const extras: Record<Recipe, string[]> = {
  profile: [],
  dashboard: ['table', 'date-picker', 'select', 'input-group', 'progress'],
  portfolio: ['table', 'input-group', 'toggle-group'],
  markets: ['table', 'input-group', 'tabs', 'chart'],
  'stock-detail': ['accordion', 'button'],
  order: ['select'],
  funds: ['table', 'input-group', 'tabs', 'chart'],
  orders: ['table', 'input-group', 'date-picker'],
  derivatives: ['table', 'input-group', 'tabs'],
  loans: ['select', 'slider', 'button'],
  planning: ['item', 'date-picker', 'input-group', 'select'],
  settings: ['radio-group', 'select', 'button'],
  conversation: ['message-scroller', 'attachment', 'avatar'],
  form: ['checkbox', 'radio-group', 'input-otp', 'button'],
  commerce: ['select', 'pagination'],
  kanban: ['input-group', 'select', 'button'],
};
export const isShowroom = (prompt: string) =>
  /all (?:the )?components|entire (?:library|catalog)|component (?:showcase|showroom)/i.test(
    prompt,
  );
export function allowedComponents(screen: Screen, prompt: string): Set<string> {
  if (isShowroom(prompt)) return new Set(catalog.map((c) => c.id));
  // Explicit component requests remain possible outside a recipe's normal palette.
  const named = catalog
    .filter((c) =>
      new RegExp(`\\b${c.id.replaceAll('-', '[ -]')}\\b`, 'i').test(prompt),
    )
    .map((c) => c.id);
  return new Set([
    ...recipes[screen.recipe].components,
    ...extras[screen.recipe],
    ...getBlueprint(screen).required,
    ...getBlueprint(screen).optional,
    ...named,
  ]);
}
