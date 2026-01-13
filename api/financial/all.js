// Vercel Serverless Function: 取得所有公司所有財務數據
import { getTursoClient, handleOptions, successResponse, errorResponse } from '../_lib.js';

export async function GET(request) {
  try {
    const client = getTursoClient();

    // 先取得所有財務數據
    const financialResult = await client.execute(
      'SELECT company_id, year, revenue, profit FROM financial_data'
    );
    // 取得所有公司
    const companyResult = await client.execute(
      'SELECT id, name FROM companies'
    );

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

    return successResponse({ data });
  } catch (error) {
    console.error('取得所有數據失敗:', error);
    return errorResponse('取得所有數據失敗', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
