const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(3000);
  
  // 檢查橘色元素
  const orangePaths = await page.locator('.charts-grid').locator('path[stroke="#f59e0b"]').count();
  console.log('橘色折線數量:', orangePaths);
  
  const orangeCircles = await page.locator('.charts-grid').locator('circle[fill="#f59e0b"]').count();
  console.log('橘色圓圈數量:', orangeCircles);
  
  const orangeText = await page.locator('.charts-grid').locator('text[fill="#d97706"]').count();
  console.log('深橘色文字數量:', orangeText);
  
  // 檢查是否有錯誤
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('錯誤:', msg.text());
    }
  });
  
  await page.screenshot({ path: 'final-check.png', fullPage: true });
  
  // 等待一下檢查是否有 console 錯誤
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
