# Jeverative

A prompt-driven shadcn/ui playground. Jev chooses a composition; React renders registered components. No generated code is executed.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by the server. Use **Connect OpenRouter** to supply a key for the current tab session, or set `OPENROUTER_API_KEY` in `.env` and restart the server. Session keys stay in React memory and are forwarded through the app server to OpenRouter; they are not written to localStorage or logged. Reloading clears a session key.

Without a key, the playground uses clearly labeled local demo rules. Demo output is not a Jev result. Connecting a key enables live calls; the first composition validates access. Auto-compose is opt-in and issues a billable request after a 750 ms typing pause. Aborting an in-flight request cannot guarantee cancellation of upstream billing.

## What is included

- All 64 entries from the official shadcn/ui component catalog, including composed recipes for Date Picker, Data Table, and Typography.
- Searchable library with interactive previews and manual add/remove controls.
- Responsive framed web preview with desktop, tablet, and mobile widths.
- Jev composition through OpenRouter's alpha Decisions endpoint.
- Layout, theme, density, priority, and component selection in a single request.
- Decision inspector with the screen schema and actual response timing for live calls.
- State preserved for mounted components while they are hidden or reordered. Reset deliberately clears demo controls.
- Optional imperative WebMCP tools: `compose_interface`, `get_interface`.

The library is the official catalog, not the community registry directory. Components contain sample data and local demonstration actions. Jev does not create arbitrary copy, fetch business data, generate code, or wire real product actions. The emulator is a responsive React canvas, not a VM or arbitrary-code sandbox. Component overlays use the playground's accessible portal layer.

## Architecture

1. `lib/catalog.ts` defines all registered component IDs and the screen contract.
2. `components/component-preview.tsx` provides a working composition for every catalog entry.
3. `lib/decisions.ts` builds 69 typed questions: 64 placement choices plus layout, density, theme, context, and emphasis.
4. `app/api/compose/route.ts` validates the prompt and current state, calls `https://openrouter.ai/api/alpha/decisions` with `typesafe/jev-1.13`, validates all answers, and returns a safe screen plan.
5. The client updates stable component instances. Stale responses are discarded. API failures preserve the current screen and never silently switch to demo mode.

Sources: [shadcn catalog](https://ui.shadcn.com/docs/components), [TypeSafe concepts](https://docs.typesafe.ai/concepts/system-one), [official OpenRouter evaluation implementation](https://github.com/OpenRouterTeam/ai-sdk-provider/tree/main/src/evaluation).

## Checks

```sh
npm test
npm run typecheck
npm run build
```

Contract tests render every component on the server and exercise API validation, ordering, origin checks, error handling, and the OpenRouter request/response mapping with mocked upstream responses. A real Jev response requires your API key. Browser interaction QA and WebMCP runtime validation have not been performed.

## Implementation plan

- [x] Scaffold the app and install the official component library.
- [x] Build the monochrome playground and responsive emulator.
- [x] Register every component with interactive sample content.
- [x] Add prompt composition, manual inspection, and decision view.
- [x] Integrate the Jev Decisions API with server-side validation.
- [x] Add session-key connection and optional auto-compose.
- [x] Verify rendering and API contracts; build for production.
- [ ] Verify a live Jev call with the user's key.
