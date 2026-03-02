# Implementation Tasks

## 1. 基礎建設
- [x] 1.1 安裝 `mssql` 套件：`npm install mssql`
- [x] 1.2 建立資料庫抽象層目錄：`api/database/` 和 `api/database/adapters/`
- [x] 1.3 更新 `.env.example` 加入 SQL Server 環境變數

## 2. 實作資料庫抽象層
- [x] 2.1 建立 `api/database/repository.js` - Repository 介面與工廠函式
- [x] 2.2 建立 `api/database/adapters/supabase-adapter.js` - Supabase 實作
- [x] 2.3 建立 `api/database/adapters/sqlserver-adapter.js` - SQL Server 實作
- [x] 2.4 更新 `api/_lib.js` - 新增 `getDatabaseAdapter()` 匯出

## 3. 遷移 API 端點
- [x] 3.1 修改 `api/companies.js` 使用 Repository
- [x] 3.2 修改 `api/financial/all.js` 使用 Repository
- [x] 3.3 修改 `api/financial/by-name.js` 使用 Repository
- [x] 3.4 修改 `api/financial-basics/index.js` 使用 Repository
- [x] 3.5 修改 `api/pl-income/index.js` 使用 Repository
- [x] 3.6 修改 `server.js` 本地開發伺服器使用 Repository

## 4. 資料庫狀態顯示功能（UAT 暫時功能）
- [x] 4.1 建立 `api/db-status.js` - 資料庫狀態 API 端點
- [x] 4.2 在 `server.js` 新增資料庫狀態 API 端點
- [x] 4.3 建立 `src/components/DatabaseStatusIndicator.jsx` - 前端顯示元件
- [x] 4.4 在 `src/pages/HomePage.jsx` 加入資料庫狀態顯示元件

## 5. 更新部署配置
- [x] 5.1 修改 `Dockerfile` - 在 production stage 複製 database 目錄
- [x] 5.2 修改 `Jenkinsfile` - 使用 Prod 環境 Secret File

## 6. Jenkins 設定（由使用者執行）

在 Jenkins 建立 Secret File `bussiness-analyze-env-prod`，內容如下：

```bash
# 資料庫型別設定
DATABASE_TYPE=sqlserver

# SQL Server 連線設定
SQLSERVER_SERVER=10.2.15.137
SQLSERVER_DATABASE=agent_finance
SQLSERVER_USER=ga_2_1
SQLSERVER_PASSWORD=QAZwsx!@2022
SQLSERVER_PORT=1433

# 連線逾時設定（毫秒）
SQLSERVER_TIMEOUT=30000

# 選擇性：保留 Supabase 設定以備用
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
```

## 7. 驗證測試（待執行）
- [ ] 7.1 本地測試 Supabase 模式：`DATABASE_TYPE=supabase npm run server`
- [ ] 7.2 本地測試 SQL Server 模式（需要企業內網環境）
- [ ] 7.3 Vercel 部署驗證（確認 Supabase 仍正常）
- [ ] 7.4 Jenkins 部署驗證（確認 SQL Server 連線成功）
- [ ] 7.5 確認 Vercel 顯示 `🟢 DB: Supabase`
- [ ] 7.6 確認 Jenkins 顯示 `🟢 DB: SQL Server`

## 8. UAT 完成後清理
- [x] 8.1 從 `src/pages/HomePage.jsx` 移除資料庫狀態顯示元件
- [ ] 8.2 移除 `src/components/DatabaseStatusIndicator.jsx`（組件檔案保留備用）
- [ ] 8.3 移除 `api/db-status.js`（API 端點保留備用）
- [ ] 8.4 從 `server.js` 移除資料庫狀態 API 端點
