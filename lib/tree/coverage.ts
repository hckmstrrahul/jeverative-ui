import { catalog } from '../catalog';
import { nodeKinds, type NodeKind } from './spec';
/** Explicit aliases distinguish official component names from composition primitives. */
export const officialAliases: Record<string, NodeKind> = {
  card: 'panel',
  typography: 'heading',
  'radio-group': 'radio',
};
export function adaptiveKind(componentId: string): NodeKind | undefined {
  const kind = officialAliases[componentId] ?? componentId;
  return nodeKinds.includes(kind as NodeKind) ? (kind as NodeKind) : undefined;
}
export const adaptiveCoverage = catalog.map((component) => ({
  id: component.id,
  kind: adaptiveKind(component.id),
}));
