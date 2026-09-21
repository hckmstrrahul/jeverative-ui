# Mint adaptive audit · 21 September 2026

Sources: `/Users/rahulc/Downloads/mint-ds-groww-invest-v0.19.md` (canonical tokens and component anatomy) and `/Users/rahulc/Downloads/rules-groww-invest-v0.33.md` (Invest usage). This audit covers shared adaptive rules and the inspected component sections; it is **not certification that every statement across both documents is implemented**. Older integration notes primarily describe the prepared engine.

| Rule group | Adaptive status and evidence |
| --- | --- |
| Usage §1 colour families | Token bridge exists in mint.css / mint-tokens.css. Adapter surfaces inherit it. Structured financial-value now derives return/percentage colour from the numeric sign. Arbitrary prose still requires model intent. |
| §1.4 icons | Explicit user override: free Hugeicons Stroke Rounded, via shared icons adapter. Proprietary icon-font and filled-active-icon rules are intentionally not used. |
| §1.5 OnSurface | Matching border/muted/accent and disabled tokens on cards/nested cards. Sheet and alert-dialog now carry Mint theme context like other portals. Renderer supplies document theme itself. Portal appearance still needs browser testing. |
| §2.1 fonts and scale | Local GrowwSans/Sohne preserved. Adaptive h1 20/32, section 18/28, subsection 16/24; metrics 20/32. Body 14/20 and support 12/18. |
| §2.2 semantic weight | Positive/negative adaptive text explicitly uses weight 500. |
| §2.3 one anchor per card, body-only list values | Structured financial-value distinguishes list vs anchor; the stream normalizer keeps the first financial anchor in each panel and demotes extra anchors/list-row anchors to list typography without changing values. The final document validator still enforces the rule. Arbitrary metric/text nodes remain prompt-governed. |
| §2.4–2.5 financial formatting | financial-value runtime formatter enforces Indian grouping, two decimals, INR/USD/none, signed return/percentage values, inherited symbol typography. Prompt selects it for finance; arbitrary text/table strings are deliberately not reinterpreted. |
| §3.1 shadows | Existing Mint primitive overrides remove shadows. Browser verification still pending. |
| §3.4 radius | MintSurface observes actual panel height, including streamed changes: below 60px uses 8px radius; otherwise 16px. Plain surfaces remain plain. |
| §3.5 spacing | Corrected schema and normalizer to all 10 tokens: 2,4,6,8,12,16,20,24,32,40. Mobile page padding 16; desktop/tablet 24 is an explicit responsive adaptation. |
| §4 disabled, pressed | Token-based disabled styling, surface-matched disabled/pressed tokens and visible keyboard focus. Individual pressed/portal states still need visual verification. |
| §4 zero/unavailable values | Structured formatter renders zero return as secondary and unavailable as regular-weight secondary dash; values rounding to zero remain neutral. |
| §5.1 rows | mint-row adds text/icon/initials-thumbnail anatomy, optional trailing value/actions/chevron/divider, default/compact height rules, nonshrinking values and truncating titles. Label 14/20 medium; supporting text 12/18 with 2px gap. No remote thumbnail images are accepted. |
| §5.2 tabs | Sohne 16/24, horizontal scrolling without shrinking; 1px divider and active indicator at bottom, label + 32px width through fixed 16px side padding, rounded top corners. Uses shadcn keyboard navigation. |
| §5.3–5.4 app bar / bottom nav | Adaptive mint-app-bar supports standard/back/subtitle and root Search–QR–Profile actions. Root title reads bottom-navigation state; validator requires paired binding/visibility. mint-bottom-nav enforces 3–5 destinations and 64px anatomy. Mobile app bar reserves 24px status inset + 56px navigation. Official brand logo is unavailable. Status indicators, scroll-elevation behaviour and real routing/scanning are not implemented; actions report local preview feedback. |
| §5.5 buttons | Adaptive buttons expose small/medium/large, accent outline/ghost, disabled and width-preserving loading states. mint-action-dock enforces 1–2 button children with 48px full-width controls and helper/error strip. This is a task-section footer, not a keyboard-aware fixed viewport dock. |
| §5.6 pills / §5.7 order input | mint-pill offers independently bound removable multi-select filters and zero-hidden counts; mint-pill-group offers stylised/minimal single selection. mint-order-input enforces direct price/quantity/trigger vs lot-only stepper, 120×40 control, minimum one lot and disabled At market. Live trading validation/keypad integration is outside the local preview. |

## Compact interpretation

Usage rules explicitly caution against cramming and reserve compact list spacing for dense/secondary lists. The user's compact preference is implemented through smaller hierarchy, 16px card padding, fewer wrappers, and compact scaffold gaps; ordinary control targets and list padding remain intact. This preserves readability rather than shrinking everything.

## Mobbin and variation

Seven more screens were visually inspected using Mobbin MCP, adding to the existing evidence set. Observations and canonical URLs are stored in `lib/reference-evidence.json`. `lib/tree/references.ts` selects relevant observations for both Jev planning and text generation. No Mobbin images or brand styling were copied, no model was trained, and the runtime does not call Mobbin itself.

The Jev + LLM candidate set now has eight desktop/tablet arrangements and four mobile arrangements. New variation excludes recent candidates, including the current structure, from Jev's actual allowed choices. When candidates are exhausted it permits older ones but still excludes the immediate predecessor. Explicit layout constraints can retain the structure. The generated content prompt requests regrouping/hierarchy changes. This guarantees a different eligible scaffold, not a subjective visual-quality improvement or indefinitely unique interfaces.

## Verification

Contract tests cover exclusion, rejection of excluded choices, compilation of every candidate and all restored spacing tokens. Existing renderer, streaming, controls and cancellation tests are retained. Desktop browser visual verification is now documented in [Desktop UI QA](DESKTOP-UI-QA.md); live variation quality is not yet statistically evaluated.

## This revision: Before / After

| Before | After |
| --- | --- |
| Missing screen metadata could cause a paid correction and still fail. | Request-owned title/device/theme defaults allow a valid node stream to complete; explicit late metadata preserves nodes. Duplicate metadata, malformed nodes and missing done still fail. |
| Financial formatting, compact rows and specialized controls depended on prose. | Eight typed adapters expose Mint anatomy to both engines with validation and renderers. |
| Sheet and alert-dialog portals omitted the Mint theme class. | Both carry the theme context; adaptive renderer supplies its own document theme. |

## Remaining, explicitly not claimed complete

- Official Invest/915/W logo assets are not present in the supplied resources. No substitute logo is fabricated.
- Full app-bar variants (custom leading/action configurations, scroll response), simulated OS status indicators, keyboard-aware fixed docks, image thumbnails and all specialized order-card flows remain beyond the new bounded adapters.
- Arbitrary text, legacy metric values and table cells are not guaranteed to satisfy financial semantics; explicit financial-value nodes are. The prompt directs finance generation to those nodes.
- Desktop light/dark checks and live Jev + LLM generation are covered in [Desktop UI QA](DESKTOP-UI-QA.md). A comparable mobile/tablet visual sweep is still outstanding. Code/SSR tests do not certify pixel accuracy or model choice quality.

## Metadata regression verification

Tests reproduce omitted metadata for both API engines and assert completion with zero correction calls, correct request device/theme, preserved late-metadata nodes, and rejection of incomplete/invalid streams. New adapters render in the registry fixture suite; finance formatting and invalid navigation/order/dock configurations have contract tests. Build/typecheck/lint status is reported separately with the implementation result.

## Benchmark failure hardening

The 21:59 benchmark error categories now have offline regression coverage: metadata aliases and non-rendering extra metadata, optional support slots, missing chart titles, drawer sides, unsupported optional row icons, multiple financial anchors, repeated/protected repair removals, and the previous 100-node ceiling. The bounded document cap is now 256; parser/client stream limits accommodate larger snapshots. Unsupported component kinds, invalid bindings/data and documents beyond the cap still fail explicitly. This is not a promise that an LLM can never return invalid output.

Benchmark output prints the generation revision and stops if it changes between requests; a run during hot reload should not be treated as a comparison of one implementation.
