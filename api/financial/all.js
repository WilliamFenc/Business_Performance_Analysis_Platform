// Vercel Serverless Function: 取得所有公司所有財務數據
import { createRepository, handleOptions, successResponse } from '../_lib.js';

export async function GET(request) {
  try {
    const repo = await createRepository();
    const result = await repo.getAllFinancialDataWithCompany();

    return successResponse({ data: result });
  } catch (error) {
    console.error('取得所有數據失敗:', error);

    // 降級到 demo 模式
    const demoData = [
      { company_id: 1, company: '博弘雲端', year: 2023, revenue: 1000, profit: 100 }
    ];
    return successResponse({ data: demoData });
  }
}

export async function OPTIONS() {
  return handleOptions();
}
