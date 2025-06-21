export interface IElectronAPI {
  startRecording: () => Promise<{ success: boolean }>;
  stopRecording: () => Promise<{ success: boolean }>;
  onAudioStream: (callback: (data: any) => void) => void;
  removeAudioStreamListener: () => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}