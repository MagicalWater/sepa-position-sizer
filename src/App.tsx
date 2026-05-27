import { useMemo, useState } from 'react';
import {
  type FullRiskMode,
  calculateAbsoluteStop,
  calculateFullRiskAmount,
  calculateProfitCushion,
  calculateTargets,
  selectRiskTier,
  sizePosition
} from './domain/positionMath';
import { validateDerivedState, validateInputs } from './domain/validation';

const numberFormatter = new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 });
const percentFormatter = new Intl.NumberFormat('zh-TW', {
  style: 'percent',
  maximumFractionDigits: 2
});

const formatNumber = (value: number) => (Number.isFinite(value) ? numberFormatter.format(value) : '--');

const formatMoney = (value: number) => (Number.isFinite(value) ? `${formatNumber(value)} 元` : '--');

const formatPercent = (value: number) => (Number.isFinite(value) ? percentFormatter.format(value) : '--');

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
};

function NumberField({ label, value, onChange, min, step = 1 }: NumberFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        aria-label={label}
        min={min}
        step={step}
        type="number"
        value={Number.isNaN(value) ? '' : value}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          onChange(nextValue === '' ? Number.NaN : Number(nextValue));
        }}
      />
    </label>
  );
}

function Metric({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'good' | 'warn' | 'risk' }) {
  return (
    <div className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function App() {
  const [totalCapital, setTotalCapital] = useState(100000);
  const [realizedPnL, setRealizedPnL] = useState(500);
  const [unrealizedProfit, setUnrealizedProfit] = useState(1000);
  const [discountPercent, setDiscountPercent] = useState(50);
  const [fullPositionPercent, setFullPositionPercent] = useState(25);
  const [fullRiskMode, setFullRiskMode] = useState<FullRiskMode>('percent');
  const [fullRiskPercent, setFullRiskPercent] = useState(1);
  const [manualFullRiskAmount, setManualFullRiskAmount] = useState(1000);
  const [lotSize, setLotSize] = useState(1);
  const [entryPrice, setEntryPrice] = useState(100);
  const [currentStopPrice, setCurrentStopPrice] = useState(97);

  const derived = useMemo(() => {
    const unrealizedProfitDiscountRate = discountPercent / 100;
    const fullPositionExposurePercent = fullPositionPercent / 100;
    const fullRiskAmount = calculateFullRiskAmount({
      totalCapital,
      mode: fullRiskMode,
      fullRiskPercent: fullRiskPercent / 100,
      manualFullRiskAmount
    });
    const profitCushion = calculateProfitCushion({
      realizedPnL,
      unrealizedProfit,
      unrealizedProfitDiscountRate
    });
    const absoluteStop = calculateAbsoluteStop({
      totalCapital,
      fullPositionExposurePercent,
      fullRiskAmount,
      entryPrice
    });
    const inputErrors = validateInputs({
      totalCapital,
      realizedPnL,
      unrealizedProfit,
      unrealizedProfitDiscountRate,
      fullPositionExposurePercent,
      fullRiskAmount,
      entryPrice,
      currentStopPrice,
      lotSize
    });
    const derivedErrors = validateDerivedState({
      currentStopPrice,
      absoluteStopPrice: absoluteStop.absoluteStopPrice,
      absoluteStopPercent: absoluteStop.absoluteStopPercent
    });
    const errors = Array.from(new Set([...inputErrors, ...derivedErrors]));
    const selectedTier = selectRiskTier({
      availableProfitCushion: profitCushion,
      fullRiskAmount
    });
    const selectedRiskAmount = fullRiskAmount * selectedTier.riskMultiplier;
    const selectedExposureCap = totalCapital * selectedTier.exposurePercent;
    const rawPerShareRisk = entryPrice - currentStopPrice;
    const currentPerShareRisk = Number.isFinite(rawPerShareRisk) && rawPerShareRisk > 0 ? rawPerShareRisk : Number.NaN;
    const currentStopPercent =
      Number.isFinite(currentPerShareRisk) && Number.isFinite(entryPrice) && entryPrice > 0 ? currentPerShareRisk / entryPrice : Number.NaN;

    if (errors.length > 0) {
      return {
        absoluteStop,
        currentPerShareRisk,
        currentStopPercent,
        errors,
        fullRiskAmount,
        profitCushion,
        selectedExposureCap,
        selectedRiskAmount,
        selectedTier,
        targets: null,
        position: null
      };
    }

    try {
      const position = sizePosition({
        totalCapital,
        entryPrice,
        currentStopPrice,
        selectedRiskAmount,
        selectedExposureCap,
        lotSize
      });
      const targets = calculateTargets({
        entryPrice,
        perShareRisk: position.perShareRisk
      });

      return {
        absoluteStop,
        currentPerShareRisk,
        currentStopPercent,
        errors,
        fullRiskAmount,
        profitCushion,
        selectedExposureCap,
        selectedRiskAmount,
        selectedTier,
        targets,
        position
      };
    } catch (error) {
      return {
        absoluteStop,
        currentPerShareRisk,
        currentStopPercent,
        errors: [...errors, error instanceof Error ? error.message : '倉位推導失敗'],
        fullRiskAmount,
        profitCushion,
        selectedExposureCap,
        selectedRiskAmount,
        selectedTier,
        targets: null,
        position: null
      };
    }
  }, [
    currentStopPrice,
    discountPercent,
    entryPrice,
    fullPositionPercent,
    fullRiskMode,
    fullRiskPercent,
    lotSize,
    manualFullRiskAmount,
    realizedPnL,
    totalCapital,
    unrealizedProfit
  ]);

  const canTrade = derived.errors.length === 0 && derived.position !== null;
  const statusLabel = canTrade ? '可交易' : '不建議交易';
  const entryValidityMessage = canTrade
    ? '本次停損價未低於絕對停損價，符合低風險入場條件。'
    : '本次停損價低於絕對停損價或輸入無效，不符合低風險入場條件。';
  const remainingProfitCushion =
    derived.position !== null ? derived.profitCushion - derived.position.actualLossAtStop : Number.NaN;
  const quarterTierRisk = derived.fullRiskAmount * 0.25;
  const warnings =
    derived.position === null
      ? []
      : [
          derived.position.cappedByExposure ? '投入上限低於風險可買股數，最終股數已由投入上限限制。' : null,
          derived.position.finalShares === 0 ? '最終股數為 0，代表目前風險與投入限制不足以建立一個交易單位。' : null,
          remainingProfitCushion < quarterTierRisk
            ? '停損後剩餘緩衝低於 1/4 倉風險，下一筆交易應維持最低風險或暫停。'
            : null
        ].filter((warning): warning is string => warning !== null);

  return (
    <main className="workstation">
      <header className="topbar">
        <div>
          <p className="eyebrow">本地風險試算工作台</p>
          <h1>SEPA 倉位試算器</h1>
        </div>
        <div className="header-metrics">
          <span className={`status-chip ${canTrade ? 'status-ok' : 'status-risk'}`}>{statusLabel}</span>
          <Metric label="絕對停損價" value={formatNumber(derived.absoluteStop.absoluteStopPrice)} tone={canTrade ? 'good' : 'risk'} />
        </div>
      </header>

      <section className="workspace-grid" aria-label="倉位試算工作區">
        <div className="primary-grid">
          <div className="column">
            <section className="panel" aria-labelledby="risk-settings-title">
              <h2 id="risk-settings-title">風險設定</h2>
              <div className="field-grid">
                <NumberField label="總投資資金" min={1} value={totalCapital} onChange={setTotalCapital} />
                <NumberField label="已實現損益" value={realizedPnL} onChange={setRealizedPnL} />
                <NumberField label="未實現浮盈" value={unrealizedProfit} onChange={setUnrealizedProfit} />
                <NumberField label="浮盈折扣百分比" min={0} step={0.5} value={discountPercent} onChange={setDiscountPercent} />
              </div>
              <Metric label="可用獲利緩衝" value={formatMoney(derived.profitCushion)} tone="good" />

              <div className="section-divider" />
              <div className="segmented" aria-label="滿倉風險模式" role="group">
                <button
                  aria-pressed={fullRiskMode === 'percent'}
                  className={fullRiskMode === 'percent' ? 'active' : ''}
                  type="button"
                  onClick={() => setFullRiskMode('percent')}
                >
                  依比例
                </button>
                <button
                  aria-pressed={fullRiskMode === 'manual'}
                  className={fullRiskMode === 'manual' ? 'active' : ''}
                  type="button"
                  onClick={() => setFullRiskMode('manual')}
                >
                  手動金額
                </button>
              </div>
              <div className="field-grid">
                <NumberField label="滿倉投入百分比" min={0.1} step={0.5} value={fullPositionPercent} onChange={setFullPositionPercent} />
                {fullRiskMode === 'percent' ? (
                  <NumberField label="滿倉風險百分比" min={0.1} step={0.1} value={fullRiskPercent} onChange={setFullRiskPercent} />
                ) : (
                  <NumberField label="手動滿倉風險金額" min={1} value={manualFullRiskAmount} onChange={setManualFullRiskAmount} />
                )}
                <NumberField label="股數單位" min={1} value={lotSize} onChange={setLotSize} />
              </div>
              <Metric label="滿倉 1R 風險金額" value={formatMoney(derived.fullRiskAmount)} tone="warn" />
            </section>
          </div>

          <div className="column">
            <section className="panel" aria-labelledby="entry-settings-title">
              <h2 id="entry-settings-title">入場設定</h2>
              <div className="field-grid">
                <NumberField label="入場價" min={0.01} step={0.01} value={entryPrice} onChange={setEntryPrice} />
                <NumberField label="本次停損價" min={0.01} step={0.01} value={currentStopPrice} onChange={setCurrentStopPrice} />
              </div>
            </section>

            <section className="panel" aria-labelledby="stop-check-title">
              <h2 id="stop-check-title">停損檢查</h2>
              <div className="metric-list compact-metrics">
                <Metric label="本次停損比例" value={formatPercent(derived.currentStopPercent)} tone={canTrade ? 'good' : 'risk'} />
                <Metric label="每股風險" value={formatMoney(derived.currentPerShareRisk)} tone="risk" />
                <Metric label="R 倍價格基準" value={formatMoney(derived.currentPerShareRisk)} />
                <Metric label="滿倉投入金額" value={formatMoney(derived.absoluteStop.fullPositionCapital)} />
                <Metric label="絕對停損比例" value={formatPercent(derived.absoluteStop.absoluteStopPercent)} />
                <Metric label="絕對停損價" value={formatNumber(derived.absoluteStop.absoluteStopPrice)} tone={canTrade ? 'good' : 'risk'} />
                <Metric label="入場有效性" value={canTrade ? '有效' : '無效'} tone={canTrade ? 'good' : 'risk'} />
              </div>
              <div className="notice" aria-live="polite">
                <div>
                  <span>判斷狀態</span>
                  <p>{entryValidityMessage}</p>
                </div>
                <strong>{statusLabel}</strong>
              </div>
            </section>

            {derived.errors.length > 0 && (
              <section className="panel alert-panel" aria-label="錯誤狀態">
                <h2>錯誤狀態</h2>
                <ul>
                  {derived.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

        </div>

        <div className="column">
          <section className="panel result-panel" aria-labelledby="position-result-title">
            <h2 id="position-result-title">倉位決策</h2>
            {canTrade && derived.position ? (
              <div className="result-stack">
                <div className="decision-hero">
                  <span>建議股數</span>
                  <strong>{formatNumber(derived.position.finalShares)} 股</strong>
                  <small>
                    <span>本次可投入金額</span>
                    <b>{formatMoney(derived.position.positionValue)}</b>
                  </small>
                </div>
                <div className="decision-metrics">
                  <Metric label="風險級別" value={derived.selectedTier.label} tone="warn" />
                  <Metric label="本次風險上限" value={formatMoney(derived.selectedRiskAmount)} />
                  <Metric label="風險可買股數" value={`${formatNumber(derived.position.riskBasedShares)} 股`} />
                  <Metric label="投入上限股數" value={`${formatNumber(derived.position.exposureCapShares)} 股`} />
                  <Metric label="每股風險" value={formatMoney(derived.position.perShareRisk)} tone="risk" />
                  <Metric label="部位金額" value={formatMoney(derived.position.positionValue)} />
                  <Metric label="部位比例" value={formatPercent(derived.position.positionPercent)} />
                  <Metric label="停損損失估算" value={formatMoney(derived.position.actualLossAtStop)} tone="risk" />
                  <Metric label="停損後剩餘緩衝" value={formatMoney(remainingProfitCushion)} tone={remainingProfitCushion >= quarterTierRisk ? 'good' : 'risk'} />
                  <Metric label="限制來源" value={derived.position.cappedByExposure ? '投入上限' : '風險上限'} tone="warn" />
                </div>
                {warnings.length > 0 && (
                  <ul className="warning-list" aria-label="風險提示">
                    {warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="blocked-result">
                <strong>不建議交易</strong>
                <span>本次停損未通過低風險檢查，暫不輸出股數建議。</span>
              </div>
            )}
          </section>
        </div>

        <section className="panel target-panel" aria-labelledby="targets-title">
          <h2 id="targets-title">參考止盈</h2>
          {canTrade && derived.targets ? (
            <>
              <p className="panel-note">以入場價加上每股風險推導 1R、2R、3R。</p>
              <div className="target-grid">
                <Metric label="1R 參考價" value={formatNumber(derived.targets.target1R)} />
                <Metric label="2R 參考價" value={formatNumber(derived.targets.target2R)} />
                <Metric label="3R 參考價" value={formatNumber(derived.targets.target3R)} />
              </div>
            </>
          ) : (
            <p className="muted-text">通過停損檢查後顯示參考價。</p>
          )}
        </section>
      </section>
    </main>
  );
}
