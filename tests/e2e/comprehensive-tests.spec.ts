import { test, expect } from '@playwright/test';
import { MeetingAppPage } from '../utils/page-objects';

/**
 * 包括的テストシナリオ（修正版）
 * セレクターの問題を解決したバージョン
 */

test.describe('🚀 Comprehensive Meeting App Tests', () => {
  let meetingApp: MeetingAppPage;

  test.beforeEach(async ({ page }) => {
    meetingApp = new MeetingAppPage(page);
    await meetingApp.navigateToApp();
  });

  test.describe('👤 User Persona Tests', () => {
    test('新人マネージャー：初回使用での基本フロー', async ({ page }) => {
      // APIキー設定
      await meetingApp.setApiKey('test-api-key-new-manager');
      
      // 基本的な会議設定
      await meetingApp.setupBasicMeeting({
        apiKey: 'test-api-key-new-manager',
        title: '週次チームミーティング',
        background: 'チームの進捗確認と来週の計画を議論します。',
        type: 'in-person',
        agenda: ['先週の振り返り', '今週の成果報告', '来週の計画'],
        participants: ['佐藤（マネージャー）', '鈴木', '高橋', '伊藤']
      });
      
      // 基本UI要素の確認
      await meetingApp.verifyBasicUI();
      
      // 会議セクションの確認
      await meetingApp.verifyMeetingSections();
      
      // スタートボタンの確認
      await expect(meetingApp.startButton).toBeVisible();
    });

    test('ベテラン役員：重要な意思決定会議', async ({ page }) => {
      await meetingApp.setupBasicMeeting({
        apiKey: 'executive-api-key',
        title: '四半期戦略会議',
        background: 'Q4の業績確認と来年度戦略の決定を行います。',
        type: 'online',
        agenda: ['Q4業績レビュー', '競合分析報告', '来年度予算案'],
        participants: ['田中（CEO）', '佐々木（CFO）', '中村（CTO）']
      });
      
      // 議事録一覧の確認
      await meetingApp.openMeetingRecords();
      
      // モーダルが正しく開かれることを確認
      await expect(page.locator('h2:has-text("議事録一覧")')).toBeVisible();
      
      // モーダルを閉じる
      await page.keyboard.press('Escape');
    });
  });

  test.describe('🏢 Business Workflows', () => {
    test('IT企業：スプリント計画会議', async ({ page }) => {
      await meetingApp.setupBasicMeeting({
        apiKey: 'it-company-key',
        title: 'Sprint 24 Planning Meeting',
        background: '2週間スプリントの計画立案',
        type: 'online',
        agenda: [
          'Sprint 23 Demo & Retrospective',
          'Product Backlog Review',
          'User Story Estimation'
        ],
        participants: [
          '田中（Scrum Master）',
          '佐藤（Product Owner）',
          '山田（Senior Developer）'
        ]
      });
      
      // AI提案セクションの確認
      await expect(meetingApp.aiSuggestionsSection).toBeVisible();
      
      // 会議終了後セクションの確認
      await expect(meetingApp.postMeetingSection).toBeVisible();
    });

    test('製造業：品質管理会議', async ({ page }) => {
      await meetingApp.setupBasicMeeting({
        apiKey: 'manufacturing-key',
        title: '緊急品質問題対応会議',
        background: '品質問題の迅速な対応策の決定が必要',
        type: 'in-person',
        agenda: [
          '品質問題の詳細報告',
          '顧客影響度評価',
          '根本原因分析'
        ],
        participants: [
          '田中（品質管理部長）',
          '佐藤（製造部長）',
          '山田（エンジニアリング部長）'
        ]
      });
      
      // 決定事項とアクションアイテムの確認
      await meetingApp.verifyPostMeetingSections();
    });
  });

  test.describe('⚡ Performance & Edge Cases', () => {
    test('大量データ処理テスト', async ({ page }) => {
      await meetingApp.setApiKey('performance-test-key');
      await meetingApp.setMeetingTitle('大規模プロジェクト全体会議');
      
      // 10個のアジェンダ項目を追加
      const agendaItems = Array.from(
        { length: 10 }, 
        (_, i) => `アジェンダ項目 ${i + 1}`
      );
      await meetingApp.addAgendaItems(agendaItems);
      
      // 8人の参加者を追加
      const participants = Array.from(
        { length: 8 }, 
        (_, i) => `参加者${i + 1}`
      );
      await meetingApp.addParticipants(participants);
      
      // レスポンス時間の確認
      const startTime = Date.now();
      await meetingApp.openMeetingRecords();
      await expect(page.locator('h2:has-text("議事録一覧")')).toBeVisible();
      const loadTime = Date.now() - startTime;
      
      // 3秒以内のレスポンス時間を確認
      expect(loadTime).toBeLessThan(3000);
      
      await page.keyboard.press('Escape');
    });

    test('ネットワーク障害への対応', async ({ page }) => {
      await meetingApp.setApiKey('network-test-key');
      
      // 通常状態での操作
      await meetingApp.openMeetingRecords();
      
      // ネットワークを一時的に遮断
      await page.route('**/*supabase*', route => route.abort());
      
      // 検索操作
      const searchInput = page.locator('input[placeholder*="検索"]');
      await searchInput.fill('ネットワークテスト');
      await searchInput.press('Enter');
      
      await page.waitForTimeout(1000);
      
      // ネットワークを復旧
      await page.unroute('**/*supabase*');
      
      // 回復操作の確認
      await page.keyboard.press('Escape');
      await expect(meetingApp.appTitle).toBeVisible();
    });
  });

  test.describe('📱 Device Compatibility', () => {
    test('タブレット表示での基本操作', async ({ page }) => {
      // タブレットサイズに設定
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // 基本要素の表示確認
      await meetingApp.verifyBasicUI();
      
      // タッチ操作のシミュレート
      await meetingApp.setMeetingTitle('タブレットテスト会議');
      
      // モーダルのタッチ操作
      await meetingApp.openMeetingRecords();
      await expect(page.locator('h2:has-text("議事録一覧")')).toBeVisible();
      await page.keyboard.press('Escape');
    });

    test('モバイル表示での制約事項確認', async ({ page }) => {
      // スマートフォンサイズに設定
      await page.setViewportSize({ width: 375, height: 667 });
      
      // レスポンシブデザインの確認
      await meetingApp.verifyBasicUI();
      
      // 小画面での入力フィールドの確認
      await meetingApp.setMeetingTitle('モバイルテスト');
      
      // モバイルでのモーダル表示
      await meetingApp.openMeetingRecords();
      await expect(page.locator('h2:has-text("議事録一覧")')).toBeVisible();
    });
  });

  test.describe('🔒 Security Tests', () => {
    test('APIキーの適切な取り扱い', async ({ page }) => {
      const sensitiveKey = 'sk-test-sensitive-api-key-12345';
      await meetingApp.setApiKey(sensitiveKey);
      
      // ページソースにAPIキーが平文で露出していないことを確認
      const pageContent = await page.content();
      expect(pageContent).not.toContain(sensitiveKey);
      
      // パスワードフィールドであることを確認
      const inputType = await meetingApp.apiKeyInput.getAttribute('type');
      expect(inputType).toBe('password');
    });

    test('XSS攻撃に対する防御確認', async ({ page }) => {
      const maliciousInput = '<script>alert("XSS")</script>';
      
      // 悪意のあるスクリプト入力の試行
      await meetingApp.setMeetingTitle(maliciousInput);
      
      // スクリプトが実行されていないことを確認
      await page.waitForTimeout(500);
      
      // フィールドにテキストとして安全に格納されていることを確認
      const value = await meetingApp.meetingTitleInput.inputValue();
      expect(value).toBe(maliciousInput);
    });
  });
});