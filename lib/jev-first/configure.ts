import type { Question } from '../decisions';
import type { Candidate } from './candidates';
export type Configuration = {
  questions: Record<string, Question>;
  apply: (answers: Record<string, string>) => Candidate[];
};
/** Only compiler-owned properties are configurable; no generated property names. */
export function configurationFor(
  selected: Candidate[],
  variation: boolean,
): Configuration {
  const questions: Record<string, Question> = {};
  const patches: Array<{
    key: string;
    node: string;
    property: string;
    values: Record<string, unknown>;
  }> = [];
  function choose(
    node: string,
    property: string,
    current: unknown,
    values: Record<string, unknown>,
    instructions: string,
  ) {
    const key = `config_${node}_${property}`;
    const options = { keep: current, ...values };
    questions[key] = {
      type: 'choice',
      instructions: `${instructions} Keep the current value unless the prompt explicitly calls for a change.`,
      criteria: Object.fromEntries(
        Object.entries(options).map(([id, v]) => [
          id,
          id === 'keep' ? `Keep current (${String(v)})` : String(v),
        ]),
      ),
    };
    patches.push({ key, node, property, values: options });
  }
  if (!variation)
    for (const c of selected)
      for (const n of c.nodes) {
        if (n.kind === 'finance-flow') {
          choose(
            n.id,
            'density',
            n.props.density ?? 'compact',
            { compact: 'compact', comfortable: 'comfortable' },
            'Financial form density. Keep controls labelled and review legible.',
          );
          choose(
            n.id,
            'currency',
            n.props.currency ?? 'INR',
            { inr: 'INR', usd: 'USD' },
            'Currency of illustrative sample figures; do not imply currency conversion.',
          );
          choose(
            n.id,
            'initialStage',
            n.props.initialStage ?? 'details',
            {
              details: 'details',
              input: 'input',
              review: 'review',
              loading: 'loading',
              empty: 'empty',
              failed: 'failed',
              pending: 'pending',
              success: 'success',
            },
            'Initial workflow state. Only change when the user explicitly requests that state.',
          );
          choose(
            n.id,
            'outcome',
            n.props.outcome ?? 'success',
            { success: 'success', pending: 'pending', failed: 'failed' },
            'Simulated submission outcome; use pending or failed only when requested.',
          );
        }
        if (n.kind === 'panel')
          choose(
            n.id,
            'surface',
            n.props.surface ?? 'plain',
            { card: 'card', subtle: 'subtle', plain: 'plain' },
            `Surface for ${String(n.props.title)}. Card for distinct contained sections; plain for settings groups.`,
          );
        if (n.kind === 'panel')
          choose(
            n.id,
            'gap',
            n.props.gap ?? 12,
            { compact: 8, comfortable: 12, roomy: 16 },
            'Section spacing. Compact for dense utility screens; roomy only when explicitly requested.',
          );
        if (n.kind === 'button' && n.props.variant !== 'destructive')
          choose(
            n.id,
            'variant',
            n.props.variant ?? 'default',
            { primary: 'default', secondary: 'outline', quiet: 'ghost' },
            `Emphasis for ${String(n.props.label)}. One primary action per workflow; secondary actions outlined.`,
          );
        if (n.kind === 'avatar')
          choose(
            n.id,
            'size',
            n.props.size ?? 48,
            { compact: 32, medium: 48, large: 64 },
            'Profile avatar size.',
          );
        if (n.kind === 'finance-chart')
          choose(
            n.id,
            'period',
            n.props.period ?? '1W',
            { day: '1D', week: '1W', month: '1M' },
            'Starting chart range. Respect explicit day/week/month requests.',
          );
        if (n.kind === 'chart' || n.kind === 'finance-chart')
          choose(
            n.id,
            'style',
            n.props.style ?? 'line',
            { line: 'line', bar: 'bar' },
            'Choose bar for category comparison and line for time trends.',
          );
        if (['switch', 'checkbox'].includes(n.kind))
          choose(
            n.id,
            'checked',
            n.props.checked ?? false,
            { on: true, off: false },
            `Initial state for ${String(n.props.label)}. Change only if this preference is explicitly specified.`,
          );
        if (
          ['select', 'radio'].includes(n.kind) &&
          Array.isArray(n.props.options)
        )
          choose(
            n.id,
            'value',
            n.props.value ?? n.props.options[0],
            Object.fromEntries(
              n.props.options.map((v, i) => [`option${i}`, v]),
            ),
            `Initial selection for ${String(n.props.label)}. Select only an explicitly requested option.`,
          );
      }
  return {
    questions,
    apply(answers) {
      const nodes = structuredClone(selected);
      for (const patch of patches) {
        const value = patch.values[answers[patch.key]];
        if (!Object.hasOwn(patch.values, answers[patch.key]))
          throw new Error(`Invalid configuration for ${patch.node}.`);
        for (const c of nodes) {
          const n = c.nodes.find((n) => n.id === patch.node);
          if (n) n.props[patch.property] = value;
        }
      }
      return nodes;
    },
  };
}
