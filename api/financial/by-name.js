// Vercel Serverless Function: 取得特定公司的財務資料 (使用 query string)
import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  // 處理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { company } = req.query;

  if (req.method === 'GET') {
    try {
      const tursoUrl = process.env.TURSO_DATABASE_URL;
      const tursoToken = process.env.TURSO_AUTH_TOKEN;

      if (!tursoUrl || !tursoToken) {
        return res.status(500).json({ error: '資料庫設定不完整' });
      }

      if (!company) {
        return res.status(400).json({ error: '缺少 company 參數' });
      }

      const client = createClient({
        url: tursoUrl,
        authToken: tursoToken,
      });

      // 查詢公司財務資料
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

      res.status(200).json({
        company: company,
        data: { labels, revenue, profit },
      });
    } catch (error) {
      console.error('取得財務資料失敗:', error);
      res.status(500).json({ error: '取得財務資料失敗', message: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
