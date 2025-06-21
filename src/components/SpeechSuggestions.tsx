"use client";

import { useState } from "react";

interface SpeechSuggestionsProps {
  isRecording: boolean;
}

export default function SpeechSuggestions({ isRecording }: SpeechSuggestionsProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);

  // 発言提案データ（実際の文字起こしから生成される予定）
  const suggestions = {
    contextBased: [],
    quickResponses: [
      "承知いたしました",
      "ありがとうございます",
      "少々お待ちください",
      "申し訳ございません",
      "その通りです",
      "なるほど、理解しました"
    ]
  };

  const handleSuggestionClick = (id: number) => {
    setSelectedSuggestion(id);
    // ここで実際の音声合成やテキスト出力を行う
    setTimeout(() => setSelectedSuggestion(null), 2000);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "質問": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "確認": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
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
              <h2 className="text-xl font-bold text-white">提案</h2>
              <p className="text-indigo-100 text-sm">AIが最適な返答を提案します</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">分析中</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isRecording ? (
          <div className="space-y-6">
            {/* コンテキスト基準の提案 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                コンテキスト提案
              </h3>
              <div className="space-y-3">
                {suggestions.contextBased.length > 0 ? (
                  suggestions.contextBased.map((suggestion) => (
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
                          {selectedSuggestion === suggestion.id && (
                            <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
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
                ) : (
                  <div className="text-center py-6">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">会話が進むとAIが発言を提案します</p>
                  </div>
                )}
              </div>
            </div>

            {/* クイック返答 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                クイック返答
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {suggestions.quickResponses.map((response, index) => (
                  <button
                    key={index}
                    className="p-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-400 transition-all duration-200 hover:shadow-md"
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AIが待機中です
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
              録音を開始すると、会話の流れに基づいて最適な発言を提案します
            </p>
          </div>
        )}
      </div>
    </div>
  );
}