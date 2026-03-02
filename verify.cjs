const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(3000);
  
  // 檢查償債結構圖表的橘色折線
  const orangePaths = await page.locator('.charts-grid').locator('path[stroke="#f59e0b"]').count();
  console.log('橘色折線數量:', orangePaths);
  
  // 檢查橘色圓圈
  const orangeCircles = await page.locator('.charts-grid').locator('circle[fill="#f59e0b"]').count();
  console.log('橘色圓圈數量:', orangeCircles);
  
  // 檢查深橘色文字
  const darkOrangeText = await page.locator('.charts-grid').locator('text[fill="#d97706"]').count();
  console.log('深橘色文字數量:', darkOrangeText);
  
  await page.screenshot({ path: 'final-verify.png', fullPage: true });
  await browser.close();
})();
