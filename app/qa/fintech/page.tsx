'use client';
import { useState } from 'react';
import { FinanceFlow } from '@/components/finance-flow';
import {
  workflowKinds,
  flowStates,
  workflows,
  type WorkflowKind,
  type FlowStage,
} from '@/lib/fintech/workflows';
export default function FintechQA() {
  const [kind, setKind] = useState<WorkflowKind>('transfer'),
    [stage, setStage] = useState<FlowStage>('details'),
    [device, setDevice] = useState('mobile'),
    [outcome, setOutcome] = useState<'success' | 'pending' | 'failed'>(
      'success',
    );
  return (
    <main style={{ padding: 24 }}>
      <h1>Fintech workflow QA</h1>
      <div
        style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '24px 0' }}
      >
        <label>
          Workflow{' '}
          <select
            aria-label="Workflow"
            value={kind}
            onChange={(e) => setKind(e.target.value as WorkflowKind)}
          >
            {workflowKinds.map((k) => (
              <option key={k} value={k}>
                {workflows[k].title}
              </option>
            ))}
          </select>
        </label>
        <label>
          State{' '}
          <select
            aria-label="State"
            value={stage}
            onChange={(e) => setStage(e.target.value as FlowStage)}
          >
            {flowStates.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label>
          Device{' '}
          <select
            aria-label="Device"
            value={device}
            onChange={(e) => setDevice(e.target.value)}
          >
            {['mobile', 'tablet', 'desktop'].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label>
          Outcome{' '}
          <select
            aria-label="Outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as typeof outcome)}
          >
            {['success', 'pending', 'failed'].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="tree-view mint-theme light"
        data-qa-viewport
        style={{
          width: device === 'mobile' ? 340 : device === 'tablet' ? 720 : 1100,
          maxWidth: '100%',
        }}
      >
        <FinanceFlow
          key={`${kind}-${stage}-${outcome}`}
          kind={kind}
          initialStage={stage}
          outcome={outcome}
        />
      </div>
    </main>
  );
}
