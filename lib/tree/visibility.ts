/** Lift a misplaced visibility condition without overwriting a different rule.
 * Shape and binding validation remain the responsibility of the node validator.
 */
export function attachVisibility(
  node: Record<string, unknown>,
  condition: unknown,
): Record<string, unknown> {
  if (node.when !== undefined) {
    const existing = node.when;
    const record = (value: unknown): value is Record<string, unknown> =>
      value !== null && typeof value === 'object' && !Array.isArray(value);
    if (!record(existing) || !record(condition) ||
      Object.keys(existing).length !== 2 || Object.keys(condition).length !== 2 ||
      !Object.hasOwn(existing, 'key') || !Object.hasOwn(existing, 'equals') ||
      !Object.hasOwn(condition, 'key') || !Object.hasOwn(condition, 'equals') ||
      existing.key !== condition.key || existing.equals !== condition.equals)
      throw new Error('Conflicting visibility conditions. Put one when rule on the node.');
    return node;
  }
  return { ...node, when: condition };
}
