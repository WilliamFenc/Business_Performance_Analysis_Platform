// Vercel Serverless Function: 新增/更新財務資料
import { getTursoClient, handleOptions, successResponse, errorResponse } from '../_lib.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { company, year, revenue, profit } = body;

    if (!company || !year || revenue === undefined || profit === undefined) {
      return errorResponse('缺少必要欄位', 400);
    }

    const client = getTursoClient();

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
      return errorResponse('無法建立公司', 500);
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

    return successResponse({
      success: true,
      company,
      year,
      revenue,
      profit,
    });
  } catch (error) {
    console.error('新增/更新財務資料失敗:', error);
    return errorResponse('新增/更新財務資料失敗', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
