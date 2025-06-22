const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Audio sources for system audio capture
  getAudioSources: () => ipcRenderer.invoke('get-audio-sources'),
  
  // Audio output devices
  getAudioOutputDevices: () => ipcRenderer.invoke('get-audio-output-devices'),
  setAudioOutputDevice: (deviceId) => ipcRenderer.invoke('set-audio-output-device', deviceId),
  
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
  
  // Audio recording functionality
  startRecording: () => ipcRenderer.invoke('start-recording'),
  stopRecording: () => ipcRenderer.invoke('stop-recording'),
  onAudioStream: (callback) => {
    ipcRenderer.on('audio-stream', (_, data) => callback(data));
  },
  removeAudioStreamListener: () => {
    ipcRenderer.removeAllListeners('audio-stream');
  },
  
  // Global error handling
  onGlobalError: (callback) => {
    ipcRenderer.on('global-error', (_, errorMessage) => callback(errorMessage));
  },
  
  // Environment variables
  getEnvVar: (varName) => ipcRenderer.invoke('get-env-var', varName)
});