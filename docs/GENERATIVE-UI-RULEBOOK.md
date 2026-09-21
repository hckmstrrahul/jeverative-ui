# Jeverative composition rulebook

This is an executable composition system, not a fine-tuned model or a promise of unlimited interfaces. Mobbin was used to inspect reference screens; the application uses the resulting local grammar at generation time. It does not call Mobbin for every user prompt.

## Authority and decision order

1. Explicit user intent determines the task, platform and requested content.
2. Mint controls fonts, color semantics, icons, dimensions, spacing and control states.
3. A screen family determines compatible tasks. Public profiles are separate from editable settings.
4. A structural blueprint determines required modules, ordering, readable width and responsive behavior.
5. Jev chooses optional modules only when they add a distinct function.
6. The resolver enforces anatomy, prevents duplicate controls and adapts device navigation.

`lib/ui-grammar.ts` is the executable registry. `lib/reference-evidence.json` records 18 newly inspected references and observations. `docs/MOBBIN-PATTERNS.md` records the earlier six references. References inform structure; their branding, photography and assets are not copied.

## Coverage

| Family | Structures | Distinction |
| --- | --- | --- |
| Profile | Cover/activity, identity/work rail, centered collection, compact account | Header silhouette, identity placement, collection versus feed, content domain |
| Settings | Grouped, sidebar, cards, summary/detail split, accordion | Category navigation, information disclosure, grouping and column structure |
| Dashboard | Report, operations, pulse | Chart-first report, records-first workspace, compact metrics/trend |
| Portfolio | Performance, holdings | Trend-first versus records-first |
| Planning | Schedule, priorities | Calendar/support split versus priority-first sequence |
| Conversation | Thread, context | Narrow conversation versus wider thread with attachment context |
| Commerce | Catalog, collection | Search/filter-first versus featured collection-first |
| Form | Focused, guided | Short form versus progress and supporting details |
| Kanban | Board, project | Immediate task board versus project context before board |
| Markets, funds, derivatives, orders, stock detail, order, loans | Overview, focused (each) | Complete recipe versus primary task with optional support |

Total: 38 structures in 16 families. Profile/settings have dedicated new renderers. Other families reuse existing domain components and vary composition and module scope. These are not 38 independently designed applications.

## Variation policy

- Repeating a creation prompt excludes the previous blueprint within that family.
- Explicitly requesting a named structure overrides anti-repetition.
- Cosmetic refinements preserve the current family, content domain, settings focus, components and structural blueprint. Device changes adapt that blueprint.
- Variation must change spatial organization, content priority or disclosure. Changing color alone is not a structural variation.
- Structural choices are finite. After several generations, patterns can recur; the current system avoids immediate repeats, not all historical repeats.
- Jev chooses the blueprint from family-scoped options in phase two. The server rejects an answer outside those options.

## Profile anatomy

Required: coherent identity, role or short bio, local actions, relevant facts, and work/collection/activity content. Never substitute an account form for a public profile.

- Cover: cover band establishes identity; identity/action area leads into a feed.
- Identity rail: identity is a narrow desktop column, work occupies the main column; stack identity first on small devices.
- Centered: identity/actions centered above a collection grid with generous breathing room.
- Compact: horizontal identity and compact facts, followed by list-style content.

Content domains: personal, professional, creator, investor. Each has relevant labels, facts and sample collections. This is typed sample content, not arbitrary generated prose. Local profile editing, follow state, content switching and collection detail dialogs work in the preview.

## Settings anatomy

Settings focus is separate from layout:

- General: identity, preferences, notifications and security (fewer sections for simple scope).
- Security: two-factor control, sign-in alerts, password action and sessions.
- Notifications: topic controls and delivery channels.
- Billing: plan, billing email, receipt preference and account information.
- Connections: integration connection state and security context.

Each setting requires a visible label. Descriptions explain consequences, not implementation. Related controls share a section. Save feedback describes local preview behavior honestly. Secondary navigation changes the visible pane while keeping other pane state mounted. Expanding sections uses accessible shadcn accordion primitives. Provider connections, session removal and password actions are local demonstrations, not external account operations.

## Layout constraints

- Mobile inset 16px; tablet 24px; desktop 32px. Use Mint spacing values only.
- Forms maintain readable widths. Wide desktop workspaces may use a secondary navigation column or independent cards.
- Settings cards collapse before a card would become too narrow. Category navigation becomes a horizontal scroll row on small devices.
- Identity rails stack above content on narrow devices.
- Tables retain the full workspace row even when supporting modules use a grid.
- A report places summary before chart before records; an operations screen can prioritize records.
- Record filters and record tabs travel with their table. Do not move chart-specific time controls away from the chart.
- Navigation expresses destinations; tabs express sibling content; pills express filters.
- Never add a loading/empty/error sample to a normal screen unless requested.
- Do not add both a compound field group and duplicate standalone inputs or labels.
- Do not add generic buttons when a compound account or order module already owns its actions.

## Visual and interaction constraints

Mint tokens remain authoritative across variants. GrowwSans handles body/UI text; Sohne is for structural and numeric anchors. Free Hugeicons Stroke Rounded remains the icon source. Use one dominant identity or numeric anchor. Supporting values are visually quieter. Avoid nested cards, ornamental badges and multiple unrelated primaries.

Interactive rows use buttons and visible focus styles. Inputs have associated labels and useful types. Switches retain their state. Tabs/section selectors expose selected state. Motion remains short and reduced-motion aware; variation does not introduce gratuitous animation.

## Evidence versus adaptation

Observed patterns are recorded verbatim as observations in the reference index. Their adaptation to Mint, responsive breakpoints, the progressive settings accordion, and the overview/focused alternates for financial flows are implementation decisions—not claims that every variant was seen in Mobbin. The board reference informs planning context but is not evidence for a calendar layout.

## Regression prompts

- Mobile creator profile; repeat it; make it dark; switch to desktop.
- Professional profile with identity beside selected work.
- Centered personal profile with collections.
- Desktop security settings; mobile notification preferences.
- Investor account settings with notification preferences.
- Connected apps settings; billing settings in cards.
- Sales dashboard; another sales dashboard; a minimal analytics pulse.
- Mobile portfolio; desktop holdings; tablet project board.

Checks cover 38 blueprints × 3 devices × 2 themes, registry validity, required anatomy, component conservation, specific settings content, anti-repetition, explicit structure requests, refinement preservation and second-phase rejection. Server rendering and contract checks do not establish visual quality or live model accuracy; browser and live-model evaluation remain separate.

## Inspected reference index

| Screen | Platform | Observed structure |
| --- | --- | --- |
| [Skillshare](https://mobbin.com/screens/e76d27b0-9688-49dd-8e48-1ea37d7c9ea5) | web | Identity column beside tabbed posts and project tiles; identity remains a separate anchor. |
| [Substack](https://mobbin.com/screens/8ba7d093-10f9-4dbd-8e83-c7021b3adf95) | web | Cover banner above identity, action row, content tabs and activity feed. |
| [Savee](https://mobbin.com/screens/be7f012b-a3a7-4027-8ec6-9e2c2a9000f7) | web | Centered identity and actions above a broad image collection with compact stats. |
| [CVS Health](https://mobbin.com/screens/7bfd68bd-058d-4b39-b097-b448b3ac6ab4) | ios | Compact identity and edit action above separate account and health destination groups. |
| [ChatGPT](https://mobbin.com/screens/cb1e2e78-a7f7-4e76-a1e2-67d509361235) | ios | Centered identity above grouped account rows with icon, value and chevron anatomy. |
| [Jomo](https://mobbin.com/screens/ecb928b5-6d8c-4677-9604-9ea5242a3525) | ios | Compact identity, current-plan card and grouped general settings rows. |
| [Tally](https://mobbin.com/screens/8dd9ce6a-c8cb-46de-abe9-1d53fb2e9188) | web | Readable security, connected-account and danger sections separated by generous whitespace. |
| [Magnific](https://mobbin.com/screens/75651e2a-13a5-49d9-b115-1bea89ab9681) | web | Global navigation plus secondary settings navigation; password, security, integrations, notifications and sessions are distinct sections. |
| [Base44](https://mobbin.com/screens/39833a72-4b70-46ef-b05c-f990e8cbfe92) | web | Settings category rail with separate integration, two-factor and destructive-action cards. |
| [NYTimes](https://mobbin.com/screens/9667af4a-22b9-4584-b92d-749f4a9eedd0) | ios | Topic-level toggles pair strong labels with supporting descriptions; continuation action follows the list. |
| [Quicken](https://mobbin.com/screens/a67919a5-de03-4df3-b275-71e4fb6fa930) | ios | A parent pause control precedes subordinate notification choices, which are disabled when paused. |
| [Satispay](https://mobbin.com/screens/39970997-a7e2-4de7-989d-32a583123895) | ios | Notification topics group their own push and email channels rather than repeating a generic settings list. |
| [Programa](https://mobbin.com/screens/894a77ba-3553-4f11-a721-e274fd07b621) | web | Project scope and view controls precede a board; each status column has its own task count and creation affordance. |
| [Pinterest](https://mobbin.com/screens/22864846-19a6-4f9d-af14-fb6322a75cd9) | web | Overall metrics grouped in a summary band above a wide performance chart; chart-level controls sit with the chart. |
| [Plum](https://mobbin.com/screens/9275b181-4dce-4f1d-9c84-a12803b3174f) | ios | Discovery search and category chips precede named investment categories with compact product cards. |
| [Square](https://mobbin.com/screens/1f4158f5-53d6-4ff0-94dd-6ea6e3e6727f) | web | Conversation list, active message thread and contact context occupy separate columns; composer attaches to thread. |
| [Klarna](https://mobbin.com/screens/ab04c0f2-28f4-4b54-9a72-76cdd148428a) | web | Category filters occupy a desktop side column; result count and sorting precede a multi-column product grid. |
| [Life Reset](https://mobbin.com/screens/708859a9-bb1d-4cae-8f46-01397186c68b) | ios | Progress steps precede a short form; labelled inputs keep units visible and continuation is anchored at the bottom. |
