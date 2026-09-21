# Reference-backed composition

Mobbin references were inspected on 2026-09-20. These are observed layout patterns, not copied assets or model training. Mint remains authoritative for typography, colors, icons, spacing and control sizes.

| Reference | Observed pattern | Implementation |
| --- | --- | --- |
| [Fidelity](https://mobbin.com/screens/0dd015e1-3253-461b-bbd5-6625be377fb5) | One balance anchor, performance, then positions | Portfolio anchor with smaller supporting values; chart before records |
| [Crypto.com](https://mobbin.com/screens/e7692910-6ec0-4d66-8012-22ec1959bfc4) | Asset tabs immediately precede asset rows | Tabs grouped with the records section |
| [Hashnode](https://mobbin.com/screens/6442e278-2894-420e-9096-e54dbeef5651) | KPIs, wide chart, wide table | Analytics composition uses sequential full-width sections |
| [Retool](https://mobbin.com/screens/7cc2958e-84ad-404c-a224-a5afa1e20050) | Transaction table spans the main workspace | Tables no longer compete with charts in equal narrow columns; builder chrome excluded |
| [Curater](https://mobbin.com/screens/196fc896-d192-4945-8a5c-dbf8dc339aff) | Settings in readable grouped sections | Existing reading-width field and preference groups retained |
| [Contractbook](https://mobbin.com/screens/9d31c910-66ad-4a1a-8b83-7b4e012bca43) | Desktop settings retain navigation | Settings no longer forcibly remove persistent app navigation |

## Decision pipeline

1. Jev chooses recipe, device, density, theme, navigation and scope. Validate the typed response before proceeding.
2. A recipe palette limits the component questions. Jev receives the resolved plan and chooses compatible modules; unasked answers are ignored. Explicitly named components and the full-library showroom remain accessible.
3. Resolve contradictions, restore a missing primary working area unless the prompt requests an empty/restricted/removal state, adapt navigation, and attach record controls to their data.
4. Place selected components using the existing cancellable staged reveal. This is not upstream token streaming.

The API now uses two sequential decision calls. Both share a 35-second deadline and the incoming abort signal. Failure in either phase leaves the previous screen intact. Expect some additional latency/cost compared with one request. All 64 primitives remain available in the manual library.

## Validation and limits

Contract checks cover phase separation, typed responses, incompatible modules, source component conservation, scoped controls, chart-before-table order, and mobile/tablet/desktop navigation. The library still uses 16 curated recipe families and sample content; arbitrary application structures are not yet represented. No claim of live model accuracy or browser visual validation is made by these tests.

The expanded grammar and the additional 18 reviewed references are documented in [GENERATIVE-UI-RULEBOOK.md](GENERATIVE-UI-RULEBOOK.md) and `lib/reference-evidence.json`.


## Expanded compact-composition references · 21 September 2026

These seven screens were visually inspected via Mobbin MCP. Only structural observations are used; Mint styling takes precedence.

- [Juicebox](https://mobbin.com/screens/92ab8c8e-bd90-40a8-87eb-73bcfde6c7d4): Account navigation at left; separate editable account sections with helper/action strips. Borrow grouping, not the generous whitespace.
- [Dovetail](https://mobbin.com/screens/d6b3c793-eb67-47a5-ad2e-2e4a42cfdbde): Settings subnavigation beside an editable profile form; avatar aligned to the right; identities and access are separate sections.
- [Airwallex](https://mobbin.com/screens/c297f16f-e1b0-47d6-b149-17cafab328a3): Personal details and contact/login are grouped separately; edit actions align to section edges and save/cancel remain local to the edited section.
- [Givingli](https://mobbin.com/screens/61fcb959-6603-49ef-9a1c-d2c813659439): Identity row precedes a single cash-balance anchor and plain account-action rows. Image-source action sheet is visible; its overlay styling is not copied.
- [Phantom](https://mobbin.com/screens/f9b56a18-e350-406e-8f62-a6d2957be8f4): Compact identity header, paired Profile/Settings actions, cash balance, account list and a bottom Add Account action.
- [Mixpanel](https://mobbin.com/screens/b311e285-23f1-4e43-91c6-fc27dec02225): Metric summary grid sits above records; date/filter toolbar above; query configuration is separated into a right inspector.
- [Obvious](https://mobbin.com/screens/da7a42a4-7e7f-4bbe-a77e-c29c3f2834ea): Conversation occupies a narrow left work pane beside an analytics surface with summary metrics and a visitors table; workspace navigation is separate.
