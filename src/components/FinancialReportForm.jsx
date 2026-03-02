import { useState, useEffect } from 'react';
import AccordionSection from './AccordionSection';

/**
 * FinancialReportForm - 財務報表 Accordion 表單組件
 * 支援 80+ 欄位的財務報表編輯
 */
function FinancialReportForm({ mode = 'create', initialValues, companies, onSave, onCancel }) {
  // 初始化表單資料
  const initFormData = () => ({
    fiscal_year: '',
    tax_id: '',
    company_name: '',
    account_item: '',
    // 流動資產
    cash_equivalents: '',
    fvtpl_assets_current: '',
    fvoci_assets_current: '',
    amortized_assets_current: '',
    hedging_assets_current: '',
    contract_assets_current: '',
    notes_receivable_net: '',
    ar_net: '',
    ar_related_net: '',
    other_receivables_net: '',
    current_tax_assets: '',
    inventory: '',
    prepayments: '',
    assets_held_for_sale_net: '',
    other_fin_assets_current: '',
    other_current_assets: '',
    total_current_assets: '',
    // 非流動資產
    fvtpl_assets_noncurrent: '',
    fvoci_assets_noncurrent: '',
    amortized_assets_noncurrent: '',
    contract_assets_noncurrent: '',
    equity_method_investments: '',
    ppe: '',
    right_of_use_assets: '',
    investment_properties_net: '',
    intangible_assets: '',
    deferred_tax_assets: '',
    other_noncurrent_assets: '',
    total_noncurrent_assets: '',
    total_assets: '',
    // 流動負債
    prepayments_for_equip: '',
    guarantee_deposits_out: '',
    short_term_borrowings: '',
    short_term_notes_payable: '',
    financial_liabilities_at_fair_value_through_profit_or_loss_curr: '',
    hedging_liabilities_current: '',
    contract_liabilities_current: '',
    notes_payable: '',
    ap: '',
    ap_related: '',
    other_payables: '',
    income_tax_payable: '',
    provisions_current: '',
    lease_liabilities_current: '',
    other_current_liabilities: '',
    total_current_liabilities: '',
    // 非流動負債
    contract_liabilities_noncurrent: '',
    bonds_payable: '',
    long_term_borrowings: '',
    provisions_noncurrent: '',
    deferred_tax_liabilities: '',
    lease_liabilities_noncurrent: '',
    other_noncurrent_liabilities: '',
    total_noncurrent_liabilities: '',
    guarantee_deposits_in: '',
    total_liabilities: '',
    // 權益
    common_stock: '',
    total_capital_stock: '',
    capital_reserves: '',
    legal_reserves: '',
    special_reserves: '',
    retained_earnings_unappropriated: '',
    total_retained_earnings: '',
    other_equity: '',
    treasury_stock: '',
    equity_attr_parent: '',
    nci: '',
    total_equity: '',
    liabilities_equity_total: '',
    shares_to_be_cancelled: '',
    advance_receipts_shares: '',
    treasury_shares_held: '',
  });

  const [formData, setFormData] = useState(initFormData());
  const [errors, setErrors] = useState({});
  const [accordionState, setAccordionState] = useState({
    basicInfo: true,
    currentAssets: false,
    nonCurrentAssets: false,
    currentLiabilities: false,
    nonCurrentLiabilities: false,
    equity: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // 當 initialValues 變更時更新表單
  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      const newData = initFormData();
      Object.keys(initialValues).forEach(key => {
        if (key in newData) {
          newData[key] = initialValues[key] ?? '';
        }
      });
      setFormData(newData);
    } else if (mode === 'create') {
      setFormData(initFormData());
    }
    setErrors({});
  }, [mode, initialValues]);

  // 欄位定義 - 中文標籤對照
  const fieldLabels = {
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
    current_tax_assets: '本期所得稅資產',
    inventory: '存貨',
    prepayments: '預付款項',
    assets_held_for_sale_net: '待出售非流動資產淨額',
    other_fin_assets_current: '其他金融資產-流動',
    other_current_assets: '其他流動資產',
    total_current_assets: '流動資產合計',
    fvtpl_assets_noncurrent: '透過損益按公允價值衡量之金融資產-非流動',
    fvoci_assets_noncurrent: '透過其他綜合損益按公允價值衡量之金融資產-非流動',
    amortized_assets_noncurrent: '按攤銷後成本衡量之金融資產-非流動',
    contract_assets_noncurrent: '合約資產-非流動',
    equity_method_investments: '採用權益法之投資',
    ppe: '不動產、廠房及設備',
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
    financial_liabilities_at_fair_value_through_profit_or_loss_curr: '透過損益按公允價值衡量之金融負債-流動',
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
    retained_earnings_unappropriated: '未分配盈餘',
    total_retained_earnings: '保留盈餘合計',
    other_equity: '其他權益合計',
    treasury_stock: '庫藏股票',
    equity_attr_parent: '歸屬於母公司業主之權益合計',
    nci: '非控制權益',
    total_equity: '權益總額',
    liabilities_equity_total: '負債及權益總計',
    shares_to_be_cancelled: '待註銷股本股數',
    advance_receipts_shares: '預收股款約當發行股數',
    treasury_shares_held: '庫藏股股數',
  };

  // 區塊定義
  const sections = {
    basicInfo: {
      title: '基本資訊 (必填)',
      fields: ['fiscal_year', 'tax_id', 'company_name', 'account_item'],
      badge: '4 欄位'
    },
    currentAssets: {
      title: '流動資產',
      fields: [
        'cash_equivalents', 'fvtpl_assets_current', 'fvoci_assets_current',
        'amortized_assets_current', 'hedging_assets_current', 'contract_assets_current',
        'notes_receivable_net', 'ar_net', 'ar_related_net', 'other_receivables_net',
        'current_tax_assets', 'inventory', 'prepayments', 'assets_held_for_sale_net',
        'other_fin_assets_current', 'other_current_assets', 'total_current_assets'
      ],
      badge: '17 欄位'
    },
    nonCurrentAssets: {
      title: '非流動資產',
      fields: [
        'fvtpl_assets_noncurrent', 'fvoci_assets_noncurrent', 'amortized_assets_noncurrent',
        'contract_assets_noncurrent', 'equity_method_investments', 'ppe',
        'right_of_use_assets', 'investment_properties_net', 'intangible_assets',
        'deferred_tax_assets', 'other_noncurrent_assets', 'total_noncurrent_assets',
        'total_assets'
      ],
      badge: '13 欄位'
    },
    currentLiabilities: {
      title: '流動負債',
      fields: [
        'prepayments_for_equip', 'guarantee_deposits_out', 'short_term_borrowings',
        'short_term_notes_payable', 'financial_liabilities_at_fair_value_through_profit_or_loss_curr',
        'hedging_liabilities_current', 'contract_liabilities_current', 'notes_payable',
        'ap', 'ap_related', 'other_payables', 'income_tax_payable',
        'provisions_current', 'lease_liabilities_current', 'other_current_liabilities',
        'total_current_liabilities'
      ],
      badge: '16 欄位'
    },
    nonCurrentLiabilities: {
      title: '非流動負債',
      fields: [
        'contract_liabilities_noncurrent', 'bonds_payable', 'long_term_borrowings',
        'provisions_noncurrent', 'deferred_tax_liabilities', 'lease_liabilities_noncurrent',
        'other_noncurrent_liabilities', 'total_noncurrent_liabilities', 'guarantee_deposits_in',
        'total_liabilities'
      ],
      badge: '10 欄位'
    },
    equity: {
      title: '權益',
      fields: [
        'common_stock', 'total_capital_stock', 'capital_reserves', 'legal_reserves',
        'special_reserves', 'retained_earnings_unappropriated', 'total_retained_earnings',
        'other_equity', 'treasury_stock', 'equity_attr_parent', 'nci',
        'total_equity', 'liabilities_equity_total', 'shares_to_be_cancelled',
        'advance_receipts_shares', 'treasury_shares_held'
      ],
      badge: '16 欄位'
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleCompanyChange = (e) => {
    // 支援兩種公司資料格式: { name } 或 { company_name }
    const companyName = e.target.value;
    setFormData({
      ...formData,
      company_name: companyName
    });
    setErrors({ ...errors, company_name: null });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fiscal_year) {
      newErrors.fiscal_year = '請輸入年度';
    } else {
      const year = parseInt(formData.fiscal_year);
      if (isNaN(year) || year < 1900 || year > 2100) {
        newErrors.fiscal_year = '年度必須為 1900-2100 之間的數字';
      }
    }

    if (!formData.tax_id) {
      newErrors.tax_id = '請輸入統一編號';
    } else if (!/^\d{8}$/.test(formData.tax_id)) {
      newErrors.tax_id = '統一編號必須為 8 位數字';
    }

    if (!formData.company_name?.trim()) {
      newErrors.company_name = '請輸入公司名稱';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      // 只傳送有值的欄位
      const submitData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          submitData[key] = formData[key];
        }
      });
      await onSave(submitData);
    } catch (error) {
      alert('儲存失敗: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAll = (open) => {
    setAccordionState({
      basicInfo: open,
      currentAssets: open,
      nonCurrentAssets: open,
      currentLiabilities: open,
      nonCurrentLiabilities: open,
      equity: open,
    });
  };

  const renderField = (field) => {
    const isRequired = ['fiscal_year', 'tax_id', 'company_name'].includes(field);
    const isReadonly = mode === 'edit' && ['fiscal_year', 'tax_id'].includes(field);

    return (
      <div key={field} className="form-grid-item">
        <label>
          {fieldLabels[field]}
          {isRequired && ' *'}
        </label>
        {field === 'company_name' && mode === 'create' ? (
          <select
            value={formData.company_name}
            onChange={handleCompanyChange}
            disabled={isSaving}
          >
            <option value="">請選擇公司</option>
            {companies.map((c, idx) => {
              // 支援兩種公司資料格式: { name } 或 { company_name }
              const displayName = c.name || c.company_name;
              const value = c.name || c.company_name;
              return (
                <option key={idx} value={value}>
                  {displayName}
                </option>
              );
            })}
          </select>
        ) : (
          <input
            type={
              ['fiscal_year', 'shares_to_be_cancelled', 'advance_receipts_shares', 'treasury_shares_held'].includes(field)
                ? 'number'
                : 'text'
            }
            value={formData[field]}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            disabled={isSaving || isReadonly}
            readOnly={isReadonly}
            placeholder={fieldLabels[field]}
          />
        )}
        {errors[field] && <span className="error">{errors[field]}</span>}
      </div>
    );
  };

  return (
    <div className="financial-report-form">
      <div className="accordion-controls">
        <button
          type="button"
          className="accordion-control-btn"
          onClick={() => toggleAll(true)}
        >
          全部展開
        </button>
        <button
          type="button"
          className="accordion-control-btn"
          onClick={() => toggleAll(false)}
        >
          全部摺疊
        </button>
      </div>

      {Object.entries(sections).map(([sectionId, section]) => (
        <AccordionSection
          key={sectionId}
          id={sectionId}
          title={section.title}
          badge={section.badge}
          isOpen={accordionState[sectionId]}
          onToggle={(open) => setAccordionState({ ...accordionState, [sectionId]: open })}
          defaultOpen={sectionId === 'basicInfo'}
        >
          <div className="form-grid">
            {section.fields.map(renderField)}
          </div>
        </AccordionSection>
      ))}

      <div className="form-actions">
        <button
          type="button"
          className="modal-btn modal-btn-cancel"
          onClick={onCancel}
          disabled={isSaving}
        >
          取消
        </button>
        <button
          type="button"
          className="modal-btn modal-btn-save"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? '儲存中...' : (mode === 'create' ? '確定新增' : '儲存變更')}
        </button>
      </div>
    </div>
  );
}

export default FinancialReportForm;
