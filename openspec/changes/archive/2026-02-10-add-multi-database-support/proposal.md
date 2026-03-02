# Change: 支援多環境資料庫部署

## Why

目前專案同時部署於外部 Vercel（開發機）與企業內部 Jenkins（正式機），兩者都連接 Supabase 雲端資料庫。為了符合企業資安政策，正式機需要改用企業內部的 SQL Server 資料庫。

現有問題：
- 企業內部無法使用雲端資料庫
- 需要支援 Dev/Prod 兩種環境使用不同資料庫

## What Changes

- **BREAKING** 新增資料庫抽象層（Database Adapter Pattern），讓 API 端點可根據環境變數自動切換資料庫
- 新增 SQL Server Adapter，使用 `mssql` 套件連接企業內部 SQL Server
- 保留 Supabase Adapter，維持 Vercel 部署相容性
- 修改所有 API 端點使用新的 Repository 介面
- 更新 Dockerfile 以包含資料庫抽象層
- 更新 Jenkinsfile 以支援 Prod 環境配置
- **暫時功能** 新增資料庫狀態顯示元件（UAT 後移除）

## 資料庫狀態顯示（UAT 暫時功能）

為了 UAT 測試驗證，在網頁右下角顯示目前後端連線的資料庫狀態：
- **Vercel (Dev)**: 顯示 `🟢 DB: Supabase`
- **企業內 (Prod)**: 顯示 `🟢 DB: SQL Server`
- **連線失敗**: 顯示 `🔴 DB: 連線失敗`

此功能在 UAT 完成後會被移除。

## Impact

- 影響 spec: `data-layer` (新增 SQL Server 支援)
- 影響程式碼:
  - `api/_lib.js` - 新增 `getDatabaseAdapter()` 函式
  - `api/database/` - 新增資料庫抽象層目錄
  - `api/companies.js` - 使用 Repository
  - `api/financial/all.js` - 使用 Repository
  - `api/financial/by-name.js` - 使用 Repository
  - `api/financial-basics/index.js` - 使用 Repository
  - `api/pl-income/index.js` - 使用 Repository
  - `server.js` - 本地開發支援 Repository
  - `Dockerfile` - 複製 database 目錄
  - `Jenkinsfile` - 使用 Prod 環境 Secret
  - `.env.example` - 新增 SQL Server 變數
  - `package.json` - 新增 `mssql` 依賴

- 部署流程影響:
  - **Vercel**: 無影響，繼續使用 Supabase
  - **Jenkins**: 需要上傳新的 `.env` 檔案到 Jenkins Secret

## Migration Path

1. 安裝 `mssql` 套件
2. 建立資料庫抽象層
3. 遷移 API 端點（不影響前端）
4. 更新 Dockerfile 和 Jenkinsfile
5. 在 Jenkins 建立新的 Secret File (`bussiness-analyze-env-prod`)
6. 部署驗證

## 環境變數自動判斷機制

系統根據 `DATABASE_TYPE` 環境變數自動判斷使用哪個資料庫：

| 部署環境 | DATABASE_TYPE | 資料庫 | 環境變數來源 |
|---------|--------------|--------|-------------|
| Vercel | `supabase` (或未設定) | Supabase | Vercel Dashboard 設定 |
| Jenkins Docker | `sqlserver` | SQL Server | Jenkins Secret File (.env) |

**判斷流程**：
1. 程式啟動時讀取 `DATABASE_TYPE` 環境變數
2. 若為 `sqlserver` → 使用 SQL Server Adapter
3. 若為 `supabase` 或未設定 → 使用 Supabase Adapter (預設)

## Jenkins 企業內部部署步驟

### 您需要做的動作：

1. **上傳 .env 檔案到 Jenkins Secret**
   - 在 Jenkins 建立 `bussiness-analyze-env-prod` Secret File
   - 內容如下：

```bash
DATABASE_TYPE=sqlserver
SQLSERVER_SERVER=10.2.15.137
SQLSERVER_DATABASE=agent_finance
SQLSERVER_USER=ga_2_1
SQLSERVER_PASSWORD=QAZwsx!@2022
SQLSERVER_PORT=1433
SQLSERVER_TIMEOUT=30000
```

2. **按下 Jenkins Build 按鈕**
   - Jenkins 會自動從 GitHub 拉取最新程式碼
   - 根據您上傳的 `.env` 建置 Docker 映像
   - 部署到企業內部環境

### 需要請技術人員協助的動作（一次性設定）：

1. **確認 Jenkins 已安裝 Docker**
   - Jenkins 需要能夠執行 Docker 命令

2. **確認 Jenkinsfile 已配置 Secret File 讀取**
   - 確認 Jenkinsfile 中的 `withCredentials` 設定正確

3. **確認企業內部網路可連接 SQL Server**
   - Jenkins Server 需要能存取 `10.2.15.137:1433`
