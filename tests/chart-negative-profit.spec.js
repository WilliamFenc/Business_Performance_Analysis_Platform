import { test, expect } from '@playwright/test';

test('檢查富鴻網（負淨利）對齊', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 選擇富鴻網（有負淨利）
  const companySelect = page.locator('#companySelector');
  await companySelect.selectOption('富鴻網科技股份有限公司');
  await page.waitForTimeout(1000);

  // 截圖
  await page.screenshot({ path: 'verify-fuhong-alignment.png', fullPage: true });

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

  // 只檢查有實際填色的圓點（白色內圈）
  const allCircles = await page.locator('.chart-nivo-container circle[fill="#ffffff"]').all();
  const points = [];

  for (const circle of allCircles) {
    const box = await circle.boundingBox();
    if (box) {
      points.push({ x: box.x + box.width / 2 });
    }
  }
  points.sort((a, b) => a.x - b.x);

  console.log('富鴻網（負淨利）:');
  console.log(`  長條圖數量: ${bars.length}`);
  console.log(`  折線點數量: ${points.length}`);

  for (let i = 0; i < Math.min(bars.length, points.length); i++) {
    const diff = Math.abs(bars[i].x - points[i].x);
    console.log(`  ${i + 1}. 長條=${bars[i].x.toFixed(1)}, 折線=${points[i].x.toFixed(1)}, 差距=${diff.toFixed(1)}px ${diff < 5 ? '✅' : '⚠️'}`);
  }

  const avgDiff = bars.reduce((sum, bar, i) => {
    if (i < points.length) {
      return sum + Math.abs(bar.x - points[i].x);
    }
    return sum;
  }, 0) / Math.min(bars.length, points.length);

  console.log(`\n平均差距: ${avgDiff.toFixed(2)}px`);

  if (avgDiff < 5) {
    console.log('✅ 對齊優良！');
  } else {
    console.log('⚠️ 對齊需要改善');
  }
});
