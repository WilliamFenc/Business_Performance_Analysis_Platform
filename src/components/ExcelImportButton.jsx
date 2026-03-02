/**
 * ExcelImportButton - Excel 匯入按鈕組件
 * 提供檔案選擇和觸發匯入預覽
 */
import { useRef, useState } from 'react';
import { parseExcelFile, isValidExcelFile } from '../utils/excelParser';

function ExcelImportButton({ onImportStart, onImportComplete, onError }) {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 驗證檔案格式
    if (!isValidExcelFile(file)) {
      onError?.({
        type: 'INVALID_FILE_FORMAT',
        message: '請選擇 .xlsx 或 .xls 格式的 Excel 檔案'
      });
      return;
    }

    setIsLoading(true);
    onImportStart?.();

    try {
      // 解析 Excel 檔案
      const parsedData = await parseExcelFile(file);

      // 通知父組件顯示預覽
      onImportComplete?.(parsedData);
    } catch (error) {
      onError?.({
        type: 'PARSE_ERROR',
        message: error.message
      });
    } finally {
      setIsLoading(false);
      // 清空檔案輸入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <button
        className="btn-secondary"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? '📥 解析中...' : '📥 從 Excel 匯入'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
}

export default ExcelImportButton;
