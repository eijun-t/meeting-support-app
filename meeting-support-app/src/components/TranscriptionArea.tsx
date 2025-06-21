'use client';

import { useState, useEffect, useRef } from 'react';

interface TranscriptionEntry {
  id: string;
  text: string;
  timestamp: Date;
  speaker?: string;
}

interface TranscriptionAreaProps {
  transcriptions: TranscriptionEntry[];
  isRecording: boolean;
}

export default function TranscriptionArea({ transcriptions, isRecording }: TranscriptionAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新しい文字起こしが追加されたら自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">リアルタイム文字起こし</h2>
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm">録音中</span>
            </div>
          )}
          <span className="text-sm text-gray-500">
            {transcriptions.length} 件の発言
          </span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {transcriptions.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>録音を開始すると、ここに文字起こしが表示されます</p>
          </div>
        ) : (
          transcriptions.map((entry) => (
            <div 
              key={entry.id} 
              className="bg-gray-50 rounded-lg p-3 border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-600">
                  {entry.speaker || '話者'}
                </span>
                <span className="text-xs text-gray-500">
                  {entry.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-800 leading-relaxed">
                {entry.text}
              </p>
            </div>
          ))
        )}
      </div>
      
      {transcriptions.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <button 
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => {
              const text = transcriptions.map(t => 
                `[${t.timestamp.toLocaleTimeString()}] ${t.speaker || '話者'}: ${t.text}`
              ).join('\n');
              navigator.clipboard.writeText(text);
            }}
          >
            全文をクリップボードにコピー
          </button>
        </div>
      )}
    </div>
  );
}