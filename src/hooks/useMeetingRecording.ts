/**
 * 会議録音の制御ロジックを担当するカスタムフック
 */

import { useState, useCallback, useRef } from 'react';
import { useWhisperTranscription } from '../components/WhisperTranscription';
import { TranscriptionEntry, MeetingType } from '../types/meeting';

interface UseMeetingRecordingProps {
  onTranscription: (entry: TranscriptionEntry) => void;
  onError: (error: string) => void;
  onAudioSourceChange: (source: string, level: number) => void;
  apiKey: string;
  meetingType: MeetingType;
}

export function useMeetingRecording({
  onTranscription,
  onError,
  onAudioSourceChange,
  apiKey,
  meetingType
}: UseMeetingRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const isMountedRef = useRef(true);

  const {
    isPaused,
    startRecording: startWhisperRecording,
    stopRecording: stopWhisperRecording,
    pauseRecording,
    resumeRecording
  } = useWhisperTranscription({
    onTranscription,
    onError,
    onAudioSourceChange,
    apiKey,
    meetingType
  });

  const startRecording = useCallback(async () => {
    if (!isMountedRef.current) return false;

    console.log('[RECORDING] Starting new recording session');
    
    const success = await startWhisperRecording();
    if (success) {
      setIsRecording(true);
      console.log('[RECORDING] Recording started successfully');
    }
    return success;
  }, [startWhisperRecording]);

  const stopRecording = useCallback(async () => {
    if (!isMountedRef.current) return;

    console.log('[RECORDING] Stopping recording session');
    await stopWhisperRecording();
    setIsRecording(false);
    console.log('[RECORDING] Recording stopped');
  }, [stopWhisperRecording]);

  const handlePauseRecording = useCallback(() => {
    if (!isRecording || !isMountedRef.current) return;
    
    console.log('[RECORDING] Pausing recording');
    pauseRecording();
  }, [isRecording, pauseRecording]);

  const handleResumeRecording = useCallback(() => {
    if (!isRecording || !isPaused || !isMountedRef.current) return;
    
    console.log('[RECORDING] Resuming recording');
    resumeRecording();
  }, [isRecording, isPaused, resumeRecording]);

  const handlePause = useCallback(() => {
    if (isPaused) {
      handleResumeRecording();
    } else {
      handlePauseRecording();
    }
  }, [isPaused, handlePauseRecording, handleResumeRecording]);

  return {
    isRecording,
    isPaused,
    startRecording,
    stopRecording,
    handlePause
  };
}