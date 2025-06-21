'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  onError: (error: string) => void;
  onRecordingChange?: (isRecording: boolean) => void;
}

export default function AudioRecorder({ onTranscription, onError, onRecordingChange }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Web Speech APIのサポート確認
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ja-JP';
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          onTranscription(finalTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        let errorMessage = '音声認識エラーが発生しました';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = '音声が検出されませんでした。マイクの音量を確認してください。';
            break;
          case 'audio-capture':
            errorMessage = 'マイクにアクセスできません。ブラウザの設定を確認してください。';
            break;
          case 'not-allowed':
            errorMessage = 'マイクのアクセス許可が必要です。ブラウザの設定を確認してください。';
            break;
          case 'network':
            errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
            break;
          case 'service-not-allowed':
            errorMessage = '音声認識サービスが利用できません。';
            break;
          default:
            errorMessage = `音声認識エラー: ${event.error}`;
        }
        
        onError(errorMessage);
        setIsRecording(false);
        onRecordingChange?.(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        onRecordingChange?.(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscription, onError]);

  const startRecording = async () => {
    if (!recognitionRef.current) {
      onError('音声認識がサポートされていません');
      return;
    }

    try {
      // Electronの録音開始
      if (window.electronAPI) {
        await window.electronAPI.startRecording();
      }
      
      recognitionRef.current.start();
      setIsRecording(true);
      onRecordingChange?.(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '録音開始エラーが発生しました';
      onError(`録音開始エラー: ${errorMessage}`);
      setIsRecording(false);
      onRecordingChange?.(false);
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Electronの録音停止
    if (window.electronAPI) {
      await window.electronAPI.stopRecording();
    }
    
    setIsRecording(false);
    onRecordingChange?.(false);
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 rounded">
        <p className="text-red-700">このブラウザは音声認識をサポートしていません</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded font-medium ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isRecording ? '録音停止' : '録音開始'}
      </button>
      
      {isRecording && (
        <div className="flex items-center gap-2 text-red-500">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm">録音中...</span>
        </div>
      )}
    </div>
  );
}