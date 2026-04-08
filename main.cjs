const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged; // Uygulamanın paketlenip paketlenmediğini kontrol eder

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, isDev ? 'public/favicon.svg' : 'dist/favicon.svg'), // İkon ekle
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173'); // Vite dev server
    mainWindow.webContents.openDevTools(); // Dev tools aç
  } else {
    // mainWindow.removeMenu(); // Hata ayıklamak için geçici olarak kapatabilirsin
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html')); // Çevrimdışı dosya
  }
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