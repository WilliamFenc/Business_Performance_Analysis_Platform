const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5174');
  await page.waitForSelector('h4:has-text("償債結構")', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // 截圖整個頁面
  await page.screenshot({ path: 'solvency-full.png' });
  
  // 檢查圖例
  const legendTexts = await page.locator('.charts-grid').locator('text').allTextContents();
  console.log('找到的文字:', legendTexts.filter(t => t.includes('流動比') || t.includes('負債比') || t.includes('debt')));
  
  await browser.close();
})();
