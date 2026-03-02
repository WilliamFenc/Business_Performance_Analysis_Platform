const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5174');
  await page.waitForSelector('h4:has-text("償債結構")', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // 找到償債結構圖表的位置
  const chart = await page.locator('h4:has-text("償債結構")').locator('../..');
  await chart.screenshot({ path: 'solvency-closeup.png' });
  
  // 檢查圖例
  const legends = await page.locator('.charts-grid text').allTextContents();
  console.log('圖例文字:', legends);
  
  // 檢查是否有Y軸
  const yAxis = await page.locator('.charts-grid').locator('text=/^[0-9.]+$/').count();
  console.log('Y軸數字數量:', yAxis);
  
  await browser.close();
})();
