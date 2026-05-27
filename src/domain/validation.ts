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

export function validateInputs(input: ValidationInput) {
  const errors: string[] = [];

  if (input.totalCapital <= 0) errors.push('總投資資金必須大於 0');
  if (input.unrealizedProfitDiscountRate < 0 || input.unrealizedProfitDiscountRate > 1) {
    errors.push('未實現浮盈折扣率必須介於 0% 到 100%');
  }
  if (input.fullPositionExposurePercent <= 0) errors.push('滿倉投入比例必須大於 0');
  if (input.fullRiskAmount <= 0) errors.push('滿倉 1R 風險金額必須大於 0');
  if (input.entryPrice <= 0) errors.push('入場價必須大於 0');
  if (input.currentStopPrice <= 0) errors.push('本次停損價必須大於 0');
  if (input.currentStopPrice >= input.entryPrice) errors.push('本次停損價必須低於入場價');
  if (input.lotSize <= 0) errors.push('股數單位必須大於 0');

  return errors;
}

export function validateDerivedState(input: {
  currentStopPrice: number;
  absoluteStopPrice: number;
  absoluteStopPercent: number;
}) {
  const errors: string[] = [];

  if (input.absoluteStopPercent <= 0) {
    errors.push('推導出的絕對停損比例必須大於 0');
  }

  if (input.currentStopPrice < input.absoluteStopPrice) {
    errors.push('本次停損距離超過滿倉 1R 推導出的絕對停損，這不是低風險入場');
  }

  return errors;
}
