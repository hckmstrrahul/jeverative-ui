import { catalog, initialScreen, type Screen } from '../catalog';
import type { UIDocument } from './spec';
export function documentScreen(
  document: UIDocument,
  current: Screen = initialScreen,
): Screen {
  const names: Record<string, string> = {
    page: '',
    stack: '',
    grid: '',
    panel: 'card',
    form: 'field',
    heading: 'typography',
    text: 'typography',
    metric: 'card',
    icon: '',
    radio: 'radio-group',
  };
  return {
    ...current,
    document,
    blueprint: undefined,
    components: [
      ...new Set(
        document.nodes
          .map((n) => names[n.kind] ?? n.kind)
          .filter((id) => catalog.some((c) => c.id === id)),
      ),
    ],
    device: document.device,
    theme: document.theme,
    navigation: 'none',
    primaryAction: 'none',
  };
}
