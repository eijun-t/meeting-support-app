/**
 * 会議関連の共通型定義
 */

export interface TranscriptionEntry {
  id: string;
  text: string;
  timestamp: Date;
  speaker?: string;
}

export interface SummaryData {
  minutesText: string;
  lastUpdated: Date | null;
}

export interface Suggestion {
  id: number;
  text: string;
  type: "提案" | "質問";
  confidence: number;
  context?: string;
  reasoning?: string;
}

export interface Decision {
  id: string;
  content: string;
  decided_by?: string | null;
  timestamp: string;
}

export interface ActionItem {
  id: string;
  content: string;
  assignee?: string | null;
  due_date?: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  timestamp: string;
}

export interface ExtractionResult {
  decisions: Decision[];
  action_items: ActionItem[];
}

export type MeetingType = "in-person" | "online";

export type MeetingStatus = 'active' | 'paused' | 'completed';