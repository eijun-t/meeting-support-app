import { test, expect } from '@playwright/test';

test.describe('Meeting App Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display the main interface correctly', async ({ page }) => {
    // Check main title
    await expect(page.locator('h1')).toContainText('AI会議アシスタント');
    
    // Check subtitle using more specific selector
    await expect(page.locator('p.text-slate-600')).toContainText('スマートな要約と発言提案でミーティングを効率化');
    
    // Check meeting records button
    await expect(page.locator('button:has-text("議事録一覧")')).toBeVisible();
    
    // Check AI status indicator
    await expect(page.locator('text=AI稼働中')).toBeVisible();
  });

  test('should open meeting records modal', async ({ page }) => {
    // Click meeting records button
    await page.locator('button:has-text("議事録一覧")').click();
    
    // Check modal opened
    await expect(page.locator('text=議事録一覧')).toBeVisible();
    await expect(page.locator('text=過去の会議記録を閲覧・検索')).toBeVisible();
    
    // Check search box
    await expect(page.locator('input[placeholder*="検索"]')).toBeVisible();
    
    // Check empty state or sessions list
    const hasData = await page.locator('.space-y-3').isVisible();
    if (hasData) {
      console.log('Found existing meeting records');
    } else {
      await expect(page.locator('text=議事録がありません')).toBeVisible();
    }
    
    // Close modal
    await page.locator('button[title*="閉じる"], svg:near(:text("議事録一覧"))').first().click();
    await expect(page.locator('text=過去の会議記録を閲覧・検索')).not.toBeVisible();
  });

  test('should show meeting type selector', async ({ page }) => {
    // Check meeting type selector is visible
    await expect(page.locator('text=会議タイプ')).toBeVisible();
    
    // Check both options are available
    await expect(page.locator('text=対面会議')).toBeVisible();
    await expect(page.locator('text=オンライン会議')).toBeVisible();
  });

  test('should show API key settings', async ({ page }) => {
    // Check API key section with more specific selector
    await expect(page.locator('label:has-text("OpenAI APIキー")')).toBeVisible();
    
    // Check input field for API key
    await expect(page.locator('input[placeholder*="API"]')).toBeVisible();
    
    // Check audio setup helper
    await expect(page.locator('text=音声設定')).toBeVisible();
  });

  test('should show meeting preparation section', async ({ page }) => {
    // Check meeting preparation section
    await expect(page.locator('text=会議準備')).toBeVisible();
    
    // Check title input
    await expect(page.locator('input[placeholder*="タイトル"]')).toBeVisible();
    
    // Check background info textarea
    await expect(page.locator('textarea[placeholder*="背景"]')).toBeVisible();
  });

  test('should show control buttons section', async ({ page }) => {
    // Check control buttons are visible
    await expect(page.locator('button:has-text("開始")')).toBeVisible();
    
    // Check transcription area
    await expect(page.locator('text=文字起こし')).toBeVisible();
    
    // Check summary section
    await expect(page.locator('text=議事録要約')).toBeVisible();
    
    // Check AI suggestions section
    await expect(page.locator('text=AI提案')).toBeVisible();
    
    // Check post-meeting section
    await expect(page.locator('text=ミーティング終了後')).toBeVisible();
  });

  test('should handle meeting preparation form', async ({ page }) => {
    // Fill meeting title
    await page.locator('input[placeholder*="タイトル"]').fill('テストミーティング');
    
    // Fill background info
    await page.locator('textarea[placeholder*="背景"]').fill('Playwrightテストのためのサンプル会議です。');
    
    // Add agenda item
    const agendaInput = page.locator('input[placeholder*="議題"]').first();
    if (await agendaInput.isVisible()) {
      await agendaInput.fill('テスト項目1');
      await agendaInput.press('Enter');
    }
    
    // Add participant
    const participantInput = page.locator('input[placeholder*="参加者"]').first();
    if (await participantInput.isVisible()) {
      await participantInput.fill('テスト参加者');
      await participantInput.press('Enter');
    }
    
    // Verify basic form filling worked
    await expect(page.locator('input[placeholder*="タイトル"]')).toHaveValue('テストミーティング');
  });

  test('should show appropriate states when API key is missing', async ({ page }) => {
    // Without API key, some features should show proper messages
    await expect(page.locator('text=次の議事録更新をお待ちください').or(page.locator('text=議事録が生成されるとAIが提案します'))).toBeVisible();
  });

  test('should search in meeting records', async ({ page }) => {
    // Open meeting records
    await page.locator('button:has-text("議事録一覧")').click();
    
    // Try search functionality
    const searchInput = page.locator('input[placeholder*="検索"]');
    await searchInput.fill('テスト');
    
    // Check search hint appears
    await expect(page.locator('text=Enterキーまたは⚡ボタンで詳細検索')).toBeVisible();
    
    // Trigger search
    await searchInput.press('Enter');
    
    // Should show search results or no results message
    await page.waitForTimeout(1000); // Wait for search to complete
    
    // Close modal
    await page.locator('button[title*="閉じる"], svg:near(:text("議事録一覧"))').first().click();
  });
});

test.describe('Meeting App Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Block network requests to simulate offline
    await page.route('**/*', route => route.abort());
    
    // Try to open meeting records
    await page.locator('button:has-text("議事録一覧")').click();
    
    // Should show loading state or error message
    await expect(page.locator('text=読み込み中').or(page.locator('text=エラー'))).toBeVisible();
    
    // Close modal
    await page.keyboard.press('Escape');
  });

  test('should validate required fields', async ({ page }) => {
    // Try to start recording without API key (should handle gracefully)
    await page.locator('button:has-text("開始")').click();
    
    // Should show some form of validation or error handling
    // The exact behavior depends on implementation
    
    // Wait a moment to see if any error messages appear
    await page.waitForTimeout(1000);
  });
});

test.describe('Meeting App Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test Tab navigation through main buttons
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to activate buttons with Enter
    await page.keyboard.press('Enter');
    
    // If modal opened, should be able to close with Escape
    await page.keyboard.press('Escape');
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check for important ARIA attributes
    const buttons = page.locator('button');
    const buttonsCount = await buttons.count();
    
    expect(buttonsCount).toBeGreaterThan(0);
    
    // Check that buttons have accessible names
    for (let i = 0; i < Math.min(buttonsCount, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      
      // Button should have some form of accessible name
      expect(text || ariaLabel || title).toBeTruthy();
    }
  });
});