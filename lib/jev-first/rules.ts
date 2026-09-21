import type { Candidate } from './candidates';

// Semantic cohorts describe relationships, not complete screen templates.
const cohorts = [
  ['identity', 'bio'],
  ['wallet_in', 'wallet_us', 'banks'],
  [
    'input_name',
    'input_email',
    'input_password',
    'language',
    'security',
    'notifications',
    'save',
    'signout',
  ],
  [
    'period',
    'revenue',
    'orders',
    'customers',
    'revenue_line',
    'revenue_bar',
    'orders_table',
  ],
  ['portfolio_value', 'holdings', 'watchlist'],
  ['date', 'time', 'timezone', 'book'],
  ['order_summary', 'address', 'coupon', 'payment', 'pay'],
];
export function sensibleLayout(
  selected: Candidate[],
  layout: string,
  device: string,
) {
  if (selected.some((c) => c.nodes[0].kind === 'listing-card'))
    return 'stacked';
  if (device === 'mobile') return layout === 'reading' ? 'reading' : 'stacked';
  if (
    selected.some((c) => c.id === 'conversation') &&
    selected.some((c) => c.id === 'conversation_list') &&
    layout === 'main-left'
  )
    return 'main-right';
  if (
    selected.some((c) => c.id === 'inbox_pane') &&
    selected.some((c) => c.nodes[0].kind === 'feed-item')
  )
    return layout === 'resizable' ? 'resizable' : 'main-left';
  const dense = selected.some((c) =>
    ['chart', 'table', 'data-table'].includes(c.nodes[0].kind),
  );
  // Wide data must never occupy a narrow reading column or three equal panes.
  if (
    dense &&
    (layout === 'reading' || layout === 'three-column' || device === 'tablet')
  )
    return 'stacked';
  if (device === 'tablet' && layout === 'three-column') return 'two-column';
  return layout;
}
export function constrainPlacement(
  selected: Candidate[],
  layout: string,
  decisions: Record<string, string>,
) {
  const out = { ...decisions };
  const available = new Set(selected.map((c) => c.id));
  for (const cohort of cohorts) {
    const members = cohort.filter((id) => available.has(id));
    if (!members.length) continue;
    // Let Jev select the location of the leading context; keep dependent
    // controls and actions with it. Order is the semantic reading sequence.
    const parent =
      out[`parent_${members[0]}`] ?? out.parent_summary_metrics ?? 'a';
    members.forEach((id, index) => {
      out[`parent_${id}`] = parent;
      out[`order_${id}`] = String(cohorts.indexOf(cohort) * 100 + index);
    });
    out[`group_${parent}`] = 'stack';
  }
  // Conversation list, active thread, then optional customer context.
  if (available.has('conversation') && available.has('conversation_list')) {
    const panes =
      layout === 'three-column'
        ? ['a', 'b', 'c']
        : layout === 'reading' || layout === 'stacked'
          ? ['a', 'a', 'a']
          : ['a', 'b', 'b'];
    ['search', 'conversation_list', 'conversation', 'customer_details'].forEach(
      (id, i) => {
        if (!available.has(id)) return;
        out[`parent_${id}`] = panes[Math.max(0, i - 1)];
        out[`order_${id}`] = String(i);
        out[`group_${panes[Math.max(0, i - 1)]}`] = 'stack';
      },
    );
  }
  // A wide data cohort goes in the wide side of asymmetric layouts.
  for (const cohort of cohorts)
    if (
      cohort.some((id) =>
        selected.some(
          (c) =>
            c.id === id &&
            ['chart', 'table', 'data-table'].includes(c.nodes[0].kind),
        ),
      )
    ) {
      const parent = layout === 'main-right' ? 'b' : 'a';
      for (const id of cohort)
        if (available.has(id)) out[`parent_${id}`] = parent;
      out[`group_${parent}`] = 'stack';
    }
  const customFields = selected.filter((c) => c.id.startsWith('custom_field_'));
  if (customFields.length) {
    const parent = out[`parent_${customFields[0].id}`] ?? 'a';
    customFields.forEach((c, i) => {
      out[`parent_${c.id}`] = parent;
      out[`order_${c.id}`] = String(i);
    });
    if (available.has('save')) {
      out.parent_save = parent;
      out.order_save = '99';
    }
    out[`group_${parent}`] = 'stack';
  }
  const customData = selected.filter(
    (c) =>
      c.id.startsWith('custom_metric_') ||
      ['custom_table', 'custom_chart'].includes(c.id),
  );
  if (customData.length) {
    const parent = layout === 'main-right' ? 'b' : 'a';
    for (const c of customData) {
      out[`parent_${c.id}`] = parent;
      out[`order_${c.id}`] = c.id.startsWith('custom_metric_')
        ? '0'
        : c.id === 'custom_chart'
          ? '20'
          : '30';
    }
    out[`group_${parent}`] = 'stack';
  }
  const listings = selected.filter((c) => c.nodes[0].kind === 'listing-card');
  if (listings.length) {
    for (const [i, c] of listings.entries()) {
      out[`parent_${c.id}`] = 'b';
      out[`order_${c.id}`] ??= String(i);
    }
    out.group_b = out.group_b === 'grid2' ? 'grid2' : 'grid3';
    for (const [i, id] of ['stay_search', 'stay_categories'].entries())
      if (available.has(id)) {
        out[`parent_${id}`] = 'a';
        out[`order_${id}`] = String(i);
      }
    out.group_a = 'stack';
  }
  const feed = selected.filter(
    (c) => c.nodes[0].kind === 'feed-item' || c.id === 'post_composer',
  );
  if (feed.length) {
    const split = layout === 'resizable' || layout === 'three-column';
    const main = split && available.has('social_navigation') ? 'b' : 'a';
    for (const c of feed) {
      out[`parent_${c.id}`] = main;
      out[`order_${c.id}`] =
        c.id === 'post_composer'
          ? '0'
          : String(10 + Number(out[`order_${c.id}`] ?? 0));
    }
    out[`group_${main}`] = 'stack';
    if (available.has('social_navigation')) {
      out.parent_social_navigation = 'a';
      out.order_social_navigation = '-1';
      out.group_a = 'stack';
    }
    if (available.has('inbox_pane')) {
      out.parent_inbox_pane =
        split && available.has('social_navigation') ? 'c' : 'b';
      out.order_inbox_pane = '0';
      out[`group_${out.parent_inbox_pane}`] = 'stack';
    }
  } else if (available.has('inbox_pane') && layout === 'resizable') {
    for (const c of selected)
      out[`parent_${c.id}`] = c.id === 'inbox_pane' ? 'b' : 'a';
    out.group_a = 'stack';
    out.group_b = 'stack';
  }
  return out;
}
