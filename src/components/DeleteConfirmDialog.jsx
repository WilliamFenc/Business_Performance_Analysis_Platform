/**
 * DeleteConfirmDialog - 刪除確認對話框
 * 顯示將刪除的數據摘要，提供二次確認
 */
function DeleteConfirmDialog({ isOpen, record, onConfirm, onCancel }) {
  if (!isOpen || !record) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container confirm-dialog">
        <div className="modal-header">
          <h2>⚠️ 確認刪除</h2>
        </div>

        <div className="confirm-content">
          <p>您確定要刪除以下數據嗎？</p>
          <div className="record-details">
            <div><strong>公司:</strong> {record.company_name || record.company}</div>
            <div><strong>年度:</strong> {record.fiscal_year || record.year}</div>
            {record.revenue !== undefined && (
              <div><strong>營收:</strong> {record.revenue.toLocaleString()} 百萬元</div>
            )}
            {record.profit !== undefined && (
              <div><strong>淨利:</strong> {record.profit.toLocaleString()} 百萬元</div>
            )}
          </div>
          <p style={{ marginTop: '12px', fontSize: '12px' }}>
            此操作無法復原 (除非使用 Undo)
          </p>
        </div>

        <div className="modal-footer confirm-footer">
          <button className="modal-btn confirm-btn-cancel" onClick={onCancel}>
            取消
          </button>
          <button className="modal-btn confirm-btn-confirm" onClick={onConfirm}>
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmDialog;
