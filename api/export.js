// Vercel Serverless Function: 匯出所有資料為 Excel
import { getSupabaseClient, convertToMillions } from './_lib.js';
import * as XLSX from 'xlsx';

export async function GET(request) {
  try {
    const supabase = getSupabaseClient();

    // 查詢所有公司的財務資料，並關聯公司資料
    const { data, error } = await supabase
      .from('pl_income_basics')
      .select(`
        fiscal_year,
        operating_revenue_total,
        profit_before_tax,
        companies!inner (
          company_name
        )
      `)
      .order('fiscal_year');

    if (error) {
      throw error;
    }

    // 建立匯出資料（單位已轉換為百萬元）
    const exportData = [['公司名稱', '年份', '營收', '稅前淨利']];
    data.forEach(row => {
      exportData.push([
        row.companies.company_name,
        row.fiscal_year,
        convertToMillions(row.operating_revenue_total),
        convertToMillions(row.profit_before_tax),
      ]);
    });

    // 排序
    exportData.sort((a, b) => {
      if (a[0] !== b[0]) return a[0].localeCompare(b[0]); // 依公司名稱排序
      return b[1] - a[1]; // 依年份降序排序
    });

    // 建立 Excel 檔案
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '所有公司績效數據');

    // 輸出為 buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 回傳 Excel 檔案
    return new Response(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="多公司績效數據庫_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('匯出失敗:', error);
    return new Response(JSON.stringify({ error: '匯出失敗', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
