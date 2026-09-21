import type { UIDocument, UINode } from './spec';

/** Presentation only: keep all task content, bindings and Jev's region ordering. */
export function visualLayoutProps(doc: UIDocument, node: UINode) {
  const props = { ...node.props };
  if (
    ['page', 'panel', 'form', 'stack', 'grid'].includes(node.kind) &&
    props.gap === undefined
  )
    props.gap =
      node.kind === 'page'
        ? 24
        : node.kind === 'stack' && props.direction === 'row'
          ? 8
          : 16;
  const children = doc.nodes.filter((n) => n.parent === node.id && !n.when);
  const rows = children.filter(
    (n) => !['heading', 'text', 'separator'].includes(n.kind),
  );
  if (
    ['stack', 'panel', 'form'].includes(node.kind) &&
    props.direction !== 'row'
  ) {
    // Rows already own their padding and touch targets; don't double-space lists.
    if (
      rows.length > 1 &&
      rows.every((n) =>
        ['mint-row', 'item', 'checkbox', 'switch'].includes(n.kind),
      )
    )
      props.gap = 4;
  }
  if (node.kind === 'panel' && !props.title && !props.description) {
    const visibleChildren = children.filter(
      (n) => !['dialog', 'sheet', 'drawer', 'alert-dialog'].includes(n.kind),
    );
    const framed = (n: UINode): boolean =>
      (n.kind === 'panel' && n.props.surface !== 'plain') ||
      (n.kind === 'grid' &&
        doc.nodes.some((c) => c.parent === n.id) &&
        doc.nodes
          .filter((c) => c.parent === n.id)
          .every(
            (c) =>
              c.kind === 'metric' ||
              (c.kind === 'panel' && c.props.surface !== 'plain'),
          ));
    if (visibleChildren.length && visibleChildren.every(framed))
      props.surface = 'plain';
  }
  if (
    node.kind === 'page' &&
    doc.device === 'desktop' &&
    props.width === 'reading'
  ) {
    const needsWorkspace = doc.nodes.some(
      (n) =>
        n.kind === 'resizable' ||
        n.kind === 'data-table' ||
        (n.kind === 'grid' && Number(n.props.columns) >= 3),
    );
    if (needsWorkspace) props.width = 'wide';
  }
  return props;
}

export function hasConversationSplit(doc: UIDocument, node: UINode) {
  if (doc.device !== 'desktop' || !['panel', 'stack'].includes(node.kind))
    return false;
  const children = doc.nodes.filter((n) => n.parent === node.id && !n.when);
  if (children.length !== 2 || children[0].kind !== 'scroll-area') return false;
  const ancestors = new Set([children[1].id]);
  for (const n of doc.nodes)
    if (n.parent && ancestors.has(n.parent)) ancestors.add(n.id);
  return doc.nodes.some(
    (n) => ancestors.has(n.id) && n.kind === 'message-scroller',
  );
}
