const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Audio sources for system audio capture
  getAudioSources: () => ipcRenderer.invoke('get-audio-sources'),
  
  // Permission requests
  requestMicrophonePermission: () => ipcRenderer.invoke('request-microphone-permission'),
  requestScreenCapturePermission: () => ipcRenderer.invoke('request-screen-capture-permission'),
  
  // Platform info
  platform: process.platform,
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Window controls (if needed)
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
});

// Type definitions for TypeScript (will be useful later)
declare global {
  interface Window {
    electronAPI: {
      getAudioSources: () => Promise<any[]>;
      requestMicrophonePermission: () => Promise<boolean>;
      requestScreenCapturePermission: () => Promise<boolean>;
      platform: string;
      getAppVersion: () => Promise<string>;
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
    };
  }
}