"use client";

import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SessionService, SessionListItem, SessionData } from "../services/supabase";
import { Decision, ActionItem } from "../types/meeting";

interface MeetingRecordsProps {
  onClose?: () => void;
}

export default function MeetingRecords({ onClose }: MeetingRecordsProps) {
  // State management
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load sessions list on component mount
  useEffect(() => {
    loadSessionsList();
  }, []);

  const loadSessionsList = async () => {
    setIsLoadingList(true);
    try {
      const sessionList = await SessionService.getSessionList();
      setSessions(sessionList);
    } catch (error) {
      console.error('Failed to load sessions list:', error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const loadSessionDetails = async (sessionId: string) => {
    setIsLoadingDetails(true);
    setSelectedSessionId(sessionId);
    try {
      const sessionDetails = await SessionService.getSession(sessionId);
      setSelectedSession(sessionDetails);
    } catch (error) {
      console.error('Failed to load session details:', error);
      setSelectedSession(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // State for enhanced search
  const [searchResults, setSearchResults] = useState<{[sessionId: string]: SessionData}>({});
  const [isSearching, setIsSearching] = useState(false);

  // Enhanced search function that loads full session data when needed
  const performEnhancedSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({});
      return;
    }

    setIsSearching(true);
    const results: {[sessionId: string]: SessionData} = {};
    
    // Load full data for each session to search in all fields
    for (const session of sessions) {
      try {
        const fullSession = await SessionService.getSession(session.id);
        if (fullSession && searchInSession(fullSession, query)) {
          results[session.id] = fullSession;
        }
      } catch (error) {
        console.error(`Failed to load session ${session.id} for search:`, error);
      }
    }
    
    setSearchResults(results);
    setIsSearching(false);
  };

  // Function to search within a session's content
  const searchInSession = (session: SessionData, query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    
    // Search in title
    if (session.title && session.title.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Search in summary
    if (session.summary_data && session.summary_data.minutesText && 
        session.summary_data.minutesText.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Search in decisions
    if (session.decisions && session.decisions.some(decision => 
        decision.content.toLowerCase().includes(lowerQuery) ||
        (decision.decided_by && decision.decided_by.toLowerCase().includes(lowerQuery))
    )) {
      return true;
    }
    
    // Search in action items
    if (session.action_items && session.action_items.some(item => 
        item.content.toLowerCase().includes(lowerQuery) ||
        (item.assignee && item.assignee.toLowerCase().includes(lowerQuery))
    )) {
      return true;
    }
    
    // Search in meeting context
    if (session.meeting_context) {
      const context = session.meeting_context;
      if ((context.title && context.title.toLowerCase().includes(lowerQuery)) ||
          (context.backgroundInfo && context.backgroundInfo.toLowerCase().includes(lowerQuery)) ||
          (context.agenda && context.agenda.some(item => item.toLowerCase().includes(lowerQuery))) ||
          (context.participants && context.participants.some(p => p.toLowerCase().includes(lowerQuery)))) {
        return true;
      }
    }
    
    return false;
  };

  // Filter sessions based on search query and results
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;

    if (Object.keys(searchResults).length > 0) {
      // Use enhanced search results
      return sessions.filter(session => searchResults[session.id]);
    } else {
      // Fallback to basic title search while enhanced search is loading
      const query = searchQuery.toLowerCase();
      return sessions.filter(session => 
        session.title && session.title.toLowerCase().includes(query)
      );
    }
  }, [sessions, searchQuery, searchResults]);

  // Utility functions
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'draft': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'archived': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '完了';
      case 'draft': return '下書き';
      case 'archived': return 'アーカイブ';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">議事録一覧</h2>
                <p className="text-blue-100 text-sm">過去の会議記録を閲覧・検索</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="flex flex-1 min-h-0">
          
          {/* Left Sidebar - Sessions List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            
            {/* Search Box */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                  ) : (
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="タイトル、要約、決定事項、アクションアイテムで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      performEnhancedSearch(searchQuery);
                    }
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={() => performEnhancedSearch(searchQuery)}
                    disabled={isSearching || !searchQuery.trim()}
                    className="text-gray-400 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="詳細検索を実行"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{filteredSessions.length} / {sessions.length} 件</span>
                {searchQuery && (
                  <span className="text-blue-500">
                    Enterキーまたは⚡ボタンで詳細検索
                  </span>
                )}
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingList ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">読み込み中...</p>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {searchQuery ? "検索結果がありません" : "議事録がありません"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedSessionId === session.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 bg-white dark:bg-gray-700/50'
                      }`}
                      onClick={() => loadSessionDetails(session.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">
                          {session.title || '無題の会議'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(session.status)}`}>
                          {getStatusText(session.status)}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>{formatDate(session.created_at)}</span>
                          <span>{formatDuration(session.duration)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>発言: {session.transcription_count}件</span>
                          <span>参加者: {session.participant_count}人</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Area - Session Details */}
          <div className="flex-1 flex flex-col">
            {!selectedSessionId ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">会議を選択してください</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">左側のリストから会議を選択すると詳細が表示されます</p>
                </div>
              </div>
            ) : isLoadingDetails ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">議事録を読み込み中...</p>
                </div>
              </div>
            ) : selectedSession ? (
              <div className="flex-1 overflow-y-auto p-6">
                {/* Session Header */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedSession.title || '無題の会議'}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>作成: {formatDate(selectedSession.created_at || '')}</span>
                    <span>時間: {formatDuration(selectedSession.duration)}</span>
                    <span>参加者: {selectedSession.participant_count}人</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSession.status)}`}>
                      {getStatusText(selectedSession.status)}
                    </span>
                  </div>
                </div>

                {/* Meeting Context */}
                {selectedSession.meeting_context && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">会議情報</h3>
                    {selectedSession.meeting_context.backgroundInfo && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">背景・目的:</span> {selectedSession.meeting_context.backgroundInfo}
                      </p>
                    )}
                    {selectedSession.meeting_context.agenda && selectedSession.meeting_context.agenda.length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">アジェンダ:</span>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {selectedSession.meeting_context.agenda.filter(item => item.trim()).map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Summary */}
                {selectedSession.summary_data && selectedSession.summary_data.minutesText && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      議事録要約
                    </h3>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed prose prose-sm prose-blue dark:prose-invert max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-3 text-gray-900 dark:text-white" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-base font-semibold mb-2 text-gray-800 dark:text-gray-100" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200" {...props} />,
                            p: ({node, ...props}) => <p className="mb-3 text-gray-800 dark:text-gray-200" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-800 dark:text-gray-200" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-800 dark:text-gray-200" {...props} />,
                            li: ({node, ...props}) => <li className="text-gray-800 dark:text-gray-200" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />,
                            em: ({node, ...props}) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
                            code: ({node, ...props}) => <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200" {...props} />,
                            pre: ({node, ...props}) => <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto mb-3" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-700 dark:text-gray-300 mb-3" {...props} />,
                            a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
                            table: ({node, ...props}) => <table className="min-w-full border border-gray-300 dark:border-gray-600 mb-3" {...props} />,
                            th: ({node, ...props}) => <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-left text-xs font-medium" {...props} />,
                            td: ({node, ...props}) => <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs" {...props} />,
                          }}
                        >
                          {selectedSession.summary_data.minutesText}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Decisions */}
                {selectedSession.decisions && selectedSession.decisions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      決定事項 ({selectedSession.decisions.length}件)
                    </h3>
                    <div className="space-y-3">
                      {selectedSession.decisions.map((decision, index) => (
                        <div key={decision.id} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
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
                  </div>
                )}

                {/* Action Items */}
                {selectedSession.action_items && selectedSession.action_items.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      アクションアイテム ({selectedSession.action_items.length}件)
                    </h3>
                    <div className="space-y-3">
                      {selectedSession.action_items.map((item, index) => (
                        <div key={item.id} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
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
                  </div>
                )}

                {/* No Content Message */}
                {(!selectedSession.summary_data || !selectedSession.summary_data.minutesText) && 
                 (!selectedSession.decisions || selectedSession.decisions.length === 0) &&
                 (!selectedSession.action_items || selectedSession.action_items.length === 0) && (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">この会議にはまだコンテンツがありません</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">議事録や決定事項が生成されると、ここに表示されます</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-500 dark:text-red-400 font-medium">議事録の読み込みに失敗しました</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">別の会議を選択してください</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}