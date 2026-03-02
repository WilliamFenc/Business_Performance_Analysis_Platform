import { test, expect } from '@playwright/test';

test.describe('財務指標圖表顯示測試', () => {
  test('應該正確顯示 KPI 卡片和圖表', async ({ page }) => {
    // 設定監聽 console 錯誤
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // 前往首頁
    await page.goto('http://localhost:5173');

    // 等待頁面載入
    await page.waitForLoadState('networkidle');

    // 檢查資料庫狀態指示器（根據實際樣式）
    const dbStatus = await page.locator('text=/DB:.*Supabase/').count();
    console.log('資料庫狀態指示器數量:', dbStatus);

    // 檢查是否有 "無法載入財務指標資料" 錯誤訊息
    const errorMessage = page.locator('text=/無法載入.*資料/');
    const hasError = await errorMessage.count();
    console.log('錯誤訊息數量:', hasError);

    if (hasError > 0) {
      const errorText = await errorMessage.first().textContent();
      console.log('發現錯誤訊息:', errorText);
    }

    // 檢查圖表區域（KPIAndChartsSection 和 FinancialDataTable）
    const chartSections = await page.locator('text=/營收|淨利|財務指標/').count();
    console.log('圖表相關文字元素數量:', chartSections);

    // 檢查是否有 SVG 圖表元素
    const svgCount = await page.locator('svg').count();
    console.log('SVG 元素數量:', svgCount);

    // 檢查公司選擇器
    const companySelector = page.locator('select, [role="combobox"]');
    const companyCount = await companySelector.count();
    console.log('選擇器數量:', companyCount);

    // 輸出所有 console 錯誤
    if (errors.length > 0) {
      console.log('Console 錯誤:', errors);
    }

    // 截圖
    await page.screenshot({ path: 'screenshots/charts-test.png', fullPage: true });
    console.log('截圖已儲存至 screenshots/charts-test.png');

    // 如果有錯誤訊息顯示在頁面上，測試失敗
    expect(hasError).toBe(0);
  });

  test('API 應該返回正確的財務指標資料', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/financial/basics?company=博弘雲端');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    console.log('API 回應成功:', data.success);
    console.log('資料年份:', data.data?.years);

    expect(data.success).toBe(true);
    expect(data.data.years).toBeDefined();
    expect(data.data.metrics).toBeDefined();
  });
});
