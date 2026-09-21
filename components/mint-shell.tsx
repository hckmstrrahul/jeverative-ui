'use client';
import { useState, type ReactNode } from 'react';
import {
  Search,
  ArrowLeftIcon,
  Home,
  Chart,
  Percent,
  Money,
  Settings,
  Grid,
  Folder,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { recipes, type Recipe } from '@/lib/mint';
import type { Screen } from '@/lib/catalog';
export function MintShell({
  screen,
  children,
  hidden,
  onNavigate,
}: {
  screen: Screen;
  children: ReactNode;
  hidden: boolean;
  onNavigate?: (screen: Screen) => void;
}) {
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [action, setAction] = useState(false);
  const finance = [
    'portfolio',
    'markets',
    'funds',
    'orders',
    'stock-detail',
    'order',
    'derivatives',
    'loans',
  ].includes(screen.recipe);
  const root = ['markets', 'funds', 'derivatives', 'loans'].includes(
    screen.recipe,
  );
  const items: { label: string; recipe: Recipe; Icon: typeof Home }[] = finance
    ? root
      ? [
          { label: 'Stocks', recipe: 'markets', Icon: Chart },
          { label: 'F&O', recipe: 'derivatives', Icon: Percent },
          { label: 'Mutual funds', recipe: 'funds', Icon: Grid },
          { label: 'Loans', recipe: 'loans', Icon: Money },
        ]
      : [
          { label: 'Portfolio', recipe: 'portfolio', Icon: Chart },
          { label: 'Watchlist', recipe: 'markets', Icon: Home },
          { label: 'Orders', recipe: 'orders', Icon: Folder },
          { label: 'Profile', recipe: 'profile', Icon: Settings },
        ]
    : [
        { label: 'Overview', recipe: 'dashboard', Icon: Home },
        { label: 'Projects', recipe: 'kanban', Icon: Grid },
        { label: 'Planner', recipe: 'planning', Icon: Folder },
        { label: 'Profile', recipe: 'profile', Icon: Settings },
        { label: 'Settings', recipe: 'settings', Icon: Settings },
      ];
  const detail = ['stock-detail', 'order', 'form'].includes(screen.recipe);
  const navigation = detail
    ? 'none'
    : screen.navigation === 'none'
      ? 'none'
      : screen.device === 'mobile'
        ? screen.navigation === 'top'
          ? 'top'
          : 'bottom'
        : screen.navigation === 'bottom'
          ? 'rail'
          : screen.navigation;
  const navigate = (recipe: Recipe) => {
    const target = recipes[recipe];
    onNavigate?.({
      ...screen,
      recipe,
      blueprint: undefined,
      scenario: target.scenario,
      components: [...target.components],
      emphasis: target.primary,
      primaryAction:
        recipe === 'order'
          ? screen.primaryAction === 'sell'
            ? 'sell'
            : 'buy'
          : recipe === 'settings'
            ? 'save'
            : 'none',
    });
    setSearch(false);
  };
  const nav = (style: string) => (
    <nav
      className={
        style === 'bottom' ? 'mint-bottom-nav' : 'mint-shell-nav ' + style
      }
      aria-label="App navigation"
    >
      {items.map(({ label, recipe, Icon }) => (
        <button
          key={label}
          aria-current={screen.recipe === recipe ? 'page' : undefined}
          onClick={() => navigate(recipe)}
        >
          <Icon size={style === 'bottom' ? 24 : 20} />
          {label}
        </button>
      ))}
    </nav>
  );
  const actionLabel = {
    none: '',
    save: 'Save changes',
    buy: 'Buy',
    sell: 'Sell',
    invest: 'Invest now',
    create: 'Create project',
    continue: 'Continue',
  }[screen.primaryAction];
  return (
    <div className="mint-app-viewport" hidden={hidden}>
      <header className="mint-appbar">
        {screen.device === 'mobile' && (
          <div className="mint-statusbar">
            <span>9:41</span>
            <span>Preview</span>
          </div>
        )}
        <div className="mint-appbar-row">
          {detail ? (
            <button
              className="mint-icon-action"
              aria-label="Back to overview"
              onClick={() => navigate(finance ? 'markets' : 'dashboard')}
            >
              <ArrowLeftIcon />
            </button>
          ) : (
            <span className="mint-logo" style={{ width: 24, height: 24 }}>
              <Chart size={20} />
            </span>
          )}
          <strong>{recipes[screen.recipe].title}</strong>
          <button
            className="mint-icon-action"
            aria-label="Search screens"
            onClick={() => setSearch(true)}
          >
            <Search />
          </button>
          <button
            className="mint-icon-action"
            aria-label="Profile"
            onClick={() => navigate('profile')}
          >
            <span
              className="mint-logo"
              style={{ width: 32, height: 32, borderRadius: '50%' }}
            >
              AM
            </span>
          </button>
        </div>
      </header>
      {navigation === 'top' && nav('top')}
      <div className="mint-workspace">
        {navigation === 'rail' &&
          !screen.components.includes('sidebar') &&
          nav('rail')}
        {children}
      </div>
      {actionLabel &&
        !screen.components.includes('button') &&
        !(screen.recipe === 'order' && screen.components.includes('field')) && (
          <div className="mint-action-dock">
            <Button
              variant="outline"
              onClick={() => navigate(finance ? 'markets' : 'dashboard')}
            >
              Cancel
            </Button>
            <Button
              size={screen.device === 'mobile' ? 'lg' : 'default'}
              variant={
                screen.primaryAction === 'sell' ? 'destructive' : 'default'
              }
              onClick={() => {
                if (['buy', 'sell'].includes(screen.primaryAction)) {
                  navigate('order');
                } else setAction(true);
              }}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      {navigation === 'bottom' && nav('bottom')}
      <Dialog open={search} onOpenChange={setSearch}>
        <DialogContent className={'mint-theme ' + screen.theme}>
          <DialogTitle>Find a screen</DialogTitle>
          <DialogDescription>Explore the sample workspace.</DialogDescription>
          <Input
            aria-label="Find a screen"
            placeholder="Search screens"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mint-stack">
            {Object.entries(recipes)
              .filter(([, r]) =>
                r.title.toLowerCase().includes(query.toLowerCase()),
              )
              .slice(0, 5)
              .map(([id, r]) => (
                <Button
                  key={id}
                  variant="ghost"
                  onClick={() => navigate(id as Recipe)}
                >
                  {r.title}
                </Button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={action} onOpenChange={setAction}>
        <DialogContent className={'mint-theme ' + screen.theme}>
          <DialogTitle>{actionLabel}</DialogTitle>
          <DialogDescription>
            This action runs only in your sample interface.
          </DialogDescription>
          <div className="mint-message">
            Preview complete. No account data was changed.
          </div>
          <Button onClick={() => setAction(false)}>Done</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
