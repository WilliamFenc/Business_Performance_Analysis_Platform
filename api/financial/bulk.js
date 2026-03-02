// Vercel Serverless Function: 批量匯入財務資料
// 注意：Supabase 模式下此功能已停用，資料庫為唯讀
import { handleOptions, successResponse, errorResponse } from '../../_lib.js';

export async function POST(request) {
  try {
    // Supabase 模式下不支援批量匯入（資料庫為唯讀）
    return errorResponse('Supabase 模式下不支援批量匯入功能，資料庫為唯讀', 403);
  } catch (error) {
    console.error('批量匯入失敗:', error);
    return errorResponse('批量匯入失敗', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
