export interface Material {
  id: string;
  type: 'url' | 'file';
  name: string;
  originalName?: string;
  content: string; // 抽出されたテキスト
  filePath?: string; // ローカルファイルパス
  url?: string;
  fileSize?: number;
  mimeType?: string;
  extractedAt: Date;
  status: 'processing' | 'completed' | 'error';
  error?: string;
}

export interface MeetingContext {
  id: string;
  title: string;
  backgroundInfo: string;
  agenda: string[];
  participants: string[];
  materials: Material[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingContextState {
  currentContext: MeetingContext | null;
  isLoading: boolean;
  error: string | null;
}