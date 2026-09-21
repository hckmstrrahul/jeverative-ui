import type { UIDocument } from './tree/spec';
import { componentVariants, type Device, type Recipe } from './mint';
import { componentRules } from './component-rules';
export const groups = {
  Layout: [
    'Aspect Ratio',
    'Card',
    'Collapsible',
    'Resizable',
    'Scroll Area',
    'Separator',
    'Sidebar',
    'Tabs',
  ],
  Inputs: [
    'Button',
    'Button Group',
    'Checkbox',
    'Combobox',
    'Date Picker',
    'Field',
    'Input',
    'Input Group',
    'Input OTP',
    'Label',
    'Native Select',
    'Radio Group',
    'Select',
    'Slider',
    'Switch',
    'Textarea',
    'Toggle',
    'Toggle Group',
  ],
  Navigation: [
    'Breadcrumb',
    'Command',
    'Context Menu',
    'Dropdown Menu',
    'Menubar',
    'Navigation Menu',
    'Pagination',
  ],
  Data: [
    'Accordion',
    'Avatar',
    'Badge',
    'Calendar',
    'Carousel',
    'Chart',
    'Data Table',
    'Item',
    'Kbd',
    'Table',
    'Typography',
  ],
  Feedback: [
    'Alert',
    'Alert Dialog',
    'Dialog',
    'Drawer',
    'Empty',
    'Hover Card',
    'Popover',
    'Progress',
    'Sheet',
    'Skeleton',
    'Spinner',
    'Toast',
    'Tooltip',
  ],
  Conversation: [
    'Attachment',
    'Bubble',
    'Direction',
    'Marker',
    'Message',
    'Message Scroller',
    'Questionnaire',
  ],
} as const;
export const catalog = Object.entries(groups).flatMap(([group, names]) =>
  names.map((name) => ({
    id: name.toLowerCase().replaceAll(' ', '-'),
    name,
    group,
    variants: componentVariants[name.toLowerCase().replaceAll(' ', '-')] ?? {
      default: 'Standard Mint-styled shadcn anatomy',
    },
    ...componentRules[name.toLowerCase().replaceAll(' ', '-')],
  })),
);
export type Screen = {
  document?: UIDocument;
  blueprint?: string;
  contentMode?: 'personal' | 'professional' | 'creator' | 'investor';
  settingsFocus?:
    | 'general'
    | 'security'
    | 'notifications'
    | 'billing'
    | 'connections';
  components: string[];
  layout: 'grid' | 'stack' | 'split';
  density: 'comfortable' | 'compact';
  theme: 'light' | 'dark';
  scenario: 'overview' | 'planning' | 'settings' | 'conversation';
  emphasis: string;
  device: Device;
  recipe: Recipe;
  navigation: 'none' | 'top' | 'rail' | 'bottom';
  complexity: 'simple' | 'standard' | 'rich';
  primaryAction:
    | 'none'
    | 'save'
    | 'buy'
    | 'sell'
    | 'invest'
    | 'create'
    | 'continue';
  rowCount: 3 | 5 | 8;
  search: boolean;
  orderUnit: 'shares' | 'lots';
};
export const initialScreen: Screen = {
  components: ['card', 'chart', 'table'],
  layout: 'grid',
  density: 'comfortable',
  theme: 'light',
  scenario: 'overview',
  emphasis: 'chart',
  device: 'desktop',
  recipe: 'dashboard',
  navigation: 'none',
  complexity: 'standard',
  primaryAction: 'none',
  rowCount: 5,
  search: false,
  orderUnit: 'shares',
};
export const scenarios = {
  overview: { title: 'Overview', subtitle: 'Your business at a glance.' },
  planning: {
    title: 'Your week',
    subtitle: 'Your schedule, priorities, and progress.',
  },
  settings: {
    title: 'Workspace settings',
    subtitle: 'Manage your profile and preferences.',
  },
  conversation: {
    title: 'Team conversation',
    subtitle: 'A shared space for ideas and updates.',
  },
};
