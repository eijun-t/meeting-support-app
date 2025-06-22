"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TranscriptionEntry {
  id: string;
  text: string;
  timestamp: Date;
  speaker?: string;
}

interface SummaryData {
  minutesText: string;
  lastUpdated: Date | null;
}

interface SummarySectionProps {
  isRecording: boolean;
  transcriptions?: TranscriptionEntry[];
}

export default function SummarySection({ isRecording, transcriptions = [] }: SummarySectionProps) {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    minutesText: '',
    lastUpdated: null,
  });
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const generateSummaryRef = useRef<(() => void) | null>(null);

  // 録音開始時に開始時刻を記録
  useEffect(() => {
    if (isRecording && !startTime) {
      setStartTime(new Date());
    } else if (!isRecording) {
      setStartTime(null);
      setDuration(0);
    }
  }, [isRecording, startTime]);

  // 経過時間の更新
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isRecording && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setDuration(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, startTime]);

  // APIキーを取得する関数
  const getApiKey = useCallback(async (): Promise<string | null> => {
    if (window.electronAPI && 'getEnvVar' in window.electronAPI) {
      try {
        const envApiKey = await (window.electronAPI as any).getEnvVar('OPENAI_API_KEY');
        if (envApiKey) return envApiKey;
      } catch (error) {
        console.warn('Failed to get API key from environment:', error);
      }
    }
    
    const storedApiKey = localStorage.getItem('openai-api-key');
    if (storedApiKey) return storedApiKey;
    
    return null;
  }, []);

  // 要約生成関数
  const generateSummary = useCallback(async () => {
    if (isGeneratingSummary || transcriptions.length === 0) {
      return;
    }

    setIsGeneratingSummary(true);

    try {
      const apiKey = await getApiKey();
      if (!apiKey) {
        console.warn('[SUMMARY] API key not available');
        return;
      }

      const allText = transcriptions
        .map(t => `${t.speaker || '話者'}: ${t.text}`)
        .join('\n');

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
              content: `あなたは議事録作成の専門家です。以下の会話内容を、議論の流れがわかるように、自然な文章で議事録としてまとめてください。
Markdown形式を使用して、見出し、箇条書き、太字などを適宜使い、読みやすく構成してください。
回答は、整形された議事録のテキストのみを返してください。JSONやその他の余計な文字列は含めないでください。`
            },
            {
              role: 'user',
              content: `会話内容:\n${allText}`
            }
          ],
          max_tokens: 800,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;
      
      if (content) {
        setSummaryData({
          minutesText: content.trim(),
          lastUpdated: new Date(),
        });
      }
    } catch (error) {
      console.error('[SUMMARY] Summary generation error:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [transcriptions, getApiKey, isGeneratingSummary]);

  // generateSummaryのrefを更新
  useEffect(() => {
    generateSummaryRef.current = generateSummary;
  }, [generateSummary]);

  // 要約生成タイマー
  useEffect(() => {
    if (!isRecording || !startTime) {
      return;
    }

    const intervalId = setInterval(() => {
      if (generateSummaryRef.current) {
        generateSummaryRef.current();
      }
    }, 2 * 60 * 1000); // 2分

    return () => {
      clearInterval(intervalId);
    };
  }, [isRecording, startTime]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-md font-bold mt-3 mb-1 text-teal-700 dark:text-teal-300">{line.substring(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-lg font-bold mt-4 mb-2 text-teal-800 dark:text-teal-200">{line.substring(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-xl font-bold mt-5 mb-3 text-teal-900 dark:text-teal-100">{line.substring(2)}</h1>;
      }
      if (line.startsWith('* ')) {
        return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
      }
      return <p key={index} className="my-1">{line}</p>;
    });
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AIリアルタイム議事録</h2>
              <p className="text-emerald-100 text-sm">議論の流れを自動で記録</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isGeneratingSummary ? (
              <>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">生成中...</span>
              </>
            ) : summaryData.lastUpdated && (
              <span className="text-white text-sm font-medium">
                最終更新: {new Date(summaryData.lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <div className={`w-3 h-3 rounded-full transition-colors ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-white text-sm font-medium tabular-nums tracking-wider">{formatDuration(duration)}</span>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-6 h-[calc(100%-100px)] overflow-y-auto">
        {summaryData.minutesText ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderContent(summaryData.minutesText)}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-5-5h12l-5 5z" /></svg>
            </div>
            <p className="font-semibold">議事録はまだありません</p>
            <p className="text-sm">録音を開始すると、2分ごとに自動で生成されます。</p>
          </div>
        )}
      </div>
    </div>
  );
}