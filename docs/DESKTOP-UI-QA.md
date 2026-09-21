# Desktop UI QA — 21 September 2026

Scope: nine fresh Jev + LLM generations in the existing authenticated localhost browser, plus the existing checkout. The sweep deliberately varied tasks; it was not a statistically random or blinded design-quality benchmark. Reviewed with Emil's design-engineering principles: restrained hierarchy, useful spacing, visible control labels, readable data and purposeful motion. All nine fresh runs completed. This does not imply all possible prompts will succeed.

## Live screens inspected

| Case | Main observations |
| --- | --- |
| Existing delivery checkout | Repeated financial captions; duplicate accessible field names. |
| Bicycle sales dashboard | Two date displays per picker; nested card frames; missing first chart tick and numeric scale. |
| Freelancer settings | Excess list spacing; visible duplicate labels in the edit-profile dialog. |
| Support inbox | Conversation list above chat; oversized rows; nested scrolling. |
| Architecture kanban | Three lanes squeezed into a 760px reading column. |
| Warehouse inventory | Search and sorting present; duplicated disconnected search control; numeric columns left aligned. |
| Dark investment portfolio | Nested surfaces; long supporting list above primary content. |
| Ceramics booking | Repeated radio-group label; date-picker duplication; static summary differs from editable controls. |
| Library analytics | Side-by-side charts worked; supporting events list dominated the first viewport; repeated heading hierarchy. |
| Second support inbox | Prompt guidance alone still produced stacked panes, motivating a structural renderer guard. |

## Shared fixes

| Before | After | Why |
| --- | --- | --- |
| Field and input both own a label, including in portals. | Field owns the visible label; input/select/textarea/date/radio adapters avoid duplicating it. Switches and checkboxes have explicit accessible names. | Compact forms and unambiguous names. |
| Date value repeated in two stacked controls. | One native date input with an adjacent Calendar action. | Preserves keyboard entry and calendar selection without repeated copy. |
| Repeated financial captions in a labelled row. | Exact sibling/row caption matches render once; amounts remain intact. | Clear financial hierarchy without changing data. |
| Padded list rows also have large container gaps. | Repeated rows/preferences use 4px gaps, preserving internal padding and control targets. | Compact spacing without tiny controls. |
| Empty outer card frames wrap already-framed content. | Untitled framing-only containers become plain. | Removes redundant borders and padding without deleting content. |
| Desktop board inherits reading width. | Actual resizable panes, data tables and three-plus-column grids widen desktop pages. Jev also has a full-width workspace choice without a support slot. | Desktop tasks have room to work. |
| Conversation list and active chat stack vertically. | A desktop container with a list scroller and conversation subtree gets two tracks at a broad canvas width. | Makes both panes visible together; retains Jev's main/support structure. |
| Chart lacks numeric scale/first tick and replays drawing animation. | Numeric axis, preserved end labels, compact captions and immediate data updates. | Readable data without extra apparent generation latency. |
| Dark chart tick selector misses Recharts 3 wrappers. | Current tick class uses Mint secondary text token; native controls get the appropriate color scheme. | Readable charts and native date controls in dark mode. |
| Both message directions use accent bubbles. | Incoming messages are neutral; outgoing messages and metadata align to the end. | Clear conversation direction. |
| Numeric columns align like prose. | Numeric columns align right, use tabular numerals and show active sort direction. | Easier comparison and visible interaction feedback. |
| New generation retains old viewport scroll offset. | Canvas resets on the awaiting-content transition only. | New screens start at the top without resetting scroll on every streamed node. |

The generation prompt now specifies desktop inbox panes, broad chart/board layouts, compact lists, one financial caption, coherent sample totals and conditional content for filters. Jev's summary-first choice explicitly calls for a compact summary, not a long supporting list. These are guidance improvements, not deterministic guarantees about model content.

## New benchmark failure coverage

The supplied `adaptive-repair-v4` run completed 14/15 Jev + LLM and 11/15 LLM-only, with successful-run medians of 10,297ms and 15,877ms. Both had nine repaired runs. These results predate the final QA changes and are not a new measured speed result for `desktop-qa-v5`.

Local regression cases now cover omitted overlay parents, missing contextual labels on button-group/financial-value/mint-pill-group, and fields incorrectly grouping multiple controls. Missing overlay placement attaches to its existing parent or the document's main region; explicit unknown parents still fail. Labels come from existing context or readable node identifiers. Multi-control fields become labelled plain panels with all children preserved. Invalid component kinds, unsupported data and invalid explicit graph references remain errors.

## Repeatable browser verification

Open `http://localhost:3000/qa`. Four reduced fixtures reproduce settings/dialogs, a dashboard, a desktop board and an inbox using the real renderer. They are derived regression cases, not saved full model outputs or a benchmark. No API requests or credentials are needed. Light/dark toggle is included.

Verified in the browser after changes:

- Dialog shows one Full name, Bio, Start date and Availability label; opens with input focus.
- Calendar opens and selecting 22 September updates the date input to 2026-09-22.
- Two-factor switch and weekly-digest checkbox change checked state.
- Table Quantity sorts 2, 8, 12; searching Road leaves the Road Bike row.
- Board uses full desktop width with three peer columns.
- Inbox list/chat/support are visible beside each other; message direction is distinct.
- Dashboard chart shows July through December plus numeric ticks, with no drawing animation.
- Dashboard and inbox width measurements show no horizontal overflow at a 1440px canvas.
- Light/dark screenshots inspected; dark root background, chart labels and native controls corrected.

Automated checks: full contract suite, TypeScript, lint and local production build. This sweep does not certify every mobile/tablet screen, every interaction, or all model variations. The browser-only API key was cleared by development hot reload; reconnect it for further live runs. No deployment was performed.

## Remaining limits

Generated filters and sample summaries can still be semantically disconnected. Prompt guidance discourages this, but the tool does not implement arbitrary backend filtering, profile persistence, message sending or business calculations. Generated totals can be inconsistent. Jev can still select an unhelpful region order and the text model can choose generic content. A fresh blinded visual comparison and a new repeated benchmark are needed to quantify quality and speed gains; deterministic component fixes do not prove model-level superiority.
