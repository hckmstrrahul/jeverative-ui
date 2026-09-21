// Keep engine IDs stable in captures; display the current product names.
const modeLabel = (engine) => ({'jev-first':'Jev-only',hybrid:'Jev + LLM',llm:'LLM-only'}[engine] ?? engine);
import { writeFile } from 'node:fs/promises';
import { readSecret } from './benchmark-key.mjs';

// Run explicitly: OPENROUTER_API_KEY=... npm run benchmark
// Each default run makes 30 generations, plus 15 Jev composition calls and possible repairs.
const base = process.env.BENCHMARK_URL || 'http://localhost:3000';
console.log(
  `Text model: ${process.env.BENCHMARK_MODEL || 'server default (Qwen3.7 Flash)'}`,
);
const selectedEngines = (process.env.BENCHMARK_ENGINES || 'llm,hybrid').split(
  ',',
);
if (
  !selectedEngines.length ||
  selectedEngines.some((e) => !['llm', 'hybrid', 'jev-first'].includes(e)) ||
  new Set(selectedEngines).size !== selectedEngines.length
)
  throw new Error(
    'BENCHMARK_ENGINES must contain distinct llm, hybrid or jev-first values.',
  );
const repeats = Number(process.env.BENCHMARK_REPEATS || 3);
if (!Number.isInteger(repeats) || repeats < 1 || repeats > 10)
  throw new Error('BENCHMARK_REPEATS must be 1–10.');
let revision;
let apiKey = process.env.OPENROUTER_API_KEY?.trim();
try {
  const connection = await fetch(`${base}/api/connection`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!connection.ok)
    throw new Error('Could not check the local server connection.');
  const configuration = await connection.json();
  const { configured } = configuration;
  revision = configuration.revision;
  console.log(`Generation revision: ${revision ?? 'unversioned server'}`);
  if (!apiKey && !configured) {
    console.log(
      'The browser key is private to your browser session. Enter it here for this benchmark.',
    );
    apiKey = await readSecret();
  }
} catch (error) {
  console.error(
    error.message === 'fetch failed'
      ? `Start the app at ${base} before running the benchmark.`
      : error.message,
  );
  process.exit(1);
}
const cases = [
  [
    'desktop',
    'A profile page with separate wallet balances for IN and US stocks',
  ],
  [
    'mobile',
    'Account settings with security, notifications and linked bank accounts',
  ],
  [
    'tablet',
    'A weekly planner with tasks, priorities and upcoming appointments',
  ],
  [
    'desktop',
    'A sales dashboard with revenue, a trend chart and recent orders',
  ],
  ['mobile', 'An investing portfolio with holdings, returns and a watchlist'],
];
const results = [];
const output = `benchmark-${new Date().toISOString().replaceAll(':', '-')}.json`;
for (let repetition = 0; repetition < repeats; repetition++) {
  for (const [index, [device, prompt]] of cases.entries()) {
    // Sequential calls avoid self-induced contention; alternate ordering.
    const engines =
      (repetition + index) % 2
        ? [...selectedEngines].reverse()
        : selectedEngines;
    for (const engine of engines) {
      const started = performance.now();
      const row = {
        repetition: repetition + 1,
        device,
        prompt,
        engine,
        ok: false,
      };
      try {
        const response = await fetch(`${base}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            device,
            engine,
            model: process.env.BENCHMARK_MODEL,
            apiKey,
          }),
          signal: AbortSignal.timeout(130000),
        });
        if (!response.ok)
          throw new Error(
            `Request failed (${response.status}); check server/key configuration.`,
          );
        // Keep full documents for quality review, but never save the request or key.
        const events = (await response.text())
          .trim()
          .split('\n')
          .map((line) => JSON.parse(line));
        const terminal = events.at(-1);
        row.revision = terminal?.revision;
        if (revision && row.revision !== revision)
          throw new Error(
            'Server revision changed during benchmark. Restart the benchmark after code changes finish.',
          );
        row.ok = terminal?.type === 'complete';
        row.metrics = terminal?.metrics;
        row.model = terminal?.model;
        row.document = terminal?.document;
        row.adjustments = terminal?.adjustments;
        row.beforeReview = terminal?.beforeReview;
        row.plan = terminal?.plan;
        row.compositionVersion = terminal?.compositionVersion;
        row.error = terminal?.message;
        row.diagnostic = terminal?.diagnostic;
        row.repairDiagnostics = events
          .filter((event) => event.type === 'status' && event.targetedRepair)
          .map(({ reason, diagnostic }) => ({ reason, diagnostic }));
      } catch (error) {
        row.error = error.message;
      }
      row.wallMs = Math.round(performance.now() - started);
      results.push(row);
      await writeFile(
        output,
        JSON.stringify(
          { createdAt: new Date().toISOString(), results },
          null,
          2,
        ),
      );
      console.log(
        `${modeLabel(engine)} · ${device} · ${repetition + 1}/${repeats}: ${row.ok ? `${row.wallMs} ms` : row.error}`,
      );
      if (!row.ok && /Server revision changed/.test(row.error || '')) {
        console.error(
          'Stopped: this run mixed server revisions; results are not comparable.',
        );
        process.exit(1);
      }
      if (!row.ok && /401|402|key|credits/i.test(row.error || '')) {
        console.error(
          'Stopped: resolve connection or credits before benchmarking.',
        );
        process.exit(1);
      }
    }
  }
}
const median = (values) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length
    ? Math.round(
        sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2,
      )
    : null;
};
console.table(
  selectedEngines.map((engine) => {
    const runs = results.filter((r) => r.engine === engine);
    const passed = runs.filter((r) => r.ok);
    return {
      engine: modeLabel(engine),
      completed: `${passed.length}/${runs.length}`,
      jevComposed: runs.filter((r) => r.ok && r.plan).length,
      medianTotalMs: median(passed.map((r) => r.metrics?.totalMs)),
      medianFirstContentMs: median(
        passed.map((r) => r.metrics?.firstContentMs),
      ),
      medianPlanMs: median(passed.map((r) => r.metrics?.planMs)),
      medianJevCalls: median(passed.map((r) => r.metrics?.jevCalls)),
      reportedJevCostUsd: runs.reduce(
        (s, r) => s + (r.metrics?.jevCostUsd ?? 0),
        0,
      ),
      completeJevCostReports: `${runs.filter((r) => r.metrics?.jevCostComplete).length}/${runs.length}`,
      repairedRuns: runs.filter((r) => r.metrics?.repairs > 0).length,
      reportedTextCostUsd: Number(
        runs
          .reduce((sum, r) => sum + (r.metrics?.textUsage?.costUsd ?? 0), 0)
          .toFixed(5),
      ),
      completeCostReports: `${runs.filter((r) => r.metrics?.textUsage?.costComplete).length}/${runs.length}`,
      cachedInputTokens: runs.reduce(
        (sum, r) => sum + (r.metrics?.textUsage?.cachedTokens ?? 0),
        0,
      ),
    };
  }),
);
console.log(
  `Screens and timings saved to ${output}. Reported text cost excludes Jev and may omit interrupted calls; check completeCostReports. Compare relevance, spacing, hierarchy and interactions separately; validity is not design quality.`,
);
