# Implementation Tasks

## 1. 相依性與環境設定
- [x] 1.1 安裝 `@supabase/supabase-js` 套件
- [x] 1.2 移除 `@libsql/client` 套件
- [x] 1.3 設定 Supabase 環境變數（`SUPABASE_URL`, `SUPABASE_ANON_KEY`）
- [x] 1.4 更新 `.env.example` 說明文件

## 2. 後端 API 遷移
- [x] 2.1 更新 `api/_lib.js` - 建立 Supabase 客戶端工廠函式
- [x] 2.2 更新 `api/companies.js` - 使用 Supabase 查詢公司列表
- [x] 2.3 更新 `api/financial/all.js` - 使用 Supabase 查詢所有財務數據
- [x] 2.4 更新 `api/financial/by-name.js` - 使用 Supabase 查詢單一公司財務資料
- [x] 2.5 實作單位轉換函式（千元 → 百萬元）
- [x] 2.6 更新 `api/financial/bulk.js` - 適配 Supabase
- [x] 2.7 更新 `api/financial/index.js` (POST) - 適配 Supabase
- [x] 2.8 更新 `api/financial/[companyId]/[year]/index.js` (DELETE) - 適配 Supabase
- [x] 2.9 更新 `api/export.js` - 適配 Supabase
- [x] 2.10 更新 `server.js` - 本地開發伺服器適配 Supabase

## 3. 前端調整
- [x] 3.1 圖表數值四捨五入至整數
- [x] 3.2 預設公司選擇為「博弘雲端」
- [x] 3.3 顯示實際資料年數（非固定「5年」）
- [x] 3.4 X 軸年份字體放大至 20px
- [x] 3.5 淨利率區塊年度字體放大至 17px
- [x] 3.6 支援負淨利值顯示（Y 軸動態範圍）

## 4. 圖表對齊與顯示修正
- [x] 4.1 修正 Y 軸數字被截斷（增加 left margin 至 65px）
- [x] 4.2 修正折線圖端點與長條圖中心對齊（使用單一 ResponsiveBar + 自訂 layer）
- [x] 4.3 修正折線圖淨利數值顯示（使用原始 profit 陣列）

## 5. 測試與驗證
- [x] 5.1 本地測試所有 API 端點
- [x] 5.2 驗證數值單位轉換正確性
- [x] 5.3 確認前端顯示單位仍為「百萬元」
- [x] 5.4 測試 API 失敗時的 demo 模式降級
- [x] 5.5 執行 Playwright E2E 測試（對齊驗證通過）

## 6. 部署
- [x] 6.1 在 Vercel Dashboard 設定 Supabase 環境變數
- [x] 6.2 部署至 Vercel 並驗證
