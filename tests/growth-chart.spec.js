import { test, expect } from '@playwright/test';

test.describe('Growth Chart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should display correct legend items', async ({ page }) => {
    await page.waitForSelector('.chart-container', { timeout: 5000 });

    // 檢查是否有"營收成長"和"稅前淨利成長"圖例
    const revenueGrowthLegend = await page.locator('text=營收成長').count();
    const profitGrowthLegend = await page.locator('text=稅前淨利成長').count();

    console.log('Found "營收成長" legend:', revenueGrowthLegend);
    console.log('Found "稅前淨利成長" legend:', profitGrowthLegend);

    expect(revenueGrowthLegend).toBeGreaterThan(0);
    expect(profitGrowthLegend).toBeGreaterThan(0);
  });

  test('should display point values on line chart', async ({ page }) => {
    await page.waitForSelector('.chart-container', { timeout: 5000 });

    // 檢查有百分比符號的數值標籤
    const valueLabels = await page.locator('text=/-?\\d+\\.\\d+%/').all();
    console.log('Found percentage value labels:', valueLabels.length);

    for (const label of valueLabels.slice(0, 10)) {
      const text = await label.textContent();
      console.log('Value label:', text);
    }

    expect(valueLabels.length).toBeGreaterThan(0);
  });

  test('screenshot Growth chart', async ({ page }) => {
    await page.waitForSelector('.chart-container', { timeout: 5000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'growth-chart.png', fullPage: false });
    console.log('Screenshot saved to growth-chart.png');
  });
});
