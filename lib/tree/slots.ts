import type { UIDocument } from './spec';

/** Unused supporting space is a layout decision, not a content validation failure.
 * Keep controls, titled containers, conditional content and referenced nodes. */
export function omitEmptySupport(document: UIDocument): UIDocument {
  const support = document.nodes.find((node) => node.id === 'jevSupport');
  if (!support) return document;
  const subtree = new Set([support.id]);
  for (const node of document.nodes)
    if (node.parent && subtree.has(node.parent)) subtree.add(node.id);
  const nodes = document.nodes.filter((node) => subtree.has(node.id));
  if (
    nodes.some(
      (node) =>
        !['stack', 'grid', 'panel'].includes(node.kind) ||
        node.when ||
        node.props.title ||
        node.props.description ||
        Object.keys(node.props).some(
          (key) =>
            ![
              'direction',
              'justify',
              'align',
              'gap',
              'columns',
              'ratio',
              'surface',
              'title',
              'description',
            ].includes(key),
        ),
    )
  )
    return document;
  if (
    document.nodes.some(
      (node) =>
        !subtree.has(node.id) &&
        ((typeof node.props.target === 'string' &&
          subtree.has(node.props.target)) ||
          (node.when && subtree.has(node.when.key))),
    )
  )
    return document;
  const remaining = document.nodes.filter((node) => !subtree.has(node.id));
  return {
    ...document,
    nodes: remaining.map((node) =>
      node.id === 'jevBody' &&
      remaining.filter((child) => child.parent === node.id).length === 1
        ? { ...node, props: { ...node.props, columns: 1, ratio: 'equal' } }
        : node,
    ),
  };
}
