import path from 'node:path';
import { BrowserWindow, app, ipcMain, dialog, Menu } from 'electron';

let mainWindow: BrowserWindow | null = null;
// pattern2
async function handleFileOpen() {
  if (null == mainWindow) {
    return null
  }
  const { canceled, filePaths} = await dialog.showOpenDialog(mainWindow)
  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
}


function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // pattern1
  ipcMain.on('set-title', (event, title) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents)
    win?.setTitle(title)
  })

  // pattern3
  const menu = Menu.buildFromTemplate([
    {label: app.name,
    submenu:[
      {label:'increment',click:() => mainWindow?.webContents.send('update-counter',1)},
      {label:'decrement',click:() => mainWindow?.webContents.send('update-counter',-1)}
    ]}
  ])
  Menu.setApplicationMenu(menu)

  mainWindow.loadFile('dist/index.html');
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  // pattern2
  ipcMain.handle('dialog:openFile', handleFileOpen);

  // pattern3
  ipcMain.on('counter-value', (_event: any, num:number) => {
    console.log(num);
  })
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})
