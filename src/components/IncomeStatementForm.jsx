import { useState, useEffect } from 'react';
import AccordionSection from './AccordionSection';

/**
 * IncomeStatementForm - 損益表 Accordion 表單組件
 * 支援 26 欄位的損益表編輯
 */
function IncomeStatementForm({ mode = 'create', initialValues, companies, onSave, onCancel }) {
  // 初始化表單資料
  const initFormData = () => ({
    fiscal_year: '',
    tax_id: '',
    company_name: '',
    account_item: '',
    // 營業項目
    operating_revenue_total: '',
    operating_costs_total: '',
    gross_profit_loss: '',
    gross_profit_loss_net: '',
    // 營業費用
    selling_expenses: '',
    general_admin_expenses: '',
    r_and_d_expenses: '',
    expected_credit_loss_net: '',
    operating_expenses_total: '',
    // 營業損益
    other_income_expense_net: '',
    operating_income_loss: '',
    // 營業外損益
    interest_income: '',
    other_income: '',
    other_gains_losses_net: '',
    finance_costs_net: '',
    equity_method_share_net: '',
    nonop_income_expense_total: '',
    // 淨利
    profit_before_tax: '',
    income_tax_expense_total: '',
    net_income_cont_ops: '',
    net_income: '',
  });

  const [formData, setFormData] = useState(initFormData());
  const [errors, setErrors] = useState({});
  const [accordionState, setAccordionState] = useState({
    basicInfo: true,
    operating: false,
    operatingExpenses: false,
    operatingIncome: false,
    nonOperating: false,
    netProfit: false,
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
    net_income: '本期淨利(淨損)',
  };

  // 區塊定義
  const sections = {
    basicInfo: {
      title: '基本資訊 (必填)',
      fields: ['fiscal_year', 'tax_id', 'company_name', 'account_item'],
      badge: '4 欄位'
    },
    operating: {
      title: '營業項目',
      fields: ['operating_revenue_total', 'operating_costs_total', 'gross_profit_loss', 'gross_profit_loss_net'],
      badge: '4 欄位'
    },
    operatingExpenses: {
      title: '營業費用',
      fields: ['selling_expenses', 'general_admin_expenses', 'r_and_d_expenses', 'expected_credit_loss_net', 'operating_expenses_total'],
      badge: '5 欄位'
    },
    operatingIncome: {
      title: '營業損益',
      fields: ['other_income_expense_net', 'operating_income_loss'],
      badge: '2 欄位'
    },
    nonOperating: {
      title: '營業外損益',
      fields: ['interest_income', 'other_income', 'other_gains_losses_net', 'finance_costs_net', 'equity_method_share_net', 'nonop_income_expense_total'],
      badge: '6 欄位'
    },
    netProfit: {
      title: '淨利相關',
      fields: ['profit_before_tax', 'income_tax_expense_total', 'net_income_cont_ops', 'net_income'],
      badge: '4 欄位'
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
      operating: open,
      operatingExpenses: open,
      operatingIncome: open,
      nonOperating: open,
      netProfit: open,
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
            type="text"
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
    <div className="income-statement-form">
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

export default IncomeStatementForm;
