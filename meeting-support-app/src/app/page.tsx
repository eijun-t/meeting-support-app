'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

// コンポーネントを動的インポートしてクライアントサイドレンダリング
const AudioRecorder = dynamic(() => import('@/components/AudioRecorder'), { ssr: false });
const TranscriptionArea = dynamic(() => import('@/components/TranscriptionArea'), { ssr: false });

interface TranscriptionEntry {
  id: string;
  text: string;
  timestamp: Date;
  speaker?: string;
}

export default function Home() {
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscription = useCallback((text: string) => {
    const newEntry: TranscriptionEntry = {
      id: Date.now().toString(),
      text: text.trim(),
      timestamp: new Date(),
      speaker: '話者'
    };
    
    setTranscriptions(prev => [...prev, newEntry]);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    console.error('Transcription error:', errorMessage);
  }, []);

  const clearError = () => setError(null);

  // Electronの環境チェック
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Window object available');
      console.log('electronAPI:', window.electronAPI);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            AI会議アシスタント
          </h1>
          <p className="text-gray-600">
            リアルタイム文字起こしで会議をサポート
          </p>
        </header>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded flex items-center justify-between">
            <span className="text-red-700">{error}</span>
            <button 
              onClick={clearError}
              className="text-red-500 hover:text-red-700 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: 録音コントロール */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">録音コントロール</h2>
              <AudioRecorder 
                onTranscription={handleTranscription}
                onError={handleError}
                onRecordingChange={setIsRecording}
              />
              
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-medium text-gray-700 mb-2">使い方</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 「録音開始」ボタンをクリック</li>
                  <li>• マイクへのアクセスを許可</li>
                  <li>• 話すとリアルタイムで文字起こし</li>
                  <li>• 「録音停止」で終了</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 右側: 文字起こし表示 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md h-96">
              <TranscriptionArea 
                transcriptions={transcriptions}
                isRecording={isRecording}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            この機能を使用するには、ブラウザでマイクアクセスを許可してください。
            Chrome、Edge、Safari等のモダンブラウザで動作します。
          </p>
        </div>
      </div>
    </div>
  );
}