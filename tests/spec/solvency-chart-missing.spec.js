import { test, expect } from '@playwright/test';

test('檢查償債結構圖表是否顯示', async ({ page }) => {
  // 監聽 console 錯誤和警告
  const errors = [];
  const warnings = [];
  const logs = [];

  page.on('console', msg => {
    const text = msg.text();
    logs.push({ type: msg.type(), text });

    if (msg.type() === 'error') {
      errors.push(text);
      console.log('❌ Console Error:', text);
    } else if (msg.type() === 'warn') {
      warnings.push(text);
      console.log('⚠️  Console Warning:', text);
    } else {
      console.log('📝 Console Log:', text);
    }
  });

  // 監聽頁面錯誤
  page.on('pageerror', exception => {
    console.log('❌ Page Error:', exception);
    errors.push(exception.toString());
  });

  // 監聽請求失敗
  page.on('requestfailed', request => {
    console.log('❌ Request Failed:', request.url(), request.failure());
  });

  await page.goto('https://bpap.vercel.app');

  // 等待頁面載入
  await page.waitForLoadState('networkidle');

  console.log('=== 頁面已載入 ===');

  // 檢查償債結構圖表容器
  const solvencyContainer = page.locator('text=償債結構').first();
  await expect(solvencyContainer).toBeVisible({ timeout: 5000 });
  console.log('✅ 找到償債結構標題');

  // 檢查圖表容器
  const chartContainer = page.locator('.chart-container').filter({ hasText: '償債結構' });
  const isVisible = await chartContainer.isVisible();
  console.log('圖表容器可見性:', isVisible);

  // 檢查是否有 SVG 元素（Nivo 圖表會渲染 SVG）
  const svgElement = chartContainer.locator('svg').first();
  const hasSvg = await svgElement.count();
  console.log('SVG 元素數量:', hasSvg);

  if (hasSvg > 0) {
    console.log('✅ 找到 SVG 元素');

    // 檢查 SVG 內容
    const svgContent = await svgElement.innerHTML();
    console.log('SVG 內容長度:', svgContent.length);

    // 檢查是否有 rect 元素（長條圖）
    const rectCount = await svgElement.locator('rect').count();
    console.log('Rect 元素數量:', rectCount);

    // 檢查是否有 circle 元素（折線圖端點）
    const circleCount = await svgElement.locator('circle').count();
    console.log('Circle 元素數量:', circleCount);

    // 檢查是否有 path 元素（折線）
    const pathCount = await svgElement.locator('path').count();
    console.log('Path 元素數量:', pathCount);
  } else {
    console.log('❌ 沒有找到 SVG 元素');
  }

  // 截圖
  await page.screenshot({ path: 'tests/screenshots/solvency-chart-missing.png', fullPage: true });

  console.log('=== 收集到的錯誤 ===');
  console.log('Errors:', errors);
  console.log('Warnings:', warnings);

  // 輸出前 20 條 log
  console.log('=== 前 20 條 Console Log ===');
  logs.slice(0, 20).forEach(log => {
    console.log(`[${log.type}] ${log.text}`);
  });
});
