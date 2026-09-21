# Mint × shadcn × Jev

The 64 official shadcn catalog entries remain available. Mint styles their primitives; recipe variants give those primitives a useful job inside an application.

## Sources and precedence

- `mint/mint-ds-groww-invest-v0.19.md`: supplied canonical component anatomy and tokens.
- `mint/rules-groww-invest-v0.33.md`: supplied Groww Invest usage rules.
- Explicit user override: **Hugeicons Free Stroke Rounded**, including active navigation icons. Keep the Mint IconView wrapper and size scale; do not use the supplied Standard icon font or paid solid icons.
- Fonts are supplied local GrowwSans Regular/Medium and Sohne Kraftig. No external font request is required.
- Canonical token tables take precedence over the abbreviated CSS starter when they disagree (notably Surface Z2). Usage rules override generic canonical guidance for application behaviour (pressed overlays, body scale, financial values).

`python3 scripts/import-mint-tokens.py` regenerates the 92 use-case tokens per mode in `app/mint-tokens.css` and `lib/mint-tokens.json`. Transparent hover/press overlays are explicit implementation defaults because the export names these states without complete resolved values. They are recorded in the importer. Components reference use-case tokens through the shadcn variable bridge.

## Platform adaptations

| Profile | Logical canvas | Page padding | Composition |
| --- | --- | --- | --- |
| Mobile | 390 × 844 | 16px | Single working column; 40px controls, 48px primary dock, 64px root navigation; financial tables become list rows |
| Tablet | 834 × 1112 | 24px | Rail or top navigation; columns only when content fits; 40px controls |
| Desktop | 1440 × 900 | 32px | Rail/top navigation, readable work area and supporting columns; 40px controls |

The frame scales to fit the playground without changing its logical viewport. Its footer shows dimensions and scale. Manual device changes and explicit prompt device requests update the same screen state. Mobile roots use 3–5 destinations; focused forms and detail screens omit persistent navigation. Horizontal tabs and pills scroll rather than shrink or wrap.

Mint documents mobile anatomy; tablet/desktop arrangement is an intentional responsive adaptation, not a claim that those dimensions are specified in Mint. shadcn supplies the accessible interaction primitives. Row values remain body text and never truncate; names truncate first. Normal financial lists use a table on wide views and Mint thumbnail rows on phones.

## Decision contract

The full contract defines **79 questions**, scoped across two sequential OpenRouter calls (intent/content first, compatible modules and structural blueprint second):

- 64 Choice questions: component inclusion and priority.
- 9 Choice questions: layout, density, theme, recipe, device, navigation, emphasis, primary action, order unit.
- 1 Score: scope (simple, standard, rich), controlling sample row count.
- 2 Noul questions: search need and whether this is a refinement.

Questions are independent. No question assumes another answer is already available. All receive the same compact Mint rules, component purposes/roles/variants, recipes, device profiles, prompt, and current screen. The full company documents stay in the repository; they are not attached wholesale to requests.

`resolve-screen.ts` reconciles incompatible choices, consolidates duplicate controls, adds a recipe working area when only controls were selected, and adapts navigation. These changes appear in Decisions. It does not prune manual catalog selections. Choice/Score confidence and distributions are retained; uncertain device choices preserve the current device for refinements. Explicit device words take precedence.

Jev selects registered structures and sample content; it does not generate arbitrary prose, code or business data. Add new recipes and variants to expand coverage. The 15 current recipes cover dashboard, portfolio, markets, stock detail, order entry, funds, order history, derivatives, loans, planning, settings, conversation, generic forms, commerce and kanban.

## Rendering and motion

`composeLayout` gives every selected component exactly one semantic location. Fields, preferences, toolbar controls and page actions no longer each get a separate card. Tables and charts establish minimum column widths. Forms and chat keep a single reading column. Related components retain state while hidden or moved within their group; changing recipe or Reset starts new demo state.

The endpoint returns a batch, not a stream. The canvas reveals that completed plan in visual order using short opacity/transform transitions and a placement counter. Pending controls are inert and unavailable to assistive technology. New requests and manual changes cancel the prior placement sequence. Reduced motion skips staging. No fake token progress is shown.

## Known asset and scope gaps

- The logo host in the supplied documents returned HTTP 401. Stock/fund avatars use the documented two-character fallback; the app-bar brand mark is a neutral placeholder. Supply local logo assets to replace these.
- Only free outline rounded icons are used, so selected bottom navigation uses semantic colour rather than Mint's paid solid-icon variant.
- Order entry demonstrates stock quantity and market/limit price; IPO/F&O uses a 120×40px lot stepper with minimum one. Lot size and quotes are explicitly illustrative.
- All financial data, shopping actions, forms and navigation are local examples. No trade, account update, loan application or purchase is submitted.
- Browser interaction/visual QA and a live request with the user's in-tab key have not been performed. Automated checks cover rendering, contracts and layout decisions, not subjective visual quality.

## Verification

`npm test` renders every official catalog component and all 16 recipes at three profiles; exercises component conservation, grouping, minimum widths, pending states, cancellation, money formatting, device intent, malformed typed answers, probabilities and API errors. Upstream responses are mocked. `npm run typecheck`, `npm run lint`, and `npm run build` verify the application. Lint covers authored app/library/adapter code; the imported shadcn primitive source retains its upstream lint conventions.

References: [TypeSafe primitives](https://docs.typesafe.ai/primitives), [OpenRouter wire schemas](https://github.com/OpenRouterTeam/ai-sdk-provider/blob/main/src/evaluation/schemas.ts), [Hugeicons free React integration](https://hugeicons.com/docs/integrations/react/quick-start), [shadcn blocks](https://ui.shadcn.com/blocks).

The current structural and content rules are documented in [GENERATIVE-UI-RULEBOOK.md](GENERATIVE-UI-RULEBOOK.md). The new blueprint, contentMode, and settingsFocus choices extend the earlier contract.
