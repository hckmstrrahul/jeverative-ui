Current Mint compliance and reference/variation changes are tracked in [the adaptive audit](MINT-ADAPTIVE-AUDIT.md); it distinguishes implemented rules from remaining gaps.

# Current engine: Jev-directed composition (jev-plan-v1)

Jev + LLM now makes a **required Jev decision call first**, not an optional review after generation. It chooses arrangement, density and section surfaces. The compiler turns those decisions into immutable page/header/body/primary/support nodes. The text model emits only content nodes under those slots; scaffold identity changes, root-level bypasses, unknown properties and empty slots fail validation. Valid scaffold echoes are ignored without applying their properties; new content IDs must be unique. Nested component composition remains text-model generated. This is Jev-directed macro composition, not Jev selecting every atomic component.

Desktop/tablet offer focused, stacked, equal, main-left and main-right arrangements; mobile offers focused and stacked. Density and surfaces vary independently. The bounded set cannot represent every possible app shell. All 64 installed catalog entries now have typed adaptive mappings, including richer inputs, navigation, overlays, containers and conversation primitives. See [coverage and bounded capabilities](ADAPTIVE-CATALOG.md). No claim of universal interfaces or proven design superiority is made.

Text generation streams validated content as it arrives, with one bounded correction attempt. Required select/radio fields are supported end to end. Empty unselected values are allowed for those controls; nonempty selections must exactly match an option. Malformed JSON and missing semantic content can still fail. Planning has a 12-second limit within the overall 120-second deadline. A Jev failure preserves the previous screen and reports an error: there is no silent LLM fallback in Jev + LLM. LLM-only remains an explicit comparison mode.

Connection settings label this **Jev-directed · adaptive UI**. Composition details show the actual plan and planning duration. Benchmarks record `compositionVersion`, `plan`, and `planMs`; they count completed Jev-composed results. They now measure a different architecture from the earlier reviewer experiment and should not pool those samples. `beforeReview` is retained only for compatibility and is not an ablation in this architecture. The text model still produces content and nested groups. The extra planning step may increase time to first content; reducing retries and generated scaffold tokens are hypotheses, not measured speed wins.

Validated with mock-provider route tests for all devices, strict plan decisions, plan-before-content ordering, immutable scaffold edges, slot completeness, planning failure without fallback, and select contracts. Existing renderer/stream/cancellation tests pass. Live generation requires the user's session key; no live model evaluation has been performed for this revision.


---

# Historical architecture notes (superseded where they conflict with the section above)

# Adaptive composition engine

## What the research changed

The previous representation stored a unique list of component types plus a recipe. It could select `field` once, but that entry rendered an entire prepared settings form. It could not represent four different input instances in two independently configured panels. Recipe reconciliation also reinserted blocks and imposed ordering after model decisions. More blueprints expanded the menu without addressing that representation.

Jeverative separates a typed component vocabulary, a UI document of instances and relationships, and a renderer backed by owned components. Catalog contracts define permitted properties and actions.

Jev selects supplied candidates, relationships and order. Open-ended prose and data require the text-model engines. Valid structure alone does not establish completeness or visual quality.

The transport uses incremental node events and validated document snapshots. Interaction state uses local binding identifiers; preview actions do not connect to an external business backend.

## Our implementation

`lib/tree/spec.ts` defines the catalog, permitted properties, validation, state defaults and document constraints. Each element has its own `id`, `parent`, `kind`, typed properties and optional state-based visibility condition. The same kind can occur many times. Parent-first ordering guarantees a connected acyclic tree; duplicate IDs, leaf parents, unknown props, nested forms, unbounded depth and dangling dialog targets are rejected.

`components/tree-renderer.tsx` maps the document to Mint-styled shadcn primitives, Hugeicons and Recharts. It supports actual group nesting, reusable independent fields, tabs with conditional content, local dialogs, form validation, reset/submit feedback and state-bound controls. Rendering never evaluates model-authored JavaScript, HTML or CSS.

`app/api/generate/route.ts` uses a text model to stream task-specific content and an element tree through OpenRouter. A Jev evaluation then chooses page width and grid counts using the resulting tree as context. Jev is a bounded layout reviewer here, not the author of arbitrary copy or a proven design-quality judge. Both model calls are visible in connection settings and use the same supplied OpenRouter key.

`lib/tree/stream.ts` handles split UTF-8, provider SSE framing, JSONL document events, completion and cancellation. The client shows a separate draft while generation runs. Only a complete, validated result replaces the current screen. Failure or cancellation discards the draft and preserves the previous completed screen. Interaction is disabled on a composing preview.

## Difference from the recipe engine

| Before | After |
| --- | --- |
| One selected entry per component type | Many configured instances of each type |
| Whole prepared sections | Individual labels, fields, controls and content |
| Recipe-defined relationships | Model-authored parent/child relationships |
| Fixed sample text by family | Prompt-specific generated text and data |
| Staged reveal after decisions finish | Actual progressive node arrival |
| A new template for each variation | New combinations within a typed vocabulary |

## Current coverage and limits

The adaptive registry has 26 composable types: page, stack, grid, panel, form, heading, text, avatar, icon, metric, badge, separator, input, textarea, switch, checkbox, select, radio, button, progress, table, chart, tabs, accordion, alert and dialog. These cover core layout, profile, settings, forms and data surfaces. The full 64-component official library and older Jev recipe engine remain available; not all 64 have adaptive adapters yet.

The default text model is `anthropic/claude-haiku-4.5`, editable in connection settings. Its availability was checked on [OpenRouter](https://openrouter.ai/anthropic/claude-haiku-4.5). Changing engines does not install another UI framework. With no connected key, the playground remains a labelled local demo using prepared recipes.

There is no unlimited design guarantee. Generation can still be semantically weak or fail validation. Validation failures trigger at most one correction request to the text model, using the failed output and validator feedback. Both attempts and Jev review share a 120-second deadline. Invalid previews are cleared before correction; a second failure reports the validation reason and preserves the previous completed screen. Authentication and transport failures do not trigger correction. Image generation, persisted version history, arbitrary code execution and external business actions are not implemented. Model review can adjust width, columns, spacing and two-column proportions; it does not currently relocate nodes. Bound interactive edits remain local and are not sent back as account data.

## Validation

Tests cover repeated component instances, all adaptive adapters, schema rejection, graph constraints, field defaults, UTF-8/SSE framing, intermediate snapshots, completion, model errors and the two-model request contract. Existing recipe tests remain in place. Live paid model evaluations and browser visual/interaction QA have not been performed; passing contract tests is not evidence that generated layouts are consistently beautiful.


## LLM-only comparison

Connection settings offer **LLM only · local layout rules**. This uses the identical text model, catalog, prompt, validation, correction policy and responsive renderer as Jev + LLM; it skips only Jev's width/column review. Composition details show server timing to first content (a non-container node, possibly from an attempt later repaired), text completion including repairs, review, and total. These exclude browser paint and network transit. No claim about model speed or design quality follows from a single run.

For a repeatable test, run `npm run benchmark` in an interactive terminal. If no `OPENROUTER_API_KEY` environment variable or server key is configured, it asks for a hidden, memory-only key. The key entered in the browser is not available to the CLI. Keep localhost running. Optional `BENCHMARK_MODEL` selects the same model for both arms; `BENCHMARK_REPEATS=1` gives a shorter smoke run. Default: five prompts across three devices, three repetitions per engine, sequential calls with alternating engine order. Each request starts fresh with no prior document. This makes 30 text generations, 15 Jev reviews and up to one repair per generation; it uses OpenRouter credits. The script is never run automatically.

The timestamped local JSON report includes each generated document, failures, correction counts and timings, without API keys. Compare completion rates and median successful latency together; excluding failures alone biases the result. Independently score relevance, hierarchy, spacing and interactions from 1–5, ideally with engine labels hidden. Match device and model, repeat close together, and treat three repeats as preliminary. Independent stochastic outputs measure end-to-end behavior, not the isolated causal effect of Jev on an identical tree. Costs are not measured. First-content server timing is a proxy, not time to browser paint.


## Reliability update after the first live benchmark

The report recorded nine generic invalid-node failures, one missing switch label and one JSON framing failure. Raw failed nodes were not saved, so their exact causes cannot be reconstructed. Validation now identifies bad ids, parents, unsupported kinds, missing props and expected property values. Control examples clarify switch/checkbox requirements. Missing props are accepted only for kinds with no required properties, as an empty object; missing labels and unknown kinds remain errors. The stream parser frames balanced JSON objects across arbitrary whitespace, handling quoted braces and escapes, while still validating each event.

Jev + LLM now sends a compact tree to Jev (row/series counts replace large datasets) and reviews gap and column proportions in addition to width/column count. Non-two-column grids cannot acquire split proportions. The benchmark saves `beforeReview` alongside the final document for direct same-tree comparison. Smaller simple-screen node guidance aims to reduce generated tokens, not cap complex screens. These are intended reliability/design/latency improvements; tests validate behavior but only another live run can measure their effects. Extra review decisions may offset payload savings.


## Selective Jev + LLM review

Both adaptive engines now apply the same local layout constraints before optional Jev review: mobile single columns, columns bounded by child count, at most two columns for substantial forms/data, compatible proportions, and semantic defaults for omitted gaps. Existing gap choices and content remain intact. Jev receives only ids, hierarchy, kinds, short labels and layout properties, excluding input values and datasets. At most six choices cover desktop page width and ambiguous grids. Column count and proportions are selected together; mobile and direct metric-only grids need no paid review.

Review has an eight-second deadline within the overall request deadline. Provider failure, invalid choices or a review timeout preserve the validated local baseline with explicit fallback status. User/request cancellation still aborts. The app and benchmark report applied/skipped/fallback, review duration and changed node count; fallback is not counted as a successful Jev review. `beforeReview` is the same constrained baseline used by the LLM-only path, allowing exact before/after review comparison. Changes are bounded layout changes, not proven quality gains; rerun the live benchmark and visually score the saved pairs before claiming an improvement.
