// 共用資料庫客戶端
import { createClient } from '@supabase/supabase-js';

// 單位轉換函式：千元 → 百萬元
export function convertToMillions(valueInThousands) {
  if (valueInThousands === null || valueInThousands === undefined) {
    return 0;
  }
  const numValue = typeof valueInThousands === 'string'
    ? parseFloat(valueInThousands)
    : valueInThousands;
  return numValue / 1000;
}

export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('缺少 Supabase 資料庫設定');
  }

  return createClient(url, key);
}

// CORS 回應標頭
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 處理 OPTIONS 請求
export function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// 統一錯誤回應
export function errorResponse(message, status = 500) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

// 統一成功回應
export function successResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// 匯出資料庫抽象層
export { getDatabaseAdapter, createRepository, getDatabaseType } from '../lib/database/repository.js';
