import { resolveOpenRouterKey } from '@/lib/server/openrouter-key';
import { jevFirstResponse } from '@/lib/jev-first/response';
import { systemMessage, textModelOptions } from '@/lib/tree/models';
import { summarizeTextUsage } from '@/lib/tree/usage';
import { GENERATION_REVISION } from '@/lib/tree/limits';
import {
  validateDocument,
  qualityIssues,
  type UIDocument,
} from '@/lib/tree/spec';
import { chatText, DocumentStream, UIValidationError } from '@/lib/tree/stream';
import {
  treeSystemPrompt,
  DEFAULT_TEXT_MODEL,
  EXTENDED_COMPOSITION_RULES,
} from '@/lib/tree/prompt';
import { ENDPOINT, MODEL } from '@/lib/decisions';
import { explicitDevice } from '@/lib/mint';
import { constrainLayout } from '@/lib/tree/layout-review';
import {
  planQuestions,
  previousArrangement,
  parsePlan,
  planNodes,
  type JevPlan,
} from '@/lib/tree/jev-plan';
import { compositionReferences } from '@/lib/tree/references';
const headers = { 'Cache-Control': 'no-store' };
export async function POST(request: Request) {
  if (
    request.headers.get('origin') &&
    request.headers.get('origin') !== new URL(request.url).origin
  )
    return Response.json(
      { error: 'Origin not allowed.' },
      { status: 403, headers },
    );
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 180_000)
      return Response.json(
        { error: 'Request too large.' },
        { status: 413, headers },
      );
    body = JSON.parse(raw);
  } catch {
    return Response.json(
      { error: 'Invalid request.' },
      { status: 400, headers },
    );
  }
  if (
    !body ||
    typeof body !== 'object' ||
    typeof body.prompt !== 'string' ||
    !body.prompt.trim() ||
    body.prompt.length > 2000
  )
    return Response.json(
      { error: 'Use a prompt between 1 and 2,000 characters.' },
      { status: 400, headers },
    );
  const key = resolveOpenRouterKey(body.apiKey, body.keySource);
  if (!key)
    return Response.json(
      { error: 'Connect OpenRouter to generate a UI.' },
      { status: 401, headers },
    );
  if (key.length > 512 || /[\r\n]/.test(key))
    return Response.json(
      { error: 'Invalid API key.' },
      { status: 400, headers },
    );
  const engine = body.engine ?? 'hybrid';
  if (!['hybrid', 'llm', 'jev-first'].includes(engine))
    return Response.json(
      { error: 'Unknown composition engine.' },
      { status: 400, headers },
    );
  if (body.autoRepair !== undefined && typeof body.autoRepair !== 'boolean')
    return Response.json(
      { error: 'autoRepair must be a boolean.' },
      { status: 400, headers },
    );
  const autoRepair = body.autoRepair !== false;
  const model = body.model ?? DEFAULT_TEXT_MODEL;
  if (
    engine !== 'jev-first' &&
    (typeof model !== 'string' ||
      !/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._:-]+$/.test(model) ||
      /jev/i.test(model))
  )
    return Response.json(
      { error: 'Choose a text generation model for the adaptive engine.' },
      { status: 400, headers },
    );
  let previous: UIDocument | undefined;
  try {
    if (body.previous) previous = validateDocument(body.previous);
  } catch {
    return Response.json(
      { error: 'Invalid previous UI document.' },
      { status: 400, headers },
    );
  }
  const device =
    explicitDevice(body.prompt) ??
    (['mobile', 'tablet', 'desktop'].includes(body.device)
      ? body.device
      : (previous?.device ?? 'desktop'));
  if (engine === 'jev-first')
    return jevFirstResponse(request, key, {
      prompt: body.prompt,
      device,
      previous,
      variation: body.mode === 'variation',
    });
  const abort = new AbortController();
  const signal = AbortSignal.any([
    request.signal,
    abort.signal,
    AbortSignal.timeout(120000),
  ]);
  const started = performance.now();
  let firstContentMs: number | null = null;
  let textMs = 0;
  const reviewMs = 0;
  let planMs = 0;
  let repairs = 0;
  let textAttempts = 0;
  const usageReports: unknown[] = [];
  let phase: 'planning' | 'content' =
    engine === 'hybrid' ? 'planning' : 'content';
  const metrics = () => ({
    firstContentMs,
    textMs,
    reviewMs,
    planMs,
    repairs,
    textUsage: summarizeTextUsage(usageReports, textAttempts),
    totalMs: Math.round(performance.now() - started),
  });
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: unknown) => {
        if (!abort.signal.aborted)
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                ...(event as object),
                revision: GENERATION_REVISION,
              }) + '\n',
            ),
          );
      };
      try {
        let plan: JevPlan | undefined;
        const references = compositionReferences(body.prompt);
        const previousShape = previousArrangement(previous);
        const lockedLayout =
          /\b(single.column|one.column|two.column|2.column|sidebar on the (left|right)|main content on the (left|right))\b/i.test(
            body.prompt,
          );
        const recent = Array.isArray(body.recentArrangements)
          ? body.recentArrangements
              .filter((v: unknown): v is string => typeof v === 'string')
              .slice(-3)
          : [];
        const excluded =
          body.mode === 'variation' && !lockedLayout
            ? [...recent, ...(previousShape ? [previousShape] : [])]
            : [];
        const questions = planQuestions(device, excluded);
        if (engine === 'hybrid') {
          send({ type: 'status', message: 'Jev is composing your interface' });
          const planningStarted = performance.now();
          const planned = await fetch(ENDPOINT, {
            method: 'POST',
            signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]),
            headers: {
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
              'X-Title': 'Jeverative',
            },
            body: JSON.stringify({
              model: MODEL,
              questions,
              state: {
                prompt: body.prompt,
                device,
                mode: body.mode,
                references,
                excludedArrangements: excluded,
                previousLayout: previous?.nodes
                  .filter((n) => ['page', 'grid', 'panel'].includes(n.kind))
                  .map((n) => ({
                    id: n.id,
                    parent: n.parent,
                    kind: n.kind,
                    props: n.props,
                  })),
              },
            }),
          });
          if (!planned.ok)
            throw new Error(
              planned.status === 401
                ? 'OpenRouter rejected this key.'
                : 'Jev composition is unavailable. Your previous screen is preserved.',
            );
          plan = parsePlan(
            ((await planned.json()) as { answers?: unknown }).answers,
            device,
            questions,
          );
          planMs = Math.round(performance.now() - planningStarted);
          send({ type: 'plan', plan, planMs });
        }
        const scaffold = plan ? planNodes(plan, device) : [];
        phase = 'content';
        const textStarted = performance.now();
        send({ type: 'status', message: 'Building your interface' });
        let document: UIDocument | undefined;
        const normalizations: string[] = [];
        let repairDocument: UIDocument | undefined;
        let correction: { role: string; content: string }[] = [];
        // One bounded repair using validation feedback; never accept invalid nodes.
        for (let attempt = 0; attempt < 2; attempt++) {
          let generated = '';
          const usageIndex = textAttempts++;
          const repairInstruction =
            attempt > 0
              ? '\nTARGETED REPAIR overrides initial creation. Current accepted document already exists. Emit only changed/replacement nodes, new missing nodes, or remove events. Never rebuild unaffected nodes or modify Jev scaffold. End with done.'
              : '';
          const response = await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              method: 'POST',
              signal,
              headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
                'X-Title': 'Jeverative',
              },
              body: JSON.stringify({
                model,
                ...textModelOptions(model),
                stream: true,
                temperature: 0.65,
                max_tokens: 12000,
                messages: [
                  systemMessage(
                    model,
                    treeSystemPrompt(Boolean(plan)) +
                      EXTENDED_COMPOSITION_RULES,
                  ),
                  {
                    role: 'user',
                    content: JSON.stringify({
                      prompt: body.prompt,
                      device,
                      mode:
                        body.mode === 'variation'
                          ? 'new spatial variation'
                          : 'edit or create',
                      previous: attempt === 0 ? previous : undefined,
                      repairInstruction: repairInstruction || undefined,
                      plan,
                      scaffold,
                      references,
                      variationInstruction:
                        body.mode === 'variation'
                          ? 'Recompose the task into the selected arrangement. Change grouping, hierarchy and content placement, not merely names or colors. Preserve requested facts and required controls.'
                          : undefined,
                    }),
                  },
                  ...correction,
                ],
              }),
            },
          );
          if (!response.ok || !response.body)
            throw new Error(
              response.status === 401
                ? 'OpenRouter rejected this key.'
                : response.status === 402
                  ? 'Your OpenRouter account needs credits.'
                  : `Text generation is unavailable (${response.status}).`,
            );
          const parser = new DocumentStream(
            scaffold,
            {
              title: previous?.title ?? 'Generated interface',
              device,
              theme: /\bdark\b/i.test(body.prompt)
                ? 'dark'
                : /\blight\b/i.test(body.prompt)
                  ? 'light'
                  : (previous?.theme ?? 'light'),
            },
            repairDocument,
          );
          try {
            for await (const chunk of chatText(response.body, (usage) => {
              usageReports[usageIndex] = usage;
            })) {
              generated += chunk;
              for (const preview of parser.push(chunk)) {
                if (
                  firstContentMs === null &&
                  preview.nodes.some(
                    (n) =>
                      ![
                        'page',
                        'stack',
                        'grid',
                        'panel',
                        'form',
                        'dialog',
                        'accordion',
                      ].includes(n.kind),
                  )
                )
                  firstContentMs = Math.round(performance.now() - started);
                send({ type: 'preview', document: { ...preview, device } });
              }
            }
            document = { ...parser.finish(), device };
            normalizations.push(...parser.adjustments);
            break;
          } catch (error) {
            // push() can accept several nodes before a later event in that same
            // provider chunk fails. Publish that safe prefix rather than lose it.
            if (error instanceof UIValidationError && parser.document)
              send({
                type: 'preview',
                document: { ...parser.document, device },
              });
            if (
              !autoRepair ||
              !(error instanceof UIValidationError) ||
              attempt === 1 ||
              signal.aborted
            )
              throw error;
            repairs++;
            repairDocument = parser.document ?? undefined;
            normalizations.push(...parser.adjustments);
            correction = [
              { role: 'assistant', content: generated.slice(-12_000) },
              {
                role: 'user',
                content: `Targeted repair required: ${error.message}. Current accepted document: ${JSON.stringify(repairDocument)}. Preserve every unaffected node and its id. Return ONLY replacement nodes for the issue, missing nodes needed to finish the requested screen, and done. Use {"remove":"id"} only for an invalid subtree (descendants are removed too). Existing nodes are updated in place; new nodes require an existing parent. The original stream stopped at the error, so content after that point may still need to be added. Do not emit metadata or regenerate the complete screen.`,
              },
            ];
            send({
              type: 'status',
              message: 'Fixing affected components',
              reason: error.message.slice(0, 180),
              targetedRepair: true,
            });
          }
        }
        if (!document)
          throw new UIValidationError('No complete UI was generated.');
        const doc: UIDocument = constrainLayout(document);
        const beforeReview = doc;
        textMs = Math.round(performance.now() - textStarted);
        const reviewStatus = 'skipped';
        const reviewChanges = 0;
        validateDocument(doc);
        send({
          type: 'complete',
          document: doc,
          beforeReview: engine === 'hybrid' ? beforeReview : undefined,
          model: plan ? `${model} + ${MODEL}` : model,
          plan,
          compositionVersion: 'jev-plan-v1',
          reviewStatus,
          reviewChanges,
          engine,
          metrics: metrics(),
          latency: Math.round(performance.now() - started),
          adjustments: [...normalizations, ...qualityIssues(doc)],
        });
      } catch (error) {
        if (!abort.signal.aborted)
          send({
            type: 'error',
            diagnostic:
              error instanceof UIValidationError ? error.diagnostic : undefined,
            engine,
            metrics: metrics(),
            message: signal.aborted
              ? 'Generation stopped. Your previous completed screen is preserved.'
              : error instanceof UIValidationError
                ? `${repairs ? 'Couldn’t validate the UI after correction' : 'UI validation stopped'}: ${error.message.slice(0, 180)} ${autoRepair ? '' : 'Auto-fix is off. '}Your previous completed screen is saved.`
                : error instanceof Error &&
                    /^(OpenRouter|Your OpenRouter|Text generation|Jev )/.test(
                      error.message,
                    )
                  ? error.message
                  : phase === 'planning'
                    ? 'Jev could not complete the composition plan. Your previous screen is preserved.'
                    : 'Content generation could not finish. Your previous completed screen is preserved.',
          });
      } finally {
        if (!abort.signal.aborted) controller.close();
      }
    },
    cancel() {
      abort.abort();
    },
  });
  return new Response(stream, {
    headers: {
      ...headers,
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
