import type { UINode, Value } from './spec';
export function listingMatches(
  node: UINode,
  state: Record<string, Value>,
): boolean {
  if (node.kind !== 'listing-card') return true;
  const { props: p } = node;
  const query = String(state[String(p.searchBind)] ?? '')
    .trim()
    .toLowerCase();
  const category = String(state[String(p.categoryBind)] ?? 'All stays');
  return (
    (!query ||
      `${String(p.title)} ${String(p.location)}`
        .toLowerCase()
        .includes(query)) &&
    (category === 'All stays' || category === p.category)
  );
}
