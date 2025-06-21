"use client";

import { MeetingType } from "./MeetingTypeSelector";

interface TranscriptionAreaProps {
  isRecording: boolean;
  meetingType: MeetingType;
}

export default function TranscriptionArea({ isRecording, meetingType }: TranscriptionAreaProps) {
  // サンプルの転写データ
  const sampleTranscription = [
    { id: 1, speaker: "田中", text: "本日はお忙しい中、お時間をいただきありがとうございます。", timestamp: "10:00:15" },
    { id: 2, speaker: "佐藤", text: "こちらこそ、よろしくお願いします。早速、プロジェクトの進捗について確認させていただきたいと思います。", timestamp: "10:00:22" },
    { id: 3, speaker: "田中", text: "はい。現在のところ、予定通り進んでおり、来週末には第一段階の完了予定です。", timestamp: "10:00:35" },
    { id: 4, speaker: "佐藤", text: "順調ですね。何か懸念事項はありますでしょうか？", timestamp: "10:00:45" },
  ];

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 h-fit">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-slate-600 to-gray-700 px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 011 1v2a1 1 0 01-1 1h-1v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8H5a1 1 0 01-1-1V5a1 1 0 011-1h2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">文字起こし</h2>
              <p className="text-slate-200 text-sm">
                {meetingType === "in-person" ? "マイク音声をテキストに変換" : "システム音声をテキストに変換"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isRecording && (
              <>
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-200 font-medium">
                  録音中
                </span>
              </>
            )}
            {!isRecording && (
              <>
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-300">
                  停止中
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 転写内容 */}
      <div className="p-4">
        {isRecording ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {sampleTranscription.map((item) => (
              <div key={item.id} className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-700/80 dark:to-gray-800/80 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">
                        {item.speaker.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.speaker}
                      </p>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {/* リアルタイム入力インジケーター */}
            <div className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200/50 dark:border-yellow-700/50">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a5 5 0 01-5-5V6a5 5 0 0110 0v6a5 5 0 01-5 5z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      音声入力中...
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                      AIが文字起こし処理中
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a5 5 0 01-5-5V6a5 5 0 0110 0v6a5 5 0 01-5 5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              文字起こし準備完了
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
              「開始」ボタンを押すと、音声の文字起こしが始まります
            </p>
          </div>
        )}
      </div>
    </div>
  );
}