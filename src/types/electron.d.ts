export interface IElectronAPI {
  startRecording: () => Promise<{ success: boolean }>;
  stopRecording: () => Promise<{ success: boolean }>;
  onAudioStream: (callback: (data: any) => void) => void;
  removeAudioStreamListener: () => void;
  onGlobalError: (callback: (errorMessage: string) => void) => void;
  getEnvVar: (varName: string) => Promise<string | null>;
  getAudioSources?: () => Promise<any[]>;
  requestMicrophonePermission?: () => Promise<boolean>;
  requestScreenCapturePermission?: () => Promise<boolean>;
  platform?: string;
  getAppVersion?: () => Promise<string>;
  minimizeWindow?: () => Promise<void>;
  maximizeWindow?: () => Promise<void>;
  closeWindow?: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}