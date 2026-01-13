// Vercel Serverless Function: 批量匯入財務資料
import { getTursoClient, handleOptions, successResponse, errorResponse } from '../../_lib.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!Array.isArray(data) || data.length === 0) {
      return errorResponse('資料格式錯誤：需要陣列', 400);
    }

    const client = getTursoClient();
    const results = [];

    for (const item of data) {
      const { company, year, revenue, profit } = item;

      if (!company || !year || revenue === undefined || profit === undefined) {
        results.push({ company, year, success: false, error: '缺少必要欄位' });
        continue;
      }

      try {
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
          results.push({ company, year, success: false, error: '無法建立公司' });
          continue;
        }

        const companyId = companyResult.rows[0].id;

        // 新增或更新財務數據
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

        results.push({ company, year, success: true });
      } catch (err) {
        console.error(`處理 ${company} ${year} 失敗:`, err);
        results.push({ company, year, success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return successResponse({
      message: `批量匯入完成：成功 ${successCount} 筆，失敗 ${failCount} 筆`,
      results,
    });
  } catch (error) {
    console.error('批量匯入失敗:', error);
    return errorResponse('批量匯入失敗', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
