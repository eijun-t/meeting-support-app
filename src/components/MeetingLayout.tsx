"use client";

import { useState, useCallback, useEffect } from "react";
import TranscriptionArea from "./TranscriptionArea";
import SummarySection from "./SummarySection";
import SpeechSuggestions from "./SpeechSuggestions";
import MeetingPostSection from "./MeetingPostSection";
import MeetingTypeSelector, { MeetingType } from "./MeetingTypeSelector";
import ControlButtons from "./ControlButtons";
import { useWhisperTranscription } from "./WhisperTranscription";
import ApiKeySettings from "./ApiKeySettings";
import AudioSetupHelper from "./AudioSetupHelper";
import MeetingPreparation from "./MeetingPreparation";
import SessionHistory from "./SessionHistory";
import { MeetingContext } from "../types/meetingContext";
import { SessionService } from "../services/supabase";

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

export default function MeetingLayout() {
  const [isRecording, setIsRecording] = useState(false);
  const [meetingType, setMeetingType] = useState<MeetingType>("in-person");
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [audioSource, setAudioSource] = useState<string | undefined>(undefined);
  const [audioLevel, setAudioLevel] = useState<number | undefined>(undefined);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    minutesText: '',
    lastUpdated: null,
  });
  const [meetingContext, setMeetingContext] = useState<MeetingContext | null>(null);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  const handleTranscription = useCallback((entry: TranscriptionEntry) => {
    setTranscriptions(prev => [...prev, entry]);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    console.error('Transcription error:', errorMessage);
  }, []);

  const handleAudioSourceChange = useCallback((source: string, level: number) => {
    setAudioSource(source);
    setAudioLevel(level);
  }, []);

  const handleSummaryChange = useCallback((newSummaryData: SummaryData) => {
    setSummaryData(newSummaryData);
  }, []);

  const handleMeetingContextChange = useCallback((context: MeetingContext) => {
    setMeetingContext(context);
  }, []);

  // Save session to Supabase
  const saveSession = useCallback(async () => {
    if (!meetingContext || transcriptions.length === 0) {
      console.warn('No data to save');
      return;
    }

    setIsSaving(true);
    
    try {
      const sessionData = {
        title: meetingContext.title || `会議 ${new Date().toLocaleDateString()}`,
        status: 'completed' as const,
        duration: Math.floor((Date.now() - (transcriptions[0]?.timestamp?.getTime() || Date.now())) / 1000),
        participant_count: meetingContext.participants.filter(p => p.trim()).length || 1,
        transcription_count: transcriptions.length,
        has_summary: !!summaryData.minutesText,
        has_materials: meetingContext.materials.length > 0,
        transcriptions: transcriptions,
        summary_data: summaryData,
        meeting_context: meetingContext
      };

      const sessionId = await SessionService.saveSession(sessionData);
      
      if (sessionId) {
        console.log('Session saved successfully:', sessionId);
        // Clear current session data
        setTranscriptions([]);
        setSummaryData({ minutesText: '', lastUpdated: null });
        setMeetingContext(null);
        // Show success message
        setError('会議が正常に保存されました');
        setTimeout(() => setError(null), 3000);
      } else {
        setError('会議の保存中にエラーが発生しました');
      }
    } catch (error) {
      console.error('Failed to save session:', error);
      setError('会議の保存中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  }, [meetingContext, transcriptions, summaryData]);

  // Whisper文字起こしフック
  const { 
    isPaused,
    startRecording, 
    stopRecording,
    pauseRecording,
    resumeRecording
  } = useWhisperTranscription({ 
    onTranscription: handleTranscription,
    onError: handleError,
    onAudioSourceChange: handleAudioSourceChange,
    apiKey,
    meetingType
  });

  // 録音開始
  const handleStart = useCallback(async () => {
    const success = await startRecording();
    if (success) {
      setIsRecording(true);
    }
  }, [startRecording]);

  // 一時停止/再開
  const handlePause = useCallback(() => {
    if (isPaused) {
      resumeRecording();
      console.log('Recording resumed');
    } else {
      pauseRecording();
      console.log('Recording paused');
    }
  }, [isPaused, pauseRecording, resumeRecording]);

  // 終了確認
  const handleStopRequest = useCallback(() => {
    setShowStopConfirm(true);
  }, []);

  // 終了実行
  const handleStopConfirm = useCallback(async () => {
    setShowStopConfirm(false);
    await stopRecording();
    setIsRecording(false);
    setAudioSource(undefined);
    setAudioLevel(undefined);
    
    // Auto-save session after stopping recording
    if (transcriptions.length > 0) {
      await saveSession();
    }
  }, [stopRecording, transcriptions, saveSession]);

  // 終了キャンセル
  const handleStopCancel = useCallback(() => {
    setShowStopConfirm(false);
  }, []);


  const handleMeetingTypeChange = (type: MeetingType) => {
    setMeetingType(type);
  };

  // Electronグローバルエラーのリスナー
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI && 'onGlobalError' in window.electronAPI) {
      (window.electronAPI as any).onGlobalError((errorMessage: string) => {
        setError(`システムエラー: ${errorMessage}`);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900">
      {/* ヘッダー */}
      <header className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 shadow-lg border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI会議アシスタント
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
                スマートな要約と発言提案でミーティングを効率化
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setShowSessionHistory(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-white">履歴</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  AI稼働中
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 会議タイプ選択 - さりげなく */}
        <MeetingTypeSelector
          selectedType={meetingType}
          onTypeChange={handleMeetingTypeChange}
        />

        {/* APIキー設定 */}
        <div className="mb-6">
          <ApiKeySettings onApiKeyChange={setApiKey} />
          <div className="mt-2">
            <AudioSetupHelper />
          </div>
        </div>


        {/* 会議準備 */}
        <div className="mb-6">
          <MeetingPreparation onContextChange={handleMeetingContextChange} />
        </div>

        {/* コントロールボタン */}
        <div className="mb-8">
          <ControlButtons 
            isRecording={isRecording}
            isPaused={isPaused}
            onStart={handleStart}
            onPause={handlePause}
            onStopRequest={handleStopRequest}
            meetingType={meetingType}
            isSaving={isSaving}
          />
          
        </div>

        {/* メイン機能を横並び */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 要約エリア */}
          <div>
            <SummarySection 
              isRecording={isRecording}
              isPaused={isPaused}
              transcriptions={transcriptions}
              onSummaryChange={handleSummaryChange}
              meetingContext={meetingContext}
            />
          </div>
          
          {/* 提案エリア */}
          <div>
            <SpeechSuggestions 
              summaryData={summaryData}
              apiKey={apiKey}
              isPaused={isPaused}
              meetingContext={meetingContext}
            />
          </div>
        </div>

        {/* 下部セクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 文字起こしエリア */}
          <div>
            <TranscriptionArea 
              transcriptions={transcriptions} 
              isRecording={isRecording} 
            />
          </div>

          {/* ミーティング終了後エリア */}
          <div>
            <MeetingPostSection />
          </div>
        </div>

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </main>

      {/* セッション履歴モーダル */}
      {showSessionHistory && (
        <SessionHistory 
          onSelectSession={(sessionId) => {
            console.log('Selected session:', sessionId);
            setShowSessionHistory(false);
          }}
          onClose={() => setShowSessionHistory(false)}
        />
      )}

      {/* 終了確認ポップアップ */}
      {showStopConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">録音を終了しますか？</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">録音を終了すると、会議データがSupabaseに保存されます。</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>録音時間:</span>
                  <span className="font-medium">{Math.floor((Date.now() - (transcriptions[0]?.timestamp?.getTime() || Date.now())) / 60000)}分</span>
                </div>
                <div className="flex justify-between">
                  <span>発言数:</span>
                  <span className="font-medium">{transcriptions.length}件</span>
                </div>
                <div className="flex justify-between">
                  <span>要約:</span>
                  <span className="font-medium">{summaryData.minutesText ? 'あり' : 'なし'}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleStopCancel}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleStopConfirm}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                >
                  終了して保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}