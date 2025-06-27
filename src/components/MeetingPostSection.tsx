"use client";

import { Decision, ActionItem } from '../types/meeting';

interface MeetingPostSectionProps {
  decisions?: Decision[];
  actionItems?: ActionItem[];
  isLoading?: boolean;
}

export default function MeetingPostSection({ decisions = [], actionItems = [], isLoading = false }: MeetingPostSectionProps) {
  
  // デバッグログ
  console.log('[MEETING_POST] Component rendered with:', {
    decisionsCount: decisions.length,
    actionItemsCount: actionItems.length,
    isLoading,
    decisions,
    actionItems
  });
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-gray-500 to-slate-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">ミーティング終了後</h2>
              <p className="text-gray-200 text-sm">会議終了時に自動生成されます</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isLoading 
                ? 'bg-yellow-400 animate-pulse' 
                : decisions.length > 0 || actionItems.length > 0
                  ? 'bg-green-400'
                  : 'bg-gray-400'
            }`}></div>
            <span className="text-gray-300 text-sm font-medium">
              {isLoading 
                ? '抽出中...' 
                : decisions.length > 0 || actionItems.length > 0
                  ? '完了'
                  : '待機中'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* アクションアイテム */}
        <div className={`bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-5 border border-orange-100 dark:border-orange-800/30 ${
          actionItems.length === 0 && !isLoading ? 'opacity-60' : 'opacity-100'
        }`}>
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">
              アクションアイテム
              {actionItems.length > 0 && (
                <span className="ml-2 text-sm font-normal text-orange-600 dark:text-orange-400">
                  ({actionItems.length}件)
                </span>
              )}
            </h3>
          </div>
          
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AIが抽出中...</p>
            </div>
          ) : actionItems.length > 0 ? (
            <div className="space-y-3">
              {actionItems.map((item, index) => (
                <div key={item.id} className="bg-white/70 dark:bg-gray-700/70 rounded-lg p-4 border border-orange-200/50 dark:border-orange-700/50">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                        {item.content}
                      </p>
                      {(item.assignee || item.due_date) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.assignee && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                              担当: {item.assignee}
                            </span>
                          )}
                          {item.due_date && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                              期限: {new Date(item.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">ミーティング終了後に自動生成されます</p>
          )}
        </div>

        {/* 決定事項 */}
        <div className={`bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-100 dark:border-green-800/30 ${
          decisions.length === 0 && !isLoading ? 'opacity-60' : 'opacity-100'
        }`}>
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">
              決定事項
              {decisions.length > 0 && (
                <span className="ml-2 text-sm font-normal text-green-600 dark:text-green-400">
                  ({decisions.length}件)
                </span>
              )}
            </h3>
          </div>
          
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AIが抽出中...</p>
            </div>
          ) : decisions.length > 0 ? (
            <div className="space-y-3">
              {decisions.map((decision, index) => (
                <div key={decision.id} className="bg-white/70 dark:bg-gray-700/70 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                        {decision.content}
                      </p>
                      {decision.decided_by && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            決定者: {decision.decided_by}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">ミーティング終了後に自動生成されます</p>
          )}
        </div>
      </div>
    </div>
  );
}