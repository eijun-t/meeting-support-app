const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// セキュリティ設定
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './out/index.html')}`;
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Electronのクラッシュハンドリング
  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer process crashed');
  });

  mainWindow.on('unresponsive', () => {
    console.error('Window became unresponsive');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC通信の基本設定
ipcMain.handle('start-recording', async () => {
  console.log('Recording started');
  return { success: true };
});

ipcMain.handle('stop-recording', async () => {
  console.log('Recording stopped');
  return { success: true };
});