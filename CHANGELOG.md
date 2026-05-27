# Changelog

本專案依照版本記錄主要功能、修正與部署變更。

## 0.1.0 - 2026-05-28

### Added

- 建立 SEPA 風格倉位試算器 Web UI。
- 支援輸入總投資資金、已實現損益、未實現浮盈與浮盈折扣百分比。
- 支援設定滿倉投入百分比與滿倉 1R 風險。
- 支援依入場價與本次停損價推導每股風險、建議股數、投入金額與最大虧損。
- 支援絕對停損價檢查，用來判斷型態停損是否符合低風險入場條件。
- 支援風險級別顯示，用 1/4 倉、半倉、滿倉表示本次允許投入比例。
- 支援 1R、2R、3R 參考止盈價。
- 支援設定自動保存到瀏覽器 localStorage。
- 支援重設設定按鈕，快速回到預設參數。
- 新增 GitHub Pages 部署 workflow。
- README 補齊產品介紹、使用流程、部署方式與風險聲明。

### Changed

- 將測試工具鏈升級到 `vitest@4.1.7`，移除依賴稽核中的已知弱點。
- Vite 設定加上 GitHub Pages 專案路徑 `/sepa-position-sizer/`。

### Verified

- 線上部署網址已確認可正常使用：
  `https://magicalwater.github.io/sepa-position-sizer/`
