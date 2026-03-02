<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

多公司經營績效分析平台 — 全端應用，前端使用 React + Vite，後端部署為 Vercel Serverless Functions，資料庫使用 Turso SQLite。

## 常用指令

```bash
# 開發（僅啟動 Vite 前端，後端用 Vercel Functions）
npm run dev:sep

# 本地啟動 Express 後端（開發除錯用）
npm run server

# 建置
npm run build

# 建置（GitHub Pages）
npm run build:github

# 執行 Playwright 測試
npm test

# 單一測試檔案
npx playwright test tests/{filename}

# Lint
npm run lint

# 部署到 Vercel 生產環境
npx vercel --prod
```

## 技術架構

### 前端
- **React 19.2.0** - 主框架
- **Vite 7.2.4** - 建置工具（dev server: `localhost:5173`）
- **React Router 7.10.1** - 客戶端路由
- **@nivo/bar, @nivo/line** - 圖表庫（長條圖 + 折線圖疊層）
- **html2canvas, jsPDF** - PDF 匯出
- **XLSX** - Excel 處理

### 後端（Vercel Serverless Functions）
- **API 目錄**: `api/`
- **Runtime**: Node.js 18.x
- **資料庫**: Turso SQLite（@libsql/client）

### 測試
- **Playwright 1.49.1** - E2E 測試（測試目錄: `./tests`）

## Vercel Serverless Functions 架構

本專案使用 Vercel Serverless Functions 作為後端 API。API 檔案放在 `api/` 目錄下，每個檔案對應一個端點。

### API 檔案結構
```
api/
├── _lib.js                    # 共用函式庫（Turso client、CORS、回應格式）
├── companies.js               # GET /api/companies
├── export.js                  # GET /api/export
└── financial/
    ├── all.js                 # GET /api/financial/all
    ├── by-name.js             # GET /api/financial/by-name?company=xxx
    ├── bulk.js                # POST /api/financial/bulk
    ├── index.js               # POST /api/financial
    └── [companyId]/[year]/    # DELETE /api/financial/:id/:year
        └── index.js
```

### Serverless Function 格式
使用 named exports（GET, POST, DELETE, OPTIONS）：

```javascript
export async function GET(request) {
  // 處理 GET 請求
  const client = getTursoClient();
  const result = await client.execute('SELECT ...');
  return successResponse({ data: result.rows });
}

export async function OPTIONS() {
  return handleOptions(); // CORS 處理
}
```

### 重要限制
- **執行時間**: 最大 10 秒（Hobby）或 60 秒（Pro）
- **冷啟動**: 閒置函數首次請求會有延遲
- **環境變數**: 在 Vercel Dashboard 設定（TURSO_DATABASE_URL, TURSO_AUTH_TOKEN）

## 資料庫結構

### companies 表
| 欄位 | 說明 |
|------|------|
| id | 主鍵 |
| name | 公司名稱 |

### financial_data 表
| 欄位 | 說明 |
|------|------|
| company_id | 外鍵 → companies.id |
| year | 年份 |
| revenue | 營收（百萬元）|
| profit | 稅前淨利（百萬元）|

**約束**: `(company_id, year)` 為 UNIQUE，使用 `INSERT ... ON CONFLICT DO UPDATE` 進行 upsert。

## 前端架構

### 主要組件
```
App.jsx (路由)
└── HomePage.jsx (主要頁面，全局狀態管理)
    ├── CompanySelector.jsx       # 公司選擇下拉選單
    ├── StatCards.jsx              # 營收/淨利/淨利率卡片
    ├── InsightPanel.jsx            # 績效洞察面板
    ├── FinanceChart.jsx            # Nivo 圖表（長條圖+折線圖疊層）
    └── DataManagerTabs.jsx         # 數據管理標籤切換
        ├── DataTable.jsx           # CRUD 表格（排序、搜尋、分頁）
        ├── EditModal.jsx           # 新增/編輯 Modal
        ├── DeleteConfirmDialog.jsx # 刪除確認對話框
        ├── UndoToast.jsx           # 復原通知
        └── ControlPanel.jsx        # 快速新增表單
```

### 狀態管理模式
- **無外部狀態管理庫**（如 Redux）
- **HomePage** 作為容器組件，管理所有狀態並通過 props 傳遞
- 主要狀態：`companies`, `selectedCompany`, `financialData`, `selectedYear`, `allFinancialData`, `activeTab`, `isModalOpen`, `editingRecord`, `deletingRecord`, `recentlyDeleted`

### 錯誤處理與降級
- API 失敗時自動降級到 **demo 模式**
- demo 模式僅顯示「博弘雲端」公司資料
- 確保應用在無後端時仍可運作

### 圖表設計
- 使用 **Nivo 圖表疊層技術**
- 底層：長條圖（營收）+ 上層：折線圖（淨利）
- 支援點擊圖表元素切換年份
- 自訂 Tooltip 顯示詳細財務數據
- 字體：Y-axis 14px, X-axis 16px, 標籤 15px

### PDF 匯出
- 專用的隱藏擷取區域 `#pdf-capture-area`
- 4K 解析度截圖（`width: 794px`）
- 動態填入內容：標題、績效洞察、圖表圖片、淨利率

## 開發配置

### 環境變數
在 Vercel Dashboard 或本地 `.env` 設定：
```
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### Vite Proxy（僅本地開發）
開發時 API 請求自動代理到後端：
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```
**注意**: 生產環境使用 Vercel Functions，無需 proxy。

### Playwright 測試
- 測試目錄：`./tests`
- 自動啟動 dev server
- CI 環境重試 2 次

## 部署

### Vercel 部署
```bash
# 部署到生產環境
npx vercel --prod

# 部署到預覽環境
npx vercel
```

生產環境：https://bpap.vercel.app
