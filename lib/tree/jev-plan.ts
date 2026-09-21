import type { Question } from '../decisions';
import { appendNode, type UIDocument, type UINode } from './spec';

export type JevPlan = { arrangement: string; density: string; surface: string };
export function planQuestions(
  device: UIDocument['device'],
  avoid: string[] = [],
): Record<string, Question> {
  const questions: Record<string, Question> = {
    arrangement: {
      type: 'choice',
      instructions:
        'Choose the page composition from the user task, explicit layout constraints and previous composition. A variation should change composition when useful. Do not invent navigation or filler. Support regions are optional and collapse when unused; choose focused when the task has no meaningful secondary content. Desktop boards and tables need workspace width, never focused reading width. For inboxes choose a side support region and let primary contain conversation list and active conversation side by side. Mobile remains a vertical reading flow.',
      criteria:
        device === 'mobile'
          ? {
              focused: 'One focused reading flow for a single task',
              stacked: 'Primary task followed by supporting sections',
              'support-first':
                'Compact account/context summary before the primary task',
              'summary-first':
                'Full-width summary band before the main work area',
            }
          : {
              focused:
                'One focused reading flow for settings, forms or simple profiles',
              workspace:
                'One full-width workspace for boards, inventory, or analytics without a separate support region',
              stacked:
                'Full-width primary task followed by supporting sections',
              'main-left':
                'Wide main content with secondary support on the right',
              'main-right':
                'Compact identity or context on left, primary content on right',
              equal: 'Two peer work areas with equal importance',
              'summary-first':
                'Compact KPI summary band above the primary work area; never put a long list before the main task',
              'support-first':
                'Short essential context before the main task, never a tall list before dashboard metrics or charts',
            },
    },
    density: {
      type: 'choice',
      instructions:
        'Choose spacing for the task and explicit user preference. Prefer compact for this playground: trim wrappers and whitespace, never shrink control tap targets. Use spacious only when explicitly requested.',
      criteria: {
        compact: 'Preferred: 16px sections, 12px groups; full-size controls',
        comfortable: '24px sections, 16px groups',
        spacious: '32px sections, 24px groups',
      },
    },
    surface: {
      type: 'choice',
      instructions:
        'Choose meaningful section boundaries. Prefer plain for forms/settings, card for independent task areas, subtle for a supporting region. Avoid nested cards.',
      criteria: {
        plain: 'Unboxed sections',
        card: 'Distinct bordered work areas',
        subtle: 'Quiet supporting surface',
      },
    },
  };
  const arrangement = questions.arrangement;
  if (arrangement.type === 'choice' && avoid.length) {
    const allowed = Object.entries(arrangement.criteria).filter(
      ([id]) => !avoid.includes(id),
    );
    const candidates = allowed.length
      ? allowed
      : Object.entries(arrangement.criteria).filter(
          ([id]) => id !== avoid.at(-1),
        );
    if (candidates.length)
      arrangement.criteria = Object.fromEntries(candidates);
  }
  return questions;
}
export function previousArrangement(doc?: UIDocument): string | undefined {
  if (!doc?.nodes.some((n) => n.id === 'jevPage')) return undefined;
  const support = doc.nodes.find((n) => n.id === 'jevSupport');
  if (!support)
    return doc.nodes.find((n) => n.id === 'jevPage')?.props.width === 'wide'
      ? 'workspace'
      : 'focused';
  if (support.parent === 'jevPage') return 'summary-first';
  const body = doc.nodes.find((n) => n.id === 'jevBody');
  if (body?.props.ratio === 'main-left' || body?.props.ratio === 'main-right')
    return body.props.ratio;
  if (body?.props.columns === 2) return 'equal';
  return doc.nodes.indexOf(support) <
    doc.nodes.findIndex((n) => n.id === 'jevPrimary')
    ? 'support-first'
    : 'stacked';
}
export function parsePlan(
  answers: unknown,
  device: UIDocument['device'],
  questions = planQuestions(device),
): JevPlan {
  if (!answers || typeof answers !== 'object')
    throw new Error('Jev returned no composition plan.');
  const result: Record<string, string> = {};
  for (const [id, question] of Object.entries(questions)) {
    const answer = (
      answers as Record<string, { type?: string; choice?: string }>
    )[id];
    if (
      question.type !== 'choice' ||
      answer?.type !== 'choice' ||
      !answer.choice ||
      !Object.hasOwn(question.criteria, answer.choice)
    )
      throw new Error(`Jev returned an invalid ${id} choice.`);
    result[id] = answer.choice;
  }
  return result as JevPlan;
}
export function planNodes(
  plan: JevPlan,
  device: UIDocument['device'],
): UINode[] {
  const gap =
    plan.density === 'compact' ? 16 : plan.density === 'spacious' ? 32 : 24;
  const inner =
    plan.density === 'compact' ? 12 : plan.density === 'spacious' ? 24 : 16;
  const nodes: UINode[] = [
    {
      id: 'jevPage',
      parent: null,
      kind: 'page',
      props: {
        width: plan.arrangement === 'focused' ? 'reading' : 'wide',
        gap,
      },
    },
    {
      id: 'jevHeader',
      parent: 'jevPage',
      kind: 'stack',
      props: { direction: 'column', gap: 8 },
    },
    {
      id: 'jevBody',
      parent: 'jevPage',
      kind: 'grid',
      props: {
        columns:
          device === 'mobile' ||
          [
            'focused',
            'workspace',
            'stacked',
            'support-first',
            'summary-first',
          ].includes(plan.arrangement)
            ? 1
            : 2,
        ratio: plan.arrangement.startsWith('main-')
          ? plan.arrangement
          : 'equal',
        gap,
      },
    },
    {
      id: 'jevPrimary',
      parent: 'jevBody',
      kind: 'panel',
      props: {
        surface: plan.surface === 'subtle' ? 'plain' : plan.surface,
        gap: inner,
      },
    },
  ];
  if (!['focused', 'workspace'].includes(plan.arrangement)) {
    const support: UINode = {
      id: 'jevSupport',
      parent: 'jevBody',
      kind: 'panel',
      props: { surface: plan.surface, gap: inner },
    };
    if (plan.arrangement === 'summary-first') {
      support.parent = 'jevPage';
      nodes.splice(2, 0, support);
    } else if (['main-right', 'support-first'].includes(plan.arrangement))
      nodes.splice(3, 0, support);
    else nodes.push(support);
  }
  // Verify our compiler uses the same contract as generated nodes.
  let doc: UIDocument = {
    version: 1,
    title: 'Composition',
    device,
    theme: 'light',
    nodes: [],
  };
  for (const node of nodes) doc = appendNode(doc, node);
  return doc.nodes;
}
