import { test, expect } from '@playwright/test';

test.describe('圖表對齊與可見性檢查', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    // 等待圖表渲染
    await page.waitForTimeout(2000);
  });

  test('檢查 Y 軸數字可見性', async ({ page }) => {
    // 截圖檢查 Y 軸
    await page.screenshot({ path: 'chart-yaxis-check.png', fullPage: false });

    // 檢查 Y 軸刻度是否存在
    const yAxisTicks = await page.locator('.chart-nivo-container text').all();
    console.log('找到的 Y 軸文字元素數量:', yAxisTicks.length);

    // Y 軸數字應該有足夠的對比度
    const yTick = page.locator('.bar-chart-layer text').first();
    const styles = await yTick.evaluate((el) => {
      return window.getComputedStyle(el);
    });
    console.log('Y 軸文字顏色:', styles.fill);
    console.log('Y 軸文字字體大小:', styles.fontSize);
  });

  test('檢查折線圖端點與長條圖中心對齊', async ({ page }) => {
    // 截圖整個圖表區域
    const chartArea = page.locator('.chart-nivo-container');
    await chartArea.screenshot({ path: 'chart-alignment-check.png' });

    // 獲取長條圖的位置
    const bars = await page.locator('.bar-chart-layer rect[data-value]').all();
    const barPositions = [];

    for (const bar of bars) {
      const box = await bar.boundingBox();
      if (box) {
        const value = await bar.getAttribute('data-value');
        barPositions.push({
          x: box.x + box.width / 2, // 長條圖中心
          y: box.y,
          width: box.width,
          value
        });
      }
    }

    // 獲取折線圖端點的位置
    const linePoints = await page.locator('.line-chart-layer circle').all();
    const pointPositions = [];

    for (const point of linePoints) {
      const box = await point.boundingBox();
      if (box) {
        pointPositions.push({
          x: box.x + box.width / 2, // 圓心
          y: box.y + box.height / 2
        });
      }
    }

    console.log('長條圖數量:', barPositions.length);
    console.log('折線圖端點數量:', pointPositions.length);

    // 檢查對齊情況
    const alignments = [];
    for (let i = 0; i < Math.min(barPositions.length, pointPositions.length); i++) {
      const diff = Math.abs(barPositions[i].x - pointPositions[i].x);
      alignments.push({
        index: i,
        barCenter: barPositions[i].x,
        pointCenter: pointPositions[i].x,
        difference: diff
      });
      console.log(`端點 ${i}: 長條中心=${barPositions[i].x.toFixed(2)}, 折線點=${pointPositions[i].x.toFixed(2)}, 差距=${diff.toFixed(2)}px`);
    }

    // 計算平均對齊誤差
    const avgDiff = alignments.reduce((sum, a) => sum + a.difference, 0) / alignments.length;
    console.log('平均對齊誤差:', avgDiff.toFixed(2), 'px');

    // 如果平均誤差小於 5px，認為對齊良好
    if (avgDiff < 5) {
      console.log('✅ 折線圖端點與長條圖中心對齊良好！');
    } else {
      console.log('❌ 折線圖端點與長條圖中心未對齊，平均誤差:', avgDiff.toFixed(2), 'px');
    }

    // 截圖整頁供視覺檢查
    await page.screenshot({ path: 'chart-full-page.png', fullPage: true });
  });

  test('測試不同資料筆數的對齊', async ({ page }) => {
    // 測試 2 年資料（博弘雲端有 5 年，找一個 2 年的公司）
    const companySelect = page.locator('#companySelector');
    await companySelect.selectOption({ index: 0 }); // 選擇第一個公司
    await page.waitForTimeout(1000);

    const selectedCompany = await companySelect.inputValue();
    console.log('選擇的公司:', selectedCompany);

    // 截圖 2 年資料
    await page.screenshot({ path: 'chart-2years-alignment.png', fullPage: false });
  });
});
