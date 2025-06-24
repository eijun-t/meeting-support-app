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
  onAudioSourceChange?: (source: string, level: number) => void;
  apiKey?: string;
  meetingType?: 'in-person' | 'online';
}

export function useWhisperTranscription({ onTranscription, onError, onAudioSourceChange, apiKey, meetingType }: WhisperTranscriptionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentRecorderRef = useRef<MediaRecorder | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioLevelRef = useRef<number>(0);
  const genericResponseCountRef = useRef<number>(0);
  const lastTranscriptionTimeRef = useRef<number>(0);

  useEffect(() => {
    setIsSupported(true);
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 音声レベル監視の設定
  const setupAudioAnalysis = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      console.log('[WHISPER] Audio analysis setup complete');
      
      // 音声ソース情報を取得
      const trackLabel = stream.getAudioTracks()[0]?.label || '';
      
      // 音声レベル監視ループ
      const monitorAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          
          // 平均音声レベルを計算
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          audioLevelRef.current = average;
          
          // 音声レベルをUIに送信（1秒に約2回程度）
          if (Math.random() < 0.02 && onAudioSourceChange) {
            onAudioSourceChange(trackLabel, average);
          }
          
          // 音声レベルが継続的に0の場合の警告
          if (average < 1) {
            const now = Date.now();
            if (now - lastTranscriptionTimeRef.current > 60000) { // 1分間音声なし
              if (Math.random() < 0.001) { // 約0.1%の確率（10秒に1回程度）
                const isInPerson = meetingType === 'in-person';
                if (isInPerson) {
                  console.warn('[WHISPER] 🔴 マイク音声レベルが0です');
                  console.warn('[WHISPER] マイク設定を確認してください:');
                  console.warn('[WHISPER] 1. マイクが正しく接続されているか確認');
                  console.warn('[WHISPER] 2. マイクの音量を上げてください');
                  console.warn('[WHISPER] 3. 実際に声を出して話してください');
                } else {
                  console.warn('[WHISPER] 🔴 BlackHoleが検出されているが音声レベルが0です');
                  console.warn('[WHISPER] システム音声設定を確認してください:');
                  console.warn('[WHISPER] 1. システム環境設定 > サウンド > 出力で「Multi-Output Device」を選択');
                  console.warn('[WHISPER] 2. または音声設定で「画面共有」モードに切り替え');
                }
              }
            }
          }
          
          // 通常の音声レベルログ（5秒ごと）
          if (Math.random() < 0.01) { // 約1%の確率でログ出力（5秒に1回程度）
            console.log('[WHISPER] Audio level:', Math.round(average), 'Max:', Math.max(...dataArray));
          }
        }
        
        if (isRecording) {
          requestAnimationFrame(monitorAudioLevel);
        }
      };
      
      monitorAudioLevel();
      
    } catch (error) {
      console.error('[WHISPER] Audio analysis setup failed:', error);
    }
  }, [isRecording, onAudioSourceChange, meetingType]);

  // 音声データの詳細分析
  const analyzeAudioBlob = useCallback(async (audioBlob: Blob): Promise<void> => {
    console.log('[WHISPER] === AUDIO ANALYSIS START ===');
    console.log('[WHISPER] Meeting type:', meetingType);
    console.log('[WHISPER] Blob size:', audioBlob.size, 'bytes');
    console.log('[WHISPER] Blob type:', audioBlob.type);
    console.log('[WHISPER] Current audio level:', Math.round(audioLevelRef.current));
    
    // ArrayBufferに変換して最初と最後の数バイトを確認
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      console.log('[WHISPER] First 10 bytes:', Array.from(uint8Array.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '));
      console.log('[WHISPER] Last 10 bytes:', Array.from(uint8Array.slice(-10)).map(b => b.toString(16).padStart(2, '0')).join(' '));
      
      // 音声データの統計
      const nonZeroBytes = uint8Array.filter(b => b !== 0).length;
      const silenceRatio = (uint8Array.length - nonZeroBytes) / uint8Array.length;
      
      console.log('[WHISPER] Non-zero bytes:', nonZeroBytes, '/', uint8Array.length);
      console.log('[WHISPER] Silence ratio:', Math.round(silenceRatio * 100) + '%');
      
      if (silenceRatio > 0.9) {
        console.warn('[WHISPER] ⚠️ HIGH SILENCE RATIO - Audio might be too quiet!');
        console.warn('[WHISPER] 💡 TIPS:');
        console.warn('[WHISPER]   1. Make sure system audio is actually playing');
        console.warn('[WHISPER]   2. When browser asks for screen sharing, check "Share audio" option');
        console.warn('[WHISPER]   3. Select the correct application/tab that is playing audio');
        console.warn('[WHISPER]   4. Increase system volume if audio is too quiet');
      }
      
      if (audioLevelRef.current < 3) {
        const trackLabel = streamRef.current?.getAudioTracks()[0]?.label || '';
        const isInPerson = meetingType === 'in-person';
        console.warn('[WHISPER] ⚠️ VERY LOW AUDIO LEVEL:', Math.round(audioLevelRef.current));
        console.warn('[WHISPER] Meeting type:', meetingType, 'Track label:', trackLabel);
        
        if (isInPerson) {
          console.warn('[WHISPER] ⚠️ Low microphone level detected!');
          console.warn('[WHISPER] Tips for microphone:');
          console.warn('[WHISPER] 1. Check microphone permissions in browser/system');
          console.warn('[WHISPER] 2. Increase microphone volume in system settings');
          console.warn('[WHISPER] 3. Speak closer to the microphone');
          console.warn('[WHISPER] 4. Make sure microphone is not muted');
          console.warn('[WHISPER] 5. Try speaking more loudly to test microphone sensitivity');
        } else {
          console.warn('[WHISPER] This is expected for BlackHole/Virtual devices when no system audio is playing');
          console.warn('[WHISPER] Make sure there is actual system audio playing (music, video, etc.)');
        }
      }
      
      // 音声データ統計をコンソールに記録（ダウンロードは削除）
      console.log('[WHISPER] Audio blob analysis completed');
      
    } catch (error) {
      console.error('[WHISPER] Audio analysis failed:', error);
    }
    
    console.log('[WHISPER] === AUDIO ANALYSIS END ===');
  }, [meetingType]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    console.log('[WHISPER] transcribeAudio called with blob size:', audioBlob.size);
    
    // 音声データの詳細分析を実行
    await analyzeAudioBlob(audioBlob);
    
    if (!apiKey) {
      console.error('[WHISPER] No API key available');
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
      
      console.log('[WHISPER] Sending request to Whisper API with data:', {
        fileSize: audioBlob.size,
        fileName,
        model: 'whisper-1',
        language: 'ja'
      });

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });
      
      console.log('[WHISPER] API response status:', response.status);

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
      console.log('[WHISPER] API response result:', result);
      
      if (result.text && result.text.trim()) {
        const transcribedText = result.text.trim();
        
        // 典型的な「デフォルト」応答を検出（音声キャプチャの問題を検出するためのみ）
        const genericResponses = [
          'ご視聴ありがとうございました',
          'Thank you for watching',
          'ありがとうございました'
        ];
        
        const isGenericResponse = genericResponses.some(generic => transcribedText === generic);
        
        if (isGenericResponse) {
          genericResponseCountRef.current++;
          console.log('[WHISPER] Generic response detected:', transcribedText, `(${genericResponseCountRef.current} consecutive)`);
          
          // より寛容な条件に変更：5回連続 かつ 最低30秒間の沈黙
          const timeSinceLastValid = Date.now() - lastTranscriptionTimeRef.current;
          if (genericResponseCountRef.current >= 5 && timeSinceLastValid > 30000) {
            const isInPerson = meetingType === 'in-person';
            console.warn(`[WHISPER] 5連続でGeneric Response (${Math.round(timeSinceLastValid/1000)}秒間) - 音声キャプチャの問題の可能性`);
            if (onError) {
              if (isInPerson) {
                onError('⚠️ マイク音声の問題の可能性があります。\n\n🔧 確認事項:\n• マイクが正しく接続されているか\n• マイクの音量設定\n• 実際に声を出して話してください');
              } else {
                onError('⚠️ システム音声の問題の可能性があります。\n\n🔧 確認事項:\n• BlackHole設定の確認\n• システム音声が実際に再生されているか\n• Multi-Output Device設定の確認');
              }
            }
            // エラー表示のみで録音は継続
          }
        } else {
          // 正常な応答が得られた場合はカウントをリセット
          if (transcribedText.length > 3) { // 短すぎるテキストは除外
            genericResponseCountRef.current = 0;
            lastTranscriptionTimeRef.current = Date.now(); // 正常な転写時刻を記録
          }
        }
        
        if (onTranscription) {
        const entry: TranscriptionEntry = {
          id: Date.now().toString(),
            text: transcribedText,
          timestamp: new Date(),
          speaker: '話者'
        };
          console.log('[WHISPER] Transcription result:', entry.text);
        onTranscription(entry);
        }
      } else {
        console.log('[WHISPER] No transcription text received or text is empty');
      }
    } catch (error) {
      console.error('[WHISPER] Transcription error:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Whisper APIでエラーが発生しました');
      }
    }
  }, [apiKey, onTranscription, onError, analyzeAudioBlob, meetingType]);

  const startRecording = useCallback(async () => {
    if (!isSupported || isRecording) return false;
    
    const isInPerson = meetingType === 'in-person';
    console.log(`[WHISPER] Starting recording for ${isInPerson ? 'in-person' : 'online'} meeting...`);

    try {
      let stream = null;
      
      if (isInPerson) {
        // 対面会議：実際のマイクデバイスを明示的に選択
        console.log('[WHISPER] Selecting real microphone for in-person meeting');
        
        // 利用可能なオーディオ入力デバイスを列挙
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        
        console.log('[WHISPER] Available audio input devices:', audioInputs.map(d => ({
          deviceId: d.deviceId,
          label: d.label,
          groupId: d.groupId
        })));
        
        // 仮想デバイス（BlackHole等）を除外して実際のマイクを選択
        const realMicrophones = audioInputs.filter(device => {
          const label = device.label.toLowerCase();
          return !label.includes('blackhole') && 
                 !label.includes('virtual') &&
                 !label.includes('loopback') &&
                 !label.includes('soundflower') &&
                 !label.includes('aggregate') &&
                 !label.includes('multi-output');
        });
        
        console.log('[WHISPER] Real microphone devices found:', realMicrophones.map(d => ({
          deviceId: d.deviceId,
          label: d.label
        })));
        
        if (realMicrophones.length === 0) {
          throw new Error('実際のマイクデバイスが見つかりません。\\n\\n🔧 解決方法:\\n1. 物理的なマイクが接続されているか確認\\n2. システム環境設定でマイクが認識されているか確認\\n3. BlackHole以外のマイクデバイスを使用してください');
        }
        
        // MacBook内蔵マイクを優先的に選択
        let selectedMic = realMicrophones.find(device => {
          const label = device.label.toLowerCase();
          return label.includes('built-in') || 
                 label.includes('internal') ||
                 label.includes('macbook') ||
                 label.includes('default');
        });
        
        // 内蔵マイクが見つからない場合は、外部デバイス（iPhone等）を除外
        if (!selectedMic) {
          const nonMobileDevices = realMicrophones.filter(device => {
            const label = device.label.toLowerCase();
            return !label.includes('iphone') && 
                   !label.includes('ipad') &&
                   !label.includes('airpods') &&
                   !label.includes('bluetooth');
          });
          
          if (nonMobileDevices.length > 0) {
            selectedMic = nonMobileDevices[0];
          } else {
            selectedMic = realMicrophones[0]; // フォールバック
          }
        }
        console.log('[WHISPER] Selected microphone:', selectedMic.label);
        
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: { exact: selectedMic.deviceId },
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1
          }
        });
        console.log('[WHISPER] ✅ Microphone capture successful with device:', selectedMic.label);
        
        // マイクの詳細情報をログ出力
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          const track = audioTracks[0];
          console.log('[WHISPER] 🎤 Microphone track details:', {
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState,
            settings: track.getSettings(),
            capabilities: track.getCapabilities()
          });
        }
      } else {
        // オンライン会議：BlackHoleを使用
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        
        const blackHoleDevice = audioInputs.find(device => {
          const label = device.label.toLowerCase();
          return label.includes('blackhole') || 
                 label.includes('virtual') ||
                 label.includes('loopback') ||
                 label.includes('soundflower');
        });
        
        if (!blackHoleDevice) {
          throw new Error('BlackHoleが見つかりません。\n\n🔧 解決方法:\n1. BlackHoleをインストール\n2. Audio MIDI設定でMulti-Output Deviceを作成\n3. BlackHole 2ch + イヤホンを選択\n4. システム環境設定で出力デバイスをMulti-Output Deviceに設定');
        }
        
        console.log('[WHISPER] Using BlackHole device:', blackHoleDevice.label);
        
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: { exact: blackHoleDevice.deviceId },
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 16000,
            channelCount: 1,
          }
        });
        console.log('[WHISPER] ✅ BlackHole audio capture successful');
      }
      
      streamRef.current = stream;
      setIsRecording(true);
      setIsPaused(false); // Reset pause state when starting
      
      // 音声トラック情報
      const audioTracks = stream.getAudioTracks();
      const trackLabel = audioTracks[0]?.label || '';
      
      console.log('[WHISPER] Audio stream obtained:', {
        trackLabel,
        trackCount: audioTracks.length
      });
      
      // 音声ソース情報をUIに送信
      if (onAudioSourceChange) {
        onAudioSourceChange(trackLabel, 0);
      }
      
      if (isInPerson) {
        console.log('[WHISPER] 🎤 Microphone detected! Perfect for in-person meeting');
      } else {
        console.log('[WHISPER] 🎉 BlackHole detected! Perfect for online meeting with system audio');
      }
      
      // 音声分析の設定
      setupAudioAnalysis(stream);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
        
      const recordAndSend = () => {
        if (!streamRef.current || isPausedRef.current) {
          if (!streamRef.current) {
            console.warn('[WHISPER] No stream available, stopping recording cycle');
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRecording(false);
          }
          return;
        }

        console.log('[WHISPER] Starting new recording cycle...');
        const recorder = new MediaRecorder(streamRef.current, { mimeType });
        currentRecorderRef.current = recorder; // 現在のrecorderを保存
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            chunks.push(event.data);
            console.log('[WHISPER] Audio chunk received:', event.data.size, 'bytes');
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: mimeType });
          console.log('[WHISPER] Recording stopped, total size:', audioBlob.size, 'bytes');
          
          if (audioBlob.size > 1024) {
            console.log('[WHISPER] Sending chunk to Whisper API...');
            await transcribeAudio(audioBlob);
          } else {
            console.warn('[WHISPER] Audio chunk too small, skipping transcription');
          }
          
          // Clear recorder reference when done
          if (currentRecorderRef.current === recorder) {
            currentRecorderRef.current = null;
          }
        };

        recorder.onerror = (event) => {
          console.error('[WHISPER] MediaRecorder error:', event);
          if (onError) {
            onError('録音中にエラーが発生しました: ' + event.error);
          }
        };

        recorder.start();
        console.log('[WHISPER] MediaRecorder started, state:', recorder.state);
        
        setTimeout(() => {
          if (recorder.state === 'recording' && !isPaused) {
            console.log('[WHISPER] Stopping recorder after 20 seconds');
            recorder.stop();
          }
        }, 20000); // 20秒間録音
      };

      // 最初のチャンクをすぐに録音・送信し、その後はインターバルで繰り返す
      recordAndSend();
      intervalRef.current = setInterval(recordAndSend, 20100); // 20.1秒ごとにサイクル

      console.log('[WHISPER] Recording setup completed successfully');
      return true;
    } catch (error) {
      console.error('[WHISPER] Start recording error:', error);
      if (onError) {
        if (error instanceof DOMException) {
          switch (error.name) {
            case 'NotAllowedError':
              onError('音声アクセスが拒否されました。ブラウザの設定で音声アクセスを許可してください。');
              break;
            case 'NotFoundError':
              onError('音声デバイスが見つかりません。システム音声キャプチャまたはマイクが利用可能か確認してください。');
              break;
            case 'NotSupportedError':
              onError('音声キャプチャがサポートされていません。');
              break;
            case 'AbortError':
              onError('音声キャプチャが中断されました。');
              break;
            default:
              onError(`音声キャプチャエラー: ${error.name} - ${error.message}`);
          }
        } else {
          onError(error instanceof Error ? error.message : '録音開始エラーが発生しました');
        }
      }
      setIsRecording(false);
      return false;
    }
  }, [isSupported, isRecording, isPaused, transcribeAudio, onError, setupAudioAnalysis, meetingType, onAudioSourceChange]);

  const pauseRecording = useCallback(() => {
    if (!isRecording) return;
    
    console.log('[WHISPER] Pausing recording...');
    setIsPaused(true);
    isPausedRef.current = true;
    
    // Stop current recorder if it's running
    if (currentRecorderRef.current && currentRecorderRef.current.state === 'recording') {
      console.log('[WHISPER] Stopping current recorder for pause');
      currentRecorderRef.current.stop();
    }
    
    // Clear the recording interval to prevent automatic resumption
    if (intervalRef.current) {
      console.log('[WHISPER] Clearing recording interval for pause');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    console.log('[WHISPER] Recording paused successfully');
  }, [isRecording]);

  const resumeRecording = useCallback(() => {
    if (!isRecording || !isPaused) return;
    
    console.log('[WHISPER] Resuming recording...');
    setIsPaused(false);
    isPausedRef.current = false;
    
    // Restart the recording interval using the original recordAndSend function
    if (!intervalRef.current && streamRef.current) {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
        
      const recordAndSend = () => {
        if (!streamRef.current) {
          console.warn('[WHISPER] No stream available, stopping recording cycle');
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRecording(false);
          return;
        }

        console.log('[WHISPER] Resume: Starting new recording cycle...');
        const recorder = new MediaRecorder(streamRef.current, { mimeType });
        currentRecorderRef.current = recorder;
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = async () => {
          if (chunks.length > 0) {
            const audioBlob = new Blob(chunks, { type: mimeType });
            await transcribeAudio(audioBlob);
          }
        };

        recorder.start();
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, 20000);
      };
      
      // Start recording immediately and set up interval
      setTimeout(() => {
        recordAndSend();
        intervalRef.current = setInterval(recordAndSend, 20100);
      }, 100); // Small delay to ensure isPaused state is updated
      
      console.log('[WHISPER] Recording interval restarted for resume');
    }
    
    console.log('[WHISPER] Recording resumed successfully');
  }, [isRecording, isPaused, transcribeAudio]);

  const stopRecording = useCallback(async () => {
    console.log('[WHISPER] Stopping recording...');
    setIsRecording(false); // これを最初に呼ぶことで、サイクルを停止
    setIsPaused(false); // Reset pause state
    isPausedRef.current = false;
    
    if (intervalRef.current) {
      console.log('[WHISPER] Clearing recording interval');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      }

    // Stop current recorder if running
    if (currentRecorderRef.current && currentRecorderRef.current.state === 'recording') {
      console.log('[WHISPER] Stopping current recorder');
      currentRecorderRef.current.stop();
    }
    currentRecorderRef.current = null;

      if (streamRef.current) {
      console.log('[WHISPER] Stopping audio tracks');
      streamRef.current.getTracks().forEach((track) => {
        console.log('[WHISPER] Stopping track:', track.kind, track.label);
        track.stop();
      });
        streamRef.current = null;
      }

    console.log('[WHISPER] Recording stopped successfully');
  }, []);

  return {
    isRecording,
    isPaused,
    isSupported,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  };
}