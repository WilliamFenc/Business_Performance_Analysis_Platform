const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Error:', msg.text());
    }
  });
  
  await page.goto('http://localhost:5174');
  
  // 等待 KPI 區塊載入
  await page.waitForTimeout(3000);
  
  // 檢查償債結構圖表
  const chartExists = await page.locator('h4:has-text("償債結構")').count();
  console.log('圖表標題存在:', chartExists > 0);
  
  // 檢查橘色折線
  const orangePath = await page.locator('path[stroke="#f59e0b"]').count();
  console.log('橘色折線數量:', orangePath);
  
  // 檢查長條圖標籤
  const barLabels = await page.locator('text[fill="#333"]').allTextContents();
  console.log('長條圖標籤:', barLabels.slice(0, 5));
  
  await page.screenshot({ path: 'solvency-detail.png' });
  
  await browser.close();
})();
