const { contextBridge, ipcRenderer } = require('electron');

try {
  // セキュアなIPC通信のためのAPI公開
  contextBridge.exposeInMainWorld('electronAPI', {
    // 録音制御
    startRecording: () => ipcRenderer.invoke('start-recording'),
    stopRecording: () => ipcRenderer.invoke('stop-recording'),
    
    // 音声データのストリーミング受信
    onAudioStream: (callback) => {
      ipcRenderer.on('audio-stream', (event, data) => callback(data));
    },
    
    // イベントリスナーの削除
    removeAudioStreamListener: () => {
      ipcRenderer.removeAllListeners('audio-stream');
    }
  });
  
  console.log('Preload script loaded successfully');
} catch (error) {
  console.error('Preload script error:', error);
}