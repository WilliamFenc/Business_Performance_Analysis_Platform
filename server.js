// 本地開發 API Server
// 使用: node server.js
import express from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import * as XLSX from 'xlsx';

// --- ADDED: Imports for path handling in ES Modules ---
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// --- ADDED: Recreate __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 取得 Turso 設定
const TURSO_URL = process.env.TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('錯誤: 請設定 TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN 環境變數');
  process.exit(1);
}

// 建立 Turso 客戶端
const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

// API: 取得特定公司財務資料 (使用 query string 避免中文編碼問題)
app.get('/api/financial/by-name', async (req, res) => {
  try {
    const company = req.query.company;
    if (!company) {
      return res.status(400).json({ error: '缺少 company 參數' });
    }

    const result = await client.execute({
      sql: `
        SELECT fd.year, fd.revenue, fd.profit
        FROM financial_data fd
        JOIN companies c ON c.id = fd.company_id
        WHERE c.name = ?
        ORDER BY fd.year
      `,
      args: [company],
    });

    const labels = [];
    const revenue = [];
    const profit = [];

    result.rows.forEach(row => {
      labels.push(String(row.year));
      revenue.push(row.revenue);
      profit.push(row.profit);
    });

    res.json({
      company: company,
      data: { labels, revenue, profit },
    });
  } catch (error) {
    console.error('取得財務資料失敗:', error);
    res.status(500).json({ error: '取得財務資料失敗', message: error.message });
  }
});

// API: 取得所有公司
app.get('/api/companies', async (req, res) => {
  try {
    const result = await client.execute('SELECT id, name FROM companies ORDER BY name');
    const companies = result.rows.map(row => ({
      id: row.id,
      name: row.name,
    }));
    res.json({ companies });
  } catch (error) {
    console.error('取得公司列表失敗:', error);
    res.status(500).json({ error: '取得公司列表失敗', message: error.message });
  }
});

// API: 取得所有公司所有財務數據
app.get('/api/financial/all', async (req, res) => {
  try {
    // 先取得所有財務數據
    const financialResult = await client.execute('SELECT company_id, year, revenue, profit FROM financial_data');
    // 取得所有公司
    const companyResult = await client.execute('SELECT id, name FROM companies');

    // 建立公司名稱對照表
    const companyMap = {};
    companyResult.rows.forEach(row => {
      companyMap[row.id] = row.name;
    });

    // 合併數據
    const data = financialResult.rows.map(row => ({
      company_id: row.company_id,
      company: companyMap[row.company_id] || '未知公司',
      year: row.year,
      revenue: row.revenue,
      profit: row.profit,
    })).sort((a, b) => a.company.localeCompare(b.company) || b.year - a.year);

    res.json({ data });
  } catch (error) {
    console.error('取得所有數據失敗:', error);
    res.status(500).json({ error: '取得所有數據失敗', message: error.message });
  }
});

// API: 取得特定公司財務資料 (使用 query string 避免中文編碼問題)
app.get('/api/financial/:companyName', async (req, res) => {
  try {
    let companyName;
    try {
      companyName = decodeURIComponent(req.params.companyName);
    } catch {
      // 如果 decode 失敗，使用原始值
      companyName = req.params.companyName;
    }

    const result = await client.execute({
      sql: `
        SELECT fd.year, fd.revenue, fd.profit
        FROM financial_data fd
        JOIN companies c ON c.id = fd.company_id
        WHERE c.name = ?
        ORDER BY fd.year
      `,
      args: [companyName],
    });

    const labels = [];
    const revenue = [];
    const profit = [];

    result.rows.forEach(row => {
      labels.push(String(row.year));
      revenue.push(row.revenue);
      profit.push(row.profit);
    });

    res.json({
      company: companyName,
      data: { labels, revenue, profit },
    });
  } catch (error) {
    console.error('取得財務資料失敗:', error);
    res.status(500).json({ error: '取得財務資料失敗', message: error.message });
  }
});

// API: 新增/更新財務資料
app.post('/api/financial', async (req, res) => {
  try {
    const { company, year, revenue, profit } = req.body;

    if (!company || !year || revenue === undefined || profit === undefined) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    // 確保公司存在
    await client.execute({
      sql: 'INSERT OR IGNORE INTO companies (name) VALUES (?)',
      args: [company],
    });

    // 取得公司 ID
    const companyResult = await client.execute({
      sql: 'SELECT id FROM companies WHERE name = ?',
      args: [company],
    });

    if (companyResult.rows.length === 0) {
      return res.status(500).json({ error: '無法建立公司' });
    }

    const companyId = companyResult.rows[0].id;

    // 新增或更新財務資料
    await client.execute({
      sql: `
        INSERT INTO financial_data (company_id, year, revenue, profit)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(company_id, year) DO UPDATE SET
          revenue = excluded.revenue,
          profit = excluded.profit
      `,
      args: [companyId, year, revenue, profit],
    });

    res.json({ success: true });
  } catch (error) {
    console.error('更新財務資料失敗:', error);
    res.status(500).json({ error: '更新財務資料失敗', message: error.message });
  }
});

// API: 批量匯入
app.post('/api/financial/bulk', async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: '資料格式錯誤' });
    }

    const newCompanies = [];
    let importCount = 0;

    for (const item of data) {
      const { company, year, revenue, profit } = item;

      if (!company || !year || revenue === undefined || profit === undefined) {
        continue;
      }

      // 確保公司存在
      const existingCompany = await client.execute({
        sql: 'SELECT id FROM companies WHERE name = ?',
        args: [company],
      });

      let companyId;
      if (existingCompany.rows.length === 0) {
        await client.execute({
          sql: 'INSERT INTO companies (name) VALUES (?)',
          args: [company],
        });
        const newCompanyResult = await client.execute({
          sql: 'SELECT id FROM companies WHERE name = ?',
          args: [company],
        });
        companyId = newCompanyResult.rows[0].id;
        newCompanies.push(company);
      } else {
        companyId = existingCompany.rows[0].id;
      }

      // 新增或更新財務資料
      await client.execute({
        sql: `
          INSERT INTO financial_data (company_id, year, revenue, profit)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(company_id, year) DO UPDATE SET
            revenue = excluded.revenue,
            profit = excluded.profit
        `,
        args: [companyId, year, revenue, profit],
      });

      importCount++;
    }

    res.json({
      success: true,
      imported: importCount,
      companies: newCompanies,
    });
  } catch (error) {
    console.error('批量匯入失敗:', error);
    res.status(500).json({ error: '批量匯入失敗', message: error.message });
  }
});

// API: 匯出 Excel
app.get('/api/export', async (req, res) => {
  try {
    const result = await client.execute({
      sql: `
        SELECT c.name as company, fd.year, fd.revenue, fd.profit
        FROM financial_data fd
        JOIN companies c ON c.id = fd.company_id
        ORDER BY c.name, fd.year
      `,
    });

    const exportData = [['公司名稱', '年份', '營收', '稅前淨利']];
    result.rows.forEach(row => {
      exportData.push([row.company, row.year, row.revenue, row.profit]);
    });

    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '所有公司績效數據');

    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="多公司績效數據庫_${new Date().toISOString().slice(0, 10)}.xlsx"`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('匯出失敗:', error);
    res.status(500).json({ error: '匯出失敗', message: error.message });
  }
});

// API: 刪除特定財務數據
app.delete('/api/financial/:companyId/:year', async (req, res) => {
  try {
    const { companyId, year } = req.params;

    // 先取得公司名稱
    const companyResult = await client.execute({
      sql: 'SELECT name FROM companies WHERE id = ?',
      args: [companyId],
    });

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: '公司不存在' });
    }

    const companyName = companyResult.rows[0].name;

    // 刪除財務數據
    await client.execute({
      sql: 'DELETE FROM financial_data WHERE company_id = ? AND year = ?',
      args: [companyId, year],
    });

    res.json({ success: true, company: companyName });
  } catch (error) {
    console.error('刪除失敗:', error);
    res.status(500).json({ error: '刪除失敗', message: error.message });
  }
});

// API: 批量刪除
app.delete('/api/financial/bulk', async (req, res) => {
  try {
    const { records } = req.body; // [{ company_id, year }, ...]

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: '資料格式錯誤' });
    }

    let deletedCount = 0;

    for (const record of records) {
      const { company_id, year } = record;

      if (!company_id || !year) {
        continue;
      }

      await client.execute({
        sql: 'DELETE FROM financial_data WHERE company_id = ? AND year = ?',
        args: [company_id, year],
      });

      deletedCount++;
    }

    res.json({ success: true, deleted: deletedCount });
  } catch (error) {
    console.error('批量刪除失敗:', error);
    res.status(500).json({ error: '批量刪除失敗', message: error.message });
  }
});

// --- ADDED: Serve Static Files ---
// Serve the files generated by 'vite build' from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

// --- ADDED: Catch-All Route for React Router ---
// Any request that doesn't match an API route above gets sent to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`\n🚀 本地 API Server 運行在 http://localhost:${PORT}`);
  console.log(`📊 Turso 資料庫: ${TURSO_URL?.split('///')[0]}///...\n`);
});
