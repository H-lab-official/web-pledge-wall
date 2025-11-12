const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'icon.ico'),
    title: 'Data Fetcher'
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for file operations
ipcMain.handle('save-data', async (event, data, filename) => {
  try {
    const filePath = path.join(app.getPath('userData'), filename);
    
    // Read existing data
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      existingData = content.split('\n').filter(line => line.trim());
    }
    
    // Append new data
    const newLine = JSON.stringify(data);
    existingData.push(newLine);
    
    // Write back
    fs.writeFileSync(filePath, existingData.join('\n') + '\n', 'utf8');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-data', async (event, filename) => {
  try {
    const filePath = path.join(app.getPath('userData'), filename);
    
    if (!fs.existsSync(filePath)) {
      return { success: true, data: [] };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    const data = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(item => item !== null);
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
});

ipcMain.handle('export-data', async (event, filename) => {
  try {
    const sourcePath = path.join(app.getPath('userData'), filename);
    
    if (!fs.existsSync(sourcePath)) {
      return { success: false, error: 'ไม่พบไฟล์' };
    }
    
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'บันทึกข้อมูล',
      defaultPath: filename,
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (filePath) {
      fs.copyFileSync(sourcePath, filePath);
      return { success: true, path: filePath };
    }
    
    return { success: false, error: 'ยกเลิกการบันทึก' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-data-path', async () => {
  return app.getPath('userData');
});

