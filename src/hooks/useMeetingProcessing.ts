/**
 * 会議終了時の処理（抽出・保存）を担当するカスタムフック
 */

import { useState, useCallback, useRef } from 'react';
import { TranscriptionEntry, SummaryData, Decision, ActionItem } from '../types/meeting';
import { MeetingContext } from '../types/meetingContext';
import { ExtractionService } from '../services/extractionService';
import { SessionService } from '../services/supabase';

interface UseMeetingProcessingProps {
  transcriptions: TranscriptionEntry[];
  summaryData: SummaryData;
  meetingContext: MeetingContext | null;
  apiKey: string;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export function useMeetingProcessing({
  transcriptions,
  summaryData,
  meetingContext,
  apiKey,
  onError,
  onSuccess
}: UseMeetingProcessingProps) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isMountedRef = useRef(true);

  const clearResults = useCallback(() => {
    setDecisions([]);
    setActionItems([]);
  }, []);

  const processAndSaveMeeting = useCallback(async () => {
    if (!isMountedRef.current || transcriptions.length === 0) {
      console.warn('[PROCESSING] No transcriptions to process or component unmounted');
      return;
    }

    console.log('[PROCESSING] Starting post-meeting processing...');
    console.log('[PROCESSING] Transcriptions count:', transcriptions.length);
    console.log('[PROCESSING] API Key available:', !!apiKey);
    console.log('[PROCESSING] Meeting context:', !!meetingContext);

    if (!isMountedRef.current) return;

    // Batch loading state updates
    setIsExtracting(true);
    setIsSaving(true);

    // Extract decisions and action items
    let extractedDecisions: Decision[] = [];
    let extractedActionItems: ActionItem[] = [];

    try {
      console.log('[PROCESSING] Calling ExtractionService...');
      const result = await ExtractionService.extractDecisionsAndActions(
        transcriptions,
        meetingContext,
        apiKey
      );

      if (!isMountedRef.current) return;

      console.log('[PROCESSING] ExtractionService completed:', result);

      extractedDecisions = result.decisions;
      extractedActionItems = result.action_items;

      // Batch state updates
      setDecisions(extractedDecisions);
      setActionItems(extractedActionItems);
      setIsExtracting(false);

      console.log('[PROCESSING] Extraction completed');
      console.log('[PROCESSING] Decisions count:', extractedDecisions.length);
      console.log('[PROCESSING] Action items count:', extractedActionItems.length);

    } catch (error) {
      console.error('[PROCESSING] Extraction failed:', error);
      if (isMountedRef.current) {
        onError('決定事項・アクションアイテムの抽出中にエラーが発生しました');
        setIsExtracting(false);
      }
    }

    // Save session (will include extracted data)
    try {
      const sessionData = {
        title: meetingContext?.title || `会議 ${new Date().toLocaleDateString()}`,
        status: 'completed' as const,
        duration: Math.floor((Date.now() - (transcriptions[0]?.timestamp?.getTime() || Date.now())) / 1000),
        participant_count: meetingContext?.participants?.filter(p => p.trim()).length || 1,
        transcription_count: transcriptions.length,
        has_summary: !!summaryData.minutesText,
        has_materials: (meetingContext?.materials?.length ?? 0) > 0,
        transcriptions: transcriptions,
        summary_data: summaryData,
        meeting_context: meetingContext,
        decisions: extractedDecisions,
        action_items: extractedActionItems
      };

      const sessionId = await SessionService.saveSession(sessionData);

      if (!isMountedRef.current) return;

      if (sessionId) {
        console.log('[PROCESSING] Session saved successfully with extracted data:', sessionId);

        // Show success message
        onSuccess('会議が正常に保存されました');

        // Note: Data is preserved for user review. Will be cleared when starting next recording.

      } else {
        if (isMountedRef.current) {
          onError('会議の保存中にエラーが発生しました');
        }
      }
    } catch (error) {
      console.error('[PROCESSING] Failed to save session:', error);
      if (isMountedRef.current) {
        onError('会議の保存中にエラーが発生しました');
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [transcriptions, summaryData, meetingContext, apiKey, onError, onSuccess]);

  return {
    decisions,
    actionItems,
    isExtracting,
    isSaving,
    clearResults,
    processAndSaveMeeting
  };
}