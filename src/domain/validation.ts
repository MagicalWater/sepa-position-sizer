export type ValidationInput = {
  totalCapital: number;
  realizedPnL: number;
  unrealizedProfit: number;
  unrealizedProfitDiscountRate: number;
  fullPositionExposurePercent: number;
  fullRiskAmount: number;
  entryPrice: number;
  currentStopPrice: number;
  lotSize: number;
};

function isFiniteNumber(value: number) {
  return Number.isFinite(value);
}

export function validateInputs(input: ValidationInput) {
  const errors: string[] = [];

  if (!isFiniteNumber(input.totalCapital)) errors.push('總投資資金必須是有效數字');
  if (!isFiniteNumber(input.realizedPnL)) errors.push('已實現損益必須是有效數字');
  if (!isFiniteNumber(input.unrealizedProfit)) errors.push('未實現浮盈必須是有效數字');
  if (!isFiniteNumber(input.unrealizedProfitDiscountRate)) {
    errors.push('未實現浮盈折扣率必須是有效數字');
  }
  if (!isFiniteNumber(input.fullPositionExposurePercent)) errors.push('滿倉投入比例必須是有效數字');
  if (!isFiniteNumber(input.fullRiskAmount)) errors.push('滿倉 1R 風險金額必須是有效數字');
  if (!isFiniteNumber(input.entryPrice)) errors.push('入場價必須是有效數字');
  if (!isFiniteNumber(input.currentStopPrice)) errors.push('本次停損價必須是有效數字');
  if (!isFiniteNumber(input.lotSize)) errors.push('股數單位必須是有效數字');

  if (isFiniteNumber(input.totalCapital) && input.totalCapital <= 0) errors.push('總投資資金必須大於 0');
  if (
    isFiniteNumber(input.unrealizedProfitDiscountRate) &&
    (input.unrealizedProfitDiscountRate < 0 || input.unrealizedProfitDiscountRate > 1)
  ) {
    errors.push('未實現浮盈折扣率必須介於 0% 到 100%');
  }
  if (isFiniteNumber(input.fullPositionExposurePercent) && input.fullPositionExposurePercent <= 0) {
    errors.push('滿倉投入比例必須大於 0');
  }
  if (isFiniteNumber(input.fullRiskAmount) && input.fullRiskAmount <= 0) {
    errors.push('滿倉 1R 風險金額必須大於 0');
  }
  if (isFiniteNumber(input.entryPrice) && input.entryPrice <= 0) errors.push('入場價必須大於 0');
  if (isFiniteNumber(input.currentStopPrice) && input.currentStopPrice <= 0) {
    errors.push('本次停損價必須大於 0');
  }
  if (
    isFiniteNumber(input.currentStopPrice) &&
    isFiniteNumber(input.entryPrice) &&
    input.currentStopPrice >= input.entryPrice
  ) {
    errors.push('本次停損價必須低於入場價');
  }
  if (isFiniteNumber(input.lotSize) && input.lotSize <= 0) errors.push('股數單位必須大於 0');

  return errors;
}

export function validateDerivedState(input: {
  currentStopPrice: number;
  absoluteStopPrice: number;
  absoluteStopPercent: number;
}) {
  const errors: string[] = [];

  if (!isFiniteNumber(input.currentStopPrice)) errors.push('本次停損價必須是有效數字');
  if (!isFiniteNumber(input.absoluteStopPrice)) errors.push('推導出的絕對停損價必須是有效數字');
  if (!isFiniteNumber(input.absoluteStopPercent)) errors.push('推導出的絕對停損比例必須是有效數字');

  if (isFiniteNumber(input.absoluteStopPrice) && input.absoluteStopPrice <= 0) {
    errors.push('推導出的絕對停損價必須大於 0');
  }

  if (
    isFiniteNumber(input.absoluteStopPercent) &&
    (input.absoluteStopPercent <= 0 || input.absoluteStopPercent >= 1)
  ) {
    errors.push('推導出的絕對停損比例必須介於 0 到 1 之間');
  }

  if (
    isFiniteNumber(input.currentStopPrice) &&
    isFiniteNumber(input.absoluteStopPrice) &&
    input.currentStopPrice < input.absoluteStopPrice
  ) {
    errors.push('本次停損距離超過滿倉 1R 推導出的絕對停損，這不是低風險入場');
  }

  return errors;
}
