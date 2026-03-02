import { test, expect } from '@playwright/test';

test.describe('精確圖表對齊檢查', () => {
  test('測量長條圖與折線圖的對齊', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 使用更通用的選擇器
    const allRects = await page.locator('.chart-nivo-container rect').all();
    const allCircles = await page.locator('.chart-nivo-container circle').all();

    console.log('找到的矩形數量:', allRects.length);
    console.log('找到的圓形數量:', allCircles.length);

    // 找出長條圖的矩形（通常有 data-width 屬性）
    const barRects = [];
    for (const rect of allRects) {
      const width = await rect.getAttribute('width');
      const dataValue = await rect.getAttribute('data-value');
      if (width && parseFloat(width) > 10) {  // 過濾掉細小的裝飾元素
        const box = await rect.boundingBox();
        if (box) {
          barRects.push({
            element: rect,
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            centerX: box.x + box.width / 2,
            dataValue
          });
        }
      }
    }

    console.log('識別出的長條圖數量:', barRects.length);

    // 獲取折線圖圓點
    const linePoints = [];
    for (const circle of allCircles) {
      const box = await circle.boundingBox();
      if (box && box.width > 5) {  // 過濾掉小點
        linePoints.push({
          element: circle,
          centerX: box.x + box.width / 2,
          centerY: box.y + box.height / 2
        });
      }
    }

    console.log('識別出的折線點數量:', linePoints.length);

    // 計算對齊
    if (barRects.length > 0 && linePoints.length > 0) {
      console.log('\n對齊分析:');
      for (let i = 0; i < Math.min(barRects.length, linePoints.length); i++) {
        const bar = barRects[i];
        const point = linePoints[i];
        const diff = Math.abs(bar.centerX - point.centerX);
        console.log(`  長條 ${i}: 中心X=${bar.centerX.toFixed(2)}, 寬度=${bar.width.toFixed(2)}`);
        console.log(`  端點 ${i}: 中心X=${point.centerX.toFixed(2)}`);
        console.log(`  差距: ${diff.toFixed(2)}px ${diff < 3 ? '✅' : '⚠️'}`);
      }

      const avgDiff = barRects.reduce((sum, bar, i) => {
        if (i < linePoints.length) {
          return sum + Math.abs(bar.centerX - linePoints[i].centerX);
        }
        return sum;
      }, 0) / Math.min(barRects.length, linePoints.length);

      console.log(`\n平均對齊誤差: ${avgDiff.toFixed(2)}px`);

      if (avgDiff < 5) {
        console.log('✅ 對齊良好！');
      } else {
        console.log('⚠️ 需要調整對齊');
      }
    }

    // 截圖
    await page.screenshot({ path: 'alignment-precise.png', fullPage: true });
  });

  test('檢查 Y 軸樣式', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 檢查 Y 軸文字
    const chartTexts = await page.locator('.chart-nivo-container text').all();

    for (const text of chartTexts) {
      const content = await text.textContent();
      const box = await text.boundingBox();

      // Y 軸數字通常在左側
      if (box && box.x < 80 && content && /^\d/.test(content.trim())) {
        const styles = await text.evaluate((el) => window.getComputedStyle(el));
        console.log(`Y軸文字 "${content.trim()}":`);
        console.log(`  顏色: ${styles.fill}`);
        console.log(`  字體大小: ${styles.fontSize}`);
        console.log(`  位置: x=${box.x.toFixed(0)}`);
      }
    }

    // Y 軸應該是深色 (#475569 = rgb(71, 85, 105))
    // 顏色對比度應該足夠高
    await page.screenshot({ path: 'yaxis-style-check.png', fullPage: false });
  });
});
