import { test, expect } from '@playwright/test';

test('檢查本地開發環境的償債結構圖表', async ({ page }) => {
  // 收集所有 console 訊息
  const consoleMessages = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    console.log(`[${msg.type()}]`, text);
  });

  // 監聽頁面錯誤
  page.on('pageerror', exception => {
    console.log('❌ Page Error:', exception);
  });

  await page.goto('http://localhost:5173');

  // 等待頁面載入
  await page.waitForLoadState('networkidle');

  console.log('=== 頁面已載入 ===');

  // 等待一下讓圖表渲染
  await page.waitForTimeout(3000);

  // 截圖
  await page.screenshot({ path: 'tests/screenshots/local-solvency-debug.png', fullPage: true });

  console.log('=== Console Messages ===');
  consoleMessages.forEach(msg => {
    if (msg.text.includes('bar') || msg.text.includes('Total') || msg.text.includes('Filtered')) {
      console.log(`[${msg.type()}] ${msg.text}`);
    }
  });
});
