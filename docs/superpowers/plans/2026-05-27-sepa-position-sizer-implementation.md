# SEPA 倉位試算器實作計畫

> **給代理工作者：** 必要子技能：使用 `superpowers:subagent-driven-development`（建議）或 `superpowers:executing-plans` 逐項實作此計畫。步驟使用 checkbox（`- [ ]`）語法追蹤。

**目標：** 建立一個單頁 Web UI，用滿倉 1R 風險推導絕對停損，驗證本次停損是否符合低風險入場，並計算建議倉位。

**架構：** 使用 Vite + React + TypeScript 建立本地前端。核心計算放在純函式模組，驗證邏輯獨立，UI 只負責表單狀態、呈現推導結果與警示。所有顯示文字使用中文，產品名稱 `SEPA Position Sizer` 保留英文。

**技術棧：** Vite、React、TypeScript、Vitest、Testing Library、一般 CSS。

---

## 檔案結構

- 建立：`package.json`，定義 scripts 與相依套件。
- 建立：`index.html`，Vite 入口 HTML。
- 建立：`vite.config.ts`，Vite 與 Vitest 設定。
- 建立：`tsconfig.json`，TypeScript 專案設定。
- 建立：`tsconfig.node.json`，Vite config 的 TypeScript 設定。
- 建立：`src/main.tsx`，React app 掛載入口。
- 建立：`src/App.tsx`，單頁工作台 UI 與狀態管理。
- 建立：`src/styles.css`，全域樣式與工作台視覺。
- 建立：`src/domain/positionMath.ts`，純計算函式與型別。
- 建立：`src/domain/positionMath.test.ts`，核心計算測試。
- 建立：`src/domain/validation.ts`，輸入與推導狀態驗證。
- 建立：`src/domain/validation.test.ts`，驗證測試。
- 建立：`src/test/setup.ts`，Testing Library 測試設定。
- 建立：`src/App.test.tsx`，介面行為測試。

## 任務 1：建立 Vite React TypeScript 專案骨架

**檔案：**
- 建立：`package.json`
- 建立：`index.html`
- 建立：`vite.config.ts`
- 建立：`tsconfig.json`
- 建立：`tsconfig.node.json`
- 建立：`src/main.tsx`
- 建立：`src/App.tsx`
- 建立：`src/styles.css`
- 建立：`src/test/setup.ts`

- [ ] **步驟 1：建立 `package.json`**

```json
{
  "name": "sepa-position-sizer",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.7",
    "typescript": "^5.7.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "jsdom": "^25.0.1",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **步驟 2：建立 `index.html`**

```html
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SEPA Position Sizer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **步驟 3：建立 `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts'
  }
});
```

- [ ] **步驟 4：建立 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **步驟 5：建立 `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **步驟 6：建立測試設定 `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **步驟 7：建立暫時 App**

`src/App.tsx`：

```tsx
export function App() {
  return (
    <main className="app-shell">
      <h1>SEPA Position Sizer</h1>
      <p>倉位試算器初始化完成</p>
    </main>
  );
}
```

`src/main.tsx`：

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`src/styles.css`：

```css
:root {
  color: #d9ded8;
  background: #181c1c;
  font-family: "Noto Sans TC", "Microsoft JhengHei", system-ui, sans-serif;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: #181c1c;
}

button,
input,
select {
  font: inherit;
}

.app-shell {
  padding: 24px;
}
```

- [ ] **步驟 8：安裝相依套件**

執行：

```powershell
npm install
```

預期：產生 `package-lock.json`，且沒有安裝失敗。

- [ ] **步驟 9：確認骨架可建置**

執行：

```powershell
npm run build
```

預期：TypeScript 與 Vite build 成功。

- [ ] **步驟 10：提交**

```powershell
git add package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.node.json src
git commit -m "chore: 建立 React 專案骨架"
```

## 任務 2：實作核心計算模型

**檔案：**
- 建立：`src/domain/positionMath.ts`
- 建立：`src/domain/positionMath.test.ts`

- [ ] **步驟 1：先寫失敗測試 `src/domain/positionMath.test.ts`**

```ts
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
```

- [ ] **步驟 2：執行測試確認失敗**

執行：

```powershell
npm test -- src/domain/positionMath.test.ts
```

預期：失敗，原因是 `positionMath` 模組尚未存在。

- [ ] **步驟 3：建立 `src/domain/positionMath.ts`**

```ts
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
```

- [ ] **步驟 4：執行測試確認通過**

執行：

```powershell
npm test -- src/domain/positionMath.test.ts
```

預期：`7 passed`。

- [ ] **步驟 5：提交**

```powershell
git add src/domain/positionMath.ts src/domain/positionMath.test.ts
git commit -m "feat: 新增倉位計算核心"
```

## 任務 3：實作驗證邏輯

**檔案：**
- 建立：`src/domain/validation.ts`
- 建立：`src/domain/validation.test.ts`

- [ ] **步驟 1：先寫失敗測試 `src/domain/validation.test.ts`**

```ts
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
```

- [ ] **步驟 2：執行測試確認失敗**

執行：

```powershell
npm test -- src/domain/validation.test.ts
```

預期：失敗，原因是 `validation` 模組尚未存在。

- [ ] **步驟 3：建立 `src/domain/validation.ts`**

```ts
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
```

- [ ] **步驟 4：執行驗證測試**

執行：

```powershell
npm test -- src/domain/validation.test.ts
```

預期：`4 passed`。

- [ ] **步驟 5：執行全部單元測試**

執行：

```powershell
npm test
```

預期：所有測試通過。

- [ ] **步驟 6：提交**

```powershell
git add src/domain/validation.ts src/domain/validation.test.ts
git commit -m "feat: 新增倉位驗證規則"
```

## 任務 4：建立中文單頁 UI 與狀態推導

**檔案：**
- 修改：`src/App.tsx`
- 修改：`src/styles.css`
- 建立：`src/App.test.tsx`

- [ ] **步驟 1：先寫 UI 行為測試 `src/App.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('顯示核心中文區塊', () => {
    render(<App />);

    expect(screen.getByText('帳戶與獲利緩衝')).toBeInTheDocument();
    expect(screen.getByText('滿倉風險規則')).toBeInTheDocument();
    expect(screen.getByText('本次價格')).toBeInTheDocument();
    expect(screen.getByText('自動推導')).toBeInTheDocument();
    expect(screen.getByText('倉位結果')).toBeInTheDocument();
  });

  it('輸入過遠停損時顯示不建議交易', async () => {
    const user = userEvent.setup();
    render(<App />);

    const stopInput = screen.getByLabelText('本次停損價');
    await user.clear(stopInput);
    await user.type(stopInput, '95');

    expect(screen.getAllByText('不建議交易').length).toBeGreaterThan(0);
    expect(screen.queryByText('最終建議股數')).not.toBeInTheDocument();
  });

  it('有效停損時顯示限制後結果', () => {
    render(<App />);

    expect(screen.getAllByText('可交易').length).toBeGreaterThan(0);
    expect(screen.getByText('最終建議股數')).toBeInTheDocument();
    expect(screen.getByText('250 股')).toBeInTheDocument();
  });
});
```

- [ ] **步驟 2：執行 UI 測試確認失敗**

執行：

```powershell
npm test -- src/App.test.tsx
```

預期：失敗，因為 UI 尚未實作。

- [ ] **步驟 3：實作 `src/App.tsx`**

```tsx
import { useMemo, useState } from 'react';
import {
  calculateAbsoluteStop,
  calculateFullRiskAmount,
  calculateProfitCushion,
  calculateTargets,
  selectRiskTier,
  sizePosition
} from './domain/positionMath';
import { validateDerivedState, validateInputs } from './domain/validation';

const formatNumber = (value: number) =>
  new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 }).format(value);

const formatPercent = (value: number) =>
  new Intl.NumberFormat('zh-TW', { style: 'percent', maximumFractionDigits: 2 }).format(value);

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
};

function NumberField({ label, value, onChange, step = 1 }: NumberFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        aria-label={label}
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
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
  const [fullRiskMode, setFullRiskMode] = useState<'percent' | 'manual'>('percent');
  const [fullRiskPercent, setFullRiskPercent] = useState(1);
  const [manualFullRiskAmount, setManualFullRiskAmount] = useState(1000);
  const [lotSize, setLotSize] = useState(1);
  const [entryPrice, setEntryPrice] = useState(100);
  const [currentStopPrice, setCurrentStopPrice] = useState(97);

  const result = useMemo(() => {
    const unrealizedProfitDiscountRate = discountPercent / 100;
    const fullPositionExposurePercent = fullPositionPercent / 100;
    const fullRiskAmount = calculateFullRiskAmount({
      totalCapital,
      mode: fullRiskMode,
      fullRiskPercent: fullRiskPercent / 100,
      manualFullRiskAmount
    });
    const availableProfitCushion = calculateProfitCushion({
      realizedPnL,
      unrealizedProfit,
      unrealizedProfitDiscountRate
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

    if (inputErrors.length > 0) {
      return { inputErrors, derivedErrors: [], valid: false as const, fullRiskAmount, availableProfitCushion };
    }

    const absoluteStop = calculateAbsoluteStop({
      totalCapital,
      fullPositionExposurePercent,
      fullRiskAmount,
      entryPrice
    });
    const derivedErrors = validateDerivedState({
      currentStopPrice,
      absoluteStopPrice: absoluteStop.absoluteStopPrice,
      absoluteStopPercent: absoluteStop.absoluteStopPercent
    });
    const tier = selectRiskTier({ availableProfitCushion, fullRiskAmount });

    if (derivedErrors.length > 0) {
      return {
        inputErrors,
        derivedErrors,
        valid: false as const,
        fullRiskAmount,
        availableProfitCushion,
        absoluteStop,
        tier
      };
    }

    const selectedRiskAmount = fullRiskAmount * tier.riskMultiplier;
    const selectedExposureCap = totalCapital * tier.exposurePercent;
    const position = sizePosition({
      totalCapital,
      entryPrice,
      currentStopPrice,
      selectedRiskAmount,
      selectedExposureCap,
      lotSize
    });
    const targets = calculateTargets({ entryPrice, perShareRisk: position.perShareRisk });
    const remainingProfitCushion = availableProfitCushion - position.actualLossAtStop;

    return {
      inputErrors,
      derivedErrors,
      valid: true as const,
      fullRiskAmount,
      availableProfitCushion,
      absoluteStop,
      tier,
      selectedRiskAmount,
      selectedExposureCap,
      position,
      targets,
      remainingProfitCushion
    };
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

  const errors = [...result.inputErrors, ...result.derivedErrors];
  const currentStopPercent = entryPrice > 0 ? (entryPrice - currentStopPrice) / entryPrice : 0;

  return (
    <main className="workstation">
      <header className="topbar">
        <div>
          <p className="eyebrow">Position Sizing Workstation</p>
          <h1>SEPA Position Sizer</h1>
          <p className="subtitle">用滿倉 1R 風險推導絕對停損，驗證本次入場是否足夠低風險。</p>
        </div>
        <div className="status-row">
          <span className={`status ${errors.length === 0 ? 'status-good' : 'status-warn'}`}>
            {errors.length === 0 ? '可交易' : '不建議交易'}
          </span>
          {'absoluteStop' in result && result.absoluteStop ? (
            <span className="status status-info">絕對停損 {formatNumber(result.absoluteStop.absoluteStopPrice)}</span>
          ) : null}
        </div>
      </header>

      <section className="grid">
        <div className="column">
          <section className="panel">
            <h2>帳戶與獲利緩衝</h2>
            <NumberField label="總投資資金" value={totalCapital} onChange={setTotalCapital} />
            <div className="two-col">
              <NumberField label="已實現損益" value={realizedPnL} onChange={setRealizedPnL} />
              <NumberField label="未實現浮盈" value={unrealizedProfit} onChange={setUnrealizedProfit} />
            </div>
            <NumberField label="未實現浮盈折扣率" value={discountPercent} onChange={setDiscountPercent} />
            <Metric label="可用獲利緩衝" value={formatNumber(result.availableProfitCushion)} tone="good" />
          </section>

          <section className="panel">
            <h2>滿倉風險規則</h2>
            <NumberField label="滿倉投入比例" value={fullPositionPercent} onChange={setFullPositionPercent} />
            <div className="segmented" role="group" aria-label="滿倉 1R 風險模式">
              <button className={fullRiskMode === 'percent' ? 'active' : ''} onClick={() => setFullRiskMode('percent')}>比例計算</button>
              <button className={fullRiskMode === 'manual' ? 'active' : ''} onClick={() => setFullRiskMode('manual')}>手動金額</button>
            </div>
            {fullRiskMode === 'percent' ? (
              <NumberField label="1R 風險比例" value={fullRiskPercent} onChange={setFullRiskPercent} step={0.1} />
            ) : (
              <NumberField label="手動 1R 風險金額" value={manualFullRiskAmount} onChange={setManualFullRiskAmount} />
            )}
            <NumberField label="股數單位" value={lotSize} onChange={setLotSize} />
            <Metric label="滿倉 1R 風險金額" value={formatNumber(result.fullRiskAmount)} tone="good" />
          </section>
        </div>

        <div className="column">
          <section className="panel">
            <h2>本次價格</h2>
            <div className="two-col">
              <NumberField label="入場價" value={entryPrice} onChange={setEntryPrice} step={0.01} />
              <NumberField label="本次停損價" value={currentStopPrice} onChange={setCurrentStopPrice} step={0.01} />
            </div>
            <div className="three-col">
              <Metric label="本次停損比例" value={formatPercent(currentStopPercent)} tone="risk" />
              <Metric label="每股風險" value={formatNumber(Math.max(entryPrice - currentStopPrice, 0))} tone="risk" />
              <Metric label="R 倍價格基準" value={formatNumber(Math.max(entryPrice - currentStopPrice, 0))} />
            </div>
          </section>

          <section className="panel">
            <h2>自動推導</h2>
            {'absoluteStop' in result && result.absoluteStop ? (
              <div className="two-col">
                <Metric label="滿倉投入金額" value={formatNumber(result.absoluteStop.fullPositionCapital)} />
                <Metric label="絕對停損比例" value={formatPercent(result.absoluteStop.absoluteStopPercent)} tone="warn" />
                <Metric label="絕對停損價" value={formatNumber(result.absoluteStop.absoluteStopPrice)} tone="warn" />
                <Metric label="入場有效性" value={errors.length === 0 ? '可交易' : '不建議交易'} tone={errors.length === 0 ? 'good' : 'warn'} />
              </div>
            ) : (
              <div className="message message-warn">請先修正輸入錯誤。</div>
            )}
          </section>

          {errors.length > 0 ? (
            <section className="panel panel-warning">
              <h2>不建議交易</h2>
              {errors.map((error) => <p key={error}>{error}</p>)}
            </section>
          ) : null}
        </div>

        <div className="column">
          <section className="panel">
            <h2>倉位結果</h2>
            {result.valid ? (
              <>
                <Metric label="目前可用級別" value={result.tier.label} tone="warn" />
                <Metric label="最終建議股數" value={`${formatNumber(result.position.finalShares)} 股`} />
                <Metric label="風險股數" value={`${formatNumber(result.position.riskBasedShares)} 股`} />
                <Metric label="曝險限制股數" value={`${formatNumber(result.position.exposureCapShares)} 股`} />
                <Metric label="投入金額" value={formatNumber(result.position.positionValue)} />
                <Metric label="投入比例" value={formatPercent(result.position.positionPercent)} />
                <Metric label="實際最大虧損" value={formatNumber(result.position.actualLossAtStop)} tone="risk" />
                <Metric label="停損後緩衝" value={formatNumber(result.remainingProfitCushion)} tone={result.remainingProfitCushion >= 0 ? 'good' : 'risk'} />
                {result.position.cappedByExposure ? (
                  <div className="message message-warn">投入金額已被滿倉投入比例限制。</div>
                ) : null}
              </>
            ) : (
              <div className="message message-warn">停損距離不符合低風險入場，未產生建議股數。</div>
            )}
          </section>

          {result.valid ? (
            <section className="panel">
              <h2>R 倍參考價</h2>
              <div className="three-col">
                <Metric label="1R" value={formatNumber(result.targets.target1R)} />
                <Metric label="2R" value={formatNumber(result.targets.target2R)} />
                <Metric label="3R" value={formatNumber(result.targets.target3R)} />
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **步驟 4：實作 `src/styles.css`**

```css
:root {
  color: #d9ded8;
  background: #181c1c;
  font-family: "Noto Sans TC", "Microsoft JhengHei", system-ui, sans-serif;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: #181c1c;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.workstation {
  min-height: 100vh;
  padding: 18px;
  box-sizing: border-box;
}

.topbar {
  border: 1px solid #596060;
  border-radius: 8px;
  background: #202525;
  padding: 18px 20px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  margin: 0;
  color: #b8b0a2;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  color: #f0f1ec;
  font-size: 26px;
  margin-top: 8px;
}

h2 {
  color: #f0f1ec;
  font-size: 17px;
  margin-bottom: 12px;
}

.subtitle {
  color: #aeb8b0;
  margin-top: 8px;
}

.status-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.status {
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 13px;
  border: 1px solid #374a5a;
}

.status-good {
  color: #bce8c8;
  background: #173a2a;
  border-color: #246044;
}

.status-warn {
  color: #f2d083;
  background: #3a2d12;
  border-color: #6a4d16;
}

.status-info {
  color: #d8ecff;
  background: #182632;
  border-color: #2f6c9c;
}

.grid {
  display: grid;
  grid-template-columns: 360px minmax(420px, 1fr) 360px;
  gap: 14px;
  margin-top: 14px;
}

.column {
  display: grid;
  gap: 14px;
  align-content: start;
}

.panel {
  border: 1px solid #294054;
  border-radius: 8px;
  background: #151919;
  padding: 14px;
}

.panel-warning {
  border-color: #5d4630;
  background: #1e1a16;
  color: #f2d083;
}

.field {
  display: grid;
  gap: 6px;
  color: #b8c0ba;
  font-size: 13px;
  margin-bottom: 10px;
}

.field input {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #314457;
  border-radius: 6px;
  background: #181d1d;
  color: #edf2eb;
  padding: 10px;
}

.field input:focus,
.segmented button:focus {
  outline: 2px solid #4e737f;
  outline-offset: 2px;
}

.two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.three-col {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.metric {
  border: 1px solid #374a5a;
  border-radius: 7px;
  padding: 10px;
  display: grid;
  gap: 5px;
  min-width: 0;
}

.metric span {
  color: #aeb8b0;
  font-size: 12px;
}

.metric strong {
  color: #f0f1ec;
  font-size: 20px;
  overflow-wrap: anywhere;
}

.metric-good {
  border-color: #244f38;
  background: #17201b;
}

.metric-good strong {
  color: #bde7c7;
}

.metric-warn {
  border-color: #5d4630;
  background: #1e1a16;
}

.metric-warn strong {
  color: #f2d083;
}

.metric-risk strong {
  color: #e8a4a4;
}

.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.segmented button {
  border: 1px solid #314457;
  border-radius: 6px;
  background: transparent;
  color: #9fb3b4;
  padding: 10px;
}

.segmented button.active {
  border-color: #2f6c9c;
  background: #182632;
  color: #d8ecff;
}

.message {
  border-radius: 7px;
  padding: 10px;
  font-size: 13px;
  line-height: 1.6;
}

.message-warn {
  color: #f2d083;
  background: #1e1a16;
  border: 1px solid #5d4630;
}

@media (max-width: 1180px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .topbar {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .workstation {
    padding: 10px;
  }

  .two-col,
  .three-col {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 22px;
  }
}
```

- [ ] **步驟 5：執行 UI 測試**

執行：

```powershell
npm test -- src/App.test.tsx
```

預期：`3 passed`。

- [ ] **步驟 6：執行全部測試與建置**

執行：

```powershell
npm test
npm run build
```

預期：全部測試通過，build 成功。

- [ ] **步驟 7：提交**

```powershell
git add src/App.tsx src/App.test.tsx src/styles.css
git commit -m "feat: 建立中文倉位試算工作台"
```

## 任務 5：整理文件、忽略本地輔助檔並啟動開發伺服器

**檔案：**
- 建立：`.gitignore`
- 建立：`README.md`

- [ ] **步驟 1：建立 `.gitignore`**

```gitignore
node_modules/
dist/
coverage/
.superpowers/
.codex/
*.log
```

- [ ] **步驟 2：建立 `README.md`**

```md
# SEPA Position Sizer

SEPA Position Sizer 是一個本地 Web 倉位試算器，用滿倉 1R 風險推導絕對停損，驗證本次停損是否符合低風險入場，並計算建議倉位。

## 功能

- 計算可用獲利緩衝。
- 用滿倉投入比例與滿倉 1R 風險推導絕對停損。
- 驗證本次停損是否超過絕對停損。
- 依獲利緩衝選擇 1/4 倉、半倉或滿倉。
- 計算最終股數、投入金額、最大虧損與 R 倍參考價。

## 開發

```powershell
npm install
npm run dev
```

## 驗證

```powershell
npm test
npm run build
```
```

- [ ] **步驟 3：執行最終驗證**

執行：

```powershell
npm test
npm run build
```

預期：全部測試通過，build 成功。

- [ ] **步驟 4：提交**

```powershell
git add .gitignore README.md
git commit -m "docs: 補充專案使用說明"
```

- [ ] **步驟 5：啟動開發伺服器**

執行：

```powershell
npm run dev -- --host 127.0.0.1
```

預期：終端顯示本機 URL，例如 `http://127.0.0.1:5173/`。

## 自我審查

規格覆蓋：

- 帳戶與獲利緩衝：任務 2、任務 4。
- 滿倉 1R 風險與絕對停損推導：任務 2、任務 4。
- 本次停損有效性阻擋：任務 3、任務 4。
- 倉位級別、曝險上限、最終股數：任務 2、任務 4。
- R 倍參考價：任務 2、任務 4。
- 中文 UI 與低對比工作台風格：任務 4。
- 本地前端、無後端、無交易紀錄：任務 1、任務 4、任務 5。

一致性檢查：

- `fullRiskAmount` 在計算、驗證與 UI 中一致代表滿倉 1R 風險金額。
- `currentStopPrice` 在所有任務中一致代表本次停損價。
- `absoluteStopPrice` 一律由滿倉投入金額與滿倉 1R 風險推導，不由使用者輸入。
- 無股票代號、型態、交易紀錄、圖表或損益表功能。

執行完成標準：

- `npm test` 通過。
- `npm run build` 通過。
- 開發伺服器啟動並提供本機 URL。
- `.codex/` 與 `.superpowers/` 不被提交。
