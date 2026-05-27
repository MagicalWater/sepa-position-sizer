export type FullRiskMode = 'percent' | 'manual';

export type RiskTierName = 'quarter' | 'half' | 'full';

export type RiskTier = {
  name: RiskTierName;
  label: string;
  riskMultiplier: number;
  exposurePercent: number;
};

export const RISK_TIERS: RiskTier[] = [
  { name: 'quarter', label: '1/4 倉', riskMultiplier: 0.25, exposurePercent: 0.0625 },
  { name: 'half', label: '半倉', riskMultiplier: 0.5, exposurePercent: 0.125 },
  { name: 'full', label: '滿倉', riskMultiplier: 1, exposurePercent: 0.25 }
];

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateProfitCushion(input: {
  realizedPnL: number;
  unrealizedProfit: number;
  unrealizedProfitDiscountRate: number;
}) {
  return roundMoney(input.realizedPnL + input.unrealizedProfit * input.unrealizedProfitDiscountRate);
}

export function calculateFullRiskAmount(input: {
  totalCapital: number;
  mode: FullRiskMode;
  fullRiskPercent: number;
  manualFullRiskAmount: number;
}) {
  if (input.mode === 'manual') {
    return roundMoney(input.manualFullRiskAmount);
  }

  return roundMoney(input.totalCapital * input.fullRiskPercent);
}

export function calculateAbsoluteStop(input: {
  totalCapital: number;
  fullPositionExposurePercent: number;
  fullRiskAmount: number;
  entryPrice: number;
}) {
  const fullPositionCapital = roundMoney(input.totalCapital * input.fullPositionExposurePercent);
  const absoluteStopPercent = input.fullRiskAmount / fullPositionCapital;
  const absoluteStopPrice = roundMoney(input.entryPrice * (1 - absoluteStopPercent));

  return {
    fullPositionCapital,
    absoluteStopPercent,
    absoluteStopPrice
  };
}

export function selectRiskTier(input: {
  availableProfitCushion: number;
  fullRiskAmount: number;
}) {
  if (input.availableProfitCushion >= input.fullRiskAmount) {
    return RISK_TIERS[2];
  }

  if (input.availableProfitCushion >= input.fullRiskAmount * 0.5) {
    return RISK_TIERS[1];
  }

  return RISK_TIERS[0];
}

export function floorToLot(value: number, lotSize: number) {
  return Math.floor(value / lotSize) * lotSize;
}

export function sizePosition(input: {
  totalCapital: number;
  entryPrice: number;
  currentStopPrice: number;
  selectedRiskAmount: number;
  selectedExposureCap: number;
  lotSize: number;
}) {
  const perShareRisk = roundMoney(input.entryPrice - input.currentStopPrice);
  const currentStopPercent = perShareRisk / input.entryPrice;
  const riskBasedShares = floorToLot(input.selectedRiskAmount / perShareRisk, input.lotSize);
  const exposureCapShares = floorToLot(input.selectedExposureCap / input.entryPrice, input.lotSize);
  const finalShares = Math.min(riskBasedShares, exposureCapShares);
  const positionValue = roundMoney(finalShares * input.entryPrice);
  const positionPercent = positionValue / input.totalCapital;
  const actualLossAtStop = roundMoney(finalShares * perShareRisk);

  return {
    perShareRisk,
    currentStopPercent,
    riskBasedShares,
    exposureCapShares,
    finalShares,
    positionValue,
    positionPercent,
    actualLossAtStop,
    cappedByExposure: exposureCapShares < riskBasedShares
  };
}

export function calculateTargets(input: {
  entryPrice: number;
  perShareRisk: number;
}) {
  return {
    target1R: roundMoney(input.entryPrice + input.perShareRisk),
    target2R: roundMoney(input.entryPrice + input.perShareRisk * 2),
    target3R: roundMoney(input.entryPrice + input.perShareRisk * 3)
  };
}
