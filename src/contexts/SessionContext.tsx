"use client";

import { createContext, useContext, useReducer, ReactNode } from 'react';

// セッション状態の型定義
export interface SessionState {
  isActive: boolean;
  isRecording: boolean;
  startTime: Date | null;
  endTime: Date | null;
  duration: number; // 経過時間（秒）
  transcriptions: TranscriptionEntry[];
  summaryData: SummaryData;
  meetingType: 'in-person' | 'remote' | 'hybrid';
}

export interface TranscriptionEntry {
  id: string;
  text: string;
  timestamp: Date;
  speaker?: string;
}

export interface SummaryData {
  keyPoints: string[];
  actionItems: ActionItem[];
  decisions: string[];
  wordCount: number;
  speakerCount: number;
}

export interface ActionItem {
  task: string;
  assignee: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

// アクションの型定義
export type SessionAction =
  | { type: 'START_SESSION'; payload: { meetingType: SessionState['meetingType'] } }
  | { type: 'END_SESSION' }
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'RESET_SESSION' }
  | { type: 'ADD_TRANSCRIPTION'; payload: TranscriptionEntry }
  | { type: 'UPDATE_SUMMARY'; payload: Partial<SummaryData> }
  | { type: 'UPDATE_DURATION'; payload: number }
  | { type: 'SET_MEETING_TYPE'; payload: SessionState['meetingType'] };

// 初期状態
const initialState: SessionState = {
  isActive: false,
  isRecording: false,
  startTime: null,
  endTime: null,
  duration: 0,
  transcriptions: [],
  summaryData: {
    keyPoints: [],
    actionItems: [],
    decisions: [],
    wordCount: 0,
    speakerCount: 0,
  },
  meetingType: 'in-person',
};

// リデューサー
function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        isActive: true,
        startTime: new Date(),
        endTime: null,
        duration: 0,
        meetingType: action.payload.meetingType,
      };
    
    case 'END_SESSION':
      return {
        ...state,
        isActive: false,
        isRecording: false,
        endTime: new Date(),
      };
    
    case 'START_RECORDING':
      return {
        ...state,
        isRecording: true,
        isActive: true,
        startTime: state.startTime || new Date(),
      };
    
    case 'STOP_RECORDING':
      return {
        ...state,
        isRecording: false,
      };
    
    case 'RESET_SESSION':
      return {
        ...initialState,
        meetingType: state.meetingType,
      };
    
    case 'ADD_TRANSCRIPTION':
      const newTranscriptions = [...state.transcriptions, action.payload];
      const wordCount = newTranscriptions.reduce((count, t) => count + t.text.split(' ').length, 0);
      const speakerCount = new Set(newTranscriptions.map(t => t.speaker).filter(Boolean)).size;
      
      return {
        ...state,
        transcriptions: newTranscriptions,
        summaryData: {
          ...state.summaryData,
          wordCount,
          speakerCount,
        },
      };
    
    case 'UPDATE_SUMMARY':
      return {
        ...state,
        summaryData: {
          ...state.summaryData,
          ...action.payload,
        },
      };
    
    case 'UPDATE_DURATION':
      return {
        ...state,
        duration: action.payload,
      };
    
    case 'SET_MEETING_TYPE':
      return {
        ...state,
        meetingType: action.payload,
      };
    
    default:
      return state;
  }
}

// コンテキストの作成
const SessionContext = createContext<{
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
} | null>(null);

// プロバイダーコンポーネント
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  
  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

// カスタムフック
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

// セッション管理のヘルパーフック
export function useSessionActions() {
  const { dispatch } = useSession();
  
  const startSession = (meetingType: SessionState['meetingType']) => {
    dispatch({ type: 'START_SESSION', payload: { meetingType } });
  };
  
  const endSession = () => {
    dispatch({ type: 'END_SESSION' });
  };
  
  const startRecording = () => {
    dispatch({ type: 'START_RECORDING' });
  };
  
  const stopRecording = () => {
    dispatch({ type: 'STOP_RECORDING' });
  };
  
  const resetSession = () => {
    dispatch({ type: 'RESET_SESSION' });
  };
  
  const addTranscription = (transcription: TranscriptionEntry) => {
    dispatch({ type: 'ADD_TRANSCRIPTION', payload: transcription });
  };
  
  const updateSummary = (summary: Partial<SummaryData>) => {
    dispatch({ type: 'UPDATE_SUMMARY', payload: summary });
  };
  
  const updateDuration = (duration: number) => {
    dispatch({ type: 'UPDATE_DURATION', payload: duration });
  };
  
  const setMeetingType = (meetingType: SessionState['meetingType']) => {
    dispatch({ type: 'SET_MEETING_TYPE', payload: meetingType });
  };
  
  return {
    startSession,
    endSession,
    startRecording,
    stopRecording,
    resetSession,
    addTranscription,
    updateSummary,
    updateDuration,
    setMeetingType,
  };
}