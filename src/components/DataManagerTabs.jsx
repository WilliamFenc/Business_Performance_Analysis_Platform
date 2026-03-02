/**
 * DataManagerTabs - 數據管理視圖切換標籤
 * 提供財務報表與損益表的切換，以及 Excel 匯入/匯出功能
 */
import ExcelImportButton from './ExcelImportButton';
import ExcelExportButton from './ExcelExportButton';

function DataManagerTabs({
  activeReportTab = 'financial-basics',
  onTabChange,
  financialBasicsContent,
  plIncomeContent,
  onAddNew,
  onImportStart,
  onImportComplete,
  onImportError,
  exportFilters = {}
}) {
  return (
    <div>
      <div className="data-manager-header">
        <div className="data-manager-tabs">
          <button
            className={`tab-button ${activeReportTab === 'financial-basics' ? 'active' : ''}`}
            onClick={() => onTabChange('financial-basics')}
          >
            📊 財務報表
          </button>
          <button
            className={`tab-button ${activeReportTab === 'pl-income' ? 'active' : ''}`}
            onClick={() => onTabChange('pl-income')}
          >
            💰 損益表
          </button>
        </div>

        <div className="data-manager-actions">
          <button
            className="btn-primary"
            onClick={() => onAddNew(activeReportTab)}
          >
            + 新增資料
          </button>
          <ExcelImportButton
            onImportStart={onImportStart}
            onImportComplete={onImportComplete}
            onError={onImportError}
          />
          <ExcelExportButton
            tableType={activeReportTab}
            filters={exportFilters}
          />
        </div>
      </div>

      <div className="tab-content">
        {activeReportTab === 'financial-basics' ? financialBasicsContent : plIncomeContent}
      </div>
    </div>
  );
}

export default DataManagerTabs;
