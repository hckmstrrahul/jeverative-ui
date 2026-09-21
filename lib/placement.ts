import type { Composition } from './composition';

/** Follow visual page order, including semantic groups, rather than catalog order. */
export function placementOrder(plan: Composition): string[] {
  const actionsAtEnd =
    plan.recipe === 'settings' || plan.recipe === 'conversation';
  return [
    ...plan.rail,
    ...plan.navigation,
    ...plan.identity,
    ...plan.notices,
    ...(!actionsAtEnd ? plan.actions : []),
    ...plan.toolbar,
    ...plan.sections.flatMap((s) => s.components),
    ...(actionsAtEnd ? plan.actions : []),
    ...plan.footer,
  ];
}

/** The sequence is presentation of completed decisions, never fabricated model progress. */
export function placementInterval(count: number): number {
  return count === 0 ? 0 : Math.min(160, Math.max(20, 1200 / count));
}

export function waitForPlacement(
  signal: AbortSignal,
  ms: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Cancelled', 'AbortError'));
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Cancelled', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}
