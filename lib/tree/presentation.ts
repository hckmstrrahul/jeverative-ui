import type { UIDocument, UINode } from './spec';
/** Visual hierarchy is normalized locally; never discard financial data. */
export function normalizePresentation(document: UIDocument) {
  const anchors = new Set<string>();
  const adjustments: string[] = [];
  const nodes = document.nodes.map((node) => {
    if (node.kind === 'field') {
      const children = document.nodes.filter((n) => n.parent === node.id);
      const controls = [
        'input',
        'textarea',
        'select',
        'radio',
        'native-select',
        'combobox',
        'date-picker',
        'input-group',
        'input-otp',
        'slider',
      ];
      const inputs = children.filter((n) => controls.includes(n.kind));
      const hasGroup = children.some((n) =>
        ['mint-pill-group', 'toggle-group', 'stack', 'grid'].includes(n.kind),
      );
      if (
        inputs.length > 1 ||
        hasGroup ||
        (inputs.length === 1 &&
          children.some(
            (n) => ![...controls, 'label', 'text'].includes(n.kind),
          ))
      ) {
        adjustments.push(
          `Converted ${node.id} into a labelled group; preserved every child control.`,
        );
        return {
          ...node,
          kind: 'panel' as const,
          props: {
            title: node.props.label,
            ...(node.props.description
              ? { description: node.props.description }
              : {}),
            surface: 'plain',
            gap: 12,
          },
        };
      }
    }
    if (node.kind !== 'financial-value' || node.props.role !== 'anchor')
      return node;
    let parent: UINode | undefined = document.nodes.find(
      (n) => n.id === node.parent,
    );
    let panel: string | undefined;
    let inRow = false;
    while (parent) {
      if (['mint-row', 'item'].includes(parent.kind)) inRow = true;
      if (!panel && parent.kind === 'panel') panel = parent.id;
      parent = document.nodes.find((n) => n.id === parent!.parent);
    }
    if (inRow || (panel && anchors.has(panel))) {
      adjustments.push(
        `Used list typography for ${node.id}; preserved its financial value.`,
      );
      return { ...node, props: { ...node.props, role: 'list' } };
    }
    if (panel) anchors.add(panel);
    return node;
  });
  return { document: { ...document, nodes }, adjustments };
}
