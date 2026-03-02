// Vercel Serverless Function: 新增/更新財務資料
// 注意：Supabase 模式下此功能已停用，資料庫為唯讀
import { handleOptions, successResponse, errorResponse } from '../_lib.js';

export async function POST(request) {
  try {
    // Supabase 模式下不支援新增/更新功能（資料庫為唯讀）
    return errorResponse('Supabase 模式下不支援新增/更新功能，資料庫為唯讀', 403);
  } catch (error) {
    console.error('新增/更新財務資料失敗:', error);
    return errorResponse('新增/更新財務資料失敗', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
