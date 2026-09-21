'use client';
import { StreamPreview } from '@/lib/tree/preview';
import {
  readLocalConnection,
  writeLocalConnection,
} from '@/lib/local-connection';
import { readLines } from '@/lib/tree/stream';
import { validateDocument } from '@/lib/tree/spec';
import { documentScreen } from '@/lib/tree/screen';
import { DEFAULT_TEXT_MODEL, TEXT_MODELS } from '@/lib/tree/models';
import type { TextUsage } from '@/lib/tree/usage';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Info,
  KeyRound,
  Monitor,
  RotateCcw,
  Settings2,
  Smartphone,
  Sparkles,
  Tablet,
  X,
  Zap,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toast';
import { CompositionCanvas } from '@/components/composition-canvas';
import { composeLayout } from '@/lib/composition';
import {
  placementOrder,
  placementInterval,
  waitForPlacement,
} from '@/lib/placement';
import { catalog, initialScreen, type Screen } from '@/lib/catalog';
import { validateScreen, type Answers } from '@/lib/decisions';
type Result = {
  screen: Screen;
  answers?: Answers;
  adjustments?: string[];
  latency?: number;
  engine?: 'hybrid' | 'llm' | 'jev-first';
  plan?: { arrangement: string; density: string; surface: string };
  metrics?: {
    firstContentMs: number | null;
    textMs: number;
    planMs: number;
    repairs: number;
    totalMs: number;
    textUsage?: TextUsage;
    jevCalls?: number;
  };
  model?: string;
};
const examplePrompts = [
  {
    label: 'Stock detail',
    prompt:
      'Stock product page mobile app with chart first, then holdings mini card, performance and market depth, with sticky docked Buy and Sell buttons.',
  },
  {
    label: 'Portfolio website',
    prompt:
      'Personal portfolio website with selected projects, about, expertise and contact.',
  },

  {
    label: 'Flight booking',
    prompt:
      'Create a desktop flight booking UI with route and dates, passenger count, flight choices and fare options.',
  },
  {
    label: 'Stay discovery',
    prompt:
      'Design an Airbnb-style homepage feed with destination, date and guest controls, categories and six illustrated stay listings with prices, ratings and save actions.',
  },
  {
    label: 'Custom profile',
    prompt:
      'Create a compact profile with identity, bio, INR and USD wallets.\nName: Rahul\nRole: Product designer\nBio: Designing thoughtful interfaces.\nINR balance: 42500\nUSD balance: 1800',
  },
  {
    label: 'Custom workspace',
    prompt:
      'Create a desktop project intake form using these supplied fields. Include a save action.\n```json\n{"title":"Project intake","primaryLabel":"Save project","fields":[{"label":"Project name","value":"Mint refresh"},{"label":"Priority","type":"select","options":["Low","Medium","High"],"value":"High"},{"label":"Brief","type":"textarea"}]}\n```',
  },
  {
    label: 'Profile & wallets',
    prompt:
      'Design a compact mobile investing profile. Show avatar, name, separate INR and USD wallet balances, add-money actions, linked bank accounts, verification status and settings. Use Mint light theme.',
  },
  {
    label: 'Sales dashboard',
    prompt:
      'Create a desktop sales dashboard with a left sidebar, date filter, three key metrics, revenue chart and recent orders table with search, status filters and pagination. Keep the layout compact and aligned.',
  },
  {
    label: 'Task board',
    prompt:
      'Build a tablet project planner with To do, In progress and Done columns. Include task priorities, assignees, due dates, search and an add-task dialog. Let me move tasks between columns.',
  },
  {
    label: 'Account settings',
    prompt:
      'Create mobile account settings grouped into security, notifications and preferences. Include biometric login, notification switches, language selection and a clearly separated sign-out action. Avoid unnecessary cards.',
  },
  {
    label: 'Support inbox',
    prompt:
      'Design a desktop support inbox with three panes: navigation, conversation list and active conversation. Include unread badges, search, message composer and customer details in a collapsible panel.',
  },
  {
    label: 'Investment portfolio',
    prompt:
      'Create a dark desktop investment portfolio with total value, returns, a performance chart, holdings table and watchlist. Distinguish Indian and US stocks and preserve their currencies. Use restrained colour and compact spacing.',
  },
  {
    label: 'Mobile checkout',
    prompt:
      'Build a mobile checkout with order summary, quantity controls, delivery address, coupon input, payment selection and a sticky pay button showing the total. Keep the primary action visible.',
  },
  {
    label: 'Meeting scheduler',
    prompt:
      'Create a minimal desktop meeting scheduler with a calendar, available time slots, timezone selector and booking confirmation. Use generous whitespace without adding unrelated dashboard metrics.',
  },
];
const devices = [
  { id: 'desktop', Icon: Monitor },
  { id: 'tablet', Icon: Tablet },
  { id: 'mobile', Icon: Smartphone },
];
export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [resetVersion, setResetVersion] = useState(0);
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [draft, setDraft] = useState<Screen | null>(null);
  const [streamStatus, setStreamStatus] = useState('');
  const [completedMetrics, setCompletedMetrics] = useState<Result['metrics']>();
  const [engine, setEngine] = useState<'hybrid' | 'llm' | 'jev' | 'jev-first'>(
    'jev-first',
  );
  const [autoRepair, setAutoRepair] = useState(true);
  const [hasLivePreview, setHasLivePreview] = useState(false);
  const [textModel, setTextModel] = useState<string>(DEFAULT_TEXT_MODEL);
  const device = draft?.device ?? screen.device;
  const [seen, setSeen] = useState<string[]>(initialScreen.components);
  const [inspecting, setInspecting] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);
  const [key, setKey] = useState('');
  const [keyDraft, setKeyDraft] = useState('');
  const [rememberKey, setRememberKey] = useState(false);
  const [savedKey, setSavedKey] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [serverKey, setServerKey] = useState(false);
  const [keySource, setKeySource] = useState<'server' | 'manual'>('server');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState<string[] | null>(null);
  const [placement, setPlacement] = useState<{
    label: string;
    done: number;
    total: number;
  } | null>(null);
  const [lastPrompt, setLastPrompt] = useState('');
  const lastPromptRef = useRef('');
  const recentArrangements = useRef<string[]>([]);
  const controller = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const current = useRef(screen);
  const useServerKey = serverKey && keySource === 'server';
  const live = useServerKey || Boolean(key);
  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const saved = readLocalConnection(window.localStorage);
        if (saved) {
          setKey(saved.key);
          setKeySource(saved.source);
          setRememberKey(true);
          setSavedKey(true);
        }
      } catch {
        /* Storage can be disabled by the browser. Session entry still works. */
      }
    });
    fetch('/api/connection')
      .then((r) => r.json())
      .then((d) =>
        setServerKey(
          Boolean(
            d &&
            typeof d === 'object' &&
            'configured' in d &&
            d.configured === true,
          ),
        ),
      )
      .catch(() => {});
    return () => controller.current?.abort();
  }, []);
  const apply = useCallback((next: Screen) => {
    current.current = next;
    setScreen(next);
    setSeen((old) => [...new Set([...old, ...next.components])]);
  }, []);
  const cancel = useCallback(() => {
    sequence.current++;
    setDraft(null);
    setStreamStatus('');
    controller.current?.abort();
    setBusy(false);
    setPlaced(null);
    setPlacement(null);
  }, []);
  const compose = useCallback(
    async (text: string) => {
      const value = text.trim();
      if (!value || value.length > 2000) return;
      if (!live) {
        setSettings(true);
        return;
      }
      controller.current?.abort();
      const requestId = ++sequence.current;
      const abort = new AbortController();
      controller.current = abort;
      setError('');
      // Keep the visible draft when a new request supersedes an in-flight request.
      setStreamStatus('');
      setHasLivePreview(false);
      setBusy(true);
      setPlaced(null);
      setPlacement(null);
      try {
        let next: Result;
        if (engine !== 'jev') {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: abort.signal,
            body: JSON.stringify({
              prompt: value,
              apiKey: useServerKey ? undefined : key || undefined,
              keySource: useServerKey ? 'server' : 'manual',
              model: textModel,
              engine,
              autoRepair,
              recentArrangements: recentArrangements.current,
              device: current.current.device,
              previous: current.current.document,
              mode: value === lastPromptRef.current ? 'variation' : 'edit',
            }),
          });
          if (!response.ok || !response.body) {
            const problem = (await response.json()) as { error?: string };
            throw new Error(problem.error ?? 'Could not start generation.');
          }
          let completed: Result | null = null;
          const preview = new StreamPreview();
          setInspecting(null);
          for await (const line of readLines(response.body, 32_000_000)) {
            if (requestId !== sequence.current) return;
            if (!line.trim()) continue;
            const event = JSON.parse(line);
            if (event.type === 'error') throw new Error(event.message);
            if (event.type === 'status') {
              setStreamStatus(event.message);
            }
            if (event.type === 'preview') {
              const document = validateDocument(event.document, false);
              const visible = preview.push(document);
              if (visible) {
                setDraft(documentScreen(visible, current.current));
                setHasLivePreview(true);
              }
              setStreamStatus((status) =>
                /correct|repair|fix/i.test(status)
                  ? status
                  : `Building ${document.nodes.length} elements`,
              );
            }
            if (event.type === 'complete')
              completed = {
                screen: documentScreen(
                  validateDocument(event.document),
                  current.current,
                ),
                latency: event.latency,
                engine: event.engine,
                plan: event.plan,
                metrics: event.metrics,
                model: event.model,
                adjustments: event.adjustments,
              };
          }
          if (!completed)
            throw new Error(
              'Generation was interrupted. Your previous screen is preserved.',
            );
          next = completed;
          setStreamStatus('');
        } else {
          const response = await fetch('/api/compose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: value,
              current: { ...current.current, document: undefined },
              apiKey: useServerKey ? undefined : key || undefined,
              keySource: useServerKey ? 'server' : 'manual',
            }),
            signal: abort.signal,
          });
          const data = (await response.json()) as Result & { error?: string };
          if (!response.ok)
            throw new Error(data.error || 'Could not compose this screen.');
          next = { ...data, screen: validateScreen(data.screen) };
        }
        if (requestId !== sequence.current) return;
        // Commit the finished screen before removing the streaming overlay.
        setCompletedMetrics(next.metrics);
        apply(next.screen);
        setDraft(null);

        if (next.plan)
          recentArrangements.current = [
            ...recentArrangements.current,
            next.plan.arrangement,
          ].slice(-4);

        setLastPrompt(value);
        lastPromptRef.current = value;
        setInspecting(null);
        const order = placementOrder(composeLayout(next.screen));
        if (
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
          order.length &&
          !next.screen.document
        ) {
          setPlaced([]);
          setPlacement({ label: 'Layout ready', done: 0, total: order.length });
          await waitForPlacement(abort.signal, 100);
          for (let index = 0; index < order.length; index++) {
            if (requestId !== sequence.current) return;
            setPlaced(order.slice(0, index + 1));
            setPlacement({
              label:
                catalog.find((c) => c.id === order[index])?.name ?? 'Component',
              done: index + 1,
              total: order.length,
            });
            await waitForPlacement(
              abort.signal,
              placementInterval(order.length),
            );
          }
        }
        if (requestId !== sequence.current) return;
        setPlaced(null);
        setPlacement(null);
        return next.screen;
      } catch (e) {
        if (
          requestId === sequence.current &&
          !(e instanceof Error && e.name === 'AbortError')
        )
          setError(
            e instanceof Error ? e.message : 'Could not reach Jev. Try again.',
          );
      } finally {
        if (requestId === sequence.current) {
          setBusy(false);
          // Keep an unfinished draft visible; only completed documents are committed.
          setStreamStatus('');
          setPlaced(null);
          setPlacement(null);
        }
      }
    },
    [live, key, useServerKey, apply, engine, textModel, autoRepair],
  );
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools = [
      {
        name: 'compose_interface',
        description:
          'Compose the visible playground from a prompt. Uses OpenRouter credits when connected; otherwise uses the labeled local demo.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', minLength: 1, maxLength: 2000 },
          },
          required: ['prompt'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: async (input: unknown) => {
          if (
            !input ||
            typeof input !== 'object' ||
            !('prompt' in input) ||
            typeof input.prompt !== 'string' ||
            !input.prompt.trim() ||
            input.prompt.length > 2000
          )
            throw new Error('A prompt of 1–2000 characters is required.');

          setPrompt(input.prompt);
          const next = await compose(input.prompt);
          if (!next) throw new Error('Composition failed.');
          return next;
        },
      },
      {
        name: 'get_interface',
        description:
          'Read the current screen composition and available components.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => ({ screen: current.current, catalog }),
      },
    ];
    for (const tool of tools) {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    }
    return () => lifecycle.abort();
  }, [compose]);
  const active = screen.components;
  const toggleComponent = (id: string) => {
    cancel();
    const next = {
      ...current.current,
      components: active.includes(id)
        ? active.filter((x) => x !== id)
        : [...active, id],
    };
    apply(next);

    setInspecting(null);
  };
  const reset = () => {
    cancel();
    setResetVersion((v) => v + 1);

    apply(initialScreen);
    setSeen(initialScreen.components);
    setInspecting(null);

    setError('');
    setPrompt('');

    setLastPrompt('');
    lastPromptRef.current = '';
  };
  return (
    <TooltipProvider>
      <Toaster>
        <main className="workspace">
          <section className="studio">
            <div className="studio-heading">
              <div>
                <h1>Generate interfaces instantly</h1>
                <p>
                  Jev demo by{' '}
                  <a
                    href="https://x.com/hckmstrrahul"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    @hckmstrrahul
                  </a>
                </p>
              </div>
              <Button
                className="studio-connect"
                variant="outline"
                onClick={() => setSettings(true)}
              >
                {live ? <KeyRound /> : <Settings2 />}
                {live ? 'OpenRouter connected' : 'Connect OpenRouter'}
              </Button>
            </div>
            {error && (
              <div role="alert" className="error-banner">
                {error}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Dismiss error"
                  onClick={() => setError('')}
                >
                  <X />
                </Button>
              </div>
            )}
            <form
              className="composer"
              onSubmit={(e) => {
                e.preventDefault();
                void compose(prompt);
              }}
            >
              <Textarea
                value={prompt}
                maxLength={2000}
                onChange={(e) => {
                  cancel();
                  setPrompt(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    void compose(prompt);
                  }
                }}
                placeholder="Describe the interface you have in mind…"
                aria-label="Describe your interface"
              />
              <div className="composer-bottom">
                <span>
                  <Zap size={14} />
                  {live
                    ? engine === 'llm'
                      ? 'LLM · OpenRouter'
                      : 'Jev · OpenRouter'
                    : 'Connect OpenRouter to start'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="composer-hint">↵ to compose</span>
                  {busy ? (
                    <Button type="button" variant="outline" onClick={cancel}>
                      Cancel
                    </Button>
                  ) : (
                    <Button type="submit" disabled={!prompt.trim()}>
                      <ArrowUp />
                      {Boolean(lastPrompt) && lastPrompt === prompt.trim()
                        ? 'New variation'
                        : 'Compose'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
            <p className="composer-capability-note">
              <span>
                <Info aria-hidden="true" /> Note:
              </span>{' '}
              Create interface prototypes for finance, dashboards, portfolios,
              feeds and booking with prepared components. Live data, real
              transactions and arbitrary custom components aren’t generated.
            </p>
            <div className="prompt-suggestions">
              {examplePrompts.map(({ label, prompt: example }) => (
                <Button
                  key={label}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    cancel();

                    setPrompt(example);
                  }}
                >
                  <Sparkles size={13} />
                  {label}
                </Button>
              ))}
            </div>
            <div className="preview-toolbar">
              <span className="preview-label">
                <Monitor size={14} />
                Preview
              </span>
              <Tabs
                value={device}
                onValueChange={(v) => {
                  cancel();
                  apply({
                    ...current.current,
                    device: String(v) as Screen['device'],
                  });
                }}
              >
                <TabsList>
                  {devices.map(({ id, Icon }) => (
                    <TabsTrigger key={id} value={id} aria-label={id}>
                      <Icon size={15} />
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Reset playground"
                      onClick={reset}
                    />
                  }
                >
                  <RotateCcw size={14} />
                </TooltipTrigger>
                <TooltipContent>Reset playground</TooltipContent>
              </Tooltip>
            </div>
            <div
              className="canvas"
              aria-busy={busy}
              data-placing={placement !== null || undefined}
            >
              {!live || (!lastPrompt && !draft && !busy) ? (
                <div className="studio-empty">
                  <div className="studio-empty-mark">
                    <Sparkles size={24} />
                  </div>
                  <h2>
                    {live
                      ? 'Your next interface starts here'
                      : 'Connect OpenRouter to turn your prompt into an interface.'}
                  </h2>
                  {live && (
                    <p>
                      Choose an example or write a prompt, then press Compose.
                    </p>
                  )}
                  {!live && (
                    <Button variant="outline" onClick={() => setSettings(true)}>
                      <KeyRound size={15} />
                      Connect OpenRouter
                    </Button>
                  )}
                </div>
              ) : (
                <CompositionCanvas
                  hidden={false}
                  generationMs={
                    !busy && !draft ? completedMetrics?.totalMs : undefined
                  }
                  screen={draft ?? screen}
                  composing={busy || Boolean(draft)}
                  generationStatus={
                    busy && live && engine !== 'jev'
                      ? streamStatus || 'Planning your interface'
                      : undefined
                  }
                  awaitingContent={
                    busy && live && engine !== 'jev' && !hasLivePreview
                  }
                  unfinished={Boolean(draft) && !busy}
                  onRestore={() => {
                    cancel();
                    setError('');
                  }}
                  seen={seen}
                  resetVersion={resetVersion}
                  device={device}
                  onNavigate={(next) => {
                    cancel();
                    apply(next);
                  }}
                  inspecting={inspecting}
                  placed={placed}
                  onToggle={toggleComponent}
                  onClose={() => setInspecting(null)}
                />
              )}
            </div>
          </section>
        </main>
        <Dialog
          open={settings}
          onOpenChange={(open) => {
            setSettings(open);
            if (!open) {
              setKeyDraft('');
              setConnectionError('');
            }
          }}
        >
          <DialogContent className="connection-dialog sm:max-w-[480px]">
            <DialogTitle className="connection-title">
              Connect OpenRouter
            </DialogTitle>
            <DialogDescription className="sr-only">
              Choose a connection and composition engine.
            </DialogDescription>
            <fieldset className="connection-section">
              <legend>Connection</legend>
              <div className="connection-choices">
                {[
                  { id: 'server', label: 'Default key' },
                  { id: 'manual', label: 'Enter your key' },
                ].map((option) => (
                  <label
                    key={option.id}
                    className="connection-choice"
                    data-disabled={
                      (option.id === 'server' && !serverKey) || undefined
                    }
                  >
                    <input
                      type="radio"
                      name="key-source"
                      value={option.id}
                      checked={
                        (useServerKey ? 'server' : 'manual') === option.id
                      }
                      disabled={option.id === 'server' && !serverKey}
                      onChange={() => {
                        cancel();
                        setKeySource(option.id as 'server' | 'manual');
                        setConnectionError('');
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {!useServerKey && (
              <div className="connection-key">
                <Label htmlFor="openrouter-key">API key</Label>
                <Input
                  id="openrouter-key"
                  type="password"
                  value={keyDraft}
                  onChange={(e) => {
                    setKeyDraft(e.target.value);
                    setConnectionError('');
                  }}
                  placeholder={
                    key ? 'Key connected · paste to replace' : 'sk-or-v1-…'
                  }
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="connection-row">
                  <Label htmlFor="remember-key">Save on this device</Label>
                  <Switch
                    id="remember-key"
                    checked={rememberKey}
                    onCheckedChange={setRememberKey}
                  />
                </div>
              </div>
            )}
            {key && (
              <Button
                className="connection-delete"
                variant="ghost"
                onClick={() => {
                  try {
                    if (savedKey)
                      writeLocalConnection(window.localStorage, null);
                  } catch {
                    setConnectionError(
                      'Could not delete the saved key. Allow browser storage and retry.',
                    );
                    return;
                  }
                  cancel();
                  setKey('');
                  setKeyDraft('');
                  setRememberKey(false);
                  setSavedKey(false);
                  setKeySource(serverKey ? 'server' : 'manual');
                  setConnectionError('');
                }}
              >
                Delete my key
              </Button>
            )}
            <fieldset className="connection-section">
              <legend>Composition</legend>
              <div className="connection-choices">
                {[
                  { id: 'jev-first', label: 'Jev-first' },
                  { id: 'hybrid', label: 'Hybrid' },
                ].map((option) => (
                  <label key={option.id} className="connection-choice">
                    <input
                      type="radio"
                      name="composition-engine"
                      value={option.id}
                      checked={engine === option.id}
                      onChange={() => {
                        cancel();
                        setEngine(option.id as 'jev-first' | 'hybrid');
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {engine === 'hybrid' && (
              <>
                <fieldset className="connection-section">
                  <legend>Text model</legend>
                  <div className="connection-choices connection-model-choices">
                    {[
                      ...TEXT_MODELS.map((m) => ({
                        id: m.id,
                        label: m.name.split(' · ')[0],
                      })),
                      { id: 'custom', label: 'Custom' },
                    ].map((option) => (
                      <label key={option.id} className="connection-choice">
                        <input
                          type="radio"
                          name="text-model-preset"
                          checked={
                            option.id === 'custom'
                              ? !TEXT_MODELS.some((m) => m.id === textModel)
                              : textModel === option.id
                          }
                          onChange={() => {
                            cancel();
                            setTextModel(
                              option.id === 'custom' ? '' : option.id,
                            );
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {!TEXT_MODELS.some((m) => m.id === textModel) && (
                  <Input
                    aria-label="Custom model ID"
                    placeholder="provider/model-id"
                    value={textModel}
                    onChange={(e) => {
                      cancel();
                      setTextModel(e.target.value);
                    }}
                  />
                )}
                <div className="connection-row">
                  <Label htmlFor="auto-repair">Auto-fix invalid output</Label>
                  <Switch
                    id="auto-repair"
                    checked={autoRepair}
                    onCheckedChange={(value) => {
                      cancel();
                      setAutoRepair(value);
                    }}
                  />
                </div>
              </>
            )}
            {connectionError && (
              <p className="connection-error" role="alert">
                {connectionError}
              </p>
            )}
            <Button
              className="connection-primary"
              disabled={
                (!useServerKey && !keyDraft.trim() && !key) ||
                (engine === 'hybrid' && !textModel.trim())
              }
              onClick={() => {
                const manualKey = useServerKey ? key : keyDraft.trim() || key;
                if (
                  !useServerKey &&
                  (manualKey.length > 512 || /[\r\n]/.test(manualKey))
                ) {
                  setConnectionError('Enter a valid API key.');
                  return;
                }
                try {
                  if (rememberKey || savedKey)
                    writeLocalConnection(
                      window.localStorage,
                      rememberKey && manualKey
                        ? {
                            key: manualKey,
                            source: useServerKey ? 'server' : 'manual',
                          }
                        : null,
                    );
                } catch {
                  setConnectionError(
                    'Browser storage is unavailable. Enable it to save or delete a key.',
                  );
                  return;
                }
                cancel();
                setSavedKey(Boolean(rememberKey && manualKey));
                setKey(manualKey);
                setKeySource(useServerKey ? 'server' : 'manual');
                setKeyDraft('');
                setSettings(false);
                setConnectionError('');
                setError('');
              }}
            >
              {useServerKey
                ? 'Use default key'
                : rememberKey
                  ? 'Save & connect'
                  : 'Connect'}
            </Button>
          </DialogContent>
        </Dialog>
      </Toaster>
    </TooltipProvider>
  );
}
