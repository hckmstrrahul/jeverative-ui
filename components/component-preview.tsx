'use client';
import { useId, useState } from 'react';
import { MintPreview, hasMintVariant } from '@/components/mint-preview';
import type { Screen } from '@/lib/catalog';
import {
  ArrowDown,
  ArrowUpRight,
  Bell,
  ChevronDown,
  FileText,
  Folder,
  Mail,
  Plus,
  Search,
  Settings,
  Star,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Kbd } from '@/components/ui/kbd';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from '@/components/ui/menubar';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from '@/components/ui/input-group';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
} from '@/components/ui/item';
import { Bubble, BubbleContent, BubbleGroup } from '@/components/ui/bubble';
import {
  Message,
  MessageHeader,
  MessageContent,
  MessageFooter,
} from '@/components/ui/message';
import {
  Attachment,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentMedia,
} from '@/components/ui/attachment';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { DirectionProvider } from '@/components/ui/direction';
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from '@/components/ui/message-scroller';
import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireTitle,
  QuestionnaireChoices,
  QuestionnaireChoice,
  QuestionnaireSubmit,
} from '@/components/ui/questionnaire';
import { toast } from '@/components/ui/toast';
const notify = (title = 'Saved in this preview') =>
  toast.add({ title, type: 'success' });
const chartData = [
  { month: 'Jan', value: 186 },
  { month: 'Feb', value: 305 },
  { month: 'Mar', value: 237 },
  { month: 'Apr', value: 373 },
  { month: 'May', value: 309 },
  { month: 'Jun', value: 454 },
];
const rows = [
  ['Olivia Martin', 'olivia@example.com', 'Paid', '₹1,999.00'],
  ['Jackson Lee', 'jackson@example.com', 'Paid', '₹39.00'],
  ['Isabella Nguyen', 'isabella@example.com', 'Pending', '₹299.00'],
  ['William Kim', 'william@example.com', 'Paid', '₹99.00'],
  ['Sofia Davis', 'sofia@example.com', 'Paid', '₹39.00'],
];
function DemoTable({ filterable = false }: { filterable?: boolean }) {
  const [filter, setFilter] = useState('');
  const [reverse, setReverse] = useState(false);
  const visible = rows.filter((r) =>
    r.join(' ').toLowerCase().includes(filter.toLowerCase()),
  );
  if (reverse) visible.reverse();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3>Recent sales</h3>
          <p className="text-muted-foreground text-xs mt-1">
            Your latest transactions.
          </p>
        </div>
        <Badge variant="outline">This month</Badge>
      </div>
      {filterable && (
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter customers…"
          aria-label="Filter customers"
        />
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                onClick={() => setReverse(!reverse)}
                className="flex items-center gap-1"
              >
                Customer <ArrowDown size={12} />
              </button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map(([name, email, status, amount]) => (
            <TableRow key={name}>
              <TableCell>
                <div className="font-medium text-sm">{name}</div>
                <div className="text-muted-foreground text-xs mt-1">
                  {email}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={status === 'Paid' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {status}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums">
                {amount}
              </TableCell>
            </TableRow>
          ))}
          {!visible.length && (
            <TableRow>
              <TableCell colSpan={3}>No matching customers.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
function DateDemo({ picker = false }: { picker?: boolean }) {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 8, 20));
  const calendar = (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={new Date(2026, 8, 1)}
      className="mx-auto"
    />
  );
  return picker ? (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        {date?.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) ?? 'Pick a date'}
        <ChevronDown />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">{calendar}</PopoverContent>
    </Popover>
  ) : (
    calendar
  );
}
function ChoiceDemo() {
  return (
    <Combobox
      items={['Personal', 'Team', 'Enterprise']}
      defaultValue="Personal"
    >
      <ComboboxInput aria-label="Workspace type" />
      <ComboboxContent>
        <ComboboxEmpty>No results.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
function PageDemo() {
  const [page, setPage] = useState(1);
  return (
    <div className="space-y-3">
      <p className="text-center text-muted-foreground text-sm">
        Page {page} of 3
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={page === 1}
              onClick={(e) => {
                e.preventDefault();
                setPage(Math.max(1, page - 1));
              }}
            />
          </PaginationItem>
          {[1, 2, 3].map((n) => (
            <PaginationItem key={n}>
              <PaginationLink
                href="#"
                isActive={page === n}
                onClick={(e) => {
                  e.preventDefault();
                  setPage(n);
                }}
              >
                {n}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={page === 3}
              onClick={(e) => {
                e.preventDefault();
                setPage(Math.min(3, page + 1));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
function NavDemo() {
  const [active, setActive] = useState('Overview');
  return (
    <div className="space-y-4">
      <NavigationMenu>
        <NavigationMenuList>
          {['Overview', 'Activity', 'Settings'].map((n) => (
            <NavigationMenuItem key={n}>
              <NavigationMenuLink
                render={<button aria-label={n} />}
                active={active === n}
                onClick={() => setActive(n)}
              >
                {n}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <p className="text-muted-foreground text-sm">
        {active === 'Overview'
          ? 'You’re all caught up.'
          : active === 'Activity'
            ? 'Your workspace was updated today.'
            : 'Your preferences are up to date.'}
      </p>
    </div>
  );
}
function SidebarDemo({ integrated = false }: { integrated?: boolean }) {
  const [active, setActive] = useState('Overview');
  return (
    <SidebarProvider
      className={
        integrated
          ? 'preview-sidebar !min-h-0'
          : '!min-h-0 h-48 rounded-lg border overflow-hidden'
      }
    >
      <Sidebar
        collapsible="none"
        className={integrated ? '!w-full' : '!w-36 border-r'}
      >
        <SidebarContent>
          <SidebarMenu className="p-2">
            {['Overview', 'Projects', 'Settings'].map((n) => (
              <SidebarMenuItem key={n}>
                <SidebarMenuButton
                  isActive={active === n}
                  onClick={() => setActive(n)}
                >
                  <Folder />
                  <span>{n}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      {!integrated && <div className="p-5 text-sm">{active}</div>}
    </SidebarProvider>
  );
}
function ComposerDemo({ conversation }: { conversation: boolean }) {
  const [value, setValue] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        notify(
          conversation ? 'Message sent in this preview' : 'Search previewed',
        );
        if (conversation) setValue('');
      }}
    >
      <InputGroup>
        {!conversation && (
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        )}
        <InputGroupInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={conversation ? 'Message' : 'Search workspace'}
          placeholder={
            conversation ? 'Write a message…' : 'Search your workspace…'
          }
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="submit">
            {conversation ? 'Send' : 'Search'}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
function VolumeDemo() {
  const [value, setValue] = useState<number[]>([65]);
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span>Volume</span>
        <span className="text-muted-foreground tabular-nums">{value[0]}%</span>
      </div>
      <Slider
        value={value}
        onValueChange={(v) => setValue(Array.isArray(v) ? v : [v])}
        aria-label="Volume"
      />
    </div>
  );
}
export function ComponentPreview({
  id,
  scenario = 'overview',
  composed = false,
  screen,
}: {
  id: string;
  scenario?: string;
  composed?: boolean;
  screen?: Screen;
}) {
  const uid = useId();
  if (screen && hasMintVariant(id, screen.recipe))
    return <MintPreview id={id} screen={screen} />;
  switch (id) {
    case 'card':
      return (
        <div className="metrics">
          {(scenario === 'planning'
            ? [
                ['Tasks today', '8', '3 completed'],
                ['Focus time', '4.5h', 'Room to do your best work'],
                ['Meetings', '2', 'Next at 2:30 PM'],
              ]
            : [
                ['Total revenue', '₹45,231.89', '+20.10% this month'],
                ['Subscriptions', '+2,350', '+180.10% this month'],
                ['Active now', '573', '+201 since last hour'],
              ]
          ).map(([label, value, caption]) => (
            <Card key={label}>
              <CardContent>
                <p>{label}</p>
                <strong>{value}</strong>
                <small className={caption.startsWith('+')?'mint-positive':undefined}>{caption}</small>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    case 'chart':
      return (
        <div>
          <div className="flex justify-between mb-5">
            <div>
              <h3>Revenue</h3>
              <p className="text-xs text-muted-foreground mt-1">
                January – June 2026
              </p>
            </div>
            <span className="mint-positive flex items-center gap-2 text-sm">
              <ArrowUpRight size={16} />
              +12.80%
            </span>
          </div>
          <ChartContainer
            config={{ value: { label: 'Revenue', color: 'var(--chart-1)' } }}
            className="h-[210px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                fill="var(--color-value)"
                fillOpacity={0.08}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      );
    case 'table':
      return <DemoTable />;
    case 'data-table':
      return <DemoTable filterable />;
    case 'button':
      return (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => notify()}>Save changes</Button>
          <Button variant="outline" onClick={() => notify('Changes discarded')}>
            Cancel
          </Button>
        </div>
      );
    case 'button-group':
      return (
        <ButtonGroup>
          <Button variant="outline" onClick={() => notify('Archive previewed')}>
            Archive
          </Button>
          <Button variant="outline" onClick={() => notify('Report previewed')}>
            Report
          </Button>
          <Button
            variant="outline"
            onClick={() => notify('Snoozed in this preview')}
          >
            Snooze
          </Button>
        </ButtonGroup>
      );
    case 'input':
      return (
        <div className="preview-field">
          {composed && <Label htmlFor={uid}>Email address</Label>}
          <Input
            id={uid}
            aria-label="Email"
            type="email"
            placeholder="you@example.com"
          />
        </div>
      );
    case 'textarea':
      return (
        <div className="preview-field">
          {composed && <Label htmlFor={uid}>Notes</Label>}
          <Textarea
            id={uid}
            aria-label="Notes"
            placeholder="A little more context…"
          />
        </div>
      );
    case 'label':
      return (
        <div className="space-y-2">
          <Label htmlFor={uid}>Display name</Label>
          <Input id={uid} defaultValue="Alex Morgan" />
        </div>
      );
    case 'field':
      return (
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor={uid}>Workspace name</FieldLabel>
            <Input id={uid} defaultValue="Acme Studio" />
            <FieldDescription>
              This is how your workspace appears.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor={uid + 'email'}>Email</FieldLabel>
            <Input
              id={uid + 'email'}
              type="email"
              defaultValue="alex@example.com"
            />
          </Field>
        </div>
      );
    case 'input-group':
      return <ComposerDemo conversation={scenario === 'conversation'} />;
    case 'input-otp':
      return (
        <div className="space-y-3">
          <p className="text-sm">Enter your verification code</p>
          <InputOTP maxLength={6} aria-label="Verification code">
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-4">
          {!composed && <h3>Today’s priorities</h3>}
          {(scenario === 'settings'
            ? ['Include me in workspace updates']
            : [
                'Review the new designs',
                'Send project update',
                'Plan the next sprint',
              ]
          ).map((n, i) => (
            <label key={n} className="flex items-center gap-3 text-sm">
              <Checkbox defaultChecked={i === 0} />
              {n}
            </label>
          ))}
        </div>
      );
    case 'switch':
      return (
        <div className="space-y-5">
          {['Email notifications', 'Weekly digest', 'Product updates'].map(
            (n, i) => (
              <label
                key={n}
                className="flex items-center justify-between gap-3 text-sm"
              >
                {n}
                <Switch defaultChecked={i !== 2} />
              </label>
            ),
          )}
        </div>
      );
    case 'slider':
      return <VolumeDemo />;
    case 'progress':
      return (
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Weekly goal</span>
            <span className="text-muted-foreground">72%</span>
          </div>
          <Progress value={72} />
          <p className="text-muted-foreground text-xs">Keep up the momentum.</p>
        </div>
      );
    case 'select':
      return (
        <Select defaultValue="personal">
          <SelectTrigger className="w-full" aria-label="Workspace plan">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['personal', 'team', 'enterprise'].map((n) => (
              <SelectItem key={n} value={n}>
                {n[0].toUpperCase() + n.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'native-select':
      return (
        <NativeSelect aria-label="Region" defaultValue="Asia Pacific">
          <NativeSelectOption>Asia Pacific</NativeSelectOption>
          <NativeSelectOption>Europe</NativeSelectOption>
          <NativeSelectOption>North America</NativeSelectOption>
        </NativeSelect>
      );
    case 'combobox':
      return <ChoiceDemo />;
    case 'radio-group':
      return (
        <RadioGroup defaultValue="comfortable">
          {['Comfortable', 'Compact', 'Spacious'].map((n) => (
            <label key={n} className="flex items-center gap-2 text-sm">
              <RadioGroupItem value={n.toLowerCase()} />
              {n}
            </label>
          ))}
        </RadioGroup>
      );
    case 'toggle':
      return (
        <Toggle aria-label="Favorite" variant="outline">
          <Star />
          Favorite
        </Toggle>
      );
    case 'toggle-group':
      return (
        <ToggleGroup defaultValue={['week']} variant="outline">
          {['Day', 'Week', 'Month'].map((n) => (
            <ToggleGroupItem key={n} value={n.toLowerCase()}>
              {n}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      );
    case 'calendar':
      return <DateDemo />;
    case 'date-picker':
      return <DateDemo picker />;
    case 'accordion':
      return (
        <Accordion defaultValue={['a']}>
          <AccordionItem value="a">
            <AccordionTrigger>What’s coming up?</AccordionTrigger>
            <AccordionContent>
              Design review at 10:00 AM. Team sync at 2:30 PM.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>What can wait?</AccordionTrigger>
            <AccordionContent>
              Next week’s planning and the monthly report.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    case 'avatar':
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-11">
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">Alex Morgan</p>
            <p className="text-muted-foreground text-xs">
              Designer · Acme Studio
            </p>
          </div>
        </div>
      );
    case 'badge':
      return (
        <div className="flex flex-wrap gap-2">
          <Badge>Active</Badge>
          <Badge variant="secondary">In progress</Badge>
          <Badge variant="outline">Draft</Badge>
        </div>
      );
    case 'tabs':
      return (
        <Tabs defaultValue="overview">
          <TabsList>
            {['Overview', 'Activity', 'Settings'].map((n) => (
              <TabsTrigger key={n} value={n.toLowerCase()}>
                {n}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="overview" className="py-3">
            Everything is on track.
          </TabsContent>
          <TabsContent value="activity" className="py-3">
            Your workspace was updated today.
          </TabsContent>
          <TabsContent value="settings" className="py-3">
            <label
              htmlFor={uid + 'notifications'}
              className="flex items-center gap-3"
            >
              <Switch id={uid + 'notifications'} defaultChecked />
              Notifications
            </label>
          </TabsContent>
        </Tabs>
      );
    case 'collapsible':
      return (
        <Collapsible>
          <CollapsibleTrigger render={<Button variant="outline" />}>
            Project details
            <ChevronDown />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 text-sm text-muted-foreground">
            Acme redesign · Due September 30 · In progress
          </CollapsibleContent>
        </Collapsible>
      );
    case 'alert':
      return (
        <Alert>
          <Bell />
          <AlertTitle>You’re up to date</AlertTitle>
          <AlertDescription>All changes have been saved.</AlertDescription>
        </Alert>
      );
    case 'alert-dialog':
      return (
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="outline" />}>
            Reset preferences
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Reset preferences?</AlertDialogTitle>
            <AlertDialogDescription>
              This is a sample confirmation. No account data will change.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => notify('Reset previewed')}>
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    case 'dialog':
      return (
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            <Plus />
            New project
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create a project</DialogTitle>
            <DialogDescription>Try the project dialog.</DialogDescription>
            <Input aria-label="Project name" placeholder="Project name" />
            <DialogClose
              render={<Button />}
              onClick={() => notify('Project created in this preview')}
            >
              Create project
            </DialogClose>
          </DialogContent>
        </Dialog>
      );
    case 'sheet':
      return (
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>
            View details
            <ArrowUpRight />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Project details</SheetTitle>
              <SheetDescription>Acme Studio · In progress</SheetDescription>
            </SheetHeader>
            <div className="p-5 text-sm">
              Design system refresh. Due September 30.
            </div>
          </SheetContent>
        </Sheet>
      );
    case 'drawer':
      return (
        <Drawer>
          <DrawerTrigger render={<Button variant="outline" />}>
            Set a daily goal
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Daily goal</DrawerTitle>
              <DrawerDescription>
                Make a little progress each day.
              </DrawerDescription>
            </DrawerHeader>
            <div className="max-w-sm w-full mx-auto p-6">
              <Slider defaultValue={[60]} aria-label="Daily goal" />
            </div>
          </DrawerContent>
        </Drawer>
      );
    case 'popover':
      return (
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            <Settings />
            Display options
          </PopoverTrigger>
          <PopoverContent>
            <label
              htmlFor={uid + 'details'}
              className="flex justify-between gap-4 text-sm"
            >
              Show details
              <Switch id={uid + 'details'} defaultChecked />
            </label>
          </PopoverContent>
        </Popover>
      );
    case 'hover-card':
      return (
        <HoverCard>
          <HoverCardTrigger render={<Button variant="link" />}>
            @alex
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="font-medium">Alex Morgan</p>
            <p className="text-muted-foreground text-sm mt-2">
              Designer at Acme Studio.
            </p>
          </HoverCardContent>
        </HoverCard>
      );
    case 'tooltip':
      return (
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>
            <Star />
            Hover for a hint
          </TooltipTrigger>
          <TooltipContent>Add this item to your favorites.</TooltipContent>
        </Tooltip>
      );
    case 'dropdown-menu':
      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Actions
            <ChevronDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {['Edit', 'Duplicate', 'Archive'].map((n) => (
              <DropdownMenuItem
                key={n}
                onClick={() => notify(n + ' previewed')}
              >
                {n}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    case 'context-menu':
      return (
        <ContextMenu>
          <ContextMenuTrigger className="grid place-items-center h-24 border border-dashed rounded-md text-sm text-muted-foreground">
            Right-click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => notify('Copied in preview')}>
              Copy
            </ContextMenuItem>
            <ContextMenuItem onClick={() => notify('Archived in preview')}>
              Archive
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    case 'menubar':
      return (
        <Menubar>
          {['File', 'Edit', 'View'].map((n) => (
            <MenubarMenu key={n}>
              <MenubarTrigger>{n}</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={() => notify(n + ' action previewed')}>
                  {n === 'File'
                    ? 'New project'
                    : n === 'Edit'
                      ? 'Select all'
                      : 'Show details'}
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          ))}
        </Menubar>
      );
    case 'navigation-menu':
      return <NavDemo />;
    case 'command':
      return (
        <Command className="rounded-lg border">
          <CommandInput placeholder="Type a command…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {['Calendar', 'Profile', 'Settings'].map((n) => (
                <CommandItem key={n} onSelect={() => notify(n + ' selected')}>
                  <Search />
                  {n}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      );
    case 'breadcrumb':
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Workspace</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Projects</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
    case 'pagination':
      return <PageDemo />;
    case 'sidebar':
      return <SidebarDemo integrated={composed} />;
    case 'separator':
      return (
        <div className="space-y-4">
          <p className="text-sm">Personal workspace</p>
          <Separator />
          <p className="text-sm text-muted-foreground">Shared with your team</p>
        </div>
      );
    case 'resizable':
      return (
        <ResizablePanelGroup
          orientation="horizontal"
          className="min-h-36 rounded-lg border"
        >
          <ResizablePanel defaultSize="40%" minSize="20%">
            <div className="p-5 text-sm">Sidebar</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize="20%">
            <div className="p-5 text-sm">Drag to resize</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      );
    case 'scroll-area':
      return (
        <ScrollArea className="h-40 rounded-md border">
          <div className="p-4 space-y-3">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="text-sm border-b pb-2">
                Activity {i + 1} · Workspace updated
              </div>
            ))}
          </div>
        </ScrollArea>
      );
    case 'aspect-ratio':
      return (
        <AspectRatio
          ratio={16 / 9}
          className="rounded-lg bg-muted grid place-items-center"
        >
          <span className="font-mono text-sm text-muted-foreground">
            16 : 9
          </span>
        </AspectRatio>
      );
    case 'carousel':
      return (
        <div className="px-10">
          <Carousel>
            <CarouselContent>
              {['Discover', 'Create', 'Refine'].map((n, i) => (
                <CarouselItem key={n}>
                  <div className="rounded-lg bg-muted h-36 flex flex-col items-center justify-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      0{i + 1}
                    </span>
                    <span className="text-lg font-medium">{n}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      );
    case 'empty':
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Folder />
            </EmptyMedia>
            <EmptyTitle>Nothing here yet</EmptyTitle>
            <EmptyDescription>Your projects will appear here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    case 'item':
      return (
        <Item variant="outline">
          <ItemMedia variant="icon">
            <FileText />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Project brief</ItemTitle>
            <ItemDescription>Updated a few minutes ago.</ItemDescription>
          </ItemContent>
          <Badge variant="secondary">Draft</Badge>
        </Item>
      );
    case 'skeleton':
      return (
        <div className="flex gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      );
    case 'spinner':
      return (
        <div className="flex gap-2 items-center text-sm text-muted-foreground">
          <Spinner />
          Loading preview
        </div>
      );
    case 'toast':
      return (
        <Button
          variant="outline"
          onClick={() => notify('Your changes are saved')}
        >
          Show toast
        </Button>
      );
    case 'kbd':
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Quick search <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </div>
      );
    case 'typography':
      return (
        <article className="space-y-3">
          <h3 className="!text-xl !font-semibold tracking-tight">
            Good work starts here.
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A little clarity makes room for your next big idea.
          </p>
          <blockquote className="border-l-2 pl-4 text-sm italic">
            Make something that matters.
          </blockquote>
        </article>
      );
    case 'attachment':
      return (
        <Attachment>
          <AttachmentMedia>
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Project brief.pdf</AttachmentTitle>
            <AttachmentDescription>240 KB · PDF</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      );
    case 'bubble':
      return (
        <BubbleGroup>
          <Bubble variant="secondary">
            <BubbleContent>Ready to review the new designs?</BubbleContent>
          </Bubble>
          <Bubble align="end">
            <BubbleContent>Let’s take a look.</BubbleContent>
          </Bubble>
        </BubbleGroup>
      );
    case 'message':
      return (
        <Message>
          <MessageContent>
            <MessageHeader>Alex · Design</MessageHeader>
            <Bubble variant="secondary">
              <BubbleContent>
                The latest explorations are ready. Would love your thoughts.
              </BubbleContent>
            </Bubble>
            <MessageFooter>10:42 AM</MessageFooter>
          </MessageContent>
        </Message>
      );
    case 'marker':
      return (
        <Marker variant="separator">
          <MarkerContent>Today</MarkerContent>
        </Marker>
      );
    case 'direction':
      return (
        <DirectionProvider direction="rtl">
          <div
            dir="rtl"
            className="flex items-center gap-3 rounded-lg border p-4"
          >
            <Mail size={18} />
            <span>مرحباً بك</span>
            <Badge variant="secondary">RTL</Badge>
          </div>
        </DirectionProvider>
      );
    case 'message-scroller':
      return (
        <MessageScrollerProvider>
          <MessageScroller className="!h-48 rounded-lg border">
            <MessageScrollerViewport>
              <MessageScrollerContent className="p-4">
                {[
                  'Welcome to the workspace.',
                  'Your project is ready.',
                  'Let’s make something great.',
                  'Share your ideas here.',
                ].map((s, i) => (
                  <MessageScrollerItem key={s}>
                    <Bubble
                      variant={i % 2 ? 'default' : 'secondary'}
                      align={i % 2 ? 'end' : 'start'}
                    >
                      <BubbleContent>{s}</BubbleContent>
                    </Bubble>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
          </MessageScroller>
        </MessageScrollerProvider>
      );
    case 'questionnaire':
      return (
        <Questionnaire
          onSubmit={(e) => {
            e.preventDefault();
            notify('Preference saved in preview');
          }}
        >
          <QuestionnaireItem name="focus" required>
            <QuestionnaireTitle>
              What would you like to focus on?
            </QuestionnaireTitle>
            <QuestionnaireChoices>
              {['Design', 'Development', 'Planning'].map((n) => (
                <QuestionnaireChoice key={n} value={n}>
                  {n}
                </QuestionnaireChoice>
              ))}
            </QuestionnaireChoices>
          </QuestionnaireItem>
          <QuestionnaireSubmit>Continue</QuestionnaireSubmit>
        </Questionnaire>
      );
    default:
      throw new Error(`Unregistered component: ${id}`);
  }
}
