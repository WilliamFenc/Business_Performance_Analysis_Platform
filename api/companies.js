// Vercel Serverless Function: 取得所有公司
import { getTursoClient, handleOptions, successResponse, errorResponse } from './_lib.js';

export async function GET(request) {
  try {
    const client = getTursoClient();
    const result = await client.execute('SELECT id, name FROM companies ORDER BY name');

    const companies = result.rows.map(row => ({
      id: row.id,
      name: row.name,
    }));

    return successResponse({ companies });
  } catch (error) {
    console.error('取得公司列表失敗:', error);
    return errorResponse('取得公司列表失敗', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
