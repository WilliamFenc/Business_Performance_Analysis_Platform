# Design: 多環境資料庫支援

## Context

目前系統使用 Supabase 作為唯一資料庫來源，所有 API 端點直接呼叫 Supabase SDK。為了支援企業內部 SQL Server，需要建立一個資料庫抽象層。

### 約束條件
- Vercel 部署流程不能有任何改變
- 前端程式碼不能修改
- API 端點輸入輸出格式必須保持一致
- SQL Server 資料表結構與 Supabase 完全相同

### SQL Server 連線資訊
根據 dbhub mcp server 設定：
- Server: `10.2.15.137`
- Database: `agent_finance`
- User: `ga_2_1`
- Password: `QAZwsx!@2022`
- Port: `1433`

## Goals / Non-Goals

### Goals
- 支援根據環境變數自動切換 Supabase / SQL Server
- 維持 API 行為一致（相同的輸入輸出格式）
- 支援完整 CRUD 操作
- 連線失敗時降級到 demo 模式

### Non-Goals
- 統一兩個資料庫的資料（資料同步不在本範圍）
- 支援其他資料庫型別（MySQL, PostgreSQL 等）
- 動態切換資料庫（每次啟動時決定，不支援 runtime 切換）

## Decisions

### 1. Adapter Pattern

採用 Adapter Pattern 將資料庫操作抽象化：

```
API → Repository → Adapter (Supabase/SQLServer)
```

**理由**：
- 現有 API 端點只需修改匯入來源
- 新增資料庫只需新增 Adapter
- 易於測試

**替代方案**：直接在每個 API 端點判斷環境變數
- 缺點：程式碼重複，難以維護

### 2. 套件選擇：mssql

使用 `mssql` 套件連接 SQL Server。

**理由**：
- 成熟的 Node.js SQL Server 驅動程式
- 支援 Promise 和 async/await
- 內建連線池管理
- 良好的文件

### 3. 環境變數驅動

使用 `DATABASE_TYPE` 環境變數決定使用哪個資料庫：

| 環境 | DATABASE_TYPE | 資料庫 |
|------|--------------|--------|
| Vercel (Dev) | `supabase` | Supabase PostgreSQL |
| Jenkins (Prod) | `sqlserver` | SQL Server |

**理由**：
- 簡單明確
- 不需要修改程式碼即可切換
- 與現有部署流程相容

### 4. UPSERT 實作方式

- **Supabase**: 使用 `.upsert()` with `onConflict`
- **SQL Server**: 使用 `MERGE` 語法

## Architecture

### 檔案結構

```
api/
├── _lib.js                           # 現有共用函式 + getDatabaseAdapter()
├── database/
│   ├── repository.js                 # Repository 介面與工廠函式
│   └── adapters/
│       ├── supabase-adapter.js       # Supabase 實作
│       └── sqlserver-adapter.js      # SQL Server 實作
├── companies.js                      # 修改：使用 repository
└── ...
```

### Repository 介面

```javascript
// 取得資料庫適配器
export async function getDatabaseAdapter()

// BaseRepository 類別
class BaseRepository {
  async getCompanies()
  async getFinancialBasics(filters)
  async upsertFinancialBasics(data)
  async updateFinancialBasics(taxId, year, data)
  async deleteFinancialBasics(taxId, year)
  async getPlIncome(filters)
  async upsertPlIncome(data)
  async updatePlIncome(taxId, year, data)
  async deletePlIncome(taxId, year)
  async getFinancialDataByCompany(company)
  async getAllFinancialDataWithCompany()
}

// 工廠函式
export async function createRepository()
```

### SQL 語法對照

| 操作 | Supabase SDK | SQL Server (mssql) |
|------|-------------|-------------------|
| 查詢 | `.select('*').eq('col', val)` | `SELECT * WHERE col = @val` |
| UPSERT | `.upsert(data, { onConflict: 'col1,col2' })` | `MERGE INTO ...` |
| JOIN | `.select('*, related(*)')` | `INNER JOIN ...` |
| 排序 | `.order('col', { ascending: false })` | `ORDER BY col DESC` |

## Risks / Trade-offs

### 風險 1: SQL Server 連線失敗
**影響**: 企業內部部署無法存取資料
**緩解**:
- 實作連線重試機制
- 連線失敗時降級到 demo 模式
- 提供清楚的錯誤訊息

### 風險 2: 資料型別不一致
**影響**: 查詢結果錯誤
**緩解**:
- 建立完整的欄位型別對應表
- 充分測試所有 API 端點

### 風險 3: 數值單位轉換
**影響**: 前端顯示錯誤的數值
**緩解**:
- Supabase 資料單位是「千元」，需要除以 1000 轉換為「百萬元」
- SQL Server 資料已完全複製，需要確認單位是否一致
- 在 Adapter 層統一處理單位轉換

### Trade-off: 額外抽象層
**缺點**: 增加程式碼複雜度
**優點**: 支援多資料庫，易於維護

## Migration Plan

### 階段 1: 準備（不影響現有功能）
1. 安裝 `mssql` 套件
2. 建立資料庫抽象層目錄結構
3. 實作 Supabase Adapter（將現有邏輯遷移）
4. 實作 SQL Server Adapter
5. 更新 `.env.example`

### 階段 2: 遷移
1. 修改 API 端點使用 Repository（一次一個檔案）
2. 修改 `server.js` 本地開發伺服器
3. 更新 Dockerfile
4. 更新 Jenkinsfile

### 階段 3: 部署
1. 測試 Vercel 部署（確保 Supabase 正常）
2. 在 Jenkins 建立 Prod 環境 Secret File
3. 測試 Jenkins 部署（SQL Server）

### Rollback
如果 SQL Server 連線有問題：
1. 將 Jenkins Secret 的 `DATABASE_TYPE` 改回 `supabase`
2. 重新部署即可

## Open Questions

1. **SQL Server 資料單位是否與 Supabase 相同？**
   - 假設：SQL Server 資料已完全複製，單位應該相同
   - 驗證：部署後需要確認數值顯示正確

2. **SQL Server 是否已建立所有資料表？**
   - 假設：已建立 companies, pl_income_basics, financial_basics 三個表
   - 驗證：部署後測試所有 CRUD 操作
