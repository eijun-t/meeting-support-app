'use client';

import { useState } from 'react';

export default function AudioSetupHelper() {
  const [showHelper, setShowHelper] = useState(false);

  return (
    <>
      {/* コンパクトなヘルプボタン */}
      <button
        onClick={() => setShowHelper(true)}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        音声キャプチャでお困りですか？
      </button>

      {/* モーダル */}
      {showHelper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">音声キャプチャ設定ヘルプ</h2>
                <button
                  onClick={() => setShowHelper(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* イヤホン使用時 */}
                <div className="bg-green-50 border border-green-200 p-4 rounded">
                  <h3 className="font-semibold text-green-800 mb-2">✅ インテリジェント音声キャプチャ</h3>
                  <p className="text-sm text-green-700 mb-3">
                    アプリが出力デバイスに応じて最適な方法を自動選択：
                  </p>
                  <div className="bg-green-100 p-3 rounded space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🎧</span>
                      <div>
                        <p className="font-medium text-green-800">イヤホン使用時:</p>
                        <p className="text-sm text-green-700">BlackHole経由で確実にキャプチャ（設定必要）</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🔊</span>
                      <div>
                        <p className="font-medium text-green-800">スピーカー使用時:</p>
                        <p className="text-sm text-green-700">画面共有で簡単キャプチャ（設定不要）</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BlackHole設定（イヤホン用） */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                  <h3 className="font-semibold text-blue-800 mb-2">🎧 イヤホン使用時の設定</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    イヤホンを使用する場合のみBlackHole設定が必要です：
                  </p>
                  <div className="bg-blue-100 p-3 rounded">
                    <p className="font-medium text-blue-800 mb-2">🔧 BlackHole + Multi-Output設定:</p>
                    <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                      <li><strong>BlackHole</strong>をインストール: <code className="bg-gray-200 px-1 rounded">brew install blackhole-2ch</code></li>
                      <li><strong>Audio MIDI設定</strong>でMulti-Output Device作成</li>
                      <li><strong>イヤホン</strong>とBlackHole 2chの両方をチェック</li>
                      <li>システム出力をMulti-Output Deviceに設定</li>
                      <li>✅ これでイヤホンからも音が聞こえ、アプリでもキャプチャ可能</li>
                    </ol>
                  </div>
                </div>

                {/* スピーカー使用時 */}
                <div className="bg-green-50 border border-green-200 p-4 rounded">
                  <h3 className="font-semibold text-green-800 mb-2">🔊 スピーカー使用時（簡単）</h3>
                  <p className="text-sm text-green-700 mb-3">
                    PCスピーカー使用時は特別な設定不要！画面共有で自動的にシステム音声をキャプチャします。
                  </p>
                  <div className="bg-green-100 p-3 rounded">
                    <p className="text-sm text-green-700">
                      <strong>✅ 利点:</strong> 設定不要、確実にキャプチャ可能<br/>
                      <strong>📝 注意:</strong> 録音開始時に「音声を共有」をチェックしてください
                    </p>
                  </div>
                </div>

                {/* 基本的なトラブルシューティング */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ よくある問題と解決策</h3>
                  <div className="text-sm text-yellow-700 space-y-2">
                    <div>
                      <strong>🔇 音声レベルが0 / 音声が検出されない</strong>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>BlackHole設定を確認（上記の推奨設定を参照）</li>
                        <li>画面共有時に「音声を共有」をチェック</li>
                        <li>音声を再生中のアプリを選択</li>
                      </ul>
                    </div>
                    <div>
                      <strong>🎤 マイク音声がキャプチャされている</strong>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>BlackHoleを設定すると自動選択されます</li>
                        <li>または画面共有で音声付きの画面を選択</li>
                      </ul>
                    </div>
                    <div>
                      <strong>🔄 「ご視聴ありがとうございました」が繰り返される</strong>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>音声が無音状態の可能性</li>
                        <li>システム音量を上げる</li>
                        <li>音声を再生中のアプリを確認</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* デバッグ情報 */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                  <h3 className="font-semibold text-blue-800 mb-2">🔍 デバッグ・診断</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-blue-700">
                      音声が検出されない場合は、<strong>「音声ソース診断」ボタン</strong>をクリックしてください。
                      BlackHoleの設定状況と利用可能なデバイスを確認できます。
                    </p>
                    <p className="text-sm text-blue-700">
                      技術者向け: F12でコンソールを開き、<code className="bg-gray-200 px-1 rounded">[WHISPER]</code>ログで詳細を確認できます。
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowHelper(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}