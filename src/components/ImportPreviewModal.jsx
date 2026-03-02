/**
 * ImportPreviewModal - Excel 匯入預覽對話框
 * 顯示將新增/更新的筆數、錯誤警告、確認後執行匯入
 */
import { useState } from 'react';

function ImportPreviewModal({
  isOpen = false,
  parsedData = null,
  onConfirm,
  onCancel
}) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  const financialBasicsStats = parsedData?.financialBasics
    ? {
        toInsert: parsedData.financialBasics.records.length,
        toUpdate: 0,
        errors: parsedData.warnings.filter(w => w.includes('財務報表'))
      }
    : null;

  const plIncomeStats = parsedData?.plIncome
    ? {
        toInsert: parsedData.plIncome.records.length,
        toUpdate: 0,
        errors: parsedData.warnings.filter(w => w.includes('損益表'))
      }
    : null;

  const totalWarnings = parsedData?.warnings || [];

  const handleConfirm = async () => {
    setIsImporting(true);

    try {
      const results = {};

      // 匯入財務報表
      if (parsedData.financialBasics) {
        const response = await fetch('/api/financial-basics/batch-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            records: parsedData.financialBasics.records
          })
        });
        const data = await response.json();
        results.financialBasics = data.data;
      }

      // 匯入損益表
      if (parsedData.plIncome) {
        const response = await fetch('/api/pl-income/batch-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            records: parsedData.plIncome.records
          })
        });
        const data = await response.json();
        results.plIncome = data.data;
      }

      setImportResult(results);
      onConfirm?.(results);

      // 匯入成功後自動重新整理網頁
      if (!results.error) {
        setTimeout(() => {
          window.location.reload();
        }, 1500); // 1.5 秒後重新整理，讓使用者看到成功訊息
      }
    } catch (error) {
      console.error('匯入錯誤:', error);
      setImportResult({
        error: error.message
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (importResult) {
      // 如果已完成匯入，關閉會重新整理
      onConfirm?.(importResult);
    }
    onCancel?.();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content import-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📥 Excel 匯入預覽</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {importResult ? (
            // 顯示匯入結果
            <div className="import-result">
              {importResult.error ? (
                <div className="error-message">
                  ❌ 匯入失敗：{importResult.error}
                </div>
              ) : (
                <>
                  <h3>✅ 匯入完成</h3>

                  {importResult.financialBasics && (
                    <div className="result-section">
                      <p>📊 財務報表：
                        成功 {importResult.financialBasics.inserted + importResult.financialBasics.updated} 筆
                        （新增 {importResult.financialBasics.inserted}，更新 {importResult.financialBasics.updated}）
                        {importResult.financialBasics.skipped > 0 && `，跳過 ${importResult.financialBasics.skipped}`}
                      </p>
                      {importResult.financialBasics.errors?.length > 0 && (
                        <div className="error-details">
                          <details>
                            <summary>錯誤詳情</summary>
                            <ul>
                              {importResult.financialBasics.errors.map((err, i) => (
                                <li key={i}>第 {err.row} 筆：{err.reason}</li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      )}
                    </div>
                  )}

                  {importResult.plIncome && (
                    <div className="result-section">
                      <p>💰 損益表：
                        成功 {importResult.plIncome.inserted + importResult.plIncome.updated} 筆
                        （新增 {importResult.plIncome.inserted}，更新 {importResult.plIncome.updated}）
                        {importResult.plIncome.skipped > 0 && `，跳過 ${importResult.plIncome.skipped}`}
                      </p>
                      {importResult.plIncome.errors?.length > 0 && (
                        <div className="error-details">
                          <details>
                            <summary>錯誤詳情</summary>
                            <ul>
                              {importResult.plIncome.errors.map((err, i) => (
                                <li key={i}>第 {err.row} 筆：{err.reason}</li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="result-note">🔄 頁面將自動重新整理以載入最新資料...</p>
                </>
              )}
            </div>
          ) : (
            // 顯示預覽資訊
            <>
              {financialBasicsStats && (
                <div className="preview-section">
                  <h4>📊 財務報表</h4>
                  <p>將新增：{financialBasicsStats.toInsert} 筆</p>
                  <p>將更新：{financialBasicsStats.toUpdate} 筆</p>
                </div>
              )}

              {plIncomeStats && (
                <div className="preview-section">
                  <h4>💰 損益表</h4>
                  <p>將新增：{plIncomeStats.toInsert} 筆</p>
                  <p>將更新：{plIncomeStats.toUpdate} 筆</p>
                </div>
              )}

              {totalWarnings.length > 0 && (
                <div className="warning-section">
                  <h4>⚠️ 注意事項</h4>
                  <ul>
                    {totalWarnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="import-warning">⚠️ 警告：匯入將覆蓋現有資料，請確認後繼續</p>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={handleClose}
            disabled={isImporting}
          >
            {importResult ? '關閉' : '取消'}
          </button>
          {!importResult && (
            <button
              className="btn-primary"
              onClick={handleConfirm}
              disabled={isImporting}
            >
              {isImporting ? '匯入中...' : '確定匯入'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportPreviewModal;
