import { test, expect } from '@playwright/test';

test('檢查所有公司的圖表對齊', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const companySelect = page.locator('#companySelector');

  // 獲取所有公司選項
  const options = await companySelect.locator('option').all();
  const companyNames = [];

  for (const option of options) {
    const name = await option.textContent();
    if (name && !name.includes('請選擇')) {
      companyNames.push(name.trim());
    }
  }

  console.log('找到', companyNames.length, '家公司');

  // 檢查前 5 家公司的對齊
  for (let i = 0; i < Math.min(5, companyNames.length); i++) {
    const companyName = companyNames[i];
    console.log(`\n=== 測試: ${companyName} ===`);

    await companySelect.selectOption(companyName);
    await page.waitForTimeout(800);

    // 截圖
    await page.screenshot({ path: `verify-company-${i}.png`, fullPage: true });

    // 檢查對齊
    const allRects = await page.locator('.chart-nivo-container rect').all();
    const bars = [];

    for (const rect of allRects) {
      const width = await rect.getAttribute('width');
      if (width) {
        const w = parseFloat(width);
        if (w >= 20 && w <= 200) {
          const box = await rect.boundingBox();
          if (box) {
            bars.push({ x: box.x + box.width / 2, width: w });
          }
        }
      }
    }
    bars.sort((a, b) => a.x - b.x);

    // 只檢查白色內圈圓點
    const allCircles = await page.locator('.chart-nivo-container circle[fill="#ffffff"]').all();
    const points = [];

    for (const circle of allCircles) {
      const box = await circle.boundingBox();
      if (box) {
        points.push({ x: box.x + box.width / 2 });
      }
    }
    points.sort((a, b) => a.x - b.x);

    console.log(`  長條圖: ${bars.length}個, 折線點: ${points.length}個`);

    if (bars.length > 0 && points.length > 0) {
      let totalDiff = 0;
      for (let j = 0; j < Math.min(bars.length, points.length); j++) {
        totalDiff += Math.abs(bars[j].x - points[j].x);
      }
      const avgDiff = totalDiff / Math.min(bars.length, points.length);
      console.log(`  平均差距: ${avgDiff.toFixed(2)}px ${avgDiff < 5 ? '✅' : '⚠️'}`);
    }
  }
});
