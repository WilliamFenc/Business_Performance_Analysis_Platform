import { test, expect } from '@playwright/test';

test('精確驗證圖表對齊（按 X 位置排序）', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 獲取所有長條圖（寬度在合理範圍內）
  const allRects = await page.locator('.chart-nivo-container rect').all();
  const bars = [];

  for (const rect of allRects) {
    const width = await rect.getAttribute('width');
    if (width) {
      const w = parseFloat(width);
      // 只選擇寬度合理的長條圖（20-200px 之間）
      if (w >= 20 && w <= 200) {
        const box = await rect.boundingBox();
        if (box) {
          bars.push({
            x: box.x + box.width / 2, // 中心 X
            y: box.y,
            width: box.width
          });
        }
      }
    }
  }

  // 按 X 位置排序
  bars.sort((a, b) => a.x - b.x);

  // 獲取所有折線圖端點
  const allCircles = await page.locator('.chart-nivo-container circle').all();
  const points = [];

  for (const circle of allCircles) {
    const r = await circle.getAttribute('r');
    if (r) {
      const radius = parseFloat(r);
      // 只選擇合理大小的圓點
      if (radius >= 3) {
        const box = await circle.boundingBox();
        if (box) {
          points.push({
            x: box.x + box.width / 2, // 中心 X
            y: box.y + box.height / 2,
            radius
          });
        }
      }
    }
  }

  // 按 X 位置排序
  points.sort((a, b) => a.x - b.x);

  console.log('長條圖數量:', bars.length);
  console.log('折線點數量:', points.length);
  console.log('\n對齊檢查（按 X 位置排序）:');

  let totalDiff = 0;
  let maxDiff = 0;

  for (let i = 0; i < Math.min(bars.length, points.length); i++) {
    const diff = Math.abs(bars[i].x - points[i].x);
    totalDiff += diff;
    maxDiff = Math.max(maxDiff, diff);
    console.log(`  ${i + 1}. 長條中心=${bars[i].x.toFixed(1)}, 折線點=${points[i].x.toFixed(1)}, 差距=${diff.toFixed(1)}px ${diff < 5 ? '✅' : '⚠️'}`);
  }

  const avgDiff = totalDiff / Math.min(bars.length, points.length);
  console.log(`\n平均差距: ${avgDiff.toFixed(2)}px`);
  console.log(`最大差距: ${maxDiff.toFixed(2)}px`);

  if (avgDiff < 5 && maxDiff < 10) {
    console.log('✅ 對齊優良！');
  } else {
    console.log('⚠️ 對齊需要改善');
  }

  // 截圖
  await page.screenshot({ path: 'alignment-final.png', fullPage: true });
});

test('Y 軸可見性檢查', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 檢查左側的 Y 軸文字（位置 X < 100）
  const texts = await page.locator('.chart-nivo-container text').all();
  let yAxisFound = false;

  for (const text of texts) {
    const box = await text.boundingBox();
    if (box && box.x < 100 && box.x > 20) {
      const content = await text.textContent();
      if (content && /^\d/.test(content.trim())) {
        const styles = await text.evaluate((el) => window.getComputedStyle(el));
        if (!yAxisFound) {
          console.log('\nY 軸樣式:');
          console.log(`  顏色: ${styles.fill}`);
          console.log(`  字體大小: ${styles.fontSize}`);
          console.log(`  字體粗細: ${styles.fontWeight}`);
          yAxisFound = true;

          // 檢查顏色是否足夠深
          const rgb = styles.fill.match(/\d+/g);
          if (rgb) {
            const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
            console.log(`  亮度值: ${brightness.toFixed(0)} (越低越深)`);
            if (brightness < 128) {
              console.log('  ✅ 顏色對比度良好');
            } else {
              console.log('  ⚠️ 顏色太淺');
            }
          }
        }
      }
    }
  }

  await page.screenshot({ path: 'yaxis-final.png', fullPage: false });
});
