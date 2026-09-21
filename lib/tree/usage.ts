export type TextUsage = {
  attempts: number;
  reportedAttempts: number;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  costUsd: number | null;
  costComplete: boolean;
};
export function summarizeTextUsage(
  reports: unknown[],
  attempts: number,
): TextUsage {
  const valid = reports.filter(
    (v): v is Record<string, unknown> =>
      Boolean(v) && typeof v === 'object' && !Array.isArray(v),
  );
  const count = (v: unknown) =>
    typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0;
  const costs = valid
    .map((v) => v.cost)
    .filter(
      (v): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    );
  return {
    attempts,
    reportedAttempts: valid.length,
    promptTokens: valid.reduce((s, v) => s + count(v.prompt_tokens), 0),
    completionTokens: valid.reduce((s, v) => s + count(v.completion_tokens), 0),
    cachedTokens: valid.reduce(
      (s, v) =>
        s +
        count(
          (v.prompt_tokens_details as { cached_tokens?: unknown } | undefined)
            ?.cached_tokens,
        ),
      0,
    ),
    costUsd: costs.length ? costs.reduce((s, v) => s + v, 0) : null,
    costComplete: attempts > 0 && costs.length === attempts,
  };
}
