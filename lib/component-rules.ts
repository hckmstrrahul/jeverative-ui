/** Layout semantics shared by Jev and the deterministic renderer. */
export type ComponentRole =
  | 'navigation'
  | 'identity'
  | 'summary'
  | 'content'
  | 'field'
  | 'preference'
  | 'filter'
  | 'action'
  | 'feedback'
  | 'conversation'
  | 'composer'
  | 'utility'
  | 'rail';
export type ComponentRule = {
  role: ComponentRole;
  purpose: string;
  minWidth: number;
  selfContained?: boolean;
};
const rule = (
  role: ComponentRole,
  purpose: string,
  minWidth = 240,
  selfContained = false,
): ComponentRule => ({ role, purpose, minWidth, selfContained });
export const componentRules: Record<string, ComponentRule> = {
  'aspect-ratio': rule(
    'content',
    'A proportional media frame. Only select when media is needed.',
    320,
  ),
  card: rule(
    'summary',
    'A contextual summary: metrics for analytics, balance for investing, identity for profiles. Blueprint controls the anatomy.',
    640,
    true,
  ),
  collapsible: rule('content', 'Optional project details disclosed on demand.'),
  resizable: rule(
    'content',
    'An interactive split-panel workspace, only when resizing is requested.',
    560,
  ),
  'scroll-area': rule(
    'content',
    'A bounded activity list for long content.',
    320,
  ),
  separator: rule(
    'utility',
    'A section divider. Existing sections already handle separation; select only when explicitly needed.',
    0,
    true,
  ),
  sidebar: rule(
    'rail',
    'Application navigation rail. Use for multi-section workspaces, not simple forms.',
    180,
    true,
  ),
  tabs: rule(
    'navigation',
    'Page-level views above the content. Do not combine with navigation-menu unless explicitly requested.',
    320,
    true,
  ),
  button: rule(
    'action',
    'Primary save/create action and secondary cancel. Belongs after form fields or in a page toolbar.',
    200,
    true,
  ),
  'button-group': rule(
    'action',
    'Related secondary batch actions. Keep near the content they affect.',
    240,
    true,
  ),
  checkbox: rule(
    'field',
    'A task checklist for planning; a consent choice for forms. Not a generic decoration.',
    280,
  ),
  combobox: rule(
    'filter',
    'Searchable workspace picker. Prefer one picker style unless different choices are needed.',
  ),
  'date-picker': rule(
    'filter',
    'A compact date filter. Calendar is the full scheduling view.',
  ),
  field: rule(
    'field',
    'A complete labeled form group. Settings use category-specific account controls; order tickets use quantities and price. Includes inputs and labels.',
    360,
  ),
  input: rule(
    'field',
    'A single labeled email input. Usually redundant with Field unless explicitly requested.',
  ),
  'input-group': rule(
    'composer',
    'Search with an inline action; a message composer in a conversation.',
    320,
    true,
  ),
  'input-otp': rule(
    'field',
    'Six-digit verification. Only include for verification or authentication.',
    280,
  ),
  label: rule(
    'field',
    'A labeled display-name input. Already includes its associated input.',
  ),
  'native-select': rule(
    'filter',
    'A region picker. Use when region selection is relevant.',
  ),
  'radio-group': rule(
    'preference',
    'A choice of information density, shown as a labeled group.',
  ),
  select: rule(
    'filter',
    'A workspace-plan picker. Belongs in filters or the workspace preferences form.',
  ),
  slider: rule(
    'preference',
    'A volume preference with a label and readable value.',
  ),
  switch: rule(
    'preference',
    'A set of notification preferences. Group together in one section.',
    320,
  ),
  textarea: rule(
    'field',
    'A labeled notes field. Place after short fields.',
    320,
  ),
  toggle: rule(
    'filter',
    'A favorite on/off action. Keep inline with related controls.',
    120,
    true,
  ),
  'toggle-group': rule(
    'filter',
    'Day/week/month view selection. Particularly useful for planning.',
    200,
    true,
  ),
  breadcrumb: rule(
    'navigation',
    'Location context at the top of the page. Not a content card.',
    280,
    true,
  ),
  command: rule(
    'content',
    'A searchable command launcher. Only select for command/search workflows.',
    360,
  ),
  'context-menu': rule(
    'utility',
    'Contextual actions for a surface. Only include when requested.',
    280,
  ),
  'dropdown-menu': rule(
    'action',
    'Secondary actions menu. Does not deserve a standalone card.',
    120,
    true,
  ),
  menubar: rule(
    'navigation',
    'Desktop-style File/Edit/View menu. Use for editor interfaces.',
    280,
    true,
  ),
  'navigation-menu': rule(
    'navigation',
    'Horizontal primary navigation. Choose this or Tabs for page-level navigation.',
    320,
    true,
  ),
  pagination: rule(
    'utility',
    'Pagination after a table or result list.',
    320,
    true,
  ),
  accordion: rule(
    'content',
    'Expandable details or FAQ; supports the main task.',
    280,
  ),
  avatar: rule(
    'identity',
    'Profile identity. Integrate in the page header or account summary.',
    220,
    true,
  ),
  badge: rule(
    'identity',
    'Inline status badges. Place near identity or page context.',
    120,
    true,
  ),
  calendar: rule(
    'content',
    'A full date selection calendar; pair with tasks for planning.',
    300,
  ),
  carousel: rule(
    'content',
    'A sequence of slides with previous/next controls.',
    360,
  ),
  chart: rule(
    'content',
    'A complete revenue chart with title, date range and change indicator.',
    520,
  ),
  'data-table': rule(
    'content',
    'Customer transactions with filter and sortable customer column. Choose this OR Table.',
    520,
  ),
  item: rule(
    'content',
    'A project document summary. Supporting content; avoid surrounding it with a second card.',
    280,
    true,
  ),
  kbd: rule(
    'utility',
    'A keyboard hint. Inline secondary metadata, never a large card.',
    160,
    true,
  ),
  table: rule(
    'content',
    'A complete customer transactions table. Choose this OR Data Table.',
    520,
  ),
  typography: rule(
    'content',
    'Editorial introduction with heading and supporting prose. Use for text-led pages.',
    360,
    true,
  ),
  alert: rule(
    'feedback',
    'A useful status notice above the main content. Avoid adding one without a reason.',
    320,
    true,
  ),
  'alert-dialog': rule(
    'action',
    'Confirmation trigger for a reset action. Group with secondary actions.',
    200,
    true,
  ),
  dialog: rule(
    'action',
    'New project dialog trigger. Keep in page actions, not its own card.',
    160,
    true,
  ),
  drawer: rule(
    'action',
    'Daily-goal drawer trigger. Keep near planning controls.',
    160,
    true,
  ),
  empty: rule(
    'feedback',
    'Empty state. Only choose if the user requests an empty state, not alongside a populated dashboard.',
    320,
    true,
  ),
  'hover-card': rule(
    'identity',
    'Supplementary profile information on hover.',
    120,
    true,
  ),
  popover: rule(
    'action',
    'Display options popover. Compact toolbar action.',
    180,
    true,
  ),
  progress: rule(
    'content',
    'Progress toward a goal. Supporting content paired with tasks.',
    260,
  ),
  sheet: rule(
    'action',
    'Project-details sheet trigger. Compact secondary action.',
    160,
    true,
  ),
  skeleton: rule(
    'feedback',
    'Loading placeholder. Only choose if a loading state is explicitly requested.',
    300,
    true,
  ),
  spinner: rule(
    'feedback',
    'Busy indicator. Only choose for an explicitly requested loading state.',
    160,
    true,
  ),
  toast: rule(
    'action',
    'Notification trigger. Only choose when the user requests a toast demo.',
    160,
    true,
  ),
  tooltip: rule(
    'utility',
    'A small hint on a control. Keep with secondary actions.',
    160,
    true,
  ),
  attachment: rule(
    'conversation',
    'Attached document, inline in a conversation or supporting documents section.',
    240,
    true,
  ),
  bubble: rule(
    'conversation',
    'A short two-message exchange. Usually redundant with Message Scroller.',
    300,
    true,
  ),
  direction: rule(
    'utility',
    'RTL content sample. Only choose for internationalization or RTL requests.',
    240,
    true,
  ),
  marker: rule(
    'conversation',
    'Date separator inside a conversation. Not a standalone content card.',
    0,
    true,
  ),
  message: rule(
    'conversation',
    'A message with sender and timestamp. Use as conversation content.',
    300,
    true,
  ),
  'message-scroller': rule(
    'conversation',
    'A complete scrollable conversation. Prefer it for a full chat, instead of duplicating Message and Bubble.',
    360,
    true,
  ),
  questionnaire: rule(
    'content',
    'A complete preference questionnaire with choices and submit action.',
    360,
  ),
};

export const designRules = {
  hierarchy:
    'Compose an application screen, not a component showroom. Choose one primary task and only the components needed to complete it. Treat component descriptions as complete blocks: Field already has labels and inputs; Card already contains three metrics; Data Table already has search.',
  grouping:
    'Navigation comes first, then page identity, summary metrics, filters, primary content, supporting content and actions. Forms group related fields, preferences and a final action. Chat groups messages, attachments and a composer. Small primitives never get their own full-size cards.',
  restraint:
    'Prefer 3–6 substantial blocks plus necessary controls. Do not add spinners, skeletons, empty states, OTP, RTL samples, toasts or resizable panels unless the prompt needs them. Do not select Table and Data Table together, or redundant full chat blocks.',
  layout:
    'Use grid for dashboards with multiple substantial blocks, stack for settings/forms and conversations, split for planning with calendar + tasks. A chart or table needs at least 520px; a support panel at least 280px. If both cannot fit, stack. A single block spans the available content width. Never stretch form fields across a wide dashboard.',
  spacing:
    'The renderer owns an 8px spacing rhythm: 8px between labels and controls, 16px between related controls, 24px between groups, 32px between sections. Compact mode reduces padding and gaps, not legibility or control hit targets.',
  emphasis:
    'Emphasize a selected substantial block, not a badge, button, divider or navigation control. Preserve the screen context and data when the user only requests a visual adjustment.',
} as const;

export const recipeGuidance = {
  overview:
    'Summary metrics first; revenue chart and transaction table get enough width. Filters sit together above data, actions next to the heading. No unrelated calendars or forms.',
  planning:
    'Calendar and agenda form a balanced pair, with progress and expandable details supporting the agenda. Date and view controls sit above them.',
  settings:
    'Narrow, readable form. Profile identity first; workspace fields together; preferences in their own group; save/cancel last. No sales metrics.',
  conversation:
    'One readable conversation column with an inline day marker, messages, attachments and a composer at the bottom. No unrelated dashboards or preference fields.',
} as const;
