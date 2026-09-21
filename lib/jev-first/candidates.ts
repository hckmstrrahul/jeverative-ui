import { validateDocument, type UIDocument, type UINode } from '../tree/spec';

export type Candidate = {
  id: string;
  required?: boolean;
  description: string;
  resource?: string;
  wide?: boolean;
  nodes: UINode[];
};
const node = (
  id: string,
  parent: string | null,
  kind: UINode['kind'],
  props: UINode['props'],
): UINode => ({ id, parent, kind, props });
/** Complete element contracts and small semantic groups, not page templates.
 * Sample content is platform-owned. No model-generated code, props or bindings.
 */
export function buildCandidates(
  prompt: string,
  previous?: UIDocument,
): Candidate[] {
  const out: Candidate[] = [];
  function add(
    id: string,
    description: string,
    kind: UINode['kind'],
    props: UINode['props'],
    children: Array<[string, UINode['kind'], UINode['props']]> = [],
    resource?: string,
    wide = false,
  ) {
    const root = `jf_${id}`;
    let nodes = [
      node(root, 'jf_page', kind, props),
      ...children.map(([key, type, values]) =>
        node(`${root}_${key}`, root, type, values),
      ),
    ];
    // Reuse the previously accepted candidate verbatim during edits/variations.
    if (previous?.nodes.some((n) => n.id === root)) {
      const owned = new Set([root]);
      let size = 0;
      while (size !== owned.size) {
        size = owned.size;
        for (const n of previous.nodes)
          if (n.parent && owned.has(n.parent)) owned.add(n.id);
      }
      const accepted = previous.nodes.filter((n) => owned.has(n.id));
      if (accepted.length)
        nodes = structuredClone(accepted).map((n) =>
          n.id === root ? { ...n, parent: 'jf_page' } : n,
        );
    }
    const candidate = { id, description, resource, wide, nodes };
    validateDocument({
      version: 1,
      title: 'Candidate check',
      device: 'desktop',
      theme: 'light',
      nodes: [
        node('jf_page', null, 'page', {}),
        node('jf_candidate_title', 'jf_page', 'heading', {
          text: 'Candidate',
          level: 1,
        }),
        ...nodes,
      ],
    });
    out.push(candidate);
  }
  const panel = (
    id: string,
    title: string,
    description: string,
    children: Array<[string, UINode['kind'], UINode['props']]>,
    wide = false,
  ) =>
    add(
      id,
      description,
      'panel',
      { title, gap: 12, surface: 'plain' },
      children,
      undefined,
      wide,
    );
  add(
    'identity',
    'Read-only profile identity: avatar, Priya Shah, product designer, verified membership. Use on profile/account screens.',
    'stack',
    { direction: 'row', gap: 12 },
    [
      ['avatar', 'avatar', { name: 'Priya Shah', size: 64 }],
      ['name', 'heading', { text: 'Priya Shah', level: 2 }],
      ['role', 'text', { text: 'Product designer', tone: 'secondary' }],
      ['verified', 'badge', { text: 'Verified', variant: 'outline' }],
    ],
  );
  const identity = out.find((c) => c.id === 'identity')!;
  if (!identity.nodes.some((n) => n.id === 'jf_identity_details')) {
    const byId = new Map(identity.nodes.map((n) => [n.id, n]));
    identity.nodes = [
      byId.get('jf_identity')!,
      byId.get('jf_identity_avatar')!,
      node('jf_identity_details', 'jf_identity', 'stack', {
        direction: 'column',
        gap: 4,
      }),
      node('jf_identity_heading', 'jf_identity_details', 'stack', {
        direction: 'row',
        gap: 8,
        align: 'center',
      }),
      { ...byId.get('jf_identity_name')!, parent: 'jf_identity_heading' },
      { ...byId.get('jf_identity_verified')!, parent: 'jf_identity_heading' },
      { ...byId.get('jf_identity_role')!, parent: 'jf_identity_details' },
    ];
  }
  add('bio', 'Profile biography: sample user introduction.', 'text', {
    text: 'Building thoughtful products and investing for the long term.',
    tone: 'secondary',
  });
  for (const [id, label, amount, currency] of [
    ['wallet_in', 'Indian stocks wallet', 24500, 'INR'],
    ['wallet_us', 'US stocks wallet', 1250, 'USD'],
  ] as const)
    panel(
      id,
      label,
      `${label}: separate ${currency} balance and local add-money action.`,
      [
        [
          'amount',
          'financial-value',
          { label: 'Available balance', amount, currency, role: 'anchor' },
        ],
        [
          'add',
          'button',
          {
            label: 'Add money',
            action: 'notify',
            message: 'Demo only. No money was added.',
            variant: 'outline',
          },
        ],
      ],
    );
  panel(
    'banks',
    'Linked bank accounts',
    'Linked bank accounts with verification status.',
    [
      [
        'bank',
        'mint-row',
        {
          title: 'HDFC Bank',
          description: 'Savings · •• 4821',
          value: 'Verified',
          density: 'compact',
        },
      ],
      [
        'add',
        'button',
        {
          label: 'Link a bank',
          action: 'notify',
          message: 'Bank linking is not connected in this prototype.',
          variant: 'outline',
        },
      ],
    ],
  );
  panel(
    'security',
    'Security',
    'Security settings: biometric login and two-factor authentication switches.',
    [
      [
        'biometric',
        'switch',
        { label: 'Biometric login', bind: 'jf_biometric', checked: true },
      ],
      [
        'twofactor',
        'switch',
        {
          label: 'Two-factor authentication',
          bind: 'jf_twofactor',
          checked: true,
        },
      ],
    ],
  );
  panel(
    'notifications',
    'Notifications',
    'Notification preferences: email updates and price alerts.',
    [
      [
        'email',
        'switch',
        { label: 'Email updates', bind: 'jf_emailUpdates', checked: false },
      ],
      [
        'prices',
        'switch',
        { label: 'Price alerts', bind: 'jf_priceAlerts', checked: true },
      ],
    ],
  );
  add('language', 'Language preference dropdown.', 'select', {
    label: 'Language',
    bind: 'jf_language',
    options: ['English', 'Hindi'],
    value: 'English',
  });
  for (const [id, label, type, value] of [
    ['name', 'Full name', 'text', 'Priya Shah'],
    ['email', 'Email address', 'email', 'priya@example.com'],
    ['password', 'Password', 'password', ''],
  ] as const)
    add(
      `input_${id}`,
      `Editable ${label.toLowerCase()} field, for a form or account editing. Not read-only profile display.`,
      'input',
      { label, bind: `jf_${id}`, type, value },
      [],
      `field_${id}`,
    );
  add(
    'save',
    'Save changes button with explicit local-only feedback. Use with editable settings.',
    'button',
    {
      label: 'Save changes',
      action: 'notify',
      message: 'Changes are in this preview only.',
      variant: 'default',
    },
  );
  add('signout', 'Sign out action, local prototype feedback only.', 'button', {
    label: 'Sign out',
    action: 'notify',
    message: 'No authenticated session exists in this prototype.',
    variant: 'ghost',
  });
  add(
    'search',
    'Search input for a list or dashboard. Input state only; does not filter tables.',
    'input',
    {
      label: 'Search',
      bind: 'jf_search',
      type: 'search',
      placeholder: 'Search…',
    },
    [],
    undefined,
    true,
  );
  add(
    'period',
    'Reporting period selector. Local selection only, chart data is illustrative.',
    'select',
    {
      label: 'Period',
      bind: 'jf_period',
      options: ['This week', 'This month', 'This quarter'],
      value: 'This month',
    },
  );
  for (const [id, label, value, detail] of [
    ['revenue', 'Revenue', '₹4,82,500', '+12.8% this month'],
    ['orders', 'Orders', '384', '+8.2% this month'],
    ['customers', 'Customers', '125', '+14.4% this month'],
  ] as const)
    add(id, `${label} summary metric for sales analytics.`, 'metric', {
      label,
      value,
      detail,
    });
  const series = [
    { label: 'Week 1', value: 9200 },
    { label: 'Week 2', value: 11400 },
    { label: 'Week 3', value: 12650 },
    { label: 'Week 4', value: 15000 },
  ];
  for (const style of ['line', 'bar'] as const)
    add(
      `revenue_${style}`,
      `${style} chart of weekly sales revenue. Choose one chart style.`,
      'chart',
      { title: 'Weekly revenue', series, style },
      [],
      'revenue_chart',
      true,
    );
  add(
    'orders_table',
    'Recent customer orders table with order status and amount.',
    'table',
    {
      title: 'Recent orders',
      columns: ['Customer', 'Status', 'Amount'],
      rows: [
        ['Aarav Mehta', 'Paid', '₹2,499'],
        ['Maya Rao', 'Processing', '₹1,250'],
        ['Neha Shah', 'Paid', '₹4,800'],
      ],
    },
    [],
    undefined,
    true,
  );
  add(
    'portfolio_value',
    'Investment portfolio total value and returns in INR.',
    'metric',
    {
      label: 'Portfolio value',
      value: '₹12,48,500',
      detail: '+₹48,500 · 4.04%',
    },
  );
  add(
    'holdings',
    'Investment holdings table with separate Indian and US stocks and their currencies.',
    'table',
    {
      title: 'Holdings',
      columns: ['Stock', 'Market', 'Value', 'Return'],
      rows: [
        ['Reliance', 'India', '₹84,500', '+5.2%'],
        ['TCS', 'India', '₹62,200', '+3.1%'],
        ['Apple', 'US', '$1,250', '+4.6%'],
        ['Microsoft', 'US', '$980', '−1.2%'],
      ],
    },
    [],
    undefined,
    true,
  );
  panel(
    'watchlist',
    'Watchlist',
    'Stock watchlist with Indian and US quotes.',
    [
      [
        'in',
        'mint-row',
        {
          title: 'Infosys',
          description: 'NSE',
          value: '₹1,842.50',
          density: 'compact',
        },
      ],
      [
        'us',
        'mint-row',
        {
          title: 'NVIDIA',
          description: 'NASDAQ',
          value: '$124.80',
          density: 'compact',
        },
      ],
    ],
  );
  panel(
    'tasks_todo',
    'To do',
    'Task-board column with checkable tasks, assignee and due-date descriptions.',
    [
      [
        'one',
        'checkbox',
        {
          label: 'Review onboarding',
          description: 'Priya · Tomorrow · High priority',
          bind: 'jf_task1',
          checked: false,
        },
      ],
      [
        'two',
        'checkbox',
        {
          label: 'Prepare launch brief',
          description: 'Aarav · Friday · Medium priority',
          bind: 'jf_task2',
          checked: false,
        },
      ],
    ],
  );
  panel(
    'tasks_progress',
    'In progress',
    'Task-board column showing active design tasks.',
    [
      [
        'one',
        'checkbox',
        {
          label: 'Refine account settings',
          description: 'Maya · Thursday · High priority',
          bind: 'jf_task3',
          checked: false,
        },
      ],
    ],
  );
  panel('tasks_done', 'Done', 'Task-board column showing completed work.', [
    [
      'one',
      'checkbox',
      {
        label: 'Audit component library',
        description: 'Priya · Completed',
        bind: 'jf_task4',
        checked: true,
      },
    ],
  ]);
  panel(
    'appointments',
    'Upcoming appointments',
    'Upcoming appointments list for a planner or scheduler.',
    [
      [
        'one',
        'mint-row',
        {
          title: 'Design review',
          description: 'Tomorrow · 10:30 AM',
          value: '30 min',
          density: 'compact',
        },
      ],
      [
        'two',
        'mint-row',
        {
          title: 'Team planning',
          description: 'Friday · 2:00 PM',
          value: '45 min',
          density: 'compact',
        },
      ],
    ],
  );
  add(
    'date',
    'Calendar date selection for scheduling or delivery.',
    'date-picker',
    { label: 'Date', bind: 'jf_date', value: '2026-09-25' },
  );
  add('time', 'Available meeting time slots.', 'radio', {
    label: 'Available times',
    bind: 'jf_time',
    options: ['10:00 AM', '11:30 AM', '2:00 PM'],
    value: '10:00 AM',
  });
  add('timezone', 'Meeting timezone selector.', 'select', {
    label: 'Timezone',
    bind: 'jf_timezone',
    options: ['Asia/Kolkata', 'America/New_York', 'Europe/London'],
    value: 'Asia/Kolkata',
  });
  add(
    'book',
    'Booking confirmation button with local-only feedback.',
    'button',
    {
      label: 'Confirm booking',
      action: 'notify',
      message: 'Demo confirmation only. No calendar event was created.',
    },
  );
  panel(
    'conversation_list',
    'Conversations',
    'Support inbox conversation list with unread indicators.',
    [
      [
        'one',
        'mint-row',
        {
          title: 'Maya Rao',
          description: 'Can you help with my order?',
          value: '2 unread',
          density: 'compact',
        },
      ],
      [
        'two',
        'mint-row',
        {
          title: 'Aarav Mehta',
          description: 'Thanks for the update.',
          value: 'Yesterday',
          density: 'compact',
        },
      ],
    ],
  );
  panel(
    'conversation',
    'Conversation',
    'Active support conversation with message composer. Sending shows local feedback only.',
    [
      ['from', 'text', { text: 'Maya: Can you help with my order?' }],
      [
        'reply',
        'text',
        {
          text: 'Support: Of course. Please share your order number.',
          tone: 'secondary',
        },
      ],
      [
        'input',
        'textarea',
        { label: 'Reply', bind: 'jf_reply', placeholder: 'Write a reply…' },
      ],
      [
        'send',
        'button',
        {
          label: 'Send reply',
          action: 'notify',
          message: 'Demo only. This reply was not sent.',
        },
      ],
    ],
    true,
  );
  panel(
    'customer_details',
    'Customer details',
    'Support customer context and email.',
    [
      ['name', 'text', { text: 'Maya Rao' }],
      ['email', 'text', { text: 'maya@example.com', tone: 'secondary' }],
      ['plan', 'badge', { text: 'Pro member', variant: 'outline' }],
    ],
  );
  panel(
    'order_summary',
    'Order summary',
    'Checkout order summary and total. Quantities and totals are sample data.',
    [
      [
        'item',
        'mint-row',
        {
          title: 'Everyday backpack',
          description: 'Graphite · Quantity 1',
          value: '₹2,499',
          density: 'compact',
        },
      ],
      [
        'total',
        'financial-value',
        { label: 'Total', amount: 2499, currency: 'INR', role: 'anchor' },
      ],
    ],
  );
  add('address', 'Delivery address input.', 'textarea', {
    label: 'Delivery address',
    bind: 'jf_address',
    placeholder: 'Street, city and postal code',
  });
  add('coupon', 'Coupon entry field. No discount calculation.', 'input', {
    label: 'Coupon code',
    bind: 'jf_coupon',
    placeholder: 'Enter code',
  });
  add('payment', 'Payment method selection.', 'radio', {
    label: 'Payment method',
    bind: 'jf_payment',
    options: ['UPI', 'Card', 'Net banking'],
    value: 'UPI',
  });
  add(
    'pay',
    'Checkout pay action with fixed sample total; no real charge.',
    'button',
    {
      label: 'Pay ₹2,499',
      action: 'notify',
      message: 'Prototype only. No payment was made.',
    },
  );
  add(
    'stay_search',
    'Accommodation discovery search controls: destination, dates and guests. Use for Airbnb-style home feeds and travel rental browsing. Local input state; no server search.',
    'grid',
    { columns: 3, gap: 12 },
    [
      [
        'destination',
        'input',
        {
          label: 'Where',
          bind: 'jf_destination',
          placeholder: 'Search destinations',
        },
      ],
      [
        'dates',
        'input',
        { label: 'When', bind: 'jf_stay_dates', placeholder: 'Add dates' },
      ],
      [
        'guests',
        'select',
        {
          label: 'Guests',
          bind: 'jf_guests',
          options: ['1 guest', '2 guests', '4 guests', '6 guests'],
          value: '2 guests',
        },
      ],
    ],
  );
  add(
    'stay_categories',
    'Category filters for accommodation browsing: all stays, cabins, beach, city and countryside. Local category selection.',
    'mint-pill-group',
    {
      label: 'Explore stays',
      bind: 'jf_stay_category',
      options: ['All stays', 'Cabins', 'Beachfront', 'City', 'Countryside'],
      value: 'All stays',
    },
  );
  for (const [id, title, location, price, scene] of [
    ['coast', 'Sea breeze villa', 'Alibaug, Maharashtra', '₹8,500', 'coast'],
    ['cabin', 'Forest hideaway', 'Manali, Himachal Pradesh', '₹5,200', 'cabin'],
    ['city', 'The city loft', 'Bengaluru, Karnataka', '₹4,800', 'city'],
    ['lake', 'Lakeside retreat', 'Udaipur, Rajasthan', '₹7,400', 'lake'],
    ['desert', 'Desert courtyard', 'Jaisalmer, Rajasthan', '₹6,200', 'desert'],
    ['garden', 'Garden cottage', 'Coorg, Karnataka', '₹5,800', 'garden'],
  ] as const)
    add(
      `stay_${id}`,
      `Accommodation listing for a rental discovery feed: ${title} in ${location}. Illustrated sample listing, price per night, rating and save action. Select several for a home feed.`,
      'listing-card',
      {
        title,
        location,
        price,
        scene,
        bind: `jf_saved_${id}`,
        searchBind: 'jf_destination',
        categoryBind: 'jf_stay_category',
        category:
          scene === 'coast'
            ? 'Beachfront'
            : scene === 'cabin'
              ? 'Cabins'
              : scene === 'city'
                ? 'City'
                : 'Countryside',
        rating: '4.9',
        dates: 'Available this month',
        tag: 'Guest favourite',
      },
    );
  // Generic search and domain-specific search are alternatives, not peers.
  out.find((c) => c.id === 'stay_search')!.resource = 'search';
  add(
    'social_navigation',
    'Section navigation for a social feed, community, activity or microblogging app. Local selected-section state.',
    'sidebar',
    {
      label: 'Community',
      bind: 'jf_social_section',
      options: ['Home', 'Following', 'Bookmarks', 'Messages'],
      value: 'Home',
    },
  );
  add(
    'post_composer',
    'Compose and publish a local text post in a social feed or community. Supports Twitter/X-style home screens.',
    'post-composer',
    {
      label: 'Share an update',
      author: 'You',
      placeholder: 'What’s happening?',
    },
  );
  for (const [id, author, handle, body, time] of [
    [
      'design',
      'Maya Rao',
      '@mayarao',
      'Small details make a big difference. Today I simplified a flow from five steps to two. What did you improve this week?',
      '12 min',
    ],
    [
      'community',
      'Aarav Mehta',
      '@aarav',
      'Sharing a few sketches from our community workshop. The best ideas came from asking better questions.',
      '38 min',
    ],
    [
      'product',
      'Neha Shah',
      '@nehashah',
      'Just shipped our new workspace. Clear navigation, fewer distractions and room for the work that matters.',
      '1 hr',
    ],
  ] as const)
    add(
      `feed_${id}`,
      `Reusable social feed item: ${body} Suitable for timelines, communities and activity feeds.`,
      'feed-item',
      { author, handle, body, time },
    );
  add(
    'inbox_pane',
    'Interactive messages inbox sidebar with two selectable conversations and local replies. Can sit beside any feed, dashboard or workspace in a resizable layout.',
    'inbox-pane',
    { title: 'Inbox' },
    [],
    'inbox',
  );
  const copyPrompt = prompt
    .replace(/```[\s\S]*?```/g, '')
    .replace(
      /^(?:name|email|role|bio|title|heading|primary label|destination)\s*:.*$/gim,
      '',
    )
    .replace(
      /(?:title|heading|profile for|named|name|role|primary label|button label)(?:\s+(?:to|is|as))?\s*["“][^"”\n]*["”]/gi,
      '',
    );
  const quoted = [...copyPrompt.matchAll(/["“]([^"”\n]{1,100})["”]/g)]
    .map((m) => m[1])
    .slice(0, 4);
  for (const [i, text] of quoted.entries())
    add(
      `quoted_${i}`,
      `Text explicitly supplied by the user: ${JSON.stringify(text)}. Only select if requested as visible copy.`,
      'text',
      { text },
    );
  return out;
}
