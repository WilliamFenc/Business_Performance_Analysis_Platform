// Vercel Serverless Function: 取得特定公司財務資料 (使用 query string)
import { createRepository, handleOptions, successResponse, errorResponse } from '../_lib.js';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const company = url.searchParams.get('company');

    if (!company) {
      return errorResponse('缺少 company 參數', 400);
    }

    const repo = await createRepository();
    const result = await repo.getFinancialDataByCompany(company);

    return successResponse(result);
  } catch (error) {
    console.error('取得財務資料失敗:', error);

    // 降級到 demo 模式
    return successResponse({
      company: '博弘雲端',
      data: {
        labels: ['2022', '2023'],
        revenue: [800, 1000],
        profit: [80, 100],
      }
    });
  }
}

export async function OPTIONS() {
  return handleOptions();
}
