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
