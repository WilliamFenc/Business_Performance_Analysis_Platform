// Vercel Serverless Function: 刪除特定財務數據
// 路由: /api/financial/:companyId/:year
import { getTursoClient, handleOptions, successResponse, errorResponse } from '../../../../_lib.js';

export async function DELETE(request) {
  try {
    // 從 URL 路徑參數提取 companyId 和 year
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const companyId = pathParts[4];  // /api/financial/{companyId}/{year}
    const year = pathParts[5];

    if (!companyId || !year) {
      return errorResponse('缺少必要參數', 400);
    }

    const client = getTursoClient();

    // 先取得公司名稱
    const companyResult = await client.execute({
      sql: 'SELECT name FROM companies WHERE id = ?',
      args: [parseInt(companyId)],
    });

    if (companyResult.rows.length === 0) {
      return errorResponse('公司不存在', 404);
    }

    const companyName = companyResult.rows[0].name;

    // 刪除財務數據
    await client.execute({
      sql: 'DELETE FROM financial_data WHERE company_id = ? AND year = ?',
      args: [parseInt(companyId), year],
    });

    return successResponse({
      success: true,
      company: companyName,
      year,
    });
  } catch (error) {
    console.error('刪除財務數據失敗:', error);
    return errorResponse('刪除財務數據失敗', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
