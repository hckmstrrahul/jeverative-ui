# Configurable prepared components

Revision: `jev-configurable-v2`. This extends Jev-only without adding a text model or installing another UI generator.

## Ownership

- The local compiler owns component implementations, schemas, supplied-data parsing, bindings and layout constraints.
- Jev selects relevant prepared instances, chooses groups/order and supported presentation properties.
- Supplied names and datasets remain literal data. Jev never emits executable code, arbitrary property names or free-form component JSON.
- Selection and configuration/placement use at most two Decisions requests. Simple components without configuration can use one. The canvas shows a loader and publishes the completed layout once.

## Supplying content

Use labelled lines in the ordinary prompt:

```text
Create a compact profile with identity, bio and INR/US wallets.
Name: Rahul
Role: Product designer
Bio: Designing thoughtful interfaces.
INR balance: 42500
USD balance: 1800
```

Also supported: `Title:`, `Email:`, `Primary label:` and `Destination:`. A quoted phrase such as `profile for "Asha Rao"` or `heading "My account"` binds directly. Unmarked prose is not an arbitrary content-extraction service.

For custom fields and datasets, include a fenced `json` block in the prompt. The existing 2,000-character prompt limit applies.

```json
{
  "title": "Project intake",
  "primaryLabel": "Save project",
  "fields": [
    {"label": "Project name", "value": "Mint refresh"},
    {"label": "Priority", "type": "select", "options": ["Low", "High"], "value": "High"},
    {"label": "Brief", "type": "textarea"}
  ],
  "metrics": [{"label": "Open projects", "value": "12"}],
  "table": {"title": "Projects", "columns": ["Name", "Owner"], "rows": [["Mint", "Rahul"]]},
  "chart": {"title": "Weekly projects", "series": [{"label": "Mon", "value": 3}, {"label": "Tue", "value": 5}]}
}
```

Fields support text, email, number, textarea, select, checkbox and switch. Limits: 8 fields, 6 metrics, 6 table columns, 12 rows/series points, 12 select options. Supplied fields/datasets are required candidates; they cannot disappear because Jev omitted them. Corresponding generic sample fields/datasets are excluded to avoid duplicates. Malformed data fails before paid evaluation.

Supplied data is sent to OpenRouter as part of the prompt. It is not written into project files or browser storage.

## Configurable properties

The placement request can also choose card/plain/subtle panel surfaces, section spacing, button emphasis, supported avatar sizes, line/bar charts, switch/checkbox states and select/radio values. Every question supplies allowed values. Initial values are preserved unless the prompt asks for a change. Spatial variations skip property changes and retain selected content. New explicitly requested values override previous document defaults; stale local edits do not overwrite those new defaults.

## Accommodation feeds

`airbnb homepage feed` now has a compatible prepared vocabulary: destination/date/guest controls, category pills and six sample listing cards. Each card has a title, location, price, rating, local decorative artwork and a save toggle. Known accommodation prompts do not need the generic capability gate, but component selection and placement remain Jev decisions.

Destination and category controls filter the local cards. Saved state survives filtering. Date and guest selections are local prototype state, not real availability queries. Booking, payments and live listings are not connected. Artwork is illustrative SVG, not photographs or images of real accommodation. `Destination:` customizes sample locations; it does not retrieve listings there.

## QA and limitations

`/qa/jev-first` is a deterministic gallery using the real compiler and renderer with mocked decisions and no API calls. The contract suite covers supplied data, defaults, malformed data, property choices, variation preservation, responsive feeds and filter behavior. Browser QA also checks filtering, save state and empty results.

The engine remains bounded by prepared components and supported properties. It does not yet configure every installed shadcn component or invent domain-specific content. Unfamiliar domains can use explicit fields/datasets; brand-specific app structure still requires suitable prepared candidates. Valid output and good defaults do not guarantee every Jev choice is relevant.

## Live verification — 2026-09-21

The exact prompt `airbnb homepage feed` completed in 1.88s using two Jev calls. Browser checks confirmed category filtering and saved state across filter changes. Visual QA caught a duplicate generic search box; generic and accommodation search now share one exclusive resource. A follow-up variation completed in 1.43s, preserved all six listings, changed three columns to two and removed the redundant search control. These are local smoke-test timings, not a broad latency benchmark.

The supplied profile completed in 1.10s with the expected name and INR/USD balances. The custom form initially exposed duplicate copy parsed from its JSON block; quoted-copy extraction now excludes structured data and explicitly bound text. The retest completed in 1.42s with one heading, the three supplied fields in order and one save action. All of these runs used two Jev calls and no text-model call.
