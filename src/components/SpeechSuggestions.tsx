"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MeetingContext } from "../types/meetingContext";
import { getJSTISOString } from "../utils/dateUtils";

interface SummaryData {
  minutesText: string;
  lastUpdated: Date | null;
}

interface SpeechSuggestionsProps {
  summaryData?: SummaryData;
  apiKey?: string;
  isPaused?: boolean;
  meetingContext?: MeetingContext | null;
}

interface Suggestion {
  id: number;
  text: string;
  type: "提案" | "質問";
  confidence: number;
  context?: string;
  reasoning?: string;
}

export default function SpeechSuggestions({ summaryData, apiKey, isPaused = false, meetingContext }: SpeechSuggestionsProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<Suggestion[]>([]);
  const [usedSuggestions, setUsedSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const lastAnalyzedCountRef = useRef(0);
  const previousSummaryRef = useRef<string>('');
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Stage 1: Validate existing suggestions
  const validateExistingSuggestions = useCallback(async (currentSuggestions: Suggestion[], newSummary: string, previousSummary: string) => {
    if (!apiKey || currentSuggestions.length === 0) {
      return { needsUpdate: true, validSuggestions: [], newTopics: [] };
    }

    try {
      const validationPrompt = `既存の会議提案が新しい議事録に照らしてまだ有効か判断してください。

【既存提案】
${currentSuggestions.map((s, i) => `${i}: ${s.text} (${s.type})`).join('\n')}

【新しい議事録】
${newSummary}

【前回の議事録】
${previousSummary}

判断基準:
- 提案内容が既に議論済み・解決済みになっていないか
- 新しい重要な論点や未解決事項が出現していないか
- 会議の内容に明確な進展や変化があるか
- 議論すべき新しい課題や確認事項が出現していないか

重要: 議事録に新しい内容や論点が追加されている場合は、積極的に更新を推奨してください。

以下のJSON形式で回答：
{
  "stillValid": [有効な提案のインデックス配列],
  "needsUpdate": true/false,
  "updateReason": "更新が必要/不要な理由",
  "newTopicsDetected": ["新しい論点1", "新しい論点2"],
  "summaryDifference": "前回との主な違い"
}`;

      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: '会議提案の妥当性を判断する専門アシスタントです。議事録に新しい内容や論点が追加されている場合は積極的に更新を推奨し、会議の進展に合わせて提案を最新化します。'
            },
            {
              role: 'user',
              content: validationPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`Validation API Error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const validationResult = JSON.parse(cleanedContent);

      console.log('[SUGGESTIONS] Validation result:', validationResult);
      
      return {
        needsUpdate: validationResult.needsUpdate,
        validSuggestions: validationResult.stillValid.map((index: number) => currentSuggestions[index]),
        newTopics: validationResult.newTopicsDetected || [],
        updateReason: validationResult.updateReason
      };

    } catch (error) {
      console.error('[SUGGESTIONS] Validation error:', error);
      console.log('[SUGGESTIONS] Falling back to full update due to validation error');
      return { needsUpdate: true, validSuggestions: [], newTopics: ['validation error - performing full update'] };
    }
  }, [apiKey]);

  // Stage 2: Generate new or update suggestions
  const generateOrUpdateSuggestions = useCallback(async (summary: string, validSuggestions: Suggestion[], newTopics: string[]) => {
    // Count current types
    const currentSuggestions = validSuggestions.filter(s => s.type === '提案').length;
    const currentQuestions = validSuggestions.filter(s => s.type === '質問').length;
    
    // Calculate needed counts to reach 3 of each type
    const needSuggestions = Math.max(0, 3 - currentSuggestions);
    const needQuestions = Math.max(0, 3 - currentQuestions);
    const totalNeed = needSuggestions + needQuestions;
    
    if (totalNeed === 0) {
      return validSuggestions; // Already have 3 of each
    }
    
    // 会議コンテキスト情報を整理
    const contextInfo = meetingContext ? `
【会議情報】
タイトル: ${meetingContext.title || '未設定'}
目的・背景: ${meetingContext.backgroundInfo || '未設定'}

【アジェンダ】
${meetingContext.agenda.filter(item => item.trim()).map((item, index) => `${index + 1}. ${item}`).join('\n') || '未設定'}

【参加者】
${meetingContext.participants.filter(p => p.trim()).join(', ') || '未設定'}

【事前資料・参考情報】
${meetingContext.materials.filter(m => m.status === 'completed').map(m => `- ${m.name}: ${m.content.substring(0, 500)}...`).join('\n') || 'なし'}
` : '';

    const prompt = `会議の議事録要約を分析し、事前情報も考慮して以下の要求に従って新しい提案を生成してください。
${contextInfo}
【最新議事録】
${summary}

【既に有効な提案（維持）】
${validSuggestions.map(s => `- ${s.text} (${s.type})`).join('\n')}

【新しく検出された論点】
${newTopics.join(', ')}

【重要：必須生成要求】
- 「提案」を正確に${needSuggestions}個
- 「質問」を正確に${needQuestions}個
- 合計${totalNeed}個（これより多くても少なくてもダメ）

【タイプ定義と例】
「提案」= 議論の方向性を提案する発言
例: "この課題については技術的な観点からも検討してみてはいかがでしょうか"
例: "予算の制約も考慮に入れて議論を進めましょう"

「質問」= 相手に直接確認する質問
例: "この点についてはどのようにお考えでしょうか？"
例: "実装のスケジュールはどの程度を想定されていますか？"

以下の形式でJSONを返してください：
{
  "suggestions": [
    {
      "text": "具体的な発言内容",
      "type": "提案",
      "confidence": 0.8,
      "context": "なぜこの発言が適切かの説明",
      "reasoning": "この提案の根拠"
    },
    {
      "text": "具体的な質問内容",
      "type": "質問",
      "confidence": 0.8,
      "context": "なぜこの質問が適切かの説明", 
      "reasoning": "この質問の根拠"
    }
  ]
}

【厳格な要件】
1. 必ず「提案」${needSuggestions}個と「質問」${needQuestions}個を生成すること
2. typeフィールドは必ず「提案」か「質問」のみ
3. 提案は議論の方向性、質問は相手への確認事項として明確に区別
4. 既存提案と重複しない内容
5. 議事録の内容と事前情報（アジェンダ、背景、資料）を活用した実用的な内容
6. アジェンダの進行状況や未着手項目を意識した提案
7. 事前資料の内容を踏まえた具体的な質問や提案`;

    console.log('[SUGGESTIONS] Generating:', { needSuggestions, needQuestions, totalNeed });

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '会議での発言を支援するAIアシスタントです。事前の会議情報（アジェンダ、背景、資料）と現在の議事録を総合的に分析し、「提案」は議論の方向性、「質問」は相手への確認事項を明確に区別して提案します。アジェンダの進行状況や事前資料の内容を積極的に活用します。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error(`Generation API Error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const generationResult = JSON.parse(cleanedContent);

    if (generationResult.suggestions && Array.isArray(generationResult.suggestions)) {
      const newSuggestions: Suggestion[] = generationResult.suggestions.map((suggestion: any, index: number) => ({
        id: Date.now() + index,
        text: suggestion.text || '',
        type: suggestion.type || '提案',
        confidence: suggestion.confidence || 0.5,
        context: suggestion.context || '',
        reasoning: suggestion.reasoning || ''
      }));

      // 既存の有効提案と新提案をマージ
      const finalSuggestions = [...validSuggestions, ...newSuggestions];
      console.log('[SUGGESTIONS] Final suggestions (maintained + new):', finalSuggestions);
      
      return finalSuggestions;
    }
    
    return validSuggestions;
  }, [apiKey]);

  // Main suggestion processing function
  const processSuggestions = useCallback(async (summary: string) => {
    if (!apiKey || !summary || !isMountedRef.current) {
      console.log('[SUGGESTIONS] No API key or summary available, or component unmounted');
      return;
    }

    if (!isMountedRef.current) return;
    setIsGenerating(true);
    console.log('[SUGGESTIONS] Processing suggestions with 2-stage validation...');

    try {
      // Stage 1: Validate existing suggestions (active only)
      const validation = await validateExistingSuggestions(
        activeSuggestions, 
        summary, 
        previousSummaryRef.current
      );

      console.log('[SUGGESTIONS] Validation completed:', {
        needsUpdate: validation.needsUpdate,
        validCount: validation.validSuggestions.length,
        totalSuggestions: activeSuggestions.length,
        reason: validation.updateReason
      });

      if (!isMountedRef.current) return;
      
      if (!validation.needsUpdate && validation.validSuggestions.length >= 2) {
        console.log('[SUGGESTIONS] Maintaining existing suggestions - no update needed');
        console.log('[SUGGESTIONS] Current suggestions will be preserved');
        return;
      }

      console.log('[SUGGESTIONS] Update condition met:', {
        needsUpdate: validation.needsUpdate,
        validCount: validation.validSuggestions.length,
        threshold: 3
      });

      // Stage 2: Generate new suggestions if needed
      const finalSuggestions = await generateOrUpdateSuggestions(
        summary, 
        validation.validSuggestions, 
        validation.newTopics
      );

      if (!isMountedRef.current) return;
      
      setActiveSuggestions(finalSuggestions);
      previousSummaryRef.current = summary;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[SUGGESTIONS] Request aborted due to component unmount');
      } else {
        console.error('[SUGGESTIONS] Error processing suggestions:', error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
      }
    }
  }, [apiKey, validateExistingSuggestions, generateOrUpdateSuggestions]);

  // Monitor summary updates and generate suggestions
  useEffect(() => {
    if (!summaryData || !summaryData.minutesText || isPaused) {
      return;
    }

    const summaryUpdateTime = summaryData.lastUpdated?.getTime() || 0;
    if (summaryUpdateTime <= lastAnalyzedCountRef.current) {
      return;
    }

    console.log('[SUGGESTIONS] New summary detected, processing suggestions...');
    console.log('[SUGGESTIONS] Summary length:', summaryData.minutesText.length);
    console.log('[SUGGESTIONS] Previous summary length:', previousSummaryRef.current.length);
    console.log('[SUGGESTIONS] Current active suggestions count:', activeSuggestions.length);
    processSuggestions(summaryData.minutesText);
    lastAnalyzedCountRef.current = summaryUpdateTime;

  }, [summaryData, processSuggestions, isPaused]);

  const handleSuggestionClick = (id: number) => {
    // Toggle selection for better visibility
    setSelectedSuggestion(selectedSuggestion === id ? null : id);
  };

  const handleSuggestionSave = (id: number) => {
    const suggestion = activeSuggestions.find(s => s.id === id);
    if (suggestion) {
      console.log('[SUGGESTIONS] Saved suggestion:', suggestion.text);
      recordFeedback(id, 'accepted');
      
      // Move from active to saved
      setActiveSuggestions(prev => prev.filter(s => s.id !== id));
      setUsedSuggestions(prev => [...prev, suggestion]);
    }
  };

  const handleSuggestionReject = (id: number) => {
    const suggestion = activeSuggestions.find(s => s.id === id);
    if (suggestion) {
      console.log('[SUGGESTIONS] Rejected suggestion:', suggestion.text);
      recordFeedback(id, 'rejected');
      
      setActiveSuggestions(prev => prev.filter(s => s.id !== id));
    }
  };

  const recordFeedback = (suggestionId: number, action: 'accepted' | 'rejected') => {
    const feedback = {
      suggestionId,
      action,
      timestamp: getJSTISOString(),
      summaryContext: summaryData?.minutesText?.substring(0, 500) || ''
    };
    
    console.log('[SUGGESTIONS] Recording feedback:', feedback);
    
    const existingFeedback = JSON.parse(localStorage.getItem('suggestionFeedback') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('suggestionFeedback', JSON.stringify(existingFeedback));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "質問": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "提案": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI提案</h2>
              <p className="text-indigo-100 text-sm">議論の方向性と確認事項を提案</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isGenerating ? (
              <>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">分析中</span>
              </>
            ) : activeSuggestions.length > 0 ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white text-sm font-medium">提案済み</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                <span className="text-white text-sm font-medium">待機中</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* アクティブな提案 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
            アクティブな提案 ({activeSuggestions.length}/6)
          </h3>
          <div className="space-y-3">
            {activeSuggestions.length > 0 ? (
              activeSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`group p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                    selectedSuggestion === suggestion.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400 bg-white dark:bg-gray-700/50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(suggestion.type)}`}>
                      {suggestion.type}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSuggestionSave(suggestion.id);
                        }}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium transition-colors duration-200"
                        title="この提案を保存"
                      >
                        保存
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSuggestionReject(suggestion.id);
                        }}
                        className="w-6 h-6 bg-gray-100 dark:bg-gray-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full flex items-center justify-center transition-colors duration-200"
                        title="この提案を削除"
                      >
                        <svg className="w-3 h-3 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium mb-2 leading-relaxed">
                    {suggestion.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {suggestion.context}
                  </p>
                </div>
              ))
            ) : isGenerating ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-indigo-200 dark:border-indigo-800 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">議事録を分析して提案を生成中...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {!summaryData || !summaryData.minutesText
                    ? "議事録が生成されるとAIが提案します（2分ごと更新）" 
                    : "次の議事録更新をお待ちください"
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 保存済みの提案 */}
        {usedSuggestions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              保存済み ({usedSuggestions.length})
            </h3>
            <div className="space-y-2">
              {usedSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 opacity-75"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(suggestion.type)} opacity-60`}>
                      {suggestion.type}
                    </span>
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {suggestion.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}