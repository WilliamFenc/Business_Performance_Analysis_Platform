/**
 * 匯出 Supabase 資料表到 Excel
 * 使用中文欄位名稱
 */

import XLSX from 'xlsx';

// 欄位中文描述對照
const financialBasicsColumns = {
  fiscal_year: '年度',
  tax_id: '統一編號',
  company_name: '公司名稱',
  account_item: '會計科目',
  cash_equivalents: '現金及約當現金',
  fvtpl_assets_current: '透過損益按公允價值衡量之金融資產-流動',
  fvoci_assets_current: '透過其他綜合損益按公允價值衡量之金融資產-流動',
  amortized_assets_current: '按攤銷後成本衡量之金融資產-流動',
  hedging_assets_current: '避險之金融資產-流動',
  contract_assets_current: '合約資產-流動',
  notes_receivable_net: '應收票據淨額',
  ar_net: '應收帳款淨額',
  ar_related_net: '應收帳款-關係人淨額',
  other_receivables_net: '其他應收款淨額',
  inventory: '存貨',
  prepayments: '預付款項',
  assets_held_for_sale_net: '待出售非流動資產(或處分群組)淨額',
  other_fin_assets_current: '其他金融資產-流動',
  other_current_assets: '其他流動資產',
  total_current_assets: '流動資產合計',
  fvtpl_assets_noncurrent: '透過損益按公允價值衡量之金融資產-非流動',
  fvoci_assets_noncurrent: '透過其他綜合損益按公允價值衡量之金融資產-非流動',
  amortized_assets_noncurrent: '按攤銷後成本衡量之金融資產-非流動',
  contract_assets_noncurrent: '合約資產-非流動',
  equity_method_investments: '採用權益法之投資',
  ppe: '不動產,廠房及設備',
  right_of_use_assets: '使用權資產',
  investment_properties_net: '投資性不動產淨額',
  intangible_assets: '無形資產',
  deferred_tax_assets: '遞延所得稅資產',
  other_noncurrent_assets: '其他非流動資產',
  total_noncurrent_assets: '非流動資產合計',
  total_assets: '資產總額',
  prepayments_for_equip: '預付設備款',
  guarantee_deposits_out: '存出保證金',
  short_term_borrowings: '短期借款',
  short_term_notes_payable: '應付短期票券',
  hedging_liabilities_current: '避險之金融負債-流動',
  contract_liabilities_current: '合約負債-流動',
  notes_payable: '應付票據',
  ap: '應付帳款',
  ap_related: '應付帳款-關係人',
  other_payables: '其他應付款',
  income_tax_payable: '本期所得稅負債',
  provisions_current: '負債準備-流動',
  lease_liabilities_current: '租賃負債-流動',
  other_current_liabilities: '其他流動負債',
  total_current_liabilities: '流動負債合計',
  contract_liabilities_noncurrent: '合約負債-非流動',
  bonds_payable: '應付公司債',
  long_term_borrowings: '長期借款',
  provisions_noncurrent: '負債準備-非流動',
  deferred_tax_liabilities: '遞延所得稅負債',
  lease_liabilities_noncurrent: '租賃負債-非流動',
  other_noncurrent_liabilities: '其他非流動負債',
  total_noncurrent_liabilities: '非流動負債合計',
  guarantee_deposits_in: '存入保證金',
  total_liabilities: '負債總額',
  common_stock: '普通股股本',
  total_capital_stock: '股本合計',
  capital_reserves: '資本公積合計',
  legal_reserves: '法定盈餘公積',
  special_reserves: '特別盈餘公積',
  retained_earnings_unappropriated: '未分配盈餘(或待彌補虧損)',
  total_retained_earnings: '保留盈餘合計',
  other_equity: '其他權益合計',
  treasury_stock: '庫藏股票',
  equity_attr_parent: '歸屬於母公司業主之權益合計',
  nci: '非控制權益',
  total_equity: '權益總額',
  liabilities_equity_total: '負債及權益總計',
  shares_to_be_cancelled: '待註銷股本股數(單位:股)',
  advance_receipts_shares: '預收股款(權益項下)之約當發行股數(單位:股)',
  treasury_shares_held: '母公司暨子公司所持有之母公司庫藏股股數(單位:股)'
};

const plIncomeBasicsColumns = {
  fiscal_year: '年度',
  tax_id: '統一編號',
  company_name: '公司名稱',
  account_item: '會計科目',
  operating_revenue_total: '營業收入合計',
  operating_costs_total: '營業成本合計',
  gross_profit_loss: '營業毛利(毛損)',
  gross_profit_loss_net: '營業毛利(毛損)淨額',
  selling_expenses: '推銷費用',
  general_admin_expenses: '管理費用',
  r_and_d_expenses: '研究發展費用',
  expected_credit_loss_net: '預期信用減損損失(利益)',
  operating_expenses_total: '營業費用合計',
  other_income_expense_net: '其他收益及費損淨額',
  operating_income_loss: '營業利益(損失)',
  interest_income: '利息收入',
  other_income: '其他收入',
  other_gains_losses_net: '其他利益及損失淨額',
  finance_costs_net: '財務成本淨額',
  equity_method_share_net: '採用權益法認列之關聯企業及合資損益之份額淨額',
  nonop_income_expense_total: '營業外收入及支出合計',
  profit_before_tax: '稅前淨利(淨損)',
  income_tax_expense_total: '所得稅費用(利益)合計',
  net_income_cont_ops: '繼續營業單位本期淨利(淨損)',
  net_income: '本期淨利(淨損)'
};

/**
 * 轉換資料欄位名稱為中文
 */
function translateColumns(data, columnMap) {
  return data.map(row => {
    const translated = {};
    for (const [key, chineseName] of Object.entries(columnMap)) {
      translated[chineseName] = row[key] !== null ? row[key] : '';
    }
    return translated;
  });
}

/**
 * 匯出資料到 Excel
 */
function exportToExcel(data, fileName, sheetName) {
  // 建立工作簿
  const workbook = XLSX.utils.book_new();

  // 轉換資料為工作表
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 設定欄位寬度
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;

  // 新增工作表到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 寫入檔案
  XLSX.writeFile(workbook, fileName);
  console.log(`✅ 已匯出: ${fileName}`);
}

/**
 * 主函數
 */
async function main() {
  console.log('開始匯出 Supabase 資料表...\n');

  // 使用 MCP 工具查詢的資料（手動貼上從 MCP 獲得的資料）
  const financialBasicsData = [
    // 這裡將使用從 MCP 查詢的資料
  ];

  const plIncomeBasicsData = [
    // 這裡將使用從 MCP 查詢的資料
  ];

  // 載入資料檔案
  const fs = await import('fs');
  const financialData = JSON.parse(fs.readFileSync('./data/financial_basics.json', 'utf-8'));
  const plIncomeData = JSON.parse(fs.readFileSync('./data/pl_income_basics.json', 'utf-8'));

  try {
    // 匯出 financial_basics
    console.log('正在匯出 financial_basics...');
    console.log(`  共 ${financialData.length} 筆資料`);
    const translatedFinancialData = translateColumns(financialData, financialBasicsColumns);
    exportToExcel(translatedFinancialData, '財務報表.xlsx', '財務報表');

    // 匯出 pl_income_basics
    console.log('\n正在匯出 pl_income_basics...');
    console.log(`  共 ${plIncomeData.length} 筆資料`);
    const translatedPlIncomeData = translateColumns(plIncomeData, plIncomeBasicsColumns);
    exportToExcel(translatedPlIncomeData, '損益表.xlsx', '損益表');

    console.log('\n✨ 所有資料匯出完成！');
  } catch (error) {
    console.error('❌ 匯出失敗:', error);
    process.exit(1);
  }
}

main();
