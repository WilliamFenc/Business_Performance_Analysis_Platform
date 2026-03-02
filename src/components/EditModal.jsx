import { useState } from 'react';
import FinancialReportForm from './FinancialReportForm';
import IncomeStatementForm from './IncomeStatementForm';

/**
 * EditModal - 編輯/新增資料的彈窗組件
 * 支援多種表單類型：財務報表、損益表
 */
function EditModal({
  isOpen,
  mode = 'create',
  reportType = 'financial-basics', // 'financial-basics' or 'pl-income'
  initialValues,
  companies,
  onSave,
  onClose
}) {
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const getModalTitle = () => {
    const modeText = mode === 'create' ? '➕ 新增' : '✏️ 編輯';
    const reportText = reportType === 'financial-basics' ? '財務報表' : '損益表';
    return `${modeText} ${reportText}`;
  };

  const handleSave = async (data) => {
    setIsSaving(true);
    try {
      await onSave(data, reportType);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container modal-container-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{getModalTitle()}</h2>
          {mode === 'edit' && initialValues && (
            <span className="modal-subtitle">
              {initialValues.company_name} - {initialValues.fiscal_year}
            </span>
          )}
        </div>

        <div className="modal-body modal-body-scroll">
          {reportType === 'financial-basics' ? (
            <FinancialReportForm
              mode={mode}
              initialValues={initialValues}
              companies={companies}
              onSave={handleSave}
              onCancel={onClose}
            />
          ) : (
            <IncomeStatementForm
              mode={mode}
              initialValues={initialValues}
              companies={companies}
              onSave={handleSave}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default EditModal;
