import { composeJevFirst } from '@/lib/jev-first/compose';
import { TreeRenderer } from '@/components/tree-renderer';
import type { UIDocument } from '@/lib/tree/spec';
export default async function JevFirstQA() {
  const fixtures: Array<{
    title: string;
    prompt: string;
    device: UIDocument['device'];
    ids: string[];
  }> = [
    {
      title: 'Stay discovery',
      prompt: 'airbnb homepage feed',
      device: 'desktop',
      ids: [
        'stay_search',
        'stay_categories',
        'stay_coast',
        'stay_cabin',
        'stay_city',
        'stay_lake',
        'stay_desert',
        'stay_garden',
      ],
    },
    {
      title: 'Supplied profile',
      prompt:
        'Create a profile\nName: Rahul\nRole: Designer\nINR balance: 42500\nUSD balance: 1800',
      device: 'mobile',
      ids: ['identity', 'wallet_in', 'wallet_us'],
    },
    {
      title: 'Custom form',
      prompt:
        'Create a project form\n```json\n{"title":"Project intake","fields":[{"label":"Project name","value":"Mint"},{"label":"Priority","type":"select","options":["Low","High"],"value":"High"},{"label":"Brief","type":"textarea"}]}\n```',
      device: 'desktop',
      ids: ['save'],
    },
  ];
  const docs: UIDocument[] = [];
  for (const f of fixtures)
    for await (const event of composeJevFirst({
      prompt: f.prompt,
      device: f.device,
      signal: new AbortController().signal,
      evaluate: async (questions) => ({
        answers: Object.fromEntries(
          Object.entries(questions).map(([key, q]) => {
            if (q.type !== 'choice') throw new Error('Expected finite choices');
            let selected = Object.keys(q.criteria)[0];
            if (key === 'supported') selected = 'yes';
            if (key === 'title')
              selected = f.title === 'Stay discovery' ? 'stays' : 'profile';
            if (key === 'layout') selected = 'stacked';
            if (key.startsWith('use_'))
              selected =
                f.ids.find((id) => Object.hasOwn(q.criteria, id)) ?? 'omit';
            return [key, { type: 'choice', choice: selected }];
          }),
        ),
      }),
    }))
      if (event.type === 'complete') docs.push(event.document);
  return (
    <main className="p-6">
      <h1 className="text-xl">Jev-first component QA</h1>
      <p className="my-3">
        Deterministic decisions, real compiler and renderer. No API calls.
      </p>
      {docs.map((doc, i) => (
        <section key={fixtures[i].title} className="mb-12">
          <h2 className="mb-3">{fixtures[i].title}</h2>
          <div
            style={{
              width: doc.device === 'mobile' ? 390 : 1440,
              maxWidth: '100%',
              border: '1px solid var(--border)',
            }}
          >
            <TreeRenderer document={doc} />
          </div>
        </section>
      ))}
    </main>
  );
}
