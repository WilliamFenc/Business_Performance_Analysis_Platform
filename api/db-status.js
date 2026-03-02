// Vercel Serverless Function: 資料庫狀態 API
import { handleOptions, successResponse, getSupabaseClient } from './_lib.js';

export async function GET() {
  try {
    // 檢查環境變數是否設定
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return successResponse({
        databaseType: 'supabase',
        status: 'misconfigured',
        message: 'Supabase 環境變數未設定'
      });
    }

    // 簡單測試連線
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('companies').select('id').limit(1);

      if (error) {
        return successResponse({
          databaseType: 'supabase',
          status: 'failed',
          message: `連線失敗: ${error.message}`
        });
      }

      return successResponse({
        databaseType: 'supabase',
        status: 'connected',
        message: '已連接至 Supabase'
      });
    } catch (error) {
      return successResponse({
        databaseType: 'supabase',
        status: 'failed',
        message: `連線失敗: ${error.message}`
      });
    }
  } catch (error) {
    console.error('取得資料庫狀態失敗:', error);
    return successResponse({
      databaseType: 'unknown',
      status: 'failed',
      message: `連線失敗: ${error.message}`
    });
  }
}

export async function OPTIONS() {
  return handleOptions();
}
