import { describe, expect, it } from 'vitest';
import { validateInputs, validateDerivedState } from './validation';

describe('validation', () => {
  const validInput = {
    totalCapital: 100000,
    realizedPnL: 0,
    unrealizedProfit: 0,
    unrealizedProfitDiscountRate: 0.5,
    fullPositionExposurePercent: 0.25,
    fullRiskAmount: 1000,
    entryPrice: 100,
    currentStopPrice: 97,
    lotSize: 1
  };

  it('阻擋無效的基本輸入', () => {
    expect(validateInputs({
      ...validInput,
      totalCapital: 0
    })).toContain('總投資資金必須大於 0');
  });

  it('阻擋停損價大於或等於入場價', () => {
    expect(validateInputs({
      ...validInput,
      currentStopPrice: 100
    })).toContain('本次停損價必須低於入場價');
  });

  it('阻擋基本輸入中的 NaN 與 Infinity', () => {
    expect(validateInputs({
      ...validInput,
      totalCapital: Number.NaN,
      entryPrice: Number.POSITIVE_INFINITY
    })).toEqual(expect.arrayContaining([
      '總投資資金必須是有效數字',
      '入場價必須是有效數字'
    ]));
  });

  it('已實現與未實現損益可為負數但不能是 NaN', () => {
    expect(validateInputs({
      ...validInput,
      realizedPnL: -1000,
      unrealizedProfit: -500
    })).toEqual([]);

    expect(validateInputs({
      ...validInput,
      realizedPnL: Number.NaN,
      unrealizedProfit: Number.NaN
    })).toEqual(expect.arrayContaining([
      '已實現損益必須是有效數字',
      '未實現浮盈必須是有效數字'
    ]));
  });

  it('阻擋本次停損價低於推導絕對停損價', () => {
    expect(validateDerivedState({
      currentStopPrice: 95,
      absoluteStopPrice: 96,
      absoluteStopPercent: 0.04
    })).toContain('本次停損距離超過滿倉 1R 推導出的絕對停損，這不是低風險入場');
  });

  it('阻擋推導狀態中的 NaN 與 Infinity', () => {
    expect(validateDerivedState({
      currentStopPrice: Number.NaN,
      absoluteStopPrice: Number.POSITIVE_INFINITY,
      absoluteStopPercent: Number.NaN
    })).toEqual(expect.arrayContaining([
      '本次停損價必須是有效數字',
      '推導出的絕對停損價必須是有效數字',
      '推導出的絕對停損比例必須是有效數字'
    ]));
  });

  it('阻擋無效的推導絕對停損價與比例上限', () => {
    expect(validateDerivedState({
      currentStopPrice: 97,
      absoluteStopPrice: 0,
      absoluteStopPercent: 1
    })).toEqual(expect.arrayContaining([
      '推導出的絕對停損價必須大於 0',
      '推導出的絕對停損比例必須介於 0 到 1 之間'
    ]));
  });

  it('有效停損不回傳阻擋錯誤', () => {
    expect(validateDerivedState({
      currentStopPrice: 97,
      absoluteStopPrice: 96,
      absoluteStopPercent: 0.04
    })).toEqual([]);
  });
});
