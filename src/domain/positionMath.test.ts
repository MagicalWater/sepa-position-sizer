import { describe, expect, it } from 'vitest';
import {
  calculateAbsoluteStop,
  calculateFullRiskAmount,
  calculateProfitCushion,
  calculateTargets,
  selectRiskTier,
  sizePosition
} from './positionMath';

describe('positionMath', () => {
  it('用已實現損益與折扣後未實現浮盈計算可用獲利緩衝', () => {
    expect(calculateProfitCushion({
      realizedPnL: 500,
      unrealizedProfit: 1000,
      unrealizedProfitDiscountRate: 0.5
    })).toBe(1000);
  });

  it('可用比例模式計算滿倉 1R 風險金額', () => {
    expect(calculateFullRiskAmount({
      totalCapital: 100000,
      mode: 'percent',
      fullRiskPercent: 0.01,
      manualFullRiskAmount: 0
    })).toBe(1000);
  });

  it('可用手動模式覆寫滿倉 1R 風險金額', () => {
    expect(calculateFullRiskAmount({
      totalCapital: 100000,
      mode: 'manual',
      fullRiskPercent: 0.01,
      manualFullRiskAmount: 750
    })).toBe(750);
  });

  it('由滿倉投入比例與 1R 風險推導絕對停損', () => {
    expect(calculateAbsoluteStop({
      totalCapital: 100000,
      fullPositionExposurePercent: 0.25,
      fullRiskAmount: 1000,
      entryPrice: 100
    })).toEqual({
      fullPositionCapital: 25000,
      absoluteStopPercent: 0.04,
      absoluteStopPrice: 96
    });
  });

  it('依可用獲利緩衝選擇風險級別', () => {
    expect(selectRiskTier({ availableProfitCushion: 1000, fullRiskAmount: 1000 }).name).toBe('full');
    expect(selectRiskTier({ availableProfitCushion: 500, fullRiskAmount: 1000 }).name).toBe('half');
    expect(selectRiskTier({ availableProfitCushion: 249, fullRiskAmount: 1000 }).name).toBe('quarter');
  });

  it('用風險金額與曝險上限計算最終股數', () => {
    expect(sizePosition({
      totalCapital: 100000,
      entryPrice: 100,
      currentStopPrice: 97,
      selectedRiskAmount: 1000,
      selectedExposureCap: 25000,
      lotSize: 1
    })).toEqual({
      perShareRisk: 3,
      currentStopPercent: 0.03,
      riskBasedShares: 333,
      exposureCapShares: 250,
      finalShares: 250,
      positionValue: 25000,
      positionPercent: 0.25,
      actualLossAtStop: 750,
      cappedByExposure: true
    });
  });

  it('計算 1R 2R 3R 參考價', () => {
    expect(calculateTargets({ entryPrice: 100, perShareRisk: 3 })).toEqual({
      target1R: 103,
      target2R: 106,
      target3R: 109
    });
  });
});
