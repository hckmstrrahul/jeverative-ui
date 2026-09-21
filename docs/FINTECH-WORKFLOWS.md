# Fintech workflow coverage

This inventory defines the supported prototype workflows, not every financial product or a production banking backend. Jev selects prepared groups and bounded properties; local React components own forms, validation, review and state transitions. There are no text-model calls during these interactions.

| Area | Implemented workflow | Reusable groups | Current boundary |
| --- | --- | --- | --- |
| Investing | Equity/crypto Buy and Sell order | Price chart with range controls, position card, performance, depth, quantity/price ticket, fee review, docked actions | Sample instrument and position; no exchange connection, derivatives or order matching |
| Investing | Fund investment / monthly SIP | Fund summary, chart, allocation, amount/frequency, review | No fund eligibility checks or mandate setup |
| Banking | Add money | Source account, amount, review and receipt | No account linking or bank settlement |
| Transfers | Send money | Recipient, account/reference, amount, fees, available balance check | No beneficiary verification, FX or cross-border compliance |
| Cards | Freeze/unfreeze and spending limit | Card selection, status, limit, change review | Local sample card only; no card issuance or PIN handling |
| Lending | Repayment | Balance, schedule table, payment account, amount, review | No underwriting, amortization calculation or loan origination |
| Insurance | Claim submission | Policies, policy reference, incident, claim amount, review | No uploads, adjudication or insurance quotes |
| Merchant | Issue invoice | Invoice list, customer, description, amount, review | Single invoice amount; no tax engine, line-item editor or payment collection |
| Verification | Identity submission | Name, country, document choice, checklist, review | Fictional details only; no identity-document upload or verification service |
| Personal finance | Record expense | Budget summary, category table, description/amount/category | No bank-feed sync or recurring expense automation |

## Flow contract

`details → input → review → loading → success | pending | failed`

- Empty state offers a clear start action.
- Invalid input stays in input, with labelled field errors and an error announcement.
- Review shows the entered values, illustrative fees and totals. Edit returns to the same values.
- Confirm revalidates and enters simulated loading; a second confirmation cannot submit again.
- Loading is deliberately user-advanced through “Show demo result”; there is no fake network latency.
- Pending never masquerades as completed. Failure preserves values and returns through review before retrying.
- Success shows a clearly labelled demo reference. No money is moved or credentials uploaded.
- Amount arithmetic uses integer minor units. Trade quantity is a positive integer; selling more than the sample holding and spending beyond the demo balance are blocked.

## Jev decisions and local rules

`lib/fintech/workflows.ts` owns the ten typed workflow contracts. `lib/jev-first/finance.ts` exposes them as candidates. `finance-flow` and `finance-chart` are validated node kinds with finite property enums.

Jev chooses component groups, arrangement, compact/comfortable density, supported currency, initial state, simulated outcome, chart style and range. The compiler supplies valid field keys and choices. Jev cannot invent executable callbacks or skip validation inside an interaction. Required groups survive optional-group omission. Stock content keeps quote → chart → holdings → performance → depth order; dock actions open the appropriate Buy/Sell dialog.

Changing the selected range shows a subset of illustrative chart samples. The charts are not live market charts. Existing table and metric nodes supply positions, repayment schedules and transaction lists; workflow review reuses a shared summary renderer.

## Reference research

These references were visually inspected through Mobbin MCP. Screenshots are not shipped or queried during generation.

- [Wealthsimple stock detail](https://mobbin.com/screens/0d391e24-47a1-4155-865f-005f06313fa2): prominent price, chart, range selection and compact market statistics.
- [Stake stock detail](https://mobbin.com/screens/b7a4e784-becb-4bab-a44b-dfba2049cb9c): prominent chart and persistent Buy/Sell access.
- [KOHO sending money](https://mobbin.com/flows/1dfe2e77-b5fc-497a-beba-961c9cc1ed42): empty recipient list, amount entry, available balance context and explicit sent feedback in the returned preview screens.
- [Wise freezing a card](https://mobbin.com/flows/35609bd6-1dff-48f8-aaee-c30f40140825): clear Active/Frozen state with the reverse action available.
- [PayPal invoice detail](https://mobbin.com/screens/b3eca1fa-663a-47e7-91f0-3a8c1a1bff91): customer/context separated from monetary breakdown and total.

The shared input/review/state engine is an implementation decision, not a claim that every reference follows the same steps. Additional domains need their own research and contract extensions; adding reference images alone does not expand capability.

## Verification

`npm test` covers ten workflows × eight states × three devices (240 compiled documents), 160 direct state/currency renders, positive paths for all three outcomes, decimal arithmetic, invalid input, balance/holding limits, double-submit guards and edit/retry conservation. Existing component, streaming, booking and composition regressions also run.

A development-only QA page renders each workflow/state at mobile, tablet and desktop widths. Production routing blocks the entire QA route family. Browser QA checks real form input, review totals, confirmation, card status changes, retries, chart controls and dock dialogs. Automated fixtures use deterministic Jev answers and do not establish provider reliability or latency; real Jev checks are reported separately.

### Browser check results (September 21, 2026)

- Inspected all ten workflow layouts and checked all 240 workflow/state/device combinations for horizontal overflow: none found.
- Entered an over-balance transfer, then a valid ₹1,250.29 transfer; validation blocked the first and review displayed ₹1,255.29 including the illustrative ₹5 fee.
- Confirmed a card status change to Frozen, tested failure → review retry, changed chart ranges and opened the Sell dialog with Sell selected.
- Real Jev: stock detail completed in 2.95s; desktop transfer with pending confirmation completed in 1.51s. These are individual local observations, not a latency guarantee.
