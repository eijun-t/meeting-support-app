"use client";

import { MeetingType } from "./MeetingTypeSelector";

interface ControlButtonsProps {
  isRecording: boolean;
  isPaused?: boolean;
  onStart: () => void;
  onPause?: () => void;
  onStopRequest?: () => void;
  meetingType: MeetingType;
  isSaving?: boolean;
}

export default function ControlButtons({ isRecording, isPaused, onStart, onPause, onStopRequest, meetingType, isSaving }: ControlButtonsProps) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6">
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-6">
        {/* 録音コントロールボタン */}
        <div className="flex items-center space-x-6">
          {!isRecording ? (
            // 開始ボタン
            <button
              onClick={onStart}
              disabled={isSaving}
              className="relative flex items-center space-x-4 px-10 py-5 rounded-2xl font-bold text-white transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a5 5 0 01-5-5V6a5 5 0 0110 0v6a5 5 0 01-5 5z" />
              </svg>
              <span className="text-xl relative z-10">開始</span>
            </button>
          ) : isSaving ? (
            // 保存中表示
            <button
              disabled
              className="relative flex items-center space-x-4 px-10 py-5 rounded-2xl font-bold text-white transition-all duration-300 shadow-2xl opacity-50 cursor-not-allowed bg-gradient-to-r from-yellow-500 to-orange-600"
            >
              <svg className="w-7 h-7 relative z-10 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xl relative z-10">保存中</span>
            </button>
          ) : (
            // 録音中: 一時停止と終了ボタン
            <>
              <button
                onClick={onPause}
                className={`relative flex items-center space-x-3 px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                  isPaused
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                }`}
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                {isPaused ? (
                  <>
                    <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg relative z-10">再開</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg relative z-10">一時停止</span>
                  </>
                )}
              </button>

              <button
                onClick={onStopRequest}
                className="relative flex items-center space-x-3 px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z"/>
                </svg>
                <span className="text-lg relative z-10">終了</span>
              </button>
            </>
          )}

          {/* 状態表示 */}
          <div className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-bold ${
            isSaving
              ? 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200'
              : isRecording
              ? 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-800 dark:text-red-200'
              : 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 text-gray-800 dark:text-gray-200'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              isSaving 
                ? 'bg-yellow-500 animate-pulse' 
                : isRecording 
                  ? isPaused 
                    ? 'bg-orange-500 animate-pulse' 
                    : 'bg-red-500 animate-pulse' 
                  : 'bg-gray-400'
            }`}></div>
            <div className="flex flex-col">
              <span>
                {isSaving 
                  ? 'Supabase保存中' 
                  : isRecording 
                    ? isPaused 
                      ? '一時停止中' 
                      : '録音中' 
                    : '待機中'
                }
              </span>
              <span className="text-xs font-normal opacity-70">
                {meetingType === "in-person" ? "マイク音声" : "システム音声"}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}