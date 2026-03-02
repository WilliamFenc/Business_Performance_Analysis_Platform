// Vercel Serverless Function: 財務報表 CRUD API
// GET: 取得所有財務報表資料
// POST: 新增或更新財務報表資料（upsert）
import { createRepository, handleOptions, successResponse, errorResponse } from '../_lib.js';

export async function GET() {
  try {
    const repo = await createRepository();
    const data = await repo.getFinancialBasics();

    return successResponse({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('查詢財務報表失敗:', error);
    return errorResponse('查詢財務報表失敗: ' + error.message, 500);
  }
}

export async function POST(request) {
  try {
    const repo = await createRepository();
    const body = await request.json();

    // 驗證必填欄位
    if (!body.fiscal_year || !body.tax_id) {
      return errorResponse('缺少必填欄位: fiscal_year, tax_id', 400);
    }

    // 驗證年度格式
    const year = parseInt(body.fiscal_year);
    if (isNaN(year) || year < 1900 || year > 2100) {
      return errorResponse('年度格式錯誤，必須為 1900-2100 之間的數字', 400);
    }

    // 驗證統一編號格式（8位數字）
    const taxId = String(body.tax_id).trim();
    if (!/^\d{8}$/.test(taxId)) {
      return errorResponse('統一編號格式錯誤，必須為 8 位數字', 400);
    }

    // 準備 upsert 資料
    const upsertData = {
      fiscal_year: year,
      tax_id: taxId,
      ...body
    };

    // 執行 upsert（根據主鍵 fiscal_year, tax_id 判斷新增或更新）
    const data = await repo.upsertFinancialBasics(upsertData);

    return successResponse({
      success: true,
      data: data || null,
      message: '財務報表儲存成功'
    });
  } catch (error) {
    console.error('POST financial-basics 錯誤:', error);
    return errorResponse('伺服器錯誤: ' + error.message, 500);
  }
}

// DELETE: 刪除指定年度的財務報表資料
// 使用 query string: ?tax_id=xxx&fiscal_year=xxx
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const taxId = url.searchParams.get('tax_id');
    const fiscalYear = url.searchParams.get('fiscal_year');

    if (!taxId || !fiscalYear) {
      return errorResponse('缺少必填參數: tax_id, fiscal_year', 400);
    }

    const repo = await createRepository();
    await repo.deleteFinancialBasics(taxId, parseInt(fiscalYear));

    return successResponse({
      success: true,
      message: '財務報表刪除成功'
    });
  } catch (error) {
    console.error('DELETE financial-basics 錯誤:', error);
    return errorResponse('刪除失敗: ' + error.message, 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
