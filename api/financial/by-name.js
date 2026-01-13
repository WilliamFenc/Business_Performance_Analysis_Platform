// Vercel Serverless Function: 取得特定公司財務資料 (使用 query string)
import { getTursoClient, handleOptions, successResponse, errorResponse } from '../_lib.js';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const company = url.searchParams.get('company');

    if (!company) {
      return errorResponse('缺少 company 參數', 400);
    }

    const client = getTursoClient();
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

    return successResponse({
      company: company,
      data: { labels, revenue, profit },
    });
  } catch (error) {
    console.error('取得財務資料失敗:', error);
    return errorResponse('取得財務資料失敗', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
