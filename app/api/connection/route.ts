import { GENERATION_REVISION } from '@/lib/tree/limits';
export async function GET() {
  return Response.json(
    {
      configured: Boolean(process.env.OPENROUTER_API_KEY),
      revision: GENERATION_REVISION,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
