/** Listed OpenRouter rates checked 2026-09-21. Actual provider charges may vary. */
export const TEXT_MODELS = [
  {
    id: 'qwen/qwen3.7-flash',
    name: 'Qwen3.7 Flash · Budget',
    input: 0.03,
    output: 0.13,
    note: 'Budget default; design quality not yet benchmarked. Rates apply below 32K input tokens.',
  },
  {
    id: 'moonshotai/kimi-k2.5',
    name: 'Kimi K2.5',
    input: 0.45,
    output: 2.25,
    note: 'Lower listed rates than Haiku; design quality not yet benchmarked.',
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    input: 1,
    output: 5,
    note: 'Previous benchmark baseline. Repeated system rules are cache-enabled.',
  },
] as const;
export const DEFAULT_TEXT_MODEL = TEXT_MODELS[0].id;
export function textModelOptions(model: string) {
  return TEXT_MODELS.some((m) => m.id === model)
    ? { reasoning: { enabled: false } }
    : {};
}
export function systemMessage(model: string, text: string) {
  // Keep the rules as a stable prefix, including on correction calls. Moonshot
  // caches automatically; only explicitly mark the supported Claude prefix.
  return {
    role: 'system',
    content: model.startsWith('anthropic/')
      ? [{ type: 'text', text, cache_control: { type: 'ephemeral' } }]
      : text,
  };
}
