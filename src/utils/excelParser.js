/**
 * Excel 解析工具
 * 用於解析 Excel 檔案並對應到資料表欄位
 */

import * as XLSX from 'xlsx';

// financial_basics 資料表的欄位定義
export const FINANCIAL_BASICS_COLUMNS = [
  { column_name: 'fiscal_year', column_description: '年度' },
  { column_name: 'tax_id', column_description: '統一編號' },
  { column_name: 'company_name', column_description: '公司名稱' },
  { column_name: 'account_item', column_description: '會計科目' },
  { column_name: 'cash_equivalents', column_description: '現金及約當現金' },
  { column_name: 'fvtpl_assets_current', column_description: '透過損益按公允價值衡量之金融資產-流動' },
  { column_name: 'fvoci_assets_current', column_description: '透過其他綜合損益按公允價值衡量之金融資產-流動' },
  { column_name: 'amortized_assets_current', column_description: '按攤銷後成本衡量之金融資產-流動' },
  { column_name: 'hedging_assets_current', column_description: '避險之金融資產-流動' },
  { column_name: 'contract_assets_current', column_description: '合約資產-流動' },
  { column_name: 'notes_receivable_net', column_description: '應收票據淨額' },
  { column_name: 'ar_net', column_description: '應收帳款淨額' },
  { column_name: 'ar_related_net', column_description: '應收帳款-關係人淨額' },
  { column_name: 'other_receivables_net', column_description: '其他應收款淨額' },
  { column_name: 'current_tax_assets', column_description: '本期所得稅資產' },
  { column_name: 'inventory', column_description: '存貨' },
  { column_name: 'prepayments', column_description: '預付款項' },
  { column_name: 'assets_held_for_sale_net', column_description: '待出售非流動資產(或處分群組)淨額' },
  { column_name: 'other_fin_assets_current', column_description: '其他金融資產-流動' },
  { column_name: 'other_current_assets', column_description: '其他流動資產' },
  { column_name: 'total_current_assets', column_description: '流動資產合計' },
  { column_name: 'fvtpl_assets_noncurrent', column_description: '透過損益按公允價值衡量之金融資產-非流動' },
  { column_name: 'fvoci_assets_noncurrent', column_description: '透過其他綜合損益按公允價值衡量之金融資產-非流動' },
  { column_name: 'amortized_assets_noncurrent', column_description: '按攤銷後成本衡量之金融資產-非流動' },
  { column_name: 'contract_assets_noncurrent', column_description: '合約資產-非流動' },
  { column_name: 'equity_method_investments', column_description: '採用權益法之投資' },
  { column_name: 'ppe', column_description: '不動產、廠房及設備' },
  { column_name: 'right_of_use_assets', column_description: '使用權資產' },
  { column_name: 'investment_properties_net', column_description: '投資性不動產淨額' },
  { column_name: 'intangible_assets', column_description: '無形資產' },
  { column_name: 'deferred_tax_assets', column_description: '遞延所得稅資產' },
  { column_name: 'other_noncurrent_assets', column_description: '其他非流動資產' },
  { column_name: 'total_noncurrent_assets', column_description: '非流動資產合計' },
  { column_name: 'total_assets', column_description: '資產總額' },
  { column_name: 'prepayments_for_equip', column_description: '預付設備款' },
  { column_name: 'guarantee_deposits_out', column_description: '存出保證金' },
  { column_name: 'short_term_borrowings', column_description: '短期借款' },
  { column_name: 'short_term_notes_payable', column_description: '應付短期票券' },
  { column_name: 'financial_liabilities_at_fair_value_through_profit_or_loss_curr', column_description: '透過損益按公允價值衡量之金融負債－流動' },
  { column_name: 'hedging_liabilities_current', column_description: '避險之金融負債-流動' },
  { column_name: 'contract_liabilities_current', column_description: '合約負債-流動' },
  { column_name: 'notes_payable', column_description: '應付票據' },
  { column_name: 'ap', column_description: '應付帳款' },
  { column_name: 'ap_related', column_description: '應付帳款-關係人' },
  { column_name: 'other_payables', column_description: '其他應付款' },
  { column_name: 'income_tax_payable', column_description: '本期所得稅負債' },
  { column_name: 'provisions_current', column_description: '負債準備-流動' },
  { column_name: 'lease_liabilities_current', column_description: '租賃負債-流動' },
  { column_name: 'other_current_liabilities', column_description: '其他流動負債' },
  { column_name: 'total_current_liabilities', column_description: '流動負債合計' },
  { column_name: 'contract_liabilities_noncurrent', column_description: '合約負債-非流動' },
  { column_name: 'bonds_payable', column_description: '應付公司債' },
  { column_name: 'long_term_borrowings', column_description: '長期借款' },
  { column_name: 'provisions_noncurrent', column_description: '負債準備-非流動' },
  { column_name: 'deferred_tax_liabilities', column_description: '遞延所得稅負債' },
  { column_name: 'lease_liabilities_noncurrent', column_description: '租賃負債-非流動' },
  { column_name: 'other_noncurrent_liabilities', column_description: '其他非流動負債' },
  { column_name: 'total_noncurrent_liabilities', column_description: '非流動負債合計' },
  { column_name: 'guarantee_deposits_in', column_description: '存入保證金' },
  { column_name: 'total_liabilities', column_description: '負債總額' },
  { column_name: 'common_stock', column_description: '普通股股本' },
  { column_name: 'total_capital_stock', column_description: '股本合計' },
  { column_name: 'capital_reserves', column_description: '資本公積合計' },
  { column_name: 'legal_reserves', column_description: '法定盈餘公積' },
  { column_name: 'special_reserves', column_description: '特別盈餘公積' },
  { column_name: 'retained_earnings_unappropriated', column_description: '未分配盈餘(或待彌補虧損)' },
  { column_name: 'total_retained_earnings', column_description: '保留盈餘合計' },
  { column_name: 'other_equity', column_description: '其他權益合計' },
  { column_name: 'treasury_stock', column_description: '庫藏股票' },
  { column_name: 'equity_attr_parent', column_description: '歸屬於母公司業主之權益合計' },
  { column_name: 'nci', column_description: '非控制權益' },
  { column_name: 'total_equity', column_description: '權益總額' },
  { column_name: 'liabilities_equity_total', column_description: '負債及權益總計' },
  { column_name: 'shares_to_be_cancelled', column_description: '待註銷股本股數(單位:股)' },
  { column_name: 'advance_receipts_shares', column_description: '預收股款(權益項下)之約當發行股數(單位:股)' },
  { column_name: 'treasury_shares_held', column_description: '母公司暨子公司所持有之母公司庫藏股股數(單位:股)' }
];

// pl_income_basics 資料表的欄位定義
export const PL_INCOME_BASICS_COLUMNS = [
  { column_name: 'fiscal_year', column_description: '年度' },
  { column_name: 'tax_id', column_description: '統一編號' },
  { column_name: 'company_name', column_description: '公司名稱' },
  { column_name: 'account_item', column_description: '會計科目' },
  { column_name: 'operating_revenue_total', column_description: '營業收入合計' },
  { column_name: 'operating_costs_total', column_description: '營業成本合計' },
  { column_name: 'gross_profit_loss', column_description: '營業毛利(毛損)' },
  { column_name: 'gross_profit_loss_net', column_description: '營業毛利(毛損)淨額' },
  { column_name: 'selling_expenses', column_description: '推銷費用' },
  { column_name: 'general_admin_expenses', column_description: '管理費用' },
  { column_name: 'r_and_d_expenses', column_description: '研究發展費用' },
  { column_name: 'expected_credit_loss_net', column_description: '預期信用減損損失(利益)' },
  { column_name: 'operating_expenses_total', column_description: '營業費用合計' },
  { column_name: 'other_income_expense_net', column_description: '其他收益及費損淨額' },
  { column_name: 'operating_income_loss', column_description: '營業利益(損失)' },
  { column_name: 'interest_income', column_description: '利息收入' },
  { column_name: 'other_income', column_description: '其他收入' },
  { column_name: 'other_gains_losses_net', column_description: '其他利益及損失淨額' },
  { column_name: 'finance_costs_net', column_description: '財務成本淨額' },
  { column_name: 'equity_method_share_net', column_description: '採用權益法認列之關聯企業及合資損益之份額淨額' },
  { column_name: 'nonop_income_expense_total', column_description: '營業外收入及支出合計' },
  { column_name: 'profit_before_tax', column_description: '稅前淨利(淨損)' },
  { column_name: 'income_tax_expense_total', column_description: '所得稅費用(利益)合計' },
  { column_name: 'net_income_cont_ops', column_description: '繼續營業單位本期淨利(淨損)' },
  { column_name: 'net_income', column_description: '本期淨利(淨損)' }
];

/**
 * 欄位對應函式
 * @param {Array} chineseHeaders - 第 1 列中文標題
 * @param {Array} englishHeaders - 第 2 列英文標題
 * @param {Array} columnDefinitions - 資料表欄位定義
 * @returns {Object} { mapping: Map, warnings: Array }
 */
export function mapColumns(chineseHeaders, englishHeaders, columnDefinitions) {
  const mapping = new Map(); // column_name -> excel_column_index
  const warnings = [];
  const unmappedColumns = [];

  // 主要規則：英文名稱 → column_name
  englishHeaders.forEach((engName, index) => {
    if (!engName) return;
    const match = columnDefinitions.find(col => col.column_name === engName);
    if (match) {
      mapping.set(match.column_name, index);
    }
  });

  // 次要規則：中文名稱 → column_description（僅對尚未對應的欄位）
  chineseHeaders.forEach((chiName, index) => {
    if (!chiName) return;
    // 檢查此索引是否已被英文名稱對應
    const isAlreadyMapped = Array.from(mapping.values()).includes(index);
    if (isAlreadyMapped) return;

    const match = columnDefinitions.find(col => col.column_description === chiName);
    if (match) {
      mapping.set(match.column_name, index);
    }
  });

  // 檢查哪些欄位無法對應
  columnDefinitions.forEach(col => {
    if (!mapping.has(col.column_name)) {
      unmappedColumns.push(`${col.column_description} (${col.column_name})`);
    }
  });

  if (unmappedColumns.length > 0) {
    warnings.push(`無法對應的欄位：${unmappedColumns.join(', ')}`);
  }

  return { mapping, warnings };
}

/**
 * 解析 Excel 檔案
 * @param {File} file - Excel 檔案
 * @returns {Promise<Object>} 解析結果
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // 檢查必要的工作表
        const hasFinancialSheet = workbook.SheetNames.includes('財務報表');
        const hasIncomeSheet = workbook.SheetNames.includes('損益表');

        if (!hasFinancialSheet && !hasIncomeSheet) {
          reject(new Error('Excel 檔案缺少必要的工作表（財務報表 或 損益表）'));
          return;
        }

        const result = {
          financialBasics: null,
          plIncome: null,
          warnings: []
        };

        // 解析財務報表
        if (hasFinancialSheet) {
          const sheet = workbook.Sheets['財務報表'];
          // 使用 raw: false 確保正確處理字串編碼
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: null });

          if (jsonData.length < 3) {
            result.warnings.push('財務報表工作表沒有資料列');
          } else {
            const chineseHeaders = jsonData[0] || [];
            const englishHeaders = jsonData[1] || [];
            const dataRows = jsonData.slice(2);

            const { mapping, warnings: mapWarnings } = mapColumns(
              chineseHeaders,
              englishHeaders,
              FINANCIAL_BASICS_COLUMNS
            );

            result.warnings.push(...mapWarnings);

            // 轉換資料
            const records = dataRows.map((row, rowIndex) => {
              const record = {};
              mapping.forEach((excelIndex, columnName) => {
                const value = row[excelIndex];
                // 確保字串值被正確處理（去除多餘空白，null 轉為 undefined）
                if (typeof value === 'string') {
                  record[columnName] = value.trim();
                } else if (value === null || value === undefined) {
                  record[columnName] = undefined;
                } else {
                  record[columnName] = value;
                }
              });
              return record;
            }).filter(row => row.fiscal_year && row.tax_id); // 過濾空資料

            result.financialBasics = {
              headers: { chinese: chineseHeaders, english: englishHeaders },
              mapping: Array.from(mapping.entries()),
              records,
              count: records.length
            };
          }
        }

        // 解析損益表
        if (hasIncomeSheet) {
          const sheet = workbook.Sheets['損益表'];
          // 使用 raw: false 確保正確處理字串編碼
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: null });

          if (jsonData.length < 3) {
            result.warnings.push('損益表工作表沒有資料列');
          } else {
            const chineseHeaders = jsonData[0] || [];
            const englishHeaders = jsonData[1] || [];
            const dataRows = jsonData.slice(2);

            const { mapping, warnings: mapWarnings } = mapColumns(
              chineseHeaders,
              englishHeaders,
              PL_INCOME_BASICS_COLUMNS
            );

            result.warnings.push(...mapWarnings);

            // 轉換資料
            const records = dataRows.map((row, rowIndex) => {
              const record = {};
              mapping.forEach((excelIndex, columnName) => {
                const value = row[excelIndex];
                // 確保字串值被正確處理（去除多餘空白，null 轉為 undefined）
                if (typeof value === 'string') {
                  record[columnName] = value.trim();
                } else if (value === null || value === undefined) {
                  record[columnName] = undefined;
                } else {
                  record[columnName] = value;
                }
              });
              return record;
            }).filter(row => row.fiscal_year && row.tax_id); // 過濾空資料

            result.plIncome = {
              headers: { chinese: chineseHeaders, english: englishHeaders },
              mapping: Array.from(mapping.entries()),
              records,
              count: records.length
            };
          }
        }

        resolve(result);
      } catch (error) {
        reject(new Error('Excel 檔案解析失敗：' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('檔案讀取失敗'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * 驗證 Excel 檔案格式
 * @param {File} file - 檔案
 * @returns {boolean} 是否為有效的 Excel 檔案
 */
export function isValidExcelFile(file) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  const validExtensions = ['.xlsx', '.xls'];

  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

  return hasValidType || hasValidExtension;
}
