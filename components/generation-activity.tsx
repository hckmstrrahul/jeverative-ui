'use client';

type Props = {
  busy: boolean;
  live: boolean;
  engine: 'hybrid' | 'llm' | 'jev';
  status: string;
  plan?: { arrangement: string; density: string; surface: string };
  count: number;
  error: boolean;
  completed: boolean;
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
    live ? (engine === 'llm' ? 'Compose' : 'Layout') : 'Layout',
    repairing ? 'Repair' : 'Build',
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
        ? 'Interface ready'
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
              : engine === 'jev'
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
