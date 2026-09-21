'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TreeRenderer } from '@/components/tree-renderer';
import { Box, X } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComponentPreview } from '@/components/component-preview';
import { catalog, type Screen } from '@/lib/catalog';
import { recipes, deviceProfiles } from '@/lib/mint';
import { getBlueprint } from '@/lib/ui-grammar';
import { MintDataProvider } from '@/components/mint-data-context';
import { MintThemeContext } from '@/components/mint-theme';
import { MintShell } from '@/components/mint-shell';
import { composeLayout, type CompositionSection } from '@/lib/composition';

type Props = {
  screen: Screen;
  composing?: boolean;
  generationStatus?: string;
  generationMs?: number;
  awaitingContent?: boolean;
  unfinished?: boolean;
  onRestore?: () => void;
  seen: string[];
  resetVersion: number;
  device: string;
  inspecting: string | null;
  hidden: boolean;
  placed: string[] | null;
  onToggle: (id: string) => void;
  onClose: () => void;
  onNavigate?: (screen: Screen) => void;
};

export function CompositionCanvas({
  screen,
  composing = false,
  generationStatus,
  generationMs,
  awaitingContent = false,
  unfinished = false,
  onRestore,
  seen,
  resetVersion,
  device,
  inspecting,
  hidden,
  placed,
  onToggle,
  onClose,
  onNavigate,
}: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (awaitingContent) {
      const canvas = frame.current?.querySelector('.mint-app-viewport');
      if (canvas) canvas.scrollTop = 0;
    }
  }, [awaitingContent]);
  const [frameHeight, setFrameHeight] = useState(
    deviceProfiles[screen.device].height + 72,
  );
  useEffect(() => {
    const parent = stage.current?.parentElement;
    if (!parent || !frame.current) return;
    const measure = () => {
      const style = getComputedStyle(parent);
      const available =
        parent.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      if (available > 0)
        setScale(Math.min(1, available / deviceProfiles[screen.device].width));
      if (frame.current?.offsetHeight)
        setFrameHeight(frame.current.offsetHeight);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    observer.observe(frame.current);
    measure();
    return () => observer.disconnect();
  }, [
    screen.device,
    screen.recipe,
    screen.blueprint,
    screen.contentMode,
    screen.settingsFocus,
    resetVersion,
    hidden,
    inspecting,
  ]);
  const plan = composeLayout(screen);
  const retained = composeLayout({ ...screen, components: seen }, screen);
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [
    screen.recipe,
    screen.blueprint,
    screen.contentMode,
    screen.settingsFocus,
    resetVersion,
  ]);
  const columns =
    plan.layout !== 'stack' &&
    width >= plan.minimumColumnsWidth &&
    plan.minimumColumnsWidth > 0;
  const mainWidth = Math.max(
    plan.sections.find((s) => s.id === plan.primary)?.minWidth ?? 0,
    360,
  );
  const sideWidth = Math.max(
    280,
    ...plan.sections
      .filter(
        (s) =>
          s.id !== plan.primary && !['summary', 'feedback'].includes(s.kind),
      )
      .map((s) => s.minWidth),
  );
  const active = new Set(screen.components);
  const available = placed === null ? active : new Set(placed);
  const isPlacing = placed !== null;
  const info = recipes[screen.recipe];
  const idToName = (id: string) => catalog.find((c) => c.id === id)?.name ?? id;
  const part = (id: string, extra = '') => {
    const pending = active.has(id) && !available.has(id);
    return (
      <div
        key={`${id}-${resetVersion}`}
        data-component={id}
        data-pending={pending || undefined}
        hidden={!active.has(id)}
        aria-hidden={pending || undefined}
        inert={pending || undefined}
        className={`composed-component ${extra} ${pending ? 'placement-pending' : isPlacing ? 'placement-arrived' : ''}`}
      >
        <ComponentPreview
          id={id}
          scenario={screen.scenario}
          screen={screen}
          composed
        />
      </div>
    );
  };
  const zone = (ids: string[], className: string, label: string): ReactNode => (
    <div
      className={className}
      hidden={!ids.some((id) => active.has(id))}
      aria-label={label}
    >
      {ids.map((id) => part(id))}
    </div>
  );
  const drawSection = (section: CompositionSection) => {
    const current = plan.sections.find((s) => s.id === section.id);
    const pending = Boolean(
      current?.components.every((id) => !available.has(id)),
    );
    return (
      <section
        key={`${section.id}-${resetVersion}`}
        hidden={!current}
        className={`composed-section section-${section.kind} ${section.surface === 'panel' ? 'section-panel' : ''}`}
        data-section={section.id}
        style={
          columns && plan.layout === 'split' && section.id === plan.primary
            ? {
                gridRow: `span ${Math.max(1, plan.sections.filter((s) => s.id !== plan.primary && !['summary', 'feedback'].includes(s.kind)).length)}`,
              }
            : undefined
        }
        data-primary={section.id === plan.primary || undefined}
        data-pending={pending || undefined}
        aria-label={section.title ?? idToName(section.components[0])}
      >
        {section.title && (
          <header className="section-heading">
            <h3>{section.title}</h3>
            {section.description && <p>{section.description}</p>}
          </header>
        )}
        <div className="section-components">
          {section.components.map((id) => part(id))}
        </div>
      </section>
    );
  };
  const actionsAtEnd =
    plan.recipe === 'settings' || plan.recipe === 'conversation';
  return (
    <MintThemeContext value={screen.theme}>
      <MintDataProvider
        key={
          screen.document
            ? `document-${resetVersion}`
            : `${screen.recipe}-${screen.blueprint ?? 'default'}-${screen.contentMode ?? 'personal'}-${screen.settingsFocus ?? 'general'}-${resetVersion}`
        }
      >
        <div
          ref={stage}
          hidden={hidden}
          className="device-stage"
          style={{
            width: deviceProfiles[screen.device].width * scale,
            height: frameHeight * scale,
          }}
          data-device={screen.device}
        >
          <div
            ref={frame}
            hidden={hidden}
            className={`emulator mint-theme ${device} ${screen.theme === 'dark' ? 'dark' : ''}`}
            style={
              {
                '--device-height': deviceProfiles[screen.device].height + 'px',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              } as React.CSSProperties
            }
            data-composing={isPlacing || undefined}
          >
            <div className="browser-bar">
              <div className="traffic-lights">
                <i />
                <i />
                <i />
              </div>
              <span>
                {inspecting ? 'components / ' + inspecting : '/preview'}
              </span>
              {!composing &&
              !unfinished &&
              !inspecting &&
              generationMs !== undefined ? (
                <output
                  className="preview-generation-time"
                  aria-label={`Jeverated in ${(generationMs / 1000).toFixed(2)} seconds`}
                >
                  Jeverated in {(generationMs / 1000).toFixed(2)}s
                </output>
              ) : (
                <Box size={13} />
              )}
            </div>
            {generationStatus || unfinished ? (
              <output
                className={
                  awaitingContent
                    ? 'canvas-generation-loading'
                    : 'canvas-generation-progress'
                }
                aria-live="polite"
              >
                <span>
                  {unfinished
                    ? 'Unfinished preview · not saved'
                    : generationStatus}
                </span>
                {unfinished && onRestore ? (
                  <Button variant="ghost" size="sm" onClick={onRestore}>
                    Restore completed screen
                  </Button>
                ) : null}
                {awaitingContent ? (
                  <span
                    className="canvas-generation-skeleton"
                    aria-hidden="true"
                  >
                    <i />
                    <i />
                    <span>
                      <i />
                      <i />
                    </span>
                    <i />
                    <i />
                  </span>
                ) : null}
              </output>
            ) : null}
            {screen.document ? (
              <div className="mint-app-viewport" hidden={Boolean(inspecting)}>
                <TreeRenderer
                  key={resetVersion}
                  document={{
                    ...screen.document,
                    device: screen.device,
                    theme: screen.theme,
                  }}
                  busy={composing}
                />
              </div>
            ) : (
              <MintShell
                screen={screen}
                hidden={Boolean(inspecting)}
                onNavigate={onNavigate}
              >
                <div
                  hidden={Boolean(inspecting)}
                  className={`composed-screen ${screen.density}`}
                  data-recipe={screen.recipe}
                  data-blueprint={getBlueprint(screen).id}
                >
                  <div
                    className="composed-shell"
                    data-has-rail={plan.rail.length > 0 || undefined}
                  >
                    {zone(
                      retained.rail,
                      'composed-rail',
                      'Application navigation',
                    )}
                    <div className={`composed-page width-${plan.width}`}>
                      {zone(
                        retained.navigation,
                        'composed-navigation',
                        'Page navigation',
                      )}
                      <header
                        className="composed-page-heading"
                        hidden={screen.recipe === 'profile'}
                        data-mobile={screen.device === 'mobile' || undefined}
                      >
                        <div>
                          <div className="page-context">
                            Mint <span>/</span>{' '}
                            {screen.scenario === 'settings'
                              ? 'Preferences'
                              : screen.scenario === 'conversation'
                                ? 'Messages'
                                : 'Workspace'}
                          </div>
                          <h2>{info.title}</h2>
                          <p>{info.subtitle}</p>
                        </div>
                        <Badge variant="outline" className="sample-label">
                          Sample data
                        </Badge>
                      </header>
                      {zone(
                        retained.identity,
                        'composed-identity',
                        'Page identity',
                      )}
                      {zone(
                        retained.notices,
                        'composed-notices',
                        'Page notices',
                      )}
                      <div
                        className="composed-commandbar"
                        hidden={
                          !plan.toolbar.length &&
                          (actionsAtEnd || !plan.actions.length)
                        }
                      >
                        {zone(
                          retained.toolbar,
                          'composed-toolbar',
                          'Filters and controls',
                        )}
                        {!actionsAtEnd &&
                          zone(
                            retained.actions,
                            'composed-actions',
                            'Page actions',
                          )}
                      </div>
                      <div ref={viewport} className="composition-measure">
                        <div
                          className={`composed-body ${columns ? `columns-${plan.layout}` : 'columns-stack'}`}
                          style={
                            columns && plan.layout === 'split'
                              ? {
                                  gridTemplateColumns: `minmax(0, ${mainWidth}fr) minmax(0, ${sideWidth}fr)`,
                                }
                              : undefined
                          }
                        >
                          {[...retained.sections]
                            .sort((a, b) => {
                              const position = (id: string) => {
                                const n = plan.sections.findIndex(
                                  (s) => s.id === id,
                                );
                                return n < 0 ? 999 : n;
                              };
                              return position(a.id) - position(b.id);
                            })
                            .map(drawSection)}
                          {!screen.components.length && (
                            <div className="canvas-empty">
                              <Box size={25} />
                              <h3>A little room for possibility.</h3>
                              <p>Add a component or try a new prompt.</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {actionsAtEnd &&
                        zone(
                          retained.actions,
                          'composed-actions form-actions',
                          'Form actions',
                        )}
                      {zone(
                        retained.footer,
                        'composed-utilities',
                        'Supporting controls',
                      )}
                    </div>
                  </div>
                </div>
              </MintShell>
            )}
            {inspecting && (
              <div className={`screen component-inspector ${screen.density}`}>
                <div className="inspect-heading">
                  <div>
                    <div className="eyebrow">COMPONENT PREVIEW</div>
                    <h2>{idToName(inspecting)}</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={Boolean(screen.document)}
                      title={
                        screen.document
                          ? 'Use a prompt to place or remove an element in this composition.'
                          : undefined
                      }
                      onClick={() => onToggle(inspecting)}
                    >
                      {active.has(inspecting) ? 'Remove' : 'Add to canvas'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Close component preview"
                      onClick={onClose}
                    >
                      <X />
                    </Button>
                  </div>
                </div>
                <div className="inspector-surface" key={inspecting}>
                  <ComponentPreview
                    id={inspecting}
                    scenario={screen.scenario}
                  />
                </div>
              </div>
            )}
            <div className="emulator-footer">
              <span>
                {inspecting
                  ? 'Interactive component'
                  : screen.document
                    ? `${screen.document.nodes.length} elements · adaptive composition`
                    : `${screen.components.length} components · ${plan.recipe}`}
              </span>
              <span>
                {deviceProfiles[screen.device].width} ×{' '}
                {deviceProfiles[screen.device].height} ·{' '}
                {Math.round(scale * 100)}%
              </span>
            </div>
          </div>
        </div>
      </MintDataProvider>
    </MintThemeContext>
  );
}
