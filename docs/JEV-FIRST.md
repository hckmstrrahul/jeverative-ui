# Jev-only composition

Jev-only is the default composition mode. It uses the shared styled component renderer and does not execute generated code. Jev + LLM is the secondary option in the header. Legacy engine identifiers remain internal for compatibility.

## Implementation

1. Build a catalog of individually validated Mint elements and small semantic groups. Candidates have typed labels, bindings, sample or supplied data, and local actions. See [configurable components](CONFIGURABLE-COMPONENTS.md) for content inputs and property choices.
2. One Jev Decisions request selects relevant candidates, title, theme and macro layout. Exclusive resources (such as chart variants) cannot be selected twice.
3. Keep a stable loading state in the canvas while placement is decided. The temporary flat selection is not rendered.
4. A second batched Decisions request chooses group membership, reading order and group layout. A one-candidate screen with no configurable properties skips this call.
5. Apply semantic grouping and reading-order constraints, compile the final document, validate it locally and publish completion once. There is no text-model call or paid correction stage.

Jev owns content selection and spatial choices; local code owns valid properties, graph construction, spacing and responsive constraints. Mobile layouts stay single-column. Unused columns collapse. Consecutive summary metrics share a row on wide screens. Tables are not placed inside nested narrow grids.

Variations preserve selected candidate content and title, exclude the previous macro layout when possible, and ask Jev for a new grouping/order. This is bounded variation, not unlimited creativity. Existing candidate ownership is tracked through the parent graph, not overlapping ID prefixes.

## Coverage and limits

Prepared content covers profile/wallets, account settings, sales, portfolio, task status lists, support inbox, checkout, meeting scheduling and accommodation discovery. Supplied fields and datasets extend the vocabulary beyond those sample domains. These are composable elements, not eight complete page templates. Quoted prompt text can become a text candidate.

This mode cannot invent arbitrary domain content or new component implementations. Sample financial data is not live data. Form controls, checkboxes and switches have local state; submit/payment/booking actions show prototype feedback. General search and period inputs do not filter sample tables or recompute charts; accommodation destination and category controls do filter their local listings. Task lists do not implement drag-and-drop. For open-ended content, choose Jev + LLM explicitly. Unsupported requests fail visibly; they never silently incur a text-model call.

Provider failures and poor semantic selections remain possible. Valid structure does not guarantee excellent design. An arrangement failure preserves the previous completed screen. Cancellation aborts upstream work; consumed provider usage can still be billed.

## Testing and measurement

`npm test` includes sixteen scenario/theme render checks, catalog validation, single-presentation timing, the Decisions-only route, invalid responses, cancellation, content conservation, candidate ownership, metric rows, unused columns and one-call screens.

Run a paid comparison with your own key:

```sh
BENCHMARK_ENGINES=jev-first,hybrid BENCHMARK_REPEATS=1 npm run benchmark
```

The CLI asks for a key privately. Jev-only reports total/first-content time, number of Jev calls and available Jev usage. Missing provider usage stays unknown; partial costs are not a full bill. The preview corner displays completed server-side duration; benchmark output retains call counts. Network and rendering add to perceived duration.

Local live smoke tests on 2026-09-21 succeeded for a desktop profile, desktop sales dashboard and mobile settings. Initial measured dashboard/settings completions were 1.58s/1.43s, each with two Jev calls and zero text calls. These historical timings precede the single-presentation update. These few prepared-content tests are not a controlled quality or latency comparison against Jev + LLM. Visual review prompted metric grouping and wide-content placement fixes. A subsequent live variation completed in 1.83s, retained dashboard content and rendered the summary metrics together. These times are server-reported completion durations.

## Stable presentation and semantic constraints

The canvas now waits for the completed Jev arrangement instead of displaying a flat selection and then reparenting every element. `firstContentMs` consequently measures completed-layout availability. Selection and arrangement progress remain visible. The renderer provider keeps a stable identity across document commits.

`lib/jev-first/rules.ts` keeps related fields/actions, wallet data, analytics and booking/checkout controls together; enforces context-before-detail and input-before-action order; keeps wide data out of reading columns; and gives the conversation thread the wider pane. These constraints do not add components or make additional model calls. Jev still selects candidates and chooses eligible arrangements. Rules cover the current prepared vocabulary and need to grow alongside new candidates.

## Stable internal identifiers

Display names are **Jev-only** and **Jev + LLM**. API requests, stored documents and benchmark captures retain `jev-first` and `hybrid`, respectively, so existing integrations and results continue to work. Source directory and historical document filenames retain those identifiers as well. A label change does not change which models run.
