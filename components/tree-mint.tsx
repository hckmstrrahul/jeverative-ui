'use client';
import type { ReactNode } from 'react';
import type { UINode, Value } from '@/lib/tree/spec';
import { financialValue } from '@/lib/tree/finance';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Home,
  Chart,
  Settings,
  Bell,
  Folder,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  Grid,
  QrCode,
  Star,
  Mail,
  KeyRound,
  ArrowUpRight,
  Monitor,
  Smartphone,
  Check,
  Money,
  Percent,
  Eye,
} from './icons';
const rowIcons = {
  Home,
  Chart,
  Settings,
  Bell,
  Folder,
  Star,
  Search,
  Mail,
  KeyRound,
  Plus,
  ArrowUpRight,
  Monitor,
  Smartphone,
  Grid,
  Check,
  Money,
  Percent,
  Eye,
};
export function TreeMint({
  node,
  value,
  change,
  children,
  notify,
  navigationTitle,
  hideLabel = false,
}: {
  node: UINode;
  value: Value;
  change: (value: Value) => void;
  children: ReactNode[];
  notify: (message: string) => void;
  navigationTitle?: string;
  hideLabel?: boolean;
}) {
  const p = node.props;
  const str = (key: string, fallback = '') =>
    typeof p[key] === 'string' ? (p[key] as string) : fallback;
  const id = 'tree-' + node.id;
  switch (node.kind) {
    case 'financial-value': {
      const result = financialValue(
        p.amount as number | undefined,
        str('currency', 'INR'),
        str('format', 'amount'),
        p.unavailable === true,
      );
      return (
        <div className={`tree-finance tree-finance-${str('role', 'list')}`}>
          {!hideLabel && <span>{str('label')}</span>}
          <strong
            className={`tree-tone-${result.tone}`}
            data-unavailable={result.unavailable}
          >
            {result.text}
          </strong>
        </div>
      );
    }
    case 'mint-row': {
      const Icon = rowIcons[str('icon', 'Chart') as keyof typeof rowIcons];
      return (
        <div
          className="tree-mint-row"
          data-density={str('density', 'default')}
          data-leading={str('leading', 'none')}
          data-description={Boolean(p.description)}
          data-divider={p.divider === true}
        >
          {p.leading === 'icon' ? (
            <Icon size={20} />
          ) : p.leading === 'thumbnail' ? (
            <Avatar>
              <AvatarFallback>
                {str('initials', str('title').slice(0, 2))}
              </AvatarFallback>
            </Avatar>
          ) : null}
          <div className="tree-mint-row-copy">
            <strong>{str('title')}</strong>
            {p.description ? <p>{str('description')}</p> : null}
          </div>
          {p.value ? (
            <span className="tree-mint-row-value">{str('value')}</span>
          ) : null}
          {children}
          {p.chevron ? <ChevronRight size={20} /> : null}
        </div>
      );
    }
    case 'mint-app-bar':
      return (
        <header className="tree-mint-appbar">
          <div className="tree-mint-navbar">
            {p.variant !== 'root' ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Back"
                onClick={() => notify('Back · local preview')}
              >
                <ChevronLeft />
              </Button>
            ) : null}
            <div className="tree-mint-appbar-title">
              <strong>
                {p.variant === 'root'
                  ? (navigationTitle ?? str('title'))
                  : str('title')}
              </strong>
              {p.subtitle ? <p>{str('subtitle')}</p> : null}
            </div>
            {p.variant === 'root' ? (
              <div className="tree-mint-appbar-actions">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Search"
                  onClick={() => notify('Search · local preview')}
                >
                  <Search />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="QR scanner"
                  onClick={() => notify('QR scanner · local preview')}
                >
                  <QrCode />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Profile"
                  onClick={() => notify('Profile · local preview')}
                >
                  <Avatar>
                    <AvatarFallback>P</AvatarFallback>
                  </Avatar>
                </Button>
              </div>
            ) : null}
          </div>
        </header>
      );
    case 'mint-bottom-nav':
      return (
        <nav className="tree-mint-bottomnav" aria-label={str('label')}>
          {(p.options as string[]).map((option, index) => {
            const Icon = [Chart, Grid, Folder, Home, Settings][index];
            return (
              <button
                type="button"
                key={option}
                aria-current={value === option ? 'page' : undefined}
                onClick={() => change(option)}
              >
                <Icon size={24} />
                <span>{option}</span>
              </button>
            );
          })}
        </nav>
      );
    case 'mint-pill':
      return (
        <Button
          type="button"
          variant="ghost"
          className="tree-mint-pill"
          aria-pressed={Boolean(value)}
          onClick={() => change(!value)}
        >
          {str('label')}
          {Number(p.count) > 0 ? <span>{Number(p.count)}</span> : null}
          {value ? <X size={16} /> : null}
        </Button>
      );
    case 'mint-pill-group':
      return (
        <fieldset
          aria-label={str('label')}
          className="tree-mint-pills"
          data-variant={str('variant', 'stylised')}
        >
          {(p.options as string[]).map((option) => (
            <Button
              key={option}
              variant="ghost"
              className="tree-mint-pill"
              aria-pressed={value === option}
              onClick={() => change(option)}
            >
              {option}
            </Button>
          ))}
        </fieldset>
      );
    case 'mint-order-input': {
      const lots = p.mode === 'lots',
        market = p.mode === 'market';
      return (
        <div className="tree-mint-order">
          <label htmlFor={id}>{str('label')}</label>
          <div className="tree-mint-order-control">
            {lots ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Decrease ${str('label')}`}
                disabled={Number(value) <= 1}
                onClick={() => change(Math.max(1, Number(value) - 1))}
              >
                <Minus />
              </Button>
            ) : null}
            <Input
              id={id}
              type={market ? 'text' : 'number'}
              disabled={market}
              value={market ? 'At market' : String(value)}
              min={lots ? 1 : 0}
              step={lots || p.mode === 'quantity' ? 1 : '0.01'}
              onChange={(e) =>
                change(
                  e.target.value === ''
                    ? ''
                    : Math.max(
                        lots ? 1 : 0,
                        lots || p.mode === 'quantity'
                          ? Math.trunc(Number(e.target.value))
                          : Number(e.target.value),
                      ),
                )
              }
            />
            {lots ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Increase ${str('label')}`}
                onClick={() => change(Number(value || 1) + 1)}
              >
                <Plus />
              </Button>
            ) : null}
          </div>
        </div>
      );
    }
    case 'mint-action-dock':
      return (
        <footer className="tree-mint-dock">
          {p.error || p.helper ? (
            <p
              className={p.error ? 'tree-tone-negative' : 'tree-tone-secondary'}
              role={p.error ? 'alert' : undefined}
            >
              {str('error', str('helper'))}
            </p>
          ) : null}
          <div>{children}</div>
        </footer>
      );
    default:
      return null;
  }
}
