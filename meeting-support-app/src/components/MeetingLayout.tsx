"use client";

import { useState } from "react";
import TranscriptionArea from "./TranscriptionArea";
import SummarySection from "./SummarySection";
import SpeechSuggestions from "./SpeechSuggestions";
import MeetingPostSection from "./MeetingPostSection";
import MeetingTypeSelector, { MeetingType } from "./MeetingTypeSelector";
import ControlButtons from "./ControlButtons";

export default function MeetingLayout() {
  const [isRecording, setIsRecording] = useState(false);
  const [meetingType, setMeetingType] = useState<MeetingType>("in-person");

  const handleStartStop = () => {
    setIsRecording(!isRecording);
  };

  const handleMeetingTypeChange = (type: MeetingType) => {
    setMeetingType(type);
  };

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
            <SummarySection />
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
            <TranscriptionArea isRecording={isRecording} meetingType={meetingType} />
          </div>

          {/* ミーティング終了後エリア */}
          <div>
            <MeetingPostSection />
          </div>
        </div>
      </main>
    </div>
  );
}