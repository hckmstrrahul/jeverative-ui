import type { UIDocument, Value } from './spec';
export type LocalEdits = Record<string, { value: Value; signature: string }>;
export function bindingSignature(document: UIDocument, key: string): string {
  const node = document.nodes.find((n) => n.props.bind === key);
  return JSON.stringify([
    document.title,
    node?.kind,
    node?.props.label,
    node?.props.value,
    node?.props.checked,
    node?.props.options,
  ]);
}
export function compatibleEdits(
  document: UIDocument,
  edits: LocalEdits,
): Record<string, Value> {
  return Object.fromEntries(
    Object.entries(edits)
      .filter(
        ([key, edit]) => edit.signature === bindingSignature(document, key),
      )
      .map(([key, edit]) => [key, edit.value]),
  );
}
