import { Decision, ActionItem } from '../types/meeting';
import { MeetingContext } from '../types/meetingContext';
import { TranscriptionEntry, ExtractionResult } from '../types/meeting';
import { getJSTISOString } from '../utils/dateUtils';
import { OpenAIService } from './openaiService';

export class ExtractionService {
  
  /**
   * 会議の文字起こしデータから決定事項とアクションアイテムを抽出
   */
  static async extractDecisionsAndActions(
    transcriptions: TranscriptionEntry[],
    meetingContext?: MeetingContext | null,
    apiKey?: string
  ): Promise<ExtractionResult> {
    try {
      console.log('[EXTRACTION] Starting extraction process...');
      console.log('[EXTRACTION] Transcription entries:', transcriptions.length);
      
      if (!apiKey) {
        console.warn('[EXTRACTION] No API key provided');
        return { decisions: [], action_items: [] };
      }

      if (transcriptions.length === 0) {
        console.warn('[EXTRACTION] No transcription data available');
        return { decisions: [], action_items: [] };
      }

      // 文字起こしデータを時系列順に整理
      const sortedTranscriptions = transcriptions
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .map(t => `[${t.timestamp.toLocaleTimeString()}] ${t.speaker ? `${t.speaker}: ` : ''}${t.text}`)
        .join('\n');

      // 会議コンテキスト情報を整理
      const contextInfo = meetingContext ? this.buildContextInfo(meetingContext) : '';

      // プロンプトを構築
      const prompt = this.buildExtractionPrompt(sortedTranscriptions, contextInfo);

      // OpenAI APIを呼び出し
      const result = await this.callOpenAI(prompt, apiKey);
      
      console.log('[EXTRACTION] Extraction completed successfully');
      return result;

    } catch (error) {
      console.error('[EXTRACTION] Error during extraction:', error);
      return { decisions: [], action_items: [] };
    }
  }

  /**
   * 会議コンテキスト情報を構築
   */
  private static buildContextInfo(meetingContext: MeetingContext): string {
    const participants = meetingContext.participants.filter(p => p.trim()).join(', ') || '未設定';
    const agenda = meetingContext.agenda.filter(item => item.trim()).map((item, index) => `${index + 1}. ${item}`).join('\n') || '未設定';
    const materials = meetingContext.materials
      .filter(m => m.status === 'completed')
      .map(m => `- ${m.name}: ${m.content.substring(0, 200)}...`)
      .join('\n') || 'なし';

    return `
【会議タイトル】
${meetingContext.title || '未設定'}

【参加者】
${participants}

【議題・アジェンダ】
${agenda}

【事前資料・参考情報】
${materials}
`;
  }

  /**
   * 抽出用プロンプトを構築
   */
  private static buildExtractionPrompt(transcriptions: string, contextInfo: string): string {
    return `あなたは会議の議事録から重要な決定事項とアクションアイテムを抽出する専門AIです。

以下の会議情報と文字起こしデータを分析し、重要な決定事項とアクションアイテムを抽出してください。

${contextInfo}

【会議の文字起こしデータ】
${transcriptions}

【抽出指示】
1. **決定事項（Decisions）**: 会議で合意・決定された重要な事項を抽出してください
   - 具体的な決定内容のみ
   - 議論中の内容や検討事項は含めない
   - 明確に決定されたもののみ

2. **アクションアイテム（Action Items）**: 具体的なタスク・行動項目を抽出してください
   - 「〜する」「〜を検討する」「〜を準備する」など具体的な行動
   - 誰かが何かを実行する必要があるもの
   - 期限や担当者が明示されている場合は含める

【出力形式】
以下のJSON形式で出力してください：

{
  "decisions": [
    {
      "content": "決定事項の内容",
      "decided_by": "決定者（分かる場合のみ）",
      "timestamp": "決定された時刻（ISO形式）"
    }
  ],
  "action_items": [
    {
      "content": "具体的なタスク内容",
      "assignee": "担当者（分かる場合のみ）",
      "due_date": "期限（分かる場合のみ、ISO形式）",
      "status": "pending"
    }
  ]
}

**重要**: 
- 必ずJSON形式のみで回答してください
- 説明文や追加のテキストは不要です
- 抽出できるものがない場合は空の配列を返してください
- timestampは会議の文字起こし時刻を参考に推定してください
- due_dateが明確でない場合はnullにしてください`;
  }

  /**
   * OpenAI APIを呼び出して抽出を実行
   */
  private static async callOpenAI(prompt: string, apiKey: string): Promise<ExtractionResult> {
    try {
      const content = await OpenAIService.chatCompletion(
        prompt,
        apiKey,
        {
          temperature: 0.3,
          maxTokens: 2000,
          systemPrompt: '会議の議事録から重要な決定事項とアクションアイテムを抽出する専門AIです。'
        }
      );

      console.log('[EXTRACTION] Raw OpenAI response:', content);

      // JSONをパース
      const parsedResult = OpenAIService.parseJSONResponse<any>(content);
      console.log('[EXTRACTION] Successfully parsed JSON:', parsedResult);
      
      // IDとtimestampを生成して追加
      const currentTime = getJSTISOString();
      
      const decisions: Decision[] = (parsedResult.decisions || []).map((decision: any, index: number) => ({
        id: `decision_${Date.now()}_${index}`,
        content: decision.content,
        decided_by: decision.decided_by || null,
        timestamp: decision.timestamp || currentTime
      }));

      const action_items: ActionItem[] = (parsedResult.action_items || []).map((item: any, index: number) => ({
        id: `action_${Date.now()}_${index}`,
        content: item.content,
        assignee: item.assignee || null,
        due_date: item.due_date || null,
        status: 'pending' as const,
        timestamp: currentTime
      }));

      console.log('[EXTRACTION] Extracted decisions:', decisions.length);
      console.log('[EXTRACTION] Extracted action items:', action_items.length);

      return { decisions, action_items };

    } catch (error) {
      console.error('[EXTRACTION] Failed:', error);
      return { decisions: [], action_items: [] };
    }
  }
}