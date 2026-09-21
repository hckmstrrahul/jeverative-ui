'use client';
import {
  ProfileHeader,
  ProfileContent,
  SettingsPanel,
} from '@/components/account-preview';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  Search,
  Headphones,
  ShoppingBag,
  Grid,
  Plus,
  Minus,
} from '@/components/icons';
import { money, percent, type Recipe } from '@/lib/mint';
import type { Screen } from '@/lib/catalog';
import { useMintData } from '@/components/mint-data-context';
import { toast } from '@/components/ui/toast';

const financial = [
  'portfolio',
  'markets',
  'stock-detail',
  'order',
  'funds',
  'orders',
  'derivatives',
];
const holdings = [
  {
    name: 'Reliance Industries',
    symbol: 'RELIANCE',
    category: 'Energy',
    value: 48234.5,
    change: 2.34,
  },
  {
    name: 'HDFC Bank',
    symbol: 'HDFCBANK',
    category: 'Banking',
    value: 36480.2,
    change: -0.82,
  },
  {
    name: 'Tata Consultancy Services',
    symbol: 'TCS',
    category: 'Technology',
    value: 52840.0,
    change: 1.42,
  },
  {
    name: 'Infosys',
    symbol: 'INFY',
    category: 'Technology',
    value: 24638.0,
    change: 0,
  },
  {
    name: 'Bharti Airtel',
    symbol: 'BHARTIARTL',
    category: 'Telecom',
    value: 18340.6,
    change: 1.86,
  },
  {
    name: 'ICICI Bank',
    symbol: 'ICICIBANK',
    category: 'Banking',
    value: 27580.4,
    change: 0.48,
  },
  {
    name: 'Asian Paints',
    symbol: 'ASIANPAINT',
    category: 'Consumer',
    value: 16840.0,
    change: -1.12,
  },
  {
    name: 'Titan Company',
    symbol: 'TITAN',
    category: 'Consumer',
    value: 31450.0,
    change: 0.64,
  },
];
const funds = [
  {
    name: 'Groww Nifty Total Market Index Fund',
    symbol: 'GROWW',
    category: 'Index · Direct growth',
    value: 182.48,
    change: 14.28,
  },
  {
    name: 'Parag Parikh Flexi Cap Fund',
    symbol: 'PP',
    category: 'Flexi cap · Direct growth',
    value: 88.42,
    change: 18.62,
  },
  {
    name: 'HDFC Mid Cap Fund',
    symbol: 'HD',
    category: 'Mid cap · Direct growth',
    value: 194.32,
    change: 22.14,
  },
  {
    name: 'ICICI Prudential Bluechip Fund',
    symbol: 'IC',
    category: 'Large cap · Direct growth',
    value: 112.6,
    change: 12.48,
  },
  {
    name: 'UTI Nifty 50 Index Fund',
    symbol: 'UT',
    category: 'Index · Direct growth',
    value: 162.24,
    change: 13.42,
  },
];
const tone = (value: number) =>
  value > 0 ? 'mint-positive' : value < 0 ? 'mint-negative' : 'mint-neutral';
export function hasMintVariant(id: string, recipe: Recipe) {
  return (
    (recipe === 'profile' && ['card', 'item'].includes(id)) ||
    (recipe === 'settings' && id === 'field') ||
    (financial.includes(recipe) &&
      [
        'card',
        'chart',
        'data-table',
        'table',
        'tabs',
        'toggle-group',
        'alert',
        'input-group',
      ].includes(id)) ||
    (recipe === 'order' && ['field', 'radio-group'].includes(id)) ||
    (recipe === 'loans' && ['card', 'field', 'accordion'].includes(id)) ||
    (recipe === 'kanban' && id === 'item') ||
    (recipe === 'commerce' && ['carousel', 'card'].includes(id))
  );
}
export function MintPreview({ id, screen }: { id: string; screen: Screen }) {
  const controlId = useId();
  const { recipe } = screen;
  const shared = useMintData();
  if (recipe === 'profile')
    return id === 'card' ? (
      <ProfileHeader screen={screen} />
    ) : (
      <ProfileContent screen={screen} />
    );
  if (recipe === 'settings' && id === 'field')
    return <SettingsPanel screen={screen} />;
  if (recipe === 'loans') {
    if (id === 'field') return <LoanFields />;
    if (id === 'card')
      return (
        <div className="mint-kpi">
          <p className="mint-caption">Explore personal loans</p>
          <strong className="mint-number">Flexible repayments</strong>
          <p className="mint-caption">Estimate your monthly payment below.</p>
        </div>
      );
    return (
      <Accordion>
        <AccordionItem value="eligibility">
          <AccordionTrigger>How is eligibility checked?</AccordionTrigger>
          <AccordionContent>
            This prototype shows an illustrative calculator. Actual eligibility
            and rates depend on a lender’s assessment.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
  if (id === 'input-group')
    return (
      <Input
        aria-label="Search investments"
        placeholder="Search investments"
        value={shared.query}
        onChange={(e) => shared.setQuery(e.target.value)}
      />
    );
  if (recipe === 'order' && id === 'field')
    return (
      <OrderFields
        key={screen.orderUnit}
        side={screen.primaryAction === 'sell' ? 'sell' : 'buy'}
        lots={screen.orderUnit === 'lots'}
      />
    );
  if (recipe === 'order' && id === 'radio-group')
    return (
      <RadioGroup defaultValue="delivery" aria-label="Product type">
        <label
          htmlFor={controlId + 'delivery'}
          className="flex gap-3 items-center"
        >
          <RadioGroupItem id={controlId + 'delivery'} value="delivery" />
          Delivery
        </label>
        <label
          htmlFor={controlId + 'intraday'}
          className="flex gap-3 items-center"
        >
          <RadioGroupItem id={controlId + 'intraday'} value="intraday" />
          Intraday
        </label>
      </RadioGroup>
    );
  if (recipe === 'kanban' && id === 'item') return <TaskBoard />;
  if (recipe === 'commerce' && (id === 'carousel' || id === 'card'))
    return id === 'card' ? (
      <div className="mint-message">
        Free delivery on orders above {money(2000)}.
      </div>
    ) : (
      <ProductGrid />
    );
  if (id === 'card') return <FinancialSummary recipe={recipe} />;
  if (id === 'chart') return <FinancialChart recipe={recipe} />;
  if (id === 'table' || id === 'data-table')
    return (
      <FinancialList
        recipe={recipe}
        count={screen.rowCount}
        filterable={id === 'data-table' && !screen.search}
      />
    );
  if (id === 'tabs')
    return <FinancialTabs recipe={recipe} count={screen.rowCount} />;
  if (id === 'toggle-group')
    return (
      <ToggleGroup
        variant="outline"
        value={[shared.filter]}
        onValueChange={(v) => shared.setFilter(v[0] ?? 'all')}
      >
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="equity">Equity</ToggleGroupItem>
        <ToggleGroupItem value="index">Index</ToggleGroupItem>
      </ToggleGroup>
    );
  return (
    <div className="mint-message">
      Sample portfolio. Values are illustrative and do not reflect live markets.
    </div>
  );
}
function FinancialSummary({ recipe }: { recipe: Recipe }) {
  const metrics = ['markets', 'derivatives'].includes(recipe)
    ? ([
        ['NIFTY 50', 24836.3, 0.68],
        ['SENSEX', 81224.75, 0.54],
        ['BANK NIFTY', 51462.25, -0.24],
      ] as const)
    : recipe === 'stock-detail'
      ? ([['Market price', 2411.72, 2.34]] as const)
      : recipe === 'funds'
        ? ([
            ['Your investments', 184520.6, 14.28],
            ['Monthly SIP', 10000, 0],
          ] as const)
        : ([
            ['Current value', 277385.2, 5.55],
            ['Invested amount', 262788.35, 0],
            ['Total returns', 14596.85, 5.55],
          ] as const);
  return (
    <div
      className={`mint-kpis ${recipe === 'portfolio' ? 'mint-portfolio-summary' : ''}`}
    >
      {metrics.map(([label, value, change]) => (
        <div className="mint-kpi" key={label}>
          <p className="mint-caption">{label}</p>
          <strong
            className={
              'mint-number ' +
              (label === 'Total returns' ? 'mint-positive' : '')
            }
          >
            {label === 'Total returns' ? '+' : ''}
            {recipe === 'markets'
              ? value.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : money(value)}
          </strong>
          <p className={'text-xs ' + tone(change)}>
            {percent(change)}
            {change !== 0
              ? ' · ' + (recipe === 'portfolio' ? 'All time' : 'Today')
              : ''}
          </p>
        </div>
      ))}
    </div>
  );
}
function FinancialChart({ recipe }: { recipe: Recipe }) {
  const [range, setRange] = useState('1M');
  const values = [36, 42, 40, 49, 46, 56, 54, 62, 68, 64, 75, 82];
  const data = values.map((v, i) => ({
    day: String(i + 1),
    value:
      Math.round(
        (v + ['1D', '1W', '1M', '1Y', '5Y'].indexOf(range) * 4) * 29.4 * 100,
      ) / 100,
  }));
  return (
    <div className="mint-stack">
      <div className="flex items-center justify-between gap-4">
        <h3>
          {recipe === 'portfolio' ? 'Portfolio performance' : 'Performance'}
        </h3>
        <span className="mint-positive text-sm">{percent(2.34)}</span>
      </div>
      <ChartContainer
        config={{ value: { label: 'Value', color: 'var(--contentPositive)' } }}
        className="h-[240px] w-full"
      >
        <AreaChart data={data} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            minTickGap={32}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent formatter={(v) => money(Number(v))} />
            }
          />
          <Area
            dataKey="value"
            type="monotone"
            fill="var(--contentPositive)"
            fillOpacity={0.06}
            stroke="var(--contentPositive)"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
      <ToggleGroup
        variant="outline"
        value={[range]}
        onValueChange={(v) => {
          if (v[0]) setRange(v[0]);
        }}
      >
        {['1D', '1W', '1M', '1Y', '5Y'].map((r) => (
          <ToggleGroupItem key={r} value={r}>
            {r}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
function FinancialList({
  recipe,
  count,
  filterable = false,
}: {
  recipe: Recipe;
  count: number;
  filterable?: boolean;
}) {
  const { query, setQuery, filter, tab } = useMintData();
  const [selected, setSelected] = useState<(typeof holdings)[number] | null>(
    null,
  );
  const source =
    recipe === 'funds'
      ? funds
      : recipe === 'derivatives'
        ? holdings.map((h, i) => ({
            ...h,
            name:
              (i % 2 ? 'BANK NIFTY' : 'NIFTY 50') +
              ' ' +
              (24000 + i * 100) +
              ' ' +
              (i % 2 ? 'Put' : 'Call'),
            symbol: 'FO',
            category: 'Illustrative option',
            value: 124.5 + i * 18,
          }))
        : holdings;
  const list = source
    .slice(0, count)
    .filter(
      (r, i) =>
        r.name.toLowerCase().includes(query.toLowerCase()) &&
        (filter === 'all' ||
          (filter === 'index'
            ? r.category.includes('Index')
            : !r.category.includes('Index'))) &&
        (tab === 'Executed'
          ? i % 2 === 1
          : tab === 'Open'
            ? i % 2 === 0
            : tab === 'Cancelled'
              ? i === 2
              : true),
    );
  return (
    <div className="mint-stack">
      <div className="flex items-center justify-between gap-4">
        <h3>
          {recipe === 'funds'
            ? 'Explore funds'
            : recipe === 'orders'
              ? 'Recent orders'
              : recipe === 'markets'
                ? 'Your watchlist'
                : recipe === 'stock-detail'
                  ? 'Related stocks'
                  : 'Holdings'}
        </h3>
        <span className="mint-caption">
          {list.length} {recipe === 'funds' ? 'funds' : 'stocks'}
        </span>
      </div>
      {filterable && (
        <Input
          aria-label="Search investments"
          placeholder="Search by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      <div className="mint-mobile-list">
        {list.map((r) => (
          <button
            className="mint-data-row"
            key={r.name}
            onClick={() => setSelected(r)}
          >
            <span className="mint-logo">{r.symbol.slice(0, 2)}</span>
            <span className="mint-row-copy">
              <strong>{r.name}</strong>
              <small>{r.category}</small>
            </span>
            <span className="mint-row-value">
              {money(r.value)}
              <small className={tone(r.change)}>{percent(r.change)}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="mint-financial-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Investment</TableHead>
              <TableHead>
                {recipe === 'orders' ? 'Status' : 'Category'}
              </TableHead>
              <TableHead className="text-right">
                {recipe === 'funds' ? 'NAV' : 'Current value'}
              </TableHead>
              <TableHead className="text-right">
                {recipe === 'funds' ? '1Y return' : 'Change'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((r, i) => (
              <TableRow key={r.name}>
                <TableCell>
                  <button
                    className="flex items-center gap-4 text-left"
                    onClick={() => setSelected(r)}
                  >
                    <span className="mint-logo">{r.symbol.slice(0, 2)}</span>
                    <span className="font-medium">{r.name}</span>
                  </button>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {recipe === 'orders'
                    ? i % 2
                      ? 'Executed'
                      : 'Open'
                    : r.category}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {money(r.value)}
                </TableCell>
                <TableCell
                  className={'text-right tabular-nums ' + tone(r.change)}
                >
                  {percent(r.change)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {!list.length && <p className="mint-caption">No matching investments.</p>}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="mint-theme">
          <DialogTitle>{selected?.name}</DialogTitle>
          <DialogDescription>Sample investment details</DialogDescription>
          <p className="mint-number text-xl">
            {selected && money(selected.value)}
          </p>
          <p className={tone(selected?.change ?? 0)}>
            {percent(selected?.change ?? 0)}
          </p>
          <Button onClick={() => setSelected(null)} variant="outline">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function FinancialTabs({ recipe }: { recipe: Recipe; count: number }) {
  const shared = useMintData();
  const tabs =
    recipe === 'orders'
      ? ['Open', 'Executed', 'Cancelled']
      : recipe === 'stock-detail'
        ? ['Overview', 'News', 'Financials']
        : ['Holdings', 'Positions', 'Orders'];
  return (
    <Tabs
      value={shared.tab && tabs.includes(shared.tab) ? shared.tab : tabs[0]}
      onValueChange={(v) => shared.setTab(String(v))}
    >
      <TabsList>
        {tabs.map((t) => (
          <TabsTrigger key={t} value={t}>
            {t}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t} value={t}>
          <p className="mint-caption">
            {t === 'Financials'
              ? 'Financial overview'
              : t === 'News'
                ? 'Latest activity'
                : t}{' '}
            · Sample data
          </p>
        </TabsContent>
      ))}
    </Tabs>
  );
}
function OrderFields({
  side,
  lots = false,
}: {
  side: 'buy' | 'sell';
  lots?: boolean;
}) {
  const uid = useId();
  const [quantity, setQuantity] = useState(lots ? '1' : '10');
  const [price, setPrice] = useState('2411.72');
  const [type, setType] = useState('market');
  const [submitted, setSubmitted] = useState(false);
  const qty = Number(quantity),
    amount = Number(price),
    invalid =
      !Number.isInteger(qty) ||
      qty < 1 ||
      !Number.isFinite(qty) ||
      (type === 'limit' && (!Number.isFinite(amount) || amount <= 0));
  return (
    <form
      className="mint-stack"
      onSubmit={(e) => {
        e.preventDefault();
        if (!invalid) setSubmitted(true);
      }}
    >
      <div className="mint-order-row">
        <Label htmlFor={uid}>{lots ? 'Lots' : 'Quantity'}</Label>
        <div className={lots ? 'mint-order-stepper' : undefined}>
          {lots && (
            <button
              type="button"
              aria-label="Decrease lots"
              disabled={qty <= 1}
              onClick={() => {
                setQuantity(
                  String(Math.max(1, (Number.isFinite(qty) ? qty : 1) - 1)),
                );
                setSubmitted(false);
              }}
            >
              <Minus size={16} />
            </button>
          )}
          <Input
            id={uid}
            inputMode="numeric"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setSubmitted(false);
            }}
            aria-invalid={invalid}
          />
          {lots && (
            <button
              type="button"
              aria-label="Increase lots"
              onClick={() => {
                setQuantity(
                  String(Math.max(1, Number.isFinite(qty) ? qty + 1 : 1)),
                );
                setSubmitted(false);
              }}
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="mint-order-row">
        <Label htmlFor={uid + 'type'}>Order type</Label>
        <Select value={type} onValueChange={(v) => setType(v ?? 'market')}>
          <SelectTrigger id={uid + 'type'}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="market">Market</SelectItem>
            <SelectItem value="limit">Limit</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mint-order-row">
        <Label htmlFor={uid + 'price'}>Price</Label>
        <Input
          id={uid + 'price'}
          inputMode="decimal"
          disabled={type === 'market'}
          value={type === 'market' ? 'At market' : price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div className="mint-order-row">
        <span className="mint-caption">
          {lots ? 'Estimated premium · sample lot of 25' : 'Estimated amount'}
        </span>
        <strong className="mint-number">
          {invalid
            ? '—'
            : money(
                qty * (lots ? 25 : 1) * (type === 'market' ? 2411.72 : amount),
              )}
        </strong>
      </div>
      {invalid && (
        <div role="alert" className="mint-message error">
          Enter a whole quantity above zero and a valid price.
        </div>
      )}
      {submitted && (
        <output className="mint-message">
          Order previewed. No trade was placed.
        </output>
      )}
      <Button
        size="lg"
        variant={side === 'sell' ? 'destructive' : 'default'}
        disabled={invalid}
        type="submit"
      >
        Preview {side} order
      </Button>
    </form>
  );
}
function TaskBoard() {
  const [tasks, setTasks] = useState([
    { name: 'Explore the brief', stage: 'To do' },
    { name: 'Review mobile layouts', stage: 'In progress' },
    { name: 'Define design tokens', stage: 'Done' },
    { name: 'Prepare handoff', stage: 'To do' },
  ]);
  return (
    <div className="mint-board">
      {['To do', 'In progress', 'Done'].map((stage) => (
        <div key={stage} className="mint-board-column">
          <h3>{stage}</h3>
          {tasks
            .filter((t) => t.stage === stage)
            .map((t) => (
              <div key={t.name} className="mint-task">
                <p className="font-medium">{t.name}</p>
                <Select
                  value={stage}
                  onValueChange={(v) =>
                    setTasks((old) =>
                      old.map((x) =>
                        x.name === t.name ? { ...x, stage: v ?? stage } : x,
                      ),
                    )
                  }
                >
                  <SelectTrigger aria-label={'Move ' + t.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['To do', 'In progress', 'Done'].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
function ProductGrid() {
  const [cart, setCart] = useState<string[]>([]);
  return (
    <div className="mint-stack">
      <p className="mint-caption">{cart.length} items in your bag</p>
      <div className="mint-product-grid">
        {[
          ['Studio headphones', 2499, Headphones],
          ['Everyday tote', 899, ShoppingBag],
          ['Desk organiser', 1299, Grid],
          ['Travel pouch', 599, ShoppingBag],
        ].map(([name, value, Icon]) => {
          const ProductIcon = Icon as typeof Search;
          return (
            <Card className="mint-product" key={String(name)}>
              <CardContent className="p-0">
                <div className="mint-product-art">
                  <ProductIcon size={40} />
                </div>
                <p className="font-medium">{String(name)}</p>
                <p className="my-2 font-medium">{money(Number(value))}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCart((old) => [...old, String(name)]);
                    toast.add({ title: 'Added to your sample bag' });
                  }}
                >
                  <Plus size={16} />
                  Add to bag
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function LoanFields() {
  const uid = useId();
  const [amount, setAmount] = useState('100000');
  const [months, setMonths] = useState('12');
  const principal = Number(amount),
    term = Number(months);
  const valid =
    Number.isFinite(principal) &&
    principal > 0 &&
    Number.isInteger(term) &&
    term >= 1 &&
    term <= 360;
  const rate = 0.105 / 12;
  const monthly = valid
    ? (principal * rate) / (1 - Math.pow(1 + rate, -term))
    : 0;
  return (
    <div className="mint-stack">
      <div className="preview-field">
        <Label htmlFor={uid}>Loan amount</Label>
        <Input
          id={uid}
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="preview-field">
        <Label htmlFor={uid + 'term'}>Repayment period (months)</Label>
        <Input
          id={uid + 'term'}
          inputMode="numeric"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
        />
      </div>
      <div className="mint-order-row">
        <span className="mint-caption">Illustrative monthly payment</span>
        <output className="mint-number">{valid ? money(monthly) : '—'}</output>
      </div>
      <p className="mint-caption">
        Sample rate: 10.50% per year. Excludes fees. This is a UI demo, not a
        loan offer.
      </p>
      {!valid && (
        <p role="alert" className="mint-negative">
          Enter a positive amount and 1–360 months.
        </p>
      )}
    </div>
  );
}
