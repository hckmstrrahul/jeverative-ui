import { validateDocument, type UIDocument, type UINode } from './spec';
import { visualLayoutProps } from './visual-layout';
import type { Question } from '../decisions';

const childrenOf = (doc: UIDocument, id: string) =>
  doc.nodes.filter((n) => n.parent === id);
function descendants(doc: UIDocument, node: UINode): UINode[] {
  return [
    node,
    ...childrenOf(doc, node.id).flatMap((child) => descendants(doc, child)),
  ];
}
function maxColumns(doc: UIDocument, node: UINode) {
  const children = childrenOf(doc, node.id);
  if (doc.device === 'mobile') return 1;
  const substantial = descendants(doc, node).some((n) =>
    [
      'form',
      'table',
      'data-table',
      'chart',
      'textarea',
      'resizable',
      'questionnaire',
    ].includes(n.kind),
  );
  return Math.max(
    1,
    Math.min(children.length, doc.device === 'tablet' || substantial ? 2 : 4),
  );
}
/** Deterministic constraints don't need a paid decision. Never rewrite task content. */
export function constrainLayout(doc: UIDocument): UIDocument {
  return validateDocument({
    ...doc,
    nodes: doc.nodes.map((node) => {
      const props = visualLayoutProps(doc, node);
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
      if (node.kind === 'grid') {
        props.columns = Math.min(
          typeof props.columns === 'number' ? props.columns : 2,
          maxColumns(doc, node),
        );
        if (props.columns !== 2) props.ratio = 'equal';
        // A peer pair of metrics should not acquire a lopsided split.
        const children = childrenOf(doc, node.id);
        if (children.every((n) => n.kind === 'metric')) props.ratio = 'equal';
      }
      return { ...node, props };
    }),
  });
}
export function layoutQuestions(doc: UIDocument): Record<string, Question> {
  const questions: Record<string, Question> = {};
  for (const node of doc.nodes) {
    if (node.kind === 'page' && doc.device === 'desktop')
      questions[node.id] = {
        type: 'choice',
        instructions:
          'Preserve explicit prompt layout. Use reading for focused profiles/settings/forms; wide for tables, charts or workspaces. Keep current width unless there is a clear readability benefit.',
        criteria: {
          reading: 'Focused readable column',
          wide: 'Broad workspace',
        },
      };
    if (
      node.kind !== 'grid' ||
      maxColumns(doc, node) < 2 ||
      Object.keys(questions).length >= 6
    )
      continue;
    const children = childrenOf(doc, node.id);
    if (children.every((n) => n.kind === 'metric')) continue;
    const criteria: Record<string, string> = {
      '1': 'Stacked readable groups',
      '2': 'Two equal peer columns',
    };
    if (maxColumns(doc, node) >= 3) criteria['3'] = 'Three equal peer columns';
    if (maxColumns(doc, node) >= 4) criteria['4'] = 'Four compact peer columns';
    if (
      doc.device === 'desktop' &&
      children.length === 2 &&
      !descendants(doc, node).some((n) =>
        ['form', 'table', 'chart'].includes(n.kind),
      )
    ) {
      criteria['main-left'] = 'Primary content first, secondary support second';
      criteria['main-right'] =
        'Secondary support first, primary content second';
    }
    questions[node.id] = {
      type: 'choice',
      instructions:
        'Choose one coherent layout from actual child roles and labels. Preserve explicit arrangement. Peer content gets equal columns; primary/support may use a split. Prefer current layout unless there is a clear readability improvement.',
      criteria,
    };
  }
  return questions;
}
export function reviewState(doc: UIDocument, prompt: string) {
  return {
    prompt,
    device: doc.device,
    title: doc.title,
    nodes: doc.nodes.map((n) => ({
      id: n.id,
      parent: n.parent,
      kind: n.kind,
      label: (
        (n.props.label ?? n.props.title ?? n.props.text ?? '') as string
      ).slice(0, 120),
      layout: Object.fromEntries(
        Object.entries(n.props).filter(([k]) =>
          ['width', 'columns', 'ratio', 'gap', 'direction'].includes(k),
        ),
      ),
      conditional: Boolean(n.when),
    })),
  };
}
export function applyLayoutAnswers(
  doc: UIDocument,
  questions: Record<string, Question>,
  answers: unknown,
) {
  if (!answers || typeof answers !== 'object')
    throw new Error('Invalid layout review.');
  const values = answers as Record<string, { type?: string; choice?: string }>;
  return constrainLayout({
    ...doc,
    nodes: doc.nodes.map((n) => {
      const q = questions[n.id];
      if (!q || q.type !== 'choice') return n;
      const a = values[n.id];
      if (
        a?.type !== 'choice' ||
        !a.choice ||
        !Object.hasOwn(q.criteria, a.choice)
      )
        throw new Error('Invalid layout choice.');
      return {
        ...n,
        props: {
          ...n.props,
          ...(n.kind === 'page'
            ? { width: a.choice }
            : {
                columns: a.choice.startsWith('main-') ? 2 : Number(a.choice),
                ratio: a.choice.startsWith('main-') ? a.choice : 'equal',
              }),
        },
      };
    }),
  });
}
