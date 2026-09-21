'use client';
import {
  bindingSignature,
  compatibleEdits,
  type LocalEdits,
} from '@/lib/tree/edit-state';
import { listingMatches } from '@/lib/tree/listing';
import { MintThemeContext } from './mint-theme';
import { MintSurface } from './tree-surface';
import { Spinner } from './ui/spinner';
import { TreeMint } from './tree-mint';
import { TreeExtended } from './tree-extended';
import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  defaultsFor,
  type UIDocument,
  type UINode,
  type Value,
} from '@/lib/tree/spec';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  visualLayoutProps,
  hasConversationSplit,
} from '@/lib/tree/visual-layout';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { toast } from '@/components/ui/toast';
import {
  Home,
  Settings,
  Bell,
  Mail,
  KeyRound,
  Chart,
  Folder,
  Grid,
  Check,
  Star,
  Search,
  Plus,
  ArrowUpRight,
  Monitor,
  Smartphone,
} from '@/components/icons';
const icons = {
  Home,
  Settings,
  Bell,
  Mail,
  KeyRound,
  Chart,
  Folder,
  Grid,
  Check,
  Star,
  Search,
  Plus,
  ArrowUpRight,
  Monitor,
  Smartphone,
};

/** Only this registry can translate model output into rendered UI. */
export function TreeRenderer({
  document,
  busy = false,
}: {
  document: UIDocument;
  busy?: boolean;
}) {
  const [edits, setEdits] = useState<LocalEdits>({});
  const state = {
    ...defaultsFor(document),
    ...compatibleEdits(document, edits),
  };
  const [feedback, setFeedback] = useState('');
  const set = (key: string, value: Value) =>
    setEdits((old) => ({
      ...old,
      [key]: { value, signature: bindingSignature(document, key) },
    }));
  const notify = (message: string) => {
    setFeedback(message);
    toast.add({ title: message, type: 'success' });
  };
  const render = (node: UINode): ReactNode => {
    const p = visualLayoutProps(document, node);
    const text = (key: string, fallback = '') =>
      typeof p[key] === 'string' ? (p[key] as string) : fallback;
    const number = (key: string, fallback: number) =>
      typeof p[key] === 'number' ? (p[key] as number) : fallback;
    const children = document.nodes
      .filter(
        (n) =>
          n.parent === node.id &&
          listingMatches(n, state) &&
          !(node.kind === 'field' && n.kind === 'label'),
      )
      .map((n) => (
        <div
          key={n.id}
          data-tree-node={n.id}
          data-kind={n.kind}
          hidden={n.when && state[n.when.key] !== n.when.equals}
        >
          {render(n)}
        </div>
      ));
    if (
      !children.length &&
      document.nodes.some(
        (n) => n.parent === node.id && n.kind === 'listing-card',
      )
    )
      children.push(
        <output key="empty-listings">No stays match these filters.</output>,
      );
    const bind = text('bind', node.id),
      value = state[bind] ?? '';
    const label = text('label');
    const parentNode = document.nodes.find((n) => n.id === node.parent);
    const ownsLabel = parentNode?.kind !== 'field';
    const options = (p.options ?? []) as string[];
    const style = {
      '--tree-gap': number('gap', 24) + 'px',
      '--tree-columns': number('columns', 2),
      alignItems:
        text('align', 'stretch') === 'start'
          ? 'flex-start'
          : text('align', 'stretch') === 'end'
            ? 'flex-end'
            : text('align', 'stretch'),
    } as CSSProperties;
    const header = p.title ? (
      <header className="tree-section-heading">
        <h2>{text('title')}</h2>
        {p.description ? <p>{text('description')}</p> : null}
      </header>
    ) : null;
    const description = p.description ? (
      <p className="tree-description">{text('description')}</p>
    ) : null;
    const id = 'tree-' + node.id;
    const action = (button: HTMLButtonElement) => {
      switch (p.action) {
        case 'reset':
          setEdits({});
          notify('Preview reset');
          break;
        case 'toggle':
          set(text('target'), !state[text('target')]);
          break;
        case 'set':
          set(text('target'), p.value as Value);
          break;
        case 'submit': {
          const form = button.closest('form');
          if (!form || form.reportValidity())
            notify(text('message', 'Saved in this preview'));
          break;
        }
        default:
          notify(text('message', 'Action completed in this preview'));
      }
    };
    if (node.kind.startsWith('mint-') || node.kind === 'financial-value')
      return (
        <TreeMint
          node={node}
          value={value}
          change={(v) => set(bind, v)}
          notify={notify}
          hideLabel={
            node.kind === 'financial-value' &&
            ((parentNode?.kind === 'mint-row' &&
              parentNode.props.title === label) ||
              (parentNode?.kind === 'stack' &&
                parentNode.props.direction === 'row' &&
                document.nodes.some(
                  (n) =>
                    n.parent === node.parent &&
                    n.kind === 'text' &&
                    n.props.text === label,
                )))
          }
          navigationTitle={
            typeof state[text('target')] === 'string'
              ? String(state[text('target')])
              : undefined
          }
        >
          {children}
        </TreeMint>
      );
    switch (node.kind) {
      case 'page':
        return (
          <main
            className={`tree-page tree-width-${text('width', 'wide')}`}
            style={style}
          >
            {children}
          </main>
        );
      case 'stack':
        return (
          <div
            className={`tree-stack tree-${text('direction', 'column')} ${hasConversationSplit(document, node) ? 'tree-conversation-split' : ''}`}
            style={{
              ...style,
              justifyContent: (
                {
                  start: 'flex-start',
                  end: 'flex-end',
                  between: 'space-between',
                  center: 'center',
                } as Record<string, string>
              )[text('justify', 'start')],
            }}
          >
            {children}
          </div>
        );
      case 'grid':
        return (
          <div
            className={`tree-grid tree-ratio-${text('ratio', 'equal')}`}
            style={style}
          >
            {children}
          </div>
        );
      case 'panel':
        return (
          <MintSurface
            className={`tree-panel tree-surface-${text('surface', 'card')} ${hasConversationSplit(document, node) ? 'tree-conversation-split' : ''}`}
            style={style}
          >
            {header}
            {children}
          </MintSurface>
        );
      case 'form':
        return (
          <form
            className="tree-form"
            style={style}
            onSubmit={(e) => {
              e.preventDefault();
              notify('Saved in this preview');
            }}
          >
            {header}
            {children}
          </form>
        );
      case 'heading': {
        const Tag =
          number('level', 2) === 1
            ? 'h1'
            : number('level', 2) === 2
              ? 'h2'
              : 'h3';
        return <Tag className="tree-heading">{text('text')}</Tag>;
      }
      case 'text':
        return (
          <p
            className={`tree-text tree-tone-${text('tone', 'primary')} tree-text-${text('size', 'body')}`}
          >
            {p.bind ? String(value) : text('text')}
          </p>
        );
      case 'avatar':
        return (
          <Avatar
            style={{ width: number('size', 48), height: number('size', 48) }}
          >
            <AvatarFallback>
              {text('name')
                .split(/\s+/)
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        );
      case 'icon': {
        const Icon = icons[text('name') as keyof typeof icons] as typeof Home;
        return <Icon size={number('size', 20)} />;
      }
      case 'metric':
        return (
          <div className="tree-metric">
            <p>{label}</p>
            <strong className={`tree-tone-${text('tone', 'primary')}`}>
              {text('value')}
            </strong>
            {p.detail ? <p>{text('detail')}</p> : null}
          </div>
        );
      case 'badge':
        return (
          <Badge
            variant={text('variant', 'outline') as 'outline' | 'secondary'}
          >
            {text('text')}
          </Badge>
        );
      case 'separator':
        return <Separator />;
      case 'input':
      case 'textarea':
        return (
          <div className="tree-field">
            {ownsLabel && <Label htmlFor={id}>{label}</Label>}
            {node.kind === 'input' ? (
              <Input
                id={id}
                type={text('type', 'text')}
                value={String(value)}
                placeholder={text('placeholder')}
                required={p.required === true}
                onChange={(e) => set(bind, e.target.value)}
              />
            ) : (
              <Textarea
                id={id}
                value={String(value)}
                placeholder={text('placeholder')}
                required={p.required === true}
                onChange={(e) => set(bind, e.target.value)}
              />
            )}
            {description}
          </div>
        );
      case 'switch':
      case 'checkbox':
        return (
          <div className="tree-preference">
            <div>
              {ownsLabel && <Label htmlFor={id}>{label}</Label>}
              {description}
            </div>
            {node.kind === 'switch' ? (
              <Switch
                aria-label={label}
                id={id}
                checked={Boolean(value)}
                onCheckedChange={(v) => set(bind, v)}
              />
            ) : (
              <Checkbox
                aria-label={label}
                id={id}
                checked={Boolean(value)}
                onCheckedChange={(v) => set(bind, v === true)}
              />
            )}
          </div>
        );
      case 'select':
        return (
          <div className="tree-field">
            {ownsLabel && <Label htmlFor={id}>{label}</Label>}
            <Select
              name={bind}
              required={p.required === true}
              value={String(value)}
              onValueChange={(v) => set(bind, v ?? '')}
            >
              <SelectTrigger id={id}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'radio':
        return (
          <fieldset className="tree-field">
            {ownsLabel && <legend>{label}</legend>}
            <RadioGroup
              id={id}
              aria-label={label}
              name={bind}
              required={p.required === true}
              value={String(value)}
              onValueChange={(v) => set(bind, String(v))}
            >
              {options.map((option, i) => (
                <div className="tree-radio" key={option}>
                  <RadioGroupItem value={option} id={id + '-' + i} />
                  <Label htmlFor={id + '-' + i}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>
        );
      case 'button':
        return (
          <Button
            type="button"
            variant={
              text('variant', 'default') as
                | 'default'
                | 'outline'
                | 'ghost'
                | 'destructive'
            }
            data-mint-size={text('size', 'medium')}
            data-mint-accent={p.accent === true}
            disabled={p.disabled === true || p.loading === true}
            aria-busy={p.loading === true}
            aria-label={label}
            onClick={(e) => action(e.currentTarget)}
          >
            <span style={p.loading ? { visibility: 'hidden' } : undefined}>
              {label}
            </span>
            {p.loading ? <Spinner className="absolute" /> : null}
          </Button>
        );
      case 'progress':
        return (
          <div className="tree-field">
            <div className="tree-between">
              <span>{label}</span>
              <span>{number('value', 0)}%</span>
            </div>
            <Progress value={number('value', 0)} aria-label={label} />
          </div>
        );
      case 'table':
        return (
          <div className="tree-records">
            {header}
            <Table>
              <TableHeader>
                <TableRow>
                  {(p.columns as string[]).map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(p.rows as string[][]).map((row, i) => (
                  <TableRow key={i}>
                    {row.map((cell, j) => (
                      <TableCell key={j}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      case 'chart':
        return (
          <div className="tree-chart">
            {header}
            <ChartContainer
              aria-label={text('title', 'Chart')}
              config={{
                value: {
                  label: text('title'),
                  color: 'var(--contentAccentSecondary)',
                },
              }}
              className="h-56 w-full"
            >
              {p.style === 'bar' ? (
                <BarChart data={p.series as { label: string; value: number }[]}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={16}
                    padding={{ left: 16, right: 16 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v: number) =>
                      new Intl.NumberFormat('en-IN', {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(v)
                    }
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    isAnimationActive={false}
                    dataKey="value"
                    fill="var(--contentAccentSecondary)"
                    radius={4}
                  />
                </BarChart>
              ) : (
                <AreaChart
                  data={p.series as { label: string; value: number }[]}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={16}
                    padding={{ left: 16, right: 16 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v: number) =>
                      new Intl.NumberFormat('en-IN', {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(v)
                    }
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    isAnimationActive={false}
                    dataKey="value"
                    stroke="var(--contentAccentSecondary)"
                    fill="var(--backgroundSecondary)"
                    strokeWidth={2}
                  />
                </AreaChart>
              )}
            </ChartContainer>
          </div>
        );
      case 'tabs':
        return (
          <Tabs
            value={String(value)}
            onValueChange={(v) => set(bind, String(v))}
          >
            <TabsList variant="line" aria-label={label || 'Sections'}>
              {options.map((option) => (
                <TabsTrigger key={option} value={option}>
                  {option}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        );
      case 'accordion':
        return (
          <Accordion defaultValue={p.open ? [node.id] : []}>
            <AccordionItem value={node.id}>
              <AccordionTrigger>{text('title')}</AccordionTrigger>
              <AccordionContent>
                <div className="tree-stack tree-column">{children}</div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      case 'alert':
        return (
          <Alert>
            <AlertTitle>{text('title')}</AlertTitle>
            {p.description ? (
              <AlertDescription>{text('description')}</AlertDescription>
            ) : null}
          </Alert>
        );
      case 'dialog':
        return (
          <Dialog
            open={Boolean(state[node.id])}
            onOpenChange={(open) => set(node.id, open)}
          >
            <DialogContent>
              <DialogTitle>{text('title')}</DialogTitle>
              <DialogDescription>
                {text('description', 'Local preview')}
              </DialogDescription>
              <div className="tree-stack tree-column">{children}</div>
            </DialogContent>
          </Dialog>
        );
      default:
        return (
          <TreeExtended
            node={node}
            ownsLabel={ownsLabel}
            fieldControlId={
              document.nodes.find(
                (n) =>
                  n.parent === node.id &&
                  [
                    'input',
                    'textarea',
                    'select',
                    'radio',
                    'native-select',
                    'combobox',
                    'date-picker',
                    'input-group',
                    'input-otp',
                    'slider',
                  ].includes(n.kind),
              )?.id
            }
            childIds={document.nodes
              .filter((n) => n.parent === node.id)
              .map((n) => n.id)}
            value={value}
            change={(v) => set(bind, v)}
            open={Boolean(state[node.id])}
            setOpen={(v) => set(node.id, v)}
            notify={notify}
            mobile={document.device === 'mobile'}
          >
            {children}
          </TreeExtended>
        );
    }
  };
  return (
    <MintThemeContext value={document.theme}>
      <div
        className={`mint-theme ${document.theme} tree-view tree-device-${document.device}`}
        data-density={
          Number(document.nodes[0]?.props.gap ?? 24) <= 16
            ? 'compact'
            : 'comfortable'
        }
        inert={busy || undefined}
        aria-busy={busy}
      >
        {document.nodes[0] ? render(document.nodes[0]) : null}
        <output className="sr-only">{feedback}</output>
      </div>
    </MintThemeContext>
  );
}
