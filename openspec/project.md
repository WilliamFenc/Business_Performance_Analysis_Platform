# Project Context

## Purpose
多公司經營績效分析平台（Business Performance Analysis Platform, BPAP）是一個全端 Web 應用程式，用於分析與比較多家公司的財務績效指標。主要功能包括：
- 多家公司財務數據管理（營收、稅前淨利、淨利率）
- 互動式圖表視覺化（長條圖 + 折線圖疊層）
- PDF/Excel 匯出功能
- 績效洞察分析

## Tech Stack

### 前端
- **React 19.2.0** - 主框架
- **Vite 7.2.4** - 建置工具與開發伺服器
- **React Router 7.10.1** - 客戶端路由
- **@nivo/bar, @nivo/line 0.87.0** - 圖表庫
- **html2canvas, jsPDF** - PDF 匯出
- **XLSX** - Excel 處理

### 後端
- **Vercel Serverless Functions** - 無伺服器後端
- **Node.js 18.x** - 執行環境
- **Express 4.22.1** - 本地開發用伺服器
- **CORS** - 跨來源資源共用

### 資料庫
- **Turso SQLite** - 託管 SQLite 資料庫 (@libsql/client)

### 測試
- **Playwright 1.49.1** - E2E 測試框架

### 開發工具
- **ESLint 9.18.0** - 程式碼檢查
- **uv** - Python 套件管理（如需 Python 開發）

## Project Conventions

### Code Style
- **語言偏好**: 繁體中文用於註解、說明與文件；程式碼保留原始英文
- **命名慣例**:
  - 組件: PascalCase (如 `HomePage.jsx`, `CompanySelector.jsx`)
  - 函式/變數: camelCase
  - 常數: UPPER_SNAKE_CASE
- **React 慣例**:
  - 函式組件 + Hooks
  - Props 使用解構賦值
  - 狀態管理：無外部狀態庫，以容器組件管理狀態並傳遞

### Architecture Patterns
- **前端架構**: 單頁應用 (SPA)，以 HomePage 作為主容器組件管理全域狀態
- **後端架構**: Serverless Functions，每個 API 端點對應 `api/` 目錄下的獨立檔案
- **資料庫**: SQLite with Turso，使用 `INSERT ... ON CONFLICT DO UPDATE` 實現 upsert
- **錯誤處理**: API 失敗時自動降級至 demo 模式（僅顯示「博弘雲端」資料）
- **圖表設計**: Nivo 圖表疊層技術（底層長條圖 + 上層折線圖）

### Testing Strategy
- **E2E 測試**: Playwright 測試位於 `./tests` 目錄
- **測試指令**: `npm test`
- **CI 環境**: 自動重試 2 次
- **測試涵蓋**: 使用者流程、UI 互動、資料管理操作

### Git Workflow
- **主分支**: `master`
- **分支策略**: 功能分支開發後合併至 master
- **Commit 訊息**: 繁體中文，格式：`[type]: description`
  - `feat:` 新功能
  - `fix:` 錯誤修復
  - `docs:` 文件更新
  - `refactor:` 重構
  - `test:` 測試相關
- **PR 標題**: 繁體中文，簡潔描述變更內容

### Python 開發規範（如適用）
- **套件管理**: 必須使用 `uv` 與 `.venv` 建立虛擬環境
- **嚴禁**: 直接使用 `pip` 或全域 `base` 環境

## Domain Context

### 財務數據模型
- **營收**: 公司年度營業收入（單位：百萬元）
- **稅前淨利**: 公司年度稅前淨利（單位：百萬元）
- **淨利率**: (稅前淨利 / 營收) × 100%，以百分比顯示

### 公司資料結構
```
companies (id, name)
financial_data (company_id, year, revenue, profit)
```
約束：`(company_id, year)` 為 UNIQUE

## Important Constraints

### Vercel Serverless 限制
- **執行時間**: 最大 10 秒（Hobby）或 60 秒（Pro）
- **冷啟動**: 閒置函數首次請求會有延遲
- **環境變數**: 需在 Vercel Dashboard 設定

### 部署環境
- **生產環境**: https://bpap.vercel.app
- **本地開發**: Vite dev server (localhost:5173) + Express (localhost:3000)
- **GitHub Pages**: 使用 `--base=/bpap/` 建置

## External Dependencies

### Turso SQLite
- **環境變數**:
  - `TURSO_DATABASE_URL`: 資料庫連線字串
  - `TURSO_AUTH_TOKEN`: 認証權杖
- **用途**: 財務數據儲存與查詢

### Vercel
- **用途**: Serverless Functions 託管與前端部署
- **配置**: `vercel.json` 與 `api/` 目錄結構
