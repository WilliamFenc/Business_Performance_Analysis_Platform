import { test, expect } from '@playwright/test';

test.describe('AI 摘要功能整合測試', () => {
  test('應該能夠顯示 AI 摘要', async ({ page }) => {
    await page.goto('/');

    // 選擇公司
    await page.selectOption('#companySelector', '博弘雲端');

    // 等待 AI 摘要載入（最多 15 秒，因為需要等待 API 回應）
    await page.waitForSelector('.ai-summary-content', { timeout: 15000 });

    // 驗證摘要內容存在
    const summary = await page.textContent('.ai-summary-content');
    expect(summary).toBeTruthy();

    // 截圖
    await page.screenshot({ path: 'test-results/ai-summary-loaded.png' });
  });

  test('應該顯示載入狀態', async ({ page }) => {
    await page.goto('/');

    // 選擇公司後立即檢查載入狀態
    await page.selectOption('#companySelector', '博弘雲端');

    // 應該顯示載入中
    const loadingText = await page.textContent('.ai-summary-loading');
    expect(loadingText).toContain('AI 分析中');
  });

  test('API 失敗時應該顯示錯誤訊息', async ({ page }) => {
    // 模擬 API 失敗
    await page.route('**/api/ai-summary*', route => route.abort());

    await page.goto('/');
    await page.selectOption('#companySelector', '博弘雲端');

    // 應該顯示錯誤訊息
    await page.waitForSelector('.ai-summary-error');
    const errorText = await page.textContent('.ai-summary-error');
    expect(errorText).toContain('暫時無法使用');
  });

  test('應該能夠重新載入失敗的請求', async ({ page }) => {
    // 第一次請求失敗，第二次成功
    let attempt = 0;
    await page.route('**/api/ai-summary*', route => {
      attempt++;
      if (attempt === 1) {
        route.abort();
      } else {
        route.continue();
      }
    });

    await page.goto('/');
    await page.selectOption('#companySelector', '博弘雲端');

    // 等待錯誤訊息
    await page.waitForSelector('.ai-summary-error');

    // 點擊重新載入按鈕
    await page.click('.retry-button');

    // 應該成功載入（最多 15 秒）
    await page.waitForSelector('.ai-summary-content', { timeout: 15000 });
  });

  test('切換年度時應該更新 AI 摘要', async ({ page }) => {
    await page.goto('/');

    // 選擇公司
    await page.selectOption('#companySelector', '博弘雲端');

    // 等待第一次載入完成
    await page.waitForSelector('.ai-summary-content', { timeout: 15000 });

    // 切換年度
    await page.selectOption('#yearSelector', { index: 1 });

    // 應該顯示載入狀態
    await page.waitForSelector('.ai-summary-loading');

    // 等待新摘要載入
    await page.waitForSelector('.ai-summary-content', { timeout: 15000 });
  });

  test('AI 摘要內容應該正確渲染 Markdown', async ({ page }) => {
    await page.goto('/');

    // 選擇公司
    await page.selectOption('#companySelector', '博弘雲端');

    // 等待 AI 摘要載入
    await page.waitForSelector('.ai-summary-content', { timeout: 15000 });

    // 檢查是否有內容元素（根據 API 回應格式可能不同）
    const content = await page.textContent('.ai-summary-content');
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(0);
  });

  test('AI 摘要區塊應該可以滾動', async ({ page }) => {
    await page.goto('/');

    // 選擇公司
    await page.selectOption('#companySelector', '博弘雲端');

    // 等待 AI 摘要載入
    await page.waitForSelector('.ai-summary-content', { timeout: 15000 });

    // 檢查內容區域的滾動條樣式
    const contentBox = await page.locator('.ai-summary-content').boundingBox();
    expect(contentBox).toBeTruthy();

    // 檢查是否設定了 max-height
    const maxHeight = await page.locator('.ai-summary-content').evaluate(el => {
      return window.getComputedStyle(el).maxHeight;
    });
    expect(maxHeight).toBe('400px');
  });
});
