import { localOpenRouterKey } from '@/lib/server/openrouter-key';
import { GENERATION_REVISION } from '@/lib/tree/limits';
export async function GET() {
  return Response.json(
    {
      configured: Boolean(localOpenRouterKey()),
      revision: GENERATION_REVISION,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
