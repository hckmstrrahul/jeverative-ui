import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  workflowKinds,
  flowStates,
  initialFlow,
  transitionFlow,
  validateFlow,
  flowTotals,
  moneyMinor,
  workflows,
} from '../lib/fintech/workflows';
import { FinanceFlow } from '../components/finance-flow';
import { FinanceChart } from '../components/finance-chart';
import { composeJevFirst, type Evaluate } from '../lib/jev-first/compose';
import { buildCandidates } from '../lib/jev-first/candidates';
import { validateDocument } from '../lib/tree/spec';
import { TreeRenderer } from '../components/tree-renderer';
for (const kind of workflowKinds) {
  for (const state of flowStates)
    for (const currency of ['INR', 'USD']) {
      const html = renderToStaticMarkup(
        <FinanceFlow kind={kind} initialStage={state} currency={currency} />,
      );
      assert.ok(html.includes(workflows[kind].title));
      assert.ok(!html.includes('NaN'));
    }
  for (const outcome of ['success', 'pending', 'failed'] as const) {
    let state = initialFlow(kind, 'details', outcome);
    assert.equal(transitionFlow(kind, state, { type: 'confirm' }), state);
    state = transitionFlow(kind, state, { type: 'start' });
    const field = workflows[kind].fields[0];
    state = transitionFlow(kind, state, {
      type: 'change',
      key: field.key,
      value: '',
    });
    state = transitionFlow(kind, state, { type: 'review' });
    assert.equal(state.stage, 'input');
    assert.ok(state.errors[field.key]);
    state = transitionFlow(kind, state, {
      type: 'change',
      key: field.key,
      value: field.initial,
    });
    state = transitionFlow(kind, state, { type: 'review' });
    assert.equal(state.stage, 'review');
    const values = { ...state.values };
    state = transitionFlow(kind, state, { type: 'edit' });
    assert.deepEqual(state.values, values);
    state = transitionFlow(kind, state, { type: 'review' });
    state = transitionFlow(kind, state, { type: 'confirm' });
    assert.equal(state.stage, 'loading');
    assert.equal(transitionFlow(kind, state, { type: 'confirm' }), state); // no double submission
    state = transitionFlow(kind, state, { type: 'resolve' });
    assert.equal(state.stage, outcome);
    if (outcome === 'failed') {
      state = transitionFlow(kind, state, { type: 'retry' });
      assert.equal(state.stage, 'review');
      assert.deepEqual(state.values, values);
    }
    if (outcome === 'pending')
      assert.equal(transitionFlow(kind, state, { type: 'confirm' }), state);
  }
}
assert.equal(moneyMinor('0.29'), 29);
for (const input of ['NaN', 'Infinity', '1e3', '-4', '2.999'])
  assert.equal(moneyMinor(input), null);
assert.equal(flowTotals('transfer', { amount: '0.29' }).total, 529);
assert.ok(
  validateFlow('trade', { ...initialFlow('trade').values, quantity: '1.5' })
    .quantity,
);
assert.ok(
  validateFlow('trade', {
    ...initialFlow('trade').values,
    side: 'Sell',
    quantity: '13',
  }).quantity,
);
assert.ok(
  validateFlow('transfer', {
    ...initialFlow('transfer').values,
    amount: '90000',
  }).amount,
);
assert.ok(
  validateFlow('card', { ...initialFlow('card').values, status: 'Unknown' })
    .status,
);
const prompts = [
  'stock trade order ticket',
  'mutual fund SIP investment',
  'bank deposit add money',
  'send money transfer',
  'freeze payment card',
  'loan EMI repayment',
  'insurance claim',
  'merchant invoice',
  'KYC identity verification',
  'budget expense',
];
const evaluate: Evaluate = async (q) => ({
  answers: Object.fromEntries(
    Object.entries(q).map(([key, v]) => {
      if (v.type !== 'choice') throw Error('choice required');
      const choices = Object.keys(v.criteria);
      return [
        key,
        {
          type: 'choice',
          choice: choices.includes('keep')
            ? 'keep'
            : key.startsWith('use_')
              ? choices.find((c) => c !== 'omit')!
              : key === 'supported'
                ? 'yes'
                : choices[0],
        },
      ];
    }),
  ),
});
for (const prompt of prompts)
  for (const state of flowStates)
    for (const device of ['mobile', 'tablet', 'desktop'] as const) {
      const full = `${prompt} ${state === 'details' ? '' : `${state} state`}`;
      let completed = false;
      for await (const event of composeJevFirst({
        prompt: full,
        device,
        signal: new AbortController().signal,
        evaluate,
      }))
        if (event.type === 'complete') {
          completed = true;
          validateDocument(event.document);
          assert.equal(event.metrics.textMs, 0);
          assert.equal(event.metrics.repairs, 0);
          assert.ok(
            event.document.nodes.some((n) => n.kind === 'finance-flow'),
            full,
          );
          if (state !== 'details')
            assert.ok(
              event.document.nodes.some(
                (n) =>
                  n.kind === 'finance-flow' && n.props.initialStage === state,
              ),
              `Requested ${state} must survive composition: ${full}`,
            );
          assert.ok(
            renderToStaticMarkup(<TreeRenderer document={event.document} />)
              .length > 500,
          );
        }
      assert.ok(completed, full);
    }
const transfer = buildCandidates('add money deposit and transfer');
assert.equal(new Set(transfer.map((c) => c.id)).size, transfer.length);
assert.ok(
  transfer.some((c) => c.nodes.some((n) => n.props.workflow === 'deposit')),
);
assert.ok(
  transfer.some((c) => c.nodes.some((n) => n.props.workflow === 'transfer')),
);
assert.ok(
  renderToStaticMarkup(
    <FinanceChart
      title="Sample history"
      series={[
        { label: 'Mon', value: 100 },
        { label: 'Tue', value: 110 },
      ]}
    />,
  ).includes('Chart range'),
);
console.log(
  'Fintech: ten workflows × eight states × three devices compose without text calls; validation, fee arithmetic, confirmation guards, retry conservation and 160 state/currency renders pass.',
);
