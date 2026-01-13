// Vercel Serverless Function: 匯出所有資料為 Excel
import { getTursoClient } from './_lib.js';
import * as XLSX from 'xlsx';

export async function GET(request) {
  try {
    const client = getTursoClient();

    // 查詢所有公司的財務資料
    const result = await client.execute({
      sql: `
        SELECT c.name as company, fd.year, fd.revenue, fd.profit
        FROM financial_data fd
        JOIN companies c ON c.id = fd.company_id
        ORDER BY c.name, fd.year
      `,
    });

    // 建立匯出資料
    const exportData = [['公司名稱', '年份', '營收', '稅前淨利']];
    result.rows.forEach(row => {
      exportData.push([row.company, row.year, row.revenue, row.profit]);
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
