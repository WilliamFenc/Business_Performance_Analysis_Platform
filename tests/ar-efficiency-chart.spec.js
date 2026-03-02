import { test, expect } from '@playwright/test';

test.describe('AR Efficiency Chart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should display X-axis year labels', async ({ page }) => {
    // 等待圖表載入
    await page.waitForSelector('.chart-container', { timeout: 5000 });

    // 檢查 X 軸年度標籤是否存在
    const yearLabels = await page.locator('text=/202[0-4]/').all();
    console.log('Found year labels:', yearLabels.length);

    // 應該有年度標籤
    expect(yearLabels.length).toBeGreaterThan(0);
  });

  test('should display bar values on top', async ({ page }) => {
    // 等待圖表載入
    await page.waitForSelector('.chart-container', { timeout: 5000 });

    // 檢查是否有 "次" 的標籤（數值標籤）
    const valueLabels = await page.locator('text=/\\d+\\.\\d+\\s*次/').all();
    console.log('Found value labels with "次":', valueLabels.length);

    // 列出所有找到的標籤
    for (const label of valueLabels) {
      const text = await label.textContent();
      console.log('Value label:', text);
    }

    // 應該有數值標籤
    expect(valueLabels.length).toBeGreaterThan(0);
  });

  test('screenshot AR Efficiency chart', async ({ page }) => {
    // 等待圖表載入
    await page.waitForSelector('.chart-container', { timeout: 5000 });
    await page.waitForTimeout(1000);

    // 截圖
    await page.screenshot({ path: 'ar-efficiency-chart.png', fullPage: false });
    console.log('Screenshot saved to ar-efficiency-chart.png');
  });
});
