# Mint Design System — Groww Invest

> **Brand:** Groww Invest
> **Version:** v0.19
> **Downloaded:** 20 Sep, 2026

---
## How to Use This Document

Tokens follow a **three-tier hierarchy**:

```
Primitives  →  Semantic (Roles / Brand)  →  Use-case (Background / Content / Border)
hues/green/light/08     color/brand/primary       backgroundPrimary
```

- **Always reference use-case tokens** in components. Never hardcode a hex value or reference a primitive directly.
- **Semantic tokens** map primitives to intent. They change per brand and mode.
- **Primitives** are the raw palette. They never change per brand — only per mode (light/dark).

---

## CSS Starter Block

**Every generated HTML prototype MUST include these two blocks verbatim inside `<head>`.** The first is a stylesheet link for icons, the second is the main style block for fonts and tokens.

```html
<!-- 1. Icon stylesheet — MUST be included for icons to render -->
<!-- Groww Invest / Credit / MF Prime → standard style -->
<link rel="stylesheet" href="https://mint-design-system.vercel.app/icons/standard/groww-huge-standard.css">
<!-- W / 915 → rounded style (use this instead of the line above) -->
<!-- <link rel="stylesheet" href="https://mint-design-system.vercel.app/icons/rounded/groww-huge-rounded.css"> -->

<!-- 2. Fonts + tokens -->
<style>
  @font-face {
    font-family: 'Sohne';
    src: url('https://mint-design-system.vercel.app/typography/Sohne-Kraftig.otf') format('opentype');
    font-weight: 500;
    font-display: swap;
  }
  @font-face {
    font-family: 'GrowwSans';
    src: url('https://mint-design-system.vercel.app/typography/GrowwSans-Regular.otf') format('opentype');
    font-weight: 400;
    font-display: swap;
  }
  @font-face {
    font-family: 'GrowwSans';
    src: url('https://mint-design-system.vercel.app/typography/GrowwSans-Medium.otf') format('opentype');
    font-weight: 500;
    font-display: swap;
  }
  @font-face {
    font-family: 'GrowwHugeStandard';
    src: url('https://mint-design-system.vercel.app/icons/standard/groww-huge-standard.woff2') format('woff2'),
         url('https://mint-design-system.vercel.app/icons/standard/groww-huge-standard.otf') format('opentype');
    font-display: swap;
  }
  @font-face {
    font-family: 'GrowwHugeRounded';
    src: url('https://mint-design-system.vercel.app/icons/rounded/groww-huge-rounded.woff2') format('woff2'),
         url('https://mint-design-system.vercel.app/icons/rounded/groww-huge-rounded.otf') format('opentype');
    font-display: swap;
  }

  /* ── Base reset + font application ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'GrowwSans', -apple-system, sans-serif;
    font-weight: 400;
    color: var(--contentPrimary);
    background: var(--backgroundPrimary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── Font utility classes ── */
  /* Body — GrowwSans */
  .body-small        { font-family: 'GrowwSans', sans-serif; font-weight: 400; font-size: 12px; line-height: 18px; }
  .body-small-heavy  { font-family: 'GrowwSans', sans-serif; font-weight: 500; font-size: 12px; line-height: 18px; }
  .body-base         { font-family: 'GrowwSans', sans-serif; font-weight: 400; font-size: 14px; line-height: 20px; }
  .body-base-heavy   { font-family: 'GrowwSans', sans-serif; font-weight: 500; font-size: 14px; line-height: 20px; }
  .body-large        { font-family: 'GrowwSans', sans-serif; font-weight: 400; font-size: 16px; line-height: 24px; }
  .body-large-heavy  { font-family: 'GrowwSans', sans-serif; font-weight: 500; font-size: 16px; line-height: 24px; }
  /* Headings — Sohne (weight 500 ONLY) */
  .heading-eyebrow   { font-family: 'Sohne', sans-serif; font-weight: 500; font-size: 10px; line-height: 12px; letter-spacing: 0.2em; text-transform: uppercase; }
  .heading-xsmall    { font-family: 'Sohne', sans-serif; font-weight: 500; font-size: 14px; line-height: 20px; }
  .heading-small     { font-family: 'Sohne', sans-serif; font-weight: 500; font-size: 16px; line-height: 24px; }
  .heading-base      { font-family: 'Sohne', sans-serif; font-weight: 500; font-size: 18px; line-height: 28px; }
  .heading-large     { font-family: 'Sohne', sans-serif; font-weight: 500; font-size: 20px; line-height: 32px; }
  .display-small     { font-family: 'Sohne', sans-serif; font-weight: 500; font-size: 24px; line-height: 32px; }
  .display-base      { font-family: 'Sohne', sans-serif; font-weight: 500; font-size: 28px; line-height: 36px; }

  /* IconView wrapper */
  .mds-iconview { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: inherit; }
  .mds-iconview .hgi { line-height: 1; color: inherit; }
  .mds-iconview--xsmall  { width: 12px; height: 12px; font-size: 12px; }
  .mds-iconview--small   { width: 16px; height: 16px; font-size: 16px; }
  .mds-iconview--medium  { width: 20px; height: 20px; font-size: 20px; }
  .mds-iconview--large   { width: 24px; height: 24px; font-size: 24px; }
  .mds-iconview--xlarge  { width: 28px; height: 28px; font-size: 28px; }

  /* ── Colour tokens — light mode ── */
  :root {
    --backgroundPrimary:        #FFFFFF;
    --backgroundSurfaceZ1:      #FFFFFF;
    --backgroundSurfaceZ2:      #F7F7F7;
    --backgroundSecondary:      #F7F7F7;
    --backgroundTertiary:       #EFF0F1;
    --backgroundAccent:         #04B488;
    --backgroundNegative:       #ED5533;
    --backgroundPositive:       #04B488;
    --backgroundWarning:        #E7A71E;
    --backgroundAccentSubtle:   #E9FAF3;
    --backgroundNegativeSubtle: #FFF1ED;
    --backgroundPositiveSubtle: #E9FAF3;
    --backgroundWarningSubtle:  #FFF7DE;
    --backgroundDisabled:       #F7F7F7;
    --backgroundTransparent:    transparent;
    --borderPrimary:            #E7E8E9;
    --borderAccent:             #04B488;
    --borderNegative:           #ED5533;
    --borderDisabled:           #EFF0F1;
    --borderNeutral:            #353839;
    --contentPrimary:           #353839;
    --contentSecondary:         #7F8283;
    --contentTertiary:          #898C8E;
    --contentDisabled:          #BABBBC;
    --contentAccent:            #04B488;
    --contentPositive:          #04B488;
    --contentNegative:          #ED5533;
    --contentWarning:           #E7A71E;
    --contentOnColour:          #FFFFFF;
    --contentOnAccentSubtle:    #00825C;
    --contentOnPositiveSubtle:  #00825C;
    --contentOnNegativeSubtle:  #D23A15;
    --contentOnWarningSubtle:   #A16B00;
  }
</style>
```

**Font usage rule:** All text elements MUST use the CSS classes above or inline `font-family` with the exact values `'GrowwSans'` or `'Sohne'`. Never use `sans-serif`, `Arial`, `system-ui`, or any other font family. Never set Sohne to any weight other than 500.

**Icon usage rule:** Icons use the class-based approach with `::before` pseudo-elements. The CSS class encodes both the font style and the icon name — the linked stylesheet renders it. The icon name goes in the CLASS, not as text content.

The class prefix depends on the brand:
- **Invest / Credit / MF Prime** → `gh-standard-{name}`
- **W / 915** → `gh-rounded-{name}`

```html
<!-- CORRECT — class-based, requires the icon stylesheet link in <head> -->
<span class="mds-iconview mds-iconview--medium" style="color:var(--contentPrimary);">
  <i class="gh-standard-arrow-left-01"></i>
</span>

<!-- WRONG — text content approach, does not render icons -->
<i class="gh-standard">arrow-left-01</i>
```

**Common icon classes (standard brands — replace `gh-standard-` with `gh-rounded-` for W/915):**

| Icon | Class name |
|------|-----------|
| Back / Arrow left | `gh-standard-arrow-left-01` |
| Arrow right | `gh-standard-arrow-right-01` |
| Arrow up | `gh-standard-arrow-up-01` |
| Arrow down | `gh-standard-arrow-down-01` |
| Close / Cancel | `gh-standard-cancel-01` |
| Add / Plus | `gh-standard-add-01` |
| QR Code | `gh-standard-qr-code` |
| Filter | `gh-standard-filter` |
| More (vertical) | `gh-standard-more-vertical` |
| More (horizontal) | `gh-standard-more-horizontal` |
| Notifications | `gh-standard-notification-01` |
| Share | `gh-standard-share-08` |
| Refresh / Reload | `gh-standard-reload` |
| Home | `gh-standard-home-11` |
| User / Profile | `gh-standard-user` |
| Eye / View | `gh-standard-view` |
| Star / Favourite | `gh-standard-star` |
| Bookmark | `gh-standard-bookmark-02` |
| Alert / Warning | `gh-standard-alert-circle` |
| Info | `gh-standard-information-circle` |
| Settings | `gh-standard-settings-01` |
| Edit | `gh-standard-pencil-edit-01` |
| Delete | `gh-standard-delete-01` |
| Download | `gh-standard-download-03` |
| Tick / Check | `gh-standard-tick-02` |
| Trending | `gh-standard-arrow-up-right-stack` |
| Chart | `gh-standard-chart-line-data-02` |

---

## Stock Logos

Stock logos are hosted at a predictable URL. Use the filename from the table below — always match by stock name or ticker symbol.

```
https://mint-design-system.vercel.app/logos/stocks/{FILENAME}
```

**Available logos — use the exact filename shown:**

| Company name | Ticker | Filename |
|-------------|--------|---------|
| Asian Paints | ASIANPAINT | `ASIANPAINT.png` |
| Aurobindo Pharma | AUROPHARMA | `AUROPHARMA.png` |
| Axis Bank | AXISBANK | `AXISBANK.png` |
| Bajaj Auto | BAJAJAUTOLS | `BAJAJAUTOLS.png` |
| Bajaj Finance | BAJFINANCE | `BAJFINANCE.png` |
| Bharti Airtel | BHARTIARTL | `BHARTIARTL.png` |
| BHEL | BHEL | `BHEL.png` |
| Biocon | BIOCON | `BIOCON.png` |
| BPCL | BPCL | `BPCL.png` |
| Cipla | CIPLA | `CIPLA.png` |
| Coal India | COALINDIA | `COALINDIA.png` |
| Divi's Laboratories | DIVISLAB | `DIVISLAB.png` |
| DLF | DLF | `DLF.png` |
| Dr. Reddy's | DRREDDY | `DRREDDY.png` |
| Eicher Motors | EICHERMOT | `EICHERMOT.png` |
| Eternal (Zomato) | ETERNAL | `ETERNAL.png` |
| Grasim Industries | GRASIM | `GRASIM.png` |
| Groww | — | `GROWW.png` |
| HCL Technologies | HCLTECH | `HCLTECH.png` |
| HDFC Bank | HDFCBANK | `HDFCBANK.png` |
| Hindustan Unilever | HINDUNILVR | `HINDUNILVR.png` |
| ICICI Bank | ICICIBANK | `ICICIBANK.png` |
| Infosys | INFY | `INFY.png` |
| IRFC | IRFC | `IRFC.png` |
| ITC | ITC | `ITC.png` |
| Jindal Steel | JINDALSTEL | `JINDALSTEL.png` |
| JK Tyre | JKTYRE | `JKTYRE.png` |
| JSW Steel | JSWSTEEL | `JSWSTEEL.png` |
| Kalyan Jewellers | KALYANKJIL | `KALYANKJIL.png` |
| Kotak Mahindra Bank | KOTAKBANK | `KOTAKBANK.png` |
| LIC | LICI | `LICI.png` |
| Larsen & Toubro | LT | `LT.png` |
| Lupin | LUPIN | `LUPIN.png` |
| Mahindra & Mahindra | M&M | `M&M.png` |
| Maruti Suzuki | MARUTI | `MARUTI.png` |
| MobiKwik | MOBIKWIK | `MOBIKWIK.png` |
| Nestle India | NESTLEIND | `NESTLEIND.png` |
| NTPC | NTPC | `NTPC.png` |
| Nuvama | NUVAMA | `NUVAMA.png` |
| ONGC | ONGC | `ONGC.png` |
| Punjab National Bank | PNB | `PNB.png` |
| Power Grid | POWERGRID | `POWERGRID.png` |
| Reliance Industries | RELIANCE | `RELIANCE.png` |
| State Bank of India | SBIN | `SBIN.png` |
| Shriram Finance | SHRIRAM | `SHRIRAM.png` |
| Siemens | SIEMENS | `SIEMENS.png` |
| Star Health | STAR | `STAR.png` |
| Sun Pharma | SUNPHARMA | `SUNPHARMA.png` |
| Swiggy | SWIGGY | `SWIGGY.png` |
| Tata Steel | TATASTEEL | `TATASTEEL.png` |
| Tata Consultancy Services | TCS | `TCS.png` |
| Titan | TITAN | `TITAN.png` |
| Torrent Power | TORNTPOWER | `TORNTPOWER.png` |
| UltraTech Cement | ULTRACEMCO | `ULTRACEMCO.png` |
| Vedanta | VEDANTA | `VEDANTA.png` |
| Wipro | WIPRO | `WIPRO.png` |
| Yes Bank | YESBANK | `YESBANK.png` |
| Zydus Lifesciences | ZYDUSLIFE | `ZYDUSLIFE.png` |
| Amazon | — | `amazon.png` |

**Rule:** Always look up the company in this table first. Use the exact filename. For any stock not in this table, show the avatar fallback.

**Stock name vs ticker rule:** Always display the full company name as the primary label. Ticker symbols are rarely shown; when they are, they always appear alongside the full name — never alone.

```
✓  Reliance Industries          (name only — standard)
✓  Reliance Industries · RELIANCE   (name + ticker — rare, in specific data contexts)
✗  RELIANCE                     (ticker alone — never)
```

**Fallback — stock not in the table:** Show an avatar with the first 2 characters of the ticker in a 40×40px rounded square (border-radius: 8px), `backgroundTertiary` fill, `contentSecondary` text, `body-small-heavy`.

```html
<!-- Stock logo — always include onerror fallback -->
<img src="https://mint-design-system.vercel.app/logos/stocks/RELIANCE.png"
     style="width:40px; height:40px; border-radius:8px; object-fit:contain;"
     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
     alt="Reliance Industries" />
<div style="display:none; width:40px; height:40px; border-radius:8px;
            background:var(--backgroundTertiary); align-items:center; justify-content:center;
            font-family:'GrowwSans',sans-serif; font-size:12px; font-weight:500;
            color:var(--contentSecondary);">RI</div>
```

---

## 1. Primitives

Raw color values that form the base palette. Each hue has 12 steps per mode.
Step `01` is the lightest (closest to white in light mode, closest to black in dark mode) and `12` is the darkest.

### 1.1 Static

These values are mode-invariant — they never change regardless of light or dark mode.

| Token | Value |
|-------|-------|
| `hues/static/white` | `#FFFFFF` |
| `hues/static/black` | `#000000` |

---

### 1.2 Yellow

| Step | Token | Light | Dark |
|------|-------|-------|------|
| 01 | `hues/yellow/{mode}/01` | `#FEFDFB` | `#14120D` |
| 02 | `hues/yellow/{mode}/02` | `#FFF7DE` | `#291F0E` |
| 03 | `hues/yellow/{mode}/03` | `#FFF1C3` | `#2D210D` |
| 04 | `hues/yellow/{mode}/04` | `#FFE7AA` | `#3D2800` |
| 05 | `hues/yellow/{mode}/05` | `#FFDC8B` | `#4A3200` |
| 06 | `hues/yellow/{mode}/06` | `#FFCD65` | `#573F12` |
| 07 | `hues/yellow/{mode}/07` | `#F5BC57` | `#6C5121` |
| 08 | `hues/yellow/{mode}/08` | `#E4A417` | `#89682C` |
| 09 | `hues/yellow/{mode}/09` | `#E7A71E` | `#E7A71E` |
| 10 | `hues/yellow/{mode}/10` | `#DB9C00` | `#DB9C00` |
| 11 | `hues/yellow/{mode}/11` | `#A16B00` | `#F5BC56` |
| 12 | `hues/yellow/{mode}/12` | `#4A3819` | `#FAE5C3` |

---

### 1.3 Red

| Step | Token | Light | Dark |
|------|-------|-------|------|
| 01 | `hues/red/{mode}/01` | `#FFFCFB` | `#17100E` |
| 02 | `hues/red/{mode}/02` | `#FFF1ED` | `#2C1711` |
| 03 | `hues/red/{mode}/03` | `#FFEBE6` | `#391810` |
| 04 | `hues/red/{mode}/04` | `#FFDACF` | `#4F1509` |
| 05 | `hues/red/{mode}/05` | `#FFCBBC` | `#5F1D0E` |
| 06 | `hues/red/{mode}/06` | `#FFBBAB` | `#6F2A1A` |
| 07 | `hues/red/{mode}/07` | `#F7A895` | `#883A29` |
| 08 | `hues/red/{mode}/08` | `#EE8E78` | `#AF4B35` |
| 09 | `hues/red/{mode}/09` | `#ED5533` | `#FF5E3B` |
| 10 | `hues/red/{mode}/10` | `#DF4622` | `#F1512E` |
| 11 | `hues/red/{mode}/11` | `#D23A15` | `#FF9479` |
| 12 | `hues/red/{mode}/12` | `#5B291D` | `#FFD5CA` |

---

### 1.4 Green

Groww's primary brand hue.

| Step | Token | Light | Dark |
|------|-------|-------|------|
| 01 | `hues/green/{mode}/01` | `#FAFEFC` | `#0C1411` |
| 02 | `hues/green/{mode}/02` | `#E9FAF3` | `#0F251D` |
| 03 | `hues/green/{mode}/03` | `#E0F8EE` | `#0C2E22` |
| 04 | `hues/green/{mode}/04` | `#CDF3E3` | `#043C2B` |
| 05 | `hues/green/{mode}/05` | `#B7ECD6` | `#084936` |
| 06 | `hues/green/{mode}/06` | `#9CE2C6` | `#145742` |
| 07 | `hues/green/{mode}/07` | `#75D3B0` | `#1E6951` |
| 08 | `hues/green/{mode}/08` | `#24BF92` | `#227F62` |
| 09 | `hues/green/{mode}/09` | `#04B488` | `#04B488` |
| 10 | `hues/green/{mode}/10` | `#00A87D` | `#00A87D` |
| 11 | `hues/green/{mode}/11` | `#00825C` | `#46D5A7` |
| 12 | `hues/green/{mode}/12` | `#0D3D2E` | `#A7F2D4` |

---

### 1.5 Blue

| Step | Token | Light | Dark |
|------|-------|-------|------|
| 01 | `hues/blue/{mode}/01` | `#FDFDFE` | `#0E111E` |
| 02 | `hues/blue/{mode}/02` | `#F2F5FF` | `#161D3A` |
| 03 | `hues/blue/{mode}/03` | `#EDF2FF` | `#1A224C` |
| 04 | `hues/blue/{mode}/04` | `#E0E9FF` | `#202B67` |
| 05 | `hues/blue/{mode}/05` | `#D1DEFF` | `#29357A` |
| 06 | `hues/blue/{mode}/06` | `#BFCFFF` | `#32408B` |
| 07 | `hues/blue/{mode}/07` | `#A9BCFF` | `#3B4C9F` |
| 08 | `hues/blue/{mode}/08` | `#8BA1FB` | `#4659BA` |
| 09 | `hues/blue/{mode}/09` | `#5669FF` | `#617BFF` |
| 10 | `hues/blue/{mode}/10` | `#4D5FE4` | `#566EF1` |
| 11 | `hues/blue/{mode}/11` | `#4452D6` | `#97B1FF` |
| 12 | `hues/blue/{mode}/12` | `#212A63` | `#D6E1FF` |

---

### 1.6 Lilac

| Step | Token | Light | Dark |
|------|-------|-------|------|
| 01 | `hues/lilac/{mode}/01` | `#FCFCFF` | `#0F1116` |
| 02 | `hues/lilac/{mode}/02` | `#F0F4FF` | `#273651` |
| 03 | `hues/lilac/{mode}/03` | `#EEF0FD` | `#202636` |
| 04 | `hues/lilac/{mode}/04` | `#E4E8FC` | `#283148` |
| 05 | `hues/lilac/{mode}/05` | `#DADEF9` | `#323D57` |
| 06 | `hues/lilac/{mode}/06` | `#CED4F4` | `#3E4966` |
| 07 | `hues/lilac/{mode}/07` | `#BEC5EE` | `#4C5878` |
| 08 | `hues/lilac/{mode}/08` | `#A6AFE5` | `#5C6B91` |
| 09 | `hues/lilac/{mode}/09` | `#5E659A` | `#899DD0` |
| 10 | `hues/lilac/{mode}/10` | `#51578B` | `#7E91C4` |
| 11 | `hues/lilac/{mode}/11` | `#5B6297` | `#A7B7E0` |
| 12 | `hues/lilac/{mode}/12` | `#252944` | `#DAE1F3` |

---

### 1.7 Gold · _W brand_

Primary hue for the **W** brand.

| Step | Token | Light | Dark |
|------|-------|-------|------|
| 01 | `hues/gold/{mode}/01` | `#FEFDFB` | `#090705` |
| 02 | `hues/gold/{mode}/02` | `#FEF5E3` | `#241F16` |
| 03 | `hues/gold/{mode}/03` | `#FEF1D6` | `#262117` |
| 04 | `hues/gold/{mode}/04` | `#FBE8C1` | `#30291B` |
| 05 | `hues/gold/{mode}/05` | `#F6DEAB` | `#3C321E` |
| 06 | `hues/gold/{mode}/06` | `#EAD19D` | `#4A3D21` |
| 07 | `hues/gold/{mode}/07` | `#DBC28D` | `#5E4C25` |
| 08 | `hues/gold/{mode}/08` | `#CAAB68` | `#7A612A` |
| 09 | `hues/gold/{mode}/09` | `#C7A865` | `#C7A865` |
| 10 | `hues/gold/{mode}/10` | `#C09C4A` | `#BC9D5A` |
| 11 | `hues/gold/{mode}/11` | `#856926` | `#D8B875` |
| 12 | `hues/gold/{mode}/12` | `#252017` | `#F5E3BD` |

---

### 1.8 915 Green · _915 brand_

Primary hue for the **915** brand. Light mode shares values with `hues/green`; dark mode uses a distinct lime-green scale.

| Step | Token | Light | Dark |
|------|-------|-------|------|
| 01 | `hues/915 green/{mode}/01` | `#FAFEFC` | `#1C250F` |
| 02 | `hues/915 green/{mode}/02` | `#E9FAF3` | `#2D3A1D` |
| 03 | `hues/915 green/{mode}/03` | `#E0F8EE` | `#3F5229` |
| 04 | `hues/915 green/{mode}/04` | `#CDF3E3` | `#4E6333` |
| 05 | `hues/915 green/{mode}/05` | `#B7ECD6` | `#5D753D` |
| 06 | `hues/915 green/{mode}/06` | `#9CE2C6` | `#6D8849` |
| 07 | `hues/915 green/{mode}/07` | `#75D3B0` | `#7C9B54` |
| 08 | `hues/915 green/{mode}/08` | `#24BF92` | `#8CAF60` |
| 09 | `hues/915 green/{mode}/09` | `#04B488` | `#9EC36A` |
| 10 | `hues/915 green/{mode}/10` | `#00A87D` | `#ADD876` |
| 11 | `hues/915 green/{mode}/11` | `#00825C` | `#BFED84` |
| 12 | `hues/915 green/{mode}/12` | `#0D3D2E` | `#E0F9C3` |

---

## 2. Neutrals

Greyscale scale used for surfaces, text, borders, and UI structure. Steps 1–12 run lightest to darkest in light mode, and darkest to lightest in dark mode.

| Step | Token | Light | Dark |
|------|-------|-------|------|
| 1  | `neutrals/light/1`  | `#FFFFFF` | `#060809` |
| 2  | `neutrals/light/2`  | `#F7F7F7` | `#151819` |
| 3  | `neutrals/light/3`  | `#EFF0F1` | `#1E2224` |
| 4  | `neutrals/light/4`  | `#E7E8E9` | `#252A2C` |
| 5  | `neutrals/light/5`  | `#E0E1E2` | `#2D3133` |
| 6  | `neutrals/light/6`  | `#D8D9DA` | `#363B3D` |
| 7  | `neutrals/light/7`  | `#CDCECF` | `#44494B` |
| 8  | `neutrals/light/8`  | `#BABBBC` | `#5C6164` |
| 9  | `neutrals/light/9`  | `#898C8E` | `#696E70` |
| 10 | `neutrals/light/10` | `#7F8283` | `#989EA0` |
| 11 | `neutrals/light/11` | `#626465` | `#B5BBBD` |
| 12 | `neutrals/light/12` | `#353839` | `#F2F5F7` |

---

## 3. Colour Roles

Semantic alias tokens that map primitives to an intent. Never reference primitives directly in components — use these instead. Values shown as `role → primitive reference`.

### 3.1 Positive · _green_

| Token | Light reference | Dark reference |
|-------|----------------|----------------|
| `positiveEmphasize` | `hues/green/light/11` | `hues/green/dark/11` |
| `positiveBase` | `hues/green/light/09` | `hues/green/dark/09` |
| `positiveSubtle` | `hues/green/light/02` | `hues/green/dark/02` |
| `positiveSubtleOnSurfaceZ1` | `hues/green/light/02` | `hues/green/dark/02` |
| `positiveSubtleOnSurfaceZ2` | `hues/green/light/02` | `hues/green/dark/03` |

**Interaction States**

| Token | Light reference | Dark reference |
|-------|----------------|----------------|
| `positiveBaseHover` | `hues/green/light/10` | `hues/green/dark/10` |
| `positiveBasePressed` | `hues/green/light/10` | `hues/green/dark/10` |
| `positiveSubtleHover` | `hues/green/light/03` | `hues/green/dark/03` |
| `positiveSubtlePressed` | `hues/green/light/03` | `hues/green/dark/03` |
| `positiveSubtleHoverOnSurfaceZ1` | `hues/green/light/03` | `hues/green/dark/03` |
| `positiveSubtlePressedOnSurfaceZ1` | `hues/green/light/03` | `hues/green/dark/03` |
| `positiveSubtleHoverOnSurfaceZ2` | `hues/green/light/03` | `hues/green/dark/04` |
| `positiveSubtlePressedOnSurfaceZ2` | `hues/green/light/03` | `hues/green/dark/04` |

---

### 3.2 Negative · _red_

| Token | Light reference | Dark reference |
|-------|----------------|----------------|
| `negativeEmphasize` | `hues/red/light/11` | `hues/red/dark/11` |
| `negativeBase` | `hues/red/light/09` | `hues/red/dark/09` |
| `negativeSubtle` | `hues/red/light/02` | `hues/red/dark/02` |
| `negativeSubtleOnSurfaceZ1` | `hues/red/light/02` | `hues/red/dark/02` |
| `negativeSubtleOnSurfaceZ2` | `hues/red/light/02` | `hues/red/dark/03` |

**Interaction States**

| Token | Light reference | Dark reference |
|-------|----------------|----------------|
| `negativeBaseHover` | `hues/red/light/10` | `hues/red/dark/10` |
| `negativeBasePressed` | `hues/red/light/10` | `hues/red/dark/10` |
| `negativeSubtleHover` | `hues/red/light/03` | `hues/red/dark/03` |
| `negativeSubtlePressed` | `hues/red/light/03` | `hues/red/dark/03` |
| `negativeSubtleHoverOnSurfaceZ1` | `hues/red/light/03` | `hues/red/dark/03` |
| `negativeSubtlePressedOnSurfaceZ1` | `hues/red/light/03` | `hues/red/dark/03` |
| `negativeSubtleHoverOnSurfaceZ2` | `hues/red/light/03` | `hues/red/dark/04` |
| `negativeSubtlePressedOnSurfaceZ2` | `hues/red/light/03` | `hues/red/dark/04` |

---

### 3.3 Warning · _yellow_

| Token | Light reference | Dark reference |
|-------|----------------|----------------|
| `warningEmphasize` | `hues/yellow/light/11` | `hues/yellow/dark/11` |
| `warningBase` | `hues/yellow/light/09` | `hues/yellow/dark/09` |
| `warningSubtle` | `hues/yellow/light/02` | `hues/yellow/dark/02` |
| `warningSubtleOnSurfaceZ1` | `hues/yellow/light/02` | `hues/yellow/dark/02` |
| `warningSubtleOnSurfaceZ2` | `hues/yellow/light/02` | `hues/yellow/dark/03` |

**Interaction States**

| Token | Light reference | Dark reference |
|-------|----------------|----------------|
| `warningBaseHover` | `hues/yellow/light/10` | `hues/yellow/dark/10` |
| `warningBasePressed` | `hues/yellow/light/10` | `hues/yellow/dark/10` |
| `warningSubtleHover` | `hues/yellow/light/03` | `hues/yellow/dark/03` |
| `warningSubtlePressed` | `hues/yellow/light/03` | `hues/yellow/dark/03` |
| `warningSubtleHoverOnSurfaceZ1` | `hues/yellow/light/03` | `hues/yellow/dark/03` |
| `warningSubtlePressedOnSurfaceZ1` | `hues/yellow/light/03` | `hues/yellow/dark/03` |
| `warningSubtleHoverOnSurfaceZ2` | `hues/yellow/light/03` | `hues/yellow/dark/04` |
| `warningSubtlePressedOnSurfaceZ2` | `hues/yellow/light/03` | `hues/yellow/dark/04` |

---

## 4. Brand Semantics — Groww Invest

| Brand | Accent hue | Accent Secondary hue |
|-------|-----------|---------------------|
| `groww-invest` | `hues/green` | `hues/blue` |

### 4.1 Accent Tokens

| Token | Light reference | Dark reference |
|-------|----------------|----------------|
| `accentEmphasize` | `hues/green/light/11` | `hues/green/dark/11` |
| `accentBase` | `hues/green/light/09` | `hues/green/dark/09` |
| `accentSubtle` | `hues/green/light/02` | `hues/green/dark/02` |
| `accentSubtleOnSurfaceZ1` | `hues/green/light/02` | `hues/green/dark/02` |
| `accentSubtleOnSurfaceZ2` | `hues/green/light/02` | `hues/green/dark/03` |

**Interaction States**

| Token | Light reference | Dark reference |
|-------|----------------|----------------|
| `accentBaseHover` | `hues/green/light/10` | `hues/green/dark/10` |
| `accentBaseSelected` | `hues/green/light/10` | `hues/green/dark/10` |
| `accentSubtleHover` | `hues/green/light/03` | `hues/green/dark/03` |
| `accentSubtleSelected` | `hues/green/light/03` | `hues/green/dark/03` |
| `accentSubtleHoverOnSurfaceZ1` | `hues/green/light/03` | `hues/green/dark/03` |
| `accentSubtleSelectedOnSurfaceZ1` | `hues/green/light/03` | `hues/green/dark/03` |
| `accentSubtleHoverOnSurfaceZ2` | `hues/green/light/03` | `hues/green/dark/04` |
| `accentSubtleSelectedOnSurfaceZ2` | `hues/green/light/03` | `hues/green/dark/04` |

### 4.2 Accent Secondary Tokens

| Token | Light reference | Dark reference |
|-------|----------------|----------------|
| `accentSecondaryEmphasize` | `hues/blue/light/11` | `hues/blue/dark/11` |
| `accentSecondaryBase` | `hues/blue/light/09` | `hues/blue/dark/09` |
| `accentSecondarySubtle` | `hues/blue/light/02` | `hues/blue/dark/02` |
| `accentSecondarySubtleOnSurfaceZ1` | `hues/blue/light/02` | `hues/blue/dark/02` |
| `accentSecondarySubtleOnSurfaceZ2` | `hues/blue/light/02` | `hues/blue/dark/03` |

**Interaction States**

| Token | Light reference | Dark reference |
|-------|----------------|----------------|
| `accentSecondaryBaseHover` | `hues/blue/light/10` | `hues/blue/dark/10` |
| `accentSecondaryBaseSelected` | `hues/blue/light/10` | `hues/blue/dark/10` |
| `accentSecondarySubtleHover` | `hues/blue/light/03` | `hues/blue/dark/03` |
| `accentSecondarySubtleSelected` | `hues/blue/light/03` | `hues/blue/dark/03` |
| `accentSecondarySubtleHoverOnSurfaceZ1` | `hues/blue/light/03` | `hues/blue/dark/03` |
| `accentSecondarySubtleSelectedOnSurfaceZ1` | `hues/blue/light/03` | `hues/blue/dark/03` |
| `accentSecondarySubtleHoverOnSurfaceZ2` | `hues/blue/light/03` | `hues/blue/dark/04` |
| `accentSecondarySubtleSelectedOnSurfaceZ2` | `hues/blue/light/03` | `hues/blue/dark/04` |

---

## 5. Data Viz Primitives

Raw color values for charts, graphs, and data visualization. Each color family has three variants: `emphasis` (high contrast, for labels/lines), `base` (the core chart color), and `subtle` (low-opacity background tint).

Token format: `dataViz-{color}` · `dataViz-{color}-emphasis` · `dataViz-{color}-subtle`

| Color | Variant | Light | Dark |
|-------|---------|-------|------|
| lilac | emphasis | `#5D5C9C` | `#ADB0EF` |
| lilac | base | `#7A7AC6` | `#7A7AC6` |
| lilac | subtle | `#F5F5FD` | `#202137` |
| blue | emphasis | `#4452D6` | `#99B0FF` |
| blue | base | `#5669FF` | `#5669FF` |
| blue | subtle | `#F2F8FF` | `#161C41` |
| sky-blue | emphasis | `#1879AF` | `#75C0F4` |
| sky-blue | base | `#4DA4DD` | `#4DA4DD` |
| sky-blue | subtle | `#ECF7FF` | `#102230` |
| mint-green | emphasis | `#00825C` | `#46D5A7` |
| mint-green | base | `#04B488` | `#04B488` |
| mint-green | subtle | `#E9FAF3` | `#0E261D` |
| olive-green | emphasis | `#697832` | `#AEC269` |
| olive-green | base | `#A1B55C` | `#A1B55C` |
| olive-green | subtle | `#F3F8E7` | `#1E2117` |
| yellow | emphasis | `#947400` | `#FFD111` |
| yellow | base | `#FCCE00` | `#FCCE00` |
| yellow | subtle | `#FFF8D4` | `#241E0B` |
| orange | emphasis | `#B26300` | `#FFA52F` |
| orange | base | `#F59817` | `#F59817` |
| orange | subtle | `#FFF2DE` | `#291A0C` |
| red | emphasis | `#D93C17` | `#FF9479` |
| red | base | `#FF5E3B` | `#FF5E3B` |
| red | subtle | `#FFEEE9` | `#2D1711` |
| magenta | emphasis | `#C03370` | `#FF8AB7` |
| magenta | base | `#C73A75` | `#C73A75` |
| magenta | subtle | `#FEF1F4` | `#31111D` |
| brown | emphasis | `#885854` | `#E9A7A1` |
| brown | base | `#9D615C` | `#9D615C` |
| brown | subtle | `#FCF2F1` | `#271A18` |
| grey | emphasis | `#586679` | `#A6B7CA` |
| grey | base | `#808FA3` | `#808FA3` |
| grey | subtle | `#F2F5F9` | `#1C1F24` |

> Base values are identical across light and dark modes — emphasis and subtle adapt to the theme.

---

## 6. Background

Use-case tokens for all background surfaces. Values are alias references — switch mode and brand in the sandbox to preview resolved colors.

### 6.1 background

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `backgroundPrimary` | `new-neutrals/light/1` | `new-neutrals/dark/1` |
| `backgroundSecondary` | `new-neutrals/light/2` | `new-neutrals/dark/2` |
| `backgroundTertiary` | `new-neutrals/light/3` | `new-neutrals/dark/3` |
| `backgroundTransparent` | `rgba(255,255,255,0)` | `rgba(0,0,0,0)` |

### 6.2 background++

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `backgroundAccent` | `light/accent/accentBase` | `dark/accent/accentBase` |
| `backgroundAccentSubtle` | `light/accent/accentSubtle` | `dark/accent/accentSubtle` |
| `backgroundAccentSecondary` | `light/accentSecondary/accentSecondaryBase` | `dark/accentSecondary/accentSecondaryBase` |
| `backgroundAccentSecondarySubtle` | `light/accentSecondary/accentSecondarySubtle` | `dark/accentSecondary/accentSecondarySubtle` |
| `backgroundPositive` | `light/positive/positiveBase` | `dark/positive/positiveBase` |
| `backgroundPositiveSubtle` | `light/positive/positiveSubtle` | `dark/positive/positiveSubtle` |
| `backgroundNegative` | `light/negative/negativeBase` | `dark/negative/negativeBase` |
| `backgroundNegativeSubtle` | `light/negative/negativeSubtle` | `dark/negative/negativeSubtle` |
| `backgroundWarning` | `light/warning/warningBase` | `dark/warning/warningBase` |
| `backgroundWarningSubtle` | `light/warning/warningSubtle` | `dark/warning/warningSubtle` |
| `backgroundDisabled` | `new-neutrals/light/2` | `new-neutrals/dark/2` |
| `backgroundAlwaysDark` | `new-neutrals/light/12` | `new-neutrals/dark/1` |
| `backgroundAlwaysLight` | `new-neutrals/light/1` | `new-neutrals/dark/12` |

### 6.3 backgroundOverlay

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `backgroundOverlayPrimary` | `rgba(0,0,0,0.7)` | `rgba(0,0,0,0.7)` |
| `backgroundOverlaySecondary` | `rgba(0,0,0,0.3)` | `rgba(0,0,0,0.5)` |

### 6.4 backgroundSurface

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `backgroundSurfaceZ1` | `new-neutrals/light/1` | `new-neutrals/dark/2` |
| `backgroundSurfaceZ2` | `new-neutrals/light/1` | `new-neutrals/dark/3` |
| `backgroundSurfaceDocked` | `backgroundSurface/backgroundSurfaceZ1` | `backgroundSurface/backgroundSurfaceZ1` |

### 6.5 onSurface / Z1 / background

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `backgroundSecondaryOnSurfaceZ1` | `new-neutrals/light/2` | `new-neutrals/dark/3` |
| `backgroundTertiaryOnSurfaceZ1` | `new-neutrals/light/3` | `new-neutrals/dark/4` |
| `backgroundAccentSubtleOnSurfaceZ1` | `light/accent/accentSubtleOnSurfaceZ1` | `dark/accent/accentSubtleOnSurfaceZ1` |
| `backgroundAccentSecondarySubtleOnSurfaceZ1` | `light/accentSecondary/accentSecondarySubtleOnSurfaceZ1` | `dark/accentSecondary/accentSecondarySubtleOnSurfaceZ1` |
| `backgroundPositiveSubtleOnSurfaceZ1` | `light/positive/positiveSubtleOnSurfaceZ1` | `dark/positive/positiveSubtleOnSurfaceZ1` |
| `backgroundNegativeSubtleOnSurfaceZ1` | `light/negative/negativeSubtleOnSurfaceZ1` | `dark/negative/negativeSubtleOnSurfaceZ1` |
| `backgroundWarningSubtleOnSurfaceZ1` | `light/warning/warningSubtleOnSurfaceZ1` | `dark/warning/warningSubtleOnSurfaceZ1` |
| `backgroundDisabledOnSurfaceZ1` | `new-neutrals/light/2` | `new-neutrals/dark/3` |

### 6.6 onSurface / Z2 / background

Same pattern as Z1, incrementing each neutral step by 1 in dark mode.

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `backgroundSecondaryOnSurfaceZ2` | `new-neutrals/light/2` | `new-neutrals/dark/4` |
| `backgroundTertiaryOnSurfaceZ2` | `new-neutrals/light/3` | `new-neutrals/dark/5` |
| `backgroundAccentSubtleOnSurfaceZ2` | `light/accent/accentSubtleOnSurfaceZ2` | `dark/accent/accentSubtleOnSurfaceZ2` |
| `backgroundAccentSecondarySubtleOnSurfaceZ2` | `light/accentSecondary/accentSecondarySubtleOnSurfaceZ2` | `dark/accentSecondary/accentSecondarySubtleOnSurfaceZ2` |
| `backgroundPositiveSubtleOnSurfaceZ2` | `light/positive/positiveSubtleOnSurfaceZ2` | `dark/positive/positiveSubtleOnSurfaceZ2` |
| `backgroundNegativeSubtleOnSurfaceZ2` | `light/negative/negativeSubtleOnSurfaceZ2` | `dark/negative/negativeSubtleOnSurfaceZ2` |
| `backgroundWarningSubtleOnSurfaceZ2` | `light/warning/warningSubtleOnSurfaceZ2` | `dark/warning/warningSubtleOnSurfaceZ2` |
| `backgroundDisabledOnSurfaceZ2` | `new-neutrals/light/2` | `new-neutrals/dark/4` |

### 6.7 backgroundInverse

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `backgroundInversePrimary` | `new-neutrals/light/12` | `new-neutrals/dark/12` |

### 6.8 Interaction States — Neutral

**bgTransparent** — All 6 tokens reference `new-neutrals/light/2` in light. Dark increments by surface level: base=2, Z1=3, Z2=4.

**bgSecondary** — Light = `new-neutrals/light/3`. Dark: base=3, Z1=4, Z2=5.

**bgTertiary** — Light = `new-neutrals/light/4`. Dark: base=4, Z1=5, Z2=6.

### 6.9 Interaction States — Branded

Each branded role (accent, accentSecondary, negative, positive, warning) generates 14 tokens:
- `background{Role}Hover/Pressed` — base color hover/press state
- `background{Role}SubtleHover/Pressed[OnSurfaceZ1/Z2]` — subtle variant states
- `backgroundTransparent{Role}Hover/Pressed[OnSurfaceZ1/Z2]` — transparent variant states

Accent/accentSecondary use `Selected` as the second state name; negative/positive/warning use `Pressed`.

### 6.10 Data Viz Semantic Tokens

22 background tokens, 22 content tokens, 22 border tokens, 11 contentOn tokens — all derived from the data viz primitive palette.

| Prefix | Variants | Reference pattern |
|--------|----------|-------------------|
| `backgroundDataViz{Color}` | base, subtle | `{mode}/--dataViz-{color}`, `{mode}/--dataViz-{color}-subtle` |
| `contentDataViz{Color}` | base, subtle | same as background |
| `borderDataViz{Color}` | base, subtle | same as background |
| `contentOnDataViz{Color}Subtle` | emphasis | `{mode}/--dataViz-{color}-emphasis` |

---

## 7. Content

Use-case tokens for text, icons, and all content elements.

### 7.1 content

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `contentPrimary` | `new-neutrals/light/12` | `new-neutrals/dark/12` |
| `contentSecondary` | `new-neutrals/light/10` | `new-neutrals/dark/10` |
| `contentTertiary` | `new-neutrals/light/9` | `new-neutrals/dark/9` |

### 7.2 content++

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `contentAccent` | `light/accent/accentBase` | `dark/accent/accentBase` |
| `contentAccentSecondary` | `light/accentSecondary/accentSecondaryBase` | `dark/accentSecondary/accentSecondaryBase` |
| `contentPositive` | `light/positive/positiveBase` | `dark/positive/positiveBase` |
| `contentNegative` | `light/negative/negativeBase` | `dark/negative/negativeBase` |
| `contentWarning` | `light/warning/warningBase` | `dark/warning/warningBase` |
| `contentDisabled` | `new-neutrals/light/8` | `new-neutrals/dark/7` |
| `contentAlwaysDark` | `new-neutrals/light/12` | `new-neutrals/dark/1` |
| `contentAlwaysLight` | `new-neutrals/light/1` | `new-neutrals/dark/12` |

### 7.3 contentOn

Text used on top of coloured surfaces (subtle backgrounds).

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `contentOnColour` | `new-neutrals/light/1` | `new-neutrals/dark/12` |
| `contentOnAccentSubtle` | `light/accent/accentEmphasize` | `dark/accent/accentEmphasize` |
| `contentOnAccentSecondarySubtle` | `light/accentSecondary/accentSecondaryEmphasize` | `dark/accentSecondary/accentSecondaryEmphasize` |
| `contentOnPositiveSubtle` | `light/positive/positiveEmphasize` | `dark/positive/positiveEmphasize` |
| `contentOnNegativeSubtle` | `light/negative/negativeEmphasize` | `dark/negative/negativeEmphasize` |
| `contentOnWarningSubtle` | `light/warning/warningEmphasize` | `dark/warning/warningEmphasize` |
| `contentOnColourInverse` | `new-neutrals/light/12` | `new-neutrals/dark/1` |

### 7.4 contentInverse

Text used on inverse (flipped-mode) backgrounds.

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `contentInversePrimary` | `new-neutrals/light/1` | `new-neutrals/dark/1` |
| `contentInverseSecondary` | `new-neutrals/light/4` | `new-neutrals/dark/4` |

---

## 8. Border

Use-case tokens for borders, dividers, and outlines.

### 8.1 border

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `borderPrimary` | `new-neutrals/light/4` | `new-neutrals/dark/4` |

### 8.2 border++

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `borderNeutral` | `new-neutrals/light/12` | `new-neutrals/dark/12` |
| `borderAccent` | `light/accent/accentBase` | `dark/accent/accentBase` |
| `borderAccentSecondary` | `light/accentSecondary/accentSecondaryBase` | `dark/accentSecondary/accentSecondaryBase` |
| `borderPositive` | `light/positive/positiveBase` | `dark/positive/positiveBase` |
| `borderNegative` | `light/negative/negativeBase` | `dark/negative/negativeBase` |
| `borderWarning` | `light/warning/warningBase` | `dark/warning/warningBase` |
| `borderDisabled` | `new-neutrals/light/3` | `new-neutrals/dark/3` |

### 8.3 onSurface

| Token | Light ref | Dark ref |
|-------|-----------|----------|
| `borderPrimaryOnSurfaceZ1` | `new-neutrals/light/4` | `new-neutrals/dark/5` |
| `borderDisabledOnSurfaceZ1` | `new-neutrals/light/3` | `new-neutrals/dark/5` |
| `borderPrimaryOnSurfaceZ2` | `new-neutrals/light/4` | `new-neutrals/dark/6` |
| `borderDisabledOnSurfaceZ2` | `new-neutrals/light/3` | `new-neutrals/dark/6` |

---

## 9. Typography

Token definitions for the Mint type system. Usage rules, hierarchy guidelines, and platform implementation code live in [`typography-rules.md`](./typography-rules.md) — each product team can fork that file and define their own conventions.

### 9.1 Typefaces

| Typeface | File | Role | Weights |
|----------|------|------|---------|
| **Sohne** | `Sohne-Kraftig.otf` | Headings · Display · numeric values | 500 only |
| **Groww Sans** | `GrowwSans-Regular.otf` / `GrowwSans-Medium.otf` | Body text | 400 · 500 |

---

### 9.2 Body Tokens

Font: **Groww Sans** · Default color: `contentPrimary`

| Token | Size | Line Height | Weight |
|-------|------|-------------|--------|
| `body-xsmall` | 10px | 12px | 500 (Medium) |
| `body-small` | 12px | 18px | 400 (Regular) |
| `body-small-heavy` | 12px | 18px | 500 (Medium) |
| `body-base` | 14px | 20px | 400 (Regular) |
| `body-base-heavy` | 14px | 20px | 500 (Medium) |
| `body-large` | 16px | 24px | 400 (Regular) |
| `body-large-heavy` | 16px | 24px | 500 (Medium) |
| `body-xlarge` | 18px | 28px | 400 (Regular) |
| `body-xlarge-heavy` | 18px | 28px | 500 (Medium) |

---

### 9.3 Heading Tokens

Font: **Sohne 500** · Default color: `contentPrimary`

| Token | Size | Line Height | Letter Spacing |
|-------|------|-------------|----------------|
| `heading-eyebrow` | 10px | 12px | 0.2em · always all-caps |
| `heading-xxsmall` | 12px | 18px | 0 |
| `heading-xsmall` | 14px | 20px | 0 |
| `heading-small` | 16px | 24px | 0 |
| `heading-base` | 18px | 28px | 0 |
| `heading-large` | 20px | 32px | 0 |

---

### 9.4 Display Tokens

Font: **Sohne 500** · Default color: `contentPrimary` · Letter spacing: 0

| Token | Size | Line Height |
|-------|------|-------------|
| `display-small` | 24px | 32px |
| `display-base` | 28px | 36px |
| `display-large` | 32px | 40px |
| `display-xlarge` | 40px | 48px |

---

## 10. Components

> **Never reinvent documented components.** If a component exists in this spec, always use the defined variant — never create a custom version. If none fits, use the closest match.

---

### 10.1 List Row Item

The most frequently used component in the app. Three structural types based on what leads the row.

#### Types

| Type | Leading element | When to use |
|------|----------------|-------------|
| **Text list item** | None — text-only leading zone | Stock/ETF name rows, settings rows, plain content lists |
| **Icon list item** | 20×20px icon | Navigation rows, feature rows, rows that need a category icon |
| **Thumbnail list item** | Thumbnail — avatar, image, or contained icon | Fund rows, search results with images, profile-style rows |

All three types share the same token system, trailing content options, and sizing rules.

#### Anatomy

```
[ Leading graphic ] [ Label + Sub-text ] [ Trailing content ]
                    ←——— middle frame ———→
                         Divider (optional)
```

| Zone | Contents |
|------|---------|
| **Leading** | Icon (20×20px) or thumbnail — text list item has none |
| **Middle** | Primary label + optional sub-text, stacked |
| **Trailing** | Value labels, icon, button, icon-button, or none |
| **Divider** | Horizontal rule below the row; indented to align with label start |

#### Tokens

| Element | Typography | Colour |
|---------|-----------|--------|
| Primary label | `body-base-heavy` — GrowwSans 500, 14px/20px | `contentPrimary` always |
| Sub-text (neutral) | `body-small` — GrowwSans 400, 12px/18px | `contentSecondary` |
| Sub-text (coloured) | `body-small-heavy` — GrowwSans 500, 12px/18px | `contentPositive` / `contentNegative` / `contentAccent` |
| Trailing value (neutral) | `body-base-heavy` — GrowwSans 500, 14px/20px | `contentPrimary` |
| Trailing value (positive) | `body-base-heavy` — GrowwSans 500, 14px/20px | `contentPositive` |
| Trailing value (negative) | `body-base-heavy` — GrowwSans 500, 14px/20px | `contentNegative` |
| Trailing sub-label | `body-small` — GrowwSans 400, 12px/18px | `contentSecondary` |
| Trailing icon / chevron | — | `contentSecondary` |
| Background | — | `backgroundPrimary` |

Key rules:
- Primary label is **always** `body-base-heavy` + `contentPrimary`. Never regular weight, never a different colour.
- Trailing value is **always** medium weight (`body-base-heavy`) regardless of its colour.
- A coloured sub-text escalates from `body-small` to `body-small-heavy`. Regular weight is not allowed with a semantic colour.
- Gap between primary label and sub-text: **2px**.

#### Spacing and padding

| Property | Value |
|----------|-------|
| Container padding (all sides) | 16px |
| Gap between leading graphic and middle frame | 16px |
| Gap between primary label and sub-text | 2px |
| Leading icon size | 20×20px |

#### Heights by variant

**Text list item and Icon list item**

| Size | Spacing | Sub-text | Height |
|------|---------|----------|--------|
| Default | Default | Yes | 72px |
| Default | Default | No | 64px |
| Default | Compact | Yes | 56px |
| Default | Compact | No | 48px |
| Large | Default | Yes | 76px |
| Large | Default | No | 64px |
| Large | Compact | Yes | 60px |
| Large | Compact | No | 48px |

**Thumbnail list item**

| Size | Spacing | Sub-text | Height |
|------|---------|----------|--------|
| Default | Default | Yes | 72px |
| Default | Default | No | 64px |
| Default | Compact | Yes | 64px |
| Default | Compact | No | 56px |
| Large | Default | Yes | 80px |
| Large | Default | No | 72px |
| Large | Compact | Yes | 72px |
| Large | Compact | No | 64px |

#### Trailing content options

| Trailing variant | What it shows | When to use |
|-----------------|---------------|-------------|
| `icon` | Single trailing icon (e.g. chevron) | Navigation rows |
| `labels` | Two stacked value labels (primary + secondary) | Value rows — prices, returns |
| `labels + icon` | Value labels + trailing icon | Value rows that are also tappable |
| `text-button` | Tertiary compact button | Inline CTA (e.g. "Add") |
| `button` | Small secondary button | Moderate-emphasis inline action |
| `icon-button` | Icon-only button | Secondary action icon |
| `none` | Nothing | Display-only row |

#### Divider

Optional (`divider: boolean`). When shown, inset to align with the start of label text — not flush with the screen edge.

| Type | Divider left indent |
|------|-------------------|
| Text list item | 16px |
| Icon list item | 52px (16px padding + 20px icon + 16px gap) |
| Thumbnail list item | Varies by thumbnail size |

Use `borderPrimary` on `backgroundPrimary`, or `borderPrimaryOnSurfaceZ1` if the list is inside a card.

#### Size guidance

- **Default spacing** is the standard. Use on all list items unless there is a specific reason to compress.
- **Compact spacing** is for dense data tables or secondary lists only. Use sparingly.
- **Large size** when the row needs more visual weight (hero or prominent lists).

#### Tap behaviour and feedback

- **List rows are tappable by default.** A row is interactive unless explicitly marked as display-only. The presence of a chevron is a visual hint, not the rule that determines tappability.
- **Pressed state:** when a tappable row is pressed, the row background changes to `backgroundSecondary` as transient touch feedback. Display-only rows have no pressed state.

#### Truncation rule

When primary label text and trailing content compete for space, the **label truncates first; trailing content always renders in full**. This is intentional — trailing values (prices, returns, status) carry the load-bearing data; labels can lose a few characters with ellipsis without breaking the row.

#### Coloured sub-text — use sparingly

Coloured sub-text (`contentPositive`, `contentNegative`, `contentAccent`) is reserved for **live data points** — return %, change %, P&L direction. Use it only when the colour carries semantic meaning (price went up vs down). Do not colour sub-text for general emphasis, status labels, or decoration. When in doubt, use neutral `contentSecondary`.

---

### 10.2 Tab Component

Tabs are **strictly for navigation between sibling sections of the same content area** (e.g. "Holdings / Watchlist / Orders" on a portfolio screen, "Overview / News / Financials" on a stock detail screen). Tabs are **not** for filtering, toggling, or refining content — that's the [Pill component (10.6)](#106-pill).

If you're picking between Tab and Pill, ask: *does tapping change which section the user is in (Tab), or does it adjust the content within the current section (Pill)?* See the Pill vs Button vs Tab table in 10.6 for the full rule.

#### Tokens

| State | Typography | Colour |
|-------|-----------|--------|
| Active | `heading-small` — Sohne 500, 16px/24px | `contentPrimary` |
| Inactive | `heading-small` — Sohne 500, 16px/24px | `contentSecondary` |

Tab labels use Sohne even though they are body-sized — tabs are structural chrome, not content.

#### Tab count and overflow

A tab bar can contain **any number of tabs**. When tabs don't fit on screen, the **bar scrolls horizontally** — tabs themselves never shrink, never wrap to a second row, and labels never truncate.

#### Placement

Tab bars can sit in either of two places:

- **Top of the screen, immediately under the App Bar** — for screen-level navigation (e.g. Portfolio's Holdings/Watchlist/Orders tabs).
- **Mid-screen, inside a card or content section** — for navigation scoped to a single component (e.g. a chart card with 1D / 1W / 1M / 1Y views inside it).

Both placements use the same tokens, type, and indicator rules.

#### Divider

The tab bar always has a **1px `borderPrimary` line along its bottom edge**, separating the bar from the content below. The active indicator sits on top of this line, replacing the line for the indicator's width. This applies to top-placement and mid-screen tab bars equally.

#### Active indicator

| Property | Value |
|----------|-------|
| Colour | `borderNeutral` |
| Width | **Label text width + 32px** (16px on each side of the label) |
| Top corners | Fully rounded (pill) |
| Bottom corners | 0px — flush against the tab bar's bottom border |

The indicator sits at the bottom edge of the tab bar, growing upward from the bottom divider. The +16px / −16px padding ensures short labels (e.g. "F&O") still get a visible, well-proportioned indicator. It never stretches to fill the full tab tap zone, and it never collapses to just the label width.

---

### 10.3 App Bar

Present on every screen. Composed of a **status bar** (24px) and a **navigation bar** (56px) — **80px total**.

Two distinct variants: **L0** for root product screens, **Standard** for all other screens.

#### L0 App Bar

Used on root/home screens of each product tab. No back button.

The **product name** in the left zone is **always a strict 1:1 match with the active bottom-nav tab label**. Stocks tab → "Stocks". Loans tab → "Loans". Bonds in 5th slot → "Bonds". More → "More". This applies to live tabs, fallback tabs, and any IA-exploration tabs — there is no decoupling.

The four live tabs today are: **Stocks · F&O · Mutual Funds · Loans**. Default to these in prototypes unless the prototype is intentionally exploring an IA change (see 10.4).

| Zone | Contents |
|------|---------|
| **Left** | Brand logo (24×24px) + product name with 8px gap |
| **Right** | Search icon → QR code icon → Profile avatar (32×32px, circular) — always in this order |

| Element | Typography | Colour |
|---------|-----------|--------|
| Product name | `heading-base` — Sohne 500, 18px/28px | `contentPrimary` |
| Action icons | — | `contentPrimary` |

**Brand-specific logo.** The 24×24px logo is brand-specific — Groww Invest uses the Invest logo, 915 uses the 915 logo, W uses the W logo. Use the appropriate logo asset from `mint-design-system.vercel.app/logos/` for the brand the prototype represents.

#### Standard App Bar

Used on detail pages, flow screens, settings pages, and full-screen sheets.

**Visibility is per-flow.** The Standard App Bar is the default for L1+ screens, but specific flows (e.g. immersive Buy/Sell flows, full-screen sheets, focused checkout) may hide it entirely and use a floating close icon or alternative navigation. The choice is per-flow and per-screen — not every L1 screen has a Standard App Bar.

| Zone | Contents |
|------|---------|
| **Left** | Navigation icon button — back, close, or hamburger |
| **Centre** | Page title (+ optional subtitle) |
| **Right** | Action icon buttons (up to 3), or a text / secondary button |

| Element | Value |
|---------|-------|
| Status bar height | 24px |
| Navigation bar height | 56px |
| Total height | 80px |
| Icon touch target | 40×40px |
| Gap between action icons | 8px |
| Padding around nav / action zones | 8px |

| Element | Typography | Colour |
|---------|-----------|--------|
| Title (no subtitle) | `heading-base` — Sohne 500, 18px/28px | `contentPrimary` |
| Title (with subtitle) | `heading-small` — Sohne 500, 16px/24px | `contentPrimary` |
| Subtitle | `body-small` — GrowwSans 400, 12px/18px | `contentSecondary` |
| Navigation icon | — | `contentPrimary` |
| Action icons | — | `contentPrimary` |

Title is single-line and truncates with ellipsis — never wraps.

**Subtitle is per-screen** — there is no single rule. Use it for any small piece of secondary context: disambiguation (e.g. "RELIANCE" + "Reliance Industries"), status (e.g. "Order placed" + "3 minutes ago"), or any other supporting info that the screen needs.

#### Scroll state

| State | Background | Bottom border |
|-------|-----------|---------------|
| Not scrolled | `backgroundPrimary` | None |
| Scrolled | `backgroundSurfaceDocked` | `borderPrimary` |

#### Alignment

- **Left-aligned** (default) — title sits left, adjacent to the navigation icon. Most screens.
- **Centre-aligned** — for modal-style or focused flow screens (e.g. order confirmation).

#### Action zone variants

| Variant | When to use |
|---------|------------|
| None | Purely navigational screen, no contextual actions |
| 1–3 icons | Standard contextual actions (search, filter, share, more) |
| 4+ icons (overflow) | Show the first 2 actions in their slots; the 3rd slot becomes a more-vertical (`gh-standard-more-vertical`) icon that opens a sheet/menu containing the remaining actions |
| Text button | A single text-only CTA in the action zone |
| Secondary button | A single outlined button in the action zone |

---

### 10.4 Bottom Navigation

The persistent navigation bar at the bottom of every L0 product screen. **3 to 5 equal-flex slots**, top border, white surface.

#### Anatomy

```
┌──────────────────────────────────────────────────────┐
│  [icon]   [icon]   [icon]   [icon]   [icon]         │
│  Label    Label    Label    Label    Label           │
└──────────────────────────────────────────────────────┘
   tab 1     tab 2    tab 3    tab 4    tab 5
```

| Property | Value |
|----------|-------|
| Bar height | 64px (+ safe-area-inset-bottom on iOS) |
| Background | `backgroundSurfaceDocked` |
| Top border | 1px `borderPrimary` |
| Slots | 3–5 equal-flex columns |
| Icon size | 24×24px |
| Gap (icon → label) | 4px |
| Tab padding | vertical-centred within bar |

#### Tokens

| Element | Active | Inactive |
|---------|--------|----------|
| **Label** | Sohne 500, 10px, line-height 1.2, mixed case · `contentAccentSecondary` | Sohne 500, 10px, line-height 1.2, mixed case · `contentTertiary` |
| **Icon** | Filled (solid) variant · `contentAccentSecondary` | Outline (stroke) variant · `contentTertiary` |

> **Typography exception.** The label uses **Sohne 500 at 10px**, mixed case (e.g. "Mutual funds", not "MUTUAL FUNDS"). This is **not** the `heading-eyebrow` token (which is 10px Sohne *all-caps*). The bottom nav is the only place this 10px mixed-case Sohne style is used — it's an intentional exception to the type scale, kept for visual density and legibility at small sizes. Do not replicate this style elsewhere.

#### Live tabs (default)

The four tabs that ship in the app today, in order. **Always include all four in this order** as the base of the nav.

| Position | Label | Icon |
|----------|-------|------|
| 1 | **Stocks** | `gh-standard-chart-line-data-02` |
| 2 | **F&O** | `gh-standard-percent-circle` |
| 3 | **Mutual funds** | `gh-standard-pie-chart-01` |
| 4 | **Loans** | `gh-standard-money-02` |

Drop tabs from the right when fewer are needed — minimum is 3 (Stocks · F&O · Mutual funds), maximum is 5.

#### 5th slot — pick any one

The 5th slot is optional. If used, pick **one** from the list below. **More is not required** — any of these can sit in the 5th slot directly. Use whichever fits the prototype's IA.

| Label | Icon |
|-------|------|
| **Bonds** | `gh-standard-document-code` |
| **US Stocks** | `gh-standard-internet` |
| **Gold** | `gh-standard-gold-buy` |
| **FD** | `gh-standard-safe-box` |
| **More** | `gh-standard-grid-02` |

When the user is on a product that occupies the 5th slot, that tab shows the active state. Don't pin More if a specific product can take the slot — More is a fallback for "many things behind one tab," not the default 5th tab.

#### IA exploration — fallback for non-default navigation

The four live tabs + 5th-slot rule is the **default**, not the only option. When a prototype is **deliberately exploring a different IA** — e.g. a Home-led app, a portfolio-first structure, a product-agnostic shell — the spec relaxes:

| Constraint | Default | IA exploration |
|-----------|---------|----------------|
| Tab labels | Live 4 + curated 5th-slot list | **Any label is allowed** — Home, Explore, Holdings, Watchlist, Profile, Activity, anything |
| Tab order | Stocks → F&O → Mutual funds → Loans, fixed | **Any order**, designer's call |
| Number of tabs | 3–5 | 3–5 (this constraint stays) |
| Typography | Sohne 500, 10px, mixed case | Same — do not change |
| Icon system | `gh-standard-{name}` (Invest/Credit/Prime) · `gh-rounded-{name}` (W/915) | Same — pick any icon from the brand's icon font |
| Active/inactive tokens | `contentAccentSecondary` / `contentTertiary` | Same |
| Container, height, structure | 64px bar, equal-flex columns, top border | Same |

In short: **structure, typography, tokens, and icon system are locked. Labels and order are free.**

This means an IA-exploration prototype still *looks* like a Groww bottom nav — same height, same type, same colour behaviour — but the destinations can be anything. Examples that are valid IA explorations:

```
[Home]    [Explore]   [Portfolio]  [Activity]   [Profile]
[Stocks]  [Watchlist] [Orders]     [Holdings]   [More]
[Markets] [F&O]       [Funds]      [More]                  ← 4-tab variant
```

No visual exploration marker is required — the prototype itself signals intent through context (Figma file name, share link, accompanying notes).

#### HTML implementation

```html
<style>
.mds-bottom-nav {
  display: flex;
  align-items: stretch;
  background: var(--backgroundSurfaceDocked);
  border-top: 1px solid var(--borderPrimary);
  height: 64px;
  padding-bottom: env(safe-area-inset-bottom, 0);
  position: sticky;
  bottom: 0;
  width: 100%;
}
.mds-bottom-nav__tab {
  flex: 1 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--contentTertiary);
  -webkit-tap-highlight-color: transparent;
}
.mds-bottom-nav__tab--active {
  color: var(--contentAccentSecondary);
}
.mds-bottom-nav__icon {
  font-size: 24px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}
.mds-bottom-nav__label {
  font-family: 'Sohne', sans-serif;
  font-weight: 500;
  font-size: 10px;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
}
</style>

<!-- 5-tab example: live 4 + Bonds in slot 5; Stocks active -->
<nav class="mds-bottom-nav">
  <button class="mds-bottom-nav__tab mds-bottom-nav__tab--active" type="button">
    <span class="mds-bottom-nav__icon"><i class="gh-standard-chart-line-data-02"></i></span>
    <span class="mds-bottom-nav__label">Stocks</span>
  </button>
  <button class="mds-bottom-nav__tab" type="button">
    <span class="mds-bottom-nav__icon"><i class="gh-standard-percent-circle"></i></span>
    <span class="mds-bottom-nav__label">F&amp;O</span>
  </button>
  <button class="mds-bottom-nav__tab" type="button">
    <span class="mds-bottom-nav__icon"><i class="gh-standard-pie-chart-01"></i></span>
    <span class="mds-bottom-nav__label">Mutual funds</span>
  </button>
  <button class="mds-bottom-nav__tab" type="button">
    <span class="mds-bottom-nav__icon"><i class="gh-standard-money-02"></i></span>
    <span class="mds-bottom-nav__label">Loans</span>
  </button>
  <button class="mds-bottom-nav__tab" type="button">
    <span class="mds-bottom-nav__icon"><i class="gh-standard-document-code"></i></span>
    <span class="mds-bottom-nav__label">Bonds</span>
  </button>
</nav>
```

To swap tabs, change the icon class and label text. Mark the active tab with `mds-bottom-nav__tab--active`.

#### Behaviour rules

- **Tap target = full slot.** The entire `(bar width ÷ N tabs) × 64px` rectangle is tappable, not just the icon+label area. Do not shrink the tap area.
- **Labels never truncate.** If a label doesn't fit on one line at Sohne 500 / 10px, the label is wrong — pick a shorter word. Never add ellipsis, never wrap, never shrink the type.
- **Bar visibility:** present on **L0 (root product) screens only**. Hidden on L1+ screens (detail pages, flows, sheets, settings). Once the user enters any non-root screen, the bar is gone.
- **L0 app bar title = active tab label, exactly.** When the user is on the Stocks tab, the L0 app bar reads "Stocks". Switch tabs → app bar title switches in lockstep. This is a **strict 1:1 mapping** that applies to all 4 live tabs, all 5 fallback options (Bonds, US Stocks, Gold, FD, More), and any IA-exploration tabs. There is no decoupling.

#### Do / Don't

```
✓  Default IA: 4 live tabs in order (Stocks → F&O → Mutual funds → Loans)
✓  Default 5th slot: any one of {Bonds, US Stocks, Gold, FD, More}
✓  IA exploration: any labels and order are allowed (3–5 tabs still)
✓  Active = filled icon + accentSecondary; inactive = outline icon + contentTertiary
✓  Mixed case for labels — "Mutual funds", not "MUTUAL FUNDS"

✗  Never use heading-eyebrow (all-caps) for bottom nav labels
✗  Never use accentSecondary on a label outside the bottom nav
✗  Never put fewer than 3 or more than 5 tabs in the bar
✗  Never default to More — only use it when no single product fits the 5th slot
✗  Never change the bar height, typography scale, icon system, or token mapping
   — even in IA exploration, structure stays locked
✗  Never invent custom labels in a default-IA prototype — that requires the
   exploration rule to apply
```

---

### 10.5 Buttons

Three base variants — Primary, Secondary, Tertiary — with sizes, states, and sub-variants. All button labels use **GrowwSans** (body tokens). Never Sohne.

#### Variants

| Variant | Background | Label | Border | When to use |
|---------|-----------|-------|--------|-------------|
| **Primary** | `backgroundAccent` | `contentOnColour` | none | Main CTA — Buy, Invest, Confirm |
| **Primary Negative** | `backgroundNegative` | `contentOnColour` | none | Destructive — Sell, Remove, Exit |
| **Secondary** | transparent | `contentPrimary` | `borderPrimary` | Secondary — Cancel, Skip, Back |
| **Secondary Accent** | `backgroundAccentSubtle` | `contentOnAccentSubtle` | `borderAccent` | Accent secondary — Know More, Compare |
| **Tertiary** | none | `contentPrimary` | none | Low priority — inline text actions |
| **Tertiary Accent** | none | `contentAccent` | none | Accent inline links — View All |

#### Sizes

| Size | Height | Label token | When to use |
|------|--------|-------------|-------------|
| **Large** | 48px | `body-large-heavy` | Full-width bottom CTA — Buy, Sell |
| **Medium** | 40px | `body-base-heavy` | Default — most buttons |
| **Small** | 32px | `body-small-heavy` | Tight layouts — inline row actions |

Corner radius: **8px** on all sizes and variants.

#### States

| State | Behaviour |
|-------|-----------|
| **Enabled** | Variant tokens above |
| **Hover** | `backgroundAccentBaseHover` (primary) · `backgroundNegativeHover` (negative) |
| **Pressed** | `backgroundAccentBaseSelected` (primary) · `backgroundNegativePressed` (negative) |
| **Disabled** | `backgroundDisabled` · `contentDisabled` · `borderDisabled` (secondary only) |
| **Loading** | Label hidden; spinner centred in its place. Button width stays fixed (does not collapse to icon-only). Spinner colour matches the original label colour. |

For Secondary and Tertiary interaction states, the fill comes from transparent interaction tokens; border and label colours remain unchanged on interaction.

**Disabled applies to all variants identically** — including Tertiary and Tertiary Accent, which take the same `backgroundDisabled` fill in disabled state (they are NOT transparent when disabled). Never use opacity to fake a disabled state — always swap to the disabled tokens.

#### Width

Buttons **default to flex** in their container — they grow to fit the available width within row/grid layout primitives.

| Size | Default behaviour |
|------|-------------------|
| **Large** | **Always full-width** — used for the bottom-of-screen primary CTA |
| **Medium** | Flex by default; can hug content when used inline |
| **Small** | **Hug content** — used for inline row actions where the button sizes to its label |

Designers should not override these defaults without a clear reason. Large buttons that aren't full-width, or Small buttons that stretch, indicate a layout problem.

#### Icon-only buttons

> Icon-only button variant is **not yet specified** — to be added in a future release. Until then, do not invent an icon-only button. Use the existing label+icon variants or the IconView component for standalone icon affordances.

#### Tertiary compact mode

`isCompact=true` removes container padding:

| Base size | Compact height |
|-----------|---------------|
| Small (32px) | 24px |
| Medium (40px) | 24px |
| Large (48px) | 32px |

Use compact tertiary for actions embedded inline within text or dense table cells.

#### Icons on buttons

- **Leading icon** (left of label): when the icon clarifies the label's meaning (filter, add, upload)
- **Trailing icon** (right of label): indicates the result of the action (chevron for in-app navigation, external-link icon for redirection outside the app)
- **Never combine leading and trailing icons** on the same button
- **Never use an icon as decoration** — placement must support the button's purpose
- Icon colour always matches the label colour token

#### Button groups

**Horizontal layout:**
- Primary on the **right**, Secondary on the left
- Never truncate labels to fit — switch to vertical layout if labels are long

**Vertical layout:**
- Primary at the **top**, order: Primary → Secondary → Tertiary

```
Horizontal:   [ Secondary ]  [ Primary ]
Vertical:     [ Primary           ]
              [ Secondary         ]
              [ Tertiary          ]
```

#### Decision guide

```
Main action on the screen?               → Primary
Destructive action (sell, remove)?       → Primary Negative
Supporting action alongside primary?     → Secondary
Brand-positive secondary action?         → Secondary Accent
Low-priority or inline link?             → Tertiary
Accent-coloured inline link?             → Tertiary Accent
Full-width bottom CTA (buy/sell flow)?   → Large
Most buttons?                            → Medium (default)
Tight space or row-level action?         → Small
Inline within dense text or table?       → Tertiary Compact
```

#### Do / Don't

```
✓  One Primary per screen section maximum
✓  Pair Primary + Secondary for confirm/cancel
✓  Match icon colour to label colour — always
✓  GrowwSans for all button labels
✓  Primary (green) + Primary Negative (red) side by side is accepted — standard Buy/Sell pair

✗  Never two Primary (same colour) buttons side by side
✗  Never Sohne on a button label
✗  Never add opacity to disabled — use disabled tokens only
✗  Never Primary Negative for a warning — use backgroundWarning instead
✗  Never Tertiary where the user needs to notice the action
✗  Never invent a new button variant — the 6 defined variants cover all valid use cases
```

---

### 10.6 Pill

A small interactive chip used for filters, tags, and selection. 32px tall, fully rounded (border-radius 99px).

> **Selected state — always neutral.** The accent selected variant (green fill + green border) exists in Figma but is almost never used in the app. Always use the neutral selected state (`backgroundTertiary` + `borderNeutral`).

#### Layouts

| Layout | Leading | Trailing | Padding |
|--------|---------|---------|---------|
| **Default** | — | — | 8px 16px |
| **Leading icon** | 16×16px icon | — | 8px 16px 8px 12px |
| **Trailing icon** | — | 16×16px icon | 8px 12px 8px 16px |
| **Leading + trailing** | 16×16px icon | 16×16px icon | 8px 12px |
| **Icon only** | — | — | 8px (32×32px square) |

Gap between icon and label: **6px**. Gap between label and count badge: **4px**.

#### States

| State | Background | Border | Label colour |
|-------|-----------|--------|--------------|
| **Enabled** | transparent | `borderPrimary` (1px) | `contentPrimary` |
| **Selected** | `backgroundTertiary` | `borderNeutral` (1.5px) | `contentPrimary` |
| **Disabled** | `backgroundDisabled` | none | `contentDisabled` |

There is **no separate pressed state** — touch feedback during a tap can be implemented as a subtle interaction effect, but it is not a documented design state.

#### Width

Pills **hug their content** — no min-width, no max-width. Padding (per layout) plus the label width determines the pill's size. Single-character pills are allowed; do not pad them out artificially.

#### Tokens

| Element | Token |
|---------|-------|
| Label | `body-small-heavy` — GrowwSans 500, 12px/18px |
| Icon colour (enabled / selected) | `contentPrimary` |
| Icon colour (disabled) | `contentDisabled` |
| Count badge background | `backgroundInversePrimary` |
| Count badge text | `body-small-heavy` + `contentInversePrimary` |

#### Count badge

Anchored to the right of the label; circular pill, min 16px wide. **Hide the badge entirely when the count is 0.** Show only when count ≥ 1. Don't render "0" as a badge.

#### HTML implementation

```html
<!-- Pill styles — add once to page -->
<style>
.mds-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 99px;
  border: 1px solid var(--borderPrimary);
  background: transparent;
  padding: 8px 16px;
  gap: 6px;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  font-family: 'GrowwSans', sans-serif;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}
.mds-pill--selected {
  background: var(--backgroundTertiary);
  border-color: var(--borderNeutral);
  border-width: 1.5px;
}
.mds-pill--disabled {
  background: var(--backgroundDisabled);
  border: none;
  cursor: not-allowed;
  pointer-events: none;
}
.mds-pill--leading  { padding: 8px 16px 8px 12px; }
.mds-pill--trailing { padding: 8px 12px 8px 16px; }
.mds-pill--both     { padding: 8px 12px; }
.mds-pill--icon-only { padding: 8px; width: 32px; }

.mds-pill__label {
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: var(--contentPrimary);
}
.mds-pill--disabled .mds-pill__label { color: var(--contentDisabled); }

.mds-pill__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  border-radius: 10px;
  background: var(--backgroundInversePrimary);
  padding: 0 4px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: var(--contentInversePrimary);
}

.mds-pill__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: var(--contentPrimary);
  font-size: 16px;
}
.mds-pill--disabled .mds-pill__icon { color: var(--contentDisabled); }
</style>

<!-- Default — enabled -->
<button class="mds-pill" type="button">
  <span class="mds-pill__label">Label</span>
</button>

<!-- Default — selected (neutral) -->
<button class="mds-pill mds-pill--selected" type="button">
  <span class="mds-pill__label">Label</span>
</button>

<!-- Leading icon -->
<button class="mds-pill mds-pill--leading" type="button">
  <span class="mds-pill__icon"><i class="gh-standard-add-01"></i></span>
  <span class="mds-pill__label">Label</span>
</button>

<!-- Trailing icon (filter/dropdown) -->
<button class="mds-pill mds-pill--trailing" type="button">
  <span class="mds-pill__label">Label</span>
  <span class="mds-pill__icon"><i class="gh-standard-arrow-down-01"></i></span>
</button>

<!-- Leading + trailing (selected filter with close) -->
<button class="mds-pill mds-pill--both mds-pill--selected" type="button">
  <span class="mds-pill__icon"><i class="gh-standard-add-01"></i></span>
  <span class="mds-pill__label">Label</span>
  <span class="mds-pill__icon"><i class="gh-standard-cancel-01"></i></span>
</button>

<!-- Icon only -->
<button class="mds-pill mds-pill--icon-only" type="button">
  <span class="mds-pill__icon"><i class="gh-standard-add-01"></i></span>
</button>

<!-- With count badge (hide when count is 0) -->
<button class="mds-pill" type="button">
  <span class="mds-pill__label">Label</span>
  <span class="mds-pill__badge">3</span>
</button>

<!-- Disabled -->
<button class="mds-pill mds-pill--disabled" type="button" disabled>
  <span class="mds-pill__label">Label</span>
</button>
```

#### Do / Don't

```
✓  Always use neutral selected state — backgroundTertiary + borderNeutral
✓  Keep labels concise — pills are space-constrained
✓  Use count badge when quantity matters (e.g. "Filters · 3"); hide when count is 0
✓  Hug content — pills size to their label, no min/max width
✓  Scroll the pill group horizontally on overflow

✗  Never use a "pressed" state — there is none in this spec
✗  Never use a notification dot on a pill — not part of this component
✗  Never use accent selected state (green bg + green border) — not used in the app
✗  Never use a coloured label (contentAccent, contentPositive, etc.) in a pill
✗  Never combine leading and trailing icons without a label
✗  Never use a pill where a button is needed — pills are for filters/tags, not CTAs
✗  Never use a pill for navigation — use the Tab component instead
✗  Never wrap pills to a second row, never truncate labels — scroll horizontally instead
```

#### Pill vs Button vs Tab

| | Pill | Button | Tab |
|--|------|--------|-----|
| **Purpose** | Modify/filter content in the current view | Trigger a task or move the user forward | Navigate between distinct sections |
| **Interaction** | Filter, toggle, or input | Action (submit, next, learn more) | Navigate |
| **Stays on screen?** | Yes — adjusts what you see | May change screen | Changes section |
| **Example** | Timeframe toggle on a chart · Category filter | Buy, Submit, View Details | Stocks, F&O, Mutual Funds |

**Key rule:** Pills and buttons are not interchangeable. Pills adjust; buttons act. Pills are never used for navigation — that is the Tab component's job.

---

#### Pill groups

Pills almost always appear in groups. A pill group has one of three primary functions: **filter content**, **switch views**, or **capture input**.

**Rules for all pill groups:**
- State changes require an explicit tap — no swipe gestures
- **In a multi-select group, when a pill becomes selected it auto-switches from `default` layout to `trailing-icon` layout, with a close (×) icon (`gh-standard-cancel-01`) as the trailing icon.** Tapping the × dismisses the selection. The layout switch happens automatically — designers don't manually pick `trailing-icon` for the selected state.
- Single-select groups do not need a close icon — pills stay in `default` layout in both selected and enabled states.
- Labels must be short and descriptive
- Never use a pill group for page/section navigation
- Pill groups **scroll horizontally on overflow** — they never wrap to a second row and never truncate labels.

#### Pill group variants

**Base pill group** — use this as the default

- All pills show an outline border (`borderPrimary`) in the unselected state
- Selected pill has a thicker/saturated border (`borderNeutral`, 1.5px)
- Supports horizontal scrolling for larger sets
- Use when the pill group is important but not the dominant element on the screen

**Minimal pill group** — for secondary, low-emphasis contexts

- Unselected pills have **no border** (borderless)
- Only the selected pill shows a border (`borderNeutral`, 1.5px)
- Supports horizontal scrolling
- Use when the screen is visually busy and the pill group is a supporting element
- Example: timeframe toggle on a chart card within a busy dashboard

**Stylised pill group** — for high-emphasis, focal interactions

- Pills sit inside a shared container "jacket" with a `backgroundTertiary` fill — **no shadows**.
- Pills inside the jacket follow the standard pill state spec:
  - **Enabled:** no background fill, `borderPrimary` (1px), label `contentPrimary`
  - **Selected:** `backgroundTertiary` fill, `borderNeutral` (1.5px), label `contentPrimary`
- Maximum emphasis — the group stands out as the key interaction on the screen
- **Constraints:** 2–3 pills only; no scrolling; no disabled state (all options must always be tappable)
- Use when the pill group is the central, high-impact interaction on the screen
- Example: Monthly / Weekly toggle in a date picker

#### Group variant decision guide

```
Start here: Base pill group
↓ Reduce visual weight?  → Minimal pill group
  (screen is busy, pill group is secondary)
↑ Increase emphasis?     → Stylised pill group
  (pill group is central to the task, small fixed set)
```

| Consideration | Base | Minimal | Stylised |
|--------------|------|---------|----------|
| Pill group importance | Balanced | Secondary / supportive | Central / high-impact |
| Screen visual complexity | Medium | High (busy) | Low (clean) |
| Number of options | Flexible | Flexible | 2–3 max |
| Horizontal scrolling | ✓ | ✓ | ✗ |
| Disabled state | ✓ | ✓ | ✗ |

---

### 10.7 Order Card Input Field (`oc-input-field`)

The numeric input used inside order cards (Buy / Sell forms). Two types:

| Type | Where | Why |
|------|-------|-----|
| **default** | Stocks, intraday, MTF, and all other order flows | User types a numeric value (price, qty, trigger) directly |
| **stepper** | IPO order cards · F&O order cards | Users transact in **lots**, not units — − / + step by 1 lot |

> **When to use which:** Use `default` for every order card unless the order is denominated in lots. The stepper is **IPO and F&O only** — never for stock quantity, price, or any other numeric input.

#### Dimensions

| Property | Value |
|----------|-------|
| Width | 120px |
| Height | 40px |
| Padding | 12px |
| Corner radius | 8px |
| Border (resting / disabled) | 1px |
| Border (focus / active-typing / warning / error) | 2px — replaces the 1px without shifting layout |

#### Anatomy

```
Default                       Stepper
┌──────────────────┐          ┌──────────────────┐
│           23,500 │          │  −   44,000   +  │
└──────────────────┘          └──────────────────┘
   right-aligned                centred · − left · + right
```

Stepper `−` and `+` are 16×16px icon buttons (`mds_ic_subtract` / `mds_ic_add_plus`). Tapping increments/decrements by **1 lot**. Tapping the centred value opens the keyboard for direct entry.

#### States

Six states, applied to either type. The cursor is a 1px × 24px vertical bar in `contentAccent`, visible only while typing.

| State | Border | Background | Value colour | When |
|-------|--------|-----------|--------------|------|
| **inactive** | `borderPrimary` (1px) | transparent | `contentPrimary` | Resting — has a value, not focused |
| **focus** | `borderNeutral` (2px) | transparent | `contentPrimary` | Tapped, keyboard opening, no typing yet |
| **active-typing** | `borderNeutral` (2px) | transparent | `contentPrimary` | User is entering a value — cursor visible |
| **warning** | `borderWarning` (2px) | transparent | `contentPrimary` | Non-blocking concern (e.g. price far from LTP) |
| **error** | `borderNegative` (2px) | transparent | `contentPrimary` | Blocking validation failure |
| **disabled** | `borderDisabled` (1px) — stepper uses `borderPrimary` | `backgroundDisabled` | `contentDisabled` | Field is locked (e.g. "At market" disables price) |

`focus` and `active-typing` share the same border. The only difference is the cursor — `focus` has none, `active-typing` shows the green cursor.

#### Filled vs empty

| State | What shows |
|-------|------------|
| **isFilled = true** | Numeric value, right-aligned (default) or centred (stepper) |
| **isFilled = false** | Empty — no placeholder text. In stepper, − and + remain visible |

For a **default disabled filled** field, the text is a short contextual hint that explains why the field is disabled — e.g. `"At market"` for a market order's price field, `"Auto-calculated"`, `"Same as LTP"`, etc. For **stepper disabled filled**, the value typically reads `"lot"` as a hint that lots is the unit. These are illustrative — any short hint that explains the disabled reason is allowed.

#### Tokens

| Element | Token |
|---------|-------|
| Value text | `body-large-heavy` — Groww Sans 500, 16px/24px |
| Value colour (default) | `contentPrimary` |
| Value colour (disabled) | `contentDisabled` |
| Cursor | 1px × 24px, `contentAccent` |
| Stepper icons | 16×16px, `contentPrimary` (or `contentDisabled` when disabled) |

#### Width — strictly 120px

The field is **always 120×40px**. Never grow or shrink it to fit the row's content. If the value doesn't fit (e.g. very large numbers), the row layout changes around the input — the input does not.

#### Keyboard

The field **always opens a numeric keyboard** (`inputmode="numeric"` / `decimal`). This input is exclusively for numeric entry — never text. Even when the value is something like "At market", that's a disabled-state display only; the user can never type non-numeric input here.

#### Helper text and error messages

The input itself **has no label, helper text, or inline error message**. Field labels and error explanations live elsewhere in the order card row, typically as a **message box positioned above the keypad and any fixed bottom dock** when the keyboard is open. The input only carries the visual state (border colour, cursor) — the *reason* for that state is communicated outside.

#### Behaviour rules

- **No placeholder text in the empty state.** Hints belong outside the input as a label/helper, never inside.
- **Border thickens on focus, never shifts the layout.** The 2px focus border replaces the 1px resting border without changing outer dimensions.
- **Cursor only appears in `active-typing`** — not in `focus`, not in `inactive`.
- **Stepper increments by 1 lot per tap.** Long-press fast-increment is not supported in v1.
- **Stepper minimum is 1 lot.** The `−` button is disabled at 1 — the count never reaches 0.
- **Disabled fields never show focus/hover.** Tapping does nothing — no keyboard, no border change.
- **Warning is soft validation, real-time.** It fires while the user is typing (e.g. "price >5% from LTP") and is non-blocking — the order card CTA stays enabled.
- **Error is blocking.** The order card CTA disables until the value is corrected.

#### HTML implementation

```html
<style>
.oc-input {
  display: inline-flex;
  align-items: center;
  width: 120px;
  height: 40px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--borderPrimary);
  background: transparent;
  box-sizing: border-box;
  font-family: 'GrowwSans', sans-serif;
  position: relative;
}
.oc-input--default  { justify-content: flex-end; }
.oc-input--stepper  { justify-content: space-between; }

.oc-input--focus,
.oc-input--typing       { border: 2px solid var(--borderNeutral); padding: 11px; }
.oc-input--warning      { border: 2px solid var(--borderWarning); padding: 11px; }
.oc-input--error        { border: 2px solid var(--borderNegative); padding: 11px; }
.oc-input--disabled     {
  background: var(--backgroundDisabled);
  border-color: var(--borderDisabled);
  pointer-events: none;
}
.oc-input--stepper.oc-input--disabled { border-color: var(--borderPrimary); }

.oc-input__value {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: var(--contentPrimary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.oc-input--default .oc-input__value { flex: 1; text-align: right; }
.oc-input--stepper .oc-input__value { flex: 1; text-align: center; }
.oc-input--disabled .oc-input__value { color: var(--contentDisabled); }

.oc-input__cursor {
  display: inline-block;
  width: 1px;
  height: 24px;
  background: var(--contentAccent);
  animation: oc-cursor-blink 1s step-end infinite;
  margin-left: 2px;
}
@keyframes oc-cursor-blink { 50% { opacity: 0; } }

.oc-input__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: var(--contentPrimary);
  font-size: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.oc-input--disabled .oc-input__step { color: var(--contentDisabled); cursor: not-allowed; }
</style>

<!-- DEFAULT — inactive (filled) -->
<div class="oc-input oc-input--default">
  <span class="oc-input__value">23,500</span>
</div>

<!-- DEFAULT — focus -->
<div class="oc-input oc-input--default oc-input--focus">
  <span class="oc-input__value">23,500</span>
</div>

<!-- DEFAULT — active-typing (filled) -->
<div class="oc-input oc-input--default oc-input--typing">
  <span class="oc-input__value">23,500</span>
  <span class="oc-input__cursor"></span>
</div>

<!-- DEFAULT — warning -->
<div class="oc-input oc-input--default oc-input--warning">
  <span class="oc-input__value">23,500</span>
  <span class="oc-input__cursor"></span>
</div>

<!-- DEFAULT — error -->
<div class="oc-input oc-input--default oc-input--error">
  <span class="oc-input__value">23,500</span>
  <span class="oc-input__cursor"></span>
</div>

<!-- DEFAULT — disabled (At market) -->
<div class="oc-input oc-input--default oc-input--disabled">
  <span class="oc-input__value">At market</span>
</div>

<!-- STEPPER — inactive (filled) -->
<div class="oc-input oc-input--stepper">
  <button class="oc-input__step" type="button"><i class="gh-standard-minus-sign"></i></button>
  <span class="oc-input__value">44,000</span>
  <button class="oc-input__step" type="button"><i class="gh-standard-add-01"></i></button>
</div>

<!-- STEPPER — focus -->
<div class="oc-input oc-input--stepper oc-input--focus">
  <button class="oc-input__step" type="button"><i class="gh-standard-minus-sign"></i></button>
  <span class="oc-input__value">44,000</span>
  <button class="oc-input__step" type="button"><i class="gh-standard-add-01"></i></button>
</div>

<!-- STEPPER — error -->
<div class="oc-input oc-input--stepper oc-input--error">
  <button class="oc-input__step" type="button"><i class="gh-standard-minus-sign"></i></button>
  <span class="oc-input__value">44,000</span>
  <button class="oc-input__step" type="button"><i class="gh-standard-add-01"></i></button>
</div>

<!-- STEPPER — disabled -->
<div class="oc-input oc-input--stepper oc-input--disabled">
  <button class="oc-input__step" type="button" disabled><i class="gh-standard-minus-sign"></i></button>
  <span class="oc-input__value">lot</span>
  <button class="oc-input__step" type="button" disabled><i class="gh-standard-add-01"></i></button>
</div>
```

#### Do / Don't

```
✓  Use default for all single-value numeric inputs on order cards
✓  Use stepper ONLY for IPO and F&O order cards (lots concept)
✓  Show the cursor only when the user is actively typing
✓  Keep the field 120×40px — do not scale it to fit the row
✓  Use warning for "is this what you meant?"; error for "you can't proceed"

✗  Never use stepper for stock quantity, price, or trigger price
✗  Never put placeholder text inside the empty value slot
✗  Never let a disabled field show a focus or hover ring
✗  Never increment the stepper by more than 1 lot per tap
✗  Never combine warning and error — error always wins
```

---

## Changelog

All notable changes to the Mint Design System token reference are documented here.

| Version | Date | Changes |
|---------|------|---------|
| `v0.18` | 05/05/2026 | Spec hardening across components 10.1–10.7 to remove ambiguity for LLMs/agents. List Row: default tappable, backgroundSecondary on press, label truncates first, coloured sub-text live-data only. Tab: nav-only purpose, any count + horizontal scroll, top OR mid-screen placement, 1px borderPrimary divider, indicator = label width + 32px (16px each side). App Bar: brand-specific L0 logo, Standard bar per-flow, subtitle per-screen, 4+ actions overflow into ⋮ sheet, strict 1:1 title↔active-tab match. Bottom Nav: full-slot tap target, labels never truncate, L0-only visibility. Buttons: disabled fill universal (incl. Tertiary), loading hides label keeps width, width defaults flex/full-width-Large/hug-Small, icon-only deferred. Pill: dropped pressed state and notification dot, multi-select selected pill auto-switches to trailing-icon × layout, count badge hidden at 0, hug content, scroll on overflow, stylised group uses backgroundTertiary jacket no shadows. Order Card Input: width strictly 120px, always numeric keyboard, no ₹, helper/error message above keypad-and-dock, disabled-fill copy is illustrative, warning is real-time soft validation, stepper minimum 1 lot. |
| `v0.17` | 05/05/2026 | Bottom Nav: 3–5 tabs (was always 5); 5th slot is any one of {More, Bonds, US Stocks, Gold, FD}; full HTML implementation with hugeicons; corrected typography (Sohne 500, 10px, mixed case — exception to type scale). Hugeicons CSS expanded from 50 → 10,980 mappings (full stroke + solid catalog from font files). |
| `v0.16` | 05/05/2026 | Added Order Card Input Field (10.7) — default + stepper types, 6 states, filled/empty, cursor behaviour, HTML implementation. Stepper restricted to IPO/F&O. |
| `v0.15` | 04/05/2026 | Pill: added pill group variants (base/minimal/stylised), pill vs button vs tab, usage rules, decision guide. Bottom Nav: live tabs (Stocks, F&O, Mutual Funds, Loans) + alt IA options. App Bar: L0 product name reflects active tab. |
| `v0.14` | 04/05/2026 | Added Pill component (10.6) — layouts, states, tokens, count badge, notification dot, HTML implementation. |
| `v0.13` | 04/05/2026 | Added Components section — List Row Item, Tab, App Bar (L0 + Standard), Bottom Navigation, Buttons (6 variants, 3 sizes, states, groups, decision guide). |
| `v0.12` | 01/05/2026 | Added typography tokens — body (9 tokens), heading (6 tokens incl. eyebrow), display (4 tokens). Typeface specs for Sohne and Groww Sans. |
| `v0.09` | 01/05/2026 | Added Border tokens — borderPrimary, border++, onSurface Z1/Z2 variants. |
| `v0.08` | 01/05/2026 | Added Content tokens — contentPrimary/Secondary/Tertiary, content++, contentOn, contentInverse. |
| `v0.07` | 01/05/2026 | Added Background tokens — background, background++, overlay, surface Z1/Z2, onSurface variants, inverse, interaction states, data viz semantic tokens. |
| `v0.06` | 01/05/2026 | Added Data Viz primitives — 11 color families × 3 variants (emphasis, base, subtle). |
| `v0.05` | 01/05/2026 | Added Brand Semantics — accent and accent secondary token patterns; brand → hue mapping for Groww Invest, Credit, MF Prime, W, 915. |
| `v0.04` | 01/05/2026 | Added Colour Roles — positive, negative, warning base and interaction state tokens. |
| `v0.03` | 01/05/2026 | Added Neutrals — 12-step greyscale for light and dark modes. |
| `v0.02` | 01/05/2026 | Added Primitives — yellow, red, green, blue, lilac, gold, 915 green hue scales (12 steps × light/dark). |
| `v0.01` | 01/05/2026 | Initial structure — three-tier token hierarchy documented; static white/black primitives. |
