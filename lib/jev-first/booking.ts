import type { Candidate } from './candidates';
import { validateDocument, type UIDocument, type UINode } from '../tree/spec';
const domains = [
  {
    id: 'flight',
    match: /\b(flights?|airline|airfare|airplane)\b/i,
    title: 'Flights',
    from: 'Departure airport',
    to: 'Arrival airport',
    options: [
      'Morning · 06:30–08:45 · Nonstop · ₹5,200',
      'Afternoon · 13:10–15:30 · Nonstop · ₹6,400',
      'Evening · 18:00–21:10 · 1 stop · ₹4,800',
    ],
    extras: ['Cabin bag', 'Checked bag', 'Extra legroom'],
  },
  {
    id: 'train',
    match: /\b(trains?|railway|rail booking)\b/i,
    title: 'Trains',
    from: 'Departure station',
    to: 'Arrival station',
    options: [
      'Express · 06:00–11:30 · Chair car · ₹850',
      'Intercity · 10:30–17:00 · AC chair · ₹1,200',
      'Sleeper · 22:00–06:30 next day · ₹1,600',
    ],
    extras: ['Window seat', 'Lower berth', 'Meal'],
  },
  {
    id: 'bus',
    match: /\b(bus|buses|coach booking)\b/i,
    title: 'Buses',
    from: 'Boarding city',
    to: 'Destination city',
    options: [
      'Morning coach · 07:00–13:00 · AC seat · ₹700',
      'Express coach · 14:00–19:30 · AC seat · ₹950',
      'Night coach · 22:00–05:00 next day · Sleeper · ₹1,100',
    ],
    extras: ['Window seat', 'Front section', 'Extra luggage'],
  },
  {
    id: 'car',
    match: /\b(car rental|rent a car|rental car)\b/i,
    title: 'Car rental',
    from: 'Pickup location',
    to: 'Drop-off location',
    options: [
      'Compact · Automatic · 4 seats · ₹1,800/day',
      'Sedan · Automatic · 5 seats · ₹2,400/day',
      'SUV · Automatic · 7 seats · ₹3,500/day',
    ],
    extras: ['Child seat', 'Additional driver', 'Navigation'],
  },
  {
    id: 'restaurant',
    match:
      /\b(restaurant|dining|table)\s+(booking|reservation)|\breserve a table\b/i,
    title: 'Table reservations',
    from: 'City or area',
    options: [
      'Garden table · 18:30',
      'Window table · 19:00',
      'Indoor table · 20:00',
    ],
    extras: ['Outdoor seating', 'High chair', 'Step-free access'],
  },
  {
    id: 'event',
    match: /\b(event|concert|cinema|movie)\s+(booking|tickets?)\b/i,
    title: 'Event tickets',
    from: 'City or venue',
    options: [
      'Standard admission · ₹800',
      'Reserved seating · ₹1,400',
      'Premium seating · ₹2,200',
    ],
    extras: ['Accessible seating', 'Parking pass', 'Group seating'],
  },
  {
    id: 'appointment',
    match:
      /\b(doctor|clinic|salon|spa|service)\s+(appointment|booking)|\bbook (a )?(doctor|appointment)\b/i,
    title: 'Appointments',
    from: 'Location',
    options: ['Morning · 09:30', 'Afternoon · 14:00', 'Evening · 17:30'],
    extras: ['First visit', 'Follow-up', 'Accessible room'],
  },
] as const;
export function bookingCandidates(
  prompt: string,
  previous?: UIDocument,
): Candidate[] {
  const domain =
    domains.find((d) => d.match.test(prompt)) ??
    (previous
      ? domains.find((d) =>
          previous.nodes.some((n) => n.id === `jf_booking_${d.id}_search`),
        )
      : undefined);
  if (!domain) return [];
  const prefix = `booking_${domain.id}`;
  const results: Candidate[] = [];
  const add = (
    suffix: string,
    title: string,
    description: string,
    children: Array<[string, UINode['kind'], UINode['props']]>,
    required = false,
  ) => {
    const id = `${prefix}_${suffix}`,
      root = `jf_${id}`;
    let nodes: UINode[] = [
      {
        id: root,
        parent: 'jf_page',
        kind: 'panel',
        props: { title, gap: 12, surface: 'plain' },
      },
      ...children.map(([key, kind, props]) => ({
        id: `${root}_${key}`,
        parent: root,
        kind,
        props,
      })),
    ];
    if (suffix === 'search') {
      nodes[0].props.title = 'Search details';
      const fields = `${root}_fields`;
      nodes = [
        nodes[0],
        {
          id: fields,
          parent: root,
          kind: 'grid',
          props: { columns: 2, gap: 12 },
        },
        ...nodes.slice(1).map((n) => ({ ...n, parent: fields })),
      ];
    }
    if (previous?.nodes.some((n) => n.id === root)) {
      const owned = new Set([root]);
      let count = 0;
      while (count !== owned.size) {
        count = owned.size;
        for (const n of previous.nodes)
          if (n.parent && owned.has(n.parent)) owned.add(n.id);
      }
      nodes = structuredClone(
        previous.nodes.filter((n) => owned.has(n.id)),
      ).map((n) => (n.id === root ? { ...n, parent: 'jf_page' } : n));
    }
    validateDocument({
      version: 1,
      title: domain.title,
      device: 'desktop',
      theme: 'light',
      nodes: [
        { id: 'jf_page', parent: null, kind: 'page', props: {} },
        {
          id: 'jf_booking_heading',
          parent: 'jf_page',
          kind: 'heading',
          props: { text: domain.title, level: 1 },
        },
        ...nodes,
      ],
    });
    results.push({ id, description, required, nodes });
  };
  const route: Array<[string, UINode['kind'], UINode['props']]> = [
    [
      'from',
      'input',
      { label: domain.from, bind: `${prefix}_from`, placeholder: domain.from },
    ],
  ];
  if ('to' in domain)
    route.push([
      'to',
      'input',
      { label: domain.to, bind: `${prefix}_to`, placeholder: domain.to },
    ]);
  route.push(
    [
      'date',
      'date-picker',
      {
        label: domain.id === 'car' ? 'Pickup date' : 'Date',
        bind: `${prefix}_date`,
      },
    ],
    [
      'people',
      'select',
      {
        label: domain.id === 'car' ? 'Drivers' : 'People',
        bind: `${prefix}_people`,
        options: ['1', '2', '3', '4'],
        value: '1',
      },
    ],
  );
  if (domain.id === 'flight')
    route.unshift([
      'trip',
      'radio',
      {
        label: 'Trip type',
        bind: `${prefix}_trip`,
        options: ['One way', 'Round trip'],
        value: 'One way',
      },
    ]);
  if (domain.id === 'flight' || domain.id === 'car')
    route.push([
      'return',
      'date-picker',
      {
        label: domain.id === 'car' ? 'Return date' : 'Return date (round trip)',
        bind: `${prefix}_return`,
      },
    ]);
  add(
    'search',
    domain.title,
    'Core reservation criteria: editable locations, dates and party size. Sample inventory, no live search.',
    route,
    true,
  );
  add(
    'results',
    'Choose an option',
    'Core selectable sample inventory with schedule and price where applicable. Keep after reservation criteria.',
    [
      [
        'note',
        'text',
        { text: 'Sample options · not live availability', tone: 'secondary' },
      ],
      [
        'options',
        'radio',
        {
          label: domain.title,
          bind: `${prefix}_selection`,
          options: [...domain.options],
          value: domain.options[0],
        },
      ],
      [
        'continue',
        'button',
        {
          label: 'Continue',
          action: 'notify',
          message:
            'Selection saved in this prototype. No reservation or payment was made.',
        },
      ],
    ],
    true,
  );
  add(
    'details',
    domain.id === 'car' ? 'Driver details' : 'Guest details',
    'Optional contact details for checkout and booking confirmation screens, not needed for search-only pages.',
    [
      ['name', 'input', { label: 'Full name', bind: `${prefix}_name` }],
      ['email', 'input', { label: 'Email', bind: `${prefix}_email` }],
    ],
  );
  add(
    'extras',
    'Preferences',
    'Optional reservation preferences; local selections only, no automatic pricing changes.',
    domain.extras.map((label, i) => [
      String(i),
      'checkbox',
      { label, bind: `${prefix}_extra_${i}`, checked: false },
    ]),
  );
  if (domain.id === 'flight')
    add(
      'fare',
      'Fare options',
      'Fare comparison for flight checkout. Show with results when fare or baggage options are requested.',
      [
        [
          'fare',
          'radio',
          {
            label: 'Fare type',
            bind: `${prefix}_fare`,
            options: [
              'Basic · cabin bag',
              'Standard · cabin + checked bag',
              'Flexible · changes permitted',
            ],
            value: 'Basic · cabin bag',
          },
        ],
      ],
    );
  return results;
}
