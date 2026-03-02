// Vercel Serverless Function: AI 摘要分析
// GET: 取得指定公司和年度的 AI 分析摘要
import { createRepository, handleOptions, successResponse, errorResponse } from '../_lib.js';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const companyName = url.searchParams.get('company');
    const year = url.searchParams.get('year');

    // 1. 驗證參數
    if (!companyName || !year) {
      return errorResponse('缺少必填參數: company, year', 400);
    }

    // 2. 查詢公司的 tax_id（從 financial_basics 表）
    const repo = await createRepository();
    const financialData = await repo.getFinancialBasics({ companyName });

    if (!financialData || financialData.length === 0) {
      return errorResponse('找不到該公司的財務資料', 404);
    }

    // 使用第一筆資料的 tax_id（同公司不同年度的 tax_id 相同）
    const taxId = financialData[0].tax_id;

    // 3. 呼叫外部 AI API
    const aiApiUrl = process.env.AI_ANALYSIS_API_URL || 'http://10.1.110.11:7814/v1/finance/analyze';
    const timeout = parseInt(process.env.AI_ANALYSIS_API_TIMEOUT || '10000');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const aiApiResponse = await fetch(aiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tax_id: taxId,
        fiscal_year: parseInt(year),
        model_mode: 'local'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!aiApiResponse.ok) {
      throw new Error(`AI API 回應錯誤: ${aiApiResponse.status}`);
    }

    const aiResult = await aiApiResponse.json();

    // 4. 回傳結果
    return successResponse({
      success: true,
      data: {
        company: companyName,
        year: year,
        tax_id: taxId,
        summary: aiResult.summary,
        status: aiResult.status,
        task_id: aiResult.task_id
      }
    });

  } catch (error) {
    console.error('AI 摘要查詢失敗:', error);

    if (error.name === 'AbortError') {
      return errorResponse('AI 分析請求逾時', 504);
    }

    return errorResponse('AI 摘要查詢失敗: ' + error.message, 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
