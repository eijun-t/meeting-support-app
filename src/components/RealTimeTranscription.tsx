'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TranscriptionEntry {
  id: string;
  text: string;
  timestamp: Date;
  speaker?: string;
}

interface RealTimeTranscriptionProps {
  onTranscription?: (entry: TranscriptionEntry) => void;
  onError?: (error: string) => void;
}

export function useRealTimeTranscription({ onTranscription, onError }: RealTimeTranscriptionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    // Web Speech APIのサポート確認
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ja-JP';
        recognition.maxAlternatives = 1;
        
        // Electronでの動作最適化
        if (typeof window !== 'undefined' && window.electronAPI) {
          // Electron環境での最適化設定
          recognition.continuous = false; // Electronでは非連続モードが安定
          recognition.interimResults = false;
        }
        
        recognition.onstart = () => {
          console.log('Speech recognition started');
        };
        
        recognition.onresult = (event: any) => {
          try {
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal && transcript.trim()) {
                finalTranscript += transcript;
              }
            }
            
            if (finalTranscript.trim() && onTranscription) {
              const entry: TranscriptionEntry = {
                id: Date.now().toString(),
                text: finalTranscript.trim(),
                timestamp: new Date(),
                speaker: '話者'
              };
              onTranscription(entry);
            }
          } catch (error) {
            console.error('Speech recognition result error:', error);
            if (onError) onError('音声認識結果の処理でエラーが発生しました');
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          let errorMessage = '音声認識エラーが発生しました';
          let shouldRetry = false;
          let shouldStop = true;
          
          switch (event.error) {
            case 'no-speech':
              errorMessage = '音声が検出されませんでした。';
              shouldStop = false; // 継続可能
              break;
            case 'audio-capture':
              errorMessage = 'マイクにアクセスできません。';
              break;
            case 'not-allowed':
              errorMessage = 'マイクのアクセス許可が必要です。';
              break;
            case 'network':
              if (retryCountRef.current < maxRetries) {
                shouldRetry = true;
                shouldStop = false;
                retryCountRef.current++;
                console.log(`Network error, retrying... (${retryCountRef.current}/${maxRetries})`);
                // 短い遅延後に再試行
                setTimeout(() => {
                  if (recognitionRef.current && isRecording) {
                    try {
                      recognitionRef.current.start();
                    } catch (e) {
                      console.error('Retry failed:', e);
                      setIsRecording(false);
                      retryCountRef.current = 0;
                    }
                  }
                }, 2000); // 2秒の遅延に変更
              } else {
                errorMessage = 'ネットワークエラーが続いています。しばらく待ってから再度お試しください。';
                retryCountRef.current = 0; // リセット
              }
              break;
            case 'service-not-allowed':
              errorMessage = '音声認識サービスが利用できません。';
              break;
            case 'aborted':
              errorMessage = '音声認識が中断されました。';
              shouldStop = false;
              break;
            default:
              errorMessage = `音声認識エラー: ${event.error}`;
          }
          
          if (onError && shouldStop && !shouldRetry) {
            onError(errorMessage);
          }
          if (shouldStop && !shouldRetry) {
            setIsRecording(false);
            retryCountRef.current = 0; // リセット
          }
        };
        
        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsRecording(false);
        };
        
        recognitionRef.current = recognition;
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
        if (onError) onError('音声認識の初期化に失敗しました');
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          recognitionRef.current = null;
        } catch (error) {
          console.error('Error cleaning up speech recognition:', error);
        }
      }
    };
  }, [onTranscription, onError]);

  const startRecording = useCallback(async () => {
    if (!recognitionRef.current || isRecording) return false;

    try {
      // リトライカウントをリセット
      retryCountRef.current = 0;
      
      // Electronの録音開始
      if (window.electronAPI) {
        await window.electronAPI.startRecording();
      }
      
      // マイクアクセス権限をチェック（可能であれば）
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop()); // すぐに停止
        } catch (permissionError) {
          if (onError) onError('マイクアクセス許可が必要です');
          return false;
        }
      }
      
      // Electron環境での安定性のため、短い遅延を追加
      if (window.electronAPI) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      recognitionRef.current.start();
      setIsRecording(true);
      return true;
    } catch (error) {
      console.error('Start recording error:', error);
      if (onError) onError('録音開始エラーが発生しました');
      retryCountRef.current = 0;
      return false;
    }
  }, [onError, isRecording]);

  const stopRecording = useCallback(async () => {
    try {
      // リトライカウントをリセット
      retryCountRef.current = 0;
      
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
      
      // Electronの録音停止
      if (window.electronAPI) {
        await window.electronAPI.stopRecording();
      }
      
      setIsRecording(false);
    } catch (error) {
      console.error('Stop recording error:', error);
      setIsRecording(false); // 強制的に停止状態にする
      retryCountRef.current = 0;
    }
  }, [isRecording]);

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording
  };
}