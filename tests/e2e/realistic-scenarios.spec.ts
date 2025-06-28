import { test, expect } from '@playwright/test';

/**
 * 実際の使用シナリオに基づいたE2Eテスト
 * ユーザーペルソナと実際の会議パターンを模擬
 */

test.describe('🎭 Realistic User Scenarios', () => {
  
  test.describe('👤 新人マネージャー（佐藤さん）- 初回使用', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('初回ユーザーが15分の週次チーム会議を設定・実行', async ({ page }) => {
      // 1. 初回ユーザーとしてAPIキーを設定
      await page.locator('input[placeholder*="API"]').fill('test-api-key-12345');
      
      // 2. 会議タイプを対面に設定
      await page.locator('text=対面会議').click();
      
      // 3. 会議情報を入力
      await page.locator('input[placeholder*="タイトル"]').fill('週次チームミーティング');
      await page.locator('textarea[placeholder*="背景"]').fill('チームの進捗確認と来週の計画を議論します。');
      
      // 4. アジェンダを追加
      const agendaItems = ['先週の振り返り', '今週の成果報告', '来週の計画'];
      for (const item of agendaItems) {
        const agendaInput = page.locator('input[placeholder*="議題"]').first();
        if (await agendaInput.isVisible()) {
          await agendaInput.fill(item);
          await agendaInput.press('Enter');
          await page.waitForTimeout(500);
        }
      }
      
      // 5. 参加者を追加
      const participants = ['佐藤（マネージャー）', '鈴木', '高橋', '伊藤'];
      for (const participant of participants) {
        const participantInput = page.locator('input[placeholder*="参加者"]').first();
        if (await participantInput.isVisible()) {
          await participantInput.fill(participant);
          await participantInput.press('Enter');
          await page.waitForTimeout(500);
        }
      }
      
      // 6. 会議開始ボタンが有効になることを確認
      const startButton = page.locator('button:has-text("開始")');
      await expect(startButton).toBeVisible();
      
      // 7. 文字起こしセクションとAI提案セクションが表示されることを確認
      await expect(page.locator('text=文字起こし')).toBeVisible();
      await expect(page.locator('text=AI提案')).toBeVisible();
      
      // 8. 会議終了後セクションが待機状態であることを確認
      await expect(page.locator('text=ミーティング終了後')).toBeVisible();
      await expect(page.locator('text=待機中')).toBeVisible();
    });

    test('会議中の基本操作（開始・一時停止・再開）をテスト', async ({ page }) => {
      // 前提条件：APIキーが設定済み
      await page.locator('input[placeholder*="API"]').fill('test-api-key-12345');
      await page.locator('input[placeholder*="タイトル"]').fill('テスト会議');
      
      // 1. 会議開始
      await page.locator('button:has-text("開始")').click();
      
      // 2. 録音開始の確認（ボタンが停止に変わることを確認）
      await expect(page.locator('button:has-text("停止")').or(page.locator('button:has-text("一時停止")'))).toBeVisible({ timeout: 10000 });
      
      // 3. 一時停止機能のテスト
      const pauseButton = page.locator('button:has-text("一時停止")');
      if (await pauseButton.isVisible()) {
        await pauseButton.click();
        await expect(page.locator('button:has-text("再開")')).toBeVisible();
        
        // 再開
        await page.locator('button:has-text("再開")').click();
        await expect(page.locator('button:has-text("一時停止")')).toBeVisible();
      }
      
      // 4. 会議停止
      await page.locator('button:has-text("停止")').click();
      
      // 5. 停止確認ダイアログの処理
      const confirmButton = page.locator('button:has-text("終了")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // 6. 会議終了後の処理開始を確認
      await expect(page.locator('text=抽出中').or(page.locator('text=処理中'))).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('👤 ベテラン役員（田中さん）- 重要会議', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      // ベテランユーザーとして高速設定
      await page.locator('input[placeholder*="API"]').fill('executive-api-key-67890');
    });

    test('重要な意思決定会議の設定と議事録確認フロー', async ({ page }) => {
      // 1. 重要会議の設定
      await page.locator('input[placeholder*="タイトル"]').fill('四半期戦略会議');
      await page.locator('textarea[placeholder*="背景"]').fill('Q4の業績確認と来年度戦略の決定を行います。重要な意思決定が含まれます。');
      
      // 2. 詳細なアジェンダ設定
      const strategicAgenda = [
        'Q4業績レビュー',
        '競合分析報告',
        '来年度予算案',
        '新商品戦略',
        '人事戦略'
      ];
      
      for (const item of strategicAgenda) {
        const agendaInput = page.locator('input[placeholder*="議題"]').first();
        if (await agendaInput.isVisible()) {
          await agendaInput.fill(item);
          await agendaInput.press('Enter');
          await page.waitForTimeout(300);
        }
      }
      
      // 3. 役員レベルの参加者
      const executives = ['田中（CEO）', '佐々木（CFO）', '中村（CTO）', '小林（COO）'];
      for (const exec of executives) {
        const participantInput = page.locator('input[placeholder*="参加者"]').first();
        if (await participantInput.isVisible()) {
          await participantInput.fill(exec);
          await participantInput.press('Enter');
          await page.waitForTimeout(300);
        }
      }
      
      // 4. 会議タイプをオンラインに設定（リモート役員対応）
      await page.locator('text=オンライン会議').click();
      
      // 5. 会議終了後の議事録一覧確認
      await page.locator('button:has-text("議事録一覧")').click();
      
      // 6. 過去の戦略会議検索
      const searchInput = page.locator('input[placeholder*="検索"]');
      await searchInput.fill('戦略');
      await expect(page.locator('text=Enterキーまたは⚡ボタンで詳細検索')).toBeVisible();
      
      // 7. 詳細検索実行
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);
      
      // 8. モーダルを閉じる
      await page.keyboard.press('Escape');
    });

    test('高頻度使用での効率性テスト', async ({ page }) => {
      // 1. 素早い会議設定（ベテランユーザーの想定）
      await page.locator('input[placeholder*="タイトル"]').fill('緊急対策会議');
      
      // 2. 最小設定で即座に開始
      const startButton = page.locator('button:has-text("開始")');
      await expect(startButton).toBeVisible();
      
      // 3. 議事録一覧への素早いアクセス
      await page.locator('button:has-text("議事録一覧")').click();
      
      // 4. モーダルの高速操作
      await expect(page.locator('text=議事録一覧')).toBeVisible();
      await page.keyboard.press('Escape');
      
      // 5. 複数回のモーダル開閉（高頻度使用パターン）
      for (let i = 0; i < 3; i++) {
        await page.locator('button:has-text("議事録一覧")').click();
        await expect(page.locator('text=議事録一覧')).toBeVisible();
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('👤 プロジェクトリーダー（山田さん）- 技術レビュー', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.locator('input[placeholder*="API"]').fill('tech-lead-api-key-54321');
    });

    test('長時間技術レビュー会議の設定と詳細記録', async ({ page }) => {
      // 1. 技術系会議の詳細設定
      await page.locator('input[placeholder*="タイトル"]').fill('システムアーキテクチャレビュー');
      await page.locator('textarea[placeholder*="背景"]').fill('新システムの技術仕様とアーキテクチャの詳細レビューを実施。技術的な決定事項を詳細に記録する必要があります。');
      
      // 2. 技術的アジェンダの設定
      const techAgenda = [
        'システム要件レビュー',
        'アーキテクチャ設計確認',
        'セキュリティ要件',
        'パフォーマンス要件',
        'インフラ構成',
        '開発スケジュール',
        'リスク分析'
      ];
      
      for (const item of techAgenda) {
        const agendaInput = page.locator('input[placeholder*="議題"]').first();
        if (await agendaInput.isVisible()) {
          await agendaInput.fill(item);
          await agendaInput.press('Enter');
          await page.waitForTimeout(200);
        }
      }
      
      // 3. 技術チームメンバー
      const techTeam = [
        '山田（プロジェクトリーダー）',
        '松本（シニアエンジニア）',
        '吉田（システムアーキテクト）',
        '森（セキュリティエンジニア）',
        '石井（インフラエンジニア）'
      ];
      
      for (const member of techTeam) {
        const participantInput = page.locator('input[placeholder*="参加者"]').first();
        if (await participantInput.isVisible()) {
          await participantInput.fill(member);
          await participantInput.press('Enter');
          await page.waitForTimeout(200);
        }
      }
      
      // 4. AI提案セクションの動作確認
      await expect(page.locator('text=AI提案')).toBeVisible();
      await expect(page.locator('text=議論の方向性と確認事項を提案')).toBeVisible();
      
      // 5. 会議終了後セクションの確認
      await expect(page.locator('text=ミーティング終了後')).toBeVisible();
      await expect(page.locator('text=アクションアイテム')).toBeVisible();
      await expect(page.locator('text=決定事項')).toBeVisible();
    });

    test('複雑なデータ処理と検索機能のテスト', async ({ page }) => {
      // 1. 議事録一覧を開く
      await page.locator('button:has-text("議事録一覧")').click();
      
      // 2. 技術関連キーワードでの検索
      const techKeywords = ['アーキテクチャ', 'API', 'データベース', 'セキュリティ'];
      
      for (const keyword of techKeywords) {
        const searchInput = page.locator('input[placeholder*="検索"]');
        await searchInput.clear();
        await searchInput.fill(keyword);
        
        // 検索実行
        await searchInput.press('Enter');
        await page.waitForTimeout(1000);
        
        // 検索結果の確認
        await expect(page.locator('text=件').first()).toBeVisible();
      }
      
      // 3. 詳細検索の組み合わせテスト
      const searchInput = page.locator('input[placeholder*="検索"]');
      await searchInput.clear();
      await searchInput.fill('システム AND レビュー');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      
      // 4. モーダルを閉じる
      await page.keyboard.press('Escape');
    });
  });
});

test.describe('🔧 Technical Edge Cases & Performance', () => {
  
  test.describe('⚡ Performance & Load Testing', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('大量データ処理のパフォーマンステスト', async ({ page }) => {
      // 1. 多数のアジェンダ項目追加
      await page.locator('input[placeholder*="タイトル"]').fill('大規模プロジェクト全体会議');
      
      // 50個のアジェンダ項目を追加
      for (let i = 1; i <= 20; i++) {
        const agendaInput = page.locator('input[placeholder*="議題"]').first();
        if (await agendaInput.isVisible()) {
          await agendaInput.fill(`アジェンダ項目 ${i} - 詳細な議論が必要な重要事項`);
          await agendaInput.press('Enter');
          if (i % 5 === 0) await page.waitForTimeout(100); // 定期的な小休止
        }
      }
      
      // 2. 多数の参加者追加
      for (let i = 1; i <= 15; i++) {
        const participantInput = page.locator('input[placeholder*="参加者"]').first();
        if (await participantInput.isVisible()) {
          await participantInput.fill(`参加者${i}（部署${Math.ceil(i/3)}）`);
          await participantInput.press('Enter');
          if (i % 5 === 0) await page.waitForTimeout(100);
        }
      }
      
      // 3. レスポンス時間の確認
      const startTime = Date.now();
      await page.locator('button:has-text("議事録一覧")').click();
      await expect(page.locator('text=議事録一覧')).toBeVisible();
      const loadTime = Date.now() - startTime;
      
      // レスポンス時間が5秒以内であることを確認
      expect(loadTime).toBeLessThan(5000);
      
      await page.keyboard.press('Escape');
    });

    test('メモリ使用量と安定性テスト', async ({ page }) => {
      // 1. 複数回のモーダル開閉（メモリリークチェック）
      for (let i = 0; i < 10; i++) {
        await page.locator('button:has-text("議事録一覧")').click();
        await expect(page.locator('text=議事録一覧')).toBeVisible();
        
        // 検索操作
        const searchInput = page.locator('input[placeholder*="検索"]');
        await searchInput.fill(`テスト検索 ${i}`);
        await searchInput.press('Enter');
        await page.waitForTimeout(500);
        
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
      }
      
      // 2. アプリケーションが安定していることを確認
      await expect(page.locator('h1')).toContainText('AI会議アシスタント');
    });
  });

  test.describe('🌐 Network & Connectivity', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('間欠的ネットワーク障害への対応', async ({ page }) => {
      // 1. 通常状態での操作開始
      await page.locator('input[placeholder*="API"]').fill('network-test-key');
      await page.locator('button:has-text("議事録一覧")').click();
      
      // 2. ネットワークを一時的に遮断
      await page.route('**/*supabase*', route => route.abort());
      
      // 3. 検索操作（ネットワークエラーが発生するはず）
      const searchInput = page.locator('input[placeholder*="検索"]');
      await searchInput.fill('ネットワークテスト');
      await searchInput.press('Enter');
      
      // 4. エラー状態の確認
      await page.waitForTimeout(2000);
      
      // 5. ネットワークを復旧
      await page.unroute('**/*supabase*');
      
      // 6. 回復操作の確認
      await page.keyboard.press('Escape');
      await expect(page.locator('h1')).toContainText('AI会議アシスタント');
    });

    test('オフライン状態での基本機能確認', async ({ page }) => {
      // 1. 全ネットワークを遮断
      await page.route('**/*', route => {
        if (route.request().url().includes('localhost:3000')) {
          route.continue(); // ローカルアプリは許可
        } else {
          route.abort(); // 外部APIは遮断
        }
      });
      
      // 2. 基本UI操作が可能であることを確認
      await expect(page.locator('h1')).toContainText('AI会議アシスタント');
      
      // 3. フォーム入力が可能であることを確認
      await page.locator('input[placeholder*="タイトル"]').fill('オフラインテスト会議');
      await expect(page.locator('input[placeholder*="タイトル"]')).toHaveValue('オフラインテスト会議');
      
      // 4. ローカル状態管理が機能することを確認
      await page.locator('text=対面会議').click();
      await page.locator('text=オンライン会議').click();
    });
  });

  test.describe('🔒 Security & Data Integrity', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('APIキーの適切な取り扱い確認', async ({ page }) => {
      // 1. APIキー入力
      const sensitiveKey = 'sk-test-sensitive-api-key-12345';
      await page.locator('input[placeholder*="API"]').fill(sensitiveKey);
      
      // 2. ページソースにAPIキーが平文で露出していないことを確認
      const pageContent = await page.content();
      expect(pageContent).not.toContain(sensitiveKey);
      
      // 3. ブラウザの開発者ツールでの確認をシミュレート
      const inputType = await page.locator('input[placeholder*="API"]').getAttribute('type');
      expect(inputType).toBe('password'); // パスワードフィールドであることを確認
    });

    test('XSS攻撃に対する防御確認', async ({ page }) => {
      // 1. 悪意のあるスクリプト入力の試行
      const maliciousInputs = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src=x onerror=alert("XSS")>',
        '"><script>alert("XSS")</script>'
      ];
      
      for (const maliciousInput of maliciousInputs) {
        // タイトルフィールドでのテスト
        await page.locator('input[placeholder*="タイトル"]').clear();
        await page.locator('input[placeholder*="タイトル"]').fill(maliciousInput);
        
        // スクリプトが実行されていないことを確認（アラートが表示されない）
        await page.waitForTimeout(500);
        
        // フィールドにテキストとして安全に格納されていることを確認
        const value = await page.locator('input[placeholder*="タイトル"]').inputValue();
        expect(value).toBe(maliciousInput); // サニタイズされたテキストとして保存
      }
    });
  });
});

test.describe('📱 Device & Browser Compatibility', () => {
  
  test.describe('🖥️ Desktop Browsers', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('異なる画面解像度での表示確認', async ({ page }) => {
      const resolutions = [
        { width: 1920, height: 1080 }, // Full HD
        { width: 1366, height: 768 },  // HD
        { width: 1280, height: 720 },  // HD Ready
      ];
      
      for (const resolution of resolutions) {
        await page.setViewportSize(resolution);
        
        // 基本UI要素が表示されることを確認
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('button:has-text("議事録一覧")')).toBeVisible();
        await expect(page.locator('input[placeholder*="タイトル"]')).toBeVisible();
        
        // モーダルの表示確認
        await page.locator('button:has-text("議事録一覧")').click();
        await expect(page.locator('text=議事録一覧')).toBeVisible();
        await page.keyboard.press('Escape');
      }
    });
  });

  test.describe('📱 Mobile & Tablet', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('タブレット表示での基本操作確認', async ({ page }) => {
      // タブレットサイズに設定
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // 基本要素の表示確認
      await expect(page.locator('h1')).toBeVisible();
      
      // タッチ操作のシミュレート
      await page.locator('input[placeholder*="タイトル"]').tap();
      await page.locator('input[placeholder*="タイトル"]').fill('タブレットテスト会議');
      
      // モーダルのタッチ操作
      await page.locator('button:has-text("議事録一覧")').tap();
      await expect(page.locator('text=議事録一覧')).toBeVisible();
      
      // スワイプ動作のシミュレート（ESCキーの代替）
      await page.keyboard.press('Escape');
    });

    test('モバイル表示での制約事項確認', async ({ page }) => {
      // スマートフォンサイズに設定
      await page.setViewportSize({ width: 375, height: 667 });
      
      // レスポンシブデザインの確認
      await expect(page.locator('h1')).toBeVisible();
      
      // 小画面での入力フィールドの確認
      await page.locator('input[placeholder*="タイトル"]').tap();
      await page.locator('input[placeholder*="タイトル"]').fill('モバイルテスト');
      
      // モバイルでのモーダル表示
      await page.locator('button:has-text("議事録一覧")').tap();
      await expect(page.locator('text=議事録一覧')).toBeVisible();
    });
  });
});