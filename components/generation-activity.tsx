'use client';

type Props = {
  busy: boolean;
  live: boolean;
  engine: 'hybrid' | 'llm' | 'jev' | 'jev-first';
  status: string;
  plan?: { arrangement: string; density: string; surface: string };
  count: number;
  error: boolean;
  completed: boolean;
  metrics?: {
    totalMs: number;
    firstContentMs: number | null;
    jevCalls?: number;
  };
};
export function GenerationActivity({
  busy,
  live,
  engine,
  status,
  plan,
  count,
  error,
  completed,
  metrics,
}: Props) {
  const repairing = /correct|repair|fix/i.test(status);
  const stage = error
    ? -1
    : !busy
      ? completed
        ? 3
        : -1
      : engine === 'llm' || plan || count || /building/i.test(status)
        ? 1
        : 0;
  const labels = [
    live
      ? engine === 'llm'
        ? 'Compose'
        : engine === 'jev-first'
          ? 'Select'
          : 'Layout'
      : 'Layout',
    repairing ? 'Repair' : engine === 'jev-first' ? 'Arrange' : 'Build',
    'Ready',
  ];
  const detail = error
    ? 'Needs attention'
    : busy
      ? repairing
        ? 'Correcting affected elements'
        : count
          ? `${count} elements received`
          : plan
            ? `${plan.arrangement.replaceAll('-', ' ')} · ${plan.density}`
            : live
              ? engine === 'llm'
                ? 'Composing your interface'
                : 'Choosing a layout'
              : 'Preparing a local preview'
      : completed
        ? metrics?.jevCalls
          ? `${(metrics.totalMs / 1000).toFixed(2)}s · ${metrics.jevCalls} Jev calls`
          : 'Interface ready'
        : live
          ? 'Ready when you are'
          : 'Connect to start';
  return (
    <div
      className="generation-activity"
      data-busy={busy || undefined}
      data-error={error || undefined}
    >
      <div className="activity-top">
        <span className="activity-engine">
          {live
            ? engine === 'hybrid'
              ? 'Jev + LLM'
              : engine === 'jev' || engine === 'jev-first'
                ? 'Jev'
                : 'LLM'
            : 'Not connected'}
        </span>
      </div>
      <div className="activity-flow" aria-hidden="true">
        {labels.map((label, i) => (
          <div
            key={i}
            className="activity-step"
            data-state={
              stage > i ? 'done' : busy && stage === i ? 'active' : 'waiting'
            }
          >
            <span className="activity-node">
              <i />
              <i />
              <i />
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <output
        className="activity-detail"
        aria-live="polite"
        title={
          plan
            ? `${plan.arrangement} · ${plan.density} · ${plan.surface}`
            : undefined
        }
      >
        {detail}
      </output>
    </div>
  );
}
