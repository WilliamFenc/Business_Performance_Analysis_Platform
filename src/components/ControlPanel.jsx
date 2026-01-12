import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function ControlPanel({ companyName, onUpdateData, onBulkImport }) {
  const [year, setYear] = useState('');
  const [revenue, setRevenue] = useState('');
  const [profit, setProfit] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpdate = () => {
    const parsedYear = year.trim();
    const parsedRevenue = parseInt(revenue);
    const parsedProfit = parseInt(profit);

    if (!parsedYear || isNaN(parsedRevenue) || isNaN(parsedProfit)) {
      alert('請輸入完整數據');
      return;
    }

    onUpdateData({
      company: companyName,
      year: parsedYear,
      revenue: parsedRevenue,
      profit: parsedProfit,
    });

    setYear('');
    setRevenue('');
    setProfit('');
  };

  const handleExportExcel = () => {
    onBulkImport('export');
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

        if (jsonData.length < 2) {
          alert('格式錯誤：Excel 檔案至少需要包含標題行和一行數據');
          return;
        }

        // 解析數據：[公司名稱, 年份, 營收, 淨利]
        const importData = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length >= 4 && row[0]) {
            const compName = String(row[0]).trim();
            const dataYear = String(row[1]);
            const dataRev = parseInt(row[2]);
            const dataPro = parseInt(row[3]);

            if (!compName || !dataYear || isNaN(dataRev) || isNaN(dataPro)) continue;

            importData.push({
              company: compName,
              year: dataYear,
              revenue: dataRev,
              profit: dataPro,
            });
          }
        }

        if (importData.length > 0) {
          onBulkImport('import', importData);
          const newCompanies = new Set(importData.map(d => d.company));
          alert(`成功匯入 ${importData.length} 筆數據，涉及 ${newCompanies.size} 間公司！`);
        } else {
          alert('沒有找到有效的數據');
        }
      } catch (error) {
        alert('匯入失敗：' + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportPDF = async () => {
    setIsProcessing(true);
    try {
      // 取得或建立 PDF 擷取區域
      const pdfArea = document.getElementById('pdf-capture-area');
      if (!pdfArea) {
        alert('找不到 PDF 匯出區域');
        return;
      }

      // 取得圖表容器用於截圖
      const chartContainer = document.querySelector('.chart-nivo-wrapper');
      if (!chartContainer) {
        alert('找不到圖表區域');
        return;
      }

      // 填入績效洞察內容
      const summaryText = document.getElementById('summaryText');
      const yearSelector = document.getElementById('yearSelector');
      const pdfInsightContent = document.getElementById('pdf-insight-content');
      if (summaryText && pdfInsightContent) {
        // 取得當前選擇的分析年度
        const selectedYear = yearSelector?.value || '';
        const yearHeader = selectedYear
          ? `<div style="font-size: 14px; font-weight: bold; color: #666; margin-bottom: 8px; margin-top: 4px;">分析年度：${selectedYear}年度</div>`
          : '';
        pdfInsightContent.innerHTML = yearHeader + summaryText.innerHTML;
      }

      // 截取圖表並轉為圖片
      const chartCanvas = await html2canvas(chartContainer, {
        scale: 4,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
      const chartImgData = chartCanvas.toDataURL('image/png');
      const pdfChartContainer = document.getElementById('pdf-chart-container');
      if (pdfChartContainer) {
        pdfChartContainer.innerHTML = `<img src="${chartImgData}" style="width: 100%; height: auto; border-radius: 8px;" />`;
      }

      // 填入淨利率資料
      const marginLabels = document.querySelectorAll('.margin-value');
      const pdfMarginContent = document.getElementById('pdf-margin-content');
      if (pdfMarginContent && marginLabels.length > 0) {
        let marginHTML = '';
        marginLabels.forEach((label) => {
          const year = label.querySelector('.margin-year')?.textContent || '';
          const percent = label.querySelector('.margin-percent')?.textContent || '';
          const isActive = label.classList.contains('margin-value-active');
          marginHTML += `
            <div style="text-align: center; padding: 8px 16px; background: ${isActive ? '#dbeafe' : '#f1f5f9'}; border-radius: 8px; min-width: 80px;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">${year}</div>
              <div style="font-size: 16px; font-weight: bold; color: ${isActive ? '#2563eb' : '#475569'};">${percent}</div>
            </div>
          `;
        });
        pdfMarginContent.innerHTML = marginHTML;
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      // 擷取整個 PDF 區域（4K 解析度）
      const canvas = await html2canvas(pdfArea, {
        scale: 4,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: 794,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      // 建立直式 A4 PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 15;

      const imgRatio = canvas.width / canvas.height;
      let finalWidth = pdfWidth - margin * 2;
      let finalHeight = finalWidth / imgRatio;

      const x = margin;
      const y = margin;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      pdf.save(`${companyName}_經營績效分析.pdf`);

      // 清空 PDF 临时内容
      if (pdfInsightContent) pdfInsightContent.innerHTML = '';
      if (pdfChartContainer) pdfChartContainer.innerHTML = '';
      if (pdfMarginContent) pdfMarginContent.innerHTML = '';

    } catch (error) {
      alert('匯出失敗：' + error.message);
      console.error('PDF export error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="control-panel" data-html2canvas-ignore="true">
      <div className="panel-header">
        <h3>🛠️ 數據與檔案管理</h3>
        <div className="btn-group">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            style={{ display: 'none' }}
            onChange={handleImportExcel}
          />
          <button
            className="btn-action btn-excel-in"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            📥 匯入多公司 Excel
          </button>
          <button
            className="btn-action btn-excel-out"
            onClick={handleExportExcel}
            disabled={isProcessing}
          >
            📤 匯出所有資料(另存)
          </button>
          <button
            className="btn-action btn-pdf"
            onClick={handleExportPDF}
            disabled={isProcessing}
          >
            {isProcessing ? '⏳ 處理中...' : '📄 下載 PDF'}
          </button>
        </div>
      </div>

      <div className="input-group">
        <div className="input-wrapper">
          <label>年份 (Year)</label>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="如: 2026"
          />
        </div>
        <div className="input-wrapper">
          <label>營收 (Revenue)</label>
          <input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="百萬元"
          />
        </div>
        <div className="input-wrapper">
          <label>稅前淨利 (Profit)</label>
          <input
            type="number"
            value={profit}
            onChange={(e) => setProfit(e.target.value)}
            placeholder="百萬元"
          />
        </div>
        <button className="btn-action btn-update" onClick={handleUpdate}>
          更新目前公司數據
        </button>
      </div>
      <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
        * 匯入 Excel 格式建議：第一欄為「公司名稱」，接著是「年份」、「營收」、「稅前淨利」。<br />
        * 匯入後，上方的選單會自動出現所有公司。匯出時會將所有公司的最新數據存為一個檔案。
      </p>
    </div>
  );
}

export default ControlPanel;
