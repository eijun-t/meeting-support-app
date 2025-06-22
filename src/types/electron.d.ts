export interface IElectronAPI {
  startRecording: () => Promise<{ success: boolean }>;
  stopRecording: () => Promise<{ success: boolean }>;
  onAudioStream: (callback: (data: unknown) => void) => void;
  removeAudioStreamListener: () => void;
  onGlobalError: (callback: (errorMessage: string) => void) => void;
  getEnvVar: (varName: string) => Promise<string | null>;
  getAudioSources?: () => Promise<unknown[]>;
  getAudioOutputDevices?: () => Promise<{ success: boolean; message?: string; error?: string }>;
  setAudioOutputDevice?: (deviceId: string) => Promise<{ success: boolean; deviceId?: string; error?: string }>;
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

export {};