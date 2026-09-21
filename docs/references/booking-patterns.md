# Booking component coverage

Mobbin references reviewed on 2026-09-21:

- [KAYAK search results](https://mobbin.com/screens/97f7d3a2-d030-4452-9827-e0cafd8f40f1): route/date controls above results, filter controls, grouped journey details, separate fare choices.
- [Navan search results](https://mobbin.com/screens/7fe87258-88c9-405d-b18f-50d1ac0ccb08): origin/destination/date header, selection context, timed itineraries and fare tiers.

Adaptation: separate reservation criteria, selectable sample inventory, fare choices, preferences and contact details. Criteria precede inventory; optional checkout details follow. These are reusable registered primitives, with no copied assets or live inventory.

The common reservation vocabulary now covers flight, train, bus, car rental, restaurant reservation, event tickets and appointments. The non-flight adaptations are our design decisions, not claims of separate Mobbin research for every domain.

Recognized booking domains provide required criteria and result candidates before bypassing the generic capability question. Jev still selects optional groups, properties and arrangement. Unsupported arbitrary requests continue to fail explicitly. A flight prompt is no longer rejected simply because it is outside the old sample domains.

Limits: results are labelled sample options. Inputs and selections hold local state, but dates/routes do not fetch or recalculate availability. Preferences do not recalculate prices. Continue shows prototype feedback and does not book or charge. This expands coverage; it does not promise every possible booking product or instant completion.
