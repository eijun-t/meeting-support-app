"use client";

import { MeetingType } from "./MeetingTypeSelector";

interface ControlButtonsProps {
  isRecording: boolean;
  onStartStop: () => void;
  meetingType: MeetingType;
}

export default function ControlButtons({ isRecording, onStartStop, meetingType }: ControlButtonsProps) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6">
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-6">
        {/* メイン録音ボタン */}
        <div className="flex items-center space-x-6">
          <button
            onClick={onStartStop}
            className={`relative flex items-center space-x-4 px-10 py-5 rounded-2xl font-bold text-white transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 ${
              isRecording
                ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
            }`}
          >
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            {isRecording ? (
              <>
                <svg className="w-7 h-7 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z"/>
                </svg>
                <span className="text-xl relative z-10">停止</span>
              </>
            ) : (
              <>
                <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a5 5 0 01-5-5V6a5 5 0 0110 0v6a5 5 0 01-5 5z" />
                </svg>
                <span className="text-xl relative z-10">開始</span>
              </>
            )}
          </button>

          {/* 状態表示 */}
          <div className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-bold ${
            isRecording
              ? 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-800 dark:text-red-200'
              : 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 text-gray-800 dark:text-gray-200'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <div className="flex flex-col">
              <span>{isRecording ? '録音中' : '待機中'}</span>
              <span className="text-xs font-normal opacity-70">
                {meetingType === "in-person" ? "マイク音声" : "システム音声"}
              </span>
            </div>
          </div>
        </div>

        {/* 追加コントロール */}
        <div className="flex items-center space-x-4">
          {/* 一時停止ボタン */}
          <button
            disabled={!isRecording}
            className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              isRecording
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
            title="一時停止"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* 設定ボタン */}
          <button
            className="p-4 rounded-xl bg-gradient-to-r from-slate-400 to-gray-500 hover:from-slate-500 hover:to-gray-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            title="設定"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* エクスポートボタン */}
          <button
            disabled={!isRecording}
            className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              isRecording
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
            title="エクスポート"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* オーディオレベルインジケーター */}
      {isRecording && (
        <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-600/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">音声レベル</span>
            </div>
            <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
              良好
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: '75%' }}
              ></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>静寂</span>
            <span>最適</span>
            <span>大音量</span>
          </div>
        </div>
      )}
    </div>
  );
}