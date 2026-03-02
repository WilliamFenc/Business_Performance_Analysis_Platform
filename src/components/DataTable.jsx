import { useState, useMemo } from 'react';

/**
 * DataTable - 數據表格組件
 * 顯示財務資料，支援動態欄位、排序、篩選、分頁、水平捲動、欄位凍結
 */
function DataTable({
  data,
  columns,
  onEdit,
  onDelete,
  stickyColumns = 2
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(columns?.[0]?.key || 'company');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({ search: '' });

  const itemsPerPage = 10;

  // 排序與篩選邏輯
  const processedData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    let result = [...data];

    // 搜尋篩選
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some(val =>
          String(val ?? '').toLowerCase().includes(searchLower)
        )
      );
    }

    // 排序
    if (sortBy) {
      result.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        // 處理 null/undefined
        if (aVal == null) aVal = '';
        if (bVal == null) bVal = '';

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, sortBy, sortOrder]);

  // 分頁邏輯
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIndicator = (column) => {
    if (sortBy !== column) return '';
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  const formatCellValue = (value, column) => {
    if (value == null || value === '') return '-';

    // 年度欄位不格式化千分位
    if (column === 'fiscal_year' || column === 'year') {
      return String(value);
    }

    // 數值格式化（假設金額類型欄位）
    if (typeof value === 'number') {
      // 如果是大的數字，加上千分位
      if (Math.abs(value) >= 1000) {
        return value.toLocaleString('zh-TW', { maximumFractionDigits: 0 });
      }
      return value.toString();
    }

    return String(value);
  };

  if (!data || data.length === 0) {
    return (
      <div className="data-table-container">
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          暫無數據
        </div>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      {/* 篩選器 */}
      <div className="table-filters">
        <input
          type="text"
          placeholder="搜尋所有欄位..."
          value={filters.search}
          onChange={(e) => {
            setFilters({ search: e.target.value });
            setCurrentPage(1);
          }}
          className="table-search-input"
        />
      </div>

      {/* 表格容器 - 支援水平捲動 */}
      <div className="data-table-scroll-container">
        <table className="data-table data-table-multi-column">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                  className={col.sticky ? 'sticky' : ''}
                  style={{ left: col.stickyIndex !== undefined ? `${col.stickyIndex * 100}px` : undefined }}
                >
                  {col.label} {col.sortable !== false && getSortIndicator(col.key)}
                </th>
              ))}
              <th className="sticky action-column">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={`${row.tax_id || row.company_id}-${row.fiscal_year || row.year}-${idx}`}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={col.sticky ? 'sticky' : ''}
                    style={{ left: col.stickyIndex !== undefined ? `${col.stickyIndex * 100}px` : undefined }}
                  >
                    {formatCellValue(row[col.key], col.key)}
                  </td>
                ))}
                <td className="sticky action-column">
                  <button
                    className="table-action-btn edit"
                    onClick={() => onEdit(row)}
                    title="編輯"
                  >
                    ✏️
                  </button>
                  <button
                    className="table-action-btn delete"
                    onClick={() => onDelete(row)}
                    title="刪除"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="pagination-btn"
          >
            上一頁
          </button>
          <span className="pagination-info">
            第 {currentPage} 頁，共 {totalPages} 頁
            {processedData.length > itemsPerPage && ` (共 ${processedData.length} 筆)`}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="pagination-btn"
          >
            下一頁
          </button>
        </div>
      )}

      {processedData.length === 0 && filters.search && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
          沒有符合條件的數據
        </div>
      )}
    </div>
  );
}

// 預設的簡化版欄位配置（用於向後相容）
DataTable.defaultColumns = [
  { key: 'company', label: '公司名稱', sticky: true, stickyIndex: 0 },
  { key: 'year', label: '年份', sticky: true, stickyIndex: 1 },
  { key: 'revenue', label: '營收（百萬元）' },
  { key: 'profit', label: '稅前淨利（百萬元）' },
];

export default DataTable;
