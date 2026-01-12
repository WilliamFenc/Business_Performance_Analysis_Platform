import { useState, useEffect, useCallback } from 'react';
import CompanySelector from '../components/CompanySelector';
import StatCards from '../components/StatCards';
import InsightPanel from '../components/InsightPanel';
import FinanceChart from '../components/FinanceChart';
import ControlPanel from '../components/ControlPanel';

// API 基礎 URL（開發時使用 proxy，生產時直接使用）
const API_BASE = '/api';

function HomePage() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [financialData, setFinancialData] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 載入公司列表
  useEffect(() => {
    fetchCompanies();
  }, []);

  // 當選擇公司變更時，載入該公司的財務資料
  useEffect(() => {
    if (selectedCompany) {
      fetchFinancialData(selectedCompany);
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      // 先嘗試從 API 獲取
      const response = await fetch(`${API_BASE}/companies`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
        if (data.companies && data.companies.length > 0) {
          setSelectedCompany(data.companies[0].name);
        }
      } else {
        throw new Error('無法載入公司列表');
      }
    } catch (err) {
      console.error('載入公司列表失敗:', err);
      // API 失敗時使用 demo 資料
      const demoCompanies = [{ id: 1, name: '博弘雲端' }];
      setCompanies(demoCompanies);
      setSelectedCompany('博弘雲端');
      // 使用 demo 財務資料
      setFinancialData({
        labels: ['2021', '2022', '2023', '2024', '2025'],
        revenue: [3510, 5061, 4749, 4002, 4468],
        profit: [83, 79, 121, 161, 143],
      });
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFinancialData = async (companyName) => {
    try {
      // 使用 query string 避免 URL 編碼問題
      const response = await fetch(`${API_BASE}/financial/by-name?company=${encodeURIComponent(companyName)}`);
      if (response.ok) {
        const data = await response.json();
        setFinancialData(data.data);
        // 預設選擇最新年份
        if (data.data?.labels?.length > 0) {
          setSelectedYear(data.data.labels[data.data.labels.length - 1]);
        }
      } else {
        throw new Error('無法載入財務資料');
      }
    } catch (err) {
      console.error('載入財務資料失敗:', err);
      // 使用 demo 資料
      if (companyName === '博弘雲端') {
        setFinancialData({
          labels: ['2021', '2022', '2023', '2024', '2025'],
          revenue: [3510, 5061, 4749, 4002, 4468],
          profit: [83, 79, 121, 161, 143],
        });
        setSelectedYear('2025');
      }
    }
  };

  const handleCompanyChange = useCallback((companyName) => {
    setSelectedCompany(companyName);
  }, []);

  const handleYearChange = useCallback((year) => {
    setSelectedYear(year);
  }, []);

  const handleUpdateData = async (data) => {
    try {
      const response = await fetch(`${API_BASE}/financial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // 重新載入財務資料
        await fetchFinancialData(data.company);
      } else {
        // 本地更新 (demo 模式)
        if (selectedCompany === '博弘雲端' && financialData) {
          const idx = financialData.labels.indexOf(data.year);
          const newLabels = [...financialData.labels];
          const newRevenue = [...financialData.revenue];
          const newProfit = [...financialData.profit];

          if (idx !== -1) {
            newRevenue[idx] = data.revenue;
            newProfit[idx] = data.profit;
          } else {
            newLabels.push(data.year);
            newRevenue.push(data.revenue);
            newProfit.push(data.profit);
          }

          setFinancialData({
            labels: newLabels,
            revenue: newRevenue,
            profit: newProfit,
          });
          setSelectedYear(data.year);
        }
      }
    } catch (err) {
      console.error('更新資料失敗:', err);
      alert('更新失敗，請稍後再試');
    }
  };

  const handleBulkImport = async (action, data) => {
    if (action === 'export') {
      try {
        const response = await fetch(`${API_BASE}/export`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `多公司績效數據庫_${new Date().toISOString().slice(0, 10)}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          return;
        }
      } catch (err) {
        console.error('匯出失敗:', err);
      }

      // 本地匯出 (demo 模式)
      const exportData = [['公司名稱', '年份', '營收', '稅前淨利']];
      if (financialData) {
        financialData.labels.forEach((label, i) => {
          exportData.push([
            selectedCompany,
            label,
            financialData.revenue[i],
            financialData.profit[i],
          ]);
        });
      }
      const ws = XLSX.utils.aoa_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '所有公司績效數據');
      XLSX.writeFile(wb, `多公司績效數據庫_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else if (action === 'import' && data) {
      try {
        const response = await fetch(`${API_BASE}/financial/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        });

        if (response.ok) {
          const result = await response.json();
          // 重新載入公司列表
          await fetchCompanies();
          // 切換到第一個新公司
          if (result.companies && result.companies.length > 0) {
            setSelectedCompany(result.companies[0]);
          }
        }
      } catch (err) {
        console.error('批量匯入失敗:', err);
        alert('API 連接失敗，使用本地模式');
      }
    }
  };

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>❌ {error}</h2>
          <button onClick={fetchCompanies} className="btn-action btn-excel-in" style={{ marginTop: '15px' }}>
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" id="capture-area">
      <div className="title-box">
        <h2>經營績效分析平台</h2>
      </div>

      <CompanySelector
        companies={companies}
        selectedCompany={selectedCompany}
        onCompanyChange={handleCompanyChange}
        isLoading={isLoading}
      />

      <div id="pdfCompanyHeader" style={{ display: 'none', textAlign: 'center', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#1565c0' }}></div>

      {financialData && (
        <>
          <StatCards
            companyName={selectedCompany}
            labels={financialData.labels}
            revenue={financialData.revenue}
            profit={financialData.profit}
          />

          <InsightPanel
            labels={financialData.labels}
            revenue={financialData.revenue}
            profit={financialData.profit}
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
          />

          <FinanceChart
            labels={financialData.labels}
            revenue={financialData.revenue}
            profit={financialData.profit}
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
          />

          {/* PDF 專用擷取區域 - 隱藏顯示，僅供 PDF 匯出使用 */}
          <div id="pdf-capture-area" style={{ position: 'absolute', left: '-9999px', top: '0', width: '794px', background: '#ffffff', padding: '40px' }}>
            {/* 標題區 */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                {selectedCompany}
              </h2>
              <div style={{ fontSize: '14px', color: '#64748b' }}>經營績效分析報告</div>
            </div>

            {/* PDF 版本的績效洞察 */}
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: '#3b82f6' }}>
                  <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.55-3 6v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-3C6.19 13.55 5 11.38 5 9a7 7 0 0 1 7-7z"></path>
                  <path d="M9 21h6"></path>
                </svg>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>績效洞察 (Performance Insight)</span>
              </div>
              <div id="pdf-insight-content" style={{ fontSize: '14px', lineHeight: '1.8', color: '#475569' }}>
                {/* 績效洞察內容將由 JavaScript 動態填入 */}
              </div>
            </div>

            {/* PDF 版本的圖表區 - 使用圖片方式 */}
            <div id="pdf-chart-container" style={{ marginBottom: '20px' }}>
              {/* 圖表將由 JavaScript 動態轉換為圖片 */}
            </div>

            {/* PDF 版本的淨利率區 */}
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>
                淨利率 (Net profit margin)
              </div>
              <div id="pdf-margin-content" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                {/* 淨利率資料將由 JavaScript 動態填入 */}
              </div>
            </div>
          </div>
        </>
      )}

      <ControlPanel
        companyName={selectedCompany}
        onUpdateData={handleUpdateData}
        onBulkImport={handleBulkImport}
      />
    </div>
  );
}

export default HomePage;
