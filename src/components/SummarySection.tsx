"use client";

export default function SummarySection() {
  // サンプルの要約データ
  const summaryData = {
    keyPoints: [
      "プロジェクトは予定通り進行中",
      "来週末に第一段階完了予定",
      "現時点で大きな懸念事項なし",
      "次回ミーティングは来週火曜日に予定"
    ],
    actionItems: [
      { task: "進捗レポートの作成", assignee: "田中", deadline: "2024-01-15", priority: "高" },
      { task: "クライアント確認", assignee: "佐藤", deadline: "2024-01-12", priority: "中" }
    ],
    decisions: [
      "第一段階の完了期限を来週末に設定",
      "週次ミーティングを継続実施"
    ]
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "高": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "中": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "低": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AIリアルタイム要約</h2>
              <p className="text-emerald-100 text-sm">重要ポイントを自動抽出</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">更新中</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 主要ポイント要約 - メイン */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">リアルタイム要約</h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">AIが会話の重要ポイントを自動抽出</p>
            </div>
          </div>
          <div className="space-y-4">
            {summaryData.keyPoints.map((point, index) => (
              <div key={index} className="flex items-start space-x-4 bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">{index + 1}</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed text-base">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center text-white shadow-lg">
            <div className="text-2xl font-bold">15:32</div>
            <div className="text-xs opacity-80 mt-1">経過時間</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-center text-white shadow-lg">
            <div className="text-2xl font-bold">847</div>
            <div className="text-xs opacity-80 mt-1">総単語数</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-center text-white shadow-lg">
            <div className="text-2xl font-bold">6</div>
            <div className="text-xs opacity-80 mt-1">話者数</div>
          </div>
        </div>

      </div>
    </div>
  );
}