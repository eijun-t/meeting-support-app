import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model パターンの実装
 * UIの変更に対する耐性を向上させ、テストコードの保守性を高める
 */

export class MeetingAppPage {
  readonly page: Page;
  
  // Header elements
  readonly appTitle: Locator;
  readonly appSubtitle: Locator;
  readonly meetingRecordsButton: Locator;
  readonly aiStatusIndicator: Locator;

  // API Key settings
  readonly apiKeyInput: Locator;
  readonly apiKeyLabel: Locator;

  // Meeting preparation
  readonly meetingTitleInput: Locator;
  readonly backgroundTextarea: Locator;
  readonly agendaInput: Locator;
  readonly participantInput: Locator;
  readonly meetingTypeInPerson: Locator;
  readonly meetingTypeOnline: Locator;

  // Control buttons
  readonly startButton: Locator;
  readonly stopButton: Locator;
  readonly pauseButton: Locator;
  readonly resumeButton: Locator;

  // Meeting sections
  readonly transcriptionSection: Locator;
  readonly summarySection: Locator;
  readonly aiSuggestionsSection: Locator;
  readonly postMeetingSection: Locator;
  readonly decisionsSection: Locator;
  readonly actionItemsSection: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Header elements
    this.appTitle = page.locator('h1:has-text("AI会議アシスタント")');
    this.appSubtitle = page.locator('p.text-slate-600:has-text("スマートな要約と発言提案でミーティングを効率化")');
    this.meetingRecordsButton = page.locator('button:has-text("議事録一覧")');
    this.aiStatusIndicator = page.locator('text=AI稼働中');

    // API Key settings
    this.apiKeyInput = page.locator('input[placeholder="sk-..."]');
    this.apiKeyLabel = page.locator('text=OpenAI API Key');

    // Meeting preparation
    this.meetingTitleInput = page.locator('input[placeholder="会議のタイトルを入力..."]');
    this.backgroundTextarea = page.locator('textarea[placeholder="会議の背景情報や目的を入力..."]');
    this.agendaInput = page.locator('input[placeholder="アジェンダ項目を入力..."]').first();
    this.participantInput = page.locator('input[placeholder="参加者名を入力..."]').first();
    this.meetingTypeInPerson = page.locator('text=対面会議');
    this.meetingTypeOnline = page.locator('text=オンライン会議');

    // Control buttons
    this.startButton = page.locator('button:has-text("開始")');
    this.stopButton = page.locator('button:has-text("停止")');
    this.pauseButton = page.locator('button:has-text("一時停止")');
    this.resumeButton = page.locator('button:has-text("再開")');

    // Meeting sections
    this.transcriptionSection = page.locator('h2:has-text("リアルタイム文字起こし")');
    this.summarySection = page.locator('h2:has-text("議事録要約")');
    this.aiSuggestionsSection = page.locator('h2:has-text("AI提案")');
    this.postMeetingSection = page.locator('h2:has-text("ミーティング終了後")');
    this.decisionsSection = page.locator('h3:has-text("決定事項")');
    this.actionItemsSection = page.locator('h3:has-text("アクションアイテム")');
  }

  async navigateToApp() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async setApiKey(apiKey: string) {
    await this.apiKeyInput.fill(apiKey);
  }

  async setMeetingTitle(title: string) {
    await this.meetingTitleInput.fill(title);
  }

  async setBackgroundInfo(background: string) {
    await this.backgroundTextarea.fill(background);
  }

  async addAgendaItem(item: string) {
    if (await this.agendaInput.isVisible()) {
      await this.agendaInput.fill(item);
      await this.agendaInput.press('Enter');
      await this.page.waitForTimeout(200);
    }
  }

  async addAgendaItems(items: string[]) {
    for (const item of items) {
      await this.addAgendaItem(item);
    }
  }

  async addParticipant(participant: string) {
    if (await this.participantInput.isVisible()) {
      await this.participantInput.fill(participant);
      await this.participantInput.press('Enter');
      await this.page.waitForTimeout(200);
    }
  }

  async addParticipants(participants: string[]) {
    for (const participant of participants) {
      await this.addParticipant(participant);
    }
  }

  async selectMeetingType(type: 'in-person' | 'online') {
    if (type === 'in-person') {
      await this.meetingTypeInPerson.click();
    } else {
      await this.meetingTypeOnline.click();
    }
  }

  async startMeeting() {
    await this.startButton.click();
  }

  async stopMeeting() {
    await this.stopButton.click();
  }

  async pauseMeeting() {
    await this.pauseButton.click();
  }

  async resumeMeeting() {
    await this.resumeButton.click();
  }

  async openMeetingRecords() {
    await this.meetingRecordsButton.click();
  }

  async verifyBasicUI() {
    await expect(this.appTitle).toBeVisible();
    await expect(this.appSubtitle).toBeVisible();
    await expect(this.meetingRecordsButton).toBeVisible();
    await expect(this.aiStatusIndicator).toBeVisible();
  }

  async verifyMeetingSections() {
    await expect(this.transcriptionSection).toBeVisible();
    await expect(this.summarySection).toBeVisible();
    await expect(this.aiSuggestionsSection).toBeVisible();
    await expect(this.postMeetingSection).toBeVisible();
  }

  async verifyPostMeetingSections() {
    await expect(this.decisionsSection).toBeVisible();
    await expect(this.actionItemsSection).toBeVisible();
  }

  // 複合操作メソッド
  async setupBasicMeeting(config: {
    apiKey: string;
    title: string;
    background?: string;
    type?: 'in-person' | 'online';
    agenda?: string[];
    participants?: string[];
  }) {
    await this.setApiKey(config.apiKey);
    await this.setMeetingTitle(config.title);
    
    if (config.background) {
      await this.setBackgroundInfo(config.background);
    }
    
    if (config.type) {
      await this.selectMeetingType(config.type);
    }
    
    if (config.agenda) {
      await this.addAgendaItems(config.agenda);
    }
    
    if (config.participants) {
      await this.addParticipants(config.participants);
    }
  }
}

export class MeetingRecordsModal {
  readonly page: Page;
  
  readonly modal: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchHint: Locator;
  readonly closeButton: Locator;
  readonly sessionsList: Locator;
  readonly emptyMessage: Locator;
  readonly resultCount: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.modal = page.locator('.fixed.inset-0.bg-black\\/50');
    this.title = page.locator('h2:has-text("議事録一覧")');
    this.subtitle = page.locator('text=過去の会議記録を閲覧・検索');
    this.searchInput = page.locator('input[placeholder*="検索"]');
    this.searchButton = page.locator('button:has(svg)').filter({ hasText: /⚡/ });
    this.searchHint = page.locator('text=Enterキーまたは⚡ボタンで詳細検索');
    this.closeButton = page.locator('button').filter({ hasText: /×/ });
    this.sessionsList = page.locator('.space-y-3');
    this.emptyMessage = page.locator('text=議事録がありません');
    this.resultCount = page.locator('text=/\\d+ \\/ \\d+ 件/');
  }

  async isOpen() {
    return await this.modal.isVisible();
  }

  async close() {
    await this.page.keyboard.press('Escape');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async performDetailedSearch(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async verifyModal() {
    await expect(this.title).toBeVisible();
    await expect(this.subtitle).toBeVisible();
    await expect(this.searchInput).toBeVisible();
  }

  async verifySearchFunctionality() {
    await expect(this.searchInput).toBeVisible();
    await expect(this.resultCount).toBeVisible();
  }
}

export class StopConfirmationDialog {
  readonly page: Page;
  
  readonly dialog: Locator;
  readonly title: Locator;
  readonly message: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.dialog = page.locator('.fixed.inset-0.bg-black\\/50');
    this.title = page.locator('h3:has-text("録音を終了しますか")');
    this.message = page.locator('text=録音を終了すると、会議データがSupabaseに保存されます');
    this.confirmButton = page.locator('button:has-text("終了")');
    this.cancelButton = page.locator('button:has-text("キャンセル")');
  }

  async isOpen() {
    return await this.dialog.isVisible();
  }

  async confirm() {
    await this.confirmButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async verifyDialog() {
    await expect(this.title).toBeVisible();
    await expect(this.message).toBeVisible();
    await expect(this.confirmButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }
}