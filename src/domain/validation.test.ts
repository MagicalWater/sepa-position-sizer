import { describe, expect, it } from 'vitest';
import { validateInputs, validateDerivedState } from './validation';

describe('validation', () => {
  it('阻擋無效的基本輸入', () => {
    expect(validateInputs({
      totalCapital: 0,
      realizedPnL: 0,
      unrealizedProfit: 0,
      unrealizedProfitDiscountRate: 0.5,
      fullPositionExposurePercent: 0.25,
      fullRiskAmount: 1000,
      entryPrice: 100,
      currentStopPrice: 97,
      lotSize: 1
    })).toContain('總投資資金必須大於 0');
  });

  it('阻擋停損價大於或等於入場價', () => {
    expect(validateInputs({
      totalCapital: 100000,
      realizedPnL: 0,
      unrealizedProfit: 0,
      unrealizedProfitDiscountRate: 0.5,
      fullPositionExposurePercent: 0.25,
      fullRiskAmount: 1000,
      entryPrice: 100,
      currentStopPrice: 100,
      lotSize: 1
    })).toContain('本次停損價必須低於入場價');
  });

  it('阻擋本次停損價低於推導絕對停損價', () => {
    expect(validateDerivedState({
      currentStopPrice: 95,
      absoluteStopPrice: 96,
      absoluteStopPercent: 0.04
    })).toContain('本次停損距離超過滿倉 1R 推導出的絕對停損，這不是低風險入場');
  });

  it('有效停損不回傳阻擋錯誤', () => {
    expect(validateDerivedState({
      currentStopPrice: 97,
      absoluteStopPrice: 96,
      absoluteStopPercent: 0.04
    })).toEqual([]);
  });
});
