# Mint Design System — Usage Rules · Groww Invest

> **Theme:** Groww Invest
> **Version:** v0.33
> **Type:** Usage Guidelines
> **Note:** This file changes independently of token definitions (design-system.md). Token values live there; how and when to use them lives here.


> **Downloaded:** 20 Sep, 2026

---

## Contents

1. [Colour Rules](#1-colour-rules)
2. [Typography Rules](#2-typography-rules)
3. [Surface & Layout Rules](#3-surface--layout-rules)
4. [Interaction & State Rules](#4-interaction--state-rules)
   - 4.1 Disabled state
   - 4.2 Pressed / tapped state
   - 4.3 Zero return
   - 4.4 Placeholder values
   - 4.5 Positive returns always semantic
5. [Component Application Notes](#5-component-application-notes) — *how Invest uses each component*
6. [In-context Examples](#6-in-context-examples)
7. [Changelog](#7-changelog)

---

## 1. Colour Rules

### 1.1 Three-step framework

Every colour decision follows three steps in order.

**Step 1 — Identify the element type**

Every element falls into one of three categories:
- **Background** — surfaces, fills, containers
- **Border** — outlines, dividers, strokes
- **Content** — text, icons, any foreground element

**Step 2 — Identify the token family**

Token names are prefixed by element type:

| Element type | Token prefix | Examples |
|-------------|-------------|---------|
| Background | `background...` | `backgroundPrimary`, `backgroundAccent` |
| Content | `content...` | `contentPrimary`, `contentAccent` |
| Border | `border...` | `borderNegative`, `borderAccent` |

**Step 3 — Pick the token based on semantic role**

| Role | Background | Content | Border |
|------|-----------|---------|--------|
| **Accent** | `backgroundAccent`, `backgroundAccentSubtle` | `contentAccent` | `borderAccent` |
| **Positive** | `backgroundPositive`, `backgroundPositiveSubtle` | `contentPositive` | `borderPositive` |
| **Negative** | `backgroundNegative`, `backgroundNegativeSubtle` | `contentNegative` | `borderNegative` |
| **Warning** | `backgroundWarning`, `backgroundWarningSubtle` | `contentWarning` | `borderWarning` |
| **Disabled** | `backgroundDisabled` | `contentDisabled` | `borderDisabled` |
| **Neutral** | `backgroundPrimary`, `backgroundSurfaceZ1/Z2` | `contentPrimary`, `contentSecondary`, `contentTertiary` | `borderPrimary` |

---

### 1.2 Background tokens

Backgrounds come in three levels of visual emphasis. The most important design decision is: **does the user need to act on this, or is it informing them?**

> **Act → High emphasis. Inform → Subtle.**

#### Neutral backgrounds

Used for surfaces — the base canvas and elevated panels.

| Token | Use for |
|-------|---------|
| `backgroundPrimary` | Main app canvas — the lowest surface |
| `backgroundSurfaceZ1` | Cards, sheets, bottom drawers — one level above primary |
| `backgroundSurfaceZ2` | Nested cards, modals, popovers — two levels above primary |
| `backgroundSecondary` | Subtle alternate fills within a surface |
| `backgroundTertiary` | Further de-emphasised fills |

#### High emphasis backgrounds

Solid, saturated colours for maximum emphasis — primary buttons, critical alerts, destructive actions.

| Token | Semantic role |
|-------|--------------|
| `backgroundAccent` | Primary brand actions — Buy button, CTAs |
| `backgroundPositive` | Success states, positive confirmations |
| `backgroundNegative` | Destructive actions — Sell button, errors |
| `backgroundWarning` | Caution states |
| `backgroundAccentSecondary` | Secondary brand surfaces |
| `backgroundInversePrimary` | Inverted/dark surface on a light screen |

Always pair with `contentOnColour` or `contentOnColourInverse` for text legibility.

#### Subtle (low emphasis) backgrounds

Soft tints for contextual colour — banners, chips, inline alerts. The colour signals the nature of the message without demanding action.

| Token | Semantic role |
|-------|--------------|
| `backgroundAccentSubtle` | Soft brand highlight |
| `backgroundPositiveSubtle` | Soft success tint |
| `backgroundNegativeSubtle` | Soft error/loss tint |
| `backgroundWarningSubtle` | Soft warning tint |

Always pair with the matching `contentOn*Subtle` token.

#### When to use high emphasis vs subtle

| Scenario | Use | Example |
|----------|-----|---------|
| User must act on it | High emphasis | Buy button, Sell button, Confirm CTA |
| Message box / contextual banner needing slight emphasis | Subtle | "Order executed" toast, info banner, "SIP due" alert |
| Financial data — price change, profit, loss, return | Content colour only — no background | Gain %, loss amount, P/L value, return % |

```
Buy button      → backgroundAccent           (demands action)
"Order placed"  → backgroundPositiveSubtle   (message box — needs background emphasis)
+2.34% gain     → contentPositive only       (financial data — no background)
-₹200 loss      → contentNegative only       (financial data — no background)
Error banner    → backgroundNegativeSubtle   (inline message box, not a button)
Sell button     → backgroundNegative         (destructive action)
```

> **Financial data rule:** For price changes, profit, loss, returns, and any gain/loss indicator, use `contentPositive` or `contentNegative` on a transparent background. Do not wrap them in a `backgroundPositiveSubtle` or `backgroundNegativeSubtle` chip. The subtle background tokens are reserved for message boxes and contextual banners where a background tint is needed to create visual separation and meet accessibility requirements. Using them on financial data values creates unnecessary visual noise and misrepresents the token's intent.

---

### 1.3 Content tokens

#### Neutral content

| Token | Use for |
|-------|---------|
| `contentPrimary` | Primary text — stock names, key values, headings |
| `contentSecondary` | Supporting text — labels, subtitles, captions |
| `contentTertiary` | De-emphasised — category dividers, metadata, timestamps |

#### Semantic content

| Token | Use for |
|-------|---------|
| `contentAccent` | Brand-coloured text — CTAs, highlighted values |
| `contentPositive` | Gains, returns in profit, positive confirmations |
| `contentNegative` | Losses, errors, destructive actions |
| `contentWarning` | Caution labels |

**`contentPositive` and `contentNegative` are the primary way to communicate financial data.** For price changes, profit/loss values, return percentages, and any gain/loss indicator, apply these tokens directly to the text on a transparent background. Do not add a `backgroundPositiveSubtle` or `backgroundNegativeSubtle` fill behind financial values — that pattern is reserved for message boxes.

```
+₹2,004.50 (1D return)   → contentPositive, no background    ✓
+2.34%                    → contentPositive, no background    ✓
-₹200 (loss)             → contentNegative, no background    ✓
"Order executed" banner  → backgroundPositiveSubtle + contentOnPositiveSubtle  ✓
+₹2,004.50               → backgroundPositiveSubtle chip      ✗  (wrong — not a message)
```

**Semantic colour is always truthful.** `contentPositive` means positive regardless of context — do not downgrade it to `contentPrimary` because the screen is informational.

#### ContentOn — for high emphasis surfaces

| Token | Pair with |
|-------|----------|
| `contentOnColour` | All high emphasis backgrounds (backgroundAccent, backgroundPositive, backgroundNegative, backgroundWarning) |
| `contentOnColourInverse` | `backgroundInversePrimary` |

#### ContentOn — for subtle surfaces

| ContentOn token | Pairs with |
|----------------|-----------|
| `contentOnAccentSubtle` | `backgroundAccentSubtle` |
| `contentOnPositiveSubtle` | `backgroundPositiveSubtle` |
| `contentOnNegativeSubtle` | `backgroundNegativeSubtle` |
| `contentOnWarningSubtle` | `backgroundWarningSubtle` |

**Exclusivity rule:** `contentOn*Subtle` tokens are the *only* correct text colours for their matching subtle backgrounds. Do not substitute the base semantic token — it is not tuned for legibility on that surface.

| Subtle background | Correct text token | Never use |
|------------------|-------------------|-----------|
| `backgroundAccentSubtle` | `contentOnAccentSubtle` | `contentAccent` |
| `backgroundPositiveSubtle` | `contentOnPositiveSubtle` | `contentPositive` |
| `backgroundNegativeSubtle` | `contentOnNegativeSubtle` | `contentNegative` |
| `backgroundWarningSubtle` | `contentOnWarningSubtle` | `contentWarning` |

Never mix tokens across semantic roles. `contentOnPositiveSubtle` on `backgroundNegativeSubtle` is always wrong.

**`contentInversePrimary` for text on dark or inverted surfaces.** When text sits on a surface that uses `backgroundInversePrimary` (a dark card or overlay on a light screen), use `contentInversePrimary` — not `contentPrimary`, not `contentOnColour`.

```
Text on dark overlay card  →  contentInversePrimary   ✓
Text on dark overlay card  →  contentPrimary           ✗  (contentPrimary is for light surfaces)
```

**Never mix two different colour tokens within the same subtitle or same-level text.** If two elements are at the same hierarchy (both are sub-text, both are metadata, both are secondary labels in the same row), they must use the same colour token. The colour communicates hierarchy — mixing tokens at the same level creates false hierarchy.

```
"₹14,899 · Approve by 5PM"  →  both contentSecondary             ✓
"₹14,899 · Approve by 5PM"  →  ₹14,899 contentPrimary + Approve by 5PM contentSecondary  ✗
```

The only exception: if one of the values carries semantic meaning (gain = contentPositive, loss = contentNegative), it uses the semantic token while its paired label stays in contentSecondary.

---

### 1.4 Icon rendering — IconView component

**Every icon must be wrapped in the `mds-iconview` component.** Never render a bare icon outside this wrapper.

**Icons use the class-based approach.** The icon name goes as a CSS class, NOT as text content. The `groww-huge-standard.css` stylesheet (linked in `<head>`) provides the `::before` rendering.

```html
<!-- CORRECT — class name on the <i> element -->
<span class="mds-iconview mds-iconview--medium" style="color: var(--contentPrimary);">
  <i class="gh-standard-arrow-left-01"></i>
</span>

<!-- WRONG — text content does not render icons for this font -->
<i class="gh-standard">arrow-left-01</i>
```

#### IconView sizes

| Size token | px | Common use |
|------------|-----|-----------|
| `xsmall` | 12px | Dense metadata, tiny supplementary icons |
| `small` | 16px | Inline with `body-small` text |
| `medium` | 20px | **Default** — list rows, app bar actions, standard UI |
| `large` | 24px | Prominent standalone icons, bottom nav |
| `xlarge` | 28px | Hero / feature icons |

#### HTML implementation

```html
<!-- Medium (default) -->
<span class="mds-iconview mds-iconview--medium">
  <i class="gh-standard-arrow-right-01"></i>
</span>

<!-- Large -->
<span class="mds-iconview mds-iconview--large">
  <i class="gh-standard-home-11"></i>
</span>

<!-- Small -->
<span class="mds-iconview mds-iconview--small">
  <i class="gh-standard-tick-02"></i>
</span>
```

Include this CSS in every prototype (already included in the CSS Starter Block in design-system.md):

```css
.mds-iconview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
}
.mds-iconview--xsmall  { width: 12px; height: 12px; font-size: 12px; }
.mds-iconview--small   { width: 16px; height: 16px; font-size: 16px; }
.mds-iconview--medium  { width: 20px; height: 20px; font-size: 20px; }
.mds-iconview--large   { width: 24px; height: 24px; font-size: 24px; }
.mds-iconview--xlarge  { width: 28px; height: 28px; font-size: 28px; }
```

#### Icon font

Groww Invest uses the **Groww Huge Standard** font. All icon classes use the `gh-standard-` prefix.

| Action | Class |
|--------|-------|
| Arrow left | `gh-standard-arrow-left-01` |
| Arrow right | `gh-standard-arrow-right-01` |
| Arrow up | `gh-standard-arrow-up-01` |
| Arrow down | `gh-standard-arrow-down-01` |
| Cancel / Close | `gh-standard-cancel-01` |
| Add | `gh-standard-add-01` |
| Filter | `gh-standard-filter` |
| More (vertical) | `gh-standard-more-vertical` |
| More (horizontal) | `gh-standard-more-horizontal` |
| Notifications | `gh-standard-notification-01` |
| Home | `gh-standard-home-11` |
| User / Profile | `gh-standard-user` |
| Settings | `gh-standard-settings-01` |
| Edit | `gh-standard-pencil-edit-01` |
| Delete | `gh-standard-delete-01` |
| Download | `gh-standard-download-03` |
| Tick / Check | `gh-standard-tick-02` |
| Star | `gh-standard-star` |
| Bookmark | `gh-standard-bookmark-02` |
| Alert | `gh-standard-alert-circle` |
| Info | `gh-standard-information-circle` |
| Chart | `gh-standard-chart-line-data-02` |
| Reload | `gh-standard-reload` |
| Share | `gh-standard-share-08` |
| QR Code | `gh-standard-qr-code` |

#### Icon colour

Set colour on the `mds-iconview` wrapper — the icon inherits it automatically.

| Context | Token |
|---------|-------|
| Icon adjacent to text | Match the text's colour token exactly |
| Icon in isolation (no adjacent text) | `contentPrimary` |
| Semantic icon (error, success, warning) | `contentNegative`, `contentPositive`, `contentWarning` |

```html
<!-- Icon matches adjacent contentSecondary text -->
<span class="mds-iconview mds-iconview--medium" style="color: var(--contentSecondary);">
  <i class="gh-standard-arrow-right-01"></i>
</span>

<!-- Isolated navigation icon -->
<span class="mds-iconview mds-iconview--medium" style="color: var(--contentPrimary);">
  <i class="gh-standard-arrow-left-01"></i>
</span>
```
- P/L row — trailing arrow → `contentPositive` or `contentNegative` (matches the value)
- Error state icon → `contentNegative`
- Standalone navigation icon → `contentPrimary`

---

### 1.5 On-surface token variants

When a component sits inside a raised surface, use the matching `OnSurface` variant — not the base token. This keeps borders and subtle fills visually distinct from the elevated surface beneath them.

| Base token | Use on SurfaceZ1 | Use on SurfaceZ2 |
|-----------|-----------------|-----------------|
| `backgroundSecondary` | `backgroundSecondaryOnSurfaceZ1` | `backgroundSecondaryOnSurfaceZ2` |
| `backgroundTertiary` | `backgroundTertiaryOnSurfaceZ1` | `backgroundTertiaryOnSurfaceZ2` |
| `backgroundAccentSubtle` | `backgroundAccentSubtleOnSurfaceZ1` | `backgroundAccentSubtleOnSurfaceZ2` |
| `backgroundPositiveSubtle` | `backgroundPositiveSubtleOnSurfaceZ1` | `backgroundPositiveSubtleOnSurfaceZ2` |
| `backgroundNegativeSubtle` | `backgroundNegativeSubtleOnSurfaceZ1` | `backgroundNegativeSubtleOnSurfaceZ2` |
| `backgroundWarningSubtle` | `backgroundWarningSubtleOnSurfaceZ1` | `backgroundWarningSubtleOnSurfaceZ2` |
| `backgroundDisabled` | `backgroundDisabledOnSurfaceZ1` | `backgroundDisabledOnSurfaceZ2` |
| `borderPrimary` | `borderPrimaryOnSurfaceZ1` | `borderPrimaryOnSurfaceZ2` |
| `borderDisabled` | `borderDisabledOnSurfaceZ1` | `borderDisabledOnSurfaceZ2` |

**Rule:** If a component is rendered on `backgroundSurfaceZ1`, use `OnSurfaceZ1` variants for all nested backgrounds and borders. If on `backgroundSurfaceZ2`, use `OnSurfaceZ2` variants.

Example: A holdings card uses `backgroundSurfaceZ1`. The divider between rows inside it uses `borderPrimaryOnSurfaceZ1`, not `borderPrimary`.

---

## 2. Typography Rules

### 2.1 Typefaces

Two typefaces, each with a non-negotiable role:

| Typeface | Role | Weight |
|----------|------|--------|
| **GrowwSans** | All body text, labels, supporting information, button labels | 400 (Regular), 500 (Medium/Heavy) |
| **Sohne** | Screen headers, section titles, tab labels, bottom nav labels, prices, P/L amounts, any numerical anchor | 500 only — never any other weight |

The distinction is not heading vs body — it is **structure + numbers vs content**. A stock price uses Sohne because it anchors the screen. A stock name in a list row uses GrowwSans because it is content.

#### Body scale (GrowwSans)

| Token | Size | Line height | Weight |
|-------|------|-------------|--------|
| `body-small` | 12px | 18px | 400 |
| `body-small-heavy` | 12px | 18px | 500 |
| `body-base` | 14px | 20px | 400 |
| `body-base-heavy` | 14px | 20px | 500 |
| `body-large` | 16px | 24px | 400 |
| `body-large-heavy` | 16px | 24px | 500 |

> `body-xsmall` (10px) is **not used** in Groww Invest. Do not use it for any element.

#### Heading scale (Sohne, weight 500)

| Token | Size | Line height | Notes |
|-------|------|-------------|-------|
| `heading-eyebrow` | 10px | 12px | 0.2em letter-spacing, always all-caps |
| `heading-xxsmall` | 12px | 18px | — |
| `heading-xsmall` | 14px | 20px | — |
| `heading-small` | 16px | 24px | — |
| `heading-base` | 18px | 28px | Default section header, screen anchor |
| `heading-large` | 20px | 32px | — |

---

### 2.2 Semantic colour + weight pairing

Whenever a semantic colour token is used on text, always pair it with a heavy weight token.

| Colour token | Required pairing |
|-------------|-----------------|
| `contentAccent` | `body-*-heavy` or any heading token |
| `contentPositive` | `body-*-heavy` or any heading token |
| `contentNegative` | `body-*-heavy` or any heading token |
| `contentWarning` | `body-*-heavy` or any heading token |
| `contentOnAccentSubtle` | `body-*-heavy` or any heading token |
| `contentOnPositiveSubtle` | `body-*-heavy` or any heading token |
| `contentOnNegativeSubtle` | `body-*-heavy` or any heading token |
| `contentOnWarningSubtle` | `body-*-heavy` or any heading token |
| `contentOnAccentSecondarySubtle` | `body-*-heavy` or any heading token |

Heading tokens (Sohne 500) are inherently heavy weight — they automatically satisfy this rule. No additional weight adjustment is needed.

```
contentPositive  +  body-base-heavy    ✓
contentNegative  +  body-base-heavy    ✓
contentAccent    +  body-small-heavy   ✓
contentPositive  +  heading-base       ✓  (heading is inherently 500)

contentPositive  +  body-base          ✗  (regular weight — not enough)
contentNegative  +  body-small         ✗
```

---

### 2.3 Heading tokens and colour

**Default:** Heading tokens use `contentPrimary`. The heading communicates hierarchy through size and typeface — colour is carried by a subordinate body-heavy element beside or below it.

**Exception — directional values at heading scale:** When a heading-token value inherently has a positive or negative meaning (a gain, a loss, a return), use `contentPositive` or `contentNegative` directly on the heading token. These cases are rare.

| Use case | Token | Colour |
|----------|-------|--------|
| Product page — stock name | `heading-base` or `heading-large` | `contentPrimary` |
| Product page — current price | `heading-base` or `heading-large` | `contentPrimary` |
| Holdings card — current value / amount | `heading-base` | `contentPrimary` |
| Holdings card — gain / loss | `heading-base` | `contentPositive` or `contentNegative` |
| Positions tab — P/L amount (stocks / F&O) | `heading-base` | `contentPositive` or `contentNegative` |
| Mutual fund page — returns (1Y / 3Y / 5Y) | `heading-base` | `contentPositive` or `contentNegative` |
| Section / screen title | `heading-base` | `contentPrimary` — always, no exceptions |

**Groww Invest screens have one level of section header — `heading-base`.** Do not introduce smaller heading tokens as sub-headers. To group content within a section, use `heading-eyebrow` + `contentTertiary` as a category label, not a smaller heading.

**One heading token per card, maximum.** A card has a single primary anchor value — the number the card exists to communicate. Only that value uses a heading token. All other values in the same card, however significant, use body tokens.

```
Portfolio summary card:
  ₹2,77,385.20   → heading-base   ✓  (primary anchor — the whole card is about this number)
  ₹2,62,788.35   → body-base-heavy ✓  (invested amount — supporting value)
  ₹14,596.85      → body-base-heavy ✓  (total returns — supporting value)
  +₹2,004.50      → body-base-heavy ✓  (1D return — supporting value)
  +18.42%         → body-base-heavy ✓  (XIRR — supporting value)

  ₹2,62,788.35   → heading-base    ✗  (only one anchor per card)
  ₹14,596.85      → heading-base    ✗
```

The heading token signals "this is the value this card exists to show you." Using it on secondary values dilutes that signal and makes the hierarchy unreadable.

**Heading and display tokens are never used in list items.** Every value in a list row — primary label, trailing value, sub-text — uses body tokens only. This applies even to large or prominent values like returns and P/L amounts inside rows.

```
List item trailing value  → body-base-heavy   ✓
List item trailing value  → heading-base       ✗  (never, regardless of value size)
List item trailing value  → display-small      ✗  (never)
```

**Heading and display tokens are never used in subtitles or supporting labels.** If text sits below a primary heading or acts as a descriptor/caption, it uses a body token — never a heading or display token.

```
"Portfolio XIRR: +14.2%"  → body-base or body-small   ✓  (it's a subtitle/descriptor)
"Portfolio XIRR: +14.2%"  → heading-xsmall             ✗  (subtitle, not a heading)
```

---

### 2.4 Special characters — ₹ and %

The ₹ symbol and % character inherit the **same font and weight token as the number they belong to**. They are part of the value, not labels.

| Context | Token |
|---------|-------|
| List row value (market price, amount) | `body-base-heavy` |
| Supporting label (change %) | `body-small-heavy` |
| Holdings card price or gain/loss | `heading-base` or `heading-large` |
| Product page current price | `heading-base` or `heading-large` |
| Order card amount | `heading-base` |

Never split the symbol from its number into different tokens.

### 2.5 Number formatting

**Always show exactly 2 decimal places** for all financial values — amounts, percentages, and prices.

```
+₹28,400.00   ✓       ₹8,200    ✗
+14.20%       ✓       +14.2%    ✗
-18.30%       ✓       -18.3%    ✗
₹2,384.50     ✓       ₹2,384.5  ✗
```

This applies everywhere — list rows, cards, headers, tooltips — with no exceptions. An AI generating financial data must always format values to 2 decimal places.

**Use Indian number formatting.** Commas follow the Indian numbering system — first comma after 3 digits, then every 2 digits.

```
₹1,208.45      ✓       ₹1208.45        ✗  (missing comma)
₹28,400.00     ✓       ₹28400.00       ✗
₹1,00,000.00   ✓       ₹100,000.00     ✗  (wrong — Western format)
₹12,34,567.00  ✓       ₹12,345,670.00  ✗
```

**Discovery/grid card prices use body tokens, not heading tokens.** Heading tokens are only for the primary anchor value on a dedicated product detail page. In grid cards (Most Traded, Top Movers, fund discovery cards), stock prices use `body-base-heavy` + `contentPrimary`.

```
Most Traded card — ₹1,208.45  →  body-base-heavy   ✓
Most Traded card — ₹1,208.45  →  heading-base       ✗  (this is a grid card, not a product page)
```

---

## 3. Surface & Layout Rules

### 3.1 Elevation — no shadows

The app uses no shadows anywhere — no drop shadows, elevation shadows, or box shadows on any surface. Elevation is communicated entirely through background colour stepping (`backgroundPrimary` → `backgroundSurfaceZ1` → `backgroundSurfaceZ2`) and the `OnSurface` token variants.

### 3.2 Surface backgrounds

**List rows directly on the canvas (`backgroundPrimary`):**
Row backgrounds are `backgroundTransparent`. The canvas shows through. Dividers use `borderPrimary`.

**List rows inside a card (`backgroundSurfaceZ1`):**
Row backgrounds are `backgroundTransparent`. Dividers use `borderPrimaryOnSurfaceZ1`.

**Card containers:**
Background → `backgroundSurfaceZ1`. Outer border → `borderPrimary`.

### 3.3 Border rule — depends on the surface

| Surface the component sits on | Border token |
|-------------------------------|-------------|
| `backgroundPrimary` (canvas) | `borderPrimary` |
| `backgroundSurfaceZ1` (card, sheet) | `borderPrimaryOnSurfaceZ1` |
| `backgroundSurfaceZ2` (modal, nested card) | `borderPrimaryOnSurfaceZ2` |

### 3.4 Card corner radius

Corner radius scales with card height:

| Card height | Corner radius | Examples |
|-------------|--------------|---------|
| ≥ 60px | **16px** | Holdings cards, position cards, fund cards |
| < 60px | **8px** | Chips, compact inline cards |

When unsure, default to 16px for anything with significant vertical space.

### 3.5 Spacing scale

All spacing in the app uses values from this scale. Do not use values outside this set.

`2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 32 · 40` (px)

Standard screen horizontal padding: **16px**. This applies to all edges — left, right, and the right edge of header/app bar elements. Elements must never run flush to the screen edge.

**Let the UI breathe.** Never compress elements into a tight cluster to fit more content. If a row feels cramped, use more vertical padding or reduce content — do not reduce spacing below the minimum values from the scale.

**Structural UI elements must never be missing.** Every component has required parts — if a spec calls for an icon, a toggle, a logo, or a label, it must be present. Missing structural elements (e.g. an app bar with no icon, a card with a missing toggle, a list item with a missing leading icon) is always wrong. Do not omit elements because layout is tight.

---

## 4. Interaction & State Rules

### 4.1 Disabled state

Disabled elements use a token swap only. No opacity reduction.

```
Background  → backgroundDisabled
Label/icon  → contentDisabled
Border      → borderDisabled  (if the component has a border)
```

Never apply `alpha` / opacity on top of a disabled element. The token values already encode the correct visual weight.

### 4.2 Pressed / tapped state

When a tappable row or surface is pressed, apply the transparent pressed overlay token on top of the row background.

```
Row background (pressed) → backgroundTransparentPressed
```

Use the surface-matched variant depending on what the row sits on:

| Row sits on | Pressed token |
|-------------|--------------|
| `backgroundPrimary` (canvas) | `backgroundTransparentPressed` |
| `backgroundSurfaceZ1` (card) | `backgroundTransparentPressedOnSurfaceZ1` |
| `backgroundSurfaceZ2` (nested) | `backgroundTransparentPressedOnSurfaceZ2` |

### 4.3 Zero return

A return of exactly 0.00% is neutral — it carries no directional meaning.

```
0.00%  →  body-small-heavy  +  contentSecondary
```

Do not use `contentPositive` or `contentNegative` for a zero value.

### 4.4 Placeholder / unavailable values

When a value is not available, still loading, or not applicable, show a dash:

```
—  →  body-base  +  contentSecondary
```

Regular weight — it is not a real value and needs no emphasis.

### 4.5 Positive returns — always semantic

`contentPositive` is always used for a positive return, regardless of context. Even on a neutral discovery screen (e.g. a fund card showing "1Y return: +12%"), the colour reflects the nature of the data.

```
+12.4% on any screen  →  contentPositive  (not contentPrimary)
```

---

## 5. Component Application Notes

> **Never reinvent documented components.** If a component exists in the canonical spec (`design-system.md` section 10), always use the defined variant — never create a custom version. If none of the defined variants fits, use the closest match and flag the gap. Inventing new button styles, custom list layouts, or one-off navigation patterns breaks system consistency across brands.

This section does **not** redefine component anatomy, states, tokens, or HTML — those live in `design-system.md` 10.x and are the same for every brand. What lives here is **how Groww Invest applies each component** on real Invest screens: which variant to use where, which patterns are conventional in stocks/MF/IPO/F&O flows, and what to avoid.

If you're an LLM or designer building an Invest screen, the workflow is:
1. Open the canonical spec in `design-system.md` 10.x for the component's anatomy and rules.
2. Open this section for the Invest-specific application guidance.
3. Pick the variant that matches the use case.

---

### 5.1 List Row Item → see `design-system.md` 10.1

The most frequently used component in Invest. Conventions:

- **Stocks lists, ETF lists, fund lists** — use **Thumbnail list item** with the company/fund logo as the leading thumbnail, name as primary label, ISIN/AMC/category as sub-text, and price + day change % as trailing labels.
- **Holdings rows** — use **Thumbnail list item** with current value as the trailing primary label and absolute return + return % as trailing sub-text. Coloured sub-text only on the return % (live data — see colour rule).
- **Settings, navigation rows** — use **Icon list item** with chevron in the trailing zone.
- **Position rows on order/buy/sell cards** — use **Text list item** (no leading graphic — vertical density matters more than visual weight).
- **Default size and default spacing** unless the screen is genuinely dense (orderbook, tax statements). Compact spacing is rare in Invest.

---

### 5.2 Tab Component → see `design-system.md` 10.2

Used heavily across Invest for sibling-section navigation:

- **Portfolio screen:** Holdings / Positions / Orders tabs at the top, under the App Bar.
- **Stock detail:** Overview / News / Financials / Peers / About tabs at the top.
- **Order book:** Open / Executed / Cancelled tabs at the top.
- **Mid-screen tabs are valid** for chart cards (1D / 1W / 1M / 1Y / 5Y / Max) — even though most chart timeframes use Pills (see 5.6 Pills below). The tab choice signals "switching views of the same chart"; the Pill choice signals "filtering data". Use Tab when the underlying content layout changes; use Pill when only the data range changes.

Never use Tabs for filters (Active/Closed/Cancelled is borderline — that's nav, not filter). When in doubt, use a Pill group.

---

### 5.3 App Bar → see `design-system.md` 10.3

- **L0 App Bar** is shown on the four live tab roots: Stocks, F&O, Mutual Funds, Loans. The product name in the L0 left zone is **always identical** to the active bottom-nav tab. Use the **Groww Invest logo** (`logos/groww_invest.png`).
- **Standard App Bar** is shown on every other Invest screen — stock detail, order placement, order confirmation, holdings detail, watchlist, settings, KYC, etc.
- **Hide the Standard App Bar** in immersive flows like full-screen Buy/Sell sheets and order success screens — use a floating close icon instead.
- **Subtitle** is common on stock detail screens for ticker disambiguation: title `RELIANCE`, subtitle `Reliance Industries`.

---

### 5.4 Bottom Navigation → see `design-system.md` 10.4

The four live Invest tabs are **Stocks · F&O · Mutual Funds · Loans**. Use these as the default in every Invest prototype.

- **5th slot:** when an Invest exploration adds a 5th tab, the most common choice is **More** (which routes to the all-products grid). Bonds, US Stocks, Gold, and FD are valid alternatives when the prototype is highlighting that product specifically.
- **Bar is L0-only** — once the user enters any detail screen, the bar disappears.
- **IA exploration** — Invest prototypes occasionally explore alternate IAs (e.g. portfolio-led, watchlist-led). The structural rules (3–5 tabs, typography, tokens, icon system) stay locked — only labels and order may change.

---

### 5.5 Buttons → see `design-system.md` 10.5

- **Buy / Sell / Invest / Place order** — Primary, Large, full-width at the bottom of the screen.
- **Sell / Square off / Exit / Cancel order** — Primary Negative, Large, full-width.
- **Buy + Sell side-by-side on holdings rows and positions rows** — Primary (green) on the right, Primary Negative (red) on the left, both Small. This is the only accepted "two Primary buttons together" pattern in Invest.
- **Cancel / Skip / Back / Close** in flows — Secondary.
- **Know more / Compare / View prospectus** — Secondary Accent (only when Invest brand emphasis is intentional).
- **Inline links inside text or list rows** — Tertiary (or Tertiary Accent if it's a brand-led link like "View All").
- **Loading state** — used heavily on order placement; spinner replaces label, button stays its full width.

---

### 5.6 Pill → see `design-system.md` 10.6

- **Filter pills** on screen top bars (e.g. on Discover screen filtering MFs by category, on Watchlist filtering by sector) — **Base pill group**, multi-select. Selected pills auto-switch to trailing-icon × layout for dismissal.
- **Chart timeframe toggle** (1D / 1W / 1M / 1Y / 5Y / Max) on stock and fund detail charts — **Stylised pill group**, single-select, no scroll.
- **Single-select toggles** in dense forms (e.g. order type chooser) — **Minimal pill group**.
- **Never use a Pill for navigation** — use Tab.
- **Always use the neutral selected state** — never the accent (green) selected state, even though the Figma defines it.

---

### 5.7 Order Card Input Field → see `design-system.md` 10.7

- **Stocks order card** — `default` type for price, quantity, trigger price.
- **IPO order card** — `stepper` type for lot count.
- **F&O order card** — `stepper` type for lot count.
- **Never use stepper for stock quantity, price, or trigger price** — those are always `default`.
- **Width is strictly 120px.** Order card row layouts are designed around this — do not flex the input.
- **Helper text and error messages** appear in a message strip above the keypad and any fixed bottom dock — not inside the input.
- **Warning is real-time soft validation** — e.g. "price is more than 5% from LTP" while the user types.
- **Disabled with `"At market"` copy** is the standard treatment for the price field on a market order.

---

## 6. In-context Examples

Complete token specs — typography and colour — for common Groww Invest UI patterns.

**Position row (Buy card)**
- Card background → `backgroundSurfaceZ1`
- Stock name → `body-base-heavy` + `contentPrimary`
- "Avg price", "Mkt price" labels → `body-small` + `contentSecondary`
- Price values → `body-base-heavy` + `contentPrimary`
- Positive return % → `body-small-heavy` + `contentPositive`

**Holdings row (Groww Nifty 50 ETF)**
- Fund name → `body-base-heavy` + `contentPrimary`
- Chevron icon → `contentSecondary` (trailing icon colour)
- Sell button → `backgroundNegative` · label `contentOnColour` · `body-base-heavy`
- Buy button → `backgroundAccent` · label `contentOnColour` · `body-base-heavy`

**Stoploss form**
- "Stoploss (TSL)" label → `body-small` + `contentSecondary`
- Input value → `body-base` + `contentPrimary`
- "Est. loss -₹13,000" → `body-base-heavy` + `contentNegative`

**Primary button**
- Background → `backgroundAccent`
- Label → `body-base-heavy` + `contentOnColour` (medium size)

**Toast ("Buy order executed")**
- Background → `backgroundPositiveSubtle`
- Text → `body-base-heavy` + `contentOnPositiveSubtle`

---

## 7. Changelog

| Version | Date | Changes |
|---------|------|---------|
| `v0.33` | 14/05/2026 | Section 1.4 rewritten: replaced Hugeicons font system with GrowwHuge icon fonts; updated class prefix from `hgi-stroke hgi-{name}` to `gh-standard-{name}`; updated all icon examples. |
| `v0.32` | 05/05/2026 | Section 5 restructured: removed duplicated component specs (now canonical in design-system.md 10.x), replaced with thin Invest application notes per component (5.1–5.7) explaining where/when to use each variant on Invest screens. |
| `v0.31` | 04/05/2026 | Icon fix: class-based approach documented correctly; added never-reinvent-components rule; added button Do/Don't rule for inventing variants. |
| `v0.30` | 04/05/2026 | Added: Indian number formatting; body-base-heavy for grid card prices; contentInversePrimary; no colour mixing at same hierarchy; 16px edges; structural elements never missing. |
| `v0.29` | 04/05/2026 | Added 3 rules from user testing: heading/display tokens never in list items; heading/display tokens never in subtitles; always 2 decimal places. |
| `v0.28` | 04/05/2026 | Added L0 App Bar spec; split standard vs L0 app bar variants. |
| `v0.27` | 04/05/2026 | Replaced bare icon section with full IconView component spec — 5 sizes, HTML implementation, CSS, variants, colour rules. Rule: icons must always be inside mds-iconview. |
| `v0.26` | 04/05/2026 | Added Hugeicons icon rendering section; stroke-standard default, solid-standard for rare cases. |
| `v0.25` | 04/05/2026 | Financial data colour rule; backgroundPositiveSubtle/Negative reserved for message boxes only. |
| `v0.24` | 04/05/2026 | Added tab indicator spec; added one-heading-per-card rule. |
| `v0.23` | 04/05/2026 | Fixed duplicate section numbers; removed stub §5.2 Anchor Text; renumbered components to 5.2–5.6; fixed stray blank lines. |
| `v0.22` | 04/05/2026 | Added pressed state rule; clarified default spacing as standard. |
| `v0.21` | 04/05/2026 | Expanded List Row Item to full spec: 3 types, anatomy, corrected label token to body-base-heavy, height table, trailing content variants, divider indentation, size+spacing guidance. Fixed in-context examples. |
| `v0.20` | 04/05/2026 | Added App Bar spec — dimensions, tokens, scroll state, alignment, action zone variants. |
| `v0.19` | 04/05/2026 | Clarified list row 4px gap; documented Buy+Sell exception; enriched button icon guidance; added Button Groups section. |
| `v0.18` | 04/05/2026 | Full reorganisation — rules first (colour, typography, surface, states), then component specs, then examples, then changelog. Added typography scale tables. Merged "When to use Subtle vs High" into colour rules. Added spacing scale. Completed in-context examples with typography tokens. |
| `v0.17` | 04/05/2026 | Fixed bottom nav icon token to backgroundAccentSecondary; generalised heading+semantic colour exception; added holdings card colour distinction; removed incorrect backgroundSecondary pressed-state rule; added canvas/card surface background rules + border surface rule; added body-xsmall not used note; added heading weight auto-satisfies pairing rule; added no-subsections rule. |
| `v0.16` | 04/05/2026 | Corrected heading token colour rule — added exception for P/L on Positions tab (stocks/F&O). |
| `v0.15` | 04/05/2026 | Added ₹/% special character rule; fixed anchor token table; added Cards section; added Edge Cases section. |
| `v0.14` | 04/05/2026 | Added Buttons section: all variants, sizes, states, icon rules, usage guide, do/don't. |
| `v0.13` | 03/05/2026 | Fixed tab typography (heading-small); fixed tab active colour (contentPrimary); fixed bottom nav icon token; fixed heading always contentPrimary; added contentWarning to pairing table; added contentOn* exclusivity rule; added Icon Colour and On-Surface Token sections. |
| `v0.12` | 02/05/2026 | Added component rules: List Row Item, Anchor/Header, Tab, Bottom Navigation. |
| `v0.11` | 02/05/2026 | Added subtle vs high emphasis rule; typography pairing for semantic tokens. |
| `v0.10` | 02/05/2026 | Initial release. Three-step colour framework, background levels, content groups, contentOn pairing, in-context examples, typography pairing. |
