const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 監聽 console 錯誤
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console Error:', msg.text());
    }
  });
  
  // 監聽頁面錯誤
  page.on('pageerror', err => {
    console.log('Page Error:', err.message);
  });
  
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: 'debug-error.png' });
  
  await browser.close();
})();
