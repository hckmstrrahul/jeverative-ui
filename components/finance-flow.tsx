'use client';
import { useId, useReducer, useRef, useEffect } from 'react';
import {
  workflows,
  initialFlow,
  transitionFlow,
  flowTotals,
  formatMoney,
  type WorkflowKind,
  type FlowStage,
  type FlowState,
} from '@/lib/fintech/workflows';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
export function FinanceFlow({
  kind,
  initialStage = 'details',
  outcome = 'success',
  currency = 'INR',
  density = 'compact',
  side = 'Buy',
}: {
  kind: WorkflowKind;
  initialStage?: FlowStage;
  outcome?: FlowState['outcome'];
  currency?: string;
  density?: string;
  side?: 'Buy' | 'Sell';
}) {
  const [state, dispatch] = useReducer(
    (s: FlowState, e: Parameters<typeof transitionFlow>[2]) =>
      transitionFlow(kind, s, e),
    {
      ...initialFlow(kind, initialStage, outcome),
      values: {
        ...initialFlow(kind, initialStage, outcome).values,
        ...(kind === 'trade' ? { side } : {}),
      },
    },
  );
  const id = useId(),
    heading = useRef<HTMLHeadingElement>(null),
    lastStage = useRef(state.stage);
  const config = workflows[kind];
  useEffect(() => {
    if (lastStage.current !== state.stage) {
      heading.current?.focus();
      lastStage.current = state.stage;
    }
  }, [state.stage]);
  const summary = () => (
    <dl className="finance-summary">
      {config.fields.map((f) => (
        <div key={f.key}>
          <dt>{f.label}</dt>
          <dd>
            {f.type === 'money'
              ? formatMoney(
                  Math.round(Number(state.values[f.key]) * 100),
                  currency,
                )
              : state.values[f.key]}
          </dd>
        </div>
      ))}
      {!['verification', 'card'].includes(kind) && (
        <>
          <div>
            <dt>Illustrative fee</dt>
            <dd>{formatMoney(flowTotals(kind, state.values).fee, currency)}</dd>
          </div>
          <div className="finance-total">
            <dt>
              {kind === 'trade' && state.values.side === 'Sell'
                ? 'Estimated proceeds'
                : 'Total'}
            </dt>
            <dd>
              {formatMoney(flowTotals(kind, state.values).total, currency)}
            </dd>
          </div>
        </>
      )}
    </dl>
  );
  return (
    <section
      className={`finance-flow finance-${density}`}
      aria-label={config.title}
    >
      <header>
        <p className="finance-eyebrow">Interactive prototype</p>
        <h2 ref={heading} tabIndex={-1}>
          {config.title}
        </h2>
        <p>{config.description}</p>
      </header>
      <ol className="finance-steps" aria-label="Workflow progress">
        {['details', 'input', 'review', 'confirmation'].map((step, i) => (
          <li
            key={step}
            aria-current={
              state.stage === step ||
              (i === 3 &&
                ['loading', 'pending', 'success', 'failed'].includes(
                  state.stage,
                ))
                ? 'step'
                : undefined
            }
          >
            {i + 1}. {step}
          </li>
        ))}
      </ol>
      {state.stage === 'details' && (
        <>
          {summary()}
          {config.balance && (
            <p>
              Demo available balance:{' '}
              {formatMoney(config.balance * 100, currency)}
            </p>
          )}
          <Button onClick={() => dispatch({ type: 'start' })}>Continue</Button>
        </>
      )}
      {state.stage === 'empty' && (
        <div className="finance-state">
          <h3>No activity yet</h3>
          <p>
            Start a sample {config.title.toLowerCase()} to see this workflow.
          </p>
          <Button onClick={() => dispatch({ type: 'start' })}>
            Get started
          </Button>
        </div>
      )}
      {state.stage === 'input' && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: 'review' });
          }}
        >
          <div className="finance-fields">
            {config.fields.map((f) => (
              <div key={f.key}>
                <Label htmlFor={`${id}-${f.key}`}>{f.label}</Label>
                {f.options ? (
                  <select
                    id={`${id}-${f.key}`}
                    value={state.values[f.key]}
                    onChange={(e) =>
                      dispatch({
                        type: 'change',
                        key: f.key,
                        value: e.target.value,
                      })
                    }
                  >
                    {f.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={`${id}-${f.key}`}
                    value={state.values[f.key]}
                    maxLength={160}
                    inputMode={
                      f.type === 'money'
                        ? 'decimal'
                        : f.type === 'quantity'
                          ? 'numeric'
                          : f.type === 'email'
                            ? 'email'
                            : undefined
                    }
                    aria-invalid={!!state.errors[f.key]}
                    aria-describedby={
                      state.errors[f.key] ? `${id}-${f.key}-error` : undefined
                    }
                    onChange={(e) =>
                      dispatch({
                        type: 'change',
                        key: f.key,
                        value: e.target.value,
                      })
                    }
                  />
                )}
                {state.errors[f.key] && (
                  <p id={`${id}-${f.key}-error`} className="finance-error">
                    {state.errors[f.key]}
                  </p>
                )}
              </div>
            ))}
          </div>
          {Object.keys(state.errors).length > 0 && (
            <p role="alert" className="finance-error">
              {Object.values(state.errors).join(' ')}
            </p>
          )}
          <Button type="submit">Review details</Button>
        </form>
      )}
      {state.stage === 'review' && (
        <>
          <h3>Review before confirming</h3>
          {summary()}
          <p>
            All amounts and fees are illustrative. Nothing will be sent or
            charged.
          </p>
          <div className="finance-actions">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'edit' })}
            >
              Edit details
            </Button>
            <Button onClick={() => dispatch({ type: 'confirm' })}>
              {config.action}
            </Button>
          </div>
        </>
      )}
      {state.stage === 'loading' && (
        <div className="finance-state" aria-live="polite">
          <h3>Processing demo</h3>
          <p>
            This is a simulated loading state. Continue to see the configured
            outcome.
          </p>
          <Button onClick={() => dispatch({ type: 'resolve' })}>
            Show demo result
          </Button>
        </div>
      )}
      {state.stage === 'pending' && (
        <div className="finance-state" aria-live="polite">
          <h3>Pending review</h3>
          <p>
            Demo request recorded. A pending request is not a completed
            transaction.
          </p>
          {summary()}
          <Button variant="outline" onClick={() => dispatch({ type: 'reset' })}>
            Start again
          </Button>
        </div>
      )}
      {state.stage === 'failed' && (
        <div className="finance-state" role="alert">
          <h3>Couldn’t complete this demo</h3>
          <p>
            Your entered details are preserved. Review them before retrying.
          </p>
          <div className="finance-actions">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'edit' })}
            >
              Edit details
            </Button>
            <Button onClick={() => dispatch({ type: 'retry' })}>
              Review and retry
            </Button>
          </div>
        </div>
      )}
      {state.stage === 'success' && (
        <div className="finance-state" aria-live="polite">
          <h3>Demo completed</h3>
          <p>Reference DEMO-1042 · No real transaction was performed.</p>
          {summary()}
          <Button variant="outline" onClick={() => dispatch({ type: 'reset' })}>
            Start again
          </Button>
        </div>
      )}
    </section>
  );
}
