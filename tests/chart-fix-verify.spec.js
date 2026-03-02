import { test, expect } from '@playwright/test';

test.describe('驗證圖表修正', () => {
  test('檢查 2 年資料對齊（中華電信）', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 選擇中華電信（2 年資料）
    const companySelect = page.locator('#companySelector');
    await companySelect.selectOption('中華電信股份有限公司');
    await page.waitForTimeout(1000);

    // 截圖
    await page.screenshot({ path: 'verify-2years-chunghwa.png', fullPage: true });

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

    const allCircles = await page.locator('.chart-nivo-container circle').all();
    const points = [];

    for (const circle of allCircles) {
      const r = await circle.getAttribute('r');
      if (r) {
        const radius = parseFloat(r);
        if (radius >= 3) {
          const box = await circle.boundingBox();
          if (box) {
            points.push({ x: box.x + box.width / 2 });
          }
        }
      }
    }
    points.sort((a, b) => a.x - b.x);

    console.log('中華電信（2年資料）:');
    console.log(`  長條圖數量: ${bars.length}`);
    console.log(`  折線點數量: ${points.length}`);

    for (let i = 0; i < Math.min(bars.length, points.length); i++) {
      const diff = Math.abs(bars[i].x - points[i].x);
      console.log(`  ${i + 1}. 長條=${bars[i].x.toFixed(1)}, 折線=${points[i].x.toFixed(1)}, 差距=${diff.toFixed(1)}px ${diff < 5 ? '✅' : '⚠️'}`);
    }
  });

  test('檢查 5 年資料對齊（博弘雲端）', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 選擇博弘雲端（5 年資料）
    const companySelect = page.locator('#companySelector');
    await companySelect.selectOption('博弘雲端');
    await page.waitForTimeout(1000);

    // 截圖
    await page.screenshot({ path: 'verify-5years-bohong.png', fullPage: true });

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

    const allCircles = await page.locator('.chart-nivo-container circle').all();
    const points = [];

    for (const circle of allCircles) {
      const r = await circle.getAttribute('r');
      if (r) {
        const radius = parseFloat(r);
        if (radius >= 3) {
          const box = await circle.boundingBox();
          if (box) {
            points.push({ x: box.x + box.width / 2 });
          }
        }
      }
    }
    points.sort((a, b) => a.x - b.x);

    console.log('博弘雲端（5年資料）:');
    console.log(`  長條圖數量: ${bars.length}`);
    console.log(`  折線點數量: ${points.length}`);

    for (let i = 0; i < Math.min(bars.length, points.length); i++) {
      const diff = Math.abs(bars[i].x - points[i].x);
      console.log(`  ${i + 1}. 長條=${bars[i].x.toFixed(1)}, 折線=${points[i].x.toFixed(1)}, 差距=${diff.toFixed(1)}px ${diff < 5 ? '✅' : '⚠️'}`);
    }
  });

  test('檢查 Y 軸是否被截斷', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 截圖 Y 軸區域
    const chartArea = page.locator('.chart-nivo-container');
    await chartArea.screenshot({ path: 'verify-yaxis.png' });

    // 檢查左側文字是否在可見範圍內
    const texts = await page.locator('.chart-nivo-container text').all();
    let minTextX = Infinity;

    for (const text of texts) {
      const box = await text.boundingBox();
      if (box && box.x > 0 && box.x < 100) {
        const content = await text.textContent();
        if (content && /^\d/.test(content.trim())) {
          minTextX = Math.min(minTextX, box.x);
          console.log(`Y軸文字 "${content.trim()}" X位置: ${box.x.toFixed(1)}`);
        }
      }
    }

    console.log(`最小 Y 軸文字 X 位置: ${minTextX === Infinity ? '未找到' : minTextX.toFixed(1)}`);
    if (minTextX > 5) {
      console.log('✅ Y 軸文字未被截斷');
    } else {
      console.log('⚠️ Y 軸文字可能被截斷');
    }

    await page.screenshot({ path: 'verify-yaxis-full.png', fullPage: true });
  });
});
