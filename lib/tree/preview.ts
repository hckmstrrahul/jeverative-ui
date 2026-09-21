import { isContainer, type UIDocument } from './spec';

/** Show each structurally validated prefix, including a correction's first content.
 * The caller retains its visible draft while only empty containers arrive. */
export class StreamPreview {
  push(document: UIDocument): UIDocument | null {
    return document.nodes.some((node) => !isContainer(node.kind))
      ? document
      : null;
  }
}
