'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TranscriptionEntry {
  id: string;
  text: string;
  timestamp: Date;
  speaker?: string;
}

interface WhisperTranscriptionProps {
  onTranscription?: (entry: TranscriptionEntry) => void;
  onError?: (error: string) => void;
  apiKey?: string;
}

export function useWhisperTranscription({ onTranscription, onError, apiKey }: WhisperTranscriptionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // MediaRecorder APIのサポート確認
    setIsSupported(true);
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    if (!apiKey) {
      if (onError) onError('OpenAI APIキーが設定されていません。設定から追加してください。');
      return;
    }

    try {
      const formData = new FormData();
      // 送信する音声データに正しいファイル名とMIMEタイプを設定
      const fileName = 'audio.webm';
      
      formData.append('file', audioBlob, fileName);
      formData.append('model', 'whisper-1');
      formData.append('language', 'ja');
      formData.append('response_format', 'json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        
        if (response.status === 401) {
          throw new Error('APIキーが無効です。正しいOpenAI APIキーを設定してください。');
        } else if (response.status === 429) {
          throw new Error('API使用量の制限に達しました。しばらく待ってから再度お試しください。');
        } else if (response.status === 400) {
          throw new Error(`音声データが無効です。ファイルサイズ: ${audioBlob.size}バイト`);
        } else {
          throw new Error(`API エラー: ${response.status} - ${errorText}`);
        }
      }

      const result = await response.json();
      
      if (result.text && result.text.trim() && onTranscription) {
        const entry: TranscriptionEntry = {
          id: Date.now().toString(),
          text: result.text.trim(),
          timestamp: new Date(),
          speaker: '話者'
        };
        onTranscription(entry);
      }
    } catch (error) {
      console.error('Whisper API error:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Whisper APIでエラーが発生しました');
      }
    }
  }, [apiKey, onTranscription, onError]);

  const startRecording = useCallback(async () => {
    if (!isSupported || isRecording) return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;
      setIsRecording(true);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recordAndSend = () => {
        if (!streamRef.current) {
          // ストリームがなければ停止
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRecording(false);
          return;
        }

        const recorder = new MediaRecorder(streamRef.current, { mimeType });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: mimeType });
          if (audioBlob.size > 1024) {
            console.log(`Sending chunk to Whisper API: ${audioBlob.size} bytes`);
            await transcribeAudio(audioBlob);
          }
        };

        recorder.start();
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, 20000); // 20秒間録音
      };

      // 最初のチャンクをすぐに録音・送信し、その後はインターバルで繰り返す
      recordAndSend();
      intervalRef.current = setInterval(recordAndSend, 20100); // 20.1秒ごとにサイクル

      return true;
    } catch (error) {
      console.error('Start recording error:', error);
      if (onError) {
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          onError('マイクアクセスが拒否されました。ブラウザの設定でマイクアクセスを許可してください。');
        } else {
          onError('録音開始エラーが発生しました');
        }
      }
      setIsRecording(false);
      return false;
    }
  }, [isSupported, isRecording, transcribeAudio, onError]);

  const stopRecording = useCallback(async () => {
    setIsRecording(false); // これを最初に呼ぶことで、サイクルを停止
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording
  };
}