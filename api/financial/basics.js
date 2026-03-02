// Vercel Serverless Function: 取得詳細財務指標資料
import { getSupabaseClient, handleOptions, successResponse, errorResponse, convertToMillions } from '../_lib.js';

/**
 * 計算財務指標
 * @param {Array} incomeData - 損益表資料
 * @param {Array} balanceData - 資產負債表資料
 * @returns {Object} 計算後的指標資料
 */
function calculateMetrics(incomeData, balanceData) {
  // 建立年度對應的資料映射
  const incomeByYear = {};
  const balanceByYear = {};

  incomeData.forEach(row => {
    incomeByYear[row.fiscal_year] = row;
  });

  balanceData.forEach(row => {
    balanceByYear[row.fiscal_year] = row;
  });

  // 取得所有年度並排序
  const years = [...new Set([
    ...incomeData.map(r => r.fiscal_year),
    ...balanceData.map(r => r.fiscal_year)
  ])].sort((a, b) => a - b);

  // 初始化結果陣列
  const result = {
    years: years.map(String),
    netProfitMargin: [],
    grossMargin: [],
    roa: [],
    currentRatio: [],
    quickRatio: [],
    debtEquityRatio: [],
    arTurnover: [],
    inventoryTurnover: [],
    revenueGrowth: [],
    grossProfitGrowth: [],
    profitBeforeTaxGrowth: [],
    sellingExpenseRatio: [],
    adminExpenseRatio: [],
    rdExpenseRatio: [],
  };

  // 輔助函式：安全除法
  const safeDivide = (numerator, denominator) => {
    if (denominator === null || denominator === undefined || denominator === 0) {
      return null;
    }
    if (numerator === null || numerator === undefined) {
      return null;
    }
    return numerator / denominator;
  };

  // 輔助函式：取得前一年度資料
  const getPreviousYear = (dataMap, year) => {
    return dataMap[year - 1] || null;
  };

  // 計算各年度指標
  years.forEach((year, index) => {
    const income = incomeByYear[year];
    const balance = balanceByYear[year];
    const prevIncome = getPreviousYear(incomeByYear, year);
    const prevBalance = getPreviousYear(balanceByYear, year);

    // 1. 淨利率 (%) = 稅前淨利 / 營業收入淨額 * 100
    result.netProfitMargin.push(
      safeDivide(
        income?.profit_before_tax,
        income?.operating_revenue_total
      ) * 100 || null
    );

    // 2. 毛利率 (%) = 營業毛利 / 營業收入淨額 * 100
    result.grossMargin.push(
      safeDivide(
        income?.gross_profit_loss,
        income?.operating_revenue_total
      ) * 100 || null
    );

    // 3. ROA (%) = 本年度淨利 / ((資產 + 前一年度資產) / 2) * 100
    if (balance?.total_assets && prevBalance?.total_assets) {
      const avgAssets = (balance.total_assets + prevBalance.total_assets) / 2;
      result.roa.push(
        safeDivide(income?.net_income, avgAssets) * 100 || null
      );
    } else {
      result.roa.push(null);
    }

    // 4. 流動比率 (%) = 流動資產 / 流動負債 * 100
    result.currentRatio.push(
      safeDivide(
        balance?.total_current_assets,
        balance?.total_current_liabilities
      ) * 100 || null
    );

    // 5. 速動比率 (%) = (流動資產 - 存貨 - 預付款項) / 流動負債 * 100
    if (balance?.total_current_assets && balance?.total_current_liabilities) {
      const quickAssets =
        (parseFloat(balance.total_current_assets) || 0) -
        (parseFloat(balance.inventory) || 0) -
        (parseFloat(balance.prepayments) || 0);
      result.quickRatio.push(
        safeDivide(quickAssets, balance.total_current_liabilities) * 100 || null
      );
    } else {
      result.quickRatio.push(null);
    }

    // 6. 負債淨值比 (%) = 負債 / 權益 * 100
    result.debtEquityRatio.push(
      safeDivide(
        balance?.total_liabilities,
        balance?.total_equity
      ) * 100 || null
    );

    // 7. 應收帳款週轉率 (次) = 營業收入淨額 / ((今年和去年(應收票據 + 應收帳款 + 應收帳款-關係人淨額)/2)
    const currentAR =
      (parseFloat(balance?.notes_receivable_net) || 0) +
      (parseFloat(balance?.ar_net) || 0) +
      (parseFloat(balance?.ar_related_net) || 0);
    const prevAR =
      (parseFloat(prevBalance?.notes_receivable_net) || 0) +
      (parseFloat(prevBalance?.ar_net) || 0) +
      (parseFloat(prevBalance?.ar_related_net) || 0);
    const avgAR = (currentAR + prevAR) / 2;
    result.arTurnover.push(
      safeDivide(income?.operating_revenue_total, avgAR) || null
    );

    // 8. 存貨周轉率 (次) = 營業成本 / ((存貨 + 去年度存貨)/2)
    const currentInventory = parseFloat(balance?.inventory) || 0;
    const prevInventory = parseFloat(prevBalance?.inventory) || 0;
    const avgInventory = (currentInventory + prevInventory) / 2;
    result.inventoryTurnover.push(
      safeDivide(income?.operating_costs_total, avgInventory) || null
    );

    // 9. 營收成長率 (%) = 營業收入淨額 / 前一年度營業收入淨額 - 1
    if (prevIncome?.operating_revenue_total) {
      result.revenueGrowth.push(
        (safeDivide(income?.operating_revenue_total, prevIncome.operating_revenue_total) - 1) * 100 || null
      );
    } else {
      result.revenueGrowth.push(null);
    }

    // 10. 毛利成長率 (%) = 營業毛利 / 前一年度營業毛利 - 1
    if (prevIncome?.gross_profit_loss) {
      result.grossProfitGrowth.push(
        (safeDivide(income?.gross_profit_loss, prevIncome.gross_profit_loss) - 1) * 100 || null
      );
    } else {
      result.grossProfitGrowth.push(null);
    }

    // 11. 稅前淨利成長率 (%) = 稅前淨利 / 前一年度稅前淨利 - 1
    if (prevIncome?.profit_before_tax) {
      result.profitBeforeTaxGrowth.push(
        (safeDivide(income?.profit_before_tax, prevIncome.profit_before_tax) - 1) * 100 || null
      );
    } else {
      result.profitBeforeTaxGrowth.push(null);
    }

    // 12. 推銷費用占比 (%) = 推銷費用 / 營業收入淨額 * 100
    result.sellingExpenseRatio.push(
      safeDivide(
        income?.selling_expenses,
        income?.operating_revenue_total
      ) * 100 || null
    );

    // 13. 管理費用佔比 (%) = 管理費用 / 營業收入淨額 * 100
    result.adminExpenseRatio.push(
      safeDivide(
        income?.general_admin_expenses,
        income?.operating_revenue_total
      ) * 100 || null
    );

    // 14. 研發費用佔比 (%) = 研究發展費用 / 營業收入淨額 * 100
    result.rdExpenseRatio.push(
      safeDivide(
        income?.r_and_d_expenses,
        income?.operating_revenue_total
      ) * 100 || null
    );
  });

  return result;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const company = url.searchParams.get('company');

    if (!company) {
      return errorResponse('缺少 company 參數', 400);
    }

    const supabase = getSupabaseClient();

    // 同時查詢損益表和資產負債表
    const [incomeResult, balanceResult] = await Promise.all([
      supabase
        .from('pl_income_basics')
        .select('*')
        .eq('company_name', company)
        .order('fiscal_year'),
      supabase
        .from('financial_basics')
        .select('*')
        .eq('company_name', company)
        .order('fiscal_year'),
    ]);

    if (incomeResult.error) {
      throw incomeResult.error;
    }

    if (balanceResult.error) {
      throw balanceResult.error;
    }

    if (!incomeResult.data || incomeResult.data.length === 0) {
      return errorResponse('公司資料不存在', 404);
    }

    // 計算指標
    const metrics = calculateMetrics(incomeResult.data, balanceResult.data);

    return successResponse({
      success: true,
      data: {
        company: company,
        years: metrics.years,
        metrics: metrics,
      },
    });
  } catch (error) {
    console.error('取得財務指標失敗:', error);
    return errorResponse('取得財務指標失敗', 500);
  }
}

export async function OPTIONS() {
  return handleOptions();
}
