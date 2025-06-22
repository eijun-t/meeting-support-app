'use client';

import { useState, useEffect } from 'react';

interface ApiKeySettingsProps {
  onApiKeyChange: (apiKey: string) => void;
}

export default function ApiKeySettings({ onApiKeyChange }: ApiKeySettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const loadApiKey = async () => {
      // 1. 環境変数から読み込み（優先）
      if (window.electronAPI && 'getEnvVar' in window.electronAPI) {
        try {
          const envApiKey = await (window.electronAPI as any).getEnvVar('OPENAI_API_KEY');
          if (envApiKey) {
            setApiKey(envApiKey);
            onApiKeyChange(envApiKey);
            setShowSettings(false);
            return;
          }
        } catch (error) {
          console.error('Failed to load API key from environment:', error);
        }
      }

      // 2. ローカルストレージから読み込み（フォールバック）
      const savedApiKey = localStorage.getItem('openai-api-key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
        onApiKeyChange(savedApiKey);
        setShowSettings(false);
      } else {
        setShowSettings(true); // APIキーが未設定の場合は設定画面を表示
      }
    };

    loadApiKey();
  }, [onApiKeyChange]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai-api-key', apiKey.trim());
      onApiKeyChange(apiKey.trim());
      setShowSettings(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('openai-api-key');
    setApiKey('');
    onApiKeyChange('');
    setShowSettings(true);
  };

  if (!showSettings && apiKey) {
    const isFromEnv = window.electronAPI && apiKey.startsWith('sk-');
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>APIキー設定済み</span>
          {isFromEnv && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-1">
              環境変数
            </span>
          )}
        </div>
        {!isFromEnv && (
          <button
            onClick={() => setShowSettings(true)}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            変更
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="font-medium text-yellow-800">OpenAI APIキーの設定が必要です</h3>
      </div>
      
      <p className="text-sm text-yellow-700 mb-4">
        Whisper APIを使用してリアルタイム文字起こしを行うには、OpenAI APIキーが必要です。
        <a 
          href="https://platform.openai.com/api-keys" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-yellow-900"
        >
          こちら
        </a>
        から取得できます。
      </p>
      
      <div className="text-sm text-yellow-700 mb-4 p-3 bg-yellow-100 rounded border">
        <p className="font-medium mb-1">💡 環境変数での設定（推奨）</p>
        <p>プロジェクトルートに <code className="bg-yellow-200 px-1 rounded">.env</code> ファイルを作成し、以下を追加：</p>
        <code className="block mt-1 text-xs bg-gray-800 text-green-400 p-2 rounded">
          OPENAI_API_KEY=sk-your-api-key-here
        </code>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-yellow-800 mb-1">
            OpenAI APIキー
          </label>
          <div className="relative">
            <input
              type={isVisible ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              {isVisible ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
          {apiKey && (
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 text-xs text-yellow-600">
        <p>💡 APIキーはブラウザのローカルストレージに保存され、外部に送信されることはありません。</p>
      </div>

    </div>
  );
}