// Vercel Serverless Function: 取得所有公司
import { createRepository, handleOptions, successResponse, errorResponse } from './_lib.js';

export async function GET(request) {
  try {
    const repo = await createRepository();
    const companies = await repo.getCompanies();

    return successResponse({ companies });
  } catch (error) {
    console.error('取得公司列表失敗:', error);

    // 降級到 demo 模式
    const demoCompanies = [
      { id: 1, name: '博弘雲端' }
    ];
    return successResponse({ companies: demoCompanies });
  }
}

export async function OPTIONS() {
  return handleOptions();
}
