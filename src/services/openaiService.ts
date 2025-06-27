/**
 * OpenAI API呼び出しの共通サービス
 */

export interface OpenAIRequestConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export class OpenAIService {
  private static readonly DEFAULT_CONFIG: Required<OpenAIRequestConfig> = {
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: 'あなたは優秀なAIアシスタントです。'
  };

  /**
   * OpenAI Chat Completions APIを呼び出し
   */
  static async chatCompletion(
    prompt: string,
    apiKey: string,
    config: Partial<OpenAIRequestConfig> = {}
  ): Promise<string> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    const abortController = new AbortController();
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: finalConfig.model,
          messages: [
            {
              role: 'system',
              content: finalConfig.systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: finalConfig.temperature,
          max_tokens: finalConfig.maxTokens
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return content.trim();

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[OPENAI] Request aborted');
        throw new Error('Request was aborted');
      }
      console.error('[OPENAI] API call failed:', error);
      throw error;
    }
  }

  /**
   * JSONレスポンスをパースする共通メソッド
   */
  static parseJSONResponse<T>(content: string): T {
    let cleanedContent = content.trim();
    
    // マークダウンコードブロックを除去
    const jsonMatch = cleanedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[1].trim();
    }
    
    // 余分な文字を除去
    cleanedContent = cleanedContent.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

    try {
      return JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('[OPENAI] JSON parse error:', parseError);
      console.error('[OPENAI] Content that failed to parse:', cleanedContent);
      throw new Error(`Failed to parse JSON response: ${parseError}`);
    }
  }

  /**
   * エラーハンドリングの共通メソッド
   */
  static handleAPIError(error: unknown, context: string): never {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`${context}: Request was aborted`);
      }
      throw new Error(`${context}: ${error.message}`);
    }
    throw new Error(`${context}: Unknown error occurred`);
  }
}