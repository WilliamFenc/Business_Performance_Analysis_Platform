import { test, expect } from '@playwright/test';

test('檢查償債結構圖表 hover 問題', async ({ page }) => {
  // 監聽 console 錯誤
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('Console Error:', msg.text());
    }
  });

  // 監聽頁面錯誤
  page.on('pageerror', exception => {
    console.log('Page Error:', exception);
    errors.push(exception.toString());
  });

  await page.goto('https://bpap.vercel.app');

  // 等待頁面載入
  await page.waitForLoadState('networkidle');

  // 截圖初始狀態
  await page.screenshot({ path: 'tests/screenshots/solvency-initial.png' });

  // 檢查償債結構圖表是否存在
  const solvencyChart = page.locator('text=償債結構').first();
  await expect(solvencyChart).toBeVisible();

  console.log('找到償債結構圖表');

  // 將滑鼠移到圖表上
  await solvencyChart.hover();

  console.log('滑鼠已移到圖表上');

  // 等待一下
  await page.waitForTimeout(2000);

  // 截圖 hover 後的狀態
  await page.screenshot({ path: 'tests/screenshots/solvency-after-hover.png' });

  // 檢查頁面是否還存在
  const isVisible = await page.isVisible('body');
  console.log('Body 可見性:', isVisible);

  // 再次檢查是否有任何錯誤
  console.log('收集到的錯誤:', errors);
});
