export const groups = {
  'Layout': ['Aspect Ratio','Card','Collapsible','Resizable','Scroll Area','Separator','Sidebar','Tabs'],
  'Inputs': ['Button','Button Group','Checkbox','Combobox','Date Picker','Field','Input','Input Group','Input OTP','Label','Native Select','Radio Group','Select','Slider','Switch','Textarea','Toggle','Toggle Group'],
  'Navigation': ['Breadcrumb','Command','Context Menu','Dropdown Menu','Menubar','Navigation Menu','Pagination'],
  'Data': ['Accordion','Avatar','Badge','Calendar','Carousel','Chart','Data Table','Item','Kbd','Table','Typography'],
  'Feedback': ['Alert','Alert Dialog','Dialog','Drawer','Empty','Hover Card','Popover','Progress','Sheet','Skeleton','Spinner','Toast','Tooltip'],
  'Conversation': ['Attachment','Bubble','Direction','Marker','Message','Message Scroller','Questionnaire'],
} as const;
export const catalog = Object.entries(groups).flatMap(([group, names]) => names.map(name => ({ id: name.toLowerCase().replaceAll(' ', '-'), name, group })));
export type Screen = { components: string[]; layout: 'grid' | 'stack' | 'split'; density: 'comfortable' | 'compact'; theme: 'light' | 'dark'; scenario: 'overview' | 'planning' | 'settings' | 'conversation'; emphasis: string };
export const initialScreen: Screen = {components:['card','chart','table'],layout:'grid',density:'comfortable',theme:'light',scenario:'overview',emphasis:'chart'};
export const scenarios = {
 overview: {title:'Overview',subtitle:'A little perspective on your progress.'},
 planning: {title:'Your day, at a glance',subtitle:'Make room for what matters.'},
 settings: {title:'Make it yours',subtitle:'A workspace that works for you.'},
 conversation: {title:'Let’s talk',subtitle:'Everything you need to keep the conversation going.'},
};
