import { workflows, workflowKinds, stageForPrompt } from '../fintech/workflows';
import type { Candidate } from './candidates';
import { validateDocument, type UIDocument, type UINode } from '../tree/spec';

/** Bounded, reusable financial UI groups. All figures are illustrative, never live quotes. */
export function financeCandidates(
  prompt: string,
  previous?: UIDocument,
): Candidate[] {
  const website =
    /\bportfolio\s+(website|site)|\b(personal|designer|developer|creative)\s+portfolio\b/i.test(
      prompt,
    );
  const stock = /\b(stocks?|shares?|equity|equities|instrument)\b/i.test(
    prompt,
  );
  const domains = [
    ['card', /\b(cards?|freeze|spending limit)\b/i, 'Cards'],
    ['fund', /\b(mutual fund|sip|fund detail)\b/i, 'Mutual funds'],
    [
      'bank',
      /\b(banking|bank account|wallet|money transfer|transfer|send money|deposit|add money|top.up|upi|remittance)\b/i,
      'Accounts and transfers',
    ],
    [
      'credit',
      /\b(loan|emi|mortgage|credit card|repayment)\b/i,
      'Credit and repayments',
    ],
    ['budget', /\b(budget|expenses?|spending)\b/i, 'Spending overview'],
    [
      'merchant',
      /\b(invoice|settlements?|merchant|receivables)\b/i,
      'Payments and settlements',
    ],
    ['crypto', /\b(crypto|bitcoin|ethereum)\b/i, 'Digital assets'],
    ['insurance', /\b(insurance|policy renewal|claims)\b/i, 'Insurance'],
    ['kyc', /\b(kyc|identity verification)\b/i, 'Identity verification'],
  ] as const;
  const match = domains.find(([, expression]) => expression.test(prompt));
  const retained = previous?.nodes
    .find((n) => /^jf_fin_[a-z]+_intro$/.test(n.id))
    ?.id.split('_')[2];
  const domain = website
    ? 'website'
    : stock
      ? 'stock'
      : (match?.[0] ?? retained);
  if (!domain) return [];
  const title =
    domain === 'website'
      ? 'Creative portfolio'
      : domain === 'stock'
        ? 'Stock overview'
        : (domains.find((d) => d[0] === domain)?.[2] ?? 'Financial workspace');
  const out: Candidate[] = [];
  type Child = [string, UINode['kind'], UINode['props']];
  function add(
    key: string,
    kind: UINode['kind'],
    props: UINode['props'],
    children: Child[] = [],
    required = false,
  ) {
    const id = `fin_${domain}_${key}`,
      root = `jf_${id}`;
    let nodes: UINode[] = [
      { id: root, parent: 'jf_page', kind, props },
      ...children.map(([suffix, kind, props]) => ({
        id: `${root}_${suffix}`,
        parent: root,
        kind,
        props,
      })),
    ];
    if (previous?.nodes.some((n) => n.id === root)) {
      const owned = new Set([root]);
      for (let changed = true; changed;) {
        changed = false;
        for (const n of previous.nodes)
          if (n.parent && owned.has(n.parent) && !owned.has(n.id)) {
            owned.add(n.id);
            changed = true;
          }
      }
      nodes = structuredClone(
        previous.nodes.filter((n) => owned.has(n.id)),
      ).map((n) => (n.id === root ? { ...n, parent: 'jf_page' } : n));
    }
    validateDocument({
      version: 1,
      title,
      device: 'desktop',
      theme: 'light',
      nodes: [
        { id: 'jf_page', parent: null, kind: 'page', props: {} },
        {
          id: 'jf_heading',
          parent: 'jf_page',
          kind: 'heading',
          props: { text: title, level: 1 },
        },
        ...nodes,
      ],
    });
    out.push({
      id,
      description: `${title}: ${key}. ${JSON.stringify(props)}. Sample content; prototype interactions only.`,
      required,
      wide: true,
      nodes,
    });
  }
  const text = (key: string, value: string): Child => [
    key,
    'text',
    { text: value },
  ];
  const button = (key: string, label: string): Child => [
    key,
    'button',
    {
      label,
      action: 'notify',
      message: `${label}: prototype only. No transaction was submitted.`,
    },
  ];
  const input = (key: string, label: string): Child => [
    key,
    'input',
    { label, bind: `fin_${domain}_${key}` },
  ];
  const table = (
    key: string,
    title: string,
    columns: string[],
    rows: string[][],
    required = false,
  ) => add(key, 'table', { title, columns, rows }, [], required);
  const chart = (name: string) =>
    add(
      'chart',
      'finance-chart',
      {
        title: name,
        style: 'line',
        series: [
          { label: 'Mon', value: 1480 },
          { label: 'Tue', value: 1505 },
          { label: 'Wed', value: 1492 },
          { label: 'Thu', value: 1520 },
          { label: 'Fri', value: 1538 },
        ],
      },
      [],
      domain === 'stock',
    );
  if (domain === 'website') {
    add(
      'intro',
      'panel',
      {
        title: 'Alex Morgan',
        description: 'Product designer & creative developer',
        gap: 12,
      },
      [
        text(
          'bio',
          'I design thoughtful digital experiences for people and businesses.',
        ),
      ],
      true,
    );
    add(
      'projects',
      'panel',
      { title: 'Selected work', gap: 12 },
      [
        text('one', '01 · Everyday Banking — A simpler way to manage money.'),
        text(
          'two',
          '02 · Studio Notes — A collaborative space for creative teams.',
        ),
        text(
          'three',
          '03 · Fieldwork — A discovery experience for local adventures.',
        ),
      ],
      true,
    );
    add('about', 'panel', { title: 'About', gap: 12 }, [
      text(
        'bio',
        'Independent designer working across research, interaction design and frontend development.',
      ),
    ]);
    add('skills', 'panel', { title: 'Expertise', gap: 12 }, [
      text(
        'skills',
        'Product strategy · UX research · Design systems · Prototyping',
      ),
    ]);
    add('contact', 'panel', { title: 'Let’s work together', gap: 12 }, [
      input('email', 'Your email'),
      input('message', 'Project details'),
      button('send', 'Send enquiry'),
    ]);
    return out;
  }
  add(
    'intro',
    'panel',
    {
      title: domain === 'stock' ? 'NOVA · Sample equity' : title,
      description: 'Illustrative sample data',
      gap: 12,
    },
    [
      text(
        'context',
        domain === 'stock'
          ? 'NSE · Equity · Market overview'
          : 'Manage your financial activity in one place.',
      ),
    ],
    true,
  );
  if (domain === 'stock' || domain === 'crypto') {
    add(
      'quote',
      'metric',
      {
        label: domain === 'stock' ? 'Share price' : 'Asset price',
        value: '₹1,538.00',
        detail: '+₹18.00 (1.18%) · Sample quote',
      },
      [],
      true,
    );
    chart('Price history');
    add(
      'holdings',
      'panel',
      { title: 'Your holdings', gap: 8 },
      [
        text('value', '₹18,456.00 · Current value'),
        text('quantity', '12 shares · Average cost ₹1,450.00'),
        text('return', '+₹1,056.00 · Total return'),
      ],
      /holdings/i.test(prompt),
    );
    table(
      'performance',
      'Performance',
      ['Measure', 'Value'],
      [
        ['Open', '₹1,520.00'],
        ['Day high', '₹1,552.00'],
        ['Day low', '₹1,508.00'],
        ['52-week high', '₹1,780.00'],
        ['Volume', '1.24M'],
      ],
      /performance/i.test(prompt),
    );
    table(
      'depth',
      'Market depth',
      ['Bid qty', 'Bid', 'Ask', 'Ask qty'],
      [
        ['120', '1,537.50', '1,538.00', '85'],
        ['240', '1,537.00', '1,538.50', '160'],
        ['310', '1,536.50', '1,539.00', '205'],
      ],
      /depth/i.test(prompt),
    );
    table(
      'orders',
      'Open orders',
      ['Side', 'Quantity', 'Price', 'Status'],
      [['Buy', '5', '₹1,525.00', 'Limit · Pending']],
    );

    add(
      'dock',
      'mint-action-dock',
      { helper: 'Demo trading · No real orders' },
      [
        button('buy', 'Buy'),
        [
          'sell',
          'button',
          {
            label: 'Sell',
            variant: 'destructive',
            action: 'notify',
            message: 'Sell: prototype only. No order was submitted.',
          },
        ],
      ],
      true,
    );
  } else if (domain === 'fund') {
    add(
      'value',
      'metric',
      {
        label: 'Sample index fund',
        value: '₹125.40',
        detail: 'NAV · Illustrative data',
      },
      [],
      true,
    );
    chart('Fund performance');
    table(
      'allocation',
      'Asset allocation',
      ['Asset', 'Allocation'],
      [
        ['Equities', '90%'],
        ['Cash', '10%'],
      ],
    );
  } else if (domain === 'card') {
    add(
      'balance',
      'metric',
      {
        label: 'Everyday card •• 4242',
        value: '₹18,200',
        detail: 'Available to spend · Sample data',
      },
      [],
      true,
    );
    table(
      'transactions',
      'Card transactions',
      ['Merchant', 'Amount', 'Status'],
      [
        ['Coffee House', '₹240', 'Settled'],
        ['Metro', '₹80', 'Pending'],
      ],
      true,
    );
  } else if (domain === 'bank') {
    add(
      'balance',
      'metric',
      {
        label: 'Available balance',
        value: '₹84,250',
        detail: 'Sample savings account · •• 2048',
      },
      [],
      true,
    );
    table(
      'transactions',
      'Recent transactions',
      ['Description', 'Date', 'Amount'],
      [
        ['Salary', '20 Sep', '+₹75,000'],
        ['Groceries', '19 Sep', '−₹2,450'],
      ],
      true,
    );
  } else if (domain === 'credit') {
    add(
      'balance',
      'metric',
      {
        label: 'Outstanding balance',
        value: '₹2,40,000',
        detail: 'Next payment ₹12,500 · 5 October',
      },
      [],
      true,
    );
    table(
      'schedule',
      'Repayment schedule',
      ['Due date', 'Principal', 'Interest', 'Status'],
      [
        ['5 Oct', '₹10,200', '₹2,300', 'Upcoming'],
        ['5 Nov', '₹10,300', '₹2,200', 'Scheduled'],
      ],
      true,
    );
  } else if (domain === 'budget') {
    add(
      'spent',
      'metric',
      {
        label: 'Monthly spending',
        value: '₹32,450',
        detail: '₹17,550 remaining of ₹50,000 budget',
      },
      [],
      true,
    );
    table(
      'categories',
      'Spending by category',
      ['Category', 'Spent', 'Budget'],
      [
        ['Food', '₹8,450', '₹10,000'],
        ['Transport', '₹4,000', '₹5,000'],
        ['Housing', '₹20,000', '₹25,000'],
      ],
      true,
    );
  } else if (domain === 'merchant') {
    add(
      'balance',
      'metric',
      {
        label: 'Pending settlement',
        value: '₹1,24,800',
        detail: 'Expected 22 September',
      },
      [],
      true,
    );
    table(
      'invoices',
      'Invoices and payments',
      ['Invoice', 'Customer', 'Amount', 'Status'],
      [
        ['INV-1042', 'Acme Studio', '₹24,000', 'Paid'],
        ['INV-1043', 'Northstar', '₹18,500', 'Due'],
      ],
      true,
    );
  } else if (domain === 'insurance') {
    table(
      'policies',
      'Your policies',
      ['Policy', 'Coverage', 'Renewal'],
      [
        ['Sample health plan', '₹10,00,000', '15 Dec'],
        ['Sample vehicle plan', 'Comprehensive', '30 Nov'],
      ],
      true,
    );
  }
  // Replace disconnected notify-only forms with compiler-owned interactive workflows.
  const relevant = workflowKinds.filter((kind) =>
    workflows[kind].domains.includes(domain),
  );
  const explicit = relevant.filter((kind) =>
    workflows[kind].match.test(prompt),
  );
  const active = explicit.length ? explicit : relevant.slice(0, 1);
  const stage = stageForPrompt(prompt);
  const outcome = /pending|processing/i.test(prompt)
    ? 'pending'
    : /fail|error/i.test(prompt)
      ? 'failed'
      : 'success';
  for (const workflow of active) {
    if (workflow === 'trade') {
      for (const side of ['Buy', 'Sell'] as const) {
        const suffix = side.toLowerCase();
        add(
          `${suffix}dialog`,
          'dialog',
          {
            title: `${side} order`,
            description: 'Simulated order · No real transaction',
          },
          [
            [
              'flow',
              'finance-flow',
              {
                workflow,
                side,
                initialStage: stage === 'details' ? 'input' : stage,
                outcome,
                currency: 'INR',
                density: 'compact',
              },
            ],
          ],
          true,
        );
        const dock = out.find((c) => c.id.endsWith('_dock'));
        const button = dock?.nodes.find((n) => n.props.label === side);
        if (button)
          button.props = {
            label: side,
            variant: side === 'Sell' ? 'destructive' : 'default',
            action: 'toggle',
            target: `jf_fin_${domain}_${suffix}dialog`,
          };
      }
      // A requested state or ticket is visible without having to open the dock.
      if (stage !== 'details' || /ticket|order entry/i.test(prompt))
        add(
          `workflow-${workflow}`,
          'finance-flow',
          {
            workflow,
            initialStage: stage === 'details' ? 'input' : stage,
            outcome,
            currency: 'INR',
            density: 'compact',
          },
          [],
          true,
        );
    } else
      add(
        `workflow-${workflow}`,
        'finance-flow',
        {
          workflow,
          initialStage: stage,
          outcome,
          currency: 'INR',
          density: 'compact',
        },
        [],
        true,
      );
  }
  if (domain === 'kyc')
    table(
      'checklist',
      'Verification checklist',
      ['Step', 'Status'],
      [
        ['Personal details', 'Required'],
        ['Identity document', 'Demo selection only'],
        ['Review', 'Before submission'],
      ],
      true,
    );
  return out;
}
