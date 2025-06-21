const { app, BrowserWindow, Menu, ipcMain, desktopCapturer, systemPreferences } = require('electron');
const { join } = require('path');
const isDev = process.env.NODE_ENV === 'development';

// .envファイルを読み込み
require('dotenv').config();

// セキュリティ警告を無効化（開発環境のみ）
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// ネットワークエラー対策
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');
app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('allow-running-insecure-content');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: join(__dirname, 'preload.js'),
      webSecurity: false, // Web Speech API用
      allowRunningInsecureContent: true,
      experimentalFeatures: true
    },
    titleBarStyle: 'default',
    show: false, // Don't show until ready
    icon: join(__dirname, 'assets/icon.png') // Add app icon if available
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../out/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // セキュリティ警告を無効化（開発環境のみ）
  if (isDev) {
    mainWindow.webContents.session.webSecurity = false;
    
    // Web Speech API用のセッション設定
    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowedPermissions = ['media', 'microphone', 'audioCapture'];
      if (allowedPermissions.includes(permission)) {
        callback(true);
      } else {
        callback(false);
      }
    });
    
    // ユーザーエージェントの設定（Web Speech API互換性向上）
    mainWindow.webContents.setUserAgent(mainWindow.webContents.getUserAgent() + ' SpeechRecognition/1.0');
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // プロセスクラッシュ対策
  mainWindow.webContents.on('crashed', (event) => {
    console.error('Renderer process crashed:', event);
    // 自動的に再起動
    setTimeout(() => {
      if (mainWindow && mainWindow.isDestroyed()) {
        createWindow();
      }
    }, 1000);
  });

  mainWindow.on('unresponsive', () => {
    console.warn('Window became unresponsive');
  });

  mainWindow.on('responsive', () => {
    console.log('Window became responsive again');
  });
}

// App event listeners
app.whenReady().then(() => {
  createWindow();

  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Set up menu (optional)
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      }
    ]));
  }
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});

// IPC handlers for future audio functionality
ipcMain.handle('get-audio-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({ 
      types: ['audio'] 
    });
    return sources;
  } catch (error) {
    console.error('Error getting audio sources:', error);
    return [];
  }
});

ipcMain.handle('request-microphone-permission', async () => {
  try {
    if (process.platform === 'darwin') {
      const status = systemPreferences.getMediaAccessStatus('microphone');
      if (status !== 'granted') {
        const granted = await systemPreferences.askForMediaAccess('microphone');
        return granted;
      }
      return true;
    }
    return true; // Other platforms
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    return false;
  }
});

ipcMain.handle('request-screen-capture-permission', async () => {
  try {
    if (process.platform === 'darwin') {
      const status = systemPreferences.getMediaAccessStatus('screen');
      return status === 'granted';
    }
    return true; // Other platforms
  } catch (error) {
    console.error('Error checking screen capture permission:', error);
    return false;
  }
});

// Environment variables handler
ipcMain.handle('get-env-var', async (event, varName) => {
  try {
    // セキュリティのため、許可された環境変数のみ返す
    const allowedVars = ['OPENAI_API_KEY'];
    if (allowedVars.includes(varName)) {
      return process.env[varName] || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting environment variable:', error);
    return null;
  }
});

// Audio recording functionality
ipcMain.handle('start-recording', async () => {
  console.log('Recording started');
  return { success: true };
});

ipcMain.handle('stop-recording', async () => {
  console.log('Recording stopped');
  return { success: true };
});

// Audio data streaming
ipcMain.on('audio-data', (event, audioBuffer) => {
  // Forward audio data to renderer process
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('audio-stream', audioBuffer);
  }
});

// グローバルエラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // アプリが完全にクラッシュするのを防ぐ
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('global-error', error.message);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // アプリが完全にクラッシュするのを防ぐ
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('global-error', 'Unhandled promise rejection');
  }
});