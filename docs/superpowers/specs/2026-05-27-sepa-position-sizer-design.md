# SEPA Position Sizer Design

## Purpose

Build a focused Web UI for SEPA-style position sizing. The tool does not screen stocks, read charts, track trades, or store a P&L journal. It only answers one question:

> Given current account state, profit cushion, full-position risk rules, entry price, and stop price, how large can the current position be?

The first version is a single-page calculator with a low-contrast dark workstation visual style.

## Scope

In scope:

- Account and profit cushion inputs.
- Full-position risk rule inputs.
- Entry price and current stop price inputs.
- Derived absolute stop percentage and absolute stop price.
- Trade validity check based on whether the current stop is inside the derived absolute stop.
- Position sizing based on profit cushion, risk tier, price risk, and full-position exposure cap.
- R-multiple target reference prices.
- Validation and warning states.

Out of scope:

- Stock screening.
- Fundamental analysis.
- RS rating integration.
- Chart rendering or chart interpretation.
- Trade journaling.
- Historical P&L reporting.
- Saving trade records.
- Automatic VCP or high tight flag detection.

## Product Model

The calculator separates four concepts:

1. Account state: how much capital and profit cushion is available.
2. Full-position risk rule: what a full position means in exposure and account risk.
3. Current price risk: entry price and the stop price chosen by the trader.
4. Result: whether the entry is low-risk enough and, if valid, how many shares can be bought.

The current stop price is entered by the user. The tool does not need to know whether that stop came from a VCP contraction low, a base low, or another chart judgment.

## Core Calculations

### Profit Cushion

```text
availableProfitCushion =
  realizedPnL + unrealizedProfit * unrealizedProfitDiscountRate
```

Default:

```text
unrealizedProfitDiscountRate = 50%
```

The discount rate is editable.

MVP defaults:

```text
unrealizedProfitDiscountRate = 50%
fullPositionExposurePercent = 25%
fullRiskPercent = 1%
lotSize = 1
```

### Full Position Risk

The user defines full-position risk using one of two modes:

```text
percentage mode:
  fullRiskAmount = totalCapital * fullRiskPercent

manual mode:
  fullRiskAmount = manualFullRiskAmount
```

The user also defines:

```text
fullPositionExposurePercent
```

Example:

```text
totalCapital = 100,000
fullPositionExposurePercent = 25%
fullPositionCapital = 25,000
fullRiskAmount = 1,000
```

### Derived Absolute Stop

The absolute stop is not an independent input. It is derived from full-position exposure and full-position risk:

```text
fullPositionCapital = totalCapital * fullPositionExposurePercent
absoluteStopPercent = fullRiskAmount / fullPositionCapital
absoluteStopPrice = entryPrice * (1 - absoluteStopPercent)
```

This represents the widest stop distance that still fits the full-position risk rule.

### Current Stop Validation

```text
currentStopPercent = (entryPrice - currentStopPrice) / entryPrice
perShareRisk = entryPrice - currentStopPrice
```

For long positions:

```text
if currentStopPrice < absoluteStopPrice:
  setup is invalid
```

Invalid means the chart stop is too far away for the full-position low-risk entry standard. The UI must not show a primary recommended share count in this state. It should instead show that the trade is not recommended and suggest waiting for a tighter entry.

Valid means:

```text
currentStopPrice >= absoluteStopPrice
```

Only valid setups continue to position sizing.

### Risk Tier

Use the profit cushion to choose the maximum allowed risk tier. The quarter tier is the baseline starter risk. Profit cushion is used to unlock larger half and full tiers.

MVP tiers are fixed:

```text
quarter = 25% of fullRiskAmount, 6.25% exposure
half    = 50% of fullRiskAmount, 12.5% exposure
full    = 100% of fullRiskAmount, 25% exposure
```

These tiers are not editable in the MVP. The UI shows the active tier and the reason it was selected.

Tier selection:

```text
if availableProfitCushion >= fullRiskAmount:
  selectedTier = full
else if availableProfitCushion >= fullRiskAmount * 0.5:
  selectedTier = half
else:
  selectedTier = quarter
```

This means the MVP always allows the baseline quarter tier when the setup itself is valid. If available profit cushion is below the quarter-tier risk, the UI should warn that a stop-out can reduce or eliminate the current cushion.

The selected tier determines:

```text
selectedRiskAmount = fullRiskAmount * tierRiskMultiplier
selectedExposureCap = totalCapital * tierExposurePercent
```

### Position Size

First calculate risk-based shares:

```text
riskBasedShares = floor(selectedRiskAmount / perShareRisk / lotSize) * lotSize
```

Then apply exposure cap:

```text
exposureCapShares = floor(selectedExposureCap / entryPrice / lotSize) * lotSize
finalShares = min(riskBasedShares, exposureCapShares)
```

Final outputs:

```text
positionValue = finalShares * entryPrice
positionPercent = positionValue / totalCapital
actualLossAtStop = finalShares * perShareRisk
remainingProfitCushionAfterStop = availableProfitCushion - actualLossAtStop
```

If exposure cap reduces the risk-based share count, show a warning and both numbers:

```text
risk-based shares
exposure-capped shares
final shares
```

### R-Multiple Targets

```text
target1R = entryPrice + perShareRisk
target2R = entryPrice + perShareRisk * 2
target3R = entryPrice + perShareRisk * 3
```

These are reference prices only.

## UI Structure

Use a single-page, low-contrast dark workstation layout.

### Header

Show:

- Product name: `SEPA Position Sizer`.
- Short context: `滿倉風險推導絕對停損`.
- Status chips:
  - Valid / invalid setup.
  - Derived absolute stop price or invalid reason.

### Section A: Account And Profit Cushion

Inputs:

- `總投資資金`
- `已實現損益`
- `未實現浮盈`
- `未實現浮盈折扣率`

Derived output:

- `可用獲利緩衝`

### Section B: Full Position Risk Rule

Inputs:

- `滿倉投入比例`
- `滿倉 1R 風險模式`: percentage or manual amount.
- `1R 風險比例`, shown in percentage mode.
- `手動 1R 風險金額`, shown in manual mode.
- `股數單位`

Derived output:

- `滿倉 1R 風險金額`

### Section C: Current Price

Inputs:

- `入場價`
- `本次停損價`

Derived outputs:

- `本次停損比例`
- `每股風險`
- `R 倍價格基準`

### Section D: Derived Absolute Stop And Validity

Derived outputs:

- `滿倉投入金額`
- `絕對停損比例`
- `絕對停損價`
- `入場有效性`

When valid:

- Show `可交易`.
- Explain that the current stop price is inside the absolute stop boundary.

When invalid:

- Show `不建議交易`.
- Explain that the current stop is wider than the full-position risk rule allows.
- Hide the primary recommended share count.

### Section E: Position Result

When valid, show:

- Active risk tier.
- Suggested final shares.
- Risk-based shares.
- Exposure-capped shares, if applicable.
- Position value.
- Position percent.
- Actual loss at stop.
- Remaining profit cushion after stop.
- 1R / 2R / 3R reference prices.

When invalid, replace this with an invalid-state panel.

## Validation

Show blocking errors for:

- Missing required numeric inputs.
- `totalCapital <= 0`.
- `entryPrice <= 0`.
- `currentStopPrice <= 0`.
- `currentStopPrice >= entryPrice`.
- `fullPositionExposurePercent <= 0`.
- `fullRiskAmount <= 0`.
- `lotSize <= 0`.
- Derived `absoluteStopPercent <= 0`.
- `currentStopPrice < absoluteStopPrice`, because the current stop is wider than the derived absolute stop.

Show warnings for:

- Exposure cap reduces risk-based share count.
- Final shares are zero because lot size, risk, or exposure cap is too restrictive.
- Remaining profit cushion after stop is negative or below the quarter-tier risk.

## Visual Direction

Use the approved dark workstation direction:

- Background: low-contrast gray-black, not pure OLED black.
- Panels: muted dark gray with thin blue-gray borders.
- Text: off-white for primary, muted gray-green for secondary.
- Success: restrained green.
- Warning: amber.
- Risk / loss: muted red.
- Rounded corners should stay modest, around 6-8px.
- Avoid decorative charts, gradient orbs, hero sections, or marketing layout.

All UI text should be Chinese, except the product name.

## Implementation Notes

Keep calculation logic separate from UI components so it can be unit tested.

Suggested modules:

- `positionMath`: pure functions for cushion, full risk, absolute stop, tier selection, and share sizing.
- `validation`: input and derived-state validation.
- `ui`: page layout and form controls.

The app can be implemented as a local-first frontend with no backend for the MVP.
