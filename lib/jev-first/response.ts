import { composeJevFirst, openRouterEvaluator } from './compose';
import { GENERATION_REVISION } from '../tree/limits';
import type { UIDocument } from '../tree/spec';
export function jevFirstResponse(
  request: Request,
  key: string,
  options: {
    prompt: string;
    device: UIDocument['device'];
    previous?: UIDocument;
    variation: boolean;
  },
) {
  const abort = new AbortController();
  const signal = AbortSignal.any([
    request.signal,
    abort.signal,
    AbortSignal.timeout(40000),
  ]);
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: object) => {
          if (!abort.signal.aborted)
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ ...event, revision: GENERATION_REVISION }) +
                  '\n',
              ),
            );
        };
        try {
          for await (const event of composeJevFirst({
            ...options,
            signal,
            evaluate: openRouterEvaluator(key),
          }))
            send(event);
        } catch (error) {
          send({
            type: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Jev could not finish this composition.',
          });
        } finally {
          if (!abort.signal.aborted) controller.close();
        }
      },
      cancel() {
        abort.abort();
      },
    }),
    {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
      },
    },
  );
}
