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
import AudioSourceStatus from "./AudioSourceStatus";

interface TranscriptionEntry {
  id: string;
  text: string;
  timestamp: Date;
  speaker?: string;
}

export default function MeetingLayout() {
  const [isRecording, setIsRecording] = useState(false);
  const [meetingType, setMeetingType] = useState<MeetingType>("in-person");
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [audioSource, setAudioSource] = useState<string | undefined>(undefined);
  const [audioLevel, setAudioLevel] = useState<number | undefined>(undefined);

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

  // Whisper文字起こしフック
  const { 
    isRecording: speechRecording, 
    isSupported,
    startRecording, 
    stopRecording 
  } = useWhisperTranscription({ 
    onTranscription: handleTranscription,
    onError: handleError,
    onAudioSourceChange: handleAudioSourceChange,
    apiKey,
    meetingType
  });

  const handleStartStop = async () => {
    if (isRecording) {
      await stopRecording();
      setIsRecording(false);
      setAudioSource(undefined);
      setAudioLevel(undefined);
    } else {
      const success = await startRecording();
      if (success) {
        setIsRecording(true);
      }
    }
  };

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
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                AI稼働中
              </span>
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


        {/* コントロールボタン */}
        <div className="mb-8">
          <ControlButtons 
            isRecording={isRecording} 
            onStartStop={handleStartStop}
            meetingType={meetingType}
          />
          
        </div>

        {/* メイン機能を横並び */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 要約エリア */}
          <div>
            <SummarySection isRecording={isRecording} transcriptions={transcriptions} />
          </div>
          
          {/* 提案エリア */}
          <div>
            <SpeechSuggestions isRecording={isRecording} />
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


      {/* 音声ソース状態表示 */}
      <AudioSourceStatus 
        isRecording={isRecording}
        audioSource={audioSource}
        audioLevel={audioLevel}
      />
    </div>
  );
}