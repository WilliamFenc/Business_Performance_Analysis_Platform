const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5174');
  await page.waitForSelector('h4:has-text("償債結構")', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  // 截圖
  await page.screenshot({ path: 'solvency-debug.png' });
  
  // 檢查 SVG 元素
  const svgElements = await page.locator('.charts-grid svg').count();
  console.log('SVG 元素數量:', svgElements);
  
  // 檢查橘色折線
  const orangeLines = await page.locator('path[stroke="#f59e0b"]').count();
  console.log('橘色折線數量:', orangeLines);
  
  // 檢查橘色圓圈
  const orangeCircles = await page.locator('circle[fill="#f59e0b"]').count();
  console.log('橘色圓圈數量:', orangeCircles);
  
  await browser.close();
})();
