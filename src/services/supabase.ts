import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ibsphicrdtezjtjpeepr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlic3BoaWNyZHRlemp0anBlZXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NTczNTUsImV4cCI6MjA2NjMzMzM1NX0.KHEX_uireip4SLMGYuh-Uam4YduA43ELSjskFEf7-G4';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Decision {
  id: string;
  content: string;
  decided_by?: string;
  timestamp: string;
}

export interface ActionItem {
  id: string;
  content: string;
  assignee?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  timestamp: string;
}

export interface SessionData {
  id?: string;
  title: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  status: 'draft' | 'completed' | 'archived';
  duration: number;
  participant_count: number;
  transcription_count: number;
  has_summary: boolean;
  has_materials: boolean;
  transcriptions: any[];
  summary_data: any;
  meeting_context: any;
}

export interface SessionListItem {
  id: string;
  title: string;
  created_at: string;
  completed_at?: string;
  status: 'draft' | 'completed' | 'archived';
  duration: number;
  participant_count: number;
  transcription_count: number;
  has_summary: boolean;
  has_materials: boolean;
}

// Session service class
export class SessionService {
  
  // Save a completed session
  static async saveSession(sessionData: Omit<SessionData, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          ...sessionData,
          completed_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error saving session:', error);
        return null;
      }

      console.log('Session saved successfully:', data.id);
      return data.id;
    } catch (error) {
      console.error('Failed to save session:', error);
      return null;
    }
  }

  // Get list of sessions for history view
  static async getSessionList(): Promise<SessionListItem[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id, title, created_at, completed_at, status, duration,
          participant_count, transcription_count, has_summary, has_materials
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching session list:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch session list:', error);
      return [];
    }
  }

  // Get full session data by ID
  static async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch session:', error);
      return null;
    }
  }

  // Delete a session
  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Error deleting session:', error);
        return false;
      }

      console.log('Session deleted successfully:', sessionId);
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  // Update session status
  static async updateSessionStatus(sessionId: string, status: 'draft' | 'completed' | 'archived'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating session status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update session status:', error);
      return false;
    }
  }
}