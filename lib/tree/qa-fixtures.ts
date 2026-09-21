import type { UIDocument, UINode } from './spec';
const n = (
  id: string,
  parent: string | null,
  kind: UINode['kind'],
  props: UINode['props'] = {},
): UINode => ({ id, parent, kind, props });
const base = (title: string, nodes: UINode[]): UIDocument => ({
  version: 1,
  title,
  device: 'desktop',
  theme: 'light',
  nodes,
});
// Reduced reproductions of issues observed in live desktop generations, not model quality scores.
export const desktopQaFixtures = [
  base('Settings and dialog labels', [
    n('page', null, 'page', { width: 'reading' }),
    n('title', 'page', 'heading', { text: 'Account Settings', level: 1 }),
    n('security', 'page', 'panel', { title: 'Preferences', gap: 16 }),
    n('twoFactor', 'security', 'switch', {
      label: 'Two-factor authentication',
      bind: 'twoFactor',
      checked: true,
    }),
    n('digest', 'security', 'checkbox', {
      label: 'Weekly digest',
      bind: 'digest',
      checked: true,
    }),
    n('marketing', 'security', 'checkbox', {
      label: 'Product announcements',
      bind: 'marketing',
      checked: false,
    }),
    n('open', 'page', 'button', {
      label: 'Edit profile',
      action: 'toggle',
      target: 'edit',
    }),
    n('edit', 'page', 'dialog', {
      title: 'Edit profile',
      description: 'Update local preview details.',
    }),
    n('form', 'edit', 'form', { gap: 12 }),
    n('nameField', 'form', 'field', { label: 'Full name' }),
    n('name', 'nameField', 'input', {
      label: 'Full name',
      bind: 'name',
      value: 'Priya Shah',
    }),
    n('bioField', 'form', 'field', { label: 'Bio' }),
    n('bio', 'bioField', 'textarea', {
      label: 'Bio',
      bind: 'bio',
      value: 'Independent designer',
    }),
    n('dateField', 'form', 'field', { label: 'Start date' }),
    n('date', 'dateField', 'date-picker', {
      label: 'Start date',
      bind: 'date',
      value: '2026-09-21',
    }),
    n('radioField', 'form', 'field', { label: 'Availability' }),
    n('availability', 'radioField', 'radio', {
      label: 'Availability',
      bind: 'availability',
      options: ['Available', 'Busy'],
      value: 'Available',
    }),
    n('close', 'form', 'button', {
      label: 'Done',
      action: 'toggle',
      target: 'edit',
    }),
  ]),
  base('Sales dashboard', [
    n('page', null, 'page', { width: 'wide' }),
    n('title', 'page', 'heading', { text: 'Sales Dashboard', level: 1 }),
    n('dates', 'page', 'stack', { direction: 'row', gap: 12, align: 'end' }),
    n('from', 'dates', 'date-picker', {
      label: 'From',
      bind: 'from',
      value: '2024-07-01',
    }),
    n('to', 'dates', 'date-picker', {
      label: 'To',
      bind: 'to',
      value: '2024-12-31',
    }),
    n('outer', 'page', 'panel', { surface: 'card' }),
    n('metrics', 'outer', 'grid', { columns: 3 }),
    ...['Revenue', 'Orders', 'Conversion'].flatMap((label, i) => [
      n('card' + i, 'metrics', 'panel', { surface: 'card' }),
      n('metric' + i, 'card' + i, 'metric', {
        label,
        value: ['₹2,45,800.00', '428', '3.8%'][i],
      }),
    ]),
    n('chartPanel', 'outer', 'panel', {
      title: 'Revenue Trend (6 Months)',
      surface: 'card',
    }),
    n('chart', 'chartPanel', 'chart', {
      title: 'Monthly Revenue',
      series: [
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ].map((label, i) => ({
        label,
        value: [38500, 42300, 39800, 45200, 48100, 51900][i],
      })),
    }),
    n('tablePanel', 'outer', 'panel', {
      title: 'Recent orders',
      surface: 'card',
    }),
    n('table', 'tablePanel', 'data-table', {
      columns: ['Product', 'Quantity', 'Amount'],
      rows: [
        ['Mountain Bike', '8', '₹45,900.00'],
        ['Road Bike', '12', '₹38,500.00'],
        ['Training Bike', '2', '₹8,900.00'],
      ],
    }),
    n('total', 'page', 'stack', { direction: 'row', justify: 'between' }),
    n('totalLabel', 'total', 'text', { text: 'Total' }),
    n('amount', 'total', 'financial-value', {
      label: 'Total',
      amount: 93300,
      currency: 'INR',
      role: 'list',
    }),
  ]),
  base('Wide desktop board', [
    n('page', null, 'page', { width: 'reading' }),
    n('title', 'page', 'heading', { text: 'Project Kanban', level: 1 }),
    n('board', 'page', 'resizable', {
      label: 'Task board',
      direction: 'horizontal',
    }),
    ...['To do', 'In progress', 'Done'].flatMap((title, i) => [
      n('lane' + i, 'board', 'panel', { title, surface: 'plain' }),
      n('task' + i, 'lane' + i, 'panel', { surface: 'card' }),
      n('taskTitle' + i, 'task' + i, 'text', {
        text: [
          'Site survey and measurements',
          '3D concept modeling',
          'Budget estimation',
        ][i],
      }),
      n('owner' + i, 'task' + i, 'text', {
        text: 'Priya Shah · Due 24 Sep',
        size: 'caption',
        tone: 'secondary',
      }),
    ]),
  ]),
  base('Support inbox panes', [
    n('page', null, 'page', { width: 'wide' }),
    n('title', 'page', 'heading', { text: 'Support Inbox', level: 1 }),
    n('body', 'page', 'grid', { columns: 2, ratio: 'main-left', gap: 16 }),
    n('primary', 'body', 'panel', { surface: 'card', gap: 12 }),
    n('list', 'primary', 'scroll-area', {
      label: 'Conversations',
      height: 480,
    }),
    ...[
      'Sarah Chen',
      'Marcus Johnson',
      'Elena Rodriguez',
      'James Liu',
      'Priya Sharma',
    ].map((title, i) =>
      n('person' + i, 'list', 'mint-row', {
        title,
        description: [
          'Order not received',
          'Billing question',
          'Account access',
          'Return request',
          'Address correction',
        ][i],
        density: 'compact',
        divider: true,
      }),
    ),
    n('chat', 'primary', 'stack', { direction: 'column', gap: 12 }),
    n('chatTitle', 'chat', 'heading', { text: 'Sarah Chen', level: 2 }),
    n('messages', 'chat', 'message-scroller', {
      label: 'Conversation',
      height: 320,
    }),
    n('first', 'messages', 'message', {
      author: 'Sarah Chen',
      text: 'My order has not arrived. Could you check it?',
      time: '2:15 PM',
      align: 'start',
    }),
    n('second', 'messages', 'message', {
      author: 'Support',
      text: 'It is in transit and should arrive tomorrow.',
      time: '2:22 PM',
      align: 'end',
    }),
    n('reply', 'chat', 'textarea', {
      label: 'Reply',
      bind: 'reply',
      placeholder: 'Write a reply',
    }),
    n('send', 'chat', 'button', {
      label: 'Send',
      action: 'notify',
      message: 'Preview reply',
    }),
    n('support', 'body', 'panel', {
      title: 'Customer details',
      surface: 'card',
    }),
    n('identity', 'support', 'text', {
      text: 'Sarah Chen · Customer since 2022',
    }),
    n('order', 'support', 'mint-row', {
      title: 'Order #4521',
      description: 'In transit',
      density: 'compact',
    }),
  ]),
];
