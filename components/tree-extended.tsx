'use client';
import { FinanceChart } from './finance-chart';
import { FinanceFlow } from './finance-flow';
import type {
  WorkflowKind,
  FlowStage,
  FlowState,
} from '@/lib/fintech/workflows';
import { FeedItem, PostComposer, InboxPane } from './social-primitives';
import { ListingCard } from './listing-card';
import { Fragment, useState, type ReactNode } from 'react';
import type { UINode, Value } from '@/lib/tree/spec';
import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Toggle } from './ui/toggle';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { NativeSelect, NativeSelectOption } from './ui/native-select';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from './ui/combobox';
import { Calendar } from './ui/calendar';
import { InputGroup, InputGroupInput, InputGroupAddon } from './ui/input-group';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { Field, FieldLabel, FieldDescription } from './ui/field';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './ui/hover-card';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from './ui/drawer';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from './ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from './ui/context-menu';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from './ui/menubar';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from './ui/navigation-menu';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from './ui/command';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from './ui/breadcrumb';
import { Pagination, PaginationContent, PaginationItem } from './ui/pagination';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './ui/sidebar';
import { AspectRatio } from './ui/aspect-ratio';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from './ui/resizable';
import { ScrollArea } from './ui/scroll-area';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from './ui/empty';
import { Item, ItemContent, ItemTitle, ItemDescription } from './ui/item';
import { Skeleton } from './ui/skeleton';
import { Spinner } from './ui/spinner';
import { Kbd } from './ui/kbd';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from './ui/table';
import { Bubble, BubbleContent } from './ui/bubble';
import {
  Message,
  MessageContent,
  MessageHeader,
  MessageFooter,
} from './ui/message';
import {
  Attachment,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
} from './ui/attachment';
import { Marker, MarkerContent } from './ui/marker';
import { DirectionProvider } from './ui/direction';
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from './ui/message-scroller';
import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireTitle,
  QuestionnaireChoices,
  QuestionnaireChoice,
  QuestionnaireSubmit,
} from './ui/questionnaire';

export function TreeExtended({
  node,
  children,
  childIds,
  fieldControlId,
  ownsLabel = true,
  value,
  change,
  open,
  setOpen,
  notify,
  mobile,
}: {
  node: UINode;
  children: ReactNode[];
  childIds: string[];
  fieldControlId?: string;
  ownsLabel?: boolean;
  value: Value;
  change: (value: Value) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  notify: (message: string) => void;
  mobile: boolean;
}) {
  const p = node.props;
  const text = (key: string, fallback = '') =>
    typeof p[key] === 'string' ? (p[key] as string) : fallback;
  const num = (key: string, fallback: number) =>
    typeof p[key] === 'number' ? (p[key] as number) : fallback;
  const id = 'tree-' + node.id,
    label = text('label'),
    options = (p.options ?? []) as string[];
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ column: number; reverse: boolean } | null>(
    null,
  );
  const content = (
    <div className="tree-stack tree-column tree-extension-content">
      {children}
    </div>
  );
  const choose = (option: string) => change(option);
  const date =
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(value + 'T12:00:00')
      : undefined;
  const calendar = (
    <Calendar
      mode="single"
      selected={date}
      defaultMonth={date}
      onSelect={(d) =>
        change(
          d
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            : '',
        )
      }
    />
  );
  switch (node.kind) {
    case 'finance-chart':
      return (
        <FinanceChart
          key={`${node.id}-${text('period')}-${text('style')}`}
          title={text('title')}
          series={p.series as { label: string; value: number }[]}
          period={text('period', '1W')}
          style={text('style', 'line')}
        />
      );
    case 'finance-flow':
      return (
        <FinanceFlow
          key={`${node.id}-${text('workflow')}-${text('initialStage')}-${text('outcome')}-${text('currency')}`}
          side={p.side as 'Buy' | 'Sell' | undefined}
          kind={p.workflow as WorkflowKind}
          initialStage={p.initialStage as FlowStage | undefined}
          outcome={p.outcome as FlowState['outcome'] | undefined}
          currency={text('currency', 'INR')}
          density={text('density', 'compact')}
        />
      );
    case 'aspect-ratio':
      return <AspectRatio ratio={num('ratio', 16 / 9)}>{content}</AspectRatio>;
    case 'collapsible':
      return (
        <Collapsible defaultOpen={p.open === true}>
          <CollapsibleTrigger render={<Button variant="ghost" />}>
            {label}
          </CollapsibleTrigger>
          <CollapsibleContent>{content}</CollapsibleContent>
        </Collapsible>
      );
    case 'resizable':
      return mobile ? (
        content
      ) : (
        <ResizablePanelGroup
          orientation={p.direction === 'vertical' ? 'vertical' : 'horizontal'}
          className="min-h-64"
          aria-label={label}
        >
          {children.map((child, i) => (
            <Fragment key={childIds[i]}>
              {i > 0 && <ResizableHandle withHandle />}
              <ResizablePanel
                minSize={
                  p.preset === 'workspace'
                    ? children.length === 3 && i === 0
                      ? '14%'
                      : '22%'
                    : '15%'
                }
                defaultSize={
                  p.preset === 'workspace'
                    ? children.length === 3
                      ? ['18%', '52%', '30%'][i]
                      : ['65%', '35%'][i]
                    : undefined
                }
              >
                <div className="p-4">{child}</div>
              </ResizablePanel>
            </Fragment>
          ))}
        </ResizablePanelGroup>
      );
    case 'scroll-area':
      return (
        <ScrollArea
          style={{ height: num('height', 240) }}
          aria-label={label}
          tabIndex={0}
        >
          {content}
        </ScrollArea>
      );
    case 'button-group':
      return (
        <ButtonGroup aria-label={label} className="flex-wrap">
          {children}
        </ButtonGroup>
      );
    case 'field':
      return (
        <Field>
          <FieldLabel
            id={id + '-label'}
            htmlFor={fieldControlId ? 'tree-' + fieldControlId : undefined}
          >
            {label}
          </FieldLabel>
          {children}
          <FieldDescription>{text('description')}</FieldDescription>
        </Field>
      );
    case 'label':
      return <Label htmlFor={'tree-' + text('target')}>{text('text')}</Label>;
    case 'input-group':
      return (
        <div className="tree-field">
          {ownsLabel && <Label htmlFor={id}>{label}</Label>}
          <InputGroup>
            {p.prefix ? (
              <InputGroupAddon>{text('prefix')}</InputGroupAddon>
            ) : null}
            <InputGroupInput
              id={id}
              value={String(value)}
              required={p.required === true}
              placeholder={text('placeholder')}
              onChange={(e) => change(e.target.value)}
            />
            {p.suffix ? (
              <InputGroupAddon align="inline-end">
                {text('suffix')}
              </InputGroupAddon>
            ) : null}
          </InputGroup>
        </div>
      );
    case 'input-otp':
      return (
        <div className="tree-field">
          {ownsLabel && <Label htmlFor={id}>{label}</Label>}
          <InputOTP
            id={id}
            aria-label={label}
            value={String(value)}
            onChange={(v) => change(v)}
            maxLength={num('length', 6)}
            pattern="[0-9]*"
            required={p.required === true}
          >
            <InputOTPGroup>
              {Array.from({ length: num('length', 6) }, (_, i) => (
                <InputOTPSlot index={i} key={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      );
    case 'native-select':
      return (
        <div className="tree-field">
          {ownsLabel && <Label htmlFor={id}>{label}</Label>}
          <NativeSelect
            id={id}
            value={String(value)}
            required={p.required === true}
            onChange={(e) => change(e.target.value)}
          >
            {value === '' && (
              <NativeSelectOption value="">Choose an option</NativeSelectOption>
            )}
            {options.map((o) => (
              <NativeSelectOption key={o} value={o}>
                {o}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      );
    case 'combobox':
      return (
        <div className="tree-field">
          {ownsLabel && <Label htmlFor={id}>{label}</Label>}
          <Combobox
            items={options}
            value={String(value) || null}
            onValueChange={(v) => change(v ?? '')}
            required={p.required === true}
          >
            <ComboboxInput id={id} aria-label={label} />
            <ComboboxContent>
              <ComboboxEmpty>No results.</ComboboxEmpty>
              <ComboboxList>
                {(o: string) => (
                  <ComboboxItem key={o} value={o}>
                    {o}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      );
    case 'slider':
      return (
        <div className="tree-field">
          {ownsLabel ? (
            <Label id={id}>
              {label} · {String(value)}
            </Label>
          ) : (
            <span id={id}>{String(value)}</span>
          )}
          <Slider
            aria-labelledby={id}
            value={[Number(value)]}
            min={num('min', 0)}
            max={num('max', 100)}
            step={num('step', 1)}
            onValueChange={(v) => change(Array.isArray(v) ? v[0] : v)}
          />
        </div>
      );
    case 'toggle':
      return (
        <Toggle
          id={id}
          pressed={Boolean(value)}
          onPressedChange={change}
          aria-label={label}
          variant="outline"
        >
          {label}
        </Toggle>
      );
    case 'toggle-group':
      return (
        <ToggleGroup
          aria-label={label}
          value={value ? [String(value)] : []}
          onValueChange={(v) => change(v[0] ?? '')}
          variant="outline"
        >
          {options.map((o) => (
            <ToggleGroupItem value={o} key={o}>
              {o}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      );
    case 'calendar':
      return (
        <fieldset className="tree-field" aria-label={label}>
          <legend>{label}</legend>
          {p.required === true && (
            <Input
              type="date"
              aria-label={label}
              value={String(value)}
              onChange={(e) => change(e.target.value)}
              required
            />
          )}
          {calendar}
        </fieldset>
      );
    case 'date-picker':
      return (
        <div className="tree-field">
          {ownsLabel && <Label htmlFor={id}>{label}</Label>}
          <div className="tree-date-control">
            <Input
              id={id}
              type="date"
              value={String(value)}
              onChange={(e) => change(e.target.value)}
              required={p.required === true}
            />
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    aria-label={'Open calendar for ' + label}
                  />
                }
              >
                Calendar
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">{calendar}</PopoverContent>
            </Popover>
          </div>
        </div>
      );
    case 'dropdown-menu':
      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            {label}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {options.map((o) => (
              <DropdownMenuItem key={o} onClick={() => choose(o)}>
                {o}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    case 'context-menu':
      if (mobile)
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              {label}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {options.map((o) => (
                <DropdownMenuItem key={o} onClick={() => choose(o)}>
                  {o}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      return (
        <ContextMenu>
          <ContextMenuTrigger className="rounded-lg border p-4" tabIndex={0}>
            {label}
          </ContextMenuTrigger>
          <ContextMenuContent>
            {options.map((o) => (
              <ContextMenuItem key={o} onClick={() => choose(o)}>
                {o}
              </ContextMenuItem>
            ))}
          </ContextMenuContent>
        </ContextMenu>
      );
    case 'menubar':
      return (
        <Menubar aria-label={label}>
          <MenubarMenu>
            <MenubarTrigger>{label}</MenubarTrigger>
            <MenubarContent>
              {options.map((o) => (
                <MenubarItem key={o} onClick={() => choose(o)}>
                  {o}
                </MenubarItem>
              ))}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      );
    case 'command':
      return (
        <Command className="border rounded-lg" aria-label={label}>
          <CommandInput placeholder={label} />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            {options.map((o) => (
              <CommandItem value={o} key={o} onSelect={() => choose(o)}>
                {o}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      );
    case 'navigation-menu':
      return (
        <NavigationMenu aria-label={label}>
          <NavigationMenuList className="flex-wrap">
            {options.map((o) => (
              <NavigationMenuItem key={o}>
                <NavigationMenuLink
                  render={<button type="button" aria-label={o} />}
                  active={value === o}
                  onClick={() => choose(o)}
                >
                  {o}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      );
    case 'breadcrumb':
      return (
        <Breadcrumb aria-label={label}>
          <BreadcrumbList>
            {options.map((o, i) => (
              <Fragment key={o}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {value === o ? (
                    <BreadcrumbPage>{o}</BreadcrumbPage>
                  ) : (
                    <button type="button" onClick={() => choose(o)}>
                      {o}
                    </button>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      );
    case 'sidebar':
      return mobile ? (
        <nav aria-label={label} className="flex gap-2 overflow-x-auto">
          {options.map((o) => (
            <Button
              key={o}
              variant={value === o ? 'secondary' : 'ghost'}
              onClick={() => choose(o)}
            >
              {o}
            </Button>
          ))}
        </nav>
      ) : (
        <SidebarProvider className="!min-h-0">
          <Sidebar collapsible="none" className="!w-full">
            <SidebarContent>
              <SidebarMenu aria-label={label}>
                {options.map((o) => (
                  <SidebarMenuItem key={o}>
                    <SidebarMenuButton
                      isActive={value === o}
                      onClick={() => choose(o)}
                    >
                      {o}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
    case 'pagination':
      return (
        <Pagination aria-label={label}>
          <PaginationContent className="flex-wrap">
            {Array.from({ length: num('pages', 2) }, (_, i) => (
              <PaginationItem key={i}>
                <Button
                  variant={value === i + 1 ? 'outline' : 'ghost'}
                  aria-current={value === i + 1 ? 'page' : undefined}
                  onClick={() => change(i + 1)}
                >
                  {i + 1}
                </Button>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      );
    case 'carousel':
      return (
        <div className="px-10">
          <Carousel aria-label={label}>
            <CarouselContent>
              {children.map((child, i) => (
                <CarouselItem key={childIds[i]}>{child}</CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      );
    case 'popover':
      return (
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            {label}
          </PopoverTrigger>
          <PopoverContent>{content}</PopoverContent>
        </Popover>
      );
    case 'hover-card':
      return (
        <HoverCard>
          <HoverCardTrigger render={<Button variant="ghost" />}>
            {label}
          </HoverCardTrigger>
          <HoverCardContent>{content}</HoverCardContent>
        </HoverCard>
      );
    case 'tooltip':
      return (
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" />}>
            {label}
          </TooltipTrigger>
          <TooltipContent>{text('text')}</TooltipContent>
        </Tooltip>
      );
    case 'sheet':
      return (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side={text('side', 'right') as 'left' | 'right' | 'top' | 'bottom'}
          >
            <SheetHeader>
              <SheetTitle>{text('title')}</SheetTitle>
              <SheetDescription>
                {text('description', 'Details')}
              </SheetDescription>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      );
    case 'drawer':
      return (
        <Drawer
          open={open}
          onOpenChange={setOpen}
          swipeDirection={
            text('side') === 'left'
              ? 'left'
              : text('side') === 'right'
                ? 'right'
                : text('side') === 'top'
                  ? 'up'
                  : 'down'
          }
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{text('title')}</DrawerTitle>
              <DrawerDescription>
                {text('description', 'Details')}
              </DrawerDescription>
            </DrawerHeader>
            {content}
          </DrawerContent>
        </Drawer>
      );
    case 'alert-dialog':
      return (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogTitle>{text('title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {text('description')}
            </AlertDialogDescription>
            {content}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setOpen(false);
                  notify(text('confirm') + ' · local preview');
                }}
              >
                {text('confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    case 'empty':
      return (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{text('title')}</EmptyTitle>
            <EmptyDescription>{text('description')}</EmptyDescription>
          </EmptyHeader>
          {children}
        </Empty>
      );
    case 'item':
      return (
        <Item>
          <ItemContent>
            <ItemTitle>{text('title')}</ItemTitle>
            {p.description ? (
              <ItemDescription>{text('description')}</ItemDescription>
            ) : null}
            {children}
          </ItemContent>
        </Item>
      );
    case 'kbd':
      return <Kbd>{text('text')}</Kbd>;
    case 'skeleton':
      return (
        <output aria-label={label} className="block space-y-2">
          {Array.from({ length: num('lines', 3) }, (_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </output>
      );
    case 'spinner':
      return (
        <output className="flex items-center gap-2">
          <Spinner />
          {label}
        </output>
      );
    case 'toast':
      return (
        <Button
          variant="outline"
          onClick={() =>
            notify(
              [text('title'), text('description')].filter(Boolean).join(' · '),
            )
          }
        >
          {label}
        </Button>
      );
    case 'data-table': {
      const columns = p.columns as string[];
      const numericColumns = columns.map(
        (_, i) =>
          (p.rows as string[][]).length > 0 &&
          (p.rows as string[][]).every((row) =>
            /^[₹$€£]?[-+]?\d[\d,]*(?:\.\d+)?%?$/.test(row[i].trim()),
          ),
      );
      let rows = (p.rows as string[][]).filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(search.toLowerCase())),
      );
      if (sort)
        rows = [...rows].sort(
          (a, b) =>
            a[sort.column].localeCompare(b[sort.column], undefined, {
              numeric: true,
            }) * (sort.reverse ? -1 : 1),
        );
      return (
        <div className="space-y-3">
          {p.title ? <h2>{text('title')}</h2> : null}
          <Input
            aria-label={'Search ' + text('title', 'table')}
            placeholder="Search rows"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, i) => (
                  <TableHead
                    key={col}
                    style={{ textAlign: numericColumns[i] ? 'right' : 'left' }}
                    aria-sort={
                      sort?.column === i
                        ? sort.reverse
                          ? 'descending'
                          : 'ascending'
                        : 'none'
                    }
                  >
                    <button
                      type="button"
                      className="w-full text-inherit"
                      style={{ textAlign: 'inherit' }}
                      onClick={() =>
                        setSort({
                          column: i,
                          reverse: sort?.column === i && !sort.reverse,
                        })
                      }
                    >
                      {col}
                      {sort?.column === i && (
                        <span aria-hidden="true">
                          {sort.reverse ? ' ↓' : ' ↑'}
                        </span>
                      )}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell
                      key={j}
                      style={{
                        textAlign: numericColumns[j] ? 'right' : 'left',
                        fontVariantNumeric: numericColumns[j]
                          ? 'tabular-nums'
                          : undefined,
                      }}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    No matching rows.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      );
    }
    case 'attachment':
      return (
        <Attachment>
          <AttachmentContent>
            <AttachmentTitle>{text('name')}</AttachmentTitle>
            <AttachmentDescription>{text('detail')}</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      );
    case 'bubble':
      return (
        <Bubble
          align={p.align === 'end' ? 'end' : 'start'}
          variant={p.align === 'end' ? 'default' : 'secondary'}
        >
          <BubbleContent>{text('text')}</BubbleContent>
        </Bubble>
      );
    case 'message':
      return (
        <Message align={p.align === 'end' ? 'end' : 'start'}>
          <MessageContent>
            <MessageHeader>{text('author')}</MessageHeader>
            <Bubble
              align={p.align === 'end' ? 'end' : 'start'}
              variant={p.align === 'end' ? 'default' : 'secondary'}
            >
              <BubbleContent>{text('text')}</BubbleContent>
            </Bubble>
            {p.time ? <MessageFooter>{text('time')}</MessageFooter> : null}
          </MessageContent>
        </Message>
      );
    case 'marker':
      return (
        <Marker variant="separator">
          <MarkerContent>{text('text')}</MarkerContent>
        </Marker>
      );
    case 'direction':
      return (
        <DirectionProvider direction={p.direction === 'rtl' ? 'rtl' : 'ltr'}>
          <div dir={text('direction', 'ltr')}>{content}</div>
        </DirectionProvider>
      );
    case 'message-scroller':
      return (
        <MessageScrollerProvider>
          <MessageScroller
            style={{ height: num('height', 320) }}
            aria-label={label}
          >
            <MessageScrollerViewport>
              <MessageScrollerContent>
                {children.map((child, i) => (
                  <MessageScrollerItem key={childIds[i]}>
                    {child}
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
            const data = new FormData(e.currentTarget);
            const answer = data.get(text('bind'));
            if (typeof answer === 'string') change(answer);
            notify('Response saved in this preview');
          }}
        >
          <QuestionnaireItem name={text('bind')} required>
            <QuestionnaireTitle>{label}</QuestionnaireTitle>
            <QuestionnaireChoices>
              {options.map((o) => (
                <QuestionnaireChoice
                  key={o}
                  value={o}
                  checked={value === o}
                  onChange={() => change(o)}
                >
                  {o}
                </QuestionnaireChoice>
              ))}
            </QuestionnaireChoices>
          </QuestionnaireItem>
          <QuestionnaireSubmit>
            {text('submit', 'Continue')}
          </QuestionnaireSubmit>
        </Questionnaire>
      );
    case 'feed-item':
      return (
        <FeedItem
          author={text('author')}
          handle={text('handle')}
          body={text('body')}
          time={text('time', 'Now')}
        />
      );
    case 'post-composer':
      return (
        <PostComposer
          label={text('label')}
          author={text('author')}
          placeholder={text('placeholder', "What's happening?")}
        />
      );
    case 'inbox-pane':
      return <InboxPane title={text('title')} />;
    case 'listing-card':
      return (
        <ListingCard
          saved={Boolean(value)}
          onSavedChange={change}
          title={text('title')}
          location={text('location')}
          price={text('price')}
          dates={text('dates')}
          rating={text('rating', '4.9')}
          scene={text('scene', 'coast')}
          tag={text('tag')}
        />
      );
    default:
      throw new Error(`No extended renderer for ${node.kind}`);
  }
}
