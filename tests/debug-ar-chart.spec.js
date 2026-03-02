import { test, expect } from '@playwright/test';

test.describe('AR Efficiency Chart Debug', () => {
  test('debug bar values', async ({ page }) => {
    // 監聽控制台
    page.on('console', msg => {
      if (msg.text().includes('BarLabelsLayer') || msg.text().includes('bar')) {
        console.log('Browser console:', msg.text());
      }
    });

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 截圖
    await page.screenshot({ path: 'debug-ar-chart.png' });

    // 檢查圖表中的數值元素
    const valueTexts = await page.locator('.nivo-bar text').all();
    console.log('Found nivo-bar text elements:', valueTexts.length);

    for (let i = 0; i < Math.min(valueTexts.length, 10); i++) {
      const text = await valueTexts[i].textContent();
      const style = await valueTexts[i].evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          fill: computed.fill,
          fontSize: computed.fontSize,
          display: computed.display,
          visibility: computed.visibility,
        };
      });
      console.log(`Text ${i}:`, text, style);
    }
  });
});
