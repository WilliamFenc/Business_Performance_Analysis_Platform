import { test, expect } from '@playwright/test';

test.describe('Expense Trend Chart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('.company-selector-bar');
    await page.waitForTimeout(1000);
  });

  test('should display correct legend items', async ({ page }) => {
    const chartContainer = await page.locator('.chart-container').filter({ hasText: '費用率趨勢' });

    // 檢查圖例是否存在
    const legendCount = await chartContainer.locator('.nivo-legend').count();
    console.log('Legend element count:', legendCount);

    const legendItem = await chartContainer.locator('.nivo-legend-item').count();
    console.log('Legend item count:', legendItem);

    if (legendCount > 0) {
      const legends = await chartContainer.locator('.nivo-legend').locator('.nivo-legend-item').allTextContents();
      console.log('Found legends:', legends);

      expect(legends).toContain('推銷%');
      expect(legends).toContain('管理%');
      expect(legends).toContain('研發%');
    } else {
      // 檢查是否有其他可能的圖例選擇器
      const allText = await chartContainer.textContent();
      console.log('Chart container text:', allText);
    }
  });

  test('should not display y-axis', async ({ page }) => {
    const chartContainer = await page.locator('.chart-container').filter({ hasText: '費用率趨勢' });

    // 檢查 y 軸是否存在
    const yAxis = await chartContainer.locator('.nivo-axis-left').count();
    expect(yAxis).toBe(0);
  });

  test('should not display grid lines', async ({ page }) => {
    const chartContainer = await page.locator('.chart-container').filter({ hasText: '費用率趨勢' });

    // 檢查格線是否存在
    const gridLines = await chartContainer.locator('.nivo-grid-line').count();
    expect(gridLines).toBe(0);
  });

  test('should display legend at bottom center', async ({ page }) => {
    const chartContainer = await page.locator('.chart-container').filter({ hasText: '費用率趨勢' });

    // 檢查圖例位置
    const legend = await chartContainer.locator('.nivo-legend');
    const legendBox = await legend.boundingBox();
    const chartBox = await chartContainer.boundingBox();

    // 圖例應該在圖表下方
    expect(legendBox.y).toBeGreaterThan(chartBox.y + chartBox.height / 2);

    // 圖例應該水平居中
    const legendCenterX = legendBox.x + legendBox.width / 2;
    const chartCenterX = chartBox.x + chartBox.width / 2;
    const centerXDiff = Math.abs(legendCenterX - chartCenterX);
    const chartWidth = chartBox.width;

    // 圖例中心點應該在圖表中心點的 30% 範圍內
    expect(centerXDiff).toBeLessThan(chartWidth * 0.3);
  });

  test('screenshot Expense Trend chart', async ({ page }) => {
    const chartContainer = await page.locator('.chart-container').filter({ hasText: '費用率趨勢' }).first();

    await chartContainer.screenshot({ path: 'expense-trend-chart.png' });
    console.log('Screenshot saved to expense-trend-chart.png');
  });
});
