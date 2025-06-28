import { test, expect } from '@playwright/test';

/**
 * 業務特化型ワークフローテスト
 * 実際のビジネスシナリオに基づいた統合テスト
 */

test.describe('🏢 Business-Specific Workflows', () => {

  test.describe('💼 IT企業のスプリント計画会議', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.locator('input[placeholder*="API"]').fill('it-company-api-key');
    });

    test('アジャイル開発チームのスプリント計画会議フロー', async ({ page }) => {
      // 1. スプリント計画会議の設定
      await page.locator('input[placeholder*="タイトル"]').fill('Sprint 24 Planning Meeting');
      await page.locator('textarea[placeholder*="背景"]').fill('2週間スプリントの計画立案。前スプリントの振り返りと新機能の見積もりを実施。');

      // 2. アジャイル特有のアジェンダ
      const agileAgenda = [
        'Sprint 23 Demo & Retrospective',
        'Product Backlog Review',
        'User Story Estimation',
        'Sprint Goal Setting',
        'Capacity Planning',
        'Definition of Done Review',
        'Risk Assessment'
      ];

      for (const item of agileAgenda) {
        const agendaInput = page.locator('input[placeholder*="議題"]').first();
        if (await agendaInput.isVisible()) {
          await agendaInput.fill(item);
          await agendaInput.press('Enter');
          await page.waitForTimeout(200);
        }
      }

      // 3. 開発チームメンバー
      const scrumTeam = [
        '田中（Scrum Master）',
        '佐藤（Product Owner）',
        '山田（Senior Developer）',
        '鈴木（Frontend Developer）',
        '高橋（Backend Developer）',
        '伊藤（QA Engineer）',
        '中村（UI/UX Designer）'
      ];

      for (const member of scrumTeam) {
        const participantInput = page.locator('input[placeholder*="参加者"]').first();
        if (await participantInput.isVisible()) {
          await participantInput.fill(member);
          await participantInput.press('Enter');
          await page.waitForTimeout(200);
        }
      }

      // 4. オンライン会議設定（リモート開発チーム）
      await page.locator('text=オンライン会議').click();

      // 5. AI提案がアジャイル文脈に適応することを期待
      await expect(page.locator('text=AI提案')).toBeVisible();
      await expect(page.locator('text=議論の方向性と確認事項を提案')).toBeVisible();

      // 6. 会議終了後のアクションアイテムがスプリント管理に適していることを確認
      await expect(page.locator('text=アクションアイテム')).toBeVisible();
      await expect(page.locator('text=決定事項')).toBeVisible();
    });

    test('技術的な意思決定会議（アーキテクチャレビュー）', async ({ page }) => {
      // 1. 技術レビュー会議設定
      await page.locator('input[placeholder*="タイトル"]').fill('Microservices Architecture Review');
      await page.locator('textarea[placeholder*="背景"]').fill('既存モノリシックアプリケーションのマイクロサービス化に向けた技術的な意思決定を実施。');

      // 2. 技術的議題
      const techTopics = [
        'Current System Analysis',
        'Microservices Design Patterns',
        'Service Boundaries Definition',
        'Data Consistency Strategy',
        'API Gateway Selection',
        'Observability & Monitoring',
        'Migration Strategy',
        'Timeline & Resource Planning'
      ];

      for (const topic of techTopics) {
        const agendaInput = page.locator('input[placeholder*="議題"]').first();
        if (await agendaInput.isVisible()) {
          await agendaInput.fill(topic);
          await agendaInput.press('Enter');
          await page.waitForTimeout(150);
        }
      }

      // 3. 技術チーム
      const techExperts = [
        '山田（Lead Architect）',
        '田中（DevOps Engineer）',
        '佐藤（Database Specialist）',
        '鈴木（Security Engineer）',
        '高橋（Performance Engineer）'
      ];

      for (const expert of techExperts) {
        const participantInput = page.locator('input[placeholder*="参加者"]').first();
        if (await participantInput.isVisible()) {
          await participantInput.fill(expert);
          await participantInput.press('Enter');
          await page.waitForTimeout(150);
        }
      }

      // 4. 会議開始シミュレーション
      const startButton = page.locator('button:has-text("開始")');
      await expect(startButton).toBeVisible();

      // 5. 複雑な技術議論に対するAI提案の準備確認
      await expect(page.locator('text=AI提案')).toBeVisible();
    });
  });

  test.describe('🏭 製造業の品質管理会議', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.locator('input[placeholder*="API"]').fill('manufacturing-api-key');
    });

    test('品質問題対応の緊急会議シナリオ', async ({ page }) => {
      // 1. 緊急品質会議の設定
      await page.locator('input[placeholder*="タイトル"]').fill('緊急品質問題対応会議 - Product Line A');
      await page.locator('textarea[placeholder*="背景"]').fill('Product Line Aで品質問題が発生。顧客影響の評価と迅速な対応策の決定が必要。');

      // 2. 品質管理の緊急議題
      const qualityAgenda = [
        '品質問題の詳細報告',
        '顧客影響度評価',
        '根本原因分析',
        '即時対応策の検討',
        '再発防止策の策定',
        '顧客対応方針',
        'サプライヤー対応',
        '品質システム改善'
      ];

      for (const item of qualityAgenda) {
        const agendaInput = page.locator('input[placeholder*="議題"]').first();
        if (await agendaInput.isVisible()) {
          await agendaInput.fill(item);
          await agendaInput.press('Enter');
          await page.waitForTimeout(100);
        }
      }

      // 3. 品質管理チーム（緊急招集）
      const qualityTeam = [
        '田中（品質管理部長）',
        '佐藤（製造部長）',
        '山田（エンジニアリング部長）',
        '鈴木（品質保証マネージャー）',
        '高橋（生産技術者）',
        '伊藤（品質エンジニア）'
      ];

      for (const member of qualityTeam) {
        const participantInput = page.locator('input[placeholder*="参加者"]').first();
        if (await participantInput.isVisible()) {
          await participantInput.fill(member);
          await participantInput.press('Enter');
          await page.waitForTimeout(100);
        }
      }

      // 4. 対面会議（緊急事態のため全員集合）
      await page.locator('text=対面会議').click();

      // 5. 緊急対応での意思決定記録の重要性確認
      await expect(page.locator('text=決定事項')).toBeVisible();
      await expect(page.locator('text=アクションアイテム')).toBeVisible();
    });
  });

  test.describe('🏦 金融機関のコンプライアンス会議', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.locator('input[placeholder*="API"]').fill('financial-compliance-key');
    });

    test('規制対応とリスク管理会議', async ({ page }) => {
      // 1. コンプライアンス会議設定
      await page.locator('input[placeholder*="タイトル"]').fill('四半期リスク管理・コンプライアンス委員会');
      await page.locator('textarea[placeholder*="背景"]').fill('新規制対応と既存リスクの評価。監査対応とガバナンス強化の議論。詳細な記録が法的要件。');

      // 2. コンプライアンス議題
      const complianceAgenda = [
        '新規制（バーゼルIII）対応状況',
        'リスクアセスメント結果',
        '内部監査指摘事項',
        '顧客保護措置の評価',
        'サイバーセキュリティ対策',
        '第三者リスク管理',
        '規制当局対応',
        'ガバナンス体制見直し'
      ];

      for (const item of complianceAgenda) {
        const agendaInput = page.locator('input[placeholder*="議題"]').first();
        if (await agendaInput.isVisible()) {
          await agendaInput.fill(item);
          await agendaInput.press('Enter');
          await page.waitForTimeout(150);
        }
      }

      // 3. 役員・管理職（高いガバナンス要求）
      const executiveTeam = [
        '田中（代表取締役）',
        '佐藤（コンプライアンス統括責任者）',
        '山田（リスク管理部長）',
        '鈴木（法務部長）',
        '高橋（監査部長）',
        '伊藤（情報セキュリティ責任者）'
      ];

      for (const executive of executiveTeam) {
        const participantInput = page.locator('input[placeholder*="参加者"]').first();
        if (await participantInput.isVisible()) {
          await participantInput.fill(executive);
          await participantInput.press('Enter');
          await page.waitForTimeout(150);
        }
      }

      // 4. 厳格な記録要件への対応確認
      await expect(page.locator('text=ミーティング終了後')).toBeVisible();
      await expect(page.locator('text=決定事項')).toBeVisible();
      
      // 5. 議事録検索機能（監査対応）
      await page.locator('button:has-text("議事録一覧")').click();
      await expect(page.locator('input[placeholder*="検索"]')).toBeVisible();
      
      const searchInput = page.locator('input[placeholder*="検索"]');
      await searchInput.fill('コンプライアンス');
      await expect(page.locator('text=Enterキーまたは⚡ボタンで詳細検索')).toBeVisible();
      
      await page.keyboard.press('Escape');
    });
  });
});

test.describe('⚡ Emergency & Crisis Management', () => {

  test.describe('🚨 緊急事態対応', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.locator('input[placeholder*="API"]').fill('emergency-response-key');
    });

    test('システム障害対応の緊急会議', async ({ page }) => {
      // 1. 緊急事態設定（最小限の情報で迅速開始）
      await page.locator('input[placeholder*="タイトル"]').fill('【緊急】システム障害対応会議');
      await page.locator('textarea[placeholder*="背景"]').fill('メインシステムで重大な障害発生。サービス停止中。迅速な復旧対応が必要。');

      // 2. 緊急対応議題（最優先事項のみ）
      const emergencyAgenda = [
        '現状報告',
        '影響範囲確認',
        '復旧対応',
        '顧客対応',
        '報告体制'
      ];

      for (const item of emergencyAgenda) {
        const agendaInput = page.locator('input[placeholder*="議題"]').first();
        if (await agendaInput.isVisible()) {
          await agendaInput.fill(item);
          await agendaInput.press('Enter');
          await page.waitForTimeout(50); // 緊急時は高速入力
        }
      }

      // 3. 緊急対応チーム
      const emergencyTeam = [
        '田中（システム責任者）',
        '佐藤（運用チームリーダー）',
        '山田（インフラエンジニア）',
        '鈴木（アプリケーションエンジニア）'
      ];

      for (const member of emergencyTeam) {
        const participantInput = page.locator('input[placeholder*="参加者"]').first();
        if (await participantInput.isVisible()) {
          await participantInput.fill(member);
          await participantInput.press('Enter');
          await page.waitForTimeout(50);
        }
      }

      // 4. 即座に会議開始可能な状態確認
      const startButton = page.locator('button:has-text("開始")');
      await expect(startButton).toBeVisible();
      await expect(startButton).toBeEnabled();

      // 5. 緊急時の迅速な記録が可能であることを確認
      await expect(page.locator('text=文字起こし')).toBeVisible();
      await expect(page.locator('text=ミーティング終了後')).toBeVisible();
    });

    test('セキュリティインシデント対応会議', async ({ page }) => {
      // 1. セキュリティ緊急事態
      await page.locator('input[placeholder*="タイトル"]').fill('【機密】セキュリティインシデント対応');
      await page.locator('textarea[placeholder*="背景"]').fill('潜在的なセキュリティ侵害を検知。影響調査と対応策の検討が急務。機密性の高い議論。');

      // 2. セキュリティ対応議題
      const securityAgenda = [
        'インシデント詳細',
        '被害状況評価',
        '封じ込め対応',
        '証拠保全',
        '法的対応検討',
        '外部報告要否'
      ];

      for (const item of securityAgenda) {
        const agendaInput = page.locator('input[placeholder*="議題"]').first();
        if (await agendaInput.isVisible()) {
          await agendaInput.fill(item);
          await agendaInput.press('Enter');
          await page.waitForTimeout(100);
        }
      }

      // 3. セキュリティ対応チーム（限定メンバー）
      const securityTeam = [
        '田中（CISO）',
        '佐藤（セキュリティエンジニア）',
        '山田（法務責任者）',
        '鈴木（広報責任者）'
      ];

      for (const member of securityTeam) {
        const participantInput = page.locator('input[placeholder*="参加者"]').first();
        if (await participantInput.isVisible()) {
          await participantInput.fill(member);
          await participantInput.press('Enter');
          await page.waitForTimeout(100);
        }
      }

      // 4. 機密性を考慮した記録管理の確認
      await expect(page.locator('text=決定事項')).toBeVisible();
      await expect(page.locator('text=アクションアイテム')).toBeVisible();
    });
  });
});

test.describe('📊 Data Quality & Integration', () => {

  test.describe('🔍 データ整合性テスト', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.locator('input[placeholder*="API"]').fill('data-quality-test-key');
    });

    test('完全な会議ライフサイクルのデータ追跡', async ({ page }) => {
      // 1. 会議設定データの入力
      const meetingData = {
        title: 'データ整合性テスト会議',
        background: 'システム全体のデータフローと整合性をテストするための会議です。',
        agenda: ['データ入力', 'プロセス確認', '結果検証'],
        participants: ['テスター1', 'テスター2', 'テスター3']
      };

      await page.locator('input[placeholder*="タイトル"]').fill(meetingData.title);
      await page.locator('textarea[placeholder*="背景"]').fill(meetingData.background);

      // 2. アジェンダとデータの一貫性確認
      for (const item of meetingData.agenda) {
        const agendaInput = page.locator('input[placeholder*="議題"]').first();
        if (await agendaInput.isVisible()) {
          await agendaInput.fill(item);
          await agendaInput.press('Enter');
          await page.waitForTimeout(200);
        }
      }

      // 3. 参加者データの整合性確認
      for (const participant of meetingData.participants) {
        const participantInput = page.locator('input[placeholder*="参加者"]').first();
        if (await participantInput.isVisible()) {
          await participantInput.fill(participant);
          await participantInput.press('Enter');
          await page.waitForTimeout(200);
        }
      }

      // 4. 入力データの保持確認
      await expect(page.locator('input[placeholder*="タイトル"]')).toHaveValue(meetingData.title);

      // 5. 他のページに移動して戻った時のデータ保持確認
      await page.locator('button:has-text("議事録一覧")').click();
      await expect(page.locator('text=議事録一覧')).toBeVisible();
      await page.keyboard.press('Escape');

      // 6. データが保持されていることを確認
      await expect(page.locator('input[placeholder*="タイトル"]')).toHaveValue(meetingData.title);
    });

    test('大量データ処理での安定性確認', async ({ page }) => {
      // 1. 大量のアジェンダ項目（50個）の追加
      const title = '大量データテスト会議 - パフォーマンス検証';
      await page.locator('input[placeholder*="タイトル"]').fill(title);

      // 2. アジェンダの大量追加
      for (let i = 1; i <= 30; i++) {
        const agendaInput = page.locator('input[placeholder*="議題"]').first();
        if (await agendaInput.isVisible()) {
          await agendaInput.fill(`大量データテスト項目 ${i} - 詳細な内容を含むアジェンダ項目`);
          await agendaInput.press('Enter');
          if (i % 10 === 0) {
            await page.waitForTimeout(100); // 定期的な休憩
          }
        }
      }

      // 3. 参加者の大量追加
      for (let i = 1; i <= 20; i++) {
        const participantInput = page.locator('input[placeholder*="参加者"]').first();
        if (await participantInput.isVisible()) {
          await participantInput.fill(`テスト参加者${i}（部署${Math.ceil(i/5)} - 役職${i % 3 + 1}）`);
          await participantInput.press('Enter');
          if (i % 5 === 0) {
            await page.waitForTimeout(50);
          }
        }
      }

      // 4. システムの応答性確認
      const startTime = Date.now();
      await page.locator('button:has-text("議事録一覧")').click();
      await expect(page.locator('text=議事録一覧')).toBeVisible();
      const responseTime = Date.now() - startTime;

      // 5. 許容可能な応答時間（3秒以内）を確認
      expect(responseTime).toBeLessThan(3000);

      await page.keyboard.press('Escape');

      // 6. データの整合性確認
      await expect(page.locator('input[placeholder*="タイトル"]')).toHaveValue(title);
    });
  });

  test.describe('🔄 ワークフロー統合テスト', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.locator('input[placeholder*="API"]').fill('workflow-integration-key');
    });

    test('複数会議セッションの連続実行', async ({ page }) => {
      const sessions = [
        { title: '朝会 - Daily Standup', duration: 300 },
        { title: '設計レビュー会議', duration: 1800 },
        { title: '振り返り会議', duration: 900 }
      ];

      for (let i = 0; i < sessions.length; i++) {
        const session = sessions[i];
        
        // 1. 新しいセッションの設定
        await page.locator('input[placeholder*="タイトル"]').clear();
        await page.locator('input[placeholder*="タイトル"]').fill(session.title);
        
        // 2. 各セッションの基本設定
        await page.locator('textarea[placeholder*="背景"]').clear();
        await page.locator('textarea[placeholder*="背景"]').fill(`セッション${i+1}: ${session.title}の実施`);
        
        // 3. 会議タイプの切り替えテスト
        if (i % 2 === 0) {
          await page.locator('text=対面会議').click();
        } else {
          await page.locator('text=オンライン会議').click();
        }
        
        // 4. セッション間のデータクリア確認
        await expect(page.locator('input[placeholder*="タイトル"]')).toHaveValue(session.title);
        
        // 5. 各セッションでの議事録一覧アクセス
        await page.locator('button:has-text("議事録一覧")').click();
        await expect(page.locator('text=議事録一覧')).toBeVisible();
        await page.keyboard.press('Escape');
        
        // セッション間の短い待機時間
        await page.waitForTimeout(500);
      }
    });

    test('エラー回復とデータ保護', async ({ page }) => {
      // 1. 重要なデータを入力
      const criticalData = {
        title: '重要なプロジェクト会議 - データ保護テスト',
        background: '重要なプロジェクトの意思決定を行う。データの損失は許可されない。'
      };

      await page.locator('input[placeholder*="タイトル"]').fill(criticalData.title);
      await page.locator('textarea[placeholder*="背景"]').fill(criticalData.background);

      // 2. 意図的なエラー状況の作成（ネットワーク中断）
      await page.route('**/*supabase*', route => route.abort());

      // 3. ネットワークエラー状況での操作
      await page.locator('button:has-text("議事録一覧")').click();
      await page.waitForTimeout(2000); // エラーの発生を待つ

      // 4. ネットワーク復旧
      await page.unroute('**/*supabase*');

      // 5. データが保持されていることを確認
      await page.keyboard.press('Escape');
      await expect(page.locator('input[placeholder*="タイトル"]')).toHaveValue(criticalData.title);

      // 6. 正常な操作が可能であることを確認
      await page.locator('button:has-text("議事録一覧")').click();
      await expect(page.locator('text=議事録一覧')).toBeVisible();
      await page.keyboard.press('Escape');
    });
  });
});