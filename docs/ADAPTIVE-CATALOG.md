# Adaptive catalog coverage

All 64 entries in the installed app catalog are mapped to typed adaptive nodes. This is component-family coverage, not every upstream prop, variant, interaction or backend capability. The original prepared engine remains available.

| Component | Adaptive kind |
| --- | --- |
| Aspect Ratio | `aspect-ratio` |
| Card | `panel` |
| Collapsible | `collapsible` |
| Resizable | `resizable` |
| Scroll Area | `scroll-area` |
| Separator | `separator` |
| Sidebar | `sidebar` |
| Tabs | `tabs` |
| Button | `button` |
| Button Group | `button-group` |
| Checkbox | `checkbox` |
| Combobox | `combobox` |
| Date Picker | `date-picker` |
| Field | `field` |
| Input | `input` |
| Input Group | `input-group` |
| Input OTP | `input-otp` |
| Label | `label` |
| Native Select | `native-select` |
| Radio Group | `radio` |
| Select | `select` |
| Slider | `slider` |
| Switch | `switch` |
| Textarea | `textarea` |
| Toggle | `toggle` |
| Toggle Group | `toggle-group` |
| Breadcrumb | `breadcrumb` |
| Command | `command` |
| Context Menu | `context-menu` |
| Dropdown Menu | `dropdown-menu` |
| Menubar | `menubar` |
| Navigation Menu | `navigation-menu` |
| Pagination | `pagination` |
| Accordion | `accordion` |
| Avatar | `avatar` |
| Badge | `badge` |
| Calendar | `calendar` |
| Carousel | `carousel` |
| Chart | `chart` |
| Data Table | `data-table` |
| Item | `item` |
| Kbd | `kbd` |
| Table | `table` |
| Typography | `heading / text` |
| Alert | `alert` |
| Alert Dialog | `alert-dialog` |
| Dialog | `dialog` |
| Drawer | `drawer` |
| Empty | `empty` |
| Hover Card | `hover-card` |
| Popover | `popover` |
| Progress | `progress` |
| Sheet | `sheet` |
| Skeleton | `skeleton` |
| Spinner | `spinner` |
| Toast | `toast` |
| Tooltip | `tooltip` |
| Attachment | `attachment` |
| Bubble | `bubble` |
| Direction | `direction` |
| Marker | `marker` |
| Message | `message` |
| Message Scroller | `message-scroller` |
| Questionnaire | `questionnaire` |

## Rules and behavior

- The validator rejects unknown props, invalid targets, unsupported states, incorrect dates/ranges, malformed tables, invalid container children and nested forms/questionnaires.
- Every choice is a local binding. Use `when` panels to connect navigation, menus and pagination to content. `set` actions support typed string, numeric and boolean values.
- Overlay content lives under a dialog/sheet/drawer/alert-dialog node. A toggle button targets its id. Confirmations and toasts are local preview feedback.
- Tables can search and sort; calendars select single dates; sliders select a single numeric value; toggle groups are single-choice; questionnaires currently support one single-choice question per instance.
- Resizable panes stack on mobile; sidebar becomes horizontal navigation; context menus get a visible dropdown trigger on mobile. Rich tables and pane groups occupy broad grid sections.
- Existing Mint fonts/tokens and free Hugeicons remain authoritative. No model-authored CSS, HTML, JavaScript or external media URLs are accepted.

## Limits

The engine does not implement backend persistence, external routes, authentication, file uploads/downloads, payments or data fetching. Attachment nodes show metadata. A keyboard hint does not register a shortcut. Menus select local state; they do not infer business actions. Dates are single-select, not range-select. This intentionally bounded API is not full prop parity with each upstream primitive.

Jev still owns a bounded macro scaffold, while the text model chooses content and nested groups. The larger catalog may increase model latency and schema errors; no live quality or speed claim is made. The 100-node/depth-8 limits remain.

## Verification

Coverage tests assert every catalog entry maps to an adaptive kind. New kinds have contract-valid server-render fixtures. Negative tests cover invalid ranges/dates/pagination/labels and container constraints. Typecheck, lint and build are required. Browser interaction tests and live model benchmarking have not been run for this expansion.


### Benchmark regression fixes

Jev + LLM and LLM-only now receive distinct output protocols; Jev + LLM examples never instruct creation of a page root. Valid echoes of supplied scaffold nodes are ignored while Jev's original properties remain authoritative. Duplicate content ids and scaffold identity changes still fail. Node-limit errors are separate from duplicate-id errors. Field wrappers allow one input plus label/help-text children, can supply that child's missing label, and correctly associate their label with the control. Standalone controls still require labels. Data-table titles are optional to avoid forcing duplicate section headings. These fixes have deterministic regression coverage, not a verified live completion-rate claim.

### Bounded stream normalization

The stream parser accepts wrapped or bare node objects and buffers up to 100 nodes arriving before screen metadata. Metadata is still required. For kinds supporting gap, numeric values or numeric/px strings in 0–64 are snapped to the nearest approved spacing token (ties choose the smaller token). Other strings and out-of-range values fail. In Jev + LLM, content attached directly to jevPage/jevBody moves into jevPrimary, except an explicit level-1 heading goes to jevHeader. Jev's scaffold never changes. These adjustments are returned to the app and benchmark report. Invalid events include a bounded event/key/id/kind diagnostic without raw model text. These safeguards reduce avoidable protocol failures but do not prove semantic correctness or live success rates.
