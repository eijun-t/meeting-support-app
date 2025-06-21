"use client";

export default function MeetingPostSection() {
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
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-300 text-sm font-medium">待機中</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* アクションアイテム */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-5 border border-orange-100 dark:border-orange-800/30 opacity-60">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">アクションアイテム</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">ミーティング終了後に自動生成されます</p>
        </div>

        {/* 決定事項 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-100 dark:border-green-800/30 opacity-60">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">決定事項</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">ミーティング終了後に自動生成されます</p>
        </div>
      </div>
    </div>
  );
}