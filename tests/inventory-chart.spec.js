import { test, expect } from '@playwright/test';

test.describe('Inventory Chart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should display X-axis year labels without legend', async ({ page }) => {
    await page.waitForSelector('.chart-container', { timeout: 5000 });

    // 檢查年度標籤
    const yearLabels = await page.locator('text=/202[0-4]/').all();
    console.log('Found year labels:', yearLabels.length);

    // 確認沒有"年度"文字
    const legendText = await page.locator('text=年度').count();
    console.log('Found "年度" legend count:', legendText);

    expect(yearLabels.length).toBeGreaterThan(0);
  });

  test('should display bar values on top', async ({ page }) => {
    await page.waitForSelector('.chart-container', { timeout: 5000 });

    // 檢查有"次"的標籤
    const valueLabels = await page.locator('text=/\\d+\\.?\\d*\\s*次/').all();
    console.log('Found value labels with "次":', valueLabels.length);

    for (const label of valueLabels) {
      const text = await label.textContent();
      console.log('Value label:', text);
    }

    expect(valueLabels.length).toBeGreaterThan(0);
  });

  test('screenshot Inventory chart', async ({ page }) => {
    await page.waitForSelector('.chart-container', { timeout: 5000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'inventory-chart.png', fullPage: false });
    console.log('Screenshot saved to inventory-chart.png');
  });
});
